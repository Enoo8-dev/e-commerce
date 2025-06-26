// Import the database connection pool we configured
const dbPool = require('../config/database');

// Create the DAO (Data Access Object) for products
const productDAO = {

    // helper func
    _getBaseProductQuery() {
        return `
        SELECT
            p.id AS productId, pt.name AS productName, pt.description AS productDescription,
            pv.price AS originalPrice,
            CASE
            WHEN pv.sale_price IS NOT NULL AND (pv.sale_start_date IS NULL OR pv.sale_start_date <= NOW()) AND (pv.sale_end_date IS NULL OR pv.sale_end_date >= NOW())
            THEN pv.sale_price
            ELSE NULL
            END AS currentSalePrice,
            pv.sku AS variantSku, bt.name AS brandName, pi.image_url AS imageUrl
        FROM Products AS p
        JOIN Product_Translations AS pt ON p.id = pt.product_id
        JOIN Brands AS b ON p.brand_id = b.id
        JOIN Brand_Translations AS bt ON b.id = bt.brand_id
        -- ** MODIFICA CHIAVE: La logica per selezionare la variante corretta è qui **
        JOIN Product_Variants AS pv ON p.id = pv.product_id AND pv.id = (
            -- Subquery per trovare la prima variante attiva, dando priorità alla default
            SELECT id FROM Product_Variants
            WHERE product_id = p.id AND is_active = TRUE
            ORDER BY is_default DESC, id ASC
            LIMIT 1
        )
        LEFT JOIN Product_Images AS pi ON pv.id = pi.variant_id AND pi.is_primary = TRUE
        WHERE p.is_active = TRUE AND pt.language_code = ? AND bt.language_code = ?
        `;
    },

    /**
     * Fetches all products with their basic details, including translations and images.
     * This function is used to retrieve a list of products for display purposes.
     * @param {string} languageCode - The language code for translations (default is 'en-US').
     * @returns {Promise<Array>} A promise that resolves to an array of product objects.
     */
    async getAllProducts(languageCode = 'en-US') {
        const sql = `${this._getBaseProductQuery()} GROUP BY p.id`;
        try {
            const [rows] = await dbPool.query(sql, [languageCode, languageCode]);
            return rows;
        } catch (error) {
            console.error('Error in getAllProducts DAO:', error);
            throw error;
        }
    },

    /**
     * Fetches featured products that are marked as featured in the database.
     * @param {string} languageCode - The language code for translations (default is 'en-US').
     * @param {number} limit - The maximum number of featured products to return (default is 8).
     * @returns {Promise<Array>} A promise that resolves to an array of featured product objects.
     */
    async getFeaturedProducts(languageCode = 'en-US', limit = 8) {
        const sql = `${this._getBaseProductQuery()} AND p.is_featured = TRUE GROUP BY p.id LIMIT ?`;
        try {
            const [rows] = await dbPool.query(sql, [languageCode, languageCode, limit]);
            return rows;
        } catch (error) {
            console.error('Error in getFeaturedProducts DAO:', error);
            throw error;
        }
    },

    /**
     * Fetches the latest offers (products with a sale price) based on their sale start date.
     * @param {string} languageCode - The language code for translations (default is 'en-US').
     * @param {number} limit - The maximum number of offers to return (default is 4).
     * @returns {Promise<Array>} A promise that resolves to an array of product objects with sale prices.
     */
    async getLatestOffers(languageCode = 'en-US', limit = 4) {
        const sql = `${this._getBaseProductQuery()} AND pv.sale_price IS NOT NULL GROUP BY p.id ORDER BY pv.sale_start_date DESC LIMIT ?`;
        try {
            const [rows] = await dbPool.query(sql, [languageCode, languageCode, limit]);
            return rows;
        } catch (error) {
            console.error('Error in getLatestOffers DAO:', error);
            throw error;
        }
    },

    /**
     * Fetches the newest products based on their creation date.
     * @param {string} languageCode - The language code for translations (default is 'en-US').
     * @param {number} limit - The maximum number of products to return (default is 8).
     * @returns {Promise<Array>} A promise that resolves to an array of product objects.
     */
    async getNewestProducts(languageCode = 'en-US', limit = 8) {
        const sql = `${this._getBaseProductQuery()} GROUP BY p.id ORDER BY p.created_at DESC LIMIT ?`;
        try {
            const [rows] = await dbPool.query(sql, [languageCode, languageCode, limit]);
            return rows;
        } catch (error) {
            console.error('Error in getNewestProducts DAO:', error);
            throw error;
        }
    },

    /**
     * Fetches detailed information about a specific product by its ID.
     * This includes product details, variants, images, and attributes.
     * @param {number} productId - The ID of the product to fetch.
     * @param {string} languageCode - The language code for translations (default is 'en-US').
     * @returns {Promise<Object|null>} A promise that resolves to the product object or null if not found.
     */
    async getProductById(productId, languageCode) {
        const productSql = `
            SELECT
                p.id, 
                pt.name, 
                pt.description, 
                pt.features, 
                bt.name AS brandName
            FROM Products AS p
            JOIN Product_Translations AS pt ON p.id = pt.product_id
            JOIN Brands AS b ON p.brand_id = b.id
            JOIN Brand_Translations AS bt ON b.id = bt.brand_id
            WHERE 
                p.id = ? AND 
                pt.language_code = ? AND 
                bt.language_code = ?;
        `;
        const [productRows] = await dbPool.query(productSql, [productId, languageCode, languageCode]);
        if (productRows.length === 0) return null;
        
        const product = productRows[0];

        // *** CORREZIONE QUI: Aggiunto filtro per le varianti attive ***
        const variantsSql = `
        SELECT id, sku, price AS originalPrice, 
        CASE
            WHEN sale_price IS NOT NULL AND (sale_start_date IS NULL OR sale_start_date <= NOW()) AND (sale_end_date IS NULL OR sale_end_date >= NOW())
            THEN sale_price
            ELSE NULL
        END AS currentSalePrice,
        stock_quantity 
        FROM Product_Variants 
        WHERE product_id = ? AND is_active = TRUE`; // <-- AGGIUNTO 'is_active = TRUE'
        
        const [variants] = await dbPool.query(variantsSql, [productId]);
        
        if (variants.length === 0) {
        product.variants = [];
        // Se non ci sono varianti attive, potremmo voler considerare il prodotto come non disponibile
        // Per ora lo restituiamo vuoto, ma si potrebbe anche restituire null.
        return product; 
        }

        const variantIds = variants.map(v => v.id);
        const imagesSql = 'SELECT variant_id, image_url, alt_text, is_primary FROM Product_Images WHERE variant_id IN (?)';
        const [images] = await dbPool.query(imagesSql, [variantIds]);
        
        const attributesSql = `
            SELECT
                va.variant_id, 
                a.id AS attribute_id, 
                at.name AS attribute_name, 
                av.id AS value_id, 
                avt.value AS attribute_value, 
                av.hex_code
            FROM Variant_Attributes AS va
            JOIN Attribute_Values AS av ON va.attribute_value_id = av.id
            JOIN Attribute_Value_Translations AS avt ON av.id = avt.attribute_value_id
            JOIN Attributes AS a ON av.attribute_id = a.id
            JOIN Attribute_Translations AS at ON a.id = at.attribute_id
            WHERE va.variant_id IN (?) AND 
                avt.language_code = ? 
                AND at.language_code = ?;
        `;
        const [attributes] = await dbPool.query(attributesSql, [variantIds, languageCode, languageCode]);

        variants.forEach(variant => {
        variant.images = images.filter(img => img.variant_id === variant.id);
        variant.attributes = attributes.filter(attr => attr.variant_id === variant.id);
        });

        product.variants = variants;
        return product;
    },

    /**
     * Fetches a filterable, sortable, and searchable list of ALL product variants.
     * @param {object} options - Object containing filter, sort, and search options.
     * @returns {Promise<Array>} A promise that resolves to an array of product variants.
     */
    async getAdminProductList({ lang = 'en-US', search = '', sortBy = 'productId', sortOrder = 'DESC', status = '' }) {
        let sql = `
            SELECT
                p.id AS productId,
                pt.name AS productName,
                pv.id AS variantId,
                pv.sku AS variantSku,
                pv.price AS originalPrice,
                pv.stock_quantity AS stock,
                pv.is_active AS isActive,
                bt.name as brandName,
                (SELECT image_url FROM Product_Images WHERE variant_id = pv.id AND is_primary = TRUE LIMIT 1) AS imageUrl
            FROM Product_Variants AS pv
            JOIN Products AS p ON pv.product_id = p.id
            JOIN Product_Translations AS pt ON p.id = pt.product_id
            JOIN Brands AS b ON p.brand_id = b.id
            JOIN Brand_Translations AS bt ON b.id = bt.brand_id
        `;

        const params = [lang, lang];
        let whereClauses = ['pt.language_code = ?', 'bt.language_code = ?'];

        if (search) {
            whereClauses.push('(pt.name LIKE ? OR pv.sku LIKE ? OR bt.name LIKE ?)');
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        if (status === 'active') {
            whereClauses.push('pv.is_active = TRUE');
        } else if (status === 'inactive') {
            whereClauses.push('pv.is_active = FALSE');
        }

        if (whereClauses.length > 0) {
            sql += ` WHERE ${whereClauses.join(' AND ')}`;
        }

        // CORREZIONE: Aggiunti i nuovi campi all'array di validazione
        const validSortBy = {
            productId: 'p.id',
            productName: 'pt.name',
            brandName: 'bt.name',
            variantSku: 'pv.sku',
            originalPrice: 'pv.price',
            stock: 'pv.stock_quantity'
        };
        
        const sortColumn = validSortBy[sortBy] || 'p.id'; // Default a p.id se il campo non è valido
        const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        sql += ` ORDER BY ${sortColumn} ${orderDirection}`;

        try {
            const [rows] = await dbPool.query(sql, params);
            return rows;
        } catch (error) {
            console.error('Error in getAdminProductList DAO:', error);
            throw error;
        }
    },
    /**
     * Updates the active status of a single product variant.
     * @param {number} variantId - The ID of the variant to update.
     * @param {boolean} isActive - The new active status.
     * @returns {Promise<boolean>}
     */
    async updateVariantStatus(variantId, isActive) {
        const sql = 'UPDATE Product_Variants SET is_active = ? WHERE id = ?';
        try {
            const [result] = await dbPool.query(sql, [isActive, variantId]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error in updateVariantStatus DAO:', error);
            throw error;
        }
    }

};

// Export the DAO object so it can be used in other files (in our case, in the Service)
module.exports = productDAO;
// Import the database connection pool we configured
const dbPool = require('../config/database');

// Create the DAO (Data Access Object) for products
const productDAO = {

    /**
     * Fetches a list of active products with the essential information for display.
     * It joins data from multiple tables to provide a complete result.
     * @param {string} languageCode - The language code (e.g., 'en-US') for translations.
     * @returns {Promise<Array>} A promise that resolves to an array of product objects.
     */
    async getAllProducts(languageCode = 'en-US') {
        // Define the SQL query. Using backticks (`) allows for multi-line strings, improving readability.
        // We select only the fields needed for the product list.
        const sql = `
            SELECT
                p.id AS productId,
                pt.name AS productName,
                pt.description AS productDescription,
                pv.price AS originalPrice, -- Renamed for clarity
                -- Select the sale price only if it's currently active
                CASE
                    WHEN pv.sale_price IS NOT NULL AND (pv.sale_start_date IS NULL OR pv.sale_start_date <= NOW()) AND (pv.sale_end_date IS NULL OR pv.sale_end_date >= NOW())
                    THEN pv.sale_price
                    ELSE NULL
                END AS currentSalePrice,
                pv.sku AS variantSku,
                bt.name AS brandName,
                pi.image_url AS imageUrl -- Get the primary image URL
            FROM Products AS p
            JOIN Product_Translations AS pt ON p.id = pt.product_id
            JOIN Brands AS b ON p.brand_id = b.id
            JOIN Brand_Translations AS bt ON b.id = bt.brand_id
            JOIN Product_Variants AS pv ON p.id = pv.product_id
            -- LEFT JOIN is important: we still want products even if they have no image
            LEFT JOIN Product_Images AS pi ON pv.id = pi.variant_id AND pi.is_primary = TRUE
            WHERE
                p.is_active = TRUE
                AND pv.is_default = TRUE
                AND pt.language_code = ?
                AND bt.language_code = ?;
        `;

        try {
            // Execute the query using the connection pool.
            // We use placeholders (?) to pass parameters securely, preventing SQL Injection.
            const [rows] = await dbPool.query(sql, [languageCode, languageCode]);
            return rows;
        } catch (error) {
            // In case of an error, log it to the server console
            console.error('Error in getAllProducts DAO:', error);
            // Rethrow the error to be handled by the upper layer (the Service)
            throw error;
        }
    },

    /**
     * Gets featured products that are marked as active and featured.
     * @param {string} languageCode - The language code for translations.
     * @param {number} limit - The maximum number of products to return (default is 9).
     * @returns {Promise<Object>} A promise that resolves to the product object with its details.
     */
    async getFeaturedProducts(languageCode = 'en-US', limit = 9) {
        const sql = `
            SELECT
                p.id AS productId,
                pt.name AS productName,
                pt.description AS productDescription,
                pv.price AS originalPrice,
                CASE
                    WHEN pv.sale_price IS NOT NULL AND (pv.sale_start_date IS NULL OR pv.sale_start_date <= NOW()) AND (pv.sale_end_date IS NULL OR pv.sale_end_date >= NOW())
                    THEN pv.sale_price
                    ELSE NULL
                END AS currentSalePrice,
                pv.sku AS variantSku,
                bt.name AS brandName,
                pi.image_url AS imageUrl
            FROM Products AS p
            JOIN Product_Translations AS pt ON p.id = pt.product_id
            JOIN Brands AS b ON p.brand_id = b.id
            JOIN Brand_Translations AS bt ON b.id = bt.brand_id
            JOIN Product_Variants AS pv ON p.id = pv.product_id
            LEFT JOIN Product_Images AS pi ON pv.id = pi.variant_id AND pi.is_primary = TRUE
            WHERE
                p.is_active = TRUE
                AND p.is_featured = TRUE
                AND pv.is_default = TRUE
                AND pt.language_code = ?
                AND bt.language_code = ?
            LIMIT ?;
        `;
        try {
            const [rows] = await dbPool.query(sql, [languageCode, languageCode, limit]);
            return rows;
        } catch (error) {
            console.error('Error in getFeaturedProducts DAO:', error);
            throw error;
        }
    },

    /**
     * Fetches the latest offers available, limited to a specified number.
     * It checks for active sale prices and their validity based on start and end dates.
     * @param {string} languageCode - The language code for translations.
     * @param {number} limit - The maximum number of offers to return (default is 4).
     * @returns {Promise<Array>} A promise that resolves to an array of offer objects.
     */
    async getLatestOffers(languageCode = 'en-US', limit = 4) {
        const sql = `
            SELECT
                p.id AS productId,
                pt.name AS productName,
                pt.description AS productDescription,
                pv.price AS originalPrice,
                pv.sale_price AS currentSalePrice,
                pv.sku AS variantSku,
                bt.name AS brandName,
                pi.image_url AS imageUrl
            FROM Product_Variants AS pv
            JOIN Products AS p ON pv.product_id = p.id
            JOIN Product_Translations AS pt ON p.id = pt.product_id AND pt.language_code = ?
            JOIN Brands AS b ON p.brand_id = b.id
            JOIN Brand_Translations AS bt ON b.id = bt.brand_id AND bt.language_code = ?
            LEFT JOIN Product_Images AS pi ON pv.id = pi.variant_id AND pi.is_primary = TRUE
            WHERE
                p.is_active = TRUE
                AND pv.sale_price IS NOT NULL
                AND (pv.sale_start_date IS NULL OR pv.sale_start_date <= NOW())
                AND (pv.sale_end_date IS NULL OR pv.sale_end_date >= NOW())
            ORDER BY 
                pv.sale_start_date DESC -- Ordina per le offerte più recenti
            LIMIT ?;
        `;
        try {
            const [rows] = await dbPool.query(sql, [languageCode, languageCode, limit]);
            return rows;
        } catch (error) {
            console.error('Error in getLatestOffers DAO:', error);
            throw error;
        }
    },

    /**
     * Fetches the newest products added to the store.
     * @param {string} languageCode - The language code for translations.
     * @param {number} limit - The maximum number of products to return.
     * @returns {Promise<Array>} A promise that resolves to an array of product objects.
     */
    async getNewestProducts(languageCode = 'en-US', limit = 8) {
        const sql = `
            SELECT
                p.id AS productId,
                pt.name AS productName,
                pt.description AS productDescription,
                pv.price AS originalPrice,
                CASE
                    WHEN pv.sale_price IS NOT NULL AND (pv.sale_start_date IS NULL OR pv.sale_start_date <= NOW()) AND (pv.sale_end_date IS NULL OR pv.sale_end_date >= NOW())
                    THEN pv.sale_price
                    ELSE NULL
                END AS currentSalePrice,
                pv.sku AS variantSku,
                bt.name AS brandName,
                pi.image_url AS imageUrl
            FROM Products AS p
            JOIN Product_Translations AS pt ON p.id = pt.product_id
            JOIN Brands AS b ON p.brand_id = b.id
            JOIN Brand_Translations AS bt ON b.id = bt.brand_id AND bt.language_code = ?
            JOIN Product_Variants AS pv ON p.id = pv.product_id
            LEFT JOIN Product_Images AS pi ON pv.id = pi.variant_id AND pi.is_primary = TRUE
                WHERE
                p.is_active = TRUE
                AND pv.is_default = TRUE
                AND pt.language_code = ?
            ORDER BY 
                p.created_at DESC -- Ordina per i prodotti creati più di recente
            LIMIT ?;
        `;
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
    async getProductById (productId, languageCode = 'en-US') {
        // get main product infos
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
        if (productRows.length === 0) return null; // Product not found

        const product = productRows[0];

        // Query 2: Get all variants for this product
        const variantsSql = `
            SELECT 
                id, 
                sku, 
                price AS originalPrice, -- CORREZIONE: Rinomina per coerenza
                CASE
                    WHEN sale_price IS NOT NULL AND (sale_start_date IS NULL OR sale_start_date <= NOW()) AND (sale_end_date IS NULL OR sale_end_date >= NOW())
                    THEN sale_price
                    ELSE NULL
                END AS currentSalePrice, -- CORREZIONE: Calcola il prezzo scontato
                stock_quantity 
            FROM Product_Variants 
            WHERE product_id = ?
        `;
        const [variants] = await dbPool.query(variantsSql, [productId]);
        if (variants.length === 0) {
            product.variants = [];
            return product;
        }

        // Query 3: Get all images for all variants of this product
        const variantIds = variants.map(v => v.id);
        const imagesSql = 'SELECT variant_id, image_url, alt_text, is_primary FROM Product_Images WHERE variant_id IN (?)';
        const [images] = await dbPool.query(imagesSql, [variantIds]);

        // Query 4: Get all attributes for all variants of this product
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

        // Assemble the final object in JavaScript
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
                p.is_active AS isActive,
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
            whereClauses.push('p.is_active = TRUE');
        } else if (status === 'inactive') {
            whereClauses.push('p.is_active = FALSE');
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
    }

};

// Export the DAO object so it can be used in other files (in our case, in the Service)
module.exports = productDAO;
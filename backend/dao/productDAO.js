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
    }

};

// Export the DAO object so it can be used in other files (in our case, in the Service)
module.exports = productDAO;

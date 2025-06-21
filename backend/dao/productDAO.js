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
            bt.name AS brandName,
            pv.price AS variantPrice,
            pv.sku AS variantSku
            -- We will add an image field here in the future, e.g., pv.image_url
            FROM Products AS p
            JOIN Product_Translations AS pt ON p.id = pt.product_id
            JOIN Brands AS b ON p.brand_id = b.id
            JOIN Brand_Translations AS bt ON b.id = bt.brand_id
            JOIN Product_Variants AS pv ON p.id = pv.product_id
            WHERE
            p.is_active = TRUE          -- Select only active products
            AND pv.is_default = TRUE    -- Select only the default variant for the list view
            AND pt.language_code = ?    -- Filter translations by the requested language
            AND bt.language_code = ?;   -- Filter brand translations by the requested language
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
    }

    // ... other functions like getProductById, createProduct, etc., will be added here in the future.
};

// Export the DAO object so it can be used in other files (in our case, in the Service)
module.exports = productDAO;

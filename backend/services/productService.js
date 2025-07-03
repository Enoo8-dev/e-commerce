// Import the productDAO to interact with the database
const productDAO = require('../dao/productDAO');

// Create the Service object for products
const productService = {
  
    /**
     * Retrieves all products by calling the corresponding DAO function.
     * This service layer can be expanded in the future to include more complex business logic.
     * @param {string} languageCode - The language code to fetch translations.
     * @returns {Promise<Array>} A promise that resolves to an array of product objects.
     */
    async getAllProducts(languageCode) {
        try {
            // Call the DAO function to get the data
            const products = await productDAO.getAllProducts(languageCode);
            
            // For now, we just return the data as is.
            // In the future, we could transform or enrich the data here.
            return products;
        } catch (error) {
            // If an error occurs in the DAO, it will be caught here.
            // We log it and rethrow it to be handled by the controller/route.
            console.error('Error in productService.getAllProducts:', error);
            throw error;
        }
    },
    async getFeaturedProducts(languageCode, limit) {
        try {
            return await productDAO.getFeaturedProducts(languageCode, limit);
        } catch (error) {
            console.error('Error in productService.getFeaturedProducts:', error);
            throw error;
        }
    },
    async getLatestOffers(languageCode, limit) {
        try {
            return await productDAO.getLatestOffers(languageCode, limit);
        } catch (error) {
            console.error('Error in productService.getLatestOffers:', error);
            throw error;
        }
    },
    async getNewestProducts(languageCode, limit) {
        try {
            return await productDAO.getNewestProducts(languageCode, limit);
        } catch (error) {
            console.error('Error in productService.getNewestProducts:', error);
            throw error;
        }
    },
    async getProductById(productId, languageCode) {
        try {
            const product = await productDAO.getProductById(productId, languageCode);
            if (!product) {
                const error = new Error('Product not found');
                error.statusCode = 404;
                throw error;
            }
            return product;
        } catch (error) {
            console.error('Error in productService.getProductById:', error);
            throw error;
        }
    },
    async getAdminProductList(options) {
        try {
            return await productDAO.getAdminProductList(options);
        } catch (error) {
            console.error('Error in productService.getAdminProductList:', error);
            throw error;
        }
    },
    async updateVariantStatus(variantId, isActive) {
        try {
            return await productDAO.updateVariantStatus(variantId, isActive);
        } catch (error) {
            console.error('Error in productService.updateVariantStatus:', error);
            throw error;
        }
    },
    async getAdminProductDetails(productId, languageCode) {
        const product = await productDAO.getAdminProductDetails(productId, languageCode);
        if (!product) {
            const error = new Error('Product not found');
            error.statusCode = 404;
            throw error;
        }
        return product;
    },

    async updateProduct(productId, productData) {
        return await productDAO.updateProduct(productId, productData);
    },

    async getAllBrands(languageCode) {
        return await productDAO.getAllBrands(languageCode);
    },

    async getAllCategories(languageCode) {
        return await productDAO.getAllCategories(languageCode);
    },

    async createProduct(productData) {
        return await productDAO.createProduct(productData);
    },

    async getAttributesForForm(languageCode) {
        const flatList = await productDAO.getAttributesForForm(languageCode);

        const structuredAttributes = {};
        for (const row of flatList) {
            if (!structuredAttributes[row.attributeId]) {
                structuredAttributes[row.attributeId] = {
                    id: row.attributeId,
                    name: row.attributeName,
                    values: []
                };
            }
            if (row.valueId) { 
                structuredAttributes[row.attributeId].values.push({
                    id: row.valueId,
                    value: row.valueName
                });
            }
        }
        return Object.values(structuredAttributes);
    },
    
    async getVariantDetails(variantIds) {
        return await productDAO.getVariantDetailsByIds(variantIds);
    }

};

// Export the service object
module.exports = productService;
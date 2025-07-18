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
            const products = await productDAO.getAllProducts(languageCode);
    
            return products;
        } catch (error) {
            console.error('Error in productService.getAllProducts:', error);
            throw error;
        }
    },

    /**
     * Retrieves featured products for the homepage.
     * @param {string} languageCode - The language code to fetch translations.
     * @param {number} limit - The maximum number of featured products to retrieve.
     * @returns {Promise<Array>} A promise that resolves to an array of featured product objects.
     */
    async getFeaturedProducts(languageCode, limit) {
        try {
            return await productDAO.getFeaturedProducts(languageCode, limit);
        } catch (error) {
            console.error('Error in productService.getFeaturedProducts:', error);
            throw error;
        }
    },

    /**
     * Retrieves the latest offers for the offers page.
     * @param {string} languageCode - The language code to fetch translations.
     * @param {number} limit - The maximum number of offers to retrieve.
     * @returns {Promise<Array>} A promise that resolves to an array of offer objects.
     */
    async getLatestOffers(languageCode, limit) {
        try {
            return await productDAO.getLatestOffers(languageCode, limit);
        } catch (error) {
            console.error('Error in productService.getLatestOffers:', error);
            throw error;
        }
    },

    /**
     * Retrieves the newest products for the newest products page.
     * @param {string} languageCode - The language code to fetch translations.
     * @param {number} limit - The maximum number of newest products to retrieve.
     * @returns {Promise<Array>} A promise that resolves to an array of newest product objects.
     */
    async getNewestProducts(languageCode, limit) {
        try {
            return await productDAO.getNewestProducts(languageCode, limit);
        } catch (error) {
            console.error('Error in productService.getNewestProducts:', error);
            throw error;
        }
    },

    /**
     * Retrieves product details by product ID and language code.
     * @param {string} productId - The ID of the product to retrieve.
     * @param {string} languageCode - The language code to fetch translations.
     * @returns {Promise<Object>} A promise that resolves to the product details object.
     * @throws {Error} If the product is not found.
     */
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

    /**
     * Retrieves a list of products for the admin panel with pagination and sorting options.
     * @param {Object} options - Options for pagination and sorting.
     * @param {number} options.page - The page number to retrieve (default: 1).
     * @param {number} options.limit - The number of items per page (default: 10).
     * @param {string} options.sort - The field to sort by  (default: 'name').
     * @param {string} options.order - The order of sorting ('asc' or 'desc', default: 'asc').
     * @returns {Promise<Array>} A promise that resolves to an array of product objects.
     * @throws {Error} If there is an error retrieving the product list.
     */
    async getAdminProductList(options) {
        try {
            return await productDAO.getAdminProductList(options);
        } catch (error) {
            console.error('Error in productService.getAdminProductList:', error);
            throw error;
        }
    },

    /**
     * Updates the status of a product variant (active/inactive).
     * @param {string} variantId - The ID of the product variant to update.
     * @param {boolean} isActive - The new status of the variant (true for active, false for inactive).
     * @returns {Promise<Object>} A promise that resolves to the updated variant object.
     * @throws {Error} If there is an error updating the variant status.
     */
    async updateVariantStatus(variantId, isActive) {
        try {
            return await productDAO.updateVariantStatus(variantId, isActive);
        } catch (error) {
            console.error('Error in productService.updateVariantStatus:', error);
            throw error;
        }
    },

    /**
     * Retrieves detailed information about a product for the admin panel.
     * @param {string} productId - The ID of the product to retrieve.
     * @param {string} languageCode - The language code to fetch translations.
     * @returns {Promise<Object>} A promise that resolves to the product details object.    
     * @throws {Error} If the product is not found.
     */
    async getAdminProductDetails(productId, languageCode) {
        const product = await productDAO.getAdminProductDetails(productId, languageCode);
        if (!product) {
            const error = new Error('Product not found');
            error.statusCode = 404;
            throw error;
        }
        return product;
    },

    /**
     * Updates a product's details in the database.
     * @param {string} productId - The ID of the product to update.
     * @param {Object} productData - The data to update the product with.
     * @param {string} productData.name - The name of the product.
     * @param {string} productData.description - The description of the product.
     * @param {number} productData.price - The price of the product.
     * @param {string} productData.categoryId - The ID of the category the product belongs to.
     * @param {Array} productData.variants - An array of variant objects, each containing:
     * @param {string} productData.variants[].id - The ID of the variant.
     * @param {string} productData.variants[].name - The name of the variant.
     * @param {number} productData.variants[].price - The price of the variant.
     * @param {boolean} productData.variants[].isActive - The status of the variant (active/inactive).
     * @returns {Promise<Object>} A promise that resolves to the updated product object.
     * @throws {Error} If there is an error updating the product.
     */
    async updateProduct(productId, productData) {
        return await productDAO.updateProduct(productId, productData);
    },

    /**
     * Deletes a product from the database.
     * @param {string} productId - The ID of the product to delete.
     * @returns {Promise<void>} A promise that resolves when the product is deleted.
     * @throws {Error} If there is an error deleting the product.
     */ 
    async getAllBrands(languageCode) {
        return await productDAO.getAllBrands(languageCode);
    },

    /**
     * Deletes a product from the database.
     * @param {string} productId - The ID of the product to delete.
     * @returns {Promise<void>} A promise that resolves when the product is deleted.
     * @throws {Error} If there is an error deleting the product.
     */
    async getAllCategories(languageCode) {
        return await productDAO.getAllCategories(languageCode);
    },

    /**
     * Creates a new product in the database.
     * @param {Object} productData - The data for the new product.
     * @param {string} productData.name - The name of the product.
     * @param {string} productData.description - The description of the product.
     * @param {number} productData.price - The price of the product.
     * @param {string} productData.categoryId - The ID of the category the product belongs to.
     * @param {Array} productData.variants - An array of variant objects, each containing:
     * @param {string} productData.variants[].name - The name of the variant.
     * @param {number} productData.variants[].price - The price of the variant.
     * @param {boolean} productData.variants[].isActive - The status of the variant (active/inactive).
     * @returns {Promise<Object>} A promise that resolves to the created product object.
     * @throws {Error} If there is an error creating the product.
     */   
    async createProduct(productData) {
        return await productDAO.createProduct(productData);
    },

    /**
     * Fetches the layout for the newest products page.
     * @param {string} languageCode - The desired language.
     * @returns {Promise<object>} An object containing the hero product and a list of new products.
     */
    async getNewestPageLayout(languageCode) {
        const allNewest = await productDAO.getNewestProductsWithDetails(languageCode);

        return {
            heroProduct: allNewest[0] || null, // Il primo prodotto più nuovo come hero
            newProducts: allNewest.slice(1, 9), // I successivi 8 per la griglia
        };
    },

    /**
     * Fetches the layout for the category page, grouping products by main and sub-categories.
     * @param {string} languageCode - The desired language for product names.
     * @returns {Promise<Array>} An array of main categories, each containing sub-categories and their products.
     */
    async getCategoryPageLayout(languageCode) {
        const flatProductList = await productDAO.getProductsGroupedByCategories(languageCode);
        
        const mainCategoriesMap = new Map();

        for (const product of flatProductList) {
            // Se un prodotto appartiene a una categoria senza genitore, quella è la sua categoria principale.
            const mainCatId = product.mainCategoryId || product.categoryId;
            const mainCatName = product.mainCategoryName || product.categoryName;

            // crep categoria principale se non esiste nella mappa
            if (!mainCategoriesMap.has(mainCatId)) {
            mainCategoriesMap.set(mainCatId, {
                id: mainCatId,
                name: mainCatName,
                // La chiave 'products' conterrà i prodotti direttamente sotto la categoria principale.
                // La chiave 'subCategories' conterrà i gruppi di sotto-categorie.
                products: [],
                // e ci inizializzo un altra mappa dentro per le sotto-categorie
                subCategories: new Map()
            });
            }

            const mainCategory = mainCategoriesMap.get(mainCatId);

            // Se la categoria del prodotto è diversa dalla categoria principale, è una sotto-categoria.
            if (product.categoryId !== mainCatId) {
            const subCategoriesMap = mainCategory.subCategories;
            if (!subCategoriesMap.has(product.categoryId)) {
                subCategoriesMap.set(product.categoryId, {
                id: product.categoryId,
                name: product.categoryName,
                products: []
                });
            }
            subCategoriesMap.get(product.categoryId).products.push(product);
            } else {
            // Altrimenti, il prodotto appartiene direttamente alla categoria principale.
            mainCategory.products.push(product);
            }
        }

        // Converte le mappe in array per il JSON di risposta
        const result = Array.from(mainCategoriesMap.values()).map(mainCat => ({
            ...mainCat,
            subCategories: Array.from(mainCat.subCategories.values())
        }));

        return result;
    }

};

// Export the service object
module.exports = productService;
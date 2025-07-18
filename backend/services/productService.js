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
        // raggruppa le righe in base all'ID dell'attributo
        // e crea un array di valori per ogni attributo
        // in modo da avere un oggetto strutturato per il form
        // { attributeId: 1, attributeName: "Colore", values: [{ id: 10, value: "Rosso" }, { id: 11, value: "Blu" }] }
        // per ogni riga, aggiunge il valore all'array dei valori dell'attributo
        // se l'attributo non esiste, lo crea
        // se il valore non esiste, lo aggiunge all'array dei valori dell'attributo
        // restituisce un array di oggetti strutturati
        // con gli attributi e i loro valori
        // per il form di creazione/modifica prodotto
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
    
    async validateCartItems(variantIds, languageCode) {
        return await productDAO.getVariantDetailsByIds(variantIds, languageCode);
    },

    async getOffersPageLayout(languageCode) {
        const allOffers = await productDAO.getActiveOffers(languageCode);
        
        const popularOffers = allOffers.filter(offer => offer.is_featured);

        // raggruppa le offerte per categoria e crea una mappa con l id come chiave
        const offersByCategoryMap = allOffers.reduce((acc, offer) => {
            if (offer.categoryId && offer.categoryName) {
            if (!acc.has(offer.categoryId)) {
                acc.set(offer.categoryId, {
                categoryId: offer.categoryId,
                categoryName: offer.categoryName,
                products: []
                });
            }
            acc.get(offer.categoryId).products.push(offer);
            }
            return acc;
        }, new Map());

        return {
            heroOffer: popularOffers[0] || allOffers[0] || null,
            popularOffers: popularOffers.slice(0, 4), // Prendiamo le prime 4 popolari
            offersByCategory: Array.from(offersByCategoryMap.values()) // Convertiamo la mappa in un array
        };
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
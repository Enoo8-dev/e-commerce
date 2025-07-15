const fs = require('fs');
const Papa = require('papaparse');
const productDAO = require('../dao/productDAO');

const importService = {
  async processProductCsv(filePath) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data: rows } = Papa.parse(fileContent, { header: true, skipEmptyLines: true, delimiter: ';' });

    console.log(`--- INIZIO PROCESSO DI IMPORTAZIONE CSV ---`);
    console.log(`Trovate ${rows.length} righe nel file.`);

    const productGroups = new Map();
    for (const [index, row] of rows.entries()) {
      const rowNum = index + 2;
      console.log(`\n--- Validazione Riga ${rowNum} ---`);

      // Validazione Brand
      const brandNameIt = row['brandName_it-IT'];
      const brandNameEn = row['brandName_en-US'];
      if (!brandNameIt || !brandNameEn) throw new Error(`Riga ${rowNum}: Colonne brandName_it-IT e brandName_en-US sono obbligatorie.`);
      const brandId = await productDAO.findBrandIdByNames(brandNameIt, brandNameEn);
      if (!brandId) throw new Error(`Riga ${rowNum}: Brand "${brandNameIt}" non trovato o traduzioni non corrispondenti.`);
      console.log(`Brand OK: ID ${brandId}`);
      
      // Validazione Categorie
      const categoryNamesIt = row['categoryNames_it-IT']?.split(';').map(c => c.trim()) || [];
      if (categoryNamesIt.length === 0) throw new Error(`Riga ${rowNum}: Colonna categoryNames_it-IT è obbligatoria.`);
      const categoryIds = await productDAO.findCategoryIdsByNames(categoryNamesIt, 'it-IT');
      if (categoryIds.length !== categoryNamesIt.length) throw new Error(`Riga ${rowNum}: Una o più categorie in "${row['categoryNames_it-IT']}" non trovate.`);
      console.log(`Categorie OK: IDs ${categoryIds.join(', ')}`);

      // Validazione e raccolta Attributi
      const attributes = new Set();
      for (const key in row) {
        if (key.startsWith('attribute_')) {
          const parts = key.split('_');
          const attrName = parts[1];
          const langCode = parts[2];
          const attrValue = row[key];

          if (attrValue) {
            const attributeId = await productDAO.findAttributeIdByName(attrName, langCode);
            if (!attributeId) throw new Error(`Riga ${rowNum}: Tipo di attributo "${attrName}" non trovato per la lingua ${langCode}.`);

            const valueId = await productDAO.findAttributeValueIdByName(attributeId, attrValue, langCode);
            if (!valueId) throw new Error(`Riga ${rowNum}: Valore "${attrValue}" non trovato per l'attributo "${attrName}" in lingua ${langCode}.`);
            
            attributes.add(valueId);
          }
        }
      }
      console.log(`Attributi OK: IDs ${[...attributes].join(', ')}`);
      
      const groupId = row.product_group_id;
      if (!productGroups.has(groupId)) {
        productGroups.set(groupId, {
          brand_id: brandId,
          category_ids: categoryIds,
          is_featured: row.is_featured === 'TRUE',
          translations: {
            'it-IT': { name: row['productName_it-IT'], description: row['description_it-IT'], features: this.parseFeatures(row['features_it-IT']) },
            'en-US': { name: row['productName_en-US'], description: row['description_en-US'], features: this.parseFeatures(row['features_en-US']) }
          },
          variants: []
        });
      }
      productGroups.get(groupId).variants.push({
        sku: row.sku,
        price: parseFloat(row.price),
        stock: parseInt(row.stock, 10),
        attributes: [...attributes]
      });
    }

    console.log(`\n--- Validazione completata. Procedo con l'inserimento di ${productGroups.size} gruppi di prodotti. ---`);

    // 2. Creazione dei prodotti
    for (const [groupId, productData] of productGroups.entries()) {
      await productDAO.createProduct(productData);
      console.log(`Gruppo prodotto "${groupId}" creato con successo.`);
    }
    return { message: `${productGroups.size} gruppi di prodotti importati con successo.` };
  },

  parseFeatures(featureString) {
    if (!featureString) return {};
    return featureString.split(';').reduce((acc, pair) => {
      const [key, value] = pair.split(':');
      if (key && value) acc[key.trim()] = value.trim();
      return acc;
    }, {});
  }
};

module.exports = importService;

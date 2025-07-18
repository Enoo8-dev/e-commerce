const dbPool = require('../config/database');

const attributeDAO = {
  /**
   * Recupera tutti gli attributi con le traduzioni e i valori associati.
   * @param {Object} params - Parametri di ricerca e ordinamento.
   * @param {string} params.languageCode - Codice della lingua per le traduzioni.
   * @param {string} [params.search] - Termini di ricerca per il nome dell'attributo.
   * @param {string} [params.sortBy] - Colonna per l'ordinamento (default: 'name').
   * @param {string} [params.sortOrder] - Direzione dell'ordinamento ('ASC' o 'DESC', default: 'ASC').
   * @returns {Promise<Array>} - Lista di attributi con traduzioni e valori.
   */
  async getAll({ languageCode = 'en-US', search = '', sortBy = 'name', sortOrder = 'ASC' }) {
    let sql = `
      SELECT a.id, at.name 
      FROM Attributes a 
      JOIN Attribute_Translations at ON a.id = at.attribute_id
    `;
    const params = [];
    const whereClauses = [];

    whereClauses.push('at.language_code = ?');
    params.push(languageCode);

    if (search) {
      whereClauses.push('at.name LIKE ?');
      params.push(`%${search}%`);
    }

    if (whereClauses.length > 0) {
      sql += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    const validSortColumns = { name: 'at.name', id: 'a.id' };
    const orderByColumn = validSortColumns[sortBy] || 'at.name';
    const orderDirection = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    sql += ` ORDER BY ${orderByColumn} ${orderDirection}`;

    try {
        const [attributes] = await dbPool.query(sql, params);
        if (attributes.length === 0) return [];

        const attributeIds = attributes.map(a => a.id);
        const valuesSql = `
          SELECT av.id, av.attribute_id, avt.value, av.hex_code
          FROM Attribute_Values av
          JOIN Attribute_Value_Translations avt ON av.id = avt.attribute_value_id
          WHERE av.attribute_id IN (?) AND avt.language_code = ?
          ORDER BY avt.value ASC;
        `;
        const [values] = await dbPool.query(valuesSql, [attributeIds, languageCode]);

        attributes.forEach(attr => {
          attr.values = values.filter(val => val.attribute_id === attr.id);
        });
        return attributes;
    } catch (error) {
        console.error('Error in attributeDAO getAll:', error);
        throw error;
    }
  },

  /**
   * Recupera un attributo specifico con le traduzioni e i valori associati.
   * @param {number} id - ID dell'attributo da recuperare.
   * @returns {Promise<Object>} - Attributo con traduzioni e valori.
   */
  async getAttributeById(id) {
    const sql = `
      SELECT a.id, it.name as name_it, en.name as name_en
      FROM Attributes a
      LEFT JOIN Attribute_Translations it ON a.id = it.attribute_id AND it.language_code = 'it-IT'
      LEFT JOIN Attribute_Translations en ON a.id = en.attribute_id AND en.language_code = 'en-US'
      WHERE a.id = ?;
    `;
    const [rows] = await dbPool.query(sql, [id]);
    return rows[0];
  },

  /**
   * Recupera un valore di attributo specifico con le traduzioni.
   * @param {number} id - ID del valore di attributo da recuperare.
   * @returns {Promise<Object>} - Valore di attributo con traduzioni.
   */
  async getAttributeValueById(id) {
    const sql = `
      SELECT av.id, av.hex_code,
             it.value as value_it,
             en.value as value_en
      FROM Attribute_Values av
      LEFT JOIN Attribute_Value_Translations it ON av.id = it.attribute_value_id AND it.language_code = 'it-IT'
      LEFT JOIN Attribute_Value_Translations en ON av.id = en.attribute_value_id AND en.language_code = 'en-US'
      WHERE av.id = ?;
    `;
    const [rows] = await dbPool.query(sql, [id]);
    return rows[0];
  },

  /**
   * Crea un nuovo attributo con le traduzioni.
   * @param {string} name - Nome dell'attributo.
   * @returns {Promise<Object>} - Attributo creato con ID e nome.
   */
  async createAttribute(name) {
    const connection = await dbPool.getConnection();
    try {
      await connection.beginTransaction();
      const [result] = await connection.query('INSERT INTO Attributes (name) VALUES (?)', [name]);
      const attributeId = result.insertId;
      await connection.query('INSERT INTO Attribute_Translations (attribute_id, language_code, name) VALUES (?, ?, ?), (?, ?, ?)', [attributeId, 'it-IT', name, attributeId, 'en-US', name]);
      await connection.commit();
      return { id: attributeId, name };
    } catch (error) {
      await connection.rollback(); throw error;
    } finally {
      connection.release();
    }
  },

  /**
   * Crea un nuovo valore di attributo con le traduzioni.
   * @param {number} attribute_id - ID dell'attributo a cui associare il valore.
   * @param {Object} valueData - Dati del valore da creare.
   * @param {string} valueData.value_it - Valore in italiano.
   * @param {string} valueData.value_en - Valore in inglese.
   * @param {string} [valueData.hex_code] - Codice esadecimale opzionale.
   * @returns {Promise<Object>} - Valore di attributo creato con ID e valore.
   */
  async createAttributeValue(attribute_id, { value_it, value_en, hex_code }) {
    const connection = await dbPool.getConnection();
    try {
        await connection.beginTransaction();
        const [result] = await connection.query('INSERT INTO Attribute_Values (attribute_id, hex_code) VALUES (?, ?)', [attribute_id, hex_code || null]);
        const valueId = result.insertId;
        await connection.query('INSERT INTO Attribute_Value_Translations (attribute_value_id, language_code, value) VALUES (?, ?, ?), (?, ?, ?)', [valueId, 'it-IT', value_it, valueId, 'en-US', value_en]);
        await connection.commit();
        return { id: valueId, value: value_it };
    } catch (error) {
        await connection.rollback(); throw error;
    } finally {
        connection.release();
    }
  },

  /**
   * Aggiorna un attributo esistente con le traduzioni.
   * @param {number} id - ID dell'attributo da aggiornare.
   * @param {Object} translations - Traduzioni da aggiornare.
   * @param {string} translations.name_it - Nome in italiano.
   * @param {string} translations.name_en - Nome in inglese.
   * @returns {Promise<boolean>} - True se l'aggiornamento è riuscito, altrimenti false.
   */
  async updateAttribute(id, { name_it, name_en }) {
    const connection = await dbPool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query('UPDATE Attribute_Translations SET name = ? WHERE attribute_id = ? AND language_code = ?', [name_it, id, 'it-IT']);
      await connection.query('UPDATE Attribute_Translations SET name = ? WHERE attribute_id = ? AND language_code = ?', [name_en, id, 'en-US']);
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback(); throw error;
    } finally {
      connection.release();
    }
  },

  /**
   * Aggiorna un valore di attributo esistente con le traduzioni.
   * @param {number} id - ID del valore di attributo da aggiornare.
   * @param {Object} translations - Traduzioni da aggiornare.
   * @param {string} translations.value_it - Valore in italiano.
   * @param {string} translations.value_en - Valore in inglese.
   * @param {string} translations.hex_code - Codice esadecimale opzionale.
   * @returns {Promise<boolean>} - True se l'aggiornamento è riuscito, altrimenti false.
   */
  async updateAttributeValue(id, { value_it, value_en, hex_code }) {
    const connection = await dbPool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query('UPDATE Attribute_Values SET hex_code = ? WHERE id = ?', [hex_code || null, id]);
      await connection.query('UPDATE Attribute_Value_Translations SET value = ? WHERE attribute_value_id = ? AND language_code = ?', [value_it, id, 'it-IT']);
      await connection.query('UPDATE Attribute_Value_Translations SET value = ? WHERE attribute_value_id = ? AND language_code = ?', [value_en, id, 'en-US']);
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback(); throw error;
    } finally {
      connection.release();
    }
  },

  /**
   * Elimina un attributo specifico.
   * @param {number} id - ID dell'attributo da eliminare.
   * @returns {Promise<boolean>} - True se l'eliminazione è riuscita, altrimenti false.
   */
  async deleteAttribute(id) {
    const [result] = await dbPool.query('DELETE FROM Attributes WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  /**
   * Elimina un valore di attributo specifico.
   * @param {number} id - ID del valore di attributo da eliminare.
   * @returns {Promise<boolean>} - True se l'eliminazione è riuscita, altrimenti false.
   */
  async deleteAttributeValue(id) {
    const [result] = await dbPool.query('DELETE FROM Attribute_Values WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = attributeDAO;

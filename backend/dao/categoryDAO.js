const dbPool = require('../config/database');

const categoryDAO = {
  /**
   * Recupera tutte le categorie con traduzioni e opzioni di ricerca e ordinamento
   * @param {Object} options - Opzioni di ricerca e ordinamento
   * @param {string} options.languageCode - Codice della lingua per le traduzioni
   * @param {string} [options.search] - Termini di ricerca per nome categoria
   * @param {string} [options.sortBy] - Colonna per ordinamento (name, parent_name)
   * @param {string} [options.sortOrder] - Direzione di ordinamento (ASC, DESC)
   * @returns {Promise<Array>} - Lista di categorie
   */
  async getAll({ languageCode = 'en-US', search = '', sortBy = 'name', sortOrder = 'ASC' }) {
    let sql = `
      SELECT 
        c.id, 
        ct.name, 
        c.parent_category_id,
        parent_ct.name AS parent_name
      FROM Categories c
      JOIN Category_Translations ct ON c.id = ct.category_id
      LEFT JOIN Categories parent_c ON c.parent_category_id = parent_c.id
      LEFT JOIN Category_Translations parent_ct ON parent_c.id = parent_ct.category_id AND parent_ct.language_code = ?
    `;
    const params = [languageCode, languageCode];
    const whereClauses = ['ct.language_code = ?'];

    if (search) {
      whereClauses.push('(ct.name LIKE ? OR parent_ct.name LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ` WHERE ${whereClauses.join(' AND ')}`;

    const validSortColumns = { name: 'ct.name', parent_name: 'parent_name' };
    const orderByColumn = validSortColumns[sortBy] || 'ct.name';
    const orderDirection = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    sql += ` ORDER BY ${orderByColumn} ${orderDirection}`;

    const [rows] = await dbPool.query(sql, params);
    return rows;
  },

  /**
   * Recupera una categoria per ID con traduzioni
   * @param {number} id - ID della categoria
   * @returns {Promise<Object>} - Dettagli della categoria
   */
  async getById(id) {
    const sql = `
      SELECT 
        c.id, c.parent_category_id,
        it.name AS name_it, 
        en.name AS name_en
      FROM Categories c
      LEFT JOIN Category_Translations it ON c.id = it.category_id AND it.language_code = 'it-IT'
      LEFT JOIN Category_Translations en ON c.id = en.category_id AND en.language_code = 'en-US'
      WHERE c.id = ?;
    `;
    const [rows] = await dbPool.query(sql, [id]);
    return rows[0];
  },

  /**
   * Crea una nuova categoria con traduzioni
   * @param {Object} categoryData - Dati della categoria
   * @param {string} categoryData.name_it - Nome in italiano
   * @param {string} categoryData.name_en - Nome in inglese
   * @param {number} [categoryData.parent_category_id] - ID della categoria padre
   * @returns {Promise<Object>} - Dettagli della categoria creata
   */
  async create({ name_it, name_en, parent_category_id }) {
    const connection = await dbPool.getConnection();
    try {
      await connection.beginTransaction();
      const [categoryResult] = await connection.query(
        'INSERT INTO Categories (parent_category_id) VALUES (?)', 
        [parent_category_id || null]
      );
      const categoryId = categoryResult.insertId;

      await connection.query('INSERT INTO Category_Translations (category_id, language_code, name) VALUES (?, ?, ?), (?, ?, ?)', 
        [categoryId, 'it-IT', name_it, categoryId, 'en-US', name_en]
      );

      await connection.commit();
      return { id: categoryId, name: name_it };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  /** 
   * Aggiorna una categoria esistente con traduzioni
   * @param {number} id - ID della categoria da aggiornare
   * @param {Object} categoryData - Dati della categoria  
   * @param {string} categoryData.name_it - Nome in italiano
   * @param {string} categoryData.name_en - Nome in inglese
   * @param {number} [categoryData.parent_category_id] - ID della categoria padre
   * @returns {Promise<boolean>} - True se l'aggiornamento è riuscito
   */
  async update(id, { name_it, name_en, parent_category_id }) {
    const connection = await dbPool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query('UPDATE Categories SET parent_category_id = ? WHERE id = ?', [parent_category_id || null, id]);
      await connection.query('UPDATE Category_Translations SET name = ? WHERE category_id = ? AND language_code = ?', [name_it, id, 'it-IT']);
      await connection.query('UPDATE Category_Translations SET name = ? WHERE category_id = ? AND language_code = ?', [name_en, id, 'en-US']);
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  /**
   * Elimina una categoria per ID
   * @param {number} id - ID della categoria da eliminare
   * @returns {Promise<boolean>} - True se l'eliminazione è riuscita
   */
  async delete(id) {
    const [result] = await dbPool.query('DELETE FROM Categories WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = categoryDAO;
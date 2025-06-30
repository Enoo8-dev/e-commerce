const dbPool = require('../config/database');

const brandDAO = {
  async getAll({ languageCode = 'en-US', search = '', sortBy = 'name', sortOrder = 'ASC' }) {
    let sql = `
      SELECT b.id, bt.name, b.logo_url, b.created_at
      FROM Brands b
      JOIN Brand_Translations bt ON b.id = bt.brand_id
    `;
    const params = [];
    const whereClauses = [];

    // Aggiungi sempre il filtro per la lingua
    whereClauses.push('bt.language_code = ?');
    params.push(languageCode);

    // Aggiungi il filtro di ricerca solo se presente
    if (search) {
      whereClauses.push('LOWER(bt.name) LIKE ?');
      params.push(`%${search.toLowerCase()}%`);
    }

    // Componi la clausola WHERE
    if (whereClauses.length > 0) {
      sql += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    // Whitelist per l'ordinamento per prevenire SQL injection
    const validSortColumns = { name: 'bt.name', created_at: 'b.created_at' };
    const orderByColumn = validSortColumns[sortBy] || 'bt.name';
    const orderDirection = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    sql += ` ORDER BY ${orderByColumn} ${orderDirection}`;


    try {
        const [rows] = await dbPool.query(sql, params);
        return rows;
    } catch (error) {
        console.error('Error in brandDAO getAll:', error);
        throw error;
    }
  },

  async getById(brandId) {
    const sql = `
      SELECT 
        b.id, b.logo_url,
        it.name as name_it, it.description as description_it,
        en.name as name_en, en.description as description_en
      FROM Brands b
      LEFT JOIN Brand_Translations it ON b.id = it.brand_id AND it.language_code = 'it-IT'
      LEFT JOIN Brand_Translations en ON b.id = en.brand_id AND en.language_code = 'en-US'
      WHERE b.id = ?;
    `;
    const [rows] = await dbPool.query(sql, [brandId]);
    return rows[0];
  },

  async create(data, logoPath) {
    const connection = await dbPool.getConnection();
    try {
      await connection.beginTransaction();
      const [brandResult] = await connection.query('INSERT INTO Brands (logo_url) VALUES (?)', [logoPath]);
      const brandId = brandResult.insertId;
      await connection.query('INSERT INTO Brand_Translations (brand_id, language_code, name, description) VALUES (?, ?, ?, ?), (?, ?, ?, ?)', 
        [brandId, 'it-IT', data.name_it, data.description_it, brandId, 'en-US', data.name_en, data.description_en]
      );
      await connection.commit();
      return { id: brandId, name: data.name_it };
    } catch (error) {
      await connection.rollback(); throw error;
    } finally {
      connection.release();
    }
  },

  async update(id, data) {
    const connection = await dbPool.getConnection();
    try {
      await connection.beginTransaction();
      if (data.logo_url !== undefined) {
        await connection.query('UPDATE Brands SET logo_url = ? WHERE id = ?', [data.logo_url, id]);
      }
      await connection.query('UPDATE Brand_Translations SET name = ?, description = ? WHERE brand_id = ? AND language_code = ?', [data.name_it, data.description_it, id, 'it-IT']);
      await connection.query('UPDATE Brand_Translations SET name = ?, description = ? WHERE brand_id = ? AND language_code = ?', [data.name_en, data.description_en, id, 'en-US']);
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback(); throw error;
    } finally {
      connection.release();
    }
  },

  async delete(id) {
    const [result] = await dbPool.query('DELETE FROM Brands WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = brandDAO;
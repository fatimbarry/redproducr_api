const db = require('../config/database');

class Hotel {
  static async create(hotelData) {
    const sql = `
        INSERT INTO hotels 
        (nom, description, prix, contactinfo, email, adresse, photo, devise, user_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.query(sql, [
        hotelData.nom,
        hotelData.description,
        hotelData.prix,
        hotelData.contactinfo,
        hotelData.email,
        hotelData.adresse,
        hotelData.photo,
        hotelData.devise,
        hotelData.userId  // Ajout du user_id
    ]);
    
    return result;
}
static async findAll(userId, offset = 0, limit = 10, filters = {}) {
  try {
      // Requête de base avec filtrage par user_id
      let query = `
            SELECT 
                id,
                nom,
                description,
                adresse,
                CONCAT('${process.env.BACKEND_URL}/uploads/hotels/', photo) as photo_url,
                photo,
                contactinfo,
                prix,
                devise,
                user_id,
                created_at,
                updated_at
            FROM hotels 
            WHERE user_id = ?
        `;

      
      const queryParams = [userId];

      // Ajout des filtres optionnels
      if (filters.devise) {
          query += ' AND devise = ?';
          queryParams.push(filters.devise);
      }
      if (filters.prix?.min) {
          query += ' AND prix >= ?';
          queryParams.push(filters.prix.min);
      }
      if (filters.prix?.max) {
          query += ' AND prix <= ?';
          queryParams.push(filters.prix.max);
      }

      // Ajout de l'ordre et de la pagination
      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      queryParams.push(limit, offset);

      console.log('SQL Query:', query); // Pour debug
      console.log('Query Parameters:', queryParams); // Pour debug

      const [hotels] = await pool.execute(query, queryParams);
      return hotels;
  } catch (error) {
      console.error('Erreur dans Hotel.findAll:', error);
      throw new Error('Erreur lors de la récupération des hôtels: ' + error.message);
  }
}



  static getCount(filters) {
    // Requête similaire à findAll, mais avec COUNT(*)
    const query = `
      SELECT COUNT(*) as total FROM hotels 
      WHERE user_id = ? 
      AND (devise = ? OR ? IS NULL)
      AND (prix >= ? OR ? IS NULL)
      AND (prix <= ? OR ? IS NULL)
    `;
    const params = [
      filters.userId, 
      filters.devise, filters.devise,
      filters.prix_min, filters.prix_min,
      filters.prix_max, filters.prix_max
    ];
    return database.query(query, params);
  }

  static async getCount(filters = {}) {
    let sql = 'SELECT COUNT(*) as total FROM hotels WHERE 1=1';
    const params = [];

    if (filters.devise) {
      sql += ' AND devise = ?';
      params.push(filters.devise);
    }

    if (filters.prix_min) {
      sql += ' AND prix >= ?';
      params.push(filters.prix_min);
    }

    if (filters.prix_max) {
      sql += ' AND prix <= ?';
      params.push(filters.prix_max);
    }

    const [result] = await db.query(sql, params);
    return result;
  }

  static async findById(hotelId) {
    const [rows] = await db.query('SELECT * FROM hotels WHERE id = ?', [hotelId]);
    return rows[0];
  }

  static async update(hotelId, hotelData) {
    const sql = `
      UPDATE hotels 
      SET nom = ?, 
          description = ?, 
          prix = ?, 
          contactinfo = ?, 
          email = ?, 
          adresse = ?, 
          photo = ?,
          devise = ?
      WHERE id = ?
    `;
    
    const [result] = await db.query(sql, [
      hotelData.nom,
      hotelData.description,
      hotelData.prix,
      hotelData.contactinfo,
      hotelData.email,
      hotelData.adresse,
      hotelData.photo,
      hotelData.devise,
      hotelId
    ]);
    
    return result;
  }

  static async delete(hotelId) {
    const [result] = await db.query('DELETE FROM hotels WHERE id = ?', [hotelId]);
    return result;
  }

  static async search(criteres, offset = 0, limit = 10) {
    let sql = 'SELECT * FROM hotels WHERE 1=1';
    const params = [];

    if (criteres.terme_recherche) {
      sql += ` AND (
        nom LIKE ? OR 
        description LIKE ? OR 
        adresse LIKE ?
      )`;
      const terme = `%${criteres.terme_recherche}%`;
      params.push(terme, terme, terme);
    }

    if (criteres.prix_min) {
      sql += ' AND prix >= ?';
      params.push(criteres.prix_min);
    }

    if (criteres.prix_max) {
      sql += ' AND prix <= ?';
      params.push(criteres.prix_max);
    }

    if (criteres.devise) {
      sql += ' AND devise = ?';
      params.push(criteres.devise);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await db.query(sql, params);
    return rows;
  }

  static async getSearchCount(criteres) {
    let sql = 'SELECT COUNT(*) as total FROM hotels WHERE 1=1';
    const params = [];

    if (criteres.terme_recherche) {
      sql += ` AND (
        nom LIKE ? OR 
        description LIKE ? OR 
        adresse LIKE ?
      )`;
      const terme = `%${criteres.terme_recherche}%`;
      params.push(terme, terme, terme);
    }

    if (criteres.prix_min) {
      sql += ' AND prix >= ?';
      params.push(criteres.prix_min);
    }

    if (criteres.prix_max) {
      sql += ' AND prix <= ?';
      params.push(criteres.prix_max);
    }

    if (criteres.devise) {
      sql += ' AND devise = ?';
      params.push(criteres.devise);
    }

    const [result] = await db.query(sql, params);
    return result;
  }
}

module.exports = Hotel;
const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    static async findByEmail(email) {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }

    // models/userModel.js
    static async findById(id) {
        const sql = "SELECT * FROM users WHERE id = ?";
        return db.query(sql, [id]);
    }

    static async create(userData) {
        // Log pour déboguer
        console.log('Données reçues dans create:', userData);

        // Validation des données
        if (!userData.email || !userData.password || !userData.username) {
            throw new Error('Email, mot de passe et nom d\'utilisateur sont requis');
        }

        const existingUser = await this.findByEmail(userData.email);
        if (existingUser) {
            throw new Error('L\'email est déjà utilisé.');
        }

        try {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            
            // Log de la requête SQL
            console.log('Données à insérer:', {
                email: userData.email,
                password: '[HASHED]',
                username: userData.username,
                photo: userData.photo || null
            });

            const [result] = await db.query(
                'INSERT INTO users (email, password, username, photo) VALUES (?, ?, ?, ?)',
                [
                    userData.email,
                    hashedPassword,
                    userData.username,
                    userData.photo // Assurez-vous que c'est le chemin relatif
                ]
            );

            // Log du résultat
            console.log('Résultat de l\'insertion:', result);
            
            return result;
        } catch (error) {
            console.error('Erreur dans create:', error);
            throw new Error(`Erreur lors de la création de l'utilisateur: ${error.message}`);
        }
    }

    static async comparePassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }
}

module.exports = User;
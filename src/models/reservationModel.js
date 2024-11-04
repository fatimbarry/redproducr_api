const db = require('../config/database');

class Reservation {
    // Créer une nouvelle réservation
    static async create(reservationData) {
        const [result] = await db.query(
            'INSERT INTO reservations (user_id, hotel_id, check_in, check_out, guests) VALUES (?, ?, ?, ?, ?)',
            [reservationData.user_id, reservationData.hotel_id, reservationData.check_in, reservationData.check_out, reservationData.guests]
        );
        return result;
    }

    // Trouver une réservation par ID
    static async findById(reservationId) {
        const [rows] = await db.query('SELECT * FROM reservations WHERE id = ?', [reservationId]);
        return rows[0];
    }

    // Mettre à jour une réservation
    static async update(reservationId, reservationData) {
        const [result] = await db.query(
            'UPDATE reservations SET user_id = ?, hotel_id = ?, check_in = ?, check_out = ?, guests = ? WHERE id = ?',
            [reservationData.user_id, reservationData.hotel_id, reservationData.check_in, reservationData.check_out, reservationData.guests, reservationId]
        );
        return result;
    }

    // Supprimer une réservation
    static async delete(reservationId) {
        const [result] = await db.query('DELETE FROM reservations WHERE id = ?', [reservationId]);
        return result;
    }
}

module.exports = Reservation;

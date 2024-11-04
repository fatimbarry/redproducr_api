const Reservation = require('../models/reservationModel');

exports.createReservation = async (req, res) => {
    const reservationData = req.body;

    try {
        const result = await Reservation.create(reservationData);
        res.status(201).json({ message: 'Réservation créée avec succès.', reservationId: result.insertId });
    } catch (error) {
        console.error('Erreur lors de la création de la réservation:', error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

exports.getReservation = async (req, res) => {
    const { id } = req.params;

    try {
        const reservation = await Reservation.findById(id);
        if (!reservation) {
            return res.status(404).json({ message: 'Réservation non trouvée.' });
        }
        res.status(200).json(reservation);
    } catch (error) {
        console.error('Erreur lors de la récupération de la réservation:', error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

exports.updateReservation = async (req, res) => {
    const { id } = req.params;
    const reservationData = req.body;

    try {
        const result = await Reservation.update(id, reservationData);
        res.status(200).json({ message: 'Réservation mise à jour avec succès.' });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la réservation:', error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

exports.deleteReservation = async (req, res) => {
    const { id } = req.params;

    try {
        await Reservation.delete(id);
        res.status(200).json({ message: 'Réservation supprimée avec succès.' });
    } catch (error) {
        console.error('Erreur lors de la suppression de la réservation:', error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

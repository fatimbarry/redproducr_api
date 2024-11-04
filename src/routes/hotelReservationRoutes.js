const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/HotelController');
const reservationController = require('../controllers/ReservationController');
const upload = require('../middleware/upload');
const { authenticateToken } = require('../middleware/auth');
const { handleMulterError } = require('../middleware/multerErrorHandler');

// Routes pour les hôtels
router.get('/hotels', authenticateToken, hotelController.getHotels);  // Route pour obtenir tous les hôtels
router.get('/hotels/:id', authenticateToken, hotelController.getHotel); // Route pour un hôtel spécifique


// Route pour créer un hôtel (avec upload de photo)
router.post('/hotels', 
    authenticateToken, 
    upload.single('photo'), 
    handleMulterError, 
    hotelController.createHotel
);

router.put('/hotels/:id', authenticateToken, hotelController.updateHotel);
router.delete('/hotels/:id', authenticateToken, hotelController.deleteHotel);

// Routes pour les réservations
router.post('/reservations', authenticateToken, reservationController.createReservation);
router.get('/reservations/:id', authenticateToken, reservationController.getReservation);
router.put('/reservations/:id', authenticateToken, reservationController.updateReservation);
router.delete('/reservations/:id', authenticateToken, reservationController.deleteReservation);

module.exports = router;
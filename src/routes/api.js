const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { validateUser } = require('../middleware/validate');
const UserController = require('../controllers/userController');


const upload = multer({ storage: storage });

// Routes pour les hôtels
router.post('/hotels', upload.single('photo'), hotelController.createHotel);
router.get('/hotels', hotelController.getAllHotels);  // Cette route doit être après les routes spécifiques
router.get('/hotels/:id', hotelController.getHotel);
router.put('/hotels/:id', upload.single('photo'), hotelController.updateHotel);
router.delete('/hotels/:id', hotelController.deleteHotel);

router.post('/register', validateUser, UserController.register);
router.post('/login', UserController.login);
router.get('/profile', authenticateToken, UserController.profile);

module.exports = router;

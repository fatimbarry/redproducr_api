const express = require('express');
const app = express();
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const hotelReservationRoutes = require('./routes/hotelReservationRoutes');



// Configuration de base - METTRE CES LIGNES EN PREMIER

const corsOptions = {
    origin: 'http://localhost:3000', // URL de votre frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors(corsOptions));

app.use(express.json())



app.use('/api', hotelReservationRoutes);


// Configuration de multer pour gérer les uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Définir différents dossiers selon le type de fichier
        let uploadPath = 'uploads/';
        if (file.fieldname === 'hotelPhotos') {
            uploadPath += 'hotels/';
        } else if (file.fieldname === 'photo') {
            uploadPath += 'users/';
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Générer un nom de fichier unique
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Configuration des filtres pour les fichiers
const fileFilter = (req, file, cb) => {
    // Accepter uniquement les images
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Le fichier doit être une image.'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // Limite à 5MB
    }
});



// Middleware pour gérer les erreurs multer
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            status: 'error',
            message: "Erreur lors de l'upload du fichier: " + err.message
        });
    } else if (err) {
        return res.status(400).json({
            status: 'error',
            message: err.message
        });
    }
    next();
};

// Middleware de logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    if (req.file || req.files) {
        console.log('Fichiers reçus:', req.file || req.files);
    }
    next();
});

// Configuration du dossier statique pour accéder aux fichiers uploadés
app.use('/uploads', express.static('uploads'));

// Routes avec gestion des uploads
app.use('/api', (req, res, next) => {
    // Ajouter le middleware upload.single ou upload.array selon le endpoint
    if (req.path === '/register' && req.method === 'POST') {
        upload.single('photo')(req, res, (err) => {
            handleMulterError(err, req, res, next);
        });
    } else if (req.path.includes('/hotels') && req.method === 'POST') {
        upload.array('hotelPhotos', 5)(req, res, (err) => {
            handleMulterError(err, req, res, next);
        });
    } else {
        next();
    }
}, authRoutes, hotelReservationRoutes);

// Gestion des erreurs globale
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        status: 'error',
        message: 'Une erreur est survenue!',
        error: err.message
    });
});

// Démarrage du serveur
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Serveur démarré sur le port ${port}`);
    console.log('Routes disponibles :');
    console.log('POST /api/register (supporte form-data avec photo)');
    console.log('POST /api/login');
    console.log('POST /api/logout');
    console.log('GET /api/me');
    console.log('POST /api/hotels (supporte form-data avec photos multiples)');
    console.log('GET /api/hotels');
});

module.exports = app;
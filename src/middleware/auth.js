const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/config');

const authenticateToken = (req, res, next) => {
    console.log('Headers reçus:', req.headers);
    
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    console.log('Token extrait:', token);

    if (!token) {
        return res.status(401).json({ message: 'Token manquant' });
    }

    jwt.verify(token, jwtSecret, (err, decoded) => {
        if (err) {
            console.error('Erreur de vérification du token:', err);
            return res.status(403).json({ message: 'Token invalide' });
        }
        
        console.log('Données décodées:', decoded);
        
        // Modifier cette partie pour stocker un objet user avec la propriété id
        req.user = {
            id: decoded.id, // ou decoded.userId selon votre structure
            username: decoded.username,
            email: decoded.email
        };
        
        console.log('req.user défini:', req.user);
        
        next();
    });
};

module.exports = { authenticateToken };
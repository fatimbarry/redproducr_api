const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require('../config/database');
const pool = require('../config/database');
const { sendRegistrationEmail } = require("../services/emailService");
const path = require('path');
const { jwtSecret } = require('../config/config');


exports.register = async (req, res) => {
    try {
        console.log('Fichier reçu:', req.file); // Pour le débogage
        console.log('Données du formulaire:', req.body);

        const { email, password, username } = req.body;
        
        // Construire le chemin de la photo pour la base de données
        let photoPath = null;
        if (req.file) {
            // Utilisez le chemin relatif pour la base de données
            photoPath = '/uploads/users/' + req.file.filename;
        }

        // Vérification des champs requis
        if (!email || !password || !username) {
            return res.status(400).json({
                status: 'error',
                message: "Veuillez fournir un email, un mot de passe et un nom d'utilisateur",
                receivedData: {
                    email: !!email,
                    password: !!password,
                    username: !!username,
                    photo: !!photoPath
                }
            });
        }

        // Création de l'utilisateur avec le chemin de la photo
        const result = await User.create({
            email,
            password,
            username,
            photo: photoPath // Utilisez le chemin relatif
        });

        // Envoi de l'email
        try {
            await sendRegistrationEmail(email, { username, email });
        } catch (emailError) {
            console.error("Erreur lors de l'envoi de l'email:", emailError);
        }

        res.status(201).json({
            status: 'success',
            message: "Utilisateur enregistré avec succès.",
            userId: result.insertId,
            photoPath: photoPath // Retournez le chemin pour vérification
        });

    } catch (error) {
        console.error("Erreur lors de l'inscription:", error);
        res.status(400).json({
            status: 'error',
            message: error.message,
            receivedData: {
                body: req.body,
                file: req.file
            }
        });
    }
};
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Veuillez fournir un email et un mot de passe"
            });
        }

        // Ajoutons quelques logs pour debug
        console.log('Tentative de connexion pour:', email);

        // Recherche de l'utilisateur
        const user = await User.findByEmail(email);
        console.log('Utilisateur trouvé:', user ? 'Oui' : 'Non');

        if (!user) {
            return res.status(400).json({
                message: "Email ou mot de passe incorrect."
            });
        }

        // Vérification du mot de passe
        const isMatch = await User.comparePassword(password, user.password);
        console.log('Mot de passe correct:', isMatch ? 'Oui' : 'Non');

        if (!isMatch) {
            return res.status(400).json({
                message: "Email ou mot de passe incorrect."
            });
        }

        // Vérification du secret JWT
        console.log('JWT Secret disponible:', !!jwtSecret);

        // Création du token
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                email: user.email
            },
            jwtSecret,
            { expiresIn: '24h' }
        );

        // Log du token pour debug (à retirer en production)
        console.log('Token généré avec succès');

        res.status(200).json({
            status: 'success',
            message: "Connexion réussie",
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username
            }
        });

    } catch (error) {
        console.error("Erreur détaillée lors de la connexion:", error);
        res.status(500).json({
            status: 'error',
            message: "Erreur serveur."
        });
    }
};
exports.logout = (req, res) => {
    res.status(200).json({
        status: 'success',
        message: "Déconnexion réussie."
    });
};
exports.getConnectedUser = async (req, res) => {
    try {
      // req.user est un objet, il faut utiliser req.user.id
      const userId = req.user.id;
      
      const [user] = await pool.execute(
        'SELECT id, username, email, created_at FROM users WHERE id = ?',
        [userId] // Passez uniquement l'ID, pas l'objet complet
      );
  
      if (!user || user.length === 0) {
        return res.status(404).json({ msg: "Utilisateur non trouvé" });
      }
  
      res.json(user[0]);
    } catch (error) {
      console.error('Erreur détaillée:', error);
      res.status(500).json({ msg: "Server Error" });
    }
  };


// exports.handler = async  (req, res) => {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ message: 'Method not allowed' });
//   }

//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({ message: 'Email is required' });
//     }

//     // Vérifier si l'email existe dans votre base de données
//     // const user = await prisma.user.findUnique({ where: { email } });
//     // if (!user) {
//     //   return res.status(404).json({ message: 'User not found' });
//     // }

//     // Envoyer l'email de réinitialisation
//     const emailSent = await EmailService.sendPasswordResetEmail(email);

//     if (!emailSent) {
//       return res.status(500).json({ 
//         message: 'Failed to send reset password email' 
//       });
//     }

//     return res.status(200).json({ 
//       message: 'Reset password instructions sent successfully' 
//     });

//   } catch (error) {
//     console.error('Password reset error:', error);
//     return res.status(500).json({ 
//       message: 'An error occurred while processing your request' 
//     });
//   }
// };
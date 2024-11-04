const Hotel = require('../models/hotelModel');
const pool = require('../config/database');


exports.createHotel = async (req, res) => {
  try {
      // Log des données reçues
      console.log('Données reçues:', {
          body: req.body,
          file: req.file,
          user: req.user // Vérifiez que req.user est disponible
      });

      // Vérification de l'authentification
      if (!req.user || !req.user.id) {
          return res.status(401).json({
              status: "error",
              message: "Utilisateur non authentifié"
          });
      }

      // Validation de la devise
      const devises_valides = ['F XOF', 'Euro', 'Dollar'];
      if (!devises_valides.includes(req.body.devise)) {
          return res.status(400).json({
              status: "error",
              message: `Devise non valide. Reçu: ${req.body.devise}. Valeurs acceptées: ${devises_valides.join(', ')}`
          });
      }

      const hotelData = {
          nom: req.body.nom,
          description: req.body.description || '',
          prix: req.body.prix,
          contactinfo: req.body.contactinfo,
          email: req.body.email,
          adresse: req.body.adresse,
          photo: req.file ? req.file.filename : null,
          devise: req.body.devise,
          userId: req.user.id  // Ajout de l'ID de l'utilisateur connecté
      };

      // Log des données traitées
      console.log('Données à sauvegarder:', hotelData);

      // Validation des champs requis
      const champsRequis = ['nom', 'prix', 'contactinfo', 'email', 'adresse', 'devise', 'userId'];
      for (const champ of champsRequis) {
          if (!hotelData[champ]) {
              return res.status(400).json({
                  status: "error",
                  message: `Le champ ${champ} est requis. Valeur reçue: ${hotelData[champ]}`
              });
          }
      }

      const result = await Hotel.create(hotelData);
      
      res.status(201).json({
          status: "success",
          message: 'Hôtel créé avec succès.',
          data: {
              hotelId: result.insertId,
              ...hotelData
          }
      });
  } catch (error) {
      console.error('Erreur détaillée lors de la création de l\'hôtel:', error);
      res.status(500).json({
          status: "error",
          message: error.message || 'Erreur serveur.',
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
  }
};


// controllers/hotelController.js
exports.getHotels = async (req, res) => {
  try {
      // Debug logs
      console.log("1. Entrée dans getHotels");
      console.log("2. User from request:", req.user);

      if (!req.user || !req.user.id) {
          console.log("3. Utilisateur non authentifié");
          return res.status(401).json({
              status: 'error',
              message: 'Utilisateur non authentifié'
          });
      }

      // Requête à la base de données
      const query = `
          SELECT * FROM hotels 
          WHERE user_id = ?
          ORDER BY created_at DESC
      `;

      console.log("4. Exécution de la requête SQL:", query);
      console.log("5. User ID:", req.user.id);

      const [hotels] = await pool.execute(query, [req.user.id]);

      console.log("6. Résultat de la requête:", hotels);

      // Vérification du résultat
      if (!hotels) {
          console.log("7. Aucun hôtel trouvé");
          return res.json({
              status: 'success',
              message: 'Aucun hôtel trouvé',
              data: [],
              metadata: {
                  total: 0,
                  offset: 0,
                  limit: 10
              }
          });
      }

      console.log("8. Préparation de la réponse");
      
      const response = {
          status: 'success',
          message: 'Liste des hôtels récupérée avec succès',
          data: hotels,
          metadata: {
              total: hotels.length,
              offset: 0,
              limit: 10
          }
      };

      console.log("9. Réponse préparée:", JSON.stringify(response, null, 2));

      // Envoi de la réponse
      return res.status(200).json(response);

  } catch (error) {
      console.error("ERROR in getHotels:", error);
      return res.status(500).json({
          status: 'error',
          message: error.message || 'Erreur lors de la récupération des hôtels'
      });
  }
};

// Obtenir un hôtel par ID
exports.getHotel = async (req, res) => {
  const { id } = req.params;
  try {
    const hotel = await Hotel.findById(id);
    if (!hotel) {
      return res.status(404).json({
        status: "error",
        message: 'Hôtel non trouvé.'
      });
    }
    res.status(200).json({
      status: "success",
      data: hotel
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'hôtel:', error);
    res.status(500).json({
      status: "error",
      message: error.message || 'Erreur serveur.'
    });
  }
};

// Mettre à jour un hôtel
exports.updateHotel = async (req, res) => {
  const { id } = req.params;
  try {
    // Vérifier si l'hôtel existe
    const existingHotel = await Hotel.findById(id);
    if (!existingHotel) {
      return res.status(404).json({
        status: "error",
        message: 'Hôtel non trouvé.'
      });
    }

    // Validation de la devise si elle est fournie
    if (req.body.devise) {
      const devises_valides = ['EURO', 'DOLLAR', 'FCFA'];
      if (!devises_valides.includes(req.body.devise)) {
        return res.status(400).json({
          status: "error",
          message: "Devise non valide. Utilisez EURO, DOLLAR ou FCFA"
        });
      }
    }

    // Préparer les données de mise à jour
    const hotelData = {
      nom: req.body.nom || existingHotel.nom,
      description: req.body.description || existingHotel.description,
      prix: req.body.prix || existingHotel.prix,
      contactinfo: req.body.contactinfo || existingHotel.contactinfo,
      email: req.body.email || existingHotel.email,
      adresse: req.body.adresse || existingHotel.adresse,
      photo: req.file ? req.file.filename : existingHotel.photo,
      devise: req.body.devise || existingHotel.devise
    };

    const result = await Hotel.update(id, hotelData);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: "error",
        message: 'Mise à jour impossible. Hôtel non trouvé.'
      });
    }

    res.status(200).json({
      status: "success",
      message: 'Hôtel mis à jour avec succès.',
      data: hotelData
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'hôtel:', error);
    res.status(500).json({
      status: "error",
      message: error.message || 'Erreur serveur.'
    });
  }
};

// Supprimer un hôtel
exports.deleteHotel = async (req, res) => {
  const { id } = req.params;
  try {
    // Vérifier si l'hôtel existe
    const hotel = await Hotel.findById(id);
    if (!hotel) {
      return res.status(404).json({
        status: "error",
        message: 'Hôtel non trouvé.'
      });
    }

    const result = await Hotel.delete(id);
    
    // Si la photo existe, la supprimer du système de fichiers
    if (hotel.photo) {
      const fs = require('fs').promises;
      const path = require('path');
      try {
        await fs.unlink(path.join(__dirname, '../uploads', hotel.photo));
      } catch (err) {
        console.error('Erreur lors de la suppression de la photo:', err);
        // Continuer même si la suppression de la photo échoue
      }
    }

    res.status(200).json({
      status: "success",
      message: 'Hôtel supprimé avec succès.'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'hôtel:', error);
    res.status(500).json({
      status: "error",
      message: error.message || 'Erreur serveur.'
    });
  }
};

// Rechercher des hôtels
exports.searchHotels = async (req, res) => {
  try {
    const {
      terme_recherche,
      prix_min,
      prix_max,
      devise,
      page = 1,
      limit = 10
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const criteres_recherche = {
      terme_recherche,
      prix_min: prix_min ? parseFloat(prix_min) : null,
      prix_max: prix_max ? parseFloat(prix_max) : null,
      devise
    };

    const [hotels, [countResult]] = await Promise.all([
      Hotel.search(criteres_recherche, offset, parseInt(limit)),
      Hotel.getSearchCount(criteres_recherche)
    ]);

    const totalHotels = countResult.total;
    const totalPages = Math.ceil(totalHotels / parseInt(limit));

    res.status(200).json({
      status: "success",
      data: {
        hotels,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_items: totalHotels,
          items_per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la recherche des hôtels:', error);
    res.status(500).json({
      status: "error",
      message: error.message || 'Erreur serveur.'
    });
  }
};
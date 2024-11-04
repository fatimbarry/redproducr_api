const multer = require('multer');

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Gérer les erreurs spécifiques à Multer
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({ 
          message: 'Le fichier est trop volumineux. La taille maximale est de 5 Mo.' 
        });
      
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({ 
          message: 'Trop de fichiers. Limite maximale : 1 fichier.' 
        });
      
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({ 
          message: 'Type de fichier non attendu.' 
        });
      
      default:
        return res.status(500).json({ 
          message: 'Erreur lors de l\'upload du fichier.',
          error: err.message 
        });
    }
  }
  
  // Si ce n'est pas une erreur Multer, passer à l'erreur suivante
  next(err);
};

module.exports = { handleMulterError };
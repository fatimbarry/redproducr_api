const nodemailer = require('nodemailer');

// Créer un transporteur d'emails
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true pour le port 465, false pour d'autres ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
});

// Fonction pour envoyer l'email d'inscription
exports.sendRegistrationEmail = async (toEmail, userDetails) => {
    const { username, email, password } = userDetails;
    
    const mailOptions = {
        from: process.env.SMTP_USER,
        to: toEmail,
        subject: 'Bienvenue ! Vos identifiants de connexion',
        text: `Bonjour ${username},\nVotre compte a été créé avec succès.\n\nVoici vos identifiants :\nEmail: ${email}\nMot de passe: ${password}\nMerci de vous connecter via notre plateforme.\nCordialement,\nL'équipe.`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email envoyé avec succès à', toEmail);
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email:', error);
        throw new Error('Impossible d\'envoyer l\'email.');
    }
};

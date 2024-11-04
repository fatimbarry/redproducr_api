// services/emailService.ts
import sgMail from '@sendgrid/mail';
import jwt from 'jsonwebtoken';

// Initialiser SendGrid avec votre clé API
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

// Type pour les options d'email
interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Type pour le token de réinitialisation
interface ResetTokenPayload {
  email: string;
  exp: number;
}

export class EmailService {
  private static readonly TOKEN_EXPIRY = 3600; // 1 heure en secondes

  /**
   * Génère un token JWT pour la réinitialisation du mot de passe
   */
  static generateResetToken(email: string): string {
    const payload: ResetTokenPayload = {
      email,
      exp: Math.floor(Date.now() / 1000) + this.TOKEN_EXPIRY,
    };

    return jwt.sign(payload, process.env.JWT_SECRET!);
  }

  /**
   * Vérifie la validité d'un token de réinitialisation
   */
  static verifyResetToken(token: string): string | null {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as ResetTokenPayload;
      return decoded.email;
    } catch (error) {
      return null;
    }
  }

  /**
   * Envoie un email en utilisant SendGrid
   */
  static async sendEmail({ to, subject, html }: SendEmailOptions): Promise<boolean> {
    try {
      await sgMail.send({
        to,
        from: 'votre-email@domaine.com', // Email vérifié dans SendGrid
        subject,
        html,
      });
      return true;
    } catch (error) {
      console.error('SendGrid error:', error);
      return false;
    }
  }

  /**
   * Envoie l'email de réinitialisation de mot de passe
   */
  static async sendPasswordResetEmail(email: string): Promise<boolean> {
    const resetToken = this.generateResetToken(email);
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${resetToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: center;">Réinitialisation de votre mot de passe</h2>
        
        <p style="color: #666; font-size: 16px; line-height: 1.5;">
          Bonjour,
        </p>
        
        <p style="color: #666; font-size: 16px; line-height: 1.5;">
          Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le lien ci-dessous
          pour choisir un nouveau mot de passe :
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}"
             style="background-color: #4a4a4a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Réinitialiser mon mot de passe
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px; line-height: 1.5;">
          Ce lien expirera dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, 
          vous pouvez ignorer cet email.
        </p>
        
        <p style="color: #666; font-size: 14px; line-height: 1.5;">
          Pour des raisons de sécurité, ne transmettez jamais ce lien à qui que ce soit.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          Cet email a été envoyé automatiquement, merci de ne pas y répondre.
        </p>
      </div>
    `;

    return await this.sendEmail({
      to: email,
      subject: 'Réinitialisation de votre mot de passe',
      html,
    });
  }
}
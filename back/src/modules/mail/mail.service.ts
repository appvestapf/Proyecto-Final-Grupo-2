import { Injectable, Logger } from '@nestjs/common';
import sgMail from '@sendgrid/mail';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY ?? '');
  }

  async sendWelcomeEmail(to: string, name: string) {
    try {
      await sgMail.send({
        to,
        from: {
          email: process.env.MAIL_FROM_EMAIL ?? 'appvestapf@gmail.com',
          name: process.env.MAIL_FROM_NAME ?? 'Vesta',
        },
        subject: '¡Bienvenido/a a Vesta!',
        html: this.buildWelcomeTemplate(name),
      });
    } catch (error) {
      // Si falla el envío del correo, no debe romper el registro del usuario.
      this.logger.error(`No se pudo enviar el mail de bienvenida a ${to}`, error);
    }
  }

  private buildWelcomeTemplate(name: string) {
    return `
      <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
        <div style="background-color: #2563eb; padding: 20px 24px;">
          <span style="color: #ffffff; font-size: 15px; font-weight: bold; letter-spacing: 0.5px;">
            VESTA
          </span>
        </div>
        <div style="background-color: #ffffff; padding: 32px 24px;">
          <h1 style="color: #1e293b; font-size: 20px; margin: 0 0 12px;">Bienvenido/a, ${name}</h1>
          <p style="color: #475569; font-size: 15px; line-height: 1.5; margin: 0 0 28px;">
            Tu cuenta se creó con éxito. Ya podés iniciar sesión y empezar a explorar propiedades disponibles.
          </p>
          <div style="text-align: center; margin-bottom: 28px;">
            <span style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 32px; border-radius: 8px; font-size: 14px; font-weight: bold;">
              Iniciar sesión
            </span>
          </div>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 12px; margin: 0 0 4px;">
            Si no creaste esta cuenta, podés ignorar este mensaje.
          </p>
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">— Equipo Vesta</p>
        </div>
      </div>
    `;
  }
}

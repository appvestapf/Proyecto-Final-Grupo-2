import { Injectable, Logger } from '@nestjs/common';
import sgMail from '@sendgrid/mail';

type PropertySummary = {
  name: string;
  city: string;
  country: string;
  price: number;
  priceUnit: string;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private static readonly LOGO_URL =
    'https://res.cloudinary.com/uw8tqkyg/image/upload/v1790215567/vesta-assets/vesta-logo.png';

  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY ?? '');
  }

  async sendWelcomeEmail(to: string, name: string) {
    await this.send(
      to,
      '¡Bienvenido/a a Vesta!',
      this.buildEmailTemplate({
        title: `Bienvenido/a, ${name}`,
        message:
          'Tu cuenta se creó con éxito. Ya podés iniciar sesión y empezar a explorar propiedades disponibles.',
        buttonText: 'Iniciar sesión',
        buttonPath: '/auth/login',
      }),
    );
  }

  async sendAppointmentConfirmation(
    to: string,
    name: string,
    propertyName: string,
    date: Date,
  ) {
    const formattedDate = date.toLocaleString('es-AR', {
      dateStyle: 'long',
      timeStyle: 'short',
    });
    await this.send(
      to,
      'Cita agendada - Vesta',
      this.buildEmailTemplate({
        title: `Hola, ${name}`,
        message: `Tu cita para visitar "${propertyName}" quedó agendada para el ${formattedDate}.`,
        buttonText: 'Ver mis citas',
        buttonPath: '/mis-alquileres',
      }),
    );
  }

  async sendNewAppointmentToOwner(
    to: string,
    ownerName: string,
    visitorName: string,
    propertyName: string,
    date: Date,
  ) {
    const formattedDate = date.toLocaleString('es-AR', {
      dateStyle: 'long',
      timeStyle: 'short',
    });
    await this.send(
      to,
      'Nueva visita agendada - Vesta',
      this.buildEmailTemplate({
        title: `Hola, ${ownerName}`,
        message: `${visitorName} agendó una visita a "${propertyName}" para el ${formattedDate}. Ingresá para confirmarla.`,
        buttonText: 'Ver mis citas',
        buttonPath: '/mis-alquileres',
      }),
    );
  }

  async sendAppointmentRescheduled(
    to: string,
    name: string,
    propertyName: string,
    date: Date,
  ) {
    const formattedDate = date.toLocaleString('es-AR', {
      dateStyle: 'long',
      timeStyle: 'short',
    });
    await this.send(
      to,
      'Cita reprogramada - Vesta',
      this.buildEmailTemplate({
        title: `Hola, ${name}`,
        message: `Tu cita para visitar "${propertyName}" se reprogramó para el ${formattedDate}.`,
        buttonText: 'Ver mis citas',
        buttonPath: '/mis-alquileres',
      }),
    );
  }

  async sendReservationConfirmation(
    to: string,
    name: string,
    property: PropertySummary,
  ) {
    await this.send(
      to,
      'Reserva confirmada - Vesta',
      this.buildEmailTemplate({
        title: `Hola, ${name}`,
        message: 'Tu reserva quedó registrada. Cuando completes el pago, la vamos a confirmar.',
        detailsHtml: this.buildPropertyDetailsBlock(property),
        buttonText: 'Ver mis reservas',
        buttonPath: '/mis-alquileres',
      }),
    );
  }

  async sendPaymentConfirmation(
    to: string,
    name: string,
    property: PropertySummary,
    amount: number,
  ) {
    await this.send(
      to,
      'Pago confirmado - Vesta',
      this.buildEmailTemplate({
        title: `Hola, ${name}`,
        message: `Recibimos tu pago de $${amount.toFixed(2)}. Tu reserva ya está confirmada.`,
        detailsHtml: this.buildPropertyDetailsBlock(property),
        buttonText: 'Ver mis reservas',
        buttonPath: '/mis-alquileres',
      }),
    );
  }

  private async send(to: string, subject: string, html: string) {
    try {
      await sgMail.send({
        to,
        from: {
          email: process.env.MAIL_FROM_EMAIL ?? 'appvestapf@gmail.com',
          name: process.env.MAIL_FROM_NAME ?? 'Vesta',
        },
        subject,
        html,
      });
    } catch (error) {
      // Si falla el envío del correo, no debe romper la operación que lo disparó.
      this.logger.error(`No se pudo enviar el mail a ${to}`, error);
    }
  }

  private buildPropertyDetailsBlock(property: PropertySummary) {
    return `
      <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <p style="margin: 0 0 4px; font-size: 15px; font-weight: bold; color: #1e293b;">${property.name}</p>
        <p style="margin: 0 0 4px; font-size: 13px; color: #64748b;">${property.city}, ${property.country}</p>
        <p style="margin: 0; font-size: 13px; color: #64748b;">$${Number(property.price).toFixed(2)} / ${property.priceUnit}</p>
      </div>
    `;
  }

  private buildEmailTemplate(params: {
    title: string;
    message: string;
    buttonText: string;
    buttonPath: string;
    detailsHtml?: string;
  }) {
    const { title, message, buttonText, buttonPath, detailsHtml } = params;
    const frontendUrl = process.env.FRONTEND_URL;

    const header = `<div style="background-color: #ffffff; padding: 20px 24px; text-align: center; border-bottom: 1px solid #e2e8f0;">
        <img src="${MailService.LOGO_URL}" alt="Vesta" height="48" style="display: inline-block;" />
      </div>`;

    const button = frontendUrl
      ? `<div style="text-align: center; margin-bottom: 28px;">
          <a href="${frontendUrl}${buttonPath}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 32px; border-radius: 8px; font-size: 14px; font-weight: bold; text-decoration: none;">
            ${buttonText}
          </a>
        </div>`
      : '';

    return `
      <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
        ${header}
        <div style="background-color: #ffffff; padding: 32px 24px;">
          <h1 style="color: #1e293b; font-size: 20px; margin: 0 0 12px;">${title}</h1>
          <p style="color: #475569; font-size: 15px; line-height: 1.5; margin: 0 0 20px;">
            ${message}
          </p>
          ${detailsHtml ?? ''}
          ${button}
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 12px; margin: 0 0 4px;">
            Si no reconoces esta actividad, contáctanos.
          </p>
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">— Equipo Vesta</p>
        </div>
      </div>
    `;
  }
}

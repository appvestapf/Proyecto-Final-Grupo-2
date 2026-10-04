import React from 'react';

export const metadata = {
  title: 'Política de Privacidad | Plataforma Inmobiliaria',
  description: 'Conozca cómo recopilamos, utilizamos y protegemos sus datos personales en Latinoamérica.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <article className="max-w-3xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        
        <header className="border-b border-slate-200 dark:border-slate-700 pb-6 mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Política de Privacidad
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Última actualización: 4 de octubre de 2026
          </p>
        </header>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            En nuestra Plataforma nos tomamos muy en serio la protección de sus datos personales. Esta Política de Privacidad describe cómo recopilamos, utilizamos, almacenamos y compartimos su información cuando utiliza nuestros servicios inmobiliarios a nivel regional en Latinoamérica.
          </p>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              1. Información que Recopilamos
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Datos de Registro y Perfil:</strong> Nombre completo, dirección de correo electrónico, contraseña (encriptada mediante tokens de sesión) e información de contacto proporcionada al crear una cuenta nativa o mediante autenticación externa  .
              </li>
              <li>
                <strong>Datos de Geolocalización:</strong> Con su consentimiento previo, utilizamos herramientas integradas (Google Maps) para detectar su ubicación geográfica aproximada con el fin de mostrarle las propiedades disponibles más cercanas a usted.
              </li>
              <li>
                <strong>Datos de Actividad y Uso:</strong> Propiedades guardadas en su lista de favoritos, historial de visitas agendadas, estados de pagos de señas e interacciones con nuestro ChatBot automatizado y chats internos en tiempo real.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              2. Uso de la Información
            </h2>
            <p>Utilizamos la información recopilada para los siguientes propósitos esenciales:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Facilitar la búsqueda, comparación y reserva de propiedades dentro del catálogo.</li>
              <li>Gestionar y automatizar el agendamiento, seguimiento o cancelación de visitas entre inquilinos e inmobiliarias.</li>
              <li>Enviar notificaciones transaccionales automáticas por correo electrónico (ej. confirmación de registro, estado de señas aprobado/rechazado y recordatorios de citas) a través de Nodemailer.</li>
              <li>Enviar de manera periódica boletines o correos electronicos informativos al igual que Newsletters diarios si el usuario se encuentra suscrito a este servicio.</li>
              <li>Permitir la comunicación fluida y en tiempo real a través de los sistemas de chat basados en sockets.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              3. Almacenamiento y Proveedores de Servicios (Terceros)
            </h2>
            <p>
              Para garantizar el correcto funcionamiento técnico, la seguridad y escalabilidad de la plataforma, nos apoyamos en infraestructuras tecnológicas externas confiables:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Almacenamiento multimedia:</strong> Las imágenes de perfil de los usuarios y las fotografías del catálogo de propiedades se almacenan de forma segura en los servidores de Cloudinary.
              </li>
              <li>
                <strong>Infraestructura de Servidores:</strong> La base de datos, lógica de negocio y contenedores de la aplicación se ejecutan en entornos aislados desplegados mediante Docker y plataformas de hosting en la nube (Render).
              </li>
              <li>
                <strong>Pasarelas de Pago:</strong> Los datos financieros sensibles se procesan directamente por proveedores de pago externos seguros. Nuestra plataforma nunca almacena números de tarjetas de crédito o credenciales bancarias en sus servidores.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              4. Transferencia Internacional de Datos
            </h2>
            <p>
              Dado que operamos un catálogo unificado para múltiples países de Latinoamérica, sus datos de contacto esenciales (nombre y correo) se compartirán estrictamente con la inmobiliaria o el administrador responsable de la propiedad por la que usted solicite una visita o realice una seña, independientemente del país donde esté ubicada dicha entidad corporativa.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              5. Derechos del Usuario (Acceso, Rectificación y Supresión)
            </h2>
            <p>
              Usted tiene derecho en todo momento a acceder a sus datos personales guardados en su panel de &quot;Perfil&quot;, corregir información inexacta o desactualizada, o solicitar la eliminación total de su cuenta y registros históricos escribiendo a nuestro soporte técnico o administrador desde la plataforma.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              6. Seguridad de los Datos
            </h2>
            <p>
              Implementamos medidas técnicas avanzadas (como cifrado de contraseñas, detección de contenido inadecuado, firewalls de red y tokens con tiempo de expiración limitado a 3 horas) para mitigar el riesgo de accesos no autorizados o fugas de información. Sin embargo, recuerde que ningún método de transmisión por Internet o almacenamiento digital es 100% seguro.
            </p>
          </section>
        </div>

      </article>
    </main>
  );
}

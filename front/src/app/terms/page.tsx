import React from 'react';

export const metadata = {
  title: 'Términos de Servicio | Plataforma Inmobiliaria',
  description: 'Términos y condiciones de uso de la plataforma de alquileres en Latinoamérica.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <article className="max-w-3xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        
        <header className="border-b border-slate-200 dark:border-slate-700 pb-6 mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Términos de Servicio
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Última actualización: 4 de octubre de 2026
          </p>
        </header>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            Bienvenido a nuestra plataforma de soluciones inmobiliarias en Latinoamérica (en adelante, la <strong>&quot;Vesta&quot;</strong>). Al acceder, registrarse o utilizar nuestro sitio web, usted acepta cumplir y estar sujeto a los siguientes Términos de Servicio. Si no está de acuerdo con alguna parte de estos términos, no deberá utilizar nuestros servicios.
          </p>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              1. Descripción del Servicio
            </h2>
            <p>
              La Plataforma es un espacio digital que centraliza y simplifica la búsqueda y alquiler de propiedades (tanto temporales como permanentes) en diversos países de Latinoamérica. Actuamos como un canal de contacto directo entre potenciales inquilinos y empresas inmobiliarias o propietarios de inmuebles.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              2. Registro de Cuenta y Seguridad
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Para acceder a funcionalidades específicas como guardar favoritos, agendar visitas físicas o realizar señas económicas de propiedades, el usuario debe registrarse mediante nuestro sistema nativo o proveedores externos de autenticación.</li>
              <li>La sesión tendrá una duración de persistencia estimada de 3 horas por motivos de seguridad.</li>
              <li>Usted es responsable de mantener la confidencialidad de sus credenciales y de todas las actividades que ocurran bajo su cuenta.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              3. Reservas, Visitas y Señas Online
            </h2>
            <p>
              <strong>Agendamiento de Citas:</strong> Los usuarios registrados pueden solicitar días y horarios específicos para visitar inmuebles según la disponibilidad del calendario. La confirmación de la cita se enviará de forma automática vía correo electrónico.
            </p>
            <p>
              <strong>Señas en Línea:</strong> La Plataforma permite realizar pagos o reservar un inmueble a través de pasarelas de pago externas integradas. El usuario podrá realizar estos pagos a través de billeteras virtuales, tarjetas o transferencia según la disponibilidad de la pasarela.
            </p>
            <p>
              La Plataforma no custodia ni procesa directamente los fondos bancarios en sus servidores, delegando dicha tarea a procesadores de pago autorizados. Las políticas de devolución o cancelación de señas están sujetas a las condiciones particulares de la inmobiliaria que publica la propiedad y a la legislación local de cada país.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              4. Exclusión de Responsabilidad (Intermediación)
            </h2>
            <p>
              La Plataforma es una herramienta de conexión y optimización tecnológica. No es propietaria, administradora, ni constructora de los inmuebles listados en el catálogo.
            </p>
            <p>
              La veracidad de las descripciones, fotografías, precios, mapas de ubicación y amenities es responsabilidad exclusiva de la inmobiliaria o administrador que publica el anuncio a través del dashboard de control. La Plataforma no se hace responsable por vicios ocultos, daños estructurales, incumplimientos contractuales de alquiler o discrepancias financieras entre el inquilino y la inmobiliaria.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              5. Uso Aceptable de la Plataforma
            </h2>
            <p>Queda estrictamente prohibido:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Utilizar identidades falsas o proporcionar información financiera fraudulenta al realizar una reserva.</li>
              <li>Extraer masivamente información o imágenes de nuestro catálogo mediante técnicas de scraping no autorizadas.</li>
              <li>Intentar vulnerar las medidas de seguridad del servicio, servidores o archivos almacenados en la nube.</li>
              <li>Publicar o transmitir contenido inadecuado, falso o malintencionado en las secciones de comunicación o perfiles.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              6. Modificaciones de los Términos
            </h2>
            <p>
              Nos reservamos el derecho de modificar estos Términos de Servicio en cualquier momento para adaptarlos a nuevas regulaciones comerciales o actualizaciones técnicas. El uso continuado de la plataforma tras la publicación de los cambios constituirá la aceptación de los nuevos términos.
            </p>
          </section>
        </div>

      </article>
    </main>
  );
}

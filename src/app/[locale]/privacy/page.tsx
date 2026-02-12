import { useTranslations } from 'next-intl';

export default function PrivacyPage() {
    return (
        <div style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 1.5rem', fontFamily: 'sans-serif' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '2rem' }}>Aviso de Privacidad</h1>

            <p style={{ marginBottom: '1rem', color: '#666' }}>Última actualización: {new Date().toLocaleDateString()}</p>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>1. Responsable de los Datos</h2>
                <p>StanStore, con domicilio en [Dirección de la Empresa], es el responsable del uso y protección de sus datos personales, y al respecto le informamos lo siguiente...</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>2. Datos que Recabamos</h2>
                <p>Los datos que podemos recabar incluyen: Nombre, correo electrónico, dirección de envío, información de pago (procesada por Stripe), y datos de navegación (cookies).</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>3. Finalidad del Tratamiento</h2>
                <p>Utilizamos su información para: Procesar sus pedidos, enviar notificaciones sobre el estado de su compra, mejorar nuestros servicios y, si lo autoriza, enviarle promociones.</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>4. Derechos ARCO</h2>
                <p>Usted tiene derecho a conocer qué datos tenemos de usted, para qué los utilizamos y las condiciones del uso que les damos (Acceso). Asimismo, es su derecho solicitar la corrección de su información personal en caso de que esté desactualizada, sea inexacta o incompleta (Rectificación); que la eliminemos de nuestros registros o bases de datos cuando considere que la misma no está siendo utilizada adecuadamente (Cancelación); así como oponerse al uso de sus datos personales para fines específicos (Oposición).</p>
                <p>Para ejercer estos derechos, puede utilizar la herramienta de exportación en su perfil o contactarnos a [correo@stanstore.com].</p>
            </section>
        </div>
    );
}

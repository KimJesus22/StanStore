// import { useTranslations } from 'next-intl';

export default function TermsPage() {
    return (
        <div style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 1.5rem', fontFamily: 'sans-serif' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '2rem' }}>Términos y Condiciones</h1>

            <p style={{ marginBottom: '1rem', color: '#666' }}>Última actualización: {new Date().toLocaleDateString()}</p>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>1. Aceptación de los Términos</h2>
                <p>Al acceder y utilizar este sitio web, usted acepta estar sujeto a estos términos y condiciones de uso, todas las leyes y regulaciones aplicables, y acepta que es responsable del cumplimiento de las leyes locales aplicables.</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>2. Licencia de Uso</h2>
                <p>Se concede permiso para descargar temporalmente una copia de los materiales (información o software) en el sitio web de StanStore solo para visualización transitoria personal y no comercial.</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>3. Compras y Pagos</h2>
                <p>Todos los precios están sujetos a cambios sin previo aviso. Nos reservamos el derecho de rechazar cualquier pedido que realice con nosotros.</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>4. Devoluciones y Reembolsos</h2>
                <p>Nuestra política de devoluciones dura 30 días. Si han pasado 30 días desde su compra, desafortunadamente no podemos ofrecerle un reembolso o cambio.</p>
            </section>
        </div>
    );
}

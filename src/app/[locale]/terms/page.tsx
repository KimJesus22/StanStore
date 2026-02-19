import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

async function getTermsContent(locale: string) {
    const termsDirectory = path.join(process.cwd(), 'src/content/terms');

    // Intentar cargar el archivo del idioma solicitado
    let fullPath = path.join(termsDirectory, `terms.${locale}.md`);
    let isFallback = false;

    if (!fs.existsSync(fullPath)) {
        // Fallback a español si no existe
        fullPath = path.join(termsDirectory, 'terms.es.md');
        isFallback = true;
    }

    if (!fs.existsSync(fullPath)) {
        // Si ni siquiera existe el de español, retornar error o contenido dummy
        return {
            title: 'Error',
            date: '',
            contentHtml: '<p>Terms and conditions not found.</p>',
            isFallback: false
        };
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    const processedContent = await remark()
        .use(html)
        .process(matterResult.content);

    const contentHtml = processedContent.toString();

    return {
        title: matterResult.data.title,
        date: matterResult.data.date,
        contentHtml,
        isFallback,
    };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const { title, date, contentHtml, isFallback } = await getTermsContent(locale);

    return (
        <div style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 1.5rem', fontFamily: 'sans-serif' }}>
            {isFallback && (
                <div style={{
                    backgroundColor: '#fff3cd',
                    color: '#856404',
                    padding: '0.75rem 1.25rem',
                    marginBottom: '1rem',
                    borderRadius: '0.25rem',
                    border: '1px solid #ffeeba',
                    fontSize: '0.9rem'
                }}>
                    Document only available in Spanish for now.
                </div>
            )}

            <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '2rem' }}>{title}</h1>

            {date && <p style={{ marginBottom: '1rem', color: '#666' }}>Last updated: {date}</p>}

            <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </div>
    );
}

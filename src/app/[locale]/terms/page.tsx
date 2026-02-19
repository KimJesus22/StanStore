import fs from 'fs/promises';
import path from 'path';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { MarkdownStyles } from '@/components/MarkdownStyles';

// Define the shape of the props
interface PageProps {
    params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Metadata' });

    return {
        title: t('termsTitle'),
        description: t('termsDescription')
    };
}

export default async function TermsPage({ params }: PageProps) {
    const { locale } = await params;

    // Habilitar renderizado estático
    setRequestLocale(locale);

    // Determinar la ruta del archivo markdown
    // Nota: Asegúrate de que los archivos existan en src/content/terms/
    const filePath = path.join(process.cwd(), 'src', 'content', 'terms', `${locale}.md`);

    let content = '';

    try {
        content = await fs.readFile(filePath, 'utf8');
    } catch (error) {
        console.error(`Error reading terms file for locale ${locale}:`, error);
        notFound();
    }

    return (
        <MarkdownStyles>
            <ReactMarkdown>{content}</ReactMarkdown>
        </MarkdownStyles>
    );
}

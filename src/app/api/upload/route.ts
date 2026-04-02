import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { requireAdmin } from '@/lib/supabase/requireAdmin';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    const deny = await requireAdmin();
    if (deny === 'unauthenticated') {
        return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }
    if (deny === 'forbidden') {
        return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 });
        }

        // Validate MIME type (client-supplied; combined with extension check below)
        if (!ALLOWED_MIME_TYPES.has(file.type)) {
            return NextResponse.json({ error: 'Tipo de archivo no permitido. Usa JPG, PNG, WebP o GIF.' }, { status: 400 });
        }

        // Validate extension — prevents MIME spoofing (e.g. file.type='image/jpeg', file.name='evil.php')
        const ext = path.extname(file.name).toLowerCase();
        if (!ALLOWED_EXTENSIONS.has(ext)) {
            return NextResponse.json({ error: 'Extensión de archivo no permitida.' }, { status: 400 });
        }

        // Max 5 MB
        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: 'El archivo no debe superar 5MB.' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate unique filename — strip directory separators via path.basename, cap length
        const rawBase = path.basename(file.name, ext)
            .replace(/[^a-zA-Z0-9-_]/g, '_')
            .toLowerCase()
            .slice(0, 64);
        const filename = `${rawBase}_${Date.now()}${ext}`;

        // Ensure directory exists
        const uploadDir = path.join(process.cwd(), 'public', 'images', 'products');
        await mkdir(uploadDir, { recursive: true });

        // Save file
        const filepath = path.join(uploadDir, filename);
        await writeFile(filepath, buffer);

        const imageUrl = `/images/products/${filename}`;
        return NextResponse.json({ success: true, imageUrl });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Error al subir el archivo' }, { status: 500 });
    }
}

'use client';

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo';

export default function cloudinaryLoader({
    src,
    width,
    quality,
}: {
    src: string;
    width: number;
    quality?: number;
}) {
    const params = ['f_auto', 'c_limit', `w_${width}`, `q_${quality || 'auto'}`];
    return `https://res.cloudinary.com/${cloudName}/image/fetch/${params.join(',')}/${src}`;
}

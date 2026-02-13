export interface Product {
    id: string;
    name: string;
    price: number;
    image_url: string;
    category: 'album' | 'lightstick' | 'merch';
    artist: 'BTS' | 'NewJeans' | 'Seventeen' | 'BLACKPINK' | 'TWICE' | 'Stray Kids' | string;
    is_new: boolean;
    description?: string;
    stock: number;
    spotify_album_id?: string;
    theme_color?: string;
    youtube_video_id?: string;
}

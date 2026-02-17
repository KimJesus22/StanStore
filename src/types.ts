export interface Product {
    id: string;
    name: string;
    price: number;
    image_url: string;
    category: 'album' | 'lightstick' | 'merch';
    artist: 'BTS' | 'NewJeans' | 'Seventeen' | 'BLACKPINK' | 'TWICE' | 'Stray Kids' | string;
    is_new: boolean;
    description?: string;
    description_en?: string;
    description_ko?: string;
    stock: number;
    spotify_album_id?: string;
    theme_color?: string;
    youtube_video_id?: string;
    release_date?: string; // ISO Date string
    related_artists?: string[];
}

export interface ShippingInfo {
    country: string;
    firstName: string;
    lastName: string;
    address: string;
    apartment?: string;
    postalCode: string;
    city: string;
    state: string;
    phone: string;
}

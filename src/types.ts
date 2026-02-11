export interface Product {
    id: string;
    name: string;
    price: number;
    image_url: string;
    category: 'album' | 'lightstick' | 'merch';
    artist: 'BTS' | 'NewJeans' | 'Seventeen' | 'BLACKPINK' | 'TWICE' | 'Stray Kids' | string;
    is_new: boolean;
}

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    email: string
                    full_name: string | null
                    avatar_url: string | null
                    created_at: string
                }
                Insert: {
                    id: string
                    email: string
                    full_name?: string | null
                    avatar_url?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    full_name?: string | null
                    avatar_url?: string | null
                    created_at?: string
                }
            }
            products: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    price: number
                    image_url: string | null
                    stock: number
                    artist_id: string
                    created_at: string
                    category_id: string | null
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    price: number
                    image_url?: string | null
                    stock?: number
                    artist_id: string
                    created_at?: string
                    category_id?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    price?: number
                    image_url?: string | null
                    stock?: number
                    artist_id?: string
                    created_at?: string
                    category_id?: string | null
                }
            }
            orders: {
                Row: {
                    id: string
                    user_id: string
                    status: 'pending' | 'completed' | 'cancelled'
                    total: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    status?: 'pending' | 'completed' | 'cancelled'
                    total: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    status?: 'pending' | 'completed' | 'cancelled'
                    total?: number
                    created_at?: string
                }
            }
            order_items: {
                Row: {
                    id: string
                    order_id: string
                    product_id: string
                    quantity: number
                    price_at_purchase: number
                }
                Insert: {
                    id?: string
                    order_id: string
                    product_id: string
                    quantity: number
                    price_at_purchase: number
                }
                Update: {
                    id?: string
                    order_id?: string
                    product_id?: string
                    quantity?: number
                    price_at_purchase?: number
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}

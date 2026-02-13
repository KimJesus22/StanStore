'use client';

import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { AdminGuard } from '@/hooks/useAdmin';
import { createProduct, deleteProduct } from '@/app/actions/admin';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import { Loader2, Upload, Plus, DollarSign, Tag, Image as ImageIcon, FileText, User, Trash2 } from 'lucide-react';
import { Product } from '@/types';

const Container = styled.div`
  max-width: 800px;
  margin: 4rem auto;
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Form = styled.form`
  background: white;
  padding: 2.5rem;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #111;
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #111;
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
`;

const SubmitButton = styled.button`
  background: #111;
  color: white;
  padding: 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  transition: background 0.2s;

  &:hover {
    background: #000;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ErrorMsg = styled.span`
  color: #ef4444;
  font-size: 0.8rem;
`;

const ProductList = styled.div`
  margin-top: 3rem;
`;

const ProductItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: white;
  border-radius: 12px;
  margin-bottom: 0.75rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
`;

const ProductInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
`;

const ProductThumb = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
  background: #f0f0f0;
`;

const ProductMeta = styled.div`
  display: flex;
  flex-direction: column;
`;

const ProductNameStyled = styled.span`
  font-weight: 600;
  font-size: 0.95rem;
  color: #111;
`;

const ProductArtist = styled.span`
  font-size: 0.8rem;
  color: #888;
  text-transform: uppercase;
`;

const ProductPrice = styled.span`
  font-weight: 700;
  color: #10CFBD;
  margin-right: 1.5rem;
  font-size: 0.95rem;
`;

const DeleteButton = styled.button`
  background: none;
  border: 1px solid #fecaca;
  color: #ef4444;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: #fef2f2;
    border-color: #ef4444;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [errors, setErrors] = useState<any>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Error loading products:', error);
    } else {
      setProducts(data || []);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      price: parseFloat(formData.get('price') as string),
      category: formData.get('category') as string,
      artist: formData.get('artist') as string,
      image_url: formData.get('image_url') as string,
      description: formData.get('description') as string,
    };

    const result = await createProduct(data);

    if (result.success) {
      toast.success('Producto creado exitosamente');
      (e.target as HTMLFormElement).reset();
      fetchProducts();
    } else {
      if (typeof result.error === 'object') {
        setErrors(result.error);
      } else {
        toast.error(result.error as string);
      }
    }
    setLoading(false);
  }

  async function handleDelete(productId: string, productName: string) {
    if (!confirm(`¿Estás seguro de eliminar "${productName}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    setDeletingId(productId);
    const result = await deleteProduct(productId);

    if (result.success) {
      toast.success('Producto eliminado');
      setProducts(prev => prev.filter(p => p.id !== productId));
    } else {
      toast.error(result.error || 'Error al eliminar');
    }
    setDeletingId(null);
  }

  return (
    <AdminGuard>
      <Container>
        <Title>
          <Upload size={32} />
          Panel de Administrador
        </Title>

        <Form onSubmit={handleSubmit}>
          <h2 style={{ marginBottom: '1rem' }}>Agregar Nuevo Producto</h2>

          <FormGroup>
            <Label><Tag size={16} /> Nombre del Producto</Label>
            <Input name="name" placeholder="Ej: Lightstick Ver. 2" required />
            {errors.name && <ErrorMsg>{errors.name[0]}</ErrorMsg>}
          </FormGroup>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormGroup>
              <Label><DollarSign size={16} /> Precio (USD)</Label>
              <Input name="price" type="number" step="0.01" placeholder="0.00" required />
              {errors.price && <ErrorMsg>{errors.price[0]}</ErrorMsg>}
            </FormGroup>

            <FormGroup>
              <Label><User size={16} /> Artista / Grupo</Label>
              <Input name="artist" placeholder="Ej: NewJeans" required />
              {errors.artist && <ErrorMsg>{errors.artist[0]}</ErrorMsg>}
            </FormGroup>
          </div>

          <FormGroup>
            <Label>Categoría</Label>
            <Select name="category" required>
              <option value="albums">Álbumes</option>
              <option value="merch">Merch</option>
              <option value="photocards">Photocards</option>
              <option value="clothing">Ropa</option>
            </Select>
            {errors.category && <ErrorMsg>{errors.category[0]}</ErrorMsg>}
          </FormGroup>

          <FormGroup>
            <Label><ImageIcon size={16} /> URL de Imagen</Label>
            <Input name="image_url" placeholder="https://..." required />
            {errors.image_url && <ErrorMsg>{errors.image_url[0]}</ErrorMsg>}
          </FormGroup>

          <FormGroup>
            <Label><FileText size={16} /> Descripción</Label>
            <TextArea name="description" placeholder="Detalles del producto..." required />
            {errors.description && <ErrorMsg>{errors.description[0]}</ErrorMsg>}
          </FormGroup>

          <SubmitButton type="submit" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <Plus />}
            {loading ? 'Guardando...' : 'Crear Producto'}
          </SubmitButton>
        </Form>

        <ProductList>
          <h2 style={{ marginBottom: '1rem' }}>Productos Existentes ({products.length})</h2>
          {products.length === 0 ? (
            <p style={{ color: '#888' }}>No hay productos en la base de datos.</p>
          ) : (
            products.map(product => (
              <ProductItem key={product.id}>
                <ProductInfo>
                  <ProductThumb
                    src={product.image_url}
                    alt={product.name}
                    onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder.png'; }}
                  />
                  <ProductMeta>
                    <ProductNameStyled>{product.name}</ProductNameStyled>
                    <ProductArtist>{product.artist}</ProductArtist>
                  </ProductMeta>
                </ProductInfo>
                <ProductPrice>${product.price.toFixed(2)}</ProductPrice>
                <DeleteButton
                  onClick={() => handleDelete(product.id, product.name)}
                  disabled={deletingId === product.id}
                  title="Eliminar producto"
                >
                  {deletingId === product.id ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Trash2 size={18} />
                  )}
                </DeleteButton>
              </ProductItem>
            ))
          )}
        </ProductList>
      </Container>
    </AdminGuard>
  );
}

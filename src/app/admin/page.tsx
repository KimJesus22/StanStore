'use client';

import styled from 'styled-components';
import { useState } from 'react';
import { AdminGuard } from '@/hooks/useAdmin';
import { createProduct } from '@/app/actions/admin';
import toast from 'react-hot-toast';
import { Loader2, Upload, Plus, DollarSign, Tag, Image as ImageIcon, FileText, User } from 'lucide-react';

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

export default function AdminPage() {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<any>({});

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
        } else {
            if (typeof result.error === 'object') {
                setErrors(result.error);
            } else {
                toast.error(result.error as string);
            }
        }
        setLoading(false);
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
            </Container>
        </AdminGuard>
    );
}

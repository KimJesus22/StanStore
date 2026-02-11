'use client';

import { useEffect, useState, Suspense } from 'react';
import styled from 'styled-components';
import { CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useSearchParams } from 'next/navigation';
import { saveOrder } from '@/app/actions/orders';
import toast from 'react-hot-toast';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #111;
  margin: 1.5rem 0 0.5rem;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 2.5rem;
  max-width: 600px;
`;

const Button = styled(Link)`
  background: #111;
  color: white;
  padding: 1rem 2rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
    background: #000;
  }
`;

function SuccessContent() {
  const { items, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (sessionId && items.length > 0 && user && !isSaving && !saved) {
      const processOrder = async () => {
        setIsSaving(true);
        console.log('Processing order for user:', user.email);

        try {
          const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

          const result = await saveOrder({
            userId: user.id,
            total,
            items: items.map(item => ({
              id: item.id,
              quantity: item.quantity,
              product_id: item.id,
              name: item.name,
              price: item.price,
              image_url: item.image_url
            }))
          });

          if (result.success) {
            toast.success('Pedido guardado correctamente');
            setSaved(true);
            clearCart();
          } else {
            console.error('Error saving order:', result.error);
            toast.error('Error al guardar el historial del pedido, pero el pago fue exitoso.');
            // We clear cart anyway since they paid
            clearCart();
          }
        } catch (error) {
          console.error('Unexpected error:', error);
        } finally {
          setIsSaving(false);
        }
      };

      processOrder();
    } else if (sessionId && items.length > 0 && !user) {
      // Guest checkout case (or user not loaded yet)
      // For MVP we just clear cart, but ideally we'd ask them to login to save history
      if (!isSaving && !saved) {
        // Maybe wait a bit for auth to load?
        // If auth is strictly required for checkout in previous steps, this isn't an issue.
        // If not, we just clear.
        const timer = setTimeout(() => {
          if (!user) clearCart();
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [sessionId, items, user, clearCart, isSaving, saved]);

  return (
    <>
      <CheckCircle size={64} color="#10CFBD" />
      <Title>¡Gracias por tu compra!</Title>
      <Subtitle>
        {saved ? 'Tu pedido ha sido guardado en tu historial.' : 'Tu pedido ha sido procesado correctamente.'}
        Recibirás un correo electrónico con los detalles de confirmación.
      </Subtitle>
      {isSaving && <p><Loader2 className="animate-spin" /> Guardando detalles...</p>}
      <Button href="/">Volver a la tienda</Button>
    </>
  );
}

export default function SuccessPage() {
  return (
    <Container>
      <Suspense fallback={<p>Cargando...</p>}>
        <SuccessContent />
      </Suspense>
    </Container>
  );
}

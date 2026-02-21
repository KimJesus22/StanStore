'use client';

import { useEffect, useState, Suspense } from 'react';
import styled from 'styled-components';
import { CheckCircle, Loader2, FileText } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/features/cart';
import { useAuth } from '@/features/auth';
import { useSearchParams } from 'next/navigation';
import { saveOrder } from '@/app/actions/orders';
import toast from 'react-hot-toast';
import { generateContractPDF } from '@/utils/pdfGenerator';

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
  color: ${({ theme }) => theme.colors.text};
  margin: 1.5rem 0 0.5rem;
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.text}80;
  font-size: 1.1rem;
  margin-bottom: 2.5rem;
  max-width: 600px;
`;

const Button = styled(Link)`
  background: ${({ theme }) => theme.colors.text};
  color: ${({ theme }) => theme.colors.background};
  padding: 1rem 2rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
    opacity: 0.9;
  }
`;

function SuccessContent() {
  const { items, clearCart } = useCartStore();
  const { user, isLoading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id'); // Stripe
  // MercadoPago params
  const mpPaymentId = searchParams.get('payment_id');
  const mpStatus = searchParams.get('status');
  const mpApproved = mpStatus === 'approved' || mpStatus === 'pending';
  // Unified payment key used for order saving
  const paymentKey = sessionId || (mpApproved && mpPaymentId ? `mp_${mpPaymentId}` : null);

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [agreedAt, setAgreedAt] = useState<string | null>(null);
  const [userAgent, setUserAgent] = useState<string | null>(null);

  // Local state to hold items for PDF generation even after cart is cleared
  const [pdfItems, setPdfItems] = useState(items);
  const [pdfTotal, setPdfTotal] = useState(0);

  useEffect(() => {
    if (items.length > 0) {
      setPdfItems(items);
      setPdfTotal(items.reduce((acc, item) => acc + item.price * item.quantity, 0));
    }
  }, [items]);

  useEffect(() => {
    // Esperar a que auth termine de cargar antes de procesar
    if (authLoading) return;

    if (paymentKey && items.length > 0 && user && !isSaving && !saved) {
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
            })),
            sessionId: paymentKey
          });

          if (result.success && result.order) {
            toast.success('Pedido guardado correctamente');
            setSaved(true);
            setOrderId(result.order.id);
            setAgreedAt(result.order.agreement_accepted_at);
            setUserAgent(result.order.user_agent);
            clearCart();
          } else {
            console.error('Error saving order:', result.error);
            toast.error('Error al guardar el pedido, pero el pago fue exitoso.');
            clearCart(); // Clear anyway
          }
        } catch (error) {
          console.error('Unexpected error:', error);
        } finally {
          setIsSaving(false);
        }
      };

      processOrder();
    } else if (paymentKey && items.length > 0 && !user) {
      // Guest logic
      if (!isSaving && !saved) {
        const timer = setTimeout(() => {
          if (!user) clearCart();
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [paymentKey, items, user, authLoading, clearCart, isSaving, saved]);

  return (
    <>
      <CheckCircle size={64} color="#10CFBD" />
      <Title>¡Gracias por tu compra!</Title>
      <Subtitle>
        {saved ? 'Tu pedido ha sido guardado y el contrato generado.' : 'Tu pedido ha sido procesado correctamente.'}
        <br />Recibirás un correo electrónico con los detalles.
      </Subtitle>

      {isSaving && <p><Loader2 className="animate-spin" /> Guardando detalles y firma digital...</p>}

      {saved && (
        <div style={{ marginBottom: '2rem' }}>
          <button
            onClick={() => generateContractPDF({
              orderId: orderId!,
              customerName: user?.email || 'Cliente',
              items: pdfItems,
              total: pdfTotal,
              date: new Date(),
              legalMetadata: {
                agreedAt: agreedAt || new Date().toISOString(),
                userAgent: userAgent || navigator.userAgent
              }
            })}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: '#fff', border: '1px solid #ccc', padding: '0.75rem 1.5rem',
              borderRadius: '50px', cursor: 'pointer', fontWeight: 600, color: '#333'
            }}
          >
            <FileText size={18} />
            Descargar Contrato Compra-Venta
          </button>
          <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.5rem' }}>
            Incluye firma digital con timestamp y User-Agent.
          </p>
        </div>
      )}

      <Button href="/">Volver a la tienda</Button>

      <div style={{ padding: '0 1rem', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <NextPurchaseCoupon />
        <ShareToUnlock />
      </div>
    </>
  );
}

import NextPurchaseCoupon from '@/components/gamification/NextPurchaseCoupon';
import ShareToUnlock from '@/components/gamification/ShareToUnlock';

export default function SuccessPage() {
  return (
    <Container>
      <Suspense fallback={<p>Cargando...</p>}>
        <SuccessContent />
      </Suspense>
    </Container>
  );
}

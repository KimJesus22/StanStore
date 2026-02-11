'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/lib/supabaseClient';
import styled from 'styled-components';
import { User, LogOut, Package, Calendar, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Container = styled.div`
  max-width: 800px;
  margin: 4rem auto;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
    margin: 2rem auto;
  }
`;

const ProfileCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  text-align: center;
  margin-bottom: 2rem;
`;

const Avatar = styled.div`
  width: 100px;
  height: 100px;
  background: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  color: #666;
`;

const Email = styled.h2`
  font-size: 1.5rem;
  color: #111;
  margin-bottom: 0.5rem;
`;

const ID = styled.p`
  color: #888;
  font-family: monospace;
  font-size: 0.9rem;
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const OrdersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: left;
`;

const OrderCard = styled.div`
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s;

  &:hover {
    border-color: #10CFBD;
    box-shadow: 0 4px 12px rgba(16, 207, 189, 0.1);
  }
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f5f5f5;
`;

const OrderDate = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.9rem;
`;

const OrderTotal = styled.div`
  font-weight: 700;
  color: #111;
`;

const OrderItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const OrderItemRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #444;
`;

const LogoutButton = styled.button`
  background: #fff;
  border: 1px solid #e0e0e0;
  color: #d32f2f;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  margin-top: 1rem;

  &:hover {
    background: #ffebee;
    border-color: #ef9a9a;
  }
`;

interface Order {
  id: string;
  total: number;
  status: string;
  created_at: string;
  items: any[];
}

export default function ProfilePage() {
  const { user, isLoading, signOut, openAuthModal } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      toast.error('Debes iniciar sesión para ver tu perfil');
      router.push('/');
      setTimeout(() => openAuthModal(), 500);
    }
  }, [user, isLoading, router, openAuthModal]);

  useEffect(() => {
    async function fetchOrders() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching orders:', error);
        } else {
          setOrders(data || []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoadingOrders(false);
      }
    }

    fetchOrders();
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    toast.success('Sesión cerrada correctamente');
    router.push('/');
  };

  if (isLoading || loadingOrders) {
    return <Container><p style={{ textAlign: 'center' }}>Cargando perfil...</p></Container>;
  }

  if (!user) return null;

  return (
    <Container>
      <ProfileCard>
        <Avatar>
          <User size={48} />
        </Avatar>
        <Email>{user.email}</Email>
        <ID>ID: {user.id}</ID>
        <LogoutButton onClick={handleLogout}>
          <LogOut size={18} />
          Cerrar Sesión
        </LogoutButton>
      </ProfileCard>

      <SectionTitle>
        <Package color="#10CFBD" /> Mis Pedidos ({orders.length})
      </SectionTitle>

      <OrdersList>
        {orders.length === 0 ? (
          <p style={{ color: '#888', fontStyle: 'italic' }}>No has realizado ninguna compra aún.</p>
        ) : (
          orders.map((order) => (
            <OrderCard key={order.id}>
              <OrderHeader>
                <OrderDate>
                  <Calendar size={16} />
                  {new Date(order.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </OrderDate>
                <OrderTotal>${Number(order.total).toFixed(2)}</OrderTotal>
              </OrderHeader>
              <OrderItems>
                {Array.isArray(order.items) && order.items.map((item: any, index: number) => (
                  <OrderItemRow key={index}>
                    <span>{item.quantity}x {item.name}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </OrderItemRow>
                ))}
              </OrderItems>
            </OrderCard>
          ))
        )}
      </OrdersList>
    </Container>
  );
}

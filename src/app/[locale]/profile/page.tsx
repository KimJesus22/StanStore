'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/lib/supabaseClient';
import styled from 'styled-components';
import { User, LogOut, Package, Calendar, Download, Palette } from 'lucide-react';
import toast from 'react-hot-toast';
import { getUserData } from '@/app/actions/privacy';
import { useTheme } from '@/context/ThemeContext';
import { themes, ThemeType } from '@/styles/themes';

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

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

const ButtonBase = styled.button`
  background: #fff;
  border: 1px solid #e0e0e0;
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
`;

const LogoutButton = styled(ButtonBase)`
  color: #d32f2f;
  &:hover {
    background: #ffebee;
    border-color: #ef9a9a;
  }
`;

const ExportButton = styled(ButtonBase)`
  color: ${({ theme }) => theme.colors.primary};
  border-color: ${({ theme }) => theme.colors.primary};
  &:hover {
    background: ${({ theme }) => theme.colors.secondaryBackground};
  }
`;

const ThemeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const ThemeOption = styled.button<{ $isActive: boolean; $primary: string; $bg: string }>`
  background: ${({ $bg }) => $bg};
  border: 2px solid ${({ $isActive, $primary }) => ($isActive ? $primary : 'transparent')};
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0,0,0,0.1);
  }
`;

const ColorPreview = styled.div<{ $color: string }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  border: 1px solid rgba(0,0,0,0.1);
`;

const ThemeName = styled.span<{ $color: string }>`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ $color }) => $color};
`;

interface Order {
  id: string;
  total: number;
  status: string;
  created_at: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[];
}

export default function ProfilePage() {
  const { user, isLoading, signOut, openAuthModal } = useAuthStore();
  const { currentTheme, changeTheme } = useTheme();
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

  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load profile data (decrypted)
  useEffect(() => {
    async function loadProfile() {
      const session = useAuthStore.getState().session;
      if (!user || !session?.access_token) return;
      try {
        // Dynamically import server action to avoid build issues if mixed
        const { getProfile } = await import('@/app/actions/profile');
        const data = await getProfile(session.access_token);
        if (data) {
          setPhone(data.phone || '');
          setAddress(data.address || '');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoadingProfile(false);
      }
    }
    loadProfile();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const session = useAuthStore.getState().session;
    if (!session?.access_token) {
      toast.error('Sesión no válida');
      return;
    }

    setSaving(true);
    const toastId = toast.loading('Guardando datos encriptados...');

    try {
      const formData = new FormData();
      formData.append('phone', phone);
      formData.append('address', address);

      const { updateProfile } = await import('@/app/actions/profile');
      const result = await updateProfile(session.access_token, formData);

      if (result.error) {
        toast.error(result.error, { id: toastId });
      } else {
        toast.success('Perfil actualizado y encriptado', { id: toastId });
      }
    } catch (error) {
      toast.error('Error al guardar', { id: toastId });
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

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

        <ActionButtons>
          <ExportButton onClick={async () => {
            const toastId = toast.loading('Generando reporte...');
            try {
              const result = await getUserData(user.id);
              if (result.success && result.data) {
                const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `stanstore_data_${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                toast.success('Datos exportados correctamente', { id: toastId });
              } else {
                toast.error('Error al exportar datos', { id: toastId });
              }
            } catch (e) {
              console.error(e);
              toast.error('Error inesperado', { id: toastId });
            }
          }}>
            <Download size={18} />
            Mis Datos (ARCO)
          </ExportButton>

          <LogoutButton onClick={handleLogout}>
            <LogOut size={18} />
            Cerrar Sesión
          </LogoutButton>
        </ActionButtons>
      </ProfileCard>

      <SectionTitle>
        <Palette size={20} /> Personalización (Temas)
      </SectionTitle>

      <ThemeGrid>
        {Object.entries(themes).map(([key, theme]) => (
          <ThemeOption
            key={key}
            onClick={() => changeTheme(key as keyof typeof themes)}
            $isActive={currentTheme === key}
            $primary={theme.colors.primary}
            $bg={theme.colors.secondaryBackground}
          >
            <ColorPreview $color={theme.colors.primary} />
            <ThemeName $color={theme.colors.text}>{theme.name}</ThemeName>
          </ThemeOption>
        ))}
      </ThemeGrid>

      <SectionTitle>
        <User size={20} /> Datos Personales (Encriptados)
      </SectionTitle>

      <ProfileCard as="form" onSubmit={handleUpdateProfile} style={{ textAlign: 'left', padding: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Teléfono</label>
          <input
            type="text"
            value={loadingProfile ? 'Cargando...' : phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+52 55 1234 5678"
            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
          />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Dirección de Envío</label>
          <textarea
            value={loadingProfile ? 'Cargando...' : address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Calle, Número, Colonia, Ciudad..."
            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', minHeight: '80px' }}
          />
        </div>
        <ButtonBase type="submit" disabled={saving || loadingProfile} style={{ background: '#10CFBD', color: 'white', border: 'none' }}>
          {saving ? 'Encriptando y Guardando...' : 'Guardar Datos Seguros'}
        </ButtonBase>
        <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#888' }}>
          <span role="img" aria-label="lock">🔒</span> Tus datos se encriptan con AES-256 antes de guardarse. Nadie, ni siquiera los administradores, pueden verlos sin tu sesión activa.
        </p>
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
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
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
    </Container >
  );
}

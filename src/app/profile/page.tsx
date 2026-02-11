'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import styled from 'styled-components';
import { User, LogOut, Package } from 'lucide-react';
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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 3rem;
`;

const StatCard = styled.div`
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 12px;
  
  h3 {
    font-size: 2rem;
    font-weight: 700;
    color: #111;
    margin-bottom: 0.25rem;
  }
  
  p {
    color: #666;
    font-size: 0.9rem;
  }
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

  &:hover {
    background: #ffebee;
    border-color: #ef9a9a;
  }
`;

export default function ProfilePage() {
    const { user, isLoading, signOut, openAuthModal } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            toast.error('Debes iniciar sesión para ver tu perfil');
            router.push('/');
            setTimeout(() => openAuthModal(), 500);
        }
    }, [user, isLoading, router, openAuthModal]);

    const handleLogout = async () => {
        await signOut();
        toast.success('Sesión cerrada correctamente');
        router.push('/');
    };

    if (isLoading) {
        return <Container><p style={{ textAlign: 'center' }}>Cargando perfil...</p></Container>;
    }

    if (!user) return null; // Redirect logic handles this, prevent flash

    return (
        <Container>
            <ProfileCard>
                <Avatar>
                    <User size={48} />
                </Avatar>
                <Email>{user.email}</Email>
                <ID>ID: {user.id}</ID>

                <StatsGrid>
                    <StatCard>
                        <h3>0</h3>
                        <p>Pedidos Realizados</p>
                    </StatCard>
                    <StatCard>
                        <h3>0</h3>
                        <p>Lista de Deseos</p>
                    </StatCard>
                </StatsGrid>

                <LogoutButton onClick={handleLogout}>
                    <LogOut size={18} />
                    Cerrar Sesión
                </LogoutButton>
            </ProfileCard>
        </Container>
    );
}

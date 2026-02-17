'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '@/lib/supabaseClient'; // Ensure this path is correct
import { Trash2, ShieldAlert, Plus, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

// Styled Components
const Container = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  margin-top: 2rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 1rem;
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111;
  margin: 0;
`;

const Form = styled.form`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  align-items: flex-end;
  
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #444;
`;

const Input = styled.input`
  padding: 0.6rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #10CFBD;
    box-shadow: 0 0 0 2px rgba(16, 207, 189, 0.1);
  }
`;

const Button = styled.button`
  background: #111;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
`;

const Th = styled.th`
  text-align: left;
  padding: 0.75rem 1rem;
  background: #f9fafb;
  color: #666;
  font-weight: 600;
  border-bottom: 1px solid #eee;
`;

const Td = styled.td`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #eee;
  color: #333;
`;

const DeleteButton = styled.button`
  background: transparent;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 4px;
  transition: background 0.2s;

  &:hover {
    background: #fee2e2;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
  font-style: italic;
`;

interface BlockedIp {
    id: string;
    ip_address: string;
    reason: string;
    created_at: string;
}

export default function IpBanManager() {
    const [ips, setIps] = useState<BlockedIp[]>([]);
    const [loading, setLoading] = useState(true);
    const [newIp, setNewIp] = useState('');
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Load IPs on mount
    useEffect(() => {
        fetchIps();
    }, []);

    const fetchIps = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('blocked_ips')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setIps(data || []);
        } catch (error) {
            console.error('Error fetching IPs:', error);
            toast.error('Error al cargar IPs bloqueadas');
        } finally {
            setLoading(false);
        }
    };

    const validateIp = (ip: string) => {
        // Simple regex for IPv4 and IPv6
        const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
        const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
        return ipv4Regex.test(ip) || ipv6Regex.test(ip);
    };

    const handleAddIp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newIp) return;

        if (!validateIp(newIp)) {
            toast.error('Dirección IP inválida');
            return;
        }

        try {
            setSubmitting(true);
            const { error } = await supabase
                .from('blocked_ips')
                .insert([{ ip_address: newIp, reason: reason || 'Bloqueo Manual' }]);

            if (error) {
                if (error.code === '23505') { // Unique violation
                    toast.error('Esta IP ya está bloqueada');
                } else {
                    throw error;
                }
            } else {
                toast.success('IP bloqueada correctamente');
                setNewIp('');
                setReason('');
                fetchIps(); // Refresh list
            }
        } catch (error) {
            console.error('Error adding IP:', error);
            toast.error('Error al bloquear IP');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteIp = async (id: string, ip: string) => {
        if (!confirm(`¿Estás seguro de desbloquear la IP ${ip}?`)) return;

        try {
            const { error } = await supabase
                .from('blocked_ips')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success('IP desbloqueada');
            fetchIps(); // Refresh list
        } catch (error) {
            console.error('Error deleting IP:', error);
            toast.error('Error al desbloquear IP');
        }
    };

    return (
        <Container>
            <Header>
                <ShieldAlert size={24} color="#e11d48" />
                <Title>Gestión de IPs Bloqueadas</Title>
            </Header>

            <Form onSubmit={handleAddIp}>
                <FormGroup>
                    <Label>Dirección IP</Label>
                    <Input
                        type="text"
                        placeholder="Ej: 192.168.1.1"
                        value={newIp}
                        onChange={(e) => setNewIp(e.target.value)}
                        required
                    />
                </FormGroup>
                <FormGroup>
                    <Label>Razón (Opcional)</Label>
                    <Input
                        type="text"
                        placeholder="Ej: Spam, Ataque DDoS..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                </FormGroup>
                <Button type="submit" disabled={submitting}>
                    <Plus size={18} />
                    Bloquear IP
                </Button>
            </Form>

            <TableContainer>
                <Table>
                    <thead>
                        <tr>
                            <Th>IP Address</Th>
                            <Th>Razón</Th>
                            <Th>Fecha</Th>
                            <Th>Acciones</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <Td colSpan={4} style={{ textAlign: 'center' }}>Cargando...</Td>
                            </tr>
                        ) : ips.length === 0 ? (
                            <tr>
                                <Td colSpan={4}>
                                    <EmptyState>
                                        <ShieldCheck size={48} color="#10CFBD" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                        <p>No hay IPs bloqueadas actualmente.</p>
                                    </EmptyState>
                                </Td>
                            </tr>
                        ) : (
                            ips.map((item) => (
                                <tr key={item.id}>
                                    <Td style={{ fontFamily: 'monospace' }}>{item.ip_address}</Td>
                                    <Td>{item.reason}</Td>
                                    <Td>{new Date(item.created_at).toLocaleDateString()}</Td>
                                    <Td>
                                        <DeleteButton onClick={() => handleDeleteIp(item.id, item.ip_address)} title="Desbloquear">
                                            <Trash2 size={18} />
                                        </DeleteButton>
                                    </Td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </TableContainer>
        </Container>
    );
}

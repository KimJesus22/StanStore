'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Shield, Lock, AlertTriangle, CheckCircle, Send } from 'lucide-react';
import { submitSecurityReport, SecurityReport } from '@/app/actions/security';
import toast from 'react-hot-toast';

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 4rem 2rem;
  color: #E2E8F0;
  font-family: 'Inter', sans-serif;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 4rem;
`;

const Title = styled.h1`
  font-size: 3rem;
  background: linear-gradient(135deg, #FFD700 0%, #FF8C00 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`;

const Section = styled.section`
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 3rem;
`;

const SubTitle = styled.h2`
  font-size: 1.5rem;
  color: #F8FAFC;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Text = styled.p`
  line-height: 1.8;
  color: #94A3B8;
  margin-bottom: 1rem;
`;

const List = styled.ul`
  list-style-type: none;
  padding: 0;
  margin-bottom: 2rem;
`;

const ListItem = styled.li`
  margin-bottom: 0.8rem;
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  color: #CBD5E1;

  &::before {
    content: "•";
    color: #FBBF24;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.9rem;
  color: #94A3B8;
  font-weight: 600;
`;

const Input = styled.input`
  background: #0F172A;
  border: 1px solid #334155;
  color: white;
  padding: 1rem;
  border-radius: 8px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #FBBF24;
    box-shadow: 0 0 0 2px rgba(251, 191, 36, 0.2);
  }
`;

const TextArea = styled.textarea`
  background: #0F172A;
  border: 1px solid #334155;
  color: white;
  padding: 1rem;
  border-radius: 8px;
  min-height: 150px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #FBBF24;
  }
`;

const Select = styled.select`
  background: #0F172A;
  border: 1px solid #334155;
  color: white;
  padding: 1rem;
  border-radius: 8px;

  &:focus {
    outline: none;
    border-color: #FBBF24;
  }
`;

const Button = styled(motion.button)`
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
`;

export default function SecurityPage() {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.target);
        const report: SecurityReport = {
            title: formData.get('title') as string,
            severity: formData.get('severity') as 'low' | 'medium' | 'high' | 'critical',
            description: formData.get('description') as string,
            reproduction_steps: formData.get('reproduction') as string,
            submitter_email: formData.get('email') as string,
        };

        const result = await submitSecurityReport(report);

        if (result.success) {
            setSubmitted(true);
            toast.custom((t) => (
                <div style={{
                    background: '#1E293B',
                    color: 'white',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #10B981',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <Shield size={24} color="#10B981" />
                    <div>
                        <strong>Reporte Recibido</strong>
                        <div style={{ fontSize: '0.9em', opacity: 0.8 }}>Gracias por ayudarnos a ser más seguros.</div>
                    </div>
                </div>
            ));
        } else {
            toast.error(result.message);
        }
        setLoading(false);
    };

    if (submitted) {
        return (
            <Container style={{ textAlign: 'center', paddingTop: '8rem' }}>
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring' }}
                >
                    <CheckCircle size={80} color="#10B981" style={{ marginBottom: '2rem' }} />
                </motion.div>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Reporte Enviado Cifradamente</h1>
                <Text style={{ fontSize: '1.2rem' }}>
                    Nuestro equipo de seguridad revisará tu reporte. Si es crítico, te contactaremos en menos de 24 horas.
                </Text>
                <Button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setSubmitted(false)}
                    style={{ background: '#334155', margin: '2rem auto' }}
                >
                    Enviar otro reporte
                </Button>
            </Container>
        );
    }

    return (
        <Container>
            <Header>
                <Title>
                    <Shield size={48} />
                    Centro de Seguridad
                </Title>
                <Text style={{ fontSize: '1.2rem' }}>
                    Política de Divulgación de Vulnerabilidades y Ética Hacker
                </Text>
            </Header>

            <Section>
                <SubTitle><Lock size={24} color="#FBBF24" /> Puerto Seguro (Safe Harbor)</SubTitle>
                <Text>
                    En StanStore, consideramos la seguridad como una prioridad fundamental. Fomentamos la investigación de seguridad ética.
                    Si sigues esta política, nos comprometemos a:
                </Text>
                <List>
                    <ListItem>No emprender acciones legales contra ti.</ListItem>
                    <ListItem>Trabajar contigo para entender y resolver el problema rápidamente.</ListItem>
                    <ListItem>Reconocerte públicamente si eres el primero en reportar un problema único (si lo deseas).</ListItem>
                </List>
                <Text style={{ fontStyle: 'italic', fontSize: '0.9rem', color: '#64748B' }}>
                    Estándar compatible con RFC 9116. Consulta nuestro <a href="/.well-known/security.txt" style={{ color: '#FBBF24' }}>security.txt</a>.
                </Text>
            </Section>

            <Section>
                <SubTitle><AlertTriangle size={24} color="#F43F5E" /> Reportar una Vulnerabilidad</SubTitle>
                <Form onSubmit={handleSubmit}>
                    <InputGroup>
                        <Label>Título del Hallazgo</Label>
                        <Input name="title" required placeholder="Ej. XSS en la barra de búsqueda" />
                    </InputGroup>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <InputGroup>
                            <Label>Severidad Estimada</Label>
                            <Select name="severity">
                                <option value="low">Baja (Info)</option>
                                <option value="medium">Media (Warning)</option>
                                <option value="high">Alta (Error)</option>
                                <option value="critical">Crítica (Fatal)</option>
                            </Select>
                        </InputGroup>

                        <InputGroup>
                            <Label>Tu Email (Opcional - Para recompensa)</Label>
                            <Input name="email" type="email" placeholder="hacker@etico.com" />
                        </InputGroup>
                    </div>

                    <InputGroup>
                        <Label>Descripción Detallada</Label>
                        <TextArea name="description" required placeholder="Describe qué encontraste y por qué es un riesgo..." />
                    </InputGroup>

                    <InputGroup>
                        <Label>Pasos para Reproducir (Proof of Concept)</Label>
                        <TextArea name="reproduction" placeholder="1. Ir a la página X..." />
                    </InputGroup>

                    <Button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading}
                    >
                        {loading ? 'Cifrando y Enviando...' : <><Send size={18} /> Enviar Reporte Seguro</>}
                    </Button>
                </Form>
            </Section>
        </Container>
    );
}

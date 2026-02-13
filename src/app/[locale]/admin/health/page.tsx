'use client';

import { useEffect, useState, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { motion } from 'framer-motion';
import { Activity, Zap, Clock, AlertOctagon, HeartPulse } from 'lucide-react';
import { checkSystemHealth, HealthMetrics } from '@/app/actions/health';

// --- Styled Components ---

const blinkRed = keyframes`
  0% { background-color: rgba(20, 20, 20, 1); box-shadow: inset 0 0 0 red; }
  50% { background-color: rgba(50, 0, 0, 1); box-shadow: inset 0 0 50px red; }
  100% { background-color: rgba(20, 20, 20, 1); box-shadow: inset 0 0 0 red; }
`;

const scanline = keyframes`
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
`;

const Container = styled.div<{ $critical: boolean }>`
  min-height: 100vh;
  background-color: #050505;
  color: #0f0; /* Default Terminal Green */
  font-family: 'Courier New', Courier, monospace;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  position: relative;
  overflow: hidden;

  ${props => props.$critical && css`
    animation: ${blinkRed} 1s infinite;
  `}

  /* CRT Effect Overlay */
  &::before {
    content: " ";
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
    z-index: 2;
    background-size: 100% 2px, 3px 100%;
    pointer-events: none;
  }
  
  &::after {
    content: " ";
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: rgba(18, 16, 16, 0.1);
    opacity: 0;
    z-index: 2;
    pointer-events: none;
    animation: ${scanline} 10s linear infinite;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 2px solid #333;
  padding-bottom: 1rem;
  z-index: 10;
`;

const Title = styled.h1`
  font-size: 2rem;
  text-transform: uppercase;
  letter-spacing: 4px;
  color: #e0e0e0;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
`;

const RefreshRate = styled.div`
  font-size: 0.8rem;
  color: #666;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  z-index: 10;
`;

const Card = styled(motion.div)`
  background: #0a0a0a;
  border: 1px solid #333;
  border-radius: 4px;
  padding: 1.5rem;
  position: relative;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
`;

const Label = styled.div`
  font-size: 0.9rem;
  text-transform: uppercase;
  color: #888;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Value = styled.div<{ $color: string }>`
  font-size: 3.5rem;
  font-weight: bold;
  color: ${props => props.$color};
  text-shadow: 0 0 10px ${props => props.$color};
  line-height: 1;
`;

const Unit = styled.span`
  font-size: 1rem;
  color: #666;
  margin-left: 0.5rem;
`;

// EKG Graph Component
const GraphContainer = styled.div`
  height: 60px;
  margin-top: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-top: 1px dashed #333;
  border-bottom: 1px dashed #333;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
`;

const LinePath = styled(motion.path)`
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
`;

function Heartbeat({ color, speed = 1 }: { color: string, speed?: number }) {
    // Simulate SVG path for heartbeat
    return (
        <GraphContainer>
            <svg width="100%" height="100%" viewBox="0 0 300 60" preserveAspectRatio="none">
                <LinePath
                    d="M 0 30 L 40 30 L 50 10 L 60 50 L 70 30 L 300 30"
                    stroke={color}
                    initial={{ pathLength: 0, opacity: 0, x: -300 }}
                    animate={{
                        pathLength: 1,
                        opacity: [0, 1, 1, 0],
                        x: [0, 0, 0, 300]
                    }}
                    transition={{
                        duration: 2 / speed,
                        ease: "linear",
                        repeat: Infinity,
                        repeatDelay: 0.5
                    }}
                />
            </svg>
        </GraphContainer>
    );
}


export default function HealthPage() {
    const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [critical, setCritical] = useState(false);

    const fetchData = async () => {
        const data = await checkSystemHealth();
        setMetrics(data);
        setCritical(data.status === 'CRITICAL');
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 3000); // Poll every 3s
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (val: number, type: 'latency' | 'memory') => {
        if (type === 'latency') {
            if (val < 200) return '#00ff00'; // Neon Green
            if (val < 500) return '#ffff00'; // Yellow
            return '#ff0000'; // Red
        }
        // Memory logic (Example thresholds)
        if (val < 100) return '#00ff00';
        if (val < 200) return '#ffff00';
        return '#ff0000';
    };

    if (loading && !metrics) {
        return (
            <Container $critical={false} style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Activity size={48} className="animate-pulse" color="#00ff00" />
                <p style={{ marginTop: '1rem' }}>INITIALIZING DIAGNOSTICS...</p>
            </Container>
        );
    }

    return (
        <Container $critical={critical}>
            <Header>
                <Title>
                    <HeartPulse size={32} color={critical ? 'red' : '#00ff00'} />
                    SYSTEM VITAL SIGNS
                </Title>
                <RefreshRate>REFRESH: 3000ms</RefreshRate>
            </Header>

            <Grid>
                {/* Latency Card */}
                <Card
                    animate={{ borderColor: critical ? '#ff0000' : '#333' }}
                >
                    <Label><Activity size={16} /> API LATENCY (SUPABASE)</Label>
                    <Value $color={getStatusColor(metrics?.latency || 0, 'latency')}>
                        {metrics?.latency}
                        <Unit>ms</Unit>
                    </Value>
                    <Heartbeat color={getStatusColor(metrics?.latency || 0, 'latency')} speed={metrics && metrics.latency > 500 ? 2 : 1} />
                    {metrics && metrics.latency > 500 && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            style={{ color: 'red', fontWeight: 'bold', marginTop: '1rem', display: 'flex', gap: '0.5rem' }}
                        >
                            <AlertOctagon /> CRITICAL DELAY DETECTED
                        </motion.div>
                    )}
                </Card>

                {/* Memory Card */}
                <Card>
                    <Label><Zap size={16} /> EDGE MEMORY USAGE</Label>
                    <Value $color="#00ccff">
                        {metrics?.memory}
                        <Unit>MB</Unit>
                    </Value>
                    {/* Flat line simulation for stable memory */}
                    <GraphContainer>
                        <svg width="100%" height="100%">
                            <motion.line
                                x1="0" y1="50%" x2="100%" y2="50%"
                                stroke="#00ccff" strokeWidth="2"
                                strokeDasharray="5,5"
                                animate={{ strokeDashoffset: -20 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            />
                        </svg>
                    </GraphContainer>
                </Card>

                {/* Uptime Card */}
                <Card>
                    <Label><Clock size={16} /> SYSTEM UPTIME</Label>
                    <Value $color="#ffffff">
                        {metrics ? (metrics.uptime / 60).toFixed(1) : 0}
                        <Unit>MIN</Unit>
                    </Value>
                    <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#666', fontFamily: 'monospace' }}>
                        STATUS: {metrics?.status}
                        <br />
                        LAST CHECK: {metrics?.timestamp.split('T')[1].split('.')[0]}
                    </div>
                </Card>
            </Grid>

            {critical && (
                <div style={{
                    position: 'absolute', bottom: '2rem', left: '0', right: '0',
                    textAlign: 'center', color: 'red', fontSize: '3rem', fontWeight: '900',
                    textShadow: '0 0 20px red', letterSpacing: '10px'
                }}>
                    CRITICAL FAILURE IMMINENT
                </div>
            )}
        </Container>
    );
}

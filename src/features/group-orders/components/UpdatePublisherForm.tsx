'use client';

import styled from 'styled-components';
import { useState, useRef } from 'react';
import { Send, Upload, X, Loader2, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { publishGoUpdate } from '@/app/actions/goUpdates';
import type { GoUpdateStatusType } from './TimelineUpdates';

/* ─── Props ─── */

interface UpdatePublisherFormProps {
    groupOrderId: string;
    /** Called after a successful publish so the parent can refresh the list */
    onPublished?: () => void;
}

/* ─── Status options ─── */

const STATUS_OPTIONS: { value: GoUpdateStatusType; label: string; color: string }[] = [
    { value: 'INFO',    label: '🔵 Información',  color: '#2563eb' },
    { value: 'SUCCESS', label: '🟢 Entregado',    color: '#16a34a' },
    { value: 'WARNING', label: '🟡 Aviso',         color: '#d97706' },
    { value: 'DELAY',   label: '🔴 Retraso',       color: '#dc2626' },
];

/* ─── Styled Components ─── */

const Card = styled.div`
    background: ${({ theme }) => theme.colors.secondaryBackground};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 16px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const SectionTitle = styled.h3`
    font-size: 1rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const Field = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
`;

const Label = styled.label`
    font-size: 0.78rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.05em;
`;

const Input = styled.input`
    padding: 0.6rem 0.875rem;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 8px;
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.background};

    &:focus {
        outline: 2px solid ${({ theme }) => theme.colors.primary};
        outline-offset: 1px;
    }
`;

const Textarea = styled.textarea`
    padding: 0.6rem 0.875rem;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 8px;
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.background};
    resize: vertical;
    min-height: 100px;
    line-height: 1.55;
    font-family: inherit;

    &:focus {
        outline: 2px solid ${({ theme }) => theme.colors.primary};
        outline-offset: 1px;
    }
`;

const Select = styled.select`
    padding: 0.6rem 0.875rem;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 8px;
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.background};
    cursor: pointer;

    &:focus {
        outline: 2px solid ${({ theme }) => theme.colors.primary};
        outline-offset: 1px;
    }
`;

/* Image uploader */
const UploadZone = styled.label<{ $hasImage: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border: 2px dashed ${({ theme, $hasImage }) => $hasImage ? theme.colors.primary : theme.colors.border};
    border-radius: 10px;
    padding: 1rem;
    cursor: pointer;
    font-size: 0.85rem;
    color: ${({ theme }) => theme.colors.textMuted};
    transition: border-color 0.15s;

    &:hover { border-color: ${({ theme }) => theme.colors.primary}; }
    input { display: none; }
`;

const PreviewWrapper = styled.div`
    position: relative;
    width: 100%;
    max-width: 200px;
    aspect-ratio: 16 / 9;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid ${({ theme }) => theme.colors.border};
`;

const RemoveImgBtn = styled.button`
    position: absolute;
    top: 4px;
    right: 4px;
    background: rgba(0,0,0,0.6);
    border: none;
    border-radius: 50%;
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    cursor: pointer;
`;

/* Notify checkbox row */
const CheckRow = styled.label`
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors.text};
    cursor: pointer;
    user-select: none;

    input { width: 16px; height: 16px; cursor: pointer; }
`;

const SubmitBtn = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.7rem 1.25rem;
    background: ${({ theme }) => theme.colors.primary};
    color: #fff;
    border: none;
    border-radius: 10px;
    font-size: 0.9rem;
    font-weight: 700;
    cursor: pointer;
    align-self: flex-end;
    transition: opacity 0.15s;

    &:disabled { opacity: 0.6; cursor: not-allowed; }
    &:hover:not(:disabled) { opacity: 0.88; }
`;

/* ─── Component ─── */

export default function UpdatePublisherForm({
    groupOrderId,
    onPublished,
}: UpdatePublisherFormProps) {
    const [title, setTitle]           = useState('');
    const [content, setContent]       = useState('');
    const [statusType, setStatusType] = useState<GoUpdateStatusType>('INFO');
    const [notifyAll, setNotifyAll]   = useState(false);
    const [imageFile, setImageFile]   = useState<File | null>(null);
    const [imagePreview, setPreview]  = useState<string | null>(null);
    const [uploading, setUploading]   = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            toast.error('La imagen no puede superar 5 MB.');
            return;
        }
        setImageFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const removeImage = () => {
        setImageFile(null);
        setPreview(null);
        if (fileRef.current) fileRef.current.value = '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            toast.error('Título y mensaje son obligatorios.');
            return;
        }

        setSubmitting(true);
        let imageUrl: string | null = null;

        // 1. Upload image if present
        if (imageFile) {
            setUploading(true);
            try {
                const formData = new FormData();
                formData.append('file', imageFile);
                const res = await fetch('/api/upload', { method: 'POST', body: formData });
                const result = await res.json();
                if (!res.ok || !result.success) throw new Error(result.error || 'Error al subir imagen');
                imageUrl = result.imageUrl as string;
            } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Error al subir imagen');
                setSubmitting(false);
                setUploading(false);
                return;
            }
            setUploading(false);
        }

        // 2. Insert update row + optionally notify
        const result = await publishGoUpdate({
            groupOrderId,
            title: title.trim(),
            content: content.trim(),
            statusType,
            imageUrl,
            notifyAll,
        });

        setSubmitting(false);

        if (result.error) {
            toast.error(result.error);
            return;
        }

        toast.success(
            notifyAll
                ? `Actualización publicada y ${result.notified ?? 0} correos enviados.`
                : 'Actualización publicada.'
        );

        // Reset form
        setTitle('');
        setContent('');
        setStatusType('INFO');
        setNotifyAll(false);
        removeImage();
        onPublished?.();
    };

    const busy = uploading || submitting;

    return (
        <Card>
            <SectionTitle>
                <Send size={15} />
                Publicar actualización
            </SectionTitle>

            <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
                {/* Title */}
                <Field>
                    <Label htmlFor="upd-title">Título</Label>
                    <Input
                        id="upd-title"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="ej. ¡Cajas liberadas por aduana!"
                        maxLength={120}
                        disabled={busy}
                    />
                </Field>

                {/* Content */}
                <Field>
                    <Label htmlFor="upd-content">Mensaje</Label>
                    <Textarea
                        id="upd-content"
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        placeholder="Escribe los detalles de la actualización..."
                        disabled={busy}
                    />
                </Field>

                {/* Status type */}
                <Field>
                    <Label htmlFor="upd-status">Tipo de alerta</Label>
                    <Select
                        id="upd-status"
                        value={statusType}
                        onChange={e => setStatusType(e.target.value as GoUpdateStatusType)}
                        disabled={busy}
                    >
                        {STATUS_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </Select>
                </Field>

                {/* Image uploader */}
                <Field>
                    <Label>Foto (opcional)</Label>
                    {imagePreview ? (
                        <PreviewWrapper>
                            <Image src={imagePreview} alt="Vista previa" fill style={{ objectFit: 'cover' }} />
                            <RemoveImgBtn type="button" onClick={removeImage} aria-label="Quitar imagen">
                                <X size={12} />
                            </RemoveImgBtn>
                        </PreviewWrapper>
                    ) : (
                        <UploadZone $hasImage={false}>
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleFileChange}
                                disabled={busy}
                            />
                            <Upload size={14} />
                            Subir foto del paquete (máx. 5 MB)
                        </UploadZone>
                    )}
                </Field>

                {/* Notify checkbox */}
                <CheckRow>
                    <input
                        type="checkbox"
                        checked={notifyAll}
                        onChange={e => setNotifyAll(e.target.checked)}
                        disabled={busy}
                    />
                    <Bell size={14} />
                    Notificar por correo a todos los participantes
                </CheckRow>

                <SubmitBtn type="submit" disabled={busy}>
                    {busy ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                    {uploading ? 'Subiendo imagen…' : submitting ? 'Publicando…' : 'Publicar'}
                </SubmitBtn>
            </form>
        </Card>
    );
}

'use client';

import { useId, useRef, useState, type CSSProperties } from 'react';
import { ImageUp, Trash2, LoaderCircle } from 'lucide-react';
import { uploadImage } from '@/lib/upload';

export function ImageField({ label, hint, value, onChange, folder, maxSize, previewStyle }: { label: string; hint?: string; value: string; onChange: (url: string) => void; folder: string; maxSize?: number; previewStyle?: CSSProperties }) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);

  const send = async (file?: File) => {
    if (!file) return;
    setBusy(true); setError('');
    try { onChange(await uploadImage(file, folder, maxSize)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Falha no envio.'); }
    finally { setBusy(false); if (input.current) input.current.value = ''; }
  };

  return <div className="adm-field">
    <label htmlFor={id}>{label}</label>
    <div className={`adm-image ${dragging ? 'dragging' : ''}`} onDragOver={event => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={event => { event.preventDefault(); setDragging(false); send(event.dataTransfer.files[0]); }}>
      <div className="adm-image-preview" style={previewStyle}>{value ? <img src={value} alt=""/> : <span>Sem imagem</span>}{busy && <i><LoaderCircle size={22}/></i>}</div>
      <div className="adm-image-actions">
        <button type="button" className="adm-btn small" disabled={busy} onClick={() => input.current?.click()}><ImageUp size={14}/> {value ? 'Trocar imagem' : 'Enviar imagem'}</button>
        {value && <button type="button" className="adm-btn ghost small danger" disabled={busy} onClick={() => onChange('')}><Trash2 size={14}/> Remover</button>}
        <small>Arraste um arquivo ou clique. JPG, PNG, WebP ou AVIF — otimizada para WebP antes do envio.</small>
        <input ref={input} id={id} type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden onChange={event => send(event.target.files?.[0])}/>
      </div>
    </div>
    {hint && <small>{hint}</small>}
    <span role="status" className="adm-image-status">{busy ? 'Enviando…' : error}</span>
  </div>;
}

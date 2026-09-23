'use client';

import { useId, useState, type ReactNode } from 'react';
import { X, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';

export function Panel({ title, description, actions, children }: { title: string; description?: string; actions?: ReactNode; children: ReactNode }) {
  return <section className="adm-panel">
    <header><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{actions && <div className="adm-panel-actions">{actions}</div>}</header>
    <div className="adm-panel-body">{children}</div>
  </section>;
}

export function Field({ label, hint, value, onChange, placeholder, type = 'text', mono }: { label: string; hint?: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string; mono?: boolean }) {
  const id = useId();
  return <div className="adm-field">
    <label htmlFor={id}>{label}</label>
    <input id={id} type={type} value={value} placeholder={placeholder} className={mono ? 'mono' : undefined} onChange={event => onChange(event.target.value)}/>
    {hint && <small>{hint}</small>}
  </div>;
}

export function TextArea({ label, hint, value, onChange, rows = 3, mono, placeholder }: { label: string; hint?: string; value: string; onChange: (value: string) => void; rows?: number; mono?: boolean; placeholder?: string }) {
  const id = useId();
  return <div className="adm-field">
    <label htmlFor={id}>{label}</label>
    <textarea id={id} rows={rows} value={value} placeholder={placeholder} className={mono ? 'mono' : undefined} onChange={event => onChange(event.target.value)}/>
    {hint && <small>{hint}</small>}
  </div>;
}

export function Select<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { value: T; label: string }[]; onChange: (value: T) => void }) {
  const id = useId();
  return <div className="adm-field">
    <label htmlFor={id}>{label}</label>
    <select id={id} value={value} onChange={event => onChange(event.target.value as T)}>{options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
  </div>;
}

export function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const id = useId();
  return <div className="adm-field">
    <label htmlFor={id}>{label}</label>
    <div className="adm-color"><input type="color" aria-label={`${label} (seletor)`} value={/^#[0-9a-f]{6}$/i.test(value) ? value : '#66c9ff'} onChange={event => onChange(event.target.value)}/><input id={id} className="mono" value={value} onChange={event => onChange(event.target.value)}/></div>
  </div>;
}

export function Chips({ label, hint, values, onChange, placeholder = 'Digite e pressione Enter', split = true }: { label: string; hint?: string; values: string[]; onChange: (values: string[]) => void; placeholder?: string; split?: boolean }) {
  const id = useId();
  const [text, setText] = useState('');
  const add = () => {
    const items = (split ? text.split(',') : [text]).map(item => item.trim()).filter(item => item && !values.includes(item));
    if (items.length) onChange([...values, ...items]);
    setText('');
  };
  return <div className="adm-field">
    <label htmlFor={id}>{label}</label>
    <div className="adm-chips">
      {values.map((value, index) => <span key={value + index}>{value}<button type="button" aria-label={`Remover ${value}`} onClick={() => onChange(values.filter((_, i) => i !== index))}><X size={12}/></button></span>)}
      <input id={id} value={text} placeholder={placeholder} onChange={event => setText(event.target.value)} onBlur={add} onKeyDown={event => {
        if (event.key === 'Enter' || (split && event.key === ',')) { event.preventDefault(); add(); }
        else if (event.key === 'Backspace' && !text && values.length) onChange(values.slice(0, -1));
      }}/>
    </div>
    {hint && <small>{hint}</small>}
  </div>;
}

export function RowActions({ index, total, onMove, onRemove, label }: { index: number; total: number; onMove: (from: number, to: number) => void; onRemove: () => void; label: string }) {
  return <div className="adm-row-actions">
    <button type="button" className="adm-icon" disabled={index === 0} aria-label={`Mover ${label} para cima`} onClick={() => onMove(index, index - 1)}><ArrowUp size={14}/></button>
    <button type="button" className="adm-icon" disabled={index === total - 1} aria-label={`Mover ${label} para baixo`} onClick={() => onMove(index, index + 1)}><ArrowDown size={14}/></button>
    <button type="button" className="adm-icon danger" aria-label={`Remover ${label}`} onClick={onRemove}><Trash2 size={14}/></button>
  </div>;
}

export const move = <T,>(list: T[], from: number, to: number) => {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

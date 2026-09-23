'use client';

import { useState, type FormEvent } from 'react';
import { LogIn, LoaderCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true); setError('');
    const { error } = await createClient().auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setError(error.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : error.message);
  };

  return <div className="adm-login">
    <form onSubmit={submit} className="adm-login-card">
      <div className="adm-brand"><span>&lt;</span>dev<span>/&gt;</span><small>painel</small></div>
      <h1>Entrar no painel</h1>
      <p>Use a conta criada em <b>Authentication → Users</b> no Supabase.</p>
      <div className="adm-field"><label htmlFor="login-email">E-mail</label><input id="login-email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)}/></div>
      <div className="adm-field"><label htmlFor="login-password">Senha</label><input id="login-password" type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)}/></div>
      <span role="alert" className="adm-login-error">{error}</span>
      <button className="adm-btn primary" disabled={busy}>{busy ? <LoaderCircle size={15} className="adm-spin"/> : <LogIn size={15}/>} Entrar</button>
      <a href="/" className="adm-login-back">← Voltar ao site</a>
    </form>
  </div>;
}

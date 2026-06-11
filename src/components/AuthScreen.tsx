import { FormEvent, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Field, inputCls } from './ui';

type Mode = 'signin' | 'signup';

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (!email.trim() || !password) return;
    setBusy(true);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
        if (error) {
          setError(error.message);
        } else if (!data.session) {
          // Email confirmation is on — account made, needs a one-time confirm.
          setNotice('Account created. Check your email to confirm it, then sign in.');
          setMode('signin');
        }
        // If a session came back, useSession picks it up and the app renders.
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) setError(error.message);
      }
    } catch {
      setError('Something went wrong. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="safe-x flex min-h-screen items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-7 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 font-display text-2xl font-semibold text-white shadow-glow ring-1 ring-white/30">
            Y
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="mt-1.5 font-display text-sm italic text-stone-500">
            Plan the year. Run the week. Care for the one.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="space-y-3 rounded-3xl border border-stone-200/70 bg-white p-6 shadow-lift"
        >
          <Field label="Email">
            <input
              type="email"
              autoComplete="email"
              className={inputCls}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@church.org"
              autoFocus
            />
          </Field>
          <Field label="Password">
            <input
              type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              className={inputCls}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
            />
          </Field>

          {error && (
            <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">{error}</p>
          )}
          {notice && (
            <p className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
              {notice}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || !email.trim() || !password}
            className="w-full rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 py-3 text-sm font-bold text-white shadow-glow transition active:scale-[0.98] disabled:opacity-50"
          >
            {busy ? 'One moment…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-stone-500">
          {mode === 'signin' ? "Don't have an account yet?" : 'Already have an account?'}{' '}
          <button
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError(null);
              setNotice(null);
            }}
            className="font-bold text-brand-700 underline-offset-2 hover:underline"
          >
            {mode === 'signin' ? 'Create one' : 'Sign in'}
          </button>
        </p>

        <p className="mt-6 text-center text-[11px] leading-relaxed text-stone-400">
          Your ministry's data is private to your account and synced securely across your devices.
        </p>
      </div>
    </div>
  );
}

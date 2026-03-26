'use client';
import React from 'react';
import Link from 'next/link';
import { BRAND } from '../config/brand';
import { useLang } from './LangProvider';
import { supabase } from '../lib/supabase';

export default function NavBar() {
  const { lang, setLang } = useLang();
  const [user, setUser] = React.useState(null);
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    if (!supabase) return undefined;

    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user || null);
      setIsAdmin(data.user?.user_metadata?.role === 'admin');
    }

    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      setIsAdmin(currentUser?.user_metadata?.role === 'admin');
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  return (
    <nav className="nav">
      <div className="brandRow">
        <div className="logoBadge">{BRAND.logoText}</div>
        <div>
          <div style={{ fontWeight: 800 }}>{`${BRAND.name} Admin`}</div>
          <div style={{ color: 'var(--muted)', fontSize: 12 }}>
            {lang === 'es' ? 'Portal de operaciones internas' : 'Internal operations portal'}
          </div>
        </div>
      </div>
      <div className="navLinks">
        <Link href="/">{lang === 'es' ? 'Panel' : 'Dashboard'}</Link>
        {isAdmin ? (
          <>
            <Link href="/intake">{lang === 'es' ? 'Intake' : 'Intake'}</Link>
            <Link href="/inventory">{lang === 'es' ? 'Inventario' : 'Inventory'}</Link>
            <Link href="/store">{lang === 'es' ? 'Tienda publica' : 'Public store'}</Link>
          </>
        ) : null}
        {user ? (
          <button className="btn-secondary" type="button" onClick={handleSignOut}>
            {lang === 'es' ? 'Cerrar sesion' : 'Sign Out'}
          </button>
        ) : (
          <>
            <Link href="/login">{lang === 'es' ? 'Entrar' : 'Login'}</Link>
            <Link href="/signup">{lang === 'es' ? 'Crear acceso' : 'Sign Up'}</Link>
            <Link href="/reset-password">{lang === 'es' ? 'Recuperar acceso' : 'Reset Password'}</Link>
          </>
        )}
        <div className="langToggle">
          <button
            className={`langBtn ${lang === 'en' ? 'active' : ''}`}
            type="button"
            onClick={() => setLang('en')}
          >
            EN
          </button>
          <button
            className={`langBtn ${lang === 'es' ? 'active' : ''}`}
            type="button"
            onClick={() => setLang('es')}
          >
            ES
          </button>
        </div>
      </div>
    </nav>
  );
}

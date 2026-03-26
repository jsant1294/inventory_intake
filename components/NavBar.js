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
          <div style={{ fontWeight: 800 }}>{BRAND.name}</div>
          <div style={{ color: 'var(--muted)', fontSize: 12 }}>{BRAND.domain}</div>
        </div>
      </div>
      <div className="navLinks">
        <Link href="/">{lang === 'es' ? 'Inicio' : 'Home'}</Link>
        <Link href="/store">{lang === 'es' ? 'Tienda' : 'Storefront'}</Link>
        {isAdmin ? (
          <>
            <Link href="/admin">{lang === 'es' ? 'Admin' : 'Admin'}</Link>
            <Link href="/intake">{lang === 'es' ? 'Agregar inventario' : 'Add Inventory'}</Link>
            <Link href="/inventory">{lang === 'es' ? 'Lista de inventario' : 'Inventory List'}</Link>
          </>
        ) : null}
        {user ? (
          <button className="btn-secondary" type="button" onClick={handleSignOut}>
            {lang === 'es' ? 'Cerrar sesion' : 'Sign Out'}
          </button>
        ) : (
          <>
            <Link href="/login">Login</Link>
            <Link href="/signup">Sign Up</Link>
            <Link href="/reset-password">Reset Password</Link>
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

'use client';
import React from 'react';
import Link from 'next/link';
import { BRAND } from '../config/brand';
import { useLang } from './LangProvider';

export default function NavBar() {
  const { lang, setLang } = useLang();

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
        <Link href="/intake">{lang === 'es' ? 'Agregar inventario' : 'Add Inventory'}</Link>
        <Link href="/inventory">{lang === 'es' ? 'Lista de inventario' : 'Inventory List'}</Link>
        <Link href="/login">Login</Link>
        <Link href="/signup">Sign Up</Link>
        <Link href="/reset-password">Reset Password</Link>
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

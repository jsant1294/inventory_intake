'use client';
import React from 'react';
import Link from 'next/link';
import { useLang } from './LangProvider';

export default function Hero() {
  const { lang } = useLang();

  return (
    <section className="hero">
      <span className="kicker">
        {lang === 'es' ? 'Panel principal para encargados' : 'Main dashboard for storekeepers'}
      </span>
      <div className="heroGrid">
        <div>
          <h1>
            {lang === 'es'
              ? 'Controla inventario y ventas sin complicaciones'
              : 'Control inventory and sales with ease'}
          </h1>
          <p className="sub">
            {lang === 'es'
              ? 'Agrega, edita y muestra herramientas en ambos idiomas. Diseñado para encargados de tienda.'
              : 'Add, edit, and display tools in both languages. Designed for storekeepers and staff.'}
          </p>
          <div className="actions" style={{ marginTop: 16 }}>
            <Link href="/store" className="btn btn-primary">
              {lang === 'es' ? 'Ver tienda' : 'View Storefront'}
            </Link>
            <Link href="/intake" className="btn btn-secondary">
              {lang === 'es' ? 'Agregar inventario' : 'Add Inventory'}
            </Link>
          </div>
        </div>
        <div className="card">
          <div style={{ fontWeight: 800, marginBottom: 10 }}>v3.1</div>
          <ul className="listClean">
            <li>{lang === 'es' ? 'Interfaz bilingüe EN / ES' : 'Bilingual EN / ES UI'}</li>
            <li>{lang === 'es' ? 'Inventario público en línea' : 'Online public inventory'}</li>
            <li>
              {lang === 'es'
                ? 'Ingreso móvil conectado al inventario'
                : 'Mobile intake connected to inventory'}
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

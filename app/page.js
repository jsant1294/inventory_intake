'use client';
import React from 'react';
import NavBar from '../components/NavBar';
import Hero from '../components/Hero';
import FeatureBlocks from '../components/FeatureBlocks';
import InventoryLive from '../components/InventoryLive';
import SupabaseTest from '../components/SupabaseTest';
import { BRAND } from '../config/brand';
import { useLang } from '../components/LangProvider';
import { t } from '../lib/translations';

export default function HomePage() {
  const { lang } = useLang();

  return (
    <main className="page">
      <div className="shell stack">
        <NavBar />
        <Hero />
        <FeatureBlocks />
        <section className="grid2">
          <div className="card">
            <h2 className="sectionTitle">{t(lang, 'whyStorefront')}</h2>
            <ul className="listClean">
              <li>{t(lang, 'why1')}</li>
              <li>{t(lang, 'why2')}</li>
              <li>{t(lang, 'why3')}</li>
            </ul>
          </div>
          <div className="card">
            <h2 className="sectionTitle">{t(lang, 'duplication')}</h2>
            <ol className="listClean">
              <li>{t(lang, 'dup1')}</li>
              <li>{t(lang, 'dup2')}</li>
              <li>{t(lang, 'dup3')}</li>
              <li>{t(lang, 'dup4')}</li>
            </ol>
          </div>
        </section>
        <InventoryLive />
        <SupabaseTest />
        <div className="footerNote">
          {BRAND.name} • {BRAND.domain} • {t(lang, 'homeFooter')}
        </div>
      </div>
    </main>
  );
}

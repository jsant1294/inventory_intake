'use client';
import React from 'react';
import NavBar from '../../components/NavBar';
import IntakeForm from '../../components/IntakeForm';
import { useLang } from '../../components/LangProvider';
import { t } from '../../lib/translations';

export default function IntakePage() {
  const { lang } = useLang();

  return (
    <main className="page">
      <div className="shell stack">
        <NavBar />
        <section className="card">
          <h1 style={{ marginTop: 0 }}>{t(lang, 'intakeTitle')}</h1>
          <p className="sub">{t(lang, 'intakeSub')}</p>
        </section>
        <IntakeForm />
      </div>
    </main>
  );
}

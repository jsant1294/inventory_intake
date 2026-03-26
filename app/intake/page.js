'use client';
import React from 'react';
import { useEffect, useState } from 'react';
import NavBar from '../../components/NavBar';
import IntakeForm from '../../components/IntakeForm';
import { useLang } from '../../components/LangProvider';
import { supabase } from '../../lib/supabase';
import { t } from '../../lib/translations';

export default function IntakePage() {
  const { lang } = useLang();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      const { data } = await supabase.auth.getUser();
      setIsAdmin(data.user?.user_metadata?.role === 'admin');
      setLoading(false);
    }

    checkAdmin();
  }, []);

  return (
    <main className="page">
      <div className="shell stack">
        <NavBar />
        <section className="card">
          <h1 style={{ marginTop: 0 }}>{t(lang, 'intakeTitle')}</h1>
          <p className="sub">{t(lang, 'intakeSub')}</p>
        </section>
        {loading ? (
          <section className="card">
            <div className="emptyBox">Loading...</div>
          </section>
        ) : isAdmin ? (
          <IntakeForm />
        ) : (
          <section className="card">
            <div className="status error">Only logged-in admins can add inventory.</div>
          </section>
        )}
      </div>
    </main>
  );
}

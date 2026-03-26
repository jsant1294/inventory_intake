'use client';
import React from 'react';
import { useEffect, useState } from 'react';
import AdminInventoryManager from '../../components/AdminInventoryManager';
import NavBar from '../../components/NavBar';
import { useLang } from '../../components/LangProvider';
import { supabase, supabaseConfigError } from '../../lib/supabase';
import { t } from '../../lib/translations';

export default function InventoryPage() {
  const { lang } = useLang();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function checkAdmin() {
      if (!supabase) {
        setError(supabaseConfigError);
        setLoading(false);
        return;
      }

      const { data, error: userError } = await supabase.auth.getUser();
      if (userError) {
        setError(userError.message);
      } else {
        setIsAdmin(data.user?.user_metadata?.role === 'admin');
      }
      setLoading(false);
    }

    checkAdmin();
  }, []);

  return (
    <main className="page">
      <div className="shell stack">
        <NavBar />
        <section className="card">
          <h1 style={{ marginTop: 0 }}>{t(lang, 'inventoryTitle')}</h1>
          <p className="sub">{t(lang, 'inventorySub')}</p>
        </section>
        {loading ? (
          <section className="card">
            <div className="emptyBox">{lang === 'es' ? 'Cargando...' : 'Loading...'}</div>
          </section>
        ) : error ? (
          <section className="card">
            <div className="status error">{error}</div>
          </section>
        ) : isAdmin ? (
          <AdminInventoryManager />
        ) : (
          <section className="card">
            <div className="status error">
              {lang === 'es'
                ? 'Solo los administradores pueden ver y administrar este inventario.'
                : 'Only admins can view and manage this inventory.'}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

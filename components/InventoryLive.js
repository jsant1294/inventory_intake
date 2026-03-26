'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { supabaseConfigError } from '../lib/supabase';

export default function InventoryLive() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/store');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || supabaseConfigError);
        setProducts(data.products || []);
      } catch (loadError) {
        setError(loadError.message || 'Unable to load inventory preview.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) return <div className="card">Loading inventory...</div>;
  if (error) return <div className="card" style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div className="card">
      <h2 className="sectionTitle">Inventory layout preview (Live)</h2>
      <table className="tablePreview">
        <thead>
          <tr>
            <th>Product</th>
            <th>Model</th>
            <th>Condition</th>
            <th>Target Price</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id || p.sku}>
              <td>{p.name}</td>
              <td>{p.model}</td>
              <td>{p.condition || ''}</td>
              <td>{p.price ? `$${p.price}` : ''}</td>
              <td>{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function InventoryLive() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    supabase
      .from('products')
      .select('id, name, model, condition, target_price, status')
      .order('name', { ascending: true })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setProducts(data || []);
        setLoading(false);
      });
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
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.model}</td>
              <td>{p.condition}</td>
              <td>{p.target_price ? `$${p.target_price}` : ''}</td>
              <td>{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

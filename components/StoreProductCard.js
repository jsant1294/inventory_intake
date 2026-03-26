'use client';

import React from 'react';
import Link from 'next/link';
import { useLang } from './LangProvider';
import { t } from '../lib/translations';

export default function StoreProductCard({ product }) {
  const { lang } = useLang();

  return (
    <Link href={`/store/${product.sku}`} className="productCard">
      <div className="productThumb">
        {product.primaryImage ? (
          <img src={product.primaryImage} alt={product.name} />
        ) : (
          <div className="emptyBox">
            {lang === 'es' ? 'Agrega una foto para esta herramienta' : 'Add a photo for this tool'}
          </div>
        )}
      </div>
      <div>
        <div className="productMeta">
          <span className="pill">{product.brand}</span>
          {product.condition && <span className="pill">{product.condition}</span>}
          {product.status && <span className="pill">{product.status}</span>}
        </div>
        <h3 style={{ marginBottom: 8 }}>{product.name}</h3>
        <div className="muted">{product.model || '—'}</div>
        <div className="price" style={{ marginTop: 10 }}>
          {product.price
            ? `$${Number(product.price).toFixed(2)}`
            : lang === 'es'
              ? 'Agrega un precio'
              : 'Set a price'}
        </div>
      </div>
    </Link>
  );
}

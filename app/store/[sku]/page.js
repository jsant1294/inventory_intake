'use client';

import { useEffect, useState } from 'react';
import NavBar from '../../../components/NavBar';
import { BRAND } from '../../../config/brand';
import { useLang } from '../../../components/LangProvider';
import { t } from '../../../lib/translations';

export default function ProductPage({ params }) {
  const { lang } = useLang();
  const [product, setProduct] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const sku = params?.sku;
        const res = await fetch(`/api/store/${sku}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Unable to load product.');
        setProduct(data.product || null);
      } catch (error) {
        setErrorMessage(error.message || 'Unable to load product.');
      }
    }
    load();
  }, [params]);

  return (
    <main className="page">
      <div className="shell stack">
        <NavBar />

        {errorMessage ? (
          <div className="card">
            <div className="status error">{errorMessage}</div>
          </div>
        ) : !product ? (
          <div className="card">
            <div className="emptyBox">{t(lang, 'productNotFound')}</div>
          </div>
        ) : (
          <>
            <section className="card">
              <div className="productMeta">
                <span className="pill">{product.brand}</span>
                {product.condition && <span className="pill">{product.condition}</span>}
                {product.status && <span className="pill">{product.status}</span>}
              </div>
              <h1 style={{ marginBottom: 10 }}>{product.name}</h1>
              <div className="muted">
                SKU: {product.sku}
                {product.model ? ` • Model: ${product.model}` : ''}
              </div>
            </section>

            <section className="productLayout">
              <div className="card">
                <div className="productHero">
                  {product.primaryImage ? (
                    <img src={product.primaryImage} alt={product.name} />
                  ) : (
                    <div className="emptyBox">{t(lang, 'noImageAvailable')}</div>
                  )}
                </div>

                {product.images?.length > 1 && (
                  <div className="gallery" style={{ marginTop: 12 }}>
                    {product.images.slice(0, 6).map((url) => (
                      <div className="productThumb" key={url}>
                        <img src={url} alt={product.name} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card">
                <div className="price">${Number(product.price || 0).toFixed(2)}</div>
                <div className="muted" style={{ marginTop: 6 }}>
                  {t(lang, 'status')}: {product.status} • {t(lang, 'qty')}: {product.quantity}
                </div>
                {product.location && (
                  <div className="muted">
                    {t(lang, 'location')}: {product.location}
                  </div>
                )}

                <div className="kpiGrid" style={{ marginTop: 14 }}>
                  <div className="kpi">
                    <div className="n">{product.includes_battery ? 'Yes' : 'No'}</div>
                    <div className="t">{t(lang, 'batteryIncluded')}</div>
                  </div>
                  <div className="kpi">
                    <div className="n">{product.includes_charger ? 'Yes' : 'No'}</div>
                    <div className="t">{t(lang, 'chargerIncluded')}</div>
                  </div>
                  <div className="kpi">
                    <div className="n">{product.includes_case ? 'Yes' : 'No'}</div>
                    <div className="t">{t(lang, 'caseIncluded')}</div>
                  </div>
                  <div className="kpi">
                    <div className="n">{product.condition || 'N/A'}</div>
                    <div className="t">{t(lang, 'condition')}</div>
                  </div>
                </div>

                <div style={{ marginTop: 16 }}>
                  <h3>{t(lang, 'description')}</h3>
                  <div className="muted">{product.description || t(lang, 'noDescription')}</div>
                </div>

                <div className="actions">
                  <a
                    className="btn btn-primary"
                    href={`mailto:${BRAND.contact.email}?subject=Interested in ${encodeURIComponent(product.name)}`}
                  >
                    {t(lang, 'messageToBuy')}
                  </a>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

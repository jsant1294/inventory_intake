'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, supabaseConfigError } from '../lib/supabase';
import { useLang } from './LangProvider';

export default function AdminPortalHome() {
  const { lang } = useLang();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      if (!supabase) {
        if (active) {
          setError(supabaseConfigError);
          setLoading(false);
        }
        return;
      }

      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        const currentUser = userData.user || null;
        if (!active) return;
        setUser(currentUser);

        if (currentUser?.user_metadata?.role !== 'admin') {
          setLoading(false);
          return;
        }

        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        const accessToken = sessionData.session?.access_token;
        if (!accessToken) throw new Error(adminTokenText(lang));

        const res = await fetch('/api/admin/products', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error || dashboardLoadErrorText(lang));

        if (active) {
          setProducts(payload.products || []);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError.message || dashboardLoadErrorText(lang));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, [lang]);

  const isAdmin = user?.user_metadata?.role === 'admin';
  const visibleProducts = products.filter((product) => product.active !== false);
  const lowStockProducts = products.filter((product) => Number(product.quantity || 0) > 0 && Number(product.quantity || 0) <= 2);
  const outOfStockProducts = products.filter((product) => Number(product.quantity || 0) <= 0);
  const recentProducts = [...products].slice(0, 5);

  return (
    <div className="stack">
      <section className="hero adminHero">
        <span className="kicker">{portalKickerText(lang)}</span>
        <div className="heroGrid">
          <div>
            <h1>{portalTitleText(lang, isAdmin)}</h1>
            <p className="sub">{portalSubText(lang, isAdmin, user)}</p>
            <div className="actions" style={{ marginTop: 16 }}>
              {isAdmin ? (
                <>
                  <Link href="/intake" className="btn btn-primary">
                    {intakeCtaText(lang)}
                  </Link>
                  <Link href="/inventory" className="btn btn-secondary">
                    {inventoryCtaText(lang)}
                  </Link>
                  <Link href="/store" className="btn btn-secondary">
                    {storefrontCtaText(lang)}
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn btn-primary">
                    {loginCtaText(lang)}
                  </Link>
                  <Link href="/signup" className="btn btn-secondary">
                    {signupCtaText(lang)}
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="card adminCallout">
            <div style={{ fontWeight: 800, marginBottom: 10 }}>{opsCardTitleText(lang)}</div>
            <ul className="listClean">
              {opsCardItems(lang, isAdmin).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {error ? (
        <section className="card">
          <div className="status error">{error}</div>
        </section>
      ) : null}

      {loading ? (
        <section className="card">
          <div className="emptyBox">{loadingText(lang)}</div>
        </section>
      ) : null}

      {!loading && !isAdmin ? (
        <section className="grid2">
          <div className="card">
            <h2 className="sectionTitle">{accessHeadingText(lang)}</h2>
            <p className="sub">{accessBodyText(lang)}</p>
          </div>
          <div className="card">
            <h2 className="sectionTitle">{actionsHeadingText(lang)}</h2>
            <ul className="listClean">
              {guestActions(lang).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {!loading && isAdmin ? (
        <>
          <section className="kpiGrid adminKpiGrid">
            <MetricCard label={totalProductsText(lang)} value={String(products.length)} />
            <MetricCard label={visibleListingsText(lang)} value={String(visibleProducts.length)} />
            <MetricCard label={lowStockText(lang)} value={String(lowStockProducts.length)} />
            <MetricCard label={outOfStockText(lang)} value={String(outOfStockProducts.length)} />
          </section>

          <section className="grid2">
            <div className="card">
              <h2 className="sectionTitle">{quickActionsText(lang)}</h2>
              <div className="adminShortcutGrid">
                <ShortcutCard href="/intake" title={intakeCtaText(lang)} body={intakeBodyText(lang)} />
                <ShortcutCard href="/inventory" title={inventoryCtaText(lang)} body={inventoryBodyText(lang)} />
                <ShortcutCard href="/store" title={storefrontCtaText(lang)} body={storefrontBodyText(lang)} />
              </div>
            </div>
            <div className="card">
              <h2 className="sectionTitle">{watchlistText(lang)}</h2>
              <ul className="listClean">
                <li>{watchlistLineText(lang, lowStockProducts.length, lowStockLabelText(lang))}</li>
                <li>{watchlistLineText(lang, outOfStockProducts.length, outOfStockLabelText(lang))}</li>
                <li>{watchlistLineText(lang, visibleProducts.length, visibleLabelText(lang))}</li>
              </ul>
            </div>
          </section>

          <section className="card">
            <div className="adminSectionHeader">
              <div>
                <h2 className="sectionTitle">{recentInventoryText(lang)}</h2>
                <p className="sub">{recentInventorySubText(lang)}</p>
              </div>
              <Link href="/inventory" className="btn btn-secondary">
                {inventoryCtaText(lang)}
              </Link>
            </div>

            {recentProducts.length === 0 ? (
              <div className="emptyBox">{emptyInventoryText(lang)}</div>
            ) : (
              <table className="tableMock">
                <thead>
                  <tr>
                    <th>{productText(lang)}</th>
                    <th>{brandText(lang)}</th>
                    <th>{modelText(lang)}</th>
                    <th>{stockText(lang)}</th>
                    <th>{statusText(lang)}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentProducts.map((product) => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.brand}</td>
                      <td>{product.model || '-'}</td>
                      <td>{product.quantity}</td>
                      <td>{product.active === false ? hiddenText(lang) : visibleText(lang)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="kpi">
      <div className="n">{value}</div>
      <div className="t">{label}</div>
    </div>
  );
}

function ShortcutCard({ href, title, body }) {
  return (
    <Link href={href} className="featureItem adminShortcutCard">
      <h3>{title}</h3>
      <div className="muted">{body}</div>
    </Link>
  );
}

function portalKickerText(lang) {
  return lang === 'es' ? 'Portal administrativo' : 'Admin portal';
}

function portalTitleText(lang, isAdmin) {
  if (isAdmin) {
    return lang === 'es' ? 'Centro de control para intake e inventario' : 'Control center for intake and inventory';
  }
  return lang === 'es' ? 'Acceso administrativo de JR Tools USA' : 'JR Tools USA administrative access';
}

function portalSubText(lang, isAdmin, user) {
  if (isAdmin) {
    return lang === 'es'
      ? `Conectado como ${user?.email}. Usa este panel para revisar stock, publicar cambios y cargar nuevas herramientas.`
      : `Signed in as ${user?.email}. Use this panel to review stock, publish changes, and intake new tools.`;
  }
  return lang === 'es'
    ? 'Este subdominio es solo para personal autorizado. Inicia sesion para agregar inventario, editar listados y revisar operaciones.'
    : 'This subdomain is for authorized staff only. Sign in to intake inventory, edit listings, and review operations.';
}

function opsCardTitleText(lang) {
  return lang === 'es' ? 'Hoy en operaciones' : 'Operations today';
}

function opsCardItems(lang, isAdmin) {
  if (isAdmin) {
    return lang === 'es'
      ? ['Agregar nuevas herramientas', 'Ajustar visibilidad de productos', 'Revisar niveles bajos de stock']
      : ['Intake newly acquired tools', 'Adjust product visibility', 'Review low-stock items'];
  }
  return lang === 'es'
    ? ['Acceso protegido por autenticacion', 'Carga y edicion de inventario', 'Revision rapida del inventario publico']
    : ['Authentication-protected access', 'Inventory intake and editing', 'Quick review of public inventory'];
}

function loginCtaText(lang) {
  return lang === 'es' ? 'Entrar al portal' : 'Enter portal';
}

function signupCtaText(lang) {
  return lang === 'es' ? 'Crear acceso' : 'Create access';
}

function intakeCtaText(lang) {
  return lang === 'es' ? 'Abrir intake' : 'Open intake';
}

function inventoryCtaText(lang) {
  return lang === 'es' ? 'Ver inventario' : 'View inventory';
}

function storefrontCtaText(lang) {
  return lang === 'es' ? 'Revisar tienda publica' : 'Review public store';
}

function adminTokenText(lang) {
  return lang === 'es' ? 'Inicia sesion como administrador.' : 'Sign in as an administrator.';
}

function dashboardLoadErrorText(lang) {
  return lang === 'es' ? 'No se pudo cargar el resumen administrativo.' : 'Unable to load the admin summary.';
}

function loadingText(lang) {
  return lang === 'es' ? 'Cargando portal...' : 'Loading portal...';
}

function accessHeadingText(lang) {
  return lang === 'es' ? 'Acceso restringido' : 'Restricted access';
}

function accessBodyText(lang) {
  return lang === 'es'
    ? 'Si necesitas permisos para intake o inventario, pide que un administrador active tu rol.'
    : 'If you need intake or inventory permissions, ask an administrator to enable your role.';
}

function actionsHeadingText(lang) {
  return lang === 'es' ? 'Que puedes hacer aqui' : 'What you can do here';
}

function guestActions(lang) {
  return lang === 'es'
    ? ['Iniciar sesion con una cuenta existente', 'Solicitar acceso administrativo', 'Entrar a la tienda publica para revisar listados']
    : ['Sign in with an existing account', 'Request administrative access', 'Open the public store to review listings'];
}

function totalProductsText(lang) {
  return lang === 'es' ? 'Productos cargados' : 'Products loaded';
}

function visibleListingsText(lang) {
  return lang === 'es' ? 'Listados visibles' : 'Visible listings';
}

function lowStockText(lang) {
  return lang === 'es' ? 'Stock bajo' : 'Low stock';
}

function outOfStockText(lang) {
  return lang === 'es' ? 'Sin stock' : 'Out of stock';
}

function quickActionsText(lang) {
  return lang === 'es' ? 'Acciones rapidas' : 'Quick actions';
}

function watchlistText(lang) {
  return lang === 'es' ? 'Resumen de seguimiento' : 'Watchlist summary';
}

function intakeBodyText(lang) {
  return lang === 'es' ? 'Captura una nueva herramienta y guardala en el catalogo.' : 'Capture a newly acquired tool and save it into the catalog.';
}

function inventoryBodyText(lang) {
  return lang === 'es' ? 'Edita nombre, precio, stock y visibilidad desde un solo lugar.' : 'Edit name, price, stock, and visibility from one place.';
}

function storefrontBodyText(lang) {
  return lang === 'es' ? 'Verifica como se ven los productos para los compradores.' : 'Verify how products appear to shoppers.';
}

function watchlistLineText(lang, count, label) {
  return lang === 'es' ? `${count} productos en ${label}.` : `${count} products in ${label}.`;
}

function lowStockLabelText(lang) {
  return lang === 'es' ? 'stock bajo' : 'low stock';
}

function outOfStockLabelText(lang) {
  return lang === 'es' ? 'sin stock' : 'out-of-stock status';
}

function visibleLabelText(lang) {
  return lang === 'es' ? 'estado visible' : 'visible status';
}

function recentInventoryText(lang) {
  return lang === 'es' ? 'Inventario reciente' : 'Recent inventory';
}

function recentInventorySubText(lang) {
  return lang === 'es'
    ? 'Revision rapida de los productos que ya estan cargados en la base.'
    : 'Quick review of products currently loaded in the database.';
}

function emptyInventoryText(lang) {
  return lang === 'es' ? 'Todavia no hay productos cargados.' : 'No products have been loaded yet.';
}

function productText(lang) {
  return lang === 'es' ? 'Producto' : 'Product';
}

function brandText(lang) {
  return lang === 'es' ? 'Marca' : 'Brand';
}

function modelText(lang) {
  return lang === 'es' ? 'Modelo' : 'Model';
}

function stockText(lang) {
  return lang === 'es' ? 'Stock' : 'Stock';
}

function statusText(lang) {
  return lang === 'es' ? 'Estado' : 'Status';
}

function hiddenText(lang) {
  return lang === 'es' ? 'Oculto' : 'Hidden';
}

function visibleText(lang) {
  return lang === 'es' ? 'Visible' : 'Visible';
}

'use client';

import React, { useEffect, useState } from 'react';
import { supabase, supabaseConfigError } from '../lib/supabase';
import { useLang } from './LangProvider';

const emptyEditor = {
  id: '',
  name: '',
  brand: '',
  model: '',
  price: '',
  stock: '',
  description: '',
  active: true,
  images: [],
};

export default function AdminInventoryManager() {
  const { lang } = useLang();
  const [products, setProducts] = useState([]);
  const [editor, setEditor] = useState(emptyEditor);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  async function getAccessToken() {
    if (!supabase) throw new Error(supabaseConfigError);
    const { data, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    const token = data.session?.access_token;
    if (!token) throw new Error(adminOnlyText(lang));
    return token;
  }

  async function loadProducts() {
    setLoading(true);
    setError('');
    try {
      const token = await getAccessToken();
      const res = await fetch('/api/admin/products', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || inventoryErrorText(lang));
      setProducts(data.products || []);
    } catch (loadError) {
      setError(loadError.message || inventoryErrorText(lang));
    } finally {
      setLoading(false);
    }
  }

  function startEdit(product) {
    setEditor({
      id: product.id,
      name: product.name || '',
      brand: product.brand || '',
      model: product.model || '',
      price: String(product.rawPrice ?? product.price ?? 0),
      stock: String(product.rawStock ?? product.quantity ?? 0),
      description: product.description || '',
      active: product.active !== false,
      images: product.images || [],
    });
    setMessage('');
    setError('');
  }

  function cancelEdit() {
    setEditor(emptyEditor);
  }

  async function saveProduct() {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const token = await getAccessToken();
      const formData = new FormData();
      formData.append('name', editor.name);
      formData.append('brand', editor.brand);
      formData.append('model', editor.model);
      formData.append('price', editor.price);
      formData.append('stock', editor.stock);
      formData.append('description', editor.description);
      formData.append('active', String(editor.active));
      editor.images
        .filter((image) => image instanceof File)
        .forEach((image) => formData.append('images', image));

      const res = await fetch(`/api/admin/products/${editor.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || saveErrorText(lang));

      setProducts((prev) => prev.map((product) => (product.id === data.product.id ? data.product : product)));
      setMessage(saveSuccessText(lang));
      setEditor(emptyEditor);
    } catch (saveError) {
      setError(saveError.message || saveErrorText(lang));
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(id) {
    if (!window.confirm(deleteConfirmText(lang))) return;

    setSaving(true);
    setError('');
    setMessage('');
    try {
      const token = await getAccessToken();
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || deleteErrorText(lang));

      setProducts((prev) => prev.filter((product) => product.id !== id));
      if (editor.id === id) setEditor(emptyEditor);
      setMessage(deleteSuccessText(lang));
    } catch (deleteError) {
      setError(deleteError.message || deleteErrorText(lang));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="card">
        <div className="emptyBox">{loadingText(lang)}</div>
      </section>
    );
  }

  return (
    <div className="stack">
      {editor.id && (
        <section className="card">
          <h2 className="sectionTitle">{editTitleText(lang)}</h2>
          <div className="row two">
            <div className="field">
              <label>{productText(lang)}</label>
              <input value={editor.name} onChange={(e) => setEditor((prev) => ({ ...prev, name: e.target.value }))} />
            </div>
            <div className="field">
              <label>{brandText(lang)}</label>
              <input value={editor.brand} onChange={(e) => setEditor((prev) => ({ ...prev, brand: e.target.value }))} />
            </div>
          </div>
          <div className="row three">
            <div className="field">
              <label>{modelText(lang)}</label>
              <input value={editor.model} onChange={(e) => setEditor((prev) => ({ ...prev, model: e.target.value }))} />
            </div>
            <div className="field">
              <label>{priceText(lang)}</label>
              <input type="number" step="0.01" value={editor.price} onChange={(e) => setEditor((prev) => ({ ...prev, price: e.target.value }))} />
            </div>
            <div className="field">
              <label>{qtyText(lang)}</label>
              <input type="number" step="1" value={editor.stock} onChange={(e) => setEditor((prev) => ({ ...prev, stock: e.target.value }))} />
            </div>
          </div>
          <div className="field">
            <label>{descriptionText(lang)}</label>
            <textarea value={editor.description} onChange={(e) => setEditor((prev) => ({ ...prev, description: e.target.value }))} />
          </div>
          <div className="field">
            <label>{imagesText(lang)}</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) =>
                setEditor((prev) => ({
                  ...prev,
                  images: [...(prev.images || []), ...Array.from(e.target.files || [])],
                }))
              }
            />
            {(editor.images || []).length ? (
              <div className="previewGrid" style={{ marginTop: 12 }}>
                {editor.images.map((image, index) => {
                  const isFile = image instanceof File;
                  const src = isFile ? URL.createObjectURL(image) : image;
                  const label = isFile ? image.name : `${existingImageText(lang)} ${index + 1}`;

                  return (
                    <div className="previewCard" key={`${label}-${index}`}>
                      <img src={src} alt={label} />
                      <div className="cap">{label}</div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
          <label className="checkitem" style={{ marginTop: 12 }}>
            <input type="checkbox" checked={editor.active} onChange={(e) => setEditor((prev) => ({ ...prev, active: e.target.checked }))} />
            {visibleText(lang)}
          </label>
          <div className="actions" style={{ marginTop: 16 }}>
            <button className="btn-primary" type="button" disabled={saving} onClick={saveProduct}>
              {saving ? savingText(lang) : saveText(lang)}
            </button>
            <button className="btn-secondary" type="button" disabled={saving} onClick={cancelEdit}>
              {cancelText(lang)}
            </button>
          </div>
        </section>
      )}

      <section className="card">
        <h2 className="sectionTitle">{inventoryManagerText(lang)}</h2>
        {error ? <div className="status error">{error}</div> : null}
        {message ? <div className="status ok">{message}</div> : null}

        {products.length === 0 ? (
          <div className="emptyBox">{emptyInventoryText(lang)}</div>
        ) : (
          <table className="tableMock">
            <thead>
              <tr>
                <th>{productText(lang)}</th>
                <th>{brandText(lang)}</th>
                <th>{modelText(lang)}</th>
                <th>{priceText(lang)}</th>
                <th>{qtyText(lang)}</th>
                <th>{visibilityText(lang)}</th>
                <th>{actionsText(lang)}</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.brand}</td>
                  <td>{product.model || '-'}</td>
                  <td>${Number(product.price || 0).toFixed(2)}</td>
                  <td>{product.quantity}</td>
                  <td>{product.active === false ? hiddenText(lang) : listedText(lang)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button className="btn-secondary" type="button" disabled={saving} onClick={() => startEdit(product)}>
                        {editText(lang)}
                      </button>
                      <button className="btn-secondary" type="button" disabled={saving} onClick={() => deleteProduct(product.id)}>
                        {deleteText(lang)}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

function adminOnlyText(lang) {
  return lang === 'es'
    ? 'Inicia sesion como administrador para administrar el inventario.'
    : 'Log in as an admin to manage inventory.';
}

function inventoryErrorText(lang) {
  return lang === 'es' ? 'No se pudo cargar el inventario.' : 'Unable to load inventory.';
}

function saveErrorText(lang) {
  return lang === 'es' ? 'No se pudo guardar el producto.' : 'Unable to save product.';
}

function deleteErrorText(lang) {
  return lang === 'es' ? 'No se pudo borrar el producto.' : 'Unable to delete product.';
}

function saveSuccessText(lang) {
  return lang === 'es' ? 'Producto actualizado.' : 'Product updated.';
}

function deleteSuccessText(lang) {
  return lang === 'es' ? 'Producto eliminado.' : 'Product deleted.';
}

function deleteConfirmText(lang) {
  return lang === 'es' ? 'Estas seguro de borrar este producto?' : 'Are you sure you want to delete this product?';
}

function loadingText(lang) {
  return lang === 'es' ? 'Cargando inventario...' : 'Loading inventory...';
}

function editTitleText(lang) {
  return lang === 'es' ? 'Editar producto' : 'Edit product';
}

function inventoryManagerText(lang) {
  return lang === 'es' ? 'Administrador de inventario' : 'Inventory manager';
}

function emptyInventoryText(lang) {
  return lang === 'es' ? 'Todavia no hay productos.' : 'No products yet.';
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

function priceText(lang) {
  return lang === 'es' ? 'Precio' : 'Price';
}

function qtyText(lang) {
  return lang === 'es' ? 'Cantidad' : 'Qty';
}

function descriptionText(lang) {
  return lang === 'es' ? 'Descripcion' : 'Description';
}

function imagesText(lang) {
  return lang === 'es' ? 'Imagenes' : 'Images';
}

function existingImageText(lang) {
  return lang === 'es' ? 'Imagen actual' : 'Current image';
}

function visibilityText(lang) {
  return lang === 'es' ? 'Visibilidad' : 'Visibility';
}

function visibleText(lang) {
  return lang === 'es' ? 'Producto visible en la tienda' : 'Product visible in storefront';
}

function listedText(lang) {
  return lang === 'es' ? 'Visible' : 'Visible';
}

function hiddenText(lang) {
  return lang === 'es' ? 'Oculto' : 'Hidden';
}

function actionsText(lang) {
  return lang === 'es' ? 'Acciones' : 'Actions';
}

function saveText(lang) {
  return lang === 'es' ? 'Guardar cambios' : 'Save changes';
}

function savingText(lang) {
  return lang === 'es' ? 'Guardando...' : 'Saving...';
}

function cancelText(lang) {
  return lang === 'es' ? 'Cancelar' : 'Cancel';
}

function editText(lang) {
  return lang === 'es' ? 'Editar' : 'Edit';
}

function deleteText(lang) {
  return lang === 'es' ? 'Borrar' : 'Delete';
}

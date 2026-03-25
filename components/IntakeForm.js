"use client";
import React, { useMemo, useState } from "react";
import { BRAND } from "../config/brand";
import { BRANDS, CATEGORIES, PLATFORMS, CONDITIONS, LOCATIONS } from "../lib/options";
import { useLang } from "./LangProvider";
import { formatText, t } from "../lib/translations";

const initialForm = {
  product_name: "",
  brand_name: BRAND.inventoryDefaults.defaultBrand,
  model_number: "",
  category_name: BRAND.inventoryDefaults.defaultCategory,
  battery_platform: BRAND.inventoryDefaults.defaultPlatform,
  condition: BRAND.inventoryDefaults.defaultCondition,
  location: BRAND.inventoryDefaults.defaultLocation,
  quantity_on_hand: 1,
  purchase_cost: "",
  target_sale_price: "",
  notes: "",
  includes_battery: false,
  includes_charger: false,
  includes_case: false
};

export default function IntakeForm() {
  const { lang } = useLang();
  const [form, setForm] = useState(initialForm);
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const estimatedProfit = useMemo(() => Number(form.target_sale_price || 0) - Number(form.purchase_cost || 0), [form.purchase_cost, form.target_sale_price]);
  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const onFilesChange = (e) => setImages(Array.from(e.target.files || []));

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      images.forEach((img) => fd.append("images", img));
      const res = await fetch("/api/intake", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t(lang, "genericError"));
      setStatus({ type: "ok", message: formatText(lang, "savedMsg", { sku: data.sku, count: data.image_urls.length }) });
      setForm(initialForm);
      setImages([]);
      const input = document.getElementById("images");
      if (input) input.value = "";
    } catch (err) {
      setStatus({ type: "error", message: err.message || t(lang, "genericError") });
    } finally {
      setLoading(false);
    }
  }

  const previews = images.map((file) => ({ name: file.name, url: URL.createObjectURL(file) }));

  return (
    <div className="card">
      <h2 className="sectionTitle">{t(lang, "mobileIntake")}</h2>
      <form onSubmit={handleSubmit}>
        <div className="row two">
          <div className="field"><label>{t(lang, "productName")}</label><input value={form.product_name} onChange={(e) => update("product_name", e.target.value)} placeholder="Milwaukee M18 Fuel Hammer Drill" required /></div>
          <div className="field"><label>{t(lang, "modelNumber")}</label><input value={form.model_number} onChange={(e) => update("model_number", e.target.value)} placeholder="2904-20" /></div>
        </div>
        <div className="row three">
          <div className="field"><label>{t(lang, "brand")}</label><select value={form.brand_name} onChange={(e) => update("brand_name", e.target.value)}>{BRANDS.map((v) => <option key={v}>{v}</option>)}</select></div>
          <div className="field"><label>{t(lang, "category")}</label><select value={form.category_name} onChange={(e) => update("category_name", e.target.value)}>{CATEGORIES.map((v) => <option key={v}>{v}</option>)}</select></div>
          <div className="field"><label>{t(lang, "batteryPlatform")}</label><select value={form.battery_platform} onChange={(e) => update("battery_platform", e.target.value)}>{PLATFORMS.map((v) => <option key={v}>{v}</option>)}</select></div>
        </div>
        <div className="row three">
          <div className="field"><label>{t(lang, "conditionLabel")}</label><select value={form.condition} onChange={(e) => update("condition", e.target.value)}>{CONDITIONS.map((v) => <option key={v}>{v}</option>)}</select></div>
          <div className="field"><label>{t(lang, "locationLabel")}</label><select value={form.location} onChange={(e) => update("location", e.target.value)}>{LOCATIONS.map((v) => <option key={v}>{v}</option>)}</select></div>
          <div className="field"><label>{t(lang, "quantity")}</label><input type="number" min="1" value={form.quantity_on_hand} onChange={(e) => update("quantity_on_hand", e.target.value)} /></div>
        </div>
        <div className="row two">
          <div className="field"><label>{t(lang, "purchaseCost")}</label><input type="number" step="0.01" value={form.purchase_cost} onChange={(e) => update("purchase_cost", e.target.value)} placeholder="120" /></div>
          <div className="field"><label>{t(lang, "targetSalePrice")}</label><input type="number" step="0.01" value={form.target_sale_price} onChange={(e) => update("target_sale_price", e.target.value)} placeholder="180" /></div>
        </div>
        <div className="kpiGrid" style={{ marginBottom: 12 }}>
          <div className="kpi"><div className="n">${Number(form.purchase_cost || 0).toFixed(2)}</div><div className="t">{t(lang, "purchaseCostMini")}</div></div>
          <div className="kpi"><div className="n">${Number(form.target_sale_price || 0).toFixed(2)}</div><div className="t">{t(lang, "targetSaleMini")}</div></div>
          <div className="kpi"><div className="n">${estimatedProfit.toFixed(2)}</div><div className="t">{t(lang, "estimatedProfit")}</div></div>
          <div className="kpi"><div className="n">{images.length}</div><div className="t">{t(lang, "imagesSelected")}</div></div>
        </div>
        <div className="field">
          <label>{t(lang, "photos")}</label>
          <input id="images" type="file" accept="image/*" multiple capture="environment" onChange={onFilesChange} />
          <div className="note">{t(lang, "photoHint")}</div>
        </div>
        {!!previews.length && <div className="previewGrid">{previews.map((p, i) => <div className="previewCard" key={i}><img src={p.url} alt={p.name} /><div className="cap">{p.name}</div></div>)}</div>}
        <div className="field" style={{ marginTop: 12 }}>
          <label>{t(lang, "notes")}</label>
          <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder={t(lang, "notesPlaceholder")} />
        </div>
        <div className="checkgrid">
          <label className="checkitem"><input type="checkbox" checked={form.includes_battery} onChange={(e) => update("includes_battery", e.target.checked)} />{t(lang, "includesBattery")}</label>
          <label className="checkitem"><input type="checkbox" checked={form.includes_charger} onChange={(e) => update("includes_charger", e.target.checked)} />{t(lang, "includesCharger")}</label>
          <label className="checkitem"><input type="checkbox" checked={form.includes_case} onChange={(e) => update("includes_case", e.target.checked)} />{t(lang, "includesCase")}</label>
        </div>
        <div className="actions">
          <button className="btn-primary" type="submit" disabled={loading}>{loading ? t(lang, "saving") : t(lang, "saveProduct")}</button>
          <button className="btn-secondary" type="button" onClick={() => { setForm(initialForm); setImages([]); setStatus(null); const input = document.getElementById("images"); if (input) input.value = ""; }}>{t(lang, "reset")}</button>
        </div>
        {status && <div className={`status ${status.type}`}>{status.message}</div>}
      </form>
    </div>
  );
}

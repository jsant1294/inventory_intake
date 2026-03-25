
"use client";
import React, { useEffect, useState } from "react";
import NavBar from "../../components/NavBar";
import StoreProductCard from "../../components/StoreProductCard";
import { useLang } from "../../components/LangProvider";
import { t } from "../../lib/translations";

export default function StorePage() {
  const { lang } = useLang();
  const [products, setProducts] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/store");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Unable to load products.");
        setProducts(data.products || []);
      } catch (error) {
        setErrorMessage(error.message || "Unable to load products.");
      }
    }
    load();
  }, []);

  return (
    <main className="page">
      <div className="shell stack">
        <NavBar />
        <section className="card">
          <h1 style={{ marginTop: 0 }}>{t(lang, "storefrontTitle")}</h1>
          <p className="sub">{t(lang, "storefrontSub")}</p>
        </section>

        {errorMessage ? (
          <div className="card">
            <div className="status error">{errorMessage}</div>
            <div className="note">{t(lang, "storeErrorHint")}</div>
          </div>
        ) : products.length === 0 ? (
          <div className="card"><div className="emptyBox">{t(lang, "noProducts")}</div></div>
        ) : (
          <section className="cardsGrid">
            {products.map((product) => <StoreProductCard key={product.sku} product={product} />)}
          </section>
        )}
      </div>
    </main>
  );
}

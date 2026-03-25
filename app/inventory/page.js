
"use client";
import React from "react";
import NavBar from "../../components/NavBar";
import InventoryMock from "../../components/InventoryMock";
import { useLang } from "../../components/LangProvider";
import { t } from "../../lib/translations";

export default function InventoryPage() {
  const { lang } = useLang();

  return (
    <main className="page">
      <div className="shell stack">
        <NavBar />
        <section className="card">
          <h1 style={{ marginTop: 0 }}>{t(lang, "inventoryTitle")}</h1>
          <p className="sub">{t(lang, "inventorySub")}</p>
        </section>
        <InventoryMock />
      </div>
    </main>
  );
}

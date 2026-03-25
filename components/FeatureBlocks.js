'use client';

import { useLang } from './LangProvider';
import React from 'react';

export default function FeatureBlocks() {
  const { lang } = useLang();
  const items =
    lang === 'es'
      ? [
          {
            title: 'Muestra tus herramientas',
            body: 'Publica tus herramientas con fotos, precios y condición para que los clientes las vean fácilmente.',
          },
          {
            title: 'Agrega inventario fácil',
            body: 'Solo ingresa los detalles, toma fotos y guarda. Así de simple para el encargado de tienda.',
          },
        ]
      : [
          {
            title: 'Show your tools for sale',
            body: 'List your tools with clear photos, prices, and condition so customers can easily browse.',
          },
          {
            title: 'Add inventory easily',
            body: 'Just enter details, snap photos, and save. Simple for any storekeeper or staff.',
          },
        ];

  return (
    <section className="featureGrid">
      {items.map((item) => (
        <div className="featureItem" key={item.title}>
          <h3>{item.title}</h3>
          <div className="muted">{item.body}</div>
        </div>
      ))}
    </section>
  );
}

'use client';

import { useLang } from './LangProvider';
import { t } from '../lib/translations';
import React from 'react';

export default function InventoryMock() {
  const { lang } = useLang();
  const rows = [
    [
      lang === 'es' ? 'Taladro Milwaukee M18' : 'Milwaukee M18 Drill',
      '2904-20',
      lang === 'es' ? 'Buen usado' : 'Good Used',
      '$180',
      lang === 'es' ? 'En stock' : 'In Stock',
    ],
    [
      lang === 'es' ? 'Destornillador DeWalt' : 'DeWalt Impact Driver',
      'DCF850',
      lang === 'es' ? 'Excelente usado' : 'Excellent Used',
      '$140',
      lang === 'es' ? 'En stock' : 'In Stock',
    ],
    [
      lang === 'es' ? 'Esmeriladora Makita' : 'Makita Grinder',
      'XAG04',
      lang === 'es' ? 'Nuevo en caja abierta' : 'New Open Box',
      '$120',
      lang === 'es' ? 'Pocas unidades' : 'Low Stock',
    ],
  ];

  return (
    <div className="card">
      <h2 className="sectionTitle">{t(lang, 'inventoryPreview')}</h2>
      <table className="tableMock">
        <thead>
          <tr>
            <th>{t(lang, 'invProduct')}</th>
            <th>{t(lang, 'invModel')}</th>
            <th>{t(lang, 'invCondition')}</th>
            <th>{t(lang, 'invPrice')}</th>
            <th>{t(lang, 'invStatus')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.join('-')}>
              {r.map((c) => (
                <td key={c}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

'use client';
import React from 'react';
import NavBar from '../components/NavBar';
import AdminPortalHome from '../components/AdminPortalHome';

export default function HomePage() {
  return (
    <main className="page">
      <div className="shell stack">
        <NavBar />
        <AdminPortalHome />
      </div>
    </main>
  );
}

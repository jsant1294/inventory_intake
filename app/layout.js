import "./globals.css";
import { LangProvider } from "../components/LangProvider";
import React from "react";
export const metadata = {
  title: "JR Tools USA v3.1 Bilingual",
  description: "Bilingual storefront and intake system for JR Tools USA."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}

"use client";
import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, supabaseConfigError } from "../../lib/supabase";

export default function ResetPasswordPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://admin.jrtoolsusa.com";
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleReset(e) {
    e.preventDefault();
    if (!supabase) {
      setError(supabaseConfigError);
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(false);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/login`,
    });
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => router.replace("/login"), 3000);
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: 24, border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>Reset Password</h2>
      <form onSubmit={handleReset}>
        <div style={{ marginBottom: 12 }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>
        {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}
        {success && <div style={{ color: "green", marginBottom: 12 }}>Password reset email sent! Check your inbox.</div>}
        <button type="submit" disabled={loading} style={{ width: "100%", padding: 10 }}>
          {loading ? "Sending..." : "Send Reset Email"}
        </button>
      </form>
    </div>
  );
}

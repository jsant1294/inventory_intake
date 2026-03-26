"use client";

export const dynamic = "force-dynamic";

import React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, supabaseConfigError } from "../../lib/supabase";

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.replace("/login");
        setLoading(false);
        return;
      }

      const role = data.user.user_metadata?.role;
      if (role === "admin") {
        router.replace("/intake");
      } else {
        router.replace("/"); // redirect non-admins
      }
      setLoading(false);
    };
    getUser();
  }, [router]);

  if (loading) return <div>Loading...</div>;
  if (!supabase) return <div>{supabaseConfigError}</div>;
  return null;
}

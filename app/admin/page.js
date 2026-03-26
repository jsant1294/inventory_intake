"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.replace("/login");
        setLoading(false);
        return;
      }
      setUser(data.user);
      // Fetch user role from Supabase (assumes 'role' in user_metadata)
      const role = data.user.user_metadata?.role;
      if (role === "admin") {
        setIsAdmin(true);
      } else {
        router.replace("/"); // redirect non-admins
      }
      setLoading(false);
    };
    getUser();
  }, [router]);

  if (loading) return <div>Loading...</div>;
  if (!user || !isAdmin) return null;

  return (
    <div style={{ padding: 32 }}>
      <h1>Admin Only Page</h1>
      <p>Welcome, {user.email} (admin)!</p>
      <button
        onClick={async () => {
          await supabase.auth.signOut();
          router.replace("/login");
        }}
      >
        Sign Out
      </button>
    </div>
  );
}

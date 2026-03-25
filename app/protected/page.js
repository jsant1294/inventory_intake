"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function ProtectedPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.replace("/login");
      } else {
        setUser(data.user);
      }
      setLoading(false);
    };
    getUser();
  }, [router]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div style={{ padding: 32 }}>
      <h1>Protected Page</h1>
      <p>Welcome, {user.email}!</p>
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

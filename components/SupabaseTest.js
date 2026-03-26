import { supabase } from '../lib/supabase';
import { useEffect, useState } from 'react';

export default function SupabaseTest() {
  const [status, setStatus] = useState('Testing Supabase connection...');
  const [row, setRow] = useState(null);

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .limit(1)
      .then(({ data, error }) => {
        if (error) {
          setStatus('❌ Supabase connection failed: ' + error.message);
        } else if (data && data.length > 0) {
          setStatus('✅ Supabase connection successful!');
          setRow(data[0]);
        } else {
          setStatus('⚠️ Supabase connected, but no data found in products table.');
        }
      });
  }, []);

  return (
    <div style={{ padding: 24, background: '#222', color: '#fff', borderRadius: 8, margin: 24 }}>
      <h3>Supabase Connection Test</h3>
      <div>{status}</div>
      {row && (
        <pre style={{ marginTop: 12, background: '#333', padding: 12, borderRadius: 4 }}>
          {JSON.stringify(row, null, 2)}
        </pre>
      )}
    </div>
  );
}

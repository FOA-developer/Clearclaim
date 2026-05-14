'use client';
import { useState, useEffect } from 'react';

export default function Claims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/claims')
      .then(res => res.json())
      .then(data => {
        setClaims(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ padding: '2rem' }}>Loading Claims...</div>;

  return (
    <div className="animate-in fade-in duration-500">
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem', fontWeight: 'bold' }}>All Claims History</h1>
      
      <div className="card glass" style={{ overflow: 'hidden', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--surface-border)', backgroundColor: 'var(--background)' }}>
              <th style={{ padding: '1rem', color: '#8b949e', fontWeight: 500 }}>Claim ID</th>
              <th style={{ padding: '1rem', color: '#8b949e', fontWeight: 500 }}>Reference</th>
              <th style={{ padding: '1rem', color: '#8b949e', fontWeight: 500 }}>Amount</th>
              <th style={{ padding: '1rem', color: '#8b949e', fontWeight: 500 }}>Verdict</th>
              <th style={{ padding: '1rem', color: '#8b949e', fontWeight: 500 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {claims.map((row) => (
              <tr key={row._id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.8rem' }}>{row._id}</td>
                <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{row.transactionRef}</td>
                <td style={{ padding: '1rem', fontWeight: 'bold' }}>₦{(row?.amount ?? 0).toLocaleString()}</td>
                <td style={{ padding: '1rem' }}>
                  <span className={`badge ${row.analysis.verdict === 'PASS' ? 'badge-success' : row.analysis.verdict === 'FAIL' ? 'badge-danger' : 'badge-warning'}`}>
                    {row.analysis.verdict}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span className="badge badge-neutral">{row.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

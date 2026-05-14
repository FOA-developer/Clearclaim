'use client';
import { useState, useEffect } from 'react';

export default function SquadPayments() {
  const [balanceData, setBalanceData] = useState({ balance: 0, currency: 'NGN' });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch balance and recent activities
    Promise.all([
      fetch('/api/squad/balance').then(res => res.json()),
      fetch('/api/claims').then(res => res.json())
    ]).then(([balance, claims]) => {
      setBalanceData(balance);
      setActivities(Array.isArray(claims) ? claims.slice(0, 10) : []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{ padding: '2rem' }}>Syncing Ledger...</div>;

  return (
    <div className="animate-in fade-in duration-500">
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem', fontWeight: 'bold' }}>Squad Ledger & Escrow</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card glass" style={{ borderLeft: '4px solid var(--primary)' }}>
          <h3 style={{ color: '#8b949e', fontSize: '0.875rem' }}>Dynamic Ledger Balance</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
            ₦{((balanceData?.balance ?? 0) / 100).toLocaleString()}
          </p>
          <p style={{ color: '#8b949e', fontSize: '0.8rem' }}>Currency: {balanceData.currency}</p>
        </div>
        <div className="card glass" style={{ borderLeft: '4px solid var(--warning)' }}>
          <h3 style={{ color: '#8b949e', fontSize: '0.875rem' }}>Active Escrow (Held)</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
            ₦{(activities?.reduce((acc, curr) => curr.status === 'HELD_IN_REVIEW' ? acc + (curr.amount || 0) : acc, 0) ?? 0).toLocaleString()}
          </p>
        </div>
      </div>

      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>Escrow Ledger Activity</h2>
      <div className="card glass" style={{ overflow: 'hidden', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
              <th style={{ padding: '1rem', color: '#8b949e', fontWeight: 500 }}>Tx Ref</th>
              <th style={{ padding: '1rem', color: '#8b949e', fontWeight: 500 }}>Action</th>
              <th style={{ padding: '1rem', color: '#8b949e', fontWeight: 500 }}>Amount</th>
              <th style={{ padding: '1rem', color: '#8b949e', fontWeight: 500 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {activities.length > 0 ? activities.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{row.transactionRef}</td>
                <td style={{ padding: '1rem' }}>
                  {row.status === 'PAID_OUT' ? 'Escrow Release' : row.status === 'REFUNDED' ? 'Refunded' : 'Escrow Hold'}
                </td>
                <td style={{ padding: '1rem', fontWeight: 'bold' }}>₦{(row?.amount ?? 0).toLocaleString()}</td>
                <td style={{ padding: '1rem' }}>
                  <span className={`badge ${row.status === 'PAID_OUT' ? 'badge-success' : row.status === 'REFUNDED' ? 'badge-danger' : 'badge-warning'}`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#8b949e' }}>No ledger activity found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

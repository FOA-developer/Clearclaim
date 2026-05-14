'use client';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalAmount: 0,
    fraudCount: 0,
    escrowAmount: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => console.error('Failed to fetch stats', err));
  }, []);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Dashboard...</div>;

  return (
    <div style={{ animation: 'fade-in 0.5s ease-out' }}>
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem', fontWeight: 'bold' }}>Platform Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="card glass">
          <h3 style={{ color: '#8b949e', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Processed</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
            ₦{stats.totalAmount.toLocaleString()}
          </p>
          <p style={{ color: 'var(--success)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Live from Ledger</p>
        </div>
        
        <div className="card glass">
          <h3 style={{ color: '#8b949e', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fraud Prevented</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--danger)' }}>{stats.fraudCount}</p>
          <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Anomalies flagged</p>
        </div>

        <div className="card glass">
          <h3 style={{ color: '#8b949e', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>In Escrow (Squad)</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--warning)' }}>
            ₦{stats.escrowAmount.toLocaleString()}
          </p>
          <p style={{ color: 'var(--warning)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Awaiting clearance</p>
        </div>
      </div>

      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>Recent Activity</h2>
      <div className="card glass" style={{ overflow: 'hidden', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
              <th style={{ padding: '1rem', color: '#8b949e', fontWeight: 500 }}>Transaction Ref</th>
              <th style={{ padding: '1rem', color: '#8b949e', fontWeight: 500 }}>Amount</th>
              <th style={{ padding: '1rem', color: '#8b949e', fontWeight: 500 }}>Verdict</th>
              <th style={{ padding: '1rem', color: '#8b949e', fontWeight: 500 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentActivity.length > 0 ? stats.recentActivity.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{row.transactionRef}</td>
                <td style={{ padding: '1rem' }}>₦{row.amount.toLocaleString()}</td>
                <td style={{ padding: '1rem' }}>
                  <span className={`badge ${row.analysis.verdict === 'PASS' ? 'badge-success' : row.analysis.verdict === 'FAIL' ? 'badge-danger' : 'badge-warning'}`}>
                    {row.analysis.verdict}
                  </span>
                </td>
                <td style={{ padding: '1rem', color: '#8b949e' }}>{row.status}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#8b949e' }}>No recent activity found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

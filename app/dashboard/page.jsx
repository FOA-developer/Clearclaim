export default function Dashboard() {
  return (
    <div style={{ animation: 'fade-in 0.5s ease-out' }}>
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem', fontWeight: 'bold' }}>Platform Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="card glass">
          <h3 style={{ color: '#8b949e', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Processed</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>₦14.2M</p>
          <p style={{ color: 'var(--success)', fontSize: '0.875rem', marginTop: '0.5rem' }}>+12% from last month</p>
        </div>
        
        <div className="card glass">
          <h3 style={{ color: '#8b949e', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fraud Prevented</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--danger)' }}>₦1.8M</p>
          <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginTop: '0.5rem' }}>4 anomalies detected</p>
        </div>

        <div className="card glass">
          <h3 style={{ color: '#8b949e', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>In Escrow (Squad)</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--warning)' }}>₦450K</p>
          <p style={{ color: 'var(--warning)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Pending reviews</p>
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
              <th style={{ padding: '1rem', color: '#8b949e', fontWeight: 500 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {[
              { ref: 'SQ-PAY-8829', amount: '₦250,000', verdict: 'PASS', action: 'Payout Initiated' },
              { ref: 'SQ-PAY-8830', amount: '₦45,000', verdict: 'FAIL', action: 'Refunded via Squad' },
              { ref: 'SQ-PAY-8831', amount: '₦120,000', verdict: 'REVIEW', action: 'Held in Escrow' },
            ].map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{row.ref}</td>
                <td style={{ padding: '1rem' }}>{row.amount}</td>
                <td style={{ padding: '1rem' }}>
                  <span className={`badge ${row.verdict === 'PASS' ? 'badge-success' : row.verdict === 'FAIL' ? 'badge-danger' : 'badge-warning'}`}>
                    {row.verdict}
                  </span>
                </td>
                <td style={{ padding: '1rem', color: '#8b949e' }}>{row.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function SquadPayments() {
  return (
    <div className="animate-in fade-in duration-500">
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem', fontWeight: 'bold' }}>Squad Ledger & Escrow</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card glass" style={{ borderLeft: '4px solid var(--primary)' }}>
          <h3 style={{ color: '#8b949e', fontSize: '0.875rem' }}>Dynamic Virtual Accounts (Active)</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>14</p>
        </div>
        <div className="card glass" style={{ borderLeft: '4px solid var(--warning)' }}>
          <h3 style={{ color: '#8b949e', fontSize: '0.875rem' }}>Total Escrow Balance</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>₦450,000</p>
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
            {[
              { ref: 'SQ-ESC-892', action: 'Escrow Release to GTB (000013)', amount: '₦120,000', status: 'COMPLETED' },
              { ref: 'SQ-REF-893', action: 'Refund to Origin', amount: '₦45,000', status: 'COMPLETED' },
              { ref: 'SQ-ESC-894', action: 'Payment Initiation (Hold)', amount: '₦250,000', status: 'PENDING' },
            ].map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{row.ref}</td>
                <td style={{ padding: '1rem' }}>{row.action}</td>
                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{row.amount}</td>
                <td style={{ padding: '1rem' }}>
                  <span className={`badge ${row.status === 'COMPLETED' ? 'badge-success' : 'badge-warning'}`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

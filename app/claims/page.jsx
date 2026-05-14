export default function Claims() {
  return (
    <div className="animate-in fade-in duration-500">
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem', fontWeight: 'bold' }}>All Claims</h1>
      
      <div className="card glass" style={{ overflow: 'hidden', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--surface-border)', backgroundColor: 'var(--background)' }}>
              <th style={{ padding: '1rem', color: '#8b949e', fontWeight: 500 }}>Claim ID</th>
              <th style={{ padding: '1rem', color: '#8b949e', fontWeight: 500 }}>Date</th>
              <th style={{ padding: '1rem', color: '#8b949e', fontWeight: 500 }}>Score</th>
              <th style={{ padding: '1rem', color: '#8b949e', fontWeight: 500 }}>Verdict</th>
            </tr>
          </thead>
          <tbody>
            {[
              { id: 'PAY-1100', date: '2026-05-14', score: 95, verdict: 'PASS' },
              { id: 'PAY-1101', date: '2026-05-14', score: 25, verdict: 'FAIL' },
              { id: 'PAY-1102', date: '2026-05-13', score: 65, verdict: 'REVIEW' },
              { id: 'PAY-1103', date: '2026-05-13', score: 98, verdict: 'PASS' },
            ].map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{row.id}</td>
                <td style={{ padding: '1rem', color: '#8b949e' }}>{row.date}</td>
                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{row.score}/100</td>
                <td style={{ padding: '1rem' }}>
                  <span className={`badge ${row.verdict === 'PASS' ? 'badge-success' : row.verdict === 'FAIL' ? 'badge-danger' : 'badge-warning'}`}>
                    {row.verdict}
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

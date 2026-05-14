export default function ApiDocs() {
  return (
    <div className="animate-in fade-in duration-500">
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem', fontWeight: 'bold' }}>API Documentation</h1>
      
      <div className="card glass">
        <h2 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>POST /api/verify/payroll</h2>
        <p style={{ color: '#8b949e', marginBottom: '1rem' }}>Initiates an AI verification scan on payroll data and automatically handles Squad escrow rules based on the trust score.</p>
        
        <h3 style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>Request Body</h3>
        <pre style={{ backgroundColor: 'var(--background)', padding: '1rem', borderRadius: '6px', overflowX: 'auto', marginBottom: '1.5rem', border: '1px solid var(--surface-border)' }}>
{`{
  "records": [
    {
      "name": "John Doe",
      "accountNumber": "0123456789",
      "bankCode": "000013",
      "amount": 150000,
      "attendanceDays": 20,
      "expectedPay": 200000
    }
  ]
}`}
        </pre>

        <h3 style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>Response (200 OK)</h3>
        <pre style={{ backgroundColor: 'var(--background)', padding: '1rem', borderRadius: '6px', overflowX: 'auto', border: '1px solid var(--surface-border)' }}>
{`{
  "trustScore": 85,
  "verdict": "PASS",
  "anomalies": [],
  "squadDetails": {
    "transactionRef": "SQ-PAY-8835",
    "status": "Escrow Initiated"
  }
}`}
        </pre>
      </div>
    </div>
  );
}

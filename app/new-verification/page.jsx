'use client';
import { useState } from 'react';

export default function NewVerification() {
  const [status, setStatus] = useState('idle'); // idle, scanning, result
  const [result, setResult] = useState(null);
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    setStatus('scanning');

    // Sample data for the AI engine
    // In a production app, this would come from a file upload parser
    const sampleRecords = [
      { name: 'Employee A', accountNumber: '0123456789', amount: amount * 0.6, attendanceDays: 20, expectedPay: amount * 0.6 },
      { name: 'Employee B', accountNumber: '0123456789', amount: amount * 0.4, attendanceDays: 15, expectedPay: amount * 0.4 }
    ];

    try {
      const response = await fetch('/api/verify/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          records: sampleRecords,
          email: email,
          amount: parseFloat(amount)
        })
      });

      const data = await response.json();
      setResult(data);
      setStatus('result');
    } catch (error) {
      console.error('Verification failed', error);
      setStatus('idle');
      alert('Verification failed. Check console for details.');
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem', fontWeight: 'bold' }}>New Payroll Verification</h1>
      
      {status === 'idle' && (
        <div className="card glass" style={{ maxWidth: '600px' }}>
          <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Recipient Email (for Squad)</label>
              <input 
                type="email" 
                className="input" 
                placeholder="hr@company.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Total Payroll Amount (NGN)</label>
              <input 
                type="number" 
                className="input" 
                placeholder="500000" 
                required 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Upload Payroll File (CSV/JSON)</label>
              <div style={{ border: '2px dashed var(--surface-border)', padding: '2rem', textAlign: 'center', borderRadius: '8px', backgroundColor: 'rgba(22, 27, 34, 0.4)' }}>
                <p style={{ color: '#8b949e' }}>Sample data will be used for the AI analysis in this simulation</p>
              </div>
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem', fontSize: '1.1rem' }}>
              Verify & Initiate Escrow
            </button>
          </form>
        </div>
      )}

      {status === 'scanning' && (
        <div className="card glass" style={{ maxWidth: '600px', textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 2rem' }}>
            <div className="animate-pulse" style={{ position: 'absolute', inset: 0, border: '4px solid var(--primary)', borderRadius: '50%' }}></div>
            <div style={{ position: 'absolute', inset: '10px', backgroundColor: 'var(--surface)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '2rem' }}>🤖</span>
            </div>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', backgroundColor: 'var(--primary)', boxShadow: '0 0 10px var(--primary)', animation: 'scan 1.5s ease-in-out infinite alternate', borderRadius: '2px' }}></div>
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>AI Verification Engine Running</h2>
          <p style={{ color: '#8b949e' }}>Analyzing records for anomalies and duplicate accounts...</p>
          <style dangerouslySetInnerHTML={{__html: `@keyframes scan { 0% { top: 0%; } 100% { top: 100%; } }`}} />
        </div>
      )}

      {status === 'result' && result && (
        <div className="card glass" style={{ maxWidth: '600px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'inline-block', padding: '1rem', borderRadius: '50%', backgroundColor: result.analysis.verdict === 'PASS' ? 'rgba(46, 160, 67, 0.15)' : 'rgba(248, 81, 73, 0.15)', color: result.analysis.verdict === 'PASS' ? 'var(--success)' : 'var(--danger)', marginBottom: '1rem' }}>
              <span style={{ fontSize: '3rem', lineHeight: 1 }}>{result.analysis.trustScore}</span>
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Trust Score</h2>
            <span className={`badge ${result.analysis.verdict === 'PASS' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '1rem', padding: '0.25rem 0.75rem' }}>
              {result.analysis.verdict}
            </span>
          </div>

          <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#8b949e' }}>Squad Transaction Ref:</span>
              <span style={{ fontFamily: 'monospace' }}>{result.transactionRef}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#8b949e' }}>Anomalies Found:</span>
              <span>{result.analysis.anomalies.length}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            {result.checkoutUrl && (
              <a href={result.checkoutUrl} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ flex: 1, textDecoration: 'none' }}>
                Complete Squad Escrow
              </a>
            )}
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setStatus('idle')}>New Verification</button>
          </div>
        </div>
      )}
    </div>
  );
}

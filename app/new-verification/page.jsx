'use client';
import { useState } from 'react';

export default function NewVerification() {
  const [status, setStatus] = useState('idle'); // idle, scanning, result
  const [result, setResult] = useState(null);

  const startScan = (e) => {
    e.preventDefault();
    setStatus('scanning');
    
    // Simulate AI processing and squad escrow
    setTimeout(() => {
      setResult({
        score: 85,
        verdict: 'PASS',
        anomalies: [],
        transactionRef: `SQ-PAY-${Math.floor(Math.random() * 10000)}`
      });
      setStatus('result');
    }, 3000);
  };

  return (
    <div className="animate-in fade-in duration-500">
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem', fontWeight: 'bold' }}>New Payroll Verification</h1>
      
      {status === 'idle' && (
        <div className="card glass" style={{ maxWidth: '600px' }}>
          <form onSubmit={startScan} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Upload Payroll Document (CSV/JSON)</label>
              <div style={{ border: '2px dashed var(--surface-border)', padding: '3rem', textAlign: 'center', borderRadius: '8px', cursor: 'pointer', backgroundColor: 'rgba(22, 27, 34, 0.4)' }}>
                <p style={{ color: '#8b949e' }}>Drag and drop file here, or click to browse</p>
              </div>
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem', fontSize: '1.1rem' }}>
              Upload and Verify
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
            {/* Scanning line */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', backgroundColor: 'var(--primary)', boxShadow: '0 0 10px var(--primary)', animation: 'scan 1.5s ease-in-out infinite alternate', borderRadius: '2px' }}></div>
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>AI Verification Engine Running</h2>
          <p style={{ color: '#8b949e' }}>Cross-referencing ledger anomalies and duplicate records...</p>

          <style dangerouslySetInnerHTML={{__html: `
            @keyframes scan {
              0% { top: 0%; }
              100% { top: 100%; }
            }
          `}} />
        </div>
      )}

      {status === 'result' && result && (
        <div className="card glass" style={{ maxWidth: '600px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'inline-block', padding: '1rem', borderRadius: '50%', backgroundColor: result.verdict === 'PASS' ? 'rgba(46, 160, 67, 0.15)' : 'rgba(248, 81, 73, 0.15)', color: result.verdict === 'PASS' ? 'var(--success)' : 'var(--danger)', marginBottom: '1rem' }}>
              <span style={{ fontSize: '3rem', lineHeight: 1 }}>{result.score}</span>
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Trust Score</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ color: '#8b949e' }}>Verdict:</span>
              <span className={`badge ${result.verdict === 'PASS' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '1rem', padding: '0.25rem 0.75rem' }}>
                {result.verdict}
              </span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#8b949e' }}>Squad Transaction Ref:</span>
              <span style={{ fontFamily: 'monospace' }}>{result.transactionRef}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#8b949e' }}>Escrow Status:</span>
              <span style={{ color: 'var(--warning)' }}>Pending Clearance</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setStatus('idle')}>Verify Another</button>
            <button className="btn btn-outline" style={{ flex: 1 }}>View Details</button>
          </div>
        </div>
      )}
    </div>
  );
}

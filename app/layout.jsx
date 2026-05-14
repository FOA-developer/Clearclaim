import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'ClearClaim - AI Payroll Verification',
  description: 'AI-powered payroll anomaly detection and enforcement platform.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <aside style={{ width: '250px', borderRight: '1px solid var(--surface-border)', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <h2 style={{ color: 'var(--primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>⚡</span> ClearClaim
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#8b949e' }}>Payroll Fraud Prevention</p>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link href="/dashboard" className="nav-link">Dashboard</Link>
              <Link href="/new-verification" className="nav-link">New Verification</Link>
              <Link href="/review-queue" className="nav-link">Review Queue</Link>
              <Link href="/claims" className="nav-link">All Claims</Link>
              <Link href="/squad-payments" className="nav-link">Squad Ledger</Link>
              <Link href="/api-docs" className="nav-link">API Docs</Link>
            </nav>
            
            <div style={{ marginTop: 'auto', fontSize: '0.8rem', color: '#8b949e' }}>
              Protected by Squad API
            </div>
          </aside>
          
          <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', backgroundColor: '#010409' }}>
            {children}
          </main>
        </div>
        
        <style dangerouslySetInnerHTML={{__html: `
          .nav-link {
            padding: 0.75rem 1rem;
            border-radius: 6px;
            color: var(--foreground);
            transition: all 0.2s ease;
          }
          .nav-link:hover {
            background-color: var(--surface);
            color: var(--primary);
            text-decoration: none;
          }
        `}} />
      </body>
    </html>
  );
}

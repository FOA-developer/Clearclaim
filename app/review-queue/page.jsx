'use client';
import { useState, useEffect } from 'react';

export default function ReviewQueue() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/claims?status=HELD_IN_REVIEW')
      .then(res => res.json())
      .then(data => {
        setReviews(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  const handleAction = async (id, action) => {
    setLoading(true);
    await fetch(`/api/claims/${id}/${action}`, { method: 'POST' });
    // Refresh list
    const res = await fetch('/api/claims?status=HELD_IN_REVIEW');
    const data = await res.json();
    setReviews(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  if (loading && reviews.length === 0) return <div style={{ padding: '2rem' }}>Loading Queue...</div>;

  return (
    <div className="animate-in fade-in duration-500">
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem', fontWeight: 'bold' }}>Review Queue</h1>
      <p style={{ color: '#8b949e', marginBottom: '2rem' }}>Claims flagged for manual inspection before Squad ledger release.</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {reviews.length > 0 ? reviews.map(review => (
          <div key={review._id} className="card glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{review.transactionRef}</h3>
              <p style={{ color: 'var(--warning)', fontSize: '0.875rem' }}>
                {review.analysis.anomalies[0] || 'Statistical Anomaly Detected'}
              </p>
              <p style={{ color: '#8b949e', fontSize: '0.8rem', marginTop: '0.5rem' }}>Submitted on: {new Date(review.createdAt).toLocaleDateString()}</p>
            </div>
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>₦{review.amount.toLocaleString()}</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => handleAction(review._id, 'reject')}
                  className="btn btn-outline" 
                  style={{ fontSize: '0.8rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}
                >
                  Reject & Refund
                </button>
                <button 
                  onClick={() => handleAction(review._id, 'approve')}
                  className="btn btn-primary" 
                  style={{ fontSize: '0.8rem' }}
                >
                  Approve Payout
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="card glass" style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: '#8b949e' }}>No claims currently require review.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReviewQueue() {
  const reviews = [
    { id: 'PAY-1102', employee: 'John Doe', amount: '₦150,000', anomaly: 'Statistical Outlier (+3 std dev)' },
    { id: 'PAY-1108', employee: 'Jane Smith', amount: '₦45,000', anomaly: 'Attendance mismatch' },
  ];

  return (
    <div className="animate-in fade-in duration-500">
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem', fontWeight: 'bold' }}>Review Queue</h1>
      <p style={{ color: '#8b949e', marginBottom: '2rem' }}>Claims that received a REVIEW verdict and require manual inspection.</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {reviews.map(review => (
          <div key={review.id} className="card glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{review.employee} - {review.id}</h3>
              <p style={{ color: 'var(--warning)', fontSize: '0.875rem' }}>{review.anomaly}</p>
            </div>
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{review.amount}</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}>Reject (Refund via Squad)</button>
                <button className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}>Approve (Release Escrow)</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

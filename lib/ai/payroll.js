/**
 * Analyzes payroll data to generate a trust score and verdict.
 * Checks for duplicate accounts, attendance-to-payment mismatches, and statistical outliers.
 * 
 * @param {Array<Object>} records - Array of payroll objects 
 *                                  { name, accountNumber, amount, attendanceDays, expectedPay }
 * @returns {Object} { trustScore: number, verdict: 'PASS' | 'REVIEW' | 'FAIL', anomalies: Array<string> }
 */
export function analyzePayroll(records) {
  let score = 100;
  const anomalies = [];
  
  if (!records || records.length === 0) {
    return { trustScore: 0, verdict: 'FAIL', anomalies: ['No data provided'] };
  }

  const accountCounts = {};
  const amounts = [];

  records.forEach((record, index) => {
    // 1. Duplicate Account Detection
    if (record.accountNumber) {
      accountCounts[record.accountNumber] = (accountCounts[record.accountNumber] || 0) + 1;
      if (accountCounts[record.accountNumber] > 1) {
        anomalies.push(`Duplicate account detected: ${record.accountNumber}`);
        score -= 15;
      }
    }

    // 2. Attendance vs Payment Mismatch
    const amount = Number(record.amount);
    const expectedPay = Number(record.expectedPay);
    const attendanceDays = Number(record.attendanceDays);

    if (!isNaN(amount) && !isNaN(expectedPay) && !isNaN(attendanceDays) && attendanceDays > 0) {
      const dailyRate = expectedPay / 30; // standard 30-day assumption
      const proratedExpected = dailyRate * attendanceDays;
      
      // Tolerance of 10% for bonuses/taxes
      if (amount > proratedExpected * 1.1) {
        anomalies.push(`Overpayment anomaly detected for ${record.name || `Row ${index + 1}`}`);
        score -= 10;
      }
    }

    if (!isNaN(amount)) {
      amounts.push(amount);
    }
  });

  // 3. Statistical Outlier Scoring
  if (amounts.length > 5) {
    const sum = amounts.reduce((a, b) => a + b, 0);
    const mean = sum / amounts.length;
    const variance = amounts.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);
    
    amounts.forEach((amount, index) => {
      // Flag amounts greater than 3 standard deviations from the mean
      if (stdDev > 0 && amount > mean + (3 * stdDev)) {
        anomalies.push(`Statistical outlier (high payment) detected at row ${index + 1}`);
        score -= 5;
      }
    });
  }

  // Bound the score between 0 and 100
  score = Math.max(0, Math.min(100, Math.round(score)));

  let verdict = 'PASS';
  if (score < 40) {
    verdict = 'FAIL';
  } else if (score <= 74) {
    verdict = 'REVIEW';
  }

  // Deduplicate anomalies list
  const uniqueAnomalies = [...new Set(anomalies)];

  return { trustScore: score, verdict, anomalies: uniqueAnomalies };
}

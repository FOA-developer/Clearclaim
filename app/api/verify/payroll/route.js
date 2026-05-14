import { analyzePayroll } from '@/lib/ai/payroll';
import { initiatePayment } from '@/lib/squad/payment';
import clientPromise from '@/lib/mongodb';

export async function POST(req) {
  try {
    const { records, email, amount } = await req.json();

    if (!records || !email || !amount) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // 1. Run AI Analysis
    const analysis = analyzePayroll(records);

    // 2. Generate Transaction Reference
    const transactionRef = `CC-PAY-${Date.now()}`;

    // 3. Initiate Squad Payment (Escrow)
    // Note: In a real flow, this returns a checkout URL for the user to pay.
    // For the MVP, we assume this is the step that puts funds in Squad's control.
    let squadResponse = null;
    try {
      squadResponse = await initiatePayment({
        amount: amount * 100, // Convert NGN to Kobo
        email,
        transactionRef,
        callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard`
      });
    } catch (squadError) {
      console.error('Squad API Error:', squadError);
      // We continue even if Squad fails in development, but log it.
    }

    // 4. Save to MongoDB
    const client = await clientPromise;
    const db = client.db();
    
    const claim = {
      transactionRef,
      email,
      amount,
      analysis,
      status: analysis.verdict === 'PASS' ? 'PENDING_PAYOUT' : 'HELD_IN_REVIEW',
      createdAt: new Date(),
      records
    };

    const result = await db.collection('claims').insertOne(claim);

    return new Response(JSON.stringify({
      success: true,
      claimId: result.insertedId,
      transactionRef,
      analysis,
      checkoutUrl: squadResponse?.data?.checkout_url || null
    }), { status: 200 });

  } catch (error) {
    console.error('Verification Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

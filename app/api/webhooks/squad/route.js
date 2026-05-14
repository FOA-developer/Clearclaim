import crypto from 'crypto';
import clientPromise from '@/lib/mongodb';

export async function POST(req) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-squad-encrypted-body');
    const secretKey = process.env.SQUAD_SECRET_KEY;

    if (!signature || !secretKey) {
      console.warn('Missing signature or secret key');
      return new Response('Unauthorized', { status: 401 });
    }

    const hash = crypto
      .createHmac('sha512', secretKey)
      .update(rawBody)
      .digest('hex');

    if (hash.toLowerCase() !== signature.toLowerCase()) {
      console.warn('Invalid signature mismatch');
      return new Response('Invalid Signature', { status: 403 });
    }

    const data = JSON.parse(rawBody);
    
    // Connect to DB to log the webhook
    const client = await clientPromise;
    const db = client.db();
    
    await db.collection('webhooks').insertOne({
      event: data.Event || data.transaction_status,
      transactionRef: data.TransactionRef || data.transaction_reference,
      payload: data,
      receivedAt: new Date(),
    });

    // If charge_successful, we could trigger subsequent logic
    // such as releasing escrowed funds if trust score allows
    
    return new Response('Webhook received', { status: 200 });
  } catch (error) {
    console.error('Webhook Processing Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

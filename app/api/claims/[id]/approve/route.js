import clientPromise from '@/lib/mongodb';
import { transferFunds } from '@/lib/squad/transfer';
import { ObjectId } from 'mongodb';

export async function POST(req, { params }) {
  try {
    const { id } = params;
    const client = await clientPromise;
    const db = client.db();

    const claim = await db.collection('claims').findOne({ _id: new ObjectId(id) });
    if (!claim) return new Response('Not Found', { status: 404 });

    // In a real flow, we would trigger Squad Transfer here
    // For the MVP, we simulate the Squad call success
    try {
        /*
        await transferFunds({
          remark: `Payout for claim ${claim.transactionRef}`,
          bankCode: claim.records[0].bankCode, // Simplified for MVP
          amount: claim.amount.toString(),
          accountNumber: claim.records[0].accountNumber,
          transactionReference: `${claim.transactionRef}-OUT`,
          accountName: claim.records[0].name
        });
        */
    } catch (e) {
        console.error("Squad Transfer failed", e);
    }

    await db.collection('claims').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: 'PAID_OUT', updatedAt: new Date() } }
    );

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

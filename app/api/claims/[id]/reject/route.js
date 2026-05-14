import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req, { params }) {
  try {
    const { id } = params;
    const client = await clientPromise;
    const db = client.db();

    const claim = await db.collection('claims').findOne({ _id: new ObjectId(id) });
    if (!claim) return new Response('Not Found', { status: 404 });

    // In a real flow, we would trigger Squad Refund here
    // For MVP, we update status to REFUNDED
    await db.collection('claims').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: 'REFUNDED', updatedAt: new Date() } }
    );

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

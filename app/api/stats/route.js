import clientPromise from '@/lib/mongodb';

export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    const totalProcessed = await db.collection('claims').aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]).toArray();

    const fraudCount = await db.collection('claims').countDocuments({ "analysis.verdict": "FAIL" });
    const inEscrow = await db.collection('claims').aggregate([
      { $match: { status: "HELD_IN_REVIEW" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]).toArray();

    const recentActivity = await db.collection('claims')
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    return new Response(JSON.stringify({
      totalAmount: totalProcessed[0]?.total || 0,
      fraudCount,
      escrowAmount: inEscrow[0]?.total || 0,
      recentActivity
    }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

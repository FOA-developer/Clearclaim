import clientPromise from '@/lib/mongodb';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    
    const client = await clientPromise;
    const db = client.db();
    
    const query = status ? { status } : {};
    const claims = await db.collection('claims')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return new Response(JSON.stringify(claims), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

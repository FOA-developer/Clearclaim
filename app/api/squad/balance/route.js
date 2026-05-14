import { getLedgerBalance } from '@/lib/squad/transfer';

export async function GET() {
  try {
    const response = await getLedgerBalance();
    return new Response(JSON.stringify(response.data), { status: 200 });
  } catch (error) {
    // Fallback for development if keys are missing
    return new Response(JSON.stringify({ balance: 0, currency: 'NGN' }), { status: 200 });
  }
}

import Link from 'next/link'

export default function PaymentLedger({ items }) {
  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col">

      {/* Header */}
      <div className="p-4 border-b border-outline-variant flex justify-between items-center">
        <h2 className="text-headline-sm font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
          Squad Payment Ledger
        </h2>
        <Link href="/payments" className="text-primary text-label-md font-bold hover:underline">
          VIEW ALL
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-y-auto max-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-container-low sticky top-0">
            <tr>
              <th className="p-3 text-label-md font-bold text-on-surface-variant">SQUAD ID</th>
              <th className="p-3 text-label-md font-bold text-on-surface-variant">AMOUNT</th>
              <th className="p-3 text-label-md font-bold text-on-surface-variant">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="p-3 font-mono text-body-sm">{item.id}</td>
                <td className="p-3 font-bold text-body-sm">{item.amount}</td>
                <td className="p-3">
                  <span className={`flex items-center gap-1 text-label-md font-bold ${item.statusColor}`}>
                    <span className="material-symbols-outlined text-[14px]">
                      {item.statusIcon}
                    </span>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
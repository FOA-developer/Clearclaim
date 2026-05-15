/**
 * Normalizes invoice + line items into the canonical API document shape (FIRS-style).
 */

/**
 * @param {Record<string, unknown>} row invoices row from DB
 * @param {Record<string, unknown>[]} itemsRows invoice_items rows
 */
export function serializeInvoiceDocument(row, itemsRows) {
  return {
    invoice: {
      invoiceNumber: row.invoice_number,
      invoiceDate: row.invoice_date,
      dueDate: row.due_date,
      currency: row.currency,
      status: row.status,
      purchaseOrderNumber: row.purchase_order_number,
    },
    seller: row.seller,
    buyer: row.buyer,
    items: itemsRows.map((i) => ({
      id: i.id,
      description: i.description,
      quantity: Number(i.quantity),
      unit: i.unit,
      unitPrice: Number(i.unit_price),
      subtotal: Number(i.subtotal),
      vatApplicable: i.vat_applicable,
      vatRate: Number(i.vat_rate),
      total: Number(i.total),
    })),
    totals: {
      subtotal: Number(row.subtotal),
      discount: Number(row.discount),
      vatAmount: Number(row.vat_amount),
      withholdingTax: {
        applicable: Number(row.withholding_tax_rate ?? 0) > 0,
        rate: Number(row.withholding_tax_rate ?? 0),
        amount: Number(row.withholding_tax_amount ?? 0),
      },
      grandTotal: Number(row.grand_total),
      netPayable: Number(row.net_payable),
    },
    payment: {
      paymentTerms: row.payment_terms,
      acceptedMethods: row.accepted_methods ?? [],
      reference: row.payment_reference,
    },
    compliance: {
      firsCompliant: row.firs_compliant,
      requiresStamp: false,
      requiresSignature: row.requires_signature,
      signedBy: row.signed_by,
      signatureDate: row.signature_date,
    },
    metadata: {
      id: row.id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: row.created_by,
      source: row.source,
      pdfUrl: row.pdf_url,
      version: '1.0.0',
    },
  }
}

/**
 * Mirrors route-level computation for PATCH updates.
 */
export function computeTotalsFromLineInput(items, discount = 0, withholdingTaxRate = 0) {
  let subtotal = 0
  let vatAmount = 0
  const computedItems = items.map((item, idx) => {
    const itemSubtotal = item.quantity * item.unitPrice
    const itemVat = item.vatApplicable ? itemSubtotal * (item.vatRate / 100) : 0
    const itemTotal = itemSubtotal + itemVat
    subtotal += itemSubtotal
    vatAmount += itemVat
    return {
      description: item.description,
      quantity: item.quantity,
      unit: item.unit ?? 'unit',
      unit_price: item.unitPrice,
      subtotal: itemSubtotal,
      vat_applicable: item.vatApplicable ?? true,
      vat_rate: item.vatRate ?? 7.5,
      total: itemTotal,
      sort_order: idx,
    }
  })

  const whtAmount = withholdingTaxRate > 0 ? subtotal * (withholdingTaxRate / 100) : 0
  const grandTotal = subtotal - discount + vatAmount
  const netPayable = grandTotal - whtAmount

  return {
    computedItems,
    subtotal,
    discount,
    vatAmount,
    withholdingTaxRate,
    withholdingTaxAmount: whtAmount,
    grandTotal,
    netPayable,
  }
}

export function buildSellerFromCompany(company) {
  return {
    businessName: company.name ?? '',
    registrationType: 'LIMITED',
    cacNumber: company.cac_number ?? '',
    tin: company.tin ?? '',
    vatNumber: company.vat_number ?? '',
    address: typeof company.address === 'object' && company.address !== null ? company.address : {},
    contact: typeof company.contact === 'object' && company.contact !== null ? company.contact : {},
    bankDetails:
      typeof company.bank_details === 'object' && company.bank_details !== null
        ? company.bank_details
        : {},
  }
}

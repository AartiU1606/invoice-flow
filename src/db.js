import { supabase } from './lib/supabase.js';

/**
 * Save an invoice (header) and its line items to Supabase.
 * Returns { invoice, error }.
 */
export async function saveInvoice(invoiceData, lineItems) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User is not authenticated');

  // Insert the invoice header
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      user_id: user.id,
      ...invoiceData,
    })
    .select()
    .single();

  if (invoiceError) throw invoiceError;

  // Insert line items
  if (lineItems && lineItems.length > 0) {
    const items = lineItems.map(item => ({
      invoice_id: invoice.id,
      description: item.description || '',
      quantity: parseFloat(item.quantity) || 0,
      rate: parseFloat(item.rate) || 0,
      amount: parseFloat(item.amount) || 0,
    }));

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(items);

    if (itemsError) throw itemsError;
  }

  return invoice;
}

/**
 * Upload a PDF Blob to Supabase Storage under the user's folder.
 * Returns the signed URL.
 */
export async function uploadInvoicePdf(invoiceId, pdfBlob) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User is not authenticated');

  const filePath = `${user.id}/${invoiceId}.pdf`;

  const { error: uploadError } = await supabase.storage
    .from('invoices')
    .upload(filePath, pdfBlob, {
      contentType: 'application/pdf',
      upsert: true,
    });

  if (uploadError) throw uploadError;

  // Create a signed URL valid for 1 year
  const { data: signedData, error: signedError } = await supabase.storage
    .from('invoices')
    .createSignedUrl(filePath, 365 * 24 * 60 * 60);

  if (signedError) throw signedError;
  return signedData.signedUrl;
}

/**
 * Update the pdf_url on an existing invoice record.
 */
export async function updateInvoicePdfUrl(invoiceId, pdfUrl) {
  const { error } = await supabase
    .from('invoices')
    .update({ pdf_url: pdfUrl })
    .eq('id', invoiceId);

  if (error) throw error;
}

/**
 * Get all invoices for the current user, ordered newest first.
 * Also fetches the associated line items.
 */
export async function getInvoicesHistory() {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      id,
      invoice_number,
      client_name,
      client_company,
      invoice_date,
      due_date,
      subtotal,
      tax_amount,
      total,
      pdf_url,
      created_at,
      invoice_items (
        id, description, quantity, rate, amount
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Delete an invoice (cascade deletes items too).
 */
export async function deleteInvoice(invoiceId) {
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', invoiceId);

  if (error) throw error;
}

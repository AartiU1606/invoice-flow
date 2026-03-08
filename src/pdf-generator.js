import html2pdf from 'html2pdf.js';
import { getFormData } from './invoice-form.js';
import { formatCurrency } from './utils.js';
import { saveInvoice, uploadInvoicePdf, updateInvoicePdfUrl } from './db.js';

export function generatePDF() {
  const btn = document.getElementById('previewPdfBtn');
  const originalText = btn.innerHTML;
  
  // Visual feedback
  btn.innerHTML = '<i class="lucide-loader animate-spin" style="animation: spin 1s linear infinite;"></i> Rendering Preview...';
  btn.disabled = true;

  const data = getFormData();
  
  // Format items table for PDF
  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #1e293b;">${item.desc || 'Item'}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #475569;">${item.qty}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #475569;">${formatCurrency(item.rate)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 600; color: #1e293b;">${formatCurrency(item.qty * item.rate)}</td>
    </tr>
  `).join('');

  // Create a clean, white-background template specifically for the PDF
  const template = document.createElement('div');
  template.innerHTML = `
    <div style="font-family: 'Inter', sans-serif; padding: 40px; color: #0f172a; background: white; width: 800px; max-width: 100%;">
      
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px;">
        <div>
          <h1 style="font-size: 32px; font-weight: 700; color: #7c3aed; margin: 0 0 10px 0;">INVOICE</h1>
          <p style="color: #64748b; margin: 0; font-size: 14px;"># ${data.invoiceNumber || 'INV-0000'}</p>
        </div>
        <div style="text-align: right;">
          <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 5px 0;">${data.companyName || 'Company Name'}</h2>
          <p style="color: #64748b; margin: 0; font-size: 14px;">${data.companyEmail || 'email@company.com'}</p>
        </div>
      </div>

      <!-- Info Row -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 40px; padding: 20px; background: #f8fafc; border-radius: 8px;">
        <div>
          <p style="font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 5px 0;">Billed To</p>
          <p style="font-size: 16px; font-weight: 600; color: #1e293b; margin: 0 0 5px 0;">${data.clientName || 'Client Name'}</p>
          <p style="color: #64748b; margin: 0; font-size: 14px;">${data.clientEmail || 'client@email.com'}</p>
        </div>
        <div style="text-align: right;">
          <div style="margin-bottom: 15px;">
            <p style="font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 5px 0;">Invoice Date</p>
            <p style="font-size: 14px; font-weight: 500; color: #1e293b; margin: 0;">${data.invoiceDate || '-'}</p>
          </div>
          <div>
            <p style="font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 5px 0;">Due Date</p>
            <p style="font-size: 14px; font-weight: 500; color: #1e293b; margin: 0;">${data.dueDate || '-'}</p>
          </div>
        </div>
      </div>

      <!-- Items Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
        <thead>
          <tr>
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Description</th>
            <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e2e8f0; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Qty</th>
            <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e2e8f0; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Rate</th>
            <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e2e8f0; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <!-- Totals -->
      <div style="display: flex; justify-content: flex-end;">
        <div style="width: 300px;">
          <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
            <span style="color: #64748b;">Subtotal</span>
            <span style="color: #1e293b; font-weight: 500;">${data.subtotal}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
            <span style="color: #64748b;">Tax (10%)</span>
            <span style="color: #1e293b; font-weight: 500;">${data.tax}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 15px 0; margin-top: 5px;">
            <span style="color: #1e293b; font-weight: 700; font-size: 18px;">Total</span>
            <span style="color: #7c3aed; font-weight: 700; font-size: 18px;">${data.total}</span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="margin-top: 60px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
        <p style="color: #94a3b8; font-size: 12px; margin: 0;">Thank you for your business.</p>
      </div>

    </div>
  `;

  // --- Show Modal Preview ---
  const modal = document.getElementById('pdfModal');
  const previewContainer = document.getElementById('pdfPreviewContainer');
  
  // Clear previous preview
  previewContainer.innerHTML = '';
  // Append the constructed template HTML into the preview
  previewContainer.appendChild(template);
  
  // Display the modal
  modal.classList.add('active');

  // Restore Preview button text
  btn.innerHTML = originalText;
  btn.disabled = false;

  // Setup modal close listeners
  const closeBtn = document.getElementById('closeModalBtn');
  const cancelBtn = document.getElementById('cancelModalBtn');
  
  const closeModal = () => {
    modal.classList.remove('active');
  };

  closeBtn.onclick = closeModal;
  cancelBtn.onclick = closeModal;

  // Setup actual Download listener (closes the old one by replacing onclick)
  const downloadBtn = document.getElementById('downloadPdfBtn');
  downloadBtn.onclick = () => {
    downloadAndSavePDF(template, data, downloadBtn);
  };
}

async function downloadAndSavePDF(templateElement, formData, btn) {
  const originalText = btn.innerHTML;
  btn.innerHTML = '<i class="lucide-loader animate-spin" style="animation: spin 1s linear infinite;"></i> Saving & Downloading...';
  btn.disabled = true;

  try {
    // 1. Save invoice data to Supabase
    const invoiceData = {
      company_name: formData.companyName,
      company_email: formData.companyEmail,
      company_address: formData.companyAddress,
      company_phone: formData.companyPhone,
      client_name: formData.clientName,
      client_email: formData.clientEmail,
      client_company: formData.clientCompany,
      client_address: formData.clientAddress,
      invoice_number: formData.invoiceNumber,
      invoice_date: formData.invoiceDate || null,
      due_date: formData.dueDate || null,
      subtotal: parseNumericValue(formData.subtotal),
      tax_amount: parseNumericValue(formData.tax),
      total: parseNumericValue(formData.total),
    };

    const lineItems = (formData.items || []).map(item => ({
      description: item.desc || '',
      quantity: parseFloat(item.qty) || 0,
      rate: parseFloat(item.rate) || 0,
      amount: parseFloat(item.qty * item.rate) || 0,
    }));

    const savedInvoice = await saveInvoice(invoiceData, lineItems);

    const opt = {
      margin:       0,
      filename:     `${formData.invoiceNumber || 'Invoice'}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    // 2. Generate PDF as a Blob to upload to Supabase Storage
    const pdfBlob = await html2pdf().set(opt).from(templateElement).outputPdf('blob');

    // 3. Upload the PDF to Supabase Storage
    try {
      const pdfUrl = await uploadInvoicePdf(savedInvoice.id, pdfBlob);
      // 4. Update the DB record with the file URL
      await updateInvoicePdfUrl(savedInvoice.id, pdfUrl);
    } catch (uploadErr) {
      console.warn('PDF upload to storage failed (non-critical):', uploadErr);
    }

    // 5. Trigger the local download
    await html2pdf().set(opt).from(templateElement).save();

    // Refresh history if it's the active view
    const historyBtn = document.querySelector('[data-view="history"]');
    if (historyBtn && historyBtn.classList.contains('active')) {
      historyBtn.click();
    }

  } catch (err) {
    console.error('Invoice save/download error:', err);
    // Fall back to simple download even if saving fails
    const opt = {
      margin: 0,
      filename: `${formData.invoiceNumber || 'Invoice'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    await html2pdf().set(opt).from(templateElement).save();
    alert('Invoice downloaded, but could not be saved to database. Please check the console.');
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
    setTimeout(() => {
      document.getElementById('pdfModal').classList.remove('active');
    }, 500);
  }
}

function parseNumericValue(str) {
  if (typeof str === 'number') return str;
  if (!str) return 0;
  return parseFloat(String(str).replace(/[^0-9.-]/g, '')) || 0;
}

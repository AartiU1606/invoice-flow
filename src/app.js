import { createIcons, icons } from 'lucide';
import { setupFormLogic } from './invoice-form.js';
import { generatePDF } from './pdf-generator.js';
import { generateInvoiceNumber, getCurrentDate, getDueDate, formatCurrency } from './utils.js';
import { getInvoicesHistory, deleteInvoice } from './db.js';

// The full invoice creation form HTML
function getCreateInvoiceHTML() {
  return `
    <header class="card-header animate-fade-in-up">
      <h1 class="card-title" style="font-size: 1.5rem;">
        <i data-lucide="file-edit"></i> Create New Invoice
      </h1>
      <p>Fill in the details below to generate a professional PDF invoice.</p>
    </header>

    <div class="form-container">
      <!-- Company & Client Details Row -->
      <div class="form-grid">
        <!-- Company Build -->
        <div class="glass-card animate-fade-in-up delay-100">
          <div class="card-header">
            <h2 class="card-title"><i data-lucide="building"></i> Company Details</h2>
          </div>
          <div class="input-group" style="margin-bottom: 1rem;">
            <label for="companyName">Your Company Name</label>
            <input type="text" id="companyName" class="input-control" placeholder="Acme Corp" value="Awesome Studio">
          </div>
          <div class="input-group">
            <label for="companyEmail">Your Email</label>
            <input type="email" id="companyEmail" class="input-control" placeholder="billing@acme.com" value="hello@awesomestudio.com">
          </div>
        </div>

        <!-- Client Build -->
        <div class="glass-card animate-fade-in-up delay-200">
          <div class="card-header">
            <h2 class="card-title"><i data-lucide="user"></i> Client Details</h2>
          </div>
          <div class="input-group" style="margin-bottom: 1rem;">
            <label for="clientName">Client Name</label>
            <input type="text" id="clientName" class="input-control" placeholder="John Doe">
          </div>
          <div class="input-group">
            <label for="clientEmail">Client Email</label>
            <input type="email" id="clientEmail" class="input-control" placeholder="john@client.com">
          </div>
        </div>
      </div>

      <!-- Invoice Details row -->
      <div class="glass-card animate-fade-in-up delay-300" style="margin-top: 1.5rem;">
        <div class="card-header">
           <h2 class="card-title"><i data-lucide="file-text"></i> Invoice Details</h2>
        </div>
        <div class="form-grid">
          <div class="input-group">
            <label for="invoiceNumber">Invoice Number</label>
            <input type="text" id="invoiceNumber" class="input-control" value="${generateInvoiceNumber()}">
          </div>
          <div class="input-group">
            <label for="invoiceDate">Date</label>
            <input type="date" id="invoiceDate" class="input-control" value="${getCurrentDate()}">
          </div>
          <div class="input-group">
            <label for="dueDate">Due Date</label>
            <input type="date" id="dueDate" class="input-control" value="${getDueDate()}">
          </div>
        </div>
      </div>

      <!-- Line Items -->
      <div class="glass-card animate-fade-in-up delay-400" style="margin-top: 1.5rem;">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
          <h2 class="card-title"><i data-lucide="list"></i> Line Items</h2>
        </div>
        
        <table class="items-table" id="itemsTable">
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th>Rate ($)</th>
              <th class="amount-col">Amount</th>
              <th class="actions-col"></th>
            </tr>
          </thead>
          <tbody id="itemsBody">
            <!-- Items injected by JS -->
          </tbody>
        </table>
        
        <div style="margin-top: 1rem;">
          <button id="addItemBtn" class="btn btn-icon" style="color: var(--accent-secondary); background: rgba(59, 130, 246, 0.1);">
            <i data-lucide="plus"></i> Add Item
          </button>
        </div>
      </div>
      
      <!-- Summary -->
      <div class="glass-card animate-fade-in-up delay-500" style="margin-top: 1.5rem;">
        <div class="totals-panel">
          <div class="total-row">
            <span>Subtotal</span>
            <span id="subtotalDisplay">$0.00</span>
          </div>
          <div class="total-row">
            <span>Tax (10%)</span>
            <span id="taxDisplay">$0.00</span>
          </div>
          <div class="total-row grand-total">
            <span>Total</span>
            <span id="totalDisplay">$0.00</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="action-panel animate-fade-in-up delay-500">
        <button id="previewPdfBtn" class="btn btn-primary shimmer">
          <i data-lucide="eye"></i> Preview Invoice
        </button>
      </div>
    </div>

    <!-- PDF Preview Modal -->
    <div id="pdfModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title"><i data-lucide="file-check-2"></i> Invoice Preview</h2>
          <button id="closeModalBtn" class="btn-icon">
            <i data-lucide="x"></i>
          </button>
        </div>
        <div class="modal-body" id="pdfPreviewContainer">
          <!-- Rendered HTML preview goes here -->
        </div>
        <div class="modal-footer">
          <button id="cancelModalBtn" class="btn" style="color: var(--text-secondary); background: var(--bg-input);">Edit</button>
          <button id="downloadPdfBtn" class="btn btn-primary">
            <i data-lucide="download"></i> Download PDF
          </button>
        </div>
      </div>
    </div>
  `;
}

// History view HTML
async function getHistoryHTML() {
  return `
    <header class="card-header animate-fade-in-up">
      <h1 class="card-title" style="font-size: 1.5rem;">
        <i data-lucide="history"></i> Invoice History
      </h1>
      <p>All invoices you have previously created and saved.</p>
    </header>
    <div class="form-container">
      <div class="glass-card animate-fade-in-up delay-100" id="history-table-wrapper">
        <div style="display:flex; align-items:center; justify-content:center; padding: 3rem; color:var(--text-secondary);">
          <i data-lucide="loader-2" style="animation: spin 1s linear infinite; margin-right: 0.5rem;"></i> Loading invoices...
        </div>
      </div>
    </div>
  `;
}

function renderHistoryTable(invoices) {
  const wrapper = document.getElementById('history-table-wrapper');
  if (!wrapper) return;

  if (!invoices || invoices.length === 0) {
    wrapper.innerHTML = `
      <div style="text-align:center; padding: 3rem; color:var(--text-secondary);">
        <i data-lucide="inbox" style="width:48px; height:48px; margin-bottom:1rem; opacity:0.5;"></i>
        <p>No invoices found. Create your first invoice!</p>
      </div>`;
    createIcons({ icons });
    return;
  }

  const rows = invoices.map(inv => {
    const clientLabel = inv.client_company
      ? `${inv.client_name} <small style="color:var(--text-secondary)">(${inv.client_company})</small>`
      : (inv.client_name || '\u2014');

    const pdfLink = inv.pdf_url
      ? `<a href="${inv.pdf_url}" target="_blank" rel="noopener" class="btn btn-icon" style="padding:0.35rem 0.75rem; font-size:0.8rem; background:rgba(124,58,237,0.2); color:var(--accent-primary);">
           <i data-lucide="download"></i> PDF
         </a>`
      : `<span style="color:var(--text-muted); font-size:0.8rem;">\u2014</span>`;

    const dateStr = inv.invoice_date
      ? new Date(inv.invoice_date).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' })
      : '\u2014';

    return `
      <tr class="history-row">
        <td><strong>${inv.invoice_number || '\u2014'}</strong></td>
        <td>${clientLabel}</td>
        <td>${dateStr}</td>
        <td><strong style="color:var(--accent-primary)">${formatCurrency(inv.total)}</strong></td>
        <td>${pdfLink}</td>
        <td>
          <button class="btn btn-icon delete-invoice-btn" data-id="${inv.id}" style="padding:0.35rem 0.75rem; font-size:0.8rem; background:rgba(239,68,68,0.1); color:var(--danger-color);">
            <i data-lucide="trash-2"></i>
          </button>
        </td>
      </tr>`;
  }).join('');

  wrapper.innerHTML = `
    <div class="card-header" style="margin-bottom:1rem;">
      <h2 class="card-title"><i data-lucide="list-checks"></i> Your Invoices (${invoices.length})</h2>
    </div>
    <div style="overflow-x:auto;">
      <table class="items-table" style="width:100%;">
        <thead>
          <tr>
            <th>Invoice #</th>
            <th>Client</th>
            <th>Date</th>
            <th>Total</th>
            <th>PDF</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
  
  createIcons({ icons });

  // Wire up delete buttons
  wrapper.querySelectorAll('.delete-invoice-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) return;
      const id = btn.dataset.id;
      try {
        await deleteInvoice(id);
        btn.closest('tr').remove();
        // Update count
        const title = wrapper.querySelector('.card-title');
        const remaining = wrapper.querySelectorAll('.history-row').length;
        if (title) title.innerHTML = `<i data-lucide="list-checks"></i> Your Invoices (${remaining})`;
        createIcons({ icons });
        if (remaining === 0) renderHistoryTable([]);
      } catch (err) {
        console.error('Delete error:', err);
        alert('Failed to delete invoice. Please try again.');
      }
    });
  });
}

export function renderApp() {
  const mainContent = document.getElementById('main-content');

  // Set initial view to "Create Invoice"
  mainContent.innerHTML = getCreateInvoiceHTML();

  // Re-init newly added icons
  createIcons({ icons });

  // Initialize Form Logic
  setupFormLogic();
  
  // Attach PDF Generation listener
  document.getElementById('previewPdfBtn').addEventListener('click', generatePDF);

  // Wire up navigation  
  const navItems = document.querySelectorAll('.nav-item[data-view]');
  navItems.forEach(item => {
    item.addEventListener('click', async (e) => {
      e.preventDefault();
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      const view = item.dataset.view;
      if (view === 'create') {
        mainContent.innerHTML = getCreateInvoiceHTML();
        createIcons({ icons });
        setupFormLogic();
        document.getElementById('previewPdfBtn').addEventListener('click', generatePDF);
      } else if (view === 'history') {
        mainContent.innerHTML = await getHistoryHTML();
        createIcons({ icons });
        // Fetch invoices
        try {
          const invoices = await getInvoicesHistory();
          renderHistoryTable(invoices);
        } catch (err) {
          console.error('History fetch error:', err);
          const wrapper = document.getElementById('history-table-wrapper');
          if (wrapper) wrapper.innerHTML = `<div style="text-align:center; padding:2rem; color:var(--danger-color);">Failed to load invoice history.</div>`;
        }
      }
    });
  });
}

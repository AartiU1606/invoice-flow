import { createIcons, icons } from 'lucide';
import { formatCurrency } from './utils.js';

let items = [
  { id: Date.now(), desc: 'Web Design', qty: 1, rate: 800 }
];

const TAX_RATE = 0.10; // 10% tax

export function setupFormLogic() {
  renderItems();

  document.getElementById('addItemBtn').addEventListener('click', () => {
    items.push({ id: Date.now(), desc: '', qty: 1, rate: 0 });
    renderItems(true); // pass true to indicate it's a new item (for animation)
  });
}

function calculateTotals() {
  const subtotal = items.reduce((sum, item) => sum + (item.qty * item.rate), 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  document.getElementById('subtotalDisplay').textContent = formatCurrency(subtotal);
  document.getElementById('taxDisplay').textContent = formatCurrency(tax);
  document.getElementById('totalDisplay').textContent = formatCurrency(total);
}

function handleItemChange(id, field, value) {
  const item = items.find(i => i.id === id);
  if (item) {
    if (field === 'desc') {
      item.desc = value;
    } else {
      item[field] = parseFloat(value) || 0;
    }
    // Update individual amount display
    const amountCell = document.getElementById(`amount-${id}`);
    if (amountCell) {
      amountCell.textContent = formatCurrency(item.qty * item.rate);
    }
    calculateTotals();
  }
}

function removeItem(id, trElement) {
  if (items.length <= 1) return; // Need at least one item
  
  trElement.classList.add('item-row-leave');
  
  setTimeout(() => {
    items = items.filter(i => i.id !== id);
    renderItems();
  }, 300); // Wait for exit animation
}

function renderItems(animateNew = false) {
  const tbody = document.getElementById('itemsBody');
  tbody.innerHTML = '';
  
  items.forEach((item, index) => {
    const isNew = animateNew && index === items.length - 1;
    const tr = document.createElement('tr');
    tr.className = isNew ? 'item-row-enter' : '';
    
    // Inputs structure
    tr.innerHTML = `
      <td>
        <input type="text" class="input-control" placeholder="Item description" value="${item.desc}" data-id="${item.id}" data-field="desc">
      </td>
      <td>
        <input type="number" class="input-control" value="${item.qty}" min="1" data-id="${item.id}" data-field="qty">
      </td>
      <td>
        <input type="number" class="input-control" value="${item.rate}" min="0" data-id="${item.id}" data-field="rate">
      </td>
      <td class="amount-col" id="amount-${item.id}" style="font-weight: 500;">
        ${formatCurrency(item.qty * item.rate)}
      </td>
      <td class="actions-col">
        <button class="btn-icon btn-danger remove-btn" data-id="${item.id}" ${items.length === 1 ? 'disabled style="opacity:0.5"' : ''}>
          <i data-lucide="trash-2"></i>
        </button>
      </td>
    `;
    
    tbody.appendChild(tr);
  });
  
  // Re-bind Lucide icons for new elements
  createIcons({ icons });
  
  // Bind input listeners
  const inputs = tbody.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('input', (e) => {
      const id = parseInt(e.target.getAttribute('data-id'));
      const field = e.target.getAttribute('data-field');
      handleItemChange(id, field, e.target.value);
    });
  });
  
  // Bind remove buttons
  const removeBtns = tbody.querySelectorAll('.remove-btn');
  removeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.currentTarget.getAttribute('data-id'));
      const tr = e.currentTarget.closest('tr');
      removeItem(id, tr);
    });
  });

  calculateTotals();
}

// Function to get current form data used for PDF generation
export function getFormData() {
  return {
    companyName: document.getElementById('companyName').value,
    companyEmail: document.getElementById('companyEmail').value,
    clientName: document.getElementById('clientName').value,
    clientEmail: document.getElementById('clientEmail').value,
    invoiceNumber: document.getElementById('invoiceNumber').value,
    invoiceDate: document.getElementById('invoiceDate').value,
    dueDate: document.getElementById('dueDate').value,
    items: items,
    subtotal: document.getElementById('subtotalDisplay').textContent,
    tax: document.getElementById('taxDisplay').textContent,
    total: document.getElementById('totalDisplay').textContent,
  };
}

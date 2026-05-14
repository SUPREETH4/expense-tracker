import { db } from './firebase.js';
import { requireAuth, logOut } from './auth.js';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

requireAuth((user) => initApp(user));

function initApp(user) {
  'use strict';

  const CURRENCY = '₹';
  const MAX_AMOUNT_INTEGER_DIGITS = 10;

  const transactionsRef = collection(db, 'users', user.uid, 'transactions');

  const form          = document.getElementById('transaction-form');
  const amountInput   = document.getElementById('amount');
  const amountError   = document.getElementById('amount-error');
  const categoryInput = document.getElementById('category');
  const categoryError = document.getElementById('category-error');
  const noteInput     = document.getElementById('note');
  const logoutButton  = document.getElementById('logout-button');
  const listEl        = document.getElementById('transaction-list');
  const emptyStateEl  = document.getElementById('empty-state');
  const balanceEl     = document.getElementById('balance');
  const incomeEl      = document.getElementById('income');
  const expenseEl     = document.getElementById('expense');
  const countEl       = document.getElementById('count');

  const userNameEl    = document.getElementById('user-name');
  const userEmailEl   = document.getElementById('user-email');
  const userAvatarEl  = document.getElementById('user-avatar');

  renderUserIdentity(user);

  let transactions = [];

  async function loadTransactions() {
    try {
      const q = query(transactionsRef, orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      transactions = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.error('Failed to load transactions from Firestore:', err);
    }
  }

  async function saveTransaction(data) {
    const payload = {
      amount:    Number(data.amount),
      type:      data.type,
      category:  data.category.trim(),
      note:      data.note.trim(),
      createdAt: Date.now(),
    };
    const docRef = await addDoc(transactionsRef, payload);
    transactions.unshift({ id: docRef.id, ...payload });
  }

  async function removeTransaction(id) {
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'transactions', id));
      transactions = transactions.filter((t) => t.id !== id);
    } catch (err) {
      console.error('Failed to delete transaction from Firestore:', err);
    }
  }

  function renderUserIdentity(u) {
    const displayName = u.displayName || (u.email ? u.email.split('@')[0] : 'User');
    const email       = u.email || '';
    const photoURL    = u.photoURL || '';

    if (userNameEl)  userNameEl.textContent  = displayName;
    if (userEmailEl) userEmailEl.textContent = email;

    if (!userAvatarEl) return;

    userAvatarEl.innerHTML = '';

    if (photoURL) {
      const img = document.createElement('img');
      img.src = photoURL;
      img.alt = displayName;
      img.referrerPolicy = 'no-referrer';
      img.onerror = () => {
        userAvatarEl.innerHTML = '';
        userAvatarEl.textContent = getInitial(displayName, email);
      };
      userAvatarEl.appendChild(img);
    } else {
      userAvatarEl.textContent = getInitial(displayName, email);
    }
  }

  function getInitial(name, email) {
    const source = (name || email || 'U').trim();
    return source.charAt(0).toUpperCase() || 'U';
  }

  function formatCurrency(value) {
    const sign = value < 0 ? '-' : '';
    const abs  = Math.abs(value);
    const formatted = abs.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${sign}${CURRENCY}${formatted}`;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setFieldError(input, errorEl, message) {
    input.classList.add('is-invalid');
    input.setAttribute('aria-invalid', 'true');
    if (errorEl) errorEl.textContent = message;
  }

  function clearFieldError(input, errorEl) {
    input.classList.remove('is-invalid');
    input.removeAttribute('aria-invalid');
    if (errorEl) errorEl.textContent = '';
  }

  function getSelectedType() {
    return form.elements.type.value || 'income';
  }

  function sanitizeAmountInput(value) {
    return value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1');
  }

  function exceedsIntegerDigitLimit(value) {
    const [integerPart = ''] = String(value).split('.');
    return integerPart.length > MAX_AMOUNT_INTEGER_DIGITS;
  }

  function validateAmount() {
    const rawValue = amountInput.value.trim();
    const [intPart = ''] = rawValue.split('.');
    const amount = Number(rawValue);

    if (!rawValue)                                return { valid: false, message: 'Enter an amount.' };
    if (!Number.isFinite(amount) || amount <= 0)  return { valid: false, message: 'Amount must be greater than 0.' };
    if (intPart.length > MAX_AMOUNT_INTEGER_DIGITS)
      return { valid: false, message: 'Amount cannot exceed 10 digits before the decimal.' };

    return { valid: true, value: amount };
  }

  function validateCategory() {
    const val = categoryInput.value.trim();
    if (!val) return { valid: false, message: 'Enter a category.' };
    return { valid: true, value: val };
  }

  const ICON_EXPENSE = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>`;
  const ICON_INCOME  = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 7L7.8 16.2M7 7v10h10"/></svg>`;
  const ICON_DELETE  = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6"/></svg>`;

  function render() {
    renderTotals();
    renderList();
  }

  function renderTotals() {
    let income = 0;
    let expense = 0;
    for (const t of transactions) {
      if (t.type === 'income') income  += t.amount;
      else                     expense += t.amount;
    }
    const balance = income - expense;

    incomeEl.textContent  = formatCurrency(income);
    expenseEl.textContent = formatCurrency(expense);
    balanceEl.textContent = formatCurrency(balance);
    balanceEl.classList.toggle('is-negative', balance < 0);
    countEl.textContent   = String(transactions.length);
  }

  function renderList() {
    if (transactions.length === 0) {
      listEl.innerHTML = '';
      listEl.classList.add('is-hidden');
      emptyStateEl.classList.remove('is-hidden');
      return;
    }

    emptyStateEl.classList.add('is-hidden');
    listEl.classList.remove('is-hidden');

    listEl.innerHTML = transactions
      .map((t) => {
        const icon = t.type === 'income' ? ICON_INCOME : ICON_EXPENSE;
        const sign = t.type === 'income' ? '+' : '-';
        const noteHtml = t.note
          ? `<p class="transaction__note">${escapeHtml(t.note)}</p>`
          : `<p class="transaction__note transaction__note--empty">No note</p>`;

        return `
          <li class="transaction transaction--${t.type}" data-id="${t.id}" data-testid="transaction-item">
            <div class="transaction__icon" aria-hidden="true">${icon}</div>
            <div class="transaction__body">
              <p class="transaction__category" data-testid="transaction-category">${escapeHtml(t.category)}</p>
              ${noteHtml}
            </div>
            <span class="transaction__amount" data-testid="transaction-amount">${sign}${formatCurrency(t.amount).replace('-', '')}</span>
            <button
              type="button"
              class="transaction__delete"
              aria-label="Delete transaction"
              data-action="delete"
              data-id="${t.id}"
              data-testid="delete-transaction"
            >${ICON_DELETE}</button>
          </li>
        `;
      })
      .join('');
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const amountResult   = validateAmount();
    const categoryResult = validateCategory();

    if (!amountResult.valid)   setFieldError(amountInput, amountError, amountResult.message);
    else                       clearFieldError(amountInput, amountError);

    if (!categoryResult.valid) setFieldError(categoryInput, categoryError, categoryResult.message);
    else                       clearFieldError(categoryInput, categoryError);

    if (!amountResult.valid || !categoryResult.valid) return;

    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;

    try {
      await saveTransaction({
        amount:   amountResult.value,
        type:     getSelectedType(),
        category: categoryResult.value,
        note:     noteInput.value,
      });

      amountInput.value   = '';
      categoryInput.value = '';
      noteInput.value     = '';
      amountInput.focus();

      render();
    } catch (err) {
      console.error('Failed to save transaction:', err);
      alert('Could not save transaction. Please check your connection and try again.');
    } finally {
      submitBtn.disabled = false;
    }
  }

  async function handleListClick(event) {
    const button = event.target.closest('[data-action="delete"]');
    if (!button) return;

    const { id } = button.dataset;
    if (!id) return;

    const li = listEl.querySelector(`[data-id="${id}"]`);
    if (li) li.style.opacity = '0.4';

    await removeTransaction(id);
    render();
  }

  function handleAmountInput() {
    const next = sanitizeAmountInput(amountInput.value);
    if (amountInput.value !== next) amountInput.value = next;

    if (exceedsIntegerDigitLimit(amountInput.value)) {
      setFieldError(amountInput, amountError, 'Amount cannot exceed 10 digits before the decimal.');
      return;
    }

    clearFieldError(amountInput, amountError);
  }

  function handleAmountBeforeInput(event) {
    if (!event.data || event.inputType.startsWith('delete')) return;

    const { selectionStart, selectionEnd, value } = amountInput;
    const next = value.slice(0, selectionStart) + event.data + value.slice(selectionEnd);

    if (exceedsIntegerDigitLimit(sanitizeAmountInput(next))) {
      event.preventDefault();
      setFieldError(amountInput, amountError, 'Amount cannot exceed 10 digits before the decimal.');
    }
  }

  function handleCategoryInput() {
    clearFieldError(categoryInput, categoryError);
  }

  async function start() {
    await loadTransactions();
    render();

    form.addEventListener('submit',             handleSubmit);
    amountInput.addEventListener('beforeinput', handleAmountBeforeInput);
    amountInput.addEventListener('input',       handleAmountInput);
    categoryInput.addEventListener('input',     handleCategoryInput);
    listEl.addEventListener('click',            handleListClick);

    logoutButton.addEventListener('click', logOut);
  }

  start();
}

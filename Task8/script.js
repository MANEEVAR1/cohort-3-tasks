// FinTrack Pro - script.js
let transactions = [];
let currentCurrency = 'USD';
let userProfile = { name: 'Guest User', preferredCurrency: 'USD' };

const currencies = {
    USD: { symbol: '$', rate: 1 },
    EUR: { symbol: '€', rate: 0.92 },
    GBP: { symbol: '£', rate: 0.79 },
    INR: { symbol: '₹', rate: 83.5 },
    JPY: { symbol: '¥', rate: 160 }
};

function loadData() {
    const saved = localStorage.getItem('fintrack_transactions');
    if (saved) transactions = JSON.parse(saved);

    const profile = localStorage.getItem('fintrack_profile');
    if (profile) {
        userProfile = JSON.parse(profile);
        currentCurrency = userProfile.preferredCurrency;
    }

    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark');
        document.getElementById('dark-mode-toggle').innerHTML = '<i class="fas fa-sun"></i>';
    }
}

function saveTransactions() {
    localStorage.setItem('fintrack_transactions', JSON.stringify(transactions));
}

function saveProfile() {
    localStorage.setItem('fintrack_profile', JSON.stringify(userProfile));
}

function formatAmount(amount, curr = currentCurrency) {
    return `${currencies[curr].symbol}${parseFloat(amount).toFixed(2)}`;
}

function convertAmount(amount, fromCurr, toCurr) {
    if (fromCurr === toCurr) return amount;
    const base = amount / currencies[fromCurr].rate;
    return base * currencies[toCurr].rate;
}

function addTransaction(e) {
    e.preventDefault();
    const desc = document.getElementById('description').value;
    const type = document.getElementById('type').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const transCurr = document.getElementById('trans-currency').value;
    const date = document.getElementById('date').value;

    transactions.unshift({
        id: Date.now(),
        description: desc,
        type,
        amount,
        currency: transCurr,
        date
    });

    saveTransactions();
    renderAll();
    e.target.reset();
    document.getElementById('date').valueAsDate = new Date();
}

function updateSummary() {
    let income = 0, expense = 0;
    transactions.forEach(t => {
        const conv = convertAmount(t.amount, t.currency, currentCurrency);
        if (t.type === 'income') income += conv;
        else expense += conv;
    });

    document.getElementById('total-balance').textContent = formatAmount(income - expense);
    document.getElementById('total-income').textContent = formatAmount(income);
    document.getElementById('total-expense').textContent = formatAmount(expense);
}

function renderTransactions(filter = 'all', search = '') {
    const list = document.getElementById('full-transaction-list');
    list.innerHTML = '';

    const filtered = transactions.filter(t => {
        const matchFilter = filter === 'all' || t.type === filter;
        const matchSearch = t.description.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    filtered.forEach(t => {
        const conv = convertAmount(t.amount, t.currency, currentCurrency);
        const li = document.createElement('li');
        li.className = `transaction-item ${t.type}`;
        li.innerHTML = `
            <div>
                <div>${t.description}</div>
                <small>${t.date} • ${t.currency}</small>
            </div>
            <div style="display:flex; align-items:center; gap:15px;">
                <span class="transaction-amount">${t.type === 'income' ? '+' : '-'}${formatAmount(conv)}</span>
                <button class="delete-btn" data-id="${t.id}">Delete</button>
            </div>
        `;
        list.appendChild(li);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            transactions = transactions.filter(t => t.id !== id);
            saveTransactions();
            renderAll();
        });
    });
}

function renderRecent() {
    const list = document.getElementById('recent-list');
    list.innerHTML = '';
    transactions.slice(0, 5).forEach(t => {
        const conv = convertAmount(t.amount, t.currency, currentCurrency);
        const li = document.createElement('li');
        li.className = `transaction-item ${t.type}`;
        li.innerHTML = `
            <div>
                <div>${t.description}</div>
                <small>${t.date}</small>
            </div>
            <span class="transaction-amount">${t.type === 'income' ? '+' : '-'}${formatAmount(conv)}</span>
        `;
        list.appendChild(li);
    });
}

let cashflowChart, pieChart;
function updateCharts() {
    // Cashflow
    if (cashflowChart) cashflowChart.destroy();
    cashflowChart = new Chart(document.getElementById('cashflow-chart'), {
        type: 'line',
        data: {
            labels: ['Jan','Feb','Mar','Apr','May','Jun'],
            datasets: [
                { label: 'Income', data: [1200,1500,1300,1800,1400,1600], borderColor: '#10b981' },
                { label: 'Expense', data: [800,950,1100,700,1200,900], borderColor: '#ef4444' }
            ]
        }
    });

    // Pie
    if (pieChart) pieChart.destroy();
    pieChart = new Chart(document.getElementById('pie-chart'), {
        type: 'doughnut',
        data: {
            labels: ['Food','Transport','Rent','Others'],
            datasets: [{ data: [450,300,1200,350], backgroundColor: ['#f59e0b','#3b82f6','#8b5cf6','#6b7280'] }]
        }
    });
}

function renderAll() {
    updateSummary();
    renderRecent();
    renderTransactions('all');
    updateCharts();
}

function init() {
    loadData();
    document.getElementById('date').valueAsDate = new Date();

    document.getElementById('transaction-form').addEventListener('submit', addTransaction);

    // Navigation
    document.querySelectorAll('.sidebar nav li').forEach(li => {
        li.addEventListener('click', () => {
            document.querySelectorAll('.sidebar nav li').forEach(l => l.classList.remove('active'));
            li.classList.add('active');
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            document.getElementById(li.dataset.section + '-section').classList.add('active');
            document.getElementById('page-title').textContent = li.textContent.trim();
        });
    });

    document.getElementById('view-all-btn').addEventListener('click', () => {
        document.querySelector('[data-section="transactions"]').click();
    });

    // Filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderTransactions(btn.dataset.filter, document.getElementById('search-input').value);
        });
    });

    document.getElementById('search-input').addEventListener('input', (e) => {
        const active = document.querySelector('.filter-btn.active').dataset.filter;
        renderTransactions(active, e.target.value);
    });

    // Dark mode
    document.getElementById('dark-mode-toggle').addEventListener('click', () => {
        document.body.classList.toggle('dark');
        const isDark = document.body.classList.contains('dark');
        localStorage.setItem('darkMode', isDark);
        document.getElementById('dark-mode-toggle').innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });

    // Profile
    document.getElementById('save-profile-btn').addEventListener('click', () => {
        const name = document.getElementById('profile-name').value.trim();
        if (name) userProfile.name = name;
        userProfile.preferredCurrency = document.getElementById('default-currency').value;
        currentCurrency = userProfile.preferredCurrency;
        document.getElementById('user-name').textContent = userProfile.name;
        document.getElementById('preferred-currency').textContent = currentCurrency;
        saveProfile();
        renderAll();
    });

    document.getElementById('currency-select').addEventListener('change', e => {
        currentCurrency = e.target.value;
        renderAll();
    });

    // Reset
    document.getElementById('reset-btn').addEventListener('click', () => {
        if (confirm('Reset all data?')) {
            localStorage.clear();
            location.reload();
        }
    });

    // Export / Import
    document.getElementById('export-btn').addEventListener('click', () => {
        const data = { transactions, profile: userProfile };
        const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'fintrack-backup.json';
        a.click();
    });

    document.getElementById('import-btn').addEventListener('click', () => document.getElementById('import-file').click());
    document.getElementById('import-file').addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
            try {
                const data = JSON.parse(ev.target.result);
                if (data.transactions) transactions = data.transactions;
                if (data.profile) {
                    userProfile = data.profile;
                    currentCurrency = userProfile.preferredCurrency;
                }
                saveTransactions();
                saveProfile();
                renderAll();
            } catch(err) { alert('Invalid file'); }
        };
        reader.readAsText(file);
    });

    renderAll();
}

window.onload = init;

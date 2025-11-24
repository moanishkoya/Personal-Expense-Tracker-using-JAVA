const API_BASE = "http://localhost:8080/api";
const AUTH_URL = `${API_BASE}/auth`;
const EXPENSE_URL = `${API_BASE}/expenses`;

// State
let expenses = [];
let myChart = null;
let myBarChart = null;
let currentUser = null; // Stores {id, username}

// Views
const authView = document.getElementById('authView');
const dashboardView = document.getElementById('dashboardView');

// Elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const authMessage = document.getElementById('authMessage');
const authTitle = document.getElementById('authTitle');
const authSubtitle = document.getElementById('authSubtitle');
const toggleBtn = document.getElementById('toggleBtn');
const toggleText = document.getElementById('toggleText');
const displayUsername = document.getElementById('displayUsername');

const expenseList = document.getElementById('expenseList');
const totalAmountEl = document.getElementById('totalAmount');
const transactionCountEl = document.getElementById('transactionCount');
const modal = document.getElementById('modalOverlay');
const expenseForm = document.getElementById('expenseForm');
const loadingEl = document.getElementById('loading');

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Check localStorage for session
    const storedUser = localStorage.getItem('lumina_user');
    
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        showDashboard();
    }
});

// --- AUTH LOGIC ---

// Toggle between Login and Signup modes
function toggleAuthMode() {
    loginForm.classList.toggle('hidden');
    signupForm.classList.toggle('hidden');
    authMessage.classList.add('hidden'); // Clear errors

    if (loginForm.classList.contains('hidden')) {
        authTitle.innerText = "Create Account";
        authSubtitle.innerText = "Join us to track your expenses";
        toggleText.innerText = "Already have an account?";
        toggleBtn.innerText = "Sign In";
    } else {
        authTitle.innerText = "Welcome Back";
        authSubtitle.innerText = "Please sign in to continue";
        toggleText.innerText = "Don't have an account?";
        toggleBtn.innerText = "Sign Up";
    }
}

// Handle Login Submit
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUser').value;
    const password = document.getElementById('loginPass').value;

    try {
        const res = await fetch(`${AUTH_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (!res.ok) {
            showAuthError(data.message || "Login failed");
            return;
        }

        loginSuccess(data);
    } catch (error) {
        showAuthError("Connection error. Is backend running?");
    }
});

// Handle Signup Submit
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('signupUser').value;
    const password = document.getElementById('signupPass').value;

    try {
        const res = await fetch(`${AUTH_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (!res.ok) {
            showAuthError(data.message || "Registration failed");
            return;
        }

        // Auto login after signup
        loginSuccess(data);
    } catch (error) {
        showAuthError("Connection error. Is backend running?");
    }
});

function showAuthError(msg) {
    authMessage.innerText = msg;
    authMessage.classList.remove('hidden');
}

function loginSuccess(userData) {
    currentUser = userData;
    localStorage.setItem('lumina_user', JSON.stringify(currentUser));
    
    // Clear forms
    loginForm.reset();
    signupForm.reset();
    
    showDashboard();
}

function logout() {
    localStorage.removeItem('lumina_user');
    currentUser = null;
    
    dashboardView.classList.add('hidden');
    authView.classList.remove('hidden');
}

function showDashboard() {
    authView.classList.add('hidden');
    dashboardView.classList.remove('hidden');
    
    displayUsername.innerText = currentUser.username;
    
    // Init Date and Data
    document.getElementById('dateInput').valueAsDate = new Date();
    document.getElementById('currentDate').innerText = new Date().toLocaleDateString('en-GB', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
    
    fetchExpenses();
}

// --- EXPENSE API CALLS ---

async function fetchExpenses() {
    if (!currentUser) return;
    showLoading(true);
    try {
        const res = await fetch(`${EXPENSE_URL}?userId=${currentUser.id}`);
        if (!res.ok) throw new Error("Failed to fetch");
        
        expenses = await res.json();
        renderExpenses(expenses);
        updateSummary(expenses);
        renderChart(expenses);
        renderBarChart(expenses);
    } catch (error) {
        console.error("Error fetching expenses:", error);
    } finally {
        showLoading(false);
    }
}

async function createExpense(expense) {
    try {
        const res = await fetch(EXPENSE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(expense)
        });
        if (res.ok) {
            fetchExpenses();
            closeModal();
            expenseForm.reset();
        }
    } catch (error) {
        console.error("Error creating expense:", error);
    }
}

async function deleteExpense(id) {
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    try {
        await fetch(`${EXPENSE_URL}/${id}?userId=${currentUser.id}`, { method: 'DELETE' });
        expenses = expenses.filter(e => e.id !== id);
        renderExpenses(expenses);
        updateSummary(expenses);
        renderChart(expenses);
        renderBarChart(expenses);
    } catch (error) {
        console.error("Error deleting:", error);
    }
}

async function filterExpenses() {
    const from = document.getElementById('filterFrom').value;
    const to = document.getElementById('filterTo').value;
    if (!from || !to) { alert("Please select both dates"); return; }

    showLoading(true);
    try {
        const res = await fetch(`${EXPENSE_URL}?userId=${currentUser.id}&from=${from}&to=${to}`);
        if (!res.ok) throw new Error("Failed to fetch filtered expenses");

        const filtered = await res.json();
        renderExpenses(filtered);
        updateSummary(filtered); 
        renderChart(filtered);
        renderBarChart(filtered);
    } catch (error) {
        console.error("Error filtering:", error);
    } finally {
        showLoading(false);
    }
}

// --- CHART & UI LOGIC ---

function renderChart(data) {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    const categoryTotals = {};
    data.forEach(expense => {
        const cat = expense.category || 'Other';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + expense.amount;
    });

    const labels = Object.keys(categoryTotals);
    const values = Object.values(categoryTotals);
    const backgroundColors = ['#6366f1', '#ec4899', '#a855f7', '#22c55e', '#eab308', '#3b82f6', '#ef4444', '#94a3b8'];

    if (myChart) {
        myChart.data.labels = labels;
        myChart.data.datasets[0].data = values;
        myChart.update();
    } else {
        myChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: backgroundColors,
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 2,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { 
                        position: 'right', 
                        labels: { 
                            color: '#f1f5f9', 
                            font: { family: "'Inter', sans-serif", size: 11 }, 
                            usePointStyle: true, 
                            boxWidth: 8 
                        } 
                    },
                    tooltip: { 
                        callbacks: { 
                            label: (context) => ` ₹${context.parsed.toFixed(2)}` 
                        } 
                    }
                },
                layout: { padding: 10 }
            }
        });
    }
}

// Time-Based Bar Chart
function renderBarChart(data) {
    const ctx = document.getElementById('barChart').getContext('2d');
    const spendingByDate = {};
    data.forEach(expense => {
        spendingByDate[expense.date] = (spendingByDate[expense.date] || 0) + expense.amount;
    });

    const labels = Object.keys(spendingByDate).sort((a, b) => new Date(a) - new Date(b));
    const values = labels.map(label => spendingByDate[label]);

    if (myBarChart) {
        myBarChart.data.labels = labels;
        myBarChart.data.datasets[0].data = values;
        myBarChart.update();
    } else {
        myBarChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Total Spent',
                    data: values,
                    backgroundColor: 'rgba(99, 102, 241, 0.6)',
                    borderColor: 'rgba(99, 102, 241, 1)',
                    borderWidth: 1,
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { 
                        callbacks: { 
                            label: (context) => ` Total: ₹${context.parsed.y.toFixed(2)}` 
                        } 
                    }
                },
                scales: {
                    y: { 
                        beginAtZero: true, 
                        ticks: { color: '#94a3b8' }, 
                        grid: { color: 'rgba(255, 255, 255, 0.1)' } 
                    },
                    x: { 
                        ticks: { color: '#94a3b8' }, 
                        grid: { color: 'rgba(255, 255, 255, 0.05)' } 
                    }
                }
            }
        });
    }
}

function renderExpenses(data) {
    expenseList.innerHTML = "";
    if (data.length === 0) { 
        expenseList.innerHTML = "<p style='text-align:center; color:#94a3b8; padding:20px;'>No transactions found.</p>"; 
        return; 
    }

    const sortedData = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
    sortedData.forEach((expense, index) => {
        const li = document.createElement('li');
        li.className = 'expense-item';
        li.style.animationDelay = `${index * 0.05}s`;
        li.innerHTML = `
            <div><div style="font-weight:600">${expense.description || 'No Description'}</div></div>
            <div><span class="expense-category">${expense.category || 'General'}</span></div>
            <div style="font-size:0.85rem; color:#94a3b8">${formatDate(expense.date)}</div>
            <div class="expense-amount">-₹${expense.amount.toFixed(2)}</div>
            <div style="text-align:right">
                <button class="delete-btn" onclick="deleteExpense(${expense.id})"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        expenseList.appendChild(li);
    });
}

function updateSummary(data) {
    const total = data.reduce((sum, item) => sum + item.amount, 0);
    const currentVal = parseFloat(totalAmountEl.innerText.replace('₹','').replace(',',''));
    animateValue(totalAmountEl, currentVal, total, 800);
    transactionCountEl.innerText = data.length;
}

function formatDate(dateString) { 
    return new Date(dateString).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' }); 
}

function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    if (isNaN(start)) start = 0;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const current = start + (progress * (end - start));
        obj.innerHTML = '₹' + current.toFixed(2);
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}

function showLoading(isLoading) {
    if (isLoading) { 
        loadingEl.classList.remove('hidden'); 
        expenseList.classList.add('hidden'); 
    } else { 
        loadingEl.classList.add('hidden'); 
        expenseList.classList.remove('hidden'); 
    }
}

function resetFilters() {
    document.getElementById('filterFrom').value = '';
    document.getElementById('filterTo').value = '';
    document.getElementById('searchInput').value = '';
    fetchExpenses();
}

document.getElementById('searchInput').addEventListener('keyup', (e) => {
    const term = e.target.value.toLowerCase();
    const searchResults = expenses.filter(item => 
        (item.description && item.description.toLowerCase().includes(term)) ||
        (item.category && item.category.toLowerCase().includes(term))
    );
    renderExpenses(searchResults);
});

function openModal() { modal.classList.add('active'); }
function closeModal() { modal.classList.remove('active'); }
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

expenseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newExpense = {
        description: document.getElementById('descInput').value,
        amount: parseFloat(document.getElementById('amountInput').value),
        category: document.getElementById('categoryInput').value,
        date: document.getElementById('dateInput').value,
        userId: currentUser.id   // important for user-specific backend
    };
    createExpense(newExpense);
});

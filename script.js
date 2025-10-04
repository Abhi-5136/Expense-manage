// Global State Management
const state = {
    currentUser: null,
    company: null,
    users: [],
    expenses: [],
    approvalSettings: {
        managerApproval: true,
        approvalSequence: [],
        conditionalRule: 'none',
        percentageValue: 60,
        specificApprover: null,
        hybridPercentage: 60,
        hybridApprover: null
    }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    initializeEventListeners();
    checkAuth();
});

// Local Storage Management
function saveToStorage() {
    localStorage.setItem('expenseManagementState', JSON.stringify(state));
}

function loadFromStorage() {
    const saved = localStorage.getItem('expenseManagementState');
    if (saved) {
        const loaded = JSON.parse(saved);
        Object.assign(state, loaded);
    }
}

// Authentication
function checkAuth() {
    if (state.currentUser) {
        showDashboard();
    } else {
        showAuthPage();
    }
}

function showAuthPage() {
    document.getElementById('auth-page').classList.add('active');
    document.getElementById('dashboard-page').classList.remove('active');
}

function showDashboard() {
    document.getElementById('auth-page').classList.remove('active');
    document.getElementById('dashboard-page').classList.add('active');
    updateUserInterface();
    renderDashboard();
}

// Event Listeners
function initializeEventListeners() {
    // Auth forms
    document.getElementById('show-signup').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('signup-form').style.display = 'block';
    });

    document.getElementById('show-login').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('signup-form').style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
    });

    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('signup-form').addEventListener('submit', handleSignup);
    document.getElementById('logout-btn').addEventListener('click', handleLogout);

    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const view = item.getAttribute('data-view');
            switchView(view);
        });
    });

    // Expense form
    document.getElementById('expense-form').addEventListener('submit', handleExpenseSubmit);
    document.getElementById('expense-receipt').addEventListener('change', handleReceiptUpload);
    document.getElementById('ocr-scan-btn').addEventListener('click', handleOCRScan);

    // User management
    document.getElementById('add-user-btn')?.addEventListener('click', () => {
        openModal('user-modal');
    });
    document.getElementById('user-form').addEventListener('submit', handleUserCreate);
    document.getElementById('user-role').addEventListener('change', (e) => {
        const managerGroup = document.getElementById('manager-select-group');
        managerGroup.style.display = e.target.value === 'employee' ? 'block' : 'none';
    });

    // Settings
    document.getElementById('save-settings-btn')?.addEventListener('click', handleSaveSettings);
    document.querySelectorAll('input[name="approval-rule"]').forEach(radio => {
        radio.addEventListener('change', handleApprovalRuleChange);
    });

    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal(btn.closest('.modal').id);
        });
    });

    // Filter
    document.getElementById('filter-status')?.addEventListener('change', renderExpenses);
    document.getElementById('approval-filter')?.addEventListener('change', renderApprovals);
}

// Authentication Handlers
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const user = state.users.find(u => u.email === email && u.password === password);
    
    if (user) {
        state.currentUser = user;
        saveToStorage();
        showToast('Login successful!', 'success');
        showDashboard();
    } else {
        showToast('Invalid email or password', 'error');
    }
}

function handleSignup(e) {
    e.preventDefault();
    
    const companyName = document.getElementById('signup-company').value;
    const currency = document.getElementById('signup-currency').value;
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    // Check if email already exists
    if (state.users.find(u => u.email === email)) {
        showToast('Email already exists', 'error');
        return;
    }

    // Create company
    state.company = {
        name: companyName,
        currency: currency,
        createdAt: new Date().toISOString()
    };

    // Create admin user
    const adminUser = {
        id: generateId(),
        name: name,
        email: email,
        password: password,
        role: 'admin',
        createdAt: new Date().toISOString()
    };

    state.users.push(adminUser);
    state.currentUser = adminUser;
    
    saveToStorage();
    showToast('Account created successfully!', 'success');
    showDashboard();
}

function handleLogout() {
    state.currentUser = null;
    saveToStorage();
    showAuthPage();
    showToast('Logged out successfully', 'success');
}

// UI Updates
function updateUserInterface() {
    const user = state.currentUser;
    document.getElementById('user-name').textContent = user.name;
    
    const roleBadge = document.getElementById('user-role');
    roleBadge.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    roleBadge.className = `badge ${user.role}`;

    // Show/hide navigation items based on role
    const navApprovals = document.getElementById('nav-approvals');
    const navUsers = document.getElementById('nav-users');
    const navSettings = document.getElementById('nav-settings');
    const navSubmit = document.getElementById('nav-submit');

    if (user.role === 'admin') {
        navApprovals.style.display = 'flex';
        navUsers.style.display = 'flex';
        navSettings.style.display = 'flex';
        navSubmit.style.display = 'flex';
    } else if (user.role === 'manager') {
        navApprovals.style.display = 'flex';
        navUsers.style.display = 'none';
        navSettings.style.display = 'none';
        navSubmit.style.display = 'flex';
    } else {
        navApprovals.style.display = 'none';
        navUsers.style.display = 'none';
        navSettings.style.display = 'none';
        navSubmit.style.display = 'flex';
    }

    // Set default currency
    if (state.company) {
        document.getElementById('expense-currency').value = state.company.currency;
    }
}

function switchView(viewName) {
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

    // Update views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(`${viewName}-view`).classList.add('active');

    // Render content based on view
    switch(viewName) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'expenses':
            renderExpenses();
            break;
        case 'approvals':
            renderApprovals();
            break;
        case 'users':
            renderUsers();
            break;
        case 'settings':
            renderSettings();
            break;
    }
}

// Dashboard Rendering
function renderDashboard() {
    const userExpenses = state.expenses.filter(e => 
        e.employeeId === state.currentUser.id || state.currentUser.role !== 'employee'
    );

    const stats = {
        total: userExpenses.length,
        approved: userExpenses.filter(e => e.status === 'approved').length,
        pending: userExpenses.filter(e => e.status === 'pending' || e.status === 'in-review').length,
        rejected: userExpenses.filter(e => e.status === 'rejected').length
    };

    document.getElementById('stat-total').textContent = stats.total;
    document.getElementById('stat-approved').textContent = stats.approved;
    document.getElementById('stat-pending').textContent = stats.pending;
    document.getElementById('stat-rejected').textContent = stats.rejected;

    // Recent expenses
    const recentList = document.getElementById('recent-list');
    const recentExpenses = userExpenses.slice(0, 5);
    
    if (recentExpenses.length === 0) {
        recentList.innerHTML = '<div class="empty-state"><p>No expenses yet</p></div>';
    } else {
        recentList.innerHTML = recentExpenses.map(expense => createExpenseItem(expense)).join('');
    }
}

// Expense Rendering
function renderExpenses() {
    const filter = document.getElementById('filter-status').value;
    let expenses = state.expenses.filter(e => e.employeeId === state.currentUser.id);
    
    if (filter !== 'all') {
        expenses = expenses.filter(e => e.status === filter);
    }

    const expensesList = document.getElementById('expenses-list');
    
    if (expenses.length === 0) {
        expensesList.innerHTML = '<div class="empty-state"><p>No expenses found</p></div>';
    } else {
        expensesList.innerHTML = expenses.map(expense => createExpenseItem(expense)).join('');
    }
}

function createExpenseItem(expense) {
    const employee = state.users.find(u => u.id === expense.employeeId);
    const employeeName = employee ? employee.name : 'Unknown';
    
    return `
        <div class="expense-item" onclick="viewExpenseDetails('${expense.id}')">
            <div class="expense-info">
                <div class="expense-title">${expense.category} - ${expense.description}</div>
                <div class="expense-meta">
                    <span>${employeeName}</span>
                    <span>${formatDate(expense.date)}</span>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 16px;">
                <div class="expense-amount">${formatCurrency(expense.amount, expense.currency)}</div>
                <span class="status-badge ${expense.status}">${expense.status}</span>
            </div>
        </div>
    `;
}

// Expense Submission
function handleExpenseSubmit(e) {
    e.preventDefault();

    const expense = {
        id: generateId(),
        employeeId: state.currentUser.id,
        amount: parseFloat(document.getElementById('expense-amount').value),
        currency: document.getElementById('expense-currency').value,
        category: document.getElementById('expense-category').value,
        date: document.getElementById('expense-date').value,
        description: document.getElementById('expense-description').value,
        receipt: document.getElementById('expense-receipt').files[0]?.name || null,
        status: 'pending',
        approvalHistory: [],
        createdAt: new Date().toISOString()
    };

    // Determine initial status based on approval settings
    if (state.approvalSettings.managerApproval) {
        const employee = state.users.find(u => u.id === state.currentUser.id);
        if (employee && employee.managerId) {
            expense.status = 'in-review';
            expense.currentApproverId = employee.managerId;
        }
    } else if (state.approvalSettings.approvalSequence.length > 0) {
        expense.status = 'in-review';
        expense.currentApproverId = state.approvalSettings.approvalSequence[0];
        expense.approvalStep = 0;
    }

    state.expenses.push(expense);
    saveToStorage();

    showToast('Expense submitted successfully!', 'success');
    e.target.reset();
    document.getElementById('receipt-name').textContent = '';
    switchView('expenses');
}

function handleReceiptUpload(e) {
    const file = e.target.files[0];
    if (file) {
        document.getElementById('receipt-name').textContent = file.name;
    }
}

function handleOCRScan() {
    // Simulate OCR scanning
    showToast('OCR feature: In a real implementation, this would use Tesseract.js or a cloud OCR API', 'warning');
    
    // Simulate auto-fill
    setTimeout(() => {
        document.getElementById('expense-amount').value = '125.50';
        document.getElementById('expense-category').value = 'Meals';
        document.getElementById('expense-date').value = new Date().toISOString().split('T')[0];
        document.getElementById('expense-description').value = 'Business lunch at Restaurant XYZ';
        showToast('Receipt scanned! Fields auto-filled.', 'success');
    }, 1500);
}

// Approvals Rendering
function renderApprovals() {
    const filter = document.getElementById('approval-filter').value;
    let expenses;

    if (state.currentUser.role === 'admin') {
        // Admin sees all expenses
        expenses = state.expenses;
    } else {
        // Manager sees expenses assigned to them
        expenses = state.expenses.filter(e => 
            e.currentApproverId === state.currentUser.id ||
            (e.status === 'pending' && state.approvalSettings.approvalSequence.includes(state.currentUser.id))
        );
    }

    if (filter === 'pending') {
        expenses = expenses.filter(e => e.status === 'pending' || e.status === 'in-review');
    }

    const approvalsList = document.getElementById('approvals-list');
    
    if (expenses.length === 0) {
        approvalsList.innerHTML = '<div class="empty-state"><p>No expenses to approve</p></div>';
    } else {
        approvalsList.innerHTML = expenses.map(expense => createApprovalItem(expense)).join('');
    }
}

function createApprovalItem(expense) {
    const employee = state.users.find(u => u.id === expense.employeeId);
    const employeeName = employee ? employee.name : 'Unknown';
    const convertedAmount = state.company ? convertCurrency(expense.amount, expense.currency, state.company.currency) : expense.amount;
    
    return `
        <div class="expense-item" onclick="viewExpenseForApproval('${expense.id}')">
            <div class="expense-info">
                <div class="expense-title">${expense.category} - ${expense.description}</div>
                <div class="expense-meta">
                    <span>${employeeName}</span>
                    <span>${formatDate(expense.date)}</span>
                    <span>Original: ${formatCurrency(expense.amount, expense.currency)}</span>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 16px;">
                <div class="expense-amount">${formatCurrency(convertedAmount, state.company.currency)}</div>
                <span class="status-badge ${expense.status}">${expense.status}</span>
            </div>
        </div>
    `;
}

function viewExpenseDetails(expenseId) {
    const expense = state.expenses.find(e => e.id === expenseId);
    if (!expense) return;

    const employee = state.users.find(u => u.id === expense.employeeId);
    const modal = document.getElementById('expense-modal');
    const detailsDiv = document.getElementById('expense-details');

    detailsDiv.innerHTML = `
        <div class="detail-row">
            <span class="detail-label">Employee:</span>
            <span class="detail-value">${employee?.name || 'Unknown'}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Category:</span>
            <span class="detail-value">${expense.category}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Amount:</span>
            <span class="detail-value">${formatCurrency(expense.amount, expense.currency)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Date:</span>
            <span class="detail-value">${formatDate(expense.date)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Description:</span>
            <span class="detail-value">${expense.description}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Status:</span>
            <span class="detail-value"><span class="status-badge ${expense.status}">${expense.status}</span></span>
        </div>
        ${expense.receipt ? `
        <div class="detail-row">
            <span class="detail-label">Receipt:</span>
            <span class="detail-value">${expense.receipt}</span>
        </div>
        ` : ''}
        ${expense.approvalHistory.length > 0 ? `
        <div class="approval-timeline">
            <h4>Approval History</h4>
            ${expense.approvalHistory.map(history => {
                const approver = state.users.find(u => u.id === history.approverId);
                return `
                    <div class="timeline-item">
                        <div class="timeline-icon ${history.action}">
                            ${history.action === 'approved' ? '✓' : '✗'}
                        </div>
                        <div class="timeline-content">
                            <h5>${approver?.name || 'Unknown'} ${history.action} this expense</h5>
                            <p>${formatDate(history.date)}</p>
                            ${history.comment ? `<p>${history.comment}</p>` : ''}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
        ` : ''}
    `;

    openModal('expense-modal');
}

function viewExpenseForApproval(expenseId) {
    const expense = state.expenses.find(e => e.id === expenseId);
    if (!expense) return;

    const employee = state.users.find(u => u.id === expense.employeeId);
    const modal = document.getElementById('expense-modal');
    const detailsDiv = document.getElementById('expense-details');
    const convertedAmount = state.company ? convertCurrency(expense.amount, expense.currency, state.company.currency) : expense.amount;

    detailsDiv.innerHTML = `
        <div class="detail-row">
            <span class="detail-label">Employee:</span>
            <span class="detail-value">${employee?.name || 'Unknown'}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Category:</span>
            <span class="detail-value">${expense.category}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Original Amount:</span>
            <span class="detail-value">${formatCurrency(expense.amount, expense.currency)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Converted Amount:</span>
            <span class="detail-value">${formatCurrency(convertedAmount, state.company.currency)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Date:</span>
            <span class="detail-value">${formatDate(expense.date)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Description:</span>
            <span class="detail-value">${expense.description}</span>
        </div>
        ${expense.receipt ? `
        <div class="detail-row">
            <span class="detail-label">Receipt:</span>
            <span class="detail-value">${expense.receipt}</span>
        </div>
        ` : ''}
        ${(expense.status === 'pending' || expense.status === 'in-review') && (state.currentUser.role === 'admin' || expense.currentApproverId === state.currentUser.id) ? `
        <div class="approval-actions">
            <textarea id="approval-comment" placeholder="Add a comment (optional)" rows="3"></textarea>
            <button class="btn btn-success" onclick="approveExpense('${expenseId}')">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Approve
            </button>
            <button class="btn btn-danger" onclick="rejectExpense('${expenseId}')">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                Reject
            </button>
        </div>
        ` : ''}
    `;

    openModal('expense-modal');
}

function approveExpense(expenseId) {
    const expense = state.expenses.find(e => e.id === expenseId);
    if (!expense) return;

    const comment = document.getElementById('approval-comment')?.value || '';

    expense.approvalHistory.push({
        approverId: state.currentUser.id,
        action: 'approved',
        comment: comment,
        date: new Date().toISOString()
    });

    // Check if there are more approvers in sequence
    if (state.approvalSettings.approvalSequence.length > 0 && expense.approvalStep !== undefined) {
        const nextStep = expense.approvalStep + 1;
        if (nextStep < state.approvalSettings.approvalSequence.length) {
            expense.approvalStep = nextStep;
            expense.currentApproverId = state.approvalSettings.approvalSequence[nextStep];
            expense.status = 'in-review';
        } else {
            expense.status = 'approved';
            expense.currentApproverId = null;
        }
    } else {
        // Check conditional rules
        const shouldAutoApprove = checkConditionalApproval(expense);
        if (shouldAutoApprove) {
            expense.status = 'approved';
        } else {
            expense.status = 'approved';
        }
        expense.currentApproverId = null;
    }

    saveToStorage();
    closeModal('expense-modal');
    showToast('Expense approved!', 'success');
    renderApprovals();
}

function rejectExpense(expenseId) {
    const expense = state.expenses.find(e => e.id === expenseId);
    if (!expense) return;

    const comment = document.getElementById('approval-comment')?.value || '';

    expense.approvalHistory.push({
        approverId: state.currentUser.id,
        action: 'rejected',
        comment: comment,
        date: new Date().toISOString()
    });

    expense.status = 'rejected';
    expense.currentApproverId = null;

    saveToStorage();
    closeModal('expense-modal');
    showToast('Expense rejected', 'success');
    renderApprovals();
}

function checkConditionalApproval(expense) {
    const settings = state.approvalSettings;
    
    if (settings.conditionalRule === 'percentage') {
        const approvals = expense.approvalHistory.filter(h => h.action === 'approved').length;
        const totalApprovers = state.users.filter(u => u.role === 'manager' || u.role === 'admin').length;
        const percentage = (approvals / totalApprovers) * 100;
        return percentage >= settings.percentageValue;
    } else if (settings.conditionalRule === 'specific') {
        return expense.approvalHistory.some(h => 
            h.approverId === settings.specificApprover && h.action === 'approved'
        );
    } else if (settings.conditionalRule === 'hybrid') {
        const approvals = expense.approvalHistory.filter(h => h.action === 'approved').length;
        const totalApprovers = state.users.filter(u => u.role === 'manager' || u.role === 'admin').length;
        const percentage = (approvals / totalApprovers) * 100;
        const specificApproved = expense.approvalHistory.some(h => 
            h.approverId === settings.hybridApprover && h.action === 'approved'
        );
        return percentage >= settings.hybridPercentage || specificApproved;
    }
    
    return false;
}

// User Management
function renderUsers() {
    const usersList = document.getElementById('users-list');
    const users = state.users.filter(u => u.id !== state.currentUser.id);

    if (users.length === 0) {
        usersList.innerHTML = '<div class="empty-state"><p>No users yet. Add your first employee!</p></div>';
    } else {
        usersList.innerHTML = users.map(user => createUserCard(user)).join('');
    }

    // Update manager dropdowns
    updateManagerDropdowns();
}

function createUserCard(user) {
    const manager = user.managerId ? state.users.find(u => u.id === user.managerId) : null;
    const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();

    return `
        <div class="user-card">
            <div class="user-header">
                <div>
                    <div class="user-avatar">${initials}</div>
                </div>
                <span class="badge ${user.role}">${user.role}</span>
            </div>
            <div class="user-info">
                <h4>${user.name}</h4>
                <p>${user.email}</p>
                ${manager ? `<p style="font-size: 13px; margin-top: 4px;">Manager: ${manager.name}</p>` : ''}
            </div>
            <div class="user-actions">
                <button class="btn btn-secondary" onclick="editUser('${user.id}')">Edit</button>
                <button class="btn btn-danger" onclick="deleteUser('${user.id}')">Delete</button>
            </div>
        </div>
    `;
}

function handleUserCreate(e) {
    e.preventDefault();

    const user = {
        id: generateId(),
        name: document.getElementById('user-name').value,
        email: document.getElementById('user-email').value,
        password: document.getElementById('user-password').value,
        role: document.getElementById('user-role').value,
        managerId: document.getElementById('user-manager').value || null,
        createdAt: new Date().toISOString()
    };

    // Check if email already exists
    if (state.users.find(u => u.email === user.email)) {
        showToast('Email already exists', 'error');
        return;
    }

    state.users.push(user);
    saveToStorage();

    closeModal('user-modal');
    showToast('User created successfully!', 'success');
    renderUsers();
    e.target.reset();
}

function editUser(userId) {
    showToast('Edit functionality would be implemented here', 'warning');
}

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        state.users = state.users.filter(u => u.id !== userId);
        saveToStorage();
        showToast('User deleted', 'success');
        renderUsers();
    }
}

function updateManagerDropdowns() {
    const managers = state.users.filter(u => u.role === 'manager' || u.role === 'admin');
    
    const userManagerSelect = document.getElementById('user-manager');
    userManagerSelect.innerHTML = '<option value="">Select manager</option>' +
        managers.map(m => `<option value="${m.id}">${m.name}</option>`).join('');

    const specificApproverSelect = document.getElementById('specific-approver');
    if (specificApproverSelect) {
        specificApproverSelect.innerHTML = '<option value="">Select approver</option>' +
            managers.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
    }

    const hybridApproverSelect = document.getElementById('hybrid-approver');
    if (hybridApproverSelect) {
        hybridApproverSelect.innerHTML = '<option value="">Select approver</option>' +
            managers.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
    }
}

// Settings Management
function renderSettings() {
    const settings = state.approvalSettings;

    document.getElementById('enable-manager-approval').checked = settings.managerApproval;

    // Render approval sequence
    renderApprovalSequence();

    // Set conditional rule
    document.querySelector(`input[name="approval-rule"][value="${settings.conditionalRule}"]`).checked = true;
    handleApprovalRuleChange({ target: { value: settings.conditionalRule } });

    if (settings.percentageValue) {
        document.getElementById('percentage-value').value = settings.percentageValue;
    }
    if (settings.specificApprover) {
        document.getElementById('specific-approver').value = settings.specificApprover;
    }
    if (settings.hybridPercentage) {
        document.getElementById('hybrid-percentage').value = settings.hybridPercentage;
    }
    if (settings.hybridApprover) {
        document.getElementById('hybrid-approver').value = settings.hybridApprover;
    }

    updateManagerDropdowns();
}

function renderApprovalSequence() {
    const sequenceList = document.getElementById('approval-sequence-list');
    const sequence = state.approvalSettings.approvalSequence;

    if (sequence.length === 0) {
        sequenceList.innerHTML = '<p style="color: var(--text-secondary); font-size: 14px;">No approval sequence defined</p>';
    } else {
        sequenceList.innerHTML = sequence.map((approverId, index) => {
            const approver = state.users.find(u => u.id === approverId);
            return `
                <div class="sequence-item">
                    <span>Step ${index + 1}: ${approver?.name || 'Unknown'}</span>
                    <button class="btn btn-danger" onclick="removeApprover(${index})">Remove</button>
                </div>
            `;
        }).join('');
    }

    // Add approver button handler
    const addBtn = document.getElementById('add-approver-btn');
    addBtn.onclick = addApproverToSequence;
}

function addApproverToSequence() {
    const managers = state.users.filter(u => 
        (u.role === 'manager' || u.role === 'admin') && 
        !state.approvalSettings.approvalSequence.includes(u.id)
    );

    if (managers.length === 0) {
        showToast('No more approvers available', 'warning');
        return;
    }

    // For simplicity, add the first available manager
    state.approvalSettings.approvalSequence.push(managers[0].id);
    saveToStorage();
    renderApprovalSequence();
}

function removeApprover(index) {
    state.approvalSettings.approvalSequence.splice(index, 1);
    saveToStorage();
    renderApprovalSequence();
}

function handleApprovalRuleChange(e) {
    const value = e.target.value;

    document.getElementById('percentage-config').style.display = value === 'percentage' ? 'flex' : 'none';
    document.getElementById('specific-config').style.display = value === 'specific' ? 'flex' : 'none';
    document.getElementById('hybrid-config').style.display = value === 'hybrid' ? 'flex' : 'none';
}

function handleSaveSettings() {
    const settings = state.approvalSettings;

    settings.managerApproval = document.getElementById('enable-manager-approval').checked;
    
    const selectedRule = document.querySelector('input[name="approval-rule"]:checked').value;
    settings.conditionalRule = selectedRule;

    if (selectedRule === 'percentage') {
        settings.percentageValue = parseInt(document.getElementById('percentage-value').value) || 60;
    } else if (selectedRule === 'specific') {
        settings.specificApprover = document.getElementById('specific-approver').value;
    } else if (selectedRule === 'hybrid') {
        settings.hybridPercentage = parseInt(document.getElementById('hybrid-percentage').value) || 60;
        settings.hybridApprover = document.getElementById('hybrid-approver').value;
    }

    saveToStorage();
    showToast('Settings saved successfully!', 'success');
}

// Currency Conversion (Simplified - uses mock rates)
function convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return amount;

    // Mock exchange rates (in real app, use API)
    const rates = {
        'USD': 1,
        'EUR': 0.85,
        'GBP': 0.73,
        'INR': 83.12,
        'JPY': 110.0,
        'AUD': 1.35,
        'CAD': 1.25
    };

    const usdAmount = amount / (rates[fromCurrency] || 1);
    return usdAmount * (rates[toCurrency] || 1);
}

// Utility Functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatCurrency(amount, currency) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            ${type === 'success' ? '<polyline points="20 6 9 17 4 12"></polyline>' : 
              type === 'error' ? '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>' :
              '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>'}
        </svg>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Demo Data (for testing)
function loadDemoData() {
    if (state.users.length === 0) {
        // This would be called only for demo purposes
        console.log('No demo data loaded. Please sign up to get started.');
    }
}

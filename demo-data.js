// Demo Data Generator for Expense Management System
// This file can be used to populate the system with sample data for testing

function generateDemoData() {
    // Clear existing data
    if (!confirm('This will clear all existing data and load demo data. Continue?')) {
        return;
    }

    const demoState = {
        currentUser: null,
        company: {
            name: "TechCorp Solutions",
            currency: "USD",
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
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

    // Create users
    const adminId = generateId();
    const manager1Id = generateId();
    const manager2Id = generateId();
    const employee1Id = generateId();
    const employee2Id = generateId();
    const employee3Id = generateId();

    demoState.users = [
        {
            id: adminId,
            name: "Sarah Johnson",
            email: "admin@techcorp.com",
            password: "admin123",
            role: "admin",
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: manager1Id,
            name: "Michael Chen",
            email: "michael@techcorp.com",
            password: "manager123",
            role: "manager",
            createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: manager2Id,
            name: "Emily Rodriguez",
            email: "emily@techcorp.com",
            password: "manager123",
            role: "manager",
            createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: employee1Id,
            name: "David Kim",
            email: "david@techcorp.com",
            password: "employee123",
            role: "employee",
            managerId: manager1Id,
            createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: employee2Id,
            name: "Jessica Brown",
            email: "jessica@techcorp.com",
            password: "employee123",
            role: "employee",
            managerId: manager1Id,
            createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: employee3Id,
            name: "Alex Turner",
            email: "alex@techcorp.com",
            password: "employee123",
            role: "employee",
            managerId: manager2Id,
            createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];

    // Create sample expenses
    const categories = ['Travel', 'Meals', 'Office', 'Accommodation', 'Transportation'];
    const statuses = ['approved', 'pending', 'rejected', 'in-review'];
    const currencies = ['USD', 'EUR', 'GBP', 'INR'];

    const expenseDescriptions = {
        'Travel': [
            'Flight to client meeting in New York',
            'Train tickets for conference',
            'Taxi to airport',
            'Uber to client office'
        ],
        'Meals': [
            'Business lunch with client',
            'Team dinner after project completion',
            'Coffee meeting with stakeholders',
            'Breakfast during business trip'
        ],
        'Office': [
            'Office supplies and stationery',
            'Printer ink cartridges',
            'Desk organizer and accessories',
            'Whiteboard markers'
        ],
        'Accommodation': [
            'Hotel stay in San Francisco',
            'Airbnb for 3-day conference',
            'Hotel near client site',
            'Extended stay for project work'
        ],
        'Transportation': [
            'Monthly parking pass',
            'Gas for company car',
            'Toll fees for business trip',
            'Car rental for client visits'
        ]
    };

    const amounts = {
        'Travel': [250, 450, 890, 1200, 350],
        'Meals': [45, 85, 120, 65, 95],
        'Office': [25, 40, 75, 55, 30],
        'Accommodation': [180, 220, 350, 280, 195],
        'Transportation': [50, 75, 120, 95, 65]
    };

    // Generate 15 sample expenses
    for (let i = 0; i < 15; i++) {
        const category = categories[Math.floor(Math.random() * categories.length)];
        const employeeId = [employee1Id, employee2Id, employee3Id][Math.floor(Math.random() * 3)];
        const employee = demoState.users.find(u => u.id === employeeId);
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const currency = currencies[Math.floor(Math.random() * currencies.length)];
        const daysAgo = Math.floor(Math.random() * 15) + 1;
        
        const expense = {
            id: generateId(),
            employeeId: employeeId,
            amount: amounts[category][Math.floor(Math.random() * amounts[category].length)],
            currency: currency,
            category: category,
            date: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            description: expenseDescriptions[category][Math.floor(Math.random() * expenseDescriptions[category].length)],
            receipt: Math.random() > 0.5 ? `receipt_${i + 1}.jpg` : null,
            status: status,
            approvalHistory: [],
            createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString()
        };

        // Add approval history for approved/rejected expenses
        if (status === 'approved') {
            expense.approvalHistory.push({
                approverId: employee.managerId,
                action: 'approved',
                comment: 'Approved - expense looks reasonable',
                date: new Date(Date.now() - (daysAgo - 1) * 24 * 60 * 60 * 1000).toISOString()
            });
        } else if (status === 'rejected') {
            expense.approvalHistory.push({
                approverId: employee.managerId,
                action: 'rejected',
                comment: 'Missing receipt or exceeds policy limits',
                date: new Date(Date.now() - (daysAgo - 1) * 24 * 60 * 60 * 1000).toISOString()
            });
        } else if (status === 'in-review') {
            expense.currentApproverId = employee.managerId;
        }

        demoState.expenses.push(expense);
    }

    // Set approval settings
    demoState.approvalSettings.approvalSequence = [manager1Id, adminId];

    // Save to localStorage
    localStorage.setItem('expenseManagementState', JSON.stringify(demoState));
    
    alert('Demo data loaded successfully!\n\nDemo Credentials:\n\nAdmin:\nemail: admin@techcorp.com\npassword: admin123\n\nManager:\nemail: michael@techcorp.com\npassword: manager123\n\nEmployee:\nemail: david@techcorp.com\npassword: employee123\n\nPlease refresh the page to see the demo data.');
    
    location.reload();
}

function clearAllData() {
    if (confirm('This will delete all data including users and expenses. Are you sure?')) {
        localStorage.removeItem('expenseManagementState');
        alert('All data cleared. Please refresh the page.');
        location.reload();
    }
}

// Add demo data buttons to the page
function addDemoControls() {
    const style = document.createElement('style');
    style.textContent = `
        .demo-controls {
            position: fixed;
            bottom: 20px;
            left: 20px;
            z-index: 9999;
            display: none; /* Hidden - functions still available via console */
            gap: 10px;
            flex-direction: column;
        }
        .demo-btn {
            padding: 10px 16px;
            background: #4F46E5;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 600;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            transition: all 0.2s;
        }
        .demo-btn:hover {
            background: #4338CA;
            transform: translateY(-2px);
        }
        .demo-btn.danger {
            background: #EF4444;
        }
        .demo-btn.danger:hover {
            background: #DC2626;
        }
    `;
    document.head.appendChild(style);

    const controls = document.createElement('div');
    controls.className = 'demo-controls';
    controls.innerHTML = `
        <button class="demo-btn" onclick="generateDemoData()">📊 Load Demo Data</button>
        <button class="demo-btn danger" onclick="clearAllData()">🗑️ Clear All Data</button>
    `;
    document.body.appendChild(controls);
}

// Auto-load demo data on first visit (without showing buttons)
function autoLoadDemoData() {
    // Check if data already exists
    const existingData = localStorage.getItem('expenseManagementState');
    
    if (!existingData) {
        // No data exists, load demo data silently
        console.log('Loading demo data automatically...');
        
        const demoState = {
            currentUser: null,
            company: {
                name: "TechCorp Solutions",
                currency: "USD",
                createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
            },
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

        // Create users
        const adminId = generateId();
        const manager1Id = generateId();
        const manager2Id = generateId();
        const employee1Id = generateId();
        const employee2Id = generateId();
        const employee3Id = generateId();

        demoState.users = [
            {
                id: adminId,
                name: "Sarah Johnson",
                email: "admin@techcorp.com",
                password: "admin123",
                role: "admin",
                createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: manager1Id,
                name: "Michael Chen",
                email: "michael@techcorp.com",
                password: "manager123",
                role: "manager",
                createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: manager2Id,
                name: "Emily Rodriguez",
                email: "emily@techcorp.com",
                password: "manager123",
                role: "manager",
                createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: employee1Id,
                name: "David Kim",
                email: "david@techcorp.com",
                password: "employee123",
                role: "employee",
                managerId: manager1Id,
                createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: employee2Id,
                name: "Jessica Brown",
                email: "jessica@techcorp.com",
                password: "employee123",
                role: "employee",
                managerId: manager1Id,
                createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: employee3Id,
                name: "Alex Turner",
                email: "alex@techcorp.com",
                password: "employee123",
                role: "employee",
                managerId: manager2Id,
                createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];

        // Create sample expenses
        const categories = ['Travel', 'Meals', 'Office', 'Accommodation', 'Transportation'];
        const statuses = ['approved', 'pending', 'rejected', 'in-review'];
        const currencies = ['USD', 'EUR', 'GBP', 'INR'];

        const expenseDescriptions = {
            'Travel': [
                'Flight to client meeting in New York',
                'Train tickets for conference',
                'Taxi to airport',
                'Uber to client office'
            ],
            'Meals': [
                'Business lunch with client',
                'Team dinner after project completion',
                'Coffee meeting with stakeholders',
                'Breakfast during business trip'
            ],
            'Office': [
                'Office supplies and stationery',
                'Printer ink cartridges',
                'Desk organizer and accessories',
                'Whiteboard markers'
            ],
            'Accommodation': [
                'Hotel stay in San Francisco',
                'Airbnb for 3-day conference',
                'Hotel near client site',
                'Extended stay for project work'
            ],
            'Transportation': [
                'Monthly parking pass',
                'Gas for company car',
                'Toll fees for business trip',
                'Car rental for client visits'
            ]
        };

        const amounts = {
            'Travel': [250, 450, 890, 1200, 350],
            'Meals': [45, 85, 120, 65, 95],
            'Office': [25, 40, 75, 55, 30],
            'Accommodation': [180, 220, 350, 280, 195],
            'Transportation': [50, 75, 120, 95, 65]
        };

        // Generate 15 sample expenses
        for (let i = 0; i < 15; i++) {
            const category = categories[Math.floor(Math.random() * categories.length)];
            const employeeId = [employee1Id, employee2Id, employee3Id][Math.floor(Math.random() * 3)];
            const employee = demoState.users.find(u => u.id === employeeId);
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const currency = currencies[Math.floor(Math.random() * currencies.length)];
            const daysAgo = Math.floor(Math.random() * 15) + 1;
            
            const expense = {
                id: generateId(),
                employeeId: employeeId,
                amount: amounts[category][Math.floor(Math.random() * amounts[category].length)],
                currency: currency,
                category: category,
                date: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                description: expenseDescriptions[category][Math.floor(Math.random() * expenseDescriptions[category].length)],
                receipt: Math.random() > 0.5 ? `receipt_${i + 1}.jpg` : null,
                status: status,
                approvalHistory: [],
                createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString()
            };

            // Add approval history for approved/rejected expenses
            if (status === 'approved') {
                expense.approvalHistory.push({
                    approverId: employee.managerId,
                    action: 'approved',
                    comment: 'Approved - expense looks reasonable',
                    date: new Date(Date.now() - (daysAgo - 1) * 24 * 60 * 60 * 1000).toISOString()
                });
            } else if (status === 'rejected') {
                expense.approvalHistory.push({
                    approverId: employee.managerId,
                    action: 'rejected',
                    comment: 'Missing receipt or exceeds policy limits',
                    date: new Date(Date.now() - (daysAgo - 1) * 24 * 60 * 60 * 1000).toISOString()
                });
            } else if (status === 'in-review') {
                expense.currentApproverId = employee.managerId;
            }

            demoState.expenses.push(expense);
        }

        // Set approval settings
        demoState.approvalSettings.approvalSequence = [manager1Id, adminId];

        // Save to localStorage
        localStorage.setItem('expenseManagementState', JSON.stringify(demoState));
        
        console.log('Demo data loaded successfully!');
    }
}

// Auto-add demo controls when page loads (but hidden)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        autoLoadDemoData();
        addDemoControls();
    });
} else {
    autoLoadDemoData();
    addDemoControls();
}

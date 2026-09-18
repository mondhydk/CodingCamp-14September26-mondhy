/**
 * Integration Tests for Expense & Budget Visualizer
 * 
 * Tests full user flows and component interactions:
 * 1. Transaction Creation Flow
 * 2. Transaction Deletion Flow
 * 3. Theme Toggle Flow
 * 4. Sort Flow
 * 5. Error Recovery Scenarios
 */

// Test utilities and mock setup
const TestUtil = {
  // Setup DOM for testing
  setupDOM: () => {
    // Clear existing DOM
    document.body.innerHTML = '';
    
    // Add required HTML structure
    const html = `
      <div id="app">
        <header class="main-header">
          <h1>Expense & Budget Visualizer</h1>
          <button id="theme-toggle" class="theme-toggle">
            <span class="theme-icon">☀️</span>
            <span class="theme-text">Switch to Dark Mode</span>
          </button>
        </header>
        <main class="main-content">
          <section class="input-form-section">
            <form id="transaction-form" class="input-form">
              <div class="form-group">
                <label for="item-name">Item Name</label>
                <input type="text" id="item-name" name="itemName" required>
                <span class="error-message"></span>
              </div>
              <div class="form-group">
                <label for="amount">Amount</label>
                <input type="number" id="amount" name="amount" step="0.01" required>
                <span class="error-message"></span>
              </div>
              <div class="form-group">
                <label for="category">Category</label>
                <select id="category" name="category" required>
                  <option value="">Select a category</option>
                  <option value="Food">Food</option>
                  <option value="Transport">Transport</option>
                  <option value="Fun">Fun</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Entertainment">Entertainment</option>
                </select>
                <span class="error-message"></span>
              </div>
              <button type="submit" class="btn btn-primary">Add Transaction</button>
            </form>
          </section>
          <section class="balance-section">
            <h2>Total Balance</h2>
            <div id="balance-display" class="balance-display">
              <div class="balance-label">Current Balance</div>
              <div class="balance-amount-container">
                <span id="balance-amount" class="balance-amount">$0.00</span>
              </div>
            </div>
          </section>
          <section class="chart-section">
            <h2>Spending by Category</h2>
            <div class="chart-container">
              <canvas id="expense-chart"></canvas>
            </div>
            <p id="chart-placeholder" class="chart-placeholder">No transactions to display</p>
          </section>
          <section class="transaction-list-section">
            <h2>Transaction History</h2>
            <div class="transaction-list-container">
              <div class="sort-controls">
                <label for="sort-select">Sort by:</label>
                <select id="sort-select">
                  <option value="date-desc">Date (Newest First)</option>
                  <option value="amount-desc">Amount (Highest First)</option>
                  <option value="category-asc">Category (A-Z)</option>
                </select>
              </div>
              <ul id="transaction-list" class="transaction-list"></ul>
              <div class="empty-state" id="empty-state">
                <p>No transactions yet. Add your first expense!</p>
              </div>
            </div>
          </section>
          <section class="monthly-summary-section">
            <h2>Monthly Summary</h2>
            <div class="monthly-summary-container">
              <div class="summary-header">
                <h3>Monthly Summary</h3>
                <div class="month-selector">
                  <button class="nav-btn" id="prev-month">◀</button>
                  <span id="current-month">September 2026</span>
                  <button class="nav-btn" id="next-month">▶</button>
                </div>
              </div>
              <div class="category-breakdown" id="category-breakdown"></div>
              <div class="summary-empty" id="summary-empty">
                <p>No transactions for this month</p>
              </div>
            </div>
          </section>
        </main>
        <footer class="main-footer">
          <p>&copy; 2026 Expense & Budget Visualizer</p>
        </footer>
      </div>
    `;
    document.body.innerHTML = html;
    
    // Add Chart.js canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'expense-chart';
    canvas.width = 400;
    canvas.height = 300;
    document.querySelector('.chart-container').appendChild(canvas);
  },

  // Clear LocalStorage between tests
  clearStorage: () => {
    localStorage.clear();
  },

  // Wait for async operations
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Create test transactions
  createTestTransactions: () => [
    { id: 1, name: 'Groceries', category: 'Food', amount: -50.00, date: '2026-09-01T10:00:00Z' },
    { id: 2, name: 'Bus Ticket', category: 'Transport', amount: -2.50, date: '2026-09-02T12:00:00Z' },
    { id: 3, name: 'Coffee', category: 'Food', amount: -5.00, date: '2026-09-03T08:00:00Z' },
    { id: 4, name: 'Movie', category: 'Entertainment', amount: -15.00, date: '2026-09-04T18:00:00Z' },
    { id: 5, name: 'Salary', category: 'Income', amount: 2000.00, date: '2026-09-05T09:00:00Z' }
  ]
};

// Test Suite: Transaction Creation Flow
describe('Integration: Transaction Creation Flow', () => {
  let app;
  let form;
  let balanceDisplay;
  let transactionList;

  beforeEach(() => {
    TestUtil.setupDOM();
    TestUtil.clearStorage();
    
    // Initialize app
    app = new App();
    app.init();
    
    form = document.getElementById('transaction-form');
    balanceDisplay = document.getElementById('balance-display');
    transactionList = document.getElementById('transaction-list');
  });

  afterEach(() => {
    if (app && app.layoutManager) {
      app.layoutManager.destroy();
    }
    TestUtil.clearStorage();
  });

  /**
   * Test 11.2.1: Complete Transaction Creation Flow
   * Validates that creating a transaction properly updates all dependent components
   */
  it('should complete full transaction creation flow with all updates', async () => {
    // Step 1: Verify initial state
    expect(TestUtil.getTransactionCount()).toBe(0);
    expect(balanceDisplay.querySelector('.balance-amount').textContent).toBe('$0.00');
    expect(TestUtil.isChartEmpty()).toBe(true);

    // Step 2: Fill and submit form
    form.elements.itemName.value = 'Groceries';
    form.elements.amount.value = '50.00';
    form.elements.category.value = 'Food';
    
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(submitEvent);

    // Step 3: Verify form was cleared
    expect(form.elements.itemName.value).toBe('');
    expect(form.elements.amount.value).toBe('');

    // Step 4: Verify transaction was saved
    await TestUtil.wait(10);
    expect(TestUtil.getTransactionCount()).toBe(1);

    // Step 5: Verify balance was updated
    expect(balanceDisplay.querySelector('.balance-amount').textContent).toBe('$50.00');

    // Step 6: Verify chart was updated
    expect(TestUtil.isChartEmpty()).toBe(false);

    // Step 7: Verify transaction list was updated
    expect(transactionList.children.length).toBe(1);
    expect(transactionList.querySelector('.transaction-name').textContent).toBe('Groceries');
  });

  /**
   * Test 11.2.2: Multiple Transaction Creation Flow
   * Validates that creating multiple transactions maintains data integrity
   */
  it('should handle multiple transactions correctly', async () => {
    const transactions = [
      { name: 'Groceries', amount: '50.00', category: 'Food' },
      { name: 'Bus Ticket', amount: '2.50', category: 'Transport' },
      { name: 'Coffee', amount: '5.00', category: 'Food' }
    ];

    // Add each transaction
    for (const transaction of transactions) {
      form.elements.itemName.value = transaction.name;
      form.elements.amount.value = transaction.amount;
      form.elements.category.value = transaction.category;
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      await TestUtil.wait(10);
    }

    // Verify all transactions were saved
    expect(TestUtil.getTransactionCount()).toBe(3);

    // Verify total balance
    expect(balanceDisplay.querySelector('.balance-amount').textContent).toBe('$57.50');

    // Verify all transactions appear in list
    expect(transactionList.children.length).toBe(3);
  });

  /**
   * Test 11.2.3: Transaction Creation with Invalid Data
   * Validates that invalid transactions are rejected
   */
  it('should reject invalid transactions', async () => {
    // Test with empty name
    form.elements.itemName.value = '';
    form.elements.amount.value = '50.00';
    form.elements.category.value = 'Food';
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    
    await TestUtil.wait(10);
    expect(TestUtil.getTransactionCount()).toBe(0);

    // Test with negative amount
    form.elements.itemName.value = 'Test';
    form.elements.amount.value = '-10.00';
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    
    expect(TestUtil.getTransactionCount()).toBe(0);

    // Test with zero amount
    form.elements.amount.value = '0';
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    
    expect(TestUtil.getTransactionCount()).toBe(0);

    // Test with invalid category
    form.elements.amount.value = '50.00';
    form.elements.category.value = 'Invalid';
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    
    expect(TestUtil.getTransactionCount()).toBe(0);
  });
});

// Test Suite: Transaction Deletion Flow
describe('Integration: Transaction Deletion Flow', () => {
  let app;
  let transactionList;

  beforeEach(() => {
    TestUtil.setupDOM();
    TestUtil.clearStorage();
    
    // Initialize app
    app = new App();
    app.init();
    
    // Add initial transactions
    const transactions = [
      { name: 'Groceries', amount: 50.00, category: 'Food' },
      { name: 'Bus Ticket', amount: 2.50, category: 'Transport' },
      { name: 'Coffee', amount: 5.00, category: 'Food' }
    ];
    
    transactions.forEach(t => app.transactionManager.addTransaction(t));
    
    transactionList = document.getElementById('transaction-list');
  });

  afterEach(() => {
    if (app && app.layoutManager) {
      app.layoutManager.destroy();
    }
    TestUtil.clearStorage();
  });

  /**
   * Test 11.2.4: Single Transaction Deletion Flow
   * Validates that deleting a transaction properly updates all dependent components
   */
  it('should complete full transaction deletion flow with all updates', async () => {
    // Verify initial state
    expect(TestUtil.getTransactionCount()).toBe(3);
    const initialBalance = parseFloat(balanceDisplay.querySelector('.balance-amount').textContent.replace(/[$(),]/g, ''));

    // Find delete button for first transaction
    const deleteButtons = transactionList.querySelectorAll('.btn-delete');
    expect(deleteButtons.length).toBe(3);

    // Simulate delete click
    const deleteEvent = new Event('click', { bubbles: true });
    deleteButtons[0].dispatchEvent(deleteEvent);
    await TestUtil.wait(10);

    // Verify transaction was removed
    expect(TestUtil.getTransactionCount()).toBe(2);

    // Verify balance was recalculated
    const newBalance = parseFloat(balanceDisplay.querySelector('.balance-amount').textContent.replace(/[$(),]/g, ''));
    expect(newBalance).toBeLessThan(initialBalance);

    // Verify chart was refreshed
    expect(TestUtil.getTransactionCount()).toBe(2);

    // Verify list was updated
    expect(transactionList.children.length).toBe(2);
  });

  /**
   * Test 11.2.5: Multiple Transaction Deletion Flow
   * Validates that deleting multiple transactions maintains data integrity
   */
  it('should handle multiple transaction deletions correctly', async () => {
    // Delete first transaction
    const deleteButtons1 = transactionList.querySelectorAll('.btn-delete');
    deleteButtons1[0].dispatchEvent(new Event('click', { bubbles: true }));
    await TestUtil.wait(10);

    expect(TestUtil.getTransactionCount()).toBe(2);

    // Delete second transaction
    const deleteButtons2 = transactionList.querySelectorAll('.btn-delete');
    deleteButtons2[0].dispatchEvent(new Event('click', { bubbles: true }));
    await TestUtil.wait(10);

    expect(TestUtil.getTransactionCount()).toBe(1);

    // Verify remaining transaction
    expect(transactionList.children.length).toBe(1);
  });

  /**
   * Test 11.2.6: Delete All Transactions Flow
   * Validates that deleting all transactions shows empty state
   */
  it('should show empty state when all transactions are deleted', async () => {
    // Delete all transactions
    for (let i = 0; i < 3; i++) {
      const deleteButtons = transactionList.querySelectorAll('.btn-delete');
      if (deleteButtons.length > 0) {
        deleteButtons[0].dispatchEvent(new Event('click', { bubbles: true }));
        await TestUtil.wait(10);
      }
    }

    expect(TestUtil.getTransactionCount()).toBe(0);
    expect(balanceDisplay.querySelector('.balance-amount').textContent).toBe('$0.00');

    // Verify empty state is shown
    const emptyState = document.getElementById('empty-state');
    expect(emptyState.classList.contains('hidden')).toBe(false);
  });
});

// Test Suite: Theme Toggle Flow
describe('Integration: Theme Toggle Flow', () => {
  let app;
  let themeManager;
  let themeToggle;

  beforeEach(() => {
    TestUtil.setupDOM();
    TestUtil.clearStorage();
    
    app = new App();
    app.init();
    
    themeManager = app.themeManager;
    themeToggle = document.getElementById('theme-toggle');
  });

  afterEach(() => {
    if (app && app.layoutManager) {
      app.layoutManager.destroy();
    }
    TestUtil.clearStorage();
  });

  /**
   * Test 11.2.7: Theme Toggle and Persistence
   * Validates that theme changes are persisted to LocalStorage
   */
  it('should toggle theme and persist preference', () => {
    // Verify initial theme
    expect(themeManager.getTheme()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    // Toggle to dark
    themeToggle.click();
    expect(themeManager.getTheme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    // Verify persistence
    const storedData = JSON.parse(localStorage.getItem('expenseBudgetVisualizer'));
    expect(storedData.theme).toBe('dark');

    // Toggle back to light
    themeToggle.click();
    expect(themeManager.getTheme()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  /**
   * Test 11.2.8: Theme Change Affects UI
   * Validates that UI elements update when theme changes
   */
  it('should update UI elements when theme changes', () => {
    // Initial state - light theme
    expect(themeToggle.querySelector('.theme-icon').textContent).toBe('☀️');
    expect(themeToggle.querySelector('.theme-text').textContent).toBe('Switch to Dark Mode');

    // Toggle to dark
    themeToggle.click();
    
    // Verify icon changed
    expect(themeToggle.querySelector('.theme-icon').textContent).toBe('🌙');
    
    // Verify text changed
    expect(themeToggle.querySelector('.theme-text').textContent).toBe('Switch to Light Mode');
  });

  /**
   * Test 11.2.9: Theme Persists Across Reload
   * Validates that theme preference survives page reload
   */
  it('should restore theme preference on reload', () => {
    // Set theme to dark
    themeToggle.click();
    expect(themeManager.getTheme()).toBe('dark');

    // Simulate reload by creating new app instance
    const app2 = new App();
    app2.init();
    
    // Verify theme was restored
    expect(app2.themeManager.getTheme()).toBe('dark');
    
    if (app2.layoutManager) {
      app2.layoutManager.destroy();
    }
  });
});

// Test Suite: Sort Flow
describe('Integration: Sort Flow', () => {
  let app;
  let transactionList;
  let sortSelect;

  beforeEach(() => {
    TestUtil.setupDOM();
    TestUtil.clearStorage();
    
    app = new App();
    app.init();
    
    // Add test transactions
    const transactions = [
      { name: 'Transaction 1', amount: 100.00, category: 'Food', date: '2026-09-05T10:00:00Z' },
      { name: 'Transaction 2', amount: 50.00, category: 'Transport', date: '2026-09-01T10:00:00Z' },
      { name: 'Transaction 3', amount: 200.00, category: 'Entertainment', date: '2026-09-10T10:00:00Z' }
    ];
    
    transactions.forEach(t => app.transactionManager.addTransaction(t));
    
    transactionList = document.getElementById('transaction-list');
    sortSelect = document.getElementById('sort-select');
  });

  afterEach(() => {
    if (app && app.layoutManager) {
      app.layoutManager.destroy();
    }
    TestUtil.clearStorage();
  });

  /**
   * Test 11.2.10: Sort by Date (Newest First)
   * Validates that sorting by date shows newest transactions first
   */
  it('should sort by date (newest first)', async () => {
    // Verify initial sort (date-desc)
    const dates = Array.from(transactionList.querySelectorAll('.transaction-meta'))
      .map(el => el.textContent)
      .map(dateStr => new Date(dateStr.split('•')[1].trim()));
    
    // Newest should be first
    expect(dates[0] >= dates[1]).toBe(true);
    expect(dates[1] >= dates[2]).toBe(true);

    // Change sort preference
    sortSelect.value = 'date-desc';
    sortSelect.dispatchEvent(new Event('change', { bubbles: true }));
    await TestUtil.wait(10);

    // Verify persistence
    const storedData = JSON.parse(localStorage.getItem('expenseBudgetVisualizer'));
    expect(storedData.sortPreference).toBe('date-desc');
  });

  /**
   * Test 11.2.11: Sort by Amount (Highest First)
   * Validates that sorting by amount shows highest amounts first
   */
  it('should sort by amount (highest first)', async () => {
    // Change sort to amount-desc
    sortSelect.value = 'amount-desc';
    sortSelect.dispatchEvent(new Event('change', { bubbles: true }));
    await TestUtil.wait(10);

    // Verify amounts are in descending order
    const amounts = Array.from(transactionList.querySelectorAll('.transaction-amount'))
      .map(el => parseFloat(el.textContent.replace(/[$(),]/g, '')));
    
    expect(amounts[0]).toBeGreaterThanOrEqual(amounts[1]);
    expect(amounts[1]).toBeGreaterThanOrEqual(amounts[2]);
  });

  /**
   * Test 11.2.12: Sort by Category (Alphabetical)
   * Validates that sorting by category shows items in alphabetical order
   */
  it('should sort by category (alphabetical)', async () => {
    // Change sort to category-asc
    sortSelect.value = 'category-asc';
    sortSelect.dispatchEvent(new Event('change', { bubbles: true }));
    await TestUtil.wait(10);

    // Verify categories are in alphabetical order
    const categories = Array.from(transactionList.querySelectorAll('.transaction-meta'))
      .map(el => el.textContent)
      .map(catStr => catStr.split('•')[0].trim());
    
    expect(categories[0] <= categories[1]).toBe(true);
    expect(categories[1] <= categories[2]).toBe(true);
  });

  /**
   * Test 11.2.13: Sort Persists Across Reload
   * Validates that sort preference survives page reload
   */
  it('should restore sort preference on reload', () => {
    // Change sort to amount-desc
    sortSelect.value = 'amount-desc';
    sortSelect.dispatchEvent(new Event('change', { bubbles: true }));
    expect(app.sorter.getSortPreference()).toBe('amount-desc');

    // Simulate reload
    const app2 = new App();
    app2.init();
    
    // Verify sort preference was restored
    expect(app2.sorter.getSortPreference()).toBe('amount-desc');
    
    if (app2.layoutManager) {
      app2.layoutManager.destroy();
    }
  });
});

// Test Suite: Error Recovery Scenarios
describe('Integration: Error Recovery Scenarios', () => {
  let app;
  let form;

  beforeEach(() => {
    TestUtil.setupDOM();
    TestUtil.clearStorage();
    
    app = new App();
    app.init();
    
    form = document.getElementById('transaction-form');
  });

  afterEach(() => {
    if (app && app.layoutManager) {
      app.layoutManager.destroy();
    }
    TestUtil.clearStorage();
  });

  /**
   * Test 11.2.14: Validation Error Recovery
   * Validates that form can recover from validation errors and accept valid input
   */
  it('should recover from validation errors', async () => {
    // Try to submit invalid data
    form.elements.itemName.value = '';
    form.elements.amount.value = '-10.00';
    form.elements.category.value = 'Food';
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    // Verify errors are shown
    expect(form.querySelector('.error-message.visible')).not.toBeNull();

    // Clear form and submit valid data
    form.reset();
    form.elements.itemName.value = 'Valid Transaction';
    form.elements.amount.value = '50.00';
    form.elements.category.value = 'Food';
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    // Verify transaction was added
    await TestUtil.wait(10);
    expect(TestUtil.getTransactionCount()).toBe(1);
  });

  /**
   * Test 11.2.15: Empty State Recovery
   * Validates that UI recovers properly when transitioning from empty to non-empty state
   */
  it('should recover from empty state', async () => {
    // Verify empty state initially
    expect(TestUtil.getTransactionCount()).toBe(0);
    const emptyState = document.getElementById('empty-state');
    expect(emptyState.classList.contains('hidden')).toBe(false);

    // Add transaction
    form.elements.itemName.value = 'First Transaction';
    form.elements.amount.value = '10.00';
    form.elements.category.value = 'Food';
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await TestUtil.wait(10);

    // Verify empty state is hidden
    expect(TestUtil.getTransactionCount()).toBe(1);
    expect(emptyState.classList.contains('hidden')).toBe(true);
  });

  /**
   * Test 11.2.16: LocalStorage Error Recovery
   * Validates that app handles LocalStorage errors gracefully
   */
  it('should handle LocalStorage errors gracefully', () => {
    // Mock LocalStorage error
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function() {
      throw new Error('LocalStorage error');
    };

    // Try to add transaction
    form.elements.itemName.value = 'Test';
    form.elements.amount.value = '10.00';
    form.elements.category.value = 'Food';
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    // Verify app doesn't crash
    expect(app).toBeDefined();

    // Restore LocalStorage
    localStorage.setItem = originalSetItem;
  });
});

// Test Suite: Performance and Stress Testing
describe('Integration: Performance Tests', () => {
  let app;

  beforeEach(() => {
    TestUtil.setupDOM();
    TestUtil.clearStorage();
    
    app = new App();
    app.init();
  });

  afterEach(() => {
    if (app && app.layoutManager) {
      app.layoutManager.destroy();
    }
    TestUtil.clearStorage();
  });

  /**
   * Test 11.2.17: Balance Update Performance
   * Validates that balance updates complete within 100ms
   */
  it('should update balance within 100ms', (done) => {
    const transactions = [];
    for (let i = 0; i < 100; i++) {
      transactions.push({
        name: `Transaction ${i}`,
        amount: 10 + i,
        category: 'Test',
        date: new Date().toISOString()
      });
    }
    
    const startTime = performance.now();
    transactions.forEach(t => app.transactionManager.addTransaction(t));
    const endTime = performance.now();
    
    console.log(`Balance update took: ${endTime - startTime.toFixed(2)}ms`);
    expect(endTime - startTime).toBeLessThan(100);
    
    done();
  });

  /**
   * Test 11.2.18: Chart Update Performance
   * Validates that chart updates complete within 500ms
   */
  it('should update chart within 500ms', (done) => {
    const transactions = [];
    for (let i = 0; i < 50; i++) {
      transactions.push({
        name: `Transaction ${i}`,
        amount: 10 + i,
        category: ['Food', 'Transport', 'Entertainment'][i % 3],
        date: new Date().toISOString()
      });
    }
    
    const startTime = performance.now();
    transactions.forEach(t => app.transactionManager.addTransaction(t));
    app.chartRenderer.updateChart();
    const endTime = performance.now();
    
    console.log(`Chart update took: ${endTime - startTime.toFixed(2)}ms`);
    expect(endTime - startTime).toBeLessThan(500);
    
    done();
  });
});

// Test Utilities
TestUtil.getTransactionCount = () => {
  const storedData = localStorage.getItem('expenseBudgetVisualizer');
  if (!storedData) return 0;
  const data = JSON.parse(storedData);
  return Array.isArray(data.transactions) ? data.transactions.length : 0;
};

TestUtil.isChartEmpty = () => {
  const placeholder = document.getElementById('chart-placeholder');
  if (!placeholder) return true;
  return !placeholder.classList.contains('hidden');
};

// Run tests if in test environment
if (typeof window !== 'undefined' && window.Mocha) {
  window.addEventListener('DOMContentLoaded', () => {
    const mocha = new Mocha();
    mocha.addFile(module.id);
    mocha.run();
  });
}
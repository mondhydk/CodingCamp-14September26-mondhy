/**
 * Scenario-Based Tests for Expense Budget Visualizer
 * 
 * Tests across different scenarios:
 * - Performance with many transactions (100+ entries)
 * - Theme switching functionality
 * - Month navigation
 * - Form validation edge cases
 * 
 * Requirements covered: All requirements from the design
 */

'use strict';

// ============================================================================
// TEST UTILITIES
// ============================================================================

/**
 * Creates a clean DOM environment for testing
 */
function createTestDOM() {
  const container = document.createElement('div');
  container.innerHTML = `
    <div id="app-container">
      <!-- Form -->
      <form id="transaction-form">
        <input type="text" id="item-name" name="itemName" />
        <select id="category" name="category">
          <option value="">Select category</option>
          <option value="Food">Food</option>
          <option value="Transport">Transport</option>
          <option value="Fun">Fun</option>
          <option value="Utilities">Utilities</option>
          <option value="Entertainment">Entertainment</option>
        </select>
        <input type="number" id="amount" name="amount" />
        <span class="error-message"></span>
      </form>
      
      <!-- Balance Display -->
      <div id="balance-display">
        <div class="balance-label">Current Balance</div>
        <div class="balance-amount-container" id="balance-container">
          <span id="balance-amount" class="balance-amount">$0.00</span>
        </div>
      </div>
      
      <!-- Chart -->
      <div class="chart-container">
        <canvas id="expense-chart"></canvas>
        <div id="chart-placeholder" class="hidden">No transactions yet</div>
      </div>
      
      <!-- Monthly Summary -->
      <div id="monthly-summary">
        <div class="month-nav">
          <button id="prev-month">Previous</button>
          <span id="current-month">Current Month</span>
          <button id="next-month">Next</button>
        </div>
        <div id="category-breakdown"></div>
        <div id="summary-empty" class="hidden">No transactions for this month</div>
      </div>
      
      <!-- Transaction List -->
      <div id="transaction-list-container">
        <select id="sort-select">
          <option value="date-desc">Date (Newest First)</option>
          <option value="amount-desc">Amount (Highest First)</option>
          <option value="category-asc">Category (A-Z)</option>
        </select>
        <ul id="transaction-list"></ul>
        <div id="empty-state" class="hidden">No transactions yet</div>
      </div>
      
      <!-- Theme Toggle -->
      <button id="theme-toggle">
        <span class="theme-icon">☀️</span>
        <span class="theme-text">Switch to Dark Mode</span>
      </button>
    </div>
  `;
  document.body.appendChild(container);
}

/**
 * Removes test DOM elements
 */
function cleanupTestDOM() {
  const testContainer = document.getElementById('app-container');
  if (testContainer) {
    testContainer.remove();
  }
}

/**
 * Creates mock transactions with specified count
 */
function createMockTransactions(count, baseAmount = 50) {
  const categories = ['Food', 'Transport', 'Fun', 'Utilities', 'Entertainment'];
  const transactionNames = [
    'Groceries', 'Bus Ticket', 'Movie', 'Electric Bill', 'Netflix',
    'Dinner', 'Taxi', 'Game', 'Water Bill', 'Spotify',
    'Lunch', 'Train', 'Concert', 'Internet Bill', 'HBO Max',
    'Breakfast', 'Uber', 'Theme Park', 'Phone Bill', 'Disney+',
    'Coffee', 'Gas', 'Amusement Park', 'Gym Membership', 'Hulu'
  ];
  
  const transactions = [];
  const today = new Date();
  
  for (let i = 0; i < count; i++) {
    const transactionDate = new Date(today);
    // Spread transactions across different months
    transactionDate.setMonth(today.getMonth() - Math.floor(i / 30));
    
    transactions.push({
      id: i + 1,
      name: transactionNames[i % transactionNames.length],
      category: categories[i % categories.length],
      amount: (i % 2 === 0 ? 1 : -1) * (baseAmount + (i % 100)),
      date: transactionDate.toISOString()
    });
  }
  
  return transactions;
}

/**
 * Creates mock transactions for a specific month
 */
function createMonthlyTransactions(month, year, count) {
  const categories = ['Food', 'Transport', 'Fun', 'Utilities', 'Entertainment'];
  const transactionNames = [
    'Groceries', 'Bus Ticket', 'Movie', 'Electric Bill', 'Netflix',
    'Dinner', 'Taxi', 'Game', 'Water Bill', 'Spotify'
  ];
  
  const transactions = [];
  
  for (let i = 0; i < count; i++) {
    const transactionDate = new Date(year, month, 1 + (i % 28));
    
    transactions.push({
      id: i + 1,
      name: transactionNames[i % transactionNames.length],
      category: categories[i % categories.length],
      amount: (i % 2 === 0 ? 1 : -1) * (20 + (i % 50)),
      date: transactionDate.toISOString()
    });
  }
  
  return transactions;
}

/**
 * Waits for specified milliseconds
 */
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// TEST SUITES
// ============================================================================

// Clear LocalStorage before all tests
beforeEach(() => {
  localStorage.clear();
  createTestDOM();
});

afterEach(() => {
  cleanupTestDOM();
});

// ============================================================================
// SCENARIO 1: Performance Tests with Many Transactions (100+ entries)
// ============================================================================

/**
 * Scenario Test 11.3.1: Performance with 100+ transactions
 * Tests that the application maintains acceptable performance with large datasets
 */
describe('Scenario 11.3.1: Performance Tests with Many Transactions', () => {
  let transactionManager;
  let transactionList;
  let balanceDisplay;
  let chartRenderer;
  let mockTransactions;

  before(() => {
    // Create 150 transactions to test performance
    mockTransactions = createMockTransactions(150, 100);
  });

  beforeEach(() => {
    transactionManager = new TransactionManager();
    // Override loadTransactions to return mock data
    transactionManager.dataManager.loadTransactions = () => mockTransactions;
    transactionManager.transactions = mockTransactions;
    
    // Initialize other components
    balanceDisplay = new BalanceDisplay(transactionManager);
    chartRenderer = new ChartRenderer(transactionManager);
    
    // Create transaction list
    transactionList = new TransactionList(
      transactionManager,
      () => {} // No-op delete handler for testing
    );
  });

  /**
   * Test 11.3.1.1: Transaction List Rendering Performance
   * Validates that rendering 150 transactions completes in acceptable time
   */
  it('should render 150 transactions within 200ms', () => {
    const startTime = performance.now();
    transactionList.render();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`Transaction list rendering took: ${duration.toFixed(2)}ms`);
    
    // Should complete within 200ms for 150 items
    expect(duration).toBeLessThan(200);
    
    // Verify all transactions were rendered
    const renderedItems = document.querySelectorAll('#transaction-list .transaction-item');
    expect(renderedItems.length).toBe(150);
  });

  /**
   * Test 11.3.1.2: Balance Calculation Performance
   * Validates that balance calculation with 150 transactions is fast
   */
  it('should calculate balance with 150 transactions within 100ms', () => {
    const startTime = performance.now();
    const balance = transactionManager.calculateBalance();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`Balance calculation with 150 transactions took: ${duration.toFixed(2)}ms`);
    
    // Should complete within 100ms
    expect(duration).toBeLessThan(100);
    
    // Verify balance is calculated correctly
    const expectedBalance = mockTransactions.reduce((sum, t) => sum + t.amount, 0);
    expect(balance).toBe(expectedBalance);
  });

  /**
   * Test 11.3.1.3: Chart Update Performance with Many Transactions
   * Validates that chart updates complete in acceptable time
   */
  it('should update chart with 150 transactions within 500ms', (done) => {
    const startTime = performance.now();
    chartRenderer.updateChart(mockTransactions);
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`Chart update with 150 transactions took: ${duration.toFixed(2)}ms`);
    
    // Should complete within 500ms
    expect(duration).toBeLessThan(500);
    
    // Chart should not be showing placeholder
    const placeholder = document.getElementById('chart-placeholder');
    expect(placeholder.classList.contains('hidden')).toBe(true);
    
    done();
  });

  /**
   * Test 11.3.1.4: Sorting Performance with Many Transactions
   * Validates that sorting works correctly with large datasets
   */
  it('should sort 150 transactions correctly', () => {
    const sorter = new Sorter();
    
    // Test date sorting
    const dateSorted = sorter.sortByDateDesc(mockTransactions);
    for (let i = 0; i < dateSorted.length - 1; i++) {
      expect(new Date(dateSorted[i].date) >= new Date(dateSorted[i + 1].date)).toBe(true);
    }
    
    // Test amount sorting
    const amountSorted = sorter.sortByAmountDesc(mockTransactions);
    for (let i = 0; i < amountSorted.length - 1; i++) {
      expect(amountSorted[i].amount >= amountSorted[i + 1].amount).toBe(true);
    }
    
    // Test category sorting
    const categorySorted = sorter.sortByCategoryAsc(mockTransactions);
    for (let i = 0; i < categorySorted.length - 1; i++) {
      expect(categorySorted[i].category.localeCompare(categorySorted[i + 1].category)).toBeLessThanOrEqual(0);
    }
  });

  /**
   * Test 11.3.1.5: Large Dataset Stress Test
   * Tests with extreme case of 500 transactions
   */
  it('should handle 500 transactions without crashing', () => {
    const largeTransactions = createMockTransactions(500, 50);
    
    const startTime = performance.now();
    
    // Test all major operations
    const sorted = transactionList.sorter.applySort(largeTransactions);
    const balance = largeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const categoryTotals = {};
    
    largeTransactions.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`Stress test with 500 transactions took: ${duration.toFixed(2)}ms`);
    
    // All operations should complete within 500ms
    expect(duration).toBeLessThan(500);
    
    // Verify results
    expect(sorted.length).toBe(500);
    expect(Object.keys(categoryTotals).length).toBe(5);
  });
});

// ============================================================================
// SCENARIO 2: Theme Switching Tests
// ============================================================================

/**
 * Scenario Test 11.3.2: Theme Switching Functionality
 * Tests theme toggle, persistence, and integration with other components
 */
describe('Scenario 11.3.2: Theme Switching Tests', () => {
  let dataManager;
  let themeManager;
  let chartRenderer;
  let originalTheme;

  before(() => {
    // Store original theme
    originalTheme = document.documentElement.getAttribute('data-theme') || 'light';
  });

  beforeEach(() => {
    dataManager = new DataManager();
    themeManager = new ThemeManager(dataManager);
    
    // Mock chart renderer for theme change notifications
    chartRenderer = {
      updateTheme: () => {}
    };
    
    // Spy on chart update method
    themeManager.notifyChartThemeChange = (chart) => {
      if (chart && chart.updateTheme) {
        chart.updateTheme(themeManager.theme);
      }
    };
  });

  afterEach(() => {
    // Restore original theme
    document.documentElement.setAttribute('data-theme', originalTheme);
  });

  /**
   * Test 11.3.2.1: Theme Toggle Functionality
   * Validates that theme can be toggled between light and dark
   */
  it('should toggle theme between light and dark', () => {
    // Start with light theme (default)
    expect(themeManager.getTheme()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(themeManager.themeIcon.textContent).toBe('☀️');
    
    // Toggle to dark
    themeManager.toggleTheme();
    
    expect(themeManager.getTheme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(themeManager.themeIcon.textContent).toBe('🌙');
    
    // Toggle back to light
    themeManager.toggleTheme();
    
    expect(themeManager.getTheme()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(themeManager.themeIcon.textContent).toBe('☀️');
  });

  /**
   * Test 11.3.2.2: Theme Persistence
   * Validates that theme preference is saved to LocalStorage
   */
  it('should persist theme preference to LocalStorage', () => {
    // Toggle theme
    themeManager.toggleTheme();
    
    // Verify saved in LocalStorage
    const storedData = JSON.parse(localStorage.getItem('expenseBudgetVisualizer'));
    expect(storedData.theme).toBe('dark');
    expect(storedData.lastUpdated).toBeDefined();
  });

  /**
   * Test 11.3.2.3: Theme Restoration on Load
   * Validates that saved theme is restored on initialization
   */
  it('should restore saved theme on initialization', () => {
    // Save dark theme
    themeManager.setTheme('dark');
    expect(themeManager.getTheme()).toBe('dark');
    
    // Create new ThemeManager instance
    const newThemeManager = new ThemeManager(dataManager);
    
    // Should restore saved theme
    expect(newThemeManager.getTheme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  /**
   * Test 11.3.2.4: Multiple Theme Switches
   * Validates theme works correctly with multiple switches
   */
  it('should handle multiple theme switches correctly', () => {
    // Perform 10 theme switches
    for (let i = 0; i < 10; i++) {
      themeManager.toggleTheme();
      
      const expectedTheme = i % 2 === 0 ? 'dark' : 'light';
      expect(themeManager.getTheme()).toBe(expectedTheme);
      expect(document.documentElement.getAttribute('data-theme')).toBe(expectedTheme);
    }
    
    // Verify final state
    const finalTheme = themeManager.getTheme();
    expect(finalTheme).toBe('light'); // Even number of switches from light
  });

  /**
   * Test 11.3.2.5: Theme Update with Chart Renderer
   * Validates that chart renderer receives theme change notifications
   */
  it('should notify chart renderer of theme changes', () => {
    let themeNotified = null;
    
    chartRenderer.updateTheme = (theme) => {
      themeNotified = theme;
    };
    
    themeManager.notifyChartThemeChange(chartRenderer);
    
    // Initial notification with current theme
    expect(themeNotified).toBe('light');
    
    // After toggle
    themeManager.toggleTheme();
    themeManager.notifyChartThemeChange(chartRenderer);
    
    expect(themeNotified).toBe('dark');
  });
});

// ============================================================================
// SCENARIO 3: Month Navigation Tests
// ============================================================================

/**
 * Scenario Test 11.3.3: Month Navigation Functionality
 * Tests month navigation, preference persistence, and empty state handling
 */
describe('Scenario 11.3.3: Month Navigation Tests', () => {
  let dataManager;
  let transactionManager;
  let monthlySummary;

  beforeEach(() => {
    dataManager = new DataManager();
    transactionManager = new TransactionManager(dataManager);
    monthlySummary = new MonthlySummary(transactionManager, dataManager);
  });

  /**
   * Test 11.3.3.1: Month Navigation (Previous/Next)
   * Validates month navigation works correctly
   */
  it('should navigate between months correctly', () => {
    const initialMonth = monthlySummary.getSelectedMonth();
    const initialMonthElement = document.getElementById('current-month');
    const initialText = initialMonthElement.textContent;
    
    // Navigate to next month
    monthlySummary.navigateMonth(1);
    
    const afterNext = monthlySummary.getSelectedMonth();
    expect(afterNext.month).toBe((initialMonth.month + 1) % 12);
    expect(afterNext.year).toBe(initialMonth.year);
    
    // Navigate to previous month (back to original)
    monthlySummary.navigateMonth(-1);
    
    const afterPrev = monthlySummary.getSelectedMonth();
    expect(afterPrev.month).toBe(initialMonth.month);
    expect(afterPrev.year).toBe(initialMonth.year);
  });

  /**
   * Test 11.3.3.2: Year Rollover on Navigation
   * Validates year changes correctly when navigating across year boundary
   */
  it('should handle year rollover when navigating months', () => {
    // Set to December
    monthlySummary.updateMonth(11, 2024);
    
    // Navigate to next month (should be January of next year)
    monthlySummary.navigateMonth(1);
    
    const afterNext = monthlySummary.getSelectedMonth();
    expect(afterNext.month).toBe(0); // January
    expect(afterNext.year).toBe(2025);
    
    // Navigate to previous month (back to December)
    monthlySummary.navigateMonth(-1);
    
    const afterPrev = monthlySummary.getSelectedMonth();
    expect(afterPrev.month).toBe(11); // December
    expect(afterPrev.year).toBe(2024);
  });

  /**
   * Test 11.3.3.3: Month Preference Persistence
   * Validates that selected month is saved to LocalStorage
   */
  it('should persist month preference to LocalStorage', () => {
    // Navigate to a different month
    monthlySummary.updateMonth(5, 2024); // June 2024
    
    // Verify saved
    const storedData = JSON.parse(localStorage.getItem('expenseBudgetVisualizer'));
    expect(storedData.selectedMonth).toBe(5);
    expect(storedData.selectedYear).toBe(2024);
  });

  /**
   * Test 11.3.3.4: Month Preference Restoration
   * Validates that saved month is restored on initialization
   */
  it('should restore saved month preference on initialization', () => {
    // Save a specific month
    monthlySummary.updateMonth(3, 2024); // April 2024
    
    // Create new MonthlySummary instance
    const newMonthlySummary = new MonthlySummary(transactionManager, dataManager);
    
    // Should restore saved month
    const restored = newMonthlySummary.getSelectedMonth();
    expect(restored.month).toBe(3);
    expect(restored.year).toBe(2024);
  });

  /**
   * Test 11.3.3.5: Empty State for Months with No Transactions
   * Validates that months without transactions show empty state
   */
  it('should show empty state for months with no transactions', () => {
    // Create monthly summary with no transactions
    monthlySummary.render();
    
    // Should show empty state
    const emptyState = document.getElementById('summary-empty');
    expect(emptyState.classList.contains('hidden')).toBe(false);
    
    // Category breakdown should be empty
    const breakdown = document.getElementById('category-breakdown');
    expect(breakdown.innerHTML).toBe('');
  });

  /**
   * Test 11.3.3.6: Monthly Summary with Transactions
   * Validates correct calculation and display of monthly totals
   */
  it('should display correct monthly totals with transactions', () => {
    // Create transactions for current month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTransactions = createMonthlyTransactions(currentMonth, currentYear, 10);
    
    // Update transaction manager
    transactionManager.transactions = monthlyTransactions;
    
    // Render summary
    monthlySummary.render();
    
    // Should not show empty state
    const emptyState = document.getElementById('summary-empty');
    expect(emptyState.classList.contains('hidden')).toBe(true);
    
    // Category breakdown should have content
    const breakdown = document.getElementById('category-breakdown');
    expect(breakdown.innerHTML).not.toBe('');
  });
});

// ============================================================================
// SCENARIO 4: Form Validation Edge Cases
// ============================================================================

/**
 * Scenario Test 11.3.4: Form Validation Edge Cases
 * Tests validation with unusual/edge case inputs
 */
describe('Scenario 11.3.4: Form Validation Edge Cases', () => {
  /**
   * Test 11.3.4.1: Empty String Name
   * Validates that empty string is rejected
   */
  it('should reject empty string name', () => {
    const result = FormValidator.validateName('');
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('Item name is required');
  });

  /**
   * Test 11.3.4.2: Whitespace-Only Name
   * Validates that whitespace-only input is rejected
   */
  it('should reject whitespace-only name', () => {
    const result = FormValidator.validateName('   ');
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('Item name is required');
  });

  /**
   * Test 11.3.4.3: Name with Only Spaces
   * Validates that name with only spaces is rejected
   */
  it('should reject name with only spaces', () => {
    const result = FormValidator.validateName('     ');
    expect(result.isValid).toBe(false);
  });

  /**
   * Test 11.3.4.4: Name with Leading/Trailing Whitespace
   * Validates that leading/trailing whitespace is trimmed
   */
  it('should trim leading/trailing whitespace from name', () => {
    const result = FormValidator.validateName('  Groceries  ');
    expect(result.isValid).toBe(true);
  });

  /**
   * Test 11.3.4.5: Very Long Name
   * Validates that very long names are rejected
   */
  it('should reject names longer than 100 characters', () => {
    const longName = 'A'.repeat(101);
    const result = FormValidator.validateName(longName);
    
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('Item name must be 100 characters or less');
  });

  /**
   * Test 11.3.4.6: Name with Special Characters
   * Validates that names with special characters are accepted
   */
  it('should accept names with special characters', () => {
    const specialName = 'Groceries @ Market #1';
    const result = FormValidator.validateName(specialName);
    
    expect(result.isValid).toBe(true);
  });

  /**
   * Test 11.3.4.7: Empty Category Selection
   * Validates that empty category is rejected
   */
  it('should reject empty category selection', () => {
    const result = FormValidator.validateCategory('');
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('Please select a category');
  });

  /**
   * Test 11.3.4.8: Null Category
   * Validates that null category is rejected
   */
  it('should reject null category', () => {
    const result = FormValidator.validateCategory(null);
    expect(result.isValid).toBe(false);
  });

  /**
   * Test 11.3.4.9: Invalid Category
   * Validates that invalid category is rejected
   */
  it('should reject invalid category', () => {
    const result = FormValidator.validateCategory('InvalidCategory');
    expect(result.isValid).toBe(false);
  });

  /**
   * Test 11.3.4.10: Empty Amount
   * Validates that empty amount is rejected
   */
  it('should reject empty amount', () => {
    const result = FormValidator.validateAmount('');
    expect(result.isValid).toBe(false);
  });

  /**
   * Test 11.3.4.11: Zero Amount
   * Validates that zero amount is rejected
   */
  it('should reject zero amount', () => {
    const result = FormValidator.validateAmount(0);
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('Amount must be a positive number');
  });

  /**
   * Test 11.3.4.12: Negative Amount
   * Validates that negative amount is rejected (expenses should use negative amounts)
   */
  it('should reject negative amount', () => {
    const result = FormValidator.validateAmount(-50);
    expect(result.isValid).toBe(false);
  });

  /**
   * Test 11.3.4.13: Very Large Amount
   * Validates that very large amounts are rejected
   */
  it('should reject amounts over 10,000,000', () => {
    const result = FormValidator.validateAmount(10000001);
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('Amount is too large');
  });

  /**
   * Test 11.3.4.14: Valid Small Amount
   * Validates that small positive amounts are accepted
   */
  it('should accept valid small amount', () => {
    const result = FormValidator.validateAmount(0.01);
    expect(result.isValid).toBe(true);
  });

  /**
   * Test 11.3.4.15: Valid Large Amount
   * Validates that large (but valid) amounts are accepted
   */
  it('should accept valid large amount', () => {
    const result = FormValidator.validateAmount(9999999);
    expect(result.isValid).toBe(true);
  });

  /**
   * Test 11.3.4.16: Complete Transaction Validation - Invalid Name
   * Validates that validation catches invalid name in complete transaction
   */
  it('should catch invalid name in complete transaction validation', () => {
    const result = FormValidator.validateTransaction({
      name: '   ', // Whitespace only
      category: 'Food',
      amount: '50'
    });
    
    expect(result.isValid).toBe(false);
    expect(result.errors.name).toBeDefined();
  });

  /**
   * Test 11.3.4.17: Complete Transaction Validation - Invalid Category
   * Validates that validation catches invalid category
   */
  it('should catch invalid category in complete transaction validation', () => {
    const result = FormValidator.validateTransaction({
      name: 'Groceries',
      category: '',
      amount: '50'
    });
    
    expect(result.isValid).toBe(false);
    expect(result.errors.category).toBeDefined();
  });

  /**
   * Test 11.3.4.18: Complete Transaction Validation - Invalid Amount
   * Validates that validation catches invalid amount
   */
  it('should catch invalid amount in complete transaction validation', () => {
    const result = FormValidator.validateTransaction({
      name: 'Groceries',
      category: 'Food',
      amount: '-10'
    });
    
    expect(result.isValid).toBe(false);
    expect(result.errors.amount).toBeDefined();
  });

  /**
   * Test 11.3.4.19: Complete Transaction Validation - All Valid
   * Validates that valid complete transaction passes validation
   */
  it('should accept valid complete transaction', () => {
    const result = FormValidator.validateTransaction({
      name: 'Groceries',
      category: 'Food',
      amount: '50.99'
    });
    
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  /**
   * Test 11.3.4.20: Number String Amount
   * Validates that numeric strings are parsed correctly
   */
  it('should parse numeric string amount correctly', () => {
    const result = FormValidator.validateAmount('50.99');
    expect(result.isValid).toBe(true);
    expect(parseFloat(result.message)).isNaN(); // No error message
  });
});

// ============================================================================
// COMPREHENSIVE INTEGRATION SCENARIOS
// ============================================================================

/**
 * Scenario Test 11.3.5: Comprehensive Integration Test
 * Tests complete user flows with multiple components
 */
describe('Scenario 11.3.5: Comprehensive Integration Test', () => {
  let app;
  let dataManager;
  let transactionManager;
  let inputForm;
  let balanceDisplay;
  let monthlySummary;

  beforeEach(() => {
    dataManager = new DataManager();
    transactionManager = new TransactionManager(dataManager);
    
    // Clear any existing data
    transactionManager.transactions = [];
    dataManager.saveTransactions([]);
    
    balanceDisplay = new BalanceDisplay(transactionManager);
    monthlySummary = new MonthlySummary(transactionManager, dataManager);
    
    inputForm = {
      formData: null,
      handleSubmit: (formData) => {
        transactionManager.addTransaction(formData);
        balanceDisplay.update();
        monthlySummary.update();
      }
    };
  });

  /**
   * Test 11.3.5.1: Complete User Flow - Add Transactions
   * Simulates complete user flow: adding multiple transactions
   */
  it('should handle complete user flow of adding transactions', () => {
    // Add first transaction
    inputForm.formData = {
      name: 'Groceries',
      amount: '45.50',
      category: 'Food'
    };
    inputForm.handleSubmit(inputForm.formData);
    
    expect(transactionManager.getAllTransactions().length).toBe(1);
    expect(balanceDisplay.calculateTotal()).toBe(-45.50);
    
    // Add second transaction
    inputForm.formData = {
      name: 'Bus Ticket',
      amount: '2.50',
      category: 'Transport'
    };
    inputForm.handleSubmit(inputForm.formData);
    
    expect(transactionManager.getAllTransactions().length).toBe(2);
    expect(balanceDisplay.calculateTotal()).toBe(-48);
    
    // Add third transaction
    inputForm.formData = {
      name: 'Salary',
      amount: '2000',
      category: 'Income'
    };
    inputForm.handleSubmit(inputForm.formData);
    
    expect(transactionManager.getAllTransactions().length).toBe(3);
    expect(balanceDisplay.calculateTotal()).toBe(1952);
  });

  /**
   * Test 11.3.5.2: Theme + Transaction Integration
   * Validates that theme switching works alongside transactions
   */
  it('should work correctly with theme switching and transactions', () => {
    // Add some transactions
    transactionManager.addTransaction({
      name: 'Groceries',
      amount: -45.50,
      category: 'Food'
    });
    
    transactionManager.addTransaction({
      name: 'Bus Ticket',
      amount: -2.50,
      category: 'Transport'
    });
    
    // Verify transactions are there
    expect(transactionManager.getAllTransactions().length).toBe(2);
    
    // Switch theme
    const themeManager = new ThemeManager(dataManager);
    themeManager.toggleTheme();
    
    // Verify transactions still there after theme switch
    expect(transactionManager.getAllTransactions().length).toBe(2);
    
    // Verify balance is still correct
    expect(balanceDisplay.calculateTotal()).toBe(-48);
  });

  /**
   * Test 11.3.5.3: Month Navigation + Transaction Integration
   * Validates that month navigation works alongside transaction management
   */
  it('should work correctly with month navigation and transactions', () => {
    // Create transactions for different months
    const janTransactions = createMonthlyTransactions(0, 2024, 5); // January 2024
    const febTransactions = createMonthlyTransactions(1, 2024, 3); // February 2024
    
    // Add January transactions
    janTransactions.forEach(t => {
      transactionManager.addTransaction(t);
    });
    
    // Verify January transactions
    monthlySummary.updateMonth(0, 2024);
    monthlySummary.render();
    
    expect(monthlySummary.getSelectedMonth().month).toBe(0); // January
    
    // Navigate to February
    monthlySummary.navigateMonth(1);
    
    expect(monthlySummary.getSelectedMonth().month).toBe(1); // February
    
    // Navigate back to January
    monthlySummary.navigateMonth(-1);
    
    expect(monthlySummary.getSelectedMonth().month).toBe(0); // January
  });
});

// ============================================================================
// PERFORMANCE BENCHMARKS
// ============================================================================

/**
 * Performance Benchmark: Transaction Operations
 * Measures baseline performance for various operations
 */
describe('Performance Benchmarks', () => {
  it('should complete basic operations within acceptable time limits', () => {
    const transactions = createMockTransactions(100, 50);
    
    const benchmarks = {
      // Create TransactionManager
      'Create TransactionManager': () => {
        const tm = new TransactionManager(new DataManager());
        tm.transactions = transactions;
        return tm;
      },
      
      // Calculate balance
      'Calculate balance (100 items)': (tm) => {
        return tm.calculateBalance();
      },
      
      // Get spending by category
      'Get spending by category (100 items)': (tm) => {
        return tm.getSpendingByCategory();
      },
      
      // Sort by date
      'Sort by date (100 items)': (tm) => {
        return tm.getTransactionsByDate();
      },
      
      // Filter monthly
      'Filter monthly transactions': (tm) => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        return tm.transactions.filter(t => {
          const d = new Date(t.date);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });
      }
    };

    const results = {};
    let tm;

    for (const [name, fn] of Object.entries(benchmarks)) {
      const startTime = performance.now();
      const result = fn(tm);
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      results[name] = duration;
      tm = result || tm;
      
      console.log(`${name}: ${duration.toFixed(2)}ms`);
    }

    // Verify performance requirements
    expect(results['Calculate balance (100 items)']).toBeLessThan(50);
    expect(results['Get spending by category (100 items)']).toBeLessThan(100);
    expect(results['Sort by date (100 items)']).toBeLessThan(100);
  });
});

// Run tests if in test environment
if (typeof window !== 'undefined' && window.Mocha) {
  window.addEventListener('DOMContentLoaded', () => {
    const mocha = new Mocha();
    mocha.addFile(module.id);
    mocha.run();
  });
}
/**
 * Unit Tests for BalanceDisplay Component
 * Tests balance calculation including zero, positive, and negative balances
 */

// Mock TransactionManager for testing
class MockTransactionManager {
  constructor(transactions) {
    this.transactions = transactions || [];
  }

  getAllTransactions() {
    return this.transactions;
  }

  calculateBalance() {
    return this.transactions.reduce((total, transaction) => total + transaction.amount, 0);
  }
}

/**
 * Test Suite: Balance Calculation
 * Validates that the BalanceDisplay correctly calculates and displays balance
 */
describe('BalanceDisplay - Balance Calculation', () => {
  let transactionManager;
  let balanceDisplay;

  // Create a mock DOM for testing
  beforeEach(() => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div id="balance-display" class="balance-display" aria-live="polite">
        <div class="balance-label">Current Balance</div>
        <div class="balance-amount-container">
          <span id="balance-amount" class="balance-amount">$0.00</span>
        </div>
      </div>
    `;
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  /**
   * Test 5.3.1: Zero Balance Calculation
   * Validates that balance is correctly calculated as zero when no transactions exist
   */
  it('should calculate zero balance when no transactions exist', () => {
    transactionManager = new MockTransactionManager([]);
    balanceDisplay = new BalanceDisplay(transactionManager);
    
    // Verify balance is zero
    expect(balanceDisplay.calculateTotal()).toBe(0);
    
    // Verify displayed amount shows $0.00
    const amountElement = document.getElementById('balance-amount');
    expect(amountElement.textContent).toBe('$0.00');
  });

  /**
   * Test 5.3.2: Positive Balance Calculation
   * Validates that balance is correctly calculated for positive values
   */
  it('should calculate positive balance correctly', () => {
    transactionManager = new MockTransactionManager([
      { id: 1, name: 'Income', category: 'Income', amount: 1000 },
      { id: 2, name: 'More Income', category: 'Income', amount: 500 }
    ]);
    balanceDisplay = new BalanceDisplay(transactionManager);
    
    // Verify balance is 1500
    expect(balanceDisplay.calculateTotal()).toBe(1500);
    
    // Verify displayed amount
    const amountElement = document.getElementById('balance-amount');
    expect(amountElement.textContent).toBe('$1,500.00');
  });

  /**
   * Test 5.3.3: Negative Balance Calculation
   * Validates that balance is correctly calculated for negative values (expenses)
   */
  it('should calculate negative balance correctly', () => {
    transactionManager = new MockTransactionManager([
      { id: 1, name: 'Groceries', category: 'Food', amount: -45.50 },
      { id: 2, name: 'Bus Ticket', category: 'Transport', amount: -2.50 }
    ]);
    balanceDisplay = new BalanceDisplay(transactionManager);
    
    // Verify balance is -48.00
    expect(balanceDisplay.calculateTotal()).toBe(-48);
    
    // Verify displayed amount
    const amountElement = document.getElementById('balance-amount');
    expect(amountElement.textContent).toBe('($48.00)');
  });

  /**
   * Test 5.3.4: Mixed Positive and Negative Balance
   * Validates that balance is correctly calculated with mixed transactions
   */
  it('should calculate mixed positive and negative balance correctly', () => {
    transactionManager = new MockTransactionManager([
      { id: 1, name: 'Salary', category: 'Income', amount: 2000 },
      { id: 2, name: 'Rent', category: 'Housing', amount: -800 },
      { id: 3, name: 'Groceries', category: 'Food', amount: -150 },
      { id: 4, name: 'Transport', category: 'Transport', amount: -50 }
    ]);
    balanceDisplay = new BalanceDisplay(transactionManager);
    
    // Verify balance is 2000 - 800 - 150 - 50 = 1000
    expect(balanceDisplay.calculateTotal()).toBe(1000);
  });

  /**
   * Test 5.3.5: Balance Update Performance
   * Validates that balance updates complete within 100ms
   */
  it('should update balance within 100ms', (done) => {
    const transactions = [];
    // Create many transactions to test performance
    for (let i = 0; i < 100; i++) {
      transactions.push({
        id: i,
        name: `Transaction ${i}`,
        category: 'Test',
        amount: 10 + i
      });
    }

    transactionManager = new MockTransactionManager(transactions);
    balanceDisplay = new BalanceDisplay(transactionManager);
    
    const startTime = performance.now();
    balanceDisplay.update();
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Log performance for debugging
    console.log(`Balance update took: ${duration.toFixed(2)}ms`);
    
    // Verify update completed within 100ms
    expect(duration).toBeLessThan(100);
    
    done();
  });
});

/**
 * Test Suite: Balance Styling
 * Validates that balance styling is correctly applied based on value
 */
describe('BalanceDisplay - Balance Styling', () => {
  let transactionManager;
  let balanceDisplay;

  beforeEach(() => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div id="balance-display" class="balance-display">
        <div class="balance-label">Current Balance</div>
        <div class="balance-amount-container" id="balance-container">
          <span id="balance-amount" class="balance-amount">$0.00</span>
        </div>
      </div>
    `;
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  /**
   * Test: Set Positive Balance Styling
   * Validates that positive balance applies correct styling
   */
  it('should apply positive balance styling', () => {
    transactionManager = new MockTransactionManager([
      { id: 1, name: 'Income', category: 'Income', amount: 1000 }
    ]);
    balanceDisplay = new BalanceDisplay(transactionManager);
    
    const container = document.getElementById('balance-container');
    expect(container.classList.contains('positive-balance')).toBe(true);
    expect(container.classList.contains('negative-balance')).toBe(false);
    expect(container.classList.contains('neutral-balance')).toBe(false);
  });

  /**
   * Test: Set Negative Balance Styling
   * Validates that negative balance applies correct styling
   */
  it('should apply negative balance styling', () => {
    transactionManager = new MockTransactionManager([
      { id: 1, name: 'Expense', category: 'Food', amount: -100 }
    ]);
    balanceDisplay = new BalanceDisplay(transactionManager);
    
    const container = document.getElementById('balance-container');
    expect(container.classList.contains('negative-balance')).toBe(true);
    expect(container.classList.contains('positive-balance')).toBe(false);
    expect(container.classList.contains('neutral-balance')).toBe(false);
  });

  /**
   * Test: Neutral Balance Styling
   * Validates that zero balance applies neutral styling
   */
  it('should apply neutral balance styling for zero balance', () => {
    transactionManager = new MockTransactionManager([]);
    balanceDisplay = new BalanceDisplay(transactionManager);
    
    const container = document.getElementById('balance-container');
    expect(container.classList.contains('neutral-balance')).toBe(true);
    expect(container.classList.contains('positive-balance')).toBe(false);
    expect(container.classList.contains('negative-balance')).toBe(false);
  });

  /**
   * Test: Toggle Between Positive and Negative
   * Validates that styling updates correctly when balance changes
   */
  it('should toggle styling when balance changes from positive to negative', () => {
    transactionManager = new MockTransactionManager([
      { id: 1, name: 'Income', category: 'Income', amount: 100 }
    ]);
    balanceDisplay = new BalanceDisplay(transactionManager);
    
    let container = document.getElementById('balance-container');
    expect(container.classList.contains('positive-balance')).toBe(true);
    
    // Change to negative balance
    transactionManager.transactions = [{ id: 2, name: 'Expense', category: 'Food', amount: -200 }];
    balanceDisplay.update();
    
    container = document.getElementById('balance-container');
    expect(container.classList.contains('negative-balance')).toBe(true);
    expect(container.classList.contains('positive-balance')).toBe(false);
  });
});

/**
 * Test Suite: Currency Formatting
 * Validates that currency formatting is correctly applied
 */
describe('BalanceDisplay - Currency Formatting', () => {
  let transactionManager;
  let balanceDisplay;

  beforeEach(() => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div id="balance-display" class="balance-display">
        <div class="balance-label">Current Balance</div>
        <div class="balance-amount-container">
          <span id="balance-amount" class="balance-amount">$0.00</span>
        </div>
      </div>
    `;
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  /**
   * Test: Format Currency with Cents
   * Validates that amounts with cents are formatted correctly
   */
  it('should format currency with cents correctly', () => {
    transactionManager = new MockTransactionManager([
      { id: 1, name: 'Item', category: 'Test', amount: 123.45 }
    ]);
    balanceDisplay = new BalanceDisplay(transactionManager);
    
    const amountElement = document.getElementById('balance-amount');
    expect(amountElement.textContent).toBe('$123.45');
  });

  /**
   * Test: Format Large Amounts
   * Validates that large amounts are formatted with commas
   */
  it('should format large amounts with commas', () => {
    transactionManager = new MockTransactionManager([
      { id: 1, name: 'Large', category: 'Test', amount: 1234567.89 }
    ]);
    balanceDisplay = new BalanceDisplay(transactionManager);
    
    const amountElement = document.getElementById('balance-amount');
    expect(amountElement.textContent).toBe('$1,234,567.89');
  });

  /**
   * Test: Format Zero with Cents
   * Validates that zero is formatted as $0.00
   */
  it('should format zero balance as $0.00', () => {
    transactionManager = new MockTransactionManager([]);
    balanceDisplay = new BalanceDisplay(transactionManager);
    
    const amountElement = document.getElementById('balance-amount');
    expect(amountElement.textContent).toBe('$0.00');
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
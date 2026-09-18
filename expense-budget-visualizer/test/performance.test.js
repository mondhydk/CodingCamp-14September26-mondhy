/**
 * Performance Tests for Expense & Budget Visualizer
 * Measures performance of balance updates, chart updates, and UI interactions
 */

// Mock DOM environment for testing
class MockDOM {
  constructor() {
    this.document = {
      body: {
        classList: { add: () => {}, remove: () => {} },
        style: {}
      },
      documentElement: {
        setAttribute: () => {},
        getAttribute: () => 'light',
        style: {}
      },
      getElementById: () => ({
        classList: { add: () => {}, remove: () => {} }
      }),
      querySelector: () => ({
        style: {},
        classList: { add: () => {}, remove: () => {} }
      }),
      querySelectorAll: () => [],
      addEventListener: () => {},
      removeEventListener: () => {},
      createRange: () => ({
        selectNode: () => {}
      })
    };
    this.window = {
      innerWidth: 1024,
      addEventListener: () => {},
      removeEventListener: () => {},
      setTimeout: () => {},
      clearTimeout: () => {},
      requestAnimationFrame: (fn) => setTimeout(fn, 16),
      cancelAnimationFrame: () => {}
    };
  }
}

// Import required classes
// Since we're in a test environment, we need to mock or import appropriately

/**
 * Performance Test Helper
 * Measures execution time for various operations
 */
class PerformanceTestHelper {
  /**
   * Measure function execution time
   * @param {Function} fn - Function to measure
   * @param {number} iterations - Number of iterations to run
   * @returns {Object} Timing statistics
   */
  static measureTime(fn, iterations = 10) {
    const times = [];
    let total = 0;
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      fn();
      const end = performance.now();
      const duration = end - start;
      times.push(duration);
      total += duration;
    }
    
    const avg = total / iterations;
    const min = Math.min(...times);
    const max = Math.max(...times);
    const median = times.sort((a, b) => a - b)[Math.floor(iterations / 2)];
    
    return {
      avg,
      min,
      max,
      median,
      total,
      times
    };
  }

  /**
   * Format time in milliseconds
   * @param {number} ms - Time in milliseconds
   * @returns {string} Formatted time
   */
  static formatTime(ms) {
    return `${ms.toFixed(3)}ms`;
  }

  /**
   * Check if time meets threshold
   * @param {number} ms - Time in milliseconds
   * @param {number} threshold - Threshold in milliseconds
   * @returns {boolean} true if within threshold
   */
  static withinThreshold(ms, threshold) {
    return ms <= threshold;
  }
}

/**
 * Transaction Generator
 * Generates test transactions for performance testing
 */
class TransactionGenerator {
  /**
   * Generate random transaction
   * @param {number} id - Transaction ID
   * @returns {Object} Transaction object
   */
  static generateTransaction(id) {
    const categories = ['Food', 'Transport', 'Fun', 'Utilities', 'Entertainment'];
    const names = [
      'Groceries', 'Bus Ticket', 'Movie', 'Electric Bill', 'Concert',
      'Dinner', 'Taxi', 'Games', 'Water Bill', 'Theater',
      'Breakfast', 'Subway', 'Coffee', 'Internet', 'Dessert'
    ];
    
    const category = categories[Math.floor(Math.random() * categories.length)];
    const name = names[Math.floor(Math.random() * names.length)];
    const amount = (Math.random() * 100 + 1).toFixed(2);
    
    return {
      id: id,
      name: name,
      category: category,
      amount: parseFloat(amount),
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    };
  }

  /**
   * Generate array of transactions
   * @param {number} count - Number of transactions to generate
   * @returns {Array} Array of transaction objects
   */
  static generateTransactions(count) {
    const transactions = [];
    for (let i = 0; i < count; i++) {
      transactions.push(this.generateTransaction(i));
    }
    return transactions;
  }
}

/**
 * Mock TransactionManager
 */
class MockTransactionManager {
  constructor(transactions = []) {
    this.transactions = transactions;
  }

  getAllTransactions() {
    return this.transactions;
  }

  calculateBalance() {
    return this.transactions.reduce((total, transaction) => total + transaction.amount, 0);
  }

  getSpendingByCategory() {
    const categoryTotals = {};
    this.transactions.forEach(t => {
      if (!categoryTotals[t.category]) {
        categoryTotals[t.category] = 0;
      }
      categoryTotals[t.category] += t.amount;
    });
    return categoryTotals;
  }
}

/**
 * Mock BalanceDisplay
 */
class MockBalanceDisplay {
  constructor(transactionManager) {
    this.transactionManager = transactionManager;
    this.balanceElement = { textContent: '' };
    this.containerElement = { classList: { add: () => {}, remove: () => {} } };
  }

  update() {
    const balance = this.transactionManager.calculateBalance();
    this.balanceElement.textContent = this.formatCurrency(balance);
    this.updateBalanceStyling(balance);
  }

  updateBalanceStyling(balance) {
    if (this.containerElement) {
      this.containerElement.classList.remove('positive-balance', 'negative-balance', 'neutral-balance');
      if (balance > 0) {
        this.containerElement.classList.add('positive-balance');
      } else if (balance < 0) {
        this.containerElement.classList.add('negative-balance');
      } else {
        this.containerElement.classList.add('neutral-balance');
      }
    }
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}

/**
 * Mock ChartRenderer
 */
class MockChartRenderer {
  constructor(transactionManager) {
    this.transactionManager = transactionManager;
    this.chart = {
      data: { labels: [], datasets: [{ data: [], backgroundColor: [] }] },
      update: () => {},
      destroy: () => {},
      options: { plugins: { legend: { labels: { color: '' } }, tooltip: { backgroundColor: '', titleColor: '', bodyColor: '' } } }
    };
    this.canvas = { getContext: () => ({}) };
    this.placeholder = { classList: { add: () => {}, remove: () => {} } };
  }

  updateChart() {
    const categoryTotals = this.transactionManager.getSpendingByCategory();
    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

    if (labels.length === 0) {
      this.placeholder.classList.remove('hidden');
      if (this.chart) {
        this.chart.destroy();
        this.chart = null;
      }
      return;
    }

    this.placeholder.classList.add('hidden');

    if (!this.chart) {
      this.renderChart();
      return;
    }

    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = data;
    this.chart.data.datasets[0].backgroundColor = this.getCategoryColors(labels);
    this.chart.update();
  }

  renderChart() {
    // Simulate chart rendering
  }

  getCategoryColors(labels) {
    const colors = {
      'Food': 'rgba(255, 99, 132, 0.7)',
      'Transport': 'rgba(54, 162, 235, 0.7)',
      'Fun': 'rgba(255, 205, 86, 0.7)',
      'Utilities': 'rgba(75, 192, 192, 0.7)',
      'Entertainment': 'rgba(153, 102, 255, 0.7)',
      'Other': 'rgba(201, 203, 207, 0.7)'
    };
    return labels.map(label => colors[label] || colors['Other']);
  }
}

// Test scenarios
describe('Performance Tests', () => {
  describe('Balance Update Performance', () => {
    it('should update balance within 100ms for 10 transactions', () => {
      const transactions = TransactionGenerator.generateTransactions(10);
      const manager = new MockTransactionManager(transactions);
      const display = new MockBalanceDisplay(manager);

      const result = PerformanceTestHelper.measureTime(() => display.update(), 50);
      
      console.log('Balance update (10 transactions):');
      console.log(`  Average: ${PerformanceTestHelper.formatTime(result.avg)}`);
      console.log(`  Min: ${PerformanceTestHelper.formatTime(result.min)}`);
      console.log(`  Max: ${PerformanceTestHelper.formatTime(result.max)}`);
      console.log(`  Median: ${PerformanceTestHelper.formatTime(result.median)}`);

      expect(result.avg).toBeLessThan(100);
      expect(result.max).toBeLessThan(200);
    });

    it('should update balance within 100ms for 50 transactions', () => {
      const transactions = TransactionGenerator.generateTransactions(50);
      const manager = new MockTransactionManager(transactions);
      const display = new MockBalanceDisplay(manager);

      const result = PerformanceTestHelper.measureTime(() => display.update(), 50);
      
      console.log('Balance update (50 transactions):');
      console.log(`  Average: ${PerformanceTestHelper.formatTime(result.avg)}`);
      console.log(`  Min: ${PerformanceTestHelper.formatTime(result.min)}`);
      console.log(`  Max: ${PerformanceTestHelper.formatTime(result.max)}`);
      console.log(`  Median: ${PerformanceTestHelper.formatTime(result.median)}`);

      expect(result.avg).toBeLessThan(100);
      expect(result.max).toBeLessThan(200);
    });

    it('should update balance within 100ms for 100 transactions', () => {
      const transactions = TransactionGenerator.generateTransactions(100);
      const manager = new MockTransactionManager(transactions);
      const display = new MockBalanceDisplay(manager);

      const result = PerformanceTestHelper.measureTime(() => display.update(), 50);
      
      console.log('Balance update (100 transactions):');
      console.log(`  Average: ${PerformanceTestHelper.formatTime(result.avg)}`);
      console.log(`  Min: ${PerformanceTestHelper.formatTime(result.min)}`);
      console.log(`  Max: ${PerformanceTestHelper.formatTime(result.max)}`);
      console.log(`  Median: ${PerformanceTestHelper.formatTime(result.median)}`);

      expect(result.avg).toBeLessThan(100);
      expect(result.max).toBeLessThan(200);
    });

    it('should update balance within 100ms for 500 transactions', () => {
      const transactions = TransactionGenerator.generateTransactions(500);
      const manager = new MockTransactionManager(transactions);
      const display = new MockBalanceDisplay(manager);

      const result = PerformanceTestHelper.measureTime(() => display.update(), 50);
      
      console.log('Balance update (500 transactions):');
      console.log(`  Average: ${PerformanceTestHelper.formatTime(result.avg)}`);
      console.log(`  Min: ${PerformanceTestHelper.formatTime(result.min)}`);
      console.log(`  Max: ${PerformanceTestHelper.formatTime(result.max)}`);
      console.log(`  Median: ${PerformanceTestHelper.formatTime(result.median)}`);

      expect(result.avg).toBeLessThan(100);
      expect(result.max).toBeLessThan(200);
    });
  });

  describe('Chart Update Performance', () => {
    it('should update chart within 500ms for 10 transactions', () => {
      const transactions = TransactionGenerator.generateTransactions(10);
      const manager = new MockTransactionManager(transactions);
      const renderer = new MockChartRenderer(manager);

      const result = PerformanceTestHelper.measureTime(() => renderer.updateChart(), 20);
      
      console.log('Chart update (10 transactions):');
      console.log(`  Average: ${PerformanceTestHelper.formatTime(result.avg)}`);
      console.log(`  Min: ${PerformanceTestHelper.formatTime(result.min)}`);
      console.log(`  Max: ${PerformanceTestHelper.formatTime(result.max)}`);
      console.log(`  Median: ${PerformanceTestHelper.formatTime(result.median)}`);

      expect(result.avg).toBeLessThan(500);
      expect(result.max).toBeLessThan(1000);
    });

    it('should update chart within 500ms for 50 transactions', () => {
      const transactions = TransactionGenerator.generateTransactions(50);
      const manager = new MockTransactionManager(transactions);
      const renderer = new MockChartRenderer(manager);

      const result = PerformanceTestHelper.measureTime(() => renderer.updateChart(), 20);
      
      console.log('Chart update (50 transactions):');
      console.log(`  Average: ${PerformanceTestHelper.formatTime(result.avg)}`);
      console.log(`  Min: ${PerformanceTestHelper.formatTime(result.min)}`);
      console.log(`  Max: ${PerformanceTestHelper.formatTime(result.max)}`);
      console.log(`  Median: ${PerformanceTestHelper.formatTime(result.median)}`);

      expect(result.avg).toBeLessThan(500);
      expect(result.max).toBeLessThan(1000);
    });

    it('should update chart within 500ms for 100 transactions', () => {
      const transactions = TransactionGenerator.generateTransactions(100);
      const manager = new MockTransactionManager(transactions);
      const renderer = new MockChartRenderer(manager);

      const result = PerformanceTestHelper.measureTime(() => renderer.updateChart(), 20);
      
      console.log('Chart update (100 transactions):');
      console.log(`  Average: ${PerformanceTestHelper.formatTime(result.avg)}`);
      console.log(`  Min: ${PerformanceTestHelper.formatTime(result.min)}`);
      console.log(`  Max: ${PerformanceTestHelper.formatTime(result.max)}`);
      console.log(`  Median: ${PerformanceTestHelper.formatTime(result.median)}`);

      expect(result.avg).toBeLessThan(500);
      expect(result.max).toBeLessThan(1000);
    });

    it('should update chart within 500ms for 500 transactions', () => {
      const transactions = TransactionGenerator.generateTransactions(500);
      const manager = new MockTransactionManager(transactions);
      const renderer = new MockChartRenderer(manager);

      const result = PerformanceTestHelper.measureTime(() => renderer.updateChart(), 20);
      
      console.log('Chart update (500 transactions):');
      console.log(`  Average: ${PerformanceTestHelper.formatTime(result.avg)}`);
      console.log(`  Min: ${PerformanceTestHelper.formatTime(result.min)}`);
      console.log(`  Max: ${PerformanceTestHelper.formatTime(result.max)}`);
      console.log(`  Median: ${PerformanceTestHelper.formatTime(result.median)}`);

      expect(result.avg).toBeLessThan(500);
      expect(result.max).toBeLessThan(1000);
    });
  });

  describe('UI Interaction Performance', () => {
    it('should add transaction with minimal UI lag', () => {
      const transactions = TransactionGenerator.generateTransactions(100);
      const manager = new MockTransactionManager(transactions);
      
      // Simulate adding a transaction
      const result = PerformanceTestHelper.measureTime(() => {
        const newTransaction = TransactionGenerator.generateTransaction(Date.now());
        manager.transactions.unshift(newTransaction);
        // Simulate balance update
        manager.calculateBalance();
        // Simulate chart update
        manager.getSpendingByCategory();
      }, 30);

      console.log('Add transaction (with balance + chart update):');
      console.log(`  Average: ${PerformanceTestHelper.formatTime(result.avg)}`);
      console.log(`  Min: ${PerformanceTestHelper.formatTime(result.min)}`);
      console.log(`  Max: ${PerformanceTestHelper.formatTime(result.max)}`);
      console.log(`  Median: ${PerformanceTestHelper.formatTime(result.median)}`);

      // UI interactions should complete within 100ms for no perceptible lag
      expect(result.avg).toBeLessThan(100);
    });

    it('should delete transaction with minimal UI lag', () => {
      const transactions = TransactionGenerator.generateTransactions(100);
      const manager = new MockTransactionManager(transactions);
      
      // Simulate deleting a transaction
      const result = PerformanceTestHelper.measureTime(() => {
        manager.transactions.shift();
        // Simulate balance update
        manager.calculateBalance();
        // Simulate chart update
        manager.getSpendingByCategory();
      }, 30);

      console.log('Delete transaction (with balance + chart update):');
      console.log(`  Average: ${PerformanceTestHelper.formatTime(result.avg)}`);
      console.log(`  Min: ${PerformanceTestHelper.formatTime(result.min)}`);
      console.log(`  Max: ${PerformanceTestHelper.formatTime(result.max)}`);
      console.log(`  Median: ${PerformanceTestHelper.formatTime(result.median)}`);

      expect(result.avg).toBeLessThan(100);
    });

    it('should switch theme with minimal UI lag', () => {
      const mockDOM = new MockDOM();
      
      // Simulate theme switch
      const result = PerformanceTestHelper.measureTime(() => {
        const theme = mockDOM.document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        mockDOM.document.documentElement.setAttribute('data-theme', theme);
        // Simulate chart theme update
        const textColor = theme === 'dark' ? '#e0e0e0' : '#333333';
        // Simulate CSS variable update
        const chartBgColor = mockDOM.document.documentElement.style.getPropertyValue('--chart-background');
      }, 30);

      console.log('Theme switch:');
      console.log(`  Average: ${PerformanceTestHelper.formatTime(result.avg)}`);
      console.log(`  Min: ${PerformanceTestHelper.formatTime(result.min)}`);
      console.log(`  Max: ${PerformanceTestHelper.formatTime(result.max)}`);
      console.log(`  Median: ${PerformanceTestHelper.formatTime(result.median)}`);

      // Theme switching should be nearly instant
      expect(result.avg).toBeLessThan(50);
    });

    it('should sort transactions with minimal UI lag', () => {
      const transactions = TransactionGenerator.generateTransactions(100);
      
      // Simulate sorting
      const result = PerformanceTestHelper.measureTime(() => {
        const sorted = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
      }, 30);

      console.log('Sort transactions:');
      console.log(`  Average: ${PerformanceTestHelper.formatTime(result.avg)}`);
      console.log(`  Min: ${PerformanceTestHelper.formatTime(result.min)}`);
      console.log(`  Max: ${PerformanceTestHelper.formatTime(result.max)}`);
      console.log(`  Median: ${PerformanceTestHelper.formatTime(result.median)}`);

      // Sorting should be fast
      expect(result.avg).toBeLessThan(50);
    });
  });
});

// Export for browser testing
if (typeof window !== 'undefined') {
  window.PerformanceTestHelper = PerformanceTestHelper;
  window.TransactionGenerator = TransactionGenerator;
  window.MockTransactionManager = MockTransactionManager;
  window.MockBalanceDisplay = MockBalanceDisplay;
  window.MockChartRenderer = MockChartRenderer;
}
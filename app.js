/**
 * Expense & Budget Visualizer
 * A frontend-only application for tracking personal expenses and visualizing spending patterns.
 * 
 * Architecture:
 * - InputForm: Handles user input for new transactions with validation
 * - TransactionManager: Manages the transaction list and CRUD operations
 * - BalanceDisplay: Displays the current total balance
 * - ChartRenderer: Renders spending distribution charts using Chart.js
 * - MonthlySummary: Displays monthly expense summaries
 * - ThemeManager: Handles dark/light theme toggle and persistence
 * - StorageManager: Manages data persistence using LocalStorage
 * - LayoutManager: Handles responsive design adjustments for mobile and desktop
 */

'use strict';

// DOM Element References
const DOM = {
  document: document,
  window: window,
};

/**
 * LayoutManager class - Handles responsive design adjustments for mobile and desktop
 * 
 * This class provides methods for:
 * - Detecting current breakpoint (mobile < 600px, desktop Ã¢â€°Â¥ 600px)
 * - Applying mobile-optimized styles when in mobile mode
 * - Applying desktop-optimized styles when in desktop mode
 * - Handling window resize events with debouncing for performance
 * 
 * Features:
 * - Uses CSS classes to apply different layouts for different screen sizes
 * - Debounced resize handler to prevent excessive re-renders during window resizing
 * - Event emissions for responsive mode changes
 * - Methods for programmatic layout control
 */
class LayoutManager {
  /**
   * Initialize LayoutManager
   * @param {Object} options - Configuration options
   * @param {number} options.mobileBreakpoint - Max width for mobile layout (default: 599)
   * @param {number} options.resizeDelay - Debounce delay in ms (default: 250)
   */
  constructor(options = {}) {
    this.mobileBreakpoint = options.mobileBreakpoint || 599;
    this.resizeDelay = options.resizeDelay || 250;
    this.currentMode = 'desktop'; // 'mobile' or 'desktop'
    this.resizeTimeout = null;
    
    this.init();
  }

  /**
   * Initialize event listeners
   */
  init() {
    // Set initial mode based on current window size
    this.checkResponsiveMode();
    
    // Add resize event listener with debouncing
    this.boundResizeHandler = this.handleResize.bind(this);
    DOM.window.addEventListener('resize', this.boundResizeHandler);
  }

  /**
   * Check current responsive mode and apply appropriate layout
   * 
   * Determines if current window width is mobile or desktop based on breakpoint
   * and applies the corresponding layout.
   * 
   * @returns {string} Current mode ('mobile' or 'desktop')
   */
  checkResponsiveMode() {
    const isMobile = DOM.window.innerWidth <= this.mobileBreakpoint;
    const newMode = isMobile ? 'mobile' : 'desktop';
    
    if (this.currentMode !== newMode) {
      this.currentMode = newMode;
      
      if (newMode === 'mobile') {
        this.applyMobileLayout();
      } else {
        this.applyDesktopLayout();
      }
      
      // Emit responsive mode change event
      this.emitResponsiveModeChange(newMode);
    }
    
    return newMode;
  }

  /**
   * Handle window resize events with debouncing
   * 
   * Debounces the resize handler to prevent excessive layout recalculations
   * during rapid window resizing.
   */
  handleResize() {
    if (this.resizeTimeout) {
      DOM.window.clearTimeout(this.resizeTimeout);
    }
    
    this.resizeTimeout = DOM.window.setTimeout(() => {
      this.checkResponsiveMode();
    }, this.resizeDelay);
  }

  /**
   * Apply mobile layout
   * 
   * Applies mobile-optimized styles and classes to the document.
   * This includes:
   * - Adding 'mobile-layout' class to body
   * - Removing 'desktop-layout' class from body
   * - Adjusting UI components for smaller screens
   */
  applyMobileLayout() {
    DOM.document.body.classList.add('mobile-layout');
    DOM.document.body.classList.remove('desktop-layout');
    
    // Apply mobile-specific adjustments
    this.applyMobileAdjustments();
    
    console.log('LayoutManager: Applied mobile layout');
  }

  /**
   * Apply desktop layout
   * 
   * Applies desktop-optimized styles and classes to the document.
   * This includes:
   * - Adding 'desktop-layout' class to body
   * - Removing 'mobile-layout' class from body
   * - Restoring full UI components
   */
  applyDesktopLayout() {
    DOM.document.body.classList.add('desktop-layout');
    DOM.document.body.classList.remove('mobile-layout');
    
    // Restore desktop-specific adjustments
    this.applyDesktopAdjustments();
    
    console.log('LayoutManager: Applied desktop layout');
  }

  /**
   * Apply mobile-specific UI adjustments
   * 
   * Additional mobile-specific adjustments beyond CSS classes.
   * Can be extended for specific component adjustments.
   */
  applyMobileAdjustments() {
    // Adjust chart height for mobile
    const chartContainer = DOM.document.querySelector('.chart-container');
    if (chartContainer) {
      chartContainer.style.height = '250px';
    }
    
    // Adjust spacing for mobile
    const mainContent = DOM.document.querySelector('.main-content');
    if (mainContent) {
      mainContent.style.padding = '1rem';
    }
    
    // Adjust header for mobile
    const mainHeader = DOM.document.querySelector('.main-header');
    if (mainHeader) {
      mainHeader.style.padding = '1rem';
    }
    
    // Adjust theme toggle icon for mobile
    const themeText = DOM.document.querySelector('.theme-toggle .theme-text');
    if (themeText) {
      themeText.style.display = 'none';
    }
  }

  /**
   * Apply desktop-specific UI adjustments
   * 
   * Restores desktop-specific UI components and spacing.
   */
  applyDesktopAdjustments() {
    // Restore chart height for desktop
    const chartContainer = DOM.document.querySelector('.chart-container');
    if (chartContainer) {
      chartContainer.style.height = '300px';
    }
    
    // Restore spacing for desktop
    const mainContent = DOM.document.querySelector('.main-content');
    if (mainContent) {
      mainContent.style.padding = '2rem';
    }
    
    // Restore header for desktop
    const mainHeader = DOM.document.querySelector('.main-header');
    if (mainHeader) {
      mainHeader.style.padding = '1rem 2rem';
    }
    
    // Restore theme toggle text for desktop
    const themeText = DOM.document.querySelector('.theme-toggle .theme-text');
    if (themeText) {
      themeText.style.display = 'inline';
    }
  }

  /**
   * Get current breakpoint
   * @returns {string} Current breakpoint ('mobile' or 'desktop')
   */
  getCurrentBreakpoint() {
    return this.currentMode;
  }

  /**
   * Get mobile breakpoint value
   * @returns {number} Mobile breakpoint in pixels
   */
  getMobileBreakpoint() {
    return this.mobileBreakpoint;
  }

  /**
   * Check if currently in mobile mode
   * @returns {boolean} true if in mobile mode, false otherwise
   */
  isMobile() {
    return this.currentMode === 'mobile';
  }

  /**
   * Check if currently in desktop mode
   * @returns {boolean} true if in desktop mode, false otherwise
   */
  isDesktop() {
    return this.currentMode === 'desktop';
  }

  /**
   * Destroy LayoutManager and remove event listeners
   * 
   * Cleans up event listeners and resources when LayoutManager is no longer needed.
   */
  destroy() {
    DOM.window.removeEventListener('resize', this.boundResizeHandler);
    
    if (this.resizeTimeout) {
      DOM.window.clearTimeout(this.resizeTimeout);
    }
    
    // Remove layout classes
    DOM.document.body.classList.remove('mobile-layout');
    DOM.document.body.classList.remove('desktop-layout');
  }

  /**
   * Emit responsive mode change event
   * @param {string} mode - New mode ('mobile' or 'desktop')
   */
  emitResponsiveModeChange(mode) {
    const event = new CustomEvent('responsiveModeChange', {
      detail: { mode: mode }
    });
    DOM.document.dispatchEvent(event);
  }
}

// DataManager class - Handles all LocalStorage operations for the application
class DataManager {
  /**
   * Initialize DataManager
   * @param {string} storageKey - The key to use for storing data (default: 'expenseBudgetVisualizer')
   */
  constructor(storageKey = 'expenseBudgetVisualizer') {
    this.storageKey = storageKey;
  }

  /**
   * Check if LocalStorage is available and working
   * 
   * This method attempts to write and remove a test item in LocalStorage
   * to verify that it's available and functional.
   * 
   * @returns {boolean} true if LocalStorage is available, false otherwise
   */
  isLocalStorageAvailable() {
    try {
      const testKey = '__localStorage_test__';
      // Try to set an item
      localStorage.setItem(testKey, 'test');
      // Try to remove it
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      console.error('LocalStorage is not available:', error);
      return false;
    }
  }

  /**
   * Load transactions from LocalStorage
   * 
   * Attempts to retrieve and parse the transactions array from LocalStorage.
   * If LocalStorage is unavailable, corrupted, or contains no data,
   * returns an empty array as a safe default.
   * 
   * @returns {Array} Array of transactions (empty if none found or on error)
   */
  loadTransactions() {
    try {
      if (!this.isLocalStorageAvailable()) {
        console.warn('Cannot load transactions: LocalStorage is not available');
        return [];
      }

      const storedData = localStorage.getItem(this.storageKey);
      
      if (!storedData) {
        return [];
      }

      const data = JSON.parse(storedData);
      return Array.isArray(data.transactions) ? data.transactions : [];
    } catch (error) {
      console.error('Error loading transactions:', error);
      return [];
    }
  }

  /**
   * Save transactions to LocalStorage
   * 
   * Persists the transactions array to LocalStorage.
   * If LocalStorage is unavailable, logs an error but continues.
   * 
   * @param {Array} transactions - Array of transactions to save
   * @returns {boolean} true if save was successful, false otherwise
   */
  saveTransactions(transactions) {
    try {
      if (!this.isLocalStorageAvailable()) {
        console.error('Cannot save transactions: LocalStorage is not available');
        return false;
      }

      const data = this.getData();

  localStorage.setItem(
    this.storageKey,
    JSON.stringify({
      ...data,
      transactions: transactions,
      lastUpdated: Date.now()
    })
  );
      return true;
    } catch (error) {
      console.error('Error saving transactions:', error);
      return false;
    }
  }

  /**
   * Load theme preference from LocalStorage
   * 
   * Retrieves the saved theme preference from LocalStorage.
   * If no preference is saved, LocalStorage is unavailable, or the
   * stored value is invalid, returns 'light' as the default theme.
   * 
   * @returns {string} Theme preference ('light' or 'dark')
   */
  loadThemePreference() {
    try {
      if (!this.isLocalStorageAvailable()) {
        console.warn('Cannot load theme preference: LocalStorage is not available');
        return 'light';
      }

      const storedData = localStorage.getItem(this.storageKey);
      
      if (!storedData) {
        return 'light';
      }

      const data = JSON.parse(storedData);
      
      // Validate that theme is a valid value
      if (data.theme === 'dark' || data.theme === 'light') {
        return data.theme;
      }
      
      return 'light';
    } catch (error) {
      console.error('Error loading theme preference:', error);
      return 'light';
    }
  }

  /**
   * Save theme preference to LocalStorage
   * 
   * Persists the theme preference to LocalStorage.
   * 
   * @param {string} theme - Theme to save ('light' or 'dark')
   * @returns {boolean} true if save was successful, false otherwise
   */
  saveThemePreference(theme) {
    try {
      if (!this.isLocalStorageAvailable()) {
        console.error('Cannot save theme preference: LocalStorage is not available');
        return false;
      }

      // Validate theme value
      if (theme !== 'light' && theme !== 'dark') {
        console.warn('Invalid theme value:', theme, 'Defaulting to light');
        theme = 'light';
      }

      const data = this.getData();

  localStorage.setItem(
    this.storageKey,
    JSON.stringify({
      ...data,
      theme: theme,
      lastUpdated: Date.now()
    }));
      return true;
    } catch (error) {
      console.error('Error saving theme preference:', error);
      return false;
    }
  }
}

// Transaction Manager - Handles transaction CRUD operations
class TransactionManager {
  /**
   * Initialize TransactionManager
   * @param {DataManager} dataManager - Data manager instance
   */
  constructor(dataManager) {
    this.dataManager = dataManager;
    this.transactions = this.dataManager.loadTransactions();
  }

  /**
   * Add a new transaction
   * @param {Object} transaction - Transaction object with name, amount, category
   * @returns {Object} The added transaction
   */
  addTransaction(transaction) {
    const newTransaction = {
      id: Date.now(),
      name: transaction.name,
      amount: parseFloat(transaction.amount),
      category: transaction.category,
      date: new Date().toISOString()
    };
    
    this.transactions.unshift(newTransaction);
    this.dataManager.saveTransactions(this.transactions);
    
    return newTransaction;
  }

  /**
   * Delete a transaction by ID
   * @param {number} transactionId - ID of transaction to delete
   */
  deleteTransaction(transactionId) {
    this.transactions = this.transactions.filter(
      transaction => transaction.id !== transactionId
    );
    this.dataManager.saveTransactions(this.transactions);
  }

  /**
   * Get all transactions
   * @returns {Array} Array of all transactions
   */
  getAllTransactions() {
    return this.transactions;
  }

  /**
   * Get transactions sorted by date (newest first)
   * @returns {Array} Sorted array of transactions
   */
  getTransactionsByDate() {
    return [...this.transactions].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  }

  /**
   * Calculate total balance
   * @returns {number} Total balance
   */
  calculateBalance() {
    return this.transactions.reduce((total, transaction) => total + transaction.amount, 0);
  }

  /**
   * Get spending by category
   * @returns {Object} Object with category totals
   */
  getSpendingByCategory() {
    const categoryTotals = {};
    
    this.transactions.forEach(transaction => {
      if (!categoryTotals[transaction.category]) {
        categoryTotals[transaction.category] = 0;
      }
      categoryTotals[transaction.category] += transaction.amount;
    });
    
    return categoryTotals;
  }

  /**
   * Get monthly summary
   * @returns {Object} Monthly summary data
   */
  getMonthlySummary() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTransactions = this.transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.getMonth() === currentMonth &&
             transactionDate.getFullYear() === currentYear;
    });

    const summary = {
      total: monthlyTransactions.reduce((sum, t) => sum + t.amount, 0),
      count: monthlyTransactions.length,
      byCategory: {}
    };

    monthlyTransactions.forEach(transaction => {
      if (!summary.byCategory[transaction.category]) {
        summary.byCategory[transaction.category] = 0;
      }
      summary.byCategory[transaction.category] += transaction.amount;
    });

    return summary;
  }
}

// FormValidator - Validates transaction form data
class FormValidator {
  /**
   * Validate item name
   * @param {string} name - Item name to validate
   * @returns {{isValid: boolean, message: string}} Validation result
   */
  static validateName(name) {
    if (!name || name.trim() === '') {
      return { isValid: false, message: 'Item name is required' };
    }
    
    if (name.trim().length > 100) {
      return { isValid: false, message: 'Item name must be 100 characters or less' };
    }
    
    return { isValid: true, message: '' };
  }

  /**
   * Validate category selection
   * @param {string} category - Category to validate
   * @returns {{isValid: boolean, message: string}} Validation result
   */
  static validateCategory(category) {
    const validCategories = ['Food', 'Transport', 'Fun', 'Utilities', 'Entertainment'];
    
    if (!category || category === '') {
      return { isValid: false, message: 'Please select a category' };
    }
    
    if (!validCategories.includes(category)) {
      return { isValid: false, message: 'Invalid category selected' };
    }
    
    return { isValid: true, message: '' };
  }

  /**
   * Validate amount
   * @param {string|number} amount - Amount to validate
   * @returns {{isValid: boolean, message: string}} Validation result
   */
  static validateAmount(amount) {
    const numAmount = parseFloat(amount);
    
    if (amount === '' || amount === null || amount === undefined) {
      return { isValid: false, message: 'Amount is required' };
    }
    
    if (isNaN(numAmount)) {
      return { isValid: false, message: 'Amount must be a valid number' };
    }
    
    if (numAmount <= 0) {
      return { isValid: false, message: 'Amount must be a positive number' };
    }
    
    if (numAmount > 10000000) {
      return { isValid: false, message: 'Amount is too large' };
    }
    
    return { isValid: true, message: '' };
  }

  /**
   * Validate complete transaction data
   * @param {Object} data - Transaction data to validate
   * @returns {{isValid: boolean, errors: Object}} Validation result
   */
  static validateTransaction(data) {
    const errors = {};
    let isValid = true;

    const nameResult = this.validateName(data.name);
    if (!nameResult.isValid) {
      errors.name = nameResult.message;
      isValid = false;
    }

    const categoryResult = this.validateCategory(data.category);
    if (!categoryResult.isValid) {
      errors.category = categoryResult.message;
      isValid = false;
    }

    const amountResult = this.validateAmount(data.amount);
    if (!amountResult.isValid) {
      errors.amount = amountResult.message;
      isValid = false;
    }

    return { isValid, errors };
  }
}

// Input Form - Handles user input with validation
class InputForm {
  /**
   * Initialize InputForm
   * @param {Function} onSubmit - Callback when form is submitted with valid data
   */
  constructor(onSubmit) {
    this.form = null;
    this.onSubmit = onSubmit;
    this.init();
  }

  /**
   * Initialize event listeners and references
   */
  init() {
    this.form = DOM.document.getElementById('transaction-form');
    
    if (this.form) {
      this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }
  }

  /**
   * Handle form submission
   * @param {Event} event - Submit event
   */
  handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = {
      name: this.form.elements.itemName.value.trim(),
      amount: this.form.elements.amount.value.trim(),
      category: this.form.elements.category.value
    };

    const validation = FormValidator.validateTransaction(formData);

    if (validation.isValid) {
      this.onSubmit(formData);
      this.reset();
    } else {
      this.showError(validation.errors);
    }
  }

  /**
   * Show error messages for fields
   * @param {Object} errors - Object with field names as keys and error messages as values
   */
  showError(errors) {
    for (const [fieldName, message] of Object.entries(errors)) {
      const input = this.form.elements[fieldName];
      const errorSpan = input.parentElement.querySelector('.error-message');
      
      if (input) {
        input.classList.add('error');
      }
      
      if (errorSpan) {
        errorSpan.textContent = message;
        errorSpan.classList.add('visible');
      }
    }
  }

  /**
   * Clear all error messages
   */
  clearErrors() {
    const inputs = this.form.elements;
    for (const input of inputs) {
      input.classList.remove('error');
    }
    
    const errorSpans = this.form.querySelectorAll('.error-message');
    for (const span of errorSpans) {
      span.textContent = '';
      span.classList.remove('visible');
    }
  }

  /**
   * Reset form fields
   */
  reset() {
    this.form.elements.itemName.value = '';
    this.form.elements.amount.value = '';
    this.form.elements.category.value = '';
    this.clearErrors();
  }
}

// Balance Display - Shows total balance
class BalanceDisplay {
  /**
   * Initialize BalanceDisplay
   * @param {TransactionManager} transactionManager - Transaction manager instance
   */
  constructor(transactionManager) {
    this.transactionManager = transactionManager;
    this.element = DOM.document.getElementById('balance-display');
    this.amountElement = null;
    this.balanceLabelElement = null;
    this.balanceContainerElement = null;
    
    if (this.element) {
      this.amountElement = this.element.querySelector('.balance-amount');
      this.balanceLabelElement = this.element.querySelector('.balance-label');
      this.balanceContainerElement = this.element.querySelector('.balance-amount-container');
    }
    
    this.update();
  }

  /**
   * Update the displayed balance
   * Performance: Updates within 100ms of changes
   */
  update() {
    const startTime = performance.now();
    const balance = this.transactionManager.calculateBalance();
    const endTime = performance.now();
    
    // Log performance if it exceeds 100ms
    if (endTime - startTime > 100) {
      console.warn(`Balance update took ${endTime - startTime.toFixed(2)}ms`);
    }
    
    this.amountElement.textContent = this.formatCurrency(balance);
    this.updateBalanceStyling(balance);
  }

  /**
   * Update balance styling based on positive/negative value
   * @param {number} balance - Current balance value
   */
  updateBalanceStyling(balance) {
    // Remove existing styling classes
    if (this.balanceContainerElement) {
      this.balanceContainerElement.classList.remove('positive-balance', 'negative-balance');
    }
    
    // Apply appropriate styling based on balance value
    if (balance > 0) {
      this.setPositiveBalance();
    } else if (balance < 0) {
      this.setNegativeBalance();
    } else {
      // Zero balance - neutral styling
      if (this.balanceContainerElement) {
        this.balanceContainerElement.classList.add('neutral-balance');
      }
    }
  }

  /**
   * Set styling for positive balance
   */
  setPositiveBalance() {
    if (this.balanceContainerElement) {
      this.balanceContainerElement.classList.add('positive-balance');
      this.balanceContainerElement.classList.remove('negative-balance', 'neutral-balance');
    }
  }

  /**
   * Set styling for negative balance
   */
  setNegativeBalance() {
    if (this.balanceContainerElement) {
      this.balanceContainerElement.classList.add('negative-balance');
      this.balanceContainerElement.classList.remove('positive-balance', 'neutral-balance');
    }
  }

  /**
   * Calculate total from transactions
   * @returns {number} Total balance calculated from all transactions
   */
  calculateTotal() {
    return this.transactionManager.calculateBalance();
  }

  /**
   * Format currency
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency string
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}

// Chart Renderer - Renders expense charts using Chart.js
class ChartRenderer {
  /**
   * Initialize ChartRenderer
   * @param {TransactionManager} transactionManager - Transaction manager instance
   */
  constructor(transactionManager) {
    this.transactionManager = transactionManager;
    this.canvas = DOM.document.getElementById('expense-chart');
    this.placeholder = DOM.document.getElementById('chart-placeholder');
    this.chart = null;
    this.updateTimeout = null;
    
    if (this.canvas) {
      this.renderChart();
    } else {
      console.error('Chart canvas element not found');
    }
  }

  /**
   * Create initial chart
   * Renders the chart with current data or shows placeholder if no data
   */
  renderChart() {
    const chartData = this.transformTransactionsToChartData();
    
    if (chartData.labels.length === 0) {
      this.showPlaceholder();
      return;
    }
    
    this.hidePlaceholder();
    
    const ctx = this.canvas.getContext('2d');
    
    this.chart = new Chart(ctx, {
      type: 'pie',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: 1.5,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: this.getTextColor(),
              usePointStyle: true,
              boxWidth: 10,
              padding: 15
            }
          },
          tooltip: {
            enabled: true,
            backgroundColor: this.getThemeColor('--card-bg'),
            titleColor: this.getTextColor(),
            bodyColor: this.getTextColor(),
            borderColor: this.getThemeColor('--border-color'),
            borderWidth: 1,
            callbacks: {
              label: (context) => {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const value = context.raw;
                const percentage = ((value / total) * 100).toFixed(1);
                return `${context.label}: ${this.formatCurrency(value)} (${percentage}%)`;
              },
              title: (context) => {
                const item = context[0];
                return item.label;
              }
            }
          }
        },
        animation: {
          animateScale: true,
          animateRotate: true,
          duration: 300
        }
      }
    });
  }

  /**
   * Update chart data without recreating the chart instance
   * @param {Array} transactions - New transaction data
   */
  updateChart(transactions) {
    // Update transactions if provided
    if (transactions !== undefined) {
      this.transactionManager.transactions = transactions;
    }
    
    const categoryTotals = this.transactionManager.getSpendingByCategory();
    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

    if (labels.length === 0) {
      this.showPlaceholder();
      if (this.chart) {
        this.chart.destroy();
        this.chart = null;
      }
      return;
    }

    this.hidePlaceholder();

    if (!this.chart) {
      this.renderChart();
      return;
    }

    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = data;
    this.chart.data.datasets[0].backgroundColor = this.getCategoryColors(labels);
    this.chart.update();
  }

  /**
   * Show placeholder message when no data is available
   */
  showPlaceholder() {
    if (this.placeholder) {
      this.placeholder.classList.remove('hidden');
    }
  }

  /**
   * Hide placeholder message when data is available
   */
  hidePlaceholder() {
    if (this.placeholder) {
      this.placeholder.classList.add('hidden');
    }
  }

  /**
   * Transform transactions to chart data format
   * @returns {Object} Chart data object with labels and data arrays
   */
  transformTransactionsToChartData() {
    const categoryTotals = this.transactionManager.getSpendingByCategory();
    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

    return {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: this.getCategoryColors(labels),
        borderWidth: 1,
        borderColor: this.getBorderColor()
      }]
    };
  }

  /**
   * Get colors for categories
   * @param {Array} labels - Category labels
   * @returns {Array} Array of colors
   */
  getCategoryColors(labels) {
    const colors = {
      'Food': ['rgba(255, 99, 132, 0.7)', 'rgba(255, 99, 132, 1)'],
      'Transport': ['rgba(54, 162, 235, 0.7)', 'rgba(54, 162, 235, 1)'],
      'Fun': ['rgba(255, 205, 86, 0.7)', 'rgba(255, 205, 86, 1)'],
      'Utilities': ['rgba(75, 192, 192, 0.7)', 'rgba(75, 192, 192, 1)'],
      'Entertainment': ['rgba(153, 102, 255, 0.7)', 'rgba(153, 102, 255, 1)'],
      'Other': ['rgba(201, 203, 207, 0.7)', 'rgba(201, 203, 207, 1)']
    };

    return labels.map(label => {
      const baseColor = colors[label] || colors['Other'];
      return baseColor[0];
    });
  }

  /**
   * Get border color for chart elements
   * @returns {string} Border color
   */
  getBorderColor() {
    const theme = DOM.document.documentElement.getAttribute('data-theme');
    return theme === 'dark' ? '#1a1a2e' : '#ffffff';
  }

  /**
   * Get text color based on theme
   * @returns {string} Text color
   */
  getTextColor() {
    const theme = DOM.document.documentElement.getAttribute('data-theme');
    return theme === 'dark' ? '#e0e0e0' : '#333333';
  }

  /**
   * Get CSS custom property value for theme
   * @param {string} variable - CSS variable name (e.g., '--card-bg')
   * @returns {string} CSS variable value
   */
  getThemeColor(variable) {
    const root = DOM.document.documentElement;
    return getComputedStyle(root).getPropertyValue(variable).trim();
  }

  /**
   * Update chart colors based on theme
   * @param {string} theme - Current theme ('light' or 'dark')
   */
  updateTheme(theme) {
    const root = DOM.document.documentElement;
    
    // Update chart text color
    const textColor = theme === 'dark' ? '#e0e0e0' : '#333333';
    this.chart.options.plugins.legend.labels.color = textColor;
    this.chart.options.plugins.tooltip.bodyColor = textColor;
    this.chart.options.plugins.tooltip.titleColor = textColor;
    
    // Update chart background colors using CSS variables
    const chartBgColor = getComputedStyle(root).getPropertyValue('--chart-background').trim();
    this.chart.options.plugins.tooltip.backgroundColor = chartBgColor;
    
    this.chart.update('none');
  }

  /**
   * Format currency
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency string
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}

// Monthly Summary - Displays monthly expense summaries
class MonthlySummary {
  /**
   * Initialize MonthlySummary
   * @param {TransactionManager} transactionManager - Transaction manager instance
   * @param {DataManager} dataManager - Data manager instance for persistence
   */
  constructor(transactionManager, dataManager) {
    this.transactionManager = transactionManager;
    this.dataManager = dataManager;
    this.container = DOM.document.querySelector('.monthly-summary-section');
    this.categoryBreakdown = DOM.document.querySelector('.category-breakdown');
    this.summaryEmpty = DOM.document.querySelector('.summary-empty');
    this.currentMonthElement = DOM.document.querySelector('.current-month');
    this.prevMonthBtn = DOM.document.querySelector('#prev-month');
    this.nextMonthBtn = DOM.document.querySelector('#next-month');
    
    // Current month/year state (defaults to current month)
    this.selectedMonth = new Date().getMonth();
    this.selectedYear = new Date().getFullYear();
    
    this.loadMonthPreference();
    this.init();
    this.render();
  }

  /**
   * Initialize event listeners
   */
  init() {
    if (this.prevMonthBtn) {
      this.prevMonthBtn.addEventListener('click', () => this.navigateMonth(-1));
    }
    if (this.nextMonthBtn) {
      this.nextMonthBtn.addEventListener('click', () => this.navigateMonth(1));
    }
  }

  /**
   * Load saved month preference from LocalStorage
   */
  loadMonthPreference() {
    try {
      if (!this.dataManager.isLocalStorageAvailable()) {
        return;
      }

      const storedData = localStorage.getItem(this.dataManager.storageKey);
      
      if (!storedData) {
        return;
      }

      const data = JSON.parse(storedData);
      
      if (data && data.selectedMonth !== undefined && data.selectedYear !== undefined) {
        this.selectedMonth = data.selectedMonth;
        this.selectedYear = data.selectedYear;
      }
    } catch (error) {
      console.error('Error loading month preference:', error);
    }
  }

  /**
   * Save month preference to LocalStorage
   * @returns {boolean} true if save was successful, false otherwise
   */
  saveMonthPreference() {
    try {
      if (!this.dataManager.isLocalStorageAvailable()) {
        return false;
      }

      const storedData = localStorage.getItem(this.dataManager.storageKey);
      let data = {};
      
      if (storedData) {
        data = JSON.parse(storedData);
      }
      
      data.selectedMonth = this.selectedMonth;
      data.selectedYear = this.selectedYear;
      
      localStorage.setItem(this.dataManager.storageKey, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving month preference:', error);
      return false;
    }
  }

  /**
   * Navigate to previous or next month
   * @param {number} direction - -1 for previous, 1 for next
   */
  navigateMonth(direction) {
    this.selectedMonth += direction;
    
    // Handle year rollover
    if (this.selectedMonth < 0) {
      this.selectedMonth = 11;
      this.selectedYear--;
    } else if (this.selectedMonth > 11) {
      this.selectedMonth = 0;
      this.selectedYear++;
    }
    
    this.saveMonthPreference();
    this.updateMonthDisplay();
    this.render();
  }

  /**
   * Update the month display text
   */
  updateMonthDisplay() {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    if (this.currentMonthElement) {
      this.currentMonthElement.textContent = `${monthNames[this.selectedMonth]} ${this.selectedYear}`;
    }
  }

  /**
   * Update the displayed month and year
   * @param {number} month - Month (0-11)
   * @param {number} year - Full year
   */
  updateMonth(month, year) {
    this.selectedMonth = month;
    this.selectedYear = year;
    this.saveMonthPreference();
    this.updateMonthDisplay();
    this.render();
  }

  /**
   * Get the currently selected month and year
   * @returns {{month: number, year: number}} Selected month and year
   */
  getSelectedMonth() {
    return {
      month: this.selectedMonth,
      year: this.selectedYear
    };
  }

  /**
   * Render the monthly summary
   * @param {Array} transactions - Transactions to summarize (optional, uses manager transactions if not provided)
   */
  renderSummary(transactions) {
    const effectiveTransactions = transactions !== undefined ? transactions : this.transactionManager.getAllTransactions();
    
    // Filter transactions for selected month
    const monthlyTransactions = this.getMonthlyTransactions(effectiveTransactions);
    
    if (monthlyTransactions.length === 0) {
      this.renderEmptyState();
      return;
    }

    // Calculate category totals
    const categoryTotals = this.aggregateCategoryTotals(monthlyTransactions);
    const total = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0);

    let html = '<div class="summary-total">';
    html += `<span class="summary-category-label">Total Spent</span>`;
    html += `<span class="summary-category-value">${this.formatCurrency(total)}</span>`;
    html += '</div>';

    for (const [category, amount] of Object.entries(categoryTotals)) {
      html += '<div class="summary-category">';
      html += `<span class="summary-category-label">${category}</span>`;
      html += `<span class="summary-category-value">${this.formatCurrency(amount)}</span>`;
      html += '</div>';
    }

    if (this.categoryBreakdown) {
      this.categoryBreakdown.innerHTML = html;
    }

    this.hideEmptyState();
  }

  /**
   * Render empty state for months with no transactions
   */
  renderEmptyState() {
    if (this.categoryBreakdown) {
      this.categoryBreakdown.innerHTML = '';
    }
    this.showEmptyState();
  }

  /**
   * Get transactions for the currently selected month
   * @param {Array} transactions - All transactions
   * @returns {Array} Transactions for the selected month
   */
  getMonthlyTransactions(transactions) {
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.getMonth() === this.selectedMonth &&
             transactionDate.getFullYear() === this.selectedYear;
    });
  }

  /**
   * Aggregate transactions by category
   * @param {Array} transactions - Transactions to aggregate
   * @returns {Object} Object with category totals
   */
  aggregateCategoryTotals(transactions) {
    const categoryTotals = {};
    
    transactions.forEach(transaction => {
      if (!categoryTotals[transaction.category]) {
        categoryTotals[transaction.category] = 0;
      }
      categoryTotals[transaction.category] += transaction.amount;
    });
    
    return categoryTotals;
  }

  /**
   * Show the empty state message
   */
  showEmptyState() {
    if (this.summaryEmpty) {
      this.summaryEmpty.classList.remove('hidden');
    }
  }

  /**
   * Hide the empty state message
   */
  hideEmptyState() {
    if (this.summaryEmpty) {
      this.summaryEmpty.classList.add('hidden');
    }
  }

  /**
   * Update the monthly summary display (alias for renderSummary)
   */
  update() {
    this.renderSummary();
  }

  /**
   * Render method (alias for renderSummary)
   */
  render() {
    this.renderSummary();
  }

  /**
   * Format currency
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency string
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}

// Theme Manager - Handles dark/light theme toggle
class ThemeManager {
  /**
   * Initialize ThemeManager
   * @param {DataManager} dataManager - Data manager instance
   */
  constructor(dataManager) {
    this.dataManager = dataManager;
    this.theme = this.dataManager.loadThemePreference();
    this.toggleButton = DOM.document.getElementById('theme-toggle');
    this.themeIcon = this.toggleButton ? this.toggleButton.querySelector('.theme-icon') : null;
    this.themeText = this.toggleButton ? this.toggleButton.querySelector('.theme-text') : null;
    
    this.init();
  }

  /**
   * Initialize event listeners and apply theme
   */
  init() {
    this.applyTheme(this.theme);
    if (this.toggleButton) {
      this.toggleButton.addEventListener('click', () => this.toggleTheme());
    }
  }

  /**
   * Toggle between dark and light themes
   */
  toggleTheme() {
    const newTheme = this.theme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * Set theme
   * @param {string} theme - Theme to set ('light' or 'dark')
   */
  setTheme(theme) {
    this.theme = theme;
    this.saveThemePreference(theme);
    this.applyTheme(theme);
    this.updateThemeText();
  }

  /**
   * Load theme preference from LocalStorage
   * @returns {string} Theme preference ('light' or 'dark')
   */
  loadThemePreference() {
    return this.dataManager.loadThemePreference();
  }

  /**
   * Save theme preference to LocalStorage
   * @param {string} theme - Theme to save
   * @returns {boolean} true if save was successful, false otherwise
   */
  saveThemePreference(theme) {
    return this.dataManager.saveThemePreference(theme);
  }

  /**
   * Apply theme to document
   * @param {string} theme - Theme to apply
   */
  applyTheme(theme) {
    DOM.document.documentElement.setAttribute('data-theme', theme);
    
    if (this.themeIcon) {
      this.themeIcon.textContent = theme === 'light' ? '☀️' : '🌙';
    }
  }

  /**
   * Update theme text and icon in the toggle button
   */
  updateThemeText() {
    if (this.themeText) {
      const isDark = this.theme === 'dark';
      this.themeText.textContent = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    }
  }

  /**
   * Get current theme
   * @returns {string} Current theme
   */
  getTheme() {
    return this.theme;
  }

  /**
   * Notify chart renderer of theme change
   * @param {Object} chartRenderer - ChartRenderer instance
   */
  notifyChartThemeChange(chartRenderer) {
    if (chartRenderer && chartRenderer.updateTheme) {
      chartRenderer.updateTheme(this.theme);
    }
  }
}

// Sorter - Handles transaction sorting
class Sorter {
  /**
   * Initialize Sorter
   */
  constructor() {
    this.sortPreference = this.loadSortPreference();
  }

  /**
   * Sort transactions by date (newest first)
   * @param {Array} transactions - Array of transactions to sort
   * @returns {Array} Sorted array of transactions
   */
  sortByDateDesc(transactions) {
    return [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  /**
   * Sort transactions by amount (highest first)
   * @param {Array} transactions - Array of transactions to sort
   * @returns {Array} Sorted array of transactions
   */
  sortByAmountDesc(transactions) {
    return [...transactions].sort((a, b) => b.amount - a.amount);
  }

  /**
   * Sort transactions by category (alphabetical)
   * @param {Array} transactions - Array of transactions to sort
   * @returns {Array} Sorted array of transactions
   */
  sortByCategoryAsc(transactions) {
    return [...transactions].sort((a, b) => 
      a.category.localeCompare(b.category)
    );
  }

  /**
   * Apply current sort preference to transactions
   * @param {Array} transactions - Array of transactions to sort
   * @returns {Array} Sorted array of transactions
   */
  applySort(transactions) {
    switch (this.sortPreference) {
      case 'amount-desc':
        return this.sortByAmountDesc(transactions);
      case 'category-asc':
        return this.sortByCategoryAsc(transactions);
      case 'date-desc':
      default:
        return this.sortByDateDesc(transactions);
    }
  }

  /**
   * Load sort preference from LocalStorage
   * @returns {string} Sort preference key
   */
  loadSortPreference() {
    try {
      if (!localStorage.getItem('expenseBudgetVisualizer')) {
        return 'date-desc';
      }

      const data = JSON.parse(localStorage.getItem('expenseBudgetVisualizer'));
      
      if (data && data.sortPreference) {
        const validPreferences = ['date-desc', 'amount-desc', 'category-asc'];
        if (validPreferences.includes(data.sortPreference)) {
          return data.sortPreference;
        }
      }
      
      return 'date-desc';
    } catch (error) {
      console.error('Error loading sort preference:', error);
      return 'date-desc';
    }
  }

  /**
   * Save sort preference to LocalStorage
   * @param {string} preference - Sort preference to save
   * @returns {boolean} true if save was successful, false otherwise
   */
  saveSortPreference(preference) {
    try {
      if (!localStorage.getItem('expenseBudgetVisualizer')) {
        localStorage.setItem('expenseBudgetVisualizer', JSON.stringify({
          sortPreference: preference
        }));
        return true;
      }

      const data = JSON.parse(localStorage.getItem('expenseBudgetVisualizer'));
      data.sortPreference = preference;
      localStorage.setItem('expenseBudgetVisualizer', JSON.stringify(data));
      
      return true;
    } catch (error) {
      console.error('Error saving sort preference:', error);
      return false;
    }
  }

  /**
   * Set sort preference
   * @param {string} preference - Sort preference to set
   */
  setSortPreference(preference) {
    this.sortPreference = preference;
    this.saveSortPreference(preference);
  }

  /**
   * Get current sort preference
   * @returns {string} Current sort preference
   */
  getSortPreference() {
    return this.sortPreference;
  }
}

// Transaction List - Displays list of transactions
class TransactionList {
  /**
   * Initialize TransactionList
   * @param {TransactionManager} transactionManager - Transaction manager instance
   * @param {Function} onDelete - Callback when a transaction is deleted
   */
  constructor(transactionManager, onDelete) {
    this.transactionManager = transactionManager;
    this.onDelete = onDelete;
    this.sorter = new Sorter();
    this.listElement = DOM.document.getElementById('transaction-list');
    this.emptyStateElement = DOM.document.getElementById('empty-state');
    this.sortSelectElement = DOM.document.getElementById('sort-select');
    
    this.init();
    this.render();
  }

  /**
   * Initialize event listeners
   */
  init() {
    if (this.sortSelectElement) {
      this.sortSelectElement.addEventListener('change', (e) => {
        this.sorter.setSortPreference(e.target.value);
        this.render();
        
        // Emit sort change event
        this.emitSortChange(e.target.value);
      });
    }
  }

  /**
   * Emit sort change event
   * @param {string} preference - New sort preference
   */
  emitSortChange(preference) {
    const event = new CustomEvent('sortChange', {
      detail: { preference: preference }
    });
    this.listElement.dispatchEvent(event);
  }

  /**
   * Render transaction list
   */
  render() {
    const transactions = this.transactionManager.getAllTransactions();
    const sortedTransactions = this.sorter.applySort(transactions);
    
    if (sortedTransactions.length === 0) {
      this.listElement.innerHTML = '';
      if (this.emptyStateElement) {
        this.emptyStateElement.classList.remove('hidden');
      }
      return;
    }

    if (this.emptyStateElement) {
      this.emptyStateElement.classList.add('hidden');
    }

    this.listElement.innerHTML = sortedTransactions.map(transaction => 
      this.createTransactionItem(transaction)
    ).join('');

    // Add delete event listeners
    const deleteButtons = this.listElement.querySelectorAll('.btn-delete');
    deleteButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const transactionId = parseInt(e.target.dataset.id);
        this.onDelete(transactionId);
      });
    });
  }

  /**
   * Create HTML for a transaction item
   * @param {Object} transaction - Transaction object
   * @returns {string} HTML string
   */
  createTransactionItem(transaction) {
    const isNegative = transaction.amount < 0;
    const formattedAmount = this.formatCurrency(transaction.amount);
    const formattedDate = this.formatDate(transaction.date);

    return `
      <li class="transaction-item">
        <div class="transaction-details">
          <div class="transaction-name">${this.escapeHtml(transaction.name)}</div>
          <div class="transaction-meta">
            <span>${this.escapeHtml(transaction.category)}</span> Ã¢â‚¬Â¢ <span>${formattedDate}</span>
          </div>
        </div>
        <div class="transaction-amount ${isNegative ? 'negative' : ''}">
          ${formattedAmount}
        </div>
        <div class="transaction-actions">
          <button class="btn btn-delete" data-id="${transaction.id}">
            Delete
          </button>
        </div>
      </li>
    `;
  }

  /**
   * Format currency
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency string
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  /**
   * Format date
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date string
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const div = DOM.document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Main Application - Initializes and coordinates all components
class App {
  /**
   * Initialize the application
   */
  constructor() {
    this.dataManager = new DataManager();
    this.transactionManager = new TransactionManager(this.dataManager);
    
    this.inputForm = null;
    this.balanceDisplay = null;
    this.chartRenderer = null;
    this.monthlySummary = null;
    this.transactionList = null;
    this.themeManager = null;
    this.layoutManager = null;
  }

  /**
   * Initialize all components including responsive layout manager
   */
  init() {
    // Initialize layout manager for responsive design
    this.layoutManager = new LayoutManager({
      mobileBreakpoint: 599,
      resizeDelay: 250
    });

    this.transactionList = new TransactionList(
      this.transactionManager,
      (transactionId) => this.handleDeleteTransaction(transactionId)
    );

    this.balanceDisplay = new BalanceDisplay(this.transactionManager);
    this.chartRenderer = new ChartRenderer(this.transactionManager);
    this.monthlySummary = new MonthlySummary(this.transactionManager, this.dataManager);
    this.themeManager = new ThemeManager(this.dataManager);
    
    this.inputForm = new InputForm((formData) => 
      this.handleAddTransaction(formData)
    );

    // Store theme manager reference for later use
    this.themeManager = this.themeManager;
  }

  /**
   * Handle adding a new transaction
   * @param {Object} formData - Form data
   */
  handleAddTransaction(formData) {
    this.transactionManager.addTransaction(formData);
    this.updateAll();
  }

  /**
   * Handle deleting a transaction
   * @param {number} transactionId - ID of transaction to delete
   */
  handleDeleteTransaction(transactionId) {
    this.transactionManager.deleteTransaction(transactionId);
    this.updateAll();
  }

  /**
   * Update all components
   */
  updateAll() {
    this.transactionList.render();
    this.balanceDisplay.update();
    this.chartRenderer.updateChart();
    this.monthlySummary.update();
  }
}

// Initialize application when DOM is loaded
DOM.document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});

# Design Document: Expense & Budget Visualizer

## Overview

The Expense & Budget Visualizer is a frontend-only web application that enables users to track personal expenses and visualize spending patterns. The application runs entirely in the browser with all data persisted locally using the Local Storage API.

Key features include:
- Add and delete expense transactions
- Real-time balance display
- Spending distribution charts by category
- Dark/light theme toggle with persistent preferences
- Monthly expense summaries
- Transaction sorting by date, amount, or category
- Form validation with user-friendly error messages
- Responsive design for mobile and desktop devices

The application follows a component-based architecture with clear separation of concerns between data management, UI rendering, and business logic. All state is managed client-side, and the application uses Chart.js for data visualization.

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser Environment                        │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │                    User Interface Layer                    │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │   │
│  │ │ InputForm│ │Balance   │ │Chart     │ │MonthlySummary│  │   │
│  │ │          │ │Display   │ │Renderer  │ │View          │  │   │
│  │ └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │   │
│  └───────────────────────────────────────────────────────────┘   │
│                            │                                      │
│                            ▼                                      │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │                 Business Logic Layer                       │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │   │
│  │ │Sorter    │ │DataManager│ │Validator │ │LayoutManager │  │   │
│  │ │          │ │          │ │          │ │            │  │   │
│  │ │ThemeMngr │ │          │ │          │ │            │  │   │
│  │ └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │   │
│  └───────────────────────────────────────────────────────────┘   │
│                            │                                      │
│                            ▼                                      │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │                   Data Layer                               │   │
│  │  ┌────────────────────────────────────────────────────┐   │   │
│  │ │                    Local Storage                     │   │   │
│  │ └────────────────────────────────────────────────────┘   │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### File Structure

```
expense-budget-visualizer/
├── index.html              # Main HTML file with structure
├── styles.css              # Single CSS file for all styles
└── app.js                  # Single JavaScript file for all logic
```

### Data Flow

```
User Action → Event Handler → Business Logic → State Update → UI Re-render → Local Storage
     │                                                           │
     └───────────────────────────────────────────────────────────┘
```

### Component Dependencies

```
InputForm ───────────────┐
                         ├──► DataManager ───► LocalStorage
TransactionList ─────────┤
                         │
BalanceDisplay ──────────┼──► Data Aggregation
                         │
ChartRenderer ───────────┤
                         │
MonthlySummaryView ──────┘
```

## Components and Interfaces

### 1. Input Form Component

**Responsibility:** Handle user input for new transactions with validation

**HTML Structure:**
```html
<form id="transaction-form" class="input-form">
  <div class="form-group">
    <label for="item-name">Item Name</label>
    <input type="text" id="item-name" name="itemName" placeholder="Enter item name">
    <span class="error-message"></span>
  </div>
  
  <div class="form-group">
    <label for="category">Category</label>
    <select id="category" name="category">
      <option value="">Select category</option>
      <option value="Food">Food</option>
      <option value="Transport">Transport</option>
      <option value="Fun">Fun</option>
      <option value="Utilities">Utilities</option>
      <option value="Entertainment">Entertainment</option>
    </select>
    <span class="error-message"></span>
  </div>
  
  <div class="form-group">
    <label for="amount">Amount ($)</label>
    <input type="number" id="amount" name="amount" placeholder="Enter amount" min="0" step="0.01">
    <span class="error-message"></span>
  </div>
  
  <button type="submit" class="btn-primary">Add Transaction</button>
</form>
```

**Interface:**
- `validateForm()`: Returns `{ isValid: boolean, errors: object }`
- `clearForm()`: Resets all form fields
- `showError(field, message)`: Displays validation error for a field
- `hideError(field)`: Hides validation error for a field
- `getFormData()`: Returns `{ name, category, amount }` or null if invalid

**Events Emitted:**
- `formSubmit(formData)`: Triggered when form is successfully validated
- `formError(field, message)`: Triggered when validation fails

### 2. Transaction List Component

**Responsibility:** Display and manage the list of transactions

**HTML Structure:**
```html
<div class="transaction-list-container">
  <div class="sort-controls">
    <label for="sort-select">Sort by:</label>
    <select id="sort-select">
      <option value="date-desc">Date (Newest First)</option>
      <option value="amount-desc">Amount (Highest First)</option>
      <option value="category-asc">Category (A-Z)</option>
    </select>
  </div>
  
  <div class="transaction-list" id="transaction-list">
    <!-- Transactions rendered here -->
  </div>
  
  <div class="empty-state" id="empty-state">
    <p>No transactions yet. Add your first expense!</p>
  </div>
</div>
```

**Interface:**
- `render(transactions)`: Renders the list of transactions
- `renderEmptyState()`: Shows empty state message
- `renderTransaction(transaction)`: Renders a single transaction
- `updateSortPreference(preference)`: Updates current sort preference
- `getSortPreference()`: Returns current sort preference

**Events Emitted:**
- `transactionDelete(id)`: Triggered when delete button is clicked
- `sortChange(preference)`: Triggered when sort option changes

### 3. Balance Display Component

**Responsibility:** Show current total balance

**HTML Structure:**
```html
<div class="balance-display" id="balance-display">
  <div class="balance-label">Total Balance</div>
  <div class="balance-amount" id="balance-amount">$0.00</div>
</div>
```

**Interface:**
- `render(balance)`: Updates the displayed balance
- `setPositiveBalance()`: Styles for positive balance
- `setNegativeBalance()`: Styles for negative balance

**Events Emitted:**
- None (read-only component)

### 4. Chart Renderer Component

**Responsibility:** Display spending distribution using Chart.js

**HTML Structure:**
```html
<div class="chart-container">
  <h3>Spending by Category</h3>
  <canvas id="expense-chart"></canvas>
  <div class="chart-placeholder" id="chart-placeholder">
    <p>Add transactions to see spending breakdown</p>
  </div>
</div>
```

**Interface:**
- `renderChart(transactions)`: Renders the pie chart with category breakdown
- `updateChart(transactions)`: Updates existing chart with new data
- `showPlaceholder()`: Shows placeholder when no data
- `hidePlaceholder()`: Hides placeholder when data exists
- `updateThemeColors()`: Updates chart colors based on current theme

**Events Emitted:**
- None (read-only component)

### 5. Theme Manager Component

**Responsibility:** Handle dark/light mode toggle and persistence

**HTML Structure:**
```html
<button class="theme-toggle" id="theme-toggle" aria-label="Toggle theme">
  <span class="theme-icon" id="theme-icon">☀</span>
  <span class="theme-text" id="theme-text">Switch to Dark Mode</span>
</button>
```

**Interface:**
- `toggleTheme()`: Switches between dark and light modes
- `applyTheme(theme)`: Applies specified theme
- `getCurrentTheme()`: Returns current theme ('dark' or 'light')
- `saveThemePreference(theme)`: Saves preference to LocalStorage
- `loadThemePreference()`: Loads saved theme preference

**Events Emitted:**
- `themeChange(newTheme)`: Triggered when theme changes

### 6. Monthly Summary Component

**Responsibility:** Display monthly expense breakdown

**HTML Structure:**
```html
<div class="monthly-summary">
  <div class="summary-header">
    <h3>Monthly Summary</h3>
    <div class="month-selector">
      <button class="nav-btn" id="prev-month">◀</button>
      <span id="current-month">September 2026</span>
      <button class="nav-btn" id="next-month">▶</button>
    </div>
  </div>
  
  <div class="category-breakdown" id="category-breakdown">
    <!-- Category totals rendered here -->
  </div>
  
  <div class="summary-empty" id="summary-empty">
    <p>No transactions for this month</p>
  </div>
</div>
```

**Interface:**
- `renderSummary(transactions)`: Renders monthly expense breakdown
- `updateMonth(month, year)`: Updates displayed month
- `getSelectedMonth()`: Returns current month/year
- `renderEmptyState()`: Shows empty state for month with no transactions

**Events Emitted:**
- `monthChange(month, year)`: Triggered when month changes

### 7. Sorter Component

**Responsibility:** Sort transactions based on user preference

**Interface:**
- `sortByDateDesc(transactions)`: Sort by date, newest first
- `sortByAmountDesc(transactions)`: Sort by amount, highest first
- `sortByCategoryAsc(transactions)`: Sort by category, alphabetical
- `applySort(transactions, preference)`: Applies specified sort preference
- `getDefaultSort()`: Returns default sort preference

### 8. Data Manager Component

**Responsibility:** Manage data persistence and retrieval

**Interface:**
- `loadTransactions()`: Loads transactions from LocalStorage
- `saveTransactions(transactions)`: Saves transactions to LocalStorage
- `loadThemePreference()`: Loads theme preference from LocalStorage
- `saveThemePreference(theme)`: Saves theme preference to LocalStorage
- `clearAllData()`: Clears all stored data
- `isLocalStorageAvailable()`: Checks LocalStorage availability

**Events Emitted:**
- `dataLoadSuccess(transactions)`: Triggered on successful load
- `dataLoadError(error)`: Triggered on load failure
- `dataSaveSuccess()`: Triggered on successful save
- `dataSaveError(error)`: Triggered on save failure

### 9. Validator Component

**Responsibility:** Validate user input

**Interface:**
- `validateName(name)`: Validates item name (non-empty)
- `validateCategory(category)`: Validates category selection
- `validateAmount(amount)`: Validates amount (positive, non-zero)
- `validateTransaction(transaction)`: Validates complete transaction
- `getValidationRules()`: Returns validation rules configuration

### 10. Layout Manager Component

**Responsibility:** Handle responsive design adjustments

**Interface:**
- `checkResponsiveMode()`: Determines mobile/desktop layout
- `applyMobileLayout()`: Applies mobile-optimized styles
- `applyDesktopLayout()`: Applies desktop-optimized styles
- `onResize(handler)`: Registers resize event handler
- `getCurrentBreakpoint()`: Returns current breakpoint ('mobile' or 'desktop')

**Events Emitted:**
- `responsiveModeChange(mode)`: Triggered when breakpoint changes

## Data Models

### Transaction Model

```javascript
{
  id: "unique-id-123",           // UUID string
  name: "Grocery Shopping",      // String, non-empty
  category: "Food",              // String, from predefined categories
  amount: 45.50,                 // Number, positive, non-zero
  date: "2026-09-15T14:30:00",  // ISO 8601 date string
  timestamp: 1694783400000       // Unix timestamp
}
```

### Monthly Summary Model

```javascript
{
  month: 8,                      // 0-11 (JavaScript month index)
  year: 2026,                    // Full year
  categories: {
    "Food": 150.00,
    "Transport": 75.50,
    "Fun": 45.00
  },
  total: 270.50
}
```

### Local Storage Schema

```javascript
// Transactions array
localStorage.setItem('transactions', JSON.stringify(transactions));

// Theme preference
localStorage.setItem('themePreference', JSON.stringify({
  theme: 'dark',
  lastUpdated: timestamp
}));
```

## State Management

### State Structure

```javascript
const appState = {
  transactions: [],              // Array of Transaction objects
  theme: 'light',                // 'light' or 'dark'
  sortPreference: 'date-desc',   // 'date-desc', 'amount-desc', 'category-asc'
  currentMonth: {                // Current month for summary view
    month: 8,                    // 0-11
    year: 2026
  },
  validationErrors: {}           // Field-specific validation errors
};
```

### State Update Flow

```
1. User Action (click, submit, input)
         │
         ▼
2. Event Handler
         │
         ▼
3. Business Logic (validate, transform, filter, sort)
         │
         ▼
4. State Update
         │
         ▼
5. Render Functions (UI components)
         │
         ▼
6. Local Storage Persistence
```

### State Management Patterns

- **Immutable Updates**: State is updated immutably; new objects created for changes
- **Central State**: Single state object managed by Data Manager
- **Event-Driven Updates**: Components listen for state change events
- **Batch Updates**: UI updates are batched to prevent excessive re-renders

## Chart Integration Approach

### Library Choice: Chart.js

Chart.js is selected for the following reasons:
- Well-maintained library with excellent documentation
- Lightweight and performant
- Supports responsive charts
- Good theme customization capabilities
- Wide community adoption

### Chart Configuration

```javascript
const chartConfig = {
  type: 'pie',
  data: {
    labels: categories,
    datasets: [{
      data: amounts,
      backgroundColor: themeColors.background,
      borderColor: themeColors.border,
      borderWidth: 1
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: themeColors.text
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const value = context.parsed;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: $${value.toFixed(2)} (${percentage}%)`;
          }
        }
      }
    }
  }
};
```

### Chart Rendering Strategy

1. **Initialization**: Create chart instance on first render
2. **Updates**: Use Chart.js `update()` method for data changes
3. **Theme Changes**: Destroy and recreate chart with new colors
4. **Responsive**: Enable responsive option for automatic sizing
5. **Performance**: Debounce updates during rapid data changes

### Chart Data Transformation

```javascript
function transformTransactionsToChartData(transactions) {
  const categoryTotals = {};
  
  transactions.forEach(transaction => {
    if (!categoryTotals[transaction.category]) {
      categoryTotals[transaction.category] = 0;
    }
    categoryTotals[transaction.category] += transaction.amount;
  });
  
  return {
    labels: Object.keys(categoryTotals),
    data: Object.values(categoryTotals),
    colors: Object.keys(categoryTotals).map(cat => getCategoryColor(cat))
  };
}
```

## Dark/Light Mode Implementation Strategy

### Theme System

```css
/* CSS Custom Properties for Theming */
:root {
  --bg-color: #ffffff;
  --text-color: #333333;
  --card-bg: #f5f5f5;
  --accent-color: #3498db;
  --border-color: #e0e0e0;
  --error-color: #e74c3c;
  --success-color: #27ae60;
}

[data-theme="dark"] {
  --bg-color: #1a1a2e;
  --text-color: #eaeaea;
  --card-bg: #16213e;
  --accent-color: #4da6ff;
  --border-color: #2d384d;
  --error-color: #e74c3c;
  --success-color: #27ae60;
}
```

### Theme Toggle Implementation

```javascript
class ThemeManager {
  constructor() {
    this.theme = 'light';
    this.elements = {
      root: document.documentElement,
      toggleBtn: document.getElementById('theme-toggle'),
      icon: document.getElementById('theme-icon'),
      text: document.getElementById('theme-text')
    };
    this.init();
  }
  
  init() {
    this.loadThemePreference();
    this.bindEvents();
  }
  
  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    this.applyTheme(this.theme);
    this.saveThemePreference();
    this.updateThemeText();
    this.updateChartColors();
  }
  
  applyTheme(theme) {
    this.elements.root.setAttribute('data-theme', theme);
    this.updateChartColors();
  }
  
  updateThemeText() {
    const isDark = this.theme === 'dark';
    this.elements.icon.textContent = isDark ? '☀' : '☾';
    this.elements.text.textContent = isDark 
      ? 'Switch to Light Mode' 
      : 'Switch to Dark Mode';
  }
  
  updateChartColors() {
    chartManager.updateThemeColors(this.theme);
  }
}
```

### CSS Variable Usage

All components use CSS custom properties for theme-aware styling:

```css
.balance-display {
  background-color: var(--card-bg);
  color: var(--text-color);
  border: 1px solid var(--border-color);
}

.input-form {
  background-color: var(--card-bg);
  color: var(--text-color);
}

.btn-primary {
  background-color: var(--accent-color);
  color: white;
}
```

## Responsive Design Considerations

### Breakpoints

```css
/* Mobile-first approach */
:root {
  --breakpoint-mobile: 599px;
  --breakpoint-desktop: 600px;
}

/* Mobile Layout (< 600px) */
@media (max-width: 599px) {
  .container {
    padding: 1rem;
  }
  
  .transaction-list {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .input-form {
    display: flex;
    flex-direction: column;
  }
  
  .input-form .form-group {
    width: 100%;
  }
  
  .form-row {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .form-row .form-group {
    width: 100%;
  }
  
  .chart-container {
    height: 200px;
  }
}

/* Desktop Layout (≥ 600px) */
@media (min-width: 600px) {
  .container {
    padding: 2rem;
    max-width: 1200px;
  }
  
  .transaction-list {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  .balance-grid {
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  
  .chart-container {
    height: 300px;
  }
}
```

### Mobile Optimization

- Single column layout for transaction list
- Larger touch targets (min 44px)
- Reduced spacing for mobile screens
- Collapsible sections where appropriate

### Performance Considerations

- Debounced resize handlers
- Virtual scrolling for large transaction lists (future enhancement)
- Efficient DOM updates using document fragments
- CSS transforms for animations

## Testing Strategy

### Test Types and Approach

Since this is a frontend UI feature, property-based testing (PBT) is not the primary testing strategy. The majority of the feature involves UI rendering, state management, and integration with external libraries. We'll use:

1. **Unit Tests**: For specific behaviors and edge cases
2. **Integration Tests**: For component interactions
3. **Snapshot Tests**: For UI rendering consistency

### Unit Testing Strategy

**Components to Test:**

1. **Validator Component**
   - Empty name validation
   - Empty category validation  
   - Negative/zero amount validation
   - Valid transaction validation

2. **Sorter Component**
   - Sort by date (descending)
   - Sort by amount (descending)
   - Sort by category (ascending)

3. **Data Aggregation Functions**
   - Balance calculation
   - Category totals calculation
   - Monthly filtering

**Example Unit Tests:**

```javascript
describe('Validator', () => {
  describe('validateName', () => {
    it('should return false for empty string', () => {
      expect(validator.validateName('')).toBe(false);
    });
    
    it('should return false for whitespace-only string', () => {
      expect(validator.validateName('   ')).toBe(false);
    });
    
    it('should return true for valid name', () => {
      expect(validator.validateName('Groceries')).toBe(true);
    });
  });
  
  describe('validateAmount', () => {
    it('should return false for negative amount', () => {
      expect(validator.validateAmount(-10)).toBe(false);
    });
    
    it('should return false for zero amount', () => {
      expect(validator.validateAmount(0)).toBe(false);
    });
    
    it('should return true for positive amount', () => {
      expect(validator.validateAmount(45.50)).toBe(true);
    });
  });
});

describe('Sorter', () => {
  describe('sortByDateDesc', () => {
    it('should sort transactions by date (newest first)', () => {
      const transactions = [
        { id: '1', date: '2026-09-10' },
        { id: '2', date: '2026-09-15' },
        { id: '3', date: '2026-09-12' }
      ];
      
      const sorted = sorter.sortByDateDesc(transactions);
      expect(sorted[0].id).toBe('2');
      expect(sorted[1].id).toBe('3');
      expect(sorted[2].id).toBe('1');
    });
  });
});
```

### Integration Testing Strategy

**Component Interactions to Test:**

1. **Transaction Creation Flow**
   - Form validation
   - Data persistence
   - Balance update
   - Chart update

2. **Transaction Deletion Flow**
   - Data removal
   - List update
   - Balance recalculation
   - Chart refresh

3. **Theme Toggle Flow**
   - Theme state update
   - CSS class application
   - LocalStorage persistence
   - Chart color update

4. **Sort Flow**
   - Sort preference update
   - List reordering
   - State persistence

**Example Integration Tests:**

```javascript
describe('Transaction Management', () => {
  it('should add transaction and update all relevant components', () => {
    const initialBalance = 0;
    const newTransaction = {
      name: 'Groceries',
      category: 'Food',
      amount: 45.50
    };
    
    // Mock components
    const balanceDisplay = createMockBalanceDisplay();
    const transactionList = createMockTransactionList();
    const chartRenderer = createMockChartRenderer();
    const dataManager = createMockDataManager();
    
    // Add transaction
    dataManager.addTransaction(newTransaction);
    
    // Verify all components updated
    expect(balanceDisplay.render).toHaveBeenCalledWith(-45.50);
    expect(transactionList.render).toHaveBeenCalledWith([newTransaction]);
    expect(chartRenderer.updateChart).toHaveBeenCalled();
    expect(dataManager.save).toHaveBeenCalled();
  });
});
```

### Snapshot Testing Strategy

**UI Renderings to Snapshot:**

1. **Input Form States**
   - Initial state
   - With validation errors
   - After successful submission

2. **Transaction List States**
   - Empty state
   - With transactions (mobile view)
   - With transactions (desktop view)

3. **Balance Display States**
   - Zero balance
   - Positive balance
   - Negative balance

4. **Chart States**
   - With data
   - Empty state placeholder

**Example Snapshot Tests:**

```javascript
describe('Snapshot Tests', () => {
  it('should match input form snapshot', () => {
    render(<InputForm />);
    expect(container).toMatchSnapshot();
  });
  
  it('should match transaction list snapshot', () => {
    const transactions = [
      { id: '1', name: 'Groceries', category: 'Food', amount: 45.50 },
      { id: '2', name: 'Bus Ticket', category: 'Transport', amount: 2.50 }
    ];
    
    render(<TransactionList transactions={transactions} />);
    expect(container).toMatchSnapshot();
  });
  
  it('should match theme toggle button snapshot', () => {
    render(<ThemeToggle theme="dark" />);
    expect(container).toMatchSnapshot();
  });
});
```

### Test Coverage Targets

| Component | Unit Tests | Integration Tests | Snapshot Tests |
|-----------|------------|-------------------|----------------|
| Validator | 100% | - | - |
| Sorter | 100% | - | - |
| Input Form | 80% | - | 100% |
| Transaction List | 80% | 100% | 100% |
| Balance Display | 80% | - | 100% |
| Chart Renderer | 70% | - | 100% |
| Theme Manager | 90% | 100% | - |
| Monthly Summary | 80% | 100% | 100% |
| Data Manager | 90% | 100% | - |

### Testing Tools

- **Unit Testing**: Jest or Vitest
- **Integration Testing**: React Testing Library (if using React) or vanilla DOM testing
- **Snapshot Testing**: Jest Snapshots or Testing Library's toMatchSnapshots
- **E2E Testing**: Cypress or Playwright (for critical user flows)

### Test File Structure

```
__tests__/
├── unit/
│   ├── validator.test.js
│   ├── sorter.test.js
│   ├── data-aggregation.test.js
│   └── theme-manager.test.js
├── integration/
│   ├── transaction-management.test.js
│   ├── theme-toggle.test.js
│   └── sort-flow.test.js
└── snapshots/
    ├── input-form.js.snap
    ├── transaction-list.js.snap
    └── theme-toggle.js.snap
```

### Mock Data

```javascript
// test/mocks/transactions.js
export const mockTransactions = [
  {
    id: '1',
    name: 'Grocery Shopping',
    category: 'Food',
    amount: 45.50,
    date: '2026-09-15T14:30:00',
    timestamp: 1694783400000
  },
  {
    id: '2',
    name: 'Bus Ticket',
    category: 'Transport',
    amount: 2.50,
    date: '2026-09-14T08:00:00',
    timestamp: 1694697600000
  },
  {
    id: '3',
    name: 'Movie Night',
    category: 'Fun',
    amount: 25.00,
    date: '2026-09-13T19:00:00',
    timestamp: 1694624400000
  }
];

export const mockEmptyState = [];

export const mockSingleTransaction = [mockTransactions[0]];
```

### Performance Testing

- **Balance Update**: Should complete within 100ms
- **Chart Update**: Should complete within 500ms
- **UI Interactions**: Should have no noticeable lag
- **Page Load**: Should be usable within 1 second

### Accessibility Testing

- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Screen Reader**: ARIA labels on all interactive elements
- **Color Contrast**: Sufficient contrast in both light and dark modes
- **Focus Indicators**: Visible focus states on all interactive elements
## Error Handling

### Local Storage Errors

**Error Condition**: LocalStorage is unavailable or full

**Handling Strategy**:
```javascript
class DataManager {
  async loadTransactions() {
    try {
      if (!this.isLocalStorageAvailable()) {
        throw new Error('LocalStorage not available');
      }
      
      const data = localStorage.getItem('transactions');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      this.handleStorageError(error);
      return []; // Return empty array on error
    }
  }
  
  async saveTransactions(transactions) {
    try {
      if (!this.isLocalStorageAvailable()) {
        throw new Error('LocalStorage not available');
      }
      
      localStorage.setItem('transactions', JSON.stringify(transactions));
    } catch (error) {
      this.handleStorageError(error);
      // Store in memory as fallback
      this.memoryBackup = transactions;
    }
  }
  
  isLocalStorageAvailable() {
    try {
      const testKey = '__localstorage_test__';
      window.localStorage.setItem(testKey, 'value');
      window.localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }
  
  handleStorageError(error) {
    console.error('LocalStorage error:', error);
    this.emit('dataSaveError', error);
    alert('Could not save data. Some data may be lost on page refresh.');
  }
}
```

### Form Validation Errors

**Error Condition**: Invalid user input in the transaction form

**Handling Strategy**:
```javascript
class Validator {
  validateTransaction(transaction) {
    const errors = {};
    
    if (!this.validateName(transaction.name)) {
      errors.name = 'Please enter a valid item name';
    }
    
    if (!this.validateCategory(transaction.category)) {
      errors.category = 'Please select a category';
    }
    
    if (!this.validateAmount(transaction.amount)) {
      errors.amount = 'Please enter a valid positive amount';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
  
  validateName(name) {
    return typeof name === 'string' && name.trim().length > 0;
  }
  
  validateCategory(category) {
    const validCategories = ['Food', 'Transport', 'Fun', 'Utilities', 'Entertainment'];
    return validCategories.includes(category);
  }
  
  validateAmount(amount) {
    return typeof amount === 'number' && amount > 0;
  }
}

class InputForm {
  async handleSubmit(e) {
    e.preventDefault();
    
    const formData = this.getFormData();
    const validation = validator.validateTransaction(formData);
    
    if (!validation.isValid) {
      this.showValidationErrors(validation.errors);
      this.emit('formError', validation.errors);
      return;
    }
    
    this.emit('formSubmit', formData);
    this.clearForm();
  }
  
  showValidationErrors(errors) {
    Object.entries(errors).forEach(([field, message]) => {
      this.showError(field, message);
    });
  }
  
  showError(field, message) {
    const errorElement = this.querySelector(`[name="${field}"] + .error-message`);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }
}
```

### Chart Rendering Errors

**Error Condition**: Chart.js fails to render or update

**Handling Strategy**:
```javascript
class ChartRenderer {
  constructor() {
    this.chart = null;
  }
  
  async renderChart(transactions) {
    try {
      if (transactions.length === 0) {
        this.showPlaceholder();
        return;
      }
      
      if (!this.canRenderChart()) {
        this.showPlaceholder();
        return;
      }
      
      const chartData = this.transformTransactionsToChartData(transactions);
      
      if (this.chart) {
        this.chart.destroy();
      }
      
      this.chart = new Chart(this.canvas, {
        type: 'pie',
        data: chartData,
        options: this.getChartOptions()
      });
      
      this.hidePlaceholder();
    } catch (error) {
      console.error('Chart rendering error:', error);
      this.showPlaceholder();
      this.emit('chartError', error);
    }
  }
  
  updateChart(transactions) {
    try {
      if (!this.chart || transactions.length === 0) {
        this.renderChart(transactions);
        return;
      }
      
      const chartData = this.transformTransactionsToChartData(transactions);
      this.chart.data = chartData;
      this.chart.update();
      
      this.hidePlaceholder();
    } catch (error) {
      console.error('Chart update error:', error);
      this.renderChart(transactions); // Re-render from scratch
    }
  }
  
  canRenderChart() {
    return typeof Chart !== 'undefined' && this.canvas !== null;
  }
}
```

### Data Load Errors

**Error Condition**: Transactions fail to load on page initialization

**Handling Strategy**:
```javascript
class App {
  async initialize() {
    try {
      await this.loadAllData();
      this.render();
    } catch (error) {
      console.error('Initialization error:', error);
      this.showInitializationError(error);
    }
  }
  
  async loadAllData() {
    try {
      this.transactions = await dataManager.loadTransactions();
      this.theme = await dataManager.loadThemePreference();
    } catch (error) {
      // Log error but continue with empty state
      console.error('Failed to load data:', error);
      throw error;
    }
  }
  
  showInitializationError(error) {
    const errorContainer = document.createElement('div');
    errorContainer.className = 'initialization-error';
    errorContainer.innerHTML = `
      <h2>Initialization Error</h2>
      <p>Could not load your data. Please refresh the page.</p>
      <p class="error-details">${error.message}</p>
      <button onclick="location.reload()">Reload</button>
    `;
    document.body.appendChild(errorContainer);
  }
}
```

### Responsive Layout Errors

**Error Condition**: Layout manager fails to detect or apply responsive mode

**Handling Strategy**:
```javascript
class LayoutManager {
  constructor() {
    this.currentBreakpoint = 'desktop';
    this.resizeHandler = this.checkResponsiveMode.bind(this);
  }
  
  init() {
    this.bindResizeHandler();
    this.checkResponsiveMode();
  }
  
  checkResponsiveMode() {
    try {
      const breakpoint = window.innerWidth < 600 ? 'mobile' : 'desktop';
      
      if (this.currentBreakpoint !== breakpoint) {
        this.applyResponsiveLayout(breakpoint);
      }
    } catch (error) {
      console.error('Responsive layout error:', error);
      this.applyResponsiveLayout('desktop'); // Fallback to desktop
    }
  }
  
  applyResponsiveLayout(breakpoint) {
    this.currentBreakpoint = breakpoint;
    
    if (breakpoint === 'mobile') {
      this.applyMobileLayout();
      this.emit('responsiveModeChange', 'mobile');
    } else {
      this.applyDesktopLayout();
      this.emit('responsiveModeChange', 'desktop');
    }
  }
  
  bindResizeHandler() {
    window.addEventListener('resize', this.debounce(this.resizeHandler, 250));
  }
  
  debounce(func, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
}
```

### Theme Toggle Errors

**Error Condition**: Theme preference fails to save or apply

**Handling Strategy**:
```javascript
class ThemeManager {
  toggleTheme() {
    try {
      const newTheme = this.theme === 'light' ? 'dark' : 'light';
      
      // Try to apply theme first
      this.applyTheme(newTheme);
      
      // Then save preference
      this.saveThemePreference(newTheme);
      
      this.theme = newTheme;
      this.updateThemeText();
      this.updateChartColors();
      
      this.emit('themeChange', newTheme);
    } catch (error) {
      console.error('Theme toggle error:', error);
      // Revert to previous theme on error
      this.applyTheme(this.theme);
    }
  }
  
  saveThemePreference(theme) {
    try {
      if (localStorageAvailable()) {
        localStorage.setItem('themePreference', JSON.stringify({
          theme,
          lastUpdated: Date.now()
        }));
      }
    } catch (error) {
      console.warn('Could not save theme preference:', error);
      // Theme still applies even if not saved
    }
  }
}
```

### Error Recovery Summary

| Error Type | Recovery Strategy | User Notification |
|------------|------------------|-------------------|
| LocalStorage Full | Memory fallback, alert user | Alert dialog |
| Form Validation | Show inline errors, prevent submission | Error messages in form |
| Chart Rendering | Fallback to placeholder, log error | Console warning |
| Data Load | Empty state, reload option | Error modal |
| Responsive Layout | Fallback to desktop | Console warning |
| Theme Toggle | Revert to previous theme | Console warning |

## Testing Strategy

### Test Types and Approach

Since this is a frontend UI feature, property-based testing (PBT) is not the primary testing strategy. The majority of the feature involves UI rendering, state management, and integration with external libraries. We'll use:

1. **Unit Tests**: For specific behaviors and edge cases
2. **Integration Tests**: For component interactions
3. **Snapshot Tests**: For UI rendering consistency
4. **Error Handling Tests**: For error recovery scenarios

### Unit Testing Strategy

**Components to Test:**

1. **Validator Component**
   - Empty name validation
   - Empty category validation  
   - Negative/zero amount validation
   - Valid transaction validation

2. **Sorter Component**
   - Sort by date (descending)
   - Sort by amount (descending)
   - Sort by category (ascending)

3. **Data Aggregation Functions**
   - Balance calculation
   - Category totals calculation
   - Monthly filtering

4. **Error Handling Functions**
   - LocalStorage error detection
   - Form validation error display
   - Chart error fallback

**Example Unit Tests:**

```javascript
describe('Validator', () => {
  describe('validateName', () => {
    it('should return false for empty string', () => {
      expect(validator.validateName('')).toBe(false);
    });
    
    it('should return false for whitespace-only string', () => {
      expect(validator.validateName('   ')).toBe(false);
    });
    
    it('should return true for valid name', () => {
      expect(validator.validateName('Groceries')).toBe(true);
    });
  });
  
  describe('validateAmount', () => {
    it('should return false for negative amount', () => {
      expect(validator.validateAmount(-10)).toBe(false);
    });
    
    it('should return false for zero amount', () => {
      expect(validator.validateAmount(0)).toBe(false);
    });
    
    it('should return true for positive amount', () => {
      expect(validator.validateAmount(45.50)).toBe(true);
    });
  });
});

describe('Sorter', () => {
  describe('sortByDateDesc', () => {
    it('should sort transactions by date (newest first)', () => {
      const transactions = [
        { id: '1', date: '2026-09-10' },
        { id: '2', date: '2026-09-15' },
        { id: '3', date: '2026-09-12' }
      ];
      
      const sorted = sorter.sortByDateDesc(transactions);
      expect(sorted[0].id).toBe('2');
      expect(sorted[1].id).toBe('3');
      expect(sorted[2].id).toBe('1');
    });
  });
});

describe('Error Handling', () => {
  describe('localStorageErrorDetection', () => {
    it('should detect when localStorage is unavailable', () => {
      const dataManager = new DataManager();
      // Mock localStorage as unavailable
      window.localStorage = undefined;
      expect(dataManager.isLocalStorageAvailable()).toBe(false);
    });
  });
});
```

### Integration Testing Strategy

**Component Interactions to Test:**

1. **Transaction Creation Flow**
   - Form validation
   - Data persistence
   - Balance update
   - Chart update

2. **Transaction Deletion Flow**
   - Data removal
   - List update
   - Balance recalculation
   - Chart refresh

3. **Theme Toggle Flow**
   - Theme state update
   - CSS class application
   - LocalStorage persistence
   - Chart color update

4. **Sort Flow**
   - Sort preference update
   - List reordering
   - State persistence

5. **Error Recovery Flows**
   - LocalStorage error handling
   - Chart rendering fallback
   - Form validation recovery

**Example Integration Tests:**

```javascript
describe('Transaction Management', () => {
  it('should add transaction and update all relevant components', () => {
    const initialBalance = 0;
    const newTransaction = {
      name: 'Groceries',
      category: 'Food',
      amount: 45.50
    };
    
    // Mock components
    const balanceDisplay = createMockBalanceDisplay();
    const transactionList = createMockTransactionList();
    const chartRenderer = createMockChartRenderer();
    const dataManager = createMockDataManager();
    
    // Add transaction
    dataManager.addTransaction(newTransaction);
    
    // Verify all components updated
    expect(balanceDisplay.render).toHaveBeenCalledWith(-45.50);
    expect(transactionList.render).toHaveBeenCalledWith([newTransaction]);
    expect(chartRenderer.updateChart).toHaveBeenCalled();
    expect(dataManager.save).toHaveBeenCalled();
  });
});

describe('Error Recovery', () => {
  it('should handle localStorage error gracefully', async () => {
    const dataManager = new DataManager();
    
    // Mock localStorage as unavailable
    const originalLocalStorage = window.localStorage;
    window.localStorage = undefined;
    
    // Should handle error without crashing
    await expect(dataManager.loadTransactions()).resolves.toEqual([]);
    
    // Restore localStorage
    window.localStorage = originalLocalStorage;
  });
});
```

### Snapshot Testing Strategy

**UI Renderings to Snapshot:**

1. **Input Form States**
   - Initial state
   - With validation errors
   - After successful submission

2. **Transaction List States**
   - Empty state
   - With transactions (mobile view)
   - With transactions (desktop view)

3. **Balance Display States**
   - Zero balance
   - Positive balance
   - Negative balance

4. **Chart States**
   - With data
   - Empty state placeholder

5. **Error States**
   - LocalStorage error message
   - Form validation errors
   - Initialization error modal

**Example Snapshot Tests:**

```javascript
describe('Snapshot Tests', () => {
  it('should match input form snapshot', () => {
    render(<InputForm />);
    expect(container).toMatchSnapshot();
  });
  
  it('should match transaction list snapshot', () => {
    const transactions = [
      { id: '1', name: 'Groceries', category: 'Food', amount: 45.50 },
      { id: '2', name: 'Bus Ticket', category: 'Transport', amount: 2.50 }
    ];
    
    render(<TransactionList transactions={transactions} />);
    expect(container).toMatchSnapshot();
  });
  
  it('should match theme toggle button snapshot', () => {
    render(<ThemeToggle theme="dark" />);
    expect(container).toMatchSnapshot();
  });
});
```

### Test Coverage Targets

| Component | Unit Tests | Integration Tests | Snapshot Tests | Error Tests |
|-----------|------------|-------------------|----------------|-------------|
| Validator | 100% | - | - | 100% |
| Sorter | 100% | - | - | - |
| Input Form | 80% | - | 100% | 100% |
| Transaction List | 80% | 100% | 100% | - |
| Balance Display | 80% | - | 100% | - |
| Chart Renderer | 70% | - | 100% | 100% |
| Theme Manager | 90% | 100% | - | 100% |
| Monthly Summary | 80% | 100% | 100% | - |
| Data Manager | 90% | 100% | - | 100% |
| Layout Manager | 80% | - | - | 100% |

### Testing Tools

- **Unit Testing**: Jest or Vitest
- **Integration Testing**: React Testing Library (if using React) or vanilla DOM testing
- **Snapshot Testing**: Jest Snapshots or Testing Library's toMatchSnapshots
- **E2E Testing**: Cypress or Playwright (for critical user flows)

### Test File Structure

```
__tests__/
├── unit/
│   ├── validator.test.js
│   ├── sorter.test.js
│   ├── data-aggregation.test.js
│   └── theme-manager.test.js
├── integration/
│   ├── transaction-management.test.js
│   ├── theme-toggle.test.js
│   └── sort-flow.test.js
├── error-handling/
│   ├── localStorage-errors.test.js
│   ├── chart-errors.test.js
│   └── form-validation-errors.test.js
└── snapshots/
    ├── input-form.js.snap
    ├── transaction-list.js.snap
    └── theme-toggle.js.snap
```

### Mock Data

```javascript
// test/mocks/transactions.js
export const mockTransactions = [
  {
    id: '1',
    name: 'Grocery Shopping',
    category: 'Food',
    amount: 45.50,
    date: '2026-09-15T14:30:00',
    timestamp: 1694783400000
  },
  {
    id: '2',
    name: 'Bus Ticket',
    category: 'Transport',
    amount: 2.50,
    date: '2026-09-14T08:00:00',
    timestamp: 1694697600000
  },
  {
    id: '3',
    name: 'Movie Night',
    category: 'Fun',
    amount: 25.00,
    date: '2026-09-13T19:00:00',
    timestamp: 1694624400000
  }
];

export const mockEmptyState = [];

export const mockSingleTransaction = [mockTransactions[0]];
```

### Performance Testing

- **Balance Update**: Should complete within 100ms
- **Chart Update**: Should complete within 500ms
- **UI Interactions**: Should have no noticeable lag
- **Page Load**: Should be usable within 1 second

### Accessibility Testing

- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Screen Reader**: ARIA labels on all interactive elements
- **Color Contrast**: Sufficient contrast in both light and dark modes
- **Focus Indicators**: Visible focus states on all interactive elements
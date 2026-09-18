/**
 * Unit Tests for Sorter Component
 * Tests transaction sorting functionality including date, amount, and category sorting
 */

// Helper function to create test transactions
function createTestTransactions() {
  return [
    {
      id: 1,
      name: 'Transaction 1',
      category: 'Transport',
      amount: 50,
      date: '2024-01-15T10:00:00Z'
    },
    {
      id: 2,
      name: 'Transaction 2',
      category: 'Food',
      amount: 100,
      date: '2024-01-10T10:00:00Z'
    },
    {
      id: 3,
      name: 'Transaction 3',
      category: 'Utilities',
      amount: 25,
      date: '2024-01-20T10:00:00Z'
    },
    {
      id: 4,
      name: 'Transaction 4',
      category: 'Food',
      amount: 75,
      date: '2024-01-10T12:00:00Z'
    }
  ];
}

/**
 * Test Suite: Sorter - Date Sorting
 * Tests sorting by date (newest first)
 */
describe('Sorter - Date Sorting', () => {
  let sorter;

  beforeEach(() => {
    sorter = new Sorter();
  });

  /**
   * Test 4.5.1: Sort by Date Descending - Newest First
   * Validates that transactions are sorted by date with newest first
   */
  it('should sort transactions by date (newest first)', () => {
    const transactions = createTestTransactions();
    const sorted = sorter.sortByDateDesc(transactions);
    
    // Check that dates are in descending order
    expect(new Date(sorted[0].date)).toBeGreaterThan(new Date(sorted[1].date));
    expect(new Date(sorted[1].date)).toBeGreaterThan(new Date(sorted[2].date));
  });

  /**
   * Test 4.5.2: Sort by Date Descending - Correct Order
   * Validates that the sorted order is correct
   */
  it('should return transactions in correct date order', () => {
    const transactions = createTestTransactions();
    const sorted = sorter.sortByDateDesc(transactions);
    
    // Expected order: id 3 (2024-01-20), id 1 (2024-01-15), id 4 (2024-01-10), id 2 (2024-01-10)
    expect(sorted[0].id).toBe(3);
    expect(sorted[1].id).toBe(1);
    // id 4 and id 2 have the same date, so order between them doesn't matter
    expect([sorted[2].id, sorted[3].id]).toEqual(expect.arrayContaining([4, 2]));
  });

  /**
   * Test 4.5.3: Sort Single Transaction by Date
   * Validates that single transaction returns itself
   */
  it('should return single transaction unchanged', () => {
    const transactions = [createTestTransactions()[0]];
    const sorted = sorter.sortByDateDesc(transactions);
    
    expect(sorted).toHaveLength(1);
    expect(sorted[0].id).toBe(1);
  });

  /**
   * Test 4.5.4: Sort Empty Array by Date
   * Validates that empty array returns empty array
   */
  it('should return empty array for empty input', () => {
    const sorted = sorter.sortByDateDesc([]);
    
    expect(sorted).toEqual([]);
  });
});

/**
 * Test Suite: Sorter - Amount Sorting
 * Tests sorting by amount (highest first)
 */
describe('Sorter - Amount Sorting', () => {
  let sorter;

  beforeEach(() => {
    sorter = new Sorter();
  });

  /**
   * Test 4.5.5: Sort by Amount Descending - Highest First
   * Validates that transactions are sorted by amount with highest first
   */
  it('should sort transactions by amount (highest first)', () => {
    const transactions = createTestTransactions();
    const sorted = sorter.sortByAmountDesc(transactions);
    
    // Check that amounts are in descending order
    expect(sorted[0].amount).toBeGreaterThanOrEqual(sorted[1].amount);
    expect(sorted[1].amount).toBeGreaterThanOrEqual(sorted[2].amount);
    expect(sorted[2].amount).toBeGreaterThanOrEqual(sorted[3].amount);
  });

  /**
   * Test 4.5.6: Sort by Amount Descending - Correct Order
   * Validates that the sorted order is correct
   */
  it('should return transactions in correct amount order', () => {
    const transactions = createTestTransactions();
    const sorted = sorter.sortByAmountDesc(transactions);
    
    // Expected order: id 2 (100), id 4 (75), id 1 (50), id 3 (25)
    expect(sorted[0].id).toBe(2);
    expect(sorted[1].id).toBe(4);
    expect(sorted[2].id).toBe(1);
    expect(sorted[3].id).toBe(3);
  });

  /**
   * Test 4.5.7: Sort Single Transaction by Amount
   * Validates that single transaction returns itself
   */
  it('should return single transaction unchanged', () => {
    const transactions = [createTestTransactions()[0]];
    const sorted = sorter.sortByAmountDesc(transactions);
    
    expect(sorted).toHaveLength(1);
    expect(sorted[0].id).toBe(1);
  });

  /**
   * Test 4.5.8: Sort Empty Array by Amount
   * Validates that empty array returns empty array
   */
  it('should return empty array for empty input', () => {
    const sorted = sorter.sortByAmountDesc([]);
    
    expect(sorted).toEqual([]);
  });
});

/**
 * Test Suite: Sorter - Category Sorting
 * Tests sorting by category (alphabetical)
 */
describe('Sorter - Category Sorting', () => {
  let sorter;

  beforeEach(() => {
    sorter = new Sorter();
  });

  /**
   * Test 4.5.9: Sort by Category Ascending - Alphabetical
   * Validates that transactions are sorted by category alphabetically
   */
  it('should sort transactions by category (alphabetical)', () => {
    const transactions = createTestTransactions();
    const sorted = sorter.sortByCategoryAsc(transactions);
    
    // Check that categories are in alphabetical order
    expect(sorted[0].category <= sorted[1].category).toBe(true);
    expect(sorted[1].category <= sorted[2].category).toBe(true);
    expect(sorted[2].category <= sorted[3].category).toBe(true);
  });

  /**
   * Test 4.5.10: Sort by Category Ascending - Correct Order
   * Validates that the sorted order is correct
   */
  it('should return transactions in correct category order', () => {
    const transactions = createTestTransactions();
    const sorted = sorter.sortByCategoryAsc(transactions);
    
    // Expected order: Food, Food, Transport, Utilities
    expect(sorted[0].category).toBe('Food');
    expect(sorted[1].category).toBe('Food');
    expect(sorted[2].category).toBe('Transport');
    expect(sorted[3].category).toBe('Utilities');
  });

  /**
   * Test 4.5.11: Sort Single Transaction by Category
   * Validates that single transaction returns itself
   */
  it('should return single transaction unchanged', () => {
    const transactions = [createTestTransactions()[0]];
    const sorted = sorter.sortByCategoryAsc(transactions);
    
    expect(sorted).toHaveLength(1);
    expect(sorted[0].id).toBe(1);
  });

  /**
   * Test 4.5.12: Sort Empty Array by Category
   * Validates that empty array returns empty array
   */
  it('should return empty array for empty input', () => {
    const sorted = sorter.sortByCategoryAsc([]);
    
    expect(sorted).toEqual([]);
  });
});

/**
 * Test Suite: Sorter - Apply Sort
 * Tests applying sort preferences
 */
describe('Sorter - Apply Sort', () => {
  let sorter;

  beforeEach(() => {
    sorter = new Sorter();
    // Clear localStorage for testing
    localStorage.clear();
  });

  /**
   * Test 4.5.13: Apply Default Sort (Date Desc)
   * Validates that default sort is by date descending
   */
  it('should apply default sort (date descending)', () => {
    const transactions = createTestTransactions();
    const sorted = sorter.applySort(transactions);
    
    // Default should be date descending
    expect(new Date(sorted[0].date)).toBeGreaterThan(new Date(sorted[1].date));
  });

  /**
   * Test 4.5.14: Apply Amount Desc Sort
   * Validates that amount-desc sort works correctly
   */
  it('should apply amount-desc sort', () => {
    sorter.setSortPreference('amount-desc');
    const transactions = createTestTransactions();
    const sorted = sorter.applySort(transactions);
    
    expect(sorted[0].amount).toBe(100);
  });

  /**
   * Test 4.5.15: Apply Category Asc Sort
   * Validates that category-asc sort works correctly
   */
  it('should apply category-asc sort', () => {
    sorter.setSortPreference('category-asc');
    const transactions = createTestTransactions();
    const sorted = sorter.applySort(transactions);
    
    expect(sorted[0].category).toBe('Food');
  });

  /**
   * Test 4.5.16: Apply Invalid Sort Preference (Fallback)
   * Validates that invalid preference falls back to date-desc
   */
  it('should fallback to date-desc for invalid preference', () => {
    sorter.setSortPreference('invalid');
    const transactions = createTestTransactions();
    const sorted = sorter.applySort(transactions);
    
    // Should fallback to date descending
    expect(new Date(sorted[0].date)).toBeGreaterThan(new Date(sorted[1].date));
  });

  /**
   * Test 4.5.17: Apply Sort - Persisted Preference
   * Validates that persisted sort preference is used
   */
  it('should use persisted sort preference', () => {
    // Set and save preference
    sorter.setSortPreference('amount-desc');
    
    // Create new sorter instance (simulates page reload)
    const newSorter = new Sorter();
    
    const transactions = createTestTransactions();
    const sorted = newSorter.applySort(transactions);
    
    expect(sorted[0].amount).toBe(100);
  });
});

/**
 * Test Suite: Sorter - Persistence
 * Tests sort preference persistence
 */
describe('Sorter - Persistence', () => {
  let sorter;

  beforeEach(() => {
    sorter = new Sorter();
    localStorage.clear();
  });

  /**
   * Test 4.5.18: Save Sort Preference
   * Validates that sort preference is saved to localStorage
   */
  it('should save sort preference to localStorage', () => {
    sorter.setSortPreference('amount-desc');
    
    const storedData = JSON.parse(localStorage.getItem('expenseBudgetVisualizer'));
    expect(storedData.sortPreference).toBe('amount-desc');
  });

  /**
   * Test 4.5.19: Load Sort Preference
   * Validates that sort preference is loaded from localStorage
   */
  it('should load sort preference from localStorage', () => {
    // Save preference first
    localStorage.setItem('expenseBudgetVisualizer', JSON.stringify({
      sortPreference: 'category-asc'
    }));
    
    // Create new sorter instance
    const newSorter = new Sorter();
    
    expect(newSorter.getSortPreference()).toBe('category-asc');
  });

  /**
   * Test 4.5.20: Default Sort Preference
   * Validates that default sort preference is 'date-desc'
   */
  it('should default to date-desc when no preference saved', () => {
    localStorage.clear();
    const newSorter = new Sorter();
    
    expect(newSorter.getSortPreference()).toBe('date-desc');
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
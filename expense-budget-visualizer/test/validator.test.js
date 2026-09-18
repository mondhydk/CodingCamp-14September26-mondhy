/**
 * Unit Tests for FormValidator Component
 * Tests form validation including empty name, empty category, 
 * negative/zero amount, and valid transaction validation
 */

/**
 * Test Suite: FormValidator - Name Validation
 * Validates form name field validation logic
 */
describe('FormValidator - Name Validation', () => {
  /**
   * Test 3.4.1: Empty Name Validation
   * Validates that empty name returns validation error
   */
  it('should return error for empty name', () => {
    const result = FormValidator.validateName('');
    
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('Item name is required');
  });

  /**
   * Test 3.4.2: Whitespace-only Name Validation
   * Validates that whitespace-only name returns validation error
   */
  it('should return error for whitespace-only name', () => {
    const result = FormValidator.validateName('   ');
    
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('Item name is required');
  });

  /**
   * Test 3.4.3: Valid Name Validation
   * Validates that valid name passes validation
   */
  it('should pass validation for valid name', () => {
    const result = FormValidator.validateName('Groceries');
    
    expect(result.isValid).toBe(true);
    expect(result.message).toBe('');
  });

  /**
   * Test 3.4.4: Name with Leading/Trailing Spaces
   * Validates that name with leading/trailing spaces is trimmed and passes
   */
  it('should pass validation for name with leading/trailing spaces', () => {
    const result = FormValidator.validateName('  Groceries  ');
    
    expect(result.isValid).toBe(true);
    expect(result.message).toBe('');
  });

  /**
   * Test 3.4.5: Name Exceeding 100 Characters
   * Validates that name exceeding 100 characters returns error
   */
  it('should return error for name exceeding 100 characters', () => {
    const longName = 'A'.repeat(101);
    const result = FormValidator.validateName(longName);
    
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('Item name must be 100 characters or less');
  });
});

/**
 * Test Suite: FormValidator - Category Validation
 * Validates category selection validation logic
 */
describe('FormValidator - Category Validation', () => {
  /**
   * Test 3.4.6: Empty Category Validation
   * Validates that empty category returns validation error
   */
  it('should return error for empty category', () => {
    const result = FormValidator.validateCategory('');
    
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('Please select a category');
  });

  /**
   * Test 3.4.7: Invalid Category Validation
   * Validates that invalid category returns validation error
   */
  it('should return error for invalid category', () => {
    const result = FormValidator.validateCategory('InvalidCategory');
    
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('Invalid category selected');
  });

  /**
   * Test 3.4.8: Valid Category Validation - Food
   * Validates that valid category 'Food' passes validation
   */
  it('should pass validation for valid category Food', () => {
    const result = FormValidator.validateCategory('Food');
    
    expect(result.isValid).toBe(true);
    expect(result.message).toBe('');
  });

  /**
   * Test 3.4.9: Valid Category Validation - Transport
   * Validates that valid category 'Transport' passes validation
   */
  it('should pass validation for valid category Transport', () => {
    const result = FormValidator.validateCategory('Transport');
    
    expect(result.isValid).toBe(true);
    expect(result.message).toBe('');
  });

  /**
   * Test 3.4.10: Valid Category Validation - Fun
   * Validates that valid category 'Fun' passes validation
   */
  it('should pass validation for valid category Fun', () => {
    const result = FormValidator.validateCategory('Fun');
    
    expect(result.isValid).toBe(true);
    expect(result.message).toBe('');
  });

  /**
   * Test 3.4.11: Valid Category Validation - Utilities
   * Validates that valid category 'Utilities' passes validation
   */
  it('should pass validation for valid category Utilities', () => {
    const result = FormValidator.validateCategory('Utilities');
    
    expect(result.isValid).toBe(true);
    expect(result.message).toBe('');
  });

  /**
   * Test 3.4.12: Valid Category Validation - Entertainment
   * Validates that valid category 'Entertainment' passes validation
   */
  it('should pass validation for valid category Entertainment', () => {
    const result = FormValidator.validateCategory('Entertainment');
    
    expect(result.isValid).toBe(true);
    expect(result.message).toBe('');
  });
});

/**
 * Test Suite: FormValidator - Amount Validation
 * Validates amount field validation logic
 */
describe('FormValidator - Amount Validation', () => {
  /**
   * Test 3.4.13: Empty Amount Validation
   * Validates that empty amount returns validation error
   */
  it('should return error for empty amount', () => {
    const result = FormValidator.validateAmount('');
    
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('Amount is required');
  });

  /**
   * Test 3.4.14: Null Amount Validation
   * Validates that null amount returns validation error
   */
  it('should return error for null amount', () => {
    const result = FormValidator.validateAmount(null);
    
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('Amount is required');
  });

  /**
   * Test 3.4.15: Undefined Amount Validation
   * Validates that undefined amount returns validation error
   */
  it('should return error for undefined amount', () => {
    const result = FormValidator.validateAmount(undefined);
    
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('Amount is required');
  });

  /**
   * Test 3.4.16: Zero Amount Validation
   * Validates that zero amount returns validation error
   */
  it('should return error for zero amount', () => {
    const result = FormValidator.validateAmount(0);
    
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('Amount must be a positive number');
  });

  /**
   * Test 3.4.17: Negative Amount Validation
   * Validates that negative amount returns validation error
   */
  it('should return error for negative amount', () => {
    const result = FormValidator.validateAmount(-10);
    
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('Amount must be a positive number');
  });

  /**
   * Test 3.4.18: Valid Positive Amount Validation
   * Validates that positive amount passes validation
   */
  it('should pass validation for valid positive amount', () => {
    const result = FormValidator.validateAmount(25.50);
    
    expect(result.isValid).toBe(true);
    expect(result.message).toBe('');
  });

  /**
   * Test 3.4.19: Valid Zero as String Validation
   * Validates that "0" as string returns error
   */
  it('should return error for zero as string', () => {
    const result = FormValidator.validateAmount('0');
    
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('Amount must be a positive number');
  });

  /**
   * Test 3.4.20: Valid Positive String Amount Validation
   * Validates that positive string amount passes validation
   */
  it('should pass validation for valid positive string amount', () => {
    const result = FormValidator.validateAmount('25.50');
    
    expect(result.isValid).toBe(true);
    expect(result.message).toBe('');
  });

  /**
   * Test 3.4.21: Very Large Amount Validation
   * Validates that amount over 10 million returns error
   */
  it('should return error for amount over 10 million', () => {
    const result = FormValidator.validateAmount(10000001);
    
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('Amount is too large');
  });

  /**
   * Test 3.4.22: Exact Large Amount Limit Validation
   * Validates that exact 10 million amount passes validation
   */
  it('should pass validation for exact 10 million amount', () => {
    const result = FormValidator.validateAmount(10000000);
    
    expect(result.isValid).toBe(true);
    expect(result.message).toBe('');
  });
});

/**
 * Test Suite: FormValidator - Complete Transaction Validation
 * Validates complete transaction validation logic
 */
describe('FormValidator - Complete Transaction Validation', () => {
  /**
   * Test 3.4.23: Valid Complete Transaction
   * Validates that valid complete transaction passes validation
   */
  it('should pass validation for valid complete transaction', () => {
    const data = {
      name: 'Groceries',
      category: 'Food',
      amount: '25.50'
    };
    
    const result = FormValidator.validateTransaction(data);
    
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  /**
   * Test 3.4.24: Invalid Transaction - Empty Name
   * Validates that transaction with empty name fails validation
   */
  it('should fail validation for transaction with empty name', () => {
    const data = {
      name: '',
      category: 'Food',
      amount: '25.50'
    };
    
    const result = FormValidator.validateTransaction(data);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.name).toBe('Item name is required');
  });

  /**
   * Test 3.4.25: Invalid Transaction - Empty Category
   * Validates that transaction with empty category fails validation
   */
  it('should fail validation for transaction with empty category', () => {
    const data = {
      name: 'Groceries',
      category: '',
      amount: '25.50'
    };
    
    const result = FormValidator.validateTransaction(data);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.category).toBe('Please select a category');
  });

  /**
   * Test 3.4.26: Invalid Transaction - Zero Amount
   * Validates that transaction with zero amount fails validation
   */
  it('should fail validation for transaction with zero amount', () => {
    const data = {
      name: 'Groceries',
      category: 'Food',
      amount: '0'
    };
    
    const result = FormValidator.validateTransaction(data);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.amount).toBe('Amount must be a positive number');
  });

  /**
   * Test 3.4.27: Invalid Transaction - Multiple Errors
   * Validates that transaction with multiple errors reports all errors
   */
  it('should report multiple errors for transaction with multiple invalid fields', () => {
    const data = {
      name: '',
      category: '',
      amount: '0'
    };
    
    const result = FormValidator.validateTransaction(data);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.name).toBeDefined();
    expect(result.errors.category).toBeDefined();
    expect(result.errors.amount).toBeDefined();
  });

  /**
   * Test 3.4.28: Invalid Transaction - Invalid Category
   * Validates that transaction with invalid category fails validation
   */
  it('should fail validation for transaction with invalid category', () => {
    const data = {
      name: 'Groceries',
      category: 'Invalid',
      amount: '25.50'
    };
    
    const result = FormValidator.validateTransaction(data);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.category).toBe('Invalid category selected');
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
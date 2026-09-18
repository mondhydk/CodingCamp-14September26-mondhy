/**
 * Unit Tests for LayoutManager Component
 * Tests responsive layout functionality including breakpoint detection,
 * mobile/desktop layout application, and resize event handling.
 */

// Mock DOM for testing
class MockDocument {
  constructor() {
    this.documentElement = {
      style: {},
      setAttribute: () => {},
      getAttribute: () => null
    };
    this.body = {
      classList: {
        add: jest.fn(),
        remove: jest.fn()
      }
    };
    this.querySelector = () => null;
    this.querySelectorAll = () => [];
    this.createElement = () => ({
      textContent: ''
    });
  }
}

class MockWindow {
  constructor(initialWidth = 1024) {
    this.innerWidth = initialWidth;
    this.addEventListener = jest.fn();
    this.removeEventListener = jest.fn();
    this.setTimeout = jest.fn();
    this.clearTimeout = jest.fn();
  }
}

/**
 * Test Suite: LayoutManager Initialization
 * Validates that LayoutManager initializes correctly with default or custom options
 */
describe('LayoutManager - Initialization', () => {
  let mockWindow;
  let mockDocument;
  let layoutManager;

  beforeEach(() => {
    mockWindow = new MockWindow(1024);
    mockDocument = new MockDocument();
    
    // Mock DOM references
    window.innerWidth = 1024;
    window.addEventListener = jest.fn();
    window.setTimeout = jest.fn();
    window.clearTimeout = jest.fn();
  });

  /**
   * Test 10.4.1: Default Configuration
   * Validates LayoutManager uses default breakpoint (599px) and delay (250ms)
   */
  it('should use default breakpoint and delay when no options provided', () => {
    layoutManager = new LayoutManager();
    
    expect(layoutManager.getMobileBreakpoint()).toBe(599);
    expect(layoutManager.resizeDelay).toBe(250);
  });

  /**
   * Test 10.4.2: Custom Configuration
   * Validates LayoutManager accepts custom breakpoint and delay values
   */
  it('should use custom breakpoint and delay when provided', () => {
    layoutManager = new LayoutManager({
      mobileBreakpoint: 480,
      resizeDelay: 500
    });
    
    expect(layoutManager.getMobileBreakpoint()).toBe(480);
    expect(layoutManager.resizeDelay).toBe(500);
  });
});

/**
 * Test Suite: Breakpoint Detection
 * Validates breakpoint detection logic for different screen widths
 */
describe('LayoutManager - Breakpoint Detection', () => {
  let mockWindow;
  let mockDocument;
  let layoutManager;

  beforeEach(() => {
    window.innerWidth = 1024;
    window.addEventListener = jest.fn();
    window.setTimeout = jest.fn();
    window.clearTimeout = jest.fn();
  });

  /**
   * Test 10.4.3: Desktop Mode Detection
   * Validates detection of desktop mode at widths ≥ 600px
   */
  it('should detect desktop mode at 600px', () => {
    window.innerWidth = 600;
    layoutManager = new LayoutManager();
    
    const mode = layoutManager.checkResponsiveMode();
    expect(mode).toBe('desktop');
    expect(layoutManager.isDesktop()).toBe(true);
    expect(layoutManager.isMobile()).toBe(false);
  });

  /**
   * Test 10.4.4: Desktop Mode Detection at 1024px
   * Validates detection of desktop mode at larger desktop widths
   */
  it('should detect desktop mode at 1024px', () => {
    window.innerWidth = 1024;
    layoutManager = new LayoutManager();
    
    const mode = layoutManager.checkResponsiveMode();
    expect(mode).toBe('desktop');
    expect(layoutManager.isDesktop()).toBe(true);
  });

  /**
   * Test 10.4.5: Mobile Mode Detection
   * Validates detection of mobile mode at widths < 600px
   */
  it('should detect mobile mode at 599px', () => {
    window.innerWidth = 599;
    layoutManager = new LayoutManager();
    
    const mode = layoutManager.checkResponsiveMode();
    expect(mode).toBe('mobile');
    expect(layoutManager.isMobile()).toBe(true);
    expect(layoutManager.isDesktop()).toBe(false);
  });

  /**
   * Test 10.4.6: Mobile Mode Detection at Smaller Width
   * Validates detection of mobile mode at smaller widths
   */
  it('should detect mobile mode at 320px', () => {
    window.innerWidth = 320;
    layoutManager = new LayoutManager();
    
    const mode = layoutManager.checkResponsiveMode();
    expect(mode).toBe('mobile');
    expect(layoutManager.isMobile()).toBe(true);
  });
});

/**
 * Test Suite: Layout Application
 * Validates that mobile and desktop layouts are applied correctly
 */
describe('LayoutManager - Layout Application', () => {
  let mockWindow;
  let mockDocument;
  let layoutManager;

  beforeEach(() => {
    window.innerWidth = 1024;
    window.addEventListener = jest.fn();
    window.setTimeout = jest.fn();
    window.clearTimeout = jest.fn();
    
    // Mock document with querySelector
    mockDocument = {
      documentElement: {
        style: {},
        setAttribute: jest.fn(),
        getAttribute: () => null
      },
      body: {
        classList: {
          add: jest.fn(),
          remove: jest.fn()
        }
      },
      querySelector: jest.fn((selector) => {
        if (selector === '.chart-container') {
          return { style: { height: '' } };
        }
        if (selector === '.main-content') {
          return { style: { padding: '' } };
        }
        if (selector === '.main-header') {
          return { style: { padding: '' } };
        }
        if (selector === '.theme-toggle .theme-text') {
          return { style: { display: '' } };
        }
        return null;
      })
    };
    global.document = mockDocument;
  });

  /**
   * Test 10.3.1: Apply Desktop Layout
   * Validates desktop layout is applied at ≥ 600px
   */
  it('should apply desktop layout at 600px', () => {
    window.innerWidth = 600;
    layoutManager = new LayoutManager();
    
    // Desktop layout should be applied by default at 600px
    expect(mockDocument.body.classList.add).toHaveBeenCalledWith('desktop-layout');
    expect(mockDocument.body.classList.remove).toHaveBeenCalledWith('mobile-layout');
  });

  /**
   * Test 10.3.2: Apply Mobile Layout
   * Validates mobile layout is applied at < 600px
   */
  it('should apply mobile layout at 599px', () => {
    window.innerWidth = 599;
    layoutManager = new LayoutManager();
    
    expect(mockDocument.body.classList.add).toHaveBeenCalledWith('mobile-layout');
    expect(mockDocument.body.classList.remove).toHaveBeenCalledWith('desktop-layout');
  });

  /**
   * Test 10.3.3: Layout Changes on Mode Switch
   * Validates layout changes when switching from desktop to mobile
   */
  it('should change layout when switching from desktop to mobile', () => {
    window.innerWidth = 1024;
    layoutManager = new LayoutManager();
    
    // Reset the mock to track changes
    mockDocument.body.classList.add.mockClear();
    mockDocument.body.classList.remove.mockClear();
    
    // Switch to mobile mode
    window.innerWidth = 599;
    layoutManager.checkResponsiveMode();
    
    expect(mockDocument.body.classList.add).toHaveBeenCalledWith('mobile-layout');
    expect(mockDocument.body.classList.remove).toHaveBeenCalledWith('desktop-layout');
  });

  /**
   * Test 10.3.4: Mobile Layout Adjustments
   * Validates mobile-specific UI adjustments are applied
   */
  it('should apply mobile-specific UI adjustments', () => {
    const mockChartContainer = { style: { height: '' } };
    const mockMainContent = { style: { padding: '' } };
    const mockMainHeader = { style: { padding: '' } };
    const mockThemeText = { style: { display: '' } };
    
    mockDocument.querySelector = jest.fn((selector) => {
      if (selector === '.chart-container') return mockChartContainer;
      if (selector === '.main-content') return mockMainContent;
      if (selector === '.main-header') return mockMainHeader;
      if (selector === '.theme-toggle .theme-text') return mockThemeText;
      return null;
    });
    
    window.innerWidth = 599;
    layoutManager = new LayoutManager();
    
    expect(mockChartContainer.style.height).toBe('250px');
    expect(mockMainContent.style.padding).toBe('1rem');
  });

  /**
   * Test 10.3.5: Desktop Layout Adjustments
   * Validates desktop-specific UI adjustments are applied
   */
  it('should apply desktop-specific UI adjustments', () => {
    const mockChartContainer = { style: { height: '' } };
    const mockMainContent = { style: { padding: '' } };
    const mockMainHeader = { style: { padding: '' } };
    const mockThemeText = { style: { display: '' } };
    
    mockDocument.querySelector = jest.fn((selector) => {
      if (selector === '.chart-container') return mockChartContainer;
      if (selector === '.main-content') return mockMainContent;
      if (selector === '.main-header') return mockMainHeader;
      if (selector === '.theme-toggle .theme-text') return mockThemeText;
      return null;
    });
    
    window.innerWidth = 1024;
    layoutManager = new LayoutManager();
    
    expect(mockChartContainer.style.height).toBe('300px');
    expect(mockMainContent.style.padding).toBe('2rem');
  });
});

/**
 * Test Suite: Resize Event Handling
 * Validates debounced resize event handling
 */
describe('LayoutManager - Resize Event Handling', () => {
  let mockWindow;
  let layoutManager;
  let originalWindow;

  beforeEach(() => {
    // Store original window
    originalWindow = { ...window };
    
    // Mock window with all needed properties
    window.innerWidth = 1024;
    window.addEventListener = jest.fn((event, handler) => {
      if (event === 'resize') {
        // Simulate resize event call
        setTimeout(() => handler(), 0);
      }
    });
    window.removeEventListener = jest.fn();
    window.setTimeout = jest.fn((fn) => {
      // Execute immediately for testing
      fn();
      return 1;
    });
    window.clearTimeout = jest.fn();
    
    // Mock document
    global.document = {
      documentElement: {
        setAttribute: jest.fn(),
        getAttribute: () => null
      },
      body: {
        classList: { add: jest.fn(), remove: jest.fn() }
      },
      querySelector: () => ({
        style: { height: '', padding: '' }
      })
    };
  });

  afterEach(() => {
    // Restore original window
    Object.assign(window, originalWindow);
    delete global.document;
  });

  /**
   * Test 10.4.7: Resize Event Listener Registration
   * Validates that resize event listener is registered on initialization
   */
  it('should register resize event listener on initialization', () => {
    layoutManager = new LayoutManager();
    
    expect(window.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  /**
   * Test 10.4.8: Debounce on Rapid Resizes
   * Validates that debouncing prevents excessive layout recalculations
   */
  it('should debounce resize events', () => {
    window.innerWidth = 1024;
    layoutManager = new LayoutManager();
    
    // Simulate rapid resize events
    window.innerWidth = 599;
    layoutManager.checkResponsiveMode();
    
    window.innerWidth = 1024;
    layoutManager.checkResponsiveMode();
    
    expect(window.setTimeout).toHaveBeenCalled();
  });

  /**
   * Test 10.3.6: Responsive Mode Change Event
   * Validates that responsive mode change event is emitted
   */
  it('should emit responsiveModeChange event on layout change', () => {
    let eventHandler = null;
    
    // Mock dispatchEvent
    global.document.dispatchEvent = jest.fn((event) => {
      eventHandler = event.detail;
    });
    
    window.innerWidth = 1024;
    layoutManager = new LayoutManager();
    
    // Switch to mobile
    window.innerWidth = 599;
    layoutManager.checkResponsiveMode();
    
    expect(eventHandler).toEqual({ mode: 'mobile' });
  });
});

/**
 * Test Suite: LayoutManager Cleanup
 * Validates proper cleanup when LayoutManager is destroyed
 */
describe('LayoutManager - Cleanup', () => {
  let layoutManager;
  let originalWindow;

  beforeEach(() => {
    originalWindow = { ...window };
    
    window.innerWidth = 1024;
    window.addEventListener = jest.fn();
    window.removeEventListener = jest.fn();
    window.setTimeout = jest.fn();
    window.clearTimeout = jest.fn();
    
    global.document = {
      documentElement: { setAttribute: jest.fn(), getAttribute: () => null },
      body: { classList: { add: jest.fn(), remove: jest.fn() } },
      querySelector: () => ({ style: { height: '', padding: '' } })
    };
  });

  afterEach(() => {
    Object.assign(window, originalWindow);
    delete global.document;
  });

  /**
   * Test 10.4.9: Destroy Removes Event Listeners
   * Validates that destroy removes resize event listener
   */
  it('should remove resize event listener on destroy', () => {
    layoutManager = new LayoutManager();
    layoutManager.destroy();
    
    expect(window.removeEventListener).toHaveBeenCalled();
  });

  /**
   * Test 10.4.10: Destroy Removes Layout Classes
   * Validates that destroy removes layout classes from body
   */
  it('should remove layout classes on destroy', () => {
    layoutManager = new LayoutManager();
    layoutManager.destroy();
    
    expect(global.document.body.classList.remove).toHaveBeenCalledWith('mobile-layout');
    expect(global.document.body.classList.remove).toHaveBeenCalledWith('desktop-layout');
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
/**
 * POS Application - Main application orchestrator
 * 
 * The central application class that manages the entire POS system.
 * Handles initialization, UI loading, event coordination, and system state.
 * Provides comprehensive event logging, keyboard shortcuts, and error handling.
 * 
 * @class POSApplication
 * @example
 * const pos = new POSApplication();
 * // Application auto-initializes and sets up:
 * // - Event logging system
 * // - Context rendering
 * // - State management
 * // - Keyboard shortcuts
 * // - Error handling
 * 
 * // Load a custom UI
 * pos.loadUIDefinition({
 *   type: 'panel',
 *   UID: 'my-pos-ui',
 *   children: [...]
 * });
 * 
 * // Available keyboard shortcuts:
 * // Ctrl+D - Toggle Designer Mode
 * // Ctrl+L - Load Demo UI
 * // Ctrl+Shift+L - Load POS Demo
 * // Ctrl+Shift+C - Clear UI
 * // Ctrl+E - Export State
 * // F1 - Show Help
 * // F5 - Refresh Application
 */
export class POSApplication {
    /**
     * Creates a new POS Application instance and initializes the system
     */
    constructor() {
        this.currentUI = null;
        this.designerMode = false;
        this.eventHistory = [];
        this.maxEventHistory = 1000;
        this.shortcuts = new Map();
        this.contextMenus = new Map();
        
        this.init();
    }

    /**
     * Initializes the POS application
     * Sets up event listeners, context, state management, and loads demo UI
     */
    init() {
        this.setupEventListeners();
        this.initializeSystemComponents();
        this.registerKeyboardShortcuts();
        this.logEvent('system', 'POS Application initialized');
        
        console.log('POSApplication: Initialized successfully');
    }

    setupEventListeners() {
        // Designer Mode Toggle
        const designerToggle = document.getElementById('designer-toggle');
        if (designerToggle) {
            designerToggle.addEventListener('click', () => {
                this.toggleDesignerMode();
            });
        }

        // Load Demo Button
        const loadDemo = document.getElementById('load-demo');
        if (loadDemo) {
            loadDemo.addEventListener('click', () => {
                this.loadUIDefinition(window.uiDefinition);
                window.NotificationSystem.show('Demo UI loaded successfully', 'success');
            });
        }

        // Load POS Demo Button
        const loadPosDemo = document.getElementById('load-pos-demo');
        if (loadPosDemo) {
            loadPosDemo.addEventListener('click', () => {
                this.loadUIDefinition(window.posUIDefinition);
                window.NotificationSystem.show('POS Demo UI loaded successfully', 'success');
            });
        }

        // Load Comprehensive Demo Button
        const loadComprehensiveDemo = document.getElementById('load-comprehensive-demo');
        if (loadComprehensiveDemo) {
            loadComprehensiveDemo.addEventListener('click', () => {
                this.loadUIDefinition(window.comprehensivePOSDefinition);
                window.NotificationSystem.show('Complete POS Demo loaded - all controls available', 'success');
            });
        }

        // Load JSON Button
        const loadJson = document.getElementById('load-json');
        if (loadJson) {
            loadJson.addEventListener('click', () => {
                this.showJSONLoader();
            });
        }

        // Clear All Button
        const clearAll = document.getElementById('clear-all');
        if (clearAll) {
            clearAll.addEventListener('click', () => {
                this.clearUI();
            });
        }

        // Clear Log Button
        const clearLog = document.getElementById('clear-log');
        if (clearLog) {
            clearLog.addEventListener('click', () => {
                this.clearEventLog();
            });
        }

        // Export State Button
        const exportState = document.getElementById('export-state');
        if (exportState) {
            exportState.addEventListener('click', () => {
                this.exportApplicationState();
            });
        }

        // Global error handler
        window.addEventListener('error', (e) => {
            this.logEvent('error', `JavaScript Error: ${e.message} at ${e.filename}:${e.lineno}`);
            window.NotificationSystem.error(`Application Error: ${e.message}`);
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (e) => {
            this.logEvent('error', `Unhandled Promise Rejection: ${e.reason}`);
            window.NotificationSystem.error(`Promise Error: ${e.reason}`);
        });
    }

    initializeSystemComponents() {
        // Initialize state manager with POS-specific state
        window.StateManager.setState('applicationState', 'ready');
        window.StateManager.setState('designerMode', false);
        window.StateManager.setState('currentTransaction', null);
        window.StateManager.setState('userSession', {
            username: 'cashier',
            role: 'cashier',
            storeId: 'STR001',
            terminalId: 'T001'
        });

        // Subscribe to state changes
        window.StateManager.subscribeGlobal((event) => {
            this.logEvent('state', `Global state change: ${event.type}`);
        });

        // Initialize context renderer with POS-specific context
        window.ContextRenderer.updateContext({
            StoreName: 'ABC Store',
            StoreAddress: '123 Main St, City, State 12345',
            StorePhone: '(555) 123-4567',
            CashierName: 'John Doe',
            RegisterNumber: '001',
            CurrentDateTime: new Date().toLocaleString()
        });

        // Initialize notification system
        window.NotificationSystem.setPosition('top-right');
        window.NotificationSystem.setMaxNotifications(5);
    }

    registerKeyboardShortcuts() {
        this.shortcuts.set('ctrl+d', () => this.toggleDesignerMode());
        this.shortcuts.set('ctrl+l', () => this.loadUIDefinition(window.uiDefinition));
        this.shortcuts.set('ctrl+shift+l', () => this.loadUIDefinition(window.posUIDefinition));
        this.shortcuts.set('ctrl+shift+c', () => this.clearUI());
        this.shortcuts.set('ctrl+e', () => this.exportApplicationState());
        this.shortcuts.set('f1', () => this.showHelp());
        this.shortcuts.set('f5', () => this.refreshApplication());

        document.addEventListener('keydown', (e) => {
            const shortcut = this.getShortcutString(e);
            const handler = this.shortcuts.get(shortcut);
            
            if (handler) {
                e.preventDefault();
                handler();
                this.logEvent('shortcut', `Keyboard shortcut executed: ${shortcut}`);
            }
        });
    }

    getShortcutString(event) {
        const parts = [];
        if (event.ctrlKey || event.metaKey) parts.push('ctrl');
        if (event.altKey) parts.push('alt');
        if (event.shiftKey) parts.push('shift');
        parts.push(event.key.toLowerCase());
        return parts.join('+');
    }

    /**
     * Loads a UI definition and renders it to the display area
     * @param {Object} definition - Control definition object
     * @returns {boolean} Success status
     */
    loadUIDefinition(definition) {
        if (!definition) {
            this.logEvent('error', 'No UI definition provided');
            window.NotificationSystem.error('No UI definition provided');
            return false;
        }

        try {
            // Validate definition
            const validation = window.ControlFactory.validateDefinition(definition);
            if (!validation.isValid) {
                this.logEvent('error', `Invalid UI definition: ${validation.errors.join(', ')}`);
                window.NotificationSystem.error(`Invalid UI definition: ${validation.errors.join(', ')}`);
                return false;
            }

            if (validation.warnings.length > 0) {
                validation.warnings.forEach(warning => {
                    this.logEvent('warning', `UI definition warning: ${warning}`);
                });
            }

            // Clear existing UI
            this.clearUI(false);

            // Create and render the new UI
            const container = document.getElementById('dynamic-ui-container');
            if (!container) {
                throw new Error('UI container not found');
            }

            this.currentUI = window.ControlFactory.create(definition);
            if (!this.currentUI) {
                throw new Error('Failed to create UI from definition');
            }

            // Set up UI event handlers
            this.setupUIEventHandlers(this.currentUI);

            // Render the UI
            const renderedElement = this.currentUI.render();
            container.innerHTML = '';
            container.appendChild(renderedElement);

            // Update application state
            window.StateManager.setState('currentUIDefinition', definition);
            window.StateManager.setState('currentUIType', definition.type);

            this.logEvent('ui', `UI Definition loaded: ${definition.UID || 'anonymous'} (${definition.type})`);
            
            return true;
        } catch (error) {
            this.logEvent('error', `Error loading UI definition: ${error.message}`);
            window.NotificationSystem.error(`Error loading UI: ${error.message}`);
            console.error('Error loading UI definition:', error);
            return false;
        }
    }

    setupUIEventHandlers(control) {
        if (!control) return;

        // Set up global event handlers for different control types
        control.on('click', (data) => {
            this.logEvent('interaction', `Button clicked: ${data.UID}`);
        });

        control.on('input', (data) => {
            this.logEvent('interaction', `Input changed: ${data.UID} = ${data.value}`);
        });

        control.on('barcodeScanned', (data) => {
            this.handleBarcodeScanned(data);
        });

        control.on('productSelected', (data) => {
            this.handleProductSelected(data);
        });

        control.on('paymentMethodSelected', (data) => {
            this.handlePaymentMethodSelected(data);
        });

        control.on('itemAdded', (data) => {
            this.handleItemAdded(data);
        });

        control.on('itemRemoved', (data) => {
            this.handleItemRemoved(data);
        });

        control.on('totalsUpdated', (data) => {
            this.handleTotalsUpdated(data);
        });

        control.on('drawerOpened', (data) => {
            this.handleCashDrawerOpened(data);
        });

        control.on('signatureSaved', (data) => {
            this.handleSignatureSaved(data);
        });

        // Recursively set up handlers for child controls
        if (control.childControls) {
            control.childControls.forEach(child => {
                this.setupUIEventHandlers(child);
            });
        }
    }

    handleBarcodeScanned(data) {
        this.logEvent('pos', `Barcode scanned: ${data.barcode}`);
        
        // Simulate product lookup
        const product = this.lookupProduct(data.barcode);
        if (product) {
            this.addProductToCart(product);
            window.NotificationSystem.success(`Product added: ${product.name}`);
        } else {
            window.NotificationSystem.warning(`Product not found: ${data.barcode}`);
        }
    }

    handleProductSelected(data) {
        this.logEvent('pos', `Product selected: ${data.product.name}`);
        this.addProductToCart(data.product);
    }

    addProductToCart(product) {
        // Find cart control and add item
        const cartControl = this.findControlByType('cart-grid');
        if (cartControl) {
            cartControl.addItem({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1
            });
        }
    }

    handlePaymentMethodSelected(data) {
        this.logEvent('pos', `Payment method selected: ${data.method}`);
        window.StateManager.setState('selectedPaymentMethod', data.method);
    }

    handleItemAdded(data) {
        this.logEvent('pos', `Item added to cart: ${data.item.name}`);
        this.updateReceiptPreview();
    }

    handleItemRemoved(data) {
        this.logEvent('pos', `Item removed from cart: ${data.item.name}`);
        this.updateReceiptPreview();
    }

    handleTotalsUpdated(data) {
        this.logEvent('pos', `Totals updated: $${data.total}`);
        
        // Update totals display
        const totalsControl = this.findControlByType('totals-display');
        if (totalsControl) {
            totalsControl.updateTotals(data);
        }

        // Update change due display
        const changeDueControl = this.findControlByType('change-due-display');
        const amountReceived = window.StateManager.getState('amountReceived') || 0;
        if (changeDueControl) {
            changeDueControl.updateChange(parseFloat(data.total), amountReceived);
        }

        // Update receipt preview
        this.updateReceiptPreview();

        // Update state
        window.StateManager.setState('transactionTotals', data);
    }

    handleCashDrawerOpened(data) {
        this.logEvent('pos', 'Cash drawer opened');
        window.NotificationSystem.info('Cash drawer opened');
    }

    handleSignatureSaved(data) {
        this.logEvent('pos', 'Customer signature saved');
        window.NotificationSystem.success('Signature captured successfully');
    }

    updateReceiptPreview() {
        const receiptControl = this.findControlByType('receipt-preview');
        const cartControl = this.findControlByType('cart-grid');
        
        if (receiptControl && cartControl) {
            const totals = window.StateManager.getState('transactionTotals');
            receiptControl.updateReceipt(cartControl.items, totals);
        }
    }

    findControlByType(type) {
        if (!this.currentUI) return null;
        return this.findControlInTree(this.currentUI, (control) => control.type === type);
    }

    findControlByUID(uid) {
        if (!this.currentUI) return null;
        return this.findControlInTree(this.currentUI, (control) => control.UID === uid);
    }

    findControlInTree(control, predicate) {
        if (predicate(control)) {
            return control;
        }
        
        if (control.childControls) {
            for (const child of control.childControls) {
                const found = this.findControlInTree(child, predicate);
                if (found) return found;
            }
        }
        
        return null;
    }

    lookupProduct(barcode) {
        // Mock product database
        const products = {
            '123456789': { id: '123456789', name: 'Coffee Mug', price: 12.99 },
            '987654321': { id: '987654321', name: 'Notebook', price: 5.49 },
            '456789123': { id: '456789123', name: 'Pen Set', price: 8.99 },
            '789123456': { id: '789123456', name: 'Desk Lamp', price: 24.99 }
        };

        return products[barcode] || null;
    }

    /**
     * Toggles designer mode on/off
     * Designer mode shows control outlines and debug information
     */
    toggleDesignerMode() {
        this.designerMode = !this.designerMode;
        window.designerMode = this.designerMode;
        
        const button = document.getElementById('designer-toggle');
        if (button) {
            if (this.designerMode) {
                button.textContent = 'Designer Mode: ON';
                button.className = button.className.replace('bg-accent text-accent-foreground', 'bg-destructive text-destructive-foreground');
                window.NotificationSystem.show('Designer Mode enabled - Controls will show debug information', 'warning');
            } else {
                button.textContent = 'Designer Mode: OFF';
                button.className = button.className.replace('bg-destructive text-destructive-foreground', 'bg-accent text-accent-foreground');
                window.NotificationSystem.show('Designer Mode disabled', 'info');
            }
        }

        // Re-render current UI if exists to apply/remove designer annotations
        if (this.currentUI) {
            const definition = window.StateManager.getState('currentUIDefinition');
            if (definition) {
                this.loadUIDefinition(definition);
            }
        }

        window.StateManager.setState('designerMode', this.designerMode);
        this.logEvent('system', `Designer Mode: ${this.designerMode ? 'ON' : 'OFF'}`);
    }

    /**
     * Clears the current UI display
     * @param {boolean} [showNotification=true] - Whether to show notification
     */
    clearUI(showNotification = true) {
        const container = document.getElementById('dynamic-ui-container');
        if (container) {
            container.innerHTML = '<div class="text-center text-muted-foreground">Dynamic controls will render here...</div>';
        }

        if (this.currentUI) {
            this.currentUI.destroy();
            this.currentUI = null;
        }

        window.StateManager.removeState('currentUIDefinition');
        window.StateManager.removeState('currentUIType');
        window.StateManager.removeState('transactionTotals');

        if (showNotification) {
            window.NotificationSystem.show('UI cleared', 'info');
        }
        
        this.logEvent('ui', 'UI cleared');
    }

    clearEventLog() {
        const logContainer = document.getElementById('event-log');
        if (logContainer) {
            logContainer.innerHTML = '<div class="text-muted-foreground">[System] Event log cleared</div>';
        }
        
        this.eventHistory = [];
        this.logEvent('system', 'Event log cleared');
    }

    logEvent(type, message) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = {
            timestamp,
            type: type.toUpperCase(),
            message,
            id: Date.now()
        };

        // Add to history
        this.eventHistory.push(logEntry);
        if (this.eventHistory.length > this.maxEventHistory) {
            this.eventHistory.shift();
        }

        // Display in log container
        const logContainer = document.getElementById('event-log');
        if (logContainer) {
            const logElement = document.createElement('div');
            logElement.textContent = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
            logElement.className = type === 'error' ? 'text-red-500' : 'text-gray-600';
            logContainer.appendChild(logElement);
            logContainer.scrollTop = logContainer.scrollHeight;
        }

        // Also log to console for debugging
        console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
    }

    exportApplicationState() {
        const state = {
            application: {
                version: '2.1.0',
                designerMode: this.designerMode,
                timestamp: new Date().toISOString()
            },
            ui: {
                currentDefinition: window.StateManager.getState('currentUIDefinition'),
                currentType: window.StateManager.getState('currentUIType')
            },
            globalState: window.StateManager.getAllState(),
            context: window.ContextRenderer.getAllContext(),
            eventHistory: this.eventHistory.slice(-100), // Last 100 events
            notifications: window.NotificationSystem.getStats()
        };

        const dataStr = JSON.stringify(state, null, 2);
        
        // Download as file
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pos-state-${new Date().toISOString().slice(0, 19)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        window.NotificationSystem.success('Application state exported successfully');
        this.logEvent('export', 'Application state exported to file');
    }

    showJSONLoader() {
        const modal = this.createModal('Load JSON UI Definition', `
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium mb-2">Paste JSON Definition:</label>
                    <textarea id="json-input" class="w-full h-64 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring font-mono text-sm" placeholder="Paste your JSON UI definition here..."></textarea>
                </div>
                <div class="flex justify-end space-x-2">
                    <button id="json-cancel" class="px-4 py-2 border border-border rounded-md hover:bg-accent">Cancel</button>
                    <button id="json-load" class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">Load UI</button>
                </div>
            </div>
        `);

        document.getElementById('json-cancel').addEventListener('click', () => {
            this.closeModal(modal);
        });

        document.getElementById('json-load').addEventListener('click', () => {
            const jsonInput = document.getElementById('json-input');
            try {
                const definition = JSON.parse(jsonInput.value);
                this.loadUIDefinition(definition);
                this.closeModal(modal);
                window.NotificationSystem.success('JSON UI definition loaded successfully');
            } catch (error) {
                window.NotificationSystem.error(`Invalid JSON: ${error.message}`);
            }
        });
    }

    createModal(title, content) {
        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center';
        overlay.innerHTML = `
            <div class="bg-card border border-border rounded-lg shadow-lg max-w-2xl w-full mx-4">
                <div class="flex items-center justify-between p-4 border-b border-border">
                    <h3 class="text-lg font-semibold">${title}</h3>
                    <button class="modal-close text-muted-foreground hover:text-foreground">✕</button>
                </div>
                <div class="p-4">
                    ${content}
                </div>
            </div>
        `;

        overlay.querySelector('.modal-close').addEventListener('click', () => {
            this.closeModal(overlay);
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeModal(overlay);
            }
        });

        document.body.appendChild(overlay);
        return overlay;
    }

    closeModal(modal) {
        if (modal && modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    }

    showHelp() {
        const helpContent = `
            <div class="space-y-4 text-sm">
                <div>
                    <h4 class="font-semibold mb-2">Keyboard Shortcuts:</h4>
                    <ul class="space-y-1 text-muted-foreground">
                        <li><kbd class="px-1 py-0.5 bg-muted rounded">Ctrl+D</kbd> - Toggle Designer Mode</li>
                        <li><kbd class="px-1 py-0.5 bg-muted rounded">Ctrl+L</kbd> - Load Demo UI</li>
                        <li><kbd class="px-1 py-0.5 bg-muted rounded">Ctrl+Shift+L</kbd> - Load POS Demo</li>
                        <li><kbd class="px-1 py-0.5 bg-muted rounded">Ctrl+Shift+C</kbd> - Clear UI</li>
                        <li><kbd class="px-1 py-0.5 bg-muted rounded">Ctrl+E</kbd> - Export State</li>
                        <li><kbd class="px-1 py-0.5 bg-muted rounded">F1</kbd> - Show Help</li>
                        <li><kbd class="px-1 py-0.5 bg-muted rounded">F5</kbd> - Refresh Application</li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-semibold mb-2">Available Control Types:</h4>
                    <div class="grid grid-cols-2 gap-2 text-muted-foreground">
                        ${window.ControlFactory.getAvailableTypes().map(type => `<div>${type}</div>`).join('')}
                    </div>
                </div>
            </div>
        `;

        const modal = this.createModal('POS System Help', helpContent);
    }

    refreshApplication() {
        window.location.reload();
    }

    getApplicationStats() {
        return {
            currentUI: this.currentUI ? this.currentUI.type : null,
            designerMode: this.designerMode,
            eventHistorySize: this.eventHistory.length,
            globalState: window.StateManager.debugInfo(),
            notifications: window.NotificationSystem.getStats(),
            contextCache: window.ContextRenderer.getCacheStats(),
            availableControls: window.ControlFactory.getAvailableTypes().length
        };
    }
}

// Make POSApplication globally available
if (typeof window !== 'undefined') {
    window.POSApplication = POSApplication;
}

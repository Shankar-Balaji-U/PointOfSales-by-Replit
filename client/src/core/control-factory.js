/**
 * Control Factory - Creates controls dynamically from JSON definitions
 * 
 * Factory class responsible for creating control instances from JSON definitions.
 * Maintains registry of all available control types and provides validation.
 * 
 * @class ControlFactory
 * @example
 * const control = ControlFactory.create({
 *   type: 'button',
 *   UID: 'my-button',
 *   text: 'Click me!'
 * });
 * 
 * // Register custom control
 * ControlFactory.registerControl('my-control', () => MyCustomControl);
 */
export class ControlFactory {
    static controlTypes = {
        // Structural Controls
        'panel': () => window.PanelControl,
        'tab-control': () => window.TabControl,
        'grid-layout': () => window.GridLayoutControl,
        'section': () => window.SectionControl,
        'splitter': () => window.SplitterControl,
        'datagrid': () => window.DataGridControl,
        
        // Input Controls
        'textbox': () => window.TextBoxControl,
        'input': () => window.TextBoxControl, // Alias
        'numeric-input': () => window.NumericInputControl,
        'password': () => window.PasswordControl,
        'barcode-input': () => window.BarcodeInputControl,
        'dropdown': () => window.DropdownControl,
        'datepicker': () => window.DatePickerControl,
        'toggle': () => window.ToggleControl,
        
        // Action Controls
        'button': () => window.ButtonControl,
        'button-pad': () => window.ButtonPadControl,
        'menu-button': () => window.MenuButtonControl,
        'shortcut-keys': () => window.ShortcutKeysControl,
        
        // Display Controls
        'label': () => window.LabelControl,
        'message-box': () => window.MessageBoxControl,
        'status-bar': () => window.StatusBarControl,
        'notification-area': () => window.NotificationAreaControl,
        'image': () => window.ImageControl,
        
        // Transaction Controls
        'cart-grid': () => window.CartGridControl,
        'totals-display': () => window.TotalsDisplayControl,
        'payment-control': () => window.PaymentControlControl,
        'change-due-display': () => window.ChangeDueDisplayControl,
        'customer-info-panel': () => window.CustomerInfoPanelControl,
        
        // Special Controls
        'price-checker': () => window.PriceCheckerControl,
        'signature-pad': () => window.SignaturePadControl,
        'receipt-preview': () => window.ReceiptPreviewControl,
        'scale-input': () => window.ScaleInputControl,
        'cash-drawer': () => window.CashDrawerControl,
        'device-control': () => window.DeviceControlControl,
        'context-menu': () => window.ContextMenuControl,
        'search-bar': () => window.SearchBarControl
    };

    /**
     * Creates a control instance from a JSON definition
     * @param {Object} definition - Control definition object
     * @returns {Control|null} Created control instance or null if failed
     */
    static create(definition) {
        if (!definition || !definition.type) {
            console.error('Invalid control definition:', definition);
            return null;
        }

        // Validate definition using comprehensive validation
        const validation = this.validateDefinition(definition);
        if (!validation.isValid) {
            console.error(`Control validation failed for ${definition.type}:`, validation.errors);
            
            // Log warnings too
            if (validation.warnings.length > 0) {
                console.warn(`Control validation warnings for ${definition.type}:`, validation.warnings);
            }
            
            // For critical errors, don't create the control
            const criticalErrors = validation.errors.filter(error => 
                error.includes('type is required') || 
                error.includes('Invalid control type')
            );
            
            if (criticalErrors.length > 0) {
                return null;
            }
        }

        // Use sanitized definition if available
        const sanitizedDefinition = validation.sanitizedDefinition || definition;

        const controlTypeGetter = this.controlTypes[sanitizedDefinition.type];
        if (!controlTypeGetter) {
            console.warn(`Unknown control type: ${sanitizedDefinition.type}. Available types:`, Object.keys(this.controlTypes));
            // Return a base control as fallback
            return new window.Control(sanitizedDefinition);
        }

        try {
            const ControlClass = controlTypeGetter();
            if (!ControlClass) {
                console.error(`Control class not found for type: ${sanitizedDefinition.type}`);
                return new window.Control(sanitizedDefinition);
            }
            
            const control = new ControlClass(sanitizedDefinition);
            
            // Store validation metadata on the control
            if (window.DataManager) {
                window.DataManager.set(control.element, 'validation', validation);
            }
            
            // Log control creation for debugging
            if (window.designerMode) {
                console.log(`Created control: ${sanitizedDefinition.type} (${control.UID})`);
                if (validation.warnings.length > 0) {
                    console.warn(`Warnings for ${control.UID}:`, validation.warnings);
                }
            }
            
            return control;
        } catch (error) {
            console.error(`Error creating control of type ${sanitizedDefinition.type}:`, error);
            
            // Try to create a basic fallback control
            try {
                return new window.Control(sanitizedDefinition);
            } catch (fallbackError) {
                console.error('Failed to create fallback control:', fallbackError);
                return null;
            }
        }
    }

    /**
     * Registers a new control type with the factory
     * @param {string} type - Control type identifier
     * @param {Function} controlClassGetter - Function that returns the control class
     * @returns {boolean} Success status
     */
    static registerControl(type, controlClassGetter) {
        if (typeof controlClassGetter !== 'function') {
            console.error('Control class getter must be a function');
            return false;
        }
        
        this.controlTypes[type] = controlClassGetter;
        console.log(`Registered control type: ${type}`);
        return true;
    }

    static unregisterControl(type) {
        if (this.controlTypes[type]) {
            delete this.controlTypes[type];
            console.log(`Unregistered control type: ${type}`);
            return true;
        }
        return false;
    }

    static getAvailableTypes() {
        return Object.keys(this.controlTypes);
    }

    static isValidType(type) {
        return this.controlTypes.hasOwnProperty(type);
    }

    static createFromTemplate(template, context = {}) {
        if (!template) {
            console.error('Template is required');
            return null;
        }

        // Deep clone the template to avoid mutations
        const definition = JSON.parse(JSON.stringify(template));
        
        // Apply context to the definition
        this.applyContextToDefinition(definition, context);
        
        return this.create(definition);
    }

    static applyContextToDefinition(definition, context) {
        // Recursively apply context values to string properties
        Object.keys(definition).forEach(key => {
            const value = definition[key];
            
            if (typeof value === 'string') {
                definition[key] = this.replaceContextPlaceholders(value, context);
            } else if (Array.isArray(value)) {
                value.forEach(item => {
                    if (typeof item === 'object' && item !== null) {
                        this.applyContextToDefinition(item, context);
                    }
                });
            } else if (typeof value === 'object' && value !== null) {
                this.applyContextToDefinition(value, context);
            }
        });
    }

    static replaceContextPlaceholders(text, context) {
        return text.replace(/#{(\w+)}/g, (match, key) => {
            return context[key] !== undefined ? context[key] : match;
        });
    }

    static createBatch(definitions) {
        if (!Array.isArray(definitions)) {
            console.error('Definitions must be an array');
            return [];
        }

        const controls = [];
        definitions.forEach((definition, index) => {
            try {
                const control = this.create(definition);
                if (control) {
                    controls.push(control);
                }
            } catch (error) {
                console.error(`Error creating control at index ${index}:`, error);
            }
        });

        return controls;
    }

    /**
     * Validates a control definition for errors and warnings
     * @param {Object} definition - Control definition to validate
     * @returns {Object} Validation result with isValid, errors, warnings, and sanitizedDefinition
     */
    static validateDefinition(definition) {
        // Use the comprehensive validation system if available
        if (window.Validation && window.Validation.validateControlDefinition) {
            return window.Validation.validateControlDefinition(definition);
        }

        // Fallback to basic validation
        const errors = [];
        const warnings = [];

        if (!definition) {
            errors.push('Definition is required');
            return { isValid: false, errors, warnings, sanitizedDefinition: null };
        }

        if (!definition.type) {
            errors.push('Control type is required');
        } else if (!this.isValidType(definition.type)) {
            errors.push(`Invalid control type: ${definition.type}`);
        }

        if (definition.UID && typeof definition.UID !== 'string') {
            warnings.push('UID should be a string');
        }

        if (definition.children && !Array.isArray(definition.children)) {
            errors.push('Children must be an array');
        }

        if (definition.props && typeof definition.props !== 'object') {
            warnings.push('Props should be an object');
        }

        if (definition.style && typeof definition.style !== 'object') {
            warnings.push('Style should be an object');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            sanitizedDefinition: definition
        };
    }

    static getControlInfo(type) {
        if (!this.isValidType(type)) {
            return null;
        }

        // Return metadata about the control type
        return {
            type,
            available: true,
            category: this.getControlCategory(type),
            description: this.getControlDescription(type)
        };
    }

    static getControlCategory(type) {
        const categories = {
            'panel': 'structural',
            'tab-control': 'structural',
            'grid-layout': 'structural',
            'section': 'structural',
            'splitter': 'structural',
            'datagrid': 'structural',
            
            'textbox': 'input',
            'input': 'input',
            'numeric-input': 'input',
            'password': 'input',
            'barcode-input': 'input',
            'dropdown': 'input',
            'datepicker': 'input',
            'toggle': 'input',
            
            'button': 'action',
            'button-pad': 'action',
            'menu-button': 'action',
            'shortcut-keys': 'action',
            
            'label': 'display',
            'message-box': 'display',
            'status-bar': 'display',
            'notification-area': 'display',
            'image': 'display',
            
            'cart-grid': 'transaction',
            'totals-display': 'transaction',
            'payment-control': 'transaction',
            'change-due-display': 'transaction',
            'customer-info-panel': 'transaction',
            
            'price-checker': 'special',
            'signature-pad': 'special',
            'receipt-preview': 'special',
            'scale-input': 'special',
            'cash-drawer': 'special',
            'device-control': 'special',
            'context-menu': 'special',
            'search-bar': 'special'
        };

        return categories[type] || 'unknown';
    }

    static getControlDescription(type) {
        const descriptions = {
            'panel': 'Container control with optional header',
            'tab-control': 'Tabbed interface for organizing content',
            'grid-layout': 'CSS Grid layout container',
            'section': 'Simple grouping container',
            'splitter': 'Resizable panes with splitter handle',
            'datagrid': 'Data table with sorting capabilities',
            
            'textbox': 'Basic text input field',
            'input': 'Alias for textbox control',
            'numeric-input': 'Number input with validation',
            'password': 'Password input with toggle visibility',
            'barcode-input': 'Specialized barcode scanner input',
            'dropdown': 'Select dropdown menu',
            'datepicker': 'Date selection input',
            'toggle': 'Switch/toggle control',
            
            'button': 'Action button with multiple variants',
            'button-pad': 'Grid of buttons',
            'menu-button': 'Button with dropdown menu',
            'shortcut-keys': 'Keyboard shortcut handler',
            
            'label': 'Text display with styling variants',
            'message-box': 'Modal dialog for messages',
            'status-bar': 'Application status display',
            'notification-area': 'Toast notification container',
            'image': 'Image display control',
            
            'cart-grid': 'Shopping cart items display',
            'totals-display': 'Transaction totals calculator',
            'payment-control': 'Payment method selection',
            'change-due-display': 'Change calculation display',
            'customer-info-panel': 'Customer information display',
            
            'price-checker': 'Product price lookup',
            'signature-pad': 'Digital signature capture',
            'receipt-preview': 'Transaction receipt display',
            'scale-input': 'Weight-based input with pricing',
            'cash-drawer': 'Cash drawer control button',
            'device-control': 'Generic device interface',
            'context-menu': 'Right-click context menu',
            'search-bar': 'Product search with dropdown results'
        };

        return descriptions[type] || 'No description available';
    }
}

// Make ControlFactory globally available
if (typeof window !== 'undefined') {
    window.ControlFactory = ControlFactory;
}

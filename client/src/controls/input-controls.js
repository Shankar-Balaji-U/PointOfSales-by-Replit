import { Control } from './base-control.js';

/**
 * TextBox Control - Basic text input
 * 
 * Standard text input field with placeholder support and context rendering.
 * Emits 'input', 'focus', and 'blur' events.
 * 
 * @class TextBoxControl
 * @extends Control
 * @example
 * {
 *   type: 'textbox',
 *   UID: 'customer-name',
 *   placeholder: 'Enter customer name...',
 *   value: 'John Doe'
 * }
 */
export class TextBoxControl extends Control {
    createElement() {
        const element = document.createElement('input');
        element.id = this.UID;
        element.type = 'text';
        element.className = this.getBaseClasses();
        element.placeholder = window.ContextRenderer.render(this.placeholder);
        element.value = this.value;
        element.setAttribute('data-testid', `textbox-${this.UID}`);
        return element;
    }

    getBaseClasses() {
        return 'textbox-control px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors';
    }

    attachEvents() {
        this.element.addEventListener('input', (e) => {
            this.setState({ value: e.target.value });
            this.emit('input', { value: e.target.value, UID: this.UID });
            this.logEvent('input', `TextBox ${this.UID} changed: ${e.target.value}`);
        });

        this.element.addEventListener('blur', (e) => {
            this.emit('blur', { value: e.target.value, UID: this.UID });
        });

        this.element.addEventListener('focus', (e) => {
            this.emit('focus', { UID: this.UID });
        });
    }
}

/**
 * Numeric Input Control - Number input with validation
 * 
 * Specialized input for numeric values with min/max validation and step support.
 * Emits 'numericInput' event with parsed numeric value.
 * 
 * @class NumericInputControl
 * @extends TextBoxControl
 * @example
 * {
 *   type: 'numeric-input',
 *   UID: 'item-quantity',
 *   placeholder: 'Quantity',
 *   props: { min: 1, max: 999, step: 1 },
 *   value: '1'
 * }
 */
export class NumericInputControl extends TextBoxControl {
    createElement() {
        const element = document.createElement('input');
        element.id = this.UID;
        element.type = 'number';
        element.className = this.getBaseClasses();
        element.placeholder = window.ContextRenderer.render(this.placeholder);
        element.value = this.value;
        element.setAttribute('data-testid', `numeric-input-${this.UID}`);
        
        if (this.props.min !== undefined) element.min = this.props.min;
        if (this.props.max !== undefined) element.max = this.props.max;
        if (this.props.step !== undefined) element.step = this.props.step;
        
        return element;
    }

    attachEvents() {
        super.attachEvents();
        
        this.element.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            if (!isNaN(value)) {
                this.setState({ numericValue: value });
                this.emit('numericInput', { value: value, UID: this.UID });
            }
        });
    }
}

/**
 * Password Control - Password input
 * 
 * Password input field with show/hide toggle button.
 * Provides secure text entry with visibility control.
 * 
 * @class PasswordControl
 * @extends TextBoxControl
 * @example
 * {
 *   type: 'password',
 *   UID: 'admin-password',
 *   placeholder: 'Enter admin password...'
 * }
 */
export class PasswordControl extends TextBoxControl {
    createElement() {
        const wrapper = document.createElement('div');
        wrapper.id = this.UID;
        wrapper.className = 'password-control relative';
        wrapper.setAttribute('data-testid', `password-${this.UID}`);
        
        const input = document.createElement('input');
        input.type = 'password';
        input.className = this.getBaseClasses() + ' pr-10';
        input.placeholder = window.ContextRenderer.render(this.placeholder);
        input.value = this.value;
        
        const toggleButton = document.createElement('button');
        toggleButton.type = 'button';
        toggleButton.className = 'absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground';
        toggleButton.innerHTML = '👁️';
        toggleButton.setAttribute('data-testid', `password-toggle-${this.UID}`);
        
        toggleButton.addEventListener('click', () => {
            input.type = input.type === 'password' ? 'text' : 'password';
            toggleButton.innerHTML = input.type === 'password' ? '👁️' : '🙈';
        });
        
        wrapper.appendChild(input);
        wrapper.appendChild(toggleButton);
        
        // Store reference to input for event handling
        this.inputElement = input;
        
        return wrapper;
    }

    attachEvents() {
        this.inputElement.addEventListener('input', (e) => {
            this.setState({ value: e.target.value });
            this.emit('input', { value: e.target.value, UID: this.UID });
            this.logEvent('input', `Password ${this.UID} changed`);
        });
    }
}

/**
 * Barcode Input Control - Specialized for barcode scanning
 * 
 * Enhanced text input with barcode scanner styling and functionality.
 * Emits 'barcodeScanned' event when Enter is pressed with a value.
 * 
 * @class BarcodeInputControl
 * @extends TextBoxControl
 * @example
 * {
 *   type: 'barcode-input',
 *   UID: 'product-scanner',
 *   placeholder: 'Scan or type barcode...'
 * }
 */
export class BarcodeInputControl extends TextBoxControl {
    getBaseClasses() {
        return super.getBaseClasses() + ' barcode-scanner';
    }

    attachEvents() {
        super.attachEvents();
        
        this.element.addEventListener('focus', () => {
            this.element.placeholder = 'Scan or type barcode...';
            this.logEvent('focus', `Barcode scanner ${this.UID} activated`);
        });

        this.element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && this.element.value) {
                this.emit('barcodeScanned', { 
                    barcode: this.element.value, 
                    UID: this.UID 
                });
                this.logEvent('barcode', `Barcode scanned: ${this.element.value}`);
            }
        });
    }
}

/**
 * Dropdown Control - Select dropdown
 * 
 * Standard select dropdown with configurable options.
 * Supports both simple string options and object options with value/label pairs.
 * 
 * @class DropdownControl
 * @extends Control
 * @example
 * {
 *   type: 'dropdown',
 *   UID: 'payment-method',
 *   placeholder: 'Select payment method...',
 *   props: {
 *     options: [
 *       { value: 'cash', label: 'Cash' },
 *       { value: 'card', label: 'Credit Card' },
 *       'Check'
 *     ]
 *   }
 * }
 */
export class DropdownControl extends Control {
    createElement() {
        const element = document.createElement('select');
        element.id = this.UID;
        element.className = this.getBaseClasses();
        element.setAttribute('data-testid', `dropdown-${this.UID}`);
        
        // Add default option if placeholder exists
        if (this.placeholder) {
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = window.ContextRenderer.render(this.placeholder);
            defaultOption.disabled = true;
            defaultOption.selected = true;
            element.appendChild(defaultOption);
        }
        
        // Add options
        const options = this.props.options || [];
        options.forEach((option, index) => {
            const optElement = document.createElement('option');
            optElement.value = option.value || option;
            optElement.textContent = option.label || option;
            optElement.setAttribute('data-testid', `option-${index}`);
            element.appendChild(optElement);
        });
        
        return element;
    }

    getBaseClasses() {
        return 'dropdown-control px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors';
    }

    attachEvents() {
        this.element.addEventListener('change', (e) => {
            this.setState({ selectedValue: e.target.value });
            this.emit('change', { value: e.target.value, UID: this.UID });
            this.logEvent('selection', `Dropdown ${this.UID} changed to: ${e.target.value}`);
        });
    }
}

/**
 * Date Picker Control - Date input
 * 
 * HTML5 date input control for selecting dates.
 * Emits 'dateChange' event when the date is modified.
 * 
 * @class DatePickerControl
 * @extends Control
 * @example
 * {
 *   type: 'datepicker',
 *   UID: 'transaction-date',
 *   value: '2024-01-15'
 * }
 */
export class DatePickerControl extends Control {
    createElement() {
        const element = document.createElement('input');
        element.id = this.UID;
        element.type = 'date';
        element.className = this.getBaseClasses();
        element.value = this.value;
        element.setAttribute('data-testid', `datepicker-${this.UID}`);
        return element;
    }

    getBaseClasses() {
        return 'datepicker-control px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors';
    }

    attachEvents() {
        this.element.addEventListener('change', (e) => {
            this.setState({ selectedDate: e.target.value });
            this.emit('dateChange', { date: e.target.value, UID: this.UID });
            this.logEvent('date-change', `Date ${this.UID} changed to: ${e.target.value}`);
        });
    }
}

/**
 * Toggle Control - Switch/toggle button
 * 
 * Modern toggle switch with smooth animations.
 * Emits 'toggle' event when state changes.
 * 
 * @class ToggleControl
 * @extends Control
 * @example
 * {
 *   type: 'toggle',
 *   UID: 'tax-exempt',
 *   text: 'Tax Exempt Customer',
 *   props: { checked: false }
 * }
 */
export class ToggleControl extends Control {
    constructor(definition) {
        super(definition);
        this.checked = this.props.checked || false;
    }

    createElement() {
        const wrapper = document.createElement('div');
        wrapper.id = this.UID;
        wrapper.className = 'toggle-control flex items-center space-x-2';
        wrapper.setAttribute('data-testid', `toggle-${this.UID}`);
        
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.className = 'sr-only';
        input.checked = this.checked;
        
        const label = document.createElement('label');
        label.className = 'relative inline-flex items-center cursor-pointer';
        
        const track = document.createElement('div');
        track.className = `w-11 h-6 bg-muted rounded-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${this.checked ? 'bg-primary' : ''}`;
        
        label.appendChild(input);
        label.appendChild(track);
        
        if (this.text) {
            const textLabel = document.createElement('span');
            textLabel.className = 'ml-2 text-sm';
            textLabel.textContent = window.ContextRenderer.render(this.text);
            wrapper.appendChild(textLabel);
        }
        
        wrapper.appendChild(label);
        
        // Store reference for event handling
        this.inputElement = input;
        
        return wrapper;
    }

    attachEvents() {
        this.inputElement.addEventListener('change', (e) => {
            this.checked = e.target.checked;
            this.setState({ checked: this.checked });
            this.emit('toggle', { checked: this.checked, UID: this.UID });
            this.logEvent('toggle', `Toggle ${this.UID} ${this.checked ? 'enabled' : 'disabled'}`);
            
            // Update visual state
            const track = this.element.querySelector('div div');
            track.classList.toggle('bg-primary', this.checked);
            track.classList.toggle('bg-muted', !this.checked);
        });
    }
}

// Register input controls
if (typeof window !== 'undefined') {
    window.TextBoxControl = TextBoxControl;
    window.NumericInputControl = NumericInputControl;
    window.PasswordControl = PasswordControl;
    window.BarcodeInputControl = BarcodeInputControl;
    window.DropdownControl = DropdownControl;
    window.DatePickerControl = DatePickerControl;
    window.ToggleControl = ToggleControl;
}

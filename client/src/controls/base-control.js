/**
 * Base Control Class - Foundation for all POS controls
 * 
 * This is the base class that all POS controls extend from. It provides:
 * - Unique identification (UID) for each control instance
 * - Property and state management with reactive updates
 * - Event system for inter-control communication
 * - DOM rendering and lifecycle management
 * - Child control management and hierarchical structure
 * - Designer mode support for development/debugging
 * 
 * @class Control
 * @example
 * const control = new Control({
 *   UID: 'my-control',
 *   type: 'custom',
 *   props: { variant: 'primary' },
 *   state: { active: false },
 *   style: { padding: '10px' },
 *   children: []
 * });
 */
export class Control {
    /**
     * Creates a new Control instance
     * @param {Object} definition - Control configuration object
     * @param {string} [definition.UID] - Unique identifier (auto-generated if not provided)
     * @param {string} definition.type - Control type (button, input, panel, etc.)
     * @param {Object} [definition.props={}] - Control-specific properties
     * @param {Object} [definition.state={}] - Initial state object
     * @param {Array} [definition.children=[]] - Child control definitions
     * @param {Object} [definition.style={}] - CSS styling properties
     * @param {string} [definition.text=''] - Display text for the control
     * @param {string} [definition.placeholder=''] - Placeholder text for inputs
     * @param {string} [definition.title=''] - Title/header text
     * @param {string} [definition.value=''] - Initial value
     * @param {boolean} [definition.disabled=false] - Disabled state
     * @param {boolean} [definition.visible=true] - Visibility state
     */
    constructor(definition) {
        // Use DOM utilities for UID generation if available
        this.UID = definition.UID || (window.DomUtilities ? 
            window.DomUtilities.getUID('control') : 
            `control-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
        
        this.type = definition.type;
        this.props = definition.props || {};
        this.state = definition.state || {};
        this.children = definition.children || [];
        this.style = definition.style || {};
        this.text = definition.text || '';
        this.placeholder = definition.placeholder || '';
        this.title = definition.title || '';
        this.value = definition.value || '';
        this.disabled = definition.disabled || false;
        this.visible = definition.visible !== false;
        this.element = null;
        this.parent = null;
        this.childControls = [];
        
        // Event system
        this.eventListeners = {};
        
        // Validation metadata
        this.validationResult = null;
        
        // Bind methods to maintain context
        this.render = this.render.bind(this);
        this.setState = this.setState.bind(this);
        this.emit = this.emit.bind(this);
        this.on = this.on.bind(this);
        this.validate = this.validate.bind(this);
    }

    /**
     * Renders the control and its children into the DOM
     * @returns {HTMLElement} The rendered DOM element
     */
    render() {
        this.element = this.createElement();
        this.applyStyles();
        this.attachEvents();
        this.renderChildren();
        
        if (window.designerMode) {
            this.addDesignerAnnotations();
        }
        
        this.logEvent('render', `Control ${this.UID} (${this.type}) rendered`);
        return this.element;
    }

    createElement() {
        // Use DOM utilities if available
        if (window.DomUtilities) {
            const element = window.DomUtilities.createElement('div', {
                id: this.UID,
                'data-testid': `control-${this.type}-${this.UID}`,
                'data-control-type': this.type
            }, this.getBaseClasses());
            
            if (!this.visible) {
                element.style.display = 'none';
            }
            
            if (this.disabled) {
                element.setAttribute('disabled', 'true');
                element.classList.add('opacity-50', 'pointer-events-none');
            }
            
            return element;
        }
        
        // Fallback to original implementation
        const element = document.createElement('div');
        element.id = this.UID;
        element.className = this.getBaseClasses();
        element.setAttribute('data-testid', `control-${this.type}-${this.UID}`);
        element.setAttribute('data-control-type', this.type);
        
        if (!this.visible) {
            element.style.display = 'none';
        }
        
        if (this.disabled) {
            element.setAttribute('disabled', 'true');
            element.classList.add('opacity-50', 'pointer-events-none');
        }
        
        return element;
    }

    getBaseClasses() {
        return 'control-base';
    }

    applyStyles() {
        if (!this.style) return;
        
        // Use DOM utilities if available
        if (window.DomUtilities) {
            const styles = {};
            Object.keys(this.style).forEach(key => {
                // Skip grid-specific properties that are handled separately
                if (['rows', 'columns', 'gap'].includes(key)) return;
                
                // Convert camelCase to kebab-case for CSS properties
                const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
                styles[cssKey] = this.style[key];
            });
            
            window.DomUtilities.setStyles(this.element, styles);
        } else {
            // Fallback to original implementation
            Object.keys(this.style).forEach(key => {
                // Skip grid-specific properties that are handled separately
                if (['rows', 'columns', 'gap'].includes(key)) return;
                
                // Convert camelCase to kebab-case for CSS properties
                const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
                this.element.style.setProperty(cssKey, this.style[key]);
            });
        }
    }

    attachEvents() {
        // Store control reference in data manager
        if (window.DataManager) {
            window.DataManager.set(this.element, 'control', this);
        }
        
        // Base event handling - to be overridden by subclasses
    }

    renderChildren() {
        this.children.forEach(childDef => {
            const childControl = window.ControlFactory.create(childDef);
            childControl.parent = this;
            this.childControls.push(childControl);
            const childElement = childControl.render();
            this.element.appendChild(childElement);
        });
    }

    addDesignerAnnotations() {
        this.element.classList.add('designer-outline');
        const tooltip = document.createElement('div');
        tooltip.className = 'designer-tooltip';
        tooltip.textContent = `${this.type} | ${this.UID}`;
        this.element.appendChild(tooltip);
    }

    /**
     * Updates the control's state and triggers reactive updates
     * @param {Object} newState - State properties to update
     * @example
     * control.setState({ active: true, count: 5 });
     */
    setState(newState) {
        const oldState = { ...this.state };
        this.state = { ...this.state, ...newState };
        
        this.logEvent('state-change', `State updated for ${this.UID}: ${JSON.stringify(newState)}`);
        window.StateManager.notifyStateChange(this.UID, this.state, oldState);
        
        // Trigger re-render if needed
        this.onStateChange(newState, oldState);
    }

    onStateChange(newState, oldState) {
        // Override in subclasses to handle state changes
    }

    /**
     * Subscribes to control events
     * @param {string} event - Event name to listen for
     * @param {Function} callback - Event handler function
     * @example
     * control.on('click', (data) => console.log('Clicked!', data));
     */
    on(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }

    off(event, callback) {
        if (this.eventListeners[event]) {
            const index = this.eventListeners[event].indexOf(callback);
            if (index > -1) {
                this.eventListeners[event].splice(index, 1);
            }
        }
    }

    /**
     * Emits an event to all listeners and bubbles to parent
     * @param {string} event - Event name
     * @param {Object} data - Event data
     * @example
     * control.emit('valueChanged', { value: 'new value', UID: control.UID });
     */
    emit(event, data) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    this.logEvent('error', `Error in event handler for ${event}: ${error.message}`);
                }
            });
        }
        
        // Bubble event to parent
        if (this.parent) {
            this.parent.emit(event, { ...data, source: this.UID });
        }
    }

    logEvent(type, message) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
        const logContainer = document.getElementById('event-log');
        
        if (logContainer) {
            const logElement = document.createElement('div');
            logElement.textContent = logEntry;
            logElement.className = type === 'error' ? 'text-red-500' : 'text-gray-600';
            logContainer.appendChild(logElement);
            logContainer.scrollTop = logContainer.scrollHeight;
        }
        
        console.log(logEntry);
    }

    /**
     * Validate control value and properties
     * @param {string} property - Property to validate
     * @param {*} value - Value to validate
     * @returns {Object} Validation result
     */
    validate(property = null, value = null) {
        if (!window.Validation) {
            return { isValid: true, error: null, sanitizedValue: value };
        }

        if (property && value !== null) {
            // Validate specific property
            return window.Validation.validateRuntimeValue(this.type, property, value);
        }

        // Validate entire control definition
        const definition = {
            type: this.type,
            UID: this.UID,
            props: this.props,
            state: this.state,
            style: this.style,
            text: this.text,
            placeholder: this.placeholder,
            title: this.title,
            value: this.value,
            disabled: this.disabled,
            visible: this.visible,
            children: this.children
        };

        this.validationResult = window.Validation.validateControlDefinition(definition);
        return this.validationResult;
    }

    /**
     * Set value with validation
     * @param {*} newValue - New value to set
     * @returns {boolean} Success status
     */
    setValue(newValue) {
        const validation = this.validate('value', newValue);
        
        if (!validation.isValid) {
            console.warn(`Invalid value for ${this.UID}:`, validation.error);
            return false;
        }

        const oldValue = this.value;
        this.value = validation.sanitizedValue;
        
        // Update DOM if element exists
        if (this.element) {
            this.updateValueInDOM();
        }

        // Emit change event
        this.emit('valueChange', { oldValue, newValue: this.value });
        
        return true;
    }

    /**
     * Update value in DOM - to be overridden by subclasses
     */
    updateValueInDOM() {
        // Base implementation - subclasses should override
        if (this.element.value !== undefined) {
            this.element.value = this.value;
        }
    }

    /**
     * Check if control is valid
     * @returns {boolean} Validation status
     */
    isValid() {
        const validation = this.validate();
        return validation.isValid;
    }

    /**
     * Get validation errors
     * @returns {Array} Array of validation errors
     */
    getValidationErrors() {
        const validation = this.validate();
        return validation.errors || [];
    }

    destroy() {
        // Clean up event listeners using EventHandler if available
        if (window.EventHandler) {
            window.EventHandler.cleanupElement(this.element);
        } else {
            // Fallback cleanup
            Object.keys(this.eventListeners).forEach(eventType => {
                this.eventListeners[eventType].forEach(listener => {
                    this.element.removeEventListener(eventType, listener);
                });
            });
        }
        
        // Clean up data manager references
        if (window.DataManager) {
            window.DataManager.clearElement(this.element);
        }
        
        // Clean up child controls
        this.childControls.forEach(child => {
            if (child.destroy) {
                child.destroy();
            }
        });
        
        // Remove from DOM
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        
        this.eventListeners = {};
        this.logEvent('destroy', `Control ${this.UID} destroyed`);
    }

    findChild(UID) {
        for (const child of this.childControls) {
            if (child.UID === UID) {
                return child;
            }
            const nested = child.findChild(UID);
            if (nested) {
                return nested;
            }
        }
        return null;
    }

    getAttribute(name) {
        return this.element ? this.element.getAttribute(name) : null;
    }

    setAttribute(name, value) {
        if (this.element) {
            this.element.setAttribute(name, value);
        }
    }

    addClass(className) {
        if (this.element) {
            this.element.classList.add(className);
        }
    }

    removeClass(className) {
        if (this.element) {
            this.element.classList.remove(className);
        }
    }

    show() {
        this.visible = true;
        if (this.element) {
            this.element.style.display = '';
        }
    }

    hide() {
        this.visible = false;
        if (this.element) {
            this.element.style.display = 'none';
        }
    }

    enable() {
        this.disabled = false;
        if (this.element) {
            this.element.removeAttribute('disabled');
            this.element.classList.remove('opacity-50', 'pointer-events-none');
        }
    }

    disable() {
        this.disabled = true;
        if (this.element) {
            this.element.setAttribute('disabled', 'true');
            this.element.classList.add('opacity-50', 'pointer-events-none');
        }
    }
}

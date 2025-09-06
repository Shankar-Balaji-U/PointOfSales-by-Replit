/**
 * Context Renderer - Handles placeholder replacement and dynamic content rendering
 * 
 * Processes text with placeholder variables and replaces them with actual values.
 * Supports multiple placeholder syntaxes: #{var}, ${var}, {{var}}
 * Includes caching, expression evaluation, and helper functions.
 * 
 * @class ContextRenderer
 * @example
 * // Set context
 * ContextRenderer.updateContext({ UserName: 'John', Total: 25.99 });
 * 
 * // Render text with placeholders
 * const result = ContextRenderer.render('Hello #{UserName}, your total is #{Total}');
 * // Result: "Hello John, your total is 25.99"
 * 
 * // Watch for context changes
 * ContextRenderer.watch(['UserName'], (changedKeys, context) => {
 *   console.log('User name changed:', context.UserName);
 * });
 */
export class ContextRenderer {
    static context = {
        UserName: 'John Doe',
        UserID: 'U001',
        AppVersion: '2.1.0',
        CurrentDate: new Date().toLocaleDateString(),
        CurrentTime: new Date().toLocaleTimeString(),
        StoreName: 'ABC Store',
        StoreID: 'STR001',
        TerminalID: 'T001'
    };

    static watchers = new Map();
    static renderCache = new Map();
    static cacheEnabled = true;
    static maxCacheSize = 1000;

    /**
     * Renders text by replacing placeholder variables with context values
     * @param {string} text - Text containing placeholders
     * @param {Object} [customContext={}] - Additional context values
     * @returns {string} Rendered text with placeholders replaced
     */
    static render(text, customContext = {}) {
        if (typeof text !== 'string') {
            return text;
        }

        // Create cache key
        const cacheKey = this.createCacheKey(text, customContext);
        
        // Check cache first
        if (this.cacheEnabled && this.renderCache.has(cacheKey)) {
            return this.renderCache.get(cacheKey);
        }

        // Merge contexts
        const mergedContext = { ...this.context, ...customContext };
        
        // Replace placeholders
        let rendered = text;
        
        // Handle #{variable} syntax
        rendered = rendered.replace(/#{(\w+)}/g, (match, key) => {
            if (mergedContext.hasOwnProperty(key)) {
                return this.formatValue(mergedContext[key]);
            }
            console.warn(`ContextRenderer: Unknown context variable: ${key}`);
            return match;
        });

        // Handle ${variable} syntax (alternative)
        rendered = rendered.replace(/\${(\w+)}/g, (match, key) => {
            if (mergedContext.hasOwnProperty(key)) {
                return this.formatValue(mergedContext[key]);
            }
            console.warn(`ContextRenderer: Unknown context variable: ${key}`);
            return match;
        });

        // Handle {{variable}} syntax (another alternative)
        rendered = rendered.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            if (mergedContext.hasOwnProperty(key)) {
                return this.formatValue(mergedContext[key]);
            }
            console.warn(`ContextRenderer: Unknown context variable: ${key}`);
            return match;
        });

        // Handle expressions #{expression}
        rendered = rendered.replace(/#{(.+?)}/g, (match, expression) => {
            try {
                // Simple expression evaluation for basic operations
                const result = this.evaluateExpression(expression, mergedContext);
                return this.formatValue(result);
            } catch (error) {
                console.warn(`ContextRenderer: Error evaluating expression "${expression}":`, error);
                return match;
            }
        });

        // Cache the result
        if (this.cacheEnabled) {
            this.addToCache(cacheKey, rendered);
        }

        return rendered;
    }

    static formatValue(value) {
        if (value === null || value === undefined) {
            return '';
        }
        
        if (typeof value === 'number') {
            // Format numbers with appropriate precision
            if (Number.isInteger(value)) {
                return value.toString();
            } else {
                return value.toFixed(2);
            }
        }
        
        if (typeof value === 'boolean') {
            return value ? 'Yes' : 'No';
        }
        
        if (value instanceof Date) {
            return value.toLocaleDateString();
        }
        
        return String(value);
    }

    static evaluateExpression(expression, context) {
        // Simple expression evaluator for basic math and context variables
        // WARNING: This is a simplified evaluator. In production, use a proper expression parser
        
        // Replace context variables in the expression
        let evalExpression = expression;
        Object.keys(context).forEach(key => {
            const regex = new RegExp(`\\b${key}\\b`, 'g');
            evalExpression = evalExpression.replace(regex, JSON.stringify(context[key]));
        });

        // Only allow safe mathematical operations
        const safeExpression = /^[\d\s+\-*/.()]+$/;
        if (safeExpression.test(evalExpression)) {
            try {
                return Function(`"use strict"; return (${evalExpression})`)();
            } catch (error) {
                throw new Error(`Invalid expression: ${expression}`);
            }
        } else {
            throw new Error(`Unsafe expression: ${expression}`);
        }
    }

    /**
     * Updates multiple context values at once
     * @param {Object} updates - Object with key-value pairs to update
     */
    static updateContext(updates) {
        if (typeof updates !== 'object' || updates === null) {
            console.error('ContextRenderer: Updates must be an object');
            return;
        }

        const changedKeys = [];
        Object.keys(updates).forEach(key => {
            if (this.context[key] !== updates[key]) {
                this.context[key] = updates[key];
                changedKeys.push(key);
            }
        });

        if (changedKeys.length > 0) {
            // Clear relevant cache entries
            this.invalidateCache(changedKeys);
            
            // Notify watchers
            this.notifyWatchers(changedKeys);
            
            // Update context display in UI
            this.updateContextDisplay();
            
            console.log('ContextRenderer: Context updated', changedKeys);
        }
    }

    static setContext(key, value) {
        const oldValue = this.context[key];
        this.context[key] = value;
        
        if (oldValue !== value) {
            this.invalidateCache([key]);
            this.notifyWatchers([key]);
            this.updateContextDisplay();
            
            console.log(`ContextRenderer: ${key} changed from ${oldValue} to ${value}`);
        }
    }

    static getContext(key) {
        return this.context[key];
    }

    static getAllContext() {
        return { ...this.context };
    }

    static clearContext() {
        const oldContext = { ...this.context };
        this.context = {};
        this.clearCache();
        this.notifyWatchers(Object.keys(oldContext));
        this.updateContextDisplay();
        
        console.log('ContextRenderer: Context cleared');
    }

    /**
     * Watches for changes to specific context keys
     * @param {string|string[]} keys - Key or array of keys to watch
     * @param {Function} callback - Callback function (changedKeys, context)
     * @returns {Function} Unwatch function
     */
    static watch(keys, callback) {
        if (typeof callback !== 'function') {
            console.error('ContextRenderer: Callback must be a function');
            return null;
        }

        const keyArray = Array.isArray(keys) ? keys : [keys];
        const watcherId = `watcher-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        this.watchers.set(watcherId, {
            keys: keyArray,
            callback
        });

        // Return unwatch function
        return () => {
            this.watchers.delete(watcherId);
        };
    }

    static notifyWatchers(changedKeys) {
        this.watchers.forEach((watcher, watcherId) => {
            const hasMatchingKey = watcher.keys.some(key => changedKeys.includes(key));
            if (hasMatchingKey) {
                try {
                    watcher.callback(changedKeys, this.context);
                } catch (error) {
                    console.error(`ContextRenderer: Error in watcher ${watcherId}:`, error);
                }
            }
        });
    }

    static createCacheKey(text, customContext) {
        const contextHash = this.hashObject(customContext);
        return `${text}|${contextHash}`;
    }

    static hashObject(obj) {
        return JSON.stringify(obj, Object.keys(obj).sort());
    }

    static addToCache(key, value) {
        if (this.renderCache.size >= this.maxCacheSize) {
            // Remove oldest entries (simple LRU-like behavior)
            const firstKey = this.renderCache.keys().next().value;
            this.renderCache.delete(firstKey);
        }
        
        this.renderCache.set(key, value);
    }

    static invalidateCache(changedKeys = []) {
        if (changedKeys.length === 0) {
            this.clearCache();
            return;
        }

        // Remove cache entries that might be affected by the changed keys
        const keysToDelete = [];
        this.renderCache.forEach((value, cacheKey) => {
            const [text] = cacheKey.split('|');
            const affectedByChange = changedKeys.some(key => {
                return text.includes(`#{${key}}`) || 
                       text.includes(`\${${key}}`) || 
                       text.includes(`{{${key}}}`);
            });
            
            if (affectedByChange) {
                keysToDelete.push(cacheKey);
            }
        });

        keysToDelete.forEach(key => this.renderCache.delete(key));
        
        console.log(`ContextRenderer: Invalidated ${keysToDelete.length} cache entries`);
    }

    static clearCache() {
        this.renderCache.clear();
        console.log('ContextRenderer: Cache cleared');
    }

    static setCacheEnabled(enabled) {
        this.cacheEnabled = enabled;
        if (!enabled) {
            this.clearCache();
        }
        console.log(`ContextRenderer: Cache ${enabled ? 'enabled' : 'disabled'}`);
    }

    static getCacheStats() {
        return {
            size: this.renderCache.size,
            maxSize: this.maxCacheSize,
            enabled: this.cacheEnabled
        };
    }

    static updateContextDisplay() {
        // Update the context display in the UI
        const contextElements = {
            'context-username': 'UserName',
            'context-userid': 'UserID',
            'context-appversion': 'AppVersion',
            'context-currentdate': 'CurrentDate'
        };

        Object.keys(contextElements).forEach(elementId => {
            const element = document.getElementById(elementId);
            const contextKey = contextElements[elementId];
            
            if (element && this.context[contextKey] !== undefined) {
                element.textContent = this.formatValue(this.context[contextKey]);
            }
        });
    }

    static renderTemplate(template, context = {}) {
        if (typeof template === 'string') {
            return this.render(template, context);
        }
        
        if (typeof template === 'object' && template !== null) {
            const rendered = {};
            Object.keys(template).forEach(key => {
                rendered[key] = this.renderTemplate(template[key], context);
            });
            return rendered;
        }
        
        if (Array.isArray(template)) {
            return template.map(item => this.renderTemplate(item, context));
        }
        
        return template;
    }

    static registerHelper(name, helperFunction) {
        if (typeof helperFunction !== 'function') {
            console.error('ContextRenderer: Helper must be a function');
            return false;
        }
        
        if (!this.helpers) {
            this.helpers = {};
        }
        
        this.helpers[name] = helperFunction;
        console.log(`ContextRenderer: Helper '${name}' registered`);
        return true;
    }

    static callHelper(name, ...args) {
        if (this.helpers && this.helpers[name]) {
            try {
                return this.helpers[name](...args);
            } catch (error) {
                console.error(`ContextRenderer: Error calling helper '${name}':`, error);
                return '';
            }
        }
        
        console.warn(`ContextRenderer: Unknown helper: ${name}`);
        return '';
    }

    static initializeDefaultHelpers() {
        this.registerHelper('formatCurrency', (amount) => {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(amount);
        });

        this.registerHelper('formatDate', (date, format = 'short') => {
            const d = new Date(date);
            switch (format) {
                case 'long':
                    return d.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    });
                case 'time':
                    return d.toLocaleTimeString();
                default:
                    return d.toLocaleDateString();
            }
        });

        this.registerHelper('uppercase', (text) => {
            return String(text).toUpperCase();
        });

        this.registerHelper('lowercase', (text) => {
            return String(text).toLowerCase();
        });
    }
}

// Initialize default helpers
ContextRenderer.initializeDefaultHelpers();

// Make ContextRenderer globally available
if (typeof window !== 'undefined') {
    window.ContextRenderer = ContextRenderer;
    
    // Update context with current date/time periodically
    setInterval(() => {
        ContextRenderer.updateContext({
            CurrentDate: new Date().toLocaleDateString(),
            CurrentTime: new Date().toLocaleTimeString()
        });
    }, 1000);
}

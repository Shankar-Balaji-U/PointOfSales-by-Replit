/**
 * DOM Utilities - Bootstrap-inspired DOM manipulation and validation utilities
 * 
 * Provides robust DOM utilities similar to Bootstrap's implementation including:
 * - Element validation and type checking
 * - Safe element selection and manipulation
 * - Transition and animation utilities
 * - CSS property parsing and manipulation
 * 
 * @class DomUtilities
 */
export class DomUtilities {
    static MAX_UID = 1000000;
    static MILLISECONDS_MULTIPLIER = 1000;
    static TRANSITION_END = 'transitionend';

    /**
     * Properly escape CSS selectors to handle special characters
     * @param {string} selector - CSS selector to escape
     * @returns {string} Escaped selector
     */
    static parseSelector(selector) {
        if (!selector || typeof selector !== 'string') {
            return selector;
        }

        if (selector && window.CSS && window.CSS.escape) {
            // Handle IDs containing special characters
            selector = selector.replace(/#([^\s"#']+)/g, (match, id) => `#${CSS.escape(id)}`);
        }
        return selector;
    }

    /**
     * Get accurate type of an object (similar to Bootstrap's toType)
     * @param {*} object - Object to get type of
     * @returns {string} Type string
     */
    static getType(object) {
        if (object === null || object === undefined) {
            return `${object}`;
        }
        return Object.prototype.toString.call(object).match(/\s([a-z]+)/i)[1].toLowerCase();
    }

    /**
     * Generate unique ID with prefix
     * @param {string} prefix - Prefix for the ID
     * @returns {string} Unique ID
     */
    static getUID(prefix = 'pos-control') {
        do {
            prefix += Math.floor(Math.random() * this.MAX_UID);
        } while (document.getElementById(prefix));
        return prefix;
    }

    /**
     * Check if object is a DOM element
     * @param {*} object - Object to check
     * @returns {boolean} True if element
     */
    static isElement(object) {
        if (!object || typeof object !== 'object') {
            return false;
        }

        // Handle jQuery objects
        if (typeof object.jquery !== 'undefined') {
            object = object[0];
        }

        return typeof object.nodeType !== 'undefined';
    }

    /**
     * Get DOM element from various input types
     * @param {string|Element|jQuery} object - Element selector, element, or jQuery object
     * @returns {Element|null} DOM element or null
     */
    static getElement(object) {
        // Already a DOM element
        if (this.isElement(object)) {
            return object.jquery ? object[0] : object;
        }

        // String selector
        if (typeof object === 'string' && object.length > 0) {
            try {
                return document.querySelector(this.parseSelector(object));
            } catch (error) {
                console.warn(`Invalid selector: ${object}`, error);
                return null;
            }
        }

        return null;
    }

    /**
     * Check if element is visible
     * @param {Element} element - Element to check
     * @returns {boolean} True if visible
     */
    static isVisible(element) {
        if (!this.isElement(element) || element.getClientRects().length === 0) {
            return false;
        }

        const elementIsVisible = getComputedStyle(element).getPropertyValue('visibility') === 'visible';
        
        // Handle details element
        const closedDetails = element.closest('details:not([open])');
        if (!closedDetails) {
            return elementIsVisible;
        }

        if (closedDetails !== element) {
            const summary = element.closest('summary');
            if (summary && summary.parentNode !== closedDetails) {
                return false;
            }
            if (summary === null) {
                return false;
            }
        }

        return elementIsVisible;
    }

    /**
     * Check if element is disabled
     * @param {Element} element - Element to check
     * @returns {boolean} True if disabled
     */
    static isDisabled(element) {
        if (!element || element.nodeType !== Node.ELEMENT_NODE) {
            return true;
        }

        if (element.classList.contains('disabled')) {
            return true;
        }

        if (typeof element.disabled !== 'undefined') {
            return element.disabled;
        }

        return element.hasAttribute('disabled') && element.getAttribute('disabled') !== 'false';
    }

    /**
     * Get transition duration from element
     * @param {Element} element - Element to check
     * @returns {number} Transition duration in milliseconds
     */
    static getTransitionDurationFromElement(element) {
        if (!element) {
            return 0;
        }

        let { transitionDuration, transitionDelay } = window.getComputedStyle(element);
        const floatTransitionDuration = Number.parseFloat(transitionDuration);
        const floatTransitionDelay = Number.parseFloat(transitionDelay);

        if (!floatTransitionDuration && !floatTransitionDelay) {
            return 0;
        }

        // If multiple durations, take the first
        transitionDuration = transitionDuration.split(',')[0];
        transitionDelay = transitionDelay.split(',')[0];

        return (Number.parseFloat(transitionDuration) + Number.parseFloat(transitionDelay)) * this.MILLISECONDS_MULTIPLIER;
    }

    /**
     * Trigger transition end event
     * @param {Element} element - Element to trigger event on
     */
    static triggerTransitionEnd(element) {
        element.dispatchEvent(new Event(this.TRANSITION_END));
    }

    /**
     * Execute callback after transition
     * @param {Function} callback - Callback to execute
     * @param {Element} transitionElement - Element with transition
     * @param {boolean} waitForTransition - Whether to wait for transition
     */
    static executeAfterTransition(callback, transitionElement, waitForTransition = true) {
        if (!waitForTransition) {
            this.execute(callback);
            return;
        }

        const durationPadding = 5;
        const emulatedDuration = this.getTransitionDurationFromElement(transitionElement) + durationPadding;
        let called = false;

        const handler = ({ target }) => {
            if (target !== transitionElement) {
                return;
            }
            called = true;
            transitionElement.removeEventListener(this.TRANSITION_END, handler);
            this.execute(callback);
        };

        transitionElement.addEventListener(this.TRANSITION_END, handler);
        setTimeout(() => {
            if (!called) {
                this.triggerTransitionEnd(transitionElement);
            }
        }, emulatedDuration);
    }

    /**
     * Execute function safely
     * @param {Function|*} possibleCallback - Function to execute or fallback value
     * @param {Array} args - Arguments to pass
     * @param {*} defaultValue - Default value if not a function
     * @returns {*} Result of execution
     */
    static execute(possibleCallback, args = [], defaultValue = possibleCallback) {
        return typeof possibleCallback === 'function' ? possibleCallback.call(...args) : defaultValue;
    }

    /**
     * Force element reflow (restart animations)
     * @param {Element} element - Element to reflow
     */
    static reflow(element) {
        if (this.isElement(element)) {
            element.offsetHeight; // eslint-disable-line no-unused-expressions
        }
    }

    /**
     * Find shadow root of element
     * @param {Element} element - Element to check
     * @returns {ShadowRoot|null} Shadow root or null
     */
    static findShadowRoot(element) {
        if (!document.documentElement.attachShadow) {
            return null;
        }

        if (typeof element.getRootNode === 'function') {
            const root = element.getRootNode();
            return root instanceof ShadowRoot ? root : null;
        }

        if (element instanceof ShadowRoot) {
            return element;
        }

        if (!element.parentNode) {
            return null;
        }

        return this.findShadowRoot(element.parentNode);
    }

    /**
     * Get next active element from a list
     * @param {Array} list - List of elements
     * @param {Element} activeElement - Currently active element
     * @param {boolean} shouldGetNext - Get next (true) or previous (false)
     * @param {boolean} isCycleAllowed - Allow cycling through list
     * @returns {Element} Next active element
     */
    static getNextActiveElement(list, activeElement, shouldGetNext, isCycleAllowed) {
        const listLength = list.length;
        let index = list.indexOf(activeElement);

        if (index === -1) {
            return !shouldGetNext && isCycleAllowed ? list[listLength - 1] : list[0];
        }

        index += shouldGetNext ? 1 : -1;

        if (isCycleAllowed) {
            index = (index + listLength) % listLength;
        }

        return list[Math.max(0, Math.min(index, listLength - 1))];
    }

    /**
     * Check if document is in RTL mode
     * @returns {boolean} True if RTL
     */
    static isRTL() {
        return document.documentElement.dir === 'rtl';
    }

    /**
     * No-operation function
     */
    static noop() {}

    /**
     * Create element with attributes and classes
     * @param {string} tagName - Tag name
     * @param {Object} attributes - Attributes to set
     * @param {Array|string} classes - Classes to add
     * @param {string} textContent - Text content
     * @returns {Element} Created element
     */
    static createElement(tagName, attributes = {}, classes = [], textContent = '') {
        const element = document.createElement(tagName);

        // Set attributes
        Object.entries(attributes).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                element.setAttribute(key, value);
            }
        });

        // Add classes
        if (typeof classes === 'string') {
            classes = classes.split(' ');
        }
        if (Array.isArray(classes)) {
            classes.forEach(className => {
                if (className) {
                    element.classList.add(className);
                }
            });
        }

        // Set text content
        if (textContent) {
            element.textContent = textContent;
        }

        return element;
    }

    /**
     * Get computed style property value
     * @param {Element} element - Element to get style from
     * @param {string} property - CSS property name
     * @returns {string} Property value
     */
    static getStyleProperty(element, property) {
        if (!this.isElement(element)) {
            return '';
        }
        return window.getComputedStyle(element).getPropertyValue(property);
    }

    /**
     * Set multiple CSS properties
     * @param {Element} element - Element to style
     * @param {Object} styles - Style properties
     */
    static setStyles(element, styles) {
        if (!this.isElement(element) || !styles) {
            return;
        }

        Object.entries(styles).forEach(([property, value]) => {
            element.style[property] = value;
        });
    }

    /**
     * Check if element matches selector
     * @param {Element} element - Element to check
     * @param {string} selector - CSS selector
     * @returns {boolean} True if matches
     */
    static matches(element, selector) {
        if (!this.isElement(element) || !selector) {
            return false;
        }

        try {
            return element.matches(this.parseSelector(selector));
        } catch (error) {
            console.warn(`Invalid selector for matching: ${selector}`, error);
            return false;
        }
    }

    /**
     * Get all elements matching selector within context
     * @param {string} selector - CSS selector
     * @param {Element} context - Context element (default: document)
     * @returns {NodeList} Matching elements
     */
    static findAll(selector, context = document) {
        if (!selector || typeof selector !== 'string') {
            return [];
        }

        const contextElement = this.getElement(context);
        if (!contextElement) {
            return [];
        }

        try {
            return contextElement.querySelectorAll(this.parseSelector(selector));
        } catch (error) {
            console.warn(`Invalid selector for findAll: ${selector}`, error);
            return [];
        }
    }
}
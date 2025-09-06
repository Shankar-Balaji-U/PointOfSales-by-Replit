/**
 * Data Manager - Bootstrap-inspired data management system
 * 
 * Provides a robust data management system similar to Bootstrap's Data utility
 * for storing and retrieving control instances and metadata.
 * 
 * @class DataManager
 */
export class DataManager {
    static elementMap = new Map();
    static globalData = new Map();

    /**
     * Set data for an element
     * @param {Element} element - DOM element
     * @param {string} key - Data key
     * @param {*} instance - Data instance
     */
    static set(element, key, instance) {
        if (!element || typeof key !== 'string') {
            console.warn('DataManager.set: Invalid element or key');
            return;
        }

        if (!this.elementMap.has(element)) {
            this.elementMap.set(element, new Map());
        }

        const instanceMap = this.elementMap.get(element);

        // Warn about multiple instances of the same type
        if (!instanceMap.has(key) && instanceMap.size !== 0) {
            const existingKeys = Array.from(instanceMap.keys());
            console.warn(`Multiple instances on element. Existing: ${existingKeys.join(', ')}, Adding: ${key}`);
        }

        instanceMap.set(key, instance);
    }

    /**
     * Get data for an element
     * @param {Element} element - DOM element
     * @param {string} key - Data key
     * @returns {*} Data instance or null
     */
    static get(element, key) {
        if (!element || typeof key !== 'string') {
            return null;
        }

        if (this.elementMap.has(element)) {
            return this.elementMap.get(element).get(key) || null;
        }

        return null;
    }

    /**
     * Remove data for an element
     * @param {Element} element - DOM element
     * @param {string} key - Data key
     */
    static remove(element, key) {
        if (!element || typeof key !== 'string') {
            return;
        }

        if (!this.elementMap.has(element)) {
            return;
        }

        const instanceMap = this.elementMap.get(element);
        instanceMap.delete(key);

        // Clean up element references if no instances left
        if (instanceMap.size === 0) {
            this.elementMap.delete(element);
        }
    }

    /**
     * Get all data keys for an element
     * @param {Element} element - DOM element
     * @returns {Array} Array of data keys
     */
    static getKeys(element) {
        if (!element) {
            return [];
        }

        if (this.elementMap.has(element)) {
            return Array.from(this.elementMap.get(element).keys());
        }

        return [];
    }

    /**
     * Get all data for an element
     * @param {Element} element - DOM element
     * @returns {Object} Object with all data
     */
    static getAll(element) {
        if (!element) {
            return {};
        }

        if (this.elementMap.has(element)) {
            const instanceMap = this.elementMap.get(element);
            const result = {};
            instanceMap.forEach((value, key) => {
                result[key] = value;
            });
            return result;
        }

        return {};
    }

    /**
     * Clear all data for an element
     * @param {Element} element - DOM element
     */
    static clearElement(element) {
        if (!element) {
            return;
        }

        if (this.elementMap.has(element)) {
            this.elementMap.delete(element);
        }
    }

    /**
     * Set global application data
     * @param {string} key - Data key
     * @param {*} value - Data value
     */
    static setGlobal(key, value) {
        if (typeof key !== 'string') {
            console.warn('DataManager.setGlobal: Key must be string');
            return;
        }

        this.globalData.set(key, value);
    }

    /**
     * Get global application data
     * @param {string} key - Data key
     * @returns {*} Data value or null
     */
    static getGlobal(key) {
        if (typeof key !== 'string') {
            return null;
        }

        return this.globalData.get(key) || null;
    }

    /**
     * Remove global application data
     * @param {string} key - Data key
     */
    static removeGlobal(key) {
        if (typeof key !== 'string') {
            return;
        }

        this.globalData.delete(key);
    }

    /**
     * Get all global data
     * @returns {Object} Object with all global data
     */
    static getAllGlobal() {
        const result = {};
        this.globalData.forEach((value, key) => {
            result[key] = value;
        });
        return result;
    }

    /**
     * Clear all global data
     */
    static clearGlobal() {
        this.globalData.clear();
    }

    /**
     * Get statistics about data usage
     * @returns {Object} Statistics object
     */
    static getStats() {
        const elementCount = this.elementMap.size;
        const globalCount = this.globalData.size;
        
        let totalInstances = 0;
        let maxInstancesPerElement = 0;
        
        this.elementMap.forEach(instanceMap => {
            const count = instanceMap.size;
            totalInstances += count;
            maxInstancesPerElement = Math.max(maxInstancesPerElement, count);
        });

        return {
            elementCount,
            globalCount,
            totalInstances,
            maxInstancesPerElement,
            averageInstancesPerElement: elementCount > 0 ? totalInstances / elementCount : 0
        };
    }

    /**
     * Clean up orphaned element references
     * Removes data for elements that are no longer in the DOM
     */
    static cleanup() {
        const orphanedElements = [];

        this.elementMap.forEach((instanceMap, element) => {
            if (!document.contains(element)) {
                orphanedElements.push(element);
            }
        });

        orphanedElements.forEach(element => {
            this.clearElement(element);
        });

        return orphanedElements.length;
    }

    /**
     * Find elements with specific data key
     * @param {string} key - Data key to search for
     * @returns {Array} Array of elements with the key
     */
    static findElementsWithKey(key) {
        const elements = [];

        this.elementMap.forEach((instanceMap, element) => {
            if (instanceMap.has(key)) {
                elements.push(element);
            }
        });

        return elements;
    }

    /**
     * Find elements with specific data value
     * @param {string} key - Data key
     * @param {*} value - Data value to match
     * @returns {Array} Array of matching elements
     */
    static findElementsWithValue(key, value) {
        const elements = [];

        this.elementMap.forEach((instanceMap, element) => {
            if (instanceMap.has(key) && instanceMap.get(key) === value) {
                elements.push(element);
            }
        });

        return elements;
    }

    /**
     * Copy data from one element to another
     * @param {Element} sourceElement - Source element
     * @param {Element} targetElement - Target element
     * @param {Array} keys - Specific keys to copy (optional)
     */
    static copyData(sourceElement, targetElement, keys = null) {
        if (!sourceElement || !targetElement) {
            return;
        }

        if (!this.elementMap.has(sourceElement)) {
            return;
        }

        const sourceMap = this.elementMap.get(sourceElement);
        const keysToCopy = keys || Array.from(sourceMap.keys());

        keysToCopy.forEach(key => {
            if (sourceMap.has(key)) {
                this.set(targetElement, key, sourceMap.get(key));
            }
        });
    }

    /**
     * Serialize data to JSON (for debugging/export)
     * @returns {Object} Serializable data object
     */
    static serialize() {
        const result = {
            global: this.getAllGlobal(),
            elements: []
        };

        this.elementMap.forEach((instanceMap, element) => {
            const elementData = {
                tagName: element.tagName,
                id: element.id,
                className: element.className,
                data: {}
            };

            instanceMap.forEach((value, key) => {
                try {
                    // Only serialize simple values
                    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                        elementData.data[key] = value;
                    } else if (value && typeof value.serialize === 'function') {
                        elementData.data[key] = value.serialize();
                    } else {
                        elementData.data[key] = '[Complex Object]';
                    }
                } catch (error) {
                    elementData.data[key] = '[Serialization Error]';
                }
            });

            result.elements.push(elementData);
        });

        return result;
    }
}
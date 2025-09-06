/**
 * Event Handler - Bootstrap-inspired event management system
 * 
 * Provides robust event handling with delegation, namespacing, and cleanup
 * similar to Bootstrap's event system.
 * 
 * @class EventHandler
 */
export class EventHandler {
    static namespaceRegex = /[^.]*(?=\..*)\.|.*/;
    static stripNameRegex = /\..*/;
    static stripUidRegex = /::\d+$/;
    static eventRegistry = {};
    static uidEvent = 1;
    
    static customEvents = {
        mouseenter: 'mouseover',
        mouseleave: 'mouseout'
    };

    static nativeEvents = new Set([
        'click', 'dblclick', 'mouseup', 'mousedown', 'contextmenu', 'mousewheel',
        'DOMMouseScroll', 'mouseover', 'mouseout', 'mousemove', 'selectstart',
        'selectend', 'keydown', 'keypress', 'keyup', 'orientationchange',
        'touchstart', 'touchmove', 'touchend', 'touchcancel', 'pointerdown',
        'pointermove', 'pointerup', 'pointerleave', 'pointercancel',
        'gesturestart', 'gesturechange', 'gestureend', 'focus', 'blur',
        'change', 'reset', 'select', 'submit', 'focusin', 'focusout',
        'load', 'unload', 'beforeunload', 'resize', 'move', 'DOMContentLoaded',
        'readystatechange', 'error', 'abort', 'scroll'
    ]);

    /**
     * Add event listener with optional delegation
     * @param {Element} element - Target element
     * @param {string} event - Event type
     * @param {string|Function} selector - CSS selector for delegation or handler function
     * @param {Function} handler - Event handler function
     * @param {boolean} oneOff - Remove listener after first execution
     */
    static on(element, event, selector, handler, oneOff = false) {
        if (typeof selector === 'function') {
            // No delegation
            handler = selector;
            selector = null;
        }

        if (!element || !event || !handler) {
            return;
        }

        const [originalTypeEvent, namespaceEvent] = this.normalizeEventType(event);
        const delegationHandler = selector ? 
            this.bootstrapDelegationHandler(element, selector, handler) :
            this.bootstrapHandler(element, handler);

        delegationHandler.oneOff = oneOff;
        delegationHandler.uidEvent = this.makeEventUid(element, originalTypeEvent);

        const events = this.getElementEvents(element);
        const eventKey = `${originalTypeEvent}${namespaceEvent}`;

        if (!events[eventKey]) {
            events[eventKey] = {};
        }

        if (!events[eventKey][selector || 'base']) {
            events[eventKey][selector || 'base'] = [];
        }

        events[eventKey][selector || 'base'].push(delegationHandler);

        // Add the actual event listener
        element.addEventListener(originalTypeEvent, delegationHandler, false);
    }

    /**
     * Remove event listener
     * @param {Element} element - Target element
     * @param {string} event - Event type
     * @param {string|Function} selector - CSS selector for delegation or handler function
     * @param {Function} handler - Event handler function
     */
    static off(element, event, selector, handler) {
        if (typeof selector === 'function') {
            handler = selector;
            selector = null;
        }

        if (!element) {
            return;
        }

        const events = this.getElementEvents(element);
        const isNamespaceEvent = event.includes('.');
        const [originalTypeEvent] = this.normalizeEventType(event);

        if (!Object.keys(events).length) {
            return;
        }

        // Remove all events if no specific event provided
        if (!event) {
            Object.keys(events).forEach(eventType => {
                this.off(element, eventType);
            });
            return;
        }

        const eventKeys = isNamespaceEvent ? 
            Object.keys(events).filter(key => key.includes(event.slice(1))) :
            [originalTypeEvent];

        eventKeys.forEach(eventKey => {
            const eventData = events[eventKey];
            if (!eventData) return;

            const selectorKey = selector || 'base';
            const handlers = eventData[selectorKey] || [];

            handlers.forEach(delegationHandler => {
                if (!handler || handler === delegationHandler) {
                    element.removeEventListener(originalTypeEvent, delegationHandler, false);
                }
            });

            // Clean up empty handlers
            if (!handler) {
                delete eventData[selectorKey];
            } else {
                eventData[selectorKey] = handlers.filter(h => h !== handler);
                if (eventData[selectorKey].length === 0) {
                    delete eventData[selectorKey];
                }
            }

            // Clean up empty event
            if (Object.keys(eventData).length === 0) {
                delete events[eventKey];
            }
        });

        // Clean up element if no events left
        if (Object.keys(events).length === 0) {
            delete this.eventRegistry[element.uidEvent];
        }
    }

    /**
     * Add one-time event listener
     * @param {Element} element - Target element
     * @param {string} event - Event type
     * @param {string|Function} selector - CSS selector for delegation or handler function
     * @param {Function} handler - Event handler function
     */
    static one(element, event, selector, handler) {
        this.on(element, event, selector, handler, true);
    }

    /**
     * Trigger event on element
     * @param {Element} element - Target element
     * @param {string} event - Event type
     * @param {Object} detail - Event detail data
     * @returns {Event} The dispatched event
     */
    static trigger(element, event, detail = {}) {
        if (!element || !event) {
            return null;
        }

        const [originalTypeEvent] = this.normalizeEventType(event);
        const eventObject = new CustomEvent(originalTypeEvent, {
            detail,
            bubbles: true,
            cancelable: true
        });

        element.dispatchEvent(eventObject);
        return eventObject;
    }

    /**
     * Private helper methods
     */
    static makeEventUid(element, uid) {
        return uid && `${uid}::${this.uidEvent++}` || element.uidEvent || this.uidEvent++;
    }

    static getElementEvents(element) {
        const uid = this.makeEventUid(element);
        element.uidEvent = uid;
        this.eventRegistry[uid] = this.eventRegistry[uid] || {};
        return this.eventRegistry[uid];
    }

    static bootstrapHandler(element, fn) {
        return function handler(event) {
            this.hydrateObj(event, { delegateTarget: element });
            
            if (handler.oneOff) {
                EventHandler.off(element, event.type, fn);
            }
            
            return fn.apply(element, [event]);
        }.bind(this);
    }

    static bootstrapDelegationHandler(element, selector, fn) {
        return function handler(event) {
            const domElements = element.querySelectorAll(selector);
            
            for (let { target } = event; target && target !== this; target = target.parentNode) {
                for (const domElement of domElements) {
                    if (domElement !== target) {
                        continue;
                    }
                    
                    this.hydrateObj(event, { delegateTarget: target });
                    
                    if (handler.oneOff) {
                        EventHandler.off(element, event.type, selector, fn);
                    }
                    
                    return fn.apply(target, [event]);
                }
            }
        }.bind(this);
    }

    static normalizeEventType(event) {
        const parts = event.split('.');
        const originalTypeEvent = parts[0];
        const namespaceEvent = parts.length > 1 ? `.${parts.slice(1).join('.')}` : '';
        
        return [this.customEvents[originalTypeEvent] || originalTypeEvent, namespaceEvent];
    }

    static hydrateObj(obj, meta) {
        Object.assign(obj, meta);
    }

    /**
     * Clean up all events for an element
     * @param {Element} element - Element to clean up
     */
    static cleanupElement(element) {
        if (!element || !element.uidEvent) {
            return;
        }

        this.off(element);
        delete this.eventRegistry[element.uidEvent];
        delete element.uidEvent;
    }

    /**
     * Get all registered events for debugging
     * @returns {Object} Event registry
     */
    static getRegistry() {
        return { ...this.eventRegistry };
    }

    /**
     * Get statistics about event usage
     * @returns {Object} Statistics
     */
    static getStats() {
        const elementCount = Object.keys(this.eventRegistry).length;
        let totalEvents = 0;
        let totalHandlers = 0;

        Object.values(this.eventRegistry).forEach(events => {
            const eventCount = Object.keys(events).length;
            totalEvents += eventCount;

            Object.values(events).forEach(eventData => {
                Object.values(eventData).forEach(handlers => {
                    totalHandlers += Array.isArray(handlers) ? handlers.length : 1;
                });
            });
        });

        return {
            elementCount,
            totalEvents,
            totalHandlers,
            averageEventsPerElement: elementCount > 0 ? totalEvents / elementCount : 0,
            averageHandlersPerEvent: totalEvents > 0 ? totalHandlers / totalEvents : 0
        };
    }

    /**
     * Clean up orphaned event listeners
     * Remove events for elements no longer in the DOM
     */
    static cleanup() {
        const orphanedUIDs = [];

        Object.keys(this.eventRegistry).forEach(uid => {
            const elements = document.querySelectorAll(`[data-uid="${uid}"]`);
            if (elements.length === 0) {
                orphanedUIDs.push(uid);
                delete this.eventRegistry[uid];
            }
        });

        return orphanedUIDs.length;
    }
}
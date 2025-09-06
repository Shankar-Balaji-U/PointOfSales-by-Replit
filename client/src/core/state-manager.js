/**
 * State Manager - Global state management with reactive updates
 * 
 * Centralized state management system with subscription-based updates.
 * Provides reactive state changes, history tracking, and snapshot functionality.
 * 
 * @class StateManager
 * @example
 * // Set state
 * StateManager.setState('userName', 'John Doe');
 * 
 * // Subscribe to changes
 * const unsubscribe = StateManager.subscribe('userName', (newValue, oldValue) => {
 *   console.log(`Name changed from ${oldValue} to ${newValue}`);
 * });
 * 
 * // Create computed values
 * const fullNameComputed = StateManager.computed(
 *   ['firstName', 'lastName'],
 *   (first, last) => `${first} ${last}`
 * );
 */
export class StateManager {
    static state = {};
    static listeners = new Map();
    static globalListeners = [];
    static history = [];
    static maxHistorySize = 50;

    /**
     * Sets a state value and notifies all subscribers
     * @param {string} key - State key
     * @param {*} value - State value
     */
    static setState(key, value) {
        const oldValue = this.state[key];
        this.state[key] = value;
        
        // Add to history
        this.addToHistory({
            type: 'setState',
            key,
            oldValue,
            newValue: value,
            timestamp: Date.now()
        });
        
        this.notifyStateChange(key, value, oldValue);
        this.notifyGlobalListeners({ type: 'setState', key, value, oldValue });
        
        console.log(`StateManager: ${key} changed from`, oldValue, 'to', value);
    }

    static getState(key) {
        return this.state[key];
    }

    static getAllState() {
        return { ...this.state };
    }

    /**
     * Subscribes to state changes for a specific key
     * @param {string} key - State key to watch
     * @param {Function} callback - Callback function (newValue, oldValue, key)
     * @returns {Function} Unsubscribe function
     */
    static subscribe(key, callback) {
        if (typeof callback !== 'function') {
            console.error('StateManager: Callback must be a function');
            return null;
        }

        if (!this.listeners.has(key)) {
            this.listeners.set(key, []);
        }
        
        this.listeners.get(key).push(callback);
        
        // Return unsubscribe function
        return () => {
            const callbacks = this.listeners.get(key);
            if (callbacks) {
                const index = callbacks.indexOf(callback);
                if (index > -1) {
                    callbacks.splice(index, 1);
                }
            }
        };
    }

    static subscribeGlobal(callback) {
        if (typeof callback !== 'function') {
            console.error('StateManager: Callback must be a function');
            return null;
        }

        this.globalListeners.push(callback);
        
        // Return unsubscribe function
        return () => {
            const index = this.globalListeners.indexOf(callback);
            if (index > -1) {
                this.globalListeners.splice(index, 1);
            }
        };
    }

    static notifyStateChange(key, value, oldValue) {
        const callbacks = this.listeners.get(key);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(value, oldValue, key);
                } catch (error) {
                    console.error('StateManager: Error in state listener:', error);
                }
            });
        }
    }

    static notifyGlobalListeners(eventData) {
        this.globalListeners.forEach(callback => {
            try {
                callback(eventData);
            } catch (error) {
                console.error('StateManager: Error in global listener:', error);
            }
        });
    }

    static removeState(key) {
        const oldValue = this.state[key];
        delete this.state[key];
        
        this.addToHistory({
            type: 'removeState',
            key,
            oldValue,
            timestamp: Date.now()
        });
        
        this.notifyStateChange(key, undefined, oldValue);
        this.notifyGlobalListeners({ type: 'removeState', key, oldValue });
        
        console.log(`StateManager: ${key} removed`);
    }

    static clearState() {
        const oldState = { ...this.state };
        this.state = {};
        
        this.addToHistory({
            type: 'clearState',
            oldState,
            timestamp: Date.now()
        });
        
        // Notify all listeners of cleared state
        Object.keys(oldState).forEach(key => {
            this.notifyStateChange(key, undefined, oldState[key]);
        });
        
        this.notifyGlobalListeners({ type: 'clearState', oldState });
        
        console.log('StateManager: All state cleared');
    }

    static updateState(updates) {
        if (typeof updates !== 'object' || updates === null) {
            console.error('StateManager: Updates must be an object');
            return;
        }

        const changes = [];
        Object.keys(updates).forEach(key => {
            const oldValue = this.state[key];
            const newValue = updates[key];
            
            if (oldValue !== newValue) {
                this.state[key] = newValue;
                changes.push({ key, oldValue, newValue });
            }
        });

        if (changes.length > 0) {
            this.addToHistory({
                type: 'updateState',
                changes,
                timestamp: Date.now()
            });

            // Notify listeners for each changed key
            changes.forEach(({ key, oldValue, newValue }) => {
                this.notifyStateChange(key, newValue, oldValue);
            });

            this.notifyGlobalListeners({ type: 'updateState', changes });
            
            console.log('StateManager: Batch update applied', changes);
        }
    }

    static addToHistory(entry) {
        this.history.push(entry);
        
        // Limit history size
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
    }

    static getHistory() {
        return [...this.history];
    }

    static clearHistory() {
        this.history = [];
        console.log('StateManager: History cleared');
    }

    static exportState() {
        return {
            state: this.getAllState(),
            timestamp: Date.now(),
            version: '1.0.0'
        };
    }

    static importState(exportedData) {
        if (!exportedData || typeof exportedData !== 'object') {
            console.error('StateManager: Invalid exported data');
            return false;
        }

        if (!exportedData.state) {
            console.error('StateManager: No state data in export');
            return false;
        }

        const oldState = this.getAllState();
        this.state = { ...exportedData.state };
        
        this.addToHistory({
            type: 'importState',
            oldState,
            newState: this.state,
            timestamp: Date.now()
        });

        // Notify all listeners of the new state
        Object.keys(this.state).forEach(key => {
            this.notifyStateChange(key, this.state[key], oldState[key]);
        });

        this.notifyGlobalListeners({ type: 'importState', oldState, newState: this.state });
        
        console.log('StateManager: State imported successfully');
        return true;
    }

    static createSnapshot() {
        return {
            state: { ...this.state },
            timestamp: Date.now(),
            id: `snapshot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };
    }

    static restoreSnapshot(snapshot) {
        if (!snapshot || !snapshot.state) {
            console.error('StateManager: Invalid snapshot');
            return false;
        }

        const oldState = this.getAllState();
        this.state = { ...snapshot.state };
        
        this.addToHistory({
            type: 'restoreSnapshot',
            snapshotId: snapshot.id,
            oldState,
            newState: this.state,
            timestamp: Date.now()
        });

        // Notify all listeners
        const allKeys = new Set([...Object.keys(oldState), ...Object.keys(this.state)]);
        allKeys.forEach(key => {
            this.notifyStateChange(key, this.state[key], oldState[key]);
        });

        this.notifyGlobalListeners({ type: 'restoreSnapshot', snapshot, oldState, newState: this.state });
        
        console.log('StateManager: Snapshot restored', snapshot.id);
        return true;
    }

    static debugInfo() {
        return {
            stateSize: Object.keys(this.state).length,
            listenerCount: Array.from(this.listeners.values()).reduce((sum, arr) => sum + arr.length, 0),
            globalListenerCount: this.globalListeners.length,
            historySize: this.history.length,
            currentState: this.getAllState()
        };
    }

    static hasKey(key) {
        return this.state.hasOwnProperty(key);
    }

    static getKeys() {
        return Object.keys(this.state);
    }

    static watch(key, callback, immediate = false) {
        const unsubscribe = this.subscribe(key, callback);
        
        if (immediate && this.hasKey(key)) {
            callback(this.getState(key), undefined, key);
        }
        
        return unsubscribe;
    }

    /**
     * Creates a computed value that automatically updates when dependencies change
     * @param {string[]} dependencies - Array of state keys to depend on
     * @param {Function} computeFn - Function to compute the value
     * @returns {Object} Computed value object with getValue, subscribe, and destroy methods
     */
    static computed(dependencies, computeFn) {
        if (!Array.isArray(dependencies)) {
            console.error('StateManager: Dependencies must be an array');
            return null;
        }

        if (typeof computeFn !== 'function') {
            console.error('StateManager: Compute function must be a function');
            return null;
        }

        let currentValue;
        let isInitialized = false;
        const listeners = [];

        const compute = () => {
            const depValues = dependencies.map(dep => this.getState(dep));
            const newValue = computeFn(...depValues);
            
            if (!isInitialized || newValue !== currentValue) {
                const oldValue = currentValue;
                currentValue = newValue;
                isInitialized = true;
                
                listeners.forEach(callback => {
                    try {
                        callback(newValue, oldValue);
                    } catch (error) {
                        console.error('StateManager: Error in computed listener:', error);
                    }
                });
            }
        };

        // Subscribe to all dependencies
        const unsubscribers = dependencies.map(dep => this.subscribe(dep, compute));

        // Initial computation
        compute();

        return {
            getValue: () => currentValue,
            subscribe: (callback) => {
                listeners.push(callback);
                return () => {
                    const index = listeners.indexOf(callback);
                    if (index > -1) {
                        listeners.splice(index, 1);
                    }
                };
            },
            destroy: () => {
                unsubscribers.forEach(unsubscribe => unsubscribe());
                listeners.length = 0;
            }
        };
    }
}

// Make StateManager globally available
if (typeof window !== 'undefined') {
    window.StateManager = StateManager;
}

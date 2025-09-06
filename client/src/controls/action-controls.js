import { Control } from './base-control.js';

/**
 * Button Control - Basic action button
 * 
 * Versatile button control with multiple variants, sizes, and action support.
 * Supports icons and custom action handlers.
 * 
 * @class ButtonControl
 * @extends Control
 * @example
 * {
 *   type: 'button',
 *   UID: 'submit-btn',
 *   text: 'Process Payment',
 *   props: {
 *     variant: 'primary', // primary, secondary, destructive, outline, ghost
 *     size: 'lg', // sm, default, lg
 *     icon: '<svg>...</svg>',
 *     action: { type: 'custom', handler: 'processPayment' }
 *   }
 * }
 */
export class ButtonControl extends Control {
    createElement() {
        const element = document.createElement('button');
        element.id = this.UID;
        element.className = this.getBaseClasses();
        element.textContent = window.ContextRenderer.render(this.text);
        element.setAttribute('data-testid', `button-${this.UID}`);
        
        if (this.props.icon) {
            const icon = document.createElement('span');
            icon.innerHTML = this.props.icon;
            icon.className = 'mr-2';
            element.insertBefore(icon, element.firstChild);
        }
        
        return element;
    }

    getBaseClasses() {
        const variant = this.props.variant || 'primary';
        const size = this.props.size || 'default';
        
        let classes = 'button-control font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';
        
        switch (variant) {
            case 'primary':
                classes += ' bg-primary text-primary-foreground hover:bg-primary/90';
                break;
            case 'secondary':
                classes += ' bg-secondary text-secondary-foreground hover:bg-secondary/90';
                break;
            case 'destructive':
                classes += ' bg-destructive text-destructive-foreground hover:bg-destructive/90';
                break;
            case 'outline':
                classes += ' border border-input bg-background hover:bg-accent hover:text-accent-foreground';
                break;
            case 'ghost':
                classes += ' hover:bg-accent hover:text-accent-foreground';
                break;
            default:
                classes += ' bg-primary text-primary-foreground hover:bg-primary/90';
        }
        
        switch (size) {
            case 'sm':
                classes += ' px-3 py-1.5 text-sm';
                break;
            case 'lg':
                classes += ' px-6 py-3 text-lg';
                break;
            default:
                classes += ' px-4 py-2';
        }
        
        return classes;
    }

    attachEvents() {
        this.element.addEventListener('click', (e) => {
            this.logEvent('click', `Button ${this.UID} clicked`);
            this.emit('click', { UID: this.UID, element: this.element });
            
            if (this.props.action) {
                this.executeAction(this.props.action);
            }
        });
    }

    executeAction(action) {
        switch (action.type) {
            case 'navigate':
                this.logEvent('action', `Navigation to: ${action.target}`);
                break;
            case 'submit':
                this.logEvent('action', `Form submission triggered`);
                break;
            case 'custom':
                if (action.handler && typeof window[action.handler] === 'function') {
                    window[action.handler](action.params);
                }
                break;
        }
    }
}

/**
 * Button Pad Control - Grid of buttons
 * 
 * Creates a grid layout of buttons, commonly used for number pads,
 * quick access buttons, or menu grids.
 * 
 * @class ButtonPadControl
 * @extends Control
 * @example
 * {
 *   type: 'button-pad',
 *   UID: 'number-pad',
 *   props: { rows: 4, columns: 3 },
 *   children: [
 *     { type: 'button', text: '1' },
 *     { type: 'button', text: '2' },
 *     { type: 'button', text: '3' },
 *     // ... more buttons
 *   ]
 * }
 */
export class ButtonPadControl extends Control {
    createElement() {
        const element = document.createElement('div');
        element.id = this.UID;
        element.className = this.getBaseClasses();
        element.setAttribute('data-testid', `button-pad-${this.UID}`);
        
        const rows = this.props.rows || 3;
        const columns = this.props.columns || 3;
        
        element.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        element.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        
        return element;
    }

    getBaseClasses() {
        return 'button-pad grid gap-2 p-4';
    }

    renderChildren() {
        this.children.forEach(childDef => {
            // Ensure child buttons have consistent styling
            if (childDef.type === 'button' && !childDef.props) {
                childDef.props = { variant: 'outline', size: 'sm' };
            }
            
            const childControl = window.ControlFactory.create(childDef);
            childControl.parent = this;
            this.childControls.push(childControl);
            const childElement = childControl.render();
            this.element.appendChild(childElement);
        });
    }
}

/**
 * Menu Button Control - Button with dropdown menu
 * 
 * Button that opens a dropdown menu when clicked.
 * Each child becomes a menu item.
 * 
 * @class MenuButtonControl
 * @extends Control
 * @example
 * {
 *   type: 'menu-button',
 *   UID: 'actions-menu',
 *   text: 'Actions',
 *   children: [
 *     { UID: 'void-item', text: 'Void Transaction' },
 *     { UID: 'hold-item', text: 'Hold Transaction' },
 *     { UID: 'recall-item', text: 'Recall Transaction' }
 *   ]
 * }
 */
export class MenuButtonControl extends Control {
    constructor(definition) {
        super(definition);
        this.isOpen = false;
    }

    createElement() {
        const element = document.createElement('div');
        element.id = this.UID;
        element.className = this.getBaseClasses();
        element.setAttribute('data-testid', `menu-button-${this.UID}`);
        
        const button = document.createElement('button');
        button.className = 'menu-trigger px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center';
        button.innerHTML = `
            ${window.ContextRenderer.render(this.text)}
            <svg class="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
        `;
        
        const menu = document.createElement('div');
        menu.className = 'menu-dropdown absolute top-full left-0 mt-1 bg-popover border border-border rounded-md shadow-lg hidden min-w-48 z-10';
        menu.setAttribute('data-testid', `menu-dropdown-${this.UID}`);
        
        element.appendChild(button);
        element.appendChild(menu);
        
        return element;
    }

    getBaseClasses() {
        return 'menu-button-control relative inline-block';
    }

    renderChildren() {
        const menu = this.element.querySelector('.menu-dropdown');
        
        this.children.forEach(childDef => {
            const menuItem = document.createElement('button');
            menuItem.className = 'w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground transition-colors';
            menuItem.textContent = window.ContextRenderer.render(childDef.text);
            menuItem.setAttribute('data-testid', `menu-item-${childDef.UID}`);
            
            menuItem.addEventListener('click', () => {
                this.toggleMenu(false);
                this.logEvent('menu-select', `Menu item ${childDef.UID} selected`);
                this.emit('menuSelect', { item: childDef.UID, UID: this.UID });
            });
            
            menu.appendChild(menuItem);
        });
    }

    attachEvents() {
        const button = this.element.querySelector('.menu-trigger');
        const menu = this.element.querySelector('.menu-dropdown');
        
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMenu();
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.element.contains(e.target)) {
                this.toggleMenu(false);
            }
        });
    }

    toggleMenu(force) {
        this.isOpen = force !== undefined ? force : !this.isOpen;
        const menu = this.element.querySelector('.menu-dropdown');
        menu.classList.toggle('hidden', !this.isOpen);
        
        this.logEvent('menu-toggle', `Menu ${this.UID} ${this.isOpen ? 'opened' : 'closed'}`);
    }
}

/**
 * Shortcut Keys Control - Invisible control for keyboard shortcuts
 * 
 * Invisible control that handles keyboard shortcuts globally.
 * Supports modifier keys (Ctrl, Alt, Shift) and custom actions.
 * 
 * @class ShortcutKeysControl
 * @extends Control
 * @example
 * {
 *   type: 'shortcut-keys',
 *   UID: 'global-shortcuts',
 *   props: {
 *     shortcuts: [
 *       { keys: 'ctrl+s', action: 'saveTransaction' },
 *       { keys: 'f1', action: 'showHelp' },
 *       { keys: 'ctrl+shift+c', action: 'clearCart' }
 *     ]
 *   }
 * }
 */
export class ShortcutKeysControl extends Control {
    createElement() {
        // This control doesn't render visible elements
        const element = document.createElement('div');
        element.id = this.UID;
        element.style.display = 'none';
        element.setAttribute('data-testid', `shortcut-${this.UID}`);
        return element;
    }

    attachEvents() {
        const shortcuts = this.props.shortcuts || [];
        
        shortcuts.forEach(shortcut => {
            const handler = (e) => {
                if (this.matchesShortcut(e, shortcut.keys)) {
                    e.preventDefault();
                    this.logEvent('shortcut', `Shortcut triggered: ${shortcut.keys}`);
                    this.emit('shortcut', { 
                        keys: shortcut.keys, 
                        action: shortcut.action, 
                        UID: this.UID 
                    });
                    
                    if (shortcut.action && typeof window[shortcut.action] === 'function') {
                        window[shortcut.action]();
                    }
                }
            };
            
            document.addEventListener('keydown', handler);
            
            // Store handler for cleanup
            if (!this.keyboardHandlers) {
                this.keyboardHandlers = [];
            }
            this.keyboardHandlers.push({ handler, shortcut });
        });
    }

    matchesShortcut(event, keyString) {
        const keys = keyString.toLowerCase().split('+');
        const modifiers = {
            ctrl: event.ctrlKey || event.metaKey,
            alt: event.altKey,
            shift: event.shiftKey
        };
        
        return keys.every(key => {
            if (key === 'ctrl') return modifiers.ctrl;
            if (key === 'alt') return modifiers.alt;
            if (key === 'shift') return modifiers.shift;
            return event.key.toLowerCase() === key;
        });
    }

    destroy() {
        // Clean up keyboard event listeners
        if (this.keyboardHandlers) {
            this.keyboardHandlers.forEach(({ handler }) => {
                document.removeEventListener('keydown', handler);
            });
        }
        super.destroy();
    }
}

// Register action controls
if (typeof window !== 'undefined') {
    window.ButtonControl = ButtonControl;
    window.ButtonPadControl = ButtonPadControl;
    window.MenuButtonControl = MenuButtonControl;
    window.ShortcutKeysControl = ShortcutKeysControl;
}

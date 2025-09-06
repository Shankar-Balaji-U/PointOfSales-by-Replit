import { Control } from './base-control.js';

/**
 * Label Control - Text display
 * 
 * Simple text display control with multiple variants for different text styles.
 * Supports context rendering for dynamic text content.
 * 
 * @class LabelControl
 * @extends Control
 * @example
 * {
 *   type: 'label',
 *   UID: 'welcome-message',
 *   text: 'Welcome #{UserName}!',
 *   props: {
 *     variant: 'heading', // heading, subtitle, caption, default
 *     size: 'default'
 *   }
 * }
 */
export class LabelControl extends Control {
    createElement() {
        const element = document.createElement('span');
        element.id = this.UID;
        element.className = this.getBaseClasses();
        element.textContent = window.ContextRenderer.render(this.text);
        element.setAttribute('data-testid', `label-${this.UID}`);
        return element;
    }

    getBaseClasses() {
        const variant = this.props.variant || 'default';
        const size = this.props.size || 'default';
        
        let classes = 'label-control';
        
        switch (variant) {
            case 'heading':
                classes += ' text-lg font-semibold text-foreground';
                break;
            case 'subtitle':
                classes += ' text-sm text-muted-foreground';
                break;
            case 'caption':
                classes += ' text-xs text-muted-foreground';
                break;
            default:
                classes += ' text-sm text-foreground';
        }
        
        return classes;
    }

    onStateChange(newState) {
        if (newState.text !== undefined) {
            this.text = newState.text;
            this.element.textContent = window.ContextRenderer.render(this.text);
        }
    }
}

/**
 * Message Box Control - Modal dialog
 * 
 * Modal dialog box for displaying messages, alerts, or confirmations.
 * Includes header, content area, and action buttons.
 * 
 * @class MessageBoxControl
 * @extends Control
 * @example
 * {
 *   type: 'message-box',
 *   UID: 'error-dialog',
 *   title: 'Transaction Error',
 *   text: 'Unable to process payment. Please try again.',
 *   props: { type: 'error' }
 * }
 * 
 * @fires show - When dialog is shown
 * @fires hide - When dialog is hidden
 */
export class MessageBoxControl extends Control {
    constructor(definition) {
        super(definition);
        this.isVisible = false;
        this.messageType = this.props.type || 'info';
    }

    createElement() {
        const overlay = document.createElement('div');
        overlay.id = this.UID;
        overlay.className = 'message-box-overlay fixed inset-0 bg-black/50 z-50 hidden opacity-0 transition-opacity';
        overlay.setAttribute('data-testid', `message-box-${this.UID}`);
        
        const dialog = document.createElement('div');
        dialog.className = 'message-box fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-lg shadow-lg min-w-80 max-w-md';
        
        const header = document.createElement('div');
        header.className = 'flex items-center justify-between p-4 border-b border-border';
        
        const title = document.createElement('h3');
        title.className = 'text-lg font-semibold';
        title.textContent = window.ContextRenderer.render(this.title || 'Message');
        
        const closeButton = document.createElement('button');
        closeButton.className = 'text-muted-foreground hover:text-foreground';
        closeButton.innerHTML = '✕';
        closeButton.setAttribute('data-testid', `message-box-close-${this.UID}`);
        closeButton.addEventListener('click', () => this.hide());
        
        header.appendChild(title);
        header.appendChild(closeButton);
        
        const content = document.createElement('div');
        content.className = 'p-4';
        content.textContent = window.ContextRenderer.render(this.text);
        
        const footer = document.createElement('div');
        footer.className = 'flex justify-end space-x-2 p-4 border-t border-border';
        
        const okButton = document.createElement('button');
        okButton.className = 'px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90';
        okButton.textContent = 'OK';
        okButton.setAttribute('data-testid', `message-box-ok-${this.UID}`);
        okButton.addEventListener('click', () => this.hide());
        
        footer.appendChild(okButton);
        
        dialog.appendChild(header);
        dialog.appendChild(content);
        dialog.appendChild(footer);
        overlay.appendChild(dialog);
        
        return overlay;
    }

    show() {
        this.isVisible = true;
        this.element.classList.remove('hidden');
        setTimeout(() => {
            this.element.classList.add('opacity-100');
        }, 10);
        
        this.logEvent('show', `Message box ${this.UID} shown`);
        this.emit('show', { UID: this.UID });
    }

    hide() {
        this.isVisible = false;
        this.element.classList.remove('opacity-100');
        setTimeout(() => {
            this.element.classList.add('hidden');
        }, 200);
        
        this.logEvent('hide', `Message box ${this.UID} hidden`);
        this.emit('hide', { UID: this.UID });
    }
}

/**
 * Status Bar Control - Application status display
 * 
 * Displays application status with indicator light and last sync time.
 * Supports different status types: ready, busy, error.
 * 
 * @class StatusBarControl
 * @extends Control
 * @example
 * {
 *   type: 'status-bar',
 *   UID: 'app-status'
 * }
 */
export class StatusBarControl extends Control {
    createElement() {
        const element = document.createElement('div');
        element.id = this.UID;
        element.className = this.getBaseClasses();
        element.setAttribute('data-testid', `status-bar-${this.UID}`);
        
        element.innerHTML = `
            <div class="flex justify-between items-center">
                <div class="flex items-center space-x-4">
                    <span class="status-indicator w-2 h-2 bg-green-500 rounded-full" data-testid="status-indicator-${this.UID}"></span>
                    <span class="text-sm" data-testid="status-text-${this.UID}">System Ready</span>
                </div>
                <div class="text-xs text-muted-foreground">
                    Last sync: <span data-testid="last-sync-${this.UID}">2024-01-15 10:30 AM</span>
                </div>
            </div>
        `;
        
        return element;
    }

    getBaseClasses() {
        return 'status-bar-control bg-muted/50 px-4 py-2 border-t border-border';
    }

    setStatus(status, message) {
        const indicator = this.element.querySelector('.status-indicator');
        const textElement = this.element.querySelector('[data-testid*="status-text"]');
        
        // Update indicator color
        indicator.className = 'status-indicator w-2 h-2 rounded-full';
        switch (status) {
            case 'ready':
                indicator.classList.add('bg-green-500');
                break;
            case 'busy':
                indicator.classList.add('bg-yellow-500');
                break;
            case 'error':
                indicator.classList.add('bg-red-500');
                break;
            default:
                indicator.classList.add('bg-gray-500');
        }
        
        // Update message
        if (message) {
            textElement.textContent = message;
        }
        
        this.setState({ status, message });
        this.logEvent('status-update', `Status: ${status} - ${message}`);
    }
}

/**
 * Notification Area Control - Toast notifications
 * 
 * Container for displaying toast notifications with different types and auto-dismiss.
 * Supports success, error, warning, and info notification types.
 * 
 * @class NotificationAreaControl
 * @extends Control
 * @example
 * {
 *   type: 'notification-area',
 *   UID: 'app-notifications'
 * }
 */
export class NotificationAreaControl extends Control {
    createElement() {
        const element = document.createElement('div');
        element.id = this.UID;
        element.className = this.getBaseClasses();
        element.setAttribute('data-testid', `notification-area-${this.UID}`);
        return element;
    }

    getBaseClasses() {
        return 'notification-area-control fixed top-4 right-4 space-y-2 z-50';
    }

    addNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification-slide p-4 rounded-lg shadow-lg max-w-sm ${this.getTypeClasses(type)}`;
        notification.setAttribute('data-testid', `notification-${Date.now()}`);
        
        notification.innerHTML = `
            <div class="flex items-center">
                <div class="flex-1">
                    <p class="text-sm font-medium">${window.ContextRenderer.render(message)}</p>
                </div>
                <button class="ml-4 text-current hover:opacity-70" data-testid="notification-close">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                </button>
            </div>
        `;

        this.element.appendChild(notification);

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                notification.remove();
            }, duration);
        }

        // Click to close
        notification.querySelector('[data-testid="notification-close"]').addEventListener('click', () => {
            notification.remove();
        });

        this.logEvent('notification', `Notification added: ${message}`);
        return notification;
    }

    getTypeClasses(type) {
        switch (type) {
            case 'success': return 'bg-green-500 text-white';
            case 'error': return 'bg-destructive text-destructive-foreground';
            case 'warning': return 'bg-amber-500 text-white';
            default: return 'bg-primary text-primary-foreground';
        }
    }
}

/**
 * Image Control - Image display
 * 
 * Displays images with configurable dimensions and alt text.
 * Supports load and error event handling.
 * 
 * @class ImageControl
 * @extends Control
 * @example
 * {
 *   type: 'image',
 *   UID: 'product-image',
 *   props: {
 *     src: '/images/product.jpg',
 *     alt: 'Product Image',
 *     width: '200px',
 *     height: '150px'
 *   }
 * }
 * 
 * @fires load - When image loads successfully
 * @fires error - When image fails to load
 */
export class ImageControl extends Control {
    createElement() {
        const element = document.createElement('img');
        element.id = this.UID;
        element.className = this.getBaseClasses();
        element.src = this.props.src || '';
        element.alt = this.props.alt || '';
        element.setAttribute('data-testid', `image-${this.UID}`);
        
        if (this.props.width) element.style.width = this.props.width;
        if (this.props.height) element.style.height = this.props.height;
        
        return element;
    }

    getBaseClasses() {
        return 'image-control rounded-md';
    }

    attachEvents() {
        this.element.addEventListener('load', () => {
            this.logEvent('image-load', `Image ${this.UID} loaded successfully`);
            this.emit('load', { UID: this.UID });
        });

        this.element.addEventListener('error', () => {
            this.logEvent('error', `Failed to load image ${this.UID}`);
            this.emit('error', { UID: this.UID });
        });
    }
}

// Register display controls
if (typeof window !== 'undefined') {
    window.LabelControl = LabelControl;
    window.MessageBoxControl = MessageBoxControl;
    window.StatusBarControl = StatusBarControl;
    window.NotificationAreaControl = NotificationAreaControl;
    window.ImageControl = ImageControl;
}

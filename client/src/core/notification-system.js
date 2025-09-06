// Notification System - Toast notifications and user feedback
export class NotificationSystem {
    static container = null;
    static notifications = new Map();
    static defaultDuration = 5000;
    static maxNotifications = 5;
    static position = 'top-right';
    static animations = true;

    static init() {
        if (this.container) {
            return; // Already initialized
        }

        this.container = document.getElementById('notification-area');
        if (!this.container) {
            // Create container if it doesn't exist
            this.container = document.createElement('div');
            this.container.id = 'notification-area';
            this.container.className = this.getContainerClasses();
            this.container.setAttribute('data-testid', 'notification-container');
            document.body.appendChild(this.container);
        }

        console.log('NotificationSystem: Initialized');
    }

    static show(message, type = 'info', options = {}) {
        this.init();

        const config = {
            duration: options.duration !== undefined ? options.duration : this.defaultDuration,
            persistent: options.persistent || false,
            action: options.action || null,
            id: options.id || `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            ...options
        };

        // Remove existing notification with same ID if it exists
        if (this.notifications.has(config.id)) {
            this.hide(config.id);
        }

        const notification = this.createNotification(message, type, config);
        this.notifications.set(config.id, notification);

        // Add to container
        this.container.appendChild(notification.element);

        // Manage notification count
        this.enforceMaxNotifications();

        // Auto-remove after duration (unless persistent)
        if (!config.persistent && config.duration > 0) {
            notification.timeout = setTimeout(() => {
                this.hide(config.id);
            }, config.duration);
        }

        // Trigger show animation
        if (this.animations) {
            setTimeout(() => {
                notification.element.classList.add('show');
            }, 10);
        }

        console.log(`NotificationSystem: Notification shown - ${type}: ${message}`);
        return config.id;
    }

    static createNotification(message, type, config) {
        const element = document.createElement('div');
        element.className = `notification ${this.getTypeClasses(type)} ${this.animations ? 'notification-slide' : ''}`;
        element.setAttribute('data-testid', `notification-${config.id}`);
        element.setAttribute('data-type', type);

        const iconHTML = this.getIconHTML(type);
        const actionHTML = config.action ? this.getActionHTML(config.action) : '';

        element.innerHTML = `
            <div class="flex items-start">
                <div class="flex-shrink-0">
                    ${iconHTML}
                </div>
                <div class="ml-3 flex-1">
                    <p class="text-sm font-medium">${this.escapeHTML(message)}</p>
                    ${config.subtitle ? `<p class="text-xs mt-1 opacity-90">${this.escapeHTML(config.subtitle)}</p>` : ''}
                    ${actionHTML}
                </div>
                <div class="ml-4 flex-shrink-0">
                    <button class="notification-close inline-flex text-current hover:opacity-70 focus:outline-none" data-testid="notification-close-${config.id}">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        // Attach close handler
        const closeBtn = element.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.hide(config.id);
        });

        // Attach action handler
        if (config.action) {
            const actionBtn = element.querySelector('.notification-action');
            if (actionBtn) {
                actionBtn.addEventListener('click', () => {
                    if (config.action.handler && typeof config.action.handler === 'function') {
                        config.action.handler();
                    }
                    if (config.action.closeOnClick !== false) {
                        this.hide(config.id);
                    }
                });
            }
        }

        return {
            element,
            id: config.id,
            type,
            message,
            config,
            timeout: null
        };
    }

    static hide(id) {
        const notification = this.notifications.get(id);
        if (!notification) {
            return false;
        }

        // Clear timeout if exists
        if (notification.timeout) {
            clearTimeout(notification.timeout);
        }

        // Trigger hide animation
        if (this.animations) {
            notification.element.classList.add('notification-hide');
            setTimeout(() => {
                this.removeNotification(id);
            }, 300);
        } else {
            this.removeNotification(id);
        }

        return true;
    }

    static removeNotification(id) {
        const notification = this.notifications.get(id);
        if (!notification) {
            return;
        }

        if (notification.element.parentNode) {
            notification.element.parentNode.removeChild(notification.element);
        }

        this.notifications.delete(id);
        console.log(`NotificationSystem: Notification removed - ${id}`);
    }

    static clear() {
        this.notifications.forEach((notification, id) => {
            this.hide(id);
        });
        console.log('NotificationSystem: All notifications cleared');
    }

    static success(message, options = {}) {
        return this.show(message, 'success', options);
    }

    static error(message, options = {}) {
        return this.show(message, 'error', { 
            duration: 8000, // Longer duration for errors
            ...options 
        });
    }

    static warning(message, options = {}) {
        return this.show(message, 'warning', options);
    }

    static info(message, options = {}) {
        return this.show(message, 'info', options);
    }

    static loading(message, options = {}) {
        return this.show(message, 'loading', { 
            persistent: true, 
            ...options 
        });
    }

    static getContainerClasses() {
        const positions = {
            'top-right': 'fixed top-4 right-4 space-y-2 z-50',
            'top-left': 'fixed top-4 left-4 space-y-2 z-50',
            'bottom-right': 'fixed bottom-4 right-4 space-y-2 z-50',
            'bottom-left': 'fixed bottom-4 left-4 space-y-2 z-50',
            'top-center': 'fixed top-4 left-1/2 transform -translate-x-1/2 space-y-2 z-50',
            'bottom-center': 'fixed bottom-4 left-1/2 transform -translate-x-1/2 space-y-2 z-50'
        };

        return positions[this.position] || positions['top-right'];
    }

    static getTypeClasses(type) {
        const typeClasses = {
            success: 'bg-green-500 text-white shadow-lg',
            error: 'bg-red-500 text-white shadow-lg',
            warning: 'bg-amber-500 text-white shadow-lg',
            info: 'bg-blue-500 text-white shadow-lg',
            loading: 'bg-gray-500 text-white shadow-lg'
        };

        return `${typeClasses[type] || typeClasses.info} p-4 rounded-lg max-w-sm`;
    }

    static getIconHTML(type) {
        const icons = {
            success: `
                <svg class="w-5 h-5 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
            `,
            error: `
                <svg class="w-5 h-5 text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            `,
            warning: `
                <svg class="w-5 h-5 text-amber-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5l-6.928-12c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
            `,
            info: `
                <svg class="w-5 h-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            `,
            loading: `
                <svg class="w-5 h-5 text-gray-200 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            `
        };

        return icons[type] || icons.info;
    }

    static getActionHTML(action) {
        if (!action || !action.text) {
            return '';
        }

        return `
            <div class="mt-2">
                <button class="notification-action text-xs font-medium underline hover:no-underline focus:outline-none" data-testid="notification-action">
                    ${this.escapeHTML(action.text)}
                </button>
            </div>
        `;
    }

    static escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    static enforceMaxNotifications() {
        const notificationArray = Array.from(this.notifications.values());
        if (notificationArray.length > this.maxNotifications) {
            // Remove oldest notifications
            const toRemove = notificationArray
                .sort((a, b) => a.id.localeCompare(b.id))
                .slice(0, notificationArray.length - this.maxNotifications);
            
            toRemove.forEach(notification => {
                this.hide(notification.id);
            });
        }
    }

    static setPosition(position) {
        const validPositions = ['top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center'];
        if (validPositions.includes(position)) {
            this.position = position;
            if (this.container) {
                this.container.className = this.getContainerClasses();
            }
            console.log(`NotificationSystem: Position set to ${position}`);
        } else {
            console.warn(`NotificationSystem: Invalid position ${position}`);
        }
    }

    static setMaxNotifications(max) {
        if (typeof max === 'number' && max > 0) {
            this.maxNotifications = max;
            this.enforceMaxNotifications();
            console.log(`NotificationSystem: Max notifications set to ${max}`);
        }
    }

    static setDefaultDuration(duration) {
        if (typeof duration === 'number' && duration >= 0) {
            this.defaultDuration = duration;
            console.log(`NotificationSystem: Default duration set to ${duration}ms`);
        }
    }

    static setAnimations(enabled) {
        this.animations = enabled;
        console.log(`NotificationSystem: Animations ${enabled ? 'enabled' : 'disabled'}`);
    }

    static getStats() {
        return {
            activeNotifications: this.notifications.size,
            maxNotifications: this.maxNotifications,
            position: this.position,
            defaultDuration: this.defaultDuration,
            animations: this.animations
        };
    }

    static update(id, message, type = null) {
        const notification = this.notifications.get(id);
        if (!notification) {
            return false;
        }

        const messageElement = notification.element.querySelector('.text-sm.font-medium');
        if (messageElement) {
            messageElement.textContent = message;
        }

        if (type && type !== notification.type) {
            // Update type classes
            notification.element.className = notification.element.className
                .replace(this.getTypeClasses(notification.type), this.getTypeClasses(type));
            
            // Update icon
            const iconContainer = notification.element.querySelector('.flex-shrink-0');
            if (iconContainer) {
                iconContainer.innerHTML = this.getIconHTML(type);
            }
            
            notification.type = type;
        }

        notification.message = message;
        console.log(`NotificationSystem: Notification updated - ${id}`);
        return true;
    }
}

// Add notification-specific CSS
const style = document.createElement('style');
style.textContent = `
    .notification {
        transform: translateX(100%);
        opacity: 0;
        transition: all 0.3s ease-out;
    }
    
    .notification.show {
        transform: translateX(0);
        opacity: 1;
    }
    
    .notification.notification-hide {
        transform: translateX(100%);
        opacity: 0;
    }
    
    .notification-slide {
        animation: slideInFromRight 0.3s ease-out;
    }
    
    @keyframes slideInFromRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Make NotificationSystem globally available
if (typeof window !== 'undefined') {
    window.NotificationSystem = NotificationSystem;
}

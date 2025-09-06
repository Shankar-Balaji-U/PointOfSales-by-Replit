import { Control } from './base-control.js';

/**
 * Cart Grid Control - Shopping cart display
 * 
 * Displays shopping cart items in a table format with quantity, price, and total columns.
 * Supports adding, removing items and automatic total calculation.
 * 
 * @class CartGridControl
 * @extends Control
 * @example
 * {
 *   type: 'cart-grid',
 *   UID: 'shopping-cart',
 *   props: {
 *     items: [
 *       { id: '001', name: 'Coffee', price: 3.99, quantity: 2 },
 *       { id: '002', name: 'Muffin', price: 2.49, quantity: 1 }
 *     ]
 *   }
 * }
 * 
 * @fires itemAdded - When item is added to cart
 * @fires itemRemoved - When item is removed from cart
 * @fires totalsUpdated - When cart totals change
 */
export class CartGridControl extends Control {
    constructor(definition) {
        super(definition);
        this.items = this.props.items || [];
    }

    createElement() {
        const element = document.createElement('div');
        element.id = this.UID;
        element.className = this.getBaseClasses();
        element.setAttribute('data-testid', `cart-grid-${this.UID}`);
        
        // Create table structure
        const table = document.createElement('table');
        table.className = 'w-full text-sm';
        
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr class="border-b border-border">
                <th class="text-left py-2 px-3 font-medium">Item</th>
                <th class="text-right py-2 px-3 font-medium">Qty</th>
                <th class="text-right py-2 px-3 font-medium">Price</th>
                <th class="text-right py-2 px-3 font-medium">Total</th>
                <th class="w-10"></th>
            </tr>
        `;
        
        const tbody = document.createElement('tbody');
        tbody.id = `${this.UID}-body`;
        tbody.setAttribute('data-testid', `cart-body-${this.UID}`);
        
        table.appendChild(thead);
        table.appendChild(tbody);
        element.appendChild(table);
                
        return element;
    }

    getBaseClasses() {
        return 'cart-grid-control bg-card border border-border rounded-lg overflow-hidden';
    }

    render() {
        this.element = super.render();
        this.renderItems();
        return this.element;
    }

    renderItems() {
        const tbody = this.element.querySelector('tbody');
        tbody.innerHTML = '';
        
        this.items.forEach((item, index) => {
            const row = document.createElement('tr');
            row.className = 'border-b border-border hover:bg-muted/30';
            row.setAttribute('data-testid', `cart-item-${index}`);
            
            const total = (item.quantity * item.price).toFixed(2);
            
            row.innerHTML = `
                <td class="py-2 px-3" data-testid="item-name-${index}">${item.name}</td>
                <td class="text-right py-2 px-3" data-testid="item-quantity-${index}">${item.quantity}</td>
                <td class="text-right py-2 px-3" data-testid="item-price-${index}">$${item.price.toFixed(2)}</td>
                <td class="text-right py-2 px-3" data-testid="item-total-${index}">$${total}</td>
                <td class="py-2 px-3">
                    <button class="remove-item text-destructive hover:text-destructive/80" data-index="${index}" data-testid="remove-item-${index}">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </td>
            `;
            
            tbody.appendChild(row);
        });
        
        // Attach remove button events
        this.element.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.getAttribute('data-index'));
                this.removeItem(index);
            });
        });
    }

    addItem(item) {
        // Check if item already exists
        const existingIndex = this.items.findIndex(existing => existing.id === item.id);
        
        if (existingIndex >= 0) {
            this.items[existingIndex].quantity += item.quantity || 1;
        } else {
            this.items.push({
                id: item.id || Date.now(),
                name: item.name,
                price: item.price,
                quantity: item.quantity || 1
            });
        }
        
        this.renderItems();
        this.logEvent('cart-add', `Item added: ${item.name}`);
        this.emit('itemAdded', { item, UID: this.UID });
        this.updateTotals();
    }

    removeItem(index) {
        if (index >= 0 && index < this.items.length) {
            const item = this.items[index];
            this.items.splice(index, 1);
            this.renderItems();
            this.logEvent('cart-remove', `Item removed: ${item.name}`);
            this.emit('itemRemoved', { item, UID: this.UID });
            this.updateTotals();
        }
    }

    clearCart() {
        this.items = [];
        this.renderItems();
        this.logEvent('cart-clear', 'Cart cleared');
        this.emit('cartCleared', { UID: this.UID });
        this.updateTotals();
    }

    updateTotals() {
        const subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.08; // 8% tax
        const total = subtotal + tax;
        
        this.setState({
            subtotal: subtotal.toFixed(2),
            tax: tax.toFixed(2),
            total: total.toFixed(2),
            itemCount: this.items.length
        });
        
        this.emit('totalsUpdated', {
            subtotal: subtotal.toFixed(2),
            tax: tax.toFixed(2),
            total: total.toFixed(2),
            UID: this.UID
        });
    }
}

/**
 * Totals Display Control - Transaction totals
 * 
 * Displays transaction totals including subtotal, tax, and final total.
 * Automatically updates when connected to cart controls.
 * 
 * @class TotalsDisplayControl
 * @extends Control
 * @example
 * {
 *   type: 'totals-display',
 *   UID: 'transaction-totals'
 * }
 */
export class TotalsDisplayControl extends Control {
    createElement() {
        const element = document.createElement('div');
        element.id = this.UID;
        element.className = this.getBaseClasses();
        element.setAttribute('data-testid', `totals-display-${this.UID}`);
        
        element.innerHTML = `
            <div class="space-y-2">
                <div class="flex justify-between">
                    <span>Subtotal:</span>
                    <span data-testid="subtotal-${this.UID}">$0.00</span>
                </div>
                <div class="flex justify-between">
                    <span>Tax:</span>
                    <span data-testid="tax-${this.UID}">$0.00</span>
                </div>
                <div class="flex justify-between text-lg font-semibold border-t border-border pt-2">
                    <span>Total:</span>
                    <span data-testid="total-${this.UID}">$0.00</span>
                </div>
            </div>
        `;
        
        return element;
    }

    getBaseClasses() {
        return 'totals-display-control bg-muted p-4 rounded-lg';
    }

    updateTotals(totals) {
        const subtotalEl = this.element.querySelector(`[data-testid="subtotal-${this.UID}"]`);
        const taxEl = this.element.querySelector(`[data-testid="tax-${this.UID}"]`);
        const totalEl = this.element.querySelector(`[data-testid="total-${this.UID}"]`);
        
        if (subtotalEl) subtotalEl.textContent = `$${totals.subtotal}`;
        if (taxEl) taxEl.textContent = `$${totals.tax}`;
        if (totalEl) totalEl.textContent = `$${totals.total}`;
        
        this.setState(totals);
    }
}

/**
 * Payment Control - Payment method selection
 * 
 * Payment interface with method selection buttons and amount input.
 * Supports Cash, Card, Digital, and Check payment methods.
 * 
 * @class PaymentControlControl
 * @extends Control
 * @example
 * {
 *   type: 'payment-control',
 *   UID: 'payment-interface'
 * }
 * 
 * @fires paymentMethodSelected - When payment method is chosen
 * @fires amountChanged - When received amount is entered
 */
export class PaymentControlControl extends Control {
    constructor(definition) {
        super(definition);
        this.selectedMethod = null;
        this.amountReceived = 0;
    }

    createElement() {
        const element = document.createElement('div');
        element.id = this.UID;
        element.className = this.getBaseClasses();
        element.setAttribute('data-testid', `payment-control-${this.UID}`);
        
        element.innerHTML = `
            <div class="space-y-4">
                <h4 class="font-medium">Payment Method</h4>
                <div class="grid grid-cols-2 gap-2">
                    <button class="payment-btn px-3 py-2 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 transition-colors" data-method="cash" data-testid="payment-cash-${this.UID}">Cash</button>
                    <button class="payment-btn px-3 py-2 bg-secondary text-secondary-foreground rounded text-sm hover:bg-secondary/90 transition-colors" data-method="card" data-testid="payment-card-${this.UID}">Card</button>
                    <button class="payment-btn px-3 py-2 bg-accent text-accent-foreground rounded text-sm hover:bg-accent/80 transition-colors" data-method="digital" data-testid="payment-digital-${this.UID}">Digital</button>
                    <button class="payment-btn px-3 py-2 bg-muted text-muted-foreground rounded text-sm hover:bg-muted/80 transition-colors" data-method="check" data-testid="payment-check-${this.UID}">Check</button>
                </div>
                <div class="pt-2">
                    <input type="number" placeholder="Amount received" class="w-full px-3 py-2 border border-input rounded text-sm" step="0.01" data-testid="amount-received-${this.UID}" />
                </div>
            </div>
        `;
        
        return element;
    }

    getBaseClasses() {
        return 'payment-control bg-card p-4 border border-border rounded-lg';
    }

    attachEvents() {
        const buttons = this.element.querySelectorAll('.payment-btn');
        const amountInput = this.element.querySelector('input[type="number"]');
        
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active state from all buttons
                buttons.forEach(b => b.classList.remove('ring-2', 'ring-ring'));
                
                // Add active state to clicked button
                btn.classList.add('ring-2', 'ring-ring');
                
                this.selectedMethod = btn.getAttribute('data-method');
                this.setState({ selectedMethod: this.selectedMethod });
                
                this.logEvent('payment', `Payment method selected: ${this.selectedMethod}`);
                this.emit('paymentMethodSelected', { 
                    method: this.selectedMethod, 
                    UID: this.UID 
                });
            });
        });
        
        amountInput.addEventListener('input', (e) => {
            this.amountReceived = parseFloat(e.target.value) || 0;
            this.setState({ amountReceived: this.amountReceived });
            this.emit('amountChanged', { 
                amount: this.amountReceived, 
                UID: this.UID 
            });
        });
    }
}

/**
 * Change Due Display Control - Calculate and show change
 * 
 * Calculates and displays change due based on total amount and amount received.
 * Updates automatically when connected to payment controls.
 * 
 * @class ChangeDueDisplayControl
 * @extends Control
 * @example
 * {
 *   type: 'change-due-display',
 *   UID: 'change-calculator'
 * }
 */
export class ChangeDueDisplayControl extends Control {
    constructor(definition) {
        super(definition);
        this.totalDue = 0;
        this.amountReceived = 0;
    }

    createElement() {
        const element = document.createElement('div');
        element.id = this.UID;
        element.className = this.getBaseClasses();
        element.setAttribute('data-testid', `change-due-${this.UID}`);
        
        element.innerHTML = `
            <div class="text-center">
                <div class="text-sm text-muted-foreground mb-1">Change Due</div>
                <div class="text-2xl font-bold" data-testid="change-amount-${this.UID}">$0.00</div>
            </div>
        `;
        
        return element;
    }

    getBaseClasses() {
        return 'change-due-control bg-muted p-4 rounded-lg border-2 border-dashed border-border';
    }

    updateChange(totalDue, amountReceived) {
        this.totalDue = totalDue;
        this.amountReceived = amountReceived;
        
        const change = Math.max(0, amountReceived - totalDue);
        const changeElement = this.element.querySelector(`[data-testid="change-amount-${this.UID}"]`);
        
        changeElement.textContent = `$${change.toFixed(2)}`;
        
        // Update styling based on change amount
        if (change > 0) {
            changeElement.className = 'text-2xl font-bold text-green-600';
        } else if (amountReceived > 0 && amountReceived < totalDue) {
            changeElement.className = 'text-2xl font-bold text-amber-600';
        } else {
            changeElement.className = 'text-2xl font-bold';
        }
        
        this.setState({ change: change.toFixed(2) });
        this.logEvent('change-calc', `Change calculated: $${change.toFixed(2)}`);
    }
}

/**
 * Customer Info Panel Control - Customer details display
 * 
 * Displays customer information including name, ID, phone, and email.
 * Includes edit functionality for customer data modification.
 * 
 * @class CustomerInfoPanelControl
 * @extends Control
 * @example
 * {
 *   type: 'customer-info-panel',
 *   UID: 'customer-details',
 *   props: {
 *     customer: {
 *       name: 'Jane Smith',
 *       id: 'CUST001',
 *       phone: '(555) 123-4567',
 *       email: 'jane@example.com'
 *     }
 *   }
 * }
 */
export class CustomerInfoPanelControl extends Control {
    constructor(definition) {
        super(definition);
        this.customer = this.props.customer || null;
    }

    createElement() {
        const element = document.createElement('div');
        element.id = this.UID;
        element.className = this.getBaseClasses();
        element.setAttribute('data-testid', `customer-info-${this.UID}`);
        
        element.innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <h4 class="font-medium">Customer Information</h4>
                <button class="text-sm text-primary hover:text-primary/80" data-testid="edit-customer-${this.UID}">Edit</button>
            </div>
            <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <span class="text-muted-foreground">Name:</span>
                    <span data-testid="customer-name-${this.UID}">Walk-in Customer</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-muted-foreground">ID:</span>
                    <span data-testid="customer-id-${this.UID}">-</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-muted-foreground">Phone:</span>
                    <span data-testid="customer-phone-${this.UID}">-</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-muted-foreground">Email:</span>
                    <span data-testid="customer-email-${this.UID}">-</span>
                </div>
            </div>
        `;
        
        return element;
    }

    getBaseClasses() {
        return 'customer-info-panel bg-card p-4 border border-border rounded-lg';
    }

    attachEvents() {
        const editButton = this.element.querySelector(`[data-testid="edit-customer-${this.UID}"]`);
        
        editButton.addEventListener('click', () => {
            this.logEvent('customer-edit', 'Customer edit requested');
            this.emit('editCustomer', { UID: this.UID });
        });
    }

    setCustomer(customer) {
        this.customer = customer;
        
        const nameEl = this.element.querySelector(`[data-testid="customer-name-${this.UID}"]`);
        const idEl = this.element.querySelector(`[data-testid="customer-id-${this.UID}"]`);
        const phoneEl = this.element.querySelector(`[data-testid="customer-phone-${this.UID}"]`);
        const emailEl = this.element.querySelector(`[data-testid="customer-email-${this.UID}"]`);
        
        if (customer) {
            nameEl.textContent = customer.name || 'Unknown Customer';
            idEl.textContent = customer.id || '-';
            phoneEl.textContent = customer.phone || '-';
            emailEl.textContent = customer.email || '-';
        } else {
            nameEl.textContent = 'Walk-in Customer';
            idEl.textContent = '-';
            phoneEl.textContent = '-';
            emailEl.textContent = '-';
        }
        
        this.setState({ customer });
        this.logEvent('customer-update', `Customer info updated: ${customer?.name || 'Walk-in'}`);
    }
}

// Register transaction controls
if (typeof window !== 'undefined') {
    window.CartGridControl = CartGridControl;
    window.TotalsDisplayControl = TotalsDisplayControl;
    window.PaymentControlControl = PaymentControlControl;
    window.ChangeDueDisplayControl = ChangeDueDisplayControl;
    window.CustomerInfoPanelControl = CustomerInfoPanelControl;
}

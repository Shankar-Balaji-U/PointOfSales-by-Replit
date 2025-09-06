import { Control } from "./base-control.js";

/**
 * Price Checker Control - Product price lookup
 *
 * Allows customers or staff to check product prices by entering product codes.
 * Displays product name and price when found in the database.
 *
 * @class PriceCheckerControl
 * @extends Control
 * @example
 * {
 *   type: 'price-checker',
 *   UID: 'customer-price-check'
 * }
 *
 * @fires priceFound - When product is found
 * @fires priceNotFound - When product is not found
 */
export class PriceCheckerControl extends Control {
    createElement() {
        const element = document.createElement("div");
        element.id = this.UID;
        element.className = this.getBaseClasses();
        element.setAttribute("data-testid", `price-checker-${this.UID}`);

        element.innerHTML = `
            <div class="text-center">
                <div class="mb-4">
                    <svg class="w-12 h-12 mx-auto text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                </div>
                <h3 class="font-semibold mb-2">Price Checker</h3>
                <p class="text-sm text-muted-foreground mb-4">Scan or enter product code</p>
                <input type="text" placeholder="Enter product code..." class="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring mb-4" data-testid="price-input-${this.UID}" />
                <div class="price-result hidden bg-muted p-3 rounded-md" data-testid="price-result-${this.UID}">
                    <div class="font-semibold" data-testid="product-name-${this.UID}"></div>
                    <div class="text-lg text-primary font-bold" data-testid="product-price-${this.UID}"></div>
                </div>
            </div>
        `;

        return element;
    }

    getBaseClasses() {
        return "price-checker p-6 border-2 border-dashed border-border rounded-lg bg-muted/30";
    }

    attachEvents() {
        const input = this.element.querySelector("input");
        const resultDiv = this.element.querySelector(".price-result");

        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && input.value.trim()) {
                this.checkPrice(input.value.trim());
            }
        });

        input.addEventListener("input", (e) => {
            if (!e.target.value) {
                resultDiv.classList.add("hidden");
            }
        });
    }

    checkPrice(productCode) {
        // Simulate price lookup
        const mockProducts = {
            12345: { name: "Sample Product A", price: 19.99 },
            67890: { name: "Sample Product B", price: 12.5 },
            11111: { name: "Premium Item", price: 89.99 },
        };

        const product = mockProducts[productCode];
        const resultDiv = this.element.querySelector(".price-result");
        const nameEl = this.element.querySelector(
            `[data-testid="product-name-${this.UID}"]`,
        );
        const priceEl = this.element.querySelector(
            `[data-testid="product-price-${this.UID}"]`,
        );

        if (product) {
            nameEl.textContent = product.name;
            priceEl.textContent = `$${product.price.toFixed(2)}`;
            resultDiv.classList.remove("hidden");

            this.logEvent(
                "price-check",
                `Price found for ${productCode}: ${product.name} - $${product.price}`,
            );
            this.emit("priceFound", { productCode, product, UID: this.UID });
        } else {
            nameEl.textContent = "Product not found";
            priceEl.textContent = "-";
            resultDiv.classList.remove("hidden");

            this.logEvent("price-check", `Product not found: ${productCode}`);
            this.emit("priceNotFound", { productCode, UID: this.UID });
        }
    }
}

/**
 * Signature Pad Control - Customer signature capture
 *
 * Digital signature pad using HTML5 Canvas for capturing customer signatures.
 * Supports both mouse and touch input with clear and save functionality.
 *
 * @class SignaturePadControl
 * @extends Control
 * @example
 * {
 *   type: 'signature-pad',
 *   UID: 'customer-signature'
 * }
 *
 * @fires signatureCleared - When signature is cleared
 * @fires signatureSaved - When signature is saved (includes base64 data)
 */
export class SignaturePadControl extends Control {
    constructor(definition) {
        super(definition);
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
    }

    createElement() {
        const element = document.createElement("div");
        element.id = this.UID;
        element.className = this.getBaseClasses();
        element.setAttribute("data-testid", `signature-pad-${this.UID}`);

        const canvas = document.createElement("canvas");
        canvas.width = 400;
        canvas.height = 200;
        canvas.className =
            "signature-pad w-full border-2 border-border rounded-md bg-white";
        canvas.setAttribute("data-testid", `signature-canvas-${this.UID}`);

        const toolbar = document.createElement("div");
        toolbar.className =
            "flex justify-between items-center p-2 bg-muted/50 border-t border-border rounded-b-md";
        toolbar.innerHTML = `
            <button class="clear-btn px-3 py-1 text-sm bg-destructive text-destructive-foreground rounded hover:bg-destructive/90" data-testid="signature-clear-${this.UID}">Clear</button>
            <span class="text-sm text-muted-foreground">Sign above</span>
            <button class="save-btn px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90" data-testid="signature-save-${this.UID}">Save</button>
        `;

        element.appendChild(canvas);
        element.appendChild(toolbar);

        return element;
    }

    getBaseClasses() {
        return "signature-pad-control bg-card border border-border rounded-lg overflow-hidden shadow-sm";
    }

    attachEvents() {
        const canvas = this.element.querySelector("canvas");
        const clearBtn = this.element.querySelector(".clear-btn");
        const saveBtn = this.element.querySelector(".save-btn");

        const ctx = canvas.getContext("2d");
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";

        // Mouse events
        canvas.addEventListener("mousedown", (e) => {
            this.isDrawing = true;
            const rect = canvas.getBoundingClientRect();
            this.lastX = e.clientX - rect.left;
            this.lastY = e.clientY - rect.top;
            ctx.beginPath();
            ctx.moveTo(this.lastX, this.lastY);
            this.logEvent("signature", "Signature started");
        });

        canvas.addEventListener("mousemove", (e) => {
            if (!this.isDrawing) return;

            const rect = canvas.getBoundingClientRect();
            const currentX = e.clientX - rect.left;
            const currentY = e.clientY - rect.top;

            ctx.lineTo(currentX, currentY);
            ctx.stroke();

            this.lastX = currentX;
            this.lastY = currentY;
        });

        canvas.addEventListener("mouseup", () => {
            this.isDrawing = false;
        });

        // Touch events for mobile
        canvas.addEventListener("touchstart", (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            this.isDrawing = true;
            this.lastX = touch.clientX - rect.left;
            this.lastY = touch.clientY - rect.top;
            ctx.beginPath();
            ctx.moveTo(this.lastX, this.lastY);
        });

        canvas.addEventListener("touchmove", (e) => {
            e.preventDefault();
            if (!this.isDrawing) return;

            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            const currentX = touch.clientX - rect.left;
            const currentY = touch.clientY - rect.top;

            ctx.lineTo(currentX, currentY);
            ctx.stroke();

            this.lastX = currentX;
            this.lastY = currentY;
        });

        canvas.addEventListener("touchend", (e) => {
            e.preventDefault();
            this.isDrawing = false;
        });

        clearBtn.addEventListener("click", () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            this.logEvent("signature", "Signature cleared");
            this.emit("signatureCleared", { UID: this.UID });
        });

        saveBtn.addEventListener("click", () => {
            const dataURL = canvas.toDataURL();
            this.setState({ signatureData: dataURL });
            this.logEvent("signature", "Signature saved");
            this.emit("signatureSaved", { dataURL, UID: this.UID });
        });
    }
}

/**
 * Receipt Preview Control - Transaction receipt display
 *
 * Shows a preview of the transaction receipt with store header,
 * item details, totals, and footer message.
 *
 * @class ReceiptPreviewControl
 * @extends Control
 * @example
 * {
 *   type: 'receipt-preview',
 *   UID: 'receipt-display'
 * }
 */
export class ReceiptPreviewControl extends Control {
    constructor(definition) {
        super(definition);
        this.receiptData = this.props.receiptData || null;
    }

    createElement() {
        const element = document.createElement("div");
        element.id = this.UID;
        element.className = this.getBaseClasses();
        element.setAttribute("data-testid", `receipt-preview-${this.UID}`);

        element.innerHTML = `
            <div class="receipt-paper p-4 h-80 overflow-y-auto bg-white">
                <div class="text-center border-b border-gray-300 pb-3 mb-3">
                    <h3 class="font-bold text-lg">ABC Store</h3>
                    <p class="text-xs text-gray-600">123 Main St, City, State 12345</p>
                    <p class="text-xs text-gray-600">Phone: (555) 123-4567</p>
                </div>
                
                <div class="text-xs mb-3">
                    <div class="flex justify-between">
                        <span>Date:</span>
                        <span data-testid="receipt-date-${this.UID}">${new Date().toLocaleDateString()}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Time:</span>
                        <span data-testid="receipt-time-${this.UID}">${new Date().toLocaleTimeString()}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Transaction #:</span>
                        <span data-testid="receipt-transaction-${this.UID}">TXN-${Date.now()}</span>
                    </div>
                </div>
                
                <div class="border-b border-gray-300 mb-3 pb-3">
                    <div class="receipt-items" data-testid="receipt-items-${this.UID}">
                        <div class="text-center text-gray-500 text-xs py-4">No items in transaction</div>
                    </div>
                </div>
                
                <div class="text-xs space-y-1">
                    <div class="flex justify-between">
                        <span>Subtotal:</span>
                        <span data-testid="receipt-subtotal-${this.UID}">$0.00</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Tax:</span>
                        <span data-testid="receipt-tax-${this.UID}">$0.00</span>
                    </div>
                    <div class="flex justify-between font-bold border-t border-gray-300 pt-1">
                        <span>Total:</span>
                        <span data-testid="receipt-total-${this.UID}">$0.00</span>
                    </div>
                </div>
                
                <div class="mt-4 text-center text-xs text-gray-500">
                    <p>Thank you for your business!</p>
                    <p>Have a great day!</p>
                </div>
            </div>
        `;

        return element;
    }

    getBaseClasses() {
        return "receipt-preview-control bg-card border border-border rounded-lg shadow-sm overflow-hidden";
    }

    updateReceipt(items, totals) {
        const itemsContainer = this.element.querySelector(".receipt-items");
        const subtotalEl = this.element.querySelector(
            `[data-testid="receipt-subtotal-${this.UID}"]`,
        );
        const taxEl = this.element.querySelector(
            `[data-testid="receipt-tax-${this.UID}"]`,
        );
        const totalEl = this.element.querySelector(
            `[data-testid="receipt-total-${this.UID}"]`,
        );

        // Update items
        if (items && items.length > 0) {
            itemsContainer.innerHTML = "";
            items.forEach((item) => {
                const itemDiv = document.createElement("div");
                itemDiv.className = "flex justify-between text-xs mb-1";
                itemDiv.innerHTML = `
                    <div>
                        <div>${item.name}</div>
                        <div class="text-gray-500">${item.quantity} x $${item.price.toFixed(2)}</div>
                    </div>
                    <div>$${(item.quantity * item.price).toFixed(2)}</div>
                `;
                itemsContainer.appendChild(itemDiv);
            });
        } else {
            itemsContainer.innerHTML =
                '<div class="text-center text-gray-500 text-xs py-4">No items in transaction</div>';
        }

        // Update totals
        if (totals) {
            subtotalEl.textContent = `$${totals.subtotal}`;
            taxEl.textContent = `$${totals.tax}`;
            totalEl.textContent = `$${totals.total}`;
        }

        this.logEvent("receipt-update", "Receipt preview updated");
    }
}

/**
 * Scale Input Control - Weight-based input
 *
 * Digital scale interface that shows weight in pounds and calculates
 * total price based on price per unit. Includes tare functionality.
 *
 * @class ScaleInputControl
 * @extends Control
 * @example
 * {
 *   type: 'scale-input',
 *   UID: 'produce-scale',
 *   props: { pricePerUnit: 2.99 }
 * }
 *
 * @fires weightChanged - When weight reading changes
 * @fires scaleTared - When scale is tared
 */
export class ScaleInputControl extends Control {
    constructor(definition) {
        super(definition);
        this.currentWeight = 0;
        this.pricePerUnit = this.props.pricePerUnit || 0;
    }

    createElement() {
        const element = document.createElement("div");
        element.id = this.UID;
        element.className = this.getBaseClasses();
        element.setAttribute("data-testid", `scale-input-${this.UID}`);

        element.innerHTML = `
            <div class="text-center p-6">
                <div class="mb-4">
                    <svg class="w-16 h-16 mx-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                </div>
                <h3 class="font-semibold mb-2">Digital Scale</h3>
                <div class="text-3xl font-bold text-blue-600 mb-2" data-testid="weight-display-${this.UID}">0.00 lbs</div>
                <div class="text-sm text-muted-foreground mb-4">
                    Price per lb: $<span data-testid="price-per-unit-${this.UID}">${this.pricePerUnit.toFixed(2)}</span>
                </div>
                <div class="text-lg font-semibold">
                    Total: $<span data-testid="scale-total-${this.UID}">0.00</span>
                </div>
                <button class="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90" data-testid="tare-button-${this.UID}">
                    Tare Scale
                </button>
            </div>
        `;

        return element;
    }

    getBaseClasses() {
        return "scale-input bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg shadow-sm";
    }

    attachEvents() {
        const tareButton = this.element.querySelector(
            `[data-testid="tare-button-${this.UID}"]`,
        );

        tareButton.addEventListener("click", () => {
            this.tareScale();
        });

        // Simulate weight changes for demo
        this.startWeightSimulation();
    }

    startWeightSimulation() {
        // Simulate random weight fluctuations for demo purposes
        setInterval(() => {
            const baseWeight = 0;
            const variation = (Math.random() - 0.5) * 0.1; // Small random variation
            this.updateWeight(baseWeight + variation);
        }, 1000);
    }

    updateWeight(weight) {
        this.currentWeight = Math.max(0, weight);
        const total = this.currentWeight * this.pricePerUnit;

        const weightDisplay = this.element.querySelector(
            `[data-testid="weight-display-${this.UID}"]`,
        );
        const totalDisplay = this.element.querySelector(
            `[data-testid="scale-total-${this.UID}"]`,
        );

        weightDisplay.textContent = `${this.currentWeight.toFixed(2)} lbs`;
        totalDisplay.textContent = total.toFixed(2);

        this.setState({ weight: this.currentWeight, total: total.toFixed(2) });
        this.emit("weightChanged", {
            weight: this.currentWeight,
            total,
            UID: this.UID,
        });
    }

    tareScale() {
        this.updateWeight(0);
        this.logEvent("scale", "Scale tared");
        this.emit("scaleTared", { UID: this.UID });
    }
}

/**
 * Cash Drawer Control - Cash drawer trigger
 *
 * Button control that triggers cash drawer opening with visual feedback.
 * Includes animation effect when activated.
 *
 * @class CashDrawerControl
 * @extends Control
 * @example
 * {
 *   type: 'cash-drawer',
 *   UID: 'main-drawer'
 * }
 *
 * @fires drawerOpened - When cash drawer is triggered
 */
export class CashDrawerControl extends Control {
    createElement() {
        const element = document.createElement("button");
        element.id = this.UID;
        element.className = this.getBaseClasses();
        element.setAttribute("data-testid", `cash-drawer-${this.UID}`);

        element.innerHTML = `
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Open Cash Drawer
        `;

        return element;
    }

    getBaseClasses() {
        return "cash-drawer-control flex items-center px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/80 transition-colors font-medium";
    }

    attachEvents() {
        this.element.addEventListener("click", () => {
            this.openDrawer();
        });
    }

    openDrawer() {
        // Add animation effect
        this.element.classList.add("cash-drawer");

        this.logEvent("cash-drawer", "Cash drawer opened");
        this.emit("drawerOpened", { UID: this.UID });

        // Remove animation class after animation completes
        setTimeout(() => {
            this.element.classList.remove("cash-drawer");
        }, 300);
    }
}

/**
 * Device Control - Generic device interface
 *
 * Generic interface for POS hardware devices like printers, scanners, scales.
 * Shows connection status and provides connect/disconnect functionality.
 *
 * @class DeviceControlControl
 * @extends Control
 * @example
 * {
 *   type: 'device-control',
 *   UID: 'receipt-printer',
 *   props: { deviceType: 'printer' }
 * }
 *
 * Supported device types: printer, scanner, scale, terminal, display
 *
 * @fires deviceConnected - When device connects
 * @fires deviceDisconnected - When device disconnects
 */
export class DeviceControlControl extends Control {
    constructor(definition) {
        super(definition);
        this.deviceType = this.props.deviceType || "generic";
        this.deviceStatus = "disconnected";
    }

    createElement() {
        const element = document.createElement("div");
        element.id = this.UID;
        element.className = this.getBaseClasses();
        element.setAttribute("data-testid", `device-control-${this.UID}`);

        element.innerHTML = `
            <div class="flex items-center justify-between p-4">
                <div class="flex items-center space-x-3">
                    <div class="device-status w-3 h-3 rounded-full bg-red-500" data-testid="device-status-${this.UID}"></div>
                    <div>
                        <div class="font-medium" data-testid="device-name-${this.UID}">${this.getDeviceName()}</div>
                        <div class="text-sm text-muted-foreground" data-testid="device-status-text-${this.UID}">Disconnected</div>
                    </div>
                </div>
                <button class="px-3 py-1 text-sm border border-border rounded hover:bg-accent" data-testid="device-connect-${this.UID}">
                    Connect
                </button>
            </div>
        `;

        return element;
    }

    getBaseClasses() {
        return "device-control bg-card border border-border rounded-lg";
    }

    getDeviceName() {
        const deviceNames = {
            printer: "Receipt Printer",
            scanner: "Barcode Scanner",
            scale: "Digital Scale",
            terminal: "Payment Terminal",
            display: "Customer Display",
        };
        return deviceNames[this.deviceType] || "Generic Device";
    }

    attachEvents() {
        const connectButton = this.element.querySelector(
            `[data-testid="device-connect-${this.UID}"]`,
        );

        connectButton.addEventListener("click", () => {
            if (this.deviceStatus === "connected") {
                this.disconnect();
            } else {
                this.connect();
            }
        });
    }

    connect() {
        this.deviceStatus = "connected";
        this.updateDeviceDisplay();
        this.logEvent("device", `${this.getDeviceName()} connected`);
        this.emit("deviceConnected", {
            deviceType: this.deviceType,
            UID: this.UID,
        });
    }

    disconnect() {
        this.deviceStatus = "disconnected";
        this.updateDeviceDisplay();
        this.logEvent("device", `${this.getDeviceName()} disconnected`);
        this.emit("deviceDisconnected", {
            deviceType: this.deviceType,
            UID: this.UID,
        });
    }

    updateDeviceDisplay() {
        const statusIndicator = this.element.querySelector(
            `[data-testid="device-status-${this.UID}"]`,
        );
        const statusText = this.element.querySelector(
            `[data-testid="device-status-text-${this.UID}"]`,
        );
        const connectButton = this.element.querySelector(
            `[data-testid="device-connect-${this.UID}"]`,
        );

        if (this.deviceStatus === "connected") {
            statusIndicator.className =
                "device-status w-3 h-3 rounded-full bg-green-500";
            statusText.textContent = "Connected";
            connectButton.textContent = "Disconnect";
        } else {
            statusIndicator.className =
                "device-status w-3 h-3 rounded-full bg-red-500";
            statusText.textContent = "Disconnected";
            connectButton.textContent = "Connect";
        }
    }
}

/**
 * Context Menu Control - Right-click menu
 *
 * Right-click context menu that appears at cursor position.
 * Children become menu items with click handlers.
 *
 * @class ContextMenuControl
 * @extends Control
 * @example
 * {
 *   type: 'context-menu',
 *   UID: 'item-context-menu',
 *   children: [
 *     { UID: 'edit-item', text: 'Edit Item' },
 *     { UID: 'remove-item', text: 'Remove Item' },
 *     { UID: 'duplicate-item', text: 'Duplicate Item' }
 *   ]
 * }
 *
 * @fires menuItemSelected - When menu item is clicked
 */
export class ContextMenuControl extends Control {
    constructor(definition) {
        super(definition);
        this.isVisible = false;
        this.targetElement = null;
    }

    createElement() {
        const element = document.createElement("div");
        element.id = this.UID;
        element.className = this.getBaseClasses();
        element.setAttribute("data-testid", `context-menu-${this.UID}`);
        return element;
    }

    getBaseClasses() {
        return "context-menu hidden";
    }

    renderChildren() {
        this.element.innerHTML = "";

        this.children.forEach((childDef) => {
            const menuItem = document.createElement("div");
            menuItem.className = "context-menu-item";
            menuItem.textContent = window.ContextRenderer.render(childDef.text);
            menuItem.setAttribute(
                "data-testid",
                `context-menu-item-${childDef.UID}`,
            );

            menuItem.addEventListener("click", () => {
                this.hide();
                this.logEvent(
                    "context-menu",
                    `Context menu item ${childDef.UID} selected`,
                );
                this.emit("menuItemSelected", {
                    item: childDef,
                    UID: this.UID,
                });
            });

            this.element.appendChild(menuItem);
        });
    }

    show(x, y, targetElement) {
        this.targetElement = targetElement;
        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;
        this.element.classList.remove("hidden");
        this.isVisible = true;

        this.logEvent("context-menu", "Context menu shown");
        this.emit("menuShown", { x, y, UID: this.UID });

        // Hide menu when clicking elsewhere
        setTimeout(() => {
            document.addEventListener(
                "click",
                this.hideOnClickOutside.bind(this),
                { once: true },
            );
        }, 10);
    }

    hide() {
        this.element.classList.add("hidden");
        this.isVisible = false;
        this.targetElement = null;

        this.logEvent("context-menu", "Context menu hidden");
        this.emit("menuHidden", { UID: this.UID });
    }

    hideOnClickOutside(e) {
        if (!this.element.contains(e.target)) {
            this.hide();
        }
    }
}

// Search Bar Control - Product/item search
export class SearchBarControl extends Control {
    constructor(definition) {
        super(definition);
        this.searchResults = [];
        this.isDropdownOpen = false;
    }

    createElement() {
        const element = document.createElement("div");
        element.id = this.UID;
        element.className = this.getBaseClasses();
        element.setAttribute("data-testid", `search-bar-${this.UID}`);

        element.innerHTML = `
            <div class="relative">
                <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" class="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" placeholder="Search products..." data-testid="search-input-${this.UID}" />
                <div class="search-results absolute top-full left-0 right-0 bg-popover border border-border rounded-md shadow-lg mt-1 hidden z-10" data-testid="search-results-${this.UID}">
                </div>
            </div>
        `;

        return element;
    }

    getBaseClasses() {
        return "search-bar-control";
    }

    attachEvents() {
        const input = this.element.querySelector("input");
        const resultsContainer = this.element.querySelector(".search-results");

        input.addEventListener("input", (e) => {
            const query = e.target.value.trim();
            this.setState({ searchValue: query });

            if (query.length > 0) {
                this.performSearch(query);
            } else {
                this.hideResults();
            }

            this.logEvent("search", `Search query: ${query}`);
            this.emit("search", { query, UID: this.UID });
        });

        input.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                this.hideResults();
            }
        });

        // Hide results when clicking outside
        document.addEventListener("click", (e) => {
            if (!this.element.contains(e.target)) {
                this.hideResults();
            }
        });
    }

    performSearch(query) {
        // Mock search results
        const mockProducts = [
            { id: "001", name: "Apple iPhone 14", price: 999.99 },
            { id: "002", name: "Samsung Galaxy S23", price: 899.99 },
            { id: "003", name: "Apple MacBook Air", price: 1199.99 },
            { id: "004", name: "Dell XPS 13", price: 1099.99 },
            { id: "005", name: "Apple iPad Pro", price: 799.99 },
        ];

        this.searchResults = mockProducts.filter((product) =>
            product.name.toLowerCase().includes(query.toLowerCase()),
        );

        this.showResults();
    }

    showResults() {
        const resultsContainer = this.element.querySelector(".search-results");
        resultsContainer.innerHTML = "";

        if (this.searchResults.length === 0) {
            const noResults = document.createElement("div");
            noResults.className =
                "p-3 text-sm text-muted-foreground text-center";
            noResults.textContent = "No products found";
            resultsContainer.appendChild(noResults);
        } else {
            this.searchResults.forEach((product, index) => {
                const resultItem = document.createElement("div");
                resultItem.className =
                    "p-3 hover:bg-accent cursor-pointer border-b border-border last:border-b-0";
                resultItem.setAttribute(
                    "data-testid",
                    `search-result-${index}`,
                );

                resultItem.innerHTML = `
                    <div class="flex justify-between items-center">
                        <div>
                            <div class="font-medium">${product.name}</div>
                            <div class="text-sm text-muted-foreground">ID: ${product.id}</div>
                        </div>
                        <div class="font-semibold">$${product.price.toFixed(2)}</div>
                    </div>
                `;

                resultItem.addEventListener("click", () => {
                    this.selectProduct(product);
                });

                resultsContainer.appendChild(resultItem);
            });
        }

        resultsContainer.classList.remove("hidden");
        this.isDropdownOpen = true;
    }

    hideResults() {
        const resultsContainer = this.element.querySelector(".search-results");
        resultsContainer.classList.add("hidden");
        this.isDropdownOpen = false;
    }

    selectProduct(product) {
        const input = this.element.querySelector("input");
        input.value = product.name;
        this.hideResults();

        this.logEvent("search-select", `Product selected: ${product.name}`);
        this.emit("productSelected", { product, UID: this.UID });
    }
}

// Register special controls
if (typeof window !== "undefined") {
    window.PriceCheckerControl = PriceCheckerControl;
    window.SignaturePadControl = SignaturePadControl;
    window.ReceiptPreviewControl = ReceiptPreviewControl;
    window.ScaleInputControl = ScaleInputControl;
    window.CashDrawerControl = CashDrawerControl;
    window.DeviceControlControl = DeviceControlControl;
    window.ContextMenuControl = ContextMenuControl;
    window.SearchBarControl = SearchBarControl;
}

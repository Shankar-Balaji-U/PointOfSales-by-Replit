# POS Controls Documentation

## Overview

This POS system uses a JSON-driven UI control system that allows you to create dynamic interfaces without traditional frameworks. All controls are built in native JavaScript and can be configured entirely through JSON definitions.

## How to Use the System

### Loading a UI Definition

You can load any UI definition in three ways:

1. **Use the Load JSON button** - Paste your JSON definition into the modal
2. **Use keyboard shortcuts** - Ctrl+L for basic demo, Ctrl+Shift+L for POS demo
3. **Programmatically** - Call `pos.loadUIDefinition(yourJsonObject)`

### Control Structure

Every control follows this basic structure:

```json
{
  "type": "control-type",
  "UID": "unique-identifier",
  "title": "Optional title",
  "text": "Display text",
  "placeholder": "Input placeholder",
  "value": "Initial value",
  "disabled": false,
  "visible": true,
  "props": {
    "controlSpecificProperties": "here"
  },
  "style": {
    "cssProperty": "value"
  },
  "children": [
    "childControlDefinitions"
  ]
}
```

## Control Types Reference

### Structural Controls

#### Panel Control
Container with optional header for grouping content.
```json
{
  "type": "panel",
  "UID": "my-panel",
  "title": "Panel Title",
  "style": {"padding": "20px"},
  "children": []
}
```

#### Tab Control
Tabbed interface where each child becomes a tab.
```json
{
  "type": "tab-control",
  "UID": "main-tabs",
  "children": [
    {"title": "Tab 1", "type": "panel", "children": []},
    {"title": "Tab 2", "type": "panel", "children": []}
  ]
}
```

#### Grid Layout Control
CSS Grid container for organizing controls in rows and columns.
```json
{
  "type": "grid-layout",
  "UID": "product-grid",
  "style": {"rows": 3, "columns": 4, "gap": "10px"},
  "children": []
}
```

#### Section Control
Simple grouping container with optional heading.
```json
{
  "type": "section",
  "UID": "payment-section",
  "title": "Payment Options",
  "children": []
}
```

#### Splitter Control
Resizable panes with draggable splitter.
```json
{
  "type": "splitter",
  "UID": "main-split",
  "props": {"splitRatio": 0.6, "orientation": "horizontal"},
  "children": [
    {"type": "panel", "children": []},
    {"type": "panel", "children": []}
  ]
}
```

#### DataGrid Control
Table with sortable columns and data binding.
```json
{
  "type": "datagrid",
  "UID": "sales-data",
  "props": {
    "columns": [
      {"key": "id", "title": "ID"},
      {"key": "name", "title": "Product Name"}
    ],
    "data": [
      {"id": "001", "name": "Coffee Mug"}
    ]
  }
}
```

### Input Controls

#### TextBox Control
Basic text input with placeholder support.
```json
{
  "type": "textbox",
  "UID": "customer-name",
  "placeholder": "Enter customer name...",
  "value": "John Doe"
}
```

#### Numeric Input Control
Number input with min/max validation.
```json
{
  "type": "numeric-input",
  "UID": "quantity",
  "placeholder": "Quantity",
  "props": {"min": 1, "max": 999, "step": 1},
  "value": "1"
}
```

#### Password Control
Password input with show/hide toggle.
```json
{
  "type": "password",
  "UID": "admin-password",
  "placeholder": "Enter password..."
}
```

#### Barcode Input Control
Specialized input for barcode scanning.
```json
{
  "type": "barcode-input",
  "UID": "product-scanner",
  "placeholder": "Scan or type barcode..."
}
```

#### Dropdown Control
Select dropdown with configurable options.
```json
{
  "type": "dropdown",
  "UID": "payment-method",
  "placeholder": "Select payment method...",
  "props": {
    "options": [
      {"value": "cash", "label": "Cash"},
      {"value": "card", "label": "Credit Card"},
      "Check"
    ]
  }
}
```

#### Date Picker Control
HTML5 date input control.
```json
{
  "type": "datepicker",
  "UID": "transaction-date",
  "value": "2024-01-15"
}
```

#### Toggle Control
Switch/toggle button with smooth animations.
```json
{
  "type": "toggle",
  "UID": "tax-exempt",
  "text": "Tax Exempt Customer",
  "props": {"checked": false}
}
```

#### Search Bar Control
Enhanced search input with icon.
```json
{
  "type": "search-bar",
  "UID": "product-search",
  "placeholder": "Search products..."
}
```

### Action Controls

#### Button Control
Versatile button with multiple variants and sizes.
```json
{
  "type": "button",
  "UID": "submit-btn",
  "text": "Process Payment",
  "props": {
    "variant": "primary",
    "size": "lg",
    "icon": "<svg>...</svg>",
    "action": {"type": "custom", "handler": "processPayment"}
  }
}
```

**Variants**: primary, secondary, destructive, outline, ghost
**Sizes**: sm, default, lg

#### Button Pad Control
Grid of buttons for number pads or quick access.
```json
{
  "type": "button-pad",
  "UID": "number-pad",
  "props": {"rows": 4, "columns": 3},
  "children": [
    {"type": "button", "text": "1"},
    {"type": "button", "text": "2"}
  ]
}
```

#### Menu Button Control
Button with dropdown menu functionality.
```json
{
  "type": "menu-button",
  "UID": "actions-menu",
  "text": "Actions",
  "children": [
    {"UID": "void-item", "text": "Void Transaction"},
    {"UID": "hold-item", "text": "Hold Transaction"}
  ]
}
```

#### Shortcut Keys Control
Invisible control for keyboard shortcuts.
```json
{
  "type": "shortcut-keys",
  "UID": "global-shortcuts",
  "props": {
    "shortcuts": [
      {"keys": "ctrl+s", "action": "saveTransaction"},
      {"keys": "f1", "action": "showHelp"}
    ]
  }
}
```

### Display Controls

#### Label Control
Text display with multiple variants.
```json
{
  "type": "label",
  "UID": "welcome-message",
  "text": "Welcome #{UserName}!",
  "props": {
    "variant": "heading",
    "size": "default"
  }
}
```

**Variants**: heading, subtitle, caption, default

#### Message Box Control
Modal dialog for alerts and confirmations.
```json
{
  "type": "message-box",
  "UID": "error-dialog",
  "title": "Transaction Error",
  "text": "Unable to process payment.",
  "props": {"type": "error"}
}
```

#### Status Bar Control
Application status display with indicator.
```json
{
  "type": "status-bar",
  "UID": "app-status"
}
```

#### Notification Area Control
Toast notifications container.
```json
{
  "type": "notification-area",
  "UID": "app-notifications"
}
```

#### Image Control
Image display with configurable dimensions.
```json
{
  "type": "image",
  "UID": "product-image",
  "props": {
    "src": "/images/product.jpg",
    "alt": "Product Image",
    "width": "200px",
    "height": "150px"
  }
}
```

### Transaction Controls

#### Cart Grid Control
Shopping cart display with item management.
```json
{
  "type": "cart-grid",
  "UID": "shopping-cart",
  "props": {
    "items": [
      {"id": "001", "name": "Coffee", "price": 3.99, "quantity": 2},
      {"id": "002", "name": "Muffin", "price": 2.49, "quantity": 1}
    ]
  }
}
```

#### Totals Display Control
Transaction totals with subtotal, tax, and total.
```json
{
  "type": "totals-display",
  "UID": "transaction-totals"
}
```

#### Payment Control
Payment method selection interface.
```json
{
  "type": "payment-control",
  "UID": "payment-interface"
}
```

#### Change Due Display Control
Calculates and displays change due.
```json
{
  "type": "change-due-display",
  "UID": "change-calculator"
}
```

#### Customer Info Panel Control
Customer details display and editing.
```json
{
  "type": "customer-info-panel",
  "UID": "customer-details",
  "props": {
    "customer": {
      "name": "Jane Smith",
      "id": "CUST001",
      "phone": "(555) 123-4567",
      "email": "jane@example.com"
    }
  }
}
```

### Special POS Controls

#### Price Checker Control
Product price lookup interface.
```json
{
  "type": "price-checker",
  "UID": "customer-price-check"
}
```

#### Signature Pad Control
Digital signature capture using HTML5 Canvas.
```json
{
  "type": "signature-pad",
  "UID": "customer-signature"
}
```

#### Receipt Preview Control
Transaction receipt display.
```json
{
  "type": "receipt-preview",
  "UID": "receipt-display"
}
```

#### Scale Input Control
Weight-based input with price calculation.
```json
{
  "type": "scale-input",
  "UID": "produce-scale",
  "props": {"pricePerUnit": 2.99}
}
```

#### Cash Drawer Control
Cash drawer trigger button.
```json
{
  "type": "cash-drawer",
  "UID": "main-drawer"
}
```

#### Device Control
Generic POS hardware device interface.
```json
{
  "type": "device-control",
  "UID": "receipt-printer",
  "props": {"deviceType": "printer"}
}
```

**Device Types**: printer, scanner, scale, terminal, display

#### Context Menu Control
Right-click context menu.
```json
{
  "type": "context-menu",
  "UID": "item-context-menu",
  "children": [
    {"UID": "edit-item", "text": "Edit Item"},
    {"UID": "remove-item", "text": "Remove Item"}
  ]
}
```

## Context Rendering

The system supports dynamic text replacement using placeholders:

### Supported Syntaxes
- `#{variable}` - Primary syntax
- `${variable}` - Alternative syntax  
- `{{variable}}` - Alternative syntax

### Built-in Context Variables
- `#{StoreName}` - Store name
- `#{StoreAddress}` - Store address
- `#{StorePhone}` - Store phone number
- `#{CashierName}` - Current cashier name
- `#{RegisterNumber}` - Register/terminal number
- `#{UserName}` - Current user name
- `#{UserID}` - Current user ID
- `#{AppVersion}` - Application version
- `#{CurrentDate}` - Current date
- `#{CurrentTime}` - Current time (updates every second)
- `#{CurrentDateTime}` - Current date and time

### Helper Functions
- `#{variable|uppercase}` - Convert to uppercase
- `#{variable|lowercase}` - Convert to lowercase
- `#{variable|currency}` - Format as currency
- `#{variable|date}` - Format as date

## Event System

All controls emit events that can be handled by the application:

### Common Events
- `click` - Button clicks
- `input` - Text input changes
- `focus`/`blur` - Focus events
- `change` - Value changes

### POS-Specific Events
- `barcodeScanned` - Barcode input
- `productSelected` - Product selection
- `paymentMethodSelected` - Payment method choice
- `itemAdded`/`itemRemoved` - Cart operations
- `totalsUpdated` - Total calculations
- `drawerOpened` - Cash drawer operations
- `signatureSaved` - Signature capture

## State Management

The system includes a reactive state management system:

```javascript
// Set state
StateManager.setState('userName', 'John Doe');

// Subscribe to changes
const unsubscribe = StateManager.subscribe('userName', (newValue, oldValue) => {
  console.log(`Name changed from ${oldValue} to ${newValue}`);
});

// Create computed values
const fullNameComputed = StateManager.computed(
  ['firstName', 'lastName'],
  (first, last) => `${first} ${last}`
);
```

## Designer Mode

Toggle designer mode (Ctrl+D) to see:
- Control outlines and type indicators
- UID labels for debugging
- Event information tooltips
- Property and state inspection

## Keyboard Shortcuts

- **Ctrl+D** - Toggle Designer Mode
- **Ctrl+L** - Load Demo UI
- **Ctrl+Shift+L** - Load POS Demo
- **Ctrl+Shift+C** - Clear UI
- **Ctrl+E** - Export Application State
- **F1** - Show Help
- **F5** - Refresh Application

## CSS Variables and Theming

The system uses CSS custom properties for theming:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  /* ... more variables */
}
```

## Styling Guidelines

### Control Variants
Most controls support these standard variants:
- **primary** - Main action style
- **secondary** - Secondary action style
- **destructive** - Dangerous actions (red)
- **outline** - Outlined style
- **ghost** - Minimal style

### Sizes
- **sm** - Small size
- **default** - Standard size
- **lg** - Large size

### Colors
Use semantic color classes:
- `text-foreground` - Primary text
- `text-muted-foreground` - Secondary text
- `bg-card` - Card backgrounds
- `border-border` - Standard borders
- `bg-primary` - Primary actions
- `bg-destructive` - Error/danger states

## Example Usage

Here's a complete example of a simple POS interface:

```json
{
  "type": "panel",
  "UID": "simple-pos",
  "title": "Simple POS Interface",
  "children": [
    {
      "type": "barcode-input",
      "UID": "scanner",
      "placeholder": "Scan product..."
    },
    {
      "type": "cart-grid",
      "UID": "cart",
      "props": {
        "items": []
      }
    },
    {
      "type": "totals-display",
      "UID": "totals"
    },
    {
      "type": "payment-control",
      "UID": "payment"
    }
  ]
}
```

## Error Handling

The system includes comprehensive error handling:

- **Validation** - All JSON definitions are validated before rendering
- **Runtime Errors** - JavaScript errors are caught and logged
- **Control Errors** - Individual control failures are isolated
- **State Errors** - State management errors are tracked

## Performance Features

- **Lazy Loading** - Controls are created only when needed
- **Event Delegation** - Efficient event handling
- **State Caching** - Context rendering is cached for performance
- **Memory Management** - Controls properly clean up when destroyed

## Testing Your Controls

1. Load the comprehensive demo JSON (see `comprehensive-pos-demo.json`)
2. Test all control interactions
3. Toggle Designer Mode to inspect control behavior
4. Check the event log for proper event emission
5. Export application state to see the complete system status

This system provides a flexible, powerful foundation for building any POS interface configuration you need!
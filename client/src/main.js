// Import all modules
import { Control } from './controls/base-control.js';
import './controls/structural-controls.js';
import './controls/input-controls.js';
import './controls/action-controls.js';
import './controls/display-controls.js';
import './controls/transaction-controls.js';
import './controls/special-controls.js';
import { ControlFactory } from './core/control-factory.js';
import { StateManager } from './core/state-manager.js';
import { ContextRenderer } from './core/context-renderer.js';
import { NotificationSystem } from './core/notification-system.js';
import { DomUtilities } from './core/dom-utilities.js';
import { Validation } from './core/validation.js';
import { DataManager } from './core/data-manager.js';
import { EventHandler } from './core/event-handler.js';
import { POSApplication } from './pos-application.js';

// Sample JSON UI Definitions
const uiDefinition = {
  type: 'panel',
  UID: 'main-panel',
  title: 'Welcome #{UserName} - Version #{AppVersion}',
  style: {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '20px'
  },
  children: [
    {
      type: 'grid-layout',
      UID: 'main-grid',
      style: { rows: 3, columns: 2, gap: '15px' },
      children: [
        { 
          type: 'button', 
          UID: 'btn-hello', 
          text: 'Hello #{UserName}!' 
        },
        { 
          type: 'textbox', 
          UID: 'input-name', 
          placeholder: 'Enter your name...' 
        },
        { 
          type: 'button', 
          UID: 'btn-date', 
          text: 'Today is #{CurrentDate}' 
        },
        { 
          type: 'search-bar', 
          UID: 'search-products' 
        },
        {
          type: 'panel',
          UID: 'sub-panel',
          title: 'User: #{UserID}',
          children: [
            { 
              type: 'button', 
              UID: 'btn-version', 
              text: 'App v#{AppVersion}' 
            }
          ]
        },
        {
          type: 'dropdown',
          UID: 'payment-methods',
          props: {
            options: ['Cash', 'Credit Card', 'Debit Card', 'Digital Wallet']
          }
        }
      ]
    }
  ]
};

// Enhanced POS demo definition
const posUIDefinition = {
  type: 'grid-layout',
  UID: 'pos-main-layout',
  style: { rows: 1, columns: 2, gap: '20px' },
  children: [
    {
      type: 'panel',
      UID: 'transaction-panel',
      title: 'Current Transaction',
      children: [
        {
          type: 'search-bar',
          UID: 'product-search'
        },
        {
          type: 'cart-grid',
          UID: 'shopping-cart'
        },
        {
          type: 'totals-display',
          UID: 'transaction-totals'
        }
      ]
    },
    {
      type: 'panel',
      UID: 'payment-panel',
      title: 'Payment & Receipt',
      children: [
        {
          type: 'payment-control',
          UID: 'payment-methods'
        },
        {
          type: 'cash-drawer',
          UID: 'cash-drawer-btn'
        },
        {
          type: 'receipt-preview',
          UID: 'receipt-display'
        },
        {
          type: 'signature-pad',
          UID: 'customer-signature'
        }
      ]
    }
  ]
};

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.posApp = new POSApplication();
  
  // Auto-load demo after 2 seconds
  setTimeout(() => {
    window.posApp.loadUIDefinition(uiDefinition);
    NotificationSystem.show('Demo UI auto-loaded', 'success');
  }, 2000);
});

// Comprehensive POS demo definition showcasing all controls
const comprehensivePOSDefinition = {
  "type": "splitter",
  "UID": "main-pos-interface",
  "title": "Complete POS System Demo - All Controls",
  "props": {
    "splitRatio": 0.7,
    "orientation": "horizontal"
  },
  "style": {
    "height": "100vh",
    "background": "var(--background)"
  },
  "children": [
    {
      "type": "tab-control",
      "UID": "pos-tabs",
      "style": {
        "height": "100%"
      },
      "children": [
        {
          "title": "Sales Terminal",
          "type": "panel",
          "UID": "sales-panel",
          "children": [
            {
              "type": "grid-layout",
              "UID": "sales-grid",
              "style": {
                "rows": 2,
                "columns": 2,
                "gap": "15px",
                "height": "100%"
              },
              "children": [
                {
                  "type": "section",
                  "UID": "product-section",
                  "title": "Product Entry",
                  "children": [
                    {
                      "type": "barcode-input",
                      "UID": "barcode-scanner",
                      "placeholder": "Scan or enter barcode..."
                    },
                    {
                      "type": "search-bar",
                      "UID": "product-search",
                      "placeholder": "Search products by name..."
                    },
                    {
                      "type": "scale-input",
                      "UID": "produce-scale",
                      "props": {
                        "pricePerUnit": 2.99
                      }
                    }
                  ]
                },
                {
                  "type": "button-pad",
                  "UID": "number-pad",
                  "props": {
                    "rows": 4,
                    "columns": 3
                  },
                  "children": [
                    {"type": "button", "UID": "btn-1", "text": "1", "props": {"variant": "outline"}},
                    {"type": "button", "UID": "btn-2", "text": "2", "props": {"variant": "outline"}},
                    {"type": "button", "UID": "btn-3", "text": "3", "props": {"variant": "outline"}},
                    {"type": "button", "UID": "btn-4", "text": "4", "props": {"variant": "outline"}},
                    {"type": "button", "UID": "btn-5", "text": "5", "props": {"variant": "outline"}},
                    {"type": "button", "UID": "btn-6", "text": "6", "props": {"variant": "outline"}},
                    {"type": "button", "UID": "btn-7", "text": "7", "props": {"variant": "outline"}},
                    {"type": "button", "UID": "btn-8", "text": "8", "props": {"variant": "outline"}},
                    {"type": "button", "UID": "btn-9", "text": "9", "props": {"variant": "outline"}},
                    {"type": "button", "UID": "btn-clear", "text": "Clear", "props": {"variant": "destructive"}},
                    {"type": "button", "UID": "btn-0", "text": "0", "props": {"variant": "outline"}},
                    {"type": "button", "UID": "btn-enter", "text": "Enter", "props": {"variant": "default"}}
                  ]
                },
                {
                  "type": "cart-grid",
                  "UID": "shopping-cart",
                  "props": {
                    "items": [
                      {"id": "001", "name": "Coffee Mug", "price": 12.99, "quantity": 2},
                      {"id": "002", "name": "Notebook", "price": 5.49, "quantity": 1}
                    ]
                  }
                },
                {
                  "type": "section",
                  "UID": "quick-actions",
                  "title": "Quick Actions",
                  "children": [
                    {
                      "type": "menu-button",
                      "UID": "transaction-menu",
                      "text": "Transaction",
                      "props": {"variant": "secondary"},
                      "children": [
                        {type: "button", "UID": "void-transaction", "text": "Void Transaction"},
                        {type: "button", "UID": "hold-transaction", "text": "Hold Transaction"}
                      ]
                    },
                    {
                      "type": "cash-drawer",
                      "UID": "cash-drawer-btn"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "title": "Payment",
          "type": "panel",
          "UID": "payment-panel",
          "children": [
            {
              "type": "grid-layout",
              "UID": "payment-grid",
              "style": {
                "rows": 2,
                "columns": 2,
                "gap": "20px"
              },
              "children": [
                {
                  "type": "totals-display",
                  "UID": "transaction-totals"
                },
                {
                  "type": "payment-control",
                  "UID": "payment-methods"
                },
                {
                  "type": "change-due-display",
                  "UID": "change-calculator"
                },
                {
                  "type": "toggle",
                  "UID": "tax-exempt",
                  "text": "Tax Exempt",
                  "props": {"checked": false}
                }
              ]
            }
          ]
        },
        {
          "title": "Input Demo",
          "type": "panel",
          "UID": "input-demo-panel",
          "children": [
            {
              "type": "textbox",
              "UID": "demo-textbox",
              "placeholder": "Text input...",
              "value": "Sample"
            },
            {
              "type": "numeric-input",
              "UID": "demo-numeric",
              "placeholder": "Number...",
              "props": {"min": 0, "max": 100}
            },
            {
              "type": "password",
              "UID": "demo-password",
              "placeholder": "Password..."
            },
            {
              "type": "datepicker",
              "UID": "demo-date",
              "value": "2024-01-15"
            }
          ]
        }
      ]
    },
    {
      "type": "panel",
      "UID": "right-panel",
      "title": "Receipt & Status",
      "children": [
        {
          "type": "receipt-preview",
          "UID": "receipt-display"
        },
        {
          "type": "signature-pad",
          "UID": "customer-signature"
        },
        {
          "type": "status-bar",
          "UID": "pos-status"
        }
      ]
    }
  ]
};

// Make utilities globally available
window.DomUtilities = DomUtilities;
window.Validation = Validation;
window.DataManager = DataManager;
window.EventHandler = EventHandler;

// Export for global access
window.uiDefinition = uiDefinition;
window.posUIDefinition = posUIDefinition;
window.comprehensivePOSDefinition = comprehensivePOSDefinition;

# PointOfSales-by-Replit

Prompt
Build a **dynamic Point of Sale (POS) website** using **native JavaScript (no frameworks)**.

### Requirements:

1. The POS should support a **UI control system** where controls are defined in JSON and rendered dynamically into the DOM.

2. Implement the following **POS controls**:

   * **Structural / Layout Controls** → Panel, Tab Control, Grid/DataGrid, Section, Splitter.
   * **Input Controls** → TextBox, Numeric Input, Password, Barcode Input, Dropdown, Date Picker, Toggle.
   * **Action Controls** → Button, Button Pad, Menu Button, Shortcut Keys.
   * **Display Controls** → Label, Message Box, Status Bar, Notification Area, Image/Icon.
   * **Transaction Controls** → Cart Grid, Totals Display, Payment Control, Change Due Display, Customer Info Panel.
   * **Lookup & Navigation Controls** → Search Bar, Menu Panel, Lookup Popup.
   * **Special Controls** → Price Checker, Signature Pad, Receipt Preview, Scale Input, Cash Drawer Trigger, Device Control, Context Menu.

3. Each control should:

   * Be implemented as a **class extending a base `Control` class**.
   * Have `UID`, `props`, `state`, and `children`.
   * Render itself into the DOM dynamically.
   * Support **state updates** (`setState`) and **event dispatching**.
   * Be attachable to parent controls.

4. Implement a **`ControlFactory`** that creates controls dynamically from JSON definitions.

5. Implement a **`StateManager`** to manage global POS state and reactively update controls.

6. Implement a **`ContextRenderer`** to replace placeholders (e.g., `"Welcome #{UserName}"`) with values from a context object.

7. Add a **Designer Mode** that outlines controls and shows tooltips with metadata.

### Sample JSON UI Definition:

```js
const uiDefinition = {
  type: 'panel',
  UID: 'main-panel',
  title: 'Welcome #{UserName} - Version #{AppVersion}',
  style: {
    background: '#f8f9fa',
    border: '2px solid #007bff',
    borderRadius: '12px',
    padding: '20px'
  },
  children: [
    {
      type: 'grid-layout',
      UID: 'main-grid',
      style: { rows: 2, columns: 2, gap: '15px' },
      children: [
        { type: 'button', UID: 'btn-1', text: 'Hello #{UserName}!' },
        { type: 'input', UID: 'input-1', placeholder: 'Enter your name...' },
        { type: 'button', UID: 'btn-2', text: 'Today is #{CurrentDate}' },
        {
          type: 'panel',
          UID: 'sub-panel',
          title: 'User: #{UserID}',
          children: [
            { type: 'button', UID: 'btn-3', text: 'App v#{AppVersion}' }
          ]
        }
      ]
    }
  ]
};
```

### Deliverables:

* An **HTML page** with a main container.
* A **JavaScript implementation** of the POS control system (Control classes, ControlFactory, StateManager, ContextRenderer, Designer Mode).
* CSS for clean, modern POS styling (panels, buttons, grids, inputs).
* Event logging area to track control events (clicks, input, state changes).
* A demo that loads the sample JSON definition and renders a functional POS UI.

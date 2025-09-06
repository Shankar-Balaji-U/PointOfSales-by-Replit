import { Control } from './base-control.js';

/**
 * Panel Control - Container with optional header
 * 
 * A versatile container control that can display content with an optional header.
 * Perfect for grouping related controls and organizing the UI layout.
 * 
 * @class PanelControl
 * @extends Control
 * @example
 * {
 *   type: 'panel',
 *   UID: 'main-panel',
 *   title: 'Transaction Details',
 *   style: { padding: '20px', background: '#f8f9fa' },
 *   children: [
 *     { type: 'button', text: 'Submit' },
 *     { type: 'input', placeholder: 'Enter amount' }
 *   ]
 * }
 */
export class PanelControl extends Control {
    createElement() {
        const element = document.createElement('div');
        element.id = this.UID;
        element.className = this.getBaseClasses();
        element.setAttribute('data-testid', `panel-${this.UID}`);
        
        if (this.title) {
            const header = document.createElement('div');
            header.className = 'panel-header bg-muted/50 px-4 py-2 border-b border-border font-medium';
            header.textContent = window.ContextRenderer.render(this.title);
            element.appendChild(header);
            
            const content = document.createElement('div');
            content.className = 'panel-content p-4';
            element.appendChild(content);
            
            // Override appendChild to target content area
            const originalAppendChild = element.appendChild;
            element.appendChild = (child) => {
                if (child !== header && child !== content) {
                    content.appendChild(child);
                } else {
                    originalAppendChild.call(element, child);
                }
            };
        }
        
        return element;
    }

    getBaseClasses() {
        return 'panel-control bg-card border border-border rounded-lg shadow-sm overflow-hidden';
    }
}

/**
 * Tab Control - Tabbed interface
 * 
 * Creates a tabbed interface where users can switch between different content panels.
 * Each child becomes a separate tab with its own content area.
 * 
 * @class TabControl
 * @extends Control
 * @example
 * {
 *   type: 'tab-control',
 *   UID: 'main-tabs',
 *   children: [
 *     { title: 'Products', type: 'panel', children: [...] },
 *     { title: 'Customers', type: 'panel', children: [...] },
 *     { title: 'Reports', type: 'panel', children: [...] }
 *   ]
 * }
 */
export class TabControl extends Control {
    constructor(definition) {
        super(definition);
        this.activeTab = 0;
    }

    createElement() {
        const element = document.createElement('div');
        element.id = this.UID;
        element.className = this.getBaseClasses();
        element.setAttribute('data-testid', `tab-control-${this.UID}`);
        
        // Create tab headers
        const tabHeader = document.createElement('div');
        tabHeader.className = 'tab-header';
        
        this.children.forEach((child, index) => {
            const tabButton = document.createElement('button');
            tabButton.className = `tab-button ${index === this.activeTab ? 'active' : ''}`;
            tabButton.textContent = child.title || `Tab ${index + 1}`;
            tabButton.setAttribute('data-testid', `tab-button-${index}`);
            tabButton.addEventListener('click', () => this.switchTab(index));
            tabHeader.appendChild(tabButton);
        });
        
        // Create tab content area
        const tabContent = document.createElement('div');
        tabContent.className = 'tab-content';
        tabContent.setAttribute('data-testid', `tab-content-${this.UID}`);
        
        element.appendChild(tabHeader);
        element.appendChild(tabContent);
        
        return element;
    }

    getBaseClasses() {
        return 'tab-control bg-card border border-border rounded-lg overflow-hidden';
    }

    renderChildren() {
        // Render only the active tab
        const tabContent = this.element.querySelector('.tab-content');
        tabContent.innerHTML = '';
        
        if (this.children[this.activeTab]) {
            const activeChild = window.ControlFactory.create(this.children[this.activeTab]);
            activeChild.parent = this;
            this.childControls = [activeChild];
            const childElement = activeChild.render();
            tabContent.appendChild(childElement);
        }
    }

    switchTab(index) {
        if (index < 0 || index >= this.children.length) return;
        
        this.activeTab = index;
        
        // Update tab button states
        const tabButtons = this.element.querySelectorAll('.tab-button');
        tabButtons.forEach((btn, i) => {
            btn.classList.toggle('active', i === index);
        });
        
        // Re-render children
        this.renderChildren();
        
        this.logEvent('tab-switch', `Switched to tab ${index}`);
        this.emit('tabChange', { activeTab: index, UID: this.UID });
    }
}

/**
 * Grid Layout Control - CSS Grid container
 * 
 * Creates a CSS Grid layout for organizing child controls in rows and columns.
 * Automatically distributes children across the grid cells.
 * 
 * @class GridLayoutControl
 * @extends Control
 * @example
 * {
 *   type: 'grid-layout',
 *   UID: 'product-grid',
 *   style: { rows: 3, columns: 4, gap: '10px' },
 *   children: [
 *     { type: 'button', text: 'Item 1' },
 *     { type: 'button', text: 'Item 2' },
 *     // ... up to 12 items for 3x4 grid
 *   ]
 * }
 */
export class GridLayoutControl extends Control {
    createElement() {
        const element = document.createElement('div');
        element.id = this.UID;
        element.className = this.getBaseClasses();
        element.setAttribute('data-testid', `grid-layout-${this.UID}`);
        
        const rows = this.style.rows || 2;
        const columns = this.style.columns || 2;
        const gap = this.style.gap || '1rem';
        
        element.style.display = 'grid';
        element.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        element.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        element.style.gap = gap;
        
        return element;
    }

    getBaseClasses() {
        return 'grid-layout-control';
    }
}

/**
 * Section Control - Simple grouping container
 * 
 * A semantic grouping container with optional heading.
 * Provides vertical spacing between child elements.
 * 
 * @class SectionControl
 * @extends Control
 * @example
 * {
 *   type: 'section',
 *   UID: 'payment-section',
 *   title: 'Payment Options',
 *   children: [
 *     { type: 'button', text: 'Cash' },
 *     { type: 'button', text: 'Credit Card' }
 *   ]
 * }
 */
export class SectionControl extends Control {
    createElement() {
        const element = document.createElement('section');
        element.id = this.UID;
        element.className = this.getBaseClasses();
        element.setAttribute('data-testid', `section-${this.UID}`);
        
        if (this.title) {
            const header = document.createElement('h3');
            header.className = 'section-header text-lg font-semibold mb-4';
            header.textContent = window.ContextRenderer.render(this.title);
            element.appendChild(header);
        }
        
        return element;
    }

    getBaseClasses() {
        return 'section-control space-y-4';
    }
}

/**
 * Splitter Control - Resizable panes
 * 
 * Creates two resizable panes separated by a draggable splitter handle.
 * Users can adjust the split ratio by dragging the handle.
 * 
 * @class SplitterControl
 * @extends Control
 * @example
 * {
 *   type: 'splitter',
 *   UID: 'main-split',
 *   props: {
 *     splitRatio: 0.6,
 *     orientation: 'horizontal'
 *   },
 *   children: [
 *     { type: 'panel', title: 'Left Pane', children: [...] },
 *     { type: 'panel', title: 'Right Pane', children: [...] }
 *   ]
 * }
 */
export class SplitterControl extends Control {
    constructor(definition) {
        super(definition);
        this.splitRatio = this.props.splitRatio || 0.5;
        this.orientation = this.props.orientation || 'horizontal';
    }

    createElement() {
        const element = document.createElement('div');
        element.id = this.UID;
        element.className = this.getBaseClasses();
        element.setAttribute('data-testid', `splitter-${this.UID}`);
        
        if (this.orientation === 'horizontal') {
            element.style.flexDirection = 'row';
        } else {
            element.style.flexDirection = 'column';
        }
        
        return element;
    }

    getBaseClasses() {
        return 'splitter flex h-full';
    }

    renderChildren() {
        if (this.children.length >= 2) {
            // Render first pane
            const firstPane = document.createElement('div');
            firstPane.className = 'splitter-pane flex-1';
            firstPane.style.flex = this.splitRatio;
            
            const firstChild = window.ControlFactory.create(this.children[0]);
            firstChild.parent = this;
            this.childControls.push(firstChild);
            firstPane.appendChild(firstChild.render());
            
            // Render splitter handle
            const handle = document.createElement('div');
            handle.className = 'splitter-handle';
            handle.setAttribute('data-testid', `splitter-handle-${this.UID}`);
            this.attachSplitterEvents(handle);
            
            // Render second pane
            const secondPane = document.createElement('div');
            secondPane.className = 'splitter-pane flex-1';
            secondPane.style.flex = 1 - this.splitRatio;
            
            const secondChild = window.ControlFactory.create(this.children[1]);
            secondChild.parent = this;
            this.childControls.push(secondChild);
            secondPane.appendChild(secondChild.render());
            
            this.element.appendChild(firstPane);
            this.element.appendChild(handle);
            this.element.appendChild(secondPane);
        }
    }

    attachSplitterEvents(handle) {
        let isDragging = false;
        let startPos = 0;
        let startRatio = this.splitRatio;

        handle.addEventListener('mousedown', (e) => {
            isDragging = true;
            startPos = this.orientation === 'horizontal' ? e.clientX : e.clientY;
            startRatio = this.splitRatio;
            document.body.style.cursor = this.orientation === 'horizontal' ? 'col-resize' : 'row-resize';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const currentPos = this.orientation === 'horizontal' ? e.clientX : e.clientY;
            const containerSize = this.orientation === 'horizontal' ? 
                this.element.offsetWidth : this.element.offsetHeight;
            
            const delta = (currentPos - startPos) / containerSize;
            this.splitRatio = Math.max(0.1, Math.min(0.9, startRatio + delta));
            
            // Update pane sizes
            const panes = this.element.querySelectorAll('.splitter-pane');
            if (panes.length >= 2) {
                panes[0].style.flex = this.splitRatio;
                panes[1].style.flex = 1 - this.splitRatio;
            }
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                document.body.style.cursor = '';
                this.logEvent('splitter', `Split ratio changed to ${this.splitRatio.toFixed(2)}`);
            }
        });
    }
}

/**
 * DataGrid Control - Table with data binding
 * 
 * Displays tabular data with sorting capabilities. Supports column definitions
 * and automatic data rendering with click-to-sort functionality.
 * 
 * @class DataGridControl
 * @extends Control
 * @example
 * {
 *   type: 'datagrid',
 *   UID: 'sales-data',
 *   props: {
 *     columns: [
 *       { key: 'id', title: 'ID' },
 *       { key: 'name', title: 'Product Name' },
 *       { key: 'price', title: 'Price' }
 *     ],
 *     data: [
 *       { id: '001', name: 'Coffee Mug', price: 12.99 },
 *       { id: '002', name: 'Notebook', price: 5.49 }
 *     ]
 *   }
 * }
 */
export class DataGridControl extends Control {
    constructor(definition) {
        super(definition);
        this.columns = this.props.columns || [];
        this.data = this.props.data || [];
        this.sortColumn = null;
        this.sortDirection = 'asc';
    }

    createElement() {
        const element = document.createElement('div');
        element.id = this.UID;
        element.className = this.getBaseClasses();
        element.setAttribute('data-testid', `datagrid-${this.UID}`);
        
        const table = document.createElement('table');
        table.className = 'w-full text-sm';
        
        // Create header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headerRow.className = 'border-b border-border';
        
        this.columns.forEach((column, index) => {
            const th = document.createElement('th');
            th.className = 'text-left py-2 px-3 font-medium cursor-pointer hover:bg-muted/50';
            th.textContent = column.title || column.key;
            th.setAttribute('data-testid', `header-${column.key}`);
            th.addEventListener('click', () => this.sortByColumn(column.key));
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        
        // Create body
        const tbody = document.createElement('tbody');
        tbody.id = `${this.UID}-body`;
        tbody.setAttribute('data-testid', `datagrid-body-${this.UID}`);
        
        table.appendChild(thead);
        table.appendChild(tbody);
        element.appendChild(table);
        
        this.renderData();
        
        return element;
    }

    getBaseClasses() {
        return 'datagrid-control bg-card border border-border rounded-lg overflow-hidden';
    }

    renderData() {
        const tbody = this.element.querySelector('tbody');
        tbody.innerHTML = '';
        
        let sortedData = [...this.data];
        if (this.sortColumn) {
            sortedData.sort((a, b) => {
                const aVal = a[this.sortColumn];
                const bVal = b[this.sortColumn];
                const modifier = this.sortDirection === 'asc' ? 1 : -1;
                
                if (aVal < bVal) return -1 * modifier;
                if (aVal > bVal) return 1 * modifier;
                return 0;
            });
        }
        
        sortedData.forEach((row, rowIndex) => {
            const tr = document.createElement('tr');
            tr.className = 'border-b border-border hover:bg-muted/30';
            tr.setAttribute('data-testid', `row-${rowIndex}`);
            
            this.columns.forEach(column => {
                const td = document.createElement('td');
                td.className = 'py-2 px-3';
                td.textContent = row[column.key] || '';
                td.setAttribute('data-testid', `cell-${column.key}-${rowIndex}`);
                tr.appendChild(td);
            });
            
            tbody.appendChild(tr);
        });
    }

    sortByColumn(columnKey) {
        if (this.sortColumn === columnKey) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = columnKey;
            this.sortDirection = 'asc';
        }
        
        this.renderData();
        this.logEvent('sort', `Sorted by ${columnKey} ${this.sortDirection}`);
    }

    setData(newData) {
        this.data = newData;
        this.renderData();
        this.logEvent('data-update', `Data updated: ${newData.length} rows`);
    }
}

// Register structural controls
if (typeof window !== 'undefined') {
    window.PanelControl = PanelControl;
    window.TabControl = TabControl;
    window.GridLayoutControl = GridLayoutControl;
    window.SectionControl = SectionControl;
    window.SplitterControl = SplitterControl;
    window.DataGridControl = DataGridControl;
}

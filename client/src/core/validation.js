/**
 * Validation System - Bootstrap-inspired validation utilities
 *
 * Provides comprehensive validation for control definitions, properties,
 * and runtime values with detailed error reporting and recovery mechanisms.
 *
 * @class Validation
 */
export class Validation {
    static REQUIRED_CONTROL_PROPERTIES = ["type"];
    static VALID_CONTROL_TYPES = new Set([
        // Structural
        "panel",
        "tab-control",
        "grid-layout",
        "section",
        "splitter",
        "datagrid",
        // Input
        "textbox",
        "numeric-input",
        "password",
        "barcode-input",
        "dropdown",
        "datepicker",
        "toggle",
        "search-bar",
        // Action
        "button",
        "button-pad",
        "menu-button",
        "shortcut-keys",
        // Display
        "label",
        "message-box",
        "status-bar",
        "notification-area",
        "image",
        // Transaction
        "cart-grid",
        "totals-display",
        "payment-control",
        "change-due-display",
        "customer-info-panel",
        // Special
        "price-checker",
        "signature-pad",
        "receipt-preview",
        "scale-input",
        "cash-drawer",
        "device-control",
        "context-menu",
    ]);

    static BUTTON_VARIANTS = new Set([
        "primary",
        "secondary",
        "destructive",
        "outline",
        "ghost",
        "default",
    ]);
    static BUTTON_SIZES = new Set(["sm", "default", "lg"]);
    static LABEL_VARIANTS = new Set([
        "heading",
        "subtitle",
        "caption",
        "default",
    ]);
    static DEVICE_TYPES = new Set([
        "printer",
        "scanner",
        "scale",
        "terminal",
        "display",
    ]);

    /**
     * Validate control definition comprehensively
     * @param {Object} definition - Control definition to validate
     * @returns {Object} Validation result with errors, warnings, and sanitized definition
     */
    static validateControlDefinition(definition) {
        const result = {
            isValid: true,
            errors: [],
            warnings: [],
            sanitizedDefinition: null,
        };

        try {
            // Deep clone to avoid mutations
            const sanitized = this.deepClone(definition);

            // Basic structure validation
            this.validateBasicStructure(sanitized, result);

            // Type-specific validation
            this.validateTypeSpecific(sanitized, result);

            // Properties validation
            this.validateProperties(sanitized, result);

            // Children validation (recursive)
            this.validateChildren(sanitized, result);
            console.log(result, sanitized);

            // Style validation
            this.validateStyle(sanitized, result);

            // Apply sanitization and defaults
            this.applySanitization(sanitized, result);

            result.sanitizedDefinition = sanitized;
            result.isValid = result.errors.length === 0;
        } catch (error) {
            result.errors.push(`Validation failed: ${error.message}`);
            result.isValid = false;
        }

        return result;
    }

    /**
     * Validate basic control structure
     */
    static validateBasicStructure(definition, result) {
        if (!definition || typeof definition !== "object") {
            result.errors.push("Control definition must be an object");
            return;
        }

        // Check required properties
        this.REQUIRED_CONTROL_PROPERTIES.forEach((prop) => {
            if (!definition.hasOwnProperty(prop)) {
                result.errors.push(`Missing required property: ${prop}`);
            }
        });

        // Validate type
        if (definition.type && !this.VALID_CONTROL_TYPES.has(definition.type)) {
            result.errors.push(
                `Invalid control type: ${definition.type}. Valid types: ${Array.from(this.VALID_CONTROL_TYPES).join(", ")}`,
            );
        }

        // Validate UID format
        if (definition.UID && !this.isValidUID(definition.UID)) {
            result.warnings.push(
                `UID "${definition.UID}" should be a valid identifier (alphanumeric, hyphens, underscores)`,
            );
        }

        // Check for unexpected properties
        const allowedProps = [
            "type",
            "UID",
            "title",
            "text",
            "placeholder",
            "value",
            "disabled",
            "visible",
            "props",
            "style",
            "children",
        ];
        Object.keys(definition).forEach((prop) => {
            if (!allowedProps.includes(prop)) {
                result.warnings.push(`Unexpected property: ${prop}`);
            }
        });
    }

    /**
     * Validate type-specific requirements
     */
    static validateTypeSpecific(definition, result) {
        const { type } = definition;

        switch (type) {
            case "button":
                this.validateButton(definition, result);
                break;
            case "grid-layout":
                this.validateGridLayout(definition, result);
                break;
            case "dropdown":
                this.validateDropdown(definition, result);
                break;
            case "numeric-input":
                this.validateNumericInput(definition, result);
                break;
            case "datagrid":
                this.validateDataGrid(definition, result);
                break;
            case "device-control":
                this.validateDeviceControl(definition, result);
                break;
            case "cart-grid":
                this.validateCartGrid(definition, result);
                break;
            case "label":
                this.validateLabel(definition, result);
                break;
            // Add more type-specific validations as needed
        }
    }

    /**
     * Validate button control
     */
    static validateButton(definition, result) {
        if (definition.props) {
            const { variant, size } = definition.props;

            if (variant && !this.BUTTON_VARIANTS.has(variant)) {
                result.errors.push(
                    `Invalid button variant: ${variant}. Valid variants: ${Array.from(this.BUTTON_VARIANTS).join(", ")}`,
                );
            }

            if (size && !this.BUTTON_SIZES.has(size)) {
                result.errors.push(
                    `Invalid button size: ${size}. Valid sizes: ${Array.from(this.BUTTON_SIZES).join(", ")}`,
                );
            }
        }

        if (!definition.text && !definition.props?.icon) {
            result.warnings.push("Button should have either text or icon");
        }
    }

    /**
     * Validate grid layout control
     */
    static validateGridLayout(definition, result) {
        if (definition.style) {
            const { rows, columns } = definition.style;

            if (rows && (!Number.isInteger(rows) || rows < 1)) {
                result.errors.push("Grid rows must be a positive integer");
            }

            if (columns && (!Number.isInteger(columns) || columns < 1)) {
                result.errors.push("Grid columns must be a positive integer");
            }

            if (definition.children && rows && columns) {
                const maxChildren = rows * columns;
                if (definition.children.length > maxChildren) {
                    result.warnings.push(
                        `Grid has ${definition.children.length} children but only ${maxChildren} cells (${rows}x${columns})`,
                    );
                }
            }
        }
    }

    /**
     * Validate dropdown control
     */
    static validateDropdown(definition, result) {
        if (!definition.props?.options) {
            result.errors.push("Dropdown must have options in props");
            return;
        }

        const { options } = definition.props;
        if (!Array.isArray(options)) {
            result.errors.push("Dropdown options must be an array");
            return;
        }

        if (options.length === 0) {
            result.warnings.push("Dropdown has no options");
        }

        // Validate option format
        options.forEach((option, index) => {
            if (typeof option === "object" && option !== null) {
                if (
                    !option.hasOwnProperty("value") ||
                    !option.hasOwnProperty("label")
                ) {
                    result.errors.push(
                        `Dropdown option at index ${index} must have 'value' and 'label' properties`,
                    );
                }
            } else if (typeof option !== "string") {
                result.errors.push(
                    `Dropdown option at index ${index} must be a string or object with value/label`,
                );
            }
        });
    }

    /**
     * Validate numeric input control
     */
    static validateNumericInput(definition, result) {
        if (definition.props) {
            const { min, max, step } = definition.props;

            if (min !== undefined && !this.isNumeric(min)) {
                result.errors.push("Numeric input min must be a number");
            }

            if (max !== undefined && !this.isNumeric(max)) {
                result.errors.push("Numeric input max must be a number");
            }

            if (min !== undefined && max !== undefined && min > max) {
                result.errors.push(
                    "Numeric input min cannot be greater than max",
                );
            }

            if (step !== undefined && (!this.isNumeric(step) || step <= 0)) {
                result.errors.push(
                    "Numeric input step must be a positive number",
                );
            }
        }

        if (
            definition.value !== undefined &&
            !this.isNumeric(definition.value)
        ) {
            result.warnings.push("Numeric input value should be numeric");
        }
    }

    /**
     * Validate data grid control
     */
    static validateDataGrid(definition, result) {
        if (!definition.props?.columns) {
            result.errors.push("DataGrid must have columns in props");
            return;
        }

        const { columns, data } = definition.props;

        if (!Array.isArray(columns)) {
            result.errors.push("DataGrid columns must be an array");
            return;
        }

        // Validate column structure
        columns.forEach((column, index) => {
            if (!column.key || !column.title) {
                result.errors.push(
                    `DataGrid column at index ${index} must have 'key' and 'title' properties`,
                );
            }
        });

        // Validate data if provided
        if (data && !Array.isArray(data)) {
            result.errors.push("DataGrid data must be an array");
        }
    }

    /**
     * Validate device control
     */
    static validateDeviceControl(definition, result) {
        if (
            definition.props?.deviceType &&
            !this.DEVICE_TYPES.has(definition.props.deviceType)
        ) {
            result.errors.push(
                `Invalid device type: ${definition.props.deviceType}. Valid types: ${Array.from(this.DEVICE_TYPES).join(", ")}`,
            );
        }
    }

    /**
     * Validate cart grid control
     */
    static validateCartGrid(definition, result) {
        if (definition.props?.items) {
            const { items } = definition.props;

            if (!Array.isArray(items)) {
                result.errors.push("Cart items must be an array");
                return;
            }

            items.forEach((item, index) => {
                const requiredFields = ["id", "name", "price"];
                requiredFields.forEach((field) => {
                    if (!item.hasOwnProperty(field)) {
                        result.errors.push(
                            `Cart item at index ${index} missing required field: ${field}`,
                        );
                    }
                });

                if (item.price !== undefined && !this.isNumeric(item.price)) {
                    result.errors.push(
                        `Cart item at index ${index} price must be numeric`,
                    );
                }

                if (
                    item.quantity !== undefined &&
                    (!Number.isInteger(item.quantity) || item.quantity < 0)
                ) {
                    result.errors.push(
                        `Cart item at index ${index} quantity must be a non-negative integer`,
                    );
                }
            });
        }
    }

    /**
     * Validate label control
     */
    static validateLabel(definition, result) {
        if (
            definition.props?.variant &&
            !this.LABEL_VARIANTS.has(definition.props.variant)
        ) {
            result.errors.push(
                `Invalid label variant: ${definition.props.variant}. Valid variants: ${Array.from(this.LABEL_VARIANTS).join(", ")}`,
            );
        }
    }

    /**
     * Validate properties object
     */
    static validateProperties(definition, result) {
        if (definition.props && typeof definition.props !== "object") {
            result.errors.push("Props must be an object");
        }

        // Validate boolean properties
        ["disabled", "visible"].forEach((prop) => {
            if (
                definition.hasOwnProperty(prop) &&
                typeof definition[prop] !== "boolean"
            ) {
                result.warnings.push(`Property ${prop} should be boolean`);
            }
        });

        // Validate string properties
        ["title", "text", "placeholder", "value"].forEach((prop) => {
            if (
                definition.hasOwnProperty(prop) &&
                typeof definition[prop] !== "string"
            ) {
                result.warnings.push(`Property ${prop} should be string`);
            }
        });
    }

    /**
     * Validate children array (recursive)
     */
    static validateChildren(definition, result) {
        if (definition.children) {
            if (!Array.isArray(definition.children)) {
                result.errors.push("Children must be an array");
                return;
            }

            definition.children.forEach((child, index) => {
                const childResult = this.validateControlDefinition(child);
                if (childResult.errors.length)
                    console.log("childResult", childResult, child);
                // Propagate child errors with context
                childResult.errors.forEach((error) => {
                    result.errors.push(`Child at index ${index}: ${error}`);
                });

                childResult.warnings.forEach((warning) => {
                    result.warnings.push(`Child at index ${index}: ${warning}`);
                });
            });
        }
    }

    /**
     * Validate style object
     */
    static validateStyle(definition, result) {
        if (definition.style && typeof definition.style !== "object") {
            result.errors.push("Style must be an object");
        }
    }

    /**
     * Apply sanitization and defaults
     */
    static applySanitization(definition, result) {
        // Generate UID if missing
        if (!definition.UID) {
            definition.UID = this.generateUID(definition.type);
            result.warnings.push(`Generated UID: ${definition.UID}`);
        }

        // Set default values
        if (definition.disabled === undefined) {
            definition.disabled = false;
        }

        if (definition.visible === undefined) {
            definition.visible = true;
        }

        // Initialize props if missing
        if (!definition.props) {
            definition.props = {};
        }

        // Sanitize string values
        ["title", "text", "placeholder"].forEach((prop) => {
            if (definition[prop]) {
                definition[prop] = this.sanitizeString(definition[prop]);
            }
        });
    }

    /**
     * Helper validation methods
     */
    static isValidUID(uid) {
        return /^[a-zA-Z0-9_-]+$/.test(uid);
    }

    static isNumeric(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    }

    static sanitizeString(str) {
        if (typeof str !== "string") return str;

        // Remove potentially dangerous content
        return str
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
            .replace(/javascript:/gi, "")
            .trim();
    }

    static generateUID(type = "control") {
        return `${type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }

    static deepClone(obj) {
        if (obj === null || typeof obj !== "object") {
            return obj;
        }

        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }

        if (obj instanceof Array) {
            return obj.map((item) => this.deepClone(item));
        }

        if (typeof obj === "object") {
            const cloned = {};
            Object.keys(obj).forEach((key) => {
                cloned[key] = this.deepClone(obj[key]);
            });
            return cloned;
        }

        return obj;
    }

    /**
     * Validate runtime value for specific control type
     * @param {string} controlType - Type of control
     * @param {string} property - Property being validated
     * @param {*} value - Value to validate
     * @returns {Object} Validation result
     */
    static validateRuntimeValue(controlType, property, value) {
        const result = { isValid: true, error: null, sanitizedValue: value };

        try {
            switch (controlType) {
                case "numeric-input":
                    if (
                        property === "value" &&
                        value !== "" &&
                        !this.isNumeric(value)
                    ) {
                        result.isValid = false;
                        result.error = "Value must be numeric";
                        result.sanitizedValue = "";
                    }
                    break;

                case "datepicker":
                    if (
                        property === "value" &&
                        value &&
                        !this.isValidDate(value)
                    ) {
                        result.isValid = false;
                        result.error = "Value must be a valid date";
                        result.sanitizedValue = "";
                    }
                    break;

                case "toggle":
                    if (property === "checked" && typeof value !== "boolean") {
                        result.sanitizedValue = Boolean(value);
                    }
                    break;

                default:
                    // Generic string sanitization
                    if (typeof value === "string") {
                        result.sanitizedValue = this.sanitizeString(value);
                    }
            }
        } catch (error) {
            result.isValid = false;
            result.error = `Validation error: ${error.message}`;
        }

        return result;
    }

    static isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    }
}

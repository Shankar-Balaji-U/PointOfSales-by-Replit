# Overview

This is a dynamic Point of Sale (POS) system built with a React frontend and Express.js backend. The application features a unique JSON-driven UI control system that allows for dynamic creation and rendering of POS controls without traditional frameworks. The system includes comprehensive control types for retail operations including structural layouts, input controls, transaction management, and specialized POS hardware integration.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Dynamic Control System**: The core frontend is built around a custom control framework that renders UI components dynamically from JSON definitions. This allows for flexible POS interface creation without hardcoded layouts.

**Base Control Framework**: All UI controls extend from a base `Control` class that provides common functionality including state management, event handling, DOM rendering, and child control management. Each control has a unique identifier (UID), properties, state, and event system.

**Control Factory Pattern**: A `ControlFactory` creates control instances dynamically from JSON definitions, supporting over 20 different control types including panels, grids, buttons, inputs, cart displays, and specialized POS controls like barcode scanners and signature pads.

**Reactive State Management**: A centralized `StateManager` handles global application state with subscription-based updates. Controls can subscribe to state changes and automatically re-render when relevant data updates.

**Context Rendering System**: A `ContextRenderer` processes placeholder variables in text (like `#{UserName}` or `${CurrentDate}`) and replaces them with actual values from a context object, enabling dynamic content display.

**Designer Mode**: The system includes a special mode that adds visual indicators and metadata tooltips to controls for development and debugging purposes.

## Backend Architecture

**Express.js Server**: Simple REST API server with middleware for request logging and error handling. The server serves both API endpoints and static frontend assets.

**Development Integration**: Vite integration for hot module replacement and development server functionality. The server conditionally sets up Vite middleware in development mode.

**Modular Route System**: Routes are organized in a separate module with placeholder structure for POS-specific endpoints.

## Data Storage

**Drizzle ORM**: Database access layer using Drizzle ORM configured for PostgreSQL with schema definitions in TypeScript.

**In-Memory Storage**: Development storage interface using a Map-based implementation for user management during development.

**Database Schema**: Simple user schema with UUID primary keys and username/password fields, designed to be extended for POS-specific data.

## UI Component System

**Shadcn/ui Integration**: Comprehensive UI component library built on Radix UI primitives with Tailwind CSS styling. Includes components for forms, dialogs, navigation, data display, and feedback.

**Tailwind CSS**: Utility-first CSS framework with custom design tokens for consistent theming. Configuration includes custom color schemes, border radius, and responsive breakpoints.

**TypeScript Support**: Full TypeScript integration with proper type definitions for components, API calls, and data structures.

## Development Tools

**Hot Reloading**: Vite-powered development server with fast refresh and error overlay for debugging.

**Type Safety**: TypeScript configuration with strict mode enabled and path aliases for clean imports.

**Build Pipeline**: Production build process that bundles both frontend React application and backend Express server.

# External Dependencies

**Database**: PostgreSQL database configured through Neon serverless connection for production deployment.

**UI Libraries**: 
- Radix UI primitives for accessible component foundations
- Tailwind CSS for styling and responsive design
- Lucide React for iconography

**State Management**: TanStack React Query for server state management and caching.

**Form Handling**: React Hook Form with Zod validation for type-safe form processing.

**Development Tools**:
- Vite for development server and build tooling
- ESBuild for backend bundling
- Replit-specific plugins for development environment integration

**Routing**: Wouter for client-side routing with minimal bundle size.

**Date Handling**: date-fns library for date manipulation and formatting.

**Session Management**: PostgreSQL session store for user session persistence.
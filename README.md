# Obsidian v3.0 - Enterprise Resource Planning System

[![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)](https://github.com/VersaLabs/obsidian)
[![Next.js](https://img.shields.io/badge/Next.js-16.0.10-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)](https://www.typescriptlang.org/)
[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)

> **Obsidian v3.0** is a modern, enterprise-grade ERP system specifically designed for manufacturing and printing industries. Built with cutting-edge technology stack and schema-first architecture, it provides comprehensive business management capabilities from lead to cash collection.

## 🏭 About Obsidian

Obsidian is a proprietary enterprise resource planning system developed by **VersaLabs** for the manufacturing and printing industry. It transforms traditional job shop operations into streamlined, digital workflows through:

- **Lead-to-Cash Automation**: Complete sales pipeline from customer inquiry to payment collection
- **Manufacturing Execution**: Real-time production tracking with inventory management
- **Financial Control**: Double-entry bookkeeping with automated journal entries
- **Multi-Tenant Architecture**: Scalable for growing businesses

### 🎯 Key Features

- **Schema-First Architecture**: Auto-generated TypeScript types from Frappe backend
- **Dual Theme System**: Professional light/dark modes with smooth transitions
- **Factory Pattern Implementation**: Zero-boilerplate CRUD operations
- **Premium UI/UX**: Big Tech aesthetic with micro-interactions and animations
- **Real-Time Data**: Live updates with optimistic UI patterns
- **Mobile Responsive**: Enterprise-grade responsive design
- **Print-Optimized**: Professional document layouts and printing workflows

## 🏗️ Architecture Overview

### Core Philosophy: Schema-First Development

Obsidian v3.0 pioneered a revolutionary **"Schema-First"** approach that eliminates type drift between frontend and backend:

```
Frappe DocType (Backend) → Type Generation → TypeScript + Zod → Factory Patterns → UI Components
```

### Key Architectural Patterns

| Pattern | Purpose | Benefit |
|---------|---------|---------|
| **Schema-First Types** | Auto-generate TS interfaces from Frappe metadata | 100% type safety, zero manual types |
| **Factory Pattern** | Generic CRUD hooks and API routes | 75% reduction in boilerplate code |
| **Centralized Configuration** | Single source of truth for DocType metadata | Consistent routing and queries |
| **Generic Hooks** | DocType-agnostic data fetching | Reusable across all modules |

### Directory Structure

```
obsidian/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes (factory-based)
│   │   ├── stock/
│   │   ├── crm/
│   │   ├── sales/
│   │   ├── manufacturing/
│   │   └── accounting/
│   ├── stock/                    # Stock management pages
│   ├── crm/                      # Customer relationship pages
│   ├── sales/                    # Sales pipeline pages
│   ├── manufacturing/            # Production management pages
│   └── accounting/               # Financial management pages
│
├── components/                   # Reusable UI components
│   ├── ui/                       # Base shadcn/ui components
│   ├── smart/                    # Frappe-aware components
│   └── form/                     # Form field wrappers
│
├── hooks/                        # Custom React hooks
│   └── generic/                  # DocType-agnostic hooks
│
├── lib/                          # Core business logic
│   ├── doctype-config.ts         # ⭐ CENTRAL DOCTYPE REGISTRY
│   ├── query-keys.ts             # React Query key factory
│   ├── api-factory.ts            # API route generators
│   ├── schemas/                  # Zod validation schemas
│   └── theme-context.tsx         # Theme management
│
├── types/                        # Generated TypeScript interfaces
└── docs/v3/                      # Architecture documentation
```

## 🛠️ Technology Stack

### Core Framework
- **Next.js 16.0.10** - Full-stack React framework with App Router
- **React 19.2.3** - Latest React with concurrent features
- **TypeScript 5.9.3** - Strict type checking and advanced language features

### State Management & Data
- **TanStack Query v5** - Server state management with caching
- **React Hook Form v7** - Performant forms with validation
- **Zod v3** - Runtime type validation and schema parsing
- **Frappe JS SDK v1.10.0** - Official Frappe API client

### UI/UX & Styling
- **Tailwind CSS v4.1.10** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Framer Motion v12** - Smooth animations and transitions
- **Lucide React** - Consistent iconography
- **Sonner** - Toast notifications

### Development Tools
- **ESLint** - Code linting and formatting
- **PostCSS** - CSS processing and optimization
- **TypeScript ESLint** - Type-aware linting rules

### Key Dependencies
```json
{
  "next": "16.0.10",
  "react": "^19.2.3",
  "typescript": "5.9.3",
  "@tanstack/react-query": "^5.90.7",
  "frappe-js-sdk": "^1.10.0",
  "tailwindcss": "^4.1.10",
  "zod": "^3.25.76"
}
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** - Runtime environment
- **pnpm** - Package manager (recommended)
- **Frappe/ERPNext** - Backend instance (v15+)
- **Git** - Version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/VersaLabs/obsidian.git
   cd obsidian
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment configuration**
   ```bash
   cp .env.example .env.local
   ```

   Configure your environment variables:
   ```env
   NEXT_PUBLIC_FRAPPE_URL=https://your-frappe-instance.com
   NEXT_PUBLIC_FRAPPE_API_KEY=your_api_key
   NEXT_PUBLIC_FRAPPE_API_SECRET=your_api_secret
   ```

4. **Generate types from Frappe**
   ```bash
   pnpm generate-types --all
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

6. **Access the application**
   ```
   http://localhost:3000
   ```

## 📊 Module Overview

### 🏢 CRM Module (Customer Relationship Management)
- **Lead Management**: Convert inquiries to customers
- **Customer Profiles**: Comprehensive customer data
- **Contact Management**: Multiple contacts per customer
- **Address Management**: Billing and shipping addresses
- **Dynamic Linking**: Cross-module relationships

### 💰 Sales Module (Revenue Generation)
- **Quotation Management**: Professional quote creation
- **Sales Order Processing**: Order fulfillment workflow
- **Sales Team Management**: Commission tracking
- **Sales Partners**: External agent management
- **Terms & Conditions**: Standard legal templates

### 🏭 Manufacturing Module (Production Control)
- **Bill of Materials**: Recipe management with operations
- **Work Order Management**: Production job tracking
- **Workstation Planning**: Machine capacity and costs
- **Operation Sequencing**: Production step management
- **Material Requirements**: Automated procurement planning

### 📦 Inventory Module (Stock Management)
- **Warehouse Management**: Multi-location inventory
- **Stock Entry System**: Comprehensive movement tracking
- **Material Request**: Procurement workflow
- **Stock Valuation**: Real-time inventory costing
- **Stock Balance**: Live availability checking

### 💼 Accounting Module (Financial Control)
- **Sales Invoice**: Revenue recognition
- **Purchase Invoice**: Expense booking
- **Payment Entry**: Universal cash handler
- **Journal Entry**: Manual adjustments
- **Chart of Accounts**: Hierarchical account structure
- **Cost Centers**: Profit center tracking

## 🔌 API Architecture

### Route Structure
```
API Base: /api/{module}/{doctype}/
├── GET    # List documents with filtering/pagination
├── POST   # Create new document
└── [name]/
    ├── GET    # Fetch single document
    ├── PUT    # Update existing document
    └── DELETE # Remove document
```

### Example API Usage

```typescript
// List customers with filters
GET /api/crm/customer?filters=[["customer_group","=","Premium"]]&limit=50

// Create new customer
POST /api/crm/customer
{
  "customer_name": "ABC Corp",
  "customer_group": "Commercial",
  "territory": "Addis Ababa"
}

// Update customer
PUT /api/crm/customer/CUST-0001
{
  "customer_name": "ABC Corporation"
}
```

### Generic Hooks Usage

```typescript
import { useFrappeList, useFrappeCreate, useFrappeDoc } from "@/hooks/generic";

// List hook
const { data: customers, isLoading } = useFrappeList<Customer>("Customer", {
  filters: [["status", "=", "Active"]],
  limit: 100
});

// Create hook
const createMutation = useFrappeCreate<Customer>("Customer");

// Document hook
const { data: customer } = useFrappeDoc<Customer>("Customer", "CUST-0001");
```

## 🎨 UI/UX Design System

### Theme System
- **OKLCH Color Space**: Perceptually uniform colors
- **Smooth Transitions**: 200ms theme switching
- **CSS Custom Properties**: Runtime color updates
- **System Preference**: Auto-detects OS theme

### Component Library
- **shadcn/ui**: Accessible, customizable components
- **Smart Components**: Frappe-aware UI patterns
- **Form Components**: Consistent input handling
- **Layout Components**: Responsive navigation

### Key UI Patterns
- **PageHeader**: Floating header with search and actions
- **DataPoint**: Read-only data display (detail pages)
- **FormInput**: Consistent form field styling
- **InfoCard**: Information display with icons
- **ConfirmDialog**: Premium confirmation dialogs

## 🔒 Security & Performance

### Security Features
- **Type Safety**: Runtime validation with Zod
- **API Authentication**: Frappe token-based auth
- **Input Sanitization**: XSS prevention
- **Rate Limiting**: API request throttling
- **Audit Trail**: Change tracking and logging

### Performance Optimizations
- **Code Splitting**: Route-based chunk loading
- **Query Caching**: Intelligent data caching
- **Optimistic Updates**: Immediate UI feedback
- **Lazy Loading**: Component-level code splitting
- **Bundle Analysis**: Size monitoring and optimization

## 🧪 Development & Testing

### Development Commands
```bash
# Development server with turbopack
pnpm dev

# Build for production
pnpm build

# Type checking
pnpm type-check

# Linting
pnpm lint

# Generate types from Frappe
pnpm generate-types --all
```

### Code Quality
- **ESLint Configuration**: Strict TypeScript rules
- **Pre-commit Hooks**: Automated code quality checks
- **Type Coverage**: 100% TypeScript adoption
- **Accessibility**: WCAG AA compliance

### Testing Strategy
- **Unit Tests**: Component and utility testing
- **Integration Tests**: API route validation
- **E2E Tests**: Critical user workflows
- **Performance Tests**: Load and stress testing

## 📈 Deployment & Production

### Build Process
```bash
# Production build
pnpm build

# Start production server
pnpm start
```

### Environment Configuration
- **Environment Variables**: Secure configuration
- **Build Optimization**: Tree shaking and minification
- **CDN Integration**: Static asset optimization
- **Monitoring**: Error tracking and performance monitoring

### Recommended Hosting
- **Vercel**: Optimal Next.js deployment
- **AWS Amplify**: Enterprise-grade scaling
- **Docker**: Containerized deployment
- **Kubernetes**: Orchestrated scaling

## 📚 Documentation

### Developer Resources
- [Architecture Guide](docs/v3/ARCHITECTURE_V3.md) - Complete technical architecture
- [Module Creation Workflow](docs/v3/MODULE_CREATION_WORKFLOW.md) - Step-by-step module development
- [Theme System](docs/v3/THEME_SYSTEM.md) - UI/UX design system
- [Business Logic](docs/v3/business-logic/) - Module-specific workflows

### API Documentation
- [Generic Hooks](hooks/generic/) - Reusable data fetching
- [API Factory](lib/api-factory.ts) - Route generation patterns
- [DocType Config](lib/doctype-config.ts) - Centralized metadata

### ADR (Architecture Decision Records)
- [ADR Log](docs/ADR.md) - Key architectural decisions and reasoning

## 🤝 Contributing

### Development Process
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards
- **TypeScript Strict Mode**: All type checking enabled
- **ESLint Rules**: Consistent code formatting
- **Prettier Config**: Automated code formatting
- **Commit Messages**: Conventional commits format

### Review Process
- **Code Review**: Required for all changes
- **Testing**: Automated and manual testing
- **Documentation**: Update docs for API changes
- **Performance**: No performance regressions

## 📞 Support & Contact

### Enterprise Support
- **Email**: support@versalabs.com
- **Documentation**: https://docs.obsidian.com
- **Issue Tracker**: https://github.com/VersaLabs/obsidian/issues

### Service Level Agreement
- **Priority Support**: 24/7 for critical issues
- **Response Time**: <4 hours for P1 issues
- **Update Frequency**: Regular security patches
- **Training**: On-site and remote training options

## 📋 Roadmap

### Phase F: Delivery Note & Logistics (Q2 2026)
- Gate pass printing system
- Driver and vehicle management
- Logistics tracking dashboard
- Partial delivery support

### Phase G: Accounting & Finance (Q3 2026)
- Complete double-entry bookkeeping
- Accounts receivable/payable automation
- Payment reconciliation system
- Financial reporting suite

### Future Enhancements
- **AI-Powered Forecasting**: Demand prediction and inventory optimization
- **IoT Integration**: Real-time machine monitoring
- **Advanced Analytics**: Business intelligence dashboard
- **Mobile App**: Native iOS/Android applications

## 📄 License

**Proprietary Software** - Copyright © 2026 VersaLabs. All rights reserved.

This software is proprietary to VersaLabs and is not licensed for external use, modification, or distribution without explicit written permission from VersaLabs.

## 🙏 Acknowledgments

- **Frappe Framework**: Powerful backend foundation
- **Next.js Community**: Modern React development
- **Open Source Contributors**: UI libraries and tools
- **VersaLabs Team**: Enterprise-grade implementation

---

**Built with ❤️ by VersaLabs - Transforming Manufacturing Operations**

[🌐 Live Demo](https://demo.obsidian.com) • [📖 Documentation](https://docs.obsidian.com) • [🐛 Report Issues](https://github.com/VersaLabs/obsidian/issues)
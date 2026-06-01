# Architecture Decision Records (ADR) - Pana ERP v3.0

## Overview

This document captures the key architectural decisions made during the development of Pana ERP v3.0, with a focus on Domain-Driven Design (DDD) principles applied to a modern Next.js + Frappe/ERPNext stack.

## ADR Template

Each ADR follows this format:
- **Context**: Background and business requirements
- **Decision**: What was chosen and why
- **Consequences**: Benefits and trade-offs
- **DDD Alignment**: How this aligns with DDD principles
- **Alternatives Considered**: Other options evaluated

---

## ADR 001: Schema-First Architecture with Auto-Generated Types

### Context
Traditional ERP frontends suffer from type drift between backend schemas and frontend interfaces. Frappe/ERPNext has complex DocType metadata that changes frequently, requiring manual synchronization. The team needed a way to maintain 100% type safety while reducing maintenance overhead by 70%.

### Decision
Implement a **Schema-First Architecture** where:
- TypeScript interfaces are auto-generated from Frappe DocType metadata
- Zod schemas are created for runtime validation
- Manual type definitions are forbidden
- `pnpm generate-types --all` regenerates all types on demand

### Consequences
**Benefits:**
- Zero type drift between frontend and backend
- Runtime type validation prevents invalid API calls
- 70% reduction in manual type maintenance
- Immediate feedback on schema changes

**Trade-offs:**
- Dependency on Frappe backend availability for type generation
- Learning curve for schema-first development
- Generated types can be verbose (but comprehensive)

### DDD Alignment
**Domain Integrity**: Ensures that domain models (DocTypes) are the single source of truth. Frontend aggregates reflect backend domain boundaries exactly.

**Ubiquitous Language**: Generated types enforce consistent terminology across the application. No "customer" vs "Customer" inconsistencies.

**Bounded Contexts**: Clear separation between CRM, Sales, Manufacturing contexts through type isolation.

### Alternatives Considered
- **Manual Types**: Too error-prone and high maintenance
- **Runtime Type Reflection**: Less performant, no compile-time safety
- **GraphQL Codegen**: Not applicable to REST-based Frappe API

---

## ADR 002: Factory Pattern for CRUD Operations

### Context
Each DocType requires similar CRUD operations (Create, Read, Update, Delete) with consistent patterns. Manual implementation would create 75% boilerplate code across 50+ DocTypes, leading to maintenance nightmares and inconsistency.

### Decision
Implement **Factory Pattern Architecture** with:
- `createListHandler()` for generic list APIs
- `createGetHandler()` for single document APIs
- `useFrappeList<T>()` generic hook for data fetching
- `useFrappeCreate<T>()` generic mutation hook
- Centralized configuration in `lib/doctype-config.ts`

### Consequences
**Benefits:**
- 75% reduction in API route boilerplate
- Consistent error handling and response formats
- Type-safe CRUD operations
- Easy to extend with new DocTypes

**Trade-offs:**
- Generic approach limits custom business logic per DocType
- Learning curve for factory pattern implementation
- Some performance overhead from generic wrappers

### DDD Alignment
**Repository Pattern**: Generic hooks act as repositories, abstracting data access logic. `useFrappeList<Item>("Item")` is equivalent to `itemRepository.findAll()`.

**Aggregate Roots**: Factory functions ensure operations go through proper aggregate boundaries, maintaining domain invariants.

**Application Services**: Generic hooks provide application service layer abstraction.

### Alternatives Considered
- **Code Generation**: Would create too much generated code to maintain
- **Manual CRUD**: High duplication, inconsistent patterns
- **Higher-Order Components**: Less flexible than hooks pattern

---

## ADR 003: Centralized DocType Configuration Registry

### Context
DocType metadata (API paths, field names, search fields) was scattered across components and API routes. This led to inconsistencies, broken links, and maintenance issues when DocTypes changed.

### Decision
Create **Single Source of Truth** in `lib/doctype-config.ts`:
```typescript
export const DOCTYPE_CONFIG: Record<string, DocTypeConfig> = {
  Item: {
    apiPath: "stock/item",
    module: "Stock",
    labelField: "item_name",
    searchFields: ["item_code", "item_name", "description"],
    defaultSortField: "creation",
    defaultSortOrder: "desc",
  }
};
```

### Consequences
**Benefits:**
- Single place to update DocType metadata
- Consistent routing with `getApiPath()`
- Type-safe field references
- Easy cross-module navigation

**Trade-offs:**
- Import dependency across the application
- Requires discipline to update centrally
- Bundle size impact (minimal)

### DDD Alignment
**Bounded Context Mapping**: Configuration registry acts as an anti-corruption layer, mapping external Frappe contexts to internal domain language.

**Context Map**: Clear definition of relationships between bounded contexts (CRM ↔ Sales ↔ Manufacturing).

**Shared Kernel**: Common configuration shared across all contexts.

### Alternatives Considered
- **Scattered Configuration**: Led to inconsistencies
- **Database-Driven Config**: Too complex for frontend-only solution
- **Environment Variables**: Not suitable for structured metadata

---

## ADR 004: Domain-Driven Module Organization

### Context
The application needed to scale to 50+ DocTypes across multiple business domains (CRM, Sales, Manufacturing, Accounting). Traditional file organization by feature would lead to tight coupling and unclear domain boundaries.

### Decision
Organize by **Business Domain First**, then by **Technical Layer**:
```
app/
├── crm/              # Customer Relationship Domain
│   ├── customer/
│   ├── contact/
│   └── address/
├── sales/            # Sales Domain
│   ├── quotation/
│   └── sales-order/
└── manufacturing/    # Manufacturing Domain
    ├── bom/
    └── work-order/
```

### Consequences
**Benefits:**
- Clear domain boundaries
- Easy navigation by business function
- Scalable for new modules
- Natural team organization

**Trade-offs:**
- Some cross-cutting concerns span domains
- Initial learning curve for domain thinking
- Requires discipline to maintain boundaries

### DDD Alignment
**Bounded Contexts**: Each top-level folder represents a bounded context with its own domain models, services, and language.

**Domain Experts**: Folder structure aligns with business stakeholders (Sales team works in `sales/`, Manufacturing in `manufacturing/`).

**Aggregate Design**: Related aggregates grouped together within contexts.

### Alternatives Considered
- **Technical Layer Organization**: `components/`, `hooks/`, `api/` - mixes domains
- **Feature-Based**: `customer-list/`, `quotation-form/` - leads to scattered domains
- **Flat Structure**: Single level - doesn't scale

---

## ADR 005: Dual Theme System with OKLCH Colors

### Context
Enterprise users require professional appearance with accessibility compliance. Traditional CSS approaches led to inconsistent theming and poor dark mode support. The application needed Big Tech aesthetic with smooth transitions.

### Decision
Implement **OKLCH-based Theme System**:
- CSS custom properties for all colors
- Light/dark mode with system preference detection
- 200ms smooth transitions
- OKLCH color space for perceptual uniformity
- Theme persistence in localStorage

### Consequences
**Benefits:**
- Professional appearance matching Big Tech standards
- Full accessibility compliance (WCAG AA)
- Smooth user experience
- Easy customization for white-labeling

**Trade-offs:**
- CSS complexity with custom properties
- Browser compatibility considerations
- Learning curve for OKLCH color space

### DDD Alignment
**Domain Services**: Theme system as a cross-cutting domain service, providing consistent presentation layer.

**Value Objects**: Color values as immutable value objects with OKLCH representation.

**Application Layer**: Theme context as application service managing user preferences.

### Alternatives Considered
- **CSS Variables Only**: Less sophisticated color management
- **Styled Components**: Too heavy for enterprise scale
- **Tailwind Only**: Limited theme switching capabilities

---

## ADR 006: React Hook Form + Zod for Form Management

### Context
Forms are critical in ERP systems with complex validation requirements. The application needed type-safe forms with excellent UX, real-time validation, and accessibility compliance.

### Decision
Adopt **React Hook Form + Zod** stack:
- React Hook Form for performant form state management
- Zod schemas for validation (same schemas as API)
- Integrated error handling and accessibility
- Type-safe form components

### Consequences
**Benefits:**
- Excellent performance (no re-renders on change)
- Type-safe form data
- Consistent validation across frontend/backend
- Accessible form controls

**Trade-offs:**
- Learning curve for React Hook Form patterns
- Complex form state management for beginners
- Integration complexity with custom components

### DDD Alignment
**Application Services**: Form validation as application service ensuring domain invariants.

**Value Objects**: Form data as strongly-typed value objects.

**Domain Validation**: Zod schemas enforce domain rules at application boundary.

### Alternatives Considered
- **Formik**: Older, less performant
- **Redux Forms**: Too heavy for form-only state
- **Native HTML Validation**: Poor UX and accessibility

---

## ADR 007: TanStack Query for Server State Management

### Context
ERP applications require sophisticated server state management: caching, background updates, optimistic updates, and error handling. Traditional approaches led to complex state management and poor UX.

### Decision
Implement **TanStack Query (React Query)** for all server state:
- Intelligent caching with stale-while-revalidate
- Background refetching and optimistic updates
- Request deduplication
- Error boundaries and retry logic

### Consequences
**Benefits:**
- Automatic caching and synchronization
- Optimistic UI updates
- Background data refreshing
- Excellent developer experience

**Trade-offs:**
- Learning curve for query key management
- Complex cache invalidation strategies
- Bundle size impact (acceptable)

### DDD Alignment
**Repository Pattern**: Query hooks act as repositories with caching.

**CQRS**: Clear separation of read models (queries) and write models (mutations).

**Eventual Consistency**: Background updates align with domain event patterns.

### Alternatives Considered
- **Redux Toolkit Query**: Too heavy with Redux overhead
- **SWR**: Less sophisticated caching
- **Apollo GraphQL**: Not suitable for REST APIs

---

## ADR 008: Generic Smart Components Library

### Context
UI components needed to be consistent, accessible, and theme-aware while supporting Frappe-specific patterns. Manual component creation led to inconsistency and maintenance overhead.

### Decision
Create **Smart Components Library**:
- `PageHeader` - Floating header with search/actions
- `FrappeSelect` - Async dropdown with Frappe data
- `DataPoint` - Read-only data display
- `InfoCard` - Information display with icons
- `ConfirmDialog` - Premium confirmation dialogs

### Consequences
**Benefits:**
- Consistent UI patterns across application
- Theme-aware and accessible
- Faster development with reusable components
- Maintains Big Tech aesthetic

**Trade-offs:**
- Component library maintenance overhead
- Learning curve for component usage
- Bundle size impact (minimal with tree shaking)

### DDD Alignment
**Domain Services**: Smart components as domain services providing consistent presentation.

**Application Layer**: Component abstractions hide UI complexity from domain logic.

**Ubiquitous Language**: Consistent component names reinforce domain concepts.

### Alternatives Considered
- **Pure shadcn/ui**: Lacks Frappe-specific functionality
- **Custom component library**: Too much maintenance
- **Inline styling**: Inconsistent and hard to maintain

---

## ADR 009: API Route Factory Pattern

### Context
API routes follow consistent patterns but required custom implementation for each DocType. This led to boilerplate code and inconsistent error handling.

### Decision
Implement **API Route Factories**:
```typescript
// app/api/crm/customer/route.ts
export const GET = createListHandler("Customer", {
  allowedFields: [...],
  defaultSort: { field: "creation", order: "desc" }
});
export const POST = createCreateHandler("Customer", CustomerCreateSchema);
```

### Consequences
**Benefits:**
- 75% reduction in API route boilerplate
- Consistent error responses and validation
- Type-safe API implementations
- Easy to add new DocTypes

**Trade-offs:**
- Generic approach limits custom logic per route
- Factory functions add indirection
- Error handling abstraction

### DDD Alignment
**Application Services**: API factories as application services handling HTTP concerns.

**Anti-Corruption Layer**: Factories isolate external API concerns from domain logic.

**Repository Pattern**: Consistent data access interface.

### Alternatives Considered
- **Manual API Routes**: High duplication
- **Code Generation**: Too complex to maintain
- **Generic REST Router**: Less flexible than Next.js patterns

---

## ADR 010: Linked Entity Navigation Pattern

### Context
ERP systems have complex relationships between entities (Customer → Address → Contact). Users need intuitive navigation between related records without getting lost in the application.

### Decision
Implement **Linked Entity CTA Pattern**:
- `getApiPath()` for dynamic URL resolution
- Cross-module navigation with hover effects
- SEO-friendly with proper Link components
- Consistent UI pattern for related entities

### Consequences
**Benefits:**
- Intuitive navigation between related entities
- Consistent user experience across modules
- SEO-friendly deep linking
- Easy to implement new relationships

**Trade-offs:**
- Dynamic routing complexity
- Requires centralized path management
- Cross-module coupling (acceptable for navigation)

### DDD Alignment
**Aggregate Navigation**: Clear paths between aggregate roots.

**Bounded Context Integration**: Controlled coupling between contexts for user workflows.

**Domain Relationships**: Visual representation of domain associations.

### Alternatives Considered
- **Breadcrumbs Only**: Less discoverable
- **Modal Popups**: Poor for complex relationships
- **Tab Navigation**: Doesn't scale to many relationships

---

## ADR 011: Manufacturing as First-Class Domain

### Context
Traditional ERP systems treat manufacturing as an afterthought. Pana ERP needed to put manufacturing at the center, with full shop floor control and inventory tracking.

### Decision
Design **Manufacturing-First Architecture**:
- Manufacturing domain gets equal weight to Sales/Finance
- Complete BOM → Work Order → Stock Entry workflow
- Real-time production tracking
- Cost accumulation and variance analysis

### Consequences
**Benefits:**
- True manufacturing ERP capabilities
- Real-time shop floor visibility
- Accurate cost accounting
- Competitive advantage in manufacturing sector

**Trade-offs:**
- Complex domain model
- Requires manufacturing expertise to implement
- Higher development effort

### DDD Alignment
**Core Domain**: Manufacturing as the core competitive domain for the business.

**Domain Experts**: Manufacturing engineers as key stakeholders.

**Aggregate Design**: Complex manufacturing aggregates (BOM, Work Order, Operations).

### Alternatives Considered
- **Light Manufacturing**: Insufficient for serious manufacturers
- **Third-Party Integration**: Loss of competitive advantage
- **Phased Implementation**: Manufacturing as add-on

---

## ADR 012: Accounting as Source of Truth

### Context
Many ERP systems treat accounting as a reporting afterthought. Pana ERP needed accounting as the ultimate source of truth, with all transactions posting to GL automatically.

### Decision
Implement **Accounting-Centric Design**:
- Double-entry bookkeeping for all transactions
- Automatic GL posting from business documents
- Real-time financial position visibility
- AR/AP automation with payment reconciliation

### Consequences
**Benefits:**
- Accurate financial reporting
- Audit-ready transaction trail
- Real-time financial visibility
- Regulatory compliance

**Trade-offs:**
- Complex accounting logic
- Requires accounting expertise
- Performance considerations for GL posting

### DDD Alignment
**Domain Integrity**: Accounting domain as the most critical, ensuring financial accuracy.

**Aggregate Roots**: GL entries as core aggregates with business document relationships.

**Domain Events**: Transaction posting as domain events.

### Alternatives Considered
- **Accounting as Reports**: Not suitable for financial control
- **Simplified Accounting**: Insufficient for enterprise use
- **Third-Party Accounting**: Integration complexity

---

## Summary of DDD Principles Applied

### Strategic DDD
- **Bounded Contexts**: CRM, Sales, Manufacturing, Accounting as separate contexts
- **Context Mapping**: Clear relationships and integration patterns between contexts
- **Ubiquitous Language**: Consistent terminology enforced by generated types
- **Core Domain**: Manufacturing as competitive advantage domain

### Tactical DDD
- **Aggregate Roots**: DocTypes as aggregate roots with child tables
- **Value Objects**: Generated types as immutable value objects
- **Domain Services**: Generic hooks and factories as domain services
- **Repository Pattern**: Generic CRUD hooks as repositories
- **Application Services**: API factories and form validation as application services

### Architectural Patterns
- **Anti-Corruption Layer**: Centralized configuration protecting domain integrity
- **CQRS**: Clear read/write model separation
- **Eventual Consistency**: Background updates and optimistic UI
- **Dependency Injection**: Factory patterns for testability and flexibility

---

This ADR log documents the architectural foundation of Pana ERP v3.0, ensuring that future development maintains the same high standards of domain integrity, technical excellence, and business value.
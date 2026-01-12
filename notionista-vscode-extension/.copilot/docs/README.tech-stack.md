# Copilot Tech Stack Reference Guide

> **Purpose**: This document is the authoritative reference for Copilot to query, manage, and understand the Tech Stack database in the Digital Herencia Notion workspace. Use this guide when managing technology inventory, evaluating tools, and documenting technical decisions.

---

## Quick Reference

| Property              | Type             | Description                                                              |
| --------------------- | ---------------- | ------------------------------------------------------------------------ |
| Name                  | title            | Technology name                                                          |
| Category              | select           | Type of technology (Framework, Runtime, Language, etc.)                  |
| Programming Languages | multi_select     | Languages supported (TypeScript, JavaScript, Python)                     |
| Type                  | select           | Role (UI Component, Infra, Tooling, Core, Integration, Utility, Library) |
| Tags                  | multi_select     | Flexible categorization and attributes                                   |
| Docs Link             | url              | Link to official documentation                                           |
| Edited                | last_edited_time | Auto-calculated last edit timestamp                                      |

---

## Tech Stack Database Schema

**Database ID**: `276a4e63-bf23-80e2-bbae-000b2fa9662a`

**Description**: "opiniated | atomic | composable"

### Purpose

The Tech Stack database maintains a curated, opinionated inventory of technologies used in the Competitive Advantage product. It serves as:

- Reference for technology selections
- Documentation of dependencies and integrations
- Decision tracking for architectural choices
- Knowledge base for team onboarding

### Properties

| Property                  | Type             | ID       | Description                       |
| ------------------------- | ---------------- | -------- | --------------------------------- |
| **Name**                  | title            | `title`  | Technology name (page title)      |
| **Category**              | select           | `AFWi`   | Primary technology classification |
| **Programming Languages** | multi_select     | `Er%3Bu` | Supported languages               |
| **Type**                  | select           | `U%3FRJ` | Role/classification               |
| **Tags**                  | multi_select     | `WhlK`   | Flexible categorization           |
| **Docs Link**             | url              | `zZx%3C` | Official documentation URL        |
| **Edited**                | last_edited_time | `iD%5Bz` | Auto-calculated edit timestamp    |

---

## Category Options

Select one primary category for each technology:

- **Framework**: Application frameworks (Next.js, React, Vue, etc.)
- **Runtime**: JavaScript runtimes (Node.js, Deno, Bun, etc.)
- **Language**: Programming languages (TypeScript, JavaScript, Python)
- **Database**: Database systems (PostgreSQL, MongoDB, Redis, etc.)
- **ORM**: Object-relational mappers (Prisma, Sequelize, TypeORM, etc.)
- **Auth**: Authentication/authorization (Clerk, Auth0, Supabase Auth, etc.)
- **UI / Styling**: Styling frameworks (Tailwind CSS, CSS Modules, etc.)
- **Data Visualization**: Charting/visualization (Recharts, Chart.js, etc.)
- **File Handling**: File processing (ExcelJS, React-PDF, etc.)
- **Testing**: Testing frameworks (Vitest, Playwright, Jest, etc.)
- **Forms & Validation**: Form handling (React Hook Form, Zod, etc.)
- **State / Cache**: State management (Redux, Zustand, React Query, etc.)
- **Mobile / Responsive**: Mobile/responsive utilities
- **Security**: Security tools and libraries
- **Dev Tools**: Developer utilities (ESLint, Prettier, etc.)
- **Build & Deploy**: Build and deployment tools (Vercel, GitHub Actions, etc.)
- **Date / Time**: Date/time utilities (date-fns, Day.js, etc.)
- **Utilities**: General utilities (CLSX, UUID generators, etc.)
- **Monitoring / Logging**: Monitoring and logging (Sentry, LogRocket, etc.)
- **Payments / Billing**: Payment processing (Stripe, Lemonsqueezy, etc.)

---

## Type Options

Specify the primary role/type of the technology:

- **UI Component**: Reusable UI component library (ShadCN UI, Radix, etc.)
- **Infra**: Infrastructure/DevOps (Vercel, Docker, Kubernetes, etc.)
- **Tooling**: Developer tools and utilities
- **Core**: Core library or framework dependency
- **Integration**: Integration/API library
- **Utility**: Utility function library
- **Library**: General-purpose library

---

## Programming Language Options

Select all languages the technology supports:

- **TypeScript**: Full TypeScript support
- **JavaScript**: JavaScript support
- **Python**: Python support

---

## Common Tags

Flexible tags for cross-cutting concerns:

**Frontend**: React, UI frameworks, component libraries
**Backend**: Node.js, server frameworks, APIs
**Database**: Database engines, ORMs, query builders
**DevOps**: CI/CD, deployment, infrastructure
**Testing**: Testing frameworks, assertion libraries
**State**: State management, caching, data fetching
**Build**: Build tools, bundlers, transpilers
**Auth**: Authentication, authorization, session management
**API**: API clients, REST, GraphQL, webhooks
**Security**: Security tools, cryptography, validation
**Forms**: Form handling, validation, serialization
**Tables**: Data table components and libraries
**Charts**: Data visualization and charting
**Dates**: Date/time manipulation and formatting
**Logging**: Logging, monitoring, error tracking
**Performance**: Performance optimization, metrics
**And more...** (expand as needed)

---

## MCP Operations

### Query All Technologies

```typescript
mcp_notionapi_API -
  query -
  data -
  source({
    data_source_id: '276a4e63-bf23-80e2-bbae-000b2fa9662a',
    page_size: 50,
  });
```

### Query by Category

```typescript
mcp_notionapi_API -
  query -
  data -
  source({
    data_source_id: '276a4e63-bf23-80e2-bbae-000b2fa9662a',
    filter: {
      property: 'Category',
      select: {
        equals: 'Framework',
      },
    },
  });
```

### Query by Programming Language

```typescript
mcp_notionapi_API -
  query -
  data -
  source({
    data_source_id: '276a4e63-bf23-80e2-bbae-000b2fa9662a',
    filter: {
      property: 'Programming Languages',
      multi_select: {
        contains: 'TypeScript',
      },
    },
  });
```

### Create New Technology Entry

```typescript
mcp_notionapi_API -
  post -
  page({
    parent: {
      database_id: '276a4e63-bf23-80de-8bca-e875ad74a446', // Parent database ID
    },
    properties: {
      Name: {
        title: [
          {
            text: {
              content: 'Next.js',
            },
          },
        ],
      },
      Category: {
        select: {
          name: 'Framework',
        },
      },
      'Programming Languages': {
        multi_select: [{ name: 'TypeScript' }, { name: 'JavaScript' }],
      },
      Type: {
        select: {
          name: 'Core',
        },
      },
      Tags: {
        multi_select: [{ name: 'Frontend' }, { name: 'React' }, { name: 'App Router' }],
      },
      'Docs Link': {
        url: 'https://nextjs.org',
      },
    },
  });
```

---

## Decision Documentation

When adding technologies to the stack, consider documenting:

1. **Why we chose this**: Decision rationale and alternatives evaluated
2. **Where we use it**: Specific projects/components
3. **Key features**: Critical capabilities and unique strengths
4. **Integration points**: How it connects to other technologies
5. **Learning curve**: Effort required for team onboarding
6. **Maintenance**: Version management and update frequency

---

## Current Tech Stack Organization

**Frontend Stack**:

- Framework: Next.js
- Styling: Tailwind CSS, ShadCN UI
- State: React Query, Zustand
- Forms: React Hook Form, Zod
- UI Components: Radix UI, Vaul

**Backend Stack**:

- Runtime: Node.js
- Database: PostgreSQL (Neon)
- ORM: Prisma
- Auth: Clerk
- Server: Next.js API Routes

**DevOps & Deployment**:

- Hosting: Vercel
- CI/CD: GitHub Actions
- Monitoring: Sentry, LogRocket
- Database Hosting: Neon

**Testing & Quality**:

- Unit Testing: Vitest
- E2E Testing: Playwright
- Linting: ESLint
- Formatting: Prettier

**Additional Tools**:

- Data Visualization: Recharts, Chart.js
- File Processing: ExcelJS, React-PDF
- Payments: Stripe
- Data Table: Tanstack Table

---

## Best Practices

1. **Consistency**: Use standardized categories and types
2. **Comprehensive tagging**: Use multiple tags for flexibility
3. **Documentation links**: Always include link to official docs
4. **Regular updates**: Keep version and link information current
5. **Decision rationale**: Document why specific technologies were chosen
6. **Team awareness**: Ensure team knows about tech stack choices
7. **Deprecation tracking**: Mark deprecated technologies clearly

---

## Extending the Stack

When evaluating new technologies:

1. Document the problem it solves
2. Compare with existing similar technologies
3. Evaluate learning curve and team capacity
4. Consider maintenance and long-term support
5. Test in a small project first
6. Document decision and outcomes
7. Update tech stack database with final decision

---

End of Tech Stack Reference

# Obsidian ERP v4.0 — Architecture Document (Part 3 of 4)
# AI Integration: Natural Language → System Operations

> **Product:** Obsidian ERP  
> **Company:** VersaLabs Studio  
> **Document Version:** 4.0.0  
> **Last Updated:** 2026-05-31  
> **Depends On:** Part 1 (Foundation), Part 2 (UX Revolution)

---

## Table of Contents

1. [AI Vision & Strategy](#1-ai-vision--strategy)
2. [Model Architecture & Routing](#2-model-architecture--model-routing)
3. [System Design: NL → Action Pipeline](#3-system-design-nl--action-pipeline)
4. [Tool Calling Framework](#4-tool-calling-framework)
5. [Context Resolution Engine](#5-context-resolution-engine)
6. [Action Execution Engine](#6-action-execution-engine)
7. [AI UI Components](#7-ai-ui-components)
8. [Security & Guardrails](#8-security--guardrails)
9. [Error Handling & Fallbacks](#9-error-handling--fallbacks)
10. [Testing & Evaluation](#10-testing--evaluation)

---

## 1. AI Vision & Strategy

### 1.1 What This IS

The Obsidian ERP AI layer is an **intelligent automation abstraction** over the existing ERP platform. It:

- Accepts natural language commands from users
- Resolves context (current page, recent documents, user role)
- Translates intent into concrete system operations
- Executes operations through the **same API layer** that the UI uses
- Asks for confirmation before destructive/creating operations
- Reports results in natural language

### 1.2 What This IS NOT

| Not This | Why |
|----------|-----|
| Chatbot / Customer Support | It's an internal operator tool, not external-facing |
| Data Analytics AI | It executes operations, not analysis (analytics is Phase 2) |
| Code Generator | It calls existing API endpoints, doesn't generate code |
| Autonomous Agent | It always asks for confirmation before executing |

### 1.3 Example Interactions

```
USER: "Create a sales order for Abebe Trading from their last quotation"

AI THINKS:
  1. Resolve "Abebe Trading" → Customer: "Abebe Trading PLC" (name: CUST-001)
  2. Resolve "last quotation" → Quotation: QTN-2026-042 (most recent for CUST-001)
  3. Build Sales Order payload from QTN-2026-042 data
  4. Ask user for confirmation

AI RESPONDS:
  "I'll create a Sales Order from Quotation QTN-2026-042 for Abebe Trading PLC:
   • 500x Business Cards (ETB 2.50 each)
   • 1000x Letterheads (ETB 1.80 each)
   • Total: ETB 3,050.00
   
   Shall I proceed?"

USER: "Yes"

AI EXECUTES: POST /api/sales/sales-order with auto-filled data
AI RESPONDS: "✅ Sales Order SO-2026-089 created. [View Order →]"
```

```
USER: "What orders are overdue?"

AI THINKS:
  1. Query Sales Orders where delivery_date < today AND status != "Completed"
  2. Format results

AI RESPONDS:
  "You have 3 overdue orders:
   • SO-2026-003 — Dawit K. — Due May 25 (6 days overdue) — ETB 890
   • SO-2026-005 — Meron A. — Due May 28 (3 days overdue) — ETB 12,400
   • SO-2026-011 — Henok G. — Due May 30 (1 day overdue) — ETB 5,200
   
   Would you like me to send overdue notifications to these customers?"
```

```
USER: "Submit work order WO-2026-015"

AI THINKS:
  1. Resolve WO-2026-015 → exists, status: Draft
  2. Action: Submit (status change from Draft → Submitted)
  3. Ask for confirmation

AI RESPONDS:
  "I'll submit Work Order WO-2026-015:
   • Item: Business Cards (Premium Matte)
   • Qty: 500
   • BOM: BOM-BC-001
   
   This will lock the work order and allow stock transfers. Proceed?"
```

---

## 2. Model Architecture & Routing

### 2.1 Model Selection Strategy

All AI calls route through **OpenRouter**, giving access to multiple free-tier models with automatic fallback:

```typescript
// lib/ai/ai-config.ts

export interface AIModelConfig {
  id: string;
  name: string;
  provider: string;
  tier: 'primary' | 'secondary' | 'fallback';
  strengths: string[];
  maxTokens: number;
  supportsToolCalling: boolean;
  rateLimitPerMinute: number;
}

export const AI_MODELS: AIModelConfig[] = [
  // ── PRIMARY: Fast chat and tool calling ──
  {
    id: "openai/gpt-oss-120b:free",
    name: "GPT-OSS 120B",
    provider: "OpenAI via OpenRouter",
    tier: "primary",
    strengths: ["fastest", "tool-calling", "chat"],
    maxTokens: 4096,
    supportsToolCalling: true,
    rateLimitPerMinute: 20,
  },
  {
    id: "baidu/cobuddy:free",
    name: "CoBuddy",
    provider: "Baidu via OpenRouter",
    tier: "primary",
    strengths: ["fast", "lightweight"],
    maxTokens: 4096,
    supportsToolCalling: true,
    rateLimitPerMinute: 20,
  },

  // ── SECONDARY: Reasoning and complex queries ──
  {
    id: "arcee-ai/trinity-large-thinking:free",
    name: "Trinity Large Thinking",
    provider: "Arcee AI via OpenRouter",
    tier: "secondary",
    strengths: ["reasoning", "complex-queries", "analysis"],
    maxTokens: 8192,
    supportsToolCalling: true,
    rateLimitPerMinute: 10,
  },
  {
    id: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
    name: "Nemotron 3 Nano",
    provider: "NVIDIA via OpenRouter",
    tier: "secondary",
    strengths: ["reasoning", "structured-output"],
    maxTokens: 4096,
    supportsToolCalling: true,
    rateLimitPerMinute: 10,
  },
  {
    id: "poolside/laguna-m.1:free",
    name: "Laguna M.1",
    provider: "Poolside via OpenRouter",
    tier: "secondary",
    strengths: ["lightweight", "fast"],
    maxTokens: 4096,
    supportsToolCalling: true,
    rateLimitPerMinute: 15,
  },

  // ── FALLBACK: Last resort models ──
  {
    id: "openrouter/owl-alpha",
    name: "Owl Alpha",
    provider: "OpenRouter",
    tier: "fallback",
    strengths: ["general", "reliable"],
    maxTokens: 4096,
    supportsToolCalling: false,
    rateLimitPerMinute: 30,
  },
  {
    id: "deepseek/deepseek-v4-flash:free",
    name: "DeepSeek V4 Flash",
    provider: "DeepSeek via OpenRouter",
    tier: "fallback",
    strengths: ["general", "last-resort"],
    maxTokens: 4096,
    supportsToolCalling: true,
    rateLimitPerMinute: 10,
  },
];
```

### 2.2 Model Router

```typescript
// lib/ai/ai-client.ts

export interface AIRequestOptions {
  task: 'chat' | 'tool_calling' | 'reasoning';
  messages: AIMessage[];
  tools?: AITool[];
  temperature?: number;
  maxTokens?: number;
}

export class ObsidianAIClient {
  private models: AIModelConfig[];
  private rateLimiter: Map<string, number>;

  constructor() {
    this.models = AI_MODELS;
    this.rateLimiter = new Map();
  }

  /**
   * Select the best available model for the task type.
   * Falls through tiers: primary → secondary → fallback
   */
  private selectModel(task: AIRequestOptions['task']): AIModelConfig {
    const now = Date.now();
    
    // Task-to-model mapping
    const preferenceOrder = {
      chat: ['primary', 'secondary', 'fallback'],
      tool_calling: ['primary', 'secondary', 'fallback'],
      reasoning: ['secondary', 'primary', 'fallback'],
    };

    const tiers = preferenceOrder[task];
    
    for (const tier of tiers) {
      const candidates = this.models.filter(m => 
        m.tier === tier && 
        (task !== 'tool_calling' || m.supportsToolCalling) &&
        !this.isRateLimited(m.id)
      );
      
      if (candidates.length > 0) {
        return candidates[0]; // First available in tier
      }
    }

    throw new Error('All AI models are rate-limited. Please try again shortly.');
  }

  /**
   * Send a request with automatic model fallback
   */
  async complete(options: AIRequestOptions): Promise<AIResponse> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const model = this.selectModel(options.task);
      
      try {
        const response = await this.callOpenRouter(model, options);
        this.recordUsage(model.id);
        return response;
      } catch (error) {
        lastError = error as Error;
        this.markRateLimited(model.id);
        continue; // Try next model
      }
    }

    throw lastError || new Error('AI request failed after all retries');
  }

  private async callOpenRouter(
    model: AIModelConfig, 
    options: AIRequestOptions
  ): Promise<AIResponse> {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://obsidian.versalabs.io',
        'X-Title': 'Obsidian ERP',
      },
      body: JSON.stringify({
        model: model.id,
        messages: options.messages,
        tools: options.tools,
        temperature: options.temperature ?? 0.3,
        max_tokens: options.maxTokens ?? model.maxTokens,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenRouter error: ${error.error?.message || response.statusText}`);
    }

    return response.json();
  }
}
```

### 2.3 Environment Configuration

```env
# .env.local
OPENROUTER_API_KEY=sk-or-v1-xxxxx
NEXT_PUBLIC_AI_ENABLED=true
NEXT_PUBLIC_APP_URL=https://obsidian.versalabs.io
```

---

## 3. System Design: NL → Action Pipeline

### 3.1 Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    OBSIDIAN AI PIPELINE                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  USER INPUT                                                          │
│  "Create a sales order for Abebe from their last quotation"         │
│       │                                                              │
│       ▼                                                              │
│  ┌────────────────────┐                                              │
│  │ 1. CONTEXT ENGINE  │  Resolves:                                   │
│  │                     │  • Current page/module                      │
│  │                     │  • User role & permissions                   │
│  │                     │  • Recent documents                         │
│  │                     │  • Available actions                        │
│  └─────────┬──────────┘                                              │
│            │                                                          │
│            ▼                                                          │
│  ┌────────────────────┐                                              │
│  │ 2. INTENT PARSER   │  AI Model (with tool definitions):          │
│  │   (LLM + Tools)    │  • Understands the request                  │
│  │                     │  • Selects appropriate tool(s)              │
│  │                     │  • Resolves entity references               │
│  │                     │  • Returns structured tool calls            │
│  └─────────┬──────────┘                                              │
│            │                                                          │
│            ▼                                                          │
│  ┌────────────────────┐                                              │
│  │ 3. ACTION BUILDER  │  Constructs:                                 │
│  │                     │  • API endpoint + method                    │
│  │                     │  • Request payload                          │
│  │                     │  • Confirmation message                     │
│  │                     │  • Rollback plan (if applicable)            │
│  └─────────┬──────────┘                                              │
│            │                                                          │
│            ▼                                                          │
│  ┌────────────────────┐                                              │
│  │ 4. CONFIRMATION    │  Shows user:                                 │
│  │                     │  • What will happen                         │
│  │                     │  • What data will be created/changed        │
│  │                     │  • [Confirm] / [Cancel] buttons             │
│  └─────────┬──────────┘                                              │
│            │                                                          │
│            ▼                                                          │
│  ┌────────────────────┐                                              │
│  │ 5. EXECUTOR        │  Calls:                                      │
│  │                     │  • Same Next.js API routes as UI            │
│  │                     │  • Same Frappe endpoints                    │
│  │                     │  • Same cache invalidation                  │
│  │                     │  • Returns result to user                   │
│  └─────────┬──────────┘                                              │
│            │                                                          │
│            ▼                                                          │
│  AI RESPONSE                                                         │
│  "✅ Sales Order SO-2026-089 created. [View Order →]"               │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 Request Flow (TypeScript Types)

```typescript
// types/ai-types.ts

/** User's raw input + context */
export interface AIRequest {
  message: string;
  context: AIContext;
  conversationHistory: AIMessage[];
}

/** System-resolved context */
export interface AIContext {
  currentPage: string;                    // "/sales/sales-order"
  currentDoctype?: string;                // "Sales Order"
  currentDocument?: string;               // "SO-2026-001"
  userRole: string;                       // "System Manager"
  tenantId: string;                       // For multi-tenant
  recentDocuments: RecentDocument[];      // Last 10 viewed docs
  availableActions: string[];             // Actions user can perform
}

export interface RecentDocument {
  doctype: string;
  name: string;
  labelField: string;
  lastViewed: string;
}

/** AI's parsed intent */
export interface AIIntent {
  type: 'query' | 'create' | 'update' | 'status_change' | 'navigate' | 'report';
  confidence: number;                     // 0-1
  targetDoctype: string;
  targetName?: string;
  parameters: Record<string, unknown>;
}

/** Structured action to execute */
export interface AIAction {
  id: string;
  type: 'api_call' | 'navigation' | 'notification';
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  payload?: Record<string, unknown>;
  confirmationMessage: string;
  confirmationDetails: ActionDetail[];
  requiresConfirmation: boolean;
}

export interface ActionDetail {
  label: string;
  value: string;
  type: 'text' | 'currency' | 'date' | 'list';
}

/** Final AI response to user */
export interface AIResponse {
  message: string;
  actions?: AIAction[];
  suggestions?: string[];               // Follow-up suggestions
  links?: Array<{ label: string; href: string }>;
}
```

---

## 4. Tool Calling Framework

### 4.1 Tool Definitions

The AI model receives tool definitions that map to real system operations:

```typescript
// lib/ai/ai-tools.ts

import { DOCTYPE_CONFIG } from '@/lib/doctype-config';
import type { AITool } from '@/types/ai-types';

/**
 * Generate tool definitions from DocType config.
 * This ensures the AI can only call operations that exist in the system.
 */
export function generateAITools(): AITool[] {
  const tools: AITool[] = [];

  // ── QUERY TOOLS ──
  tools.push({
    type: 'function',
    function: {
      name: 'search_documents',
      description: 'Search for documents of a specific type. Use this to find records, check statuses, or list items.',
      parameters: {
        type: 'object',
        properties: {
          doctype: {
            type: 'string',
            description: 'The document type to search',
            enum: Object.keys(DOCTYPE_CONFIG),
          },
          filters: {
            type: 'array',
            description: 'Filter conditions as [field, operator, value] tuples',
            items: {
              type: 'array',
              items: { type: 'string' },
            },
          },
          search: {
            type: 'string',
            description: 'Free-text search query',
          },
          limit: {
            type: 'number',
            description: 'Maximum results to return (default: 10)',
          },
          orderBy: {
            type: 'string',
            description: 'Field to sort by',
          },
        },
        required: ['doctype'],
      },
    },
  });

  tools.push({
    type: 'function',
    function: {
      name: 'get_document',
      description: 'Get a specific document by its name/ID. Use this to fetch details of a known record.',
      parameters: {
        type: 'object',
        properties: {
          doctype: {
            type: 'string',
            enum: Object.keys(DOCTYPE_CONFIG),
          },
          name: {
            type: 'string',
            description: 'The document name/ID',
          },
        },
        required: ['doctype', 'name'],
      },
    },
  });

  // ── CREATION TOOLS ──
  tools.push({
    type: 'function',
    function: {
      name: 'create_document',
      description: 'Create a new document. Always ask for user confirmation before calling this.',
      parameters: {
        type: 'object',
        properties: {
          doctype: {
            type: 'string',
            enum: Object.keys(DOCTYPE_CONFIG).filter(
              dt => !DOCTYPE_CONFIG[dt].isSettings
            ),
          },
          data: {
            type: 'object',
            description: 'The document data to create',
          },
          fromDocument: {
            type: 'object',
            description: 'Source document to auto-fill from',
            properties: {
              doctype: { type: 'string' },
              name: { type: 'string' },
            },
          },
        },
        required: ['doctype', 'data'],
      },
    },
  });

  // ── STATUS TOOLS ──
  tools.push({
    type: 'function',
    function: {
      name: 'update_status',
      description: 'Change the status of a document (e.g., submit, cancel, amend).',
      parameters: {
        type: 'object',
        properties: {
          doctype: { type: 'string', enum: Object.keys(DOCTYPE_CONFIG) },
          name: { type: 'string' },
          action: {
            type: 'string',
            enum: ['submit', 'cancel', 'amend'],
          },
        },
        required: ['doctype', 'name', 'action'],
      },
    },
  });

  // ── UPDATE TOOLS ──
  tools.push({
    type: 'function',
    function: {
      name: 'update_document',
      description: 'Update fields on an existing document.',
      parameters: {
        type: 'object',
        properties: {
          doctype: { type: 'string', enum: Object.keys(DOCTYPE_CONFIG) },
          name: { type: 'string' },
          updates: {
            type: 'object',
            description: 'Fields to update with new values',
          },
        },
        required: ['doctype', 'name', 'updates'],
      },
    },
  });

  // ── NAVIGATION TOOLS ──
  tools.push({
    type: 'function',
    function: {
      name: 'navigate',
      description: 'Navigate the user to a specific page or document.',
      parameters: {
        type: 'object',
        properties: {
          destination: {
            type: 'string',
            description: 'The page or document to navigate to',
          },
          doctype: { type: 'string' },
          name: { type: 'string' },
        },
        required: ['destination'],
      },
    },
  });

  // ── NOTIFICATION TOOLS ──
  tools.push({
    type: 'function',
    function: {
      name: 'send_notification',
      description: 'Send an email or system notification to a user or customer.',
      parameters: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['email', 'system'],
          },
          recipient: { type: 'string' },
          subject: { type: 'string' },
          message: { type: 'string' },
          relatedDoc: {
            type: 'object',
            properties: {
              doctype: { type: 'string' },
              name: { type: 'string' },
            },
          },
        },
        required: ['type', 'recipient', 'subject', 'message'],
      },
    },
  });

  return tools;
}
```

### 4.2 System Prompt

```typescript
// lib/ai/ai-config.ts

export const SYSTEM_PROMPT = `You are the Obsidian ERP AI Assistant, built by VersaLabs Studio.

ROLE: You help users manage their business operations through natural language. You can search documents, create records, update statuses, and navigate the system.

RULES:
1. ALWAYS ask for confirmation before creating, updating, or deleting any document.
2. NEVER fabricate data. If you don't know a value, ask the user.
3. When searching, use the search_documents tool. Don't guess document names.
4. When the user refers to "last" or "recent", use orderBy with creation desc and limit 1.
5. Format currency values in ETB (Ethiopian Birr) unless told otherwise.
6. When creating documents from upstream (e.g., SO from Quotation), use the fromDocument parameter.
7. If a request is ambiguous, ask a clarifying question instead of guessing.
8. Always include relevant links in your responses (e.g., [View Order →]).
9. You operate within the user's permissions. Don't attempt operations they can't perform.
10. Be concise but informative. Business users don't want lengthy explanations.

CONTEXT FORMAT:
- You receive the user's current page, recent documents, and available actions.
- Use this context to disambiguate references like "this order" or "the customer".

RESPONSE FORMAT:
- Use bullet points for lists.
- Use ETB for currency formatting.
- Include action links as [Label →] format.
- Suggest follow-up actions when relevant.`;
```

---

## 5. Context Resolution Engine

### 5.1 Context Builder

```typescript
// lib/ai/ai-context.ts

import { DOCTYPE_CONFIG, getApiPath } from '@/lib/doctype-config';

export class ContextEngine {
  /**
   * Build context from the user's current state.
   * Called on every AI request to provide the model with relevant context.
   */
  static buildContext(params: {
    pathname: string;
    searchParams: Record<string, string>;
    recentDocs: RecentDocument[];
    userRole: string;
    tenantId: string;
  }): AIContext {
    const { pathname, recentDocs, userRole, tenantId } = params;

    // Resolve current doctype from pathname
    const currentDoctype = this.resolveDoctype(pathname);
    const currentDocument = this.resolveDocument(pathname);

    // Determine available actions based on context
    const availableActions = this.resolveActions(currentDoctype, userRole);

    return {
      currentPage: pathname,
      currentDoctype,
      currentDocument,
      userRole,
      tenantId,
      recentDocuments: recentDocs.slice(0, 10),
      availableActions,
    };
  }

  /**
   * Resolve DocType from URL pathname.
   * Maps /sales/sales-order → "Sales Order"
   */
  private static resolveDoctype(pathname: string): string | undefined {
    // Strip leading slash and split
    const segments = pathname.replace(/^\//, '').split('/');
    
    // Try to match against doctype-config apiPaths
    for (const [doctype, config] of Object.entries(DOCTYPE_CONFIG)) {
      if (pathname.startsWith(`/${config.apiPath}`)) {
        return doctype;
      }
    }
    return undefined;
  }

  /**
   * Resolve document name from URL pathname.
   * Maps /sales/sales-order/SO-2026-001 → "SO-2026-001"
   */
  private static resolveDocument(pathname: string): string | undefined {
    const segments = pathname.split('/');
    // Document names are typically the last segment after the doctype path
    const lastSegment = segments[segments.length - 1];
    
    // Skip known path segments
    if (['new', 'edit', 'page.tsx'].includes(lastSegment)) {
      return undefined;
    }
    
    // If it looks like a document name (has uppercase or numbers), return it
    if (/[A-Z0-9-]/.test(lastSegment) && lastSegment.length > 2) {
      return decodeURIComponent(lastSegment);
    }
    
    return undefined;
  }

  /**
   * Resolve available actions based on doctype and role.
   */
  private static resolveActions(doctype: string | undefined, role: string): string[] {
    const baseActions = ['search', 'navigate'];
    
    if (!doctype) return baseActions;

    const config = DOCTYPE_CONFIG[doctype];
    if (!config) return baseActions;

    const actions = [...baseActions, 'create', 'view'];
    
    if (!config.isSettings) {
      actions.push('update', 'submit', 'cancel', 'duplicate', 'print');
    }

    // Role-based filtering (simplified — extend as needed)
    if (role === 'System Manager') {
      actions.push('delete', 'amend');
    }

    return actions;
  }
}
```

### 5.2 Entity Resolution

```typescript
// lib/ai/ai-context.ts (continued)

export class EntityResolver {
  /**
   * Resolve natural language entity references to actual document names.
   * 
   * "Abebe" → Customer: "Abebe Trading PLC"
   * "last quotation" → Quotation: "QTN-2026-042"
   * "this order" → current document from context
   */
  static async resolveEntity(
    reference: string,
    doctype: string,
    context: AIContext
  ): Promise<ResolvedEntity | null> {
    // 1. Check if it's a reference to current document
    if (['this', 'current', 'the'].some(word => reference.toLowerCase().includes(word))) {
      if (context.currentDocument && context.currentDoctype === doctype) {
        return {
          doctype,
          name: context.currentDocument,
          confidence: 1.0,
          source: 'context',
        };
      }
    }

    // 2. Check recent documents
    const recentMatch = context.recentDocuments.find(
      doc => doc.doctype === doctype && 
             doc.labelField.toLowerCase().includes(reference.toLowerCase())
    );
    if (recentMatch) {
      return {
        doctype,
        name: recentMatch.name,
        confidence: 0.9,
        source: 'recent',
      };
    }

    // 3. Search via API
    const config = DOCTYPE_CONFIG[doctype];
    if (!config) return null;

    const searchResponse = await fetch(
      `/api/${config.apiPath}?search=${encodeURIComponent(reference)}&limit=3`
    );
    const results = await searchResponse.json();

    if (results.data?.length === 1) {
      return {
        doctype,
        name: results.data[0].name,
        confidence: 0.95,
        source: 'search_exact',
      };
    }

    if (results.data?.length > 1) {
      return {
        doctype,
        name: results.data[0].name,
        confidence: 0.7,
        source: 'search_multiple',
        alternatives: results.data.map((d: Record<string, unknown>) => d.name as string),
      };
    }

    return null;
  }
}

interface ResolvedEntity {
  doctype: string;
  name: string;
  confidence: number;
  source: 'context' | 'recent' | 'search_exact' | 'search_multiple';
  alternatives?: string[];
}
```

---

## 6. Action Execution Engine

### 6.1 Executor

```typescript
// lib/ai/ai-executor.ts

import { getApiPath } from '@/lib/doctype-config';

export class ActionExecutor {
  /**
   * Execute a confirmed AI action through the standard API layer.
   * This ensures all actions go through the same validation,
   * authentication, and cache invalidation as UI actions.
   */
  static async execute(action: AIAction): Promise<ExecutionResult> {
    const { method, endpoint, payload } = action;

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: payload ? JSON.stringify(payload) : undefined,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        return {
          success: false,
          error: result.error || 'Operation failed',
          details: result.details,
        };
      }

      return {
        success: true,
        data: result.data,
        message: this.formatSuccessMessage(action, result.data),
        links: this.generateLinks(action, result.data),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Network error',
        details: (error as Error).message,
      };
    }
  }

  /**
   * Build API endpoint from doctype and action type.
   */
  static buildEndpoint(
    doctype: string,
    actionType: 'list' | 'create' | 'get' | 'update' | 'delete',
    documentName?: string
  ): string {
    const apiPath = getApiPath(doctype);
    const base = `/api/${apiPath}`;

    switch (actionType) {
      case 'list':
      case 'create':
        return base;
      case 'get':
      case 'update':
      case 'delete':
        return `${base}/${encodeURIComponent(documentName!)}`;
    }
  }

  /**
   * Format a human-readable success message.
   */
  private static formatSuccessMessage(action: AIAction, data: Record<string, unknown>): string {
    const name = data.name as string;
    
    if (action.method === 'POST') {
      return `✅ Created ${action.endpoint.split('/').slice(-1)} ${name}`;
    }
    if (action.method === 'PUT') {
      return `✅ Updated ${name}`;
    }
    if (action.method === 'DELETE') {
      return `✅ Deleted ${name}`;
    }
    return `✅ Operation completed`;
  }

  /**
   * Generate navigation links from the action result.
   */
  private static generateLinks(
    action: AIAction,
    data: Record<string, unknown>
  ): Array<{ label: string; href: string }> {
    const links: Array<{ label: string; href: string }> = [];
    
    if (data.name) {
      // Strip /api/ prefix for frontend route
      const pagePath = action.endpoint
        .replace('/api/', '/')
        .replace(/\/[^/]*$/, `/${data.name}`);
      
      links.push({ label: 'View →', href: pagePath });
    }

    return links;
  }
}

interface ExecutionResult {
  success: boolean;
  data?: Record<string, unknown>;
  message?: string;
  error?: string;
  details?: unknown;
  links?: Array<{ label: string; href: string }>;
}
```

### 6.2 Auto-Fill from Upstream Documents

```typescript
// lib/ai/ai-executor.ts (continued)

export class AutoFillEngine {
  /**
   * When AI creates a document "from" another document,
   * auto-fill fields using the same mapping rules as the UI wizard.
   */
  static async autoFillFromSource(
    targetDoctype: string,
    sourceDoctype: string,
    sourceName: string
  ): Promise<Record<string, unknown>> {
    // Fetch source document
    const sourceApiPath = getApiPath(sourceDoctype);
    const response = await fetch(`/api/${sourceApiPath}/${encodeURIComponent(sourceName)}`);
    const { data: sourceDoc } = await response.json();

    // Apply mapping rules
    const mappings = AUTO_FILL_MAPPINGS[`${sourceDoctype}->${targetDoctype}`];
    if (!mappings) {
      throw new Error(`No auto-fill mapping defined for ${sourceDoctype} → ${targetDoctype}`);
    }

    const filledData: Record<string, unknown> = {};
    for (const mapping of mappings) {
      const value = sourceDoc[mapping.from];
      filledData[mapping.to] = mapping.transform ? mapping.transform(value) : value;
    }

    return filledData;
  }
}

/**
 * Auto-fill mapping definitions.
 * These are the same rules used by the UI wizard FlowDefinitions.
 */
const AUTO_FILL_MAPPINGS: Record<string, FieldMapping[]> = {
  'Quotation->Sales Order': [
    { from: 'party_name', to: 'customer' },
    { from: 'customer_name', to: 'customer_name' },
    { from: 'items', to: 'items' },
    { from: 'taxes', to: 'taxes' },
    { from: 'grand_total', to: 'grand_total' },
    { from: 'net_total', to: 'net_total' },
    { from: 'terms', to: 'tc_name' },
    { from: 'name', to: 'quotation', transform: (v) => v }, // Link back
  ],
  'Sales Order->Work Order': [
    { from: 'items', to: 'production_items', transform: (items) => 
      (items as Array<Record<string, unknown>>)
        .filter(i => i.is_stock_item)
        .map(i => ({ item_code: i.item_code, qty: i.qty, bom_no: i.bom }))
    },
    { from: 'name', to: 'sales_order' },
    { from: 'delivery_date', to: 'expected_delivery_date' },
  ],
  'Sales Order->Delivery Note': [
    { from: 'customer', to: 'customer' },
    { from: 'customer_name', to: 'customer_name' },
    { from: 'items', to: 'items', transform: (items) =>
      (items as Array<Record<string, unknown>>).map(i => ({
        ...i,
        against_sales_order: i.parent,
        so_detail: i.name,
      }))
    },
    { from: 'name', to: 'against_sales_order' },
  ],
  'Delivery Note->Sales Invoice': [
    { from: 'customer', to: 'customer' },
    { from: 'customer_name', to: 'customer_name' },
    { from: 'items', to: 'items' },
    { from: 'taxes', to: 'taxes' },
    { from: 'name', to: 'delivery_note' },
  ],
};
```

---

## 7. AI UI Components

### 7.1 AI Copilot Panel

```typescript
// components/ai/AICopilot.tsx — API

interface AICopilotProps {
  isOpen: boolean;
  onClose: () => void;
  position: 'sidebar' | 'overlay' | 'bottom-panel';
}

// The AI Copilot appears as:
// - Desktop: Right sidebar panel (resizable)
// - Mobile: Full-screen overlay
// - Keyboard shortcut: Cmd+J to toggle
```

### 7.2 Conversation Flow

```
┌──────────────────────────────────────────────────────────┐
│  🤖 Obsidian AI                                    ✕    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────┐     │
│  │ 👤 Create a sales order for Abebe from their   │     │
│  │    last quotation                               │     │
│  └────────────────────────────────────────────────┘     │
│                                                          │
│  ┌────────────────────────────────────────────────┐     │
│  │ 🤖 I found Quotation QTN-2026-042 for          │     │
│  │    Abebe Trading PLC. Here's what I'll create:  │     │
│  │                                                  │     │
│  │    ┌──────────────────────────────────────┐     │     │
│  │    │  📋 CREATE SALES ORDER               │     │     │
│  │    │                                       │     │     │
│  │    │  Customer: Abebe Trading PLC          │     │     │
│  │    │  Items:                                │     │     │
│  │    │  • 500x Business Cards — ETB 1,250    │     │     │
│  │    │  • 1000x Letterheads — ETB 1,800      │     │     │
│  │    │  Total: ETB 3,050.00                  │     │     │
│  │    │                                       │     │     │
│  │    │  [✅ Create]  [❌ Cancel]  [✏️ Edit]  │     │     │
│  │    └──────────────────────────────────────┘     │     │
│  └────────────────────────────────────────────────┘     │
│                                                          │
│  ┌────────────────────────────────────────────────┐     │
│  │ 💬 Type a message...                      Send  │     │
│  └────────────────────────────────────────────────┘     │
│                                                          │
│  Suggestions:                                            │
│  [📊 Show sales summary] [🏭 Create work order]        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 7.3 Action Confirmation Card

```typescript
// components/ai/AIActionCard.tsx

interface AIActionCardProps {
  action: AIAction;
  onConfirm: () => void;
  onCancel: () => void;
  onEdit: () => void;           // Opens the wizard with pre-filled data
  isExecuting: boolean;
}

// The card displays:
// 1. Action type icon (create, update, delete)
// 2. Target doctype + name
// 3. Key fields in summary format
// 4. Three buttons: Confirm, Cancel, Edit (opens wizard)
```

---

## 8. Security & Guardrails

### 8.1 Permission Enforcement

```typescript
// lib/ai/ai-guardrails.ts

export const AI_GUARDRAILS = {
  // Operations that ALWAYS require confirmation
  requireConfirmation: ['create', 'update', 'delete', 'submit', 'cancel'],
  
  // Operations that NEVER execute via AI (must use UI)
  blockedOperations: ['delete_company', 'change_password', 'modify_roles'],
  
  // Maximum documents AI can create in one conversation
  maxCreationsPerSession: 10,
  
  // Maximum documents AI can update in one request
  maxBulkUpdateSize: 5,
  
  // Fields AI is not allowed to modify
  protectedFields: ['owner', 'creation', 'modified_by', 'docstatus'],
  
  // Rate limiting per user per hour
  maxRequestsPerHour: 100,
};
```

### 8.2 Audit Logging

Every AI action is logged:

```typescript
interface AIAuditLog {
  timestamp: string;
  userId: string;
  tenantId: string;
  action: string;
  doctype: string;
  documentName?: string;
  aiModel: string;
  userMessage: string;
  aiResponse: string;
  executionResult: 'success' | 'error' | 'cancelled';
  executionDetails?: unknown;
}
```

### 8.3 Data Privacy

- AI models receive **only the minimum context** needed (current page, recent doc names)
- Full document data is fetched server-side, **never sent to the AI model**
- AI tool calls return to the server, which then fetches/creates via Frappe API
- No customer PII is sent to OpenRouter models
- All AI API routes require authentication

---

## 9. Error Handling & Fallbacks

### 9.1 Model Failure Cascade

```
Primary Model → 429/500 → Try next Primary → 429/500 → Try Secondary → ... → Fallback

If ALL models fail:
  AI responds: "I'm temporarily unable to process requests. 
                Please use the interface directly or try again in a few minutes."
```

### 9.2 Graceful Degradation

| Scenario | Behavior |
|----------|----------|
| AI API key missing | AI panel hidden entirely; no UI impact |
| All models rate-limited | Show "AI temporarily unavailable" badge |
| Tool call returns error | AI explains the error in natural language |
| Ambiguous request | AI asks clarifying question |
| Permission denied | AI explains what the user can do instead |
| Network error | AI retries once, then shows error |

### 9.3 Non-Tool-Calling Fallback

For models that don't support tool calling (e.g., `openrouter/owl-alpha`):

```typescript
// Use structured output parsing instead of native tool calls
// AI returns JSON-formatted actions in its message
// The system parses and executes them

const FALLBACK_PROMPT_SUFFIX = `
When you want to perform an action, respond with a JSON block:
\`\`\`json
{
  "action": "search_documents",
  "params": { "doctype": "Sales Order", "search": "Abebe" }
}
\`\`\`
I will execute the action and provide the results.`;
```

---

## 10. Testing & Evaluation

### 10.1 Test Scenarios

| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| 1 | "Show all overdue orders" | Queries SO with delivery_date < today |
| 2 | "Create SO from QTN-001" | Fetches QTN-001, builds SO payload, confirms |
| 3 | "Submit WO-2026-015" | Confirms, changes status to Submitted |
| 4 | "What's Abebe's outstanding balance?" | Queries unpaid invoices for customer |
| 5 | "Create a quotation for 500 business cards" | Asks for customer, rate; creates |
| 6 | "Delete all orders" | BLOCKED — exceeds bulk limit |
| 7 | "Navigate to stock items" | Opens /stock/item |
| 8 | Gibberish input | "I didn't understand that. Could you rephrase?" |
| 9 | All models down | Shows graceful degradation message |
| 10 | Ambiguous "create order" | Asks: "For which customer?" |

### 10.2 Evaluation Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Intent Accuracy** | > 90% | Correct action identified |
| **Entity Resolution** | > 85% | Correct document found |
| **Response Latency** | < 3 seconds | Time to first response |
| **Execution Success** | > 95% | Confirmed actions execute without error |
| **User Satisfaction** | > 4.0/5.0 | Post-interaction survey |

---

## Summary

Part 3 establishes:

1. ✅ **AI Vision** — NL → System Operations, not a chatbot
2. ✅ **Model Architecture** — 7 models with tiered routing + fallback
3. ✅ **NL → Action Pipeline** — 5-stage pipeline with confirmation
4. ✅ **Tool Calling** — Dynamic tool generation from DocType config
5. ✅ **Context Engine** — Page, document, and entity resolution
6. ✅ **Action Executor** — Uses same API layer as UI
7. ✅ **UI Components** — Copilot panel, action cards, conversation flow
8. ✅ **Security** — Guardrails, confirmation, audit logging, data privacy
9. ✅ **Error Handling** — Model fallback cascade, graceful degradation
10. ✅ **Testing** — 10 test scenarios with evaluation metrics

**Next:** Part 4 covers Deployment — Docker configuration, multi-tenant operations, CI/CD, monitoring, and client onboarding.

---

*Obsidian ERP v4.0 Architecture — Part 3 of 4*  
*© 2026 VersaLabs Studio. All rights reserved.*

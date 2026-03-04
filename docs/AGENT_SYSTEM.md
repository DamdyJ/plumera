# Agent System Overview

This document provides a human-readable overview of the Plumera agent system. For detailed agent prompts, see `docs/agent-prompts/`.

## What is the Agent System?

The Plumera Agent System is a collection of AI agents that help maintain code quality, review pull requests, and assist with development tasks. The system is designed to work within free tier limitations while maximizing effectiveness.

## Agent Architecture

```
                    ┌──────────────────┐
                    │    GitHub Event   │
                    │  (PR, Issue, etc)│
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  Chief Coordinator │
                    │  (Routes tasks)    │
                    └────────┬─────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
  │  CI Guardian │    │ Code Reviewer │    │  Specialists  │
  │  (always)    │    │  (on PR)      │    │ (conditional) │
  └─────────────┘    └─────────────┘    └─────────────┘
```

## Available Agents

### Tier 1: Orchestration
| Agent | File | Purpose |
|-------|------|---------|
| Chief Coordinator | `COORDINATOR.md` | Routes tasks to appropriate agents |

### Tier 2: Core Quality
| Agent | File | Purpose |
|-------|------|---------|
| CI Guardian | `CI_GUARDIAN.md` | Runs lint/build on every PR |
| Code Reviewer | `CODE_REVIEWER.md` | Deep code analysis |

### Tier 3: Domain Specialists
| Agent | File | Purpose |
|-------|------|---------|
| Frontend Specialist | `FRONTEND_SPECIALIST.md` | React/shadcn/Tailwind expertise |
| Backend Specialist | `BACKEND_SPECIALIST.md` | Express/LangChain/RAG expertise |
| Business Logic | `BUSINESS_LOGIC.md` | Validates core features work |

### Tier 4: Experience & Growth
| Agent | File | Purpose |
|-------|------|---------|
| UX/Product | `UX_PRODUCT.md` | User experience guidance |
| Cost Optimizer | `COST_OPTIMIZER.md` | Maximizes free tier usage |
| Performance | `PERFORMANCE.md` | Bundle size, caching, speed |

### Tier 5: Maintenance
| Agent | File | Purpose |
|-------|------|---------|
| SEO | `SEO.md` | Search optimization |
| Security | `SECURITY.md` | Vulnerability scanning |
| Bug Hunter | `BUG_HUNTER.md` | Issue investigation |

## Model Assignments

Each agent is optimized for a specific free-tier model:

### Google/Gemini API (require API key)
| Model | Agents |
|-------|--------|
| `gemini-3-flash` | Code Reviewer, Performance |

### OpenRouter Models (require API key)
| Model | Agents |
|-------|--------|
| `nemotron-3-nano-30b-a3b` | Backend Specialist, Security |
| `trinity-large-preview` | Business Logic, SEO |

### OpenCode Models (built-in, free)
| Model | Agents |
|-------|--------|
| `opencode/big-pickle` | CI Guardian, Cost Optimizer |
| `opencode/minimax-m2.5-free` | Coordinator, Frontend Specialist, UX/Product |
| `opencode/gpt-5-nano` | Bug Hunter |

| Agent | Primary Model | Provider |
|-------|--------------|----------|
| Coordinator | opencode/minimax-m2.5-free | OpenCode |
| Code Reviewer | gemini-3-flash | Google/Gemini API |
| CI Guardian | opencode/big-pickle | OpenCode |
| Frontend Specialist | opencode/minimax-m2.5-free | OpenCode |
| Backend Specialist | nemotron-3-nano-30b-a3b | OpenRouter |
| Business Logic | trinity-large-preview | OpenRouter |
| Cost Optimizer | opencode/big-pickle | OpenCode |
| UX/Product | opencode/minimax-m2.5-free | OpenCode |
| Performance | gemini-3-flash | Google/Gemini API |
| SEO | trinity-large-preview | OpenRouter |
| Security | nemotron-3-nano-30b-a3b | OpenRouter |
| Bug Hunter | opencode/gpt-5-nano | OpenCode |

## How Agents Run

### Automatic (GitHub Actions)
- **CI Guardian**: Runs on every PR/commit
- **Code Reviewer**: Runs on PRs
- **Specialists**: Run based on file changes

### Manual
You can invoke agents manually:
1. Use OpenCode directly with agent prompts
2. Use GitHub Actions workflow_dispatch
3. Ask me (the AI assistant) to act as any agent

## Token Management

### Free Tier Limits
| Service | Limit | Notes |
|---------|-------|-------|
| GitHub Actions | 2000 min/month | Primary constraint |
| Groq | Variable | Fast, good quality |
| OpenRouter | Variable | Multiple free models |
| Gemini | Limited | Good for reasoning |

### Cost Optimizer Rules
When tokens are low, the system:
1. Skips non-critical agents
2. Uses smaller/faster models
3. Reduces analysis depth
4. Prioritizes critical issues only

### Fallback Levels
| Mode | Tokens | Agents That Run |
|------|--------|-----------------|
| Full | >60% | All agents |
| Reduced | 30-60% | CI + Code Reviewer |
| Critical | <30% | CI Guardian only |

## File Structure

```
plumera/
├── .github/workflows/
│   └── agent-system.yml       # GitHub Actions triggers
├── docs/
│   ├── AGENT_SYSTEM.md        # This file
│   └── agent-prompts/         # Individual agent prompts
│       ├── COORDINATOR.md
│       ├── CODE_REVIEWER.md
│       ├── CI_GUARDIAN.md
│       ├── FRONTEND_SPECIALIST.md
│       ├── BACKEND_SPECIALIST.md
│       ├── BUSINESS_LOGIC.md
│       ├── COST_OPTIMIZER.md
│       ├── UX_PRODUCT.md
│       ├── PERFORMANCE.md
│       ├── SEO.md
│       ├── SECURITY.md
│       └── BUG_HUNTER.md
└── AGENTS.md                 # AI agent guidelines
```

## Using the Agent System

### For Development
1. Create a branch and open a PR
2. CI Guardian automatically runs lint/build
3. Code Reviewer analyzes your changes
4. Specialists provide domain-specific feedback

### For Specific Tasks
Ask me to act as any specific agent:
- "Act as the Frontend Specialist and review my React component"
- "Act as the Bug Hunter and investigate this issue"
- "Act as the UX/Product Agent and evaluate the onboarding flow"

### For Manual Review
Trigger GitHub Actions workflow manually for specific agents.

## Best Practices

1. **Don't spam agents** - They're token-constrained
2. **Check AGENTS.md first** - Conventions are documented
3. **Use specialists appropriately** - Frontend agent for UI, Backend for APIs
4. **Monitor token usage** - Check GitHub Actions minutes
5. **Iterate** - Start with core agents, add more as needed

## Troubleshooting

### Agents Not Running
- Check GitHub Actions workflow is enabled
- Verify token availability
- Check workflow dispatch permissions

### Poor Quality Output
- Try a different model
- Provide more context in your request
- Use multiple agents in sequence

### Token Limits Reached
- Wait for monthly reset
- Use manual mode
- Reduce PR frequency

## Future Enhancements

Potential additions:
- Test generation agent
- Documentation agent
- Refactoring agent
- More sophisticated fallback logic
- Integration with external AI services

---

For questions about the agent system, refer to individual agent prompts in `docs/agent-prompts/`.

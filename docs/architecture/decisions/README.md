# Architecture Decision Records (ADR)

This directory contains Architecture Decision Records (ADRs) for the NORMAL DANCE project. ADRs are a way to document important architectural decisions made in the project.

## What is an ADR?

An ADR is a document that captures an important architectural decision made in the project, along with its context and consequences. It serves as a record of why a particular decision was made and what alternatives were considered.

## ADR Format

Each ADR follows this template:

```markdown
# ADR XXXX: Title

## Status

Proposed | Accepted | Deprecated | Superseded
--- | --- | --- | ---
✅ | ⬜ | ⬜ | ⬜

## Context

[The context for this decision]

## Decision

[The decision that was made]

## Consequences

### Positive
- [Positive outcome 1]
- [Positive outcome 2]

### Negative
- [Negative outcome 1]
- [Negative outcome 2]

## Related ADRs

- [Related ADR 1]
- [Related ADR 2]
```

## Naming Conventions

- ADR files are named sequentially: `0001-short-title.md`, `0002-another-decision.md`, etc.
- The title should be in kebab-case
- The title should be descriptive but concise

## Process

1. **Proposal**: Create a new ADR with status "Proposed"
2. **Review**: Team reviews the ADR
3. **Decision**: ADR is marked as "Accepted" or rejected
4. **Implementation**: The decision is implemented
5. **Updates**: If the decision changes, the ADR is updated and marked as "Deprecated" or "Superseded"

## Specialized Templates

We provide specialized ADR templates for different types of decisions:

1. **Standard Template** - For general architectural decisions
   - File: [0001-template.md](0001-template.md)
   - Use for most architectural decisions

2. **Security Decision Template** - For security-related decisions
   - File: [0003-security-decision-template.md](0003-security-decision-template.md)
   - Includes security-specific sections like:
     - Security Requirements
     - Security Controls
     - Threat Modeling
     - Risk Assessment
     - Security Impact Analysis

## Index of ADRs

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [0001-template](0001-template.md) | Template for Architecture Decision Records | Accepted | 2024-03-01 |
| [0002-security-improvements](0002-security-improvements.md) | Security System Enhancements | Proposed | 2024-03-02 |
| [0003-security-decision-template](0003-security-decision-template.md) | Security Decision Template | Proposed | 2024-03-03 |

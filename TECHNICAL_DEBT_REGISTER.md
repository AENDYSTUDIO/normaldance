# Technical Debt Register

This document tracks all known technical debt items in the NORMAL DANCE project, their impact, and plans for resolution.

## Key

| Symbol | Meaning |
|--------|---------|
| 🔴 | Critical - Requires immediate attention |
| 🟠 | High - Should be addressed soon |
| 🟡 | Medium - Address when possible |
| 🟢 | Low - Nice to have |
| ⏳ | In Progress |
| ✅ | Completed |

## Active Technical Debt

| ID | Description | Type | Priority | Impact | Effort | Status | Created | Target | Owner |
|----|-------------|------|----------|--------|--------|--------|---------|--------|-------|
| TD-001 | Replace duplicate SQL sanitization code | Code Quality | 🔴 High | High | 2h | ✅ Fixed | 2024-03-01 | 2024-03-05 | Security Team |
| TD-002 | Improve type safety in BaseValidator | Code Quality | 🟠 Medium | High | 4h | ⏳ In Progress | 2024-03-01 | 2024-03-10 | Dev Team |
| TD-003 | Add comprehensive error handling | Code Quality | 🟠 Medium | High | 8h | ⏳ In Progress | 2024-03-01 | 2024-03-15 | Dev Team |
| TD-004 | Implement structured logging | Observability | 🟡 Medium | Medium | 6h | ⬜ Not Started | 2024-03-01 | 2024-03-20 | DevOps Team |
| TD-005 | Update outdated dependencies | Dependencies | 🟠 High | High | 2h | Open | 2024-03-01 | 2024-03-08 | Security Team |

## Resolved Technical Debt

| ID | Description | Resolution Date | Resolution |
|----|-------------|-----------------|------------|
| TD-001 | Replace duplicate SQL sanitization code | 2024-03-05 | Consolidated duplicate SQL sanitization logic into a single function |

## Technical Debt Metrics

### Current State

- **Total Active Items**: 4
- **Critical**: 0
- **High**: 2
- **Medium**: 2
- **Low**: 0
- **In Progress**: 2
- **Completed This Month**: 1
- **Resolved This Month**: 1
- **Net Change**: +4

## Process

### Adding New Debt

1. Create a new entry in the "Active Technical Debt" section
2. Assign a unique TD-XXX ID (next available number)
3. Set appropriate priority, impact, and effort estimates
4. Assign an owner and target completion date
5. Add to the appropriate project board/backlog

### Resolving Debt

1. Update status to "In Progress" when work begins
2. Once resolved:
   - Move the item to "Resolved Technical Debt"
   - Add resolution details and date
   - Update metrics
3. Reference the TD-XXX in the pull request

### Review Cycle

- **Weekly**: Review all open items during sprint planning
- **Monthly**: Full review of technical debt with the team
- **Quarterly**: Strategic review of technical debt impact on product roadmap

## Related Documents

- [TECHNICAL_DEBT_GUIDE.md](./TECHNICAL_DEBT_GUIDE.md) - Guide on managing technical debt
- [ARCHITECTURE_DECISIONS.md](./docs/architecture/decisions/README.md) - Architecture decision records

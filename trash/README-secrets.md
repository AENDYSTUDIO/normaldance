# Secrets Management for NORMALDANCE

This directory contains the secrets management system for NORMALDANCE project.

## Files

- `scripts/secrets-manager.js` - Main secrets management script
- `scripts/security-monitor.js` - Security monitoring script
- `scripts/rotate-secrets.js` - Secret rotation script
- `scripts/check-hardcoded-secrets.js` - Hardcoded secrets checker
- `config/secrets-templates.js` - Secrets templates configuration
- `config/secrets-config.json` - Secrets configuration
- `tests/secrets-management.test.js` - Test suite

## Usage

```bash
# Validate secrets
npm run secrets:validate -- --env production

# Rotate secrets
npm run secrets:rotate -- --env production

# Monitor security
npm run secrets:monitor -- --env production

# Setup secrets management
npm run secrets:setup
```

## Configuration

See `docs/secrets-management-guide.md` for detailed documentation.

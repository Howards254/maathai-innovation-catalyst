# CI/CD Pipeline Documentation

## Overview

This project uses GitHub Actions for continuous integration and deployment. The pipeline ensures code quality, security, and automated deployments to Vercel.

## Workflows

### 1. CI Workflow (`ci.yml`)
Runs on every push and pull request to `main` and `develop` branches.

**Jobs:**
- **Lint**: Runs ESLint to check code style
- **Type Check**: Runs TypeScript compiler to check types
- **Build**: Builds the application (depends on lint and type-check)
- **Security Audit**: Checks for known vulnerabilities in dependencies
- **Bundle Analysis**: Reports bundle size on PRs

### 2. Deploy Workflow (`deploy.yml`)
Handles deployments to Vercel.

**Triggers:**
- Push to `main` branch (production deployment)
- Manual trigger via workflow_dispatch

**Environments:**
- **Preview**: Deployed for non-main branches
- **Production**: Deployed when pushing to `main`

### 3. PR Check Workflow (`pr-check.yml`)
Validates pull requests before merging.

**Features:**
- Validates PR title follows conventional commits format
- Detects large files
- Runs quality gate (lint, type-check, build)
- Creates preview deployment
- Comments PR with preview URL

## Optional Secrets

All secrets are **optional**. The CI/CD pipeline will work without them using placeholder values for builds. Configure these in GitHub Repository Settings → Secrets and variables → Actions when ready for production deployments.

### Application Secrets (Optional)
| Secret | Description | Default |
|--------|-------------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | Placeholder URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Placeholder key |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Placeholder |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Cloudinary upload preset | Placeholder |
| `VITE_GA_TRACKING_ID` | Google Analytics ID | Empty |

### Vercel Secrets (Optional - for automated deployments)
| Secret | Description | How to Get |
|--------|-------------|------------|
| `VERCEL_TOKEN` | Vercel API token | [Vercel Tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Vercel organization ID | `.vercel/project.json` after `vercel link` |
| `VERCEL_PROJECT_ID` | Vercel project ID | `.vercel/project.json` after `vercel link` |

> **Note:** If Vercel secrets are not configured, deployments will be skipped with an informational notice. The CI checks (lint, type-check, build) will still run successfully.

## Setting Up Vercel Secrets

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Link project: `vercel link`
4. Find IDs in `.vercel/project.json`:
   ```json
   {
     "orgId": "your-org-id",
     "projectId": "your-project-id"
   }
   ```
5. Create token at https://vercel.com/account/tokens
6. Add all three as GitHub secrets

## Local Development Setup

### Pre-commit Hooks
This project uses Husky for pre-commit hooks.

```bash
# Install dependencies (includes husky setup)
npm install

# Initialize husky
npx husky install
```

### Running Quality Checks Locally
```bash
# Run all checks
npm run check

# Run linting only
npm run lint

# Fix lint issues
npm run lint:fix

# Type check only
npm run type-check

# Build
npm run build
```

## Dependabot

Automated dependency updates are configured in `.github/dependabot.yml`:
- **NPM packages**: Weekly updates on Mondays at 9:00 AM EAT
- **GitHub Actions**: Monthly updates
- Dependencies are grouped (React, TypeScript, Vite, ESLint, Tailwind)

## Branch Protection Rules

Recommended settings for the `main` branch:

1. Go to Repository Settings → Branches → Add rule
2. Branch name pattern: `main`
3. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require approvals (1)
   - ✅ Dismiss stale pull request approvals
   - ✅ Require status checks to pass before merging
     - Select: `lint`, `type-check`, `build`
   - ✅ Require branches to be up to date before merging
   - ✅ Require conversation resolution before merging

## Conventional Commits

PR titles must follow the conventional commits format:

```
type(scope): description

Examples:
- feat: add user authentication
- fix(auth): resolve login redirect issue
- docs: update API documentation
- style: format code with prettier
- refactor: simplify campaign context
- perf: optimize image loading
- test: add unit tests for utils
- build: update vite configuration
- ci: add deployment workflow
- chore: update dependencies
```

## Troubleshooting

### Build Failures
1. Check if all required secrets are configured
2. Verify environment variables are correct
3. Review build logs for specific errors

### Deployment Failures
1. Verify Vercel credentials are correct
2. Check if the project is linked correctly
3. Review Vercel deployment logs

### Pre-commit Hook Issues
```bash
# Reinstall husky
rm -rf .husky/_
npx husky install
```

## Monitoring

- **GitHub Actions**: View workflow runs in the Actions tab
- **Vercel Dashboard**: Monitor deployments at https://vercel.com
- **Deployment Issues**: Automatic issue creation on production failures

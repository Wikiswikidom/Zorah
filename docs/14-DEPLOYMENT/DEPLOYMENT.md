# Deployment

Flow: feature branch → pull request → review/tests → merge to main → preview/production deployment according to branch policy.

Deployment checklist includes database migrations, environment variables, build, tests, security checks, payment mode, email domain, domain configuration and monitoring.

Database changes must be backward compatible with the deployed application during rollout where practical.

Rollback procedures must be documented for application and database changes separately.
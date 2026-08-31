# Vercel

Vercel will host the Next.js application. The GitHub repository is the source of deployments.

Use separate preview and production environments. Environment variables are configured in Vercel rather than committed to Git.

Production deployment requires successful build, lint/test gates and environment verification. Preview deployments are used for review of each major feature.

Domain, redirects, headers and caching behavior must be reviewed before launch.
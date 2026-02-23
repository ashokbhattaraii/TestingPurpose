# Shared Packages

This directory is reserved for shared packages used across multiple apps in the OMUS monorepo.

## Examples of packages you can add here

| Package name         | Purpose                               |
| -------------------- | ------------------------------------- |
| `@omus/types`        | Shared TypeScript interfaces & DTOs   |
| `@omus/config`       | Shared ESLint / TypeScript configs    |
| `@omus/ui`           | Shared React UI component library     |
| `@omus/utils`        | Shared utility/helper functions       |

## How to add a new shared package

1. Create a folder: `packages/<name>/`
2. Add a `package.json` with `"name": "@omus/<name>"`
3. Add it to the workspace: it is already covered by `"workspaces": ["apps/*", "packages/*"]`
4. Import it in any app: `import { ... } from "@omus/<name>"`

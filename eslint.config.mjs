import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",

    // Agent worktrees are full second copies of this tree. Without this,
    // ESLint lints every source file twice plus the vendored dependencies
    // under them, which is what turned `npm run lint` into 9,198 problems
    // and buried the handful that actually belong to this repo.
    ".claude/**",

    // Playwright's generated output — traces, screenshots, HTML reports.
    "test-results/**",
    "playwright-report/**",
    "blob-report/**",
  ]),
  {
    rules: {
      // `_shikiBackground` in mdx-components.tsx and the destructured
      // discards in tests/unit/content.test.ts are deliberate: the binding
      // exists to REMOVE a property, and naming it is the clearest way to say
      // so. The underscore prefix is the convention that marks that intent.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
    },
  },
]);

export default eslintConfig;

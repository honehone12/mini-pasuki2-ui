import { configs, parser } from "typescript-eslint";
import type { ConfigArray } from "typescript-eslint";

export default [
  configs.eslintRecommended,
  ...configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: parser,
      parserOptions: {
        project: ["./tsconfig.json"],
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
] satisfies ConfigArray;

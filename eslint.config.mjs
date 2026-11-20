import js from "@eslint/js";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";
import globals from "globals";

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      ".astro/**",
      "node_modules/**",
      ".superpowers/**",
      "pnpm-lock.yaml",
      "package-lock.json",
    ],
  },
  {
    ...js.configs.recommended,
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: globals.node,
    },
  },
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ["**/*.ts", "**/*.tsx"],
  })),
  ...astro.configs["flat/recommended"],
);

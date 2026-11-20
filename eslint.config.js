import js from "@eslint/js";
import globals from "globals";

export default [
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
];

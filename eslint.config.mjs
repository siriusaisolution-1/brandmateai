// eslint.config.mjs
// Flat ESLint (Next 15 + TS-ESLint v8) – functional-first, quality-safe
import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import importPlugin from "eslint-plugin-import";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import * as tseslint from "typescript-eslint";

const reactRecommended = reactPlugin.configs.flat.recommended;
const jsxA11yRecommended = jsxA11yPlugin.flatConfigs.recommended;
const nextRecommended = nextPlugin.flatConfig.recommended;
const typescriptConfigs = tseslint.configs.recommended.map((config, index) => {
  const files = ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts", "**/*.d.ts"];
  if (index === 0) {
    return {
      ...config,
      files,
    };
  }
  return config.files ? config : { ...config, files };
});

/** @type {import("eslint").Linter.FlatConfig[]} */
const config = [
  // Ignore build/third-party folders
  {
    ignores: [".next/**", "node_modules/**", "dist/**", "coverage/**", "functions/.output/**"],
  },

  // JS recommended
  js.configs.recommended,

  // TS recommended (without type-aware project binding for stability)
  ...typescriptConfigs,

  // React core best practices
  reactRecommended,

  // Accessibility and Next-specific rules (flat configs)
  jsxA11yRecommended,
  nextRecommended,

  // React Hooks rules (plugin does not yet ship a flat config helper)
  {
    plugins: {
      "react-hooks": reactHooksPlugin,
      import: importPlugin,
    },
    rules: {
      "import/no-anonymous-default-export": "warn",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },

  // Global rules
  {
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    settings: {
      react: { version: "detect" },
      "import/resolver": {
        node: { extensions: [".js", ".jsx", ".ts", ".tsx"] },
        typescript: {
          alwaysTryTypes: true,
          project: ["tsconfig.json", "functions/tsconfig.json"],
        },
      },
    },
    rules: {
      // Functional > strict typing in early stage
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/no-empty-object-type": "off",

      // Bug-prevent rules remain strict
      "react/no-unescaped-entities": "error",
      "react/no-unknown-property": "off",
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react/prop-types": "off",
    },
  },

  // D.ts and shim files – allow "any" to avoid blocking the app
  {
    files: ["**/*.d.ts", "src/types/**"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },

  // UI generators and flows (work with external SDKs) – softer any rule
  {
    files: ["src/ai/**", "src/components/**"],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];

export default config;

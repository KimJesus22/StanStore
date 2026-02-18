// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([...nextVitals, ...nextTs, {
  rules: {
    "react-hooks/set-state-in-effect": "off",
    "jsx-a11y/alt-text": "error",
    "jsx-a11y/aria-role": "error",
    "jsx-a11y/aria-props": "error",
    "jsx-a11y/click-events-have-key-events": "error",
    "jsx-a11y/no-static-element-interactions": "error",
    "jsx-a11y/anchor-is-valid": "error",
  },
}, // Override default ignores of eslint-config-next.
globalIgnores([
  // Default ignores of eslint-config-next:
  ".next/**",
  "out/**",
  "build/**",
  "next-env.d.ts",
  // Generated PWA/Workbox files:
  "public/sw.js",
  "public/swe-worker-*.js",
  "public/workbox-*.js",
  "storybook-static/**",
]), ...storybook.configs["flat/recommended"]]);

export default eslintConfig;

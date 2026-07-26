// Accessibility-only lint config, used by `npm run lint:a11y` and CI.
//
// It deliberately does NOT extend eslint-config-next: that pulls in strict
// React/hooks rules with pre-existing violations unrelated to accessibility,
// which would drown the a11y signal. Here we run ONLY the jsx-a11y recommended
// ruleset over our source, so a failure always means a real a11y regression.
import jsxA11y from "eslint-plugin-jsx-a11y";
import tsParser from "@typescript-eslint/parser";
import nextPlugin from "@next/eslint-plugin-next";

export default [
  {
    files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    // jsx-a11y provides the rules; @next/next is registered (but its rules left
    // off) only so existing `eslint-disable @next/next/*` comments still resolve.
    plugins: { "jsx-a11y": jsxA11y, "@next/next": nextPlugin },
    // this config only runs a11y rules, so disable-directives for other plugins
    // aren't "used" here - don't warn about them
    linterOptions: { reportUnusedDisableDirectives: "off" },
    rules: { ...jsxA11y.flatConfigs.recommended.rules },
  },
];

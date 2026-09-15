import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "react-hooks/set-state-in-effect": "off",
    }
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "api/**",
    "sql/**",
    "scratch/**",
    "next-env.d.ts",
    "vite.config.ts",
    "src/main.tsx",
    "src/vite-env.d.ts",
    "index.html",
    "src/components/*.tsx",
  ]),
]);

export default eslintConfig;

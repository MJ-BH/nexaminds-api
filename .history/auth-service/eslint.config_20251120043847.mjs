import pluginJs from "@eslint/js";
import js from "@eslint/js";

export default [
  // 1. Apply recommended JavaScript rules
  pluginJs.configs.recommended,

  // 2. Your Custom Configuration
  {
    files: ["**/*.{js,mjs,cjs}"],
    
    languageOptions: {
      // FIX 1: Change 'browser' to 'node' (Fixes 'process is not defined')
      // FIX 2: Add 'jest' (Fixes 'describe is not defined' in tests)
      globals: {
        ...globals.node,
        ...globals.jest
      },

      // FIX 3: Explicitly set CommonJS (Fixes 'require is not defined')
      sourceType: "commonjs",
      
      ecmaVersion: 2022,
    },

    rules: {
      "no-unused-vars": "warn", // Don't break build on unused vars
      "no-console": "off",      // Allow console.log
      "no-undef": "error"       // Catch typos
    }
  },
  
  // 3. Ignore generated folders
  {
    ignores: ["node_modules/**", "coverage/**"]
  }
];
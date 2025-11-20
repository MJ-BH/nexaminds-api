import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  // 1. Target files
  { 
    files: ["**/*.{js,mjs,cjs,ts}"] 
  },

  // 2. Define Environment Globals
  { 
    languageOptions: { 
      globals: { 
        ...globals.node,  // Fixes 'process', '__dirname'
        ...globals.jest   // Fixes 'describe', 'it', 'expect'
      } 
    } 
  },

  // 3. Apply Recommended Configurations
  pluginJs.configs.recommended, // Standard JS rules
  ...tseslint.configs.recommended, // Standard TypeScript rules

  // 4. Custom Rules
  {
    rules: {
      // Allow console.log (common in backend apps)
      "no-console": "off",
      
      // Warn about 'any' type instead of error (useful during migration)
      "@typescript-eslint/no-explicit-any": "warn",
      
      // Warn about unused variables (don't break build)
      "no-unused-vars": "off", // Turn off JS rule
      "@typescript-eslint/no-unused-vars": "warn", // Use TS rule
      
      // Ensure imports act like modules
      "no-undef": "off" // TS handles this better than ESLint
    }
  },

  // 5. Ignore Build Artifacts
  { 
    ignores: ["dist/**", "node_modules/**", "coverage/**"] 
  }
];
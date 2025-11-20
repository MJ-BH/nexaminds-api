const globals = require("globals");
const pluginJs = require("@eslint/js");

module.exports = [
  // 1. Recommended defaults
  pluginJs.configs.recommended,

  // 2. Your Project Configuration
  {
    // Target your actual source code
    files: ["**/*.js", "**/*.cjs"],
    
    languageOptions: {
      sourceType: "commonjs", // Allow require/module.exports
      
      globals: {
        ...globals.node, // Fixes process, Buffer, __dirname
        ...globals.jest  // Fixes describe, it, expect
      },
      
      ecmaVersion: 2022,
    },
    
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
      "no-undef": "error"
    }
  },

  // 3. Ignore folders
  {
    ignores: ["node_modules/**", "coverage/**"]
  }
];
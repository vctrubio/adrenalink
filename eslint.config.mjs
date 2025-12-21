import tseslint from "typescript-eslint";
import nextEslintConfig from 'eslint-config-next';

const eslintConfig = tseslint.config(
    ...nextEslintConfig,
    {
        rules: {
            "indent": "off",
            "quotes": ["error", "double"],
            "semi": ["error", "always"],
            "eol-last": "off",
            "object-curly-spacing": ["error", "always"],
            "array-bracket-spacing": ["error", "never"],
            "max-len": "off",
            "@typescript-eslint/no-explicit-any": "warn",
            "react-hooks/exhaustive-deps": "off",
            "@typescript-eslint/no-unused-vars": "warn",
        },
    },
    {
        ignores: [
            "node_modules/**",
            ".next/**",
            "out/**",
            "build/**",
            "next-env.d.ts",
        ],
    },
);

export default eslintConfig;

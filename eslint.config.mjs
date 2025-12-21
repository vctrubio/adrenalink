import tseslint from "typescript-eslint";
import nextEslintConfig from "eslint-config-next";

const eslintConfig = tseslint.config(
    ...nextEslintConfig,
    ...tseslint.configs.recommended,
    ...tseslint.configs.stylistic,
    {
        rules: {
            "indent": "off",
            "quotes": ["error", "double"],
            "semi": ["error", "always"],
            "eol-last": "off",
            "object-curly-spacing": ["error", "always"],
            "array-bracket-spacing": ["error", "never"],
            "max-len": "off",
            "react-hooks/exhaustive-deps": "off",
            "@typescript-eslint/no-unused-vars": "off",
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

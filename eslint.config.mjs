import {dirname} from "path";
import {fileURLToPath} from "url";
import {fixupPluginRules} from '@eslint/compat';
import eslintJS from "@eslint/js"
import {FlatCompat} from "@eslint/eslintrc";
import typescriptEslint from 'typescript-eslint';
import tsParser from '@typescript-eslint/parser';
import globals from "globals"
import eslintPluginImport from 'eslint-plugin-import'
import eslintConfigPrettier from "eslint-config-prettier"

const patchedImportPlugin = fixupPluginRules(eslintPluginImport)

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ignore = [
    "**/components/ui/*",
    "**/lib/utils.ts",
    ".next/**",  // This will ignore the entire .next directory
    "**/.next/**" // Alternative pattern that also works
]

const globalIgnoresConfig = {
    ignores: [
        "**/.next/**",  // Recursive ignore pattern
        "**/components/ui/*",
        "**/lib/utils.ts",
    ]
};

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const baseESLintConfig = {
    ignores: ignore,
    name: "eslint",
    extends: [
        eslintJS.configs.recommended,
    ],
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
        "no-await-in-loop": "error",
        "no-constant-binary-expression": "error",
        // "no-duplicate-imports": "error",
        "no-new-native-nonconstructor": "error",
        "no-promise-executor-return": "error",
        "no-self-compare": "error",
        "no-template-curly-in-string": "error",
        "no-unmodified-loop-condition": "error",
        "no-unreachable-loop": "error",
        "no-unused-private-class-members": "error",
        "no-use-before-define": "error",
        "require-atomic-updates": "error",
        "camelcase": "error",
    },
}

const typescriptConfig = [
    {
        ignores: ignore,
        name: "typescript",
        files: ["**/*.ts", "**/*.tsx"],
        extends: [
            ...typescriptEslint.configs.recommendedTypeChecked,
        ],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaFeatures: {modules: true},
                ecmaVersion: "latest",
                project: "./tsconfig.json",
            },
            globals: {
                ...globals.builtin,
                ...globals.browser,
                ...globals.es2025
            },
        },
        linterOptions: {
            reportUnusedDisableDirectives: "error"
        },
        plugins: {
            import: patchedImportPlugin
        },
        rules: {
            "@typescript-eslint/adjacent-overload-signatures": "error",
            "@typescript-eslint/array-type": ["error", {"default": "generic"}],
            "@typescript-eslint/consistent-type-exports": "error",
            "@typescript-eslint/consistent-type-imports": "error",
            "@typescript-eslint/explicit-function-return-type": "error",
            "@typescript-eslint/explicit-member-accessibility": "error",
            "@typescript-eslint/explicit-module-boundary-types": "error",
            "@typescript-eslint/no-confusing-void-expression": "error",
            "@typescript-eslint/no-import-type-side-effects": "error",
            "@typescript-eslint/no-require-imports": "error",
            "@typescript-eslint/no-unused-vars": "warn",
            "@typescript-eslint/no-useless-empty-export": "error",
            "@typescript-eslint/prefer-enum-initializers": "error",
            "@typescript-eslint/prefer-readonly": "error",
            "no-return-await": "off",
            "@typescript-eslint/return-await": "error",
            "@typescript-eslint/no-misused-promises": [
                "error",
                {
                    "checksVoidReturn": {
                        "attributes": false
                    }
                }
            ]
        },
        settings: {
            'import/resolver': {
                typescript: {
                    alwaysTryTypes: true,
                    project: './tsconfig.json'
                }
            }
        },

    },
    {
        files: ["**/store/*.ts"], // Target directory
        name: "typescript/ui-overrides",
        rules: {
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/explicit-function-return-type": "off",
        },
    },

]

const nextConfig = {

    name: "nextjs-boilerplate",

    languageOptions: {
        sourceType: "module",
    },

    files: ["**/*.ts", "**/*.tsx"],
    ignores: ["**/node_modules/*", ...ignore],

    linterOptions: {
        reportUnusedDisableDirectives: true,
    },

}


const eslintConfig = typescriptEslint.config(
    globalIgnoresConfig,
    baseESLintConfig,
    typescriptConfig,
    nextConfig,
    eslintConfigPrettier,

    // ...compat.extends("next/core-web-vitals", "next/typescript"),

)

eslintConfig.map((config) => {
    config.files = ["**/*.ts", "**/*.tsx"]
    config.ignores = ignore;
})

export default eslintConfig
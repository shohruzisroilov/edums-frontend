import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import { defineConfig, globalIgnores } from 'eslint/config';
// Prettier bilan to'qnashadigan formatlash qoidalarini o'chiradi —
// formatlash faqat Prettier zimmasida bo'lishi uchun oxirida turadi.
import prettier from 'eslint-config-prettier';

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,

    globalIgnores([
        '.next/**',
        'out/**',
        'build/**',
        'node_modules/**',
        'next-env.d.ts',
    ]),

    {
        rules: {
            '@typescript-eslint/no-empty-object-type': 'off',
            // Ishlatilmaydigan o'zgaruvchilar xato, lekin `_` bilan
            // boshlanganlari ataylab qoldirilgan deb hisoblanadi.
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrors: 'none',
                },
            ],
        },
    },

    prettier,
]);

export default eslintConfig;

import { type FlatXoConfig } from 'xo'

const xoConfig: FlatXoConfig = [
    {
        // Archivos a los que se aplica el linteo
        files: ['**/*.{ts,js,css,html}'],

        // Ignorar rutas adicionales si es necesario
        ignores: ['node_modules/**', 'dist/**'],

        // Configuración de estilo XO
        space: 4, // 2 espacios por indentación
        semicolon: false, // Sin punto y coma

        // Activar Prettier para formatear automáticamente
        prettier: true,

        // Reglas adicionales de ESLint/TypeScript
        rules: {
            'no-console': 'warn',
            'import-x/no-absolute-path': 'off',
            quotes: ['error', 'single'],
        },
    },
]

export default xoConfig satisfies FlatXoConfig

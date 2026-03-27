import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/**/*.blade.php',
        './resources/**/*.js',
        './resources/**/*.vue',
    ],
    theme: {
        extend: {
            colors: {
                navy: {
                    50: '#f0f4f8',
                    100: '#d9e2ec',
                    200: '#bcccdc',
                    300: '#9fb3c8',
                    400: '#829ab1',
                    500: '#627d98',
                    600: '#486581',
                    700: '#334e68',
                    800: '#243b53',
                    900: '#0A1628',
                },
                cream: '#F5F3EF',
                brown: {
                    50: '#faf8f6',
                    100: '#f5f0eb',
                    200: '#ebe0d5',
                    300: '#dfcab8',
                    400: '#c9a889',
                    500: '#a68b6a',
                    600: '#8b7258',
                    700: '#6f5b47',
                    800: '#5a4a3b',
                    900: '#473d31',
                },
            },
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
        },
    },
    plugins: [],
};

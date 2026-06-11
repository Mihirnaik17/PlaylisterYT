import { defineConfig } from 'vitest/config';

/**
 * VITEST CONFIGURATION  (no @vitejs/plugin-react needed)
 *
 * In Vitest 3 + Vite 6, tests run in Node.js via an SSR-style transform.
 * @vitejs/plugin-react@4.x doesn't support Vite 6, and @vitejs/plugin-react@6.x
 * requires Vite 8.  Instead we configure Vite's built-in esbuild transform
 * directly — esbuild understands JSX natively (no Babel overhead), and it is
 * the engine Vitest already uses for most transforms.
 *
 * esbuild options:
 *   jsx: 'automatic'    → uses the "new JSX transform" (React 17+), which means
 *                         you don't need to import React in every file.
 *   jsxImportSource     → tells esbuild where to import JSX helpers from.
 *   loader: 'jsx'       → treat every matched file as JSX, even .js files.
 *   include             → matches both .js AND .jsx files inside src/.
 *
 * optimizeDeps mirrors the same settings for the dependency pre-bundling step
 * so third-party packages that ship .js-with-JSX also transform correctly.
 */
export default defineConfig({
    esbuild: {
        jsx: 'automatic',
        jsxImportSource: 'react',
        loader: 'jsx',
        include: /src\/.*\.[jt]sx?$/,
        exclude: [],
    },
    optimizeDeps: {
        esbuildOptions: {
            jsx: 'automatic',
            jsxImportSource: 'react',
            loader: {
                '.js': 'jsx',
                '.jsx': 'jsx',
            },
        },
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/tests/setup.js'],
        include: ['src/**/*.test.{js,jsx}'],
        exclude: ['src/hooks/usePlaylistPlayer.test.js', 'node_modules/**'],
    },
});

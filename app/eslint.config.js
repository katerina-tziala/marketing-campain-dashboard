import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import importX from 'eslint-plugin-import-x';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import vue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import tseslint from 'typescript-eslint';

const boundaries = ['app', 'features', 'shared', 'ui'];
const crossBoundaryDepths = ['../', '../../', '../../../', '../../../../', '../../../../../'];

const crossBoundaryRelativePatterns = (currentBoundary) =>
  boundaries
    .filter((boundary) => boundary !== currentBoundary)
    .flatMap((boundary) =>
      crossBoundaryDepths.flatMap((depth) => [`${depth}${boundary}`, `${depth}${boundary}/**`]),
    );

const crossBoundaryRelativeImportMessage =
  'Use a source alias for cross-boundary imports; keep relative imports within the same boundary.';

const sourceFiles = ['src/**/*.{js,ts,vue}'];
const tsAndVueFiles = ['src/**/*.{ts,vue}', 'vite.config.ts'];

export default tseslint.config(
  {
    ignores: [
      'coverage/**',
      'dist/**',
      'node_modules/**',
      'src/assets/Android/**',
      'src/assets/Chrome_Extension/**',
      'src/assets/iOS/**',
      'src/assets/macOS/**',
      'src/assets/tvOS/**',
      'src/assets/watchOS/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.strict,
  ...vue.configs['flat/recommended'],
  prettierConfig,
  {
    files: tsAndVueFiles,
    plugins: {
      'import-x': importX,
      'simple-import-sort': simpleImportSort,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
        },
      ],
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowDirectConstAssertionInArrowFunctions: true,
          allowExpressions: true,
          allowHigherOrderFunctions: true,
          allowTypedFunctionExpressions: true,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      curly: ['error', 'all'],
      eqeqeq: ['error', 'always'],
      'import-x/first': 'error',
      'import-x/newline-after-import': 'error',
      'import-x/no-duplicates': 'error',
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-undef': 'off',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-const': 'error',
      'prefer-destructuring': [
        'error',
        {
          AssignmentExpression: {
            array: false,
            object: true,
          },
          VariableDeclarator: {
            array: false,
            object: true,
          },
        },
        {
          enforceForRenamedProperties: false,
        },
      ],
      quotes: ['error', 'single', { avoidEscape: true }],
      semi: ['error', 'always'],
      'simple-import-sort/exports': 'error',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^vue$', '^vue-router$', '^pinia$'],
            ['^(?!@(?:app|features|shared|ui|/))@?\\w'],
            ['^@app(?:/.*|$)', '^@/app(?:/.*|$)'],
            [
              '^@features(?:/.*|$)',
              '^@shared(?:/.*|$)',
              '^@ui(?:/.*|$)',
              '^@/(features|shared|ui)(?:/.*|$)',
            ],
            ['^\\.'],
            ['^.+\\.s?css$', '^\\u0000'],
          ],
        },
      ],
      'vue/block-lang': [
        'error',
        {
          script: {
            lang: 'ts',
          },
          style: {
            lang: 'scss',
          },
        },
      ],
      'vue/block-order': [
        'error',
        {
          order: ['script', 'template', 'style'],
        },
      ],
      'vue/component-api-style': ['error', ['script-setup']],
      'vue/define-macros-order': [
        'error',
        {
          order: ['defineProps', 'defineEmits', 'defineSlots', 'defineExpose', 'defineOptions'],
        },
      ],
      'vue/html-self-closing': [
        'error',
        {
          html: {
            component: 'always',
            normal: 'always',
            void: 'always',
          },
          math: 'always',
          svg: 'always',
        },
      ],
      'vue/no-required-prop-with-default': 'error',
      'vue/no-v-html': 'error',
      'vue/prefer-define-options': 'error',
    },
  },
  {
    files: ['src/**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaVersion: 'latest',
        extraFileExtensions: ['.vue'],
        parser: tseslint.parser,
        sourceType: 'module',
      },
    },
  },
  {
    files: ['src/app/dev-mode/**/*.{ts,vue}'],
    rules: {
      'no-console': 'off',
    },
  },
  ...boundaries
    .filter((boundary) => boundary !== 'features')
    .map((boundary) => ({
      files: [`src/${boundary}/**/*.{ts,vue}`],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: crossBoundaryRelativePatterns(boundary),
                message: crossBoundaryRelativeImportMessage,
              },
            ],
          },
        ],
      },
    })),
  {
    files: sourceFiles,
    rules: {
      'vue/multi-word-component-names': [
        'error',
        {
          ignores: [
            'App',
            'Badge',
            'Button',
            'Card',
            'Chip',
            'Disclosure',
            'Dropdown',
            'Form',
            'Insights',
            'Kpis',
            'Modal',
            'Notification',
            'Section',
            'Spinner',
            'Table',
            'Tabs',
          ],
        },
      ],
    },
  },
);

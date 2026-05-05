export default {
  extends: [
    'stylelint-config-standard-scss',
    'stylelint-config-standard-vue/scss',
    'stylelint-config-tailwindcss',
  ],
  rules: {
    'at-rule-no-unknown': null,
    'color-function-alias-notation': null,
    'color-function-notation': null,
    'container-name-pattern': null,
    'custom-property-empty-line-before': null,
    'selector-class-pattern': null,
    'scss/at-extend-no-missing-placeholder': null,
    'scss/at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['apply', 'layer', 'responsive', 'screen', 'tailwind', 'variants'],
      },
    ],
    'scss/percent-placeholder-pattern': '^_?[a-z][a-z0-9-]*$',
  },
};

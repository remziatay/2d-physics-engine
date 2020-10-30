module.exports = {
  extends: ['stylelint-config-standard'],
  rules: {
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'tailwind',
          'apply',
          'variants',
          'responsive',
          'screen'
        ]
      }
    ],
    'declaration-block-trailing-semicolon': null,
    'declaration-colon-newline-after': null,
    'value-list-comma-newline-after': null,
    'no-descending-specificity': null,
    'color-hex-length': null,
    'comment-whitespace-inside': null,
    'rule-empty-line-before': null,
    'number-leading-zero': null,
    'block-opening-brace-space-before': null
  }
}

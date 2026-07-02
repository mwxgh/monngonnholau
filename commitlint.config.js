module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'chore',
        'refactor',
        'revert',
        'docs',
        'style',
        'perf',
        'test',
        'ci',
        'build'
      ]
    ],
    'subject-case': [0]
  }
}

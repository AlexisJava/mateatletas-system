/**
 * ESLint Config Root - Monorepo Mateatletas
 *
 * Esta config solo ignora todo en root ya que cada app tiene su propia config.
 * Ver: apps/api/eslint.config.mjs y apps/web/eslint.config.mjs
 */
export default [
  {
    ignores: ['**/*'],
  },
];
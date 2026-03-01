/**
 * Sample unit test to verify Vitest setup works.
 * Replace with real tests once i18n config is merged.
 */
describe('vitest setup', () => {
  it('runs tests correctly', () => {
    expect(1 + 1).toBe(2);
  });

  it('supports async tests', async () => {
    const result = await Promise.resolve('ok');
    expect(result).toBe('ok');
  });
});

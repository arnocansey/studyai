export default {
  '*.{ts,tsx,js,jsx,json,md,yml,yaml}': (files) =>
    `prettier --write ${files.map((f) => `"${f}"`).join(' ')}`,
};

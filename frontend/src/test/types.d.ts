/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

declare module '@testing-library/jest-dom' {
  export * from '@testing-library/jest-dom';
}

declare module '@testing-library/jest-dom/matchers' {
  const matchers: any;
  export default matchers;
} 
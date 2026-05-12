// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock nanoid to avoid ESM issues
jest.mock('nanoid', () => ({
  nanoid: () => 'test-id-' + Math.random().toString(36).substring(7),
}));

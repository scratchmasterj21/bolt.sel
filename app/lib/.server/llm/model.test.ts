import { describe, it, expect, vi } from 'vitest';
import { getModel, getAnthropicModel } from './model';

// Mock the AI SDK modules
vi.mock('@ai-sdk/anthropic', () => ({
  createAnthropic: vi.fn(() => vi.fn(() => 'mocked-anthropic-model')),
}));

vi.mock('@ai-sdk/google', () => ({
  createGoogleGenerativeAI: vi.fn(() => vi.fn(() => 'mocked-google-model')),
}));

describe('Model Configuration', () => {
  it('should return Anthropic model for anthropic provider', () => {
    const model = getModel('test-api-key', 'anthropic');
    expect(model).toBe('mocked-anthropic-model');
  });

  it('should return Google model for google provider', () => {
    const model = getModel('test-api-key', 'google');
    expect(model).toBe('mocked-google-model');
  });

  it('should default to Anthropic provider', () => {
    const model = getModel('test-api-key');
    expect(model).toBe('mocked-anthropic-model');
  });

  it('should maintain backward compatibility with getAnthropicModel', () => {
    const model = getAnthropicModel('test-api-key');
    expect(model).toBe('mocked-anthropic-model');
  });
});

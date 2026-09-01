import 'fake-indexeddb/auto';
import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
  if (typeof localStorage !== 'undefined') {
    localStorage.clear();
  }
});

if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

if (!URL.createObjectURL) {
  URL.createObjectURL = vi.fn(() => 'blob:mock');
  URL.revokeObjectURL = vi.fn();
}

// Polyfill Blob.arrayBuffer() and Blob.text() for jsdom compat
if (!Blob.prototype.arrayBuffer) {
  Blob.prototype.arrayBuffer = function () {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(this);
    });
  };
}

if (!Blob.prototype.text) {
  Blob.prototype.text = function () {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(this);
    });
  };
}

if (typeof window !== 'undefined') {
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
}

// Mock Request to bypass AbortSignal validation for react-router compatibility
const OriginalRequest = global.Request;
if (OriginalRequest) {
  global.Request = class MockRequest extends OriginalRequest {
    constructor(input: RequestInfo | URL, init?: RequestInit) {
      try {
        super(input, init);
      } catch (e: any) {
        if (e.message?.includes('AbortSignal') && e.message?.includes('RequestInit')) {
          // Bypass AbortSignal validation and create request without signal
          const initWithoutSignal = { ...init };
          delete initWithoutSignal.signal;
          super(input, initWithoutSignal);
        } else {
          throw e;
        }
      }
    }
  } as any;
}

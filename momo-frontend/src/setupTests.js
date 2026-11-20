// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// JSDOM 16에는 브라우저 Web Crypto가 없으므로 실제 Node 구현을 연결한다.
Object.defineProperty(window, 'crypto', { value: require('crypto').webcrypto, configurable: true });

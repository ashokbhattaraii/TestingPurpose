// jest.setup.js को सुरुमा
import { jest } from '@jest/globals';
// Jest setup file to mock modules with ESM issues
jest.mock('@rumsan/user', () => ({
  RsOfficeClient: jest.fn(),
  signChallenge: jest.fn((challenge, privateKey) => {
    // Return a mock signature
    return 'mock-signature-' + Math.random().toString(36).substr(2, 9);
  }),
  verifyJwt: jest.fn((token, publicKey) => {
    // Return a Promise with mock verification result
    return Promise.resolve({ valid: !token.includes('invalid'), payload: { sub: 'user' } });
  }),
}));

jest.mock('jose', () => ({
  jwtVerify: jest.fn(),
  SignJWT: jest.fn(),
}));

// jest.setup.js ko antim ma thapa
jest.mock('axios', () => ({
  post: jest.fn(),
  get: jest.fn(),
  create: jest.fn().mockReturnThis(),
}));
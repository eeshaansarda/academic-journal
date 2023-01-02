/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
    "moduleNameMapper": {
      "^@auth/(.*)": "<rootDir>/src/auth/$1",
      "^@components/(.*)": "<rootDir>/src/components/$1",
      "^@config/(.*)": "<rootDir>/src/config/$1",
      "^@hooks/(.*)": "<rootDir>/src/hooks/$1",
      "^@pages/(.*)": "<rootDir>/src/pages/$1",
      "^@responses/(.*)": "<rootDir>/src/responses/$1",
      "^@role/(.*)": "<rootDir>/src/role/$1",
      "^@slices/(.*)": "<rootDir>/src/slices/$1",
      "^@store/(.*)": "<rootDir>/src/store/$1",
      "^@tests/(.*)": "<rootDir>/src/tests/$1",
      "^@root/(.*)": "<rootDir>/src/$1",
      "^@services/(.*)": "<rootDir>/src/services/$1"
    }
};
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  // Proporciona la ruta a tu aplicación de Next.js para cargar next.config.js y variables de entorno
  dir: './',
})

// Configuración personalizada de Jest
const customJestConfig = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: [],
}

export default createJestConfig(customJestConfig)
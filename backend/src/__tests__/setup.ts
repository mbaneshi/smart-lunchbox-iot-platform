import { sequelize } from '../config/database';

// Setup test database connection
beforeAll(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
  } catch (error) {
    console.error('Unable to connect to test database:', error);
  }
});

// Clean up after all tests
afterAll(async () => {
  try {
    await sequelize.close();
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
});

// Clear all tables between tests
afterEach(async () => {
  try {
    await sequelize.truncate({ cascade: true });
  } catch (error) {
    console.error('Error truncating tables:', error);
  }
});

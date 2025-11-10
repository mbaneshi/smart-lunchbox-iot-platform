import request from 'supertest';
import app from '../../server';
import User from '../../models/User';
import bcrypt from 'bcrypt';

describe('User Routes', () => {
  describe('POST /api/users/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User'
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', userData.email);
      expect(response.body.user).toHaveProperty('name', userData.name);
      expect(response.body.user).not.toHaveProperty('passwordHash');
    });

    it('should reject registration with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'Password123',
        name: 'Test User'
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation Error');
    });

    it('should reject registration with weak password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'weak',
        name: 'Test User'
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation Error');
    });

    it('should reject duplicate email registration', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User'
      };

      await request(app).post('/api/users/register').send(userData);

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(409);

      expect(response.body).toHaveProperty('error', 'Email already registered');
    });
  });

  describe('POST /api/users/login', () => {
    beforeEach(async () => {
      const passwordHash = await bcrypt.hash('Password123', 10);
      await User.create({
        email: 'test@example.com',
        passwordHash,
        name: 'Test User'
      });
    });

    it('should login successfully with correct credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'Password123'
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(credentials)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', credentials.email);
    });

    it('should reject login with incorrect password', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'WrongPassword123'
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(credentials)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should reject login with non-existent email', async () => {
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'Password123'
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(credentials)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });
  });

  describe('GET /api/users/profile', () => {
    let authToken: string;
    let userId: string;

    beforeEach(async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User'
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData);

      authToken = response.body.token;
      userId = response.body.user.id;
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', userId);
      expect(response.body).toHaveProperty('email', 'test@example.com');
      expect(response.body).toHaveProperty('preferences');
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Unauthorized');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Unauthorized');
    });
  });

  describe('PUT /api/users/profile', () => {
    let authToken: string;

    beforeEach(async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User'
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData);

      authToken = response.body.token;
    });

    it('should update user profile successfully', async () => {
      const updates = {
        name: 'Updated Name',
        preferences: {
          temperatureUnit: 'fahrenheit',
          notificationsEnabled: false
        }
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Profile updated successfully');
      expect(response.body.user).toHaveProperty('name', 'Updated Name');
      expect(response.body.user.preferences).toHaveProperty('temperatureUnit', 'fahrenheit');
    });

    it('should reject invalid preference values', async () => {
      const updates = {
        preferences: {
          temperatureUnit: 'invalid-unit'
        }
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation Error');
    });
  });

  describe('DELETE /api/users/account', () => {
    let authToken: string;
    let userId: string;

    beforeEach(async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User'
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData);

      authToken = response.body.token;
      userId = response.body.user.id;
    });

    it('should delete user account successfully', async () => {
      const response = await request(app)
        .delete('/api/users/account')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Account deleted successfully');

      const user = await User.findByPk(userId);
      expect(user).toBeNull();
    });
  });
});

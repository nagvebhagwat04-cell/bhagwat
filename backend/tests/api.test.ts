import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import { User } from '../src/models/User.js';
import { Transaction } from '../src/models/Transaction.js';
import { Goal } from '../src/models/Goal.js';
import { Budget } from '../src/models/Budget.js';

let mongoServer: MongoMemoryServer;

let userAToken = '';
let userAId = '';
let userBToken = '';
let userBId = '';

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('API Integration & Security Tests', () => {
  describe('Phase 3 & 11: Authentication & Security', () => {
    it('registers user A successfully with hashed password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Alice Financial',
          email: 'alice@fintech.test',
          password: 'SecretPassword123!',
          monthlyIncome: 5000,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('alice@fintech.test');
      expect(res.body.data.user.passwordHash).toBeUndefined(); // Never return passwordHash!

      userAToken = res.body.data.token;
      userAId = res.body.data.user.id;

      // Verify in DB that password is not stored plaintext
      const dbUser = await User.findOne({ email: 'alice@fintech.test' }).select('+passwordHash');
      expect(dbUser?.passwordHash).not.toBe('SecretPassword123!');
      expect(dbUser?.passwordHash.startsWith('$2')).toBe(true);
    });

    it('rejects registration with duplicate email (400)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Alice Duplicate',
          email: 'alice@fintech.test',
          password: 'AnotherPassword123!',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('USER_EXISTS');
    });

    it('registers user B successfully for data-isolation tests', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Bob Saver',
          email: 'bob@fintech.test',
          password: 'BobSecurePassword123!',
          monthlyIncome: 4200,
        });

      expect(res.status).toBe(201);
      userBToken = res.body.data.token;
      userBId = res.body.data.user.id;
    });

    it('logs in successfully with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'alice@fintech.test',
          password: 'SecretPassword123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it('rejects login with incorrect password (401)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'alice@fintech.test',
          password: 'WrongPassword!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('INVALID_CREDENTIALS');
    });

    it('rejects protected endpoints without token (401)', async () => {
      const res = await request(app).get('/api/users/profile');
      expect(res.status).toBe(401);
      expect(res.body.code).toBe('UNAUTHORIZED');
    });

    it('rejects protected endpoints with malformed/invalid token (401)', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid-garbage-token');

      expect(res.status).toBe(401);
      expect(res.body.code).toBe('INVALID_TOKEN');
    });
  });

  describe('Phase 4: User Profile API', () => {
    it('retrieves authenticated user profile', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('alice@fintech.test');
      expect(res.body.data.monthlyIncome).toBe(5000);
    });

    it('updates user profile', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          occupation: 'Senior FinTech Architect',
          monthlyIncome: 6200,
          financialKnowledge: 'advanced',
          riskProfile: 'aggressive',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.occupation).toBe('Senior FinTech Architect');
      expect(res.body.data.monthlyIncome).toBe(6200);
      expect(res.body.data.riskProfile).toBe('aggressive');
    });
  });

  describe('Phase 5 & 11: Transactions CRUD & User Data Isolation (IDOR Protection)', () => {
    let transactionAId = '';

    it('creates an income and an expense transaction for User A', async () => {
      // Income
      const incRes = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          type: 'income',
          category: 'Salary',
          amount: 6200,
          description: 'Primary salary direct deposit',
        });

      expect(incRes.status).toBe(201);
      expect(incRes.body.data.amount).toBe(6200);

      // Expense
      const expRes = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          type: 'expense',
          category: 'Rent',
          amount: 1500,
          description: 'Monthly apartment lease',
        });

      expect(expRes.status).toBe(201);
      transactionAId = expRes.body.data._id;
    });

    it('retrieves only User A transactions for User A', async () => {
      const res = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.data.every((t: any) => t.userId === userAId)).toBe(true);
    });

    it('prevents User B from reading User A transactions (Data Isolation)', async () => {
      const res = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(0); // User B has no transactions
    });

    it('prevents User B from editing User A transaction (IDOR check -> 404)', async () => {
      const res = await request(app)
        .put(`/api/transactions/${transactionAId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({
          amount: 99999,
        });

      expect(res.status).toBe(404);
      expect(res.body.code).toBe('NOT_FOUND');

      // Verify amount was unchanged in DB
      const originalTx = await Transaction.findById(transactionAId);
      expect(originalTx?.amount).toBe(1500);
    });

    it('prevents User B from deleting User A transaction (IDOR check -> 404)', async () => {
      const res = await request(app)
        .delete(`/api/transactions/${transactionAId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(404);
      expect(res.body.code).toBe('NOT_FOUND');

      const originalTx = await Transaction.findById(transactionAId);
      expect(originalTx).not.toBeNull();
    });

    it('allows User A to edit their own transaction', async () => {
      const res = await request(app)
        .put(`/api/transactions/${transactionAId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          amount: 1550,
          description: 'Updated lease with utility fee',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.amount).toBe(1550);
    });

    it('validates transaction payload (rejects negative amount or missing category)', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          type: 'expense',
          category: '',
          amount: -50,
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Phase 6: Budget Management & Category Utilization', () => {
    it('creates or updates a monthly budget for User A', async () => {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      const res = await request(app)
        .post('/api/budget')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          month,
          year,
          income: 6200,
          categoryLimits: [
            { category: 'Rent', limit: 1600 },
            { category: 'Groceries', limit: 500 },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.data.totalBudget).toBe(2100);
    });

    it('retrieves budget with computed spending and utilization', async () => {
      const res = await request(app)
        .get('/api/budget')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.spending.totalSpent).toBe(1550); // From User A rent transaction
      expect(res.body.data.spending.utilization.utilizationRate).toBeCloseTo(73.81, 1);
    });
  });

  describe('Phase 7: Financial Goals & Monthly Required Contribution', () => {
    let goalId = '';

    it('creates a goal and calculates monthly requirement automatically', async () => {
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() + 10);

      const res = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          name: 'Home Renovation',
          targetAmount: 10000,
          currentAmount: 2000,
          targetDate: targetDate.toISOString(),
          category: 'Property',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.monthlyRequired).toBe(800);
      expect(res.body.data.percentageComplete).toBe(20);
      goalId = res.body.data._id;
    });

    it('retrieves user goals', async () => {
      const res = await request(app)
        .get('/api/goals')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].monthlyRequired).toBe(800);
    });

    it('prevents User B from modifying User A goal (IDOR protection)', async () => {
      const res = await request(app)
        .put(`/api/goals/${goalId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({ targetAmount: 50000 });

      expect(res.status).toBe(404);
    });
  });

  describe('Phase 8: Financial Calculations Endpoints', () => {
    it('calculates EMI via /api/calculations/emi', async () => {
      const res = await request(app)
        .post('/api/calculations/emi')
        .send({
          principal: 50000,
          annualInterestRate: 8.5,
          tenureMonths: 24,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.monthlyEMI).toBeCloseTo(2272.78, 1);
      expect(res.body.data.totalPayment).toBeGreaterThan(50000);
      expect(res.body.data.totalInterest).toBeGreaterThan(0);
    });

    it('calculates Goal monthly contribution via /api/calculations/goal', async () => {
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() + 6);

      const res = await request(app)
        .post('/api/calculations/goal')
        .send({
          targetAmount: 6000,
          currentAmount: 0,
          targetDate: targetDate.toISOString(),
        });

      expect(res.status).toBe(200);
      expect(res.body.data.monthlyRequired).toBe(1000);
    });

    it('calculates Debt-to-Income via /api/calculations/dti', async () => {
      const res = await request(app)
        .post('/api/calculations/dti')
        .send({
          monthlyDebtPayments: 1500,
          monthlyIncome: 5000,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.ratio).toBe(30);
      expect(res.body.data.status).toBe('healthy');
    });
  });

  describe('Phase 9: Dashboard Data Endpoint', () => {
    it('returns structured dashboard metrics with trends and aiSummary', async () => {
      const res = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.metrics.monthlyIncome).toBe(6200);
      expect(res.body.data.metrics.monthlyExpenses).toBe(1550);
      expect(res.body.data.metrics.monthlySavings).toBe(4650);
      expect(res.body.data.metrics.savingsRate).toBe(75);
      expect(res.body.data.cashFlowTrend).toBeInstanceOf(Array);
      expect(res.body.data.aiSummary).toBeDefined();
    });
  });

  describe('Phase 10: AI Chat Integration & History', () => {
    it('returns educational response for AI chat question with financial context', async () => {
      const res = await request(app)
        .post('/api/ai/chat')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          message: 'How can I improve my savings rate?',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.reply).toBeDefined();
      expect(res.body.data.reply.length).toBeGreaterThan(20);
      expect(res.body.data.contextSummary).toBeDefined();
    });

    it('retrieves saved chat history for authenticated user', async () => {
      const res = await request(app)
        .get('/api/ai/history')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2); // user + assistant
      expect(res.body.data[0].role).toBe('user');
      expect(res.body.data[1].role).toBe('assistant');
    });

    it('ensures User B cannot see User A chat history', async () => {
      const res = await request(app)
        .get('/api/ai/history')
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(0);
    });

    it('clears chat history', async () => {
      const clearRes = await request(app)
        .delete('/api/ai/history')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(clearRes.status).toBe(200);

      const checkRes = await request(app)
        .get('/api/ai/history')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(checkRes.body.data.length).toBe(0);
    });
  });
});

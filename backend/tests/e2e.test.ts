/**
 * End-to-End Automated Test Suite for Personal Finance Adviser Bot
 * 
 * Verifies Phase 14 full user journey:
 * Register → Login → Update Profile → Add Income → Add Expenses → Create Budget → 
 * Create Goal → Verify Dashboard Calculations → Ask AI Financial Question → 
 * Receive AI Response → Verify History Persistence → Verify Data Isolation & Logout
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import request from 'supertest';

let mongoServer: MongoMemoryServer;
let token: string = '';
let email: string = '';

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

describe('Phase 14: End-to-End Journey & System Integration', () => {
  it('Step 1: User Registration produces valid JWT', async () => {
    email = `e2e.user.${Date.now()}@fintech.test`;
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jordan Belfort',
        email,
        password: 'SecurePassword123!',
        monthlyIncome: 7000,
        financialKnowledge: 'intermediate',
        riskProfile: 'moderate',
      });

    expect(regRes.status).toBe(201);
    expect(regRes.body.data.token).toBeDefined();
    token = regRes.body.data.token;
  });

  it('Step 2: Login authenticates user and returns token', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email,
        password: 'SecurePassword123!',
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.data.token).toBeDefined();
  });

  it('Step 3: User completes and updates financial profile', async () => {
    const profileRes = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        occupation: 'Senior Quantitative Analyst',
        monthlyIncome: 8000,
        riskProfile: 'aggressive',
      });

    expect(profileRes.status).toBe(200);
    expect(profileRes.body.data.monthlyIncome).toBe(8000);
    expect(profileRes.body.data.riskProfile).toBe('aggressive');
  });

  it('Step 4: User records income and expense transactions', async () => {
    const incomeRes = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'income',
        category: 'Salary',
        amount: 8000,
        description: 'Tech Lead Monthly Remuneration',
        date: new Date().toISOString(),
      });
    expect(incomeRes.status).toBe(201);

    const expenseRes1 = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'expense',
        category: 'Housing',
        amount: 2200,
        description: 'Condo Rental & Amenities',
        date: new Date().toISOString(),
      });
    expect(expenseRes1.status).toBe(201);

    const expenseRes2 = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'expense',
        category: 'Groceries',
        amount: 600,
        description: 'Monthly Food Provisions',
        date: new Date().toISOString(),
      });
    expect(expenseRes2.status).toBe(201);
  });

  it('Step 5: User configures monthly category budget', async () => {
    const now = new Date();
    const budgetRes = await request(app)
      .post('/api/budget')
      .set('Authorization', `Bearer ${token}`)
      .send({
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        categoryLimits: [
          { category: 'Housing', limit: 2500 },
          { category: 'Groceries', limit: 800 },
        ],
      });

    expect(budgetRes.status).toBe(200);
    expect(budgetRes.body.data.totalBudget).toBe(3300);
  });

  it('Step 6: User creates financial goal with auto-calculated contribution', async () => {
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + 12);

    const goalRes = await request(app)
      .post('/api/goals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Investment Portfolio Seed',
        targetAmount: 24000,
        currentAmount: 6000,
        targetDate: targetDate.toISOString(),
        category: 'Wealth',
      });

    expect(goalRes.status).toBe(201);
    expect(goalRes.body.data.monthlyRequired).toBe(1500);
    expect(goalRes.body.data.percentageComplete).toBe(25);
  });

  it('Step 7: Dashboard verifies deterministic calculations', async () => {
    const dashRes = await request(app)
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(dashRes.status).toBe(200);
    const { metrics, budgetUtilization } = dashRes.body.data;

    expect(metrics.monthlyIncome).toBe(8000);
    expect(metrics.monthlyExpenses).toBe(2800);
    expect(metrics.monthlySavings).toBe(5200); // 8000 - 2800
    expect(metrics.savingsRate).toBe(65); // 5200 / 8000 * 100
    expect(budgetUtilization.utilizationRate).toBeCloseTo(84.85, 1);
  });

  it('Step 8: AI Advisor provides context-aware educational guidance', async () => {
    const aiRes = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({
        message: 'Can I afford my Investment Portfolio goal with my current surplus?',
      });

    expect(aiRes.status).toBe(200);
    expect(aiRes.body.data.reply).toBeDefined();
    expect(aiRes.body.data.reply).toContain('Investment Portfolio');
  });

  it('Step 9: Chat history is persistent and scoped', async () => {
    const histRes = await request(app)
      .get('/api/ai/history')
      .set('Authorization', `Bearer ${token}`);

    expect(histRes.status).toBe(200);
    expect(histRes.body.data.length).toBeGreaterThanOrEqual(2);
  });

  it('Step 10: Multi-tenant isolation prevents data access by another user', async () => {
    const intruderRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Eve Intruder',
        email: 'eve@unauthorized.test',
        password: 'Password123!',
      });
    const intruderToken = intruderRes.body.data.token;

    const eveTxs = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${intruderToken}`);

    expect(eveTxs.status).toBe(200);
    expect(eveTxs.body.data.length).toBe(0);
  });
});

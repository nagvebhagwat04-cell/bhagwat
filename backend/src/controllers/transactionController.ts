import { Response } from 'express';
import { Transaction } from '../models/Transaction.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export const getTransactions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { type, category, startDate, endDate, limit, page } = req.query;

    const query: any = { userId };

    if (type && (type === 'income' || type === 'expense')) {
      query.type = type;
    }

    if (category) {
      query.category = { $regex: String(category), $options: 'i' };
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(String(startDate));
      if (endDate) query.date.$lte = new Date(String(endDate));
    }

    const pageSize = limit ? parseInt(String(limit), 10) : 50;
    const pageNum = page ? parseInt(String(page), 10) : 1;
    const skip = (pageNum - 1) * pageSize;

    const [transactions, total] = await Promise.all([
      Transaction.find(query).sort({ date: -1, createdAt: -1 }).skip(skip).limit(pageSize),
      Transaction.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        total,
        page: pageNum,
        pageSize,
        pages: Math.ceil(total / pageSize),
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve transactions',
      code: 'SERVER_ERROR',
    });
  }
};

export const createTransaction = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { type, category, amount, description, date } = req.body;

    const transaction = await Transaction.create({
      userId,
      type,
      category,
      amount,
      description: description || '',
      date: date ? new Date(date) : new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to create transaction',
      code: 'SERVER_ERROR',
    });
  }
};

export const updateTransaction = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { type, category, amount, description, date } = req.body;

    // Must be scoped to userId to prevent IDOR
    const transaction = await Transaction.findOne({ _id: id, userId });
    if (!transaction) {
      res.status(404).json({
        success: false,
        message: 'Transaction not found or unauthorized',
        code: 'NOT_FOUND',
      });
      return;
    }

    if (type) transaction.type = type;
    if (category) transaction.category = category;
    if (amount !== undefined) transaction.amount = amount;
    if (description !== undefined) transaction.description = description;
    if (date) transaction.date = new Date(date);

    await transaction.save();

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      data: transaction,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update transaction',
      code: 'SERVER_ERROR',
    });
  }
};

export const deleteTransaction = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const transaction = await Transaction.findOneAndDelete({ _id: id, userId });
    if (!transaction) {
      res.status(404).json({
        success: false,
        message: 'Transaction not found or unauthorized',
        code: 'NOT_FOUND',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
      data: { id: transaction._id },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete transaction',
      code: 'SERVER_ERROR',
    });
  }
};

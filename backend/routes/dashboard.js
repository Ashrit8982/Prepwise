const express = require('express');
const User = require('../models/User');
const Attempt = require('../models/Attempt');
const MockTest = require('../models/MockTest');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 1. Total questions solved (correctly)
    const successfulAttempts = await Attempt.find({ userId, isCorrect: true }).distinct('questionId');
    const totalSolved = successfulAttempts.length;

    // 2. Accuracy Calculation
    const totalAttempts = await Attempt.countDocuments({ userId });
    const correctAttempts = await Attempt.countDocuments({ userId, isCorrect: true });
    const accuracy = totalAttempts === 0 ? 0 : Math.round((correctAttempts / totalAttempts) * 100);

    // 3. Recent Mock Test Scores
    const recentTests = await MockTest.find({ userId, completed: true })
      .sort({ createdAt: -1 })
      .limit(5);

    // 4. Weak and Strong Topics
    // Aggregate attempts by topic using Question lookup
    const attemptsWithQuestions = await Attempt.aggregate([
      { $match: { userId: require('mongoose').Types.ObjectId.createFromHexString(userId) } },
      {
        $lookup: {
          from: 'questions',
          localField: 'questionId',
          foreignField: '_id',
          as: 'question'
        }
      },
      { $unwind: '$question' },
      {
        $group: {
          _id: '$question.topic',
          total: { $sum: 1 },
          correct: { $sum: { $cond: ['$isCorrect', 1, 0] } }
        }
      },
      {
        $project: {
          topic: '$_id',
          accuracy: { $multiply: [{ $divide: ['$correct', '$total'] }, 100] }
        }
      },
      { $sort: { accuracy: -1 } }
    ]);

    const strongTopics = attemptsWithQuestions.slice(0, 3);
    const weakTopics = attemptsWithQuestions.slice(-3).reverse();

    // 5. Study time and pending reviews
    const user = await User.findById(userId);
    const totalStudyMinutes = user.totalStudyMinutes || 0;
    const pendingReviews = (user.reviewSchedule || []).filter(r => r.nextReviewDate <= new Date()).length;

    res.json({
      totalSolved,
      accuracy,
      recentTests,
      strongTopics,
      weakTopics,
      totalStudyMinutes,
      pendingReviews
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

module.exports = router;

const express = require('express');
const MockTest = require('../models/MockTest');
const Question = require('../models/Question');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Generate a new mock test
router.post('/generate', auth, async (req, res) => {
  try {
    const { subject, totalQuestions = 10 } = req.body;
    
    let query = {};
    if (subject && subject !== 'All') {
      query.subject = subject;
    }

    // Get random questions for the test
    const questions = await Question.aggregate([
      { $match: query },
      { $sample: { size: parseInt(totalQuestions) } }
    ]);

    if (questions.length === 0) {
      return res.status(400).json({ error: 'Not enough questions available to generate a test.' });
    }

    const testQuestions = questions.map(q => ({
      questionId: q._id,
      submittedOption: null,
      isCorrect: null
    }));

    const mockTest = new MockTest({
      userId: req.user.id,
      subject: subject || 'All',
      totalQuestions: testQuestions.length,
      questions: testQuestions
    });

    await mockTest.save();
    
    // Return populated test so frontend has question texts
    const populatedTest = await MockTest.findById(mockTest._id).populate('questions.questionId');
    res.status(201).json(populatedTest);
  } catch (error) {
    console.error('Mock Test generation error:', error);
    res.status(500).json({ error: 'Failed to generate mock test' });
  }
});

// Submit a mock test
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const { answers } = req.body; // Array of { questionId, submittedOption }
    const mockTest = await MockTest.findById(req.params.id).populate('questions.questionId');
    
    if (!mockTest || mockTest.userId.toString() !== req.user.id) {
      return res.status(404).json({ error: 'Mock test not found or unauthorized' });
    }
    
    if (mockTest.completed) {
      return res.status(400).json({ error: 'Test already submitted' });
    }

    let score = 0;
    
    // Calculate score
    mockTest.questions.forEach(tq => {
      const submittedAnswer = answers.find(a => a.questionId === tq.questionId._id.toString());
      if (submittedAnswer && submittedAnswer.submittedOption !== null) {
        tq.submittedOption = submittedAnswer.submittedOption;
        tq.isCorrect = tq.questionId.correctOption === submittedAnswer.submittedOption;
        if (tq.isCorrect) score += 1;
      }
    });

    mockTest.score = score;
    mockTest.completed = true;
    
    await mockTest.save();
    res.json(mockTest);
  } catch (error) {
    console.error('Mock test submission error:', error);
    res.status(500).json({ error: 'Failed to submit mock test' });
  }
});

// Get user mock test history
router.get('/history', auth, async (req, res) => {
  try {
    const tests = await MockTest.find({ userId: req.user.id, completed: true })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(tests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch test history' });
  }
});

module.exports = router;

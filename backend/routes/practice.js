const express = require('express');
const Question = require('../models/Question');
const User = require('../models/User');
const Attempt = require('../models/Attempt');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get next practice question based on filters
router.get('/next', auth, async (req, res) => {
  try {
    const { subject, topic } = req.query;
    
    const successfulAttempts = await Attempt.find({ userId: req.user.id, isCorrect: true });
    const solvedQuestionIds = successfulAttempts.map(a => a.questionId);

    let query = { _id: { $nin: solvedQuestionIds } };
    if (subject) query.subject = subject;
    if (topic) query.topic = topic;

    const count = await Question.countDocuments(query);
    if (count === 0) {
      return res.json({ message: 'No more questions available for this topic/subject.' });
    }

    const random = Math.floor(Math.random() * count);
    const question = await Question.findOne(query).skip(random);
    
    res.json(question);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching next practice question' });
  }
});

// Submit a practice answer
router.post('/submit', auth, async (req, res) => {
  try {
    const { questionId, submittedOption } = req.body;
    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ error: 'Question not found' });

    const isCorrect = question.correctOption === submittedOption;

    // Record attempt
    const attempt = new Attempt({
      userId: req.user.id,
      questionId,
      submittedOption,
      isCorrect
    });
    await attempt.save();

    // Update user stats
    const user = await User.findById(req.user.id);
    if (isCorrect) {
      user.wrongAnswers = user.wrongAnswers.filter(id => id.toString() !== questionId.toString());
      if (question.isPYQ && !user.solvedPYQs.includes(questionId)) {
        user.solvedPYQs.push(questionId);
      }
      // Spaced Repetition: if answered correctly during review, increase interval
      const reviewIdx = user.reviewSchedule.findIndex(r => r.questionId.toString() === questionId.toString());
      if (reviewIdx > -1) {
        const current = user.reviewSchedule[reviewIdx];
        // Increase interval: 1 → 3 → 7 → 14 → 30 days
        const nextIntervals = { 1: 3, 3: 7, 7: 14, 14: 30 };
        const nextInterval = nextIntervals[current.interval] || 30;
        if (nextInterval > 30) {
          // Mastered — remove from review schedule
          user.reviewSchedule.splice(reviewIdx, 1);
        } else {
          current.interval = nextInterval;
          current.nextReviewDate = new Date(Date.now() + nextInterval * 24 * 60 * 60 * 1000);
        }
      }
    } else {
      if (!user.wrongAnswers.includes(questionId)) {
        user.wrongAnswers.push(questionId);
      }
      // Spaced Repetition: schedule for review (or reset interval if already scheduled)
      const reviewIdx = user.reviewSchedule.findIndex(r => r.questionId.toString() === questionId.toString());
      if (reviewIdx > -1) {
        // Reset interval back to 1 day
        user.reviewSchedule[reviewIdx].interval = 1;
        user.reviewSchedule[reviewIdx].nextReviewDate = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
      } else {
        // Add new review entry: first review tomorrow
        user.reviewSchedule.push({
          questionId,
          nextReviewDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          interval: 1
        });
      }
    }
    await user.save();

    res.json({
      isCorrect,
      correctOption: question.correctOption,
      solution: question.solution
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit answer' });
  }
});

// Get questions due for review today (Spaced Repetition)
router.get('/reviews/due', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const now = new Date();

    // Split into due (past or today) and upcoming
    const dueItems = [];
    const upcomingItems = [];

    for (const item of user.reviewSchedule) {
      if (item.nextReviewDate <= now) {
        dueItems.push(item);
      } else {
        upcomingItems.push(item);
      }
    }

    // Populate question data for due items
    const dueQuestionIds = dueItems.map(d => d.questionId);
    const upcomingQuestionIds = upcomingItems.map(u => u.questionId);
    
    const dueQuestions = await Question.find({ _id: { $in: dueQuestionIds } });
    const upcomingQuestions = await Question.find({ _id: { $in: upcomingQuestionIds } });

    // Merge schedule info with question data
    const dueResult = dueItems.map(item => {
      const q = dueQuestions.find(q => q._id.toString() === item.questionId.toString());
      return { ...q?.toObject(), interval: item.interval, nextReviewDate: item.nextReviewDate };
    }).filter(Boolean);

    const upcomingResult = upcomingItems.map(item => {
      const q = upcomingQuestions.find(q => q._id.toString() === item.questionId.toString());
      return { ...q?.toObject(), interval: item.interval, nextReviewDate: item.nextReviewDate };
    }).filter(Boolean);

    res.json({ due: dueResult, upcoming: upcomingResult });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch review schedule' });
  }
});

// Speed Round: get N random questions at once
router.get('/speed-round', auth, async (req, res) => {
  try {
    const { subject, count = 10 } = req.query;
    let match = {};
    if (subject && subject !== 'All') match.subject = subject;

    const questions = await Question.aggregate([
      { $match: match },
      { $sample: { size: parseInt(count) } }
    ]);

    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch speed round questions' });
  }
});

// Log study time (Pomodoro)
router.post('/study-time', auth, async (req, res) => {
  try {
    const { minutes } = req.body;
    // Security Fix: Prevent unbounded data injection. Cap at 120 mins per request.
    if (!minutes || minutes <= 0 || minutes > 120) {
      return res.status(400).json({ error: 'Invalid minutes value. Must be between 1 and 120.' });
    }

    await User.findByIdAndUpdate(req.user.id, { $inc: { totalStudyMinutes: minutes } });
    res.json({ message: `Logged ${minutes} minutes of study time` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to log study time' });
  }
});

// Toggle bookmark
router.post('/bookmark/:id', auth, async (req, res) => {
  try {
    const questionId = req.params.id;
    const user = await User.findById(req.user.id);
    
    const index = user.bookmarks.indexOf(questionId);
    if (index > -1) {
      user.bookmarks.splice(index, 1);
      await user.save();
      return res.json({ message: 'Removed from bookmarks', bookmarked: false });
    } else {
      user.bookmarks.push(questionId);
      await user.save();
      return res.json({ message: 'Added to bookmarks', bookmarked: true });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle bookmark' });
  }
});

// Get bookmarked questions
router.get('/bookmarks', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('bookmarks');
    res.json(user.bookmarks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
});

// Get incorrect questions
router.get('/incorrect', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wrongAnswers');
    res.json(user.wrongAnswers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch incorrect questions' });
  }
});

module.exports = router;

const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const Question = require('../models/Question');
const { auth, isAdmin } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // temporary storage for CSV

// Get all questions with filters
router.get('/', auth, async (req, res) => {
  try {
    const { subject, topic, difficulty, isPYQ, pyqYear, search } = req.query;
    
    let query = {};
    if (subject) query.subject = subject;
    if (topic) query.topic = topic;
    if (difficulty) query.difficulty = difficulty;
    if (isPYQ !== undefined) query.isPYQ = isPYQ === 'true';
    if (pyqYear) query.pyqYear = pyqYear;
    if (search) {
      query.questionText = { $regex: search, $options: 'i' };
    }

    const questions = await Question.find(query).sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching questions' });
  }
});

// Get PYQs specific list
router.get('/pyqs', auth, async (req, res) => {
  try {
    const { subject, pyqYear } = req.query;
    let query = { isPYQ: true };
    if (subject) query.subject = subject;
    if (pyqYear) query.pyqYear = pyqYear;

    const pyqs = await Question.find(query).sort({ pyqYear: -1 });
    res.json(pyqs);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching PYQs' });
  }
});

// Create a single question (Admin only)
router.post('/', auth, isAdmin, async (req, res) => {
  try {
    const question = new Question(req.body);
    await question.save();
    res.status(201).json(question);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create question', details: error.message });
  }
});

// Update a question (Admin only)
router.put('/:id', auth, isAdmin, async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!question) return res.status(404).json({ error: 'Question not found' });
    res.json(question);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update question', details: error.message });
  }
});

// Delete a question (Admin only)
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found' });
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

// CSV Upload (Admin only)
router.post('/upload-csv', auth, isAdmin, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No CSV file uploaded' });
  }

  const results = [];
  const errors = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => {
      try {
        // Map CSV fields to Question schema
        const mappedOption = data.correctOption?.toUpperCase();
        let correctIndex = 0;
        if (mappedOption === 'B') correctIndex = 1;
        if (mappedOption === 'C') correctIndex = 2;
        if (mappedOption === 'D') correctIndex = 3;

        results.push({
          subject: data.subject,
          topic: data.topic,
          difficulty: data.difficulty,
          isPYQ: data.isPYQ?.toLowerCase() === 'yes' || data.isPYQ?.toLowerCase() === 'true',
          pyqYear: data.pyqYear ? parseInt(data.pyqYear) : undefined,
          questionText: data.questionText,
          options: [data.optionA, data.optionB, data.optionC, data.optionD],
          correctOption: correctIndex,
          solution: data.solution
        });
      } catch (err) {
        errors.push(err.message);
      }
    })
    .on('end', async () => {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

      if (errors.length > 0) {
        return res.status(400).json({ error: 'CSV parsing errors', details: errors });
      }

      try {
        const inserted = await Question.insertMany(results);
        res.status(201).json({ message: `Successfully uploaded ${inserted.length} questions`, count: inserted.length });
      } catch (dbError) {
        res.status(500).json({ error: 'Failed to save questions to database', details: dbError.message });
      }
    });
});

module.exports = router;

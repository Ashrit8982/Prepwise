const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Question = require('../models/Question');
const { auth } = require('../middleware/auth');

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/explain', auth, async (req, res) => {
  try {
    const { questionId } = req.body;
    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ error: 'Question not found' });

    const prompt = `You are a helpful and patient tutor for engineering students.
Please explain the solution to the following question step-by-step.
Question: ${question.questionText}
Options: A) ${question.options[0]} B) ${question.options[1]} C) ${question.options[2]} D) ${question.options[3]}
Correct Answer Option: ${question.options[question.correctOption]}
Official Solution: ${question.solution}

Please provide a clear, step-by-step breakdown of how to arrive at the correct answer based on the official solution. Format your response nicely using markdown.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json({ explanation: response.text() });
  } catch (error) {
    console.error('AI Explain error:', error.message);
    res.status(500).json({ error: 'Failed to generate explanation: ' + error.message });
  }
});

router.post('/simplify', auth, async (req, res) => {
  try {
    const { questionId } = req.body;
    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ error: 'Question not found' });

    const prompt = `You are a helpful tutor. A student is struggling to understand this solution.
Question: ${question.questionText}
Official Solution: ${question.solution}

Please simplify this solution. Use an analogy if helpful, and keep the language extremely plain and easy to understand for a beginner. Avoid complex jargon where possible.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json({ explanation: response.text() });
  } catch (error) {
    console.error('AI Simplify error:', error.message);
    res.status(500).json({ error: 'Failed to generate simplified explanation: ' + error.message });
  }
});

router.post('/hint', auth, async (req, res) => {
  try {
    const { questionId } = req.body;
    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ error: 'Question not found' });

    const prompt = `You are a tutor. A student is stuck on this question.
Question: ${question.questionText}
Options: A) ${question.options[0]} B) ${question.options[1]} C) ${question.options[2]} D) ${question.options[3]}

Please provide a single, concise hint that points them in the right direction without giving away the final answer.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json({ hint: response.text() });
  } catch (error) {
    console.error('AI Hint error:', error.message);
    res.status(500).json({ error: 'Failed to generate hint: ' + error.message });
  }
});

module.exports = router;

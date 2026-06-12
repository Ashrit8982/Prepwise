const mongoose = require('mongoose');

const MockTestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  questions: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    submittedOption: { type: Number, min: 0, max: 3, default: null },
    isCorrect: { type: Boolean, default: null }
  }],
  score: { type: Number, default: 0 },
  totalQuestions: { type: Number, required: true },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('MockTest', MockTestSchema);

const mongoose = require('mongoose');

const AttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  submittedOption: { type: Number, required: true, min: 0, max: 3 },
  isCorrect: { type: Boolean, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Attempt', AttemptSchema);

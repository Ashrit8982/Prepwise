const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  isPYQ: { type: Boolean, default: false },
  pyqYear: { type: Number },
  questionText: { type: String, required: true },
  options: { 
    type: [String], 
    required: true,
    validate: [arrayLimit, '{PATH} must have exactly 4 options']
  },
  correctOption: { type: Number, required: true, min: 0, max: 3 },
  solution: { type: String, required: true }
}, { timestamps: true });

function arrayLimit(val) {
  return val.length === 4;
}

module.exports = mongoose.model('Question', QuestionSchema);

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  wrongAnswers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  solvedPYQs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  // Spaced Repetition: tracks when each wrong question should be reviewed next
  reviewSchedule: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    nextReviewDate: { type: Date },
    interval: { type: Number, default: 1 } // days until next review (1 → 3 → 7 → 14 → 30)
  }],
  // Pomodoro: total focused study time in minutes
  totalStudyMinutes: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);

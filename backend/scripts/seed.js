require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('../models/Question');

const electronicsQuestions = [
  // Analog Electronics
  {
    subject: "Analog Electronics",
    topic: "Operational Amplifiers",
    difficulty: "Medium",
    isPYQ: true,
    pyqYear: 2021,
    questionText: "An ideal op-amp is configured as an inverting amplifier with an input resistor R1 = 1kΩ and a feedback resistor Rf = 10kΩ. If the input voltage is 2V, what is the output voltage?",
    options: ["-20V", "20V", "10V", "-10V"],
    correctOption: 0,
    solution: "The voltage gain (Av) of an inverting amplifier is given by the formula Av = -Rf / R1. Here, Rf = 10kΩ and R1 = 1kΩ. So, Av = -10k / 1k = -10. The output voltage Vout = Av * Vin = -10 * 2V = -20V."
  },
  {
    subject: "Analog Electronics",
    topic: "BJTs",
    difficulty: "Easy",
    isPYQ: false,
    questionText: "In a BJT operating in the active region, the relationship between collector current (Ic) and base current (Ib) is governed by:",
    options: ["Ic = Ib + Ie", "Ic = β * Ib", "Ic = α * Ie", "Ib = β * Ic"],
    correctOption: 1,
    solution: "In the forward active region of a Bipolar Junction Transistor (BJT), the collector current is proportional to the base current by the common-emitter current gain, denoted as β (beta). Therefore, Ic = β * Ib."
  },
  {
    subject: "Analog Electronics",
    topic: "Diodes & Rectifiers",
    difficulty: "Medium",
    isPYQ: true,
    pyqYear: 2019,
    questionText: "What is the peak inverse voltage (PIV) rating required for a diode in a bridge rectifier circuit, assuming the secondary voltage of the transformer has a peak value of Vm?",
    options: ["Vm", "2Vm", "Vm/2", "√2Vm"],
    correctOption: 0,
    solution: "In a full-wave bridge rectifier, at any given time, two diodes are conducting and two are reverse-biased. The maximum voltage appearing across a reverse-biased diode is equal to the peak secondary voltage, Vm. Hence, PIV = Vm."
  },
  // Digital Electronics
  {
    subject: "Digital Electronics",
    topic: "Logic Gates",
    difficulty: "Easy",
    isPYQ: false,
    questionText: "Which of the following logic gates is considered a 'Universal Gate'?",
    options: ["AND", "OR", "XOR", "NAND"],
    correctOption: 3,
    solution: "NAND and NOR gates are called universal gates because any basic logic gate (AND, OR, NOT) or any complex digital circuit can be implemented using only NAND gates or only NOR gates."
  },
  {
    subject: "Digital Electronics",
    topic: "Combinational Circuits",
    difficulty: "Medium",
    isPYQ: true,
    pyqYear: 2022,
    questionText: "A 4-to-1 multiplexer has how many selection lines?",
    options: ["1", "2", "3", "4"],
    correctOption: 1,
    solution: "A multiplexer with 2^n data input lines requires 'n' selection lines to select one of the inputs. For a 4-to-1 MUX, the number of input lines is 4 (which is 2^2). Therefore, the number of selection lines is 2."
  },
  {
    subject: "Digital Electronics",
    topic: "Flip-Flops",
    difficulty: "Hard",
    isPYQ: true,
    pyqYear: 2020,
    questionText: "In a J-K flip flop, if J=1 and K=1, what is the next state of the flip-flop upon the application of a clock pulse?",
    options: ["Set (1)", "Reset (0)", "Toggles (Complements current state)", "No change"],
    correctOption: 2,
    solution: "When both inputs J and K are HIGH (1), the J-K flip-flop is in the 'toggle' mode. This means the output Q will complement (invert) its present state on the active edge of the clock pulse."
  },
  // Network Theory
  {
    subject: "Network Theory",
    topic: "Thevenin Theorem",
    difficulty: "Medium",
    isPYQ: false,
    questionText: "When calculating the Thevenin equivalent resistance (Rth) of a circuit, what should be done to independent voltage sources?",
    options: ["Replaced by open circuits", "Replaced by short circuits", "Left as they are", "Replaced by a 1 ohm resistor"],
    correctOption: 1,
    solution: "To find the Thevenin resistance (Rth), we must turn off all independent sources in the circuit. An ideal independent voltage source has zero internal resistance, so it is replaced by a short circuit (0V). An independent current source is replaced by an open circuit (0A)."
  },
  {
    subject: "Network Theory",
    topic: "Transient Analysis",
    difficulty: "Hard",
    isPYQ: true,
    pyqYear: 2018,
    questionText: "For a series RLC circuit, what is the condition for the response to be critically damped?",
    options: ["R = 2√(L/C)", "R > 2√(L/C)", "R < 2√(L/C)", "R = √(L/C)"],
    correctOption: 0,
    solution: "The damping factor α = R / (2L) and the resonant frequency ω0 = 1/√(LC). For critical damping, α = ω0. Substituting gives R/(2L) = 1/√(LC), which simplifies to R = 2√(L/C)."
  },
  // Signals and Systems
  {
    subject: "Signals and Systems",
    topic: "Fourier Transform",
    difficulty: "Medium",
    isPYQ: false,
    questionText: "The Fourier transform of a unit impulse function δ(t) is:",
    options: ["1 / (jω)", "1", "2πδ(ω)", "u(ω)"],
    correctOption: 1,
    solution: "The Fourier transform of the Dirac delta function δ(t) is a constant value of 1 for all frequencies. This means an impulse contains all frequencies equally."
  },
  {
    subject: "Signals and Systems",
    topic: "Z-Transform",
    difficulty: "Hard",
    isPYQ: true,
    pyqYear: 2021,
    questionText: "What is the Region of Convergence (ROC) for a right-sided sequence a^n u[n]?",
    options: ["|z| < |a|", "|z| > |a|", "|z| = |a|", "Entire z-plane"],
    correctOption: 1,
    solution: "For a causal (right-sided) sequence x[n] = a^n u[n], the Z-transform sum converges when the magnitude of z is greater than the magnitude of a. Thus, the ROC is the exterior of a circle with radius |a|: |z| > |a|."
  }
];

async function seedDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/prepwise';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing questions
    await Question.deleteMany({});
    console.log('Cleared existing questions.');

    // Insert new questions
    await Question.insertMany(electronicsQuestions);
    console.log(`Successfully seeded ${electronicsQuestions.length} questions!`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDB();

import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const submissionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problemId: {
    type: Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true,
    enum: [
  'assembly',
  'bash',
  'basic',
  'c',
  'C++',
  'csharp',
  'commonlisp',
  'd',
  'elixir',
  'erlang',
  'executable',
  'fortran',
  'go',
  'haskell',
  'java',
  'javascript',
  'lua',
  'ocaml',
  'octave',
  'pascal',
  'php',
  'plaintext',
  'prolog',
  'python',
  'ruby',
  'rust',
  'typescript'
]

  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'wrong', 'error'],
    default: 'pending'
  },
  runtime: {
    type: Number,  // milliseconds
    default: 0
  },
  memory: {
    type: Number,  // kB
    default: 0
  },
  errorMessage: {
    type: String,
    default: ''
  },
  testCasesPassed: {
    type: Number,
    default: 0
  },
  testCasesTotal: {  // Recommended addition
    type: Number,
    default: 0
  }
}, { 
  timestamps: true
});
const Submission = mongoose.model('Submission', submissionSchema);
submissionSchema.index({ userId: 1 , problemId: 1 });
export default Submission;
// Exam Questions - C Programming Fundamentals
// Based on Grade 11 Computer Programming 2 Midterm Topics

export type QuestionType = 'multiple_choice' | 'identification'

export interface Question {
  id: string
  type: QuestionType
  question: string
  options?: string[]
  correctAnswer: string
  points: number
  category: string
}

export const EXAM_QUESTIONS: Question[] = [
  // ==========================================
  // PART I: MULTIPLE CHOICE - Variables & Data Types
  // ==========================================
  {
    id: 'mc_1',
    type: 'multiple_choice',
    question: 'A variable is a container for a value. Which of the following is a valid variable name in C?',
    options: [
      '21_age',
      'my@email',
      'int',
      'student_name'
    ],
    correctAnswer: 'student_name',
    points: 2,
    category: 'Variables'
  },
  {
    id: 'mc_2',
    type: 'multiple_choice',
    question: 'Which of the following variable declarations is correct in C?',
    options: [
      'int 25;',
      'char_ab;',
      'float price = 44.50;',
      'string 143;'
    ],
    correctAnswer: 'float price = 44.50;',
    points: 2,
    category: 'Variable Declaration'
  },
  {
    id: 'mc_3',
    type: 'multiple_choice',
    question: 'Which is the standard header file for input/output operations in C?',
    options: [
      '#include<string.h>',
      '#include(stdio.h)',
      '#include<stdio.h>',
      '#include(string.h)'
    ],
    correctAnswer: '#include<stdio.h>',
    points: 2,
    category: 'C Syntax'
  },
  {
    id: 'mc_4',
    type: 'multiple_choice',
    question: 'Which format specifier is used for the integer value 50?',
    options: [
      '%d',
      '%.2f',
      '%f',
      '%s'
    ],
    correctAnswer: '%d',
    points: 2,
    category: 'Format Specifiers'
  },
  {
    id: 'mc_5',
    type: 'multiple_choice',
    question: 'Which data type should be used to store a single character like \'J\'?',
    options: [
      'float',
      'int',
      'char',
      'void'
    ],
    correctAnswer: 'char',
    points: 2,
    category: 'Data Types'
  },
  {
    id: 'mc_6',
    type: 'multiple_choice',
    question: 'Which operator calculates the remainder of a division?',
    options: [
      '/',
      '++',
      '*',
      '%'
    ],
    correctAnswer: '%',
    points: 2,
    category: 'Operators'
  },
  {
    id: 'mc_7',
    type: 'multiple_choice',
    question: 'What is the result of the expression: x = 62 % 12?',
    options: [
      'x = 0',
      'x = 2',
      'x = 5',
      'x = 744'
    ],
    correctAnswer: 'x = 2',
    points: 2,
    category: 'Operators'
  },
  {
    id: 'mc_8',
    type: 'multiple_choice',
    question: 'Which data type is used for declaring whole numbers (integers)?',
    options: [
      'int',
      'float',
      'char',
      'double'
    ],
    correctAnswer: 'int',
    points: 2,
    category: 'Data Types'
  },
  {
    id: 'mc_9',
    type: 'multiple_choice',
    question: 'Which symbol is used to end every statement in C programming?',
    options: [
      '\\n',
      '{ }',
      ';',
      '&'
    ],
    correctAnswer: ';',
    points: 2,
    category: 'C Syntax'
  },
  {
    id: 'mc_10',
    type: 'multiple_choice',
    question: 'Which format specifier is used to print a string (series of characters)?',
    options: [
      '%c',
      '%d',
      '%f',
      '%s'
    ],
    correctAnswer: '%s',
    points: 2,
    category: 'Format Specifiers'
  },
  {
    id: 'mc_11',
    type: 'multiple_choice',
    question: 'Which of the following is the correct syntax for multi-line comments in C?',
    options: [
      '/* comment */',
      '//',
      '\\\\\\\\',
      '/* comment /*'
    ],
    correctAnswer: '/* comment */',
    points: 2,
    category: 'Comments'
  },
  {
    id: 'mc_12',
    type: 'multiple_choice',
    question: 'Which comment style ignores only a single line in C?',
    options: [
      '/* */',
      '//',
      '<!-- -->',
      '##'
    ],
    correctAnswer: '//',
    points: 2,
    category: 'Comments'
  },
  {
    id: 'mc_13',
    type: 'multiple_choice',
    question: 'Which function is used to display output on the screen in C?',
    options: [
      'printf()',
      'getch()',
      'scanf()',
      'main()'
    ],
    correctAnswer: 'printf()',
    points: 2,
    category: 'C Functions'
  },
  {
    id: 'mc_14',
    type: 'multiple_choice',
    question: 'Which function marks the starting point of program execution in C?',
    options: [
      'start()',
      'main()',
      'printf()',
      'scanf()'
    ],
    correctAnswer: 'main()',
    points: 2,
    category: 'C Functions'
  },
  {
    id: 'mc_15',
    type: 'multiple_choice',
    question: 'What is the correct syntax for an if statement in C?',
    options: [
      'if (condition) statement;',
      'if { condition } statement;',
      'if condition statement;',
      'condition if statement;'
    ],
    correctAnswer: 'if (condition) statement;',
    points: 2,
    category: 'Conditional Statements'
  },
  {
    id: 'mc_16',
    type: 'multiple_choice',
    question: 'When is the else statement executed in an if-else structure?',
    options: [
      'When the condition is true',
      'When the condition is false',
      'Always',
      'Never'
    ],
    correctAnswer: 'When the condition is false',
    points: 2,
    category: 'Conditional Statements'
  },
  {
    id: 'mc_17',
    type: 'multiple_choice',
    question: 'Which of the following is a valid variable name?',
    options: [
      '2ndValue',
      'my-var',
      '_count',
      'float'
    ],
    correctAnswer: '_count',
    points: 2,
    category: 'Variables'
  },
  {
    id: 'mc_18',
    type: 'multiple_choice',
    question: 'What does the ++ operator do in C?',
    options: [
      'Adds two numbers',
      'Increments a value by 1',
      'Multiplies by 2',
      'Compares two values'
    ],
    correctAnswer: 'Increments a value by 1',
    points: 2,
    category: 'Operators'
  },
  {
    id: 'mc_19',
    type: 'multiple_choice',
    question: 'Which function is used to receive input from the user in C?',
    options: [
      'printf()',
      'input()',
      'scanf()',
      'get()'
    ],
    correctAnswer: 'scanf()',
    points: 2,
    category: 'C Functions'
  },
  {
    id: 'mc_20',
    type: 'multiple_choice',
    question: 'What is the output of: printf("%d", 10 / 3);',
    options: [
      '3.33',
      '3',
      '3.0',
      '4'
    ],
    correctAnswer: '3',
    points: 2,
    category: 'Operators'
  },

  // ==========================================
  // PART II: IDENTIFICATION
  // ==========================================
  {
    id: 'id_1',
    type: 'identification',
    question: 'What is the name of the person who developed the C programming language at Bell Laboratory?',
    correctAnswer: 'Dennis Ritchie',
    points: 3,
    category: 'C History'
  },
  {
    id: 'id_2',
    type: 'identification',
    question: 'What format specifier is used for float/decimal values in C?',
    correctAnswer: '%f',
    points: 3,
    category: 'Format Specifiers'
  },
  {
    id: 'id_3',
    type: 'identification',
    question: 'What escape sequence is used to create a new line in C?',
    correctAnswer: '\\n',
    points: 3,
    category: 'Escape Sequences'
  },
  {
    id: 'id_4',
    type: 'identification',
    question: 'What data type is used to store decimal numbers with double precision?',
    correctAnswer: 'double',
    points: 3,
    category: 'Data Types'
  },
  {
    id: 'id_5',
    type: 'identification',
    question: 'What symbol is used with scanf() to get the memory address of a variable?',
    correctAnswer: '&',
    points: 3,
    category: 'C Syntax'
  },
  {
    id: 'id_6',
    type: 'identification',
    question: 'What is the relational operator that checks if two values are equal?',
    correctAnswer: '==',
    points: 3,
    category: 'Operators'
  },
  {
    id: 'id_7',
    type: 'identification',
    question: 'What keyword is used to define a condition that executes when the if condition is false?',
    correctAnswer: 'else',
    points: 3,
    category: 'Conditional Statements'
  },
  {
    id: 'id_8',
    type: 'identification',
    question: 'What type of value does the int data type store?',
    correctAnswer: 'integer',
    points: 3,
    category: 'Data Types'
  },
  {
    id: 'id_9',
    type: 'identification',
    question: 'What format specifier is used for printing a single character?',
    correctAnswer: '%c',
    points: 3,
    category: 'Format Specifiers'
  },
  {
    id: 'id_10',
    type: 'identification',
    question: 'What is the logical operator that returns true only if BOTH conditions are true?',
    correctAnswer: '&&',
    points: 3,
    category: 'Operators'
  },
]

// Calculate total points
export const TOTAL_POINTS = EXAM_QUESTIONS.reduce((sum, q) => sum + q.points, 0)

// Helper function to check answers
export function checkAnswer(questionId: string, userAnswer: string): boolean {
  const question = EXAM_QUESTIONS.find(q => q.id === questionId)
  if (!question) return false
  
  const correct = question.correctAnswer.toLowerCase().trim()
  const answer = userAnswer.toLowerCase().trim()
  
  // For identification questions, allow some flexibility
  if (question.type === 'identification') {
    // Remove extra spaces and common punctuation
    const normalizedCorrect = correct.replace(/[.,;:!?]/g, '').replace(/\s+/g, ' ')
    const normalizedAnswer = answer.replace(/[.,;:!?]/g, '').replace(/\s+/g, ' ')
    
    // Check if answer matches or is contained within acceptable variations
    return normalizedAnswer === normalizedCorrect ||
           normalizedCorrect.includes(normalizedAnswer) ||
           normalizedAnswer.includes(normalizedCorrect)
  }
  
  // For multiple choice, exact match required
  return answer === correct
}

// Calculate score
export function calculateScore(answers: Record<string, string>): { score: number; totalPoints: number; details: Array<{ questionId: string; correct: boolean; points: number }> } {
  let score = 0
  const details: Array<{ questionId: string; correct: boolean; points: number }> = []
  
  for (const question of EXAM_QUESTIONS) {
    const userAnswer = answers[question.id] || ''
    const isCorrect = checkAnswer(question.id, userAnswer)
    
    if (isCorrect) {
      score += question.points
    }
    
    details.push({
      questionId: question.id,
      correct: isCorrect,
      points: isCorrect ? question.points : 0
    })
  }
  
  return { score, totalPoints: TOTAL_POINTS, details }
}

// Get questions by category
export function getQuestionsByCategory(): Record<string, Question[]> {
  const categories: Record<string, Question[]> = {}
  
  for (const question of EXAM_QUESTIONS) {
    if (!categories[question.category]) {
      categories[question.category] = []
    }
    categories[question.category].push(question)
  }
  
  return categories
}

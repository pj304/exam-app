// Exam Questions - C Programming Fundamentals
// Based on Grade 11 Computer Programming 2 Summative Exam
// Total: 100 points

export type QuestionType = 'multiple_choice' | 'identification' | 'code_analysis'

export interface Question {
    id: string
    type: QuestionType
    question: string
    options?: string[]
    correctAnswer: string
    points: number
    category: string
    codeSnippet?: string
}

export const EXAM_QUESTIONS: Question[] = [
    // ==========================================
    // PART I: MULTIPLE CHOICE (20 items x 2 points = 40 points)
    // ==========================================
    {
        id: 'mc_1',
        type: 'multiple_choice',
        question: 'Which of the following follows the correct naming convention for variables in C?',
        options: [
            'my-variable',
            '1st_number',
            'total_score',
            'float'
        ],
        correctAnswer: 'total_score',
        points: 2,
        category: 'Variables'
    },
    {
        id: 'mc_2',
        type: 'multiple_choice',
        question: 'What will happen if you try to store the value 3.14 in an int variable?',
        options: [
            'It will store 3.14 exactly',
            'It will store only 3 (truncated)',
            'It will cause a compilation error',
            'It will store 4 (rounded up)'
        ],
        correctAnswer: 'It will store only 3 (truncated)',
        points: 2,
        category: 'Data Types'
    },
    {
        id: 'mc_3',
        type: 'multiple_choice',
        question: 'Which preprocessor directive is required to use printf() and scanf() functions?',
        options: [
            '#include<math.h>',
            '#include<stdlib.h>',
            '#include<stdio.h>',
            '#include<conio.h>'
        ],
        correctAnswer: '#include<stdio.h>',
        points: 2,
        category: 'C Syntax'
    },
    {
        id: 'mc_4',
        type: 'multiple_choice',
        question: 'To display the value of a float variable with exactly 2 decimal places, which format specifier should be used?',
        options: [
            '%f',
            '%d',
            '%.2f',
            '%2f'
        ],
        correctAnswer: '%.2f',
        points: 2,
        category: 'Format Specifiers'
    },
    {
        id: 'mc_5',
        type: 'multiple_choice',
        question: 'Which data type uses the least memory in C?',
        options: [
            'int',
            'double',
            'char',
            'float'
        ],
        correctAnswer: 'char',
        points: 2,
        category: 'Data Types'
    },
    {
        id: 'mc_6',
        type: 'multiple_choice',
        question: 'What is the result of 17 % 5 in C?',
        options: [
            '3',
            '2',
            '3.4',
            '12'
        ],
        correctAnswer: '2',
        points: 2,
        category: 'Operators'
    },
    {
        id: 'mc_7',
        type: 'multiple_choice',
        question: 'If int a = 10; what is the value of a after executing a += 5;?',
        options: [
            '5',
            '10',
            '15',
            '50'
        ],
        correctAnswer: '15',
        points: 2,
        category: 'Operators'
    },
    {
        id: 'mc_8',
        type: 'multiple_choice',
        question: 'Which statement correctly declares and initializes a character variable?',
        options: [
            'char letter = "A";',
            'char letter = A;',
            'character letter = \'A\';',
            'char letter = \'A\';'
        ],
        correctAnswer: 'char letter = \'A\';',
        points: 2,
        category: 'Variable Declaration'
    },
    {
        id: 'mc_9',
        type: 'multiple_choice',
        question: 'What does the escape sequence \\t produce in output?',
        options: [
            'New line',
            'Tab space',
            'Backslash',
            'Quotation mark'
        ],
        correctAnswer: 'Tab space',
        points: 2,
        category: 'Escape Sequences'
    },
    {
        id: 'mc_10',
        type: 'multiple_choice',
        question: 'Which operator is used to compare if two values are NOT equal?',
        options: [
            '==',
            '=',
            '!=',
            '<>'
        ],
        correctAnswer: '!=',
        points: 2,
        category: 'Operators'
    },
    {
        id: 'mc_11',
        type: 'multiple_choice',
        question: 'What type of error occurs when you forget to put a semicolon at the end of a statement?',
        options: [
            'Runtime error',
            'Logical error',
            'Syntax error',
            'Semantic error'
        ],
        correctAnswer: 'Syntax error',
        points: 2,
        category: 'Error Types'
    },
    {
        id: 'mc_12',
        type: 'multiple_choice',
        question: 'In the expression (5 > 3) && (10 < 8), what is the result?',
        options: [
            'true (1)',
            'false (0)',
            'Error',
            'Undefined'
        ],
        correctAnswer: 'false (0)',
        points: 2,
        category: 'Logical Operators'
    },
    {
        id: 'mc_13',
        type: 'multiple_choice',
        question: 'Which function allows the program to pause and wait for user input before closing?',
        options: [
            'printf()',
            'scanf()',
            'getch()',
            'return 0'
        ],
        correctAnswer: 'getch()',
        points: 2,
        category: 'C Functions'
    },
    {
        id: 'mc_14',
        type: 'multiple_choice',
        question: 'What value does main() typically return to indicate successful program execution?',
        options: [
            '-1',
            '1',
            '0',
            'NULL'
        ],
        correctAnswer: '0',
        points: 2,
        category: 'C Functions'
    },
    {
        id: 'mc_15',
        type: 'multiple_choice',
        question: 'Which control structure is best used when you need to choose between exactly two alternatives?',
        options: [
            'if statement only',
            'if-else statement',
            'switch statement',
            'while loop'
        ],
        correctAnswer: 'if-else statement',
        points: 2,
        category: 'Conditional Statements'
    },
    {
        id: 'mc_16',
        type: 'multiple_choice',
        question: 'What is the output of: printf("%d", 15 / 4);',
        options: [
            '3.75',
            '3',
            '4',
            '3.00'
        ],
        correctAnswer: '3',
        points: 2,
        category: 'Operators'
    },
    {
        id: 'mc_17',
        type: 'multiple_choice',
        question: 'Which of the following is a valid way to declare multiple int variables?',
        options: [
            'int a, b, c;',
            'int a; b; c;',
            'integer a, b, c;',
            'int(a, b, c);'
        ],
        correctAnswer: 'int a, b, c;',
        points: 2,
        category: 'Variable Declaration'
    },
    {
        id: 'mc_18',
        type: 'multiple_choice',
        question: 'What does the -- operator do when placed before a variable (e.g., --count)?',
        options: [
            'Decrements after using the value',
            'Decrements before using the value',
            'Subtracts 2 from the value',
            'Makes the value negative'
        ],
        correctAnswer: 'Decrements before using the value',
        points: 2,
        category: 'Operators'
    },
    {
        id: 'mc_19',
        type: 'multiple_choice',
        question: 'In scanf("%d", &num);, why is the & symbol required before num?',
        options: [
            'To print the value of num',
            'To pass the memory address of num',
            'To declare num as integer',
            'To multiply num by the input'
        ],
        correctAnswer: 'To pass the memory address of num',
        points: 2,
        category: 'Input/Output'
    },
    {
        id: 'mc_20',
        type: 'multiple_choice',
        question: 'Which logical operator returns true if at least one condition is true?',
        options: [
            '&&',
            '||',
            '!',
            '=='
        ],
        correctAnswer: '||',
        points: 2,
        category: 'Logical Operators'
    },

    // ==========================================
    // PART II: IDENTIFICATION (10 items x 3 points = 30 points)
    // ==========================================
    {
        id: 'id_1',
        type: 'identification',
        question: 'What year was the C programming language first developed?',
        correctAnswer: '1972',
        points: 3,
        category: 'C History'
    },
    {
        id: 'id_2',
        type: 'identification',
        question: 'What format specifier is used to display an integer value in printf()?',
        correctAnswer: '%d',
        points: 3,
        category: 'Format Specifiers'
    },
    {
        id: 'id_3',
        type: 'identification',
        question: 'What escape sequence is used to insert a backslash character in a string?',
        correctAnswer: '\\\\',
        points: 3,
        category: 'Escape Sequences'
    },
    {
        id: 'id_4',
        type: 'identification',
        question: 'What data type should be used to store a number like 99.99 with single precision?',
        correctAnswer: 'float',
        points: 3,
        category: 'Data Types'
    },
    {
        id: 'id_5',
        type: 'identification',
        question: 'What arithmetic operator is used for multiplication in C?',
        correctAnswer: '*',
        points: 3,
        category: 'Operators'
    },
    {
        id: 'id_6',
        type: 'identification',
        question: 'What relational operator checks if the left value is greater than or equal to the right value?',
        correctAnswer: '>=',
        points: 3,
        category: 'Operators'
    },
    {
        id: 'id_7',
        type: 'identification',
        question: 'What keyword is used to test multiple conditions in sequence after an initial if statement?',
        correctAnswer: 'else if',
        points: 3,
        category: 'Conditional Statements'
    },
    {
        id: 'id_8',
        type: 'identification',
        question: 'What is the name of the company/laboratory where C programming language was developed?',
        correctAnswer: 'Bell Labs',
        points: 3,
        category: 'C History'
    },
    {
        id: 'id_9',
        type: 'identification',
        question: 'What format specifier is used to display a string in printf()?',
        correctAnswer: '%s',
        points: 3,
        category: 'Format Specifiers'
    },
    {
        id: 'id_10',
        type: 'identification',
        question: 'What logical operator is used to reverse or negate a boolean condition?',
        correctAnswer: '!',
        points: 3,
        category: 'Operators'
    },

    // ==========================================
    // PART III: CODE ANALYSIS (5 items x 6 points = 30 points)
    // ==========================================
    {
        id: 'code_1',
        type: 'code_analysis',
        question: 'What will be the output of this program if the user enters 25?',
        codeSnippet: `#include<stdio.h>
int main() {
    int age;
    printf("Enter your age: ");
    scanf("%d", &age);
    if(age >= 18) {
        printf("You are an adult");
    } else {
        printf("You are a minor");
    }
    return 0;
}`,
        correctAnswer: 'You are an adult',
        points: 6,
        category: 'Code Analysis'
    },
    {
        id: 'code_2',
        type: 'code_analysis',
        question: 'What is the final value printed by this program?',
        codeSnippet: `#include<stdio.h>
int main() {
    int a = 5, b = 3, sum;
    sum = a + b;
    sum = sum * 2;
    printf("%d", sum);
    return 0;
}`,
        correctAnswer: '16',
        points: 6,
        category: 'Code Analysis'
    },
    {
        id: 'code_3',
        type: 'code_analysis',
        question: 'What will be printed by this program?',
        codeSnippet: `#include<stdio.h>
int main() {
    int x = 10;
    x++;
    x = x + 4;
    printf("x = %d", x);
    return 0;
}`,
        correctAnswer: 'x = 15',
        points: 6,
        category: 'Code Analysis'
    },
    {
        id: 'code_4',
        type: 'code_analysis',
        question: 'What will this program display?',
        codeSnippet: `#include<stdio.h>
int main() {
    int num1 = 20, num2 = 15;
    if(num1 > num2) {
        printf("%d is greater", num1);
    } else {
        printf("%d is greater", num2);
    }
    return 0;
}`,
        correctAnswer: '20 is greater',
        points: 6,
        category: 'Code Analysis'
    },
    {
        id: 'code_5',
        type: 'code_analysis',
        question: 'What is the output of this program?',
        codeSnippet: `#include<stdio.h>
int main() {
    int a = 17, b = 5;
    int quotient, remainder;
    quotient = a / b;
    remainder = a % b;
    printf("Q=%d R=%d", quotient, remainder);
    return 0;
}`,
        correctAnswer: 'Q=3 R=2',
        points: 6,
        category: 'Code Analysis'
    },
]

// Calculate total points (should be 100)
export const TOTAL_POINTS = EXAM_QUESTIONS.reduce((sum, q) => sum + q.points, 0)

// Helper function to check answers
export function checkAnswer(questionId: string, userAnswer: string): boolean {
    const question = EXAM_QUESTIONS.find(q => q.id === questionId)
    if (!question) return false

    const correct = question.correctAnswer.toLowerCase().trim()
    const answer = userAnswer.toLowerCase().trim()

    // If no answer provided, it's wrong
    if (!answer || answer.length === 0) return false

    // For multiple choice, exact match required
    if (question.type === 'multiple_choice') {
        return answer === correct
    }

    // For identification questions
    if (question.type === 'identification') {
        // Remove extra spaces and common punctuation
        const normalizedCorrect = correct.replace(/[.,;:!?]/g, '').replace(/\s+/g, ' ').trim()
        const normalizedAnswer = answer.replace(/[.,;:!?]/g, '').replace(/\s+/g, ' ').trim()

        // Must have at least 1 character
        if (normalizedAnswer.length < 1) return false

        // Check for exact match first
        if (normalizedAnswer === normalizedCorrect) return true

        // For short answers (operators, single words), require exact match
        if (normalizedCorrect.length <= 3) {
            return normalizedAnswer === normalizedCorrect
        }

        // For longer answers, allow partial matching (but answer must be substantial)
        if (normalizedAnswer.length >= 3) {
            // Check if answer contains the correct answer or vice versa
            return normalizedCorrect.includes(normalizedAnswer) || normalizedAnswer.includes(normalizedCorrect)
        }

        return false
    }

    // For code analysis questions
    if (question.type === 'code_analysis') {
        // Remove extra spaces
        const normalizedCorrect = correct.replace(/\s+/g, ' ').trim()
        const normalizedAnswer = answer.replace(/\s+/g, ' ').trim()

        // Must have at least 1 character
        if (normalizedAnswer.length < 1) return false

        // Check exact match (ignoring spaces)
        if (normalizedAnswer === normalizedCorrect) return true

        // Check without any spaces
        const noSpaceCorrect = normalizedCorrect.replace(/\s+/g, '')
        const noSpaceAnswer = normalizedAnswer.replace(/\s+/g, '')

        return noSpaceAnswer === noSpaceCorrect
    }

    return false
}

// Calculate score
export function calculateScore(answers: Record<string, string>): {
    score: number
    totalPoints: number
    details: Array<{ questionId: string; correct: boolean; points: number }>
} {
    let score = 0
    const details: Array<{ questionId: string; correct: boolean; points: number }> = []

    for (const question of EXAM_QUESTIONS) {
        const userAnswer = answers[question.id] || ''
        const isCorrect = checkAnswer(question.id, userAnswer)
        const earnedPoints = isCorrect ? question.points : 0

        score += earnedPoints

        details.push({
            questionId: question.id,
            correct: isCorrect,
            points: earnedPoints
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

// Get questions by type
export function getQuestionsByType(): Record<QuestionType, Question[]> {
    return {
        multiple_choice: EXAM_QUESTIONS.filter(q => q.type === 'multiple_choice'),
        identification: EXAM_QUESTIONS.filter(q => q.type === 'identification'),
        code_analysis: EXAM_QUESTIONS.filter(q => q.type === 'code_analysis')
    }
}
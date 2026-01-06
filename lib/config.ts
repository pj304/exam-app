// Exam Configuration
export const EXAM_CONFIG = {
    // Exam details
    TITLE: 'Computer Programming 2 - Summative Exam',
    SUBJECT: 'C Programming Fundamentals',
    GRADE_LEVEL: 'Grade 11',

    // Time settings (in milliseconds)
    DURATION_MINUTES: 60,
    AUTO_SAVE_INTERVAL: 30 * 1000, // 30 seconds

    // Scoring
    PASSING_PERCENTAGE: 60,

    // Display settings
    SHOW_SCORE_AFTER_SUBMIT: true,
    SHOW_CORRECT_ANSWERS: false, // Don't show correct answers to students
}

// Anti-cheat Configuration  
export const ANTI_CHEAT_CONFIG = {
    // Enable/disable anti-cheat
    ENABLED: true,

    // Warning threshold before auto-submit
    // If student gets 3 warnings, exam auto-submits on the 4th violation
    WARNING_THRESHOLD: 3,

    // What to detect
    DETECT_TAB_SWITCH: true,
    DETECT_WINDOW_BLUR: true,
    DETECT_COPY_PASTE: true,
    DETECT_RIGHT_CLICK: true,
    DETECT_PRINT: true,
    DETECT_DEVTOOLS: true,
}

// Grading scale
export const GRADING_SCALE = [
    { min: 97, max: 100, grade: 'A+', description: 'Excellent' },
    { min: 93, max: 96, grade: 'A', description: 'Excellent' },
    { min: 90, max: 92, grade: 'A-', description: 'Excellent' },
    { min: 87, max: 89, grade: 'B+', description: 'Very Good' },
    { min: 83, max: 86, grade: 'B', description: 'Very Good' },
    { min: 80, max: 82, grade: 'B-', description: 'Good' },
    { min: 77, max: 79, grade: 'C+', description: 'Good' },
    { min: 73, max: 76, grade: 'C', description: 'Satisfactory' },
    { min: 70, max: 72, grade: 'C-', description: 'Satisfactory' },
    { min: 67, max: 69, grade: 'D+', description: 'Needs Improvement' },
    { min: 63, max: 66, grade: 'D', description: 'Needs Improvement' },
    { min: 60, max: 62, grade: 'D-', description: 'Passed' },
    { min: 0, max: 59, grade: 'F', description: 'Failed' },
]
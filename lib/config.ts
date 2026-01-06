// Exam Configuration
export const EXAM_CONFIG = {
  // Exam duration in minutes
  DURATION_MINUTES: 60,
  
  // Maximum allowed tab switches before auto-submit
  MAX_TAB_SWITCHES: 3,
  
  // Auto-save interval in milliseconds
  AUTO_SAVE_INTERVAL: 30000, // 30 seconds
  
  // Grace period for reconnection (ms) - for slow internet
  RECONNECTION_GRACE_PERIOD: 60000, // 1 minute
  
  // Exam title
  TITLE: "Midterm Examination in Computer Programming 2",
  
  // Exam subject
  SUBJECT: "C Programming - Conditional Statements",
  
  // Passing score percentage
  PASSING_PERCENTAGE: 60,
  
  // Show score immediately after submission
  SHOW_IMMEDIATE_SCORE: true,
  
  // Allow retakes (set to false for midterm)
  ALLOW_RETAKES: false,
}

// Anti-cheat configuration
export const ANTI_CHEAT_CONFIG = {
  // Disable right-click
  DISABLE_RIGHT_CLICK: true,
  
  // Disable text selection
  DISABLE_TEXT_SELECTION: true,
  
  // Disable keyboard shortcuts (Ctrl+C, Ctrl+V, F12, etc.)
  DISABLE_SHORTCUTS: true,
  
  // Detect visibility change (tab switch)
  DETECT_VISIBILITY_CHANGE: true,
  
  // Detect window blur
  DETECT_WINDOW_BLUR: true,
  
  // Warning threshold before action
  WARNING_THRESHOLD: 2,
  
  // Show warning modal
  SHOW_WARNINGS: true,
}

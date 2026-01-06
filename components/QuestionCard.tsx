'use client'

import { Question } from '@/lib/questions'

interface QuestionCardProps {
  question: Question
  questionNumber: number
  selectedAnswer: string
  onAnswerChange: (answer: string) => void
}

export default function QuestionCard({
  question,
  questionNumber,
  selectedAnswer,
  onAnswerChange,
}: QuestionCardProps) {
  return (
    <div className="question-card p-6 space-y-4">
      {/* Question Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 bg-cyan-500/20 text-cyan-400 rounded-lg flex items-center justify-center text-sm font-bold">
            {questionNumber}
          </span>
          <span className="text-xs px-2 py-1 bg-exam-border/30 rounded text-exam-muted capitalize">
            {question.type.replace('_', ' ')}
          </span>
        </div>
        <span className="text-xs text-exam-muted whitespace-nowrap">
          {question.points} {question.points === 1 ? 'point' : 'points'}
        </span>
      </div>

      {/* Question Text */}
      <p className="text-exam-text leading-relaxed">
        {question.question}
      </p>

      {/* Answer Options */}
      {question.type === 'multiple_choice' && question.options && (
        <div className="space-y-3 pt-2">
          {question.options.map((option, index) => (
            <label
              key={index}
              className={`radio-option ${selectedAnswer === option ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option}
                checked={selectedAnswer === option}
                onChange={(e) => onAnswerChange(e.target.value)}
              />
              <span className="text-sm font-mono">{option}</span>
            </label>
          ))}
        </div>
      )}

      {/* Identification Input */}
      {question.type === 'identification' && (
        <div className="pt-2">
          <input
            type="text"
            className="exam-input"
            placeholder="Type your answer here..."
            value={selectedAnswer}
            onChange={(e) => onAnswerChange(e.target.value)}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
        </div>
      )}

      {/* Answer Status */}
      {selectedAnswer && (
        <div className="flex items-center gap-2 pt-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs text-green-400">Answered</span>
        </div>
      )}
    </div>
  )
}

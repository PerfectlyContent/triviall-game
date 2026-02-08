import { GoogleGenAI } from '@google/genai';
import type { Question, Subject, AgeGroup, QuestionType } from '../types';
import { QUESTION_TYPES } from '../types';
import { v4 as uuidv4 } from 'uuid';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

interface GenerateQuestionParams {
  subject: Subject;
  difficulty: number;
  age: AgeGroup;
  previousQuestions: string[];
  questionType?: QuestionType;
}

export async function generateQuestion(params: GenerateQuestionParams): Promise<Question> {
  if (!ai) throw new Error('Gemini API key not configured');

  const { subject, difficulty, age, previousQuestions, questionType } = params;

  const ageContext = age === 'kid'
    ? 'for a child aged 8-12, using simple and fun language with age-appropriate content'
    : 'for an adult, with challenging and interesting content';

  const difficultyDesc = difficulty <= 3 ? 'easy' : difficulty <= 6 ? 'medium' : 'hard';

  const chosenType = questionType || QUESTION_TYPES[Math.floor(Math.random() * QUESTION_TYPES.length)];

  const typeInstruction = (() => {
    switch (chosenType) {
      case 'multiple_choice':
        return 'Create a multiple choice question with exactly 4 options. One must be correct.';
      case 'true_false':
        return 'Create a true/false question. Options must be exactly ["True", "False"].';
      case 'complete_phrase':
        return 'Create a "complete the phrase" question where the player fills in the blank. Provide 4 possible completions as options.';
      case 'estimation':
        return 'Create an estimation question with 4 numeric range options (e.g., "100-200", "200-500").';
    }
  })();

  const avoidList = previousQuestions.length > 0
    ? `\nDo NOT repeat or closely resemble these previous questions:\n${previousQuestions.slice(-10).join('\n')}`
    : '';

  const prompt = `Generate a trivia question about "${subject}" ${ageContext}.
Difficulty level: ${difficultyDesc} (${difficulty}/10).

${typeInstruction}
${avoidList}

Respond with valid JSON only matching this exact schema:
{
  "text": "the question text",
  "type": "${chosenType}",
  "options": ["option1", "option2", "option3", "option4"],
  "correctAnswer": "the correct option (must exactly match one of the options)",
  "explanation": "a brief 1-2 sentence educational explanation"
}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
    },
  });

  const text = response.text ?? '{}';
  const parsed = JSON.parse(text);

  return {
    id: uuidv4(),
    text: parsed.text,
    type: parsed.type as QuestionType,
    options: parsed.options,
    correctAnswer: parsed.correctAnswer,
    explanation: parsed.explanation || '',
    subject,
    difficulty,
    timeLimit: 20,
  };
}

// Fallback questions for when API is unavailable
const FALLBACK_QUESTIONS: Record<string, Question[]> = {
  Science: [
    { id: 'fb1', text: 'What planet is known as the Red Planet?', type: 'multiple_choice', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], correctAnswer: 'Mars', explanation: 'Mars appears red due to iron oxide on its surface.', subject: 'Science', difficulty: 3, timeLimit: 20 },
    { id: 'fb2', text: 'Water is made up of hydrogen and oxygen.', type: 'true_false', options: ['True', 'False'], correctAnswer: 'True', explanation: 'Water (H2O) consists of two hydrogen atoms and one oxygen atom.', subject: 'Science', difficulty: 2, timeLimit: 20 },
  ],
  History: [
    { id: 'fb3', text: 'In which year did World War II end?', type: 'multiple_choice', options: ['1943', '1944', '1945', '1946'], correctAnswer: '1945', explanation: 'WWII ended in 1945 with the surrender of Japan.', subject: 'History', difficulty: 3, timeLimit: 20 },
  ],
  Nature: [
    { id: 'fb4', text: 'What is the largest mammal on Earth?', type: 'multiple_choice', options: ['African Elephant', 'Blue Whale', 'Giraffe', 'Polar Bear'], correctAnswer: 'Blue Whale', explanation: 'Blue whales can grow up to 100 feet long.', subject: 'Nature', difficulty: 2, timeLimit: 20 },
  ],
  Gaming: [
    { id: 'fb5', text: 'What year was the original Mario Bros. arcade game released?', type: 'multiple_choice', options: ['1981', '1983', '1985', '1987'], correctAnswer: '1983', explanation: 'Mario Bros. was released as an arcade game in 1983.', subject: 'Gaming', difficulty: 5, timeLimit: 20 },
  ],
  Movies: [
    { id: 'fb6', text: 'Which movie features the quote "I\'ll be back"?', type: 'multiple_choice', options: ['Robocop', 'The Terminator', 'Predator', 'Total Recall'], correctAnswer: 'The Terminator', explanation: 'Arnold Schwarzenegger said this iconic line in The Terminator (1984).', subject: 'Movies', difficulty: 3, timeLimit: 20 },
  ],
  Music: [
    { id: 'fb7', text: 'How many strings does a standard guitar have?', type: 'multiple_choice', options: ['4', '5', '6', '8'], correctAnswer: '6', explanation: 'A standard guitar has 6 strings tuned to E-A-D-G-B-E.', subject: 'Music', difficulty: 2, timeLimit: 20 },
  ],
  Sports: [
    { id: 'fb8', text: 'How many players are on a soccer team on the field?', type: 'multiple_choice', options: ['9', '10', '11', '12'], correctAnswer: '11', explanation: 'Each soccer team has 11 players on the field including the goalkeeper.', subject: 'Sports', difficulty: 2, timeLimit: 20 },
  ],
  Food: [
    { id: 'fb9', text: 'Sushi originated in Japan.', type: 'true_false', options: ['True', 'False'], correctAnswer: 'True', explanation: 'Sushi as we know it today originated in Japan, though preserving fish in rice began in Southeast Asia.', subject: 'Food', difficulty: 3, timeLimit: 20 },
  ],
  Travel: [
    { id: 'fb10', text: 'What is the capital of Australia?', type: 'multiple_choice', options: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'], correctAnswer: 'Canberra', explanation: 'Canberra was chosen as the capital as a compromise between Sydney and Melbourne.', subject: 'Travel', difficulty: 4, timeLimit: 20 },
  ],
  'Pop Culture': [
    { id: 'fb11', text: 'What social media platform is known for short videos and was originally called Musical.ly?', type: 'multiple_choice', options: ['Instagram Reels', 'TikTok', 'Snapchat', 'Vine'], correctAnswer: 'TikTok', explanation: 'TikTok merged with Musical.ly in 2018.', subject: 'Pop Culture', difficulty: 3, timeLimit: 20 },
  ],
  Art: [
    { id: 'fb12', text: 'Who painted the Mona Lisa?', type: 'multiple_choice', options: ['Michelangelo', 'Leonardo da Vinci', 'Raphael', 'Donatello'], correctAnswer: 'Leonardo da Vinci', explanation: 'Leonardo da Vinci painted the Mona Lisa in the early 1500s.', subject: 'Art', difficulty: 2, timeLimit: 20 },
  ],
  Tech: [
    { id: 'fb13', text: 'What does "HTML" stand for?', type: 'multiple_choice', options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Hyper Transfer Markup Language', 'Home Tool Markup Language'], correctAnswer: 'Hyper Text Markup Language', explanation: 'HTML stands for Hyper Text Markup Language and is the standard language for web pages.', subject: 'Tech', difficulty: 3, timeLimit: 20 },
  ],
};

export function getFallbackQuestion(subject: Subject): Question {
  const questions = FALLBACK_QUESTIONS[subject] || FALLBACK_QUESTIONS.Science;
  return { ...questions[Math.floor(Math.random() * questions.length)], id: uuidv4() };
}

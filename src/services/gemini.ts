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
  kidAge: number | null;
  previousQuestions: string[];
  questionType?: QuestionType;
  language?: import('../types').Language;
}

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English', ru: 'Russian', de: 'German', pl: 'Polish', es: 'Spanish',
};

const TRUE_FALSE_LABELS: Record<string, [string, string]> = {
  en: ['True', 'False'], ru: ['Верно', 'Неверно'],
  de: ['Wahr', 'Falsch'], pl: ['Prawda', 'Fałsz'], es: ['Verdadero', 'Falso'],
};

export async function generateQuestion(params: GenerateQuestionParams): Promise<Question> {
  if (!ai) throw new Error('Gemini API key not configured');

  const { subject, difficulty, age, kidAge, previousQuestions, questionType, language } = params;

  const ageContext = age === 'kid'
    ? `for a ${kidAge ?? 8}-year-old child. Use simple words a ${kidAge ?? 8}-year-old would understand. Keep it fun and age-appropriate.`
    : 'for an adult, with challenging and interesting content';

  const difficultyDesc = difficulty <= 3 ? 'easy' : difficulty <= 6 ? 'medium' : 'hard';

  const chosenType = questionType || QUESTION_TYPES[Math.floor(Math.random() * QUESTION_TYPES.length)];

  const typeInstruction = (() => {
    switch (chosenType) {
      case 'multiple_choice':
        return 'Create a multiple choice question with exactly 4 options. One must be correct.';
      case 'true_false': {
        const [trueLabel, falseLabel] = TRUE_FALSE_LABELS[language || 'en'] || TRUE_FALSE_LABELS.en;
        return `Create a true/false question. Options must be exactly ["${trueLabel}", "${falseLabel}"].`;
      }
      case 'complete_phrase':
        return 'Create a "complete the phrase" question where the player fills in the blank. Provide 4 possible completions as options.';
      case 'estimation':
        return 'Create an estimation question with 4 numeric range options (e.g., "100-200", "200-500").';
    }
  })();

  const avoidList = previousQuestions.length > 0
    ? `\nDo NOT repeat or closely resemble these previous questions:\n${previousQuestions.slice(-10).join('\n')}`
    : '';

  const languageInstruction = language && language !== 'en'
    ? `\nIMPORTANT: Generate the question, ALL options, and the explanation ENTIRELY in ${LANGUAGE_NAMES[language] || 'English'}. Do NOT include any English text.`
    : '';

  const prompt = `Generate a trivia question about "${subject}" ${ageContext}.
Difficulty level: ${difficultyDesc} (${difficulty}/10).
${languageInstruction}
IMPORTANT STYLE RULES:
- Keep the question SHORT and PUNCHY — ideally under 10 words, never more than 15.
- No filler words. Be direct. Think pub quiz, not textbook.
- Options should also be short — 1-3 words each when possible.
- Explanation should be one snappy sentence.

${typeInstruction}
${avoidList}

Respond with valid JSON only matching this exact schema:
{
  "text": "the question text",
  "type": "${chosenType}",
  "options": ["option1", "option2", "option3", "option4"],
  "correctAnswer": "the correct option (must exactly match one of the options)",
  "explanation": "a brief snappy one-sentence explanation"
}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      temperature: 0.9,
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
    { id: 'fb1', text: 'Which planet is the Red Planet?', type: 'multiple_choice', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], correctAnswer: 'Mars', explanation: 'Iron oxide gives Mars its red color.', subject: 'Science', difficulty: 3, timeLimit: 20 },
    { id: 'fb2', text: 'Water contains oxygen.', type: 'true_false', options: ['True', 'False'], correctAnswer: 'True', explanation: 'H2O = two hydrogen atoms + one oxygen.', subject: 'Science', difficulty: 2, timeLimit: 20 },
    { id: 'fb_sci_3', text: 'What is the hardest natural substance?', type: 'multiple_choice', options: ['Gold', 'Iron', 'Diamond', 'Quartz'], correctAnswer: 'Diamond', explanation: 'Diamonds are made of pure carbon under high pressure.', subject: 'Science', difficulty: 4, timeLimit: 20 },
    { id: 'fb_sci_4', text: 'Humans have 4 hearts.', type: 'true_false', options: ['True', 'False'], correctAnswer: 'False', explanation: 'Humans only have one heart.', subject: 'Science', difficulty: 1, timeLimit: 20 },
  ],
  History: [
    { id: 'fb3', text: 'When did WWII end?', type: 'multiple_choice', options: ['1943', '1944', '1945', '1946'], correctAnswer: '1945', explanation: 'Japan surrendered in 1945.', subject: 'History', difficulty: 3, timeLimit: 20 },
    { id: 'fb_his_2', text: 'Who was the first US President?', type: 'multiple_choice', options: ['Lincoln', 'Washington', 'Jefferson', 'Adams'], correctAnswer: 'Washington', explanation: 'George Washington was the first.', subject: 'History', difficulty: 2, timeLimit: 20 },
    { id: 'fb_his_3', text: 'The Titanic sank in what year?', type: 'multiple_choice', options: ['1905', '1912', '1920', '1931'], correctAnswer: '1912', explanation: 'It sank on its maiden voyage in 1912.', subject: 'History', difficulty: 4, timeLimit: 20 },
  ],
  Nature: [
    { id: 'fb4', text: 'Largest mammal on Earth?', type: 'multiple_choice', options: ['Elephant', 'Blue Whale', 'Giraffe', 'Polar Bear'], correctAnswer: 'Blue Whale', explanation: 'Blue whales can reach 100 feet long.', subject: 'Nature', difficulty: 2, timeLimit: 20 },
    { id: 'fb_nat_2', text: 'What is the fastest land animal?', type: 'multiple_choice', options: ['Lion', 'Cheetah', 'Horse', 'Greyhound'], correctAnswer: 'Cheetah', explanation: 'Cheetahs can run up to 70 mph.', subject: 'Nature', difficulty: 2, timeLimit: 20 },
    { id: 'fb_nat_3', text: 'Spiders are insects.', type: 'true_false', options: ['True', 'False'], correctAnswer: 'False', explanation: 'Spiders are arachnids, not insects.', subject: 'Nature', difficulty: 2, timeLimit: 20 },
  ],
  Gaming: [
    { id: 'fb5', text: 'Mario Bros. arcade release year?', type: 'multiple_choice', options: ['1981', '1983', '1985', '1987'], correctAnswer: '1983', explanation: 'The arcade original dropped in 1983.', subject: 'Gaming', difficulty: 5, timeLimit: 20 },
    { id: 'fb_gam_2', text: 'Best-selling console of all time?', type: 'multiple_choice', options: ['PS2', 'Wii', 'Nintendo DS', 'Xbox 360'], correctAnswer: 'PS2', explanation: 'The PlayStation 2 sold over 155 million units.', subject: 'Gaming', difficulty: 5, timeLimit: 20 },
    { id: 'fb_gam_3', text: 'What game features Master Chief?', type: 'multiple_choice', options: ['Doom', 'Halo', 'Destiny', 'Gears of War'], correctAnswer: 'Halo', explanation: 'Master Chief is the iconic Spartan of Halo.', subject: 'Gaming', difficulty: 2, timeLimit: 20 },
  ],
  Movies: [
    { id: 'fb6', text: '"I\'ll be back" — which film?', type: 'multiple_choice', options: ['Robocop', 'The Terminator', 'Predator', 'Total Recall'], correctAnswer: 'The Terminator', explanation: 'Schwarzenegger\'s iconic line from 1984.', subject: 'Movies', difficulty: 3, timeLimit: 20 },
    { id: 'fb_mov_2', text: 'Who directed Jurassic Park?', type: 'multiple_choice', options: ['Spielberg', 'Lucas', 'Cameron', 'Nolan'], correctAnswer: 'Spielberg', explanation: 'Steven Spielberg directed the 1993 classic.', subject: 'Movies', difficulty: 3, timeLimit: 20 },
    { id: 'fb_mov_3', text: 'First rule of Fight Club?', type: 'multiple_choice', options: ['Win', 'Do not talk about it', 'No shirts', 'Fight to the end'], correctAnswer: 'Do not talk about it', explanation: 'You do NOT talk about Fight Club.', subject: 'Movies', difficulty: 3, timeLimit: 20 },
  ],
  Music: [
    { id: 'fb7', text: 'Strings on a standard guitar?', type: 'multiple_choice', options: ['4', '5', '6', '8'], correctAnswer: '6', explanation: 'Six strings: E-A-D-G-B-E.', subject: 'Music', difficulty: 2, timeLimit: 20 },
    { id: 'fb_mus_2', text: 'Who is the King of Pop?', type: 'multiple_choice', options: ['Prince', 'Michael Jackson', 'Elvis', 'Bowie'], correctAnswer: 'Michael Jackson', explanation: 'MJ is globally known as the King of Pop.', subject: 'Music', difficulty: 2, timeLimit: 20 },
    { id: 'fb_mus_3', text: 'How many keys on a standard piano?', type: 'multiple_choice', options: ['66', '77', '88', '99'], correctAnswer: '88', explanation: 'A standard piano has 88 keys.', subject: 'Music', difficulty: 4, timeLimit: 20 },
  ],
  Sports: [
    { id: 'fb8', text: 'Players on a soccer team?', type: 'multiple_choice', options: ['9', '10', '11', '12'], correctAnswer: '11', explanation: '11 per side, including the keeper.', subject: 'Sports', difficulty: 2, timeLimit: 20 },
    { id: 'fb_spo_2', text: 'A marathon is how many miles?', type: 'multiple_choice', options: ['13.1', '20', '26.2', '30'], correctAnswer: '26.2', explanation: 'A full marathon is officially 26.2 miles.', subject: 'Sports', difficulty: 3, timeLimit: 20 },
    { id: 'fb_spo_3', text: 'In tennis, what score means zero?', type: 'multiple_choice', options: ['Nil', 'Love', 'Zip', 'Blank'], correctAnswer: 'Love', explanation: 'Zero is called "Love" in tennis.', subject: 'Sports', difficulty: 3, timeLimit: 20 },
  ],
  Food: [
    { id: 'fb9', text: 'Sushi originated in Japan.', type: 'true_false', options: ['True', 'False'], correctAnswer: 'True', explanation: 'Modern sushi was born in Japan.', subject: 'Food', difficulty: 3, timeLimit: 20 },
    { id: 'fb_foo_2', text: 'Guacamole is made from?', type: 'multiple_choice', options: ['Tomato', 'Avocado', 'Onion', 'Mango'], correctAnswer: 'Avocado', explanation: 'Mashed avocados are the base for guac.', subject: 'Food', difficulty: 1, timeLimit: 20 },
    { id: 'fb_foo_3', text: 'Which is a type of pasta?', type: 'multiple_choice', options: ['Risotto', 'Baguette', 'Penne', 'Brioche'], correctAnswer: 'Penne', explanation: 'Penne is a tube-shaped pasta.', subject: 'Food', difficulty: 2, timeLimit: 20 },
  ],
  Travel: [
    { id: 'fb10', text: 'Capital of Australia?', type: 'multiple_choice', options: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'], correctAnswer: 'Canberra', explanation: 'A compromise pick between Sydney and Melbourne.', subject: 'Travel', difficulty: 4, timeLimit: 20 },
    { id: 'fb_tra_2', text: 'The Eiffel Tower is in Rome.', type: 'true_false', options: ['True', 'False'], correctAnswer: 'False', explanation: 'It is famously located in Paris, France.', subject: 'Travel', difficulty: 1, timeLimit: 20 },
    { id: 'fb_tra_3', text: 'Which country has the most Pyramids?', type: 'multiple_choice', options: ['Egypt', 'Sudan', 'Mexico', 'Peru'], correctAnswer: 'Sudan', explanation: 'Sudan has more pyramids than Egypt.', subject: 'Travel', difficulty: 7, timeLimit: 20 },
  ],
  'Pop Culture': [
    { id: 'fb11', text: 'Musical.ly became which app?', type: 'multiple_choice', options: ['Reels', 'TikTok', 'Snapchat', 'Vine'], correctAnswer: 'TikTok', explanation: 'TikTok absorbed Musical.ly in 2018.', subject: 'Pop Culture', difficulty: 3, timeLimit: 20 },
    { id: 'fb_pop_2', text: 'Harry Potter\'s scar shape?', type: 'multiple_choice', options: ['Star', 'Moon', 'Lightning bolt', 'Circle'], correctAnswer: 'Lightning bolt', explanation: 'A lightning bolt on his forehead.', subject: 'Pop Culture', difficulty: 1, timeLimit: 20 },
    { id: 'fb_pop_3', text: 'Who is Homer Simpson\'s wife?', type: 'multiple_choice', options: ['Marge', 'Lisa', 'Maggie', 'Patty'], correctAnswer: 'Marge', explanation: 'Marge is the matriarch of the family.', subject: 'Pop Culture', difficulty: 1, timeLimit: 20 },
  ],
  Art: [
    { id: 'fb12', text: 'Who painted the Mona Lisa?', type: 'multiple_choice', options: ['Michelangelo', 'Da Vinci', 'Raphael', 'Donatello'], correctAnswer: 'Da Vinci', explanation: 'Leonardo painted it in the early 1500s.', subject: 'Art', difficulty: 2, timeLimit: 20 },
    { id: 'fb_art_2', text: 'Vincent van Gogh lost which body part?', type: 'multiple_choice', options: ['Eye', 'Finger', 'Ear', 'Toe'], correctAnswer: 'Ear', explanation: 'He infamously cut off part of his left ear.', subject: 'Art', difficulty: 3, timeLimit: 20 },
    { id: 'fb_art_3', text: 'Primary colors are Red, Yellow, and...?', type: 'multiple_choice', options: ['Green', 'Blue', 'Purple', 'Orange'], correctAnswer: 'Blue', explanation: 'Red, Yellow, and Blue are primary.', subject: 'Art', difficulty: 2, timeLimit: 20 },
  ],
  Tech: [
    { id: 'fb13', text: 'What does HTML stand for?', type: 'multiple_choice', options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Hyper Transfer Markup Language', 'Home Tool Markup Language'], correctAnswer: 'Hyper Text Markup Language', explanation: 'The standard language for web pages.', subject: 'Tech', difficulty: 3, timeLimit: 20 },
    { id: 'fb_tec_2', text: 'Creator of Microsoft?', type: 'multiple_choice', options: ['Steve Jobs', 'Bill Gates', 'Elon Musk', 'Mark Zuckerberg'], correctAnswer: 'Bill Gates', explanation: 'Bill Gates co-founded MS in 1975.', subject: 'Tech', difficulty: 2, timeLimit: 20 },
    { id: 'fb_tec_3', text: 'What does CPU mean?', type: 'multiple_choice', options: ['Central Process Unit', 'Central Processing Unit', 'Computer Personal Unit', 'Core Processing Unit'], correctAnswer: 'Central Processing Unit', explanation: 'The brain of the computer.', subject: 'Tech', difficulty: 3, timeLimit: 20 },
  ],
};

export function getFallbackQuestion(subject: Subject): Question {
  const questions = FALLBACK_QUESTIONS[subject] || FALLBACK_QUESTIONS.Science;
  return { ...questions[Math.floor(Math.random() * questions.length)], id: uuidv4() };
}

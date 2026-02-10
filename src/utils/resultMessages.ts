// Randomized result feedback — keeps things fresh every round
// Supports: English, Hebrew, Russian, German, Polish, Spanish

import type { Language } from '../types';

type Msg = { emoji: string; text: string };

const CORRECT_MESSAGES: Record<Language, Msg[]> = {
  en: [
    { emoji: '🎉', text: 'Nailed it!' },
    { emoji: '🧠', text: 'Big brain move!' },
    { emoji: '💥', text: 'Boom! Correct!' },
    { emoji: '⚡', text: 'Lightning fast!' },
    { emoji: '🔥', text: 'On fire!' },
    { emoji: '✨', text: 'Brilliant!' },
    { emoji: '🎯', text: 'Bullseye!' },
    { emoji: '🏆', text: 'Champion answer!' },
    { emoji: '💪', text: 'Too easy for you!' },
    { emoji: '🚀', text: 'Unstoppable!' },
    { emoji: '👏', text: 'Well played!' },
    { emoji: '🤯', text: 'Genius!' },
  ],
  he: [
    { emoji: '🎉', text: 'קלעת!' },
    { emoji: '🧠', text: 'מוח ענק!' },
    { emoji: '💥', text: 'בום! נכון!' },
    { emoji: '⚡', text: 'מהיר כברק!' },
    { emoji: '🔥', text: 'שורף את הכל!' },
    { emoji: '✨', text: 'מבריק!' },
    { emoji: '🎯', text: 'בול פגיעה!' },
    { emoji: '🏆', text: 'תשובת אלופים!' },
    { emoji: '💪', text: 'קל עליך!' },
    { emoji: '🚀', text: 'אי אפשר לעצור אותך!' },
    { emoji: '👏', text: 'כל הכבוד!' },
    { emoji: '🤯', text: 'גאון!' },
  ],
  ru: [
    { emoji: '🎉', text: 'Точно в цель!' },
    { emoji: '🧠', text: 'Голова работает!' },
    { emoji: '💥', text: 'Бум! Верно!' },
    { emoji: '⚡', text: 'Молниеносно!' },
    { emoji: '🔥', text: 'Жжёшь!' },
    { emoji: '✨', text: 'Блестяще!' },
    { emoji: '🎯', text: 'В яблочко!' },
    { emoji: '🏆', text: 'Ответ чемпиона!' },
    { emoji: '💪', text: 'Тебе это легко!' },
    { emoji: '🚀', text: 'Не остановить!' },
    { emoji: '👏', text: 'Отлично сыграно!' },
    { emoji: '🤯', text: 'Гений!' },
  ],
  de: [
    { emoji: '🎉', text: 'Volltreffer!' },
    { emoji: '🧠', text: 'Großes Hirn!' },
    { emoji: '💥', text: 'Boom! Richtig!' },
    { emoji: '⚡', text: 'Blitzschnell!' },
    { emoji: '🔥', text: 'Du brennst!' },
    { emoji: '✨', text: 'Brillant!' },
    { emoji: '🎯', text: 'Ins Schwarze!' },
    { emoji: '🏆', text: 'Meisterantwort!' },
    { emoji: '💪', text: 'Viel zu leicht für dich!' },
    { emoji: '🚀', text: 'Nicht zu stoppen!' },
    { emoji: '👏', text: 'Gut gespielt!' },
    { emoji: '🤯', text: 'Genie!' },
  ],
  pl: [
    { emoji: '🎉', text: 'Trafiłeś!' },
    { emoji: '🧠', text: 'Wielki mózg!' },
    { emoji: '💥', text: 'Bum! Dobrze!' },
    { emoji: '⚡', text: 'Błyskawicznie!' },
    { emoji: '🔥', text: 'Palisz!' },
    { emoji: '✨', text: 'Rewelacja!' },
    { emoji: '🎯', text: 'W dziesiątkę!' },
    { emoji: '🏆', text: 'Mistrzowska odpowiedź!' },
    { emoji: '💪', text: 'Zbyt łatwe!' },
    { emoji: '🚀', text: 'Nie do zatrzymania!' },
    { emoji: '👏', text: 'Świetnie zagrane!' },
    { emoji: '🤯', text: 'Geniusz!' },
  ],
  es: [
    { emoji: '🎉', text: '¡Le diste!' },
    { emoji: '🧠', text: '¡Cerebro en acción!' },
    { emoji: '💥', text: '¡Boom! ¡Correcto!' },
    { emoji: '⚡', text: '¡Rápido como un rayo!' },
    { emoji: '🔥', text: '¡Estás que ardes!' },
    { emoji: '✨', text: '¡Brillante!' },
    { emoji: '🎯', text: '¡Diana!' },
    { emoji: '🏆', text: '¡Respuesta de campeón!' },
    { emoji: '💪', text: '¡Demasiado fácil para ti!' },
    { emoji: '🚀', text: '¡Imparable!' },
    { emoji: '👏', text: '¡Bien jugado!' },
    { emoji: '🤯', text: '¡Genio!' },
  ],
};

const INCORRECT_MESSAGES: Record<Language, Msg[]> = {
  en: [
    { emoji: '😅', text: 'Not quite!' },
    { emoji: '💀', text: 'Oof, tough one!' },
    { emoji: '🫠', text: 'So close!' },
    { emoji: '😬', text: 'Better luck next time!' },
    { emoji: '🤔', text: 'Tricky tricky...' },
    { emoji: '😤', text: 'That was a hard one!' },
    { emoji: '🪦', text: 'RIP that streak!' },
    { emoji: '🙈', text: 'Oops!' },
    { emoji: '😵‍💫', text: 'Brain freeze!' },
    { emoji: '🫣', text: "Can't win 'em all!" },
  ],
  he: [
    { emoji: '😅', text: 'לא בדיוק!' },
    { emoji: '💀', text: 'אאוץ\', שאלה קשה!' },
    { emoji: '🫠', text: 'כמעט!' },
    { emoji: '😬', text: 'יותר מזל בפעם הבאה!' },
    { emoji: '🤔', text: 'מכשול קטן...' },
    { emoji: '😤', text: 'זו היתה קשה!' },
    { emoji: '🪦', text: 'נגמרה הרצועה!' },
    { emoji: '🙈', text: 'אופס!' },
    { emoji: '😵‍💫', text: 'קפאון מוחי!' },
    { emoji: '🫣', text: 'אי אפשר לנצח תמיד!' },
  ],
  ru: [
    { emoji: '😅', text: 'Не совсем!' },
    { emoji: '💀', text: 'Ох, крепкий орешек!' },
    { emoji: '🫠', text: 'Почти!' },
    { emoji: '😬', text: 'Повезёт в следующий раз!' },
    { emoji: '🤔', text: 'Хитрый вопрос...' },
    { emoji: '😤', text: 'Это была сложная!' },
    { emoji: '🪦', text: 'Серия закончилась!' },
    { emoji: '🙈', text: 'Упс!' },
    { emoji: '😵‍💫', text: 'Мозг завис!' },
    { emoji: '🫣', text: 'Всех не переиграешь!' },
  ],
  de: [
    { emoji: '😅', text: 'Knapp daneben!' },
    { emoji: '💀', text: 'Autsch, die war hart!' },
    { emoji: '🫠', text: 'So nah dran!' },
    { emoji: '😬', text: 'Nächstes Mal mehr Glück!' },
    { emoji: '🤔', text: 'Ganz schön tricky...' },
    { emoji: '😤', text: 'Die war echt schwer!' },
    { emoji: '🪦', text: 'Tschüss, Serie!' },
    { emoji: '🙈', text: 'Hoppla!' },
    { emoji: '😵‍💫', text: 'Denkblockade!' },
    { emoji: '🫣', text: 'Man kann nicht immer gewinnen!' },
  ],
  pl: [
    { emoji: '😅', text: 'Nie tym razem!' },
    { emoji: '💀', text: 'Oj, ciężkie pytanie!' },
    { emoji: '🫠', text: 'O mały włos!' },
    { emoji: '😬', text: 'Więcej szczęścia następnym razem!' },
    { emoji: '🤔', text: 'Podchwytliwe...' },
    { emoji: '😤', text: 'To było trudne!' },
    { emoji: '🪦', text: 'Koniec serii!' },
    { emoji: '🙈', text: 'Ups!' },
    { emoji: '😵‍💫', text: 'Zaćmienie mózgu!' },
    { emoji: '🫣', text: 'Nie można wygrać wszystkiego!' },
  ],
  es: [
    { emoji: '😅', text: '¡Casi!' },
    { emoji: '💀', text: '¡Uf, esa fue difícil!' },
    { emoji: '🫠', text: '¡Tan cerca!' },
    { emoji: '😬', text: '¡Más suerte la próxima!' },
    { emoji: '🤔', text: 'Esa fue tramposa...' },
    { emoji: '😤', text: '¡Esa era muy difícil!' },
    { emoji: '🪦', text: '¡Se acabó la racha!' },
    { emoji: '🙈', text: '¡Ups!' },
    { emoji: '😵‍💫', text: '¡Se congeló el cerebro!' },
    { emoji: '🫣', text: '¡No se puede ganar siempre!' },
  ],
};

const STREAK_MESSAGES: Record<Language, Msg[]> = {
  en: [
    { emoji: '🔥', text: 'Streak x{n}! Unstoppable!' },
    { emoji: '⚡', text: '{n} in a row! Beast mode!' },
    { emoji: '🌟', text: '{n}x streak! You\'re a star!' },
    { emoji: '💎', text: '{n}x combo! Legendary!' },
    { emoji: '🚀', text: '{n}x streak! To the moon!' },
    { emoji: '👑', text: '{n} streak! Bow down!' },
  ],
  he: [
    { emoji: '🔥', text: 'רצף x{n}! אי אפשר לעצור!' },
    { emoji: '⚡', text: '{n} ברצף! מצב חיה!' },
    { emoji: '🌟', text: 'רצף של {n}! אתה כוכב!' },
    { emoji: '💎', text: 'קומבו x{n}! אגדי!' },
    { emoji: '🚀', text: 'רצף x{n}! עד הירח!' },
    { emoji: '👑', text: 'רצף של {n}! תכרעו ברך!' },
  ],
  ru: [
    { emoji: '🔥', text: 'Серия x{n}! Не остановить!' },
    { emoji: '⚡', text: '{n} подряд! Режим зверя!' },
    { emoji: '🌟', text: 'Серия {n}x! Ты звезда!' },
    { emoji: '💎', text: 'Комбо x{n}! Легенда!' },
    { emoji: '🚀', text: 'Серия x{n}! До луны!' },
    { emoji: '👑', text: 'Серия {n}! Все на колени!' },
  ],
  de: [
    { emoji: '🔥', text: 'Serie x{n}! Unaufhaltbar!' },
    { emoji: '⚡', text: '{n} am Stück! Beastmodus!' },
    { emoji: '🌟', text: '{n}x Serie! Du bist ein Star!' },
    { emoji: '💎', text: '{n}x Combo! Legendär!' },
    { emoji: '🚀', text: '{n}x Serie! Ab zum Mond!' },
    { emoji: '👑', text: '{n}er Serie! Verneigt euch!' },
  ],
  pl: [
    { emoji: '🔥', text: 'Seria x{n}! Nie do zatrzymania!' },
    { emoji: '⚡', text: '{n} z rzędu! Tryb bestii!' },
    { emoji: '🌟', text: 'Seria {n}x! Jesteś gwiazdą!' },
    { emoji: '💎', text: 'Combo x{n}! Legendarnie!' },
    { emoji: '🚀', text: 'Seria x{n}! Na Księżyc!' },
    { emoji: '👑', text: 'Seria {n}! Ukłońcie się!' },
  ],
  es: [
    { emoji: '🔥', text: '¡Racha x{n}! ¡Imparable!' },
    { emoji: '⚡', text: '¡{n} seguidas! ¡Modo bestia!' },
    { emoji: '🌟', text: '¡Racha de {n}! ¡Eres una estrella!' },
    { emoji: '💎', text: '¡Combo x{n}! ¡Legendario!' },
    { emoji: '🚀', text: '¡Racha x{n}! ¡Hasta la luna!' },
    { emoji: '👑', text: '¡Racha de {n}! ¡Arrodíllense!' },
  ],
};

const TIMEOUT_MESSAGES: Record<Language, Msg[]> = {
  en: [
    { emoji: '⏰', text: 'Time\'s up!' },
    { emoji: '🐢', text: 'Too slow!' },
    { emoji: '⌛', text: 'Clock ran out!' },
    { emoji: '😴', text: 'Fell asleep?' },
  ],
  he: [
    { emoji: '⏰', text: 'נגמר הזמן!' },
    { emoji: '🐢', text: 'לאט מדי!' },
    { emoji: '⌛', text: 'השעון אזל!' },
    { emoji: '😴', text: 'נרדמת?' },
  ],
  ru: [
    { emoji: '⏰', text: 'Время вышло!' },
    { emoji: '🐢', text: 'Слишком медленно!' },
    { emoji: '⌛', text: 'Часики тикнули!' },
    { emoji: '😴', text: 'Уснул что ли?' },
  ],
  de: [
    { emoji: '⏰', text: 'Zeit ist um!' },
    { emoji: '🐢', text: 'Zu langsam!' },
    { emoji: '⌛', text: 'Uhr abgelaufen!' },
    { emoji: '😴', text: 'Eingeschlafen?' },
  ],
  pl: [
    { emoji: '⏰', text: 'Czas minął!' },
    { emoji: '🐢', text: 'Za wolno!' },
    { emoji: '⌛', text: 'Zegar się skończył!' },
    { emoji: '😴', text: 'Zasnąłeś?' },
  ],
  es: [
    { emoji: '⏰', text: '¡Se acabó el tiempo!' },
    { emoji: '🐢', text: '¡Muy lento!' },
    { emoji: '⌛', text: '¡Se agotó el reloj!' },
    { emoji: '😴', text: '¿Te quedaste dormido?' },
  ],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getResultMessage(
  isCorrect: boolean,
  multiplier: number,
  isTimeout: boolean,
  language: Language = 'en',
): { emoji: string; text: string } {
  if (isTimeout) {
    return pickRandom(TIMEOUT_MESSAGES[language]);
  }

  if (isCorrect && multiplier > 1) {
    const msg = pickRandom(STREAK_MESSAGES[language]);
    return {
      emoji: msg.emoji,
      text: msg.text.replace('{n}', String(Math.round(multiplier * 2))),
    };
  }

  if (isCorrect) {
    return pickRandom(CORRECT_MESSAGES[language]);
  }

  return pickRandom(INCORRECT_MESSAGES[language]);
}

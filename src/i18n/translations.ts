import type { Language } from '../types';

export type TranslationKey =
  // Home
  | 'home.trivia'
  | 'home.game'
  | 'home.tagline'
  | 'home.hostGame'
  | 'home.joinGame'
  | 'home.poweredBy'
  // Setup steps
  | 'setup.profile'
  | 'setup.mode'
  | 'setup.subjects'
  | 'setup.settings'
  // Profile
  | 'setup.yourName'
  | 'setup.enterName'
  | 'setup.ageGroup'
  | 'setup.kid'
  | 'setup.adult'
  | 'setup.howOld'
  | 'setup.chooseAvatar'
  // Mode
  | 'setup.sameDevice'
  | 'setup.sameDeviceDesc'
  | 'setup.diffDevices'
  | 'setup.diffDevicesDesc'
  // Subjects
  | 'setup.allSubjects'
  | 'setup.selectAll'
  | 'subject.Science'
  | 'subject.History'
  | 'subject.Gaming'
  | 'subject.Movies'
  | 'subject.Music'
  | 'subject.Sports'
  | 'subject.Nature'
  | 'subject.Food'
  | 'subject.Travel'
  | 'subject.PopCulture'
  | 'subject.Art'
  | 'subject.Tech'
  // Settings
  | 'setup.numRounds'
  | 'setup.quick'
  | 'setup.classic'
  | 'setup.epic'
  | 'setup.continue'
  | 'setup.createLobby'
  // Join
  | 'join.title'
  | 'join.enterCode'
  | 'join.next'
  | 'join.roomNotFound'
  | 'join.joining'
  | 'join.joinGame'
  // Lobby
  | 'lobby.title'
  | 'lobby.shareCode'
  | 'lobby.copied'
  | 'lobby.copyCode'
  | 'lobby.rounds'
  | 'lobby.subjects'
  | 'lobby.sameDevice'
  | 'lobby.online'
  | 'lobby.players'
  | 'lobby.addPlayer'
  | 'lobby.playerName'
  | 'lobby.age'
  | 'lobby.cancel'
  | 'lobby.add'
  | 'lobby.startGame'
  | 'lobby.needPlayers'
  | 'lobby.waitingHost'
  // Round
  | 'round.round'
  | 'round.yourTurn'
  | 'round.generating'
  | 'round.generatingYours'
  | 'round.waitingFor'
  | 'round.didYouKnow'
  | 'round.yourTurnIntro'
  | 'round.playerTurn'
  | 'round.getReady'
  | 'round.watchWait'
  | 'round.isAnswering'
  | 'round.difficulty'
  | 'round.nextTurn'
  | 'round.seeResults'
  | 'round.continue'
  | 'round.correct'
  | 'round.notQuite'
  // Results
  | 'results.tie'
  | 'results.wins'
  | 'results.pts'
  | 'results.correct'
  | 'results.streak'
  | 'results.playAgain'
  | 'results.newGame'
  | 'results.kid'
  | 'results.accuracy'
  // Awards
  | 'award.hottestStreak'
  | 'award.longestStreak'
  | 'award.inARow'
  | 'award.sharpshooter'
  | 'award.highestAccuracy'
  | 'award.accuracyValue'
  | 'award.speedDemon'
  | 'award.fastestAnswer'
  | 'award.speedValue'
  // Difficulty
  | 'difficulty.label'
  | 'difficulty.easy'
  | 'difficulty.medium'
  | 'difficulty.hard'
  // Player badges
  | 'player.host'
  | 'player.kid'
  // Leaderboard
  | 'leaderboard.title';

const en: Record<TranslationKey, string> = {
  // Home
  'home.trivia': 'TRIVIA',
  'home.game': 'GAME',
  'home.tagline': 'Fair play for everyone',
  'home.hostGame': 'Host New Game',
  'home.joinGame': 'Join Game',
  'home.poweredBy': 'Powered by AI',

  // Setup steps
  'setup.profile': 'Profile',
  'setup.mode': 'Mode',
  'setup.subjects': 'Subjects',
  'setup.settings': 'Settings',

  // Profile
  'setup.yourName': 'Your Name',
  'setup.enterName': 'Enter your name',
  'setup.ageGroup': 'Age Group',
  'setup.kid': 'Kid',
  'setup.adult': 'Adult',
  'setup.howOld': 'How old are you?',
  'setup.chooseAvatar': 'Choose Avatar',

  // Mode
  'setup.sameDevice': 'Same Device',
  'setup.sameDeviceDesc': 'Pass the phone around - perfect for parties!',
  'setup.diffDevices': 'Different Devices',
  'setup.diffDevicesDesc': 'Play online with a room code',

  // Subjects
  'setup.allSubjects': 'All Subjects',
  'setup.selectAll': 'Select All',
  'subject.Science': 'Science',
  'subject.History': 'History',
  'subject.Gaming': 'Gaming',
  'subject.Movies': 'Movies',
  'subject.Music': 'Music',
  'subject.Sports': 'Sports',
  'subject.Nature': 'Nature',
  'subject.Food': 'Food',
  'subject.Travel': 'Travel',
  'subject.PopCulture': 'Pop Culture',
  'subject.Art': 'Art',
  'subject.Tech': 'Tech',

  // Settings
  'setup.numRounds': 'Number of Rounds',
  'setup.quick': 'Quick',
  'setup.classic': 'Classic',
  'setup.epic': 'Epic',
  'setup.continue': 'Continue',
  'setup.createLobby': 'Create Lobby',

  // Join
  'join.title': 'Join Game',
  'join.enterCode': 'Enter Room Code',
  'join.next': 'Next',
  'join.roomNotFound': 'Room not found. Check the code and try again.',
  'join.joining': 'Joining...',
  'join.joinGame': 'Join Game',

  // Lobby
  'lobby.title': 'Game Lobby',
  'lobby.shareCode': 'Share this code with friends',
  'lobby.copied': 'Copied!',
  'lobby.copyCode': 'Copy Code',
  'lobby.rounds': 'rounds',
  'lobby.subjects': 'subjects',
  'lobby.sameDevice': 'Same Device',
  'lobby.online': 'Online',
  'lobby.players': 'Players',
  'lobby.addPlayer': '+ Add Player',
  'lobby.playerName': 'Player name',
  'lobby.age': 'Age',
  'lobby.cancel': 'Cancel',
  'lobby.add': 'Add',
  'lobby.startGame': 'Start Game',
  'lobby.needPlayers': 'Need at least 2 players',
  'lobby.waitingHost': 'Waiting for host to start the game...',

  // Round
  'round.round': 'Round',
  'round.yourTurn': 'Your Turn',
  'round.generating': 'Generating question...',
  'round.generatingYours': 'Generating your question...',
  'round.waitingFor': "Waiting for {name}'s turn...",
  'round.didYouKnow': 'Did you know?',
  'round.yourTurnIntro': 'Your Turn!',
  'round.playerTurn': "{name}'s Turn",
  'round.getReady': 'Get ready!',
  'round.watchWait': 'Watch and wait...',
  'round.isAnswering': '{name} is answering...',
  'round.difficulty': 'Difficulty',
  'round.nextTurn': 'Next turn in a moment...',
  'round.seeResults': 'See Results',
  'round.continue': 'Continue',
  'round.correct': 'Correct!',
  'round.notQuite': 'Not quite!',

  // Results
  'results.tie': "It's a Tie!",
  'results.wins': '{name} Wins!',
  'results.pts': 'pts',
  'results.correct': 'correct',
  'results.streak': 'streak',
  'results.playAgain': 'Play Again',
  'results.newGame': 'New Game',
  'results.kid': 'KID',
  'results.accuracy': 'accuracy',

  // Awards
  'award.hottestStreak': 'Hottest Streak',
  'award.longestStreak': 'Longest answer streak',
  'award.inARow': '{n} in a row',
  'award.sharpshooter': 'Sharpshooter',
  'award.highestAccuracy': 'Highest accuracy',
  'award.accuracyValue': '{n}% accuracy',
  'award.speedDemon': 'Speed Demon',
  'award.fastestAnswer': 'Fastest correct answer',
  'award.speedValue': '{n}s',

  // Difficulty
  'difficulty.label': 'Difficulty',
  'difficulty.easy': 'Easy',
  'difficulty.medium': 'Medium',
  'difficulty.hard': 'Hard',

  // Player badges
  'player.host': 'HOST',
  'player.kid': 'KID',

  // Leaderboard
  'leaderboard.title': 'Leaderboard',
};

const ru: Record<TranslationKey, string> = {
  // Home
  'home.trivia': 'TRIVIA',
  'home.game': 'GAME',
  'home.tagline': 'Честная игра для всех',
  'home.hostGame': 'Создать игру',
  'home.joinGame': 'Присоединиться',
  'home.poweredBy': 'На базе ИИ',

  // Setup steps
  'setup.profile': 'Профиль',
  'setup.mode': 'Режим',
  'setup.subjects': 'Темы',
  'setup.settings': 'Настройки',

  // Profile
  'setup.yourName': 'Ваше имя',
  'setup.enterName': 'Введите имя',
  'setup.ageGroup': 'Возраст',
  'setup.kid': 'Ребёнок',
  'setup.adult': 'Взрослый',
  'setup.howOld': 'Сколько тебе лет?',
  'setup.chooseAvatar': 'Выбери аватар',

  // Mode
  'setup.sameDevice': 'Одно устройство',
  'setup.sameDeviceDesc': 'Передавайте телефон по кругу - идеально для вечеринок!',
  'setup.diffDevices': 'Разные устройства',
  'setup.diffDevicesDesc': 'Играйте онлайн по коду комнаты',

  // Subjects
  'setup.allSubjects': 'Все темы',
  'setup.selectAll': 'Выбрать все',
  'subject.Science': 'Наука',
  'subject.History': 'История',
  'subject.Gaming': 'Видеоигры',
  'subject.Movies': 'Кино',
  'subject.Music': 'Музыка',
  'subject.Sports': 'Спорт',
  'subject.Nature': 'Природа',
  'subject.Food': 'Еда',
  'subject.Travel': 'Путешествия',
  'subject.PopCulture': 'Поп-культура',
  'subject.Art': 'Искусство',
  'subject.Tech': 'Технологии',

  // Settings
  'setup.numRounds': 'Количество раундов',
  'setup.quick': 'Быстрая',
  'setup.classic': 'Классика',
  'setup.epic': 'Эпик',
  'setup.continue': 'Далее',
  'setup.createLobby': 'Создать лобби',

  // Join
  'join.title': 'Присоединиться',
  'join.enterCode': 'Введите код комнаты',
  'join.next': 'Далее',
  'join.roomNotFound': 'Комната не найдена. Проверьте код и попробуйте снова.',
  'join.joining': 'Подключение...',
  'join.joinGame': 'Присоединиться',

  // Lobby
  'lobby.title': 'Лобби',
  'lobby.shareCode': 'Поделитесь кодом с друзьями',
  'lobby.copied': 'Скопировано!',
  'lobby.copyCode': 'Копировать код',
  'lobby.rounds': 'раундов',
  'lobby.subjects': 'тем',
  'lobby.sameDevice': 'Одно устройство',
  'lobby.online': 'Онлайн',
  'lobby.players': 'Игроки',
  'lobby.addPlayer': '+ Добавить игрока',
  'lobby.playerName': 'Имя игрока',
  'lobby.age': 'Возраст',
  'lobby.cancel': 'Отмена',
  'lobby.add': 'Добавить',
  'lobby.startGame': 'Начать игру',
  'lobby.needPlayers': 'Нужно минимум 2 игрока',
  'lobby.waitingHost': 'Ожидание начала игры...',

  // Round
  'round.round': 'Раунд',
  'round.yourTurn': 'Ваш ход',
  'round.generating': 'Генерация вопроса...',
  'round.generatingYours': 'Генерация вашего вопроса...',
  'round.waitingFor': 'Ожидание хода {name}...',
  'round.didYouKnow': 'А вы знали?',
  'round.yourTurnIntro': 'Ваш ход!',
  'round.playerTurn': 'Ход {name}',
  'round.getReady': 'Приготовьтесь!',
  'round.watchWait': 'Наблюдайте и ждите...',
  'round.isAnswering': '{name} отвечает...',
  'round.difficulty': 'Сложность',
  'round.nextTurn': 'Следующий ход через мгновение...',
  'round.seeResults': 'Результаты',
  'round.continue': 'Далее',
  'round.correct': 'Верно!',
  'round.notQuite': 'Не совсем!',

  // Results
  'results.tie': 'Ничья!',
  'results.wins': '{name} побеждает!',
  'results.pts': 'очк.',
  'results.correct': 'верно',
  'results.streak': 'серия',
  'results.playAgain': 'Играть снова',
  'results.newGame': 'Новая игра',
  'results.kid': 'РЕБЁНОК',
  'results.accuracy': 'точность',

  // Awards
  'award.hottestStreak': 'Лучшая серия',
  'award.longestStreak': 'Самая длинная серия ответов',
  'award.inARow': '{n} подряд',
  'award.sharpshooter': 'Снайпер',
  'award.highestAccuracy': 'Самая высокая точность',
  'award.accuracyValue': '{n}% точность',
  'award.speedDemon': 'Молниеносный',
  'award.fastestAnswer': 'Самый быстрый верный ответ',
  'award.speedValue': '{n} сек.',

  // Difficulty
  'difficulty.label': 'Сложность',
  'difficulty.easy': 'Легко',
  'difficulty.medium': 'Средне',
  'difficulty.hard': 'Сложно',

  // Player badges
  'player.host': 'ХОСТ',
  'player.kid': 'РЕБЁНОК',

  // Leaderboard
  'leaderboard.title': 'Таблица лидеров',
};

const de: Record<TranslationKey, string> = {
  // Home
  'home.trivia': 'TRIVIA',
  'home.game': 'GAME',
  'home.tagline': 'Faires Spiel für alle',
  'home.hostGame': 'Neues Spiel erstellen',
  'home.joinGame': 'Spiel beitreten',
  'home.poweredBy': 'KI-gestützt',

  // Setup steps
  'setup.profile': 'Profil',
  'setup.mode': 'Modus',
  'setup.subjects': 'Themen',
  'setup.settings': 'Einstellungen',

  // Profile
  'setup.yourName': 'Dein Name',
  'setup.enterName': 'Name eingeben',
  'setup.ageGroup': 'Altersgruppe',
  'setup.kid': 'Kind',
  'setup.adult': 'Erwachsener',
  'setup.howOld': 'Wie alt bist du?',
  'setup.chooseAvatar': 'Avatar wählen',

  // Mode
  'setup.sameDevice': 'Ein Gerät',
  'setup.sameDeviceDesc': 'Gebt das Handy reihum - perfekt für Partys!',
  'setup.diffDevices': 'Verschiedene Geräte',
  'setup.diffDevicesDesc': 'Online spielen mit einem Raumcode',

  // Subjects
  'setup.allSubjects': 'Alle Themen',
  'setup.selectAll': 'Alle auswählen',
  'subject.Science': 'Wissenschaft',
  'subject.History': 'Geschichte',
  'subject.Gaming': 'Gaming',
  'subject.Movies': 'Filme',
  'subject.Music': 'Musik',
  'subject.Sports': 'Sport',
  'subject.Nature': 'Natur',
  'subject.Food': 'Essen',
  'subject.Travel': 'Reisen',
  'subject.PopCulture': 'Popkultur',
  'subject.Art': 'Kunst',
  'subject.Tech': 'Technik',

  // Settings
  'setup.numRounds': 'Anzahl der Runden',
  'setup.quick': 'Schnell',
  'setup.classic': 'Klassisch',
  'setup.epic': 'Episch',
  'setup.continue': 'Weiter',
  'setup.createLobby': 'Lobby erstellen',

  // Join
  'join.title': 'Spiel beitreten',
  'join.enterCode': 'Raumcode eingeben',
  'join.next': 'Weiter',
  'join.roomNotFound': 'Raum nicht gefunden. Überprüfe den Code und versuche es erneut.',
  'join.joining': 'Beitritt...',
  'join.joinGame': 'Beitreten',

  // Lobby
  'lobby.title': 'Spiellobby',
  'lobby.shareCode': 'Teile diesen Code mit Freunden',
  'lobby.copied': 'Kopiert!',
  'lobby.copyCode': 'Code kopieren',
  'lobby.rounds': 'Runden',
  'lobby.subjects': 'Themen',
  'lobby.sameDevice': 'Ein Gerät',
  'lobby.online': 'Online',
  'lobby.players': 'Spieler',
  'lobby.addPlayer': '+ Spieler hinzufügen',
  'lobby.playerName': 'Spielername',
  'lobby.age': 'Alter',
  'lobby.cancel': 'Abbrechen',
  'lobby.add': 'Hinzufügen',
  'lobby.startGame': 'Spiel starten',
  'lobby.needPlayers': 'Mindestens 2 Spieler nötig',
  'lobby.waitingHost': 'Warte auf den Spielstart...',

  // Round
  'round.round': 'Runde',
  'round.yourTurn': 'Du bist dran',
  'round.generating': 'Frage wird erstellt...',
  'round.generatingYours': 'Deine Frage wird erstellt...',
  'round.waitingFor': 'Warte auf {name}...',
  'round.didYouKnow': 'Wusstest du?',
  'round.yourTurnIntro': 'Du bist dran!',
  'round.playerTurn': '{name} ist dran',
  'round.getReady': 'Mach dich bereit!',
  'round.watchWait': 'Zuschauen und warten...',
  'round.isAnswering': '{name} antwortet...',
  'round.difficulty': 'Schwierigkeit',
  'round.nextTurn': 'Nächster Zug gleich...',
  'round.seeResults': 'Ergebnisse',
  'round.continue': 'Weiter',
  'round.correct': 'Richtig!',
  'round.notQuite': 'Knapp daneben!',

  // Results
  'results.tie': 'Unentschieden!',
  'results.wins': '{name} gewinnt!',
  'results.pts': 'Pkt.',
  'results.correct': 'richtig',
  'results.streak': 'Serie',
  'results.playAgain': 'Nochmal spielen',
  'results.newGame': 'Neues Spiel',
  'results.kid': 'KIND',
  'results.accuracy': 'Genauigkeit',

  // Awards
  'award.hottestStreak': 'Beste Serie',
  'award.longestStreak': 'Längste Antwortserie',
  'award.inARow': '{n} in Folge',
  'award.sharpshooter': 'Scharfschütze',
  'award.highestAccuracy': 'Höchste Genauigkeit',
  'award.accuracyValue': '{n}% Genauigkeit',
  'award.speedDemon': 'Blitzschnell',
  'award.fastestAnswer': 'Schnellste richtige Antwort',
  'award.speedValue': '{n} Sek.',

  // Difficulty
  'difficulty.label': 'Schwierigkeit',
  'difficulty.easy': 'Leicht',
  'difficulty.medium': 'Mittel',
  'difficulty.hard': 'Schwer',

  // Player badges
  'player.host': 'HOST',
  'player.kid': 'KIND',

  // Leaderboard
  'leaderboard.title': 'Bestenliste',
};

const pl: Record<TranslationKey, string> = {
  // Home
  'home.trivia': 'TRIVIA',
  'home.game': 'GAME',
  'home.tagline': 'Uczciwa gra dla wszystkich',
  'home.hostGame': 'Nowa gra',
  'home.joinGame': 'Dołącz do gry',
  'home.poweredBy': 'Napędzane przez AI',

  // Setup steps
  'setup.profile': 'Profil',
  'setup.mode': 'Tryb',
  'setup.subjects': 'Tematy',
  'setup.settings': 'Ustawienia',

  // Profile
  'setup.yourName': 'Twoje imię',
  'setup.enterName': 'Wpisz swoje imię',
  'setup.ageGroup': 'Grupa wiekowa',
  'setup.kid': 'Dziecko',
  'setup.adult': 'Dorosły',
  'setup.howOld': 'Ile masz lat?',
  'setup.chooseAvatar': 'Wybierz awatar',

  // Mode
  'setup.sameDevice': 'Jedno urządzenie',
  'setup.sameDeviceDesc': 'Podawajcie telefon w kółko - idealne na imprezy!',
  'setup.diffDevices': 'Osobne urządzenia',
  'setup.diffDevicesDesc': 'Graj online z kodem pokoju',

  // Subjects
  'setup.allSubjects': 'Wszystkie tematy',
  'setup.selectAll': 'Zaznacz wszystko',
  'subject.Science': 'Nauka',
  'subject.History': 'Historia',
  'subject.Gaming': 'Gry',
  'subject.Movies': 'Filmy',
  'subject.Music': 'Muzyka',
  'subject.Sports': 'Sport',
  'subject.Nature': 'Natura',
  'subject.Food': 'Jedzenie',
  'subject.Travel': 'Podróże',
  'subject.PopCulture': 'Popkultura',
  'subject.Art': 'Sztuka',
  'subject.Tech': 'Technologia',

  // Settings
  'setup.numRounds': 'Liczba rund',
  'setup.quick': 'Szybka',
  'setup.classic': 'Klasyczna',
  'setup.epic': 'Epicka',
  'setup.continue': 'Dalej',
  'setup.createLobby': 'Utwórz lobby',

  // Join
  'join.title': 'Dołącz do gry',
  'join.enterCode': 'Wpisz kod pokoju',
  'join.next': 'Dalej',
  'join.roomNotFound': 'Pokój nie znaleziony. Sprawdź kod i spróbuj ponownie.',
  'join.joining': 'Dołączanie...',
  'join.joinGame': 'Dołącz',

  // Lobby
  'lobby.title': 'Lobby gry',
  'lobby.shareCode': 'Udostępnij kod znajomym',
  'lobby.copied': 'Skopiowano!',
  'lobby.copyCode': 'Kopiuj kod',
  'lobby.rounds': 'rund',
  'lobby.subjects': 'tematów',
  'lobby.sameDevice': 'Jedno urządzenie',
  'lobby.online': 'Online',
  'lobby.players': 'Gracze',
  'lobby.addPlayer': '+ Dodaj gracza',
  'lobby.playerName': 'Imię gracza',
  'lobby.age': 'Wiek',
  'lobby.cancel': 'Anuluj',
  'lobby.add': 'Dodaj',
  'lobby.startGame': 'Rozpocznij grę',
  'lobby.needPlayers': 'Potrzeba minimum 2 graczy',
  'lobby.waitingHost': 'Czekam na start gry...',

  // Round
  'round.round': 'Runda',
  'round.yourTurn': 'Twoja kolej',
  'round.generating': 'Generowanie pytania...',
  'round.generatingYours': 'Generowanie twojego pytania...',
  'round.waitingFor': 'Czekam na kolej {name}...',
  'round.didYouKnow': 'Czy wiesz, że?',
  'round.yourTurnIntro': 'Twoja kolej!',
  'round.playerTurn': 'Kolej {name}',
  'round.getReady': 'Przygotuj się!',
  'round.watchWait': 'Obserwuj i czekaj...',
  'round.isAnswering': '{name} odpowiada...',
  'round.difficulty': 'Trudność',
  'round.nextTurn': 'Następna kolej za chwilę...',
  'round.seeResults': 'Zobacz wyniki',
  'round.continue': 'Dalej',
  'round.correct': 'Dobrze!',
  'round.notQuite': 'Nie tym razem!',

  // Results
  'results.tie': 'Remis!',
  'results.wins': '{name} wygrywa!',
  'results.pts': 'pkt',
  'results.correct': 'poprawne',
  'results.streak': 'seria',
  'results.playAgain': 'Zagraj ponownie',
  'results.newGame': 'Nowa gra',
  'results.kid': 'DZIECKO',
  'results.accuracy': 'celność',

  // Awards
  'award.hottestStreak': 'Najlepsza seria',
  'award.longestStreak': 'Najdłuższa seria odpowiedzi',
  'award.inARow': '{n} z rzędu',
  'award.sharpshooter': 'Strzelec wyborowy',
  'award.highestAccuracy': 'Najwyższa celność',
  'award.accuracyValue': '{n}% celności',
  'award.speedDemon': 'Błyskawica',
  'award.fastestAnswer': 'Najszybsza poprawna odpowiedź',
  'award.speedValue': '{n} sek.',

  // Difficulty
  'difficulty.label': 'Trudność',
  'difficulty.easy': 'Łatwe',
  'difficulty.medium': 'Średnie',
  'difficulty.hard': 'Trudne',

  // Player badges
  'player.host': 'HOST',
  'player.kid': 'DZIECKO',

  // Leaderboard
  'leaderboard.title': 'Tabela wyników',
};

const es: Record<TranslationKey, string> = {
  // Home
  'home.trivia': 'TRIVIA',
  'home.game': 'GAME',
  'home.tagline': 'Juego justo para todos',
  'home.hostGame': 'Crear partida',
  'home.joinGame': 'Unirse a partida',
  'home.poweredBy': 'Impulsado por IA',

  // Setup steps
  'setup.profile': 'Perfil',
  'setup.mode': 'Modo',
  'setup.subjects': 'Temas',
  'setup.settings': 'Ajustes',

  // Profile
  'setup.yourName': 'Tu nombre',
  'setup.enterName': 'Escribe tu nombre',
  'setup.ageGroup': 'Grupo de edad',
  'setup.kid': 'Niño',
  'setup.adult': 'Adulto',
  'setup.howOld': '¿Cuántos años tienes?',
  'setup.chooseAvatar': 'Elige un avatar',

  // Mode
  'setup.sameDevice': 'Mismo dispositivo',
  'setup.sameDeviceDesc': 'Pasad el móvil entre vosotros - ¡perfecto para fiestas!',
  'setup.diffDevices': 'Dispositivos distintos',
  'setup.diffDevicesDesc': 'Juega en línea con un código de sala',

  // Subjects
  'setup.allSubjects': 'Todos los temas',
  'setup.selectAll': 'Seleccionar todo',
  'subject.Science': 'Ciencia',
  'subject.History': 'Historia',
  'subject.Gaming': 'Videojuegos',
  'subject.Movies': 'Películas',
  'subject.Music': 'Música',
  'subject.Sports': 'Deportes',
  'subject.Nature': 'Naturaleza',
  'subject.Food': 'Comida',
  'subject.Travel': 'Viajes',
  'subject.PopCulture': 'Cultura pop',
  'subject.Art': 'Arte',
  'subject.Tech': 'Tecnología',

  // Settings
  'setup.numRounds': 'Número de rondas',
  'setup.quick': 'Rápida',
  'setup.classic': 'Clásica',
  'setup.epic': 'Épica',
  'setup.continue': 'Continuar',
  'setup.createLobby': 'Crear sala',

  // Join
  'join.title': 'Unirse a partida',
  'join.enterCode': 'Introduce el código',
  'join.next': 'Siguiente',
  'join.roomNotFound': 'Sala no encontrada. Revisa el código e inténtalo de nuevo.',
  'join.joining': 'Uniéndose...',
  'join.joinGame': 'Unirse',

  // Lobby
  'lobby.title': 'Sala de espera',
  'lobby.shareCode': 'Comparte este código con amigos',
  'lobby.copied': '¡Copiado!',
  'lobby.copyCode': 'Copiar código',
  'lobby.rounds': 'rondas',
  'lobby.subjects': 'temas',
  'lobby.sameDevice': 'Mismo dispositivo',
  'lobby.online': 'En línea',
  'lobby.players': 'Jugadores',
  'lobby.addPlayer': '+ Añadir jugador',
  'lobby.playerName': 'Nombre del jugador',
  'lobby.age': 'Edad',
  'lobby.cancel': 'Cancelar',
  'lobby.add': 'Añadir',
  'lobby.startGame': 'Empezar partida',
  'lobby.needPlayers': 'Se necesitan al menos 2 jugadores',
  'lobby.waitingHost': 'Esperando a que el anfitrión inicie la partida...',

  // Round
  'round.round': 'Ronda',
  'round.yourTurn': 'Tu turno',
  'round.generating': 'Generando pregunta...',
  'round.generatingYours': 'Generando tu pregunta...',
  'round.waitingFor': 'Esperando el turno de {name}...',
  'round.didYouKnow': '¿Sabías que?',
  'round.yourTurnIntro': '¡Tu turno!',
  'round.playerTurn': 'Turno de {name}',
  'round.getReady': '¡Prepárate!',
  'round.watchWait': 'Observa y espera...',
  'round.isAnswering': '{name} está respondiendo...',
  'round.difficulty': 'Dificultad',
  'round.nextTurn': 'Siguiente turno en un momento...',
  'round.seeResults': 'Ver resultados',
  'round.continue': 'Continuar',
  'round.correct': '¡Correcto!',
  'round.notQuite': '¡Casi!',

  // Results
  'results.tie': '¡Empate!',
  'results.wins': '¡{name} gana!',
  'results.pts': 'pts',
  'results.correct': 'correctas',
  'results.streak': 'racha',
  'results.playAgain': 'Jugar de nuevo',
  'results.newGame': 'Nueva partida',
  'results.kid': 'NIÑO',
  'results.accuracy': 'precisión',

  // Awards
  'award.hottestStreak': 'Mejor racha',
  'award.longestStreak': 'Racha de respuestas más larga',
  'award.inARow': '{n} seguidas',
  'award.sharpshooter': 'Tirador certero',
  'award.highestAccuracy': 'Mayor precisión',
  'award.accuracyValue': '{n}% de precisión',
  'award.speedDemon': 'Rayo veloz',
  'award.fastestAnswer': 'Respuesta correcta más rápida',
  'award.speedValue': '{n}s',

  // Difficulty
  'difficulty.label': 'Dificultad',
  'difficulty.easy': 'Fácil',
  'difficulty.medium': 'Media',
  'difficulty.hard': 'Difícil',

  // Player badges
  'player.host': 'ANFITRIÓN',
  'player.kid': 'NIÑO',

  // Leaderboard
  'leaderboard.title': 'Clasificación',
};

export const translations: Record<Language, Record<TranslationKey, string>> = {
  en,
  ru,
  de,
  pl,
  es,
};

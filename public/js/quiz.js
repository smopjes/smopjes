'use strict';

// ===== VRAGEN (20 stuks) =====
const QUESTIONS = [
  {
    category: 'Muziek',
    question: 'Welke Spice Girl had de bijnaam "Scary Spice"?',
    answers: ['Victoria Beckham', 'Mel B', 'Emma Bunton', 'Melanie C'],
    correct: 1,
  },
  {
    category: 'Film',
    question: 'In welk jaar verscheen de Disney-film "The Lion King"?',
    answers: ['1992', '1993', '1994', '1995'],
    correct: 2,
  },
  {
    category: 'Muziek',
    question: 'Welke band bracht in 1991 het album "Nevermind" uit?',
    answers: ['Pearl Jam', 'Soundgarden', 'Nirvana', 'Alice in Chains'],
    correct: 2,
  },
  {
    category: 'Tv & Series',
    question: 'In welke stad speelt de sitcom "Friends" zich af?',
    answers: ['Los Angeles', 'Chicago', 'New York', 'Boston'],
    correct: 2,
  },
  {
    category: 'Speelgoed & Games',
    question: 'Hoe heette het virtuele huisdier op een eivorming apparaatje uit de jaren 90?',
    answers: ['Furby', 'Tamagotchi', 'Giga Pet', 'Digimon'],
    correct: 1,
  },
  {
    category: 'Film',
    question: 'Wie speelde de hoofdrol in "Home Alone" (1990)?',
    answers: ['Haley Joel Osment', 'Elijah Wood', 'Macaulay Culkin', 'Jonathan Taylor Thomas'],
    correct: 2,
  },
  {
    category: 'Muziek',
    question: 'Welk nummer van Aqua was een wereldhit in 1997?',
    answers: ['Barbie Girl', 'Doctor Jones', 'Lollipop', 'Turn Back Time'],
    correct: 0,
  },
  {
    category: 'Sport',
    question: 'Wie won het FIFA Wereldkampioenschap Voetbal in 1998?',
    answers: ['Brazilië', 'Duitsland', 'Italië', 'Frankrijk'],
    correct: 3,
  },
  {
    category: 'Tv & Series',
    question: 'Hoe heet het jongetje dat wordt achtervolgd door de geest in "The Sixth Sense" (1999)?',
    answers: ['Kevin McCallister', 'Cole Sear', 'Russ Tyler', 'Richie Rich'],
    correct: 1,
  },
  {
    category: 'Speelgoed & Games',
    question: 'Op welk systeem verscheen "Super Mario 64" als lanceerititel in 1996?',
    answers: ['SNES', 'Nintendo 64', 'Sega Saturn', 'PlayStation'],
    correct: 1,
  },
  {
    category: 'Muziek',
    question: 'Welk duo bracht in 1998 het nummer "Gettin\' Jiggy Wit It" uit?',
    answers: ['Puff Daddy', 'Will Smith', 'Jay-Z', 'LL Cool J'],
    correct: 1,
  },
  {
    category: 'Film',
    question: 'Welke film uit 1997 won 11 Oscars en draaide om een ongeluk met een schip?',
    answers: ['The English Patient', 'Good Will Hunting', 'Titanic', 'As Good as It Gets'],
    correct: 2,
  },
  {
    category: 'Tv & Series',
    question: 'Hoe heette de groene dinosaurus in de tv-serie "Dinosaurs" (vroege jaren 90)?',
    answers: ['Barney', 'Earl Sinclair', 'Reptar', 'Dino'],
    correct: 1,
  },
  {
    category: 'Mode & Cultuur',
    question: 'Welke broekstijl was in de jaren 90 enorm populair waarbij de pijpen wijd uitlopen?',
    answers: ['Skinny jeans', 'Flared jeans', 'Mom jeans', 'Cargo pants'],
    correct: 1,
  },
  {
    category: 'Muziek',
    question: 'Welke Nederlander scoorde in 1997 een hit met "Rollercoaster"?',
    answers: ['Jan Smit', '2 Unlimited', 'Alice Deejay', 'DJ Bobo'],
    correct: 2,
  },
  {
    category: 'Sport',
    question: 'Wie won de Tour de France 5 keer achter elkaar van 1991 tot 1995?',
    answers: ['Greg LeMond', 'Lance Armstrong', 'Miguel Induráin', 'Bjarne Riis'],
    correct: 2,
  },
  {
    category: 'Film',
    question: 'Hoe heet de karatefilm met Ralph Macchio uit 1984 die zijn vervolg in 1992 kreeg?',
    answers: ['Bloodsport', 'Best of the Best', 'The Karate Kid', 'Kickboxer'],
    correct: 2,
  },
  {
    category: 'Speelgoed & Games',
    question: 'Welke spelconsole bracht Sony uit in 1994?',
    answers: ['Xbox', 'PlayStation', 'Dreamcast', 'Game Boy Color'],
    correct: 1,
  },
  {
    category: 'Tv & Series',
    question: 'In welke serie speelde Will Smith als tiener die naar zijn rijke familie in Bel-Air ging?',
    answers: ['The Fresh Prince of Bel-Air', 'Family Matters', 'Saved by the Bell', 'The Cosby Show'],
    correct: 0,
  },
  {
    category: 'Mode & Cultuur',
    question: 'Welk icoon van de jaren 90 droeg een fluwelen trainingspak en was te zien in "Clueless"?',
    answers: ['Drew Barrymore', 'Winona Ryder', 'Alicia Silverstone', 'Jennifer Aniston'],
    correct: 2,
  },
];

// ===== SPELSTATUS =====
const state = {
  players: ['Speler 1', 'Speler 2'],
  scores: [0, 0],
  currentQuestion: 0,
  currentPlayer: 0,   // 0 of 1 – wisselt elke vraag
  questions: [],
};

// ===== ELEMENTEN =====
const screenStart = document.getElementById('screen-start');
const screenQuiz  = document.getElementById('screen-quiz');
const screenEnd   = document.getElementById('screen-end');

const input1 = document.getElementById('player1-name');
const input2 = document.getElementById('player2-name');

const labelP1  = document.getElementById('label-p1');
const labelP2  = document.getElementById('label-p2');
const pointsP1 = document.getElementById('points-p1');
const pointsP2 = document.getElementById('points-p2');
const scoreBoxP1 = document.getElementById('score-p1');
const scoreBoxP2 = document.getElementById('score-p2');

const turnBanner     = document.getElementById('turn-banner');
const questionCounter = document.getElementById('question-counter');
const progressBar    = document.getElementById('progress-bar');
const categoryTag    = document.getElementById('category-tag');
const questionText   = document.getElementById('question-text');
const answersGrid    = document.getElementById('answers-grid');

const feedbackOverlay = document.getElementById('feedback-overlay');
const feedbackIcon    = document.getElementById('feedback-icon');
const feedbackText    = document.getElementById('feedback-text');
const feedbackCorrect = document.getElementById('feedback-correct');
const btnNext         = document.getElementById('btn-next');

const endTrophy   = document.getElementById('end-trophy');
const endTitle    = document.getElementById('end-title');
const endWinner   = document.getElementById('end-winner');
const finalNameP1 = document.getElementById('final-name-p1');
const finalNameP2 = document.getElementById('final-name-p2');
const finalPtsP1  = document.getElementById('final-pts-p1');
const finalPtsP2  = document.getElementById('final-pts-p2');
const finalCardP1 = document.getElementById('final-p1');
const finalCardP2 = document.getElementById('final-p2');

// ===== HULPFUNCTIES =====
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function showScreen(screen) {
  [screenStart, screenQuiz, screenEnd].forEach(s => s.classList.remove('active'));
  screen.classList.add('active');
}

// ===== START =====
document.getElementById('btn-start').addEventListener('click', () => {
  const name1 = input1.value.trim() || 'Speler 1';
  const name2 = input2.value.trim() || 'Speler 2';

  state.players   = [name1, name2];
  state.scores    = [0, 0];
  state.currentQuestion = 0;
  state.currentPlayer   = 0;
  state.questions = shuffle(QUESTIONS);

  labelP1.textContent = name1;
  labelP2.textContent = name2;
  pointsP1.textContent = '0';
  pointsP2.textContent = '0';

  showScreen(screenQuiz);
  renderQuestion();
});

// ===== VRAAG RENDEREN =====
function renderQuestion() {
  const q   = state.questions[state.currentQuestion];
  const idx = state.currentQuestion;
  const total = state.questions.length;

  // Header
  questionCounter.textContent = `Vraag ${idx + 1} / ${total}`;
  progressBar.style.width = `${((idx + 1) / total) * 100}%`;

  // Actieve speler markering
  scoreBoxP1.classList.toggle('active-player', state.currentPlayer === 0);
  scoreBoxP2.classList.toggle('active-player', state.currentPlayer === 1);

  const activePlayerName = state.players[state.currentPlayer];
  turnBanner.textContent = `${activePlayerName} is aan de beurt!`;

  // Vraag
  categoryTag.textContent  = q.category;
  questionText.textContent = q.question;

  // Antwoorden
  answersGrid.innerHTML = '';
  q.answers.forEach((answer, i) => {
    const btn = document.createElement('button');
    btn.className   = 'answer-btn';
    btn.textContent = answer;
    btn.addEventListener('click', () => handleAnswer(i));
    answersGrid.appendChild(btn);
  });
}

// ===== ANTWOORD VERWERKEN =====
function handleAnswer(chosenIndex) {
  const q = state.questions[state.currentQuestion];
  const correct = chosenIndex === q.correct;

  // Knoppen disablen
  const btns = answersGrid.querySelectorAll('.answer-btn');
  btns.forEach(b => b.disabled = true);

  // Markeer correct/fout
  btns[q.correct].classList.add('correct');
  if (!correct) btns[chosenIndex].classList.add('wrong');

  // Score bijhouden
  if (correct) state.scores[state.currentPlayer]++;
  pointsP1.textContent = state.scores[0];
  pointsP2.textContent = state.scores[1];

  // Feedback tonen
  if (correct) {
    feedbackIcon.textContent = '🎉';
    feedbackText.textContent = 'Goed zo!';
    feedbackText.className = 'feedback-text correct-msg';
    feedbackCorrect.textContent = '';
  } else {
    feedbackIcon.textContent = '😬';
    feedbackText.textContent = 'Helaas!';
    feedbackText.className = 'feedback-text wrong-msg';
    feedbackCorrect.textContent = `Juiste antwoord: ${q.answers[q.correct]}`;
  }

  const isLastQuestion = state.currentQuestion === state.questions.length - 1;
  btnNext.textContent = isLastQuestion ? 'Bekijk uitslag 🏆' : 'Volgende vraag ▶';

  feedbackOverlay.classList.add('visible');
}

// ===== VOLGENDE VRAAG =====
btnNext.addEventListener('click', () => {
  feedbackOverlay.classList.remove('visible');

  if (state.currentQuestion === state.questions.length - 1) {
    showEnd();
    return;
  }

  state.currentQuestion++;
  // Wissel speler
  state.currentPlayer = 1 - state.currentPlayer;
  renderQuestion();
});

// ===== EINDSCHERM =====
function showEnd() {
  const [s1, s2] = state.scores;
  const [n1, n2] = state.players;

  finalNameP1.textContent = n1;
  finalNameP2.textContent = n2;
  finalPtsP1.textContent  = `${s1} punt${s1 !== 1 ? 'en' : ''}`;
  finalPtsP2.textContent  = `${s2} punt${s2 !== 1 ? 'en' : ''}`;

  finalCardP1.classList.remove('winner-card');
  finalCardP2.classList.remove('winner-card');

  if (s1 > s2) {
    endTrophy.textContent = '🏆';
    endTitle.textContent  = 'Gewonnen!';
    endWinner.textContent = `${n1} wint met ${s1} punten!`;
    finalCardP1.classList.add('winner-card');
  } else if (s2 > s1) {
    endTrophy.textContent = '🏆';
    endTitle.textContent  = 'Gewonnen!';
    endWinner.textContent = `${n2} wint met ${s2} punten!`;
    finalCardP2.classList.add('winner-card');
  } else {
    endTrophy.textContent = '🤝';
    endTitle.textContent  = 'Gelijkspel!';
    endWinner.textContent = `Allebei ${s1} punten — een verdiend gelijkspel!`;
  }

  showScreen(screenEnd);
}

// ===== OPNIEUW SPELEN =====
document.getElementById('btn-restart').addEventListener('click', () => {
  input1.value = '';
  input2.value = '';
  showScreen(screenStart);
});

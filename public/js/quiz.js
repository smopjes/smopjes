// ADHD Self-Report Scale (ASRS-v1.1) - Dutch translation
// Part A: questions 1-6 (most predictive), Part B: questions 7-18

const QUESTIONS = [
  // Part A - Inattention (most predictive)
  {
    text: 'Hoe vaak heb je moeite om je aandacht bij een taak te houden als je bijna klaar bent?',
    category: 'Aandacht',
    part: 'A'
  },
  {
    text: 'Hoe vaak maak je fouten door onoplettendheid als je aan een saai of moeilijk project werkt?',
    category: 'Aandacht',
    part: 'A'
  },
  {
    text: 'Hoe vaak heb je moeite je te concentreren op wat mensen direct tegen je zeggen, zelfs als ze rechtstreeks tot je spreken?',
    category: 'Aandacht',
    part: 'A'
  },
  {
    text: 'Hoe vaak laat je een afgesproken afspraak of verplichting na, omdat je vergeet terug te bellen of een bericht te beantwoorden?',
    category: 'Aandacht',
    part: 'A'
  },
  {
    text: 'Hoe vaak vergeet je afspraken of verplichtingen?',
    category: 'Aandacht',
    part: 'A'
  },
  {
    text: 'Hoe vaak vermijd je taken die veel mentale inspanning vereisen, of stel je ze uit?',
    category: 'Aandacht',
    part: 'A'
  },
  // Part B - Inattention continued
  {
    text: 'Hoe vaak raak je dingen kwijt die je nodig hebt voor taken of activiteiten (bijv. portemonnee, sleutels, telefoon)?',
    category: 'Aandacht',
    part: 'B'
  },
  {
    text: 'Hoe vaak word je afgeleid door activiteiten of geluiden om je heen?',
    category: 'Aandacht',
    part: 'B'
  },
  {
    text: 'Hoe vaak heb je moeite je te ontspannen in je vrije tijd?',
    category: 'Hyperactiviteit',
    part: 'B'
  },
  // Part B - Hyperactivity/Impulsivity
  {
    text: 'Hoe vaak voel je je rusteloos of fidgety?',
    category: 'Hyperactiviteit',
    part: 'B'
  },
  {
    text: 'Hoe vaak heb je moeite stil te zitten als je lang aan je bureau of tafel moet zitten?',
    category: 'Hyperactiviteit',
    part: 'B'
  },
  {
    text: 'Hoe vaak voel je je overactief en gedwongen om dingen te doen, alsof je wordt aangedreven door een motor?',
    category: 'Hyperactiviteit',
    part: 'B'
  },
  {
    text: 'Hoe vaak maak je zinnen af van mensen met wie je praat, voordat ze klaar zijn met praten?',
    category: 'Impulsiviteit',
    part: 'B'
  },
  {
    text: 'Hoe vaak heb je moeite om te wachten op je beurt als je iets moet doen waarbij anderen ook moeten wachten?',
    category: 'Impulsiviteit',
    part: 'B'
  },
  {
    text: 'Hoe vaak onderbreek je anderen als ze druk zijn?',
    category: 'Impulsiviteit',
    part: 'B'
  },
  {
    text: 'Hoe vaak zeg je dingen zonder er over na te denken?',
    category: 'Impulsiviteit',
    part: 'B'
  },
  {
    text: 'Hoe vaak laat je je humeur bepalen hoe jij je gedraagt, zonder na te denken over de gevolgen?',
    category: 'Impulsiviteit',
    part: 'B'
  },
  {
    text: 'Hoe vaak heb je moeite om een lang project te voltooien als het interessante gedeelte voorbij is?',
    category: 'Aandacht',
    part: 'B'
  }
];

// Answer options with scores
// Part A uses different scoring thresholds than Part B
const ANSWERS = [
  { label: 'Nooit', score: 0 },
  { label: 'Zelden', score: 1 },
  { label: 'Soms', score: 2 },
  { label: 'Vaak', score: 3 },
  { label: 'Zeer vaak', score: 4 }
];

// For Part A, score >= 2 ("Soms" or higher) counts as a symptom indicator
// For Part B, score >= 3 ("Vaak" or higher) counts as a symptom indicator
const PART_A_THRESHOLD = 2;
const PART_B_THRESHOLD = 3;

let currentQuestion = 0;
let answers = new Array(QUESTIONS.length).fill(null);

function startQuiz() {
  document.getElementById('screen-intro').classList.add('hidden');
  document.getElementById('screen-quiz').classList.remove('hidden');
  renderQuestion();
}

function renderQuestion() {
  const q = QUESTIONS[currentQuestion];
  const total = QUESTIONS.length;

  document.getElementById('question-number').textContent =
    `Vraag ${currentQuestion + 1} van ${total}`;
  document.getElementById('category-tag').textContent = q.category;
  document.getElementById('question-text').textContent = q.text;
  document.getElementById('progress-bar').style.width =
    `${(currentQuestion / total) * 100}%`;

  const optionsContainer = document.getElementById('answer-options');
  optionsContainer.innerHTML = '';

  ANSWERS.forEach((answer, i) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn' + (answers[currentQuestion] === i ? ' selected' : '');
    btn.textContent = answer.label;
    btn.onclick = () => selectAnswer(i);
    optionsContainer.appendChild(btn);
  });

  // Prev button
  const btnPrev = document.getElementById('btn-prev');
  btnPrev.style.display = currentQuestion === 0 ? 'none' : 'block';

  // Next button label
  const btnNext = document.getElementById('btn-next');
  btnNext.textContent = currentQuestion === total - 1 ? 'Resultaat bekijken' : 'Volgende';
}

function selectAnswer(index) {
  answers[currentQuestion] = index;
  document.querySelectorAll('.answer-btn').forEach((btn, i) => {
    btn.classList.toggle('selected', i === index);
  });
}

function nextQuestion() {
  if (answers[currentQuestion] === null) {
    // Highlight that an answer is needed
    document.querySelectorAll('.answer-btn').forEach(btn => {
      btn.style.borderColor = 'var(--danger)';
      setTimeout(() => { btn.style.borderColor = ''; }, 600);
    });
    return;
  }

  if (currentQuestion < QUESTIONS.length - 1) {
    currentQuestion++;
    renderQuestion();
  } else {
    showResults();
  }
}

function prevQuestion() {
  if (currentQuestion > 0) {
    currentQuestion--;
    renderQuestion();
  }
}

function showResults() {
  document.getElementById('screen-quiz').classList.add('hidden');
  document.getElementById('screen-result').classList.remove('hidden');
  document.getElementById('progress-bar').style.width = '100%';

  // Calculate scores
  let totalScore = 0;
  let partASymptoms = 0;
  const categoryScores = { 'Aandacht': { score: 0, max: 0 }, 'Hyperactiviteit': { score: 0, max: 0 }, 'Impulsiviteit': { score: 0, max: 0 } };

  QUESTIONS.forEach((q, i) => {
    const answerIndex = answers[i];
    const score = ANSWERS[answerIndex].score;
    totalScore += score;
    categoryScores[q.category].score += score;
    categoryScores[q.category].max += 4;

    if (q.part === 'A' && score >= PART_A_THRESHOLD) partASymptoms++;
    if (q.part === 'B' && score >= PART_B_THRESHOLD) partASymptoms++;
  });

  const maxScore = QUESTIONS.length * 4; // 72
  const percentage = Math.round((totalScore / maxScore) * 100);

  // Display total score
  document.getElementById('result-score').textContent = `${totalScore} / ${maxScore}`;

  // Determine result level
  const resultLabel = document.getElementById('result-label');
  const resultDesc = document.getElementById('result-desc');

  if (partASymptoms <= 3) {
    resultLabel.textContent = 'Weinig indicatoren';
    resultLabel.className = 'result-label low';
    resultDesc.textContent = 'Je scoort laag op ADHD-gerelateerde klachten. Dit betekent niet dat er niets aan de hand is, maar er zijn weinig indicatoren die wijzen op ADHD.';
  } else if (partASymptoms <= 8) {
    resultLabel.textContent = 'Matige indicatoren';
    resultLabel.className = 'result-label medium';
    resultDesc.textContent = 'Je scoort gemiddeld op ADHD-gerelateerde klachten. Sommige symptomen herken je. Overweeg een gesprek met je huisarts als dit invloed heeft op je dagelijks leven.';
  } else {
    resultLabel.textContent = 'Sterke indicatoren';
    resultLabel.className = 'result-label high';
    resultDesc.textContent = 'Je scoort hoog op ADHD-gerelateerde klachten. Dit is een indicatie dat ADHD een rol kan spelen. Neem contact op met je huisarts of een GGZ-professional voor een professionele beoordeling.';
  }

  // Breakdown per category
  const breakdownContainer = document.getElementById('result-breakdown');
  breakdownContainer.innerHTML = '';

  Object.entries(categoryScores).forEach(([cat, data]) => {
    const pct = Math.round((data.score / data.max) * 100);
    const div = document.createElement('div');
    div.className = 'breakdown-item';
    div.innerHTML = `
      <span style="min-width:110px;font-weight:600;">${cat}</span>
      <div class="breakdown-bar-wrap">
        <div class="breakdown-bar" style="width:${pct}%"></div>
      </div>
      <span style="min-width:50px;text-align:right;color:var(--text-muted);">${data.score}/${data.max}</span>
    `;
    breakdownContainer.appendChild(div);
  });
}

function restartQuiz() {
  currentQuestion = 0;
  answers = new Array(QUESTIONS.length).fill(null);
  document.getElementById('screen-result').classList.add('hidden');
  document.getElementById('screen-intro').classList.remove('hidden');
  document.getElementById('progress-bar').style.width = '0%';
}

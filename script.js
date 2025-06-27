const axisFiles = ["creativity.json", "extroversion.json", "sensitivity.json", "orderliness.json"];
let allQuestions = [];
let currentIndex = 0;
let responses = [];

const scale = {
  "非常に当てはまらない": 0,
  "あまり当てはまらない": 25,
  "どちらとも言えない": 50,
  "やや当てはまる": 75,
  "非常に当てはまる": 100
};
const options = Object.keys(scale);

// 初期化
document.getElementById("startBtn").addEventListener("click", () => {
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("quizScreen").style.display = "block";
  loadQuestions();
});

document.getElementById("backBtn").addEventListener("click", () => {
  if (currentIndex > 0) {
    currentIndex--;
    showQuestion(currentIndex);
  }
});

async function loadQuestions() {
  for (let file of axisFiles) {
    const res = await fetch(file);
    const data = await res.json();
    allQuestions = allQuestions.concat(data);
  }
  showQuestion(currentIndex);
}

function showQuestion(index) {
  const container = document.getElementById("questionContainer");
  container.innerHTML = "";

  const q = allQuestions[index];
  const div = document.createElement("div");
  div.className = "question";
  div.innerHTML = `<h3>${index + 1}/${allQuestions.length}</h3><p>${q.text}</p>`;

  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.onclick = () => {
      const value = scale[opt];
      responses[index] = { id: q.id, axis: q.axis, direction: q.direction, value };
      currentIndex++;
      if (currentIndex < allQuestions.length) {
        showQuestion(currentIndex);
      } else {
        calculateResult();
      }
    };
    div.appendChild(btn);
  });

  container.appendChild(div);
  document.getElementById("backBtn").style.display = index > 0 ? "inline-block" : "none";
}

function toLetter(score) {
  const idx = Math.floor((score / 100) * 26);
  return String.fromCharCode(65 + Math.min(25, idx));
}

function calculateResult() {
  const axisScore = {};
  const axisCount = {};

  responses.forEach(r => {
    const val = r.direction === "A" ? r.value : 100 - r.value;
    axisScore[r.axis] = (axisScore[r.axis] || 0) + val;
    axisCount[r.axis] = (axisCount[r.axis] || 0) + 1;
  });

  const code = Object.keys(axisScore).map(axis => {
    const avg = axisScore[axis] / axisCount[axis];
    return toLetter(avg);
  }).join("");

  document.getElementById("quizScreen").style.display = "none";
  document.getElementById("resultScreen").style.display = "block";
  document.getElementById("saptCode").textContent = code;

  Object.keys(axisScore).forEach(axis => {
    const percent = axisScore[axis] / axisCount[axis];
    const bar = document.querySelector(`#${axis} .bar`);
    const label = document.querySelector(`#${axis} .percentVal`);
    bar.style.width = `${percent}%`;
    label.textContent = `${Math.round(percent)}%`;
  });
}
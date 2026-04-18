const dirtSlider = document.getElementById("dirtSlider");
const loadSlider = document.getElementById("loadSlider");
const dirtValue = document.getElementById("dirtValue");
const loadValue = document.getElementById("loadValue");
const washTimeEl = document.getElementById("washTime");
const cycleNameEl = document.getElementById("cycleName");
const inputProfileEl = document.getElementById("inputProfile");
const dominantRuleEl = document.getElementById("dominantRule");
const systemInsightEl = document.getElementById("systemInsight");
const heroTimeEl = document.getElementById("hero-time");
const heroCycleEl = document.getElementById("hero-cycle");
const gaugeNeedle = document.getElementById("gaugeNeedle");
const gaugeProgress = document.getElementById("gaugeProgress");
const ruleList = document.getElementById("ruleList");
const presetButtons = document.querySelectorAll(".chip");

const membershipCanvas = document.getElementById("membershipCanvas");
const surfaceCanvas = document.getElementById("surfaceCanvas");
const miniSurfaceCanvas = document.getElementById("miniSurface");

const rules = [
  { dirt: "Low", load: "Small", output: "Short" },
  { dirt: "Low", load: "Medium", output: "Short" },
  { dirt: "Low", load: "Large", output: "Medium" },
  { dirt: "Medium", load: "Small", output: "Medium" },
  { dirt: "Medium", load: "Medium", output: "Medium" },
  { dirt: "Medium", load: "Large", output: "Long" },
  { dirt: "High", load: "Small", output: "Long" },
  { dirt: "High", load: "Medium", output: "Long" },
  { dirt: "High", load: "Large", output: "Long" }
];

function trimf(x, [a, b, c]) {
  if (x <= a || x >= c) {
    return x === b && a === b && b === c ? 1 : 0;
  }
  if (x === b) {
    return 1;
  }
  if (x < b) {
    return (x - a) / (b - a || 1);
  }
  return (c - x) / (c - b || 1);
}

function shoulderTrimf(x, [a, b, c]) {
  if (a === b && x <= b) {
    return x <= c ? Math.max(0, (c - x) / (c - b || 1)) : 0;
  }
  if (b === c && x >= b) {
    return x >= a ? Math.max(0, (x - a) / (b - a || 1)) : 0;
  }
  return trimf(x, [a, b, c]);
}

const dirtMFs = {
  Low: [0, 0, 4],
  Medium: [2, 5, 8],
  High: [6, 10, 10]
};

const loadMFs = {
  Small: [0, 0, 4],
  Medium: [2, 5, 8],
  Large: [6, 10, 10]
};

const washMFs = {
  Short: [0, 0, 20],
  Medium: [15, 30, 45],
  Long: [40, 60, 60]
};

function fuzzifyInput(value, mfs) {
  const output = {};
  Object.entries(mfs).forEach(([label, points]) => {
    output[label] = shoulderTrimf(value, points);
  });
  return output;
}

function inferWashTime(dirt, load) {
  const dirtLevels = fuzzifyInput(dirt, dirtMFs);
  const loadLevels = fuzzifyInput(load, loadMFs);
  const aggregated = [];
  let dominant = { strength: -1, label: "" };

  for (let z = 0; z <= 60; z += 0.5) {
    let degree = 0;
    rules.forEach((rule) => {
      const activation = Math.min(dirtLevels[rule.dirt], loadLevels[rule.load]);
      const outputDegree = Math.min(activation, shoulderTrimf(z, washMFs[rule.output]));
      degree = Math.max(degree, outputDegree);

      if (activation > dominant.strength) {
        dominant = {
          strength: activation,
          label: `${rule.dirt} + ${rule.load} -> ${rule.output}`
        };
      }
    });
    aggregated.push({ z, degree });
  }

  let numerator = 0;
  let denominator = 0;
  aggregated.forEach(({ z, degree }) => {
    numerator += z * degree;
    denominator += degree;
  });

  const crisp = denominator === 0 ? 0 : numerator / denominator;
  return {
    crisp,
    dirtLevels,
    loadLevels,
    dominantRule: dominant.label || "Low + Small -> Short"
  };
}

function classifyBand(value, lowCut, highCut, labels) {
  if (value < lowCut) {
    return labels[0];
  }
  if (value < highCut) {
    return labels[1];
  }
  return labels[2];
}

function cycleName(minutes) {
  if (minutes < 20) {
    return "Quick Wash";
  }
  if (minutes < 40) {
    return "Normal Wash";
  }
  return "Deep Wash";
}

function renderRules() {
  ruleList.innerHTML = "";
  rules.forEach((rule, index) => {
    const card = document.createElement("article");
    card.className = "rule-card";
    card.innerHTML = `
      <strong>Rule ${index + 1}</strong>
      <p>IF dirt is <b>${rule.dirt}</b> AND load is <b>${rule.load}</b>, THEN wash time is <b>${rule.output}</b>.</p>
    `;
    ruleList.appendChild(card);
  });
}

function drawMembershipFunctions() {
  const canvas = membershipCanvas;
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const margin = { top: 30, right: 24, bottom: 44, left: 52 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  ctx.clearRect(0, 0, width, height);
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "rgba(125, 249, 198, 0.10)");
  gradient.addColorStop(1, "rgba(92, 200, 255, 0.03)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i += 1) {
    const y = margin.top + (plotHeight / 5) * i;
    ctx.beginPath();
    ctx.moveTo(margin.left, y);
    ctx.lineTo(width - margin.right, y);
    ctx.stroke();
  }

  const groups = [
    { title: "Dirt Level", mfs: dirtMFs, domain: 10, xStart: margin.left, xWidth: plotWidth / 3 - 18 },
    { title: "Load Size", mfs: loadMFs, domain: 10, xStart: margin.left + plotWidth / 3, xWidth: plotWidth / 3 - 18 },
    { title: "Wash Time", mfs: washMFs, domain: 60, xStart: margin.left + (plotWidth * 2) / 3, xWidth: plotWidth / 3 - 18 }
  ];

  const palette = ["#7df9c6", "#5cc8ff", "#ffb85c"];

  groups.forEach((group) => {
    ctx.fillStyle = "rgba(255,255,255,0.88)";
    ctx.font = "600 16px Space Grotesk";
    ctx.fillText(group.title, group.xStart, 18);

    Object.entries(group.mfs).forEach(([label, points], index) => {
      ctx.beginPath();
      for (let x = 0; x <= group.domain; x += group.domain / 180) {
        const degree = shoulderTrimf(x, points);
        const px = group.xStart + (x / group.domain) * group.xWidth;
        const py = margin.top + plotHeight - degree * plotHeight;
        if (x === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.strokeStyle = palette[index % palette.length];
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = palette[index % palette.length];
      ctx.font = "500 12px Manrope";
      ctx.fillText(label, group.xStart + 8, margin.top + 18 + index * 18);
    });
  });
}

function drawSurface(canvas, marker = null) {
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const margin = { top: 24, right: 24, bottom: 42, left: 48 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "rgba(255,255,255,0.015)";
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i <= 20; i += 1) {
    for (let j = 0; j <= 20; j += 1) {
      const dirt = (i / 20) * 10;
      const load = (j / 20) * 10;
      const { crisp } = inferWashTime(dirt, load);
      const x = margin.left + (i / 20) * plotWidth;
      const y = margin.top + plotHeight - (j / 20) * plotHeight;
      const cellWidth = plotWidth / 20;
      const cellHeight = plotHeight / 20;
      const hue = 180 - (crisp / 60) * 160;
      ctx.fillStyle = `hsla(${hue}, 85%, 58%, 0.88)`;
      ctx.fillRect(x, y - cellHeight, cellWidth + 1, cellHeight + 1);
    }
  }

  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.strokeRect(margin.left, margin.top, plotWidth, plotHeight);

  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.font = "600 15px Space Grotesk";
  ctx.fillText("Load Size", 14, 18);
  ctx.save();
  ctx.translate(16, height / 2 + 10);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("Wash Time Response", 0, 0);
  ctx.restore();
  ctx.fillText("Dirt Level", width - 120, height - 10);

  if (marker) {
    const x = margin.left + (marker.dirt / 10) * plotWidth;
    const y = margin.top + plotHeight - (marker.load / 10) * plotHeight;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, margin.top);
    ctx.lineTo(x, margin.top + plotHeight);
    ctx.moveTo(margin.left, y);
    ctx.lineTo(margin.left + plotWidth, y);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function updateGauge(value) {
  const clamped = Math.max(0, Math.min(60, value));
  const ratio = clamped / 60;
  const angle = -90 + ratio * 180;
  gaugeNeedle.setAttribute("transform", `rotate(${angle} 120 130)`);

  const startX = 20;
  const startY = 130;
  const endX = 220;
  const endY = 130;
  const largeArc = ratio > 0.5 ? 1 : 0;
  const sweepAngle = Math.PI * ratio;
  const x = 120 - 100 * Math.cos(sweepAngle);
  const y = 130 - 100 * Math.sin(sweepAngle);
  const path = ratio === 0
    ? `M ${startX} ${startY}`
    : `M ${startX} ${startY} A 100 100 0 ${largeArc} 1 ${x} ${y}`;
  gaugeProgress.setAttribute("d", path);
}

function updatePresetState(dirt, load) {
  presetButtons.forEach((button) => {
    const isMatch = Number(button.dataset.dirt) === Number(dirt) && Number(button.dataset.load) === Number(load);
    button.classList.toggle("is-active", isMatch);
  });
}

function updateUI() {
  const dirt = Number(dirtSlider.value);
  const load = Number(loadSlider.value);
  const { crisp, dominantRule } = inferWashTime(dirt, load);
  const cycle = cycleName(crisp);
  const dirtLabel = classifyBand(dirt, 3.5, 6.5, ["Low", "Medium", "High"]);
  const loadLabel = classifyBand(load, 3.5, 6.5, ["Small", "Medium", "Large"]);

  dirtValue.textContent = dirt.toFixed(1);
  loadValue.textContent = load.toFixed(1);
  washTimeEl.textContent = `${crisp.toFixed(2)} min`;
  cycleNameEl.textContent = cycle;
  inputProfileEl.textContent = `${dirtLabel} dirt | ${loadLabel} load`;
  dominantRuleEl.textContent = dominantRule;
  heroTimeEl.textContent = `${crisp.toFixed(2)} min`;
  heroCycleEl.textContent = cycle;

  systemInsightEl.innerHTML = `
    <p>
      The controller reads <b>${dirt.toFixed(1)}</b> as <b>${dirtLabel}</b> dirt and <b>${load.toFixed(1)}</b> as
      <b>${loadLabel}</b> load, then activates the fuzzy rule base to produce a smooth recommendation of
      <b>${crisp.toFixed(2)} minutes</b>.
    </p>
    <p>
      Instead of abrupt switching between fixed cycles, the system blends overlapping membership functions and
      chooses a response that feels closer to how a modern smart appliance should behave.
    </p>
    <p>
      The strongest active rule right now is <b>${dominantRule}</b>, and the resulting cycle classification is
      <b>${cycle}</b>.
    </p>
  `;

  updateGauge(crisp);
  drawSurface(surfaceCanvas, { dirt, load });
  drawSurface(miniSurfaceCanvas, { dirt, load });
  updatePresetState(dirt, load);
}

function setupGaugeGradient() {
  const svg = document.querySelector(".gauge");
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  defs.innerHTML = `
    <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#7df9c6"></stop>
      <stop offset="50%" stop-color="#5cc8ff"></stop>
      <stop offset="100%" stop-color="#ffb85c"></stop>
    </linearGradient>
  `;
  svg.prepend(defs);
}

function bindEvents() {
  [dirtSlider, loadSlider].forEach((input) => {
    input.addEventListener("input", updateUI);
  });

  presetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      dirtSlider.value = button.dataset.dirt;
      loadSlider.value = button.dataset.load;
      updateUI();
    });
  });
}

setupGaugeGradient();
renderRules();
drawMembershipFunctions();
bindEvents();
updateUI();

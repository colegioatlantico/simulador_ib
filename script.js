// Portaria n.º 433/2005 — Diário da República, 19 de Abril de 2005
// Tabela 2: disciplinas IB 1–7 → ensino secundário PT
// Tabela 3: AR/Core 1–3 → escala IB 1–7
// Tabela 4: média IB arredondada → média PT → nota final PT arredondada

const SUBJECT_TABLE = {
  1: 30,
  2: 60,
  3: 90,
  4: 110,
  5: 140,
  6: 170,
  7: 200,
};

const AR_TABLE = {
  0: 0,
  1: 4,
  2: 5,
  3: 7,
};

const DIPLOMA_TABLE = [
  { ib: 3.4, media20: 9.71, final20: 10 },
  { ib: 3.5, media20: 10.00, final20: 10 },
  { ib: 3.6, media20: 10.29, final20: 10 },
  { ib: 3.7, media20: 10.57, final20: 11 },
  { ib: 3.8, media20: 10.86, final20: 11 },
  { ib: 3.9, media20: 11.14, final20: 11 },
  { ib: 4.0, media20: 11.43, final20: 11 },
  { ib: 4.1, media20: 11.71, final20: 12 },
  { ib: 4.2, media20: 12.00, final20: 12 },
  { ib: 4.3, media20: 12.29, final20: 12 },
  { ib: 4.4, media20: 12.57, final20: 13 },
  { ib: 4.5, media20: 12.86, final20: 13 },
  { ib: 4.6, media20: 13.14, final20: 13 },
  { ib: 4.7, media20: 13.43, final20: 13 },
  { ib: 4.8, media20: 13.71, final20: 14 },
  { ib: 4.9, media20: 14.00, final20: 14 },
  { ib: 5.0, media20: 14.29, final20: 14 },
  { ib: 5.1, media20: 14.57, final20: 15 },
  { ib: 5.2, media20: 14.86, final20: 15 },
  { ib: 5.3, media20: 15.14, final20: 15 },
  { ib: 5.4, media20: 15.43, final20: 15 },
  { ib: 5.5, media20: 15.71, final20: 16 },
  { ib: 5.6, media20: 16.00, final20: 16 },
  { ib: 5.7, media20: 16.29, final20: 16 },
  { ib: 5.8, media20: 16.57, final20: 17 },
  { ib: 5.9, media20: 16.86, final20: 17 },
  { ib: 6.0, media20: 17.14, final20: 17 },
  { ib: 6.1, media20: 17.43, final20: 17 },
  { ib: 6.2, media20: 17.71, final20: 18 },
  { ib: 6.3, media20: 18.00, final20: 18 },
  { ib: 6.4, media20: 18.29, final20: 18 },
  { ib: 6.5, media20: 18.57, final20: 19 },
  { ib: 6.6, media20: 18.86, final20: 19 },
  { ib: 6.7, media20: 19.14, final20: 19 },
  { ib: 6.8, media20: 19.43, final20: 19 },
  { ib: 6.9, media20: 19.71, final20: 20 },
  { ib: 7.0, media20: 20.00, final20: 20 },
];

function block_limits(element, min, max) {
  let value = Number(element.value);
  if (!Number.isFinite(value)) value = min;
  if (value < min) element.value = min;
  if (value > max) element.value = max;
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerText = value;
}

function readNumber(id) {
  const el = document.getElementById(id);
  if (!el) return 0;

  const v = Number(el.value);
  return Number.isFinite(v) ? v : 0;
}

function roundToOneDecimal(value) {
  return Math.round(value * 10) / 10;
}

function subjectTo200(value) {
  return SUBJECT_TABLE[value] ?? 0;
}

function diplomaConversion(mediaIb) {
  const mediaIbRounded = roundToOneDecimal(mediaIb);
  const row = DIPLOMA_TABLE.find(item => item.ib === mediaIbRounded);

  if (!row) {
    return {
      mediaIb: mediaIbRounded,
      media20: 0,
      final20: 0,
      final200: 0,
    };
  }

  return {
    mediaIb: row.ib,
    media20: row.media20,
    final20: row.final20,
    final200: row.final20 * 10,
  };
}

function recalc() {
  const grades = [
    readNumber("g1"),
    readNumber("g2"),
    readNumber("g3"),
    readNumber("g4"),
    readNumber("g5"),
    readNumber("g6"),
  ];

  const arRaw = readNumber("eetok"); // 0–3
  const totalDisciplinas = grades.reduce((a, b) => a + b, 0);
  const arConvertido = AR_TABLE[arRaw] ?? 0;

  // A Portaria usa AR convertido para a escala 1–7 antes de calcular a média.
  const mediaIb = arRaw === 0
    ? totalDisciplinas / 6
    : (totalDisciplinas + arConvertido) / 7;

  // Depois aplica a Tabela n.º 4: média IB -> média ensino secundário -> nota final arredondada.
  const diploma = diplomaConversion(mediaIb);

  setText("total_disciplinas", totalDisciplinas);
  setText("tok_convertido", arConvertido);
  setText("total", totalDisciplinas + arRaw);
  setText("media_ib", diploma.mediaIb.toFixed(1));
  setText("media_secundario_20", diploma.media20.toFixed(2));
  setText("final_secundario_20", diploma.final20);
  setText("final_secundario_200", diploma.final200);

  const cells = document.querySelectorAll(".convertido");
  const mapById = {};

  cells.forEach(td => {
    mapById[td.getAttribute("data-for")] = td;
  });

  ["g1", "g2", "g3", "g4", "g5", "g6"].forEach((id, idx) => {
    if (mapById[id]) {
      mapById[id].innerText = subjectTo200(grades[idx]);
    }
  });
}

function clearForm() {
  ["g1", "g2", "g3", "g4", "g5", "g6", "eetok"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = 0;
  });

  ["g1_input", "g2_input", "g3_input", "g4_input", "g5_input", "g6_input", "gN_input"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  recalc();
}

document.addEventListener("input", (e) => {
  if (e.target && e.target.tagName === "INPUT") recalc();
});

document.addEventListener("DOMContentLoaded", () => recalc());

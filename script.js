// Portaria n.º 433/2005 — Diário da República, 19 de Abril de 2005
// Tabela 2: disciplinas IB 1–7 → ensino secundário PT
// Tabela 3: AR/Core 1–3 → escala IB 1–7 (a Portaria NÃO define um valor para AR = 0)
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

// Apenas 1, 2 e 3 são legalmente definidos pela Tabela n.º 3.
// AR = 0 (nota mínima possível no sistema atual do IB) não consta da Portaria,
// que foi escrita antes da escala numérica 0–3 do "core" atual do IB.
// Não inventamos um valor para 0 — é tratado como um caso fora da tabela.
const AR_TABLE = {
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

function readGradeInputs(ids) {
  return ids.map(id => {
    const el = document.getElementById(id);
    if (!el) return null;
    const v = Number(el.value);
    return Number.isFinite(v) ? v : null;
  });
}

// AR is read as a string first so we can tell "field is empty" apart from "field is 0".
// This is the crux of the bug: arRaw === 0 (a real, failing AR score) must never be
// treated the same as "no AR entered yet".
function readAR() {
  const el = document.getElementById("eetok");
  if (!el) return { entered: false, value: null };

  const raw = el.value;
  if (raw === "" || raw === null) return { entered: false, value: null };

  const v = Number(raw);
  if (!Number.isFinite(v)) return { entered: false, value: null };

  return { entered: true, value: v };
}

function roundToOneDecimal(value) {
  return Math.round(value * 10) / 10;
}

function subjectTo200(value) {
  return value === null ? null : (SUBJECT_TABLE[value] ?? null);
}

function diplomaConversion(mediaIb) {
  if (mediaIb === null) return null;

  const mediaIbRounded = roundToOneDecimal(mediaIb);
  const row = DIPLOMA_TABLE.find(item => item.ib === mediaIbRounded);

  if (!row) return null; // outside the table's 3.4–7.0 range

  return {
    mediaIb: row.ib,
    media20: row.media20,
    final20: row.final20,
    final200: row.final20 * 10,
  };
}

function recalc() {
  const grades = readGradeInputs(["g1", "g2", "g3", "g4", "g5", "g6"]);
  const allSubjectsFilled = grades.every(g => g !== null);
  const totalDisciplinas = allSubjectsFilled ? grades.reduce((a, b) => a + b, 0) : null;

  const ar = readAR(); // { entered, value }

  let mediaIb = null;
  let warning = "";

  if (!allSubjectsFilled) {
    warning = "Preencha as 6 disciplinas.";
  } else if (!ar.entered) {
    // No AR entered yet — genuinely nothing to average in; don't guess.
    mediaIb = totalDisciplinas / 6;
    warning = "AR/Core ainda não preenchido — média calculada apenas com as 6 disciplinas.";
  } else if (ar.value < 1 || ar.value > 3) {
    // Includes AR = 0: a real, valid IB core score under the current 0–3 system,
    // but one the 2005 Portaria's Tabela n.º 3 does not define a conversion for.
    // We do NOT silently substitute a value (e.g. 0) here, because doing so either
    // masks a failing core score (if excluded, as the old code did) or invents an
    // unofficial number (if given a made-up conversion).
    mediaIb = null;
    warning = "AR = " + ar.value + " está fora do intervalo (1–3) definido pela Tabela n.º 3 da " +
      "Portaria n.º 433/2005. Um AR de 0 é uma nota real e reprovatória no sistema atual do IB, " +
      "mas não tem conversão oficial nesta tabela de 2005 — confirme o procedimento junto da " +
      "escola/DGE antes de calcular uma equivalência. Note também que, em certas combinações, " +
      "um AR de 0 pode implicar reprovação automática do Diploma IB, tornando esta conversão " +
      "inaplicável.";
  } else {
    const arConvertido = AR_TABLE[ar.value];
    // AR is included in both the sum and the divisor — a low or failing AR score
    // pulls the average DOWN, exactly as it should, instead of being dropped.
    mediaIb = (totalDisciplinas + arConvertido) / 7;
  }

  const diploma = diplomaConversion(mediaIb);

  setText("total_disciplinas", totalDisciplinas ?? "—");
  setText("tok_convertido", ar.entered && ar.value >= 1 && ar.value <= 3 ? AR_TABLE[ar.value] : "—");
  setText("media_ib", mediaIb !== null ? mediaIb.toFixed(2) : "—");
  setText("media_secundario_20", diploma ? diploma.media20.toFixed(2) : "—");
  setText("final_secundario_20", diploma ? diploma.final20 : "—");
  setText("final_secundario_200", diploma ? diploma.final200 : "—");
  setText("warning", warning);

  const cells = document.querySelectorAll(".convertido");
  const mapById = {};
  cells.forEach(td => { mapById[td.getAttribute("data-for")] = td; });

  ["g1", "g2", "g3", "g4", "g5", "g6"].forEach((id, idx) => {
    if (mapById[id]) mapById[id].innerText = subjectTo200(grades[idx]) ?? "—";
  });
}

function clearForm() {
  ["g1", "g2", "g3", "g4", "g5", "g6", "eetok"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  recalc();
}

document.addEventListener("input", (e) => {
  if (e.target && e.target.tagName === "INPUT") recalc();
});

document.addEventListener("DOMContentLoaded", () => recalc());

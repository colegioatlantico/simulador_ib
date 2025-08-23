// Cálculo totalmente no cliente (sem fetch/POST).
// Reproduz a lógica do backend: soma dos 6 subjects, conversão de EE/TOK e
// conversão para a escala 0–20/0–200 através de uma função linear com arredondamento
// por defeito à décima (equivalente à tabela original).


// Tabela para converter EE/TOK -> pontos adicionais no total IB
const TOK_TABLE = { 0: 0, 1: 4, 2: 5, 3: 7 };


// Bloqueio de limites por input (mantido do original)
function block_limits(element, min, max){
  let value = Number(element.value);
  if (value < min) { element.value = min; }
  if (value > max) { element.value = max; }
}


// Converte uma nota IB (entre 1 e 7, ou média até 7) para a escala 0–20.
// A tabela original correspondia aproximadamente a uma transformação linear
// de 3.5 → 10.0 e 7.0 → 20.0, com arredondamento por defeito à décima.
// Esta função replica esse comportamento.
function ibTo20(value) {
  // transformação linear: 10 + (value - 3.5) * (10/3.5)
  const raw = 10 + (value - 3.5) * (10 / 3.5);
  // arredonda por defeito à décima (ex.: 10.29 → 10.2)
  const flooredTenth = Math.floor(raw * 10) / 10;
  // limita ao intervalo [0, 20]
  return Math.max(0, Math.min(20, flooredTenth));
}

// Converte uma nota IB (1–7) para a escala 0–200 (apenas para exibição por disciplina)
function ibTo200(value) {
  return Math.round(ibTo20(value) * 10); // mantém-se inteiro
}

// Lê valores do DOM de forma robusta
function readNumber(id) {
  const el = document.getElementById(id);
  if (!el) return 0;
  const v = Number(el.value);
  return Number.isFinite(v) ? v : 0;
}

function recalc() {
  // recolha de notas
  const grades = [
    readNumber("g1"),
    readNumber("g2"),
    readNumber("g3"),
    readNumber("g4"),
    readNumber("g5"),
    readNumber("g6"),
  ];
  const eeTok = readNumber("eetok");

  // soma disciplinas
  const total_disciplinas = grades.reduce((a, b) => a + b, 0);

  // tok convertido
  const tok_convertido = TOK_TABLE[eeTok] ?? 0;

  // total geral IB
  const total = total_disciplinas + tok_convertido;

  // média IB em 7 (6 disciplinas + TOK/EE convertido)
  const media = total / 7;

  // conversões finais
  const final20 = ibTo20(media);
  const final200 = Math.round(final20 * 10);

  // actualiza UI
  document.getElementById("total_disciplinas").innerText = total_disciplinas;
  document.getElementById("tok_convertido").innerText = tok_convertido;
  document.getElementById("total").innerText = total;
  document.getElementById("final_secundario_20").innerText = final20.toFixed(1);
  document.getElementById("final_secundario_200").innerText = final200;

  // por disciplina (0–200)
  const cells = document.querySelectorAll(".convertido");
  const mapById = {};
  cells.forEach(td => { mapById[td.getAttribute("data-for")] = td; });
  const ids = ["g1","g2","g3","g4","g5","g6"];
  ids.forEach((id, idx) => {
    const v = grades[idx];
    const conv = ibTo200(v);
    if (mapById[id]) mapById[id].innerText = conv;
  });
}

// listeners
document.addEventListener("input", (e) => {
  if (e.target && (e.target.tagName === "INPUT")) {
    recalc();
  }
});

// inicialização

document.addEventListener("DOMContentLoaded", () => {
  recalc();
});

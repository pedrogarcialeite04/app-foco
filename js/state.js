/**
 * FOCO — Constantes e estado da aplicação
 */

/** Atividades fixas (chave = id usado no data-activity e no storage) */
export const TASKS = [
  { id: "trabalho", label: "Trabalho" },
  { id: "academia", label: "Academia" },
  { id: "estudos", label: "Estudos" },
  { id: "leitura", label: "Leitura" },
  { id: "faculdade", label: "Faculdade" },
];

/** Dias da semana (abreviados, usados como chave) */
export const DAYS = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"];

/** Pontos por conclusão (cada célula marcada) */
export const POINTS_PER_CHECK = 10;

/** Pontos necessários para cada nível (índice = nível - 1) */
export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 3500, 5000, 7500, 10000];

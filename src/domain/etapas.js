const TODAS = ["MODELADO", "SECADO", "COCCION", "TALLADO", "TEJIDO", "ACABADO"];
const sinTildes = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
function etapasDeTaller(tecnica) {
  const t = sinTildes(tecnica);
  if (/alfar|ceram/.test(t)) return ["MODELADO", "SECADO", "COCCION", "ACABADO"];
  if (/ebanis|tallad|mueb|madera/.test(t)) return ["MODELADO", "TALLADO", "ACABADO"];
  if (/tej|hilad/.test(t)) return ["TEJIDO", "ACABADO"];
  return [...TODAS];
}
module.exports = { etapasDeTaller, TODAS };

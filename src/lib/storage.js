import { CODIGO_INICIAL, CSS_INICIAL } from "./templates.js";
const CHAVE = "devcasa:projetos";

export function novoId() {
  return (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : "id-" + Date.now() + "-" + Math.random().toString(36).slice(2);
}

export function novoProjeto(nome = "Novo projeto") {
  return { id: novoId(), nome, codigo: CODIGO_INICIAL, css: CSS_INICIAL, atualizadoEm: Date.now() };
}

export function carregarProjetos() {
  try {
    const b = localStorage.getItem(CHAVE);
    const l = b ? JSON.parse(b) : [];
    if (Array.isArray(l) && l.length) return l;
  } catch {}
  return [novoProjeto("Meu primeiro app")];
}

export function salvarProjetos(l) {
  try { localStorage.setItem(CHAVE, JSON.stringify(l)); } catch {}
}

export function baixarArquivo(nome, conteudo, tipo = "text/html") {
  const b = new Blob([conteudo], { type: tipo + ";charset=utf-8" });
  const u = URL.createObjectURL(b);
  const a = document.createElement("a");
  a.href = u; a.download = nome;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(u), 5000);
}

export function montarDocumento({ codigo, css, titulo = "Meu app" }) {
  const c = String(codigo || "").replace(/<\/script/gi, "<\\/script");
  const s = String(css || "").replace(/<\/style/gi, "<\\/style");
  const t = String(titulo).replace(/[<>&"]/g, "");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>${t}</title>
<style>body{margin:0;font-family:system-ui,sans-serif}${s}</style>
<script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"><\/script>
<script crossorigin src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"><\/script>
<script src="https://unpkg.com/@babel/standalone@7.24.7/babel.min.js"><\/script>
<script>
// Runtime do DevCasa Studio: hooks disponíveis globalmente
window.usePersistente = function(chave, valorInicial) {
  const [valor, setValor] = React.useState(function() {
    try {
      const s = localStorage.getItem(chave);
      return s ? JSON.parse(s) : valorInicial;
    } catch (e) { return valorInicial; }
  });
  React.useEffect(function() {
    try { localStorage.setItem(chave, JSON.stringify(valor)); } catch (e) {}
  }, [valor]);
  return [valor, setValor];
};
// Também disponível como React.usePersistente
React.usePersistente = window.usePersistente;
<\/script>
</head>
<body>
<div id="root"></div>
<script>
window.onerror = function(m, s, l) {
  try {
    parent.postMessage({ __devcasa: true, tipo: "erro", mensagem: String(m) + (l ? " (linha " + l + ")" : "") }, "*");
  } catch (e) {}
};
<\/script>
<script type="text/plain" id="codigo-app">${c}<\/script>
<script>
try {
  var f = document.getElementById("codigo-app").textContent;
  var o = Babel.transform(f, { presets: ["react"] }).code;
  o += ";ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));";
  var e = document.createElement("script");
  e.textContent = o;
  document.body.appendChild(e);
} catch (er) {
  window.onerror("Erro: " + er.message, 0, 0);
}
<\/script>
</body>
</html>`;
}

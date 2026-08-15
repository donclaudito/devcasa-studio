export function analisarCodigo(codigo, css) {
  const erros = [];
  const avisos = [];

  if (!codigo || codigo.trim().length === 0) {
    erros.push({ tipo: "critico", msg: "Nenhum código JSX foi gerado." });
    return { erros, avisos };
  }

  if (/^import\s/m.test(codigo)) {
    erros.push({ tipo: "critico", msg: "'import' não é permitido — React já está disponível como variável global." });
  }

  if (/require\s*\(/.test(codigo)) {
    erros.push({ tipo: "critico", msg: "'require()' não é permitido — use apenas variáveis globais." });
  }

  if (/ReactDOM\.(createRoot|render)\s*\(/.test(codigo)) {
    erros.push({ tipo: "critico", msg: "Não chame ReactDOM.createRoot/render — o ambiente já renderiza <App />." });
  }

  if (!/function\s+App\s*\(/.test(codigo) && !/const\s+App\s*[=\(]/.test(codigo)) {
    erros.push({ tipo: "critico", msg: "O código deve conter 'function App()' ou 'const App = '." });
  }

  if (/export\s+default\s/.test(codigo)) {
    avisos.push({ tipo: "aviso", msg: "'export default' será ignorado pelo ambiente." });
  }

  if (/eval\s*\(/.test(codigo)) {
    erros.push({ tipo: "seguranca", msg: "eval() é proibido por segurança." });
  }

  if (css && css.trim().length > 0) {
    const abre = (css.match(/\{/g) || []).length;
    const fecha = (css.match(/\}/g) || []).length;
    if (abre !== fecha) {
      erros.push({ tipo: "css", msg: "CSS com chaves desbalanceadas (" + abre + " abre, " + fecha + " fecha)." });
    }
  }

  return { erros, avisos };
}

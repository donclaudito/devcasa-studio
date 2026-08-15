// Validador de código gerado pela IA
// Retorna { ok: boolean, erros: string[] }

export function validarCodigo(codigo) {
  const erros = [];
  
  if (!codigo || codigo.trim().length === 0) {
    erros.push("Código vazio");
    return { ok: false, erros };
  }

  // 1. Verifica se tem function App
  if (!/function\s+App\s*\(/.test(codigo)) {
    erros.push("Componente 'function App()' não encontrado");
  }

  // 2. Imports proibidos (React é global no DevCasa)
  const importsProibidos = [
    /import\s+.*from\s+['"]react['"]/i,
    /import\s+.*from\s+['"]react-dom['"]/i,
    /require\s*\(/,
    /import\s*\(/
  ];
  importsProibidos.forEach(re => {
    if (re.test(codigo)) {
      erros.push("Não use 'import' ou 'require' — React já está disponível globalmente");
    }
  });

  // 3. eval/innerHTML inseguros
  if (/\beval\s*\(/.test(codigo)) {
    erros.push("Evite 'eval()' por segurança");
  }
  if (/\.innerHTML\s*=/.test(codigo) && !/innerHTML\s*=\s*['"]/.test(codigo)) {
    erros.push("Cuidado com innerHTML dinâmico (risco XSS)");
  }

  // 4. ReactDOM.createRoot/render (não deve chamar)
  if (/ReactDOM\.(createRoot|render)\s*\(/.test(codigo)) {
    erros.push("Não chame ReactDOM.createRoot/render — o ambiente já faz isso");
  }

  // 5. Verifica balanceamento de chaves (heurística simples)
  const abre = (codigo.match(/{/g) || []).length;
  const fecha = (codigo.match(/}/g) || []).length;
  if (Math.abs(abre - fecha) > 2) {
    erros.push(`Possível erro de sintaxe: ${abre} '{' vs ${fecha} '}'`);
  }

  // 6. Tenta analisar com Function (sandbox leve)
  try {
    // Enrola o código para ver se compila
    const teste = `var React={useState:()=>[],useEffect:()=>{},useRef:()=>({current:null})}; ${codigo}`;
    new Function(teste);
  } catch (e) {
    // Só reporta se for erro de sintaxe (não de runtime)
    if (e instanceof SyntaxError) {
      erros.push("Erro de sintaxe: " + e.message.split("\n")[0]);
    }
  }

  return { ok: erros.length === 0, erros };
}

// Tenta executar o código em um iframe sandbox para pegar erros de runtime
export function testarRuntime(codigo, css) {
  return new Promise((resolve) => {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.sandbox = "allow-scripts";
    document.body.appendChild(iframe);

    const timeout = setTimeout(() => {
      limpar();
      resolve({ ok: true });
    }, 2000);

    function limpar() {
      clearTimeout(timeout);
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    }

    iframe.onload = () => {
      try {
        const win = iframe.contentWindow;
        win.onerror = (msg, url, line, col, err) => {
          limpar();
          resolve({ ok: false, erro: String(err || msg) + " (linha " + line + ")" });
        };
        win.React = window.React;
        const doc = win.document;
        doc.open();
        doc.write(`<!doctype html><html><head><style>${css || ""}</style></head><body><div id="root"></div><script>
          try {
            ${codigo}
            var root = document.getElementById('root');
            var e = React.createElement;
            ReactDOM.render(e(App), root);
          } catch(err) {
            window.parent.postMessage({tipo:'erro-runtime', msg: err.message}, '*');
          }
        <\/script></body></html>`);
        doc.close();
      } catch (e) {
        limpar();
        resolve({ ok: false, erro: e.message });
      }
    };

    window.addEventListener("message", function handler(ev) {
      if (ev.data && ev.data.tipo === "erro-runtime") {
        window.removeEventListener("message", handler);
        limpar();
        resolve({ ok: false, erro: ev.data.msg });
      }
    });
  });
}

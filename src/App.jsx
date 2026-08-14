import { useEffect, useState } from "react";
import JSZip from "jszip";
import ChatPanel from "./components/ChatPanel.jsx";
import EditorPanel from "./components/EditorPanel.jsx";
import PreviewPanel from "./components/PreviewPanel.jsx";
import { ModalModelos, ModalConfig, ModalAjuda } from "./components/Modais.jsx";
import { TEMPLATES } from "./lib/templates.js";
import { mensagemBoasVindas, responder, consultarAPI, extrairCodigo } from "./lib/assistant.js";
import { carregarProjetos, salvarProjetos, novoProjeto, montarDocumento, baixarArquivo } from "./lib/storage.js";

function carregarConfig() {
  const padrao = { usarApi: false, apiUrl: "", apiKey: "", modelo: "" };
  try { return Object.assign({}, padrao, JSON.parse(localStorage.getItem("devcasa:config") || "{}")); }
  catch (e) { return padrao; }
}

function slugNome(t) {
  return String(t).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "meu-app";
}

export default function App() {
  const [projetos, setProjetos] = useState(carregarProjetos);
  const [ativoId, setAtivoId] = useState(null);
  const [aba, setAba] = useState("js");
  const [mensagens, setMensagens] = useState(() => [mensagemBoasVindas()]);
  const [ocupado, setOcupado] = useState(false);
  const [instantaneo, setInstantaneo] = useState(null);
  const [auto, setAuto] = useState(false);
  const [config, setConfig] = useState(carregarConfig);
  const [modal, setModal] = useState(null);

  const projetoAtivo = projetos.find(p => p.id === ativoId) ?? projetos[0];

  useEffect(() => { salvarProjetos(projetos); }, [projetos]);
  useEffect(() => {
    try { localStorage.setItem("devcasa:config", JSON.stringify(config)); } catch (e) {}
  }, [config]);
  useEffect(() => {
    if (!auto || !projetoAtivo) return;
    const id = setTimeout(() => setInstantaneo({ codigo: projetoAtivo.codigo, css: projetoAtivo.css, versao: Date.now() }), 900);
    return () => clearTimeout(id);
  }, [projetoAtivo && projetoAtivo.codigo, projetoAtivo && projetoAtivo.css, auto]);

  function atualizarAtivo(m) {
    setProjetos(ps => ps.map(p => p.id === projetoAtivo.id ? Object.assign({}, p, m, { atualizadoEm: Date.now() }) : p));
  }
  function executar() {
    setInstantaneo({ codigo: projetoAtivo.codigo, css: projetoAtivo.css, versao: Date.now() });
  }
  function novoChat() {
    setMensagens([mensagemBoasVindas()]);
  }
  function criarProjeto() {
    const nome = window.prompt("Nome do novo projeto:", "Projeto " + (projetos.length + 1));
    if (!nome) return;
    const p = novoProjeto(nome.trim() || "Projeto");
    setProjetos(ps => [...ps, p]);
    setAtivoId(p.id);
    setInstantaneo(null);
    setMensagens([mensagemBoasVindas()]);
  }
  function inserirCodigo(codigo, css) {
    const mudancas = { codigo: codigo };
    if (css !== undefined) mudancas.css = css;
    atualizarAtivo(mudancas);
    setAba("js");
    setInstantaneo({ codigo: codigo, css: css !== undefined ? css : projetoAtivo.css, versao: Date.now() });
  }
  function aoAcaoChat(a) {
    if (!a) return;
    if (a.tipo === "inserir-template") {
      const t = TEMPLATES.find(x => x.id === a.templateId);
      if (t) inserirCodigo(t.codigo, t.css);
    } else if (a.tipo === "inserir-codigo") {
      inserirCodigo(a.codigo);
    }
  }

  async function enviarChat(texto) {
    if (texto.startsWith("/limpar")) { setMensagens([mensagemBoasVindas()]); return; }
    setMensagens(m => [...m, { autor: "usuario", texto }]);

    if (config.usarApi && config.apiUrl) {
      setOcupado(true);
      try {
        const historico = [...mensagens, { autor: "usuario", texto }].slice(-10).map(m => ({
          role: m.autor === "ia" ? "assistant" : "user",
          content: m.texto
        }));
        const resposta = await consultarAPI(config, historico);
        const codigo = extrairCodigo(resposta);
        setMensagens(m => [...m, {
          autor: "ia",
          texto: resposta,
          acao: codigo ? { tipo: "inserir-codigo", codigo: codigo, rotulo: "📥 Inserir código no editor" } : null
        }]);
      } catch (erro) {
        setMensagens(m => [...m, { autor: "ia", texto: "⚠️ Falha na IA online: " + erro.message + "\n\nConfira chave e URL em ⚙️ IA. Enquanto isso, modo offline ativo: digite /modelos." }]);
      } finally {
        setOcupado(false);
      }
    } else {
      const r = responder(texto);
      setMensagens(m => [...m, { autor: "ia", texto: r.texto, acao: r.acao ? r.acao : null }]);
    }
  }

  function baixarHTML() {
    const html = montarDocumento({ codigo: projetoAtivo.codigo, css: projetoAtivo.css, titulo: projetoAtivo.nome });
    baixarArquivo(slugNome(projetoAtivo.nome) + ".html", html);
  }

  async function baixarReact() {
    try {
      const nome = slugNome(projetoAtivo.nome);
      const zip = new JSZip();
      const raiz = zip.folder(nome + "-react");

      raiz.file("package.json", JSON.stringify({
        name: nome,
        private: true,
        version: "1.0.0",
        type: "module",
        scripts: { dev: "vite", build: "vite build", preview: "vite preview" },
        dependencies: { react: "^18.3.1", "react-dom": "^18.3.1" },
        devDependencies: { "@vitejs/plugin-react": "^4.3.1", vite: "^5.4.8" }
      }, null, 2));

      raiz.file("vite.config.js", "import { defineConfig } from \"vite\";\nimport react from \"@vitejs/plugin-react\";\n\nexport default defineConfig({ plugins: [react()] });\n");

      raiz.file("index.html", "<!DOCTYPE html>\n<html lang=\"pt-BR\">\n  <head>\n    <meta charset=\"UTF-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <title>" + projetoAtivo.nome + "</title>\n  </head>\n  <body>\n    <div id=\"root\"></div>\n    <script type=\"module\" src=\"/src/main.jsx\"></script>\n  </body>\n</html>\n");

      raiz.file("src/main.jsx", "import React from \"react\";\nimport { createRoot } from \"react-dom/client\";\nimport App from \"./App.jsx\";\nimport \"./styles.css\";\n\ncreateRoot(document.getElementById(\"root\")).render(<App />);\n");

      raiz.file("src/App.jsx", "import React from \"react\";\n\n" + projetoAtivo.codigo + "\n\nexport default App;\n");

      raiz.file("src/styles.css", projetoAtivo.css || "");

      raiz.file("README.md", "# " + projetoAtivo.nome + "\n\nApp criado no DevCasa Studio e exportado como projeto React + Vite.\n\n## Como rodar\n\n1. Instale o Node.js (nodejs.org), se ainda não tiver\n2. Extraia este ZIP e abra a pasta no terminal (ou no VS Code)\n3. Rode: npm install\n4. Rode: npm run dev\n5. Abra http://localhost:5173\n\n## Estrutura\n\n- src/App.jsx — lógica e interface do app\n- src/styles.css — estilos\n- src/main.jsx — montagem do React (não precisa mexer)\n");

      const blob = await zip.generateAsync({ type: "blob" });
      const u = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = u;
      a.download = nome + "-react.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(u), 5000);
    } catch (e) {
      alert("Erro ao gerar o ZIP: " + e.message);
    }
  }

  function usarModelo(id) {
    const t = TEMPLATES.find(x => x.id === id);
    if (t) { setModal(null); inserirCodigo(t.codigo, t.css); }
  }

  return (
    <div className="studio">
      <header className="barra-topo">
        <span className="marca">🏠 DevCasa <b>Studio</b></span>
        <span className="separador" />
        <select value={projetoAtivo.id} onChange={e => { setAtivoId(e.target.value); setInstantaneo(null); }}>
          {projetos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
        </select>
        <button onClick={criarProjeto} title="Criar novo projeto com chat novo">➕ Projeto</button>
        <span className={config.usarApi ? "selo-ia on" : "selo-ia"}>{config.usarApi ? " IA online" : " offline"}</span>
        <span className="espaco" />
        <button onClick={() => setModal("modelos")}>🧩 Modelos</button>
        <button className="botao-primario" onClick={baixarHTML}>💾 HTML</button>
        <button onClick={baixarReact}>⚛️ React (.zip)</button>
        <button onClick={() => setModal("config")}>⚙️ IA</button>
        <button onClick={() => setModal("ajuda")}>❓ Ajuda</button>
      </header>
      <main className="corpo" style={{ gridTemplateColumns: "330px 6px 1fr 6px 430px" }}>
        <ChatPanel mensagens={mensagens} ocupado={ocupado} aoEnviar={enviarChat} aoAcao={aoAcaoChat} aoNovoChat={novoChat} />
        <div className="divisor" />
        <EditorPanel projeto={projetoAtivo} aba={aba} aoTrocarAba={setAba}
          aoMudar={(c, v) => atualizarAtivo({ [c]: v })} aoExecutar={executar}
          auto={auto} aoAlternarAuto={() => setAuto(a => !a)} />
        <div className="divisor" />
        <PreviewPanel instantaneo={instantaneo} />
      </main>
      <footer className="barra-status">
        <span>🏠 DevCasa Studio · {projetos.length} projeto(s)</span>
        <span>{config.usarApi ? "IA: " + (config.modelo || "mistral") : "modo offline"}</span>
      </footer>
      {modal === "modelos" && <ModalModelos aoUsar={usarModelo} aoFechar={() => setModal(null)} />}
      {modal === "config" && <ModalConfig config={config} aoSalvar={c => { setConfig(c); setModal(null); }} aoFechar={() => setModal(null)} />}
      {modal === "ajuda" && <ModalAjuda aoFechar={() => setModal(null)} />}
    </div>
  );
}

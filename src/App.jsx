import { useEffect, useState } from "react";
import ChatPanel from "./components/ChatPanel.jsx";
import EditorPanel from "./components/EditorPanel.jsx";
import PreviewPanel from "./components/PreviewPanel.jsx";
import { ModalModelos, ModalConfig, ModalAjuda } from "./components/Modais.jsx";
import ModalConta from "./components/ModalConta.jsx";
import { TEMPLATES } from "./lib/templates.js";
import { mensagemBoasVindas, responder, consultarAPIStream, extrairCodigo } from "./lib/assistant.js";
import { carregarProjetos, salvarProjetos, novoProjeto, montarDocumento, baixarArquivo } from "./lib/storage.js";
import { baixarProjetoReact, slugNome } from "./lib/exportar.js";
import * as sync from "./lib/sync.js";

function carregarConfig() {
  const padrao = { usarApi: false, apiUrl: "", apiKey: "", modelo: "" };
  try { return Object.assign({}, padrao, JSON.parse(localStorage.getItem("devcasa:config") || "{}")); }
  catch (e) { return padrao; }
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
  const [usuario, setUsuario] = useState(null);
  const [statusSync, setStatusSync] = useState(null);
  const [mostrarEditor, setMostrarEditor] = useState(true);

  const projetoAtivo = projetos.find(p => p.id === ativoId) ?? projetos[0];

  useEffect(() => { salvarProjetos(projetos); }, [projetos]);
  useEffect(() => {
    try { localStorage.setItem("devcasa:config", JSON.stringify(config)); } catch (e) {}
  }, [config]);

  useEffect(() => {
    return sync.aoMudarUsuario(async (u) => {
      setUsuario(u);
      if (u) {
        try {
          const nuvem = await sync.baixarDaNuvem();
          setProjetos(atuais => {
            const mapa = new Map();
            atuais.forEach(p => mapa.set(p.id, p));
            (nuvem || []).forEach(p => {
              const local = mapa.get(p.id);
              if (!local || (p.atualizadoEm > (local.atualizadoEm || 0))) mapa.set(p.id, p);
            });
            const unidos = Array.from(mapa.values());
            setStatusSync({ email: u.email, contador: unidos.length });
            return unidos;
          });
        } catch (e) {
          console.warn("Falha ao baixar da nuvem:", e);
        }
      } else {
        setStatusSync(null);
      }
    });
  }, []);

  useEffect(() => {
    if (!usuario) return;
    projetos.forEach(p => {
      sync.enviarParaNuvem(p).catch(e => console.warn("Upload falhou:", e));
    });
  }, [projetos, usuario]);

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
  function novoChat() { setMensagens([mensagemBoasVindas()]); }
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
    setMostrarEditor(true);
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
  function atualizarUltima(mudanca) {
    setMensagens(m => {
      const copia = m.slice();
      copia[copia.length - 1] = Object.assign({}, copia[copia.length - 1], mudanca);
      return copia;
    });
  }
  function sincronizarAgora() {
    if (!usuario) return;
    sync.baixarDaNuvem().then(nuvem => {
      if (!nuvem) return;
      setProjetos(atuais => {
        const mapa = new Map();
        atuais.forEach(p => mapa.set(p.id, p));
        nuvem.forEach(p => {
          const local = mapa.get(p.id);
          if (!local || (p.atualizadoEm > (local.atualizadoEm || 0))) mapa.set(p.id, p);
        });
        return Array.from(mapa.values());
      });
      alert("✅ Sincronizado com a nuvem!");
    }).catch(e => alert("Erro: " + e.message));
  }

  async function enviarChat(texto) {
    if (texto.startsWith("/limpar")) { setMensagens([mensagemBoasVindas()]); return; }
    setMensagens(m => [...m, { autor: "usuario", texto }]);
    if (config.usarApi && config.apiUrl) {
      setOcupado(true);
      setMensagens(m => [...m, { autor: "ia", texto: "✍️" }]);
      try {
        const historico = [...mensagens, { autor: "usuario", texto }].slice(-10).map(m => ({
          role: m.autor === "ia" ? "assistant" : "user",
          content: m.texto
        }));
        const resposta = await consultarAPIStream(config, historico, (parcial) => {
          atualizarUltima({ texto: parcial });
        });
        const codigo = extrairCodigo(resposta);
        atualizarUltima({
          texto: resposta,
          acao: codigo ? { tipo: "inserir-codigo", codigo: codigo, rotulo: "📥 Inserir código no editor" } : null
        });
      } catch (erro) {
        atualizarUltima({ texto: "⚠️ Falha na IA: " + erro.message });
      } finally { setOcupado(false); }
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
    try { await baixarProjetoReact(projetoAtivo); }
    catch (e) { alert("Erro ao gerar o ZIP: " + e.message); }
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
        <button onClick={criarProjeto} title="Criar novo projeto">➕ Projeto</button>
        <span className={config.usarApi ? "selo-ia on" : "selo-ia"}>{config.usarApi ? "🟢 " + (config.modelo || "IA") : "⚪ offline"}</span>
        <span className="espaco" />
        <button onClick={() => setMostrarEditor(v => !v)} title="Mostrar ou ocultar o editor de código">
          {mostrarEditor ? "🙈 Código" : "👁️ Código"}
        </button>
        <button onClick={() => setModal("modelos")}>🧩 Modelos</button>
        <button className="botao-primario" onClick={baixarHTML}>💾 HTML</button>
        <button onClick={baixarReact}>⚛️ React</button>
        <button onClick={() => setModal("config")}>⚙️ IA</button>
        <button className={usuario ? "botao-conta on" : "botao-conta"} onClick={() => setModal("conta")}>
          {usuario ? "☁️ " + (usuario.email || "").split("@")[0] : "☁️ Conta"}
        </button>
        <button onClick={() => setModal("ajuda")}>❓</button>
      </header>
      <main className="corpo" style={{ gridTemplateColumns: mostrarEditor ? "330px 6px 1fr 6px 430px" : "330px 6px 1fr" }}>
        <ChatPanel mensagens={mensagens} ocupado={ocupado} aoEnviar={enviarChat} aoAcao={aoAcaoChat} aoNovoChat={novoChat} />
        <div className="divisor" />
        {mostrarEditor && (
          <EditorPanel projeto={projetoAtivo} aba={aba} aoTrocarAba={setAba}
            aoMudar={(c, v) => atualizarAtivo({ [c]: v })} aoExecutar={executar}
            auto={auto} aoAlternarAuto={() => setAuto(a => !a)} />
        )}
        {mostrarEditor && <div className="divisor" />}
        <PreviewPanel instantaneo={instantaneo} />
      </main>
      <footer className="barra-status">
        <span>🏠 DevCasa Studio · {projetos.length} projeto(s){usuario ? " · ☁️ sincronizado" : " · 💾 local"}</span>
        <span>{config.usarApi ? "IA: " + (config.modelo || "groq") + " · ⚡" : "modo offline"}</span>
      </footer>
      {modal === "modelos" && <ModalModelos aoUsar={usarModelo} aoFechar={() => setModal(null)} />}
      {modal === "config" && <ModalConfig config={config} aoSalvar={c => { setConfig(c); setModal(null); }} aoFechar={() => setModal(null)} />}
      {modal === "ajuda" && <ModalAjuda aoFechar={() => setModal(null)} />}
      {modal === "conta" && <ModalConta aoFechar={() => setModal(null)} status={statusSync} aoSincronizar={sincronizarAgora} />}
    </div>
  );
}

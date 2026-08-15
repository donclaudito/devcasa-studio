import { useEffect, useRef, useState } from "react";

export default function ChatPanel({ mensagens, ocupado, aoEnviar, aoAcao, aoNovoChat, anexos, aoAnexar, aoRemoverAnexo }) {
  const [texto, setTexto] = useState("");
  const fimRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    if (fimRef.current) fimRef.current.scrollIntoView({ behavior: "smooth" });
  }, [mensagens, ocupado, anexos]);

  function enviar(e) {
    e.preventDefault();
    const t = texto.trim();
    if (!t && (!anexos || anexos.length === 0)) return;
    aoEnviar(t || "Analise o(s) anexo(s)");
    setTexto("");
  }

  return (
    <section className="painel chat">
      <header className="painel-topo">
        <span>💬 Chat de orientação</span>
        <button onClick={aoNovoChat} title="Limpar conversa">🧹 Novo chat</button>
      </header>
      <div className="chat-corpo">
        {mensagens.map((m, i) => (
          <div key={i} className={m.autor === "ia" ? "bolha ia" : "bolha usuario"}>
            {m.anexos && m.anexos.length > 0 && (
              <div className="anexos-msg">
                {m.anexos.map((a, j) => a.tipo === "imagem"
                  ? <img key={j} src={a.dataUrl} alt={a.nome} className="anexo-img" />
                  : <span key={j} className="chip-anexo">📄 {a.nome}</span>)}
              </div>
            )}
            <pre className="bolha-texto">{m.texto}</pre>
            
            {m.erroAnalise && m.erroAnalise.erros && m.erroAnalise.erros.length > 0 && (
              <div className="banner-erro">
                <div className="erro-header">
                  ⚠️ Detectei {m.erroAnalise.erros.length} erro(s) no código gerado
                </div>
                <ul className="erro-lista">
                  {m.erroAnalise.erros.map((e, j) => (
                    <li key={j}>
                      <b>[{e.tipo}]</b> {e.msg}
                    </li>
                  ))}
                </ul>
                <div className="erro-botoes">
                  <button 
                    className="btn-corrigir" 
                    onClick={() => aoAcao({ 
                      tipo: "corrigir-erro", 
                      erros: m.erroAnalise.erros, 
                      codigo: m.erroAnalise.codigo, 
                      css: m.erroAnalise.css 
                    })}
                  >
                    🔧 Pedir para corrigir
                  </button>
                  <button 
                    className="btn-ignorar" 
                    onClick={() => aoAcao({ 
                      tipo: "inserir-codigo", 
                      codigo: m.erroAnalise.codigo, 
                      css: m.erroAnalise.css 
                    })}
                  >
                    👁️ Inserir mesmo assim
                  </button>
                </div>
              </div>
            )}
            
            {m.acao && !m.erroAnalise && (
              <button className="botao-acao" onClick={() => aoAcao(m.acao)}>
                {m.acao.rotulo}
              </button>
            )}
          </div>
        ))}
        {ocupado && <div className="bolha ia"><pre className="bolha-texto">✍️ digitando…</pre></div>}
        <div ref={fimRef} />
      </div>
      <form className="chat-entrada" onSubmit={enviar}>
        {anexos && anexos.length > 0 && (
          <div className="chips-anexos">
            {anexos.map((a, i) => (
              <span key={i} className="chip-anexo">
                {a.tipo === "imagem" ? "🖼️" : "📄"} {a.nome}
                <button type="button" title="Remover" onClick={() => aoRemoverAnexo(i)}>×</button>
              </span>
            ))}
          </div>
        )}
        <div className="linha-entrada">
          <input type="file" ref={fileRef} hidden multiple
            accept=".txt,.md,.csv,.json,.js,.jsx,.ts,.tsx,.html,.css,.py,.sql,.pdf,image/*"
            onChange={e => { aoAnexar(Array.from(e.target.files || [])); e.target.value = ""; }} />
          <button type="button" className="botao-anexo" title="Anexar" onClick={() => fileRef.current.click()}>📎</button>
          <input value={texto} onChange={e => setTexto(e.target.value)} placeholder="Peça um app ou anexe arquivos…" />
          <button type="submit" className="botao-primario" disabled={ocupado}>➤</button>
        </div>
      </form>
    </section>
  );
}


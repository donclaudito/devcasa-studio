import { useEffect, useRef, useState } from "react";

const SUGESTOES = ["Crie uma calculadora", "Lista de compras", "Controle de gastos", "Como uso este estúdio?"];

export default function ChatPanel({ mensagens, ocupado, aoEnviar, aoAcao }) {
  const [texto, setTexto] = useState("");
  const fimRef = useRef(null);

  useEffect(() => {
    if (fimRef.current) fimRef.current.scrollIntoView({ behavior: "smooth" });
  }, [mensagens, ocupado]);

  function enviar(t) {
    const limpo = (t !== undefined ? t : texto).trim();
    if (!limpo) return;
    aoEnviar(limpo);
    setTexto("");
  }

  return (
    <section className="painel">
      <header className="painel-cabecalho">
        <span>💬 Chat de orientação</span>
        <span className="selo">React JS</span>
      </header>
      <div className="mensagens">
        {mensagens.map((m, i) => (
          <div key={i} className={"bolha " + (m.autor === "usuario" ? "usuario" : "ia")}>
            {m.texto}
            {m.acao && (
              <div>
                <button type="button" className="botao-acao" onClick={() => aoAcao(m.acao)}>
                  {m.acao.rotulo}
                </button>
              </div>
            )}
          </div>
        ))}
        {ocupado && <div className="bolha ia digitando">digitando…</div>}
        <div ref={fimRef} />
      </div>
      <div className="sugestoes">
        {SUGESTOES.map((s) => (
          <button type="button" key={s} onClick={() => enviar(s)}>{s}</button>
        ))}
      </div>
      <div className="entrada-chat">
        <textarea
          rows={1}
          value={texto}
          placeholder="Peça um app… (/ajuda)"
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(); }
          }}
        />
        <button type="button" onClick={() => enviar()} disabled={ocupado}>➤</button>
      </div>
    </section>
  );
}

import { useRef } from "react";
export default function EditorPanel({ projeto, aba, aoTrocarAba, aoMudar, aoExecutar, auto, aoAlternarAuto }) {
  const areaRef = useRef(null);
  const numerosRef = useRef(null);
  const campo = aba === "js" ? "codigo" : "css";
  const valor = projeto[campo];
  const totalLinhas = valor.split("\n").length;
  function sincronizarRolagem() {
    if (numerosRef.current && areaRef.current) numerosRef.current.scrollTop = areaRef.current.scrollTop;
  }
  function aoTeclar(e) {
    if (e.key === "Tab") {
      e.preventDefault();
      const el = e.target;
      el.setRangeText("  ", el.selectionStart, el.selectionEnd, "end");
      aoMudar(campo, el.value);
    }
    if (e.key === "Enter" && e.ctrlKey) { e.preventDefault(); aoExecutar(); }
  }
  return (
    <section className="painel">
      <header className="painel-cabecalho">
        <div className="abas">
          <button className={aba === "js" ? "aba ativa" : "aba"} onClick={() => aoTrocarAba("js")}>App.js</button>
          <button className={aba === "css" ? "aba ativa" : "aba"} onClick={() => aoTrocarAba("css")}>styles.css</button>
        </div>
        <div className="acoes-editor">
          <label className="auto"><input type="checkbox" checked={auto} onChange={aoAlternarAuto} /> auto</label>
          <button className="botao-primario" onClick={aoExecutar}>▶ Executar</button>
        </div>
      </header>
      <div className="editor-corpo">
        <div className="numeros" ref={numerosRef}>
          {Array.from({ length: totalLinhas }, (_, i) => <div key={i}>{i + 1}</div>)}
        </div>
        <textarea ref={areaRef} className="codigo" value={valor} spellCheck={false} wrap="off"
          onChange={e => aoMudar(campo, e.target.value)}
          onScroll={sincronizarRolagem}
          onKeyDown={aoTeclar} />
      </div>
      <footer className="editor-rodape">
        {totalLinhas} linha(s) · {valor.length} caracteres · defina sempre <code>function App()</code> · Ctrl+Enter executa
      </footer>
    </section>
  );
}

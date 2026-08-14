import { useEffect, useMemo, useRef, useState } from "react";
import { montarDocumento } from "../lib/storage.js";
export default function PreviewPanel({ instantaneo, aoAbrirSozinho }) {
  const iframeRef = useRef(null);
  const [erro, setErro] = useState(null);
  const srcDoc = useMemo(
    () => (instantaneo ? montarDocumento({ codigo: instantaneo.codigo, css: instantaneo.css }) : ""),
    [instantaneo]
  );
  useEffect(() => { setErro(null); }, [instantaneo?.versao]);
  useEffect(() => {
    function ouvir(ev) {
      if (!iframeRef.current || ev.source !== iframeRef.current.contentWindow) return;
      const d = ev.data;
      if (d && d.__devcasa === true && d.tipo === "erro") setErro(d.mensagem);
    }
    window.addEventListener("message", ouvir);
    return () => window.removeEventListener("message", ouvir);
  }, []);
  return (
    <section className="painel">
      <header className="painel-cabecalho">
        <span>👁️ Visualização</span>
        {instantaneo && <button onClick={aoAbrirSozinho}>↗ abrir sozinho</button>}
      </header>
      {!instantaneo ? (
        <div className="vazio">Escreva um código e clique em <b>▶ Executar</b>.</div>
      ) : (
        <>
          {erro && <div className="erro">⚠️ {erro}</div>}
          <iframe ref={iframeRef} key={instantaneo.versao} title="Visualização"
            sandbox="allow-scripts" srcDoc={srcDoc} />
        </>
      )}
    </section>
  );
}

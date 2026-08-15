import { useState } from "react";

export default function ModalValidacao({ erros, avisos, aoCorrigir, aoIgnorar, aoFechar }) {
  const [corrigindo, setCorrigindo] = useState(false);

  async function pedirCorrecao() {
    setCorrigindo(true);
    await aoCorrigir();
    setCorrigindo(false);
  }

  return (
    <div className="modal-fundo" onClick={aoFechar}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{maxWidth: "500px"}}>
        <h2>⚠️ Problemas detectados no código</h2>
        <p style={{color: "#ff8a8a", marginBottom: "12px"}}>
          Encontrei <b>{erros.length}</b> problema(s) antes de inserir:
        </p>
        <ul style={{
          background: "var(--papel-claro)",
          padding: "12px 20px",
          borderRadius: "8px",
          marginBottom: "16px",
          fontSize: "13px",
          lineHeight: "1.6",
          listStyle: "none"
        }}>
          {erros.map((e, i) => (
            <li key={i} style={{color: "#ffb3b3", padding: "4px 0", borderBottom: "1px dashed rgba(255,71,87,.2)"}}>
              <b style={{color: "#ff4757", marginRight: "6px"}}>[{e.tipo}]</b> {e.msg}
            </li>
          ))}
        </ul>
        {avisos && avisos.length > 0 && (
          <>
            <p style={{color: "#ffd700", marginBottom: "8px", fontSize: "13px"}}>
              ⚡ {avisos.length} aviso(s):
            </p>
            <ul style={{
              background: "var(--papel-claro)",
              padding: "10px 20px",
              borderRadius: "8px",
              marginBottom: "16px",
              fontSize: "12px",
              listStyle: "none"
            }}>
              {avisos.map((a, i) => (
                <li key={i} style={{color: "#ffe066", padding: "3px 0"}}>• {a.msg}</li>
              ))}
            </ul>
          </>
        )}
        <div className="modal-botoes">
          <button className="botao-primario" onClick={pedirCorrecao} disabled={corrigindo}
            style={{background: corrigindo ? "#666" : "linear-gradient(135deg,#ff6b6b,#ee5a6f)"}}>
            {corrigindo ? "🔧 Corrigindo..." : " Pedir para corrigir"}
          </button>
          <button onClick={aoIgnorar}>️ Inserir mesmo assim</button>
          <button onClick={aoFechar}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

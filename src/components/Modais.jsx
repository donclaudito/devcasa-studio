import { useState } from "react";
import { TEMPLATES } from "../lib/templates.js";

function Fundo({ aoFechar, children }) {
  return (
    <div className="modal-fundo" onClick={aoFechar}>
      <div className="modal" onClick={e => e.stopPropagation()}>{children}</div>
    </div>
  );
}

export function ModalModelos({ aoUsar, aoFechar }) {
  return (
    <Fundo aoFechar={aoFechar}>
      <h2>🧩 Modelos prontos</h2>
      <div className="modelos-grade">
        {TEMPLATES.map(t => (
          <article key={t.id} className="modelo-cartao">
            <h3>{t.icone} {t.nome}</h3>
            <p>{t.descricao}</p>
            <button className="botao-primario" onClick={() => aoUsar(t.id)}>Usar</button>
          </article>
        ))}
      </div>
      <div className="modal-botoes"><button onClick={aoFechar}>Fechar</button></div>
    </Fundo>
  );
}

export function ModalConfig({ config, aoSalvar, aoFechar }) {
  const [form, setForm] = useState(config);
  const mudar = (campo, valor) => setForm(f => Object.assign({}, f, { [campo]: valor }));
  function presetMistral() {
    setForm(f => Object.assign({}, f, { usarApi: true, apiUrl: "https://api.mistral.ai/v1/chat/completions", modelo: "mistral-small-latest" }));
  }
  function presetGroq() {
    setForm(f => Object.assign({}, f, { usarApi: true, apiUrl: "https://api.groq.com/openai/v1/chat/completions", modelo: "llama-3.3-70b-versatile" }));
  }
  return (
    <Fundo aoFechar={aoFechar}>
      <h2>⚙️ IA online gratuita</h2>
      <p>Ligue uma IA de verdade para o chat criar QUALQUER app sob medida. Mistral e Groq têm plano grátis.</p>
      <div className="presets">
        <button type="button" onClick={presetMistral}>🇫🇷 Preencher Mistral (grátis)</button>
        <button type="button" onClick={presetGroq}>⚡ Preencher Groq (grátis)</button>
      </div>
      <label className="campo"><input type="checkbox" checked={form.usarApi} onChange={e => mudar("usarApi", e.target.checked)} /> Usar IA online</label>
      <label className="campo">URL da API
        <input type="text" value={form.apiUrl} onChange={e => mudar("apiUrl", e.target.value)} placeholder="https://api.mistral.ai/v1/chat/completions" />
      </label>
      <label className="campo">Chave da API (grátis)
        <input type="password" value={form.apiKey} onChange={e => mudar("apiKey", e.target.value)} placeholder="Cole aqui sua chave" />
      </label>
      <label className="campo">Modelo
        <input type="text" value={form.modelo} onChange={e => mudar("modelo", e.target.value)} placeholder="mistral-small-latest" />
      </label>
      <p className="aviso">🔒 A chave fica salva SOMENTE neste navegador. Como criar grátis: console.mistral.ai → API Keys → Create new key (ou console.groq.com → API Keys). Cole a chave no campo acima.</p>
      <div className="modal-botoes">
        <button onClick={aoFechar}>Cancelar</button>
        <button className="botao-primario" onClick={() => aoSalvar(form)}>Salvar</button>
      </div>
    </Fundo>
  );
}

export function ModalAjuda({ aoFechar }) {
  return (
    <Fundo aoFechar={aoFechar}>
      <h2>❓ Ajuda</h2>
      <ol>
        <li>Peça no chat (ex.: "app de receitas")</li>
        <li>Clique no botão 📥 para inserir o código</li>
        <li>Edite no centro e ▶ Executar (Ctrl+Enter)</li>
        <li>💾 Baixar HTML gera o app em arquivo único</li>
        <li>⚙️ IA liga a IA gratuita (Mistral/Groq)</li>
      </ol>
      <div className="modal-botoes"><button className="botao-primario" onClick={aoFechar}>Entendi</button></div>
    </Fundo>
  );
}

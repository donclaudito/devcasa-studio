import { useState } from "react";
import * as sync from "../lib/sync.js";

export default function ModalConta({ aoFechar, status, aoSincronizar }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [modo, setModo] = useState("login");

  async function entrar(e) {
    e.preventDefault();
    setErro(""); setCarregando(true);
    try {
      if (modo === "login") await sync.loginComEmail(email, senha);
      else await sync.cadastrar(email, senha);
      aoFechar();
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  async function sair() {
    await sync.logout();
    aoFechar();
  }

  if (status) {
    return (
      <div className="modal-fundo" onClick={aoFechar}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <h2>☁️ Conta conectada</h2>
          <p className="sucesso">✅ Logado como <b>{status.email}</b></p>
          <p>Seus projetos são sincronizados automaticamente com a nuvem. Abra este site em outro dispositivo, entre com a mesma conta e seus projetos aparecem lá!</p>
          <div className="info-sync">
            <p>📊 {status.contador} projeto(s) sincronizado(s)</p>
          </div>
          <div className="modal-botoes">
            <button className="botao-primario" onClick={() => { aoSincronizar && aoSincronizar(); aoFechar(); }}>🔄 Sincronizar agora</button>
            <button onClick={sair}>🚪 Sair da conta</button>
            <button onClick={aoFechar}>Fechar</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-fundo" onClick={aoFechar}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>☁️ {modo === "login" ? "Entrar na conta" : "Criar conta grátis"}</h2>
        <p>{modo === "login" ? "Entre para sincronizar projetos entre dispositivos." : "Crie sua conta grátis para sincronizar projetos."}</p>
        <form onSubmit={entrar}>
          <label className="campo">Email
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
          </label>
          <label className="campo">Senha (mínimo 6 caracteres)
            <input type="password" required minLength={6} value={senha} onChange={e => setSenha(e.target.value)} />
          </label>
          {erro && <p className="erro">{erro}</p>}
          <div className="modal-botoes">
            <button type="submit" className="botao-primario" disabled={carregando}>
              {carregando ? "..." : modo === "login" ? "🔑 Entrar" : "✨ Criar conta"}
            </button>
            <button type="button" onClick={() => setModo(modo === "login" ? "cadastro" : "login")}>
              {modo === "login" ? "Não tenho conta" : "Já tenho conta"}
            </button>
            <button type="button" onClick={aoFechar}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export const CODIGO_INICIAL = "function App() {\n  const [c, setC] = React.useState(0);\n  return (\n    <div className=\"cartao\">\n      <h1>🏠 Meu primeiro app</h1>\n      <button onClick={() => setC(c + 1)}>Você clicou {c} vezes</button>\n    </div>\n  );\n}";
export const CSS_INICIAL = "body{background:#f5f7fb}.cartao{max-width:380px;margin:48px auto;background:#fff;border-radius:14px;padding:24px;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,.08);font-family:system-ui,sans-serif}.cartao button{margin-top:12px;padding:10px 18px;font-size:15px;border:0;border-radius:10px;background:#3d7bfd;color:#fff;cursor:pointer}";

const USE_PERSISTENTE = "function usePersistente(chave, valorInicial){const[valor,setValor]=React.useState(()=>{try{const s=localStorage.getItem(chave);return s?JSON.parse(s):valorInicial}catch{return valorInicial}});React.useEffect(()=>{try{localStorage.setItem(chave,JSON.stringify(valor))}catch{}},[valor]);return[valor,setValor]}";

export const TEMPLATES = [
  {
    id:"calculadora", nome:"Calculadora", icone:"🧮", descricao:"Calculadora básica.",
    codigo:`function App(){const[d,setD]=React.useState("0");const[a,setA]=React.useState(null);const[op,setOp]=React.useState(null);function dig(n){setD(v=>v==="0"?String(n):v+n)}function pt(){setD(v=>v.includes(".")?v:v+".")}function clr(){setD("0");setA(null);setOp(null)}function opr(o){setA(parseFloat(d));setOp(o);setD("0")}function eq(){if(a===null||!op)return;const x=parseFloat(d);let r=x;if(op==="+")r=a+x;if(op==="-")r=a-x;if(op==="×")r=a*x;if(op==="÷")r=x!==0?a/x:0;setD(String(Math.round(r*10000)/10000));setA(null);setOp(null)}const b=["7","8","9","÷","4","5","6","×","1","2","3","-","0",".","C","+"];return(<div className="calc"><div className="visor">{d}</div><div className="teclas">{b.map(v=>(<button key={v} onClick={()=>{if(v==="C")clr();else if("+-×÷".includes(v))opr(v);else if(v===".")pt();else dig(v)}}>{v}</button>))}<button className="igual" onClick={eq}>=</button></div></div>)}`,
    css:"body{background:#10131a}.calc{width:260px;margin:40px auto;background:#1c2230;border-radius:16px;padding:16px;box-shadow:0 10px 30px rgba(0,0,0,.45);font-family:system-ui,sans-serif}.visor{background:#0d1017;color:#fff;font-size:32px;text-align:right;padding:14px;border-radius:10px;margin-bottom:12px;overflow:hidden;white-space:nowrap}.teclas{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.teclas button{padding:14px 0;font-size:18px;border:0;border-radius:10px;background:#2a3348;color:#fff;cursor:pointer}.teclas button:hover{background:#38425c}.igual{grid-column:span 4;background:#3d7bfd}.igual:hover{background:#5a8dff}"
  },
  {
    id:"tarefas", nome:"Lista de Tarefas", icone:"📝", descricao:"Tarefas da casa.",
    codigo:USE_PERSISTENTE+` function App(){const[t,setT]=usePersistente("tarefas",[]);const[x,setX]=React.useState("");function add(){const s=x.trim();if(!s)return;setT([...t,{id:Date.now(),texto:s,feita:false}]);setX("")}function tog(id){setT(t.map(y=>y.id===id?{...y,feita:!y.feita}:y))}function rem(id){setT(t.filter(y=>y.id!==id))}return(<div className="app"><h1>📝 Tarefas</h1><div className="linha"><input value={x} onChange={e=>setX(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="Ex.: regar plantas"/><button onClick={add}>Adicionar</button></div><ul>{t.map(y=>(<li key={y.id} className={y.feita?"feita":""}><label><input type="checkbox" checked={y.feita} onChange={()=>tog(y.id)}/>{y.texto}</label><span className="apagar" onClick={()=>rem(y.id)}>✕</span></li>))}</ul></div>)}`,
    css:"body{background:#f2f5f9}.app{max-width:420px;margin:30px auto;background:#fff;padding:22px;border-radius:14px;box-shadow:0 8px 24px rgba(0,0,0,.08);font-family:system-ui,sans-serif}h1{font-size:20px;margin:0 0 14px}.linha{display:flex;gap:8px;margin-bottom:14px}.linha input{flex:1;padding:10px;border:1px solid #ccd4e0;border-radius:8px}.linha button{padding:10px 14px;border:0;border-radius:8px;background:#3d7bfd;color:#fff;cursor:pointer}ul{list-style:none;padding:0;margin:0}li{display:flex;justify-content:space-between;align-items:center;padding:9px 6px;border-bottom:1px solid #eef1f6}li label{display:flex;gap:8px;align-items:center;cursor:pointer}li.feita label{text-decoration:line-through;color:#98a2b3}.apagar{color:#c0392b;cursor:pointer;padding:0 4px}"
  },
  {
    id:"cronometro", nome:"Cronômetro", icone:"⏱️", descricao:"Tempo para cozinha e pausas.",
    codigo:`function App(){const[s,setS]=React.useState(0);const[a,setA]=React.useState(false);React.useEffect(()=>{if(!a)return;const id=setInterval(()=>setS(v=>v+1),1000);return()=>clearInterval(id)},[a]);function f(t){const h=Math.floor(t/3600);const m=Math.floor((t%3600)/60);const x=t%60;return[h,m,x].map(n=>String(n).padStart(2,"0")).join(":")}return(<div className="crono"><div className="tempo">{f(s)}</div><div className="botoes"><button onClick={()=>setA(!a)}>{a?"⏸ Pausar":"▶ Iniciar"}</button><button onClick={()=>{setA(false);setS(0)}}>⏹ Zerar</button></div></div>)}`,
    css:"body{background:#0e1117}.crono{max-width:340px;margin:60px auto;text-align:center;color:#e8ecf5;font-family:system-ui,sans-serif}.tempo{font-size:56px;font-weight:700;font-variant-numeric:tabular-nums;letter-spacing:2px;background:#161b26;border-radius:16px;padding:24px;margin-bottom:16px}.botoes{display:flex;gap:10px;justify-content:center;margin-bottom:14px}.botoes button{padding:10px 18px;border:0;border-radius:10px;font-size:15px;cursor:pointer;background:#2b7fff;color:#fff}.botoes button:last-child{background:#3a425c}"
  },
  {
    id:"receitas", nome:"Livro de Receitas", icone:"🍳", descricao:"Salve suas receitas favoritas.",
    codigo:USE_PERSISTENTE+` function App(){
  const [receitas, setReceitas] = usePersistente("receitas-casa", []);
  const [view, setView] = React.useState("lista");
  const [atual, setAtual] = React.useState(null);
  const [nome, setNome] = React.useState("");
  const [ingredientes, setIngredientes] = React.useState("");
  const [modo, setModo] = React.useState("");
  const [filtro, setFiltro] = React.useState("");

  function salvar() {
    if (!nome.trim()) return;
    const nova = {
      id: Date.now(),
      nome: nome.trim(),
      ingredientes: ingredientes.trim(),
      modo: modo.trim(),
      criada: new Date().toLocaleDateString("pt-BR")
    };
    setReceitas([nova, ...receitas]);
    setNome(""); setIngredientes(""); setModo("");
    setView("lista");
  }
  function abrir(r) { setAtual(r); setView("ver"); }
  function remover(id) {
    setReceitas(receitas.filter(r => r.id !== id));
    if (atual && atual.id === id) setView("lista");
  }
  function cancelar() {
    setNome(""); setIngredientes(""); setModo("");
    setView("lista");
  }

  const filtradas = receitas.filter(r =>
    r.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    r.ingredientes.toLowerCase().includes(filtro.toLowerCase())
  );

  const vazioMsg = receitas.length === 0 ? 'Nenhuma receita ainda. Que tal começar uma?' : 'Nada encontrado para ' + filtro;

  if (view === "nova") {
    return (
      <div className="app">
        <h1>🍳 Nova receita</h1>
        <label>Nome
          <input value={nome} onChange={e=>setNome(e.target.value)} placeholder="Ex.: Bolo de cenoura" />
        </label>
        <label>Ingredientes (um por linha)
          <textarea value={ingredientes} onChange={e=>setIngredientes(e.target.value)}
            placeholder="2 xícaras de farinha" />
        </label>
        <label>Modo de preparo
          <textarea value={modo} onChange={e=>setModo(e.target.value)}
            placeholder="Descreva passo a passo" />
        </label>
        <div className="botoes">
          <button className="suave" onClick={cancelar}>Cancelar</button>
          <button className="primario" onClick={salvar}>💾 Salvar</button>
        </div>
      </div>
    );
  }

  if (view === "ver" && atual) {
    return (
      <div className="app">
        <button className="voltar" onClick={()=>setView("lista")}>← Voltar</button>
        <h1>{atual.nome}</h1>
        <small className="data">criada em {atual.criada}</small>
        <h2>🥕 Ingredientes</h2>
        <ul className="ing">{atual.ingredientes.split(String.fromCharCode(10)).filter(Boolean).map((l,i)=>(<li key={i}>{l}</li>))}</ul>
        <h2>👨‍🍳 Modo de preparo</h2>
        <p className="modo">{atual.modo}</p>
        <div className="botoes">
          <button className="perigo" onClick={()=>remover(atual.id)}>🗑️ Apagar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <h1>📖 Livro de Receitas</h1>
      <input className="busca" value={filtro} onChange={e=>setFiltro(e.target.value)}
        placeholder="🔍 Buscar por nome ou ingrediente" />
      <button className="nova" onClick={()=>setView("nova")}>+ Nova receita</button>
      {filtradas.length === 0 ? (
        <p className="vazio">{vazioMsg}</p>
      ) : (
        <ul className="lista">{filtradas.map(r=>(
          <li key={r.id} onClick={()=>abrir(r)}>
            <div className="card">
              <strong>{r.nome}</strong>
              <small>{r.ingredientes.split(String.fromCharCode(10)).filter(Boolean).length} ingredientes · {r.criada}</small>
            </div>
          </li>
        ))}</ul>
      )}
    </div>
  );
}`,
    css:"body{background:#fff8ef;font-family:system-ui,sans-serif}.app{max-width:520px;margin:24px auto;background:#fffdf9;border:1px solid #f0dcb3;border-radius:16px;padding:22px;box-shadow:0 10px 28px rgba(120,80,20,.08)}h1{font-size:22px;margin:0 0 10px;color:#6b3f0d}h2{font-size:15px;margin:16px 0 6px;color:#a0522d;border-bottom:1px dashed #e6cf9a;padding-bottom:4px}label{display:block;font-size:13px;color:#6b3f0d;margin:10px 0 4px;font-weight:600}input,textarea{width:100%;padding:9px 11px;border:1px solid #e6cf9a;border-radius:8px;font-family:inherit;font-size:14px;background:#fffef9;box-sizing:border-box}textarea{min-height:110px;resize:vertical;line-height:1.6}.botoes{display:flex;gap:8px;margin-top:14px;justify-content:flex-end}.botoes button,.nova,.voltar{padding:9px 16px;border:0;border-radius:8px;cursor:pointer;font-size:14px}.primario{background:#c86a1f;color:#fff}.suave{background:#f0dcb3;color:#6b3f0d}.perigo{background:#b00020;color:#fff}.nova{background:#c86a1f;color:#fff;width:100%;margin:10px 0}.voltar{background:#f0dcb3;color:#6b3f0d;margin-bottom:10px}.busca{margin-bottom:10px}.lista{list-style:none;padding:0;margin:0}.card{background:#fff;padding:12px 14px;border:1px solid #f0dcb3;border-radius:10px}.lista li{cursor:pointer;margin-bottom:8px}.lista li:hover .card{background:#fff5e0;border-color:#c86a1f}.lista li strong{display:block;color:#6b3f0d;font-size:15px}.lista li small{color:#a68860;font-size:12px}.ing{padding-left:20px;margin:0 0 10px}.ing li{margin-bottom:4px;cursor:default}.modo{white-space:pre-wrap;line-height:1.6;background:#fff8ef;padding:10px;border-radius:8px;border-left:3px solid #c86a1f}.data{color:#a68860;display:block;margin-bottom:8px}.vazio{text-align:center;color:#a68860;padding:24px 0;font-style:italic}"
  }
];

// Modelo Premium adicionado dinamicamente
TEMPLATES.push({
  id:"premium", nome:"✨ Premium (Demo)", icone:"✨", descricao:"Demonstração de design premium: glassmorphism, animações, dark mode.",
  codigo:"function App(){const[theme,setTheme]=React.useState(\"dark\");const[count,setCount]=React.useState(0);const[tasks,setTasks]=React.useState([{id:1,text:\"Aprender React\",done:true},{id:2,text:\"Criar app premium\",done:false},{id:3,text:\"Impressionar familia\",done:false}]);const[newTask,setNewTask]=React.useState(\"\");function addTask(){if(!newTask.trim())return;setTasks([...tasks,{id:Date.now(),text:newTask,done:false}]);setNewTask(\"\")}function toggleTask(id){setTasks(tasks.map(t=>t.id===id?{...t,done:!t.done}:t))}return(<div className={\"app \"+theme}><div className=\"header\"><div className=\"logo\"><span className=\"emoji\">✨</span><h1>Premium App</h1></div><button className=\"theme-btn\" onClick={()=>setTheme(theme===\"dark\"?\"light\":\"dark\")}>{theme===\"dark\"?\"☀️\":\"🌙\"}</button></div><div className=\"card glass\"><div className=\"counter\"><span className=\"count\">{count}</span><div className=\"counter-btns\"><button className=\"btn primary\" onClick={()=>setCount(count+1)}>+</button><button className=\"btn\" onClick={()=>setCount(c=>Math.max(0,c-1))}>-</button></div></div></div><div className=\"card glass\"><h2>📝 Tarefas</h2><div className=\"input-row\"><input value={newTask} onChange={e=>setNewTask(e.target.value)} onKeyDown={e=>e.key===\"Enter\"&&addTask()} placeholder=\"Nova tarefa premium...\"/><button className=\"btn primary\" onClick={addTask}>Adicionar</button></div><ul className=\"tasks\">{tasks.map(t=>(<li key={t.id} className={t.done?\"task done\":\"task\"} onClick={()=>toggleTask(t.id)}><span className=\"check\">{t.done?\"✓\":\"○\"}</span><span>{t.text}</span></li>))}</ul></div></div>)}",
  css:`:root{--bg-dark:#0f0f1e;--bg-light:#f0f4ff;--card-dark:rgba(255,255,255,0.05);--card-light:rgba(255,255,255,0.7);--text-dark:#fff;--text-light:#1a1a2e;--primary:#667eea;--accent:#f093fb;--grad:linear-gradient(135deg,#667eea 0%,#764ba2 50%,#f093fb 100%)}*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;min-height:100vh;background:var(--grad);background-size:400% 400%;animation:gradBG 15s ease infinite}
@keyframes gradBG{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
.app{min-height:100vh;padding:24px;transition:all .3s ease}
.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:32px;max-width:600px;margin-left:auto;margin-right:auto}
.logo{display:flex;align-items:center;gap:12px}
.emoji{font-size:40px;animation:float 3s ease-in-out infinite}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
h1{font-size:28px;font-weight:800;background:var(--grad);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;letter-spacing:-.5px}
.theme-btn{background:rgba(255,255,255,.1);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.2);color:#fff;width:44px;height:44px;border-radius:50%;font-size:20px;cursor:pointer;transition:all .3s ease}
.theme-btn:hover{transform:rotate(180deg) scale(1.1);background:rgba(255,255,255,.2)}
.card{max-width:600px;margin:0 auto 20px;padding:24px;border-radius:20px;transition:all .3s ease}
.card.glass{background:var(--card-dark);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.15);box-shadow:0 8px 32px rgba(0,0,0,.2),inset 0 1px 0 rgba(255,255,255,.1)}
.light .card.glass{background:var(--card-light);border:1px solid rgba(255,255,255,.5);box-shadow:0 8px 32px rgba(102,126,234,.15)}
.card:hover{transform:translateY(-2px);box-shadow:0 12px 40px rgba(0,0,0,.3)}
.counter{display:flex;justify-content:space-between;align-items:center}
.count{font-size:72px;font-weight:800;background:var(--grad);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1}
.counter-btns{display:flex;flex-direction:column;gap:8px}
.btn{padding:10px 18px;border-radius:12px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.05);color:#fff;font-size:15px;font-weight:600;cursor:pointer;transition:all .2s ease;backdrop-filter:blur(10px)}
.light .btn{background:rgba(102,126,234,.1);border:1px solid rgba(102,126,234,.2);color:#1a1a2e}
.btn:hover{transform:translateY(-2px);background:rgba(255,255,255,.15)}
.light .btn:hover{background:rgba(102,126,234,.2)}
.btn.primary{background:var(--grad);border:none;color:#fff}
.btn.primary:hover{box-shadow:0 4px 20px rgba(102,126,234,.5);transform:translateY(-2px) scale(1.02)}
.btn:active{transform:scale(.96)}
h2{color:#fff;font-size:20px;font-weight:700;margin-bottom:16px}
.light h2{color:#1a1a2e}
.input-row{display:flex;gap:8px;margin-bottom:16px}
input{flex:1;padding:12px 16px;border-radius:12px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.05);color:#fff;font-size:14px;transition:all .2s ease;backdrop-filter:blur(10px)}
.light input{background:rgba(255,255,255,.8);border:1px solid rgba(102,126,234,.2);color:#1a1a2e}
input::placeholder{color:rgba(255,255,255,.5)}
.light input::placeholder{color:rgba(0,0,0,.4)}
input:focus{outline:none;border-color:var(--primary);background:rgba(255,255,255,.1);box-shadow:0 0 0 3px rgba(102,126,234,.2)}
.tasks{list-style:none}
.task{display:flex;align-items:center;gap:12px;padding:14px;border-radius:12px;background:rgba(255,255,255,.03);margin-bottom:8px;cursor:pointer;transition:all .3s ease;border:1px solid transparent}
.light .task{background:rgba(255,255,255,.5)}
.task:hover{background:rgba(255,255,255,.08);transform:translateX(4px);border-color:rgba(255,255,255,.1)}
.light .task:hover{background:rgba(255,255,255,.8)}
.check{width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;background:rgba(255,255,255,.1);color:#fff;transition:all .3s ease}
.light .check{background:rgba(102,126,234,.1);color:#667eea}
.task.done .check{background:var(--grad);color:#fff}
.task.done span:last-child{text-decoration:line-through;opacity:.5}
.task span:last-child{color:#fff;flex:1}
.light .task span:last-child{color:#1a1a2e}
@media(max-width:640px){.app{padding:16px}.count{font-size:56px}h1{font-size:22px}.card{padding:20px}}`
});

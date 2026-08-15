import fs from 'fs';

const CODIGO_INICIAL = `function App() {
  const [contador, setContador] = React.useState(0);
  return (
    <div className="container">
      <h1>Meu primeiro app</h1>
      <button onClick={() => setContador(contador + 1)}>Cliques: {contador}</button>
    </div>
  );
}`;

const CSS_INICIAL = `body {
  font-family: system-ui, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.container { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); text-align: center; }
button { background: #667eea; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 16px; cursor: pointer; }
button:hover { transform: scale(1.05); }`;

const TEMPLATES = [
  {
    id: "calculadora", nome: "Calculadora", icone: "🧮", descricao: "Operações básicas",
    codigo: `function App() {
  const [display, setDisplay] = React.useState("0");
  const [anterior, setAnterior] = React.useState(null);
  const [operacao, setOperacao] = React.useState(null);
  function digitar(n) { setDisplay(display === "0" ? String(n) : display + n); }
  function limpar() { setDisplay("0"); setAnterior(null); setOperacao(null); }
  function escolherOp(op) { setAnterior(parseFloat(display)); setOperacao(op); setDisplay("0"); }
  function calcular() {
    if (anterior === null || !operacao) return;
    const atual = parseFloat(display);
    let r = 0;
    if (operacao === "+") r = anterior + atual;
    else if (operacao === "-") r = anterior - atual;
    else if (operacao === "*") r = anterior * atual;
    else if (operacao === "/") r = atual !== 0 ? anterior / atual : 0;
    setDisplay(String(r)); setAnterior(null); setOperacao(null);
  }
  return (
    <div className="calc">
      <div className="display">{display}</div>
      <div className="botoes">
        <button onClick={limpar}>C</button><button onClick={() => escolherOp("/")}>/</button><button onClick={() => escolherOp("*")}>*</button>
        <button onClick={() => digitar(7)}>7</button><button onClick={() => digitar(8)}>8</button><button onClick={() => digitar(9)}>9</button><button onClick={() => escolherOp("-")}>-</button>
        <button onClick={() => digitar(4)}>4</button><button onClick={() => digitar(5)}>5</button><button onClick={() => digitar(6)}>6</button><button onClick={() => escolherOp("+")}>+</button>
        <button onClick={() => digitar(1)}>1</button><button onClick={() => digitar(2)}>2</button><button onClick={() => digitar(3)}>3</button><button onClick={calcular}>=</button>
        <button onClick={() => digitar(0)} style={{gridColumn: "span 2"}}>0</button>
      </div>
    </div>
  );
}`,
    css: `.calc { max-width: 320px; margin: 2rem auto; background: #1a1a2e; border-radius: 16px; padding: 1rem; box-shadow: 0 10px 40px rgba(0,0,0,0.3); }
.display { background: #0f0f1e; color: #fff; font-size: 2.5rem; text-align: right; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; }
.botoes { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; }
button { background: #16213e; color: #fff; border: none; padding: 1rem; font-size: 1.2rem; border-radius: 8px; cursor: pointer; }
button:hover { background: #0f3460; transform: scale(1.05); }`
  },
  {
    id: "tarefas", nome: "Lista de tarefas", icone: "", descricao: "Gerencie suas tarefas",
    codigo: `function App() {
  const [tarefas, setTarefas] = React.useState([]);
  const [nova, setNova] = React.useState("");
  function adicionar() { if (!nova.trim()) return; setTarefas([...tarefas, { id: Date.now(), texto: nova, feita: false }]); setNova(""); }
  function alternar(id) { setTarefas(tarefas.map(t => t.id === id ? { ...t, feita: !t.feita } : t)); }
  function remover(id) { setTarefas(tarefas.filter(t => t.id !== id)); }
  return (
    <div className="tarefas">
      <h1>Minhas Tarefas</h1>
      <div className="input-row">
        <input value={nova} onChange={e => setNova(e.target.value)} onKeyDown={e => e.key === "Enter" && adicionar()} placeholder="Nova tarefa..." />
        <button onClick={adicionar}>+</button>
      </div>
      <ul>{tarefas.map(t => (
        <li key={t.id} className={t.feita ? "feita" : ""}>
          <span onClick={() => alternar(t.id)}>{t.feita ? "✅" : "⬜"} {t.texto}</span>
          <button onClick={() => remover(t.id)}>🗑️</button>
        </li>
      ))}</ul>
    </div>
  );
}`,
    css: `.tarefas { max-width: 500px; margin: 2rem auto; padding: 2rem; background: #fff; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
h1 { color: #333; margin-bottom: 1.5rem; }
.input-row { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; }
input { flex: 1; padding: 0.75rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem; }
input:focus { outline: none; border-color: #667eea; }
button { background: #667eea; color: #fff; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-size: 1.2rem; cursor: pointer; }
ul { list-style: none; padding: 0; }
li { display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: #f5f5f5; margin-bottom: 0.5rem; border-radius: 8px; }
li:hover { background: #e8e8e8; }
li.feita span { text-decoration: line-through; opacity: 0.6; }`
  },
  {
    id: "cronometro", nome: "Cronômetro", icone: "⏱️", descricao: "Controle de tempo",
    codigo: `function App() {
  const [tempo, setTempo] = React.useState(0);
  const [rodando, setRodando] = React.useState(false);
  React.useEffect(() => { let i; if (rodando) i = setInterval(() => setTempo(t => t + 1), 1000); return () => clearInterval(i); }, [rodando]);
  function fmt(s) { const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), ss = s%60; return [h,m,ss].map(x => String(x).padStart(2,"0")).join(":"); }
  return (
    <div className="cronometro">
      <div className="tempo">{fmt(tempo)}</div>
      <div className="controles">
        <button onClick={() => setRodando(!rodando)}>{rodando ? "⏸️ Pausar" : "▶️ Iniciar"}</button>
        <button onClick={() => { setRodando(false); setTempo(0); }}> Zerar</button>
      </div>
    </div>
  );
}`,
    css: `.cronometro { max-width: 400px; margin: 2rem auto; text-align: center; padding: 3rem 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 20px; color: #fff; }
.tempo { font-size: 4rem; font-weight: bold; margin-bottom: 2rem; font-variant-numeric: tabular-nums; }
.controles { display: flex; gap: 1rem; justify-content: center; }
button { background: rgba(255,255,255,0.2); color: #fff; border: 2px solid rgba(255,255,255,0.3); padding: 1rem 2rem; border-radius: 12px; font-size: 1.1rem; cursor: pointer; }
button:hover { background: rgba(255,255,255,0.3); transform: translateY(-2px); }`
  },
  {
    id: "receitas", nome: "Receitas", icone: "", descricao: "Organize suas receitas",
    codigo: `function App() {
  const [receitas, setReceitas] = React.useState([{ id: 1, nome: "Bolo de Chocolate", ingredientes: ["2 xíc. farinha", "1 xíc. chocolate", "3 ovos"] }]);
  const [nova, setNova] = React.useState("");
  function adicionar() { if (!nova.trim()) return; setReceitas([...receitas, { id: Date.now(), nome: nova, ingredientes: [] }]); setNova(""); }
  return (
    <div className="receitas">
      <h1>Minhas Receitas</h1>
      <div className="input-row">
        <input value={nova} onChange={e => setNova(e.target.value)} onKeyDown={e => e.key === "Enter" && adicionar()} placeholder="Nova receita..." />
        <button onClick={adicionar}>+</button>
      </div>
      <div className="lista">{receitas.map(r => (
        <div key={r.id} className="card"><h3>{r.nome}</h3><ul>{r.ingredientes.map((ing, i) => <li key={i}>{ing}</li>)}</ul></div>
      ))}</div>
    </div>
  );
}`,
    css: `.receitas { max-width: 600px; margin: 2rem auto; padding: 2rem; }
h1 { color: #333; margin-bottom: 1.5rem; }
.input-row { display: flex; gap: 0.5rem; margin-bottom: 2rem; }
input { flex: 1; padding: 0.75rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem; }
button { background: #ff6b6b; color: #fff; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-size: 1.2rem; cursor: pointer; }
.lista { display: grid; gap: 1rem; }
.card { background: #fff; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.card:hover { transform: translateY(-4px); }
h3 { color: #ff6b6b; margin-bottom: 1rem; }
ul { list-style: none; padding: 0; }
li { padding: 0.5rem 0; border-bottom: 1px solid #f0f0f0; }`
  },
  {
    id: "premium", nome: "Premium (Demo)", icone: "✨", descricao: "Glassmorphism, animações, dark mode",
    codigo: `function App() {
  const [theme, setTheme] = React.useState("dark");
  const [count, setCount] = React.useState(0);
  const [tasks, setTasks] = React.useState([{id:1,text:"Aprender React",done:true},{id:2,text:"Criar app premium",done:false}]);
  const [newTask, setNewTask] = React.useState("");
  function addTask() { if (!newTask.trim()) return; setTasks([...tasks, {id:Date.now(), text:newTask, done:false}]); setNewTask(""); }
  function toggleTask(id) { setTasks(tasks.map(t => t.id === id ? {...t, done:!t.done} : t)); }
  return (
    <div className={"app " + theme}>
      <div className="header">
        <div className="logo"><span className="emoji">✨</span><h1>Premium App</h1></div>
        <button className="theme-btn" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>{theme === "dark" ? "☀️" : "🌙"}</button>
      </div>
      <div className="card glass">
        <div className="counter">
          <span className="count">{count}</span>
          <div className="counter-btns">
            <button className="btn primary" onClick={() => setCount(count + 1)}>+</button>
            <button className="btn" onClick={() => setCount(c => Math.max(0, c - 1))}>-</button>
          </div>
        </div>
      </div>
      <div className="card glass">
        <h2>📝 Tarefas</h2>
        <div className="input-row">
          <input value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === "Enter" && addTask()} placeholder="Nova tarefa..." />
          <button className="btn primary" onClick={addTask}>Adicionar</button>
        </div>
        <ul className="tasks">{tasks.map(t => (
          <li key={t.id} className={t.done ? "task done" : "task"} onClick={() => toggleTask(t.id)}>
            <span className="check">{t.done ? "✓" : "○"}</span><span>{t.text}</span>
          </li>
        ))}</ul>
      </div>
    </div>
  );
}`,
    css: `:root { --grad: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); }
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: system-ui, sans-serif; min-height: 100vh; background: var(--grad); background-size: 400% 400%; animation: gradBG 15s ease infinite; }
@keyframes gradBG { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
.app { min-height: 100vh; padding: 24px; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; max-width: 600px; margin: 0 auto 32px; }
.logo { display: flex; align-items: center; gap: 12px; }
.emoji { font-size: 40px; animation: float 3s ease-in-out infinite; }
@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
h1 { font-size: 28px; font-weight: 800; background: var(--grad); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.theme-btn { background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2); color: #fff; width: 44px; height: 44px; border-radius: 50%; font-size: 20px; cursor: pointer; transition: all 0.3s; }
.theme-btn:hover { transform: rotate(180deg) scale(1.1); }
.card { max-width: 600px; margin: 0 auto 20px; padding: 24px; border-radius: 20px; transition: all 0.3s; }
.card.glass { background: rgba(255,255,255,0.05); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 8px 32px rgba(0,0,0,0.2); }
.light .card.glass { background: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.5); }
.card:hover { transform: translateY(-2px); }
.counter { display: flex; justify-content: space-between; align-items: center; }
.count { font-size: 72px; font-weight: 800; background: var(--grad); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.counter-btns { display: flex; flex-direction: column; gap: 8px; }
.btn { padding: 10px 18px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.05); color: #fff; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; backdrop-filter: blur(10px); }
.light .btn { background: rgba(102,126,234,0.1); color: #1a1a2e; }
.btn:hover { transform: translateY(-2px); background: rgba(255,255,255,0.15); }
.btn.primary { background: var(--grad); border: none; color: #fff; }
.btn.primary:hover { box-shadow: 0 4px 20px rgba(102,126,234,0.5); }
.btn:active { transform: scale(0.96); }
h2 { color: #fff; font-size: 20px; font-weight: 700; margin-bottom: 16px; }
.light h2 { color: #1a1a2e; }
.input-row { display: flex; gap: 8px; margin-bottom: 16px; }
input { flex: 1; padding: 12px 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.05); color: #fff; font-size: 14px; transition: all 0.2s; }
.light input { background: rgba(255,255,255,0.8); border: 1px solid rgba(102,126,234,0.2); color: #1a1a2e; }
input:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102,126,234,0.2); }
.tasks { list-style: none; }
.task { display: flex; align-items: center; gap: 12px; padding: 14px; border-radius: 12px; background: rgba(255,255,255,0.03); margin-bottom: 8px; cursor: pointer; transition: all 0.3s; }
.light .task { background: rgba(255,255,255,0.5); }
.task:hover { background: rgba(255,255,255,0.08); transform: translateX(4px); }
.check { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; background: rgba(255,255,255,0.1); color: #fff; }
.task.done .check { background: var(--grad); color: #fff; }
.task.done span:last-child { text-decoration: line-through; opacity: 0.5; }
.task span:last-child { color: #fff; flex: 1; }
.light .task span:last-child { color: #1a1a2e; }
@media (max-width: 640px) { .app { padding: 16px; } .count { font-size: 56px; } h1 { font-size: 22px; } }`
  }
];

const output = `export const CODIGO_INICIAL = \`${CODIGO_INICIAL}\`;

export const CSS_INICIAL = \`${CSS_INICIAL}\`;

export const TEMPLATES = ${JSON.stringify(TEMPLATES, null, 2)};
`;

fs.writeFileSync('src/lib/templates.js', output, 'utf8');
console.log('✅ templates.js gerado com sucesso!');
console.log('   Modelos:', TEMPLATES.length);
TEMPLATES.forEach(t => console.log('   - ' + t.icone + ' ' + t.nome));

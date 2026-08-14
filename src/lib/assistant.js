import { TEMPLATES } from "./templates.js";

export function normalizar(t){return String(t).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}

export function mensagemBoasVindas(){return{autor:"ia",texto:"Olá! 👋 Sou o assistente do DevCasa Studio.\n\n📴 Offline: modelos prontos (calculadora, receitas, tarefas, cronômetro).\n🟢 Com IA ligada (botão ⚙️ IA): crio QUALQUER app sob medida!\n\nDigite /modelos ou /ajuda."}}

const REGRAS=[
  {chaves:["calculadora","calcular","somar","matematica"],template:"calculadora"},
  {chaves:["tarefa","afazeres","todo","to do","organiz"],template:"tarefas"},
  {chaves:["cronometro","timer","temporizador","cozinhar"],template:"cronometro"},
  {chaves:["receita","culinaria","comida"],template:"receitas"}
];

export function responder(entrada){
  const t=normalizar(entrada);
  if(t.startsWith("/ajuda"))return{texto:"📖 Guia rápido:\n\n1️⃣ Peça no chat (ex.: \"app de receitas\")\n2️⃣ Clique no botão 📥\n3️⃣ Edite se quiser (Ctrl+Enter executa)\n4️⃣ 💾 Baixar HTML exporta o app\n\n/modelos - lista todos\n/limpar - limpa chat\n⚙️ IA - liga a IA gratuita"};
  if(t.startsWith("/modelos")){return{texto:"🧩 Modelos disponíveis:\n\n"+TEMPLATES.map(x=>x.icone+" "+x.nome+" — "+x.descricao).join("\n")}}
  for(const r of REGRAS){
    if(r.chaves.some(c=>t.includes(c))){
      const m=TEMPLATES.find(x=>x.id===r.template);
      return{texto:"Ótima escolha! Encontrei \""+m.nome+"\" "+m.icone+" — "+m.descricao+"\n\nClique abaixo para usar:",acao:{tipo:"inserir-template",templateId:m.id,rotulo:"📥 Usar modelo: "+m.nome}};
    }
  }
  if(/(use ?state|\bestado\b)/.test(t))return{texto:"🧠 Estado (useState) é a memória do componente.\n\nconst [valor, setValor] = React.useState(0);\n\n• valor: dado atual\n• setValor: atualiza e redesenha a tela"};
  if(/(use ?effect)/.test(t))return{texto:"⏱ useEffect roda código quando algo muda (timers, listeners...)."};
  if(/(css|estilo|visual)/.test(t))return{texto:"🎨 Edite a aba styles.css e use className no JSX."};
  if(/^(oi|ola|bom dia|boa tarde|boa noite|e ai|hey)/.test(t))return{texto:"Olá! 🏠 Peça um app ou digite /modelos."};
  return{texto:"📴 Modo offline: conheço os modelos prontos.\n\nPeça: calculadora, tarefas, cronômetro ou receitas.\n\n💡 Quer que eu crie QUALQUER app? Ligue a IA gratuita em ⚙️ IA (Mistral ou Groq, sem pagar nada)."};
}

export function extrairCodigo(texto){
  const blocos=[...String(texto).matchAll(/```(?:jsx|javascript|js)?\s*([\s\S]*?)```/gi)];
  for(const b of blocos){const c=b[1].trim();if(c.includes("function App"))return c}
  return null
}

const PROMPT_SISTEMA = "Você é engenheiro de software sênior especialista em React, ajudando em português do Brasil um usuário leigo a criar apps domésticos no DevCasa Studio. REGRAS DE CÓDIGO: (1) Um único componente: function App() { ... } sem exports; (2) NUNCA use import/require: React é variável global (React.useState, React.useEffect); (3) NUNCA chame ReactDOM.createRoot ou render: o ambiente monta o App sozinho; (4) use className para estilos; (5) para persistir dados, crie um hook usePersistente com try/catch em volta de localStorage; (6) explique em 2 a 4 frases antes do código; (7) código sempre em bloco ```jsx.";

export async function consultarAPI(config, historico) {
  const resposta = await fetch(config.apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + (config.apiKey || "")
    },
    body: JSON.stringify({
      model: config.modelo || "mistral-small-latest",
      temperature: 0.4,
      messages: [{ role: "system", content: PROMPT_SISTEMA }].concat(historico)
    })
  });
  if (!resposta.ok) {
    let detalhe = "";
    try { detalhe = (await resposta.text()).slice(0, 140); } catch (e) {}
    throw new Error("HTTP " + resposta.status + (detalhe ? " — " + detalhe : ""));
  }
  const dados = await resposta.json();
  const texto = dados && dados.choices && dados.choices[0] && dados.choices[0].message ? dados.choices[0].message.content : "";
  if (!texto) throw new Error("a API retornou vazio");
  return texto;
}

import { TEMPLATES } from "./templates.js";

export function normalizar(t){return String(t).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}

export function mensagemBoasVindas(){return{autor:"ia",texto:"Olá! 👋 Sou seu time de especialistas do DevCasa Studio:\n\n⚛️ Engenheiro React Sênior\n🎯 Engenheiro de Prompts\n🏗️ Arquiteto de Software\n\n📴 Offline: modelos prontos + dicas de prompts/arquitetura.\n🟢 Com IA ligada (⚙️): crio qualquer app com plano de arquitetura antes do código.\n\nDigite /modelos ou /ajuda."}}

const REGRAS=[
  {chaves:["calculadora","calcular","somar","matematica"],template:"calculadora"},
  {chaves:["tarefa","afazeres","todo","to do","organiz"],template:"tarefas"},
  {chaves:["cronometro","timer","temporizador","cozinhar"],template:"cronometro"},
  {chaves:["receita","culinaria","comida"],template:"receitas"}
];

const TEXTO_PROMPT = "🎯 Mini-curso de prompts para criar apps:\n\n1. PAPEL: \"aja como engenheiro React sênior\"\n2. CONTEXTO: \"é para minha família usar no celular\"\n3. TAREFA clara: \"app para controlar remédios com horários\"\n4. FORMATO: \"responda com código React completo e CSS\"\n5. RESTRIÇÕES: \"sem bibliotecas externas, simples e grande para idosos\"\n\nExemplo pronto:\n\"Aja como dev React sênior. Crie um app doméstico para controlar remédios da família: nome, horário e marcação de tomado. Código completo em um componente, com persistência.\"\n\nCom a IA online ligada (⚙️), eu já aplico isso automaticamente!";

const TEXTO_ARQ = "🏗️ Princípios de arquitetura que uso nos apps:\n\n• Um componente por responsabilidade (App orquestra, filhos exibem)\n• Estado perto de quem usa; sobe só se compartilhado\n• Estado derivado em vez de duplicado (calcule, não guarde)\n• Persistência com usePersistente (try/catch = segurança)\n• Funções pequenas e puras para regras de negócio\n• Validação de entrada antes de salvar (nunca confie no input)\n\nCom a IA online, eu entrego o PLANO de arquitetura antes do código!";

export function responder(entrada){
  const t=normalizar(entrada);
  if(t.startsWith("/ajuda"))return{texto:"📖 Guia rápido:\n\n1️⃣ Peça no chat (ex.: \"app de receitas\")\n2️⃣ Clique no botão 📥\n3️⃣ Edite se quiser (Ctrl+Enter executa)\n4️⃣ 💾 HTML ou ⚛️ React (.zip) exportam\n\n/modelos - lista todos\n/limpar - limpa chat\n⚙️ IA - liga os 3 especialistas online"};
  if(t.startsWith("/modelos")){return{texto:"🧩 Modelos disponíveis:\n\n"+TEMPLATES.map(x=>x.icone+" "+x.nome+" — "+x.descricao).join("\n")}}
  for(const r of REGRAS){
    if(r.chaves.some(c=>t.includes(c))){
      const m=TEMPLATES.find(x=>x.id===r.template);
      return{texto:"Ótima escolha! Encontrei \""+m.nome+"\" "+m.icone+" — "+m.descricao+"\n\nClique abaixo para usar:",acao:{tipo:"inserir-template",templateId:m.id,rotulo:"📥 Usar modelo: "+m.nome}};
    }
  }
  if(/(prompt|perguntar melhor|engenharia de prompt)/.test(t))return{texto:TEXTO_PROMPT};
  if(/(arquitet|estrutura do app|organizar o codigo|escalab)/.test(t))return{texto:TEXTO_ARQ};
  if(/(use ?state|\bestado\b)/.test(t))return{texto:"🧠 Estado (useState) é a memória do componente.\n\nconst [valor, setValor] = React.useState(0);\n\n• valor: dado atual\n• setValor: atualiza e redesenha a tela"};
  if(/(use ?effect)/.test(t))return{texto:"⏱ useEffect roda código quando algo muda (timers, listeners...). Sempre devolva uma função de limpeza."};
  if(/(css|estilo|visual)/.test(t))return{texto:"🎨 Edite a aba styles.css e use className no JSX. Dica de arquiteto: nomes de classe por propósito (.cartao, .lista), não por cor (.azul)."};
  if(/^(oi|ola|bom dia|boa tarde|boa noite|e ai|hey)/.test(t))return{texto:"Olá! 🏠 Peça um app, dicas de prompts (\"me ensina a fazer prompts\") ou arquitetura (\"que arquitetura uso para X?\")."};
  return{texto:"📴 Modo offline ativo.\n\nPosso agora:\n• 🧩 Modelos prontos: calculadora, tarefas, cronômetro, receitas\n• 🎯 Ensinar prompts melhores\n• 🏗️ Explicar arquitetura React\n\n💡 Para criação sob medida com plano de arquitetura, ligue a IA em ⚙️ (Mistral/Groq grátis)."};
}

export function extrairCodigo(texto){
  const blocos=[...String(texto).matchAll(/```(?:jsx|javascript|js)?\s*([\s\S]*?)```/gi)];
  for(const b of blocos){const c=b[1].trim();if(c.includes("function App"))return c}
  return null
}

const PROMPT_SISTEMA = "Você é o agente especialista do DevCasa Studio, operando com três papéis simultâneos:\n\n1) ENGENHEIRO REACT SÊNIOR (JavaScript): domina hooks (useState, useEffect, useMemo, useRef), composição de componentes, JSX, estado derivado, listas e keys, eventos, performance e acessibilidade básica.\n\n2) ENGENHEIRO DE PROMPTS: interpreta a intenção real do pedido; se ambíguo, declara suposições claras antes de codar ou faz até 2 perguntas objetivas; responde de forma estruturada e reprodutível; quando pedirem, ensina técnicas de prompt (papel, contexto, tarefa, formato, restrições, exemplos).\n\n3) ARQUITETO DE SOFTWARE: planeja antes de codar (componentes, fluxo de estado, persistência, segurança); aplica separação de responsabilidades, nomes claros, funções pequenas e tratamento de erros; explica cada decisão arquitetural em 1 frase.\n\nREGRAS DE CÓDIGO DO DEVCASA STUDIO (obrigatórias):\n- Um único componente raiz: function App() { ... } sem exports.\n- NUNCA use import/require: React é variável global (React.useState, React.useEffect...).\n- NUNCA chame ReactDOM.createRoot/render: o ambiente monta o App automaticamente.\n- Estilos via className; se criar CSS, entregue em bloco separado ```css.\n- Persistência: hook usePersistente com try/catch em volta de localStorage.\n- Segurança: sem eval/innerHTML com dados do usuário; valide entradas; parseFloat com checagem de NaN.\n- Comentários em pt-BR nas partes não óbvias.\n\nFORMATO DE RESPOSTA (sempre):\n1. 🎯 Interpretação: 1 frase do que entendeu.\n2. 🏗️ Arquitetura: 3-5 bullets (componentes, estado, persistência, segurança).\n3. 💻 Código: bloco ```jsx único e completo.\n4. 🎨 CSS (se necessário): bloco ```css.\n5. 🚀 Próximos passos: 2-3 ideias de evolução.\n\nDidático com usuário leigo: explique jargões. Responda sempre em português do Brasil.";

export async function consultarAPI(config, historico) {
  const resposta = await fetch(config.apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + (config.apiKey || "")
    },
    body: JSON.stringify({
      model: config.modelo || "mistral-small-latest",
      temperature: 0.35,
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

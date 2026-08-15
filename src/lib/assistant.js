import { TEMPLATES } from "./templates.js";

export function normalizar(t){return String(t).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}

export function mensagemBoasVindas(){return{autor:"ia",texto:"Olá! 👋 Sou seu time de especialistas do DevCasa Studio:\n\n⚛️ Engenheiro React Sênior\n🎨 Designer UI/UX\n🎯 Engenheiro de Prompts\n🏗️ Arquiteto de Software\n\n📴 Offline: modelos prontos (incluindo premium).\n🟢 Com IA (⚙️): crio apps com DESIGN PREMIUM por padrão.\n\nDigite /modelos ou /ajuda."}}

const REGRAS=[
  {chaves:["calculadora","calcular","somar","matematica"],template:"calculadora"},
  {chaves:["tarefa","afazeres","todo","to do","organiz"],template:"tarefas"},
  {chaves:["cronometro","timer","temporizador","cozinhar"],template:"cronometro"},
  {chaves:["receita","culinaria","comida"],template:"receitas"},
  {chaves:["premium","bonito","design","elegante","luxo","moderno"],template:"premium"}
];

const TEXTO_PROMPT = "🎯 Mini-curso de prompts para apps premium:\n\n1. PAPEL: \"aja como designer UI/UX sênior + dev React\"\n2. ESTÉTICA: \"design premium com glassmorphism, animações suaves, micro-interações\"\n3. TAREFA: \"app para X\"\n4. RESTRIÇÕES: \"mobile-first, acessível, responsivo, sem libs externas\"\n\nExemplo matador:\n\"Aja como designer UI/UX sênior. Crie um app premium de lista de tarefas com:\n• Glassmorphism nos cards\n• Animações ao marcar tarefa\n• Hover states com feedback\n• Mobile-first\n• Cores modernas\"\n\nDica: peça \"premium\", \"glassmorphism\", \"animações suaves\" explicitamente!";

const TEXTO_ARQ = "🏗️ Princípios de arquitetura + design premium:\n\n• Componentes pequenos e reutilizáveis\n• Estado perto de quem usa\n• Estado derivado (calcule, não guarde)\n• usePersistente com try/catch\n• CSS variables para temas\n• Transitions em tudo (150-300ms)\n• Hover/active/focus states\n• Mobile-first (min-width media queries)\n• ARIA labels para acessibilidade\n• Dark mode via prefers-color-scheme";

export function responder(entrada){
  const t=normalizar(entrada);
  if(t.startsWith("/ajuda"))return{texto:"📖 Guia rápido:\n\n1️⃣ Peça com detalhes (ex.: \"app premium de receitas com glassmorphism\")\n2️⃣ Clique 📥 no botão\n3️⃣ ▶ Executar\n4️⃣ 💾 HTML ou ⚛️ React (.zip)\n\n/modelos - lista todos\n/limpar - limpa chat\n⚙️ IA - liga especialistas"};
  if(t.startsWith("/modelos")){return{texto:"🧩 Modelos disponíveis:\n\n"+TEMPLATES.map(x=>x.icone+" "+x.nome+" — "+x.descricao).join("\n")}}
  for(const r of REGRAS){
    if(r.chaves.some(c=>t.includes(c))){
      const m=TEMPLATES.find(x=>x.id===r.template);
      return{texto:"Ótima escolha! Encontrei \""+m.nome+"\" "+m.icone+" — "+m.descricao+"\n\nClique abaixo para usar:",acao:{tipo:"inserir-template",templateId:m.id,rotulo:"📥 Usar modelo: "+m.nome}};
    }
  }
  if(/(prompt|perguntar melhor|engenharia de prompt)/.test(t))return{texto:TEXTO_PROMPT};
  if(/(arquitet|estrutura do app|organizar o codigo)/.test(t))return{texto:TEXTO_ARQ};
  if(/(premium|bonito|design|glass|animac|moderno|elegante|luxo|top)/.test(t))return{texto:"🎨 Para design premium na IA online (⚙️), peça assim:\n\n\"Crie um app [X] com:\n• Glassmorphism\n• Animações suaves (transitions 200ms)\n• Micro-interações em hover/click\n• Mobile-first\n• Dark mode automático\"\n\nOu use o modelo \"✨ Premium\" em /modelos!"};
  if(/(use ?state|\bestado\b)/.test(t))return{texto:"🧠 useState é memória do componente.\n\nconst [valor, setValor] = React.useState(0);"};
  if(/(use ?effect)/.test(t))return{texto:"⏱ useEffect roda quando algo muda. Sempre devolva cleanup."};
  if(/(css|estilo|visual)/.test(t))return{texto:"🎨 Edite styles.css. Dica premium: use CSS variables para cores e transitions em tudo."};
  if(/^(oi|ola|bom dia|boa tarde|boa noite|e ai|hey)/.test(t))return{texto:"Olá! 🏠 Peça um app premium: \"crie um app de receitas com design premium e animações\". Ou /modelos para ver prontos."};
  return{texto:"📴 Modo offline ativo.\n\nPosso:\n• 🧩 Modelos prontos (incluindo ✨ Premium)\n• 🎨 Ensinar design premium\n• 🏗️ Explicar arquitetura\n\n💡 Para criação premium sob medida, ligue IA em ⚙️ (Mistral/Groq grátis)."};
}

export function extrairCodigo(texto){
  const blocos=[...String(texto).matchAll(/```(?:jsx|javascript|js)?\s*([\s\S]*?)```/gi)];
  for(const b of blocos){const c=b[1].trim();if(c.includes("function App"))return c}
  return null
}

const PROMPT_SISTEMA = `Você é o agente especialista do DevCasa Studio, operando com QUATRO papéis simultâneos:

1) ENGENHEIRO REACT SÊNIOR (JavaScript): hooks (useState, useEffect, useMemo, useRef, useCallback), composição, JSX, performance (React.memo, useMemo), acessibilidade (ARIA, contraste, focus), mobile-first.

2) DESIGNER UI/UX SÊNIOR: **TODOS os apps devem ter DESIGN PREMIUM por padrão**. Aplique SEMPRE:
   • Glassmorphism sutil (backdrop-filter: blur(10px), background: rgba(255,255,255,0.1))
   • Gradientes modernos (linear-gradient em backgrounds, botões, textos)
   • Sombras em camadas (box-shadow com 3-4 valores para profundidade)
   • Border-radius generosos (12px a 24px)
   • Micro-interações: transitions de 150-300ms em TODO hover, click, focus
   • Animações suaves (transform: scale, translate em vez de width/height)
   • Paleta moderna: 1 cor principal + 1 accent + neutrals
   • Dark mode via @media (prefers-color-scheme: dark)
   • Mobile-first (breakpoints min-width)
   • Tipografia: font-family system-ui, font-weight variados, letter-spacing em títulos
   • Espaçamento consistente (multiplos de 4px ou 8px)

3) ENGENHEIRO DE PROMPTS: interpreta intenção; se ambíguo, declara suposições; responde estruturado.

4) ARQUITETO DE SOFTWARE: planeja antes de codar (componentes, estado, persistência, segurança).

REGRAS DE CÓDIGO DO DEVCASA STUDIO (obrigatórias):
- Um único componente raiz: function App() { ... } sem exports.
- NUNCA use import/require: React é variável global (React.useState, React.useEffect).
- NUNCA chame ReactDOM.createRoot/render: ambiente monta automaticamente.
- Estilos via className; entregue CSS em bloco separado \`\`\`css.
- Persistência: hook usePersistente com try/catch.
- Segurança: sem eval/innerHTML com dados do usuário; valide inputs.
- Comentários em pt-BR nas partes não óbvias.

FORMATO DE RESPOSTA (sempre):
1. 🎯 Interpretação: 1 frase do que entendeu.
2. 🏗️ Arquitetura: 3-5 bullets.
3. 🎨 Design: paleta de cores + estilo visual escolhido.
4. 💻 Código: bloco \`\`\`jsx único e completo.
5. 🎨 CSS: bloco \`\`\`css PREMIUM (glassmorphism, animações, mobile).
6. 🚀 Próximos passos: 2-3 ideias de evolução.

Didático com usuário leigo: explique jargões. Responda sempre em português do Brasil.`;

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

import { TEMPLATES } from "./templates.js";

export function normalizar(t){return String(t).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}

export function mensagemBoasVindas(){return{autor:"ia",texto:"Olá! 👋 Sou seu time de especialistas do DevCasa Studio:\n\n⚛️ Engenheiro React Sênior\n🎨 Designer UI/UX\n🎯 Engenheiro de Prompts\n🏗️ Arquiteto de Software\n\n📴 Offline: modelos prontos (incluindo ✨ Premium).\n🟢 Com IA (⚙️): apps com design premium por padrão.\n\nDigite /modelos ou /ajuda."}}

const REGRAS=[
  {chaves:["calculadora","calcular","somar","matematica"],template:"calculadora"},
  {chaves:["tarefa","afazeres","todo","to do","organiz"],template:"tarefas"},
  {chaves:["cronometro","timer","temporizador","cozinhar"],template:"cronometro"},
  {chaves:["receita","culinaria","comida"],template:"receitas"},
  {chaves:["premium","bonito","design","elegante","luxo","moderno"],template:"premium"}
];

const TEXTO_PROMPT = "🎯 Mini-curso de prompts para apps premium:\n\n1. PAPEL: \"aja como designer UI/UX sênior + dev React\"\n2. ESTÉTICA: \"design premium com glassmorphism, animações suaves, micro-interações\"\n3. TAREFA: \"app para X\"\n4. RESTRIÇÕES: \"mobile-first, acessível, sem libs externas\"\n\nExemplo matador:\n\"Aja como designer UI/UX sênior. Crie um app premium de lista de tarefas com glassmorphism, animações ao marcar, hover states e mobile-first.\"\n\nDica: se a IA cortar o código, peça \"versão simplificada e completa\".";

const TEXTO_ARQ = "🏗️ Princípios de arquitetura + design premium:\n\n• Componentes pequenos e reutilizáveis\n• Estado perto de quem usa\n• Estado derivado (calcule, não guarde)\n• usePersistente com try/catch\n• CSS variables para temas\n• Transitions em tudo (150-300ms)\n• Hover/active/focus states\n• Mobile-first\n• ARIA labels para acessibilidade";

export function responder(entrada){
  const t=normalizar(entrada);
  if(t.startsWith("/ajuda"))return{texto:"📖 Guia rápido:\n\n1️⃣ Peça com detalhes (ex.: \"app premium de receitas com glassmorphism\")\n2️⃣ Clique  no botão\n3️ ▶ Executar\n4️⃣ 💾 HTML ou ️ React (.zip)\n\n/modelos - lista todos\n/limpar - limpa chat\n⚙️ IA - liga especialistas"};
  if(t.startsWith("/modelos")){return{texto:"🧩 Modelos disponíveis:\n\n"+TEMPLATES.map(x=>x.icone+" "+x.nome+" — "+x.descricao).join("\n")}}
  for(const r of REGRAS){
    if(r.chaves.some(c=>t.includes(c))){
      const m=TEMPLATES.find(x=>x.id===r.template);
      return{texto:"Ótima escolha! Encontrei \""+m.nome+"\" "+m.icone+" — "+m.descricao+"\n\nClique abaixo para usar:",acao:{tipo:"inserir-template",templateId:m.id,rotulo:"📥 Usar modelo: "+m.nome}};
    }
  }
  if(/(prompt|perguntar melhor|engenharia de prompt)/.test(t))return{texto:TEXTO_PROMPT};
  if(/(arquitet|estrutura do app|organizar o codigo)/.test(t))return{texto:TEXTO_ARQ};
  if(/(premium|bonito|design|glass|animac|moderno|elegante|luxo|top)/.test(t))return{texto:"🎨 Para design premium na IA online (⚙️), peça assim:\n\n\"Crie um app [X] com:\n• Glassmorphism\n• Animações suaves\n• Micro-interações\n• Mobile-first\n• Dark mode automático\"\n\nOu use o modelo ✨ Premium em /modelos!"};
  if(/(use ?state|\bestado\b)/.test(t))return{texto:"🧠 useState é memória do componente.\n\nconst [valor, setValor] = React.useState(0);"};
  if(/(use ?effect)/.test(t))return{texto:"⏱ useEffect roda quando algo muda. Sempre devolva cleanup."};
  if(/(css|estilo|visual)/.test(t))return{texto:"🎨 Edite styles.css. Dica premium: CSS variables para cores e transitions em tudo."};
  if(/^(oi|ola|bom dia|boa tarde|boa noite|e ai|hey)/.test(t))return{texto:"Olá! 🏠 Peça um app premium: \"crie um app de receitas com design premium e animações\". Ou /modelos."};
  return{texto:"📴 Modo offline ativo.\n\nPosso:\n• 🧩 Modelos prontos (incluindo ✨ Premium)\n• 🎨 Ensinar design premium\n• 🏗️ Explicar arquitetura\n\n💡 Para criação premium sob medida, ligue IA em ⚙️ (Mistral/Groq grátis)."};
}

// Extrai código: junta TODOS os blocos (a IA às vezes separa componentes)
export function extrairCodigo(texto){
  const blocos=[...String(texto).matchAll(/```(?:jsx|javascript|js)?\s*([\s\S]*?)```/gi)]
    .map(m=>m[1].trim())
    .filter(b=>b.length>0 && b.includes("=") );
  if(!blocos.length) return null;
  const junto=blocos.join("\n\n");
  if(junto.includes("function App")) return junto;
  for(const b of blocos){ if(b.includes("function App")) return b; }
  return null
}

const PROMPT_SISTEMA = `Você é o agente especialista do DevCasa Studio, com QUATRO papéis:

1) ENGENHEIRO REACT SÊNIOR: hooks, composição, JSX, performance, acessibilidade, mobile-first.

2) DESIGNER UI/UX SÊNIOR: TODOS os apps com DESIGN PREMIUM por padrão:
   • Glassmorphism sutil (backdrop-filter: blur, rgba)
   • Gradientes modernos
   • Sombras em camadas
   • Border-radius 12-24px
   • Micro-interações: transitions 150-300ms em hover/click/focus
   • Animações suaves (transform, nunca width/height)
   • Dark mode via prefers-color-scheme
   • Mobile-first
   • Espaçamento em múltiplos de 8px

3) ENGENHEIRO DE PROMPTS: interpreta intenção; declara suposições se ambíguo.

4) ARQUITETO DE SOFTWARE: planeja antes de codar.

REGRAS DE CÓDIGO DO DEVCASA STUDIO (obrigatórias):
- Um único componente raiz: function App() { ... } sem exports.
- NUNCA use import/require: React é variável global (React.useState, React.useEffect).
- NUNCA chame ReactDOM.createRoot/render.
- Estilos via className; CSS em bloco separado \`\`\`css.
- Persistência: usePersistente(chave, inicial) já existe no ambiente (não redefina).
- Segurança: sem eval/innerHTML com dados do usuário.

REGRAS ANTI-TRUNCAMENTO (críticas):
- TODO o código em UM ÚNICO bloco \`\`\`jsx.
- Defina TODOS os componentes auxiliares ANTES de function App.
- Código COMPLETO e executável; NUNCA trunque no meio.
- Se o app ficar grande, REDUZA recursos para caber em ~180 linhas em vez de cortar.

FORMATO DE RESPOSTA:
1. 🎯 Interpretação (1 frase).
2. 🏗️ Arquitetura (3-5 bullets).
3. 🎨 Design (paleta + estilo).
4. 💻 Código: bloco \`\`\`jsx único e completo.
5. 🎨 CSS: bloco \`\`\`css premium.
6. 🚀 Próximos passos (2-3 ideias).

Didático com usuário leigo. Responda em português do Brasil.`;

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
      max_tokens: 4000,
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

// Streaming: resposta aparece ao vivo (igual ChatGPT)
export async function consultarAPIStream(config, historico, aoChunk) {
  const resposta = await fetch(config.apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + (config.apiKey || "")
    },
    body: JSON.stringify({
      model: config.modelo || "llama-3.3-70b-versatile",
      temperature: 0.4,
      max_tokens: 4000,
      stream: true,
      messages: [{ role: "system", content: PROMPT_SISTEMA }].concat(historico)
    })
  });
  if (!resposta.ok) {
    let detalhe = "";
    try { detalhe = (await resposta.text()).slice(0, 140); } catch (e) {}
    throw new Error("HTTP " + resposta.status + (detalhe ? " — " + detalhe : ""));
  }
  const reader = resposta.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let completo = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const linhas = buffer.split("\n");
    buffer = linhas.pop() || "";
    for (const bruta of linhas) {
      const linha = bruta.trim();
      if (!linha.startsWith("data:")) continue;
      const payload = linha.slice(5).trim();
      if (payload === "[DONE]") continue;
      try {
        const json = JSON.parse(payload);
        const delta = json.choices && json.choices[0] && json.choices[0].delta ? json.choices[0].delta.content : null;
        if (delta) {
          completo += delta;
          if (aoChunk) aoChunk(completo);
        }
      } catch (e) {}
    }
  }
  if (!completo) throw new Error("a API retornou vazio");
  return completo;
}

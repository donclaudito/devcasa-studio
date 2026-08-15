import { TEMPLATES } from "./templates.js";

export function normalizar(t){return String(t).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}

export function mensagemBoasVindas(){return{autor:"ia",texto:"Olá! 👋 Sou seu time de especialistas do DevCasa Studio:\n\n⚛️ Engenheiro React Sênior\n🎨 Designer UI/UX\n🎯 Engenheiro de Prompts\n🏗️ Arquiteto de Software\n\n📴 Offline: modelos prontos.\n🟢 Com IA: apps com design premium por padrão.\n\nDigite /modelos ou /ajuda."}}

const REGRAS=[
  {chaves:["calculadora","calcular","somar","matematica"],template:"calculadora"},
  {chaves:["tarefa","afazeres","todo","organiz"],template:"tarefas"},
  {chaves:["cronometro","timer","tempo","cozinhar"],template:"cronometro"},
  {chaves:["receita","culinaria","comida"],template:"receitas"},
  {chaves:["premium","bonito","design","elegante","luxo","moderno"],template:"premium"}
];

export function responder(entrada){
  const t=normalizar(entrada);
  if(t.startsWith("/ajuda"))return{texto:"📖 Guia rápido:\n\n1️ Peça com detalhes\n2️ Clique no botão de inserir\n3️⃣ ▶ Executar\n4️⃣ 💾 HTML ou ⚛️ React\n\n/modelos - lista todos\n⚙️ IA - liga especialistas"};
  if(t.startsWith("/modelos")){return{texto:"🧩 Modelos disponíveis:\n\n"+TEMPLATES.map(x=>x.icone+" "+x.nome+" — "+x.descricao).join("\n")}}
  for(const r of REGRAS){
    if(r.chaves.some(c=>t.includes(c))){
      const m=TEMPLATES.find(x=>x.id===r.template);
      return{texto:"Ótima escolha! Encontrei \""+m.nome+"\" "+m.icone+"\n\nClique abaixo para usar:",acao:{tipo:"inserir-template",templateId:m.id,rotulo:"📥 Usar modelo: "+m.nome}};
    }
  }
  if(/^(oi|ola|bom dia|boa tarde|boa noite|e ai|hey)/.test(t))return{texto:"Olá! 🏠 Peça um app premium ou digite /modelos."};
  return{texto:"📴 Modo offline ativo. Para criação sob medida, ligue a IA em ⚙️."};
}

export function extrairCodigo(texto) {
  try {
    const t = String(texto || "");
    let codigoJSX = null;
    let codigoCSS = null;

    const cssMatch = t.match(/```css\s*([\s\S]*?)```/i);
    if (cssMatch && cssMatch[1]) {
      codigoCSS = cssMatch[1].trim();
    }

    const codeMatches = [...t.matchAll(/```(?:jsx|javascript|js)?\s*([\s\S]*?)```/gi)];
    for (const match of codeMatches) {
      const conteudo = match[1] ? match[1].trim() : "";
      if (!conteudo) continue;
      if (conteudo.includes("function App") || conteudo.includes("const App") || conteudo.includes("React.")) {
        codigoJSX = conteudo;
        break;
      }
    }

    if (!codigoJSX && codeMatches.length > 0) {
      for (const match of codeMatches) {
        const conteudo = match[1] ? match[1].trim() : "";
        if (conteudo && !conteudo.startsWith(".") && !conteudo.startsWith(":root")) {
          codigoJSX = conteudo;
          break;
        }
      }
    }

    if (!codigoJSX) return null;
    return { codigo: codigoJSX, css: codigoCSS };
  } catch (e) {
    console.warn("extrairCodigo falhou:", e);
    return null;
  }
}

const PROMPT_SISTEMA = `Você é o agente especialista do DevCasa Studio, com QUATRO papéis:

1) ENGENHEIRO REACT SÊNIOR: hooks, composição, JSX, performance.

2) DESIGNER UI/UX SÊNIOR: TODO app deve ter DESIGN PREMIUM, sem exceção:
   • Fundo com gradiente moderno (ex: linear-gradient(135deg, #667eea 0%, #764ba2 100%))
   • Cartões com glassmorphism sutil (backdrop-filter: blur, fundos rgba, bordas claras)
   • Border-radius 12-24px e sombras em camadas
   • Micro-interações: hover com translateY(-2px) e transitions 0.2s-0.3s
   • Títulos com font-weight 700/800 e bom contraste
   • Espaçamento generoso em múltiplos de 8px
   • Botões com gradiente e efeito hover caprichado
   • SEMPRE escreva o CSS completo e caprichado, nunca mínimo.

3) ENGENHEIRO DE PROMPTS: interpreta a intenção do usuário leigo.

4) ARQUITETO DE SOFTWARE: código organizado e completo.

REGRAS DE CÓDIGO (obrigatórias):
- Um único componente raiz: function App() { ... } sem exports.
- NUNCA use import/require: React é variável global (React.useState).
- NUNCA chame ReactDOM.createRoot/render.
- Estilos via className; CSS em bloco separado \`\`\`css.
- Código COMPLETO, nunca truncado. Se ficar grande, reduza recursos em vez de cortar.

FORMATO DE RESPOSTA:
1. 🎯 Interpretação (1 frase).
2. 💻 Código: bloco \`\`\`jsx único e completo.
3. 🎨 CSS: bloco \`\`\`css PREMIUM completo (NUNCA pule esta etapa!).
4. 🚀 Próximos passos (2 ideias curtas).

Responda em português do Brasil.`;

export async function consultarAPIStream(config, historico, aoChunk) {
  const resposta = await fetch(config.apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + (config.apiKey || "") },
    body: JSON.stringify({
      model: config.modelo || "qwen-2.5-coder-32b",
      temperature: 0.4,
      max_tokens: 4000,
      stream: true,
      messages: [{ role: "system", content: PROMPT_SISTEMA }].concat(historico)
    })
  });
  if (!resposta.ok) throw new Error("HTTP " + resposta.status);
  const reader = resposta.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "", completo = "";
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
        if (delta) { completo += delta; if (aoChunk) aoChunk(completo); }
      } catch (e) {}
    }
  }
  if (!completo) throw new Error("a API retornou vazio");
  return completo;
}

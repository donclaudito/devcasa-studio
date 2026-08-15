import JSZip from "jszip";

export function slugNome(t) {
  return String(t).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "meu-app";
}

// Imports automáticos: React.useState -> useState + import { useState } from "react"
export function codigoExportavel(codigo) {
  const hooks = ["useState", "useEffect", "useMemo", "useRef", "useCallback"];
  let novo = String(codigo || "");
  const usados = hooks.filter(h => novo.indexOf("React." + h) !== -1);
  novo = novo.replace(/React\.(useState|useEffect|useMemo|useRef|useCallback)/g, "$1");
  const imports = [];
  if (usados.length) imports.push("import { " + usados.join(", ") + " } from \"react\";");
  if (/React\./.test(novo)) imports.push("import React from \"react\";");
  return (imports.length ? imports.join("\n") + "\n\n" : "") + novo + "\n\nexport default App;\n";
}

const BAT = `@echo off
title Instalador automatico - DevCasa Studio
echo ================================================
echo    Instalador automatico do seu app React
echo ================================================
where node >nul 2>nul
if %errorlevel% neq 0 (
  echo [AVISO] Node.js nao encontrado.
  echo Tentando instalar automaticamente via winget...
  winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
  echo.
  echo Quando terminar, feche esta janela, abra de novo
  echo e clique duas vezes neste arquivo outra vez.
  pause
  exit /b
)
echo [1/3] Node.js encontrado:
node -v
echo [2/3] Instalando dependencias (aguarde ~1 min)...
call npm install
echo [3/3] Subindo o app na porta 3000... o navegador vai abrir sozinho.
start "" cmd /c "ping -n 5 127.0.0.1 >nul & start http://localhost:3000"
call npm run dev
pause
`;

const SH = `#!/bin/sh
echo "Instalador do app React (DevCasa Studio)"
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js nao encontrado. Instale em https://nodejs.org e rode ./instalar_e_rodar.sh de novo."
  exit 1
fi
echo "[1/2] Instalando dependencias..."
npm install
echo "[2/2] Subindo o app em http://localhost:3000"
npm run dev
`;

export async function baixarProjetoReact(projeto) {
  const nome = slugNome(projeto.nome);
  const zip = new JSZip();
  const raiz = zip.folder(nome + "-react");

  raiz.file("package.json", JSON.stringify({
    name: nome,
    private: true,
    version: "1.0.0",
    type: "module",
    scripts: { dev: "vite", build: "vite build", preview: "vite preview" },
    dependencies: { react: "^18.3.1", "react-dom": "^18.3.1" },
    devDependencies: { "@vitejs/plugin-react": "^4.3.1", vite: "^5.4.8" }
  }, null, 2));

  raiz.file("vite.config.js", "import { defineConfig } from \"vite\";\nimport react from \"@vitejs/plugin-react\";\n\nexport default defineConfig({\n  plugins: [react()],\n  server: { port: 3000 }\n});\n");

  raiz.file("index.html", "<!DOCTYPE html>\n<html lang=\"pt-BR\">\n  <head>\n    <meta charset=\"UTF-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <title>" + projeto.nome + "</title>\n  </head>\n  <body>\n    <div id=\"root\"></div>\n    <script type=\"module\" src=\"/src/main.jsx\"></script>\n  </body>\n</html>\n");

  raiz.file("src/main.jsx", "import { createRoot } from \"react-dom/client\";\nimport App from \"./App.jsx\";\nimport \"./styles.css\";\n\ncreateRoot(document.getElementById(\"root\")).render(<App />);\n");

  raiz.file("src/App.jsx", codigoExportavel(projeto.codigo));
  raiz.file("src/styles.css", projeto.css || "");
  raiz.file("INSTALAR_E_RODAR.bat", BAT);
  raiz.file("instalar_e_rodar.sh", SH);
  raiz.file("README.md", "# " + projeto.nome + "\n\nApp criado no DevCasa Studio (projeto React + Vite).\n\n## Jeito automatico (Windows)\n\nClique duas vezes em INSTALAR_E_RODAR.bat\n\n## Jeito manual\n\n1. npm install\n2. npm run dev\n3. Abra http://localhost:3000  (porta fixa deste app)\n\nO DevCasa Studio continua na porta 5173 - sem conflito.\n");

  const blob = await zip.generateAsync({ type: "blob" });
  const u = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = u;
  a.download = nome + "-react.zip";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(u), 5000);
}

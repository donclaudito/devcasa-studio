import { useEffect, useRef } from "react";
import React from "react";
import { createRoot } from "react-dom/client";
import * as BabelModule from "@babel/standalone";
const Babel = BabelModule.default || BabelModule;

export default function PreviewPanel({ instantaneo }) {
  const iframeRef = useRef(null);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!instantaneo || !iframeRef.current) return;
    const iframe = iframeRef.current;
    const win = iframe.contentWindow;
    if (!win) return;
    const doc = win.document;

    const codigo = instantaneo.codigo || "";
    const ReactDOMShim = { createRoot: createRoot };

    // "require" falso: entrega o React do próprio projeto
    const requireShim = function (name) {
      if (name === "react") return React;
      if (name === "react-dom") return ReactDOMShim;
      if (name === "react-dom/client") return ReactDOMShim;
      if (name === "react/jsx-runtime") return {
        jsx: React.createElement,
        jsxs: React.createElement,
        Fragment: React.Fragment
      };
      return {};
    };

    doc.open();
    doc.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; background: #fff; }
${instantaneo.css || ""}
</style></head>
<body><div id="root"><p style="padding:16px;color:#888">⏳ Carregando…</p></div></body></html>`);
    doc.close();

    function mostrarErro(msg) {
      const el = doc.getElementById("root");
      if (el) el.innerHTML = "<pre style='color:#ff6b6b;padding:16px;white-space:pre-wrap'>⚠️ " + String(msg) + "</pre>";
    }

    // Babel converte JSX + imports/exports (qualquer formato!)
    let transformado;
    try {
      transformado = Babel.transform(codigo, {
        presets: [["react", { runtime: "classic" }]],
        plugins: ["transform-modules-commonjs"],
        sourceType: "module",
        filename: "app.jsx"
      }).code;
    } catch (e) {
      mostrarErro("Erro de sintaxe no código:\n" + e.message);
      return;
    }

    let AppComponent = null;
    try {
      const mod = { exports: {} };
      const fn = new Function(
        "React", "ReactDOM", "require", "module", "exports",
        transformado + "\n;return (typeof App !== 'undefined') ? App : (module.exports && (module.exports.default || module.exports.App)) || null;"
      );
      AppComponent = fn(React, ReactDOMShim, requireShim, mod, mod.exports);
    } catch (e) {
      mostrarErro("Erro ao executar o app:\n" + e.message);
      return;
    }

    if (!AppComponent) {
      mostrarErro("Componente 'App' não encontrado no código.");
      return;
    }

    try {
      if (rootRef.current) {
        try { rootRef.current.unmount(); } catch (e) {}
      }
      rootRef.current = createRoot(doc.getElementById("root"));
      rootRef.current.render(React.createElement(AppComponent));
    } catch (e) {
      mostrarErro("Erro ao renderizar:\n" + e.message);
    }
  }, [instantaneo]);

  return (
    <section className="painel preview">
      <header className="painel-topo">
        <span>👁️ Visualização</span>
        <span className="versao">{instantaneo ? "v" + instantaneo.versao : "—"}</span>
      </header>
      <div className="preview-corpo">
        {!instantaneo ? (
          <div className="preview-vazio">
            <p>Escreva um código e clique em <b>▶ Executar</b></p>
          </div>
        ) : (
          <iframe ref={iframeRef} title="preview" />
        )}
      </div>
    </section>
  );
}

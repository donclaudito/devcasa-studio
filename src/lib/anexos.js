// Leitura de arquivos anexados no chat (texto, imagem, PDF)
const EXTS_TEXTO = ["txt","md","csv","json","js","jsx","ts","tsx","html","css","py","sql","yml","yaml","log"];

export function lerArquivo(file) {
  return new Promise((resolve, reject) => {
    const nome = file.name;
    const ext = (nome.split(".").pop() || "").toLowerCase();
    const tipo = file.type || "";
    const ehTexto = tipo.startsWith("text/") || EXTS_TEXTO.includes(ext);
    const ehImagem = tipo.startsWith("image/");
    const ehPdf = tipo === "application/pdf" || ext === "pdf";

    if (ehTexto) {
      const r = new FileReader();
      r.onload = () => resolve({ tipo: "texto", nome, conteudo: String(r.result).slice(0, 8000) });
      r.onerror = () => reject(new Error("não foi possível ler " + nome));
      r.readAsText(file);
    } else if (ehImagem) {
      const r = new FileReader();
      r.onload = () => resolve({ tipo: "imagem", nome, dataUrl: String(r.result) });
      r.onerror = () => reject(new Error("não foi possível ler " + nome));
      r.readAsDataURL(file);
    } else if (ehPdf) {
      extrairPdf(file)
        .then(t => resolve({ tipo: "texto", nome, conteudo: t }))
        .catch(e => reject(new Error("PDF: " + e.message)));
    } else {
      reject(new Error("formato não suportado: " + nome));
    }
  });
}

async function extrairPdf(file) {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  const buf = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buf }).promise;
  let texto = "";
  const maxPag = Math.min(pdf.numPages, 15);
  for (let i = 1; i <= maxPag; i++) {
    const pag = await pdf.getPage(i);
    const tc = await pag.getTextContent();
    texto += tc.items.map(it => it.str).join(" ") + "\n";
    if (texto.length > 20000) break;
  }
  return texto.trim() || "(PDF sem texto extraível — pode ser escaneado/imagens)";
}

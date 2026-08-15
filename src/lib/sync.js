import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://asfbswsdaerdvagujloc.supabase.co";
const SUPABASE_ANON = "sb_publishable_QT2zDeLdw8Xcl5QISW9tUg_3F1-8IFm";

const supa = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: { persistSession: true, autoRefreshToken: true }
});

let _usuario = null;
const _ouvintes = new Set();

function avisar() {
  _ouvintes.forEach(fn => fn(_usuario));
}

supa.auth.getSession().then(({ data }) => {
  _usuario = data.session ? data.session.user : null;
  avisar();
});

export function aoMudarUsuario(fn) {
  _ouvintes.add(fn);
  fn(_usuario);
  return () => _ouvintes.delete(fn);
}

export function usuarioAtual() {
  return _usuario;
}

export async function loginComEmail(email, senha) {
  const { data, error } = await supa.auth.signInWithPassword({ email, password: senha });
  if (error) throw new Error(error.message);
  _usuario = data.user;
  avisar();
  return data;
}

export async function cadastrar(email, senha) {
  const { data, error } = await supa.auth.signUp({ email, password: senha });
  if (error) throw new Error(error.message);
  _usuario = data.user;
  avisar();
  return data;
}

export async function logout() {
  await supa.auth.signOut();
  _usuario = null;
  avisar();
}

export async function baixarDaNuvem() {
  if (!_usuario) return null;
  const { data, error } = await supa
    .from("projetos")
    .select("*")
    .eq("user_id", _usuario.id)
    .order("atualizado_em", { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map(p => ({
    id: p.id,
    nome: p.nome,
    codigo: p.codigo,
    css: p.css,
    atualizadoEm: p.atualizado_em
  }));
}

export async function enviarParaNuvem(projeto) {
  if (!_usuario) return;
  const linha = {
    id: projeto.id,
    user_id: _usuario.id,
    nome: projeto.nome,
    codigo: projeto.codigo,
    css: projeto.css,
    atualizado_em: projeto.atualizadoEm || Date.now()
  };
  const { error } = await supa
    .from("projetos")
    .upsert(linha, { onConflict: "id" });
  if (error) throw new Error(error.message);
}

export async function apagarDaNuvem(id) {
  if (!_usuario) return;
  const { error } = await supa.from("projetos").delete().eq("id", id).eq("user_id", _usuario.id);
  if (error) throw new Error(error.message);
}
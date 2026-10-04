import { slugify } from '../lib/article-format';
import type { ArticleStyle, Block, BlockType, FontStyle, PaletteStyle } from '../lib/article-types';

interface State {
  id: string | null;
  status: 'draft' | 'published';
  slug: string;
  slugTouched: boolean;
  title: string;
  subtitle: string;
  style: ArticleStyle;
  cover: { src: string; alt: string } | null;
  blocks: Block[];
}

const root = document.getElementById('editor')!;
const initial = JSON.parse(document.getElementById('article-data')!.textContent!);
const state: State = {
  id: initial.id ?? null,
  status: initial.status ?? 'draft',
  slug: initial.slug ?? '',
  slugTouched: !!initial.slug,
  title: initial.title ?? '',
  subtitle: initial.subtitle ?? '',
  style: initial.style ?? { font: 'editorial', palette: 'marble' },
  cover: initial.cover ?? null,
  blocks: initial.blocks ?? [],
};

const uid = () => crypto.randomUUID().slice(0, 12);
const esc = (s: unknown) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const LABELS: Record<BlockType, string> = {
  heading: 'Encabezado',
  text: 'Texto',
  list: 'Lista',
  quote: 'Cita destacada',
  image: 'Imagen',
  images: 'Imágenes en fila',
  callout: 'Nota destacada',
  references: 'Referencias',
  divider: 'Separador',
};
const HINTS: Record<BlockType, string> = {
  heading: 'Divide el artículo en apartados',
  text: 'Uno o varios párrafos',
  list: 'Con viñetas o numerada',
  quote: 'Una frase importante, con autor',
  image: 'Con pie de foto y tamaño',
  images: 'Dos o tres imágenes juntas',
  callout: 'Un aviso o idea clave aparte',
  references: 'Bibliografía y enlaces de apoyo',
  divider: 'Una pausa visual',
};
const FONTS: { id: FontStyle; name: string; note: string }[] = [
  { id: 'editorial', name: 'Editorial', note: 'Titulares anchos, texto con serifa' },
  { id: 'grotesk', name: 'Grotesca', note: 'Todo en la tipografía del titular' },
  { id: 'classic', name: 'Clásica', note: 'Titulares y texto con serifa' },
];
const PALETTES: { id: PaletteStyle; name: string }[] = [
  { id: 'marble', name: 'Mármol' },
  { id: 'stone', name: 'Piedra' },
  { id: 'charcoal', name: 'Carbón' },
];

function blank(type: BlockType): Block {
  const id = uid();
  switch (type) {
    case 'heading':
      return { id, type, level: 2, text: '' };
    case 'text':
      return { id, type, text: '' };
    case 'list':
      return { id, type, ordered: false, items: [] };
    case 'quote':
      return { id, type, text: '', cite: '' };
    case 'image':
      return { id, type, src: '', alt: '', caption: '', size: 'text' };
    case 'images':
      return { id, type, images: [{ src: '', alt: '' }, { src: '', alt: '' }], caption: '' };
    case 'callout':
      return { id, type, title: '', text: '' };
    case 'references':
      return { id, type, title: 'Referencias', items: [{ label: '', source: '', year: '', url: '' }] };
    case 'divider':
      return { id, type };
  }
}

/* ---------- rendering ---------- */

const field = (label: string, input: string, cls = '') => `<label class="fld ${cls}"><span>${label}</span>${input}</label>`;
const inp = (path: string, value: unknown, extra = '') =>
  `<input type="text" data-f="${path}" value="${esc(value)}" ${extra} />`;

function uploader(path: string, src: string, alt: string, altPath: string) {
  return `
    <div class="up" data-up="${path}">
      <div class="up-box ${src ? 'has' : ''}">
        ${src ? `<img src="${esc(src)}" alt="" />` : `<span>Arrastra una imagen o elige un archivo</span>`}
      </div>
      <div class="up-side">
        <label class="btn btn-ghost">
          ${src ? 'Cambiar imagen' : 'Subir imagen'}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" data-upload="${path}" hidden />
        </label>
        ${src ? `<button type="button" class="btn btn-quiet" data-act="clear-img" data-path="${path}">Quitar</button>` : ''}
        ${field('Texto alternativo (describe la imagen)', inp(altPath, alt))}
        <p class="up-msg" role="status"></p>
      </div>
    </div>`;
}

function blockBody(b: Block): string {
  switch (b.type) {
    case 'heading':
      return `<div class="row">
        ${field('Nivel', `<select data-f="level" data-num><option value="2" ${b.level === 2 ? 'selected' : ''}>Apartado</option><option value="3" ${b.level === 3 ? 'selected' : ''}>Subapartado</option></select>`, 'w-small')}
        ${field('Texto del encabezado', inp('text', b.text))}
      </div>`;
    case 'text':
      return `
        <div class="toolbar" role="toolbar" aria-label="Formato">
          <button type="button" class="btn btn-quiet" data-act="fmt" data-fmt="bold" aria-label="Negrita"><b>B</b></button>
          <button type="button" class="btn btn-quiet" data-act="fmt" data-fmt="italic" aria-label="Cursiva"><i>I</i></button>
          <button type="button" class="btn btn-quiet" data-act="fmt" data-fmt="link">Enlace</button>
          <span class="hint">Párrafos separados por una línea en blanco</span>
        </div>
        <textarea data-f="text" rows="5" aria-label="Texto" placeholder="Escribe aquí…">${esc(b.text)}</textarea>`;
    case 'list':
      return `<label class="check"><input type="checkbox" data-f="ordered" data-bool ${b.ordered ? 'checked' : ''}/> Lista numerada</label>
        ${field('Un elemento por línea', `<textarea data-f="items" data-lines rows="4">${esc(b.items.join('\n'))}</textarea>`)}`;
    case 'quote':
      return `${field('Cita', `<textarea data-f="text" rows="3">${esc(b.text)}</textarea>`)}
        ${field('Autor o fuente (opcional)', inp('cite', b.cite))}`;
    case 'image':
      return `${uploader('src', b.src, b.alt, 'alt')}
        <div class="row">
          ${field('Pie de foto (opcional)', inp('caption', b.caption))}
          ${field('Tamaño', `<select data-f="size"><option value="text" ${b.size === 'text' ? 'selected' : ''}>Ancho del texto</option><option value="wide" ${b.size === 'wide' ? 'selected' : ''}>Ancho</option><option value="full" ${b.size === 'full' ? 'selected' : ''}>Pantalla completa</option></select>`, 'w-small')}
        </div>`;
    case 'images':
      return `<div class="multi">
          ${b.images.map((im, n) => `<div class="multi-item"><div class="multi-head"><strong>Imagen ${n + 1}</strong>${b.images.length > 1 ? `<button type="button" class="btn btn-quiet" data-act="rm-image" data-n="${n}">Quitar</button>` : ''}</div>${uploader(`images.${n}.src`, im.src, im.alt, `images.${n}.alt`)}</div>`).join('')}
        </div>
        ${b.images.length < 3 ? `<button type="button" class="btn btn-ghost" data-act="add-image">Añadir otra imagen</button>` : ''}
        ${field('Pie de foto (opcional)', inp('caption', b.caption))}`;
    case 'callout':
      return `${field('Título (opcional)', inp('title', b.title))}
        ${field('Texto', `<textarea data-f="text" rows="3">${esc(b.text)}</textarea>`)}`;
    case 'references':
      return `${field('Título del apartado', inp('title', b.title))}
        <div class="refs">
          ${b.items
            .map(
              (r, n) => `<fieldset class="ref"><legend class="sr-only">Referencia ${n + 1}</legend>
              <div class="row">${field('Autor y título', inp(`items.${n}.label`, r.label))}${field('Publicación o medio', inp(`items.${n}.source`, r.source))}</div>
              <div class="row">${field('Año', inp(`items.${n}.year`, r.year), 'w-small')}${field('Enlace (opcional)', inp(`items.${n}.url`, r.url, 'inputmode="url" placeholder="https://"'))}
              <button type="button" class="btn btn-quiet" data-act="rm-ref" data-n="${n}" aria-label="Quitar referencia ${n + 1}">Quitar</button></div>
            </fieldset>`,
            )
            .join('')}
        </div>
        <button type="button" class="btn btn-ghost" data-act="add-ref">Añadir referencia</button>`;
    case 'divider':
      return `<hr class="sample-divider" /><p class="hint">Se mostrará una pequeña línea de separación.</p>`;
  }
}

function inserter(at: number, open = false) {
  return `<div class="ins ${open ? 'is-open' : ''}" data-at="${at}">
    <button type="button" class="ins-btn" data-act="toggle-ins" aria-expanded="${open}">＋ Añadir bloque</button>
    <div class="ins-menu" ${open ? '' : 'hidden'}>
      ${(Object.keys(LABELS) as BlockType[])
        .map((t) => `<button type="button" data-act="add" data-type="${t}"><strong>${LABELS[t]}</strong><span>${HINTS[t]}</span></button>`)
        .join('')}
    </div>
  </div>`;
}

function renderBlocks() {
  const list = root.querySelector('#blocks')!;
  list.innerHTML = state.blocks.length
    ? state.blocks
        .map(
          (b, i) => `${inserter(i)}
      <section class="blk" data-id="${b.id}" data-type="${b.type}" aria-label="${LABELS[b.type]} ${i + 1}">
        <header class="blk-head">
          <span class="grip" draggable="true" title="Arrastra para mover" aria-hidden="true">⠿</span>
          <h3>${LABELS[b.type]}</h3>
          <div class="blk-tools">
            <button type="button" class="btn btn-quiet" data-act="up" ${i === 0 ? 'disabled' : ''} aria-label="Subir bloque">↑</button>
            <button type="button" class="btn btn-quiet" data-act="down" ${i === state.blocks.length - 1 ? 'disabled' : ''} aria-label="Bajar bloque">↓</button>
            <button type="button" class="btn btn-quiet" data-act="dup" aria-label="Duplicar bloque">Duplicar</button>
            <button type="button" class="btn btn-quiet danger" data-act="del" aria-label="Eliminar bloque">Eliminar</button>
          </div>
        </header>
        <div class="blk-body">${blockBody(b)}</div>
      </section>`,
        )
        .join('') + inserter(state.blocks.length, true)
    : `<p class="empty">Aún no hay contenido. Elige el primer bloque:</p>${inserter(0, true)}`;
  root.querySelectorAll<HTMLTextAreaElement>('textarea').forEach(autosize);
}

function renderStylePanel() {
  const el = root.querySelector('#style')!;
  el.innerHTML = `
    <fieldset class="opts"><legend>Tipografía</legend>
      ${FONTS.map(
        (f) => `<label class="opt font-${f.id}"><input type="radio" name="font" value="${f.id}" ${state.style.font === f.id ? 'checked' : ''}/>
          <span class="aa">Aa</span><strong>${f.name}</strong><small>${f.note}</small></label>`,
      ).join('')}
    </fieldset>
    <fieldset class="opts"><legend>Paleta</legend>
      ${PALETTES.map(
        (p) => `<label class="opt pal-${p.id}"><input type="radio" name="palette" value="${p.id}" ${state.style.palette === p.id ? 'checked' : ''}/>
          <span class="sw" aria-hidden="true"></span><strong>${p.name}</strong></label>`,
      ).join('')}
    </fieldset>
    <div class="sample article" data-font="${state.style.font}" data-palette="${state.style.palette}">
      <p class="s-title">${esc(state.title) || 'Así se verá el titular'}</p>
      <p class="s-body">El texto de lectura mantiene el mismo carácter que el resto de la web.</p>
    </div>`;
}

function renderChrome() {
  const pub = state.status === 'published';
  root.querySelector('#actions')!.innerHTML = `
    <button type="button" class="btn btn-solid" data-act="save">Guardar${pub ? '' : ' borrador'}</button>
    ${pub ? '' : '<button type="button" class="btn btn-solid" data-act="publish">Publicar</button>'}
    ${pub ? '<button type="button" class="btn btn-ghost" data-act="unpublish">Volver a borrador</button>' : ''}
    <button type="button" class="btn btn-ghost" data-act="preview">Vista previa</button>
    ${pub && state.slug ? `<a class="btn btn-ghost" href="/blog/${esc(state.slug)}" target="_blank" rel="noopener">Ver publicado</a>` : ''}
    ${state.id ? '<button type="button" class="btn btn-quiet danger" data-act="delete">Eliminar artículo</button>' : ''}`;
  root.querySelector('#state')!.textContent = pub ? 'Publicado' : 'Borrador';
  (root.querySelector('#state') as HTMLElement).dataset.status = state.status;
}

function renderCover() {
  const el = root.querySelector('#cover')!;
  el.innerHTML = uploader('cover.src', state.cover?.src ?? '', state.cover?.alt ?? '', 'cover.alt');
}

/* ---------- state helpers ---------- */

let dirty = false;
const markDirty = () => {
  dirty = true;
  setMsg('Cambios sin guardar');
};
function setMsg(text: string, kind: 'info' | 'ok' | 'error' = 'info') {
  const m = root.querySelector<HTMLElement>('#msg')!;
  m.textContent = text;
  m.dataset.kind = kind;
}

function setPath(obj: any, path: string, value: unknown) {
  const keys = path.split('.');
  const last = keys.pop()!;
  const target = keys.reduce((o, k) => (o[k] ??= {}), obj);
  target[last] = value;
}
const getBlock = (el: Element) => state.blocks.find((b) => b.id === el.closest<HTMLElement>('.blk')?.dataset.id);

function autosize(t: HTMLTextAreaElement) {
  t.style.height = 'auto';
  t.style.height = `${t.scrollHeight + 2}px`;
}

function move(from: number, to: number) {
  if (to < 0 || to >= state.blocks.length || from === to) return;
  const [b] = state.blocks.splice(from, 1);
  state.blocks.splice(to, 0, b);
  renderBlocks();
  markDirty();
  root.querySelector<HTMLElement>(`.blk[data-id="${b.id}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

/* ---------- images ---------- */

async function shrink(file: File): Promise<File | Blob> {
  if (file.type === 'image/gif' || file.type === 'image/avif') return file;
  try {
    const bmp = await createImageBitmap(file);
    const max = 2400;
    if (bmp.width <= max && file.size < 1_500_000) return file;
    const scale = Math.min(1, max / bmp.width);
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * scale);
    c.height = Math.round(bmp.height * scale);
    c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
    const blob: Blob | null = await new Promise((r) => c.toBlob(r, 'image/webp', 0.88));
    return blob && blob.size < file.size ? new File([blob], 'image.webp', { type: 'image/webp' }) : file;
  } catch {
    return file;
  }
}

async function upload(file: File): Promise<string> {
  const body = new FormData();
  body.append('file', await shrink(file));
  const res = await fetch('/api/admin/upload', { method: 'POST', body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'No se pudo subir la imagen');
  return data.url;
}

async function handleFile(box: HTMLElement, file: File) {
  const path = box.dataset.up!;
  const msg = box.querySelector<HTMLElement>('.up-msg')!;
  msg.textContent = 'Subiendo…';
  try {
    const url = await upload(file);
    if (path.startsWith('cover.')) {
      state.cover = { src: url, alt: state.cover?.alt ?? '' };
      renderCover();
    } else {
      const b = getBlock(box);
      if (!b) return;
      setPath(b, path, url);
      const i = state.blocks.indexOf(b);
      renderBlocks();
      root.querySelectorAll('.blk')[i]?.scrollIntoView({ block: 'nearest' });
    }
    markDirty();
  } catch (e) {
    msg.textContent = (e as Error).message;
    msg.dataset.kind = 'error';
  }
}

/* ---------- persistence ---------- */

function payload(status?: 'draft' | 'published') {
  return {
    title: state.title,
    subtitle: state.subtitle,
    slug: state.slug,
    style: state.style,
    cover: state.cover?.src ? state.cover : null,
    blocks: state.blocks,
    ...(status ? { status } : {}),
  };
}

async function save(status?: 'draft' | 'published'): Promise<boolean> {
  if (!state.title.trim()) {
    setMsg('El título es obligatorio', 'error');
    root.querySelector<HTMLInputElement>('#title')!.focus();
    return false;
  }
  if (status === 'published') {
    const noAlt = state.blocks.some((b) => b.type === 'image' && b.src && !b.alt.trim());
    if (noAlt && !confirm('Hay imágenes sin texto alternativo. ¿Publicar igualmente?')) return false;
    if (!state.blocks.length && !confirm('El artículo no tiene contenido. ¿Publicar igualmente?')) return false;
  }
  setMsg('Guardando…');
  const res = await fetch(state.id ? `/api/admin/articles/${state.id}` : '/api/admin/articles', {
    method: state.id ? 'PUT' : 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload(status ?? (state.id ? undefined : 'draft'))),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    setMsg(data.error || 'No se pudo guardar', 'error');
    return false;
  }
  const isNew = !state.id;
  state.id = data.id;
  state.status = data.status;
  state.slug = data.slug;
  (root.querySelector('#slug') as HTMLInputElement).value = data.slug;
  if (isNew) history.replaceState(null, '', `/admin/edit/${data.id}`);
  dirty = false;
  renderChrome();
  setMsg(status === 'published' ? 'Publicado' : 'Guardado', 'ok');
  return true;
}

/* ---------- events ---------- */

root.addEventListener('input', (e) => {
  const t = e.target as HTMLInputElement & HTMLTextAreaElement & HTMLSelectElement;
  if (t.id === 'title') {
    state.title = t.value;
    if (!state.slugTouched) {
      state.slug = slugify(t.value);
      (root.querySelector('#slug') as HTMLInputElement).value = state.slug;
    }
    const s = root.querySelector('.s-title');
    if (s) s.textContent = t.value || 'Así se verá el titular';
    return markDirty();
  }
  if (t.id === 'subtitle') {
    state.subtitle = t.value;
    return markDirty();
  }
  if (t.id === 'slug') {
    state.slug = slugify(t.value);
    state.slugTouched = true;
    return markDirty();
  }
  if (t.name === 'font' || t.name === 'palette') {
    (state.style as any)[t.name] = t.value;
    const sample = root.querySelector<HTMLElement>('.sample')!;
    sample.dataset.font = state.style.font;
    sample.dataset.palette = state.style.palette;
    return markDirty();
  }
  if (t.dataset.upload) return;
  const path = t.dataset.f;
  if (!path) return;
  if (path.startsWith('cover.')) {
    state.cover = { src: state.cover?.src ?? '', alt: state.cover?.alt ?? '' };
    setPath(state.cover, path.slice(6), t.value);
    return markDirty();
  }
  const b = getBlock(t);
  if (!b) return;
  let value: unknown = t.value;
  if (t.dataset.bool !== undefined) value = t.checked;
  else if (t.dataset.num !== undefined) value = Number(t.value);
  else if (t.dataset.lines !== undefined) value = t.value.split('\n').map((l) => l.trim()).filter(Boolean);
  setPath(b, path, value);
  if (t instanceof HTMLTextAreaElement) autosize(t);
  markDirty();
});

root.addEventListener('change', (e) => {
  const t = e.target as HTMLInputElement;
  if (t.dataset.upload && t.files?.[0]) void handleFile(t.closest<HTMLElement>('.up')!, t.files[0]);
});

root.addEventListener('click', async (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-act]');
  if (!btn) return;
  const act = btn.dataset.act!;
  const blk = btn.closest<HTMLElement>('.blk');
  const i = blk ? state.blocks.findIndex((b) => b.id === blk.dataset.id) : -1;

  switch (act) {
    case 'toggle-ins': {
      const ins = btn.closest('.ins')!;
      const menu = ins.querySelector<HTMLElement>('.ins-menu')!;
      const open = menu.hidden;
      root.querySelectorAll<HTMLElement>('.ins-menu').forEach((m) => {
        if (!m.closest('.ins')!.classList.contains('is-open')) m.hidden = true;
      });
      menu.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
      if (open) menu.querySelector<HTMLElement>('button')?.focus();
      break;
    }
    case 'add': {
      const at = Number(btn.closest<HTMLElement>('.ins')!.dataset.at);
      const nb = blank(btn.dataset.type as BlockType);
      state.blocks.splice(at, 0, nb);
      renderBlocks();
      markDirty();
      const el = root.querySelector<HTMLElement>(`.blk[data-id="${nb.id}"]`)!;
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      el.querySelector<HTMLElement>('input[type=text], textarea')?.focus({ preventScroll: true });
      break;
    }
    case 'up':
      move(i, i - 1);
      break;
    case 'down':
      move(i, i + 1);
      break;
    case 'dup': {
      const copy = JSON.parse(JSON.stringify(state.blocks[i]));
      copy.id = uid();
      state.blocks.splice(i + 1, 0, copy);
      renderBlocks();
      markDirty();
      break;
    }
    case 'del':
      if (confirm('¿Eliminar este bloque?')) {
        state.blocks.splice(i, 1);
        renderBlocks();
        markDirty();
      }
      break;
    case 'clear-img': {
      const path = btn.dataset.path!;
      if (path.startsWith('cover.')) {
        state.cover = null;
        renderCover();
      } else if (i >= 0) {
        setPath(state.blocks[i], path, '');
        renderBlocks();
      }
      markDirty();
      break;
    }
    case 'add-image': {
      (state.blocks[i] as any).images.push({ src: '', alt: '' });
      renderBlocks();
      markDirty();
      break;
    }
    case 'rm-image': {
      (state.blocks[i] as any).images.splice(Number(btn.dataset.n), 1);
      renderBlocks();
      markDirty();
      break;
    }
    case 'add-ref': {
      (state.blocks[i] as any).items.push({ label: '', source: '', year: '', url: '' });
      renderBlocks();
      markDirty();
      break;
    }
    case 'rm-ref': {
      (state.blocks[i] as any).items.splice(Number(btn.dataset.n), 1);
      renderBlocks();
      markDirty();
      break;
    }
    case 'fmt': {
      const ta = blk!.querySelector<HTMLTextAreaElement>('textarea')!;
      const { selectionStart: a, selectionEnd: z, value } = ta;
      const sel = value.slice(a, z);
      let out: string;
      if (btn.dataset.fmt === 'bold') out = `**${sel || 'texto'}**`;
      else if (btn.dataset.fmt === 'italic') out = `*${sel || 'texto'}*`;
      else {
        const url = prompt('Dirección del enlace (https://…)');
        if (!url) break;
        out = `[${sel || 'texto del enlace'}](${url})`;
      }
      ta.setRangeText(out, a, z, 'end');
      ta.focus();
      ta.dispatchEvent(new Event('input', { bubbles: true }));
      break;
    }
    case 'save':
      await save();
      break;
    case 'publish':
      await save('published');
      break;
    case 'unpublish':
      await save('draft');
      break;
    case 'preview': {
      const w = window.open('', '_blank');
      if (await save()) w!.location.href = `/admin/preview/${state.id}`;
      else w?.close();
      break;
    }
    case 'delete':
      if (state.id && confirm('¿Eliminar el artículo definitivamente? No se puede deshacer.')) {
        const res = await fetch(`/api/admin/articles/${state.id}`, { method: 'DELETE' });
        if (res.ok) {
          dirty = false;
          location.href = '/admin';
        } else setMsg('No se pudo eliminar', 'error');
      }
      break;
  }
});

/* drag and drop for blocks, and image files dropped on an uploader */
let dragFrom = -1;
root.addEventListener('dragstart', (e) => {
  const grip = (e.target as HTMLElement).closest('.grip');
  if (!grip) return;
  const blk = grip.closest<HTMLElement>('.blk')!;
  dragFrom = state.blocks.findIndex((b) => b.id === blk.dataset.id);
  e.dataTransfer!.effectAllowed = 'move';
  e.dataTransfer!.setData('text/plain', String(dragFrom));
  e.dataTransfer!.setDragImage(blk, 20, 20);
  blk.classList.add('is-dragging');
});
root.addEventListener('dragend', () => {
  dragFrom = -1;
  root.querySelectorAll('.is-dragging, .drop-before, .drop-after, .is-over').forEach((n) => n.classList.remove('is-dragging', 'drop-before', 'drop-after', 'is-over'));
});
root.addEventListener('dragover', (e) => {
  const up = (e.target as HTMLElement).closest<HTMLElement>('.up');
  if (up && e.dataTransfer?.types.includes('Files')) {
    e.preventDefault();
    up.classList.add('is-over');
    return;
  }
  if (dragFrom < 0) return;
  const blk = (e.target as HTMLElement).closest<HTMLElement>('.blk');
  if (!blk) return;
  e.preventDefault();
  const r = blk.getBoundingClientRect();
  const before = e.clientY < r.top + r.height / 2;
  root.querySelectorAll('.drop-before, .drop-after').forEach((n) => n.classList.remove('drop-before', 'drop-after'));
  blk.classList.add(before ? 'drop-before' : 'drop-after');
});
root.addEventListener('dragleave', (e) => (e.target as HTMLElement).closest('.up')?.classList.remove('is-over'));
root.addEventListener('drop', (e) => {
  const up = (e.target as HTMLElement).closest<HTMLElement>('.up');
  const file = e.dataTransfer?.files?.[0];
  if (up && file) {
    e.preventDefault();
    up.classList.remove('is-over');
    void handleFile(up, file);
    return;
  }
  if (dragFrom < 0) return;
  const blk = (e.target as HTMLElement).closest<HTMLElement>('.blk');
  if (!blk) return;
  e.preventDefault();
  const to = state.blocks.findIndex((b) => b.id === blk.dataset.id);
  const r = blk.getBoundingClientRect();
  let target = e.clientY < r.top + r.height / 2 ? to : to + 1;
  if (dragFrom < target) target--;
  const from = dragFrom;
  dragFrom = -1;
  move(from, target);
});

addEventListener('beforeunload', (e) => {
  if (dirty) e.preventDefault();
});
addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
    e.preventDefault();
    void save();
  }
});

/* ---------- boot ---------- */
(root.querySelector('#title') as HTMLInputElement).value = state.title;
(root.querySelector('#subtitle') as HTMLInputElement).value = state.subtitle;
(root.querySelector('#slug') as HTMLInputElement).value = state.slug;
renderChrome();
renderStylePanel();
renderCover();
renderBlocks();

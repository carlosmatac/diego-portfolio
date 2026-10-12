import type { SiteContent } from '../lib/site-types';

/**
 * Editor for the home page content (/admin/site). The form is generated from the schema below; every input
 * carries the dotted path of the value it edits. Lists can grow, shrink and be reordered.
 */

type Field =
  | { k: 'text' | 'area' | 'lines' | 'paras'; key: string; label: string; hint?: string; small?: boolean }
  | { k: 'select'; key: string; label: string; options: () => [string, string][]; small?: boolean }
  | { k: 'row'; fields: Field[] }
  | { k: 'list'; key: string; label: string; add: string; item: Field[]; title: (v: any) => string; blank: () => any };

const root = document.getElementById('site-editor')!;
const form = root.querySelector<HTMLElement>('#form')!;
const boot = JSON.parse(document.getElementById('site-data')!.textContent!);
let state: SiteContent = boot.content;
let pending: boolean = boot.pending;
let dirty = false;
const open = new Set<string>();

const uid = () => crypto.randomUUID().slice(0, 12);
const esc = (s: unknown) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ---------- schema ---------- */

const LOGO_NAMES: Record<string, string> = {
  uc3m: 'UC3M',
  berkeley: 'UC Berkeley',
  bologna: 'Università di Bologna',
  garrigues: 'Garrigues',
  maec: 'Ministerio de Asuntos Exteriores',
  fletcher: 'The Fletcher School',
  areces: 'Fundación Ramón Areces',
  hks: 'Harvard Kennedy School',
};
const logoOptions = (): [string, string][] => [['', 'Sin logo'], ...(boot.logos as string[]).map((l): [string, string] => [l, LOGO_NAMES[l] ?? l])];
const photoOptions = (): [string, string][] => [['', 'Sin foto'], ...(boot.photos as string[]).map((p): [string, string] => [p, p])];

const DATE_HINT = 'AAAA, AAAA-MM o AAAA-MM-DD';
const blankEntry = () => ({
  id: uid(), institution: '', link: '', logo: '', photo: '', relation: '', programme: '', place: '',
  from: '', to: '', date: '', grade: '', summary: '', points: [], items: [],
});
const entryTitle = (e: any) => [e.institution || 'Nueva entrada', e.programme].filter(Boolean).join(' · ');

function entryFields(kind: 'study' | 'scholarship' | 'work'): Field[] {
  return [
    { k: 'text', key: 'institution', label: 'Institución' },
    { k: 'text', key: 'programme', label: kind === 'work' ? 'Departamento o descripción corta' : 'Programa' },
    {
      k: 'row',
      fields: [
        { k: 'text', key: 'relation', label: kind === 'work' ? 'Puesto (p. ej. Summer Legal Intern)' : 'Tipo (p. ej. Degree, Exchange year)' },
        ...(kind === 'study' ? [{ k: 'text', key: 'grade', label: 'Nota media', hint: 'p. ej. 9.13/10.00', small: true } as Field] : []),
      ],
    },
    {
      k: 'row',
      fields: [
        { k: 'text', key: 'from', label: 'Desde', hint: DATE_HINT, small: true },
        { k: 'text', key: 'to', label: 'Hasta', hint: 'Vacío = «Since…»; o «actualidad»', small: true },
        { k: 'text', key: 'date', label: 'Fecha única', hint: `Solo si no hay periodo. ${DATE_HINT}`, small: true },
      ],
    },
    {
      k: 'row',
      fields: [
        { k: 'text', key: 'place', label: kind === 'study' ? 'Lugar (solo si es distinto al de la ciudad)' : 'Lugar' },
        { k: 'text', key: 'link', label: 'Enlace (https://…)' },
      ],
    },
    {
      k: 'row',
      fields: [
        { k: 'select', key: 'logo', label: 'Logo', options: logoOptions, small: true },
        ...(kind === 'work' ? [{ k: 'select', key: 'photo', label: 'Foto', options: photoOptions, small: true } as Field] : []),
      ],
    },
    { k: 'area', key: 'summary', label: 'Resumen' },
    { k: 'lines', key: 'points', label: 'Puntos', hint: 'Uno por línea' },
    ...(kind === 'study'
      ? [
          {
            k: 'list',
            key: 'items',
            label: 'Cursos',
            add: 'Añadir curso',
            title: (i: any) => i.title || 'Nuevo curso',
            blank: () => ({ id: uid(), title: '', link: '', note: '' }),
            item: [
              { k: 'text', key: 'title', label: 'Título del curso' },
              { k: 'text', key: 'link', label: 'Enlace (https://…)' },
              { k: 'area', key: 'note', label: 'Nota (profesor, de qué trata)' },
            ],
          } as Field,
        ]
      : []),
  ];
}

const SECTIONS: { id: string; title: string; note?: string; fields: Field[] }[] = [
  {
    id: 'profile',
    title: 'Perfil',
    fields: [
      { k: 'area', key: 'profile.title', label: 'Frase principal (el titular grande)' },
      {
        k: 'list',
        key: 'profile.facts',
        label: 'Datos rápidos (columna izquierda)',
        add: 'Añadir dato',
        title: (f) => f.label || 'Nuevo dato',
        blank: () => ({ label: '', value: '' }),
        item: [{ k: 'row', fields: [{ k: 'text', key: 'label', label: 'Etiqueta (p. ej. Now)', small: true }, { k: 'text', key: 'value', label: 'Texto' }] }],
      },
      { k: 'paras', key: 'profile.paragraphs', label: 'Texto', hint: 'Párrafos separados por una línea en blanco' },
    ],
  },
  {
    id: 'studies',
    title: 'Estudios',
    note: 'Cada ciudad es una hoja del bloque de estudios, en este orden.',
    fields: [
      { k: 'text', key: 'studies.lede', label: 'Entradilla' },
      {
        k: 'list',
        key: 'studies.stages',
        label: 'Ciudades',
        add: 'Añadir ciudad',
        title: (s) => s.city || 'Nueva ciudad',
        blank: () => ({ id: uid(), city: '', place: '', photo: '', entries: [blankEntry()] }),
        item: [
          {
            k: 'row',
            fields: [
              { k: 'text', key: 'city', label: 'Ciudad (el título grande)', small: true },
              { k: 'text', key: 'place', label: 'Lugar completo (p. ej. Bruges, Belgium)' },
              { k: 'select', key: 'photo', label: 'Foto', options: photoOptions, small: true },
            ],
          },
          { k: 'list', key: 'entries', label: 'Instituciones', add: 'Añadir institución', title: entryTitle, blank: blankEntry, item: entryFields('study') },
        ],
      },
    ],
  },
  {
    id: 'scholarships',
    title: 'Becas',
    fields: [
      { k: 'list', key: 'studies.scholarships', label: 'Becas', add: 'Añadir beca', title: entryTitle, blank: blankEntry, item: entryFields('scholarship') },
    ],
  },
  {
    id: 'work',
    title: 'Experiencia: trabajo',
    fields: [
      { k: 'text', key: 'experience.lede', label: 'Entradilla de Experiencia' },
      { k: 'list', key: 'experience.work', label: 'Trabajos', add: 'Añadir trabajo', title: entryTitle, blank: blankEntry, item: entryFields('work') },
    ],
  },
  {
    id: 'leadership',
    title: 'Experiencia: liderazgo',
    fields: [
      { k: 'list', key: 'experience.leadership', label: 'Liderazgo y actividades', add: 'Añadir actividad', title: entryTitle, blank: blankEntry, item: entryFields('work') },
    ],
  },
  {
    id: 'auge',
    title: 'AUGE',
    fields: [
      { k: 'paras', key: 'auge.purpose', label: 'Para qué sirve', hint: 'Párrafos separados por una línea en blanco' },
      { k: 'lines', key: 'auge.role', label: 'Mi papel', hint: 'Uno por línea' },
      { k: 'lines', key: 'auge.format', label: 'Cómo funciona', hint: 'Uno por línea' },
      {
        k: 'list',
        key: 'auge.initiatives',
        label: 'Sesiones',
        add: 'Añadir sesión',
        title: (i) => [i.date, i.title || 'Nueva sesión'].filter(Boolean).join(' · '),
        blank: () => ({ id: uid(), date: '', link: '', title: '', note: '' }),
        item: [
          { k: 'row', fields: [{ k: 'text', key: 'date', label: 'Fecha', hint: DATE_HINT, small: true }, { k: 'text', key: 'title', label: 'Título' }] },
          { k: 'text', key: 'link', label: 'Enlace (https://…)' },
          { k: 'area', key: 'note', label: 'Nota' },
        ],
      },
      { k: 'paras', key: 'auge.outcome', label: 'Qué salió de ello', hint: 'Párrafos separados por una línea en blanco' },
    ],
  },
  {
    id: 'contact',
    title: 'Contacto',
    fields: [
      { k: 'area', key: 'contact.text', label: 'Texto' },
      {
        k: 'row',
        fields: [
          { k: 'text', key: 'contact.email', label: 'Email' },
          { k: 'text', key: 'contact.linkedin', label: 'Enlace de LinkedIn (https://…)' },
          { k: 'text', key: 'contact.linkedinText', label: 'Texto del enlace de LinkedIn' },
        ],
      },
    ],
  },
];

/* ---------- state helpers ---------- */

const get = (path: string): any => path.split('.').reduce((o: any, k) => o?.[k], state);
function set(path: string, value: unknown) {
  const keys = path.split('.');
  const last = keys.pop()!;
  keys.reduce((o: any, k) => o[k], state)[last] = value;
}
const join = (base: string, key: string) => (base ? `${base}.${key}` : key);
/** Open/closed memory for list items: by id when there is one, so it survives reordering. */
const itemKey = (listPath: string, i: number, it: any) => (it?.id ? `${listPath.split('.').pop()}#${it.id}` : `${listPath}.${i}`);

function setMsg(text: string, kind: 'info' | 'ok' | 'error' = 'info') {
  const m = root.querySelector<HTMLElement>('#msg')!;
  m.textContent = text;
  m.dataset.kind = kind;
}
function renderState() {
  const s = root.querySelector<HTMLElement>('#state')!;
  s.textContent = pending ? 'Cambios sin publicar' : 'Publicado';
  s.dataset.status = pending ? 'draft' : 'published';
}
const markDirty = () => {
  dirty = true;
  pending = true;
  renderState();
  setMsg('Cambios sin guardar');
};

function autosize(t: HTMLTextAreaElement) {
  t.style.height = 'auto';
  t.style.height = `${t.scrollHeight + 2}px`;
}

/* ---------- rendering ---------- */

const fieldValue = (f: Field & { key: string }, v: any) =>
  f.k === 'lines' ? (v ?? []).join('\n') : f.k === 'paras' ? (v ?? []).join('\n\n') : (v ?? '');

function renderField(f: Field, base: string): string {
  if (f.k === 'row') return `<div class="row">${f.fields.map((x) => renderField(x, base)).join('')}</div>`;
  if (f.k === 'list') return renderList(f, join(base, f.key));
  const path = join(base, f.key);
  const v = get(path);
  const cls = `fld${f.small ? ' w-small' : ''}`;
  const hint = 'hint' in f && f.hint ? `<small class="fld-hint">${esc(f.hint)}</small>` : '';
  let input: string;
  if (f.k === 'select') {
    input = `<select data-path="${path}">${f.options().map(([val, label]) => `<option value="${esc(val)}" ${val === (v ?? '') ? 'selected' : ''}>${esc(label)}</option>`).join('')}</select>`;
  } else if (f.k === 'text') {
    input = `<input type="text" data-path="${path}" value="${esc(v)}" />`;
  } else {
    input = `<textarea data-path="${path}" data-kind="${f.k}" rows="${f.k === 'area' ? 3 : 4}">${esc(fieldValue(f, v))}</textarea>`;
  }
  return `<label class="${cls}"><span>${esc(f.label)}</span>${input}${hint}</label>`;
}

function renderList(f: Extract<Field, { k: 'list' }>, path: string): string {
  const items: any[] = get(path) ?? [];
  return `<fieldset class="se-list" data-list="${path}">
    <legend>${esc(f.label)} <span class="muted">(${items.length})</span></legend>
    ${items
      .map((it, i) => {
        const p = `${path}.${i}`;
        const key = itemKey(path, i, it);
        return `<details class="se-item" data-key="${esc(key)}" ${open.has(key) ? 'open' : ''}>
          <summary>
            <span class="se-title">${esc(f.title(it))}</span>
            <span class="se-tools">
              <button type="button" class="btn btn-quiet" data-act="up" data-list="${path}" data-i="${i}" ${i === 0 ? 'disabled' : ''} aria-label="Subir">↑</button>
              <button type="button" class="btn btn-quiet" data-act="down" data-list="${path}" data-i="${i}" ${i === items.length - 1 ? 'disabled' : ''} aria-label="Bajar">↓</button>
              <button type="button" class="btn btn-quiet danger" data-act="del" data-list="${path}" data-i="${i}">Eliminar</button>
            </span>
          </summary>
          <div class="se-body">${f.item.map((x) => renderField(x, p)).join('')}</div>
        </details>`;
      })
      .join('')}
    <button type="button" class="ins-btn" data-act="add" data-list="${path}">＋ ${esc(f.add)}</button>
  </fieldset>`;
}

/** Find the list schema for a concrete path such as studies.stages.2.entries. */
function listSchema(path: string): Extract<Field, { k: 'list' }> | undefined {
  const walk = (fields: Field[], base: string): any => {
    for (const f of fields) {
      if (f.k === 'row') {
        const r = walk(f.fields, base);
        if (r) return r;
      } else if (f.k === 'list') {
        const p = join(base, f.key);
        if (p === path) return f;
        if (path.startsWith(`${p}.`)) {
          const i = path.slice(p.length + 1).split('.')[0];
          const r = walk(f.item, `${p}.${i}`);
          if (r) return r;
        }
      }
    }
  };
  for (const s of SECTIONS) {
    const r = walk(s.fields, '');
    if (r) return r;
  }
}

function render() {
  const y = scrollY;
  form.innerHTML = SECTIONS.map(
    (s) => `<details class="se-panel" data-key="panel:${s.id}" ${open.has(`panel:${s.id}`) ? 'open' : ''}>
      <summary><h2>${esc(s.title)}</h2></summary>
      <div class="se-body">
        ${s.note ? `<p class="muted">${esc(s.note)}</p>` : ''}
        ${s.fields.map((f) => renderField(f, '')).join('')}
      </div>
    </details>`,
  ).join('');
  form.querySelectorAll<HTMLTextAreaElement>('details[open] textarea').forEach(autosize);
  scrollTo({ top: y, behavior: 'instant' });
}

/* ---------- persistence ---------- */

function showErrors(errors: string[]) {
  const box = root.querySelector<HTMLElement>('#errors')!;
  box.hidden = !errors.length;
  box.innerHTML = errors.length
    ? `<p><strong>No se ha guardado. Revisa esto:</strong></p><ul>${errors.map((e) => `<li>${esc(e)}</li>`).join('')}</ul>`
    : '';
  if (errors.length) box.scrollIntoView({ block: 'center', behavior: 'smooth' });
}

async function request(method: 'PUT' | 'POST', body: unknown): Promise<any | null> {
  const res = await fetch('/api/admin/site', { method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    showErrors(data.errors ?? ['No se pudo guardar. Inténtalo de nuevo.']);
    setMsg('No se ha guardado', 'error');
    return null;
  }
  showErrors([]);
  return data;
}

async function save(publish = false): Promise<boolean> {
  if (publish && !confirm('¿Publicar los cambios? Los verán todos los visitantes en un minuto.')) return false;
  setMsg(publish ? 'Publicando…' : 'Guardando…');
  const data = await request('PUT', { content: state, publish });
  if (!data) return false;
  state = data.content;
  pending = data.pending;
  dirty = false;
  renderState();
  render();
  setMsg(publish ? 'Publicado' : 'Borrador guardado', 'ok');
  return true;
}

async function replaceWith(action: 'discard' | 'restore', question: string) {
  if (!confirm(question)) return;
  const data = await request('POST', { action });
  if (!data) return;
  state = data.content;
  pending = data.pending;
  dirty = false;
  renderState();
  render();
  setMsg(action === 'discard' ? 'Cambios descartados' : 'Contenido original cargado en el borrador', 'ok');
}

/* ---------- events ---------- */

form.addEventListener('input', (e) => {
  const t = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  const path = t.dataset.path;
  if (!path) return;
  const kind = t.dataset.kind;
  let value: unknown = t.value;
  if (kind === 'lines') value = t.value.split('\n').map((l) => l.trim()).filter(Boolean);
  else if (kind === 'paras') value = t.value.split(/\n\s*\n/).map((l) => l.trim()).filter(Boolean);
  set(path, value);
  if (t instanceof HTMLTextAreaElement) autosize(t);
  // Keep the collapsed title of the item in step with what is typed.
  const item = t.closest<HTMLElement>('.se-item');
  if (item) {
    const list = item.parentElement!.dataset.list!;
    const i = [...item.parentElement!.querySelectorAll(':scope > .se-item')].indexOf(item);
    const f = listSchema(list);
    if (f) item.querySelector(':scope > summary .se-title')!.textContent = f.title(get(`${list}.${i}`));
  }
  markDirty();
});

form.addEventListener('toggle', (e) => {
  const d = e.target as HTMLDetailsElement;
  const key = d.dataset.key;
  if (!key) return;
  if (d.open) {
    open.add(key);
    d.querySelectorAll<HTMLTextAreaElement>(':scope > .se-body textarea').forEach(autosize);
  } else open.delete(key);
}, true);

root.addEventListener('click', async (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-act]');
  if (!btn) return;
  const act = btn.dataset.act!;
  const listPath = btn.dataset.list;
  const i = Number(btn.dataset.i);
  if (listPath) {
    e.preventDefault();
    const list: any[] = get(listPath);
    const f = listSchema(listPath)!;
    if (act === 'add') {
      const item = f.blank();
      list.push(item);
      const base = `${listPath}.${list.length - 1}`;
      open.add(itemKey(listPath, list.length - 1, item));
      // A new city comes with its first institution: open that too so it can be filled in straight away.
      for (const [k, v] of Object.entries(item)) {
        if (Array.isArray(v)) v.forEach((sub: any, j: number) => open.add(itemKey(`${base}.${k}`, j, sub)));
      }
    } else if (act === 'del') {
      if (!confirm(`¿Eliminar «${f.title(list[i])}»?`)) return;
      list.splice(i, 1);
    } else if (act === 'up' || act === 'down') {
      const j = act === 'up' ? i - 1 : i + 1;
      if (j < 0 || j >= list.length) return;
      [list[i], list[j]] = [list[j], list[i]];
    }
    render();
    markDirty();
    if (act === 'add') {
      const added = form.querySelector<HTMLElement>(`[data-list="${listPath}"] > .se-item:last-of-type`);
      added?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      added?.querySelector<HTMLElement>('input, textarea')?.focus({ preventScroll: true });
    }
    return;
  }
  switch (act) {
    case 'save':
      await save();
      break;
    case 'publish':
      await save(true);
      break;
    case 'preview': {
      const w = window.open('', '_blank');
      if (await save()) w!.location.href = '/admin/site/preview';
      else w?.close();
      break;
    }
    case 'discard':
      await replaceWith('discard', '¿Descartar los cambios sin publicar? El borrador volverá a ser lo que se ve ahora en la web.');
      break;
    case 'restore':
      await replaceWith('restore', '¿Cargar en el borrador el contenido original de la web? No se publica hasta que pulses «Publicar».');
      break;
  }
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

open.add('panel:profile');
renderState();
render();

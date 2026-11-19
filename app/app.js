// Vice City Trophy Atlas — offline tracker for the 55 GTA VI PS5 trophies.
// Plain script, no libraries. Progress, counters and notes save in localStorage.
// Written for this entry; the trophy data is app/data/trophies.json.
const KEY = 'vice-city-trophy-atlas-v1';
const $ = (id) => document.getElementById(id);

let data = null;
let state = loadState();
let kindFilter = 'all';
let gradeFilter = 'all';
let query = '';
let hideEarned = false;
let selectedId = null;

function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { earned: [], counters: {}, notes: {}, spoiler: false, night: false };
    const s = JSON.parse(raw);
    return {
      earned: Array.isArray(s.earned) ? s.earned : [],
      counters: s.counters && typeof s.counters === 'object' ? s.counters : {},
      notes: s.notes && typeof s.notes === 'object' ? s.notes : {},
      spoiler: !!s.spoiler,
      night: !!s.night,
    };
  } catch (e) {
    return { earned: [], counters: {}, notes: {}, spoiler: false, night: false };
  }
}

function save() {
  localStorage.setItem(KEY, JSON.stringify(state));
}

const earnedSet = () => new Set(state.earned);
function isEarned(t) { return state.earned.includes(t.id); }
function toggleEarned(t) {
  const i = state.earned.indexOf(t.id);
  if (i >= 0) state.earned.splice(i, 1);
  else state.earned.push(t.id);
  save();
  renderAll();
}
function counterOf(t) { return state.counters[t.id] || 0; }
function setCounter(t, v) {
  const n = Math.max(0, Math.min(t.count, Math.round(v)));
  state.counters[t.id] = n;
  save();
  renderAll();
}

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

function gradeTag(t) {
  const s = el('span', 'tag grade-' + t.grade, t.grade);
  return s;
}

function tagsFor(t) {
  const wrap = el('span', 't-tags-inline');
  wrap.append(gradeTag(t));
  if (t.hidden) wrap.append(el('span', 'tag hidden', 'hidden'));
  if (t.missable) wrap.append(el('span', 'tag missable', 'missable'));
  wrap.append(el('span', 'tag ' + (t.verified ? 'verified' : 'unknown'), t.verified ? 'verified' : 'method not yet known'));
  return wrap;
}

// Spoiler-safe: a hidden trophy that is not yet earned shows no name, description or guide.
function isMasked(t) { return state.spoiler && t.hidden && !isEarned(t); }

function filtered() {
  const q = query.trim().toLowerCase();
  return data.trophies.filter((t) => {
    if (kindFilter === 'missable' && !t.missable) return false;
    if (kindFilter === 'online') return false; // no online trophies in this list
    if (kindFilter !== 'all' && kindFilter !== 'missable' && t.kind !== kindFilter) return false;
    if (gradeFilter !== 'all' && t.grade !== gradeFilter) return false;
    if (hideEarned && isEarned(t)) return false;
    if (q) {
      const hay = (t.name + ' ' + t.description + ' ' + t.guide + ' ' + t.kind).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function fmtCount(t) {
  if (t.count == null) return null;
  if (t.countUnit === '$') return '$' + counterOf(t).toLocaleString('en-US') + ' / $' + t.count.toLocaleString('en-US');
  if (t.countUnit === '%') return counterOf(t) + '% / 100%';
  return counterOf(t) + ' / ' + t.count + ' ' + t.countUnit;
}

function renderList() {
  const list = $('list');
  list.replaceChildren();
  const items = filtered();
  if (kindFilter === 'online') {
    const li = el('li', 'empty-note');
    li.append(el('p', null, 'No online trophies — the whole list is single-player. All 55 trophies are earned offline.'));
    list.append(li);
  }
  if (!items.length && kindFilter !== 'online') {
    const li = el('li', 'empty-note');
    li.append(el('p', null, 'No trophies match these filters.'));
    list.append(li);
  }
  for (const t of items) {
    const li = el('li');
    if (isEarned(t)) li.classList.add('earned');
    if (selectedId === t.id) li.classList.add('selected');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = isEarned(t);
    box.setAttribute('aria-label', 'Earned: ' + t.name);
    box.addEventListener('change', (e) => { e.stopPropagation(); toggleEarned(t); });
    li.append(box);
    const main = el('div', 't-main');
    const name = el('div', 't-name');
    if (isMasked(t)) {
      name.append(el('span', 'hidden-name', 'Hidden trophy — earn it to reveal its name'));
    } else {
      name.textContent = t.name;
    }
    main.append(name);
    if (!isMasked(t)) {
      main.append(el('div', 't-desc', t.description));
    }
    const meta = el('div', 't-meta');
    meta.append(tagsFor(t));
    if (t.count != null) {
      const c = el('span', 't-count', fmtCount(t));
      meta.append(c);
      const ctr = el('span', 'counter');
      const minus = el('button', null, '−');
      minus.type = 'button';
      minus.setAttribute('aria-label', 'Decrease counter for ' + t.name);
      minus.addEventListener('click', (e) => { e.stopPropagation(); setCounter(t, counterOf(t) - 1); });
      const val = el('span', null, fmtCount(t));
      const plus = el('button', null, '+');
      plus.type = 'button';
      plus.setAttribute('aria-label', 'Increase counter for ' + t.name);
      plus.addEventListener('click', (e) => { e.stopPropagation(); setCounter(t, counterOf(t) + 1); });
      ctr.append(minus, val, plus);
      meta.append(ctr);
      if (counterOf(t) >= t.count) {
        meta.append(el('span', 'tag verified', 'target reached — tick it earned in-game'));
      }
    }
    main.append(meta);
    if (!isMasked(t)) {
      const g = el('div', 't-guide', t.guide.length > 180 ? t.guide.slice(0, 180).trimEnd() + '… ' : t.guide);
      if (t.guide.length > 180) g.append(el('span', 'more', 'Read the guide →'));
      main.append(g);
    }
    li.append(main);
    li.addEventListener('click', (e) => {
      // A click on the checkbox or a counter button must not re-render the
      // list mid-click: the checkbox's own change handler does the toggling.
      if (e.target.closest('input, button')) return;
      selectedId = t.id; renderAll();
    });
    list.append(li);
  }
  const shown = items.length;
  const earned = state.earned.length;
  $('countLine').textContent = 'Showing ' + shown + ' of 55 trophies · ' + earned + ' earned' +
    (kindFilter === 'online' ? ' · this list has no online trophies' : '');
}

function renderDetail() {
  const pane = $('detail');
  pane.replaceChildren();
  const t = data.trophies.find((x) => x.id === selectedId);
  if (!t) {
    pane.append(el('p', 'detail-empty', 'Pick a trophy on the left to read its guide, sources and step count.'));
    return;
  }
  if (isMasked(t)) {
    pane.append(el('h3', null, 'Hidden trophy'));
    pane.append(el('p', 'd-desc', 'This trophy is hidden on PlayStation. Its name and description stay hidden here too, until you earn it.'));
    pane.append(el('div', 'd-tags', tagsFor(t)));
    const btn = el('button', 'btn', isEarned(t) ? 'Mark as not earned' : 'Mark as earned');
    btn.type = 'button';
    btn.addEventListener('click', () => toggleEarned(t));
    const actions = el('div', 'd-actions');
    actions.append(btn);
    pane.append(actions);
    return;
  }
  pane.append(el('h3', null, t.name));
  pane.append(el('p', 'd-desc', t.description));
  const tags = el('div', 'd-tags');
  tags.append(tagsFor(t));
  pane.append(tags);
  if (t.count != null) {
    pane.append(el('p', 'd-count', 'Progress: ' + fmtCount(t)));
  }
  pane.append(el('h4', null, 'Guide'));
  pane.append(el('p', 'd-guide', t.guide));
  pane.append(el('h4', null, 'Sources'));
  const ul = el('ul', 'd-sources');
  for (const s of t.sources) {
    const li = el('li');
    const a = document.createElement('a');
    a.href = s.url;
    a.textContent = s.name;
    a.target = '_blank';
    a.rel = 'noopener';
    li.append(a);
    ul.append(li);
  }
  pane.append(ul);
  pane.append(el('h4', null, 'Your note'));
  const ta = document.createElement('textarea');
  ta.value = state.notes[t.id] || '';
  ta.placeholder = 'e.g. “found the 3rd card set in Vice Beach”';
  ta.setAttribute('aria-label', 'Note for ' + t.name);
  ta.addEventListener('input', () => { state.notes[t.id] = ta.value; save(); });
  pane.append(ta);
  const actions = el('div', 'd-actions');
  const btn = el('button', 'btn', isEarned(t) ? 'Mark as not earned' : 'Mark as earned');
  btn.type = 'button';
  btn.addEventListener('click', () => toggleEarned(t));
  actions.append(btn);
  pane.append(actions);
}

function renderNextUp() {
  const box = $('nextUp');
  box.replaceChildren();
  box.append(el('h3', null, 'Next up'));
  const order = [1, 2, 3];
  const stageNames = { 1: 'Stage 1 — Story first', 2: 'Stage 2 — 100% checklist', 3: 'Stage 3 — Character quests & cleanup' };
  const remaining = data.trophies
    .filter((t) => !isEarned(t) && t.id !== 1)
    .sort((a, b) => (a.roadmap - b.roadmap) || (a.id - b.id))
    .slice(0, 5);
  if (!remaining.length) {
    box.append(el('p', null, 'All done — the platinum is yours.'));
    return;
  }
  const ol = el('ol');
  for (const t of remaining) {
    const li = el('li');
    const a = document.createElement('a');
    a.href = '#checklist';
    a.textContent = isMasked(t) ? 'Hidden trophy' : t.name;
    a.addEventListener('click', () => { selectedId = t.id; renderAll(); });
    li.append(a);
    li.append(el('span', 'nu-stage', ' · ' + stageNames[t.roadmap] + (t.missable ? ' · missable' : '')));
    ol.append(li);
  }
  box.append(ol);
}

function renderProgress() {
  const earned = state.earned.length;
  const total = data.trophies.length;
  const pct = Math.round((earned / total) * 100);
  $('earnedCount').textContent = earned;
  $('earnedPct').textContent = pct + '%';
  $('overallFill').style.width = pct + '%';
  $('overallBar').setAttribute('aria-valuenow', String(earned));
  const byGrade = {};
  for (const t of data.trophies) {
    if (!byGrade[t.grade]) byGrade[t.grade] = [0, 0];
    byGrade[t.grade][1]++;
    if (isEarned(t)) byGrade[t.grade][0]++;
  }
  $('gradeLine').textContent = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => byGrade[g][0] + '/' + byGrade[g][1] + ' ' + g)
    .join(' · ');
}

function renderRoadmap() {
  const wrap = $('roadmapStages');
  wrap.replaceChildren();
  const stages = [
    { n: 1, title: 'Stage 1 — Story first', meta: '60–80 hours · 15 trophies', blurb: 'Play the story through to the end. These 15 trophies unlock on the way, and the one missable trophy lives here.' },
    { n: 2, title: 'Stage 2 — The 100% checklist', meta: 'about 100 hours · 25 trophies', blurb: 'After the story, work the 100% checklist: stunts, shooting ranges, drone races, races, card sets, WAiNK scans, vehicles, challenges, robberies, gang operations, garages and money.' },
    { n: 3, title: 'Stage 3 — Character quests & cleanup', meta: 'about 10 hours · 15 trophies', blurb: 'Finish the stranger questlines (Andy, Kenton, Billy, Randy, Tyrone, Bret), the last stranger strands, and the five trophies whose method is still unknown.' },
  ];
  for (const s of stages) {
    const items = data.trophies.filter((t) => t.roadmap === s.n);
    const done = items.filter((t) => isEarned(t)).length;
    const card = el('div', 'stage');
    card.append(el('h3', null, s.title));
    card.append(el('p', 'stage-meta', s.meta + ' · ' + done + '/' + items.length + ' earned'));
    card.append(el('p', null, s.blurb));
    const ul = el('ul');
    for (const t of items) {
      const li = el('li');
      if (isEarned(t)) li.classList.add('earned');
      const a = document.createElement('a');
      a.href = '#checklist';
      a.textContent = (isEarned(t) ? '✓ ' : '') + (isMasked(t) ? 'Hidden trophy' : t.name);
      a.addEventListener('click', () => { selectedId = t.id; renderAll(); });
      li.append(a);
      if (t.missable) li.append(el('span', 'tag missable', 'missable'));
      if (!t.verified) li.append(el('span', 'tag unknown', 'method not yet known'));
      ul.append(li);
    }
    card.append(ul);
    const bar = el('div', 'stage-bar');
    bar.append(el('div', 'fill'));
    bar.firstChild.style.width = Math.round((done / items.length) * 100) + '%';
    card.append(bar);
    wrap.append(card);
  }
}

function renderMissables() {
  const wrap = $('missableList');
  wrap.replaceChildren();
  const miss = data.trophies.filter((t) => t.missable);
  for (const t of miss) {
    const card = el('div', 'missable-card');
    card.append(el('h3', null, '⚠ ' + t.name + ' — the only missable trophy'));
    card.append(el('p', null, t.description));
    card.append(el('p', null, t.guide));
    const a = document.createElement('a');
    a.href = '#checklist';
    a.textContent = 'Open it in the checklist →';
    a.addEventListener('click', () => { selectedId = t.id; renderAll(); });
    card.append(a);
    wrap.append(card);
  }
}

function renderSources() {
  const wrap = $('sourceList');
  wrap.replaceChildren();
  const byUrl = new Map();
  for (const t of data.trophies) {
    for (const s of t.sources) {
      if (!byUrl.has(s.url)) byUrl.set(s.url, { name: s.name, url: s.url, count: 0 });
      byUrl.get(s.url).count++;
    }
  }
  const ul = el('ul');
  for (const s of byUrl.values()) {
    const li = el('li');
    const a = document.createElement('a');
    a.href = s.url;
    a.textContent = s.name;
    a.target = '_blank';
    a.rel = 'noopener';
    li.append(a);
    li.append(document.createTextNode(' — cited by ' + s.count + ' of 55 trophies'));
    ul.append(li);
  }
  wrap.append(ul);
}

function renderAll() {
  renderProgress();
  renderList();
  renderDetail();
  renderNextUp();
  renderRoadmap();
  renderMissables();
  renderSources();
}

function applyTheme() {
  document.body.classList.toggle('night', !!state.night);
  $('themeToggle').textContent = state.night ? 'Paper theme' : 'Night theme';
}

function seedDemo() {
  state.earned = [2, 3, 4, 8, 9, 20, 21, 28, 31, 35, 42, 46, 54];
  state.counters = {
    14: 45, 15: 120, 17: 20, 18: 8, 19: 12, 25: 4, 28: 18, 30: 1, 32: 30,
    40: 2, 43: 5, 48: 210, 52: 120000, 53: 60000, 55: 6,
  };
  state.notes = { 28: 'Done in Chapter 1 — meditated with Lucia on the balcony, morning after Down to Earth.' };
  save();
  renderAll();
}

function exportProgress() {
  const payload = {
    app: 'vice-city-trophy-atlas',
    version: 1,
    exportedAt: new Date().toISOString(),
    earned: state.earned,
    counters: state.counters,
    notes: state.notes,
    spoiler: state.spoiler,
    night: state.night,
  };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const p = JSON.parse(reader.result);
      const validIds = new Set(data.trophies.map((t) => t.id));
      if (Array.isArray(p.earned)) state.earned = p.earned.filter((id) => validIds.has(id));
      if (p.counters && typeof p.counters === 'object') {
        for (const [k, v] of Object.entries(p.counters)) {
          const t = data.trophies.find((x) => x.id === Number(k));
          if (t && t.count != null) state.counters[t.id] = Math.max(0, Math.min(t.count, Number(v) || 0));
        }
      }
      if (p.notes && typeof p.notes === 'object') state.notes = p.notes;
      if (typeof p.spoiler === 'boolean') state.spoiler = p.spoiler;
      if (typeof p.night === 'boolean') state.night = p.night;
      save();
      applyTheme();
      $('spoilerToggle').checked = state.spoiler;
      renderAll();
      alert('Progress imported: ' + state.earned.length + ' trophies earned.');
    } catch (e) {
      alert('That file is not a valid progress export.');
    }
  };
  reader.readAsText(file);
}

function setTab(name) {
  document.querySelectorAll('.tabs a').forEach((a) => a.classList.toggle('active', a.dataset.tab === name));
  document.querySelectorAll('.tabpage').forEach((s) => s.classList.toggle('active', s.id === 'tab-' + name));
}

function bindTabs() {
  document.querySelectorAll('.tabs a').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      location.hash = '#' + a.dataset.tab;
      setTab(a.dataset.tab);
    });
  });
  window.addEventListener('hashchange', () => {
    const name = location.hash.replace('#', '') || 'checklist';
    if (['checklist', 'roadmap', 'missables', 'sources'].includes(name)) setTab(name);
  });
}

fetch('data/trophies.json')
  .then((r) => r.json())
  .then((d) => {
    data = d;
    $('spoilerToggle').checked = state.spoiler;
    applyTheme();
    bindTabs();
    setTab((location.hash || '#checklist').replace('#', ''));

    $('search').addEventListener('input', (e) => { query = e.target.value; renderList(); });
    $('kindChips').addEventListener('click', (e) => {
      const b = e.target.closest('button[data-kind]');
      if (!b) return;
      kindFilter = b.dataset.kind;
      document.querySelectorAll('#kindChips .chip').forEach((c) => c.classList.toggle('active', c === b));
      renderList();
    });
    $('gradeChips').addEventListener('click', (e) => {
      const b = e.target.closest('button[data-grade]');
      if (!b) return;
      gradeFilter = b.dataset.grade;
      document.querySelectorAll('#gradeChips .chip').forEach((c) => c.classList.toggle('active', c === b));
      renderList();
    });
    $('hideEarned').addEventListener('change', (e) => { hideEarned = e.target.checked; renderList(); });
    $('spoilerToggle').addEventListener('change', (e) => { state.spoiler = e.target.checked; save(); renderAll(); });
    $('themeToggle').addEventListener('click', () => { state.night = !state.night; save(); applyTheme(); });
    $('exportBtn').addEventListener('click', exportProgress);
    $('importBtn').addEventListener('click', () => $('importFile').click());
    $('importFile').addEventListener('change', (e) => { if (e.target.files[0]) importProgress(e.target.files[0]); e.target.value = ''; });
    $('resetBtn').addEventListener('click', () => {
      if (!confirm('Reset all progress, counters and notes? This cannot be undone.')) return;
      state.earned = [];
      state.counters = {};
      state.notes = {};
      selectedId = null;
      save();
      renderAll();
    });
    $('demoBtn').addEventListener('click', seedDemo);

    const params = new URLSearchParams(location.search);
    if (params.get('demo') === '1') seedDemo();
    else renderAll();
  })
  .catch((e) => {
    $('list').replaceChildren();
    const li = el('li', 'empty-note');
    li.append(el('p', null, 'Could not load the trophy data (data/trophies.json). ' + e.message));
    $('list').append(li);
  });

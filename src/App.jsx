import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Dither from './bg/Dither.jsx';
import FaultyTerminal from './bg/FaultyTerminal.jsx';
import Galaxy from './bg/Galaxy.jsx';
import GradientASCII from './bg/GradientASCII.jsx';
import Hyperspeed from './bg/Hyperspeed.jsx';
import LetterGlitch from './bg/LetterGlitch.jsx';

/* ---------- helpers ---------- */
const hexToArr = h => {
  const n = parseInt((h || '#000000').slice(1), 16);
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
};
const KEY = 'yz-ledwall-v2';
const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; } };
const store = v => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* ignore */ } };

/* ---------- backgrounds (React Bits) ---------- */
const r = (key, label, min, max, step) => ({ type: 'range', key, label, min, max, step });
const col = (key, label) => ({ type: 'color', key, label });
const sel = (key, label, options) => ({ type: 'select', key, label, options });
const txt = (key, label) => ({ type: 'text', key, label });
const tog = (key, label) => ({ type: 'toggle', key, label });

const BGS = {
  dither: {
    label: 'Dither', C: Dither,
    defaults: { waveColor: '#808080', backgroundColor: '#000000', ditherMode: 'bayer', colorNum: 4, pixelSize: 2, waveSpeed: 0.05, waveFrequency: 3, waveAmplitude: 0.3, contrast: 1, brightness: 0 },
    controls: [col('waveColor', 'Colore onda'), col('backgroundColor', 'Colore fondo'),
      sel('ditherMode', 'Tipo di retino', ['bayer', 'bayer4', 'bayer2', 'halftone', 'lines', 'crosshatch', 'noise']),
      r('colorNum', 'Numero di toni', 2, 8, 1), r('pixelSize', 'Dimensione pixel', 1, 10, 1),
      r('waveSpeed', 'Velocità', 0, 0.2, 0.005), r('waveFrequency', 'Frequenza', 0.5, 8, 0.1),
      r('waveAmplitude', 'Ampiezza', 0, 1, 0.01), r('contrast', 'Contrasto', 0.5, 2, 0.05), r('brightness', 'Luminosità', -0.5, 0.5, 0.01)],
    props: (s, inter) => ({ ...s, waveColor: hexToArr(s.waveColor), backgroundColor: hexToArr(s.backgroundColor), enableMouseInteraction: inter, clickRipple: inter })
  },
  faulty: {
    label: 'Faulty Terminal', C: FaultyTerminal,
    defaults: { tint: '#ffffff', glyphs: 'blocks', scale: 1.5, digitSize: 1.2, timeScale: 0.5, glitchAmount: 1, flickerAmount: 1, scanlineIntensity: 0.5, curvature: 0.1, chromaticAberration: 0, brightness: 0.6, glow: 0.5, noiseAmp: 1, vignette: 0.25 },
    controls: [col('tint', 'Colore'), sel('glyphs', 'Caratteri', ['blocks', 'dots', 'characters']),
      r('scale', 'Scala', 0.5, 4, 0.05), r('digitSize', 'Dimensione cifre', 0.5, 4, 0.05), r('timeScale', 'Velocità', 0, 2, 0.01),
      r('glitchAmount', 'Glitch', 0, 3, 0.05), r('flickerAmount', 'Sfarfallio', 0, 3, 0.05), r('noiseAmp', 'Rumore', 0, 2, 0.05),
      r('scanlineIntensity', 'Scanline', 0, 1, 0.01), r('curvature', 'Curvatura CRT', 0, 1, 0.01),
      r('chromaticAberration', 'Aberrazione cromatica', 0, 10, 0.1), r('brightness', 'Luminosità', 0.1, 2, 0.05),
      r('glow', 'Bagliore', 0, 1, 0.01), r('vignette', 'Vignettatura', 0, 1, 0.01)],
    props: (s, inter) => ({ ...s, mouseReact: inter, clickEffect: inter ? 'glitch' : 'none' })
  },
  galaxy: {
    label: 'Galaxy', C: Galaxy,
    defaults: { useColors: false, color1: '#ffffff', color2: '#8ab4ff', hueShift: 140, saturation: 0, density: 1, starSpeed: 0.5, speed: 1, glowIntensity: 0.3, twinkleIntensity: 0.3, rotationSpeed: 0.1, starSize: 1, flareIntensity: 1, layers: 4, direction: 'forward' },
    controls: [tog('useColors', 'Usa i miei colori'), col('color1', 'Colore stelle 1'), col('color2', 'Colore stelle 2'),
      r('hueShift', 'Tonalità (senza miei colori)', 0, 360, 1), r('saturation', 'Saturazione', 0, 1, 0.01),
      r('density', 'Densità', 0.3, 3, 0.05), r('starSize', 'Dimensione stelle', 0.3, 3, 0.05), r('starSpeed', 'Velocità stelle', 0, 2, 0.01),
      r('speed', 'Velocità generale', 0, 3, 0.05), r('glowIntensity', 'Bagliore', 0, 1, 0.01), r('flareIntensity', 'Riflessi', 0, 2, 0.05),
      r('twinkleIntensity', 'Scintillio', 0, 1, 0.01), r('rotationSpeed', 'Rotazione', 0, 1, 0.01), r('layers', 'Strati', 2, 8, 1),
      sel('direction', 'Direzione', ['forward', 'backward'])],
    props: (s, inter) => {
      const { useColors, color1, color2, ...rest } = s;
      return { ...rest, starColors: useColors ? [color1, color2] : undefined, transparent: true, mouseInteraction: inter, mouseRepulsion: inter, clickWarp: inter };
    }
  },
  ascii: {
    label: 'Gradient ASCII', C: GradientASCII,
    defaults: { c1: '#1e3fd8', c2: '#f6f8ff', c3: '#a5d8ff', c4: '#38bdf8', shape: 'horizon', characters: ' =+xX0S8#@', cellSize: 18, density: 0.8, speed: 1, flow: 0.5, glow: 0.2, softness: 0.5, scale: 1, gradientOpacity: 0.9, glyphOpacity: 0.85, grain: 0.08, flicker: 0.2 },
    controls: [col('c1', 'Colore 1'), col('c2', 'Colore 2'), col('c3', 'Colore 3'), col('c4', 'Colore 4'),
      sel('shape', 'Forma', ['horizon', 'pinch', 'rise', 'eclipse']), txt('characters', 'Caratteri'),
      r('cellSize', 'Dimensione caratteri', 6, 48, 1), r('density', 'Densità', 0, 1, 0.01), r('speed', 'Velocità', 0, 3, 0.05),
      r('flow', 'Flusso', 0, 1, 0.01), r('scale', 'Scala', 0.3, 3, 0.05), r('softness', 'Morbidezza', 0, 1, 0.01),
      r('glow', 'Bagliore', 0, 1, 0.01), r('flicker', 'Sfarfallio', 0, 1, 0.01), r('gradientOpacity', 'Opacità gradiente', 0, 1, 0.01),
      r('glyphOpacity', 'Opacità caratteri', 0, 1, 0.01), r('grain', 'Grana', 0, 0.4, 0.01)],
    props: (s, inter) => {
      const { c1, c2, c3, c4, ...rest } = s;
      return { ...rest, colors: [c1, c2, c3, c4], mouseInteraction: inter, clickEffect: inter ? 'wave' : 'none' };
    }
  },
  hyper: {
    label: 'Hyperspeed', C: Hyperspeed,
    defaults: { curve: 'winding', speed: 1, curvature: 1, density: 40, lanes: 3, trailLength: 1, lightSize: 1, glow: 0.6, fov: 90, dust: 100, poles: 20, reflections: 0.5, t1: '#d856bf', t2: '#6750a2', h1: '#03b3c3', h2: '#0e5ea5', pole: '#03b3c3', boosting: false },
    controls: [sel('curve', 'Strada', ['straight', 'gentle', 'winding', 'hills', 'racing', 'deep']),
      col('t1', 'Luci posteriori 1'), col('t2', 'Luci posteriori 2'), col('h1', 'Fari 1'), col('h2', 'Fari 2'), col('pole', 'Pali'),
      tog('boosting', 'Turbo sempre attivo'),
      r('speed', 'Velocità', 0, 4, 0.05), r('curvature', 'Curve', 0, 3, 0.05), r('density', 'Traffico', 5, 160, 1),
      r('lanes', 'Corsie', 1, 6, 1), r('trailLength', 'Scie', 0.2, 3, 0.05), r('lightSize', 'Dimensione luci', 0.3, 3, 0.05),
      r('glow', 'Bagliore', 0, 1.5, 0.05), r('reflections', 'Riflessi', 0, 1, 0.01), r('fov', 'Campo visivo', 40, 140, 1),
      r('dust', 'Polvere', 0, 300, 1), r('poles', 'Pali', 0, 80, 1)],
    rebuild: s => `${s.fov}|${s.lanes}`,
    props: (s, inter) => {
      const { t1, t2, h1, h2, pole, ...rest } = s;
      return { ...rest, tailColors: [t1, t2], headColors: [h1, h2], poleColors: [pole], interactive: inter };
    }
  },
  glitch: {
    label: 'Letter Glitch', C: LetterGlitch,
    defaults: { g1: '#2b4539', g2: '#61dca3', g3: '#61b3dc', baseColor: '#ffffff', characters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789', fontSize: 14, density: 0.9, glitchAmount: 0.5, speed: 1, baseOpacity: 0.16, flow: 0.5, centerFade: 0, edgeFade: 0, spacing: 0.6 },
    controls: [col('g1', 'Colore glitch 1'), col('g2', 'Colore glitch 2'), col('g3', 'Colore glitch 3'), col('baseColor', 'Colore base'),
      txt('characters', 'Caratteri'), r('fontSize', 'Dimensione lettere', 8, 48, 1), r('spacing', 'Spaziatura', 0, 2, 0.05),
      r('density', 'Densità', 0, 1, 0.01), r('glitchAmount', 'Quantità glitch', 0, 1, 0.01), r('speed', 'Velocità', 0, 3, 0.05),
      r('baseOpacity', 'Opacità base', 0, 1, 0.01), r('flow', 'Flusso', 0, 1, 0.01),
      r('centerFade', 'Sfuma al centro (sotto la scritta)', 0, 1, 0.01), r('edgeFade', 'Sfuma ai bordi', 0, 0.5, 0.01)],
    props: (s, inter) => {
      const { g1, g2, g3, ...rest } = s;
      return { ...rest, glitchColors: [g1, g2, g3], interactive: inter, clickEffect: inter ? 'tear' : 'none' };
    }
  }
};
const BG_IDS = Object.keys(BGS);

/* ---------- fonts ---------- */
const FONTS = {
  moderniz: { label: 'Moderniz', ff: "'Moderniz','Moderniz Regular','Michroma',sans-serif", fw: 400, local: ['Moderniz', 'Moderniz Regular'] },
  helvnow: { label: 'Helvetica Now', ff: "'Helvetica Now Display','HelveticaNowDisplay-Black','Helvetica Now Display Black','Helvetica Now Text','Helvetica Neue','Helvetica','Inter Tight',Arial,sans-serif", fw: 900, local: ['Helvetica Now Display', 'HelveticaNowDisplay-Black', 'Helvetica Now Display Black', 'Helvetica Now Text'] },
  michroma: { label: 'Michroma (simile a Moderniz)', ff: "'Michroma',sans-serif", fw: 400 },
  inter: { label: 'Inter Tight (simile a Helvetica)', ff: "'Inter Tight',sans-serif", fw: 900 },
  custom: { label: 'Font caricato da te', ff: "'YZ-Custom','Michroma',sans-serif", fw: 'normal' }
};
const hasLocalFont = names => {
  const c = document.createElement('canvas').getContext('2d'), s = 'YEEZIK wmWil 0123';
  for (const fb of ['monospace', 'serif']) {
    c.font = '72px ' + fb; const a = c.measureText(s).width;
    for (const n of names) { c.font = `72px '${n}', ${fb}`; if (c.measureText(s).width !== a) return true; }
  }
  return false;
};
const idb = () => new Promise((res, rej) => { try { const q = indexedDB.open('yz-ledwall', 1); q.onupgradeneeded = () => q.result.createObjectStore('kv'); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); } catch (e) { rej(e); } });
const idbSet = async (k, v) => { try { const db = await idb(); db.transaction('kv', 'readwrite').objectStore('kv').put(v, k); } catch { /* ignore */ } };
const idbGet = async k => { try { const db = await idb(); return await new Promise(res => { const q = db.transaction('kv').objectStore('kv').get(k); q.onsuccess = () => res(q.result); q.onerror = () => res(null); }); } catch { return null; } };
const addCustomFont = async buf => { try { const f = new FontFace('YZ-Custom', buf); await f.load(); document.fonts.add(f); return true; } catch { return false; } };

/* ---------- state ---------- */
const DEFAULT = {
  bg: 'dither',
  bgSettings: Object.fromEntries(BG_IDS.map(id => [id, { ...BGS[id].defaults }])),
  text: 'YEEZIK', sub: '', font: 'moderniz', size: 70, ls: 4, textColor: '#ffffff', textStyle: 'fill', glow: 0, showText: true,
  interactive: false, auto: false, autoSec: 30, autoList: BG_IDS.slice(), quality: 1
};
const initial = () => {
  const saved = load();
  if (!saved) return structuredClone(DEFAULT);
  const s = { ...structuredClone(DEFAULT), ...saved };
  s.bgSettings = Object.fromEntries(BG_IDS.map(id => [id, { ...BGS[id].defaults, ...(saved.bgSettings?.[id] || {}) }]));
  if (!BGS[s.bg]) s.bg = 'dither';
  return s;
};

/* ---------- UI bits ---------- */
function Control({ c, value, onChange }) {
  if (c.type === 'range') return (
    <label className="ctl">{c.label} <span>{Number(value).toFixed(c.step < 1 ? (c.step < 0.01 ? 3 : 2) : 0)}</span>
      <input type="range" min={c.min} max={c.max} step={c.step} value={value} onChange={e => onChange(+e.target.value)} />
    </label>);
  if (c.type === 'color') return (
    <label className="ctl color">{c.label}<input type="color" value={value} onChange={e => onChange(e.target.value)} /></label>);
  if (c.type === 'select') return (
    <label className="ctl">{c.label}<select value={value} onChange={e => onChange(e.target.value)}>{c.options.map(o => <option key={o} value={o}>{o}</option>)}</select></label>);
  if (c.type === 'text') return (
    <label className="ctl">{c.label}<input value={value} onChange={e => onChange(e.target.value)} /></label>);
  if (c.type === 'toggle') return (
    <button className={'tog' + (value ? ' on' : '')} onClick={() => onChange(!value)}>{c.label}</button>);
  return null;
}

export default function App() {
  const [S, setS] = useState(initial);
  const [panel, setPanel] = useState(false);
  const [hint, setHint] = useState(true);
  const [toast, setToast] = useState('');
  const [customName, setCustomName] = useState('');
  const [fontTick, setFontTick] = useState(0);
  const [idle, setIdle] = useState(false);
  const [vp, setVp] = useState({ w: innerWidth, h: innerHeight });
  const titleRef = useRef(null);
  const [fs, setFs] = useState(100);

  const up = useCallback(patch => setS(p => ({ ...p, ...(typeof patch === 'function' ? patch(p) : patch) })), []);
  const upBg = (k, v) => setS(p => ({ ...p, bgSettings: { ...p.bgSettings, [p.bg]: { ...p.bgSettings[p.bg], [k]: v } } }));
  useEffect(() => { store(S); }, [S]);

  const say = m => { setToast(m); clearTimeout(say.t); say.t = setTimeout(() => setToast(''), 1700); };

  /* custom font from IndexedDB */
  useEffect(() => {
    (async () => {
      const saved = await idbGet('font');
      if (saved && await addCustomFont(saved.buf || saved)) { setCustomName(saved.name || 'font'); setFontTick(t => t + 1); }
      else setS(p => p.font === 'custom' ? { ...p, font: 'michroma' } : p);
    })();
    setTimeout(() => setHint(false), 4000);
  }, []);

  /* fit text to width */
  const font = FONTS[S.font] || FONTS.michroma;
  const fit = useCallback(() => {
    const el = titleRef.current; if (!el) return;
    el.style.fontSize = '100px';
    const w = el.offsetWidth || 1, h = el.offsetHeight || 1;
    const next = Math.min(100 * (vp.w * S.size / 100) / w, 100 * (vp.h * (S.sub ? 0.48 : 0.58)) / h);
    el.style.fontSize = next + 'px';
    setFs(next);
  }, [vp, S.size, S.sub]);
  useEffect(() => { fit(); }, [fit, S.text, S.font, S.ls, fontTick]);
  useEffect(() => {
    document.fonts?.load(`${font.fw} 100px ${font.ff}`, S.text || 'Y').then(() => setFontTick(t => t + 1)).catch(() => {});
    document.fonts?.ready.then(() => setFontTick(t => t + 1));
  }, [S.font]); // eslint-disable-line

  useEffect(() => {
    const onR = () => setVp({ w: innerWidth, h: innerHeight });
    addEventListener('resize', onR); addEventListener('orientationchange', onR);
    return () => { removeEventListener('resize', onR); removeEventListener('orientationchange', onR); };
  }, []);

  /* auto-cycle */
  useEffect(() => {
    if (!S.auto) return;
    const id = setInterval(() => {
      setS(p => {
        const list = p.autoList.filter(x => BGS[x] && x !== p.bg);
        if (!list.length) return p;
        return { ...p, bg: list[Math.random() * list.length | 0] };
      });
    }, Math.max(5, S.autoSec) * 1000);
    return () => clearInterval(id);
  }, [S.auto, S.autoSec]);

  /* cursor hiding */
  useEffect(() => {
    let t;
    const act = () => { setIdle(false); clearTimeout(t); t = setTimeout(() => setIdle(true), 2200); };
    addEventListener('pointermove', act); addEventListener('pointerdown', act); act();
    return () => { removeEventListener('pointermove', act); removeEventListener('pointerdown', act); clearTimeout(t); };
  }, []);

  /* fullscreen + wake lock */
  const wl = useRef(null);
  const wake = async () => { try { if ('wakeLock' in navigator && !wl.current) { wl.current = await navigator.wakeLock.request('screen'); wl.current.addEventListener('release', () => { wl.current = null; }); } } catch { /* ignore */ } };
  const goFs = () => {
    const d = document, el = d.documentElement;
    try {
      if (d.fullscreenElement || d.webkitFullscreenElement) (d.exitFullscreen || d.webkitExitFullscreen).call(d);
      else {
        const req = el.requestFullscreen || el.webkitRequestFullscreen;
        if (!req) throw 0;
        const p = req.call(el); p?.catch?.(() => say('Schermo intero bloccato qui: apri la pagina dal suo link'));
        setPanel(false);
      }
    } catch { say('Su iPad: Condividi → “Aggiungi alla schermata Home”'); }
    wake();
  };

  /* keyboard */
  useEffect(() => {
    const onK = e => {
      if (/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
      const k = e.key.toLowerCase();
      if (k === 'h') setPanel(p => !p);
      else if (k === 'f') goFs();
      else if (k === 'a') setS(p => ({ ...p, auto: !p.auto }));
      else if (k === ' ') { e.preventDefault(); setS(p => { const l = BG_IDS.filter(x => x !== p.bg); return { ...p, bg: l[Math.random() * l.length | 0] }; }); }
      else if (/^[1-6]$/.test(k)) setS(p => ({ ...p, bg: BG_IDS[+k - 1] }));
    };
    addEventListener('keydown', onK);
    return () => removeEventListener('keydown', onK);
  }); // eslint-disable-line

  const onFont = async e => {
    const f = e.target.files[0]; if (!f) return;
    const buf = await f.arrayBuffer();
    if (await addCustomFont(buf)) {
      const name = f.name.replace(/\.\w+$/, '');
      idbSet('font', { buf, name }); setCustomName(name); up({ font: 'custom' }); setFontTick(t => t + 1); say('Font caricato ✓');
    } else say('Questo file font non si apre');
    e.target.value = '';
  };

  const fontStatus = useMemo(() => {
    if (S.font === 'custom') return customName ? ['ok', `✓ ${customName} (salvato in questo browser)`] : ['', 'Nessun font caricato'];
    if (!font.local) return ['', ''];
    return hasLocalFont(font.local)
      ? ['ok', `✓ ${font.label} trovato su questo dispositivo`]
      : ['', `${font.label} non è installato su questo dispositivo: caricalo con il pulsante (.otf/.ttf). Intanto uso ${S.font === 'moderniz' ? 'Michroma' : 'Helvetica Neue / Inter Tight'}.`];
  }, [S.font, customName, fontTick]); // eslint-disable-line

  const bgDef = BGS[S.bg];
  const bgS = S.bgSettings[S.bg];
  const BgC = bgDef.C;
  const bgKey = S.bg + (bgDef.rebuild ? '|' + bgDef.rebuild(bgS) : '');
  const dpr = Math.min(window.devicePixelRatio || 1, S.quality);

  const titleStyle = {
    fontFamily: font.ff, fontWeight: font.fw, letterSpacing: S.ls / 100 + 'em', paddingLeft: S.ls / 100 + 'em',
    color: S.textStyle === 'outline' ? 'transparent' : S.textColor,
    WebkitTextStroke: S.textStyle === 'outline' ? `${Math.max(1.5, fs * 0.012)}px ${S.textColor}` : undefined,
    mixBlendMode: S.textStyle === 'difference' ? 'difference' : undefined,
    textShadow: S.glow > 0 && S.textStyle !== 'outline' ? `0 0 ${S.glow * 0.5}px ${S.textColor}, 0 0 ${S.glow * 1.6}px ${S.textColor}` : undefined
  };

  return (
    <div className={'root' + (idle && !panel ? ' nocursor' : '')}>
      <div className="bgwrap">
        <BgC key={bgKey} {...bgDef.props(bgS, S.interactive)} dpr={dpr} />
      </div>

      <div className="stage" onClick={() => { setPanel(p => !p); setHint(false); }}>
        {S.showText && <div className="tw" style={{ mixBlendMode: S.textStyle === 'difference' ? 'difference' : undefined }}>
          <div ref={titleRef} className="title" style={titleStyle}>{S.text || ' '}</div>
          {S.sub && <div className="sub" style={{ fontFamily: font.ff, fontWeight: font.fw, color: S.textStyle === 'outline' ? S.textColor : S.textColor, fontSize: Math.max(11, fs * 0.12) }}>{S.sub}</div>}
        </div>}
      </div>

      <div className={'panel' + (panel ? '' : ' hidden')}>
        <div className="ph">
          <div className="brand">YEEZIK <b>LED WALL</b></div>
          <div className="pa"><button onClick={goFs}>⛶ Schermo intero</button><button onClick={() => setPanel(false)}>Nascondi ✕</button></div>
        </div>
        <div className="pg">
          <section>
            <h3>Sfondo · React Bits</h3>
            <div className="grid">{BG_IDS.map((id, i) => <button key={id} className={S.bg === id ? 'on' : ''} onClick={() => up({ bg: id })}><small>{i + 1}</small> {BGS[id].label}</button>)}</div>
            <div className="row" style={{ marginTop: 12 }}>
              <button className={'tog' + (S.auto ? ' on' : '')} onClick={() => up(p => ({ auto: !p.auto }))}>Cambio automatico</button>
              <select value={S.autoSec} onChange={e => up({ autoSec: +e.target.value })}>
                {[10, 20, 30, 45, 60, 120].map(s => <option key={s} value={s}>ogni {s} s</option>)}
              </select>
            </div>
            {S.auto && <div className="chips">{BG_IDS.map(id => <button key={id} className={'chip' + (S.autoList.includes(id) ? ' on' : '')}
              onClick={() => up(p => ({ autoList: p.autoList.includes(id) ? p.autoList.filter(x => x !== id) : [...p.autoList, id] }))}>{BGS[id].label}</button>)}</div>}
            <div className="row" style={{ marginTop: 6 }}>
              <button className={'tog' + (S.interactive ? ' on' : '')} onClick={() => up(p => ({ interactive: !p.interactive }))}>Interazione mouse/tocco</button>
            </div>
            <label className="ctl">Qualità (abbassala se scatta)
              <select value={S.quality} onChange={e => up({ quality: +e.target.value })}>
                <option value={0.75}>Leggera</option><option value={1}>Normale</option><option value={1.5}>Alta</option><option value={2}>Massima</option>
              </select></label>
          </section>

          <section>
            <h3>Impostazioni {bgDef.label}</h3>
            <div className="ctls">
              {bgDef.controls.map(c => <Control key={c.key} c={c} value={bgS[c.key]} onChange={v => upBg(c.key, v)} />)}
            </div>
            <button style={{ width: '100%', marginTop: 8 }} onClick={() => setS(p => ({ ...p, bgSettings: { ...p.bgSettings, [p.bg]: { ...BGS[p.bg].defaults } } }))}>Ripristina {bgDef.label}</button>
          </section>

          <section>
            <h3>Scritta</h3>
            <div className="row"><button className={'tog' + (S.showText ? ' on' : '')} onClick={() => up(p => ({ showText: !p.showText }))}>Mostra scritta</button></div>
            <label className="ctl">Testo<input value={S.text} maxLength={24} onChange={e => up({ text: e.target.value })} /></label>
            <label className="ctl">Sottotitolo<input value={S.sub} maxLength={40} placeholder="es. LIVE DJ SET" onChange={e => up({ sub: e.target.value })} /></label>
            <label className="ctl">Font<select value={S.font} onChange={e => up({ font: e.target.value })}>
              {Object.entries(FONTS).map(([id, f]) => <option key={id} value={id}>{id === 'custom' && customName ? 'Caricato: ' + customName : f.label}</option>)}
            </select></label>
            <label className="btnfile">Carica font (.otf / .ttf)<input type="file" accept=".otf,.ttf,.woff,.woff2,font/*" onChange={onFont} /></label>
            {fontStatus[1] && <div className={'note ' + fontStatus[0]}>{fontStatus[1]}</div>}
            <label className="ctl color">Colore scritta<input type="color" value={S.textColor} onChange={e => up({ textColor: e.target.value })} /></label>
            <label className="ctl">Stile<select value={S.textStyle} onChange={e => up({ textStyle: e.target.value })}>
              <option value="fill">Pieno</option><option value="outline">Solo contorno</option><option value="difference">Negativo sullo sfondo</option>
            </select></label>
            <label className="ctl">Larghezza <span>{S.size}%</span><input type="range" min={20} max={95} value={S.size} onChange={e => up({ size: +e.target.value })} /></label>
            <label className="ctl">Spaziatura lettere <span>{S.ls}</span><input type="range" min={-8} max={40} value={S.ls} onChange={e => up({ ls: +e.target.value })} /></label>
            <label className="ctl">Bagliore <span>{S.glow}</span><input type="range" min={0} max={80} value={S.glow} onChange={e => up({ glow: +e.target.value })} /></label>
            <div className="note" style={{ marginTop: 10 }}>Tastiera: <b>H</b> pannello · <b>F</b> schermo intero · <b>1–6</b> sfondi · <b>Spazio</b> sfondo a caso · <b>A</b> cambio automatico</div>
            <button style={{ width: '100%', marginTop: 10 }} onClick={() => { setS(structuredClone(DEFAULT)); say('Tutto ripristinato'); }}>Ripristina tutto</button>
          </section>
        </div>
      </div>

      {hint && <div className="hint">Tocca lo schermo per aprire i controlli</div>}
      <div className="toast" style={{ opacity: toast ? 1 : 0 }}>{toast}</div>
    </div>
  );
}

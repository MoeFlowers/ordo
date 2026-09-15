const { createApp, ref, reactive, computed, onMounted, onUnmounted, watch } = Vue;

/* ---------- Cliente Supabase ---------- */
// El "lock" pass-through evita que getSession se cuelgue en iOS/Safari
// (bug conocido del Web Locks API en algunos contextos móviles).
const supa = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY, {
    auth: { lock: async (_name, _acquireTimeout, fn) => await fn() },
});

/* ---------- Iconos ---------- */
const ICONS = {
    dashboard: '<path d="M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6v-9h-6v9Zm0-16v5h6V4h-6Z"/>',
    debts:     '<path d="M3 7h18M3 12h18M3 17h12"/><circle cx="18" cy="17" r="3"/>',
    rates:     '<path d="M3 17l6-6 4 4 8-8"/><path d="M21 7v5h-5"/>',
    plan:      '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4M8.5 15l2 2 4-4"/>',
    stats:     '<path d="M3 3v18h18"/><rect x="7" y="11" width="3" height="7"/><rect x="12" y="7" width="3" height="11"/><rect x="17" y="4" width="3" height="14"/>',
    pulse:     '<path d="M3 12h4l3 8 4-16 3 8h4"/>',
    wallet:    '<path d="M3 7a2 2 0 0 1 2-2h12v3M3 7v10a2 2 0 0 0 2 2h14V10H5a2 2 0 0 1-2-3Z"/><path d="M16 13h.01"/>',
    expenses:  '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/>',
    goal:      '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/><path d="M12 4v2M12 18v2M4 12h2M18 12h2"/>',
    menu:      '<path d="M4 6h16M4 12h16M4 18h16"/>',
    refresh:   '<path d="M21 12a9 9 0 1 1-2.64-6.36M21 4v5h-5"/>',
    edit:      '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    plus:      '<path d="M12 5v14M5 12h14"/>',
    cash:      '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
    check:     '<path d="M20 6 9 17l-5-5"/>',
    trash:     '<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>',
    close:     '<path d="M6 6l12 12M18 6 6 18"/>',
    alert:     '<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/>',
    logout:    '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    eye:       '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    'eye-off': '<path d="M3 3l18 18"/><path d="M10.6 10.6a3 3 0 0 0 4.2 4.2M9.9 4.6A9.6 9.6 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3 3.9M6.1 6.1A17 17 0 0 0 2 12s3.5 7 10 7a9.6 9.6 0 0 0 3-.5"/>',
    repeat:    '<path d="M17 2l4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
    lock:      '<rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    zap:       '<path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z"/>',
    piggy:     '<path d="M19 11c.6 0 1 .4 1 1v2c0 .6-.4 1-1 1h-.5a6 6 0 0 1-11 1.5M4 15a1 1 0 0 1-1-1v-3a5 5 0 0 1 5-5h5a4 4 0 0 1 3.9-3A3 3 0 0 0 22 6"/><path d="M9 8V6"/>',
    chevL:     '<path d="M15 18l-6-6 6-6"/>',
    chevR:     '<path d="M9 18l6-6-6-6"/>',
    minus:     '<path d="M5 12h14"/>',
    bell:      '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    clock:     '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    calendar:  '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>',
    cashea:    '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    gear:      '<circle cx="12" cy="12" r="3"/><path d="M19.4 13.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 2.9-1.2V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9Z"/>',
    user:      '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    activity:  '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    download:  '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>',
    tag:       '<path d="M20.6 13.4 12 22l-9-9V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
    calc:      '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14v4M8 18h4"/>',
    euro:      '<path d="M18 7a6.5 6.5 0 1 0 0 10"/><path d="M4 11h8M4 15h7"/>',
    cart:      '<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.4 12.4a1.6 1.6 0 0 0 1.6 1.3h8.4a1.6 1.6 0 0 0 1.6-1.3L22 7H6"/>',
    sliders:   '<path d="M4 21v-6M4 11V3M12 21v-8M12 9V3M20 21v-4M20 13V3M1 15h6M9 9h6M17 17h6"/>',
    scale:     '<path d="M12 3v18M7 8h10M5 8l-3 7a3 3 0 0 0 6 0zM19 8l-3 7a3 3 0 0 0 6 0z"/><path d="M8 21h8"/>',
};

/* ---------- Calendario propio (bonito, acorde al diseño) ---------- */
const DateField = {
    props: { modelValue: { type: String, default: '' }, placeholder: { type: String, default: 'Elegir fecha' } },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
        const open = ref(false);
        const MES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        const DOW = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
        const iso = (d) => { const p = (n) => String(n).padStart(2, '0'); return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); };
        const t0 = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
        const parse = (s) => { if (!s) return null; const d = new Date(s + 'T00:00:00'); return isNaN(d.getTime()) ? null : d; };
        const view = reactive({ y: t0().getFullYear(), m: t0().getMonth() });
        const sync = () => { const d = parse(props.modelValue) || t0(); view.y = d.getFullYear(); view.m = d.getMonth(); };
        watch(() => props.modelValue, sync);
        watch(open, (o) => { if (o) sync(); });
        const label = computed(() => { const d = parse(props.modelValue); return d ? d.toLocaleDateString('es-VE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : ''; });
        const grid = computed(() => {
            const first = new Date(view.y, view.m, 1); const start = (first.getDay() + 6) % 7;
            const ndays = new Date(view.y, view.m + 1, 0).getDate(); const cells = [];
            for (let i = 0; i < start; i++) cells.push(null);
            const today = iso(t0());
            for (let d = 1; d <= ndays; d++) { const k = iso(new Date(view.y, view.m, d)); cells.push({ d, iso: k, today: k === today, sel: props.modelValue === k }); }
            return cells;
        });
        const prevM = () => { if (view.m === 0) { view.m = 11; view.y--; } else view.m--; };
        const nextM = () => { if (view.m === 11) { view.m = 0; view.y++; } else view.m++; };
        const pick = (c) => { if (c) { emit('update:modelValue', c.iso); open.value = false; } };
        const setToday = () => { emit('update:modelValue', iso(t0())); open.value = false; };
        const clear = () => { emit('update:modelValue', ''); open.value = false; };
        const onDoc = (e) => { if (!e.target.closest('.datefield')) open.value = false; };
        onMounted(() => document.addEventListener('click', onDoc));
        onUnmounted(() => document.removeEventListener('click', onDoc));
        return { open, view, MES, DOW, label, grid, prevM, nextM, pick, setToday, clear, toggle: () => (open.value = !open.value) };
    },
    template: `
    <div class="datefield" :class="{ open }">
      <button type="button" class="df-input" @click.stop="toggle">
        <icon name="calendar"></icon>
        <span :class="{ ph: !label }">{{ label || placeholder }}</span>
      </button>
      <div v-if="open" class="df-pop" @click.stop>
        <div class="df-head">
          <button type="button" class="df-nav" @click="prevM"><icon name="chevL"></icon></button>
          <span class="df-title">{{ MES[view.m] }} {{ view.y }}</span>
          <button type="button" class="df-nav" @click="nextM"><icon name="chevR"></icon></button>
        </div>
        <div class="df-dow"><span v-for="d in DOW" :key="d">{{ d }}</span></div>
        <div class="df-grid">
          <button v-for="(c, i) in grid" :key="i" type="button" class="df-day" :class="{ empty: !c, today: c && c.today, sel: c && c.sel }" :disabled="!c" @click="pick(c)">{{ c ? c.d : '' }}</button>
        </div>
        <div class="df-foot">
          <button type="button" class="df-link" @click="setToday">Hoy</button>
          <button type="button" class="df-link" @click="clear">Borrar</button>
        </div>
      </div>
    </div>`,
};
const Icon = {
    props: { name: String },
    template: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" v-html="path"></svg>`,
    computed: { path() { return ICONS[this.name] || ''; } },
};

/* ---------- Avatares "IP como logo" (mascotas simples, 2 colores + fondo) ---------- */
/* Diseñados según la skill ip-as-logo: silueta redonda dominante, formas grandes
   suaves, dos colores de personaje + un fondo sólido, ojos simples. */
const AVATARS = {
    coin:   { label: 'Moneda',   bg: '#E7C24B', body: '<circle cx="50" cy="52" r="35" fill="#FBE6A2"/><circle cx="50" cy="52" r="35" fill="none" stroke="#C79A2B" stroke-width="6"/><circle cx="41" cy="50" r="4.6" fill="#8A6D1B"/><circle cx="59" cy="50" r="4.6" fill="#8A6D1B"/><path d="M42 62 q8 7 16 0" stroke="#8A6D1B" stroke-width="4" fill="none" stroke-linecap="round"/>' },
    piggy:  { label: 'Alcancía', bg: '#E79DB0', body: '<ellipse cx="34" cy="35" rx="9" ry="8" fill="#F7C9D6"/><ellipse cx="66" cy="35" rx="9" ry="8" fill="#F7C9D6"/><ellipse cx="50" cy="56" rx="34" ry="30" fill="#F7C9D6"/><ellipse cx="50" cy="61" rx="13" ry="10" fill="#E188A2"/><circle cx="46" cy="61" r="2.4" fill="#9B4A63"/><circle cx="54" cy="61" r="2.4" fill="#9B4A63"/><circle cx="39" cy="49" r="3.4" fill="#9B4A63"/><circle cx="61" cy="49" r="3.4" fill="#9B4A63"/>' },
    ghost:  { label: 'Fantasma', bg: '#6E6BE0', body: '<path d="M22 54 a28 28 0 0 1 56 0 v26 l-9 -7 -9 7 -9 -7 -9 7 -11 -7 z" fill="#EDECFF"/><circle cx="41" cy="50" r="5" fill="#3A379E"/><circle cx="59" cy="50" r="5" fill="#3A379E"/><path d="M45 62 q5 5 10 0" stroke="#3A379E" stroke-width="4" fill="none" stroke-linecap="round"/>' },
    robot:  { label: 'Robot',    bg: '#3E93A6', body: '<circle cx="50" cy="18" r="4.5" fill="#DCEFF3"/><rect x="47.5" y="20" width="5" height="12" fill="#DCEFF3"/><rect x="22" y="32" width="56" height="48" rx="17" fill="#DCEFF3"/><circle cx="40" cy="55" r="6" fill="#22515C"/><circle cx="60" cy="55" r="6" fill="#22515C"/><rect x="42" y="67" width="16" height="5" rx="2.5" fill="#22515C"/>' },
    cat:    { label: 'Gato',     bg: '#D9834A', body: '<circle cx="31" cy="35" r="12" fill="#F7C79C"/><circle cx="69" cy="35" r="12" fill="#F7C79C"/><circle cx="50" cy="56" r="32" fill="#F7C79C"/><circle cx="42" cy="54" r="4.6" fill="#7A3F1C"/><circle cx="58" cy="54" r="4.6" fill="#7A3F1C"/><path d="M46 64 q4 4 8 0" stroke="#7A3F1C" stroke-width="3.6" fill="none" stroke-linecap="round"/>' },
    sprout: { label: 'Brote',    bg: '#4FA45B', body: '<rect x="46" y="48" width="8" height="36" rx="4" fill="#2E7D3A"/><ellipse cx="33" cy="44" rx="18" ry="12" fill="#BFE6BF" transform="rotate(-25 33 44)"/><ellipse cx="67" cy="44" rx="18" ry="12" fill="#BFE6BF" transform="rotate(25 67 44)"/><circle cx="41" cy="45" r="3" fill="#22622B"/><circle cx="59" cy="45" r="3" fill="#22622B"/>' },
};
const Avatar = {
    props: { avatar: String, name: String, size: { type: Number, default: 40 } },
    computed: {
        mascot() { return AVATARS[this.avatar] || null; },
        initial() { const s = (this.name || '').trim(); return s ? s.charAt(0).toUpperCase() : '?'; },
        box() { const s = this.size; return { width: s + 'px', height: s + 'px', fontSize: Math.round(s * 0.42) + 'px', background: this.mascot ? this.mascot.bg : 'linear-gradient(135deg, var(--accent), var(--accent-dim))' }; },
    },
    template: `<span class="ava" :style="box"><svg v-if="mascot" viewBox="0 0 100 100" v-html="mascot.body"></svg><span v-else>{{ initial }}</span></span>`,
};

const RATES_API = 'https://ve.dolarapi.com/v1/dolares';
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Número que cuenta hacia arriba ---------- */
const CountUp = {
    props: { value: { type: Number, default: 0 }, dec: { type: Number, default: 2 }, duration: { type: Number, default: 750 } },
    setup(props) {
        const shown = ref(props.value || 0);
        let raf = null;
        const fmtN = (n) => (Number(n) || 0).toLocaleString('es-VE', { minimumFractionDigits: props.dec, maximumFractionDigits: props.dec });
        function animateTo(target) {
            target = Number(target) || 0;
            if (reduceMotion) { shown.value = target; return; }
            cancelAnimationFrame(raf);
            const from = shown.value; let start = null;
            const step = (t) => {
                if (start === null) start = t;
                const p = Math.min(1, (t - start) / props.duration);
                const e = 1 - Math.pow(1 - p, 3); // easeOutCubic
                shown.value = from + (target - from) * e;
                if (p < 1) raf = requestAnimationFrame(step);
                else shown.value = target;
            };
            raf = requestAnimationFrame(step);
        }
        watch(() => props.value, (v) => animateTo(v));
        onMounted(() => { shown.value = 0; animateTo(props.value); });
        return () => fmtN(shown.value);
    },
};

/* ---------- Directiva de arrastrar y soltar (SortableJS) ---------- */
const sortableDir = {
    mounted(el, binding) {
        if (!window.Sortable) return;
        el._sortable = window.Sortable.create(el, {
            group: 'deudas', animation: 160, forceFallback: true, fallbackOnBody: true, fallbackTolerance: 5,
            ghostClass: 'drag-ghost', chosenClass: 'drag-chosen', dragClass: 'drag-active',
            onEnd: (evt) => { if (typeof binding.value === 'function') binding.value(evt); },
        });
    },
    unmounted(el) { if (el._sortable) el._sortable.destroy(); },
};

createApp({
    components: { Icon, CountUp, DateField, Avatar },
    setup() {
        /* ---------- Sesión ---------- */
        const ready = ref(false);
        const user = ref(null);
        const authMode = ref('login');
        const authEmail = ref('');
        const authPassword = ref('');
        const authError = ref('');
        const authNotice = ref('');
        const authLoading = ref(false);
        const showPassword = ref(false);
        const recovering = ref(false);
        const newPassword = ref('');

        /* ---------- Estado app ---------- */
        const deudas = ref([]);
        const loadingData = ref(true);
        const rates = reactive({ bcv: null, usdt: null, eur: null });
        const ratesInfo = reactive({ fecha: '', manual: false });
        const loadingRates = ref(false);
        const currentView = ref('dashboard');
        const verMoneda = ref('USD');
        const filtro = ref('todas');
        const sidebarOpen = ref(false);
        const showForm = ref(false);
        const saving = ref(false);
        const toast = reactive({ show: false, msg: '', type: '' });

        const monedas = ['USD', 'BS', 'USDT', 'EUR'];
        const nav = [
            { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
            { id: 'deudas',    label: 'Deudas',    icon: 'debts' },
            { id: 'subs',      label: 'Suscripciones', icon: 'repeat' },
            { id: 'plan',      label: 'Planificador', icon: 'plan' },
            { id: 'stats',     label: 'Estadísticas', icon: 'stats' },
            { id: 'gastos',    label: 'Gastos',    icon: 'expenses' },
            { id: 'metas',     label: 'Metas de ahorro', icon: 'goal' },
            { id: 'tasas',     label: 'Tasas de cambio', icon: 'rates' },
            { id: 'calc',      label: 'Calculadora', icon: 'calc' },
            { id: 'ajustes',   label: 'Ajustes', icon: 'gear' },
        ];

        /* ---------- Ajustes atómico: subsecciones ---------- */
        // '' = menú (en móvil) o Perfil por defecto (en escritorio)
        const settingsTab = ref('');
        const settingsSections = [
            { id: 'perfil',     label: 'Perfil',                 desc: 'Tu cuenta, nombre y país',       icon: 'user',     group: 'Perfil' },
            { id: 'sistema',    label: 'Estado del sistema',     desc: 'Chequeo de la base de datos',    icon: 'activity', group: 'Sistema' },
            { id: 'pendientes', label: 'Acciones pendientes',    desc: 'Correo y contraseña de la BD',   icon: 'bell',     group: 'Sistema' },
            { id: 'respaldo',   label: 'Respaldo y exportación', desc: 'Descarga tus datos (CSV/JSON)',  icon: 'download', group: 'Sistema' },
            { id: 'cuenta',     label: 'Cuenta',                 desc: 'Editar perfil y cerrar sesión',  icon: 'logout',   group: 'Cuenta' },
        ];
        const settingsGroups = ['Perfil', 'Sistema', 'Cuenta'].map((g) => ({ name: g, items: settingsSections.filter((s) => s.group === g) }));
        const settingsCur = computed(() => settingsSections.find((s) => s.id === (settingsTab.value || 'perfil')) || settingsSections[0]);
        function isSetTab(id) { return settingsTab.value === id || (settingsTab.value === '' && id === 'perfil'); }
        function openSetTab(id) { if (currentView.value !== 'ajustes') { currentView.value = 'ajustes'; location.hash = 'ajustes'; } settingsTab.value = id; sidebarOpen.value = false; }
        function backSetMenu() { settingsTab.value = ''; }
        const blankForm = () => ({ id: null, tipo: 'por_pagar', descripcion: '', contraparte: '', moneda: 'USD', monto: null, fecha_vencimiento: '', notas: '', recurrente: false, dia_pago: 2, monto_abonado: 0, abonos: [], plan: '', inicial: 0, cuotas: [], n_cuotas: 6, monto_cuota: null, frecuencia: 'cada14', fecha_1a: '', cuotas_pagadas: 0 });
        const form = reactive(blankForm());
        const formMode = ref('edit'); // 'view' (carta de detalle) | 'edit' (formulario)

        /* ---------- Proveedores de crédito (definidos por el usuario) ---------- */
        // Genérico: la persona crea su empresa/app de crédito y le asigna un color.
        // Se guarda solo el NOMBRE en la columna `plan` de la deuda; el color vive aquí.
        const DEFAULT_CRED_COLOR = '#8B5CF6';
        const credPalette = ['#8B5CF6', '#EC4899', '#F5860F', '#22B573', '#0E9C97', '#3B82F6', '#F26D77', '#EAB308', '#14B8A6', '#A855F7'];
        const savedProv = JSON.parse(localStorage.getItem('creditProviders') || 'null');
        const credProviders = ref(Array.isArray(savedProv) && savedProv.length ? savedProv : [{ nombre: 'Cashea', color: '#8B5CF6' }]);
        watch(credProviders, () => { localStorage.setItem('creditProviders', JSON.stringify(credProviders.value)); pushSettings(); }, { deep: true });
        const provAdding = ref(false);
        const newProvName = ref('');
        const newProvColor = ref(credPalette[0]);

        const esFinanciado = (d) => !!(d && d.plan && String(d.plan).trim());
        const findProv = (name) => credProviders.value.find((p) => p.nombre.toLowerCase() === String(name || '').trim().toLowerCase());
        const credColor = (name) => { const p = findProv(name); return p ? p.color : DEFAULT_CRED_COLOR; };
        const credLabel = (name) => { const p = findProv(name); return p ? p.nombre : (name || 'Crédito'); };

        function pickProvider(nombre) { form.plan = nombre; provAdding.value = false; }
        function setProvColor(nombre, color) { const p = findProv(nombre); if (p) p.color = color; }
        function addProvider() {
            const nm = (newProvName.value || '').trim();
            if (!nm) return notify('Escribe el nombre de la empresa', 'error');
            const ex = findProv(nm);
            if (ex) { form.plan = ex.nombre; }
            else { credProviders.value.push({ nombre: nm, color: newProvColor.value }); form.plan = nm; }
            newProvName.value = ''; provAdding.value = false;
            newProvColor.value = credPalette[(credProviders.value.length) % credPalette.length];
            notify('Proveedor listo ✓', 'ok');
        }
        function delProvider(nombre) {
            if (credProviders.value.length <= 1) return notify('Deja al menos un proveedor', 'error');
            credProviders.value = credProviders.value.filter((p) => p.nombre !== nombre);
            if (form.plan === nombre) form.plan = credProviders.value[0]?.nombre || '';
        }
        function toggleFinanciado(on) {
            if (on) { form.plan = form.plan && esFinanciado(form) ? form.plan : (credProviders.value[0]?.nombre || 'Cashea'); }
            else { form.plan = ''; }
        }
        const planCfg = reactive({ disponible: null, moneda: 'USD', d1: 15, d2: 'ultimo', nQuincenas: 6 });
        // Asignaciones del tablero: { [id_deuda]: 'YYYY-MM-DD' (fecha del cobro) }
        const asign = reactive(JSON.parse(localStorage.getItem('planAsign') || '{}'));

        /* Gastos (heatmap) y Metas de ahorro */
        const heatYear = ref(new Date().getFullYear());
        const metas = ref([]);
        const showMetaForm = ref(false);
        const savingMeta = ref(false);
        const blankMeta = () => ({ id: null, nombre: '', moneda: 'USDT', objetivo: null, ahorrado: 0, apy: 8, tipo: 'simple', plazo_meses: 6, aporte_mensual: 0, movimientos: [] });
        const metaForm = reactive(blankMeta());

        /* ---------- Utilidades ---------- */
        const SYM = { BS: 'Bs', USD: '$', USDT: 'USDT', EUR: '€' };
        const COLORS = {
            dark:  { BS: '#E6A94E', USD: '#46C08A', USDT: '#26C6C0', EUR: '#6C8CFF' },
            light: { BS: '#B9791F', USD: '#1F9E6A', USDT: '#0E9C97', EUR: '#3B62E0' },
        };
        const lightMq = window.matchMedia('(prefers-color-scheme: light)');
        const isLight = ref(lightMq.matches);
        lightMq.addEventListener('change', (e) => { isLight.value = e.matches; });
        const palette = () => (isLight.value ? COLORS.light : COLORS.dark);
        const symOf = (m) => SYM[m] || m;
        const curColor = (m) => palette()[m] || 'var(--muted)';
        const sym = computed(() => SYM[verMoneda.value]);
        const fmt = (n) => (Number(n) || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const fmtShort = (n) => { n = Number(n) || 0; if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'; if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k'; return Math.round(n).toString(); };
        function convertir(monto, de, a) {
            const b = rates.bcv, u = rates.usdt; if (!b || !u) return null;
            // Bs por 1 unidad de cada moneda
            const toBs = { BS: 1, USD: b, USDT: u, EUR: rates.eur || null };
            const from = toBs[de], target = toBs[a];
            if (from == null || target == null) return null; // EUR sin tasa aún → no convierte
            return (monto * from) / target;
        }
        const saldo = (d) => d.monto - d.monto_abonado;
        function dueDays(d) { if (!d.fecha_vencimiento) return null; const h = new Date(); h.setHours(0,0,0,0); const v = new Date(d.fecha_vencimiento + 'T00:00:00'); return Math.round((v - h) / 86400000); }

        /* ---------- Fechas para deudas mensuales recurrentes ---------- */
        const todayMidnight = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
        const isoDate = (d) => { const p = (n) => String(n).padStart(2, '0'); return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); };
        // Próxima ocurrencia del día "dia" (1-31) en o después de "from" (ajusta a meses cortos)
        function occurrenceOnOrAfter(dia, from) {
            from = from || todayMidnight();
            const mk = (y, m) => { const last = new Date(y, m + 1, 0).getDate(); return new Date(y, m, Math.min(dia, last)); };
            let y = from.getFullYear(), m = from.getMonth();
            let d = mk(y, m);
            if (d < from) { m++; if (m > 11) { m = 0; y++; } d = mk(y, m); }
            return d;
        }
        // Siguiente ocurrencia el mes después de "fromStr"
        function advanceMonth(fromStr, dia) {
            const base = fromStr ? new Date(fromStr + 'T00:00:00') : todayMidnight();
            let y = base.getFullYear(), m = base.getMonth() + 1; if (m > 11) { m = 0; y++; }
            const last = new Date(y, m + 1, 0).getDate();
            return isoDate(new Date(y, m, Math.min(dia, last)));
        }
        function dueClass(d) { const dr = dueDays(d); if (dr === null) return ''; if (dr < 0) return 'venc-vencida'; if (dr <= 3) return 'venc-pronto'; return ''; }
        function notify(msg, type = '') { toast.msg = msg; toast.type = type; toast.show = true; setTimeout(() => (toast.show = false), 2600); }

        // Suscripciones: avisar 15 días antes; "pagada este mes" si el último pago es de este mes
        const LEAD_DIAS = 15;
        const pagadaEsteMes = (d) => !!(d.ultimo_pago && d.ultimo_pago.slice(0, 7) === isoDate(todayMidnight()).slice(0, 7));

        /* ---------- Autenticación ---------- */
        function toggleAuthMode() { authMode.value = authMode.value === 'login' ? 'signup' : 'login'; authError.value = ''; authNotice.value = ''; }
        async function authSubmit() {
            authError.value = ''; authNotice.value = '';
            const email = (authEmail.value || '').trim();
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { authError.value = 'Escribe un correo válido.'; return; }
            if ((authPassword.value || '').length < 6) { authError.value = 'La contraseña debe tener al menos 6 caracteres.'; return; }
            authLoading.value = true;
            try {
                if (authMode.value === 'login') {
                    const { error } = await supa.auth.signInWithPassword({ email: authEmail.value, password: authPassword.value });
                    if (error) throw error;
                } else {
                    const { data, error } = await supa.auth.signUp({ email: authEmail.value, password: authPassword.value });
                    if (error) throw error;
                    if (!data.session) { authNotice.value = 'Cuenta creada. Revisa tu correo para confirmarla y luego inicia sesión.'; authMode.value = 'login'; }
                }
            } catch (e) {
                const m = (e && e.message) || 'Error de autenticación';
                authError.value = /invalid login/i.test(m) ? 'Correo o contraseña incorrectos.'
                    : /already registered/i.test(m) ? 'Ese correo ya tiene cuenta. Inicia sesión.'
                    : m;
            } finally { authLoading.value = false; }
        }
        async function logout() { await supa.auth.signOut(); deudas.value = []; }

        async function resetPassword() {
            authError.value = ''; authNotice.value = '';
            if (!authEmail.value) { authError.value = 'Escribe tu correo primero y vuelve a tocar el enlace.'; return; }
            authLoading.value = true;
            const { error } = await supa.auth.resetPasswordForEmail(authEmail.value, { redirectTo: window.location.origin });
            authLoading.value = false;
            if (error) authError.value = error.message;
            else authNotice.value = 'Te enviamos un enlace a tu correo para restablecer la contraseña. Revisa también spam.';
        }

        async function setNewPassword() {
            authError.value = '';
            if ((newPassword.value || '').length < 6) { authError.value = 'La contraseña debe tener al menos 6 caracteres.'; return; }
            authLoading.value = true;
            const { error } = await supa.auth.updateUser({ password: newPassword.value });
            authLoading.value = false;
            if (error) { authError.value = error.message; return; }
            recovering.value = false; newPassword.value = '';
            notify('Contraseña actualizada', 'ok');
            loadDeudas();
        }

        /* ---------- Datos (Supabase) ---------- */
        async function loadDeudas() {
            const { data, error } = await supa.from('deudas').select('*');
            if (error) { notify('Error al cargar: ' + error.message, 'error'); return; }
            const list = data || [];
            // Deudas mensuales: SOLO se inicializa la fecha si nunca se puso.
            // Si la fecha ya pasó y no está pagada, se DEJA vencida a propósito para
            // no ocultar un pago olvidado (#4). Avanza al mes siguiente únicamente
            // cuando pulsas "Pagué este mes" (pagarMes).
            const today = todayMidnight();
            for (const d of list) {
                if (d.recurrente && d.dia_pago && d.estado !== 'pagada' && !d.fecha_vencimiento) {
                    const next = isoDate(occurrenceOnOrAfter(d.dia_pago, today));
                    d.fecha_vencimiento = next; d.notified_date = '';
                    supa.from('deudas').update({ fecha_vencimiento: next, notified_date: '' }).eq('id', d.id);
                }
            }
            deudas.value = list.sort((a, b) => {
                if (a.estado !== b.estado) return a.estado === 'pendiente' ? -1 : 1;
                const av = a.fecha_vencimiento || '9999-12-31', bv = b.fecha_vencimiento || '9999-12-31';
                return av < bv ? -1 : av > bv ? 1 : b.id - a.id;
            });
            loadingData.value = false;
        }

        /* ---------- Validación de formularios (evita datos malos / errores del servidor) ---------- */
        const formErrors = reactive({});
        const metaErrors = reactive({});
        const gastoErrors = reactive({});
        const clearErr = (o) => Object.keys(o).forEach((k) => delete o[k]);
        const dropErr = (o, k) => { if (o && o[k]) delete o[k]; };
        const isNum = (v) => v !== '' && v !== null && v !== undefined && isFinite(Number(v));
        function validateDebt() {
            clearErr(formErrors);
            const fin = esFinanciado(form);
            if (!(form.descripcion || '').trim()) formErrors.descripcion = 'Escribe una descripción.';
            if (fin) {
                if (!(Array.isArray(form.cuotas) && form.cuotas.length)) formErrors.cuotas = 'Genera las cuotas antes de guardar.';
            } else {
                if (!isNum(form.monto) || Number(form.monto) <= 0) formErrors.monto = 'El monto debe ser mayor que 0.';
                if (form.recurrente) { const d = Number(form.dia_pago); if (!(d >= 1 && d <= 31)) formErrors.dia_pago = 'Día entre 1 y 31.'; }
                const ab = Number(form.monto_abonado) || 0, m = Number(form.monto) || 0;
                if (ab < 0) formErrors.monto_abonado = 'No puede ser negativo.';
                else if (m > 0 && ab > m + 0.001) formErrors.monto_abonado = 'El abonado supera el monto.';
            }
            return Object.keys(formErrors).length === 0;
        }
        function validateMeta() {
            clearErr(metaErrors);
            if (!(metaForm.nombre || '').trim()) metaErrors.nombre = 'Escribe un nombre.';
            if (!isNum(metaForm.objetivo) || Number(metaForm.objetivo) <= 0) metaErrors.objetivo = 'La meta debe ser mayor que 0.';
            if (Number(metaForm.ahorrado) < 0) metaErrors.ahorrado = 'No puede ser negativo.';
            if (metaForm.tipo !== 'simple' && Number(metaForm.apy) < 0) metaErrors.apy = 'No puede ser negativo.';
            if (metaForm.tipo === 'fija') { const pl = Number(metaForm.plazo_meses); if (!(pl >= 1 && pl <= 60)) metaErrors.plazo_meses = 'Entre 1 y 60 meses.'; }
            if (Number(metaForm.aporte_mensual) < 0) metaErrors.aporte_mensual = 'No puede ser negativo.';
            return Object.keys(metaErrors).length === 0;
        }
        function validateGasto() {
            clearErr(gastoErrors);
            if (!isNum(gastoForm.monto) || Number(gastoForm.monto) <= 0) gastoErrors.monto = 'El monto debe ser mayor que 0.';
            if (!gastoForm.fecha) gastoErrors.fecha = 'Elige una fecha.';
            return Object.keys(gastoErrors).length === 0;
        }

        async function save() {
            if (!validateDebt()) return notify('Revisa los campos marcados', 'error');
            saving.value = true;
            const esCashea = esFinanciado(form);
            const recurrente = !esCashea && !!form.recurrente;
            const dia = recurrente ? Math.min(31, Math.max(1, Number(form.dia_pago) || 1)) : null;
            let montoNum, abon, fecha, estado, extra;
            if (esCashea) {
                const cuotas = Array.isArray(form.cuotas) ? form.cuotas : [];
                montoNum = cuotas.reduce((s, c) => s + (Number(c.monto) || 0), 0);
                abon = cuotas.filter((c) => c.pagada).reduce((s, c) => s + (Number(c.monto) || 0), 0);
                const next = cuotas.filter((c) => !c.pagada).sort((a, b) => (a.fecha < b.fecha ? -1 : 1))[0];
                fecha = next ? next.fecha : (cuotas.length ? cuotas[cuotas.length - 1].fecha : '');
                estado = (montoNum > 0 && abon >= montoNum - 0.0001) ? 'pagada' : 'pendiente';
                extra = { plan: (form.plan || 'Crédito').trim(), inicial: Number(form.inicial) || 0, cuotas };
            } else {
                fecha = recurrente ? isoDate(occurrenceOnOrAfter(dia)) : (form.fecha_vencimiento || '');
                montoNum = Number(form.monto) || 0;
                abon = Math.min(montoNum, Math.max(0, Number(form.monto_abonado) || 0));
                estado = (montoNum > 0 && abon >= montoNum - 0.0001) ? 'pagada' : 'pendiente';
                extra = { recurrente, dia_pago: dia, abonos: Array.isArray(form.abonos) ? form.abonos : [], plan: '', cuotas: [] };
            }
            const base = {
                tipo: esCashea ? 'por_pagar' : form.tipo, descripcion: (form.descripcion || '').trim() || 'Sin descripción',
                contraparte: (form.contraparte || '').trim(), moneda: form.moneda,
                monto: montoNum, fecha_vencimiento: fecha, notas: (form.notas || '').trim(),
                monto_abonado: abon, estado,
            };
            const p = { ...base, ...extra };
            const run = (payload) => form.id
                ? supa.from('deudas').update(payload).eq('id', form.id)
                : supa.from('deudas').insert(payload);
            let { error } = await run(p);
            // Reintento sin columnas nuevas si la base aún no las tiene
            if (error && /recurrente|dia_pago|pagos_realizados|abonos|plan|inicial|cuotas|schema cache|column/i.test(error.message || '')) {
                ({ error } = await run(base));
            }
            saving.value = false;
            if (error) return notify('Error al guardar: ' + error.message, 'error');
            notify(form.id ? 'Deuda actualizada' : 'Deuda agregada', 'ok');
            showForm.value = false;
            await loadDeudas();
        }
        // Registra la cuota del mes en una deuda mensual y la mueve al mes siguiente
        async function pagarMes(d) {
            const next = advanceMonth(d.fecha_vencimiento, d.dia_pago);
            const full = {
                fecha_vencimiento: next, monto_abonado: 0,
                pagos_realizados: (d.pagos_realizados || 0) + 1, notified_date: '',
                ultimo_pago: isoDate(todayMidnight()),
            };
            let { error } = await supa.from('deudas').update(full).eq('id', d.id);
            if (error && /pagos_realizados|ultimo_pago|column|schema cache/i.test(error.message || '')) {
                ({ error } = await supa.from('deudas').update({ fecha_vencimiento: next, monto_abonado: 0, notified_date: '' }).eq('id', d.id));
            }
            if (error) return notify('Error: ' + error.message, 'error');
            notify('Cuota pagada ✓ Próximo cobro: ' + next, 'ok'); await loadDeudas();
        }
        async function abonar(d) {
            const v = prompt('Monto a abonar (saldo: ' + fmt(saldo(d)) + ' ' + symOf(d.moneda) + '):');
            if (v === null) return;
            const monto = parseFloat(v);
            if (!(monto > 0)) return notify('Monto inválido', 'error');
            const nuevo = Math.min(d.monto, (Number(d.monto_abonado) || 0) + monto);
            // Si es mensual y con este abono se completa la cuota, avanza al mes siguiente
            if (d.recurrente && nuevo >= d.monto - 0.0001) return pagarMes(d);
            const estado = (!d.recurrente && nuevo >= d.monto - 0.0001) ? 'pagada' : 'pendiente';
            const abonos = Array.isArray(d.abonos) ? d.abonos.slice() : [];
            abonos.push({ f: isoDate(todayMidnight()), m: monto });
            let { error } = await supa.from('deudas').update({ monto_abonado: nuevo, estado, abonos }).eq('id', d.id);
            if (error && /abonos|column|schema cache/i.test(error.message || '')) {
                ({ error } = await supa.from('deudas').update({ monto_abonado: nuevo, estado }).eq('id', d.id));
            }
            if (error) return notify('Error: ' + error.message, 'error');
            notify('Abono registrado ✓', 'ok'); await loadDeudas();
        }
        // Gestión de abonos dentro del modal (se guarda al pulsar "Guardar cambios")
        function addAbonoForm() {
            const v = prompt('Monto del abono (' + symOf(form.moneda) + '):');
            if (v === null) return;
            const m = parseFloat(v); if (!(m > 0)) return notify('Monto inválido', 'error');
            if (!Array.isArray(form.abonos)) form.abonos = [];
            form.abonos.push({ f: isoDate(todayMidnight()), m });
            form.monto_abonado = Math.max(0, (Number(form.monto_abonado) || 0) + m);
        }
        function delAbonoForm(i) {
            if (!Array.isArray(form.abonos) || !form.abonos[i]) return;
            const m = Number(form.abonos[i].m) || 0;
            form.abonos.splice(i, 1);
            form.monto_abonado = Math.max(0, (Number(form.monto_abonado) || 0) - m);
        }

        /* ---------- Cashea (compra financiada por cuotas) ---------- */
        const addDaysD = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
        const addMonthsD = (d, n) => { const x = new Date(d); const day = x.getDate(); x.setDate(1); x.setMonth(x.getMonth() + n); x.setDate(Math.min(day, new Date(x.getFullYear(), x.getMonth() + 1, 0).getDate())); return x; };
        function generarCuotas() {
            const n = Math.max(1, Math.min(48, Number(form.n_cuotas) || 1));
            const mc = Number(form.monto_cuota) || 0;
            if (!(mc > 0)) return notify('Pon el monto por cuota', 'error');
            const first = form.fecha_1a ? new Date(form.fecha_1a + 'T00:00:00') : todayMidnight();
            const yaPag = Math.max(0, Math.min(n, Number(form.cuotas_pagadas) || 0));
            const cuotas = [];
            let d = new Date(first);
            for (let i = 1; i <= n; i++) {
                cuotas.push({ n: i, monto: mc, fecha: isoDate(d), pagada: i <= yaPag });
                d = form.frecuencia === 'mensual' ? addMonthsD(d, 1) : addDaysD(d, form.frecuencia === 'quincenal' ? 15 : 14);
            }
            form.cuotas = cuotas;
            notify('Cuotas generadas', 'ok');
        }
        function toggleCuota(i) {
            if (!Array.isArray(form.cuotas) || !form.cuotas[i]) return;
            form.cuotas[i].pagada = !form.cuotas[i].pagada;
        }
        const cuotasPagadas = (d) => (Array.isArray(d.cuotas) ? d.cuotas.filter((c) => c.pagada).length : 0);
        async function toggleEstado(d) {
            // En deudas mensuales, el check significa "pagué la cuota de este mes" → avanza
            if (d.recurrente && d.estado !== 'pagada') return pagarMes(d);
            const upd = d.estado === 'pagada' ? { estado: 'pendiente' } : { estado: 'pagada', monto_abonado: d.monto };
            const { error } = await supa.from('deudas').update(upd).eq('id', d.id);
            if (error) return notify('Error: ' + error.message, 'error');
            await loadDeudas();
        }
        async function del(d) {
            if (!confirm('¿Eliminar "' + d.descripcion + '"?')) return;
            const { error } = await supa.from('deudas').delete().eq('id', d.id);
            if (error) return notify('Error: ' + error.message, 'error');
            notify('Deuda eliminada'); await loadDeudas();
        }

        /* ---------- Tasas (directo a la API, con caché) ---------- */
        // EUR (BCV) = USD oficial × paridad EUR/USD del BCE. Frankfurter .dev
        // (el host .app redirige 301 y rompe el fetch).
        async function fetchEurUsd() {
            try {
                const fx = await (await fetch('https://api.frankfurter.dev/v1/latest?base=EUR&symbols=USD')).json();
                const v = fx && fx.rates && fx.rates.USD;
                return v > 0 ? v : null;
            } catch (e) { return null; }
        }
        async function ensureEur(bcv) {
            if (!(bcv > 0)) return null;
            const eurusd = await fetchEurUsd();
            return eurusd ? +(bcv * eurusd).toFixed(4) : null;
        }
        async function loadRates(forzar = false) {
            const manual = JSON.parse(localStorage.getItem('manualRates') || 'null');
            if (manual && !forzar) {
                rates.bcv = manual.bcv; rates.usdt = manual.usdt; rates.eur = manual.eur ?? null;
                ratesInfo.manual = true; ratesInfo.fecha = manual.fecha || 'guardado';
                if (rates.eur == null) { const e = await ensureEur(manual.bcv); if (e) { rates.eur = e; manual.eur = e; localStorage.setItem('manualRates', JSON.stringify(manual)); } }
                return;
            }
            const cache = JSON.parse(localStorage.getItem('ratesCache') || 'null');
            if (cache && !forzar && Date.now() - cache.t < 30 * 60 * 1000) {
                rates.bcv = cache.bcv; rates.usdt = cache.usdt; rates.eur = cache.eur ?? null; ratesInfo.manual = false; ratesInfo.fecha = new Date(cache.t).toLocaleString('es-VE');
                if (rates.eur == null) { const e = await ensureEur(cache.bcv); if (e) { rates.eur = e; cache.eur = e; localStorage.setItem('ratesCache', JSON.stringify(cache)); } }
                return;
            }
            loadingRates.value = true;
            try {
                const arr = await (await fetch(RATES_API)).json();
                let bcv = null, usdt = null;
                for (const it of arr) {
                    const f = (it.fuente || '').toLowerCase();
                    const v = it.promedio ?? it.venta ?? it.compra;
                    if (v == null) continue;
                    if (f === 'oficial') bcv = +v;
                    else if (f === 'paralelo' || f === 'bitcoin') { if (usdt == null || f === 'paralelo') usdt = +v; }
                }
                if (usdt == null) usdt = bcv;
                if (bcv == null) throw new Error('sin datos');
                rates.bcv = bcv; rates.usdt = usdt; ratesInfo.manual = false;
                // EUR (BCV) derivado del oficial USD con la paridad EUR/USD del BCE
                const eur = await ensureEur(bcv);
                rates.eur = eur;
                const t = Date.now(); ratesInfo.fecha = new Date(t).toLocaleString('es-VE');
                localStorage.setItem('ratesCache', JSON.stringify({ bcv, usdt, eur, t }));
                localStorage.removeItem('manualRates');
                pushSettings();
            } catch (e) { notify('No se pudieron cargar las tasas. Fíjalas a mano.', 'error'); }
            finally { loadingRates.value = false; }
        }
        function editRates() {
            const b = prompt('Tasa BCV (Bs por 1 USD):', rates.bcv || '');
            if (b === null) return;
            const u = prompt('Tasa USDT (Bs por 1 USDT):', rates.usdt || '');
            if (u === null) return;
            const e = prompt('Tasa EUR (Bs por 1 €) — opcional, deja vacío para omitir:', rates.eur || '');
            const bcv = parseFloat(b), usdt = parseFloat(u), eur = parseFloat(e);
            if (!(bcv > 0) || !(usdt > 0)) return notify('Tasas inválidas', 'error');
            rates.bcv = bcv; rates.usdt = usdt; rates.eur = eur > 0 ? eur : null;
            const fecha = new Date().toLocaleString('es-VE');
            ratesInfo.manual = true; ratesInfo.fecha = fecha;
            localStorage.setItem('manualRates', JSON.stringify({ bcv, usdt, eur: rates.eur, fecha }));
            pushSettings();
            notify('Tasas manuales guardadas', 'ok');
        }

        /* ---------- Formulario / navegación ---------- */
        function openForm(d, mode = 'edit') { clearErr(formErrors); Object.assign(form, d ? { ...d } : blankForm()); if (esFinanciado(form)) form.plan = credLabel(form.plan); formMode.value = d ? mode : 'edit'; provAdding.value = false; showForm.value = true; }
        function closeForm() { showForm.value = false; }
        function editForm() { formMode.value = 'edit'; }
        function go(view) { currentView.value = view; sidebarOpen.value = false; location.hash = view; if (view === 'ajustes') settingsTab.value = ''; }

        /* ---------- Entrada escalonada de tarjetas (Motion One) ---------- */
        function animateView() {
            if (reduceMotion || !window.Motion) return;
            const views = document.querySelectorAll('.content .view');
            let active = null;
            views.forEach((v) => { if (v.offsetParent !== null) active = v; });
            if (!active) return;
            const kids = [...active.children];
            if (!kids.length) return;
            window.Motion.animate(
                kids,
                { opacity: [0, 1], transform: ['translateY(16px)', 'none'] },
                { duration: 0.5, delay: window.Motion.stagger(0.06), easing: [0.22, 1, 0.36, 1] },
            );
        }
        watch([user, currentView], async () => {
            if (!user.value) return;
            await Vue.nextTick();
            animateView();
        });
        window.addEventListener('hashchange', () => {
            const h = location.hash.replace('#', '');
            if (nav.some(n => n.id === h && !n.soon)) currentView.value = h;
        });

        /* ---------- Detalle de la deuda (modo ver) ---------- */
        const det = computed(() => {
            const fin = esFinanciado(form);
            const cuotas = Array.isArray(form.cuotas) ? form.cuotas : [];
            const pagadas = cuotas.filter((c) => c.pagada).length;
            const restante = cuotas.filter((c) => !c.pagada).reduce((s, c) => s + (Number(c.monto) || 0), 0);
            const monto = Number(form.monto) || 0;
            const abonado = Number(form.monto_abonado) || 0;
            const saldoP = Math.max(0, monto - abonado);
            const dr = form.fecha_vencimiento ? dueDays(form) : null;
            let vence = '';
            if (dr !== null) vence = dr < 0 ? 'Vencida hace ' + (-dr) + ' día(s)' : dr === 0 ? 'Vence hoy' : 'Vence en ' + dr + ' día(s)';
            const venceCls = dr === null ? '' : dr < 0 ? 'txt-late' : dr <= 3 ? 'txt-warn' : 'txt-muted';
            return {
                fin, cuotas, pagadas, total: cuotas.length, restante,
                monto, abonado, saldoP, dr, vence, venceCls,
                pagada: form.estado === 'pagada',
                prov: fin ? credLabel(form.plan) : '', provColor: fin ? credColor(form.plan) : '',
                progreso: cuotas.length ? Math.round((pagadas / cuotas.length) * 100) : (monto > 0 ? Math.round((abonado / monto) * 100) : 0),
            };
        });

        /* ---------- Computeds ---------- */
        const totals = computed(() => {
            let pagar = 0, cobrar = 0, vencidas = 0;
            for (const d of deudas.value) {
                if (d.estado === 'pagada') continue;
                const c = convertir(saldo(d), d.moneda, verMoneda.value);
                if (d.tipo === 'por_pagar') { if (c !== null) pagar += c; const dr = dueDays(d); if (dr !== null && dr < 0) vencidas++; }
                else if (c !== null) cobrar += c;
            }
            return { pagar, cobrar, neto: cobrar - pagar, vencidas };
        });
        const countCobrar = computed(() => deudas.value.filter(d => d.tipo === 'por_cobrar' && d.estado !== 'pagada').length);
        const porMoneda = computed(() => {
            const out = { USD: { pagar: 0, cobrar: 0 }, BS: { pagar: 0, cobrar: 0 }, USDT: { pagar: 0, cobrar: 0 }, EUR: { pagar: 0, cobrar: 0 } };
            for (const d of deudas.value) { if (d.estado === 'pagada' || !out[d.moneda]) continue; out[d.moneda][d.tipo === 'por_pagar' ? 'pagar' : 'cobrar'] += saldo(d); }
            return out;
        });
        const barMax = computed(() => { let m = 0; for (const k of monedas) m = Math.max(m, porMoneda.value[k].pagar, porMoneda.value[k].cobrar); return m || 1; });
        const barW = (v, max) => (v <= 0 ? '0%' : Math.max(4, (v / max) * 100) + '%');
        const donut = computed(() => {
            const segs = []; let total = 0;
            for (const m of monedas) {
                let sum = 0;
                for (const d of deudas.value) { if (d.estado === 'pagada' || d.tipo !== 'por_pagar' || d.moneda !== m) continue; const c = convertir(saldo(d), m, verMoneda.value); if (c !== null) sum += c; }
                if (sum > 0) { segs.push({ label: m, value: sum, color: palette()[m] }); total += sum; }
            }
            let offset = 25;
            for (const s of segs) { s.dash = (s.value / total) * 100; s.offset = offset; offset = (offset - s.dash + 100) % 100; }
            return { segments: segs, total };
        });
        const proximos = computed(() => deudas.value.filter(d => d.estado !== 'pagada' && d.tipo === 'por_pagar' && d.fecha_vencimiento).map(d => ({ ...d, dr: dueDays(d) })).sort((a, b) => a.dr - b.dr).slice(0, 5));
        const nextDue = computed(() => proximos.value[0] || null);
        const filtered = computed(() => {
            let list = deudas.value; const f = filtro.value;
            if (f === 'por_pagar' || f === 'por_cobrar') list = list.filter(d => d.tipo === f);
            else if (f === 'pendiente' || f === 'pagada') list = list.filter(d => d.estado === f);
            return list;
        });
        const filtros = [
            { id: 'todas', label: 'Todas', count: () => deudas.value.length },
            { id: 'por_pagar', label: 'Por pagar', count: () => deudas.value.filter(d => d.tipo === 'por_pagar').length },
            { id: 'por_cobrar', label: 'Por cobrar', count: () => deudas.value.filter(d => d.tipo === 'por_cobrar').length },
            { id: 'pendiente', label: 'Pendientes', count: () => deudas.value.filter(d => d.estado === 'pendiente').length },
            { id: 'pagada', label: 'Pagadas', count: () => deudas.value.filter(d => d.estado === 'pagada').length },
        ];
        const brecha = computed(() => (!rates.bcv || !rates.usdt) ? '—' : '+' + (((rates.usdt - rates.bcv) / rates.bcv) * 100).toFixed(1) + '%');
        const pageSubtitle = computed(() => ({
            dashboard: 'Resumen de lo que debes y lo que te deben', deudas: 'Registro y control de todas tus deudas',
            subs: 'Tus mensualidades y suscripciones al día', plan: 'Qué pagar en cada quincena sin quedar mal', stats: 'Cómo va tu administración y dónde mejorar',
            tasas: 'Tasas de cambio para las conversiones',
            gastos: 'Calendario de pagos y registro de gastos reales', metas: 'Ahorra con proyección de rendimiento',
            calc: 'Convierte y simula compras, deudas y crédito', ajustes: 'Estado del sistema, respaldos y sincronización',
        }[currentView.value] || ''));

        /* ---------- Planificador ---------- */
        const lastDay = (y, m) => new Date(y, m + 1, 0).getDate();
        function generatePaydays() {
            const n = Math.max(1, Math.min(12, planCfg.nQuincenas || 6));
            const today = new Date(); today.setHours(0, 0, 0, 0);
            const days = [planCfg.d1, planCfg.d2]; const out = [];
            for (let i = 0; i < n + 2; i++) {
                const yy = today.getFullYear() + Math.floor((today.getMonth() + i) / 12);
                const mm = (today.getMonth() + i) % 12; const ld = lastDay(yy, mm);
                for (const pd of days) { const day = pd === 'ultimo' ? ld : Math.min(Number(pd) || ld, ld); const dt = new Date(yy, mm, day); if (dt >= today) out.push(dt); }
            }
            out.sort((a, b) => a - b); return out.slice(0, n);
        }
        const plan = computed(() => {
            if (!rates.bcv || !rates.usdt) return { status: 'norates' };
            const disp = Number(planCfg.disponible) || 0;
            if (!(disp > 0)) return { status: 'noconfig' };
            const cur = planCfg.moneda;
            const paydays = generatePaydays().map(d => ({ date: d, capacity: disp, allocs: [], leftover: 0 }));
            if (!paydays.length) return { status: 'noconfig' };
            const debts = deudas.value.filter(d => d.estado !== 'pagada' && d.tipo === 'por_pagar')
                .map(d => ({ ...d, saldoConv: convertir(saldo(d), d.moneda, cur) })).filter(d => d.saldoConv > 0.0001)
                .sort((a, b) => { const av = a.fecha_vencimiento || '9999-12-31', bv = b.fecha_vencimiento || '9999-12-31'; return av < bv ? -1 : av > bv ? 1 : a.id - b.id; });
            const totalDeuda = debts.reduce((s, d) => s + d.saldoConv, 0);
            const risky = [];
            for (const d of debts) {
                let remaining = d.saldoConv, completion = null;
                for (const p of paydays) {
                    if (remaining <= 0.0001) break; if (p.capacity <= 0.0001) continue;
                    const take = Math.min(p.capacity, remaining); p.capacity -= take; remaining -= take;
                    const completes = remaining <= 0.0001;
                    p.allocs.push({ id: d.id, descripcion: d.descripcion, contraparte: d.contraparte, moneda: d.moneda, monto: take, completes });
                    if (completes) completion = p.date;
                }
                if (remaining > 0.0001) risky.push({ ...d, reason: 'unfunded' });
                else if (d.fecha_vencimiento) { const due = new Date(d.fecha_vencimiento + 'T00:00:00'); if (completion > due) risky.push({ ...d, reason: 'late', completion, lateDays: Math.round((completion - due) / 86400000) }); }
            }
            paydays.forEach(p => { p.leftover = p.capacity; });
            let lastIdx = -1; paydays.forEach((p, i) => { if (p.allocs.length) lastIdx = i; });
            return { status: 'ok', paydays: paydays.slice(0, lastIdx + 1), risky, totalDeuda, disponible: disp, cur, quincenas: Math.ceil(totalDeuda / disp), count: debts.length };
        });
        const fmtDate = (d) => d.toLocaleDateString('es-VE', { weekday: 'short', day: 'numeric', month: 'short' });

        /* ---------- Tablero dinámico de pago (arrastrar y soltar) ---------- */
        watch(asign, () => { localStorage.setItem('planAsign', JSON.stringify(asign)); pushSettings(); }, { deep: true });

        // Ítems planificables: deudas normales como 1 ítem; Cashea desglosado por CUOTA
        function planItems(cur) {
            const out = [];
            for (const d of deudas.value) {
                if (d.estado === 'pagada' || d.tipo !== 'por_pagar') continue;
                if (d.recurrente && (dueDays(d) ?? 0) > LEAD_DIAS) continue; // suscripciones: solo dentro de la ventana
                if (esFinanciado(d) && Array.isArray(d.cuotas) && d.cuotas.length) {
                    for (const c of d.cuotas) {
                        if (c.pagada) continue;
                        const amt = convertir(Number(c.monto) || 0, d.moneda, cur) ?? 0;
                        if (amt <= 0.0001) continue;
                        out.push({ id: d.id + '#c' + c.n, descripcion: d.descripcion + ' · cuota ' + c.n, contraparte: d.contraparte, moneda: d.moneda, fecha_vencimiento: c.fecha, amount: amt, montoConv: amt, abonado: 0, cashea: true, prov: d.plan, provColor: credColor(d.plan) });
                    }
                } else {
                    const amt = convertir(saldo(d), d.moneda, cur) ?? 0;
                    if (amt <= 0.0001) continue;
                    out.push({ id: String(d.id), descripcion: d.descripcion, contraparte: d.contraparte, moneda: d.moneda, fecha_vencimiento: d.fecha_vencimiento, amount: amt, montoConv: convertir(d.monto, d.moneda, cur) ?? amt, abonado: Number(d.monto_abonado) || 0, cashea: false, prov: '', provColor: '' });
                }
            }
            return out;
        }

        const board = computed(() => {
            if (!rates.bcv || !rates.usdt) return { status: 'norates' };
            const disp = Number(planCfg.disponible) || 0;
            if (!(disp > 0)) return { status: 'noconfig' };
            const cur = planCfg.moneda;
            const colByKey = {};
            const columns = generatePaydays().map((d) => {
                const key = isoDate(d);
                const c = { key, date: d, label: fmtDate(d), cap: disp, used: 0, cards: [] };
                colByKey[key] = c; return c;
            });
            const backlog = [];
            let totalDeuda = 0;
            const items = planItems(cur)
                .map((it) => ({ id: it.id, descripcion: it.descripcion, contraparte: it.contraparte, moneda: it.moneda, fecha_vencimiento: it.fecha_vencimiento, saldoConv: it.amount, montoConv: it.montoConv, abonado: it.abonado, cashea: it.cashea, prov: it.prov, provColor: it.provColor }))
                .sort((a, b) => { const av = a.fecha_vencimiento || '9999', bv = b.fecha_vencimiento || '9999'; return av < bv ? -1 : av > bv ? 1 : 0; });
            for (const d of items) {
                totalDeuda += d.saldoConv;
                const col = asign[d.id] && colByKey[asign[d.id]] ? colByKey[asign[d.id]] : null;
                if (col) {
                    const late = d.fecha_vencimiento && col.date > new Date(d.fecha_vencimiento + 'T00:00:00');
                    col.cards.push({ ...d, late }); col.used += d.saldoConv;
                } else backlog.push({ ...d, late: false });
            }
            columns.forEach((c) => { c.remaining = c.cap - c.used; c.over = c.used > c.cap + 0.001; c.pct = c.cap > 0 ? c.used / c.cap * 100 : 0; });
            const sinAsignarMonto = backlog.reduce((s, d) => s + d.saldoConv, 0);
            return { status: 'ok', backlog, columns, totalDeuda, totalAsignado: totalDeuda - sinAsignarMonto, sinAsignar: backlog.length, disponible: disp, cur };
        });

        function moverDeuda(id, key) {
            id = String(id);
            if (!key || key === 'backlog') delete asign[id];
            else asign[id] = key;
        }
        // Tocar una tarjeta del tablero → abrir el detalle/edición de la deuda completa
        function verDeuda(d) {
            const realId = String(d.id).split('#')[0];
            const full = deudas.value.find((x) => String(x.id) === realId);
            if (full) openForm(full, 'view');
        }
        function onDrop(evt) {
            const id = evt.item && evt.item.dataset ? evt.item.dataset.id : null;
            const toKey = evt.to && evt.to.dataset ? evt.to.dataset.key : null;
            if (id == null || toKey == null) return;
            // Revertir el movimiento del DOM: Vue es la fuente de verdad
            if (evt.from !== evt.to || evt.oldIndex !== evt.newIndex) {
                const ref = evt.from.children[evt.oldIndex] || null;
                evt.from.insertBefore(evt.item, ref);
            }
            moverDeuda(id, toKey);
        }
        function autoAsignar() {
            if (board.value.status !== 'ok') return;
            const disp = Number(planCfg.disponible) || 0;
            const paydays = generatePaydays().map((d) => ({ key: isoDate(d), date: d, rem: disp }));
            const items = planItems(planCfg.moneda)
                .sort((a, b) => { const av = a.fecha_vencimiento || '9999', bv = b.fecha_vencimiento || '9999'; return av < bv ? -1 : av > bv ? 1 : 0; });
            const next = {};
            for (const it of items) {
                let p = paydays.find((x) => x.rem >= it.amount - 0.001 && (!it.fecha_vencimiento || x.key <= it.fecha_vencimiento))
                    || paydays.find((x) => x.rem >= it.amount - 0.001);
                if (p) { p.rem -= it.amount; next[it.id] = p.key; }
            }
            Object.keys(asign).forEach((k) => delete asign[k]);
            Object.assign(asign, next);
            notify('Auto-asignado por prioridad de vencimiento', 'ok');
        }
        function limpiarAsign() { Object.keys(asign).forEach((k) => delete asign[k]); notify('Tablero vaciado'); }

        /* ---------- Flujo táctil móvil: tocar para mover (sin arrastrar) ---------- */
        const planSheet = reactive({ open: false, item: null, fromKey: null });
        function openPlanSheet(d, fromKey) { planSheet.item = d; planSheet.fromKey = fromKey || null; planSheet.open = true; }
        function closePlanSheet() { planSheet.open = false; }
        function planMove(key) {
            if (!planSheet.item) return;
            const id = planSheet.item.id;
            moverDeuda(id, key);
            if (key && key !== 'backlog') {
                const col = board.value.columns.find((c) => c.key === key);
                notify('Movido a ' + (col ? col.label : 'ese cobro'), 'ok');
            } else notify('Devuelto a “Por asignar”');
            closePlanSheet();
        }
        // Anillo de capacidad (r=23): devuelve el stroke-dasharray y el % redondeado
        function planRing(col) {
            const C = 2 * Math.PI * 23;
            const frac = Math.min(1, Math.max(0, (col.pct || 0) / 100));
            return { dash: (frac * C).toFixed(1) + ' ' + C.toFixed(1), pct: Math.round(col.pct || 0) };
        }

        /* ---------- Suscripciones / mensualidades ---------- */
        const suscripciones = computed(() => {
            const list = deudas.value.filter((d) => d.recurrente && d.tipo === 'por_pagar' && d.estado !== 'pagada');
            const items = list.map((d) => {
                const dr = dueDays(d);
                const pagada = pagadaEsteMes(d);
                let subestado = 'programada';
                if (pagada) subestado = 'pagada';
                else if (dr !== null && dr <= 3) subestado = 'urgente';
                else if (dr !== null && dr <= LEAD_DIAS) subestado = 'proxima';
                return { ...d, dr, pagada, subestado };
            }).sort((a, b) => {
                const rank = (s) => (s.subestado === 'urgente' ? 0 : s.subestado === 'proxima' ? 1 : s.subestado === 'programada' ? 2 : 3);
                return rank(a) - rank(b) || ((a.dr ?? 999) - (b.dr ?? 999));
            });
            const totalMensual = list.reduce((s, d) => s + (convertir(d.monto, d.moneda, 'USD') || 0), 0);
            const porPagar = items.filter((i) => i.subestado === 'proxima' || i.subestado === 'urgente').length;
            return { items, totalMensual, count: list.length, porPagar };
        });
        const subIcon = (e) => e === 'pagada' ? 'check' : e === 'urgente' ? 'alert' : e === 'proxima' ? 'bell' : 'clock';
        function subLabel(s) {
            if (s.subestado === 'pagada') return 'Pagada este mes';
            if (s.subestado === 'urgente') return s.dr < 0 ? '¡Vencida hace ' + (-s.dr) + ' día(s)! Paga ya' : s.dr === 0 ? '¡Vence hoy! Paga ya' : '¡Cuidado! vence en ' + s.dr + ' día(s)';
            if (s.subestado === 'proxima') return 'Por pagar · en ' + s.dr + ' días';
            return 'Aún no toca · en ' + (s.dr ?? '—') + ' días';
        }

        /* ---------- Estadísticas / diagnóstico ---------- */
        const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
        const mesLabel = (ym) => { const [y, m] = ym.split('-'); return MESES[(+m) - 1] + ' ' + y; };

        const stats = computed(() => {
            if (!rates.bcv || !rates.usdt) return { status: 'norates' };
            if (!deudas.value.length) return { status: 'empty' };
            const conv = (m, de) => convertir(m, de, 'USD') ?? 0;

            const pendPagar = deudas.value.filter(d => d.tipo === 'por_pagar' && d.estado !== 'pagada');
            const pendCobrar = deudas.value.filter(d => d.tipo === 'por_cobrar' && d.estado !== 'pagada');
            const allPagar = deudas.value.filter(d => d.tipo === 'por_pagar');

            const totalPagar = pendPagar.reduce((s, d) => s + conv(saldo(d), d.moneda), 0);
            const totalCobrar = pendCobrar.reduce((s, d) => s + conv(saldo(d), d.moneda), 0);
            const montoTotalPagar = allPagar.reduce((s, d) => s + conv(d.monto, d.moneda), 0);
            const pagadoAcum = allPagar.reduce((s, d) => s + conv(d.monto_abonado, d.moneda), 0);
            const progreso = montoTotalPagar > 0 ? (pagadoAcum / montoTotalPagar) * 100 : 0;

            const vencidas = pendPagar.filter(d => { const dr = dueDays(d); return dr !== null && dr < 0; });
            const montoVencido = vencidas.reduce((s, d) => s + conv(saldo(d), d.moneda), 0);
            const en30 = pendPagar.filter(d => { const dr = dueDays(d); return dr !== null && dr >= 0 && dr <= 30; });
            const montoEn30 = en30.reduce((s, d) => s + conv(saldo(d), d.moneda), 0);
            const saldadas = allPagar.filter(d => d.estado === 'pagada').length;

            // Deuda por acreedor (top 5)
            const accMap = {};
            for (const d of pendPagar) { const k = d.contraparte || 'Sin nombre'; accMap[k] = (accMap[k] || 0) + conv(saldo(d), d.moneda); }
            const porAcreedor = Object.entries(accMap).map(([n, v]) => ({ n, v })).sort((a, b) => b.v - a.v).slice(0, 5);
            const maxAcc = porAcreedor.reduce((m, x) => Math.max(m, x.v), 0) || 1;

            // Vencimientos por mes (próximos)
            const mesMap = {};
            for (const d of pendPagar) { if (!d.fecha_vencimiento) continue; const k = d.fecha_vencimiento.slice(0, 7); mesMap[k] = (mesMap[k] || 0) + conv(saldo(d), d.moneda); }
            const porMes = Object.entries(mesMap).sort().slice(0, 6).map(([m, v]) => ({ m, v }));
            const maxMes = porMes.reduce((m, x) => Math.max(m, x.v), 0) || 1;

            // Puntuación de administración (0-100)
            const ratioVencido = totalPagar > 0 ? montoVencido / totalPagar : 0;
            const ratio30 = totalPagar > 0 ? montoEn30 / totalPagar : 0;
            let score = 100;
            score -= ratioVencido * 45;                        // puntualidad
            score -= Math.max(0, ratio30 - 0.5) * 20;          // concentración a corto plazo
            score -= (1 - progreso / 100) * 12;                // avance de pago
            const topShare = totalPagar > 0 && porAcreedor.length ? porAcreedor[0].v / totalPagar : 0;
            score -= Math.max(0, topShare - 0.5) * 10;         // concentración por acreedor
            score = Math.max(0, Math.min(100, Math.round(score)));
            const verdict = score >= 75 ? 'Buena administración' : score >= 50 ? 'Aceptable, con focos de atención' : 'En riesgo';
            const verdictType = score >= 75 ? 'good' : score >= 50 ? 'warn' : 'bad';

            // Diagnóstico automático
            const insights = [];
            if (vencidas.length === 0) insights.push({ ok: true, t: 'Sin deudas vencidas: vas al día con los plazos.' });
            else insights.push({ ok: false, t: `Tienes ${vencidas.length} deuda(s) vencida(s) por $${fmt(montoVencido)}. Son la prioridad #1.` });

            if (progreso >= 50) insights.push({ ok: true, t: `Has cubierto el ${Math.round(progreso)}% del total que asumiste.` });
            else insights.push({ ok: false, t: `Solo has pagado el ${Math.round(progreso)}% de lo que asumiste; acelera los abonos.` });

            if (ratio30 > 0.5) insights.push({ ok: false, t: `El ${Math.round(ratio30 * 100)}% de tu deuda vence en 30 días. Cuida el flujo de caja.` });
            else if (montoEn30 > 0) insights.push({ ok: true, t: `Solo $${fmt(montoEn30)} vence en los próximos 30 días: manejable.` });

            if (topShare >= 0.4 && porAcreedor.length) insights.push({ ok: false, t: `Concentras el ${Math.round(topShare * 100)}% de tu deuda con ${porAcreedor[0].n}.` });
            if (totalCobrar > 0) insights.push({ ok: true, t: `Te deben $${fmt(totalCobrar)} (${Math.round(totalCobrar / (totalPagar || 1) * 100)}% de lo que debes): cóbralo para aliviar.` });

            return {
                status: 'ok', score, verdict, verdictType, progreso,
                totalPagar, totalCobrar, pagadoAcum, montoVencido, vencidas: vencidas.length,
                montoEn30, en30: en30.length, saldadas, activas: pendPagar.length,
                porAcreedor, maxAcc, porMes, maxMes, insights,
            };
        });

        /* ---------- Gastos: heatmap de calendario (desde deudas) ---------- */
        const HEAT = { r: '#E5484D', g: '#2EA043', y: '#E6A94E', o: '#F5860F' };
        const hexRgb = (h) => { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; };
        function heatBg(color, level) { if (!level) return 'var(--surface-3)'; const [r, g, b] = hexRgb(color); const a = [0, .35, .6, .8, 1][level]; return `rgba(${r},${g},${b},${a})`; }

        const gastos = computed(() => {
            const year = heatYear.value;
            const conv = (m, de) => convertir(m, de, 'USD') ?? 0;
            const today = todayMidnight();
            const thisMonth = isoDate(today).slice(0, 7);
            const byDay = {};
            let mesPagado = 0, mesVencido = 0, mesPorPagar = 0, anioTotal = 0;
            for (const d of deudas.value) {
                if (d.tipo !== 'por_pagar' || !d.fecha_vencimiento) continue;
                if (!d.fecha_vencimiento.startsWith(year + '-')) continue;
                const amtSaldo = conv(saldo(d), d.moneda), amtFull = conv(d.monto, d.moneda);
                const c = byDay[d.fecha_vencimiento] || { g: 0, r: 0, y: 0, o: 0 };
                const inMonth = d.fecha_vencimiento.startsWith(thisMonth);
                if (d.estado === 'pagada') { c.g += amtFull; anioTotal += amtFull; if (inMonth) mesPagado += amtFull; }
                else {
                    const venc = new Date(d.fecha_vencimiento + 'T00:00:00');
                    if (venc < today) { c.r += amtSaldo; if (inMonth) mesVencido += amtSaldo; }
                    else { c.y += amtSaldo; if (inMonth) mesPorPagar += amtSaldo; }
                    anioTotal += amtSaldo;
                }
                byDay[d.fecha_vencimiento] = c;
            }
            // Capa de planificación (naranja): días donde planificaste pagar en el tablero (incluye cuotas Cashea)
            let mesPlanificado = 0;
            for (const it of planItems('USD')) {
                const key = asign[it.id];
                if (!key || !key.startsWith(year + '-')) continue;
                const c = byDay[key] || { g: 0, r: 0, y: 0, o: 0 };
                c.o = (c.o || 0) + it.amount; byDay[key] = c;
                if (key.startsWith(thisMonth)) mesPlanificado += it.amount;
            }
            let max = 0; for (const k in byDay) { const c = byDay[k]; max = Math.max(max, (c.o || 0) > 0 ? c.o : (c.g + c.r + c.y)); }
            const level = (t) => { if (t <= 0) return 0; if (max <= 0) return 1; const q = t / max; return q > 0.66 ? 4 : q > 0.33 ? 3 : 2; };

            const jan1 = new Date(year, 0, 1), dec31 = new Date(year, 11, 31);
            const startDow = (jan1.getDay() + 6) % 7;
            const start = new Date(year, 0, 1); start.setDate(start.getDate() - startDow);
            const alldays = []; for (let dt = new Date(start); dt <= dec31; dt.setDate(dt.getDate() + 1)) alldays.push(new Date(dt));
            while (alldays.length % 7) { const n = new Date(alldays[alldays.length - 1]); n.setDate(n.getDate() + 1); alldays.push(n); }
            const weeks = [], months = [];
            for (let w = 0; w < alldays.length / 7; w++) {
                const colDays = alldays.slice(w * 7, w * 7 + 7);
                weeks.push(colDays.map((dt) => {
                    if (dt.getFullYear() !== year) return null;
                    const key = isoDate(dt), c = byDay[key] || { g: 0, r: 0, y: 0, o: 0 };
                    const planned = c.o || 0, other = c.g + c.r + c.y, tot = planned > 0 ? planned : other;
                    const dom = tot <= 0 ? null : (planned > 0 ? 'o' : (c.r >= c.y && c.r >= c.g ? 'r' : (c.g >= c.y ? 'g' : 'y')));
                    return { key, label: dt.toLocaleDateString('es-VE', { day: 'numeric', month: 'short' }), tot, c, bg: heatBg(dom ? HEAT[dom] : '#000', level(tot)) };
                }));
                const firstIn = colDays.find((dt) => dt.getFullYear() === year && dt.getDate() <= 7);
                if (firstIn) { const mm = firstIn.getMonth(); if (!months.length || months[months.length - 1].m !== mm) months.push({ m: mm, label: MESES[mm], col: w }); }
            }
            return { weeks, months, mesPagado, mesVencido, mesPorPagar, mesPlanificado, anioTotal, hasData: max > 0 };
        });

        /* ---------- Metas de ahorro (estilo Binance Earn) ---------- */
        async function loadMetas() {
            const { data, error } = await supa.from('metas').select('*').order('id', { ascending: false });
            metas.value = error ? [] : (data || []);
        }
        function openMetaForm(m) { clearErr(metaErrors); Object.assign(metaForm, m ? { ...m } : blankMeta()); showMetaForm.value = true; }
        function closeMetaForm() { showMetaForm.value = false; }
        async function saveMeta() {
            if (!validateMeta()) return notify('Revisa los campos marcados', 'error');
            savingMeta.value = true;
            const p = {
                nombre: (metaForm.nombre || '').trim() || 'Meta', moneda: metaForm.moneda,
                objetivo: Number(metaForm.objetivo) || 0, ahorrado: Number(metaForm.ahorrado) || 0,
                apy: metaForm.tipo === 'simple' ? 0 : (Number(metaForm.apy) || 0), tipo: metaForm.tipo,
                plazo_meses: metaForm.tipo === 'fija' ? (Number(metaForm.plazo_meses) || 6) : null,
                aporte_mensual: Number(metaForm.aporte_mensual) || 0,
            };
            let error;
            if (metaForm.id) ({ error } = await supa.from('metas').update(p).eq('id', metaForm.id));
            else ({ error } = await supa.from('metas').insert(p));
            savingMeta.value = false;
            if (error) return notify('Error: ' + error.message, 'error');
            notify(metaForm.id ? 'Meta actualizada' : 'Meta creada', 'ok'); showMetaForm.value = false; await loadMetas();
        }
        async function aportarMeta(m) {
            const v = prompt('¿Cuánto agregas a "' + m.nombre + '"? (' + symOf(m.moneda) + ')');
            if (v === null) return;
            const monto = parseFloat(v); if (!(monto > 0)) return notify('Monto inválido', 'error');
            const movs = Array.isArray(m.movimientos) ? m.movimientos.slice() : [];
            movs.push({ f: isoDate(todayMidnight()), m: monto });
            const { error } = await supa.from('metas').update({ ahorrado: Number(m.ahorrado) + monto, movimientos: movs }).eq('id', m.id);
            if (error) return notify('Error: ' + error.message, 'error');
            notify('Aporte registrado ✓', 'ok'); await loadMetas();
        }
        async function quitarAporte(m) {
            const v = prompt('¿Cuánto retiras de "' + m.nombre + '"? (' + symOf(m.moneda) + ')');
            if (v === null) return;
            const monto = parseFloat(v); if (!(monto > 0)) return notify('Monto inválido', 'error');
            const nuevo = Math.max(0, Number(m.ahorrado) - monto);
            const movs = Array.isArray(m.movimientos) ? m.movimientos.slice() : [];
            movs.push({ f: isoDate(todayMidnight()), m: -Math.min(monto, Number(m.ahorrado)) });
            const { error } = await supa.from('metas').update({ ahorrado: nuevo, movimientos: movs }).eq('id', m.id);
            if (error) return notify('Error: ' + error.message, 'error');
            notify('Retiro registrado', 'ok'); await loadMetas();
        }
        async function delMeta(m) {
            if (!confirm('¿Eliminar la meta "' + m.nombre + '"?')) return;
            const { error } = await supa.from('metas').delete().eq('id', m.id);
            if (error) return notify('Error: ' + error.message, 'error');
            notify('Meta eliminada'); await loadMetas();
        }
        const addMonths = (n) => { const d = todayMidnight(); d.setMonth(d.getMonth() + n); return d; };
        function proyeccion(m) {
            const r = (Number(m.apy) || 0) / 100 / 12, aporte = Number(m.aporte_mensual) || 0;
            const obj = Number(m.objetivo) || 0, v = Number(m.ahorrado) || 0;
            const pct = obj > 0 ? Math.min(100, v / obj * 100) : 0;
            if (m.tipo === 'simple') {
                const faltante = Math.max(0, obj - v);
                const meses = v >= obj ? 0 : (aporte > 0 ? Math.ceil(faltante / aporte) : null);
                return { pct, modo: 'simple', faltante, meses, fechaMeta: (meses && meses > 0) ? isoDate(addMonths(meses)) : null };
            }
            if (m.tipo === 'fija') {
                const n = Number(m.plazo_meses) || 12; let val = v; for (let i = 0; i < n; i++) val = val * (1 + r) + aporte;
                return { pct, modo: 'fija', meses: n, valorFinal: val, interes: val - v - aporte * n, fechaFin: isoDate(addMonths(n)), alcanza: val >= obj };
            }
            let val = v, meses = 0; const cap = 1200;
            if (v < obj) { if (aporte <= 0 && r <= 0) meses = null; else while (val < obj && meses < cap) { val = val * (1 + r) + aporte; meses++; } }
            let v12 = v; for (let i = 0; i < 12; i++) v12 = v12 * (1 + r) + aporte;
            return { pct, modo: 'flexible', meses: v >= obj ? 0 : meses, valor12: v12, interes12: v12 - v - aporte * 12, fechaMeta: (meses && meses > 0) ? isoDate(addMonths(meses)) : null };
        }

        /* ============================================================
           #3 Sincronización entre dispositivos (tabla user_settings)
           Guarda plan, asignaciones, tasas manuales y proveedores en la
           nube; localStorage queda como caché/fallback offline.
           ============================================================ */
        const checklist = reactive({ emailDeployed: false, dbPasswordReset: false });
        const savedProfile = JSON.parse(localStorage.getItem('profile') || 'null');
        const profile = reactive(Object.assign({ nombre: '', apellido: '', pais: '', avatar: '' }, savedProfile && typeof savedProfile === 'object' ? savedProfile : {}));
        const displayName = computed(() => {
            const n = ((profile.nombre || '') + ' ' + (profile.apellido || '')).trim();
            return n || (user.value && user.value.email) || '';
        });

        /* ---------- País → zona horaria (automática) + hora local ---------- */
        const COUNTRIES = [
            { code: 'VE', name: 'Venezuela', flag: '🇻🇪', tz: 'America/Caracas' },
            { code: 'CO', name: 'Colombia', flag: '🇨🇴', tz: 'America/Bogota' },
            { code: 'AR', name: 'Argentina', flag: '🇦🇷', tz: 'America/Argentina/Buenos_Aires' },
            { code: 'CL', name: 'Chile', flag: '🇨🇱', tz: 'America/Santiago' },
            { code: 'PE', name: 'Perú', flag: '🇵🇪', tz: 'America/Lima' },
            { code: 'EC', name: 'Ecuador', flag: '🇪🇨', tz: 'America/Guayaquil' },
            { code: 'BO', name: 'Bolivia', flag: '🇧🇴', tz: 'America/La_Paz' },
            { code: 'BR', name: 'Brasil', flag: '🇧🇷', tz: 'America/Sao_Paulo' },
            { code: 'MX', name: 'México', flag: '🇲🇽', tz: 'America/Mexico_City' },
            { code: 'PA', name: 'Panamá', flag: '🇵🇦', tz: 'America/Panama' },
            { code: 'CR', name: 'Costa Rica', flag: '🇨🇷', tz: 'America/Costa_Rica' },
            { code: 'DO', name: 'Rep. Dominicana', flag: '🇩🇴', tz: 'America/Santo_Domingo' },
            { code: 'GT', name: 'Guatemala', flag: '🇬🇹', tz: 'America/Guatemala' },
            { code: 'HN', name: 'Honduras', flag: '🇭🇳', tz: 'America/Tegucigalpa' },
            { code: 'SV', name: 'El Salvador', flag: '🇸🇻', tz: 'America/El_Salvador' },
            { code: 'NI', name: 'Nicaragua', flag: '🇳🇮', tz: 'America/Managua' },
            { code: 'PY', name: 'Paraguay', flag: '🇵🇾', tz: 'America/Asuncion' },
            { code: 'UY', name: 'Uruguay', flag: '🇺🇾', tz: 'America/Montevideo' },
            { code: 'PR', name: 'Puerto Rico', flag: '🇵🇷', tz: 'America/Puerto_Rico' },
            { code: 'US', name: 'Estados Unidos', flag: '🇺🇸', tz: 'America/New_York' },
            { code: 'CA', name: 'Canadá', flag: '🇨🇦', tz: 'America/Toronto' },
            { code: 'ES', name: 'España', flag: '🇪🇸', tz: 'Europe/Madrid' },
            { code: 'PT', name: 'Portugal', flag: '🇵🇹', tz: 'Europe/Lisbon' },
            { code: 'IT', name: 'Italia', flag: '🇮🇹', tz: 'Europe/Rome' },
            { code: 'FR', name: 'Francia', flag: '🇫🇷', tz: 'Europe/Paris' },
            { code: 'DE', name: 'Alemania', flag: '🇩🇪', tz: 'Europe/Berlin' },
            { code: 'GB', name: 'Reino Unido', flag: '🇬🇧', tz: 'Europe/London' },
        ];
        const paisObj = (code) => COUNTRIES.find((c) => c.code === code) || null;
        const nowTick = ref(Date.now());
        setInterval(() => { nowTick.value = Date.now(); }, 30000);
        const localTime = computed(() => {
            nowTick.value; // dependencia para refrescar
            const c = paisObj(profile.pais); if (!c) return '';
            try { return new Intl.DateTimeFormat('es-VE', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: c.tz }).format(new Date()); } catch (e) { return ''; }
        });
        const paisNombre = computed(() => { const c = paisObj(profile.pais); return c ? c.name : ''; });
        const paisFlag = computed(() => { const c = paisObj(profile.pais); return c ? c.flag : ''; });
        const paisTzLabel = computed(() => { const c = paisObj(profile.pais); return c ? c.tz.replace(/_/g, ' ') : ''; });

        /* ---------- Modal de edición de perfil ---------- */
        const showProfileForm = ref(false);
        const confirmDelete = ref(false);
        const deleting = ref(false);
        const profileDraft = reactive({ nombre: '', apellido: '', pais: '', avatar: '' });
        function openProfileForm() { Object.assign(profileDraft, { nombre: profile.nombre || '', apellido: profile.apellido || '', pais: profile.pais || '', avatar: profile.avatar || '' }); confirmDelete.value = false; showProfileForm.value = true; }
        function closeProfileForm() { showProfileForm.value = false; confirmDelete.value = false; }
        function saveProfile() {
            profile.nombre = (profileDraft.nombre || '').trim();
            profile.apellido = (profileDraft.apellido || '').trim();
            profile.pais = profileDraft.pais || '';
            profile.avatar = profileDraft.avatar || '';
            showProfileForm.value = false;
            notify('Perfil guardado ✓', 'ok');
        }
        async function deleteAccount() {
            if (!user.value) return;
            deleting.value = true;
            let full = false;
            try { const { error } = await supa.functions.invoke('borrar-cuenta', { body: {} }); if (!error) full = true; } catch (e) { /* función no desplegada */ }
            if (!full) {
                await Promise.allSettled([
                    supa.from('gastos').delete().neq('id', 0),
                    supa.from('deudas').delete().neq('id', 0),
                    supa.from('metas').delete().neq('id', 0),
                    supa.from('user_settings').delete().eq('user_id', user.value.id),
                ]);
            }
            ['planCfg', 'planAsign', 'manualRates', 'ratesCache', 'creditProviders', 'profile'].forEach((k) => localStorage.removeItem(k));
            deudas.value = []; metas.value = []; gastosReales.value = [];
            await supa.auth.signOut();
            deleting.value = false; showProfileForm.value = false; confirmDelete.value = false;
            notify(full ? 'Cuenta eliminada' : 'Cuenta cerrada y datos borrados', 'ok');
        }
        let settingsAvailable = true;   // false si la tabla aún no existe
        let applyingSettings = false;   // evita eco durante el "pull"
        let pushTimer = null;
        function collectSettings() {
            return {
                planCfg: { ...planCfg },
                asign: { ...asign },
                creditProviders: credProviders.value,
                manualRates: JSON.parse(localStorage.getItem('manualRates') || 'null'),
                checklist: { ...checklist },
                profile: { ...profile },
            };
        }
        async function pullSettings() {
            if (!user.value) return;
            const { data, error } = await supa.from('user_settings').select('data').eq('user_id', user.value.id).maybeSingle();
            if (error) { if (/user_settings|relation|schema cache|does not exist|not find/i.test(error.message || '')) settingsAvailable = false; return; }
            settingsAvailable = true;
            const s = data && data.data;
            if (s && typeof s === 'object') {
                applyingSettings = true;
                if (s.planCfg) Object.assign(planCfg, s.planCfg);
                if (s.asign && typeof s.asign === 'object') { Object.keys(asign).forEach((k) => delete asign[k]); Object.assign(asign, s.asign); }
                if (Array.isArray(s.creditProviders) && s.creditProviders.length) credProviders.value = s.creditProviders;
                if (s.manualRates) localStorage.setItem('manualRates', JSON.stringify(s.manualRates));
                if (s.checklist) Object.assign(checklist, s.checklist);
                if (s.profile && typeof s.profile === 'object') {
                    // La nube gana si trae datos; si viene vacía, conservamos el perfil local (y luego se sube).
                    const hasRemote = Object.values(s.profile).some((v) => v);
                    const hasLocal = Object.values(profile).some((v) => v);
                    if (hasRemote || !hasLocal) Object.assign(profile, s.profile);
                }
                await Vue.nextTick(); applyingSettings = false;
            }
        }
        function pushSettings() {
            if (!user.value || !settingsAvailable || applyingSettings) return;
            clearTimeout(pushTimer);
            pushTimer = setTimeout(async () => {
                const payload = { user_id: user.value.id, data: collectSettings(), updated_at: new Date().toISOString() };
                const { error } = await supa.from('user_settings').upsert(payload, { onConflict: 'user_id' });
                if (error && /user_settings|relation|schema cache|does not exist|not find/i.test(error.message || '')) settingsAvailable = false;
            }, 800);
        }
        watch(checklist, pushSettings, { deep: true });
        // Perfil: guarda SIEMPRE en el dispositivo (sobrevive recargas sin BD) y además sincroniza a la nube.
        watch(profile, () => { try { localStorage.setItem('profile', JSON.stringify({ ...profile })); } catch (e) {} pushSettings(); }, { deep: true });

        /* ============================================================
           Ajustes → Sistema: chequeo de dependencias (#1, #2, #9)
           ============================================================ */
        const health = reactive({ checked: false, checking: false, deudasCols: null, metas: null, settings: null, gastos: null });
        async function runHealth() {
            if (!user.value) return;
            health.checking = true;
            const ok = (error) => !(error && /column|relation|schema cache|does not exist|not find/i.test(error.message || ''));
            const probe = async (q) => { const { error } = await q; return ok(error); };
            health.deudasCols = await probe(supa.from('deudas').select('recurrente,dia_pago,pagos_realizados,ultimo_pago,abonos,plan,inicial,cuotas').limit(1));
            health.metas = await probe(supa.from('metas').select('id').limit(1));
            health.settings = await probe(supa.from('user_settings').select('user_id').limit(1));
            health.gastos = await probe(supa.from('gastos').select('id').limit(1));
            gastosAvailable.value = !!health.gastos;
            settingsAvailable = !!health.settings;
            health.checked = true; health.checking = false;
            if (health.settings) { await pullSettings(); pushSettings(); }
        }
        const allGreen = computed(() => health.checked && health.deudasCols && health.metas && health.settings && health.gastos && checklist.emailDeployed && checklist.dbPasswordReset);

        const emailTesting = ref(false);
        async function testEmail() {
            if (!confirm('¿Enviar ahora el correo de recordatorios? Se envía a las cuentas con deudas por vencer.')) return;
            emailTesting.value = true;
            try {
                const { data, error } = await supa.functions.invoke('enviar-recordatorios', { body: {} });
                if (error) throw error;
                notify('Función OK: ' + JSON.stringify(data), 'ok');
                checklist.emailDeployed = true;
            } catch (e) { notify('No respondió (¿está desplegada?): ' + (e.message || e), 'error'); }
            finally { emailTesting.value = false; }
        }

        /* ============================================================
           #8 Exportar / respaldo (100% en el dispositivo)
           ============================================================ */
        function download(name, text, type) {
            const blob = new Blob([text], { type: type || 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = name;
            document.body.appendChild(a); a.click(); a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        }
        function exportCSV() {
            const cols = ['tipo', 'descripcion', 'contraparte', 'moneda', 'monto', 'monto_abonado', 'estado', 'fecha_vencimiento', 'recurrente', 'plan', 'notas'];
            const esc = (v) => { v = v == null ? '' : String(v); return /[",\n;]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
            const rows = [cols.join(',')];
            for (const d of deudas.value) rows.push(cols.map((c) => esc(d[c])).join(','));
            download('deudas-' + isoDate(todayMidnight()) + '.csv', '﻿' + rows.join('\n'), 'text/csv');
            notify('CSV exportado ✓', 'ok');
        }
        function exportBackup() {
            const data = { app: 'Ordo', exportado: new Date().toISOString(), deudas: deudas.value, metas: metas.value, gastos: gastosReales.value, settings: collectSettings() };
            download('respaldo-tablero-' + isoDate(todayMidnight()) + '.json', JSON.stringify(data, null, 2), 'application/json');
            notify('Respaldo descargado ✓', 'ok');
        }

        /* ============================================================
           #5 Gastos reales (día a día, con categorías) — tabla gastos
           ============================================================ */
        const CATEGORIAS = [
            { id: 'comida', label: 'Comida', emoji: '🍔' },
            { id: 'transporte', label: 'Transporte', emoji: '🚗' },
            { id: 'servicios', label: 'Servicios', emoji: '💡' },
            { id: 'salud', label: 'Salud', emoji: '💊' },
            { id: 'compras', label: 'Compras', emoji: '🛍️' },
            { id: 'ocio', label: 'Ocio', emoji: '🎬' },
            { id: 'hogar', label: 'Hogar', emoji: '🏠' },
            { id: 'otros', label: 'Otros', emoji: '📦' },
        ];
        const catInfo = (id) => CATEGORIAS.find((c) => c.id === id) || CATEGORIAS[CATEGORIAS.length - 1];
        const gastosReales = ref([]);
        const gastosAvailable = ref(true);
        const showGastoForm = ref(false);
        const savingGasto = ref(false);
        const blankGasto = () => ({ id: null, fecha: isoDate(todayMidnight()), categoria: 'comida', monto: null, moneda: 'USD', descripcion: '' });
        const gastoForm = reactive(blankGasto());
        const missingGastos = (e) => /gastos|relation|schema cache|does not exist|not find/i.test(e || '');
        async function loadGastos() {
            if (!user.value) return;
            const { data, error } = await supa.from('gastos').select('*').order('fecha', { ascending: false });
            if (error) { if (missingGastos(error.message)) gastosAvailable.value = false; gastosReales.value = []; return; }
            gastosAvailable.value = true; gastosReales.value = data || [];
        }
        function openGastoForm(g) { clearErr(gastoErrors); Object.assign(gastoForm, g ? { ...g } : blankGasto()); showGastoForm.value = true; }
        function closeGastoForm() { showGastoForm.value = false; }
        async function saveGasto() {
            if (!validateGasto()) return notify('Revisa los campos marcados', 'error');
            savingGasto.value = true;
            const p = { fecha: gastoForm.fecha || isoDate(todayMidnight()), categoria: gastoForm.categoria || 'otros', descripcion: (gastoForm.descripcion || '').trim(), monto: Number(gastoForm.monto) || 0, moneda: gastoForm.moneda };
            let error;
            if (gastoForm.id) ({ error } = await supa.from('gastos').update(p).eq('id', gastoForm.id));
            else ({ error } = await supa.from('gastos').insert(p));
            savingGasto.value = false;
            if (error) { if (missingGastos(error.message)) { gastosAvailable.value = false; return notify('Activa “Gastos reales” corriendo setup.sql', 'error'); } return notify('Error: ' + error.message, 'error'); }
            notify(gastoForm.id ? 'Gasto actualizado' : 'Gasto agregado', 'ok'); showGastoForm.value = false; await loadGastos();
        }
        async function delGasto(g) {
            if (!confirm('¿Eliminar este gasto?')) return;
            const { error } = await supa.from('gastos').delete().eq('id', g.id);
            if (error) return notify('Error: ' + error.message, 'error');
            notify('Gasto eliminado'); await loadGastos();
        }
        const gastosRealMetrics = computed(() => {
            const conv = (m, de) => convertir(m, de, 'USD') ?? 0;
            const thisMonth = isoDate(todayMidnight()).slice(0, 7);
            const year = heatYear.value;
            let mes = 0, anio = 0; const porCat = {};
            for (const g of gastosReales.value) {
                const amt = conv(Number(g.monto) || 0, g.moneda);
                if (g.fecha && g.fecha.startsWith(thisMonth)) mes += amt;
                if (g.fecha && g.fecha.startsWith(year + '-')) { anio += amt; porCat[g.categoria] = (porCat[g.categoria] || 0) + amt; }
            }
            const max = Object.values(porCat).reduce((m, v) => Math.max(m, v), 0) || 1;
            const cats = Object.entries(porCat).map(([k, v]) => ({ k, v, info: catInfo(k) })).sort((a, b) => b.v - a.v);
            return { mes, anio, cats, max, count: gastosReales.value.length };
        });
        const gastosRecientes = computed(() => gastosReales.value.slice(0, 12));

        /* ============================================================
           Calculadora / Simulador (no guarda nada; usa tasas o una personalizada)
           ============================================================ */
        const calcTab = ref('conversor');
        const calc = reactive({
            monto: 100, de: 'USD', a: 'BS',
            usarCustom: false, custom: null, customPar: 'USD',
            dMonto: 500, dMoneda: 'USD', dTasa: 5, dMeses: 6,
            cPrecio: 300, cMoneda: 'USD', cInicial: 0, cN: 6, cFrec: 'cada14', cFecha: isoDate(todayMidnight()),
        });
        function calcToBs() {
            const map = { BS: 1, USD: rates.bcv, USDT: rates.usdt, EUR: rates.eur };
            if (calc.usarCustom && Number(calc.custom) > 0) map[calc.customPar] = Number(calc.custom);
            return map;
        }
        function convCalc(monto, de, a) {
            const map = calcToBs(); const f = map[de], t = map[a];
            if (f == null || t == null) return null;
            return (Number(monto) || 0) * f / t;
        }
        function swapConv() { const d = calc.de; calc.de = calc.a; calc.a = d; }
        const convResult = computed(() => convCalc(calc.monto, calc.de, calc.a));
        const compraEquivs = computed(() => monedas.map((m) => ({ m, v: convCalc(calc.monto, calc.de, m) })));
        const deudaSim = computed(() => {
            const P = Math.max(0, Number(calc.dMonto) || 0);
            const n = Math.max(1, Math.min(600, Number(calc.dMeses) || 1));
            const r = (Number(calc.dTasa) || 0) / 100 / 12;
            const cuota = r > 0 ? P * r / (1 - Math.pow(1 + r, -n)) : P / n;
            const total = cuota * n;
            return { cuota, total, interes: total - P, P, n };
        });
        const creditoSim = computed(() => {
            const P = Math.max(0, Number(calc.cPrecio) || 0);
            const ini = Math.min(P, Math.max(0, Number(calc.cInicial) || 0));
            const n = Math.max(1, Math.min(48, Number(calc.cN) || 1));
            const fin = Math.max(0, P - ini);
            const mc = fin / n;
            const first = calc.cFecha ? new Date(calc.cFecha + 'T00:00:00') : todayMidnight();
            const cuotas = []; let d = new Date(first);
            for (let i = 1; i <= n; i++) {
                cuotas.push({ n: i, monto: mc, fecha: isoDate(d) });
                d = calc.cFrec === 'mensual' ? addMonthsD(d, 1) : addDaysD(d, calc.cFrec === 'quincenal' ? 15 : 14);
            }
            return { financiado: fin, mc, total: P, ini, n, cuotas };
        });

        /* ---------- Persistencia planCfg ---------- */
        const savedCfg = JSON.parse(localStorage.getItem('planCfg') || 'null');
        if (savedCfg) Object.assign(planCfg, savedCfg);
        watch(planCfg, () => { localStorage.setItem('planCfg', JSON.stringify(planCfg)); pushSettings(); }, { deep: true });

        /* ---------- Init ---------- */
        onMounted(() => {
            const h = location.hash.replace('#', '');
            if (nav.some(n => n.id === h && !n.soon)) currentView.value = h;

            // La sesión inicial llega por onAuthStateChange (evento INITIAL_SESSION),
            // así no bloqueamos el arranque esperando a getSession().
            let first = true;
            supa.auth.onAuthStateChange((event, s) => {
                if (event === 'PASSWORD_RECOVERY') recovering.value = true;
                const was = user.value?.id;
                user.value = s?.user ?? null;
                ready.value = true;
                if (user.value && (user.value.id !== was || first) && !recovering.value) { loadDeudas(); loadMetas(); loadGastos(); runHealth(); }
                first = false;
            });

            // Respaldo: pase lo que pase, nunca dejar la app colgada en "Cargando…"
            setTimeout(() => { ready.value = true; }, 4000);

            loadRates();
        });

        return {
            ready, user, authMode, authEmail, authPassword, authError, authNotice, authLoading, showPassword, recovering, newPassword, toggleAuthMode, authSubmit, logout, resetPassword, setNewPassword,
            deudas, loadingData, rates, ratesInfo, loadingRates, currentView, verMoneda, filtro, sidebarOpen, showForm, saving, toast,
            formErrors, metaErrors, gastoErrors, dropErr,
            monedas, nav, form, formMode, filtros, planCfg,
            symOf, curColor, sym, fmt, fmtShort, dueDays, dueClass, fmtDate,
            loadRates, editRates, openForm, closeForm, editForm, save, abonar, toggleEstado, del, go, addAbonoForm, delAbonoForm,
            generarCuotas, toggleCuota, cuotasPagadas,
            det, esFinanciado, credProviders, credPalette, credColor, credLabel, provAdding, newProvName, newProvColor, pickProvider, setProvColor, addProvider, delProvider, toggleFinanciado,
            totals, countCobrar, porMoneda, barMax, barW, donut, proximos, nextDue, filtered, brecha, pageSubtitle, plan,
            stats, mesLabel,
            heatYear, gastos, metas, showMetaForm, savingMeta, metaForm, openMetaForm, closeMetaForm, saveMeta, aportarMeta, quitarAporte, delMeta, proyeccion,
            board, onDrop, autoAsignar, limpiarAsign, verDeuda,
            planSheet, openPlanSheet, closePlanSheet, planMove, planRing,
            settingsTab, settingsSections, settingsGroups, settingsCur, isSetTab, openSetTab, backSetMenu,
            suscripciones, pagarMes, LEAD_DIAS, subIcon, subLabel,
            health, runHealth, allGreen, checklist, profile, displayName, emailTesting, testEmail,
            COUNTRIES, AVATARS, localTime, paisNombre, paisFlag, paisTzLabel,
            showProfileForm, confirmDelete, deleting, profileDraft, openProfileForm, closeProfileForm, saveProfile, deleteAccount,
            exportCSV, exportBackup,
            CATEGORIAS, catInfo, gastosReales, gastosAvailable, showGastoForm, savingGasto, gastoForm, openGastoForm, closeGastoForm, saveGasto, delGasto, gastosRealMetrics, gastosRecientes,
            calcTab, calc, convCalc, swapConv, convResult, compraEquivs, deudaSim, creditoSim,
        };
    },
}).directive('sortable', sortableDir).mount('#app');

const { createApp, ref, reactive, computed, onMounted, watch } = Vue;

/* ---------- Iconos SVG de línea (stroke) ---------- */
const ICONS = {
    dashboard: '<path d="M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6v-9h-6v9Zm0-16v5h6V4h-6Z"/>',
    debts:     '<path d="M3 7h18M3 12h18M3 17h12"/><circle cx="18" cy="17" r="3"/>',
    rates:     '<path d="M3 17l6-6 4 4 8-8"/><path d="M21 7v5h-5"/>',
    plan:      '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4M8.5 15l2 2 4-4"/>',
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
};

const Icon = {
    props: { name: String },
    template: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" v-html="path"></svg>`,
    computed: { path() { return ICONS[this.name] || ''; } },
};

createApp({
    components: { Icon },
    setup() {
        /* ---------- Estado ---------- */
        const deudas = ref([]);
        const rates = reactive({ bcv: null, usdt: null });
        const ratesInfo = reactive({ fecha: '', manual: false });
        const loadingRates = ref(false);

        const currentView = ref('dashboard');
        const verMoneda = ref('USD');
        const filtro = ref('todas');
        const sidebarOpen = ref(false);
        const showForm = ref(false);
        const toast = reactive({ show: false, msg: '', type: '' });

        const monedas = ['USD', 'BS', 'USDT'];
        const nav = [
            { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
            { id: 'deudas',    label: 'Deudas',    icon: 'debts' },
            { id: 'plan',      label: 'Planificador', icon: 'plan' },
            { id: 'tasas',     label: 'Tasas de cambio', icon: 'rates' },
            { id: 'gastos',    label: 'Gastos',    icon: 'expenses', soon: true },
            { id: 'metas',     label: 'Metas de ahorro', icon: 'goal', soon: true },
        ];

        const blankForm = () => ({ id: null, tipo: 'por_pagar', descripcion: '', contraparte: '', moneda: 'USD', monto: null, fecha_vencimiento: '', notas: '' });
        const form = reactive(blankForm());

        // Configuración del planificador (cuánto puedes destinar por quincena y cuándo cobras)
        const planCfg = reactive({ disponible: null, moneda: 'USD', d1: 15, d2: 'ultimo', nQuincenas: 6 });

        /* ---------- Utilidades ---------- */
        const SYM = { BS: 'Bs', USD: '$', USDT: 'USDT' };
        const COLOR = { BS: '#E6A94E', USD: '#46C08A', USDT: '#26C6C0' };
        const symOf = (m) => SYM[m] || m;
        const curColor = (m) => COLOR[m] || 'var(--muted)';
        const sym = computed(() => SYM[verMoneda.value]);

        const fmt = (n) => (Number(n) || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const fmtShort = (n) => {
            n = Number(n) || 0;
            if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
            if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k';
            return Math.round(n).toString();
        };

        function convertir(monto, de, a) {
            const b = rates.bcv, u = rates.usdt;
            if (!b || !u) return null;
            let bs = de === 'BS' ? monto : de === 'USD' ? monto * b : monto * u;
            return a === 'BS' ? bs : a === 'USD' ? bs / b : bs / u;
        }
        const saldo = (d) => d.monto - d.monto_abonado;

        function dueDays(d) {
            if (!d.fecha_vencimiento) return null;
            const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
            const v = new Date(d.fecha_vencimiento + 'T00:00:00');
            return Math.round((v - hoy) / 86400000);
        }
        function dueClass(d) {
            const dr = dueDays(d);
            if (dr === null) return '';
            if (dr < 0) return 'venc-vencida';
            if (dr <= 3) return 'venc-pronto';
            return '';
        }

        function notify(msg, type = '') { toast.msg = msg; toast.type = type; toast.show = true; setTimeout(() => (toast.show = false), 2600); }

        /* ---------- API ---------- */
        async function api(action, body) {
            const r = await fetch('api/api.php?action=' + action, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}),
            });
            return r.json();
        }
        async function loadDeudas() { const j = await api('list'); deudas.value = j.deudas || []; }

        async function loadRates(forzar = false) {
            const manual = JSON.parse(localStorage.getItem('manualRates') || 'null');
            if (manual && !forzar) { rates.bcv = manual.bcv; rates.usdt = manual.usdt; ratesInfo.manual = true; ratesInfo.fecha = manual.fecha || 'guardado'; return; }
            loadingRates.value = true;
            try {
                const r = await fetch('api/rates.php' + (forzar ? '?t=' + Date.now() : ''));
                const j = await r.json();
                if (!j.ok) throw new Error();
                rates.bcv = j.bcv; rates.usdt = j.usdt;
                ratesInfo.manual = false; ratesInfo.fecha = new Date(j.fecha).toLocaleString('es-VE');
                localStorage.removeItem('manualRates');
            } catch (e) {
                notify('No se pudieron cargar las tasas. Fíjalas a mano.', 'error');
            } finally { loadingRates.value = false; }
        }

        function editRates() {
            const b = prompt('Tasa BCV (Bs por 1 USD):', rates.bcv || '');
            if (b === null) return;
            const u = prompt('Tasa USDT (Bs por 1 USDT):', rates.usdt || '');
            if (u === null) return;
            const bcv = parseFloat(b), usdt = parseFloat(u);
            if (!(bcv > 0) || !(usdt > 0)) return notify('Tasas inválidas', 'error');
            rates.bcv = bcv; rates.usdt = usdt;
            const fecha = new Date().toLocaleString('es-VE');
            ratesInfo.manual = true; ratesInfo.fecha = fecha;
            localStorage.setItem('manualRates', JSON.stringify({ bcv, usdt, fecha }));
            notify('Tasas manuales guardadas', 'ok');
        }

        /* ---------- Formulario ---------- */
        function openForm(d) {
            Object.assign(form, d ? { ...d } : blankForm());
            showForm.value = true;
        }
        function closeForm() { showForm.value = false; }
        async function save() {
            const payload = { ...form, monto: Number(form.monto) || 0 };
            if (form.id) { await api('update', payload); notify('Deuda actualizada', 'ok'); }
            else { await api('add', payload); notify('Deuda agregada', 'ok'); }
            showForm.value = false;
            await loadDeudas();
        }
        async function abonar(d) {
            const v = prompt('Monto a abonar (saldo: ' + fmt(saldo(d)) + ' ' + symOf(d.moneda) + '):');
            if (v === null) return;
            const monto = parseFloat(v);
            if (!(monto > 0)) return notify('Monto inválido', 'error');
            await api('abonar', { id: d.id, monto });
            notify('Abono registrado', 'ok');
            await loadDeudas();
        }
        async function toggleEstado(d) { await api('toggle_estado', { id: d.id }); await loadDeudas(); }
        async function del(d) {
            if (!confirm('¿Eliminar "' + d.descripcion + '"?')) return;
            await api('delete', { id: d.id });
            notify('Deuda eliminada');
            await loadDeudas();
        }

        /* ---------- Navegación ---------- */
        function go(view) { currentView.value = view; sidebarOpen.value = false; location.hash = view; }

        /* ---------- Computeds ---------- */
        const totals = computed(() => {
            let pagar = 0, cobrar = 0, vencidas = 0;
            for (const d of deudas.value) {
                if (d.estado === 'pagada') continue;
                const c = convertir(saldo(d), d.moneda, verMoneda.value);
                if (d.tipo === 'por_pagar') {
                    if (c !== null) pagar += c;
                    const dr = dueDays(d); if (dr !== null && dr < 0) vencidas++;
                } else if (c !== null) cobrar += c;
            }
            return { pagar, cobrar, neto: cobrar - pagar, vencidas };
        });
        const countCobrar = computed(() => deudas.value.filter(d => d.tipo === 'por_cobrar' && d.estado !== 'pagada').length);

        const porMoneda = computed(() => {
            const out = { USD: { pagar: 0, cobrar: 0 }, BS: { pagar: 0, cobrar: 0 }, USDT: { pagar: 0, cobrar: 0 } };
            for (const d of deudas.value) {
                if (d.estado === 'pagada') continue;
                out[d.moneda][d.tipo === 'por_pagar' ? 'pagar' : 'cobrar'] += saldo(d);
            }
            return out;
        });
        const barMax = computed(() => {
            let m = 0;
            for (const k of monedas) m = Math.max(m, porMoneda.value[k].pagar, porMoneda.value[k].cobrar);
            return m || 1;
        });
        const barW = (v, max) => (v <= 0 ? '0%' : Math.max(4, (v / max) * 100) + '%');

        const donut = computed(() => {
            const segs = [];
            let total = 0;
            for (const m of monedas) {
                let sum = 0;
                for (const d of deudas.value) {
                    if (d.estado === 'pagada' || d.tipo !== 'por_pagar' || d.moneda !== m) continue;
                    const c = convertir(saldo(d), m, verMoneda.value);
                    if (c !== null) sum += c;
                }
                if (sum > 0) { segs.push({ label: m, value: sum, color: COLOR[m] }); total += sum; }
            }
            let offset = 25; // empezar arriba
            for (const s of segs) {
                s.dash = (s.value / total) * 100;
                s.offset = offset;
                offset = (offset - s.dash + 100) % 100;
            }
            return { segments: segs, total };
        });

        const proximos = computed(() => deudas.value
            .filter(d => d.estado !== 'pagada' && d.tipo === 'por_pagar' && d.fecha_vencimiento)
            .map(d => ({ ...d, dr: dueDays(d) }))
            .sort((a, b) => a.dr - b.dr)
            .slice(0, 5));
        const nextDue = computed(() => proximos.value[0] || null);

        const filtered = computed(() => {
            let list = deudas.value;
            const f = filtro.value;
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

        /* ---------- Planificador de pagos ---------- */
        const lastDay = (y, m) => new Date(y, m + 1, 0).getDate();

        function generatePaydays() {
            const n = Math.max(1, Math.min(12, planCfg.nQuincenas || 6));
            const today = new Date(); today.setHours(0, 0, 0, 0);
            const days = [planCfg.d1, planCfg.d2];
            const out = [];
            for (let i = 0; i < n + 2; i++) {
                const yy = today.getFullYear() + Math.floor((today.getMonth() + i) / 12);
                const mm = (today.getMonth() + i) % 12;
                const ld = lastDay(yy, mm);
                for (const pd of days) {
                    const day = pd === 'ultimo' ? ld : Math.min(Number(pd) || ld, ld);
                    const dt = new Date(yy, mm, day);
                    if (dt >= today) out.push(dt);
                }
            }
            out.sort((a, b) => a - b);
            return out.slice(0, n);
        }

        const plan = computed(() => {
            if (!rates.bcv || !rates.usdt) return { status: 'norates' };
            const disp = Number(planCfg.disponible) || 0;
            if (!(disp > 0)) return { status: 'noconfig' };
            const cur = planCfg.moneda;

            const paydays = generatePaydays().map(d => ({ date: d, capacity: disp, allocs: [], leftover: 0 }));
            if (!paydays.length) return { status: 'noconfig' };

            const debts = deudas.value
                .filter(d => d.estado !== 'pagada' && d.tipo === 'por_pagar')
                .map(d => ({ ...d, saldoConv: convertir(saldo(d), d.moneda, cur) }))
                .filter(d => d.saldoConv > 0.0001)
                .sort((a, b) => {
                    const av = a.fecha_vencimiento || '9999-12-31', bv = b.fecha_vencimiento || '9999-12-31';
                    return av < bv ? -1 : av > bv ? 1 : a.id - b.id;
                });

            const totalDeuda = debts.reduce((s, d) => s + d.saldoConv, 0);
            const risky = [];

            for (const d of debts) {
                let remaining = d.saldoConv;
                let completion = null;
                for (const p of paydays) {
                    if (remaining <= 0.0001) break;
                    if (p.capacity <= 0.0001) continue;
                    const take = Math.min(p.capacity, remaining);
                    p.capacity -= take; remaining -= take;
                    const completes = remaining <= 0.0001;
                    p.allocs.push({ id: d.id, descripcion: d.descripcion, contraparte: d.contraparte, moneda: d.moneda, monto: take, completes, saldoOrigen: saldo(d) });
                    if (completes) completion = p.date;
                }
                if (remaining > 0.0001) {
                    risky.push({ ...d, reason: 'unfunded' });
                } else if (d.fecha_vencimiento) {
                    const due = new Date(d.fecha_vencimiento + 'T00:00:00');
                    if (completion > due) {
                        risky.push({ ...d, reason: 'late', completion, lateDays: Math.round((completion - due) / 86400000) });
                    }
                }
            }
            paydays.forEach(p => { p.leftover = p.capacity; });
            let lastIdx = -1;
            paydays.forEach((p, i) => { if (p.allocs.length) lastIdx = i; });

            return {
                status: 'ok',
                paydays: paydays.slice(0, lastIdx + 1),
                risky, totalDeuda, disponible: disp, cur,
                quincenas: Math.ceil(totalDeuda / disp),
                count: debts.length,
            };
        });

        const fmtDate = (d) => d.toLocaleDateString('es-VE', { weekday: 'short', day: 'numeric', month: 'short' });

        const brecha = computed(() => {
            if (!rates.bcv || !rates.usdt) return '—';
            return '+' + (((rates.usdt - rates.bcv) / rates.bcv) * 100).toFixed(1) + '%';
        });

        const pageSubtitle = computed(() => ({
            dashboard: 'Resumen de lo que debes y lo que te deben',
            deudas: 'Registro y control de todas tus deudas',
            plan: 'Qué pagar en cada quincena sin quedar mal',
            tasas: 'Tasas de cambio para las conversiones',
            gastos: 'Próximamente',
            metas: 'Próximamente',
        }[currentView.value] || ''));

        /* ---------- Persistencia config planificador ---------- */
        const savedCfg = JSON.parse(localStorage.getItem('planCfg') || 'null');
        if (savedCfg) Object.assign(planCfg, savedCfg);
        watch(planCfg, () => localStorage.setItem('planCfg', JSON.stringify(planCfg)), { deep: true });

        /* ---------- Init ---------- */
        onMounted(() => {
            const h = location.hash.replace('#', '');
            if (nav.some(n => n.id === h && !n.soon)) currentView.value = h;
            loadRates();
            loadDeudas();
        });

        return {
            deudas, rates, ratesInfo, loadingRates, currentView, verMoneda, filtro, sidebarOpen, showForm, toast,
            monedas, nav, form, filtros, planCfg,
            symOf, curColor, sym, fmt, fmtShort, dueDays, dueClass, fmtDate,
            loadRates, editRates, openForm, closeForm, save, abonar, toggleEstado, del, go,
            totals, countCobrar, porMoneda, barMax, barW, donut, proximos, nextDue, filtered, brecha, pageSubtitle, plan,
        };
    },
}).mount('#app');

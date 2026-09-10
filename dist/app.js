"use strict";
function localISODate(d = new Date()) { const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000); return local.toISOString().slice(0, 10); }
const bootQuery = new URLSearchParams(location.search);
const demoMode = bootQuery.get('demo') === '1';
const previewMode = bootQuery.get('preview') === '1';
const today = demoMode ? '2026-09-09' : localISODate();
const roleLabels = { office: 'Office / Dispatch', truck1: 'Truck 1', truck2: 'Truck 2', truck3: 'Truck 3' };
const truckForRole = (role) => role === 'office' ? null : Number(role.replace('truck', ''));
const money = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
function changeStatusLabel(label) { return previewMode ? 'Saved in owner preview' : label; }
const APP_BUILD = '20260910-mobile1';
async function cleanupPreviewServiceWorkers() {
    if (!previewMode)
        return false;
    try {
        const hadController = 'serviceWorker' in navigator && !!navigator.serviceWorker.controller;
        if ('serviceWorker' in navigator) {
            const regs = await navigator.serviceWorker.getRegistrations();
            await Promise.all(regs.map(r => r.unregister()));
        }
        if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.filter(k => k.startsWith('ppt-pest-os-')).map(k => caches.delete(k)));
        }
        if (hadController && bootQuery.get('fresh') !== APP_BUILD) {
            const u = new URL(location.href);
            u.searchParams.set('fresh', APP_BUILD);
            location.replace(u.toString());
            return true;
        }
    }
    catch { }
    return false;
}
const id = () => crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now();
const seedJobs = [
    { id: 'job-truck-1', customer_name: 'Canyon Oaks HOA', property_address: 'Chino Hills, CA', scheduled_date: today, start_time: '08:00', end_time: '09:00', truck_id: 1, technician: 'Marco / Truck 1', status: 'scheduled', service_type: 'Rodent Inspection', pest_types: ['Rodents'], scope: 'Inspect clubhouse, receiving area and dumpster perimeter.', internal_notes: 'Gate code confirmed with office.', customer_notes: '', treatment_details: '', materials: 'Monitoring devices', areas_treated: 'Clubhouse perimeter', completion_notes: '', signature_name: '', signature_data: '', completed_at: '', follow_up_required: false, follow_up_date: '', billing_status: 'ready_to_bill', invoice_number: '', amount: 285, billing_notes: '', revision: 1 },
    { id: 'job-truck-2', customer_name: 'Inland Retail Center', property_address: 'Ontario, CA', scheduled_date: today, start_time: '10:30', end_time: '12:00', truck_id: 2, technician: 'Luis / Truck 2', status: 'in_progress', service_type: 'Recurring Commercial', pest_types: ['Roaches', 'Rodents'], scope: 'Service food-service perimeter and receiving.', internal_notes: 'Manager requests receiving check first.', customer_notes: '', treatment_details: 'Inspect and service approved devices per scope.', materials: 'Bait stations; monitoring devices', areas_treated: 'Receiving; food-service perimeter', completion_notes: '', signature_name: '', signature_data: '', completed_at: '', follow_up_required: false, follow_up_date: '', billing_status: 'not_ready', invoice_number: '', amount: 420, billing_notes: '', revision: 1 },
    { id: 'job-truck-3', customer_name: 'Riverwalk Country Club', property_address: 'San Diego, CA', scheduled_date: today, start_time: '13:00', end_time: '15:00', truck_id: 3, technician: 'Andre / Truck 3', status: 'scheduled', service_type: 'Gopher / Wildlife', pest_types: ['Gophers'], scope: 'Inspect priority greens and clubhouse perimeter.', internal_notes: 'Coordinate with grounds lead.', customer_notes: '', treatment_details: '', materials: '', areas_treated: '', completion_notes: '', signature_name: '', signature_data: '', completed_at: '', follow_up_required: true, follow_up_date: '2026-09-23', billing_status: 'not_ready', invoice_number: '', amount: 450, billing_notes: '', revision: 1 },
    { id: 'job-review-1', customer_name: 'Pinecrest Apartments', property_address: 'Rancho Cucamonga, CA', scheduled_date: '2026-09-10', start_time: '', end_time: '', truck_id: null, technician: '', status: 'review_needed', service_type: 'Bed Bug Inspection', pest_types: ['Bed Bugs'], scope: 'Resident reported activity in one unit. Office review required.', internal_notes: 'Submitted from field.', customer_notes: '', treatment_details: '', materials: '', areas_treated: '', completion_notes: '', signature_name: '', signature_data: '', completed_at: '', follow_up_required: false, follow_up_date: '', billing_status: 'not_ready', invoice_number: '', amount: 0, billing_notes: '', revision: 1 },
    { id: 'job-done-1', customer_name: 'Mesa Logistics', property_address: 'Fontana, CA', scheduled_date: today, start_time: '07:00', end_time: '08:00', truck_id: 1, technician: 'Marco / Truck 1', status: 'completed', service_type: 'Warehouse IPM', pest_types: ['Rodents'], scope: 'Monthly warehouse IPM.', internal_notes: '', customer_notes: 'No active interior findings at time of service.', treatment_details: 'Inspected and serviced existing monitoring devices.', materials: 'Monitoring devices', areas_treated: 'Receiving and exterior dock', completion_notes: 'Service completed; no active interior findings.', signature_name: 'A. Lopez', signature_data: 'signed', completed_at: '2026-09-09T08:02:00-07:00', follow_up_required: false, follow_up_date: '', billing_status: 'invoiced', invoice_number: 'PPT-1042', amount: 350, billing_notes: 'Net 30', revision: 1 },
    { id: 'job-future-1', customer_name: 'Westfield Medical', property_address: 'Riverside, CA', scheduled_date: '2026-09-11', start_time: '09:00', end_time: '10:30', truck_id: 2, technician: 'Luis / Truck 2', status: 'scheduled', service_type: 'Exterior Pest Prevention', pest_types: ['Ants', 'Spiders'], scope: 'Exterior inspection and approved recurring service.', internal_notes: 'Check loading zone.', customer_notes: '', treatment_details: '', materials: '', areas_treated: '', completion_notes: '', signature_name: '', signature_data: '', completed_at: '', follow_up_required: false, follow_up_date: '', billing_status: 'not_ready', invoice_number: '', amount: 325, billing_notes: '', revision: 1 },
    { id: 'job-future-2', customer_name: 'Summit Hotel', property_address: 'Corona, CA', scheduled_date: '2026-09-12', start_time: '11:00', end_time: '12:00', truck_id: 3, technician: 'Andre / Truck 3', status: 'scheduled', service_type: 'Hospitality IPM', pest_types: ['Ants', 'Roaches'], scope: 'Back-of-house and exterior service.', internal_notes: '', customer_notes: '', treatment_details: '', materials: '', areas_treated: '', completion_notes: '', signature_name: '', signature_data: '', completed_at: '', follow_up_required: false, follow_up_date: '', billing_status: 'not_ready', invoice_number: '', amount: 390, billing_notes: '', revision: 1 }
];
const seedCustomers = [
    { id: 'c1', name: 'Canyon Oaks HOA', phone: '(909) 555-0132', email: 'manager@canyonoaks.example', billing_contact: 'HOA Office', notes: 'Commercial recurring account.', properties: [{ id: 'p1', address: 'Chino Hills, CA', type: 'HOA / Clubhouse', access: 'Call manager before arrival.', history: ['2026-08-14 — Rodent monitoring service', '2026-07-12 — Exterior inspection'] }], revision: 1 },
    { id: 'c2', name: 'Inland Retail Center', phone: '(909) 555-0188', email: 'facilities@inlandretail.example', billing_contact: 'Facilities AP', notes: 'Food-service tenants; documentation matters.', properties: [{ id: 'p2', address: 'Ontario, CA', type: 'Retail Center', access: 'Receiving gate after 9 AM.', history: ['2026-08-26 — Recurring commercial service', '2026-08-12 — Rodent device inspection'] }], revision: 1 },
    { id: 'c3', name: 'Riverwalk Country Club', phone: '(619) 555-0147', email: 'grounds@riverwalk.example', billing_contact: 'Club Office', notes: 'Coordinate around course operations.', properties: [{ id: 'p3', address: 'San Diego, CA', type: 'Golf / Country Club', access: 'Check in with grounds lead.', history: ['2026-08-28 — Gopher activity inspection', '2026-08-14 — Grounds service'] }], revision: 1 },
    { id: 'c4', name: 'Mesa Logistics', phone: '(909) 555-0193', email: 'ops@mesalogistics.example', billing_contact: 'Accounting', notes: 'Warehouse recurring.', properties: [{ id: 'p4', address: 'Fontana, CA', type: 'Warehouse', access: 'Dock office check-in.', history: ['2026-09-09 — Completed monthly IPM', '2026-08-09 — Monthly IPM'] }], revision: 1 }
];
const state = { role: 'office', view: 'today', scheduleMode: 'month', focusDate: bootQuery.get('date') || today, selectedJob: null, jobs: demoMode ? seedJobs : [], customers: demoMode ? seedCustomers : [], dailyNotes: {}, weeklyNotes: {}, monthlyNotes: {}, token: '', syncLabel: demoMode ? 'Demo / Local' : 'Sign in required', authenticated: false, team: [], auditEvents: [] };
const app = document.getElementById('app');
// IndexedDB local-first store
const DB = 'ppt-pest-os';
const DBV = 2;
function dbOpen() { return new Promise((resolve, reject) => { const r = indexedDB.open(DB, DBV); r.onupgradeneeded = () => { const d = r.result; if (!d.objectStoreNames.contains('kv'))
    d.createObjectStore('kv'); if (!d.objectStoreNames.contains('outbox'))
    d.createObjectStore('outbox', { keyPath: 'mutation_id' }); if (!d.objectStoreNames.contains('photos'))
    d.createObjectStore('photos', { keyPath: 'id' }); }; r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error); }); }
async function kvGet(key) { const d = await dbOpen(); return new Promise(res => { const r = d.transaction('kv', 'readonly').objectStore('kv').get(key); r.onsuccess = () => res(r.result ?? null); r.onerror = () => res(null); }); }
async function kvPut(key, value) { const d = await dbOpen(); return new Promise((res, rej) => { const tx = d.transaction('kv', 'readwrite'); tx.objectStore('kv').put(value, key); tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); }); }
async function outboxAll() { const d = await dbOpen(); return new Promise(res => { const r = d.transaction('outbox', 'readonly').objectStore('outbox').getAll(); r.onsuccess = () => res((r.result || []).sort((a, b) => a.created_at - b.created_at)); r.onerror = () => res([]); }); }
async function outboxPut(m) { const d = await dbOpen(); return new Promise((res, rej) => { const tx = d.transaction('outbox', 'readwrite'); tx.objectStore('outbox').put(m); tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); }); }
async function outboxDelete(mid) { const d = await dbOpen(); return new Promise(res => { const tx = d.transaction('outbox', 'readwrite'); tx.objectStore('outbox').delete(mid); tx.oncomplete = () => res(); }); }
async function photoAll() { const d = await dbOpen(); return new Promise(res => { const r = d.transaction('photos', 'readonly').objectStore('photos').getAll(); r.onsuccess = () => res(r.result || []); r.onerror = () => res([]); }); }
async function photoPut(photo) { const d = await dbOpen(); return new Promise((res, rej) => { const tx = d.transaction('photos', 'readwrite'); tx.objectStore('photos').put(photo); tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); }); }
async function persist() { await kvPut('jobs', state.jobs); await kvPut('customers', state.customers); await kvPut('notes', state.dailyNotes); await kvPut('weeklyNotes', state.weeklyNotes); await kvPut('monthlyNotes', state.monthlyNotes); }
function visibleJobs() { const t = truckForRole(state.role); return state.role === 'office' ? state.jobs : state.jobs.filter(j => j.truck_id === t); }
function visibleCustomers() { if (state.role === 'office')
    return state.customers; const names = new Set(visibleJobs().map(j => j.customer_name)); return state.customers.filter(c => names.has(c.name)); }
function canEditJob(j) { const t = truckForRole(state.role); return state.role === 'office' || j.truck_id === t; }
function statusLabel(s) { return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); }
function timeLabel(t) { if (!t)
    return 'Unscheduled'; const [h, m] = t.split(':').map(Number); const suffix = h >= 12 ? 'PM' : 'AM'; return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${suffix}`; }
function dateLabel(d) { const dt = new Date(d + 'T12:00:00'); return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }); }
function jobCard(j, compact = false) {
    return `<button class="job-card ${j.status === 'completed' ? 'job-completed' : ''}" data-job="${j.id}">
  <span class="job-time">${esc(timeLabel(j.start_time))}</span><strong>${esc(j.customer_name)}</strong>
  <span>${esc(j.service_type)}</span><small>${esc(j.property_address)}${j.truck_id ? ` · T${j.truck_id}` : ''}</small>
  <em>${esc(statusLabel(j.status))}</em></button>`;
}
function shortTime(t) { if (!t)
    return '—'; const [h, m] = t.split(':').map(Number); const hour = ((h + 11) % 12) + 1; return `${hour}${m ? `:${String(m).padStart(2, '0')}` : ''}${h >= 12 ? 'p' : 'a'}`; }
function monthJobLine(j) { const truck = j.truck_id ? `T${j.truck_id}` : 'R'; const done = j.status === 'completed'; return `<button class="month-job-line ${done ? 'job-completed' : ''}" data-job="${j.id}" title="${esc(j.service_type)} · ${esc(j.property_address)} · ${esc(statusLabel(j.status))}" aria-label="${esc(j.customer_name)} ${esc(statusLabel(j.status))}"><span>${truck}</span><strong>${esc(j.customer_name)}</strong><small>${done ? 'DONE' : esc(shortTime(j.start_time))}</small></button>`; }
function shell(content, opts = {}) {
    const nav = ['Today', 'Schedule', 'Dispatch', 'Customers', 'Jobs', 'Billing', 'Reports', 'Presentation'];
    const active = state.view.toLowerCase();
    const mobilePrimary = ['Today', 'Schedule', 'Dispatch', 'Jobs'];
    const mobileTools = (state.role === 'office' ? ['Customers', 'Billing', 'Reports', 'Presentation', 'Settings'] : ['Customers', 'Settings']);
    return `<div class="shell ${opts.print ? 'printing' : ''}">
<header class="topbar"><div class="brand"><b>PPT PEST</b><span>OPERATING SYSTEM</span></div><div class="top-actions"><span class="sync-state">${navigator.onLine ? 'ONLINE' : 'OFFLINE'} · ${esc(state.syncLabel)}</span><select id="roleSelect" aria-label="Workspace" ${state.authenticated && !demoMode ? 'disabled' : ''}>${Object.keys(roleLabels).map(r => `<option value="${r}" ${r === state.role ? 'selected' : ''}>${roleLabels[r]}</option>`).join('')}</select><button id="syncBtn">Sync</button></div></header>
<div class="body"><aside class="sidebar"><div class="side-title">WORKSPACE</div>${nav.filter(n => state.role === 'office' || !['Billing', 'Reports', 'Presentation'].includes(n)).map(n => `<button data-nav="${n.toLowerCase()}" class="${active === n.toLowerCase() ? 'active' : ''}">${n}</button>`).join('')}<div class="side-foot"><button data-nav="settings" class="${active === 'settings' ? 'active' : ''}">Settings</button><button id="printBtn">Print</button></div></aside><main>${content}</main></div>
<nav class="bottom-nav">${mobilePrimary.map(n => `<button data-nav="${n.toLowerCase()}" class="${active === n.toLowerCase() ? 'active' : ''}">${n}</button>`).join('')}<button id="mobileMoreBtn" class="${['customers', 'billing', 'reports', 'presentation', 'settings'].includes(active) ? 'active' : ''}" aria-expanded="false" aria-controls="mobileMoreSheet">More</button></nav>
<div id="mobileMoreSheet" class="mobile-sheet" hidden><button id="mobileMoreClose" class="mobile-sheet-backdrop" aria-label="Close menu"></button><section class="mobile-sheet-panel" role="dialog" aria-modal="true" aria-label="Mobile tools"><header><b>MOBILE TOOLS</b><button id="mobileMoreCloseBtn" aria-label="Close menu">×</button></header><div class="mobile-sheet-links">${mobileTools.map(n => `<button data-nav="${n.toLowerCase()}" class="${active === n.toLowerCase() ? 'active' : ''}">${n}</button>`).join('')}<button id="mobileSyncBtn">Sync</button><button id="mobilePrintBtn">Print</button></div></section></div></div>`;
}
function pageHeader(title, sub, actions = '') { return `<div class="page-head"><div><h1>${title}</h1><p>${sub}</p></div><div class="page-actions">${actions}</div></div>`; }
function plannerDate() { return state.view === 'schedule' ? state.focusDate : today; }
function renderToday() {
    const activeDate = plannerDate();
    const truck = truckForRole(state.role);
    const jobs = visibleJobs().filter(j => j.scheduled_date === activeDate && (truck === null || j.truck_id === truck)).sort((a, b) => a.start_time.localeCompare(b.start_time));
    const hours = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
    const noteKey = `${state.role}:${activeDate}`;
    const completed = jobs.filter(j => j.status === 'completed').length;
    return shell(`<section class="print-page daily-print">${pageHeader(state.view === 'schedule' ? 'Daily Job Planner' : 'Today', `${roleLabels[state.role]} · ${dateLabel(activeDate)}`, `<button id="quickAdd">+ Add Job</button>`)}
<div class="stats-line"><span><b>${jobs.length}</b> jobs</span><span><b>${completed}</b> complete</span><span><b>${jobs.filter(j => j.status === 'review_needed').length}</b> review</span></div>
<div class="daily-layout"><div class="hour-grid"><div class="section-label">HOURLY PLAN / JOBS</div>${hours.map(h => { const slot = jobs.filter(j => j.start_time.slice(0, 2) === h.slice(0, 2)); return `<div class="hour-row"><time>${timeLabel(h)}</time><div>${slot.map(j => jobCard(j, true)).join('') || '<span class="write-line"></span>'}</div></div>`; }).join('')}</div><div class="notes-panel"><div class="section-label">DAILY NOTES</div><textarea id="dailyNotes" placeholder="Write notes here…">${esc(state.dailyNotes[noteKey] || '')}</textarea></div></div>
<div class="unscheduled"><div class="section-label">UNSCHEDULED / REVIEW</div>${visibleJobs().filter(j => j.status === 'review_needed').map(j => jobCard(j, true)).join('') || '<div class="empty">No jobs waiting for review.</div>'}</div></section>`);
}
function weekDates(base = state.focusDate) { const d = new Date(base + 'T12:00:00'); const day = (d.getDay() + 6) % 7; d.setDate(d.getDate() - day); return Array.from({ length: 7 }, (_, i) => { const x = new Date(d); x.setDate(d.getDate() + i); return localISODate(x); }); }
function weekKey(base = state.focusDate) { return `${state.role}:${weekDates(base)[0]}`; }
function renderWeek() { const jobs = visibleJobs(); const dates = weekDates(state.focusDate); const start = new Date(dates[0] + 'T12:00:00'); const title = start.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }); return `<section class="print-page weekly-print">${pageHeader('Weekly Job Planner', `${roleLabels[state.role]} · Week of ${title}`)}<div class="week-grid">${dates.map(d => `<div class="day-block"><header><b>${new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()}</b><span>${d.slice(5).replace('-', '/')}</span></header>${jobs.filter(j => j.scheduled_date === d).map(j => jobCard(j, true)).join('') || '<span class="write-line"></span><span class="write-line"></span><span class="write-line"></span>'}</div>`).join('')}<div class="day-block carry"><header><b>NOTES / CARRYOVER</b></header><textarea id="weeklyNotesArea" placeholder="Weekly notes…">${esc(state.weeklyNotes[weekKey()] || '')}</textarea></div></div></section>`; }
function monthCells(base = state.focusDate) { const b = new Date(base + 'T12:00:00'); const y = b.getFullYear(), m = b.getMonth(); const first = new Date(y, m, 1, 12); const pad = (first.getDay() + 6) % 7; const days = new Date(y, m + 1, 0).getDate(); const arr = []; for (let i = 0; i < pad; i++)
    arr.push(null); for (let d = 1; d <= days; d++)
    arr.push(`${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`); while (arr.length % 7)
    arr.push(null); return arr; }
function monthKey(base = state.focusDate) { return `${state.role}:${base.slice(0, 7)}`; }
function monthTitle(base = state.focusDate) { return new Date(base.slice(0, 7) + '-01T12:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }); }
function renderMonth() { const jobs = visibleJobs(); return `<section class="print-page month-print">${pageHeader('Monthly Job Planner', `${roleLabels[state.role]} · ${monthTitle(state.focusDate)}`, `<span class="micro">HIGHLIGHT / CHECK JOB WHEN COMPLETE</span>`)}<div class="month-weekdays">${['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(x => `<b>${x}</b>`).join('')}</div><div class="month-grid">${monthCells(state.focusDate).map(d => `<div class="month-cell ${!d ? 'blank' : ''}">${d ? `<time>${Number(d.slice(-2))}</time>${jobs.filter(j => j.scheduled_date === d).map(j => monthJobLine(j)).join('')}<span class="month-write"></span><span class="month-write"></span>` : ''}</div>`).join('')}</div><div class="month-notes"><b>MONTH NOTES / CARRYOVER</b><textarea id="monthlyNotesArea" placeholder="Month notes, carryover jobs, reminders…">${esc(state.monthlyNotes[monthKey()] || '')}</textarea></div></section>`; }
function schedulePeriodLabel() { if (state.scheduleMode === 'month')
    return monthTitle(state.focusDate); if (state.scheduleMode === 'week') {
    const ds = weekDates(state.focusDate);
    const a = new Date(ds[0] + 'T12:00:00'), b = new Date(ds[6] + 'T12:00:00');
    return `${a.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${b.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
} return dateLabel(state.focusDate); }
function renderSchedule() { const buttons = `<div class="schedule-controls"><div class="date-nav"><button data-date-step="-1" aria-label="Previous period">←</button><button data-date-today>Today</button><strong>${esc(schedulePeriodLabel())}</strong><button data-date-step="1" aria-label="Next period">→</button></div><div class="seg"><button data-mode="day" ${state.scheduleMode === 'day' ? 'class="active"' : ''}>Day</button><button data-mode="week" ${state.scheduleMode === 'week' ? 'class="active"' : ''}>Week</button><button data-mode="month" ${state.scheduleMode === 'month' ? 'class="active"' : ''}>Month</button></div></div>`; const body = state.scheduleMode === 'day' ? renderTodayInner() : state.scheduleMode === 'week' ? renderWeek() : renderMonth(); return shell(`<div class="schedule-wrap">${pageHeader('Schedule', 'Daily, weekly and monthly job planning.', buttons)}${body}</div>`); }
function shiftFocus(dir) { const d = new Date(state.focusDate + 'T12:00:00'); if (state.scheduleMode === 'month')
    d.setMonth(d.getMonth() + dir);
else
    d.setDate(d.getDate() + dir * (state.scheduleMode === 'week' ? 7 : 1)); state.focusDate = localISODate(d); updateUrl(); render(); }
function updateUrl() { const params = new URLSearchParams(); if (demoMode)
    params.set('demo', '1'); if (previewMode)
    params.set('preview', '1'); params.set('view', state.view); if (demoMode)
    params.set('role', state.role); params.set('date', state.focusDate); if (state.view === 'schedule')
    params.set('mode', state.scheduleMode); history.replaceState(null, '', '?' + params.toString()); }
function renderTodayInner() { const saved = state.view; return `<div class="nested-daily">${renderToday().match(/<section class="print-page daily-print">([\s\S]*?)<\/section>/)?.[1] || ''}</div>`; }
function renderDispatch() { const jobs = visibleJobs(); const lanes = [{ id: null, label: 'REVIEW / UNSCHEDULED' }, { id: 1, label: 'TRUCK 1' }, { id: 2, label: 'TRUCK 2' }, { id: 3, label: 'TRUCK 3' }]; const allowed = state.role === 'office' ? lanes : lanes.filter(l => l.id === truckForRole(state.role) || l.id === null); return shell(`${pageHeader('Dispatch', 'One live operating board across all three trucks.', state.role === 'office' ? '<button id="quickAdd">+ Add Job</button>' : '')}<section class="dispatch-board">${allowed.map(l => `<div class="dispatch-lane"><header><b>${l.label}</b><span>${jobs.filter(j => j.truck_id === l.id && j.status !== 'completed').length}</span></header><div class="lane-jobs">${jobs.filter(j => j.truck_id === l.id && j.status !== 'completed').map(j => jobCard(j)).join('') || '<div class="empty">No open jobs.</div>'}</div></div>`).join('')}</section><section class="completed-strip"><div class="section-label">COMPLETED TODAY</div>${jobs.filter(j => j.scheduled_date === today && j.status === 'completed').map(j => jobCard(j, true)).join('') || '<div class="empty">No completed jobs yet.</div>'}</section>`); }
function renderCustomers() { const action = state.role === 'office' ? '<button id="addCustomerBtn">+ Add Customer</button>' : ''; return shell(`${pageHeader('Customers & Properties', 'Service history stays with the property, not on loose paper.', action)}<div class="customer-list">${visibleCustomers().map(c => `<article class="customer-row" data-customer="${c.id}"><div><h3>${esc(c.name)}</h3><p>${esc(c.phone)} · ${esc(c.email)}</p><small>${esc(c.notes)}</small>${state.role === 'office' ? `<div class="customer-actions"><button data-edit-customer="${c.id}">Edit</button><button data-add-property="${c.id}">+ Property</button></div>` : ''}</div><div class="properties">${c.properties.map(p => `<div><b>${esc(p.address)}</b><span>${esc(p.type)}</span><small>${esc(p.access)}</small><details><summary>Service history</summary>${p.history.map(h => `<p>${esc(h)}</p>`).join('')}</details></div>`).join('') || '<div class="empty">No properties yet.</div>'}</div></article>`).join('') || '<div class="empty">No customers available in this workspace.</div>'}</div>`); }
function renderJobs() { const jobs = visibleJobs().sort((a, b) => (a.scheduled_date + a.start_time).localeCompare(b.scheduled_date + b.start_time)); return shell(`${pageHeader('Jobs', 'Search, open and complete the full service record.', '<input id="jobSearch" placeholder="Search jobs…" />')}<div class="job-table"><div class="job-row head"><b>DATE</b><b>CUSTOMER</b><b>SERVICE</b><b>TRUCK</b><b>STATUS</b><b>BILLING</b></div>${jobs.map(j => `<button class="job-row ${j.status === 'completed' ? 'job-completed' : ''}" data-job="${j.id}"><span>${esc(j.scheduled_date)}</span><strong>${esc(j.customer_name)}<small>${esc(j.property_address)}</small></strong><span>${esc(j.service_type)}</span><span>${j.truck_id ? `Truck ${j.truck_id}` : 'Review'}</span><span>${esc(statusLabel(j.status))}</span><span>${esc(j.billing_status.replace(/_/g, ' '))}</span></button>`).join('')}</div>`); }
function renderJobDetail(j) {
    const editable = canEditJob(j);
    const office = state.role === 'office';
    return shell(`<section class="service-record">${pageHeader(esc(j.customer_name), `${esc(j.property_address)} · ${dateLabel(j.scheduled_date)} · ${timeLabel(j.start_time)}`, `<button data-nav="jobs">← Jobs</button><button id="saveJob" ${!editable ? 'disabled' : ''}>Save</button>`)}<div class="record-status"><span>JOB ${esc(j.id)}</span><span>REV ${j.revision}</span><span>${j.truck_id ? `TRUCK ${j.truck_id}` : 'OFFICE REVIEW'}</span></div><form id="jobForm"><div class="record-grid"><section><h2>Schedule & Assignment</h2><label>Date<input name="scheduled_date" type="date" value="${esc(j.scheduled_date)}" ${!editable ? 'disabled' : ''}></label><div class="two"><label>Start<input name="start_time" type="time" value="${esc(j.start_time)}" ${!editable ? 'disabled' : ''}></label><label>End<input name="end_time" type="time" value="${esc(j.end_time)}" ${!editable ? 'disabled' : ''}></label></div><label>Assigned Truck<select name="truck_id" ${!office ? 'disabled' : ''}>${[1, 2, 3].map(t => `<option value="${t}" ${j.truck_id === t ? 'selected' : ''}>Truck ${t}</option>`).join('')}<option value="" ${j.truck_id === null ? 'selected' : ''}>Review / Unassigned</option></select></label><label>Technician<input name="technician" value="${esc(j.technician)}" ${!editable ? 'disabled' : ''}></label><label>Status<select name="status" ${!editable ? 'disabled' : ''}>${['review_needed', 'scheduled', 'en_route', 'in_progress', 'completed', 'follow_up_required', 'cancelled'].map(s => `<option value="${s}" ${j.status === s ? 'selected' : ''}>${statusLabel(s)}</option>`).join('')}</select></label></section>
<section><h2>Service Scope</h2><label>Service Type<input name="service_type" value="${esc(j.service_type)}" ${!editable ? 'disabled' : ''}></label><label>Pest Type(s)<input name="pest_types" value="${esc(j.pest_types.join(', '))}" ${!editable ? 'disabled' : ''}></label><label>Scope / Requested Work<textarea name="scope" ${!editable ? 'disabled' : ''}>${esc(j.scope)}</textarea></label><label>Areas Treated<textarea name="areas_treated" ${!editable ? 'disabled' : ''}>${esc(j.areas_treated)}</textarea></label></section>
<section><h2>Field Service Record</h2><label>Treatment Details<textarea name="treatment_details" ${!editable ? 'disabled' : ''}>${esc(j.treatment_details)}</textarea></label><label>Materials / Products Used<textarea name="materials" ${!editable ? 'disabled' : ''}>${esc(j.materials)}</textarea></label><label>Technician Completion Notes<textarea name="completion_notes" ${!editable ? 'disabled' : ''}>${esc(j.completion_notes)}</textarea></label><label>Customer-visible Notes<textarea name="customer_notes" ${!editable ? 'disabled' : ''}>${esc(j.customer_notes)}</textarea></label></section>
<section><h2>Notes & Follow-up</h2><label>Internal Notes<textarea name="internal_notes" ${!editable ? 'disabled' : ''}>${esc(j.internal_notes)}</textarea></label><label class="check"><input name="follow_up_required" type="checkbox" ${j.follow_up_required ? 'checked' : ''} ${!editable ? 'disabled' : ''}> Follow-up required</label><label>Follow-up Date<input name="follow_up_date" type="date" value="${esc(j.follow_up_date)}" ${!editable ? 'disabled' : ''}></label><label>Photos / Attachments<input id="photosInput" type="file" multiple accept="image/*" ${!editable ? 'disabled' : ''}><small id="photoCount">Local files queue automatically when offline.</small></label></section>
<section><h2>Customer Signature</h2><label>Printed Name<input name="signature_name" value="${esc(j.signature_name)}" ${!editable ? 'disabled' : ''}></label><div class="signature-box"><canvas id="signatureCanvas" width="500" height="150"></canvas><span>Sign here</span></div><button type="button" id="clearSignature" ${!editable ? 'disabled' : ''}>Clear Signature</button></section>
<section><h2>Billing</h2><label>Billing Status<select name="billing_status" ${!office ? 'disabled' : ''}>${['not_ready', 'ready_to_bill', 'invoiced', 'paid', 'past_due', 'no_charge'].map(s => `<option value="${s}" ${j.billing_status === s ? 'selected' : ''}>${s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>`).join('')}</select></label><label>Invoice #<input name="invoice_number" value="${esc(j.invoice_number)}" ${!office ? 'disabled' : ''}></label><label>Amount<input name="amount" type="number" step="0.01" value="${j.amount}" ${!office ? 'disabled' : ''}></label><label>Billing Notes<textarea name="billing_notes" ${!office ? 'disabled' : ''}>${esc(j.billing_notes)}</textarea></label></section></div></form></section>`);
}
function renderBilling() { if (state.role !== 'office')
    return renderToday(); const jobs = state.jobs.filter(j => j.amount > 0); return shell(`${pageHeader('Billing Queue', 'Operational billing status — not a full accounting ledger.')}<div class="billing-summary">${['ready_to_bill', 'invoiced', 'paid', 'past_due'].map(s => `<div><b>${jobs.filter(j => j.billing_status === s).length}</b><span>${s.replace(/_/g, ' ').toUpperCase()}</span><small>${money(jobs.filter(j => j.billing_status === s).reduce((a, j) => a + j.amount, 0))}</small></div>`).join('')}</div><div class="job-table">${jobs.map(j => `<button class="job-row" data-job="${j.id}"><span>${esc(j.invoice_number || '—')}</span><strong>${esc(j.customer_name)}</strong><span>${money(j.amount)}</span><span>${esc(j.billing_status.replace(/_/g, ' '))}</span><span>Truck ${j.truck_id || '—'}</span><span>${esc(j.scheduled_date)}</span></button>`).join('')}</div>`); }
function renderReports() { if (state.role !== 'office')
    return renderToday(); const jobs = state.jobs; const completed = jobs.filter(j => j.status === 'completed'); return shell(`${pageHeader('Reports', 'Simple operating metrics from the same job records.', '<button id="exportBtn">Export JSON</button>')}<div class="report-grid"><article><span>OPEN JOBS</span><b>${jobs.filter(j => !['completed', 'cancelled'].includes(j.status)).length}</b><small>Across all trucks + review</small></article><article><span>COMPLETED</span><b>${completed.length}</b><small>Visible in history, never erased</small></article><article><span>FOLLOW-UPS DUE</span><b>${jobs.filter(j => j.follow_up_required).length}</b><small>Tracked from field record</small></article><article><span>BILLABLE VALUE</span><b>${money(jobs.reduce((a, j) => a + j.amount, 0))}</b><small>Operational estimate / invoice status</small></article></div><div class="truck-report">${[1, 2, 3].map(t => { const tj = jobs.filter(j => j.truck_id === t); return `<article><header><b>TRUCK ${t}</b><span>${tj.length} jobs</span></header><div class="bar"><i style="width:${Math.min(100, (tj.filter(j => j.status === 'completed').length / Math.max(1, tj.length)) * 100)}%"></i></div><p>${tj.filter(j => j.status === 'completed').length} complete · ${tj.filter(j => j.follow_up_required).length} follow-up · ${money(tj.reduce((a, j) => a + j.amount, 0))}</p></article>`; }).join('')}</div><section class="activity-panel"><div class="section-label">RECENT ACTIVITY</div>${state.auditEvents.length ? state.auditEvents.slice(0, 12).map(e => `<div class="activity-row"><b>${esc(e.event_type.replace(/\./g, ' '))}</b><span>${esc(e.summary || e.entity_id)}</span><time>${new Date(e.created_at * 1000).toLocaleString()}</time></div>`).join('') : '<div class="empty">Sign in and sync to load server audit activity.</div>'}</section>`); }
function renderPresentation() { if (state.role !== 'office')
    return renderToday(); return shell(`<section class="presentation owner-preview">${pageHeader('PPT PEST OPERATING SYSTEM', 'OWNER PREVIEW · One shared field-operations system built around the 3-truck paper workflow.', '<button class="primary-demo" data-nav="dispatch">Start Live Demo →</button>')}<div class="hero-rule"></div><div class="presentation-hero"><div><span class="eyeline">BUILT AROUND HOW PPT ACTUALLY WORKS</span><h2>3 TRUCKS.<br>ONE LIVE SYSTEM.</h2><p>Schedule the work once. Give each truck the right jobs. Capture service proof in the field. Sync it back to the office. Keep the familiar paper planners available whenever they are useful.</p><div class="demo-jumps"><button data-nav="dispatch">3-Truck Dispatch</button><button data-nav="schedule">Planner Views</button><button data-nav="reports">Owner Reports</button></div></div><div class="system-diagram"><div class="office-box"><span>ONE OPERATING SPINE</span><b>OFFICE</b><span>Dispatch · Customers · Billing · Reports</span></div><div class="connector"></div><div class="truck-boxes"><div><b>TRUCK 1</b><span>Own jobs + notes</span></div><div><b>TRUCK 2</b><span>Own jobs + notes</span></div><div><b>TRUCK 3</b><span>Own jobs + notes</span></div></div></div></div><div class="owner-value-strip"><div><b>3</b><span>TRUCK WORKSPACES</span></div><div><b>1</b><span>OFFICE DISPATCH BOARD</span></div><div><b>OFFLINE</b><span>FIELD-READY LOCAL DATA</span></div><div><b>OPEN</b><span>SELF-HOSTED SOURCE</span></div></div><div class="presentation-grid"><article><b>01</b><h3>Planner → App</h3><p>Daily hourly breakdown, Weekly job blocks and Monthly completion calendar preserve the current workflow.</p></article><article><b>02</b><h3>Full Job Record</h3><p>Treatments, materials, photos, customer signature, follow-up and billing status stay attached to the job.</p></article><article><b>03</b><h3>Works Offline</h3><p>Field changes save locally first and queue for synchronization when connection returns.</p></article><article><b>04</b><h3>Owner Control</h3><p>Office keeps assignment and billing authority while each truck stays focused on its own operational queue.</p></article></div><div class="demo-sequence"><b>5-MINUTE OWNER WALKTHROUGH</b><ol><li>Open <strong>Dispatch</strong> and show all three trucks.</li><li>Open <strong>Truck 2</strong> and show cross-truck isolation.</li><li>Open a job and show the <strong>full service record</strong>.</li><li>Show <strong>Monthly</strong> completion highlighting and notes.</li><li>Finish with <strong>Reports</strong> and print/export fallback.</li></ol></div></section>`); }
function renderSettings() { const email = demoMode ? 'office@ppt.local' : ''; const password = demoMode ? 'ppt-office-demo' : ''; const previewNotice = previewMode ? '<section class="preview-server-note"><h2>OWNER PREVIEW MODE</h2><p>This public link runs the full seeded local demo. <b>Self-hosted server required</b> for production sign-in, shared sync, team administration and server audit history.</p></section>' : ''; const team = state.role === 'office' && !previewMode ? `<section class="team-panel"><h2>Team Accounts</h2><p>${state.team.length ? `${state.team.length} account(s) loaded from server.` : 'Sign in to manage named Office and truck accounts.'}</p>${state.team.map(u => `<div class="team-row"><b>${esc(u.name || u.email)}</b><span>${u.role === 'office' ? 'Office' : `Truck ${u.truck_id}`}</span><small>${esc(u.email)}</small></div>`).join('')}<button id="addTeamUserBtn" ${!state.token ? 'disabled' : ''}>+ Add Team Account</button></section>` : ''; const serverPanel = previewMode ? `<section><h2>Production Server</h2><p><b>Self-hosted server required.</b></p><p>The owner preview intentionally contains no production credentials or customer database connection.</p><button id="loginBtn" disabled>Sign In Disabled in Preview</button></section>` : `<section><h2>Server Sign In</h2><label>Email<input id="email" value="${email}" autocomplete="username"></label><label>Password<input id="password" type="password" value="${password}" autocomplete="current-password"></label><button id="loginBtn">Sign In</button>${state.token ? '<button id="logoutBtn">Sign Out</button><button id="changePasswordBtn">Change Password</button>' : ''}<small>${demoMode ? 'Presentation credentials only. Production uses named accounts.' : 'Use a named Office or truck account.'}</small></section>`; return shell(`${pageHeader('Settings', 'Workspace identity, server sign-in and data controls.')}<div class="settings-grid">${previewNotice}<section><h2>Workspace</h2><p>Current: <b>${roleLabels[state.role]}</b></p><p>${state.authenticated ? 'Role is locked to the authenticated server account.' : previewMode ? 'Owner preview uses seeded local data only.' : demoMode ? 'Presentation mode uses seeded local data.' : 'Sign in before accessing production records.'}</p></section>${serverPanel}<section><h2>Local Data</h2>${demoMode ? '<button id="resetDemo">Reset Demo Data</button>' : ''}<button id="exportBtn">Export JSON Backup</button><p>Field data is stored in IndexedDB and syncs through the authenticated API when deployed with the server.</p></section>${team}</div>`); }
function render() { if (state.selectedJob) {
    const j = state.jobs.find(x => x.id === state.selectedJob);
    if (j) {
        app.innerHTML = renderJobDetail(j);
        bind();
        return;
    }
} const q = new URLSearchParams(location.search); const forced = q.get('view'); if (forced)
    state.view = forced; switch (state.view) {
    case 'today':
        app.innerHTML = renderToday();
        break;
    case 'schedule':
        app.innerHTML = renderSchedule();
        break;
    case 'dispatch':
        app.innerHTML = renderDispatch();
        break;
    case 'customers':
        app.innerHTML = renderCustomers();
        break;
    case 'jobs':
        app.innerHTML = renderJobs();
        break;
    case 'billing':
        app.innerHTML = renderBilling();
        break;
    case 'reports':
        app.innerHTML = renderReports();
        break;
    case 'presentation':
        app.innerHTML = renderPresentation();
        break;
    case 'settings':
        app.innerHTML = renderSettings();
        break;
    default:
        state.view = 'today';
        app.innerHTML = renderToday();
} bind(); }
function preparePrint() { let style = document.getElementById('ppt-dynamic-print-page'); if (!style) {
    style = document.createElement('style');
    style.id = 'ppt-dynamic-print-page';
    document.head.appendChild(style);
} const landscape = (state.view === 'schedule' && state.scheduleMode === 'month') || state.view === 'presentation'; style.textContent = `@page{size:letter ${landscape ? 'landscape' : 'portrait'};margin:${landscape ? '.25in' : '.28in'}}`; window.addEventListener('afterprint', () => style?.remove(), { once: true }); }
function bind() {
    document.querySelectorAll('[data-nav]').forEach(el => el.onclick = () => { state.selectedJob = null; state.view = el.dataset.nav || 'today'; updateUrl(); render(); });
    document.querySelectorAll('[data-job]').forEach(el => el.onclick = () => { state.selectedJob = el.dataset.job || null; render(); });
    document.querySelectorAll('[data-mode]').forEach(el => el.onclick = () => { state.scheduleMode = el.dataset.mode; updateUrl(); render(); });
    document.querySelectorAll('[data-date-step]').forEach(el => el.onclick = () => shiftFocus(Number(el.dataset.dateStep || 0)));
    document.querySelector('[data-date-today]')?.addEventListener('click', () => { state.focusDate = today; updateUrl(); render(); });
    const rs = document.getElementById('roleSelect');
    if (rs)
        rs.onchange = () => { state.role = rs.value; localStorage.setItem('ppt-role', state.role); state.selectedJob = null; updateUrl(); render(); };
    const notes = document.getElementById('dailyNotes');
    if (notes)
        notes.oninput = async () => { state.dailyNotes[`${state.role}:${plannerDate()}`] = notes.value; await persist(); };
    const weekly = document.getElementById('weeklyNotesArea');
    if (weekly)
        weekly.oninput = async () => { state.weeklyNotes[weekKey()] = weekly.value; await persist(); };
    const monthly = document.getElementById('monthlyNotesArea');
    if (monthly)
        monthly.oninput = async () => { state.monthlyNotes[monthKey()] = monthly.value; await persist(); };
    const print = document.getElementById('printBtn');
    if (print)
        print.onclick = () => { preparePrint(); window.print(); };
    const sync = document.getElementById('syncBtn');
    if (sync)
        sync.onclick = () => syncNow();
    const more = document.getElementById('mobileMoreBtn');
    const sheet = document.getElementById('mobileMoreSheet');
    const closeSheet = () => { if (sheet)
        sheet.hidden = true; if (more)
        more.setAttribute('aria-expanded', 'false'); };
    if (more && sheet)
        more.onclick = () => { sheet.hidden = false; more.setAttribute('aria-expanded', 'true'); };
    document.getElementById('mobileMoreClose')?.addEventListener('click', closeSheet);
    document.getElementById('mobileMoreCloseBtn')?.addEventListener('click', closeSheet);
    document.getElementById('mobileSyncBtn')?.addEventListener('click', () => { closeSheet(); syncNow(); });
    document.getElementById('mobilePrintBtn')?.addEventListener('click', () => { closeSheet(); preparePrint(); window.print(); });
    const add = document.getElementById('quickAdd');
    if (add)
        add.onclick = () => quickAdd();
    const save = document.getElementById('saveJob');
    if (save)
        save.onclick = (e) => { e.preventDefault(); saveJob(); };
    const search = document.getElementById('jobSearch');
    if (search)
        search.oninput = () => { const q = search.value.toLowerCase(); document.querySelectorAll('.job-row[data-job]').forEach(r => r.style.display = r.textContent.toLowerCase().includes(q) ? 'grid' : 'none'); };
    const exp = document.getElementById('exportBtn');
    if (exp)
        exp.onclick = () => exportBackup();
    const reset = document.getElementById('resetDemo');
    if (reset)
        reset.onclick = async () => { state.jobs = structuredClone(seedJobs); state.customers = structuredClone(seedCustomers); state.dailyNotes = {}; state.weeklyNotes = {}; state.monthlyNotes = {}; await persist(); render(); };
    const login = document.getElementById('loginBtn');
    if (login)
        login.onclick = () => loginServer();
    const logout = document.getElementById('logoutBtn');
    if (logout)
        logout.onclick = () => logoutServer();
    const changePw = document.getElementById('changePasswordBtn');
    if (changePw)
        changePw.onclick = () => changePassword();
    const addTeam = document.getElementById('addTeamUserBtn');
    if (addTeam)
        addTeam.onclick = () => addTeamUser();
    const addCustomer = document.getElementById('addCustomerBtn');
    if (addCustomer)
        addCustomer.onclick = () => quickAddCustomer();
    document.querySelectorAll('[data-edit-customer]').forEach(el => el.onclick = () => editCustomer(el.dataset.editCustomer || ''));
    document.querySelectorAll('[data-add-property]').forEach(el => el.onclick = () => addProperty(el.dataset.addProperty || ''));
    setupSignature();
    setupPhotos();
}
async function quickAddCustomer() { if (state.role !== 'office')
    return; const name = prompt('Customer / company name'); if (!name)
    return; const phone = prompt('Phone', '') || ''; const email = prompt('Email', '') || ''; const address = prompt('Primary property address', '') || ''; const c = { id: 'local-customer-' + id(), name, phone, email, billing_contact: prompt('Billing contact', '') || '', notes: prompt('Customer notes', '') || '', properties: address ? [{ id: 'property-' + id(), address, type: prompt('Property type', 'Commercial') || 'Commercial', access: prompt('Access instructions', '') || '', history: [] }] : [], revision: 1 }; state.customers.push(c); await persist(); await outboxPut({ mutation_id: `create:${c.id}`, entity: 'customer', entity_id: c.id, base_revision: 0, changes: { ...c, _create: true }, created_at: Date.now() }); state.syncLabel = changeStatusLabel('Customer queued for sync'); render(); }
async function editCustomer(customerId) { if (state.role !== 'office')
    return; const c = state.customers.find(x => x.id === customerId); if (!c)
    return; const before = c.revision || 1; const name = prompt('Customer / company name', c.name); if (name === null)
    return; c.name = name.trim() || c.name; c.phone = prompt('Phone', c.phone) ?? c.phone; c.email = prompt('Email', c.email) ?? c.email; c.billing_contact = prompt('Billing contact', c.billing_contact) ?? c.billing_contact; c.notes = prompt('Customer notes', c.notes) ?? c.notes; c.revision = before + 1; await persist(); await outboxPut({ mutation_id: id(), entity: 'customer', entity_id: c.id, base_revision: before, changes: { name: c.name, phone: c.phone, email: c.email, billing_contact: c.billing_contact, notes: c.notes, properties: c.properties }, created_at: Date.now() }); state.syncLabel = changeStatusLabel('Customer changes queued'); render(); }
async function addProperty(customerId) { if (state.role !== 'office')
    return; const c = state.customers.find(x => x.id === customerId); if (!c)
    return; const address = prompt('Property address'); if (!address)
    return; const before = c.revision || 1; c.properties.push({ id: 'property-' + id(), address, type: prompt('Property type', 'Commercial') || 'Commercial', access: prompt('Access instructions', '') || '', history: [] }); c.revision = before + 1; await persist(); await outboxPut({ mutation_id: id(), entity: 'customer', entity_id: c.id, base_revision: before, changes: { properties: c.properties }, created_at: Date.now() }); state.syncLabel = changeStatusLabel('Property queued for sync'); render(); }
async function quickAdd() { const name = prompt('Customer / property name'); if (!name)
    return; const service = prompt('Service type', 'Inspection') || 'Inspection'; const t = truckForRole(state.role); const j = { id: 'local-' + id(), customer_name: name, property_address: '', scheduled_date: plannerDate(), start_time: '', end_time: '', truck_id: t, technician: '', status: 'review_needed', service_type: service, pest_types: [], scope: '', internal_notes: '', customer_notes: '', treatment_details: '', materials: '', areas_treated: '', completion_notes: '', signature_name: '', signature_data: '', completed_at: '', follow_up_required: false, follow_up_date: '', billing_status: 'not_ready', invoice_number: '', amount: 0, billing_notes: '', revision: 1 }; state.jobs.push(j); await persist(); await outboxPut({ mutation_id: `create:${j.id}`, entity: 'job', entity_id: j.id, base_revision: 0, changes: { ...j, _create: true }, created_at: Date.now() }); state.syncLabel = changeStatusLabel('New job queued for office'); render(); }
async function saveJob() { const j = state.jobs.find(x => x.id === state.selectedJob); const f = document.getElementById('jobForm'); if (!j || !f)
    return; const fd = new FormData(f); const before = j.revision; const editable = ['scheduled_date', 'start_time', 'end_time', 'technician', 'status', 'service_type', 'scope', 'areas_treated', 'treatment_details', 'materials', 'completion_notes', 'customer_notes', 'internal_notes', 'follow_up_date', 'signature_name']; for (const k of editable) {
    if (fd.has(k))
        j[k] = String(fd.get(k) || '');
} j.pest_types = String(fd.get('pest_types') || '').split(',').map(x => x.trim()).filter(Boolean); j.follow_up_required = fd.get('follow_up_required') === 'on'; if (state.role === 'office') {
    j.truck_id = fd.get('truck_id') ? Number(fd.get('truck_id')) : null;
    j.billing_status = String(fd.get('billing_status') || 'not_ready');
    j.invoice_number = String(fd.get('invoice_number') || '');
    j.amount = Number(fd.get('amount') || 0);
    j.billing_notes = String(fd.get('billing_notes') || '');
} if (j.status === 'completed' && !j.completed_at)
    j.completed_at = new Date().toISOString(); if (j.id.startsWith('local-')) {
    await persist();
    await outboxPut({ mutation_id: `create:${j.id}`, entity: 'job', entity_id: j.id, base_revision: 0, changes: { ...j, _create: true }, created_at: Date.now() });
    state.syncLabel = changeStatusLabel('New job queued for office');
    render();
    return;
} j.revision++; await persist(); await outboxPut({ mutation_id: id(), entity: 'job', entity_id: j.id, base_revision: before, changes: { ...j }, created_at: Date.now() }); state.syncLabel = changeStatusLabel('Changes queued'); render(); }
function setupSignature() { const c = document.getElementById('signatureCanvas'); if (!c)
    return; const ctx = c.getContext('2d'); ctx.lineWidth = 2; ctx.lineCap = 'round'; let down = false; const pos = (e) => { const r = c.getBoundingClientRect(); return { x: (e.clientX - r.left) * (c.width / r.width), y: (e.clientY - r.top) * (c.height / r.height) }; }; c.onpointerdown = e => { down = true; const p = pos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); }; c.onpointermove = e => { if (!down)
    return; const p = pos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); }; c.onpointerup = () => { down = false; const j = state.jobs.find(x => x.id === state.selectedJob); if (j)
    j.signature_data = c.toDataURL('image/png'); }; const clear = document.getElementById('clearSignature'); if (clear)
    clear.onclick = () => { ctx.clearRect(0, 0, c.width, c.height); const j = state.jobs.find(x => x.id === state.selectedJob); if (j)
        j.signature_data = ''; }; }
function setupPhotos() { const input = document.getElementById('photosInput'); if (!input)
    return; input.onchange = async () => { const files = Array.from(input.files || []); const count = document.getElementById('photoCount'); if (count)
    count.textContent = `${files.length} file(s) selected. Photo evidence is saved locally and queues for server sync.`; for (const file of files) {
    await photoPut({ id: 'photo-' + id(), job_id: state.selectedJob || '', name: file.name, type: file.type || 'application/octet-stream', size: file.size, blob: file, synced: false, created_at: Date.now() });
} state.syncLabel = changeStatusLabel('Photo evidence queued'); render(); }; }
async function syncAttachments() { const photos = (await photoAll()).filter(p => !p.synced && p.blob); for (const p of photos) {
    const form = new FormData();
    form.append('file', p.blob, p.name);
    const r = await fetch(`/api/jobs/${encodeURIComponent(p.job_id)}/attachments`, { method: 'POST', headers: { 'Authorization': `Bearer ${state.token}`, 'X-Attachment-Id': p.id }, body: form });
    if (r.ok) {
        await photoPut({ ...p, blob: undefined, synced: true });
    }
    else if (r.status !== 404) {
        throw new Error(`Attachment sync failed: ${r.status}`);
    }
} }
async function loadOfficeMeta() { if (state.role !== 'office' || !state.token) {
    state.team = [];
    state.auditEvents = [];
    return;
} const headers = { 'Authorization': `Bearer ${state.token}` }; try {
    const [users, audit] = await Promise.all([fetch('/api/users', { headers }), fetch('/api/audit?limit=30', { headers })]);
    if (users.ok)
        state.team = await users.json();
    if (audit.ok)
        state.auditEvents = await audit.json();
}
catch { } }
async function addTeamUser() { if (state.role !== 'office' || !state.token)
    return; const name = prompt('Employee name'); if (!name)
    return; const email = prompt('Email / login'); if (!email)
    return; const role = (prompt('Role: office or truck', 'truck') || 'truck').toLowerCase(); const truckId = role === 'truck' ? Number(prompt('Truck number: 1, 2, or 3', '1')) : null; const password = prompt('Temporary password (12+ characters)'); if (!password)
    return; const r = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${state.token}` }, body: JSON.stringify({ name, email, role, truck_id: truckId, password }) }); if (!r.ok) {
    alert('Could not create account: ' + await r.text());
    return;
} await loadOfficeMeta(); alert('Team account created.'); render(); }
async function changePassword() { if (!state.token)
    return; const current = prompt('Current password'); if (!current)
    return; const next = prompt('New password (12+ characters)'); if (!next)
    return; const r = await fetch('/api/me/password', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${state.token}` }, body: JSON.stringify({ current_password: current, new_password: next }) }); if (!r.ok) {
    alert('Password change failed: ' + await r.text());
    return;
} state.token = ''; state.authenticated = false; state.team = []; state.auditEvents = []; localStorage.removeItem('ppt-token'); if (!demoMode) {
    state.jobs = [];
    state.customers = [];
    await kvPut('jobs', []);
    await kvPut('customers', []);
} state.syncLabel = 'Password changed · sign in again'; alert('Password updated. Sign in again.'); render(); }
async function applyAuthenticatedUser(data) { state.token = data.token; state.role = data.user.role === 'office' ? 'office' : `truck${data.user.truck_id}`; const u = data.user; state.authenticated = true; localStorage.setItem('ppt-token', state.token); localStorage.setItem('ppt-role', state.role); state.jobs = []; const r = await fetch('/api/jobs', { headers: { 'Authorization': `Bearer ${state.token}` } }); if (!r.ok)
    throw new Error('jobs'); state.jobs = await r.json(); const cr = await fetch('/api/customers', { headers: { 'Authorization': `Bearer ${state.token}` } }); if (cr.ok)
    state.customers = await cr.json(); await loadOfficeMeta(); await persist(); state.syncLabel = 'Signed in · scoped'; }
async function loginServer() { if (previewMode) {
    alert('Server sign-in is disabled in the public owner preview.');
    return;
} const email = document.getElementById('email').value; const password = document.getElementById('password').value; try {
    const r = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    if (!r.ok)
        throw new Error('login');
    const data = await r.json();
    await applyAuthenticatedUser(data);
    alert(`Signed in as ${roleLabels[state.role]}.`);
    render();
}
catch {
    alert('Server sign-in unavailable. Local data remains active.');
} }
async function logoutServer() { const pending = await outboxAll(); const photos = (await photoAll()).filter(p => !p.synced); if (pending.length || photos.length) {
    alert('Sync pending field work before signing out.');
    return;
} state.token = ''; state.authenticated = false; state.team = []; state.auditEvents = []; state.jobs = demoMode ? structuredClone(seedJobs) : []; state.customers = demoMode ? structuredClone(seedCustomers) : []; localStorage.removeItem('ppt-token'); if (!demoMode) {
    await kvPut('jobs', []);
    await kvPut('customers', []);
} state.syncLabel = demoMode ? 'Demo / Local' : 'Signed out'; render(); }
async function syncNow() { if (previewMode) {
    state.syncLabel = 'Owner preview · local only';
    render();
    return;
} if (!navigator.onLine) {
    state.syncLabel = 'Offline — queued';
    render();
    return;
} if (!state.token) {
    state.syncLabel = demoMode ? 'Local demo — sign in to sync' : 'Sign in required';
    render();
    return;
} state.syncLabel = 'Syncing…'; render(); let attentionCount = 0; try {
    const muts = await outboxAll();
    if (muts.length) {
        const r = await fetch('/api/sync/push', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${state.token}` }, body: JSON.stringify({ mutations: muts.map(m => ({ mutation_id: m.mutation_id, entity: m.entity, entity_id: m.entity_id, base_revision: m.base_revision, changes: m.changes })) }) });
        if (!r.ok)
            throw new Error();
        const data = await r.json();
        for (const x of data.results) {
            if (x.status === 'applied' || x.status === 'duplicate')
                await outboxDelete(x.mutation_id);
            if (x.status === 'conflict' || x.status === 'rejected')
                attentionCount++;
            if (x.entity) {
                if (x.entity_type === 'customer') {
                    const ci = state.customers.findIndex(c => c.id === x.entity.id);
                    if (ci >= 0)
                        state.customers[ci] = x.entity;
                    else
                        state.customers.push(x.entity);
                }
                else {
                    const i = state.jobs.findIndex(j => j.id === x.entity.id);
                    if (i >= 0)
                        state.jobs[i] = x.entity;
                    else
                        state.jobs.push(x.entity);
                }
            }
        }
    }
    await syncAttachments();
    const pull = await fetch('/api/sync/pull?since=0', { headers: { 'Authorization': `Bearer ${state.token}` } });
    if (pull.ok) {
        const data = await pull.json();
        for (const j of data.jobs) {
            const i = state.jobs.findIndex(x => x.id === j.id);
            if (i >= 0)
                state.jobs[i] = j;
            else
                state.jobs.push(j);
        }
        if (data.customers) {
            for (const c of data.customers) {
                const ci = state.customers.findIndex(x => x.id === c.id);
                if (ci >= 0)
                    state.customers[ci] = c;
                else
                    state.customers.push(c);
            }
        }
    }
    if (state.role === 'office')
        await loadOfficeMeta();
    await persist();
    state.syncLabel = attentionCount ? 'Needs attention' : 'Synced';
}
catch {
    state.syncLabel = 'Needs attention';
} render(); }
function exportBackup() { const blob = new Blob([JSON.stringify({ exported_at: new Date().toISOString(), jobs: state.jobs, customers: state.customers, notes: state.dailyNotes, weekly_notes: state.weeklyNotes, monthly_notes: state.monthlyNotes }, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'PPT_Pest_OS_Backup.json'; a.click(); URL.revokeObjectURL(a.href); }
async function init() { if (await cleanupPreviewServiceWorkers())
    return; const q = new URLSearchParams(location.search); state.focusDate = q.get('date') || today; const qv = q.get('view'); if (qv)
    state.view = qv; const qr = q.get('role'); state.role = demoMode && qr && roleLabels[qr] ? qr : (localStorage.getItem('ppt-role') || 'office'); const qm = q.get('mode'); if (qm && ['day', 'week', 'month'].includes(qm))
    state.scheduleMode = qm; state.token = localStorage.getItem('ppt-token') || ''; try {
    const jobs = await kvGet('jobs');
    const customers = await kvGet('customers');
    const notes = await kvGet('notes');
    const weekly = await kvGet('weeklyNotes');
    const monthly = await kvGet('monthlyNotes');
    if ((demoMode || state.token) && jobs?.length)
        state.jobs = jobs;
    if ((demoMode || state.token) && customers?.length)
        state.customers = customers;
    if (notes)
        state.dailyNotes = notes;
    if (weekly)
        state.weeklyNotes = weekly;
    if (monthly)
        state.monthlyNotes = monthly;
}
catch { } if (state.token && navigator.onLine) {
    try {
        const me = await fetch('/api/me', { headers: { 'Authorization': `Bearer ${state.token}` } });
        if (!me.ok)
            throw new Error('session');
        const user = await me.json();
        await applyAuthenticatedUser({ token: state.token, user });
    }
    catch {
        state.token = '';
        state.authenticated = false;
        localStorage.removeItem('ppt-token');
        if (!demoMode) {
            state.jobs = [];
            state.customers = [];
        }
        state.syncLabel = 'Session expired · sign in';
    }
} if ('serviceWorker' in navigator && location.protocol.startsWith('http'))
    navigator.serviceWorker.register(`./sw.js?v=${APP_BUILD}`).then(r => r.update()).catch(() => { }); window.addEventListener('online', () => { state.syncLabel = state.token ? 'Online — ready to sync' : (demoMode ? 'Demo / Local' : 'Sign in required'); render(); }); window.addEventListener('offline', () => { state.syncLabel = 'Offline — local data active'; render(); }); render(); }
init();

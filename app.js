// ============================================================
// StudyPlanner — app.js
// All UI state, rendering, chart initialisation, modal logic
// ============================================================

const COLORS  = ['#6c8eff','#a78bfa','#34d399','#fbbf24','#f87171','#38bdf8'];
const AVATARBG = ['#6c8eff','#a78bfa','#34d399','#f87171','#fbbf24'];

// ── Data ────────────────────────────────────────────────────
let subjects = [
  {id:1, name:'DBMS',                 faculty:'Dr. Rahman', color:'#6c8eff', priority:'HIGH',   avg:65},
  {id:2, name:'Artificial Intelligence', faculty:'Dr. Nasrin', color:'#a78bfa', priority:'MEDIUM', avg:78},
  {id:3, name:'Mathematics',          faculty:'Prof. Ali',   color:'#34d399', priority:'HIGH',   avg:58},
  {id:4, name:'Computer Networks',    faculty:'Dr. Hasan',  color:'#fbbf24', priority:'MEDIUM', avg:72},
  {id:5, name:'Operating Systems',    faculty:'Dr. Karim',  color:'#f87171', priority:'LOW',    avg:81},
];

let events = [
  {id:1, title:'CT-1 DBMS',          type:'CT',         date:'2026-05-20', subjectId:1},
  {id:2, title:'AI Mid Exam',         type:'MID',        date:'2026-05-28', subjectId:2},
  {id:3, title:'Math Assignment',     type:'ASSIGNMENT', date:'2026-05-22', subjectId:3},
  {id:4, title:'Networks CT-2',       type:'CT',         date:'2026-06-01', subjectId:4},
  {id:5, title:'Eid Holiday',         type:'HOLIDAY',    date:'2026-06-05', subjectId:null},
  {id:6, title:'OS Final',            type:'FINAL',      date:'2026-06-20', subjectId:5},
];

let tasks = [
  {id:1, title:'Complete ER Diagram for DBMS project',     subjectId:1, due:'2026-05-21', priority:'HIGH',   done:false},
  {id:2, title:'Study Chapter 4 — Neural Networks',        subjectId:2, due:'2026-05-25', priority:'MEDIUM', done:true},
  {id:3, title:'Math past papers (2023, 2024)',             subjectId:3, due:'2026-05-20', priority:'HIGH',   done:false},
  {id:4, title:'Network topology lab report',              subjectId:4, due:'2026-05-23', priority:'MEDIUM', done:false},
  {id:5, title:'OS process scheduling notes',              subjectId:5, due:'2026-05-26', priority:'LOW',    done:true},
];

let schedule = [
  {subjectId:1, planned:120, done:45},
  {subjectId:3, planned:120, done:0},
  {subjectId:4, planned:90,  done:90},
  {subjectId:2, planned:90,  done:30},
];

let sessions = [
  {subject:'DBMS',  start:'09:00', end:'11:00', duration:120, date:'2026-05-16'},
  {subject:'Math',  start:'14:00', end:'15:30', duration:90,  date:'2026-05-16'},
  {subject:'AI',    start:'20:00', end:'21:00', duration:60,  date:'2026-05-15'},
];

let groups = [
  {id:1, name:'DBMS Study Circle', subject:'DBMS',         members:['RA','SK','NI','FM'], created:'Rahul Ahmed'},
  {id:2, name:'AI Enthusiasts',    subject:'AI',           members:['RA','TH','MK'],     created:'Tahmid Hasan'},
  {id:3, name:'Math Warriors',     subject:'Mathematics',  members:['RA','SK','NI','AR','PQ'], created:'Rahul Ahmed'},
];

const leaderboardH = [
  {name:'Miftahul',   hours:82, avatar:'SK', bg:'#6c8eff'},
  {name:'Subah Noor',  hours:76, avatar:'NI', bg:'#a78bfa'},
  {name:'Jannatul Mawa',  hours:67, avatar:'RA', bg:'#34d399'},
  {name:'Farhan Miah',  hours:61, avatar:'FM', bg:'#fbbf24'},
  {name:'Tahmid Hasan', hours:54, avatar:'TH', bg:'#f87171'},
];
const leaderboardP = [
  {name:'Subah Noor',  points:1580, avatar:'NI', bg:'#a78bfa'},
  {name:'Miftahul',   points:1420, avatar:'SK', bg:'#6c8eff'},
  {name:'Jannatul Mawa',  points:1240, avatar:'RA', bg:'#34d399'},
  {name:'Tahmid Hasan', points:980,  avatar:'TH', bg:'#f87171'},
  {name:'Arif Rahman',  points:860,  avatar:'AR', bg:'#fbbf24'},
];

let timerRunning = false, timerSec = 0, timerInterval = null;

function pad(n){ return String(n).padStart(2,'0'); }

function toggleTimer(){
  timerRunning = !timerRunning;
  document.getElementById('timer-btn').textContent = timerRunning ? '⏸ Pause' : '▶ Start';
  if(timerRunning){
    timerInterval = setInterval(() => { timerSec++; updateTimerDisplay(); }, 1000);
  } else {
    clearInterval(timerInterval);
  }
}

function resetTimer(){
  clearInterval(timerInterval);
  timerRunning = false; timerSec = 0;
  document.getElementById('timer-btn').textContent = '▶ Start';
  updateTimerDisplay();
}

function updateTimerDisplay(){
  const h = Math.floor(timerSec/3600);
  const m = Math.floor((timerSec%3600)/60);
  const s = timerSec % 60;
  document.getElementById('timer-display').textContent = pad(h)+':'+pad(m)+':'+pad(s);
}

function getSubject(id){ return subjects.find(s => s.id === id); }

function renderDashboard(){

  let html = '';
  schedule.forEach(sc => {
    const sub = getSubject(sc.subjectId);
    const pct = Math.round(sc.done / sc.planned * 100);
    html += `<div class="schedule-row">
      <div class="schedule-subject" style="color:${sub.color}">${sub.name}</div>
      <div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%;background:${sub.color}"></div></div>
      </div>
      <div class="progress-label">${sc.done}/${sc.planned}m</div>
    </div>`;
  });
  document.getElementById('today-schedule').innerHTML = html;

  let evHtml = '';
  events.slice(0,4).forEach(ev => {
    const d = new Date(ev.date);
    const sub = ev.subjectId ? getSubject(ev.subjectId) : null;
    evHtml += `<div class="event-item">
      <div class="event-date-box" style="background:rgba(108,142,255,.1)">
        <div class="event-day" style="color:var(--accent)">${d.getDate()}</div>
        <div class="event-month" style="color:var(--muted)">${d.toLocaleString('default',{month:'short'})}</div>
      </div>
      <div style="flex:1">
        <div style="font-size:13.5px;font-weight:500">${ev.title}</div>
        <div style="font-size:11px;color:var(--muted)">${sub ? sub.name : '—'}</div>
      </div>
      <span class="event-type type-${ev.type}">${ev.type}</span>
    </div>`;
  });
  document.getElementById('upcoming-events-dash').innerHTML = evHtml;
}

function renderSubjects(){
  const colors = {HIGH:'badge-high', MEDIUM:'badge-medium', LOW:'badge-low'};
  const html = subjects.map(s => `
    <div class="subject-item">
      <div class="subject-dot" style="background:${s.color}"></div>
      <div style="flex:1">
        <div class="subject-name">${s.name}</div>
        <div class="subject-faculty">${s.faculty} · Avg: ${s.avg}%</div>
      </div>
      <span class="badge ${colors[s.priority]}">${s.priority}</span>
    </div>
  `).join('');
  document.getElementById('subject-list').innerHTML = html;

  ['ev-subject','task-sub','grp-sub'].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.innerHTML = subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
  });
}

function renderEvents(){
  const html = events.map(ev => {
    const d = new Date(ev.date);
    const sub = ev.subjectId ? getSubject(ev.subjectId) : null;
    return `<div class="event-item">
      <div class="event-date-box" style="background:rgba(108,142,255,.08)">
        <div class="event-day" style="color:var(--accent)">${d.getDate()}</div>
        <div class="event-month" style="color:var(--muted)">${d.toLocaleString('default',{month:'short'})}</div>
      </div>
      <div style="flex:1">
        <div style="font-size:13.5px;font-weight:500">${ev.title}</div>
        <div style="font-size:11px;color:var(--muted)">${sub ? sub.name : 'General'} · ${d.toLocaleDateString()}</div>
      </div>
      <span class="event-type type-${ev.type}">${ev.type}</span>
    </div>`;
  }).join('');
  document.getElementById('event-list-full').innerHTML = html;
}

function renderTasks(){
  const pc = {HIGH:'badge-high', MEDIUM:'badge-medium', LOW:'badge-low'};
  let pending = 0, done = 0;
  const html = tasks.map(t => {
    const sub = getSubject(t.subjectId);
    if(t.done) done++; else pending++;
    return `<div class="task-item">
      <div class="task-check ${t.done?'done':''}" onclick="toggleTask(${t.id})">${t.done?'✓':''}</div>
      <div style="flex:1">
        <div class="task-title ${t.done?'done':''}">${t.title}</div>
        <div class="task-meta">${sub ? sub.name : '—'} · Due ${new Date(t.due).toLocaleDateString()}</div>
      </div>
      <span class="badge ${pc[t.priority]}">${t.priority}</span>
    </div>`;
  }).join('');
  document.getElementById('task-list').innerHTML = html;
  document.getElementById('task-pending-count').textContent = pending;
  document.getElementById('task-done-count').textContent = done;
}

function toggleTask(id){
  const t = tasks.find(t => t.id === id);
  if(t) t.done = !t.done;
  renderTasks();
}


function renderSchedule(){
  const html = schedule.map(sc => {
    const sub = getSubject(sc.subjectId);
    const pct = Math.round(sc.done / sc.planned * 100);
    return `<div class="schedule-row">
      <div class="schedule-subject" style="color:${sub.color}">${sub.name}</div>
      <div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%;background:${sub.color}"></div></div>
        <div style="font-size:10px;color:var(--muted);margin-top:3px">${pct}% done</div>
      </div>
      <div class="progress-label">${sc.planned} min</div>
    </div>`;
  }).join('');
  document.getElementById('schedule-list').innerHTML = html;
}

function renderSessions(){
  const html = sessions.map(s => `
    <div class="event-item">
      <div style="flex:1">
        <div style="font-size:13.5px;font-weight:500">${s.subject}</div>
        <div style="font-size:11px;color:var(--muted)">${s.date} · ${s.start}–${s.end}</div>
      </div>
      <div style="font-size:13px;color:var(--accent);font-weight:500">${s.duration} min</div>
    </div>
  `).join('');
  document.getElementById('session-list').innerHTML = html;
}


function renderLeaderboard(){
  function buildLb(arr, valKey, suffix, elId){
    const ranks = ['🥇','🥈','🥉'];
    const html = arr.map((u,i) => `
      <div class="lb-row">
        <div class="lb-rank ${i===0?'gold':i===1?'silver':i===2?'bronze':''}">${ranks[i] || i+1}</div>
        <div class="lb-avatar" style="background:${u.bg}">${u.avatar}</div>
        <div class="lb-name">${u.name}${u.name==='Rahul Ahmed'?' <span style="font-size:10px;color:var(--accent)">(you)</span>':''}</div>
        <div class="lb-points">${u[valKey]}${suffix}</div>
      </div>
    `).join('');
    document.getElementById(elId).innerHTML = html;
  }
  buildLb(leaderboardH, 'hours', 'h',   'lb-hours');
  buildLb(leaderboardP, 'points', ' pts','lb-points');
}

function renderGroups(){
  const html = groups.map(g => `
    <div class="group-card">
      <div style="font-size:15px;font-weight:500">${g.name}</div>
      <div style="font-size:12px;color:var(--muted)">${g.subject}</div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px">
        <div style="display:flex">
          ${g.members.map((m,i) => `<div class="group-avatar" style="background:${AVATARBG[i%AVATARBG.length]}">${m}</div>`).join('')}
        </div>
        <div style="font-size:11px;color:var(--muted)">${g.members.length} members</div>
      </div>
      <div style="font-size:11px;color:var(--muted);margin-top:4px">Created by ${g.created}</div>
    </div>
  `).join('');
  document.getElementById('group-grid').innerHTML = html;
}

function renderAnalytics(){
  const pc = {HIGH:'badge-high', MEDIUM:'badge-medium', LOW:'badge-low'};
  const pbHtml = subjects.map(s => `
    <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">
      <div style="width:10px;height:10px;border-radius:50%;background:${s.color};flex-shrink:0"></div>
      <div style="flex:1;font-size:13px">${s.name}</div>
      <span class="badge ${pc[s.priority]}">${s.priority}</span>
      <div style="font-size:13px;color:var(--muted)">${s.avg}%</div>
    </div>
  `).join('');
  document.getElementById('priority-breakdown').innerHTML = pbHtml;

  const months = [
    {m:'March',      study:180, tasks:8,  avg:71},
    {m:'April',      study:240, tasks:12, avg:74},
    {m:'May (so far)',study:120, tasks:6,  avg:69},
  ];
  const mrHtml = months.map(m => `
    <div style="padding:8px 0;border-bottom:1px solid var(--border)">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px">
        <span style="font-size:13px;font-weight:500">${m.m}</span>
        <span style="font-size:12px;color:var(--accent)">${m.study}h studied</span>
      </div>
      <div style="display:flex;gap:12px">
        <span style="font-size:11px;color:var(--muted)">Tasks: ${m.tasks}</span>
        <span style="font-size:11px;color:var(--muted)">Avg: ${m.avg}%</span>
      </div>
    </div>
  `).join('');
  document.getElementById('monthly-review').innerHTML = mrHtml;
}

// ── Charts ───────────────────────────────────────────────────
let chartsInited = false;

function initCharts(){
  if(chartsInited) return;
  chartsInited = true;
  Chart.defaults.color       = '#7a829a';
  Chart.defaults.borderColor = 'rgba(255,255,255,0.06)';

  new Chart(document.getElementById('weeklyChart'), {
    type: 'bar',
    data: {
      labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
      datasets: [{
        label: 'Hours', data: [3,2.5,4,2,3.5,2,1.5],
        backgroundColor: 'rgba(108,142,255,.5)', borderColor: '#6c8eff',
        borderWidth: 1.5, borderRadius: 4,
      }]
    },
    options: {responsive:true, maintainAspectRatio:false,
      plugins:{legend:{display:false}}, scales:{y:{ticks:{callback:v=>v+'h'}}}}
  });

  new Chart(document.getElementById('perfChart'), {
    type: 'bar',
    data: {
      labels: ['DBMS','AI','Math','Networks','OS'],
      datasets: [{
        label: 'Avg %', data: [65,78,58,72,81],
        backgroundColor: COLORS.map(c=>c+'66'), borderColor: COLORS,
        borderWidth: 1.5, borderRadius: 4,
      }]
    },
    options: {responsive:true, maintainAspectRatio:false,
      plugins:{legend:{display:false}}, scales:{y:{min:0,max:100,ticks:{callback:v=>v+'%'}}}}
  });

  new Chart(document.getElementById('sessionChart'), {
    type: 'bar',
    data: {
      labels: ['DBMS','AI','Math','Networks','OS'],
      datasets: [{
        label: 'Hours', data: [12,8,6,9,5],
        backgroundColor: COLORS.map(c=>c+'66'), borderColor: COLORS,
        borderWidth: 1.5, borderRadius: 4,
      }]
    },
    options: {responsive:true, maintainAspectRatio:false,
      plugins:{legend:{display:false}}, scales:{y:{ticks:{callback:v=>v+'h'}}}}
  });

  new Chart(document.getElementById('trendChart'), {
    type: 'line',
    data: {
      labels: ['CT1','CT2','Mid'],
      datasets: subjects.map((s,i) => ({
        label: s.name, data: [s.avg-8, s.avg-2, s.avg],
        borderColor: COLORS[i], tension: .3, pointRadius: 3, fill: false,
        borderDash: i > 2 ? [4,3] : [],
      }))
    },
    options: {responsive:true, maintainAspectRatio:false,
      plugins:{legend:{display:false}}, scales:{y:{min:30,max:100,ticks:{callback:v=>v+'%'}}}}
  });

  new Chart(document.getElementById('donutChart'), {
    type: 'doughnut',
    data: {
      labels: ['DBMS','AI','Math','Networks','OS'],
      datasets: [{data:[30,20,15,22,13], backgroundColor:COLORS.slice(0,5).map(c=>c+'bb'), borderWidth:0}]
    },
    options: {responsive:true, maintainAspectRatio:false, cutout:'65%', plugins:{legend:{display:false}}}
  });
}

function showPage(name, el){
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-'+name).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if(el) el.classList.add('active');

  if(name === 'dashboard'){ renderDashboard(); setTimeout(initCharts, 100); }
  if(name === 'subjects')   renderSubjects();
  if(name === 'events')     renderEvents();
  if(name === 'tasks')      renderTasks();
  if(name === 'schedule')   renderSchedule();
  if(name === 'sessions')  { renderSessions(); setTimeout(initCharts, 100); }
  if(name === 'analytics') { renderAnalytics(); setTimeout(initCharts, 100); }
  if(name === 'leaderboard') renderLeaderboard();
  if(name === 'groups')      renderGroups();
}

function openModal(name){
  document.getElementById('overlay').classList.add('open');
  document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
  document.getElementById('modal-'+name).style.display = 'block';
}
function closeModal(){
  document.getElementById('overlay').classList.remove('open');
  document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
}

function addSubject(){
  const name    = document.getElementById('sub-name').value.trim();
  const faculty = document.getElementById('sub-faculty').value.trim();
  if(!name) return;
  subjects.push({id:Date.now(), name, faculty: faculty||'TBD', color:COLORS[subjects.length%COLORS.length], priority:'MEDIUM', avg:0});
  document.getElementById('sub-name').value = '';
  document.getElementById('sub-faculty').value = '';
  closeModal();
  renderSubjects();
}

function addEvent(){
  const title     = document.getElementById('ev-title').value.trim();
  const type      = document.getElementById('ev-type').value;
  const date      = document.getElementById('ev-date').value;
  const subjectId = parseInt(document.getElementById('ev-subject').value);
  if(!title || !date) return;
  events.push({id:Date.now(), title, type, date, subjectId});
  document.getElementById('ev-title').value = '';
  closeModal();
  renderEvents();
}

function addTask(){
  const title     = document.getElementById('task-title-inp').value.trim();
  const due       = document.getElementById('task-due').value;
  const priority  = document.getElementById('task-pri').value;
  const subjectId = parseInt(document.getElementById('task-sub').value);
  if(!title) return;
  tasks.push({id:Date.now(), title, subjectId, due, priority, done:false});
  document.getElementById('task-title-inp').value = '';
  closeModal();
  renderTasks();
}

function generateSchedule(){
  schedule = subjects.map(s => ({
    subjectId: s.id,
    planned:   s.priority === 'HIGH' ? 120 : s.priority === 'MEDIUM' ? 90 : 60,
    done: 0,
  }));
  closeModal();
  renderSchedule();
  showPage('schedule', null);
}

function addGroup(){
  const name  = document.getElementById('grp-name').value.trim();
  const subId = parseInt(document.getElementById('grp-sub').value);
  const sub   = getSubject(subId);
  if(!name) return;
  groups.push({id:Date.now(), name, subject: sub ? sub.name : 'General', members:['RA'], created:'Rahul Ahmed'});
  document.getElementById('grp-name').value = '';
  closeModal();
  renderGroups();
}

// ── Boot ─────────────────────────────────────────────────────
renderDashboard();
renderSubjects();
setTimeout(initCharts, 300);
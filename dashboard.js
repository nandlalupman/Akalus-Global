import { currentSession } from './auth.js';
import { isFirebaseConfigured } from './firebase-config.js';
import { Workspace } from './data.js';
import { trainingCards, trainingVideos } from './training.js';
import { STATUSES, SERVICES, today, escapeHTML as e, initials, isDue, csvCell } from './domain.mjs';

const paths={grid:'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',users:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',briefcase:'M3 7h18v14H3z M8 7V3h8v4 M3 12a20 20 0 0 0 18 0 M12 11v4',play:'M9 6l10 6-10 6z M3 3h18v18H3z',arrow:'M5 12h14 M12 5l7 7-7 7',plus:'M12 5v14 M5 12h14',download:'M12 3v12 M7 10l5 5 5-5 M4 16v5h16v-5',search:'M21 21l-6-6 M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0',chevron:'M9 5l7 7-7 7',clock:'M12 8v4l3 2 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',check:'M5 12l4 4L19 6',home:'M3 10l9-7 9 7 M5 9v12h5v-7h4v7h5V9',settings:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M12 2v3 M12 19v3 M2 12h3 M19 12h3 M5 5l2 2 M17 17l2 2 M5 19l2-2 M17 7l2-2',logout:'M9 3H3v18h6 M9 12h12 M17 8l4 4-4 4',close:'M6 6l12 12 M18 6L6 18',menu:'M3 6h18 M3 12h18 M3 18h18',edit:'M12 20h9 M16 3l5 5-12 12H4v-5z',spark:'M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z',calendar:'M4 5h16v16H4z M8 3v4 M16 3v4 M4 10h16'};
const icon=(name)=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name]||paths.grid}"/></svg>`;
const app=document.querySelector('#app'),dialog=document.querySelector('#recordDialog');
const demo=new URLSearchParams(location.search).get('demo')==='1';
const isStudentPage=/\/student(?:\.html)?\/?$/.test(location.pathname);
let store,session,view='overview',selectedStudent='',search='',statusFilter='',companyFilter='',dueOnly=false,page=1,trainingStudent='',toastTimer,ready=false;
const pageSize=8;
const dateText=(date)=>date?new Intl.DateTimeFormat('en-IN',{day:'numeric',month:'short',year:'numeric',timeZone:'Asia/Kolkata'}).format(new Date(date.length===10?date+'T12:00:00+05:30':date)):'—';
const statusBadge=status=>`<span class="status ${status.toLowerCase().replaceAll(' ','-')}">${e(status)}</span>`;
const studentById=id=>store.students.find(s=>s.id===id);
function notify(message,error=false){const toast=document.querySelector('#toast');toast.textContent=message;toast.classList.toggle('error',error);toast.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.hidden=true,error?8000:3500);}
function visibleStudents(){return store.admin?store.students:demo?store.students.slice(0,1):store.students;}
function visibleApplications(){const ids=new Set(visibleStudents().map(s=>s.id));return store.applications.filter(a=>ids.has(a.studentId));}
function filteredApplications(studentId=''){
  return visibleApplications().filter(a=>{
    const s=studentById(a.studentId);
    return (!studentId||a.studentId===studentId)&&(!statusFilter||a.status===statusFilter)&&(!companyFilter||a.company===companyFilter)&&(!dueOnly||isDue(a))&&`${s?.name} ${a.company} ${a.role} ${a.requirements} ${a.location}`.toLowerCase().includes(search.toLowerCase());
  }).sort((a,b)=>(b.appliedOn||'').localeCompare(a.appliedOn||''));
}
function shell(){
  app.innerHTML=`<div class="layout"><div class="mobile-scrim" id="mobileScrim"></div><aside class="sidebar" id="sidebar">
    <a class="brand" href="index.html" aria-label="AKALUs Global home">AKAL<em>Us</em><small>G L O B A L</small></a>
    <div class="nav-caption">CAREER WORKSPACE</div><nav class="side-nav" aria-label="Workspace navigation">
    ${[['overview','grid','Overview'],['students','users',store.admin?'Students':'My profile'],['applications','briefcase','Applications'],['training','play','Training library']].map(([id,ic,label])=>`<button data-nav="${id}">${icon(ic)}${label}${id==='students'?`<span class="nav-count">${visibleStudents().length}</span>`:''}</button>`).join('')}
    </nav><div class="sidebar-note"><span>✧</span><h3>Every step, together.</h3><p>From discovering strengths to finding the right opportunity.</p></div>
    <div class="side-bottom"><a href="index.html">${icon('home')}Back to website</a><button data-action="settings">${icon('settings')}Workspace settings</button><button data-action="logout">${icon('logout')}${demo?'Exit demo':'Sign out'}</button></div>
    </aside><div class="main-area"><header class="topbar"><button class="menu-toggle" id="menuToggle" aria-label="Open navigation" aria-expanded="false">${icon('menu')}</button><div class="breadcrumb">Workspace <b>/ <span id="breadcrumbLabel">Overview</span></b></div>
    <label class="global-search">${icon('search')}<input id="globalSearch" type="search" placeholder="Search students, companies, roles…" aria-label="Search workspace" maxlength="120" value="${e(search)}"></label>
    <div class="top-avatar"><span class="avatar">${initials(session?.user?.displayName|| (store.admin?'Career Team':visibleStudents()[0]?.name||'Student'))}</span><div>${store.admin?'Career team':'Student workspace'}<small>${demo?'Demo account':e(session.user.email)}</small></div></div>
    </header><main class="content" id="content"></main></div></div>`;
  document.querySelector('#globalSearch').addEventListener('input',ev=>{search=ev.target.value;page=1;render();});
  document.querySelector('#menuToggle').onclick=()=>{const open=document.querySelector('#sidebar').classList.toggle('open');document.querySelector('#mobileScrim').classList.toggle('open',open);document.querySelector('#menuToggle').setAttribute('aria-expanded',String(open));};
  document.querySelector('#mobileScrim').onclick=closeNav;
}
function closeNav(){document.querySelector('#sidebar').classList.remove('open');document.querySelector('#mobileScrim').classList.remove('open');document.querySelector('#menuToggle').setAttribute('aria-expanded','false');}
function heading(title,description,actions=''){return `<div class="page-heading"><div><span class="eyebrow">${store.admin?'CAREER SUPPORT, CONNECTED':'YOUR NEXT CHAPTER'}</span><h1>${title}</h1><p>${description}</p></div><div class="actions">${actions}</div></div>`;}
function adminButton(action,label,ic='plus'){return store.admin?`<button class="button primary" data-action="${action}">${icon(ic)}${label}</button>`:'';}
function overview(){
  const students=visibleStudents(),apps=visibleApplications();
  const interviews=apps.filter(a=>a.status==='Interview scheduled').length,offers=apps.filter(a=>['Offer received','Joined'].includes(a.status)).length;
  const due=apps.filter(isDue);
  return heading(store.admin?'Small steps. Bigger futures.':`Your career, moving forward.`,store.admin?'A clear view of every student, every opportunity and everything you do for them.':'Your applications, guidance and learning journey — all in one place.',`<button class="button" data-action="export">${icon('download')}Export report</button>${adminButton('addApplication','Add application')}`)+
    `<div class="metrics">${[
      ['Students supported',students.length,'users','Personalized career journeys'],['Active applications',apps.filter(a=>!['Rejected','Withdrawn','Joined'].includes(a.status)).length,'briefcase',`${new Set(apps.map(a=>a.company)).size} companies in the pipeline`],['Interviews scheduled',interviews,'calendar','Preparing for the next step'],['Offers & placements',offers,'check',`${apps.filter(a=>a.status==='Joined').length} students joined`]
    ].map(([label,value,ic,foot])=>`<article class="metric"><span class="metric-icon">${icon(ic)}</span><span class="metric-label">${label}</span><strong class="metric-value">${String(value).padStart(2,'0')}</strong><span class="metric-foot">${e(foot)}</span></article>`).join('')}</div>
    <div class="workspace-grid"><div><section class="panel"><div class="panel-head"><div><h2>Application tracker</h2><p>Every opportunity. A little closer to the goal.</p></div><button class="text-button" data-nav="applications">View all ${icon('arrow')}</button></div>${applicationTable('',true)}</section>
    <section class="panel pipeline-panel"><div class="pipeline-head"><h2>The journey so far</h2><span>${apps.length} total applications</span></div><div class="pipeline">${STATUSES.slice(0,5).map(status=>`<div class="pipeline-step"><div class="pipeline-track"></div><span>${status==='Interview scheduled'?'Interview':status==='Offer received'?'Offer':status}</span><strong>${apps.filter(a=>a.status===status).length}</strong></div>`).join('')}</div></section></div>
    <aside class="right-rail"><section class="panel"><div class="panel-head"><div><h2>Needs a little attention</h2><p>${dateText(today())} · Follow-ups</p></div><span class="tag">${due.length}</span></div><div class="focus-list">${due.length?due.slice(0,4).map(a=>`<article class="focus-item"><span class="focus-dot">${icon('clock')}</span><div><h3>${e(studentById(a.studentId)?.name)}</h3><p>${e(a.company)} · ${e(a.role)}<br>Follow up ${dateText(a.followUp)}</p><button class="text-button" data-action="viewApplication" data-id="${e(a.id)}">View application ${icon('arrow')}</button></div></article>`).join(''):`<div class="empty"><p>No follow-ups due. You're up to date.</p></div>`}${due.length>4?`<button class="text-button" data-action="due">View all ${due.length} follow-ups ${icon('arrow')}</button>`:''}</div></section>
    <section class="training-promo"><span class="eyebrow">LEARN. PRACTICE. GROW.</span><h2>Confidence comes<br>with practice.</h2><p>Step inside our learning sessions.<br>Build skills for what comes next.</p><button class="button small" data-nav="training">Explore training ${icon('arrow')}</button></section></aside></div>`;
}
function applicationTable(studentId='',compact=false){
  const rows=filteredApplications(studentId),maxPage=Math.max(1,Math.ceil(rows.length/pageSize));page=Math.min(page,maxPage);
  const companies=[...new Set(visibleApplications().map(a=>a.company))].sort();
  return `<div class="filters"><select id="statusFilter" aria-label="Filter by status"><option value="">All statuses</option>${STATUSES.map(s=>`<option ${s===statusFilter?'selected':''}>${s}</option>`).join('')}</select><select id="companyFilter" aria-label="Filter by company"><option value="">All companies</option>${companies.map(c=>`<option ${c===companyFilter?'selected':''}>${e(c)}</option>`).join('')}</select><label class="due-filter"><input type="checkbox" id="dueOnly" ${dueOnly?'checked':''}> Follow-ups due</label>${statusFilter||companyFilter||search||dueOnly?'<button class="text-button" data-action="clearFilters">Clear filters</button>':''}</div>
  ${rows.length?`<div class="table-wrap"><table><thead><tr>${studentId?'':'<th>STUDENT</th>'}<th>COMPANY / ROLE</th>${compact?'':'<th>WHAT THEY ASKED FOR</th>'}<th>PACKAGE</th><th>STATUS</th>${compact?'':'<th>FOLLOW-UP</th>'}<th><span class="sr-only">Details</span></th></tr></thead><tbody>${rows.slice((page-1)*pageSize,page*pageSize).map(a=>{
    const s=studentById(a.studentId);return `<tr>${studentId?'':`<td><div class="student-cell"><span class="avatar">${e(initials(s?.name))}</span><button data-action="profile" data-id="${e(s?.id)}"><strong>${e(s?.name||'Unlinked student')}</strong><small>${e(s?.targetRole||s?.course||'Student')}</small></button></div></td>`}<td class="company-cell"><strong>${e(a.company)}</strong><small>${e(a.role)}</small></td>${compact?'':`<td style="max-width:230px"><small>${e(a.requirements||'Not specified')}</small></td>`}<td style="white-space:nowrap">${e(a.package||'Not disclosed')}</td><td>${statusBadge(a.status)}</td>${compact?'':`<td><small>${dateText(a.followUp)}${a.followUp&&isDue(a)?'<br><span style="color:#b57e3c">Follow-up due</span>':''}</small></td>`}<td><button class="icon-button" data-action="viewApplication" data-id="${e(a.id)}" aria-label="View ${e(a.company)} application for ${e(s?.name)}">${icon('chevron')}</button></td></tr>`;
  }).join('')}</tbody></table></div><div class="panel-footer"><span>${(page-1)*pageSize+1}–${Math.min(page*pageSize,rows.length)} of ${rows.length} applications</span><div class="actions"><button class="button small" data-action="prevPage" ${page===1?'disabled':''}>Previous</button><button class="button small" data-action="nextPage" ${page===maxPage?'disabled':''}>Next</button></div></div>`:empty('No applications here yet',search||statusFilter||companyFilter?'Try a different search or clear your filters.':'Add a student and record their first opportunity.',store.admin&&!search?adminButton('addApplication','Add application'):'')}`;
}
function empty(title,description,action=''){return `<div class="empty"><h2>${title}</h2><p>${description}</p>${action}</div>`;}
function studentsPage(){
  if(!store.admin) return profile(visibleStudents()[0]?.id);
  const students=visibleStudents().filter(s=>`${s.name} ${s.email} ${s.targetRole} ${s.batch} ${s.course} ${s.coordinator}`.toLowerCase().includes(search.toLowerCase()));
  return heading('A person behind every profile.','Know their goals. Keep track of how you are helping them get there.',adminButton('addStudent','Add student'))+
  (students.length?`<div class="student-grid">${students.map(s=>{
    const apps=store.applications.filter(a=>a.studentId===s.id),completed=s.completedVideos?.length||0;
    return `<article class="panel student-card"><div class="student-card-top"><span class="avatar">${e(initials(s.name))}</span><div><h3>${e(s.name)}</h3><p>${e(s.course||'Course not added')}</p></div></div><div class="tags">${s.services.map(v=>`<span class="tag">${e(v)}</span>`).join('')||'<span class="tag">Support plan pending</span>'}</div><p>Working towards <strong>${e(s.targetRole||'a new opportunity')}</strong></p><div class="progress-track"><div class="progress-fill" style="width:${completed/4*100}%"></div></div><p>${completed}/4 training videos completed · ${apps.length} applications</p><div class="student-card-bottom"><span>${e(s.coordinator||'Unassigned')}</span><button class="text-button" data-action="profile" data-id="${e(s.id)}">View journey ${icon('arrow')}</button></div></article>`;
  }).join('')}</div>`:empty('No students found','Add a student or change your search.',adminButton('addStudent','Add student')));
}
function profile(id){
  const s=visibleStudents().find(s=>s.id===id);
  if(!s)return empty('Your journey starts here','Your coordinator will link your profile to your account. Share your account UID from workspace settings.');
  return heading(store.admin?'Student journey':'My journey','A complete picture of the support, practice and opportunities.',store.admin?`<button class="button" data-nav="students">Back to students</button>`:'')+
  `<section class="panel profile-hero"><span class="avatar">${e(initials(s.name))}</span><div><h2>${e(s.name)}</h2><p>${e(s.course)}${s.batch?' · '+e(s.batch):''}</p><p>${e(s.email)}${s.phone?' · '+e(s.phone):''}</p></div><div class="actions">${store.admin?`<button class="button" data-action="editStudent" data-id="${e(s.id)}">${icon('edit')}Edit profile</button><button class="button primary" data-action="addApplication" data-student="${e(s.id)}">${icon('plus')}Application</button>`:''}</div></section>
  <div class="profile-details"><section class="panel"><div class="panel-head"><h2>How we are helping</h2>${store.admin?`<button class="text-button" data-action="logWork" data-id="${e(s.id)}">${icon('plus')}Log activity</button>`:''}</div><div class="detail-copy"><div class="tags">${s.services.map(v=>`<span class="tag">${e(v)}</span>`).join('')}</div><p style="margin-top:15px">Target role: ${e(s.targetRole||'To be discussed')}<br>Coordinator: ${e(s.coordinator||'Unassigned')}</p><p style="margin-top:12px">${e(s.notes||'Your support plan will be recorded here.')}</p></div></section><section class="panel"><div class="panel-head"><h2>Support activity</h2><span class="tag">${s.history?.length||0} updates</span></div>${history(s.history)}</section></div>
  <section class="panel"><div class="panel-head"><h2>Applications for ${e(s.name.split(' ')[0])}</h2></div>${applicationTable(s.id)}</section>
  <div class="panel-head"><h2>Training progress</h2><span class="tag">${s.completedVideos?.length||0}/4 complete</span></div><div class="training-grid" data-training-student="${e(s.id)}">${trainingCards({completed:s.completedVideos,progress:true,readonly:!store.admin})}</div>`;
}
function history(events=[]){return events.length?`<ol class="history">${events.slice().reverse().map(h=>`<li>${e(h.text)}<small>${dateText(h.date)}</small></li>`).join('')}</ol>`:'<div class="detail-copy">No activity recorded yet.</div>';}
function trainingPage(){
  const students=visibleStudents();
  const selected=students.find(s=>s.id===trainingStudent)||(!store.admin?students[0]:null);
  return heading('A little practice. A lot of possibility.','Real moments from our workshops, communication sessions and interview practice.')+
    (store.admin?`<label class="field student-select">Track progress for<select id="trainingStudent"><option value="">Browse training videos</option>${students.map(s=>`<option value="${e(s.id)}" ${selected?.id===s.id?'selected':''}>${e(s.name)}</option>`).join('')}</select></label>`:'')+
    `<div class="training-grid" ${selected?`data-training-student="${e(selected.id)}"`:''}>${trainingCards({completed:selected?.completedVideos,progress:!!selected,readonly:!store.admin})}</div>`;
}
function render(){
  if(!ready)return;
  const labels={overview:'Overview',students:store.admin?'Students':'My profile',applications:'Applications',training:'Training library',profile:'Student journey'};
  document.querySelectorAll('[data-nav]').forEach(b=>b.classList.toggle('active',b.dataset.nav===(view==='profile'?'students':view)));
  document.querySelector('#breadcrumbLabel').textContent=labels[view]||'Overview';
  const count=document.querySelector('.nav-count');if(count)count.textContent=visibleStudents().length;
  const content=document.querySelector('#content');
  content.innerHTML=`${demo?`<div class="mode-banner"><span>◉</span><span><strong>Demo workspace</strong> · Illustrative sample records. Changes stay in this browser; use live sign-in for shared student data.</span><a href="${store.admin?'student':'admin'}.html?demo=1">${store.admin?'Student view':'Coordinator view'}</a></div>`:''}${view==='overview'?overview():view==='students'?studentsPage():view==='profile'?profile(selectedStudent):view==='applications'?heading('Every opportunity, in one place.','Track the company, what they asked for, the package and what happens next.',`<button class="button" data-action="export">${icon('download')}Export CSV</button>${adminButton('addApplication','Add application')}`)+`<section class="panel"><div class="panel-head"><h2>All applications</h2><span class="tag">${visibleApplications().length} records</span></div>${applicationTable()}</section>`:trainingPage()}<footer class="page-footer"><span>© ${new Date().getFullYear()} AKALUs Global · Your Timeless Partners</span><span>We handhold. We grow with you.</span></footer>`;
  document.querySelector('#statusFilter')?.addEventListener('change',ev=>{statusFilter=ev.target.value;page=1;render();});
  document.querySelector('#companyFilter')?.addEventListener('change',ev=>{companyFilter=ev.target.value;page=1;render();});
  document.querySelector('#dueOnly')?.addEventListener('change',ev=>{dueOnly=ev.target.checked;page=1;render();});
  document.querySelector('#trainingStudent')?.addEventListener('change',ev=>{trainingStudent=ev.target.value;render();});
}
function showDialog(title,body){dialog.innerHTML=`<header class="dialog-head"><h2 id="dialogTitle">${title}</h2><button class="icon-button" data-close aria-label="Close dialog">${icon('close')}</button></header><div class="dialog-body">${body}</div>`;if(!dialog.open)dialog.showModal();dialog.querySelector('[data-close]').onclick=()=>dialog.close();}
dialog.addEventListener('click',ev=>{if(ev.target===dialog){const rect=dialog.getBoundingClientRect();if(ev.clientX<rect.left||ev.clientX>rect.right||ev.clientY<rect.top||ev.clientY>rect.bottom)dialog.close();}});
function field(label,name,value='',type='text',full=false,required=false,help=''){
  return `<label class="field ${full?'full':''}">${label}${required?' *':''}${type==='textarea'?`<textarea name="${name}" maxlength="2000">${e(value)}</textarea>`:`<input name="${name}" type="${type}" value="${e(value)}" ${required?'required':''} ${type==='text'?'maxlength="160"':''}>`}${help?`<small>${help}</small>`:''}</label>`;
}
function formEnd(label='Save changes'){return `<p class="form-error" role="alert"></p><div class="form-actions"><button type="button" class="button" data-cancel>Cancel</button><button class="button primary" type="submit">${label}</button></div></form>`;}
function wireForm(callback){
  const form=dialog.querySelector('form');form.querySelector('[data-cancel]').onclick=()=>dialog.close();
  form.onsubmit=async ev=>{ev.preventDefault();const button=form.querySelector('[type="submit"]');button.disabled=true;form.querySelector('.form-error').textContent='';try{await callback(new FormData(form));dialog.close();notify('Saved successfully.');}catch(err){form.querySelector('.form-error').textContent=err.message;}finally{button.disabled=false;}};
}
function studentForm(id){
  if(!store.admin)return;const s=structuredClone(studentById(id)||{});
  showDialog(id?'Edit student':'Add a student',`<form><div class="form-grid">${field('Full name','name',s.name,'text',false,true)}${field('Email address','email',s.email,'email',false,true)}${field('Phone (optional)','phone',s.phone,'tel')}${field('Course / qualification','course',s.course)}${field('Batch / institution','batch',s.batch)}${field('Target job role','targetRole',s.targetRole)}${field('Coordinator','coordinator',s.coordinator)}${field('Student account UID','ownerUid',s.ownerUid,'text',false,!demo,demo?'Optional in demo.':'Copy the student’s UID from Firebase Authentication or their workspace settings.')}<fieldset class="field full" style="border:0;padding:0;margin:0"><legend>Support we are providing</legend><div class="check-group">${SERVICES.map(v=>`<label><input type="checkbox" name="services" value="${v}" ${s.services?.includes(v)?'checked':''}>${v}</label>`).join('')}</div></fieldset>${field('Support plan / next steps','notes',s.notes,'textarea',true)}</div>${formEnd(id?'Save student':'Add student')}`);
  wireForm(async fd=>{const record={...s,...Object.fromEntries(fd),email:fd.get('email').trim().toLowerCase(),services:fd.getAll('services'),completedVideos:s.completedVideos||[]};for(const key of Object.keys(record))if(typeof record[key]==='string')record[key]=record[key].trim();await store.save('students',record,id?'Student profile and support plan updated.':'Student profile created.');});
}
function applicationForm(id,studentId){
  if(!store.admin)return;if(!store.students.length){studentForm();notify('Add a student before recording an application.');return;}
  const a=structuredClone(store.applications.find(a=>a.id===id)||{status:'Applied',appliedOn:today(),studentId:studentId||''});
  showDialog(id?'Update application':'Add an application',`<form><div class="form-grid"><label class="field full">Student *<select name="studentId" required><option value="">Choose a student</option>${store.students.map(s=>`<option value="${e(s.id)}" ${s.id===a.studentId?'selected':''}>${e(s.name)} · ${e(s.email)}</option>`).join('')}</select></label>${field('Name of company','company',a.company,'text',false,true)}${field('Job role','role',a.role,'text',false,true)}${field('What did the company ask for?','requirements',a.requirements,'textarea',true,false,'Skills, experience, qualifications or any specific requirements.')}${field('Package offered','package',a.package||'','text',false,false,'For example: ₹4–6 LPA or Not disclosed')}${field('Location / work mode','location',a.location)}<label class="field">Status *<select name="status">${STATUSES.map(s=>`<option ${s===a.status?'selected':''}>${s}</option>`).join('')}</select></label>${field('Applied on','appliedOn',a.appliedOn,'date',false,true)}${field('Next follow-up','followUp',a.followUp,'date')}${field('Interview date','interviewDate',a.interviewDate,'date')}${field('Interview time (India)','interviewAt',a.interviewAt,'time')}${field('Job listing URL','jobUrl',a.jobUrl,'url')}${field('Notes / next action','notes',a.notes,'textarea',true)}</div>${formEnd(id?'Save application':'Add application')}`);
  wireForm(async fd=>{const record={...a,...Object.fromEntries(fd)};for(const key of Object.keys(record))if(typeof record[key]==='string')record[key]=record[key].trim();if(record.jobUrl&&!/^https?:\/\//i.test(record.jobUrl))throw new Error('Use an http or https job listing URL.');await store.save('applications',record,id?(a.status!==record.status?`Status changed: ${a.status} → ${record.status}`:'Application details updated.'):`Application added · ${record.status}`);});
}
function applicationDetails(id){
  const a=visibleApplications().find(a=>a.id===id);if(!a)return;
  const s=studentById(a.studentId),safeURL=/^https?:\/\//i.test(a.jobUrl||'');
  showDialog('Application details',`<div style="margin-bottom:20px"><span class="eyebrow">${e(s?.name)}</span><h2 style="font-size:24px;margin:8px 0">${e(a.company)}</h2><p style="font-size:13px;color:var(--muted);margin-bottom:15px">${e(a.role)}</p>${statusBadge(a.status)}</div><dl class="detail-values"><div><dt>Package offered</dt><dd>${e(a.package||'Not disclosed')}</dd></div><div><dt>Location / work mode</dt><dd>${e(a.location||'Not specified')}</dd></div><div><dt>Applied on</dt><dd>${dateText(a.appliedOn)}</dd></div><div><dt>Next follow-up</dt><dd>${dateText(a.followUp)}</dd></div><div><dt>Interview (India time)</dt><dd>${dateText(a.interviewDate)} ${e(a.interviewAt||'')}</dd></div><div><dt>Job listing</dt><dd>${safeURL?`<a href="${e(a.jobUrl)}" target="_blank" rel="noopener noreferrer" style="text-decoration:underline">Open job listing ↗</a>`:'Not added'}</dd></div></dl><h3 style="font-size:13px;margin-bottom:9px">What the company asked for</h3><p class="detail-copy" style="padding:0 0 20px">${e(a.requirements||'Not specified')}</p><h3 style="font-size:13px;margin-bottom:9px">Notes / next action</h3><p class="detail-copy" style="padding:0 0 20px">${e(a.notes||'No notes yet.')}</p><h3 style="font-size:13px;margin-bottom:9px">Application history</h3>${history(a.history)}${store.admin?`<button class="button primary" data-action="editApplication" data-id="${e(id)}">${icon('edit')}Update application</button>`:''}`);
}
function logWork(id){const s=structuredClone(studentById(id));if(!s||!store.admin)return;showDialog('Record support activity',`<p class="notice">${e(s.name)} · Record what you worked on, feedback shared, or the next step agreed.</p><form>${field('Activity / support provided','activity','','textarea',true)}${formEnd('Save activity')}`);wireForm(async fd=>{const text=fd.get('activity').trim();if(!text)throw new Error('Describe the activity before saving.');await store.save('students',s,text);});}
function downloadFile(name,content,type){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function exportCSV(){const rows=filteredApplications(view==='profile'?selectedStudent:'');const headers=['Student','Email','Company','Job role','Requirements','Package offered','Status','Location','Applied on','Follow-up','Interview date','Interview time (IST)','Notes'];const data=rows.map(a=>{const s=studentById(a.studentId);return [s?.name,s?.email,a.company,a.role,a.requirements,a.package,a.status,a.location,a.appliedOn,a.followUp,a.interviewDate,a.interviewAt,a.notes];});downloadFile(`akalus-applications-${today()}.csv`,'\uFEFF'+[headers,...data].map(row=>row.map(csvCell).join(',')).join('\r\n'),'text/csv;charset=utf-8');notify(`Exported ${rows.length} applications using the current filters.`);}
function settings(){showDialog('Workspace settings',`${demo?`<p class="notice">Demo mode uses sample records and browser storage. This is not a secure place for real student data. Live mode uses Firebase Authentication and Firestore access rules.</p><div class="actions">${store.admin?'<button class="button" data-action="resetDemo">Restore sample records</button><button class="button" data-action="emptyDemo">Start an empty demo</button>':''}<a class="button dark" href="index.html#signin">Go to live sign-in</a></div>`:`<p class="notice">Signed in as ${e(session.user.email)}. Your account role is ${store.admin?'coordinator':'student'}.</p><label class="field">Your account UID<input readonly value="${e(session.user.uid)}" aria-label="Your account UID"><small>Share this UID with your coordinator to link your student profile.</small></label>`}<div style="margin-top:24px"><h3 style="font-size:13px;margin-bottom:10px">Your data</h3><p class="detail-copy" style="padding:0 0 14px">Export the student profiles, applications and activity history visible in your workspace.</p><button class="button" data-action="backup">${icon('download')}Download JSON backup</button></div>`);}

document.addEventListener('click',async ev=>{
  const button=ev.target.closest('[data-nav], [data-action], [data-cancel]');if(!button)return;
  if(button.dataset.nav){view=button.dataset.nav;page=1;statusFilter='';companyFilter='';dueOnly=false;closeNav();render();return;}
  const action=button.dataset.action,id=button.dataset.id;
  try{
    if(action==='profile'){selectedStudent=id;view='profile';page=1;statusFilter='';companyFilter='';dueOnly=false;render();}
    if(action==='addStudent')studentForm();if(action==='editStudent')studentForm(id);
    if(action==='addApplication')applicationForm(null,button.dataset.student);if(action==='editApplication')applicationForm(id);
    if(action==='viewApplication')applicationDetails(id);if(action==='logWork')logWork(id);
    if(action==='settings')settings();if(action==='export')exportCSV();
    if(action==='prevPage'){page--;render();}if(action==='nextPage'){page++;render();}
    if(action==='clearFilters'){search='';statusFilter='';companyFilter='';dueOnly=false;page=1;document.querySelector('#globalSearch').value='';render();}
    if(action==='due'){view='applications';search='';statusFilter='';companyFilter='';dueOnly=true;page=1;document.querySelector('#globalSearch').value='';render();}
    if(action==='backup'){downloadFile(`akalus-workspace-${today()}.json`,JSON.stringify({exportedAt:new Date().toISOString(),mode:demo?'demo':'live',students:visibleStudents(),applications:visibleApplications()},null,2),'application/json');notify('Workspace backup downloaded.');}
    if(action==='resetDemo'||action==='emptyDemo'){showDialog('Replace demo records?',`<p class="notice">This replaces all saved demo changes in this browser. Download a JSON backup first if you need to keep them.</p><div class="actions"><button class="button" data-close-confirm>Cancel</button><button class="button primary" data-confirm-reset>Replace demo records</button></div>`);dialog.querySelector('[data-close-confirm]').onclick=()=>dialog.close();dialog.querySelector('[data-confirm-reset]').onclick=()=>{store.resetDemo(action==='emptyDemo');dialog.close();notify('Demo workspace updated.');};}
    if(action==='logout'){if(!demo)await session.authSDK.signOut(session.auth);location.href='index.html';}
  }catch(err){notify(err.message,true);}
});
document.addEventListener('change',async ev=>{
  if(!ev.target.matches('[data-training]'))return;
  const input=ev.target,id=input.closest('[data-training-student]').dataset.trainingStudent,s=structuredClone(studentById(id));
  if(!store.admin)return;input.disabled=true;
  const completed=new Set(s.completedVideos||[]);input.checked?completed.add(input.dataset.training):completed.delete(input.dataset.training);s.completedVideos=[...completed];
  try{await store.save('students',s,`${input.checked?'Completed':'Reopened'} training: ${trainingVideos.find(v=>v.id===input.dataset.training).title}`);notify('Training progress saved.');}catch(err){input.checked=!input.checked;notify(err.message,true);}finally{input.disabled=false;}
});
function showError(message){app.innerHTML=`<main class="error-screen"><h1>Let’s get your workspace connected.</h1><p>${e(message)}</p><div class="actions"><a href="index.html#signin" class="button primary">Sign in</a><a href="admin.html?demo=1" class="button">Explore coordinator demo</a><a href="student.html?demo=1" class="button">Explore student demo</a></div></main>`;}
try{
  if(!demo&&!isFirebaseConfigured){showError('Live access needs your Firebase project configuration. You can explore the complete workspace with sample records now.');}
  else{
    if(!demo){session=await currentSession();if(!session.user){location.replace('index.html#signin');}else if(isStudentPage&&session.admin){location.replace('admin.html');}else if(!isStudentPage&&!session.admin){location.replace('student.html');}}
    if(demo||session?.user){
      store=new Workspace({demo,session,onChange:()=>{if(!ready){ready=true;shell();}render();},onError:err=>{ready=false;store.stop();showError('Unable to load student data. Check your connection and Firebase access rules. '+(err.code||''));}});
      await store.start();
      if(!demo)store.unsubscribers.push(session.authSDK.onAuthStateChanged(session.auth,user=>{if(!user){store.stop();location.replace('index.html#signin');}}));
      window.addEventListener('pagehide',()=>store.stop(),{once:true});
    }
  }
}catch(err){showError(err.message);}

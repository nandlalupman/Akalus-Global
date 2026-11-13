import { currentSession, getFirebase, authMessage } from './auth.js';
import { isFirebaseConfigured } from './firebase-config.js';
const modal=document.querySelector('#authModal'),status=document.querySelector('#authStatus');
let returnFocus;
function close(){modal.classList.remove('show');modal.setAttribute('aria-hidden','true');document.body.style.overflow='';returnFocus?.focus();}
function open(){returnFocus=document.activeElement;modal.classList.add('show');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';status.textContent=isFirebaseConfigured?'':'Live sign-in will be available after Firebase setup. The demo is ready to explore.';modal.querySelector('.auth-form.active input').focus();}
document.querySelectorAll('#loginBtn,#mobileLoginBtn').forEach(button=>button.addEventListener('click',ev=>{ev.preventDefault();open();}));
document.querySelector('#closeAuthModal').onclick=close;
modal.addEventListener('click',ev=>{if(ev.target===modal)close();});
document.querySelectorAll('.auth-tab').forEach(tab=>tab.addEventListener('click',()=>{document.querySelectorAll('.auth-tab').forEach(t=>t.classList.toggle('active',t===tab));document.querySelectorAll('.auth-form').forEach(f=>f.classList.toggle('active',f.id===tab.dataset.tab+'Form'));status.textContent='';modal.querySelector('.auth-form.active input').focus();}));
document.addEventListener('keydown',ev=>{
  if(!modal.classList.contains('show'))return;
  if(ev.key==='Escape')close();
  if(ev.key==='Tab'){const focusables=[...modal.querySelectorAll('button,input,a')].filter(el=>el.offsetParent!==null&&!el.disabled);const first=focusables[0],last=focusables.at(-1);if(ev.shiftKey&&document.activeElement===first){ev.preventDefault();last.focus();}else if(!ev.shiftKey&&document.activeElement===last){ev.preventDefault();first.focus();}}
});
for(const mode of ['login','register'])document.querySelector(`#${mode}Form`).addEventListener('submit',async ev=>{
  ev.preventDefault();const button=ev.target.querySelector('button[type="submit"]'),label=button.textContent;button.disabled=true;button.textContent=mode==='login'?'Signing in…':'Creating account…';status.textContent='';
  try{const {auth,authSDK:f}=await getFirebase();const email=document.querySelector(`#${mode}Email`).value.trim(),password=document.querySelector(`#${mode}Password`).value;
    let result;if(mode==='register'){result=await f.createUserWithEmailAndPassword(auth,email,password);await f.updateProfile(result.user,{displayName:document.querySelector('#registerName').value.trim()});}else result=await f.signInWithEmailAndPassword(auth,email,password);
    const token=await result.user.getIdTokenResult();location.href=token.claims.admin===true?'admin.html':'student.html';
  }catch(err){status.textContent=authMessage(err);}finally{button.disabled=false;button.textContent=label;}
});
if(location.hash==='#signin')open();
if(isFirebaseConfigured){try{const session=await currentSession();if(session.user){const url=session.admin?'admin.html':'student.html';for(const id of ['adminLink','mobileWorkspaceLink']){const a=document.getElementById(id);a.href=url;a.textContent='My workspace';}document.querySelector('#loginBtn').textContent='Switch account';}}catch{ /* Sign-in errors are displayed when the visitor submits. */ }}

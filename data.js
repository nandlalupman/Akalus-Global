import { sampleData, validateStudent, validateApplication } from './domain.mjs';
const KEY = 'akalus-demo-v1';
const clone = value => JSON.parse(JSON.stringify(value));
export class Workspace {
  constructor({ demo, session, onChange, onError }) {
    Object.assign(this, { demo, session, onChange, onError, students: [], applications: [], unsubscribers: [] });
    this.admin = demo ? !/\/student(?:\.html)?\/?$/.test(location.pathname) : session.admin;
  }
  async start() {
    if (this.demo) {
      const saved = localStorage.getItem(KEY);
      const data = saved ? JSON.parse(saved) : sampleData();
      this.students = data.students; this.applications = data.applications;
      this.onChange();
      this.storageListener = e => { if (e.key === KEY) { try { const d=JSON.parse(e.newValue); this.students=d.students; this.applications=d.applications; this.onChange(); } catch { this.onError(new Error('Demo storage changed. Reload the page.')); } } };
      window.addEventListener('storage', this.storageListener);
      return;
    }
    const {db,dbSDK:f,user}=this.session;
    let initialized = 0;
    for (const name of ['students','applications']) {
      let q=f.collection(db,name);
      if (!this.admin) q=f.query(q,f.where('ownerUid','==',user.uid));
      let first=true;
      this.unsubscribers.push(f.onSnapshot(q,snapshot=>{
        this[name]=snapshot.docs.map(d=>({...d.data(),id:d.id}));
        if(first) { initialized++; first=false; }
        if(initialized===2) this.onChange();
      },this.onError));
    }
  }
  async save(type, record, text) {
    if(!this.admin) throw new Error('Only a coordinator can edit records.');
    if(type==='students') {
      validateStudent(record);
      if(this.students.some(s=>s.id!==record.id && s.email.toLowerCase()===record.email.toLowerCase())) throw new Error('A student with this email already exists.');
      const old=this.students.find(s=>s.id===record.id);
      if(old && old.ownerUid!==record.ownerUid && this.applications.some(a=>a.studentId===record.id)) throw new Error('Update the linked UID before adding applications. For an existing student, migrate student and application ownership together using a trusted administrator.');
    } else validateApplication(record,this.students);
    const data=clone(record); const id=data.id || crypto.randomUUID(); delete data.id;
    if(type==='applications') data.ownerUid=this.students.find(s=>s.id===data.studentId)?.ownerUid || '';
    const event={date:new Date().toISOString(),text};
    if(this.demo) {
      const existing=this[type].find(r=>r.id===id);
      data.history=[...(existing?.history || []),event].slice(-100);
      const next={students:clone(this.students),applications:clone(this.applications)};
      const idx=next[type].findIndex(r=>r.id===id);
      if(idx<0) next[type].unshift({...data,id}); else next[type][idx]={...data,id};
      localStorage.setItem(KEY,JSON.stringify(next));
      this.students=next.students; this.applications=next.applications; this.onChange();
    } else {
      const {db,dbSDK:f}=this.session;
      const ref=f.doc(db,type,id);
      await f.runTransaction(db,async transaction=>{
        const existing=await transaction.get(ref);
        // Avoid silently overwriting a record edited by another coordinator.
        if(existing.exists() && record.updatedAt!==existing.data().updatedAt) throw new Error('This record was updated elsewhere. Close and reopen it before saving.');
        data.history=[...(existing.data()?.history || []),event].slice(-100);
        data.updatedAt=new Date().toISOString();
        transaction.set(ref,data);
      });
    }
    return id;
  }
  resetDemo(empty=false) {
    if(!this.demo || !this.admin) return;
    const next=empty?{students:[],applications:[]}:sampleData();
    localStorage.setItem(KEY,JSON.stringify(next)); Object.assign(this,next); this.onChange();
  }
  stop() { this.unsubscribers.forEach(fn=>fn()); window.removeEventListener('storage',this.storageListener); }
}

import test from 'node:test';
import assert from 'node:assert/strict';
import { today, sampleData, isDue, isOpen, validateStudent, validateApplication, csvCell, escapeHTML } from '../domain.mjs';
test('sample workspace relationships and defaults are valid',()=>{
  const data=sampleData();data.students.forEach(validateStudent);data.applications.forEach(a=>validateApplication(a,data.students));
  assert.ok(data.applications.every(a=>data.students.some(s=>s.id===a.studentId)));
  assert.match(today(),/^\d{4}-\d{2}-\d{2}$/);
});
test('follow-ups include overdue and today but exclude closed applications',()=>{
  assert.ok(isDue({status:'Applied',followUp:'2000-01-01'}));
  assert.ok(isDue({status:'Interview scheduled',followUp:today()}));
  for(const status of ['Rejected','Withdrawn','Joined']){assert.equal(isDue({status,followUp:today()}),false);assert.equal(isOpen({status}),false);}
  assert.equal(isDue({status:'Applied',followUp:'2999-01-01'}),false);
  assert.ok(!isDue({status:'Applied',followUp:''}));
});
test('application validation rejects orphaned students, missing fields, unsupported status and time without date',()=>{
  const d=sampleData(),a=d.applications[0];
  for(const change of [{studentId:'missing'},{company:''},{role:' '},{status:'Invented'},{interviewAt:'10:30',interviewDate:''}])assert.throws(()=>validateApplication({...a,...change},d.students));
});
test('student validation rejects invalid contact data and services',()=>{
  const s=sampleData().students[0];
  for(const change of [{name:''},{email:'invalid'},{ownerUid:'bad/uid'},{services:['unsupported']}])assert.throws(()=>validateStudent({...s,...change}));
});
test('user content is escaped and spreadsheet formulas are neutralized',()=>{
  assert.equal(escapeHTML('<img onerror="x">'), '&lt;img onerror=&quot;x&quot;&gt;');
  for(const value of ['=SUM(A1)','+cmd','-1+1','@SUM(A1)','  =1+1','\tformula'])assert.ok(csvCell(value).startsWith('"\''));
  assert.equal(csvCell('a,"b"\nc'),'"a,""b""\nc"');
});

export const STATUSES = ['Applied', 'Shortlisted', 'Interview scheduled', 'Offer received', 'Joined', 'Rejected', 'Withdrawn'];
export const SERVICES = ['Career assessment', 'Resume support', 'Communication coaching', 'Mock interview', 'Job applications'];
export const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const initials = name => String(name || '?').trim().split(/\s+/).slice(0,2).map(s => s[0]).join('').toUpperCase();
export const isOpen = a => !['Joined','Rejected','Withdrawn'].includes(a.status);
export const isDue = a => a.followUp && a.followUp <= today() && isOpen(a);
export const csvCell = value => '"' + (/^[\s]*[=+@\-\t\r]/.test(String(value ?? '')) ? "'" : '') + String(value ?? '').replace(/"/g, '""') + '"';
export function validateStudent(s) {
  if (!s.name?.trim() || s.name.length > 120) throw new Error('Enter a student name (up to 120 characters).');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email || '')) throw new Error('Enter a valid email address.');
  if (s.ownerUid && !/^[A-Za-z0-9_-]{1,128}$/.test(s.ownerUid)) throw new Error('Enter a valid Firebase user UID.');
  if (!Array.isArray(s.services) || s.services.some(v => !SERVICES.includes(v))) throw new Error('Choose valid support services.');
}
export function validateApplication(a, students) {
  if (!students.some(s => s.id === a.studentId)) throw new Error('Choose an existing student.');
  for (const key of ['company','role']) if (!a[key]?.trim() || a[key].length > 160) throw new Error('Company and job role are required (up to 160 characters).');
  if (!STATUSES.includes(a.status)) throw new Error('Choose a valid application status.');
  if (a.interviewAt && !a.interviewDate) throw new Error('Choose an interview date with the time.');
}
export function sampleData() {
  const date = today();
  const students = [
    {id:'sample-1',name:'Aarav Sharma',email:'aarav@example.com',phone:'',course:'B.Tech · Computer Science',batch:'Career launch 2026',targetRole:'Frontend Developer',coordinator:'Sonakshi',ownerUid:'',services:['Resume support','Mock interview','Job applications'],completedVideos:['communication','workshop'],notes:'Practice JavaScript interview questions and review portfolio.',history:[{date:new Date().toISOString(),text:'Resume reviewed and portfolio feedback shared.'}]},
    {id:'sample-2',name:'Ishita Verma',email:'ishita@example.com',phone:'',course:'MBA · Marketing',batch:'Career launch 2026',targetRole:'Marketing Associate',coordinator:'Sonakshi',ownerUid:'',services:['Career assessment','Communication coaching','Job applications'],completedVideos:['communication'],notes:'Prepare campaign examples for upcoming interview.',history:[{date:new Date().toISOString(),text:'Completed career assessment and role mapping.'}]},
    {id:'sample-3',name:'Kabir Mehta',email:'kabir@example.com',phone:'',course:'B.Com · Finance',batch:'Career launch 2026',targetRole:'Financial Analyst',coordinator:'Career team',ownerUid:'',services:['Resume support','Job applications'],completedVideos:[],notes:'Follow up on application and schedule a mock interview.',history:[]},
    {id:'sample-4',name:'Ananya Singh',email:'ananya@example.com',phone:'',course:'B.Tech · Information Technology',batch:'Career launch 2026',targetRole:'Data Analyst',coordinator:'Career team',ownerUid:'',services:['Career assessment','Mock interview','Job applications'],completedVideos:['communication','workshop','interview'],notes:'Review offer details together.',history:[{date:new Date().toISOString(),text:'Mock interview completed; feedback shared.'}]}
  ];
  const applications = [
    ['sample-1','Example Technologies','Frontend Developer','React, JavaScript and responsive UI','₹4–6 LPA','Interview scheduled',date],
    ['sample-2','Example Creative','Marketing Associate','Campaign planning and strong communication','₹3.5–5 LPA','Shortlisted',date],
    ['sample-3','Example Finance','Financial Analyst','Excel, financial reporting and analytical skills','₹4.5 LPA','Applied',date],
    ['sample-4','Example Analytics','Data Analyst','SQL, Excel and data visualization','₹6 LPA','Offer received',''],
    ['sample-1','Example Digital','Web Developer','HTML, CSS, JavaScript and portfolio','Not disclosed','Applied',''],
    ['sample-2','Example Media','Content Associate','Writing, research and social media','₹3–4 LPA','Applied','']
  ].map((r,i)=>({id:`sample-app-${i}`,studentId:r[0],company:r[1],role:r[2],requirements:r[3],package:r[4],status:r[5],followUp:r[6],appliedOn:date,location:i%2?'Jaipur':'Remote',jobUrl:'',interviewDate:'',interviewAt:'',notes:'Illustrative demo application — replace with your records.',history:[{date:new Date().toISOString(),text:`Application added · ${r[5]}`}]}));
  return {students,applications};
}

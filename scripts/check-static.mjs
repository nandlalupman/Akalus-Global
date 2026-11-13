import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const pages=['index.html','admin.html','student.html'];let checked=0;
for(const file of pages){
  const html=await readFile(path.join(root,file),'utf8');
  for(const [,url] of html.matchAll(/(?:src|href)="([^"]+)"/g)){
    if(/^(https?:|mailto:|tel:|#)/.test(url))continue;
    const local=url.split(/[?#]/)[0];if(!local)continue;
    await access(path.join(root,local));checked++;
  }
}
for(const name of ['communication','workshop','interview','group'])for(const ext of ['mp4','jpg'])await access(path.join(root,'media/training',name+'.'+ext));
console.log(`Verified ${checked} local page references and all 8 training assets.`);

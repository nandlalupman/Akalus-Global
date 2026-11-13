import { readFile, access, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../dist');
async function findPages(directory) {
  const entries=await readdir(directory,{withFileTypes:true});
  const nested=await Promise.all(entries.map(entry=>entry.isDirectory()?findPages(path.join(directory,entry.name)):entry.name.endsWith('.html')?[path.join(directory,entry.name)]:[]));
  return nested.flat();
}
const pages=await findPages(root);let checked=0;
for(const file of pages){
  const html=await readFile(file,'utf8');
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
  if(new Set(ids).size!==ids.length)throw new Error(`Duplicate element ID in ${file}`);
  for(const [,url] of html.matchAll(/(?:src|href)="([^"]+)"/g)){
    if(/^(https?:|mailto:|tel:|data:)/.test(url))continue;
    const [pathname,hash]=url.split('#');
    const local=pathname.split('?')[0];
    let target=local?(local.startsWith('/')?path.join(root,local.slice(1)):path.resolve(path.dirname(file),local)):file;
    if(local==='/')target=path.join(root,'index.html');
    await access(target);checked++;
    if(hash&&hash!=='signin'){
      const targetHTML=target===file?html:await readFile(target,'utf8');
      if(!targetHTML.includes(`id="${hash}"`))throw new Error(`Missing anchor ${url} in ${file}`);
    }
  }
}
for(const name of ['communication','workshop','interview','group'])for(const ext of ['mp4','jpg'])await access(path.join(root,'media/training',name+'.'+ext));
console.log(`Verified ${checked} links/assets across ${pages.length} HTML pages and all 8 training assets.`);

import { trainingCards } from './training.js';
document.querySelector('#publicTrainingGrid').innerHTML=trainingCards();
// Only one training clip plays at a time, including clips in the workspace.
document.addEventListener('play',event=>{if(event.target.tagName==='VIDEO')document.querySelectorAll('video').forEach(video=>{if(video!==event.target)video.pause();});},true);

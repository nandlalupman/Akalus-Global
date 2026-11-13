export const trainingVideos = [
  { id: 'communication', title: 'Communication in action', category: 'Communication', duration: '0:38', file: 'communication.mp4', poster: 'communication.jpg', description: 'A look inside presentation practice, conversations and guided learning.' },
  { id: 'workshop', title: 'Practice. Participate. Grow.', category: 'Classroom workshop', duration: '0:41', file: 'workshop.mp4', poster: 'workshop.jpg', description: 'Classroom activities that give learners space to participate and build confidence.' },
  { id: 'interview', title: 'Preparing for the next conversation', category: 'Interview practice', duration: '2:09', file: 'interview.mp4', poster: 'interview.jpg', description: 'Scenes from interview practice, peer learning and individual feedback.' },
  { id: 'group', title: 'Learning together', category: 'Group learning', duration: '0:21', file: 'group.mp4', poster: 'group.jpg', description: 'A short glimpse of an interactive group session.' }
];
export function trainingCards({ completed = [], progress = false, readonly = false } = {}) {
  return trainingVideos.map(v => `<article class="training-card">
    <div class="video-frame"><video controls playsinline preload="none" poster="media/training/${v.poster}" aria-label="${v.title}"><source src="media/training/${v.file}" type="video/mp4">Your browser does not support video playback.</video><span class="video-duration">${v.duration}</span></div>
    <div class="training-copy"><span class="eyebrow">${v.category}</span><h3>${v.title}</h3><p>${v.description}</p>${progress ? `<label class="training-check"><input type="checkbox" data-training="${v.id}" ${completed.includes(v.id) ? 'checked' : ''} ${readonly ? 'disabled' : ''}> Completed with coordinator</label>` : ''}</div>
  </article>`).join('');
}

import { api } from '../api';

// Simple HTML escaping
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Get type badge with emoji, color classes (explicit for Tailwind JIT)
function getTypeBadge(type) {
  const types = {
    'meteor_shower': {
      emoji: '🌠',
      label: 'Meteor Shower',
      badgeClasses: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      hoverBorder: 'hover:border-blue-500/30',
      titleHover: 'group-hover:text-blue-300',
      linkClasses: 'text-blue-400 hover:text-blue-300'
    },
    'lunar_eclipse': {
      emoji: '🌑',
      label: 'Lunar Eclipse',
      badgeClasses: 'bg-red-500/10 text-red-400 border-red-500/20',
      hoverBorder: 'hover:border-red-500/30',
      titleHover: 'group-hover:text-red-300',
      linkClasses: 'text-red-400 hover:text-red-300'
    },
    'solar_eclipse': {
      emoji: '☀️',
      label: 'Solar Eclipse',
      badgeClasses: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      hoverBorder: 'hover:border-yellow-500/30',
      titleHover: 'group-hover:text-yellow-300',
      linkClasses: 'text-yellow-400 hover:text-yellow-300'
    },
    'planetary_event': {
      emoji: '🪐',
      label: 'Planetary Event',
      badgeClasses: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      hoverBorder: 'hover:border-purple-500/30',
      titleHover: 'group-hover:text-purple-300',
      linkClasses: 'text-purple-400 hover:text-purple-300'
    },
    'default': {
      emoji: '✨',
      label: 'Sky Event',
      badgeClasses: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      hoverBorder: 'hover:border-cyan-500/30',
      titleHover: 'group-hover:text-cyan-300',
      linkClasses: 'text-cyan-400 hover:text-cyan-300'
    }
  };
  return types[type] || types['default'];
}

export class SkyEvents {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  async init() {
    if (!this.container) return;
    this.container.innerHTML = this.renderSkeleton();
    try {
      const currentYear = new Date().getFullYear();


      const data = await api.getSkyEvents(currentYear);


      this.render(data.events);
    } catch (error) {
      console.error('❌ Sky events error:', error);
      this.renderError(error);
    }
  }

  renderSkeleton() {
    return `
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        ${Array(6).fill(0).map(() => `
          <div class="bg-slate-800/50 rounded-xl p-6 animate-pulse border border-slate-700/50">
            <div class="flex justify-between mb-4">
              <div class="h-6 bg-slate-700 rounded-full w-28"></div>
              <div class="h-5 bg-slate-700 rounded w-16"></div>
            </div>
            <div class="h-7 bg-slate-700 rounded w-3/4 mb-3"></div>
            <div class="space-y-2">
              <div class="h-4 bg-slate-700 rounded w-full"></div>
              <div class="h-4 bg-slate-700 rounded w-5/6"></div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderError(error) {
    const message = error?.message || 'Unable to load sky events';
    this.container.innerHTML = `
      <div class="bg-red-900/20 border border-red-500/50 p-6 rounded-xl text-center">
        <svg class="w-10 h-10 text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
        <p class="text-red-200">${escapeHtml(message)}</p>
        <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition text-sm">
          Retry
        </button>
      </div>
    `;
  }

  render(events) {
    if (!events || events.length === 0) {
      this.container.innerHTML = `
        <div class="text-center py-12 bg-slate-800/30 rounded-xl border border-slate-700/50">
          <svg class="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
          </svg>
          <p class="text-slate-400 text-lg">No major events found for this year.</p>
          <p class="text-slate-500 text-sm mt-2">Check back later for updates.</p>
        </div>
      `;
      return;
    }

    // Find upcoming events (today onwards)
    const now = new Date();
    const upcomingEvents = events.filter(e => {
      const eventDate = new Date(e.dateUTC || e.date);
      return eventDate >= new Date(now.setHours(0, 0, 0, 0));
    });

    // Highlight the next upcoming event
    const nextEvent = upcomingEvents[0];

    this.container.innerHTML = `
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        ${events.map((event, index) => {
      const badge = getTypeBadge(event.type);
      const isNext = nextEvent && event.id === nextEvent.id;
      const isPast = new Date(event.dateUTC || event.date) < new Date();

      return `
          <article class="relative bg-slate-800/40 backdrop-blur-sm hover:bg-slate-800/60 transition-all duration-300 rounded-xl p-6 border ${isNext ? 'border-cyan-500/50 ring-2 ring-cyan-500/20' : 'border-slate-700/50'} shadow-lg hover:shadow-xl ${badge.hoverBorder} group ${isPast ? 'opacity-60' : ''}">
            ${isNext ? '<div class="absolute -top-3 left-4 px-3 py-1 bg-cyan-500 text-white text-xs font-bold rounded-full">🔜 NEXT UP</div>' : ''}
            ${isPast ? '<div class="absolute -top-3 right-4 px-2 py-0.5 bg-slate-600 text-slate-300 text-xs rounded-full">Past</div>' : ''}
            <div class="flex items-start justify-between mb-4 ${isNext ? 'mt-2' : ''}">
              <span class="px-3 py-1 text-xs font-semibold ${badge.badgeClasses} rounded-full border flex items-center">
                <span class="mr-1">${badge.emoji}</span> ${badge.label}
              </span>
              <span class="text-slate-400 text-sm flex items-center bg-slate-900/50 px-2 py-1 rounded">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                ${escapeHtml(event.peakDate)}
              </span>
            </div>
            <h3 class="text-xl font-bold text-white mb-3 ${badge.titleHover} transition">${escapeHtml(event.name)}</h3>
            <p class="text-slate-300 text-sm mb-4 leading-relaxed line-clamp-3">${escapeHtml(event.description)}</p>
            ${event.viewingTips ? `<p class="text-xs text-slate-400 italic mb-3">💡 ${escapeHtml(event.viewingTips)}</p>` : ''}
            ${event.sourceUrl ? `
              <a href="${event.sourceUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center text-sm ${badge.linkClasses} transition font-medium">
                Learn more 
                <svg class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
              </a>
            ` : ''}
          </article>
        `;
    }).join('')}
      </div>
    `;
  }
}

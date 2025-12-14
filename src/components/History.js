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

export class History {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  async init(month, day) {
    if (!this.container) return;
    this.container.innerHTML = this.renderSkeleton();
    try {
      const data = await api.getHistory(month, day);
      this.render(data);
    } catch (error) {
      this.renderError(error);
    }
  }

  renderSkeleton() {
    return `
      <div class="space-y-4">
        ${Array(5).fill(0).map(() => `
          <div class="flex gap-3 p-3 rounded-lg bg-slate-800/20 animate-pulse">
            <div class="w-12 h-4 bg-slate-700 rounded shrink-0"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-slate-700 rounded w-full"></div>
              <div class="h-3 bg-slate-700 rounded w-1/4"></div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderError(error) {
    this.container.innerHTML = `
      <div class="p-4 text-center text-slate-400 bg-slate-800/30 rounded-lg">
        <p>Unable to load science history.</p>
        <button onclick="location.reload()" class="mt-2 text-blue-400 hover:text-blue-300 text-sm">Retry</button>
      </div>
    `;
  }

  render(data) {
    const { events = [], births = [] } = data || {};

    if (events.length === 0 && births.length === 0) {
      this.container.innerHTML = `
        <div class="text-center py-8">
          <svg class="w-12 h-12 text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p class="text-slate-400">No science history events today.</p>
        </div>
      `;
      return;
    }

    const renderItem = (item, type) => {
      const isEvent = type === 'Event';
      return `
        <div class="flex gap-3 p-3 border-l-2 ${isEvent ? 'border-emerald-500' : 'border-amber-500'} bg-slate-800/20 hover:bg-slate-800/40 rounded-r-lg transition group">
          <div class="w-14 font-mono text-slate-500 text-sm pt-0.5 shrink-0 font-medium">${item.year || ''}</div>
          <div class="flex-1 min-w-0">
            <p class="text-slate-200 text-sm leading-relaxed group-hover:text-white transition">${escapeHtml(item.text)}</p>
            <span class="text-xs text-slate-500 uppercase tracking-wider mt-1 inline-flex items-center">
              <span class="mr-1">${isEvent ? '🔬' : '🎂'}</span> ${type}
            </span>
          </div>
        </div>
      `;
    };

    this.container.innerHTML = `
      <div class="space-y-6">
        <!-- Science Events -->
        ${events.length > 0 ? `
          <div>
            <h3 class="text-lg font-bold text-emerald-400 mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
              Events
            </h3>
            <div class="space-y-2">
              ${events.slice(0, 5).map(e => renderItem(e, 'Event')).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Scientific Births -->
        ${births.length > 0 ? `
          <div class="pt-4 border-t border-slate-700/50">
            <h3 class="text-lg font-bold text-amber-400 mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              Notable Births
            </h3>
            <div class="space-y-2">
              ${births.slice(0, 5).map(b => renderItem(b, 'Birth')).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }
}

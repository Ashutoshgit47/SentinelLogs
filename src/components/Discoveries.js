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

export class Discoveries {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  async init(month, day) {
    if (!this.container) return;
    this.container.innerHTML = this.renderSkeleton();
    try {
      const data = await api.getDiscoveries(month, day);
      this.render(data.discoveries);
    } catch (error) {
      this.renderError(error);
    }
  }

  renderSkeleton() {
    return `
      <div class="space-y-6">
        ${Array(4).fill(0).map(() => `
          <div class="flex gap-4 md:gap-6 animate-pulse">
            <div class="hidden md:flex w-20 h-20 bg-slate-700 rounded-full shrink-0"></div>
            <div class="flex-1 bg-slate-800/30 rounded-xl p-5 border border-slate-700/50">
              <div class="h-5 bg-slate-700 rounded w-20 mb-3"></div>
              <div class="h-6 bg-slate-700 rounded w-3/4 mb-2"></div>
              <div class="h-4 bg-slate-700 rounded w-1/2"></div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderError(error) {
    const message = error?.message || 'Failed to load discoveries';
    this.container.innerHTML = `
      <div class="p-6 text-center bg-red-900/20 border border-red-500/50 rounded-xl">
        <svg class="w-10 h-10 text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
        <p class="text-red-200">${escapeHtml(message)}</p>
      </div>
    `;
  }

  render(discoveries) {
    if (!discoveries || discoveries.length === 0) {
      this.container.innerHTML = `
        <div class="text-center py-12 bg-slate-800/30 rounded-xl border border-slate-700/50">
          <svg class="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
          </svg>
          <p class="text-slate-400 text-lg">No astronomical discoveries recorded on this date.</p>
          <p class="text-slate-500 text-sm mt-2">Explore other sections for more cosmic content!</p>
        </div>
      `;
      return;
    }

    this.container.innerHTML = `
      <div class="space-y-6">
        ${discoveries.map((item, index) => `
          <article class="relative pl-8 md:pl-0 group">
            <div class="md:flex items-start gap-6">
              <!-- Timeline line (mobile) -->
              <div class="absolute left-3 top-0 bottom-0 w-px bg-gradient-to-b from-purple-500 to-pink-500 md:hidden" aria-hidden="true"></div>
              
              <!-- Year Bubble -->
              <div class="absolute left-0 top-1 w-6 h-6 rounded-full bg-purple-500 border-2 border-purple-300 z-10 md:static md:w-20 md:h-20 md:rounded-full md:bg-gradient-to-br md:from-purple-600 md:to-pink-600 md:flex md:items-center md:justify-center md:shrink-0 shadow-lg" aria-hidden="true">
                <span class="hidden md:block font-bold text-lg text-white">${item.year || ''}</span>
              </div>
              
              <!-- Content -->
              <div class="flex-1 bg-slate-800/40 hover:bg-slate-800/60 rounded-xl p-5 border border-slate-700/50 transition-all duration-300 hover:border-purple-500/30 hover:shadow-lg">
                <span class="md:hidden text-purple-400 font-bold mb-2 block text-sm">${item.year || ''}</span>
                <h3 class="text-lg font-bold text-white mb-3 md:text-xl leading-snug group-hover:text-purple-300 transition">${escapeHtml(item.text)}</h3>
                <div class="flex flex-wrap gap-2">
                  <span class="px-2 py-1 rounded text-xs bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center">
                    <span class="mr-1">🚀</span> Space Discovery
                  </span>
                  <span class="px-2 py-1 rounded text-xs bg-slate-700/50 text-slate-400">
                    via Wikipedia
                  </span>
                </div>
              </div>
            </div>
          </article>
        `).join('')}
      </div>
    `;
  }
}

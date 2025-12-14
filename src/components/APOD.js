import { api } from '../api';

// Simple HTML escaping to prevent XSS
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

export class APOD {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  async init() {
    if (!this.container) return;
    this.renderLoading();
    try {
      const data = await api.getAPOD();
      this.render(data);
    } catch (error) {
      this.renderError(error);
    }
  }

  renderLoading() {
    this.container.innerHTML = `
      <div class="animate-pulse rounded-2xl overflow-hidden border border-slate-700">
        <div class="h-[50vh] bg-slate-800 flex items-center justify-center">
          <div class="text-center">
            <div class="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <span class="text-slate-400">Loading Astronomy Picture of the Day...</span>
          </div>
        </div>
      </div>
    `;
  }

  renderError(error) {
    const message = error?.message || 'Unknown error occurred';
    this.container.innerHTML = `
      <div class="p-8 bg-red-900/20 border border-red-500/50 rounded-2xl text-center">
        <svg class="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
        <h3 class="text-xl font-bold text-red-300 mb-2">Failed to Load APOD</h3>
        <p class="text-red-200/80 mb-4">${escapeHtml(message)}</p>
        <button onclick="location.reload()" class="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition font-medium">
          Retry
        </button>
      </div>
    `;
  }

  render(data) {
    const isImage = data.media_type === 'image';
    const title = escapeHtml(data.title);
    const explanation = escapeHtml(data.explanation);
    const copyright = data.copyright ? escapeHtml(data.copyright) : null;

    this.container.innerHTML = `
      <article class="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50 group" role="article" aria-labelledby="apod-heading">
        ${isImage ? `
          <img 
            src="${data.url}" 
            alt="${title}" 
            class="w-full h-auto min-h-[40vh] max-h-[80vh] object-cover transition duration-700 group-hover:scale-105"
            loading="eager"
          >
        ` : `
          <div class="aspect-video w-full bg-slate-900">
            <iframe 
              src="${data.url}" 
              class="w-full h-full" 
              frameborder="0" 
              allowfullscreen
              title="${title}"
            ></iframe>
          </div>
        `}
        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 via-slate-900/90 to-transparent p-6 md:p-8 pt-32">
          <div class="flex items-center gap-2 mb-3">
            <span class="px-3 py-1 text-xs font-semibold bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">
              NASA APOD
            </span>
            <span class="text-slate-400 text-sm">${data.date}</span>
          </div>
          <h2 id="apod-heading" class="text-2xl md:text-4xl font-bold mb-3 text-white leading-tight">${title}</h2>
          ${copyright ? `<p class="text-sm text-slate-400 mb-4">📷 © ${copyright}</p>` : ''}
          <p class="text-slate-300 max-w-4xl leading-relaxed text-sm lg:text-base hidden lg:block line-clamp-4">
            ${explanation}
          </p>
          <div class="mt-4 flex flex-wrap gap-3">
            ${data.hdurl ? `
              <a href="${data.hdurl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition font-medium text-sm">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                View HD
              </a>
            ` : ''}
            <button id="read-explanation-btn" class="lg:hidden inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition font-medium text-sm" onclick="document.getElementById('mobile-explanation-panel').classList.remove('translate-y-full');">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
              <span>Read Explanation</span>
            </button>
          </div>
        </div>
        
        <!-- Mobile Bottom Sheet Explanation -->
        <div id="mobile-explanation-panel" class="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700 p-6 z-50 transform translate-y-full transition-transform duration-300 ease-in-out shadow-2xl max-h-[70vh] flex flex-col">
          <div class="flex items-center justify-between mb-4 shrink-0">
            <h3 class="text-lg font-bold text-white">Explanation</h3>
            <button onclick="document.getElementById('mobile-explanation-panel').classList.add('translate-y-full')" class="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <div class="overflow-y-auto pr-2">
            <p class="text-slate-300 text-sm leading-relaxed whitespace-pre-line">${explanation}</p>
          </div>
        </div>
      </article>
    `;
  }
}

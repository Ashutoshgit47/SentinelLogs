export class Navbar {
  constructor() {
    this.element = document.createElement('nav');
    this.element.className = 'fixed top-0 w-full z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50';
    this.element.setAttribute('role', 'navigation');
    this.element.setAttribute('aria-label', 'Main navigation');
    this.isMenuOpen = false;
    this.render();
    this.bindEvents();
  }

  render() {
    this.element.innerHTML = `
      <div class="container mx-auto px-4 h-16 flex items-center justify-between">
        <a href="#" class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 hover:opacity-80 transition">
          🌌 Cosmic Timeline
        </a>
        <div id="desktop-nav" class="hidden md:flex space-x-8 text-slate-300">
          <a href="#apod" class="hover:text-blue-400 transition font-medium">APOD</a>
          <a href="#sky-events" class="hover:text-blue-400 transition font-medium">Sky Events</a>
          <a href="#discoveries" class="hover:text-blue-400 transition font-medium">Discoveries</a>
          <a href="#history" class="hover:text-blue-400 transition font-medium">History</a>
        </div>
        <button id="mobile-menu-btn" class="md:hidden text-slate-300 p-2 rounded-lg hover:bg-slate-800 transition" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="mobile-menu">
          <svg id="menu-icon" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
          </svg>
          <svg id="close-icon" class="w-6 h-6 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <!-- Mobile Menu -->
      <div id="mobile-menu" class="md:hidden hidden bg-slate-900/98 border-t border-slate-700/50">
        <div class="container mx-auto px-4 py-4 space-y-3">
          <a href="#apod" class="block py-3 px-4 text-slate-200 hover:bg-slate-800 rounded-lg transition font-medium">🔭 APOD</a>
          <a href="#sky-events" class="block py-3 px-4 text-slate-200 hover:bg-slate-800 rounded-lg transition font-medium">🌠 Sky Events</a>
          <a href="#discoveries" class="block py-3 px-4 text-slate-200 hover:bg-slate-800 rounded-lg transition font-medium">🚀 Discoveries</a>
          <a href="#history" class="block py-3 px-4 text-slate-200 hover:bg-slate-800 rounded-lg transition font-medium">📜 History</a>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const btn = this.element.querySelector('#mobile-menu-btn');
    const menu = this.element.querySelector('#mobile-menu');
    const menuIcon = this.element.querySelector('#menu-icon');
    const closeIcon = this.element.querySelector('#close-icon');
    const mobileLinks = this.element.querySelectorAll('#mobile-menu a');

    if (btn && menu) {
      btn.addEventListener('click', () => {
        this.isMenuOpen = !this.isMenuOpen;
        menu.classList.toggle('hidden', !this.isMenuOpen);
        menuIcon.classList.toggle('hidden', this.isMenuOpen);
        closeIcon.classList.toggle('hidden', !this.isMenuOpen);
        btn.setAttribute('aria-expanded', this.isMenuOpen);
      });

      // Close menu when a link is clicked
      mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
          this.isMenuOpen = false;
          menu.classList.add('hidden');
          menuIcon.classList.remove('hidden');
          closeIcon.classList.add('hidden');
          btn.setAttribute('aria-expanded', 'false');
        });
      });
    }
  }
}

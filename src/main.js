import './style.css';
import { Navbar } from './components/Navbar';
import { APOD } from './components/APOD';
import { SkyEvents } from './components/SkyEvents';
import { Discoveries } from './components/Discoveries';
import { History } from './components/History';
import { formatTodayHeader } from './utils/dateFormat';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Set current year in footer
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // 2. Initialize Navbar
    const navbarContainer = document.getElementById('navbar-container');
    if (navbarContainer) {
        const navbar = new Navbar();
        navbarContainer.appendChild(navbar.element);
    }

    // 3. Initialize Date Display
    const dateDisplay = document.getElementById('current-date-display');
    if (dateDisplay) {
        dateDisplay.textContent = formatTodayHeader();
    }

    // 4. Initialize Components
    const apod = new APOD('apod');
    const skyEvents = new SkyEvents('sky-events-container');
    const discoveries = new Discoveries('discoveries-container');
    const history = new History('history-container');

    // 5. Load Data with error boundaries
    apod.init().catch(err => console.error('APOD init failed:', err));
    skyEvents.init().catch(err => console.error('SkyEvents init failed:', err));

    // Discoveries & History use today's date
    const today = new Date();
    discoveries.init(today.getMonth() + 1, today.getDate()).catch(err => console.error('Discoveries init failed:', err));
    history.init(today.getMonth() + 1, today.getDate()).catch(err => console.error('History init failed:', err));


});

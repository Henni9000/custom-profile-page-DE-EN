document.addEventListener('DOMContentLoaded', () => {
    // --- Globale Variablen und Konstanten ---
    const apiUrl = 'https://api.lanyard.rest/v1/users/739397631998165023';
    let currentLanguage = 'de'; // Standard Sprache
    let lastFetchedUserData = null; // Zum Speichern der API-Daten für Sprachwechsel
    let refreshInterval; // Für Lanyard Refresh

    // === Übersetzungen ===
    const translations = {
        'de': {
            pageTitle: "Henni9000 - Profil",
            loadingText: "Henni9000's Profil wird geladen...",
            bioPrefix: "Ich bin",
            locationText: "Deutschland",
            copyTooltip: "Benutzername kopieren",
            copySuccess: "Kopiert!",
            copyError: "Kopieren fehlgeschlagen!",
            activityLoading: "Lädt Aktivität...",
            activityDoingNothing: "Macht gerade nichts...",
            activityOffline: "Offline",
            socialYoutube: "YouTube",
            socialDiscord: "Discord",
            socialGithub: "GitHub",
            socialLink1: "9000-Radio",
            socialLink2: "Gaming Projects",
            errorPrefix: "Fehler:",
            errorRetry: "Versuche es erneut...",
            timestampPrefix: "seit",
            // NEUE KEYS FÜR KARTEN
            aboutTitle: "Über Mich",
            aboutText1: "Hey! Ich bin Henni, ein junger Entwickler aus Deutschland mit einer Leidenschaft für Coding, Gaming und Musik. Ich experimentiere gerne mit verschiedenen Technologien und erstelle kleine Web-Projekte wie dieses hier.",
            aboutSkillsTitle: "Skills",
            aboutText2: "Wenn ich nicht gerade programmiere, findest du mich wahrscheinlich in irgendeinem Spiel oder beim Hören von Musik auf meinem 9000-Radio Projekt.",
            projectsTitle: "Projekte",
            project1Title: "Gaming Website",
            project1Desc: "Eine Sammlung meiner kleinen Spielprojekte und Experimente.",
            projectLink: "Demo ansehen",
            project2Title: "9000-Radio",
            project2Desc: "Ein Web-Radio-Projekt zum Entdecken und Hören von Musik.",
            project3Title: "Dieses Profil",
            project3Desc: "Die Seite, die du gerade siehst! Gebaut mit HTML, CSS und Vanilla JS.",
            projectRepoLink: "Repository ansehen",
            contactTitle: "Kontakt",
            contactText: "Am besten erreichst du mich über Discord oder schau auf meinen anderen Profilen vorbei!",
            prevCardLabel: "Vorherige Karte",
            nextCardLabel: "Nächste Karte",
            goToCardLabel: "Gehe zu Karte" // Wird in JS mit Nummer ergänzt
        },
        'en': {
            pageTitle: "Henni9000 - Profile",
            loadingText: "Loading Henni9000's profile...",
            bioPrefix: "I am",
            locationText: "Germany",
            copyTooltip: "Copy Username",
            copySuccess: "Copied!",
            copyError: "Copy failed!",
            activityLoading: "Loading activity...",
            activityDoingNothing: "Doing nothing...",
            activityOffline: "Offline",
            socialYoutube: "YouTube",
            socialDiscord: "Discord",
            socialGithub: "GitHub",
            socialLink1: "9000-Radio",
            socialLink2: "Gaming Projects",
            errorPrefix: "Error:",
            errorRetry: "Retrying...",
            timestampPrefix: "for",
            // NEUE KEYS FÜR KARTEN (Englisch)
            aboutTitle: "About Me",
            aboutText1: "Hey! I'm Henni, a young developer from Germany with a passion for coding, gaming, and music. I enjoy experimenting with different technologies and creating small web projects like this one.",
            aboutSkillsTitle: "Skills",
            aboutText2: "When I'm not coding, you'll probably find me in some game or listening to music on my 9000-Radio project.",
            projectsTitle: "Projects",
            project1Title: "Gaming Website",
            project1Desc: "A collection of my small game projects and experiments.",
            projectLink: "View Demo",
            project2Title: "9000-Radio",
            project2Desc: "A web radio project for discovering and listening to music.",
            project3Title: "This Profile",
            project3Desc: "The page you're currently viewing! Built with HTML, CSS, and Vanilla JS.",
            projectRepoLink: "View Repository",
            contactTitle: "Contact",
            contactText: "The best way to reach me is via Discord, or check out my other profiles!",
            prevCardLabel: "Previous Card",
            nextCardLabel: "Next Card",
            goToCardLabel: "Go to card" // Will be appended with number in JS
        }
    };

    // --- DOM-Elemente ---
    const loader = document.getElementById('loader');
    const bodyElement = document.body;
    // Profilkarte & Inhalte (jetzt innerhalb von .card#card-profile)
    const profileCardElement = document.getElementById('card-profile'); // Die Profilkarte selbst
    const profilePicture = document.getElementById('profile-picture');
    const avatarDecoration = document.getElementById('avatar-decoration');
    const usernameElement = document.getElementById('username');
    const bioElement = document.getElementById('bio');
    const statusPfp = document.getElementById('status-pfp');
    const discordUserElement = document.getElementById('discord-user');
    const copyUsernameButton = document.getElementById('copy-username');
    const activityDetailsElement = document.getElementById('activity-details');
    const activityStateElement = document.getElementById('activity-state');
    const activityTimeElement = document.getElementById('activity-time');
    const activityButtonsContainer = document.getElementById('activity-buttons');
    const statusIndicator = document.getElementById('status-indicator');
    const errorMessageElement = profileCardElement.querySelector('#error-message'); // Fehler in der Profilkarte

    // Musik & Lautstärke
    const audioElement = document.getElementById('audio-player');
    const playPauseButton = document.getElementById('play-pause-btn');
    const progressBar = document.getElementById('progress-bar');
    const progressElement = document.getElementById('progress');
    const currentTimeElement = document.getElementById('time-current');
    const totalTimeElement = document.getElementById('time-total');
    const volumeControlContainer = document.getElementById('volume-control-container');
    const volumeIconDisplay = document.getElementById('volume-icon-display');
    const volumeSlider = document.getElementById('volume-slider');
    let lastVolume = audioElement.volume;

    // Sprache
    const langDeButton = document.getElementById('lang-de');
    const langEnButton = document.getElementById('lang-en');

    // Kartenstapel Elemente
    const cardStackContainer = document.querySelector('.card-stack-container');
    const cards = Array.from(cardStackContainer.querySelectorAll('.card'));
    const prevCardButton = document.getElementById('prev-card');
    const nextCardButton = document.getElementById('next-card');
    const cardNavigationContainer = document.querySelector('.card-navigation'); // Container für Navi
    const cardDotsContainer = cardNavigationContainer.querySelector('.card-dots');
    let cardDots = [];
    let currentCardIndex = 0;
    let touchStartX = 0, touchStartY = 0, touchEndX = 0, touchEndY = 0;
    let isSwiping = false;
    const swipeThreshold = 50;

    // === Kartenstapel Logik ===
    function initializeDots() {
        cardDotsContainer.innerHTML = '';
        cardDots = [];
        cards.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.classList.add('dot');
            dot.dataset.index = index;
             // Aria-Label wird in setLanguage gesetzt
            dot.addEventListener('click', () => showCardByIndex(index));
            cardDotsContainer.appendChild(dot);
            cardDots.push(dot);
        });
    }

    function showCardByIndex(index) {
        if (index < 0 || index >= cards.length || index === currentCardIndex) {
            return; // Ungültiger Index oder keine Änderung
        }

        currentCardIndex = index;

        cards.forEach((card, i) => {
            card.classList.remove('active', 'prev', 'next', 'hidden');
            if (i === currentCardIndex) card.classList.add('active');
            else if (i === currentCardIndex - 1) card.classList.add('prev');
            else if (i === currentCardIndex + 1) card.classList.add('next');
            else { card.classList.add('hidden'); if (i < currentCardIndex) card.classList.add('prev'); }
        });

        prevCardButton.disabled = currentCardIndex === 0;
        nextCardButton.disabled = currentCardIndex === cards.length - 1;

        cardDots.forEach((dot, i) => dot.classList.toggle('active', i === currentCardIndex));
    }

    // === Sprachumschaltfunktion ===
    function setLanguage(lang) {
        if (!translations[lang]) return;
        currentLanguage = lang;
        localStorage.setItem('preferredLanguage', lang);
        document.documentElement.lang = lang;

        document.querySelectorAll('[data-translate]').forEach(el => {
            const key = el.getAttribute('data-translate');
            if (translations[lang][key]) el.textContent = translations[lang][key];
        });
        document.querySelectorAll('[data-translate-title]').forEach(el => {
            const key = el.getAttribute('data-translate-title');
            if (translations[lang][key]) el.title = translations[lang][key];
        });

        document.title = translations[lang].pageTitle;
        langDeButton.classList.toggle('active', lang === 'de');
        langEnButton.classList.toggle('active', lang === 'en');

        // Update Aria-Labels der Navi-Elemente
        prevCardButton.setAttribute('aria-label', translations[lang].prevCardLabel);
        nextCardButton.setAttribute('aria-label', translations[lang].nextCardLabel);
        cardDots.forEach((dot, index) => {
            dot.setAttribute('aria-label', `${translations[lang].goToCardLabel} ${index + 1}`);
        });


        if (lastFetchedUserData) {
           updateDynamicTexts(lastFetchedUserData);
        }
        copyUsernameButton.title = translations[currentLanguage].copyTooltip;
    }

    // === Hilfsfunktion zum Aktualisieren sprachabhängiger dynamischer Texte ===
    function updateDynamicTexts(userData) { /* ... (wie zuvor) ... */ }

    // === Hintergrund-Logik ===
     /* ... (wie zuvor) ... */

    // --- Initial Fetch Function (Lanyard) ---
    const fetchData = () => {
        console.log("Fetching new data...");
         // Nur Lade-Text der Profilkarte aktualisieren, wenn diese aktiv ist
        if (cards[currentCardIndex]?.id === 'card-profile') {
            errorMessageElement.textContent = '';
            activityDetailsElement.textContent = translations[currentLanguage].activityLoading;
            activityStateElement.textContent = '';
            activityTimeElement.textContent = '';
            activityButtonsContainer.innerHTML = '';
        }

        fetch(apiUrl)
            .then(response => response.ok ? response.json() : Promise.reject(new Error(`HTTP error! Status: ${response.status}`)))
            .then(data => {
                if (data.success && data.data) {
                    lastFetchedUserData = data.data;
                     // Nur Profilkarte aktualisieren, wenn sie aktiv ist
                    if (cards[currentCardIndex]?.id === 'card-profile') {
                         updateProfile(data.data);
                    }
                    // Sichtbarkeit des Stacks wird nach dem ersten Laden gesetzt
                    if (cardStackContainer.style.visibility === 'hidden') {
                        hideLoaderAndShowStack();
                    }
                } else {
                    lastFetchedUserData = null;
                    throw new Error('API did not return success or data is missing.');
                }
            })
            .catch(error => {
                console.error('Error fetching Discord data:', error);
                lastFetchedUserData = null;
                if (cards[currentCardIndex]?.id === 'card-profile') {
                     displayError(error.message);
                     activityDetailsElement.textContent = translations[currentLanguage].errorPrefix; // Fehler anzeigen
                }
                 if (cardStackContainer.style.visibility === 'hidden') {
                        hideLoaderAndShowStack(); // Stack trotzdem anzeigen
                    }
            });
    };

    // --- Funktion zum Ausblenden des Loaders und Anzeigen des Kartenstapels ---
    const hideLoaderAndShowStack = () => {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
            cardStackContainer.style.visibility = 'visible'; // Kartenstapel sichtbar machen
            showCardByIndex(0); // Zeige die erste Karte explizit nach dem Laden
        }, 500);
    };


    // --- Function to Update DOM Elements (Discord Part, IN der Profilkarte) ---
    function updateProfile(userData) {
        // Nur ausführen, wenn die Profilkarte existiert und Daten da sind
        if (!profileCardElement || !userData) return;

        const user = userData.discord_user;
        const activities = userData.activities;
        const status = userData.discord_status;

        // Favicon setzen
        if (user && user.id && user.avatar) { /* ... Favicon Code wie zuvor ... */ }

        // Profilkarten-spezifische Elemente aktualisieren
        const pfpUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith('a_') ? 'gif' : 'png'}?size=256`;
        profilePicture.src = pfpUrl;
        statusPfp.src = pfpUrl;
        const displayName = user.global_name || user.username;
        usernameElement.textContent = displayName;

        if (avatarDecoration && user.avatar_decoration_data?.asset) { /* ... Deko Code ... */ }
        else if (avatarDecoration) { avatarDecoration.style.display = 'none'; }

        bioElement.textContent = `${translations[currentLanguage].bioPrefix} ${displayName}`;

        const fullUsername = user.discriminator === "0" ? user.username : `${user.username}#${user.discriminator}`;
        discordUserElement.textContent = fullUsername;
        copyUsernameButton.dataset.username = fullUsername;

        statusIndicator.className = `status-dot ${status}`;
        statusIndicator.classList.remove('pulse-online', 'pulse-dnd');
        if (status === 'online') statusIndicator.classList.add('pulse-online');
        else if (status === 'dnd') statusIndicator.classList.add('pulse-dnd');

        // Activity
        let primaryActivity = activities.find(act => act.type !== 4) || activities.find(act => act.type === 4) || null;
        activityButtonsContainer.innerHTML = '';
        activityStateElement.textContent = '';
        activityTimeElement.textContent = '';

        if (primaryActivity) {
            let detailsText = ''; let stateText = '';
            if (primaryActivity.type === 4 && primaryActivity.state) { detailsText = primaryActivity.state; if (primaryActivity.emoji?.name) detailsText = `${primaryActivity.emoji.name} ${detailsText}`; }
            else { detailsText = primaryActivity.name || ''; if (primaryActivity.details) stateText = primaryActivity.details; if (primaryActivity.state) { if (stateText && primaryActivity.state !== stateText) stateText += ` | ${primaryActivity.state}`; else if (!stateText) stateText = primaryActivity.state; } }

            activityDetailsElement.textContent = detailsText || '...';
            activityStateElement.textContent = stateText;
            activityStateElement.style.display = stateText ? 'block' : 'none';

            if (primaryActivity.timestamps?.start) {
                activityTimeElement.textContent = `${translations[currentLanguage].timestampPrefix} ${formatDuration(primaryActivity.timestamps.start)}`;
                activityTimeElement.style.display = 'block';
            } else { activityTimeElement.style.display = 'none'; }

            if (primaryActivity.buttons && primaryActivity.buttons.length > 0) { /* ... Button Code ... */ }

        } else {
            if (status === 'offline') { activityDetailsElement.textContent = translations[currentLanguage].activityOffline; }
            else { activityDetailsElement.textContent = translations[currentLanguage].activityDoingNothing; }
            activityStateElement.style.display = 'none';
            activityTimeElement.style.display = 'none';
        }
    }

    // --- Helper Functions (formatDuration, formatTime, displayError) ---
    function formatDuration(startTime) { /* ... (wie zuvor) ... */ }
    function formatTime(seconds) { /* ... (wie zuvor) ... */ }
    function displayError(message) {
         if (errorMessageElement) { // Nur wenn Element existiert
             errorMessageElement.textContent = `${translations[currentLanguage].errorPrefix} ${message} ${translations[currentLanguage].errorRetry}`;
         }
    }

    // --- Event Listener (Copy, Music, Volume) ---
    copyUsernameButton?.addEventListener('click', () => { /* ... (wie zuvor, mit Sprachunterstützung) ... */ });
    // Music Player Logic...
    function togglePlayPause() { /* ... */ }
    function updatePlayPauseIcon() { /* ... */ }
    function updateProgress() { /* ... */ }
    function setProgress(e) { /* ... */ }
    playPauseButton?.addEventListener('click', togglePlayPause);
    audioElement?.addEventListener('play', updatePlayPauseIcon);
    audioElement?.addEventListener('pause', updatePlayPauseIcon);
    audioElement?.addEventListener('ended', updatePlayPauseIcon);
    audioElement?.addEventListener('loadedmetadata', () => { /* ... (wie zuvor, inkl. Volume-Init) ... */ });
    audioElement?.addEventListener('timeupdate', updateProgress);
    progressBar?.addEventListener('click', setProgress);
    // Volume Control Logic...
    function updateVolumeIcon(volume) { /* ... */ }
    volumeSlider?.addEventListener('input', (e) => { /* ... */ });
    volumeIconDisplay?.addEventListener('click', () => { /* ... */ });
    audioElement?.addEventListener('volumechange', () => { /* ... */ });

    // --- Event Listener für Karten-Navigation ---
    prevCardButton?.addEventListener('click', () => showCardByIndex(currentCardIndex - 1));
    nextCardButton?.addEventListener('click', () => showCardByIndex(currentCardIndex + 1));

    // --- Event Listener für Touch/Swipe ---
    cardStackContainer?.addEventListener('touchstart', (e) => {
        if (e.target === cardStackContainer || cards.includes(e.target.closest('.card'))) {
            touchStartX = e.changedTouches[0].screenX; touchStartY = e.changedTouches[0].screenY; isSwiping = true;
        } else { isSwiping = false; }
    }, { passive: true });
    cardStackContainer?.addEventListener('touchmove', (e) => { if (!isSwiping) return; }, { passive: true });
    cardStackContainer?.addEventListener('touchend', (e) => {
        if (!isSwiping) return;
        touchEndX = e.changedTouches[0].screenX; touchEndY = e.changedTouches[0].screenY;
        const deltaX = touchEndX - touchStartX; const deltaY = touchEndY - touchStartY;
        // Swipe nach links/rechts ist dominant und über Schwelle?
        if (Math.abs(deltaX) > swipeThreshold && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
             // e.preventDefault(); // Nur wenn nötig, um Scrollen zu verhindern
            showCardByIndex(currentCardIndex + (deltaX < 0 ? 1 : -1)); // Nächste/Vorherige
        }
        isSwiping = false;
    });


    // --- Initialisierung ---
    initializeDots(); // Punkte für Navigation erstellen
    // Sprache beim Laden setzen (bevor Texte gesetzt werden)
    const preferredLanguage = localStorage.getItem('preferredLanguage');
    setLanguage(preferredLanguage && translations[preferredLanguage] ? preferredLanguage : 'de');

    // Event Listener für Sprachbuttons
    langDeButton?.addEventListener('click', () => setLanguage('de'));
    langEnButton?.addEventListener('click', () => setLanguage('en'));

    // Erste Daten laden (zeigt Loader, blendet Stack ein, wenn fertig)
    fetchData();

    // Refresh-Timer starten
    if (refreshInterval) clearInterval(refreshInterval);
    refreshInterval = setInterval(fetchData, 30000);

});

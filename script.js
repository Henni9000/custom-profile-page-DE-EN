document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = 'https://api.lanyard.rest/v1/users/739397631998165023';
    const loader = document.getElementById('loader');
    const profileCard = document.getElementById('profile-card');
    const errorMessageElement = document.getElementById('error-message');
    const bodyElement = document.body;

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
            activityLoading: "Lädt Aktivität...", // Wird nur noch initial verwendet
            activityDoingNothing: "Macht gerade nichts...",
            activityOffline: "Offline",
            socialYoutube: "YouTube",
            socialDiscord: "Discord",
            socialGithub: "GitHub",
            socialLink1: "9000-Radio",
            socialLink2: "Gaming Projects",
            errorPrefix: "Fehler:",
            errorRetry: "Versuche es erneut...",
            timestampPrefix: "seit"
        },
        'en': {
            pageTitle: "Henni9000 - Profile",
            loadingText: "Loading Henni9000's profile...",
            bioPrefix: "I am",
            locationText: "Germany",
            copyTooltip: "Copy Username",
            copySuccess: "Copied!",
            copyError: "Copy failed!",
            activityLoading: "Loading activity...", // Used only initially
            activityDoingNothing: "Doing nothing...",
            activityOffline: "Offline",
            socialYoutube: "YouTube",
            socialDiscord: "Discord",
            socialGithub: "GitHub",
            socialLink1: "9000-Radio",
            socialLink2: "Gaming Projects",
            errorPrefix: "Error:",
            errorRetry: "Retrying...",
            timestampPrefix: "for"
        }
    };
    let currentLanguage = 'de';
    window.currentUserData = null; // Globale Variable für letzte gültige Daten

    // === Hintergrund-Logik ===
    const backgroundImageUrl = 'background.jpg';
    const imageTester = new Image();
    imageTester.onload = () => { bodyElement.classList.add('image-background'); bodyElement.classList.remove('gradient-background'); };
    imageTester.onerror = () => { bodyElement.classList.add('gradient-background'); bodyElement.classList.remove('image-background'); };
    imageTester.src = backgroundImageUrl;

    // --- Elemente ---
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
    const audioElement = document.getElementById('audio-player');
    const playPauseButton = document.getElementById('play-pause-btn');
    const progressBar = document.getElementById('progress-bar');
    const progressElement = document.getElementById('progress');
    const currentTimeElement = document.getElementById('time-current');
    const totalTimeElement = document.getElementById('time-total');
    const volumeControlContainer = document.getElementById('volume-control-container');
    const volumeIconDisplay = document.getElementById('volume-icon-display');
    const volumeSlider = document.getElementById('volume-slider');
    const langDeButton = document.getElementById('lang-de');
    const langEnButton = document.getElementById('lang-en');
    let lastVolume = audioElement.volume;
    let refreshInterval;

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

        // Übersetze dynamische Texte neu, BASIEREND AUF GESPEICHERTEN DATEN
        if (window.currentUserData) {
            updateDynamicTexts(window.currentUserData);
        } else {
            // Wenn noch keine Daten da sind, nur den Loader-Text aktualisieren
             document.querySelector('#loader p').textContent = translations[currentLanguage].loadingText;
             // Und den initialen Aktivitätsplatzhalter (falls noch sichtbar)
             if (!profileCard.classList.contains('visible')) { // Nur wenn Karte noch nicht sichtbar ist
                 activityDetailsElement.textContent = translations[currentLanguage].activityLoading;
             }
        }
         // Tooltip immer neu setzen
         copyUsernameButton.title = translations[currentLanguage].copyTooltip;
    }

    // === Hilfsfunktion zum Aktualisieren NUR sprachabhängiger dynamischer Texte ===
    // Wird aufgerufen, wenn Sprache wechselt UND Daten vorhanden sind
    function updateDynamicTexts(userData) {
        const user = userData.discord_user;
        const status = userData.discord_status;
        const activities = userData.activities;

        // Bio
        const displayName = user.global_name || user.username;
        bioElement.textContent = `${translations[currentLanguage].bioPrefix} ${displayName}`;

        // Aktivitätstext (nur falls keine spezifische Aktivität) & Zeitstempel-Präfix
        let primaryActivity = activities.find(act => act.type !== 4) || activities.find(act => act.type === 4) || null;
         if (!primaryActivity) {
            activityDetailsElement.textContent = (status === 'offline') ? translations[currentLanguage].activityOffline : translations[currentLanguage].activityDoingNothing;
            // Zeitstempel wird hier nicht neu gesetzt, da keiner vorhanden ist
         } else if (primaryActivity.timestamps?.start) {
             // Nur das Präfix des Zeitstempels aktualisieren
             activityTimeElement.textContent = `${translations[currentLanguage].timestampPrefix} ${formatDuration(primaryActivity.timestamps.start)}`; // formatDuration nutzt schon currentLanguage
         }
        // Der Rest (wie state, buttons) wird nicht direkt übersetzt oder bleibt gleich
    }

    // --- Initial Fetch Function ---
    const fetchData = () => {
        console.log("Fetching new data...");
        errorMessageElement.textContent = ''; // Fehler löschen, aber Lade-Text nicht neu setzen!

        fetch(apiUrl)
            .then(response => response.ok ? response.json() : Promise.reject(new Error(`HTTP error! Status: ${response.status}`)))
            .then(data => {
                if (data.success && data.data) {
                    window.currentUserData = data.data; // Speichere gültige Daten
                    updateProfile(data.data); // Rendere mit den neuen Daten
                    if (!profileCard.classList.contains('visible')) showCard(); // Zeige Karte beim ersten Mal
                } else {
                    // API meldet keinen Erfolg oder keine Daten
                    // Behalte window.currentUserData (letzter guter Stand), zeige Fehler
                    throw new Error('API did not return success or valid data.');
                }
            })
            .catch(error => {
                console.error('Error fetching Discord data:', error);
                 // window.currentUserData nicht löschen, alten Stand behalten
                displayError(`${error.message}.`);
                 // Karte anzeigen, falls noch nicht geschehen (mit altem/Fehlerstatus)
                if (!profileCard.classList.contains('visible')) showCard();
                // Setze Aktivität auf Offline als Fallback im Fehlerfall,
                // wenn noch nie gültige Daten empfangen wurden
                if (!window.currentUserData) {
                   activityDetailsElement.textContent = translations[currentLanguage].activityOffline;
                   activityStateElement.textContent = '';
                   activityTimeElement.style.display = 'none';
                }
            });
    };

    // --- Function to Show Card with Animation ---
    const showCard = () => {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
            profileCard.style.visibility = 'visible';
            profileCard.classList.add('visible');
        }, 500);
    };

    // --- Function to Update DOM Elements (Discord Part) ---
    // Diese Funktion rendert ALLES basierend auf den übergebenen userData
    function updateProfile(userData) {
        const user = userData.discord_user;
        const activities = userData.activities;
        const status = userData.discord_status;

        // Favicon setzen
        if (user && user.id && user.avatar) { /* ... (wie zuvor) ... */ }

        // PFP, Username etc.
        const pfpUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith('a_') ? 'gif' : 'png'}?size=256`;
        profilePicture.src = pfpUrl;
        statusPfp.src = pfpUrl;
        const displayName = user.global_name || user.username;
        usernameElement.textContent = displayName;

        // Avatar Decoration
        if (avatarDecoration && user.avatar_decoration_data?.asset) { /* ... */ }
        else if (avatarDecoration) { avatarDecoration.style.display = 'none'; }

        // Bio (sprachabhängig)
        bioElement.textContent = `${translations[currentLanguage].bioPrefix} ${displayName}`;

        // Discord Username & Copy Button
        const fullUsername = user.discriminator === "0" ? user.username : `${user.username}#${user.discriminator}`;
        discordUserElement.textContent = fullUsername;
        copyUsernameButton.dataset.username = fullUsername;

        // Status Indicator
        statusIndicator.className = `status-dot ${status}`;
        statusIndicator.classList.remove('pulse-online', 'pulse-dnd');
        if (status === 'online') statusIndicator.classList.add('pulse-online');
        else if (status === 'dnd') statusIndicator.classList.add('pulse-dnd');

        // Activity
        let primaryActivity = activities.find(act => act.type !== 4) || activities.find(act => act.type === 4) || null;
        activityButtonsContainer.innerHTML = '';
        activityStateElement.textContent = ''; // State immer zurücksetzen
        activityTimeElement.style.display = 'none'; // Zeitstempel initial verstecken

        if (primaryActivity) {
            let detailsText = '';
            let stateText = '';
             if (primaryActivity.type === 4 && primaryActivity.state) { detailsText = primaryActivity.state; if (primaryActivity.emoji?.name) detailsText = `${primaryActivity.emoji.name} ${detailsText}`; }
             else { detailsText = primaryActivity.name || ''; if (primaryActivity.details) stateText = primaryActivity.details; if (primaryActivity.state) { if (stateText && primaryActivity.state !== stateText) stateText += ` | ${primaryActivity.state}`; else if (!stateText) stateText = primaryActivity.state; } }

            activityDetailsElement.textContent = detailsText || '...'; // Fallback
            activityStateElement.textContent = stateText;
            activityStateElement.style.display = stateText ? 'block' : 'none';

            // Timestamp (sprachabhängig)
            if (primaryActivity.timestamps?.start) {
                activityTimeElement.textContent = `${translations[currentLanguage].timestampPrefix} ${formatDuration(primaryActivity.timestamps.start)}`;
                activityTimeElement.style.display = 'block';
            }

            // Buttons
             if (primaryActivity.buttons?.length > 0) { /* ... (Button-Logik wie zuvor) ... */ }

        } else {
            // Keine Aktivität (sprachabhängig)
            activityDetailsElement.textContent = (status === 'offline') ? translations[currentLanguage].activityOffline : translations[currentLanguage].activityDoingNothing;
            activityStateElement.style.display = 'none';
            // Zeitstempel bleibt versteckt
        }
    }

    // --- Helper Function to Format Duration ---
    function formatDuration(startTime) {
        const now = Date.now();
        const diffSeconds = Math.floor((now - startTime) / 1000);
        if (diffSeconds < 60) return `${diffSeconds} ${currentLanguage === 'de' ? 'Sek.' : 'sec'}`;
        const diffMinutes = Math.floor(diffSeconds / 60);
        if (diffMinutes < 60) return `${diffMinutes} ${currentLanguage === 'de' ? 'Min.' : 'min'}`;
        const diffHours = Math.floor(diffMinutes / 60);
        const remainingMinutes = diffMinutes % 60;
        if (remainingMinutes === 0) return `${diffHours} ${currentLanguage === 'de' ? 'Std.' : 'hr'}`;
        return `${diffHours} ${currentLanguage === 'de' ? 'Std.' : 'hr'} ${remainingMinutes} ${currentLanguage === 'de' ? 'Min.' : 'min'}`;
    }

    // --- Helper Function to Format Time (MM:SS) ---
    function formatTime(seconds) { /* ... (unverändert) ... */ }

    // --- Function to Display Errors ---
    function displayError(message) {
        errorMessageElement.textContent = `${translations[currentLanguage].errorPrefix} ${message} ${translations[currentLanguage].errorRetry}`;
    }

    // --- Event Listener for Copy Username ---
    copyUsernameButton.addEventListener('click', () => { /* ... (aktualisiert für Sprache) ... */ });

    // --- === Music Player Logic === ---
    function togglePlayPause() { /* ... */ }
    function updatePlayPauseIcon() { /* ... */ }
    function updateProgress() { /* ... */ }
    function setProgress(e) { /* ... */ }
    playPauseButton.addEventListener('click', togglePlayPause);
    audioElement.addEventListener('play', updatePlayPauseIcon);
    audioElement.addEventListener('pause', updatePlayPauseIcon);
    audioElement.addEventListener('ended', updatePlayPauseIcon);
    audioElement.addEventListener('loadedmetadata', () => { /* ... */ });
    audioElement.addEventListener('timeupdate', updateProgress);
    progressBar.addEventListener('click', setProgress);

    // --- === Volume Control Logic === ---
    function updateVolumeIcon(volume) { /* ... */ }
    volumeSlider.addEventListener('input', (e) => { /* ... */ });
    volumeIconDisplay.addEventListener('click', () => { /* ... */ });
    audioElement.addEventListener('volumechange', () => { /* ... */ });


    // --- Initialisierung ---
    // Sprache beim Laden setzen (bevor der erste Fetch startet)
    const preferredLanguage = localStorage.getItem('preferredLanguage');
    setLanguage((preferredLanguage && translations[preferredLanguage]) ? preferredLanguage : 'de');

    // Setze initialen Lade-Text EINMALIG
     document.querySelector('#loader p').textContent = translations[currentLanguage].loadingText;
     activityDetailsElement.textContent = translations[currentLanguage].activityLoading; // Auch für die Karte initial setzen


    // Event Listener für Sprachbuttons
    langDeButton.addEventListener('click', () => setLanguage('de'));
    langEnButton.addEventListener('click', () => setLanguage('en'));

    // Erste Daten laden und Refresh-Timer starten
    fetchData(); // Jetzt wird der Lade-Text nicht mehr in fetchData gesetzt
    if (refreshInterval) clearInterval(refreshInterval);
    // Behalte 30 Sekunden bei, 10 Sekunden ist sehr oft für Lanyard
    refreshInterval = setInterval(fetchData, 30000);
});

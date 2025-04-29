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
            timestampPrefix: "for"
        }
    };
    let currentLanguage = 'de'; // Standard Sprache
    window.currentUserData = null; // Globale Variable zum Speichern der letzten gültigen Daten

    // === Hintergrund-Logik ===
    const backgroundImageUrl = 'background.jpg';
    const imageTester = new Image();
    imageTester.onload = function() { bodyElement.classList.add('image-background'); bodyElement.classList.remove('gradient-background'); };
    imageTester.onerror = function() { bodyElement.classList.add('gradient-background'); bodyElement.classList.remove('image-background'); };
    imageTester.src = backgroundImageUrl;

    // --- Elemente --- (Alle Elemente wie vorher)
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
    let lastVolume = audioElement.volume;
    const langDeButton = document.getElementById('lang-de');
    const langEnButton = document.getElementById('lang-en');

    let refreshInterval;

    // === Sprachumschaltfunktion ===
    function setLanguage(lang) {
        if (!translations[lang] || lang === currentLanguage) {
            // Sprache nicht gefunden oder bereits aktiv
            return;
        }
        currentLanguage = lang;
        localStorage.setItem('preferredLanguage', lang);
        document.documentElement.lang = lang;

        // Statische Texte und Titel aktualisieren
        document.querySelectorAll('[data-translate]').forEach(el => {
            const key = el.getAttribute('data-translate');
            if (translations[lang][key]) el.textContent = translations[lang][key];
        });
        document.querySelectorAll('[data-translate-title]').forEach(el => {
            const key = el.getAttribute('data-translate-title');
            if (translations[lang][key]) el.title = translations[lang][key];
        });
        document.title = translations[lang].pageTitle;

        // Aktiven Button markieren
        langDeButton.classList.toggle('active', lang === 'de');
        langEnButton.classList.toggle('active', lang === 'en');

        // Dynamische Texte basierend auf *gespeicherten* Daten aktualisieren
        if (window.currentUserData) {
            updateDynamicTexts(window.currentUserData); // Nur sprachabhängige Teile ändern
        } else {
            // Fallback, falls noch keine Daten geladen wurden
             activityDetailsElement.textContent = translations[currentLanguage].activityLoading;
        }

        // Tooltip neu setzen
        copyUsernameButton.title = translations[currentLanguage].copyTooltip;
    }

    // === Hilfsfunktion zum Aktualisieren sprachabhängiger dynamischer Texte ===
    // (Wird aufgerufen, wenn Sprache wechselt *oder* neue Daten kommen und sprachabhängige Teile rendern)
    function updateDynamicTexts(userData) {
        const user = userData.discord_user;
        const status = userData.discord_status;
        const activities = userData.activities;

        // Bio
        const displayName = user.global_name || user.username;
        bioElement.textContent = `${translations[currentLanguage].bioPrefix} ${displayName}`;

        // Aktivitätstext (nur die Standardfälle oder das Timestamp-Präfix)
        let primaryActivity = activities.find(act => act.type !== 4) || activities.find(act => act.type === 4) || null;

        // WICHTIG: Überschreibe activityDetailsElement *nur*, wenn *keine* spezifische Aktivität vorliegt
        if (!primaryActivity) {
             activityDetailsElement.textContent = (status === 'offline') ? translations[currentLanguage].activityOffline : translations[currentLanguage].activityDoingNothing;
             activityTimeElement.style.display = 'none'; // Zeitstempel ausblenden
        } else if (primaryActivity.timestamps?.start) {
            // Nur das Präfix des Zeitstempels aktualisieren, der Rest kommt aus formatDuration
            activityTimeElement.textContent = `${translations[currentLanguage].timestampPrefix} ${formatDuration(primaryActivity.timestamps.start)}`;
            activityTimeElement.style.display = 'block';
        } else {
             activityTimeElement.style.display = 'none'; // Zeitstempel ausblenden, wenn Aktivität keine Zeit hat
        }
        // Fehlermeldungen werden separat behandelt
    }


    // --- Initial Fetch Function ---
    const fetchData = () => {
        console.log("Fetching new data...");
        // !! WICHTIG: Setze "Lädt..." hier NICHT mehr !!
        // errorMessageElement.textContent = ''; // Fehler nur löschen, wenn erfolgreich

        fetch(apiUrl)
            .then(response => response.ok ? response.json() : Promise.reject(new Error(`HTTP error! Status: ${response.status}`)))
            .then(data => {
                if (data.success && data.data) {
                    errorMessageElement.textContent = ''; // Fehler löschen bei Erfolg
                    window.currentUserData = data.data; // Speichere neue Daten
                    updateProfile(data.data); // Rendere die neuen Daten
                    if (!profileCard.classList.contains('visible')) {
                        showCard(); // Zeige Karte beim ersten erfolgreichen Laden
                    }
                } else {
                    // API meldet Fehler oder Daten fehlen
                    window.currentUserData = null; // Ungültige Daten
                    throw new Error('API did not return success or data is missing.');
                }
            })
            .catch(error => {
                console.error('Error fetching Discord data:', error);
                // Setze keine globale Daten, behalte die alten (falls vorhanden)
                // Zeige Fehler an
                displayError(`${error.message}.`);
                // Optional: Fallback-Anzeige, falls noch gar nichts angezeigt wird
                 if (!profileCard.classList.contains('visible')) {
                      showCard(); // Zeige Karte trotzdem an, aber mit Fehlermeldung
                      activityDetailsElement.textContent = translations[currentLanguage].activityOffline; // Fallback
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

    // --- Function to Update DOM Elements (Komplette Aktualisierung bei neuen Daten) ---
    function updateProfile(userData) {
        const user = userData.discord_user;
        const activities = userData.activities;
        const status = userData.discord_status;

        // === Favicon setzen ===
        if (user && user.id && user.avatar) { /* ... (unverändert) ... */ }

        // === PFP, Username, Decoration ===
        const pfpUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith('a_') ? 'gif' : 'png'}?size=256`;
        profilePicture.src = pfpUrl; statusPfp.src = pfpUrl;
        const displayName = user.global_name || user.username;
        usernameElement.textContent = displayName;
        if (avatarDecoration) avatarDecoration.style.display = user.avatar_decoration_data?.asset ? 'block' : 'none';
        if (avatarDecoration && user.avatar_decoration_data?.asset) avatarDecoration.src = `https://cdn.discordapp.com/avatar-decorations/${user.id}/${user.avatar_decoration_data.asset}.png?size=160`;

        // === Discord User & Copy Button ===
        const fullUsername = user.discriminator === "0" ? user.username : `${user.username}#${user.discriminator}`;
        discordUserElement.textContent = fullUsername; copyUsernameButton.dataset.username = fullUsername;

        // === Status Indikator ===
        statusIndicator.className = `status-dot ${status}`;
        statusIndicator.classList.remove('pulse-online', 'pulse-dnd');
        if (status === 'online') statusIndicator.classList.add('pulse-online'); else if (status === 'dnd') statusIndicator.classList.add('pulse-dnd');

        // === Aktivität (Hauptteil) ===
        let primaryActivity = activities.find(act => act.type !== 4) || activities.find(act => act.type === 4) || null;
        activityButtonsContainer.innerHTML = '';
        activityStateElement.textContent = ''; // Reset state display

        if (primaryActivity) {
            // Spezifische Aktivitätsdetails setzen (nicht sprachabhängig)
            let detailsText = ''; let stateText = '';
            if (primaryActivity.type === 4 && primaryActivity.state) { detailsText = primaryActivity.state; if (primaryActivity.emoji?.name) detailsText = `${primaryActivity.emoji.name} ${detailsText}`; }
            else { detailsText = primaryActivity.name || ''; if (primaryActivity.details) stateText = primaryActivity.details; if (primaryActivity.state) { if (stateText && primaryActivity.state !== stateText) stateText += ` | ${primaryActivity.state}`; else if (!stateText) stateText = primaryActivity.state; } }
            activityDetailsElement.textContent = detailsText || '...'; // Hauptzeile setzen
            activityStateElement.textContent = stateText; // Unterzeile setzen
            activityStateElement.style.display = stateText ? 'block' : 'none'; // Unterzeile anzeigen/verstecken

            // Buttons rendern
            if (primaryActivity.buttons && primaryActivity.buttons.length > 0) {
                 primaryActivity.buttons.forEach(buttonLabel => {
                    const buttonElement = document.createElement('span');
                    buttonElement.classList.add('activity-button');
                    buttonElement.textContent = buttonLabel;
                    activityButtonsContainer.appendChild(buttonElement);
                });
            }
        }
        // Wenn keine Aktivität, wird der Text unten in updateDynamicTexts gesetzt

        // === Dynamische Texte (Bio, Zeitstempel-Präfix, Standard-Aktivitätstext) aktualisieren ===
        updateDynamicTexts(userData); // Ruft die Funktion auf, um sprachabhängige Teile zu setzen
    }

    // --- Helper Function to Format Duration ---
    function formatDuration(startTime) {
        // ... (leicht angepasst für Sprachausgabe)
        const now = Date.now();
        const diffSeconds = Math.floor((now - startTime) / 1000);
        if (diffSeconds < 1) return `1 ${currentLanguage === 'de' ? 'Sek.' : 'sec'}`; // Mindestens 1 Sekunde anzeigen
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
    copyUsernameButton.addEventListener('click', () => { /* ... (unverändert, nutzt jetzt translations) ... */ });

    // --- === Music Player Logic === ---
    function togglePlayPause() { /* ... (unverändert) ... */ }
    function updatePlayPauseIcon() { /* ... (unverändert) ... */ }
    function updateProgress() { /* ... (unverändert) ... */ }
    function setProgress(e) { /* ... (unverändert) ... */ }
    playPauseButton.addEventListener('click', togglePlayPause);
    audioElement.addEventListener('play', updatePlayPauseIcon);
    audioElement.addEventListener('pause', updatePlayPauseIcon);
    audioElement.addEventListener('ended', updatePlayPauseIcon);
    audioElement.addEventListener('loadedmetadata', () => { totalTimeElement.textContent = formatTime(audioElement.duration); updateProgress(); const initialVolume = audioElement.volume; volumeSlider.value = initialVolume; lastVolume = initialVolume; updateVolumeIcon(initialVolume); });
    audioElement.addEventListener('timeupdate', updateProgress);
    progressBar.addEventListener('click', setProgress);

    // --- === Volume Control Logic === ---
    function updateVolumeIcon(volume) { /* ... (unverändert) ... */ }
    volumeSlider.addEventListener('input', (e) => { /* ... (unverändert) ... */ });
    volumeIconDisplay.addEventListener('click', () => { /* ... (unverändert) ... */ });
    audioElement.addEventListener('volumechange', () => { /* ... (unverändert) ... */ });


    // --- Initialisierung ---
    // Sprache beim Laden setzen
    const preferredLanguage = localStorage.getItem('preferredLanguage');
    setLanguage((preferredLanguage && translations[preferredLanguage]) ? preferredLanguage : 'de'); // Setze Sprache oder Fallback

    // Setze initialen Lade-Text *bevor* der erste Fetch startet
    activityDetailsElement.textContent = translations[currentLanguage].activityLoading;
    document.querySelector('#loader p').textContent = translations[currentLanguage].loadingText;

    // Event Listener für Sprachbuttons
    langDeButton.addEventListener('click', () => setLanguage('de'));
    langEnButton.addEventListener('click', () => setLanguage('en'));

    // Erste Daten laden und Refresh-Timer starten (jetzt 10 Sekunden)
    fetchData();
    if (refreshInterval) clearInterval(refreshInterval);
    refreshInterval = setInterval(fetchData, 10000); // Refresh Discord data every 10 seconds
});

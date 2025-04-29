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
            activityDoingNothing: "Macht gerade nichts...", // Ersetzt Leerlauf
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
            activityDoingNothing: "Doing nothing...", // English version
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

    // --- Elemente zum Update (Discord-bezogen) ---
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

    // --- Music Player Elemente ---
    const audioElement = document.getElementById('audio-player');
    const playPauseButton = document.getElementById('play-pause-btn');
    const progressBar = document.getElementById('progress-bar');
    const progressElement = document.getElementById('progress');
    const currentTimeElement = document.getElementById('time-current');
    const totalTimeElement = document.getElementById('time-total');

    // --- Lautstärke Elemente ---
    const volumeControlContainer = document.getElementById('volume-control-container');
    const volumeIconDisplay = document.getElementById('volume-icon-display');
    const volumeSlider = document.getElementById('volume-slider');
    let lastVolume = audioElement.volume;

    // --- Sprachumschalter Elemente ---
    const langDeButton = document.getElementById('lang-de');
    const langEnButton = document.getElementById('lang-en');

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

        if (window.currentUserData) {
            updateDynamicTexts(window.currentUserData);
        } else {
            activityDetailsElement.textContent = translations[currentLanguage].activityLoading;
            document.querySelector('#loader p')?.setAttribute('data-translate', 'loadingText');
            document.querySelector('#loader p').textContent = translations[currentLanguage].loadingText;
        }
        copyUsernameButton.title = translations[currentLanguage].copyTooltip;
    }

    // === Hilfsfunktion zum Aktualisieren sprachabhängiger dynamischer Texte ===
    function updateDynamicTexts(userData) {
        const user = userData.discord_user;
        const status = userData.discord_status;
        const activities = userData.activities;

        const displayName = user.global_name || user.username;
        bioElement.textContent = `${translations[currentLanguage].bioPrefix} ${displayName}`;

        let primaryActivity = activities.find(act => act.type !== 4) || activities.find(act => act.type === 4) || null;
         if (!primaryActivity) {
            // Wichtig: Setze den Text hier erneut basierend auf dem Status
            activityDetailsElement.textContent = (status === 'offline') ? translations[currentLanguage].activityOffline : translations[currentLanguage].activityDoingNothing;
            activityTimeElement.style.display = 'none';
         } else if (primaryActivity.timestamps?.start) {
             activityTimeElement.textContent = `${translations[currentLanguage].timestampPrefix} ${formatDuration(primaryActivity.timestamps.start)}`;
             activityTimeElement.style.display = 'block';
         } else {
             activityTimeElement.style.display = 'none';
         }
    }

    // --- Initial Fetch Function ---
    const fetchData = () => {
        console.log("Fetching new data...");
        errorMessageElement.textContent = '';
        // Setze Lade-Text nur, wenn keine Daten vorhanden sind oder initial geladen wird
        if (!window.currentUserData) {
            activityDetailsElement.textContent = translations[currentLanguage].activityLoading;
            activityStateElement.textContent = '';
            activityTimeElement.style.display = 'none';
        }

        fetch(apiUrl)
            .then(response => response.ok ? response.json() : Promise.reject(new Error(`HTTP error! Status: ${response.status}`)))
            .then(data => {
                if (data.success && data.data) {
                    window.currentUserData = data.data;
                    updateProfile(data.data);
                    if (!profileCard.classList.contains('visible')) showCard();
                } else {
                    window.currentUserData = null;
                    throw new Error('API did not return success or data is missing.');
                }
            })
            .catch(error => {
                console.error('Error fetching Discord data:', error);
                window.currentUserData = null;
                displayError(`${error.message}.`);
                if (!profileCard.classList.contains('visible')) showCard();
                // Setze Text auf Offline bei Fehler, überschreibt "Lädt..."
                activityDetailsElement.textContent = translations[currentLanguage].activityOffline;
                activityStateElement.textContent = '';
                activityTimeElement.style.display = 'none';
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
    function updateProfile(userData) {
        const user = userData.discord_user;
        const activities = userData.activities;
        const status = userData.discord_status;

        // === Favicon setzen ===
        if (user && user.id && user.avatar) {
            const faviconUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`;
            let link = document.querySelector("link[rel~='icon']");
            if (!link) { link = document.createElement('link'); link.rel = 'icon'; link.type = 'image/png'; document.head.appendChild(link); }
            link.href = faviconUrl;
            console.log('Favicon auf', faviconUrl, 'gesetzt.');
        }

        // === PFP, Username, Bio, Decoration, Discord Username, Status Dot ===
        const pfpUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith('a_') ? 'gif' : 'png'}?size=256`;
        profilePicture.src = pfpUrl;
        statusPfp.src = pfpUrl;
        const displayName = user.global_name || user.username;
        usernameElement.textContent = displayName;
        if (avatarDecoration && user.avatar_decoration_data?.asset) { const decorationUrl = `https://cdn.discordapp.com/avatar-decorations/${user.id}/${user.avatar_decoration_data.asset}.png?size=160`; avatarDecoration.src = decorationUrl; avatarDecoration.style.display = 'block';} else if (avatarDecoration) { avatarDecoration.style.display = 'none'; }
        bioElement.textContent = `${translations[currentLanguage].bioPrefix} ${displayName}`;
        const fullUsername = user.discriminator === "0" ? user.username : `${user.username}#${user.discriminator}`;
        discordUserElement.textContent = fullUsername;
        copyUsernameButton.dataset.username = fullUsername;
        statusIndicator.className = `status-dot ${status}`;
        statusIndicator.classList.remove('pulse-online', 'pulse-dnd');
        if (status === 'online') statusIndicator.classList.add('pulse-online');
        else if (status === 'dnd') statusIndicator.classList.add('pulse-dnd');

        // === Activity Processing (REVISED LOGIC) ===
        activityButtonsContainer.innerHTML = '';
        activityStateElement.textContent = '';
        activityStateElement.style.display = 'none';
        activityTimeElement.textContent = '';
        activityTimeElement.style.display = 'none';

        // 1. Finde primäre Aktivität
        let primaryActivity = activities.find(act => act.type !== 4) || activities.find(act => act.type === 4) || null;

        // 2. Setze Texte basierend auf Aktivität oder Status
        if (primaryActivity) {
            let detailsText = '';
            let stateText = '';

            // Extrahiere Details/State
            if (primaryActivity.type === 4 && primaryActivity.state) {
                detailsText = primaryActivity.state;
                if (primaryActivity.emoji?.name) detailsText = `${primaryActivity.emoji.name} ${detailsText}`;
            } else {
                detailsText = primaryActivity.name || '';
                if (primaryActivity.details) stateText = primaryActivity.details;
                if (primaryActivity.state) {
                    if (stateText && primaryActivity.state !== stateText) stateText += ` | ${primaryActivity.state}`;
                    else if (!stateText) stateText = primaryActivity.state;
                }
            }

            // Setze Haupttext (Details) oder Fallback
            activityDetailsElement.textContent = detailsText || translations[currentLanguage].activityDoingNothing; // Zeige "Doing nothing" wenn Details leer sind

            // Zeige State, falls vorhanden
            if (stateText) {
                activityStateElement.textContent = stateText;
                activityStateElement.style.display = 'block';
            }

            // Zeige Timestamp, falls vorhanden
            if (primaryActivity.timestamps?.start) {
                activityTimeElement.textContent = `${translations[currentLanguage].timestampPrefix} ${formatDuration(primaryActivity.timestamps.start)}`;
                activityTimeElement.style.display = 'block';
            }

            // Füge Buttons hinzu, falls vorhanden
             if (primaryActivity.buttons && primaryActivity.buttons.length > 0) {
                primaryActivity.buttons.forEach(buttonLabel => {
                    const buttonElement = document.createElement('span');
                    buttonElement.classList.add('activity-button');
                    buttonElement.textContent = buttonLabel;
                    activityButtonsContainer.appendChild(buttonElement);
                });
            }

        } else {
            // Keine primäre Aktivität -> Setze Text basierend auf Status
            activityDetailsElement.textContent = (status === 'offline') ? translations[currentLanguage].activityOffline : translations[currentLanguage].activityDoingNothing;
            // State und Time bleiben versteckt
        }
        // === ENDE Activity Processing ===
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
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // --- Function to Display Errors ---
    function displayError(message) {
        errorMessageElement.textContent = `${translations[currentLanguage].errorPrefix} ${message} ${translations[currentLanguage].errorRetry}`;
    }

    // --- Event Listener for Copy Username ---
    copyUsernameButton.addEventListener('click', () => {
        const usernameToCopy = copyUsernameButton.dataset.username;
        if (!usernameToCopy) return;
        navigator.clipboard.writeText(usernameToCopy).then(() => {
            const originalTitle = translations[currentLanguage].copyTooltip;
            copyUsernameButton.title = translations[currentLanguage].copySuccess;
            copyUsernameButton.classList.add('copied');
            setTimeout(() => { copyUsernameButton.classList.remove('copied'); copyUsernameButton.title = originalTitle; }, 1500);
        }).catch(err => {
            console.error('Kopieren fehlgeschlagen:', err);
            const originalTitle = translations[currentLanguage].copyTooltip;
            copyUsernameButton.title = translations[currentLanguage].copyError;
            setTimeout(() => { copyUsernameButton.title = originalTitle; }, 1500);
        });
    });

    // --- === Music Player Logic === ---
    function togglePlayPause() { if (audioElement.paused || audioElement.ended) audioElement.play().catch(error => console.error("Fehler beim Abspielen:", error)); else audioElement.pause(); }
    function updatePlayPauseIcon() { if (audioElement.paused || audioElement.ended) { playPauseButton.classList.remove('fa-pause'); playPauseButton.classList.add('fa-play'); } else { playPauseButton.classList.remove('fa-play'); playPauseButton.classList.add('fa-pause'); } }
    function updateProgress() { if (audioElement.duration) { const progressPercent = (audioElement.currentTime / audioElement.duration) * 100; progressElement.style.width = `${progressPercent}%`; currentTimeElement.textContent = formatTime(audioElement.currentTime); } else { progressElement.style.width = '0%'; currentTimeElement.textContent = formatTime(0); } }
    function setProgress(e) { const width = progressBar.clientWidth; const clickX = e.offsetX; const duration = audioElement.duration; if (duration) audioElement.currentTime = (clickX / width) * duration; }
    playPauseButton.addEventListener('click', togglePlayPause);
    audioElement.addEventListener('play', updatePlayPauseIcon);
    audioElement.addEventListener('pause', updatePlayPauseIcon);
    audioElement.addEventListener('ended', updatePlayPauseIcon);
    audioElement.addEventListener('loadedmetadata', () => { totalTimeElement.textContent = formatTime(audioElement.duration); updateProgress(); const initialVolume = audioElement.volume; volumeSlider.value = initialVolume; lastVolume = initialVolume; updateVolumeIcon(initialVolume); });
    audioElement.addEventListener('timeupdate', updateProgress);
    progressBar.addEventListener('click', setProgress);

    // --- === Volume Control Logic === ---
    function updateVolumeIcon(volume) { volumeIconDisplay.classList.remove('fa-volume-high', 'fa-volume-low', 'fa-volume-off'); if (audioElement.muted || volume === 0) volumeIconDisplay.classList.add('fa-volume-off'); else if (volume < 0.5) volumeIconDisplay.classList.add('fa-volume-low'); else volumeIconDisplay.classList.add('fa-volume-high'); }
    volumeSlider.addEventListener('input', (e) => { const newVolume = parseFloat(e.target.value); audioElement.volume = newVolume; if (audioElement.muted && newVolume > 0) audioElement.muted = false; lastVolume = newVolume; updateVolumeIcon(newVolume); });
    volumeIconDisplay.addEventListener('click', () => { if (audioElement.muted) { audioElement.muted = false; audioElement.volume = lastVolume; volumeSlider.value = lastVolume; updateVolumeIcon(lastVolume); } else { lastVolume = audioElement.volume; audioElement.muted = true; volumeSlider.value = 0; updateVolumeIcon(0); } });
    audioElement.addEventListener('volumechange', () => { if (!audioElement.muted) { volumeSlider.value = audioElement.volume; updateVolumeIcon(audioElement.volume); } else { volumeSlider.value = 0; updateVolumeIcon(0); } });

    // --- Initialisierung ---
    const preferredLanguage = localStorage.getItem('preferredLanguage');
    setLanguage((preferredLanguage && translations[preferredLanguage]) ? preferredLanguage : 'de');

    langDeButton.addEventListener('click', () => setLanguage('de'));
    langEnButton.addEventListener('click', () => setLanguage('en'));

    fetchData();
    if (refreshInterval) clearInterval(refreshInterval);
    refreshInterval = setInterval(fetchData, 30000);
});

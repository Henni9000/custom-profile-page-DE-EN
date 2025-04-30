document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = 'https://api.lanyard.rest/v1/users/739397631998165023';
    const loader = document.getElementById('loader');
    // Container sichtbar machen, nicht die alte #profile-card
    const sliderContainer = document.getElementById('card-slider-container'); // *** WICHTIG: Slider Container ***
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
            timestampPrefix: "seit",
            aboutTitle: "Über Mich",
            aboutText1: "Hier könntest du mehr über deine Interessen schreiben, was dich antreibt, oder was du gerade lernst. Füge vielleicht ein paar Absätze hinzu.",
            aboutText2: "Zum Beispiel: Ich interessiere mich sehr für Webentwicklung, insbesondere moderne Frontend-Technologien und interaktive Benutzererlebnisse. Auch Gaming gehört zu meinen Hobbys!",
            projectsTitle: "Projekte",
            project1Title: "Mein Gaming Portal",
            project1Desc: "Eine Übersicht über meine Gaming-bezogenen Projekte und Inhalte.",
            project2Title: "9000-Radio",
            project2Desc: "Ein Webradio-Projekt zum Entdecken neuer Musik.",
            project3Title: "Dieses Profil",
            project3Desc: "Der Code für diese dynamische Profilseite.",
            viewProject: "Projekt ansehen",
            viewRepo: "Repository ansehen"
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
            aboutTitle: "About Me",
            aboutText1: "Here you could write more about your interests, what drives you, or what you are currently learning. Maybe add a few paragraphs.",
            aboutText2: "For example: I am very interested in web development, especially modern frontend technologies and interactive user experiences. Gaming is also one of my hobbies!",
            projectsTitle: "Projects",
            project1Title: "My Gaming Portal",
            project1Desc: "An overview of my gaming-related projects and content.",
            project2Title: "9000-Radio",
            project2Desc: "A web radio project for discovering new music.",
            project3Title: "This Profile",
            project3Desc: "The code for this dynamic profile page.",
            viewProject: "View Project",
            viewRepo: "View Repository"
        }
    };
    let currentLanguage = 'de'; // Standard Sprache

    // === Hintergrund-Logik ===
    const backgroundImageUrl = 'background.jpg';
    const imageTester = new Image();
    imageTester.onload = function() { bodyElement.classList.add('image-background'); bodyElement.classList.remove('gradient-background'); };
    imageTester.onerror = function() { bodyElement.classList.add('gradient-background'); bodyElement.classList.remove('image-background'); };
    imageTester.src = backgroundImageUrl;

    // --- Elemente zum Update (Discord-bezogen - in Seite 1) ---
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

    // --- Slider Elemente & Variablen ---
    const sliderWrapper = document.getElementById('card-slider-wrapper');
    const pages = document.querySelectorAll('.card-page');
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const dotsContainer = document.getElementById('slider-dots');
    const totalPages = pages.length;
    let currentPage = 0;
    let touchStartX = 0;
    let touchEndX = 0;
    let isDragging = false;

    // Globale Variable zum Speichern der letzten Lanyard-Daten
    let lastFetchedUserData = null;

    let refreshInterval;

    // === Sprachumschaltfunktion ===
    function setLanguage(lang) {
        if (!translations[lang]) {
            console.warn(`Sprache "${lang}" nicht gefunden.`);
            return;
        }
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

        if (lastFetchedUserData) {
           updateDynamicTexts(lastFetchedUserData);
        }
        copyUsernameButton.title = translations[currentLanguage].copyTooltip;
    }

    // === Hilfsfunktion zum Aktualisieren sprachabhängiger dynamischer Texte ===
    function updateDynamicTexts(userData) {
        const user = userData.discord_user;
        const status = userData.discord_status;
        const activities = userData.activities;

        // Bio aktualisieren
        const displayName = user.global_name || user.username;
        bioElement.textContent = `${translations[currentLanguage].bioPrefix} ${displayName}`;

        // Aktivitätstext aktualisieren (wenn keine Aktivität)
        let primaryActivity = activities.find(act => act.type !== 4) || activities.find(act => act.type === 4) || null;
         if (!primaryActivity) {
            if (status === 'offline') {
                activityDetailsElement.textContent = translations[currentLanguage].activityOffline;
            } else {
                activityDetailsElement.textContent = translations[currentLanguage].activityDoingNothing;
            }
             activityStateElement.style.display = 'none';
             activityTimeElement.style.display = 'none';
         } else {
             // Timestamp Prefix aktualisieren, falls vorhanden
             if (primaryActivity.timestamps?.start) {
                 activityTimeElement.textContent = `${translations[currentLanguage].timestampPrefix} ${formatDuration(primaryActivity.timestamps.start)}`;
                 activityTimeElement.style.display = 'block';
             } else {
                 activityTimeElement.style.display = 'none';
             }
         }
    }

    // === Slider Initialisierung ===
    function initializeSlider() {
        sliderWrapper.style.width = `${totalPages * 100}%`;
        createDots();
        updateSlider();
    }

    // === Navigationspunkte erstellen ===
    function createDots() {
        dotsContainer.innerHTML = '';
        for (let i = 0; i < totalPages; i++) {
            const dot = document.createElement('button');
            dot.classList.add('slider-dot');
            dot.dataset.index = i;
            dot.setAttribute('aria-label', `Go to page ${i + 1}`); // Use English or make translatable
            dot.addEventListener('click', () => goToPage(i));
            dotsContainer.appendChild(dot);
        }
    }

    // === Slider auf Seite aktualisieren ===
    function updateSlider() {
        sliderWrapper.style.transform = `translateX(-${currentPage * 100 / totalPages}%)`;
        document.querySelectorAll('.slider-dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === currentPage);
        });
        prevButton.disabled = currentPage === 0;
        nextButton.disabled = currentPage === totalPages - 1;
    }

    // === Gehe zu einer bestimmten Seite ===
    function goToPage(pageIndex) {
        currentPage = Math.max(0, Math.min(pageIndex, totalPages - 1));
        updateSlider();
    }

    // === Swipe-Logik ===
    function handleTouchStart(e) {
        touchStartX = e.touches[0].clientX;
        isDragging = true;
        sliderWrapper.style.transition = 'none'; // Remove transition for direct feedback
    }

    function handleTouchMove(e) {
        if (!isDragging) return;
        touchEndX = e.touches[0].clientX;
        const diffX = touchEndX - touchStartX;
        const currentTranslate = -currentPage * sliderContainer.offsetWidth;
        sliderWrapper.style.transform = `translateX(${currentTranslate + diffX}px)`;
    }

    function handleTouchEnd() {
        if (!isDragging) return;
        isDragging = false;
        sliderWrapper.style.transition = 'transform 0.5s ease-in-out'; // Add transition back

        const diffX = touchEndX - touchStartX;
        // Use a threshold (e.g., 1/4 of the slider width) to decide if swipe is significant
        const threshold = sliderContainer.offsetWidth / 4;

        if (diffX > threshold && currentPage > 0) {
            goToPage(currentPage - 1); // Swipe right (previous page)
        } else if (diffX < -threshold && currentPage < totalPages - 1) {
            goToPage(currentPage + 1); // Swipe left (next page)
        } else {
            updateSlider(); // Snap back to the current page if swipe is not enough
        }
        touchStartX = 0;
        touchEndX = 0;
    }

    // --- Initial Fetch Function ---
    const fetchData = () => {
        console.log("Fetching new data...");
        errorMessageElement.textContent = '';
        // Nur den Lade-Text der *ersten* Seite setzen
        activityDetailsElement.textContent = translations[currentLanguage].activityLoading;
        activityStateElement.textContent = '';
        activityTimeElement.textContent = '';
        activityButtonsContainer.innerHTML = '';


        fetch(apiUrl)
            .then(response => response.ok ? response.json() : Promise.reject(new Error(`HTTP error! Status: ${response.status}`)))
            .then(data => {
                if (data.success && data.data) {
                    lastFetchedUserData = data.data;
                    updateProfile(data.data); // Update profile page content
                    if (!sliderContainer.classList.contains('visible')) { // Use sliderContainer
                        showCard(); // Show the slider container
                    }
                } else {
                    lastFetchedUserData = null;
                    throw new Error('API did not return success or data is missing.');
                }
            })
            .catch(error => {
                console.error('Error fetching Discord data:', error);
                lastFetchedUserData = null;
                displayError(error.message);
                if (!sliderContainer.classList.contains('visible')) { // Use sliderContainer
                     showCard(); // Show even on error
                }
                activityDetailsElement.textContent = translations[currentLanguage].errorPrefix;
            });
    };

    // --- Function to Show Card (Slider Container) ---
    const showCard = () => {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
            sliderContainer.style.visibility = 'visible'; // Use sliderContainer
            sliderContainer.classList.add('visible');    // Use sliderContainer
            // Initialize slider *after* the container is visible
            initializeSlider();
            goToPage(0); // Go to the first page
        }, 500);
    };

    // --- Function to Update DOM Elements (Only page 1 content needs Lanyard data) ---
    function updateProfile(userData) {
        const user = userData.discord_user;
        const activities = userData.activities;
        const status = userData.discord_status;

        // --- Set Favicon ---
        if (user && user.id && user.avatar) {
            const faviconUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`;
            let link = document.querySelector("link[rel~='icon']");
            if (!link) { link = document.createElement('link'); link.rel = 'icon'; link.type = 'image/png'; document.head.appendChild(link); }
            link.href = faviconUrl;
        }

        // --- Update elements ONLY on the first page (#page-profile) ---
        profilePicture.src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith('a_') ? 'gif' : 'png'}?size=256`;
        statusPfp.src = profilePicture.src; // Keep small PFP synced
        const displayName = user.global_name || user.username;
        usernameElement.textContent = displayName;

        // Avatar Decoration
        if (avatarDecoration && user.avatar_decoration_data?.asset) {
            avatarDecoration.src = `https://cdn.discordapp.com/avatar-decorations/${user.id}/${user.avatar_decoration_data.asset}.png?size=160`;
            avatarDecoration.style.display = 'block';
        } else if (avatarDecoration) {
            avatarDecoration.style.display = 'none';
        }

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

        // Activity (sprachabhängig für Standardtexte)
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
            if (primaryActivity.timestamps?.start) { activityTimeElement.textContent = `${translations[currentLanguage].timestampPrefix} ${formatDuration(primaryActivity.timestamps.start)}`; activityTimeElement.style.display = 'block'; }
            else { activityTimeElement.style.display = 'none'; }
            if (primaryActivity.buttons?.length > 0) { primaryActivity.buttons.forEach(label => { const btn = document.createElement('span'); btn.classList.add('activity-button'); btn.textContent = label; activityButtonsContainer.appendChild(btn); }); }
        } else {
            if (status === 'offline') { activityDetailsElement.textContent = translations[currentLanguage].activityOffline; }
            else { activityDetailsElement.textContent = translations[currentLanguage].activityDoingNothing; }
            activityStateElement.style.display = 'none';
            activityTimeElement.style.display = 'none';
        }
        // Stelle sicher, dass sprachabhängige Texte nach dem Datenladen aktuell sind
        updateDynamicTexts(userData);
    }

    // --- Helper Function to Format Duration ---
    function formatDuration(startTime) {
        const now = Date.now(); const diffSeconds = Math.floor((now - startTime) / 1000);
        if (diffSeconds < 60) return `${diffSeconds} ${currentLanguage === 'de' ? 'Sek.' : 'sec'}`; // Simple lang check for duration
        const diffMinutes = Math.floor(diffSeconds / 60);
        if (diffMinutes < 60) return `${diffMinutes} ${currentLanguage === 'de' ? 'Min.' : 'min'}`;
        const diffHours = Math.floor(diffMinutes / 60); const remainingMinutes = diffMinutes % 60;
        if (remainingMinutes === 0) return `${diffHours} ${currentLanguage === 'de' ? 'Std.' : 'hr'}`;
        return `${diffHours} ${currentLanguage === 'de' ? 'Std.' : 'hr'} ${remainingMinutes} ${currentLanguage === 'de' ? 'Min.' : 'min'}`;
    }

    // --- Helper Function to Format Time (MM:SS) ---
    function formatTime(seconds) { const minutes = Math.floor(seconds / 60); const secs = Math.floor(seconds % 60); return `${minutes}:${secs < 10 ? '0' : ''}${secs}`; }

    // --- Function to Display Errors ---
    function displayError(message) { errorMessageElement.textContent = `${translations[currentLanguage].errorPrefix} ${message} ${translations[currentLanguage].errorRetry}`; }

    // --- Event Listener for Copy Username ---
    copyUsernameButton.addEventListener('click', () => { /* ... (wie zuvor, verwendet currentLanguage) ... */ });

    // --- === Music Player Logic === ---
    function togglePlayPause() { /* ... */ }
    function updatePlayPauseIcon() { /* ... */ }
    function updateProgress() { /* ... */ }
    function setProgress(e) { /* ... */ }
    playPauseButton.addEventListener('click', togglePlayPause);
    audioElement.addEventListener('play', updatePlayPauseIcon);
    audioElement.addEventListener('pause', updatePlayPauseIcon);
    audioElement.addEventListener('ended', updatePlayPauseIcon);
    audioElement.addEventListener('loadedmetadata', () => { totalTimeElement.textContent = formatTime(audioElement.duration); updateProgress(); const initialVolume = audioElement.volume; volumeSlider.value = initialVolume; lastVolume = initialVolume; updateVolumeIcon(initialVolume); });
    audioElement.addEventListener('timeupdate', updateProgress);
    progressBar.addEventListener('click', setProgress);

    // --- === Volume Control Logic === ---
    function updateVolumeIcon(volume) { /* ... */ }
    volumeSlider.addEventListener('input', (e) => { /* ... */ });
    volumeIconDisplay.addEventListener('click', () => { /* ... */ });
    audioElement.addEventListener('volumechange', () => { /* ... */ });

    // --- === Slider Event Listeners === ---
    prevButton.addEventListener('click', () => goToPage(currentPage - 1));
    nextButton.addEventListener('click', () => goToPage(currentPage + 1));
    sliderContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
    sliderContainer.addEventListener('touchmove', handleTouchMove, { passive: true }); // Making move passive might improve scroll smoothness if issues arise, but can interfere with precise drag logic. Test carefully.
    sliderContainer.addEventListener('touchend', handleTouchEnd);
    sliderContainer.addEventListener('touchcancel', handleTouchEnd);

    // --- Initialisierung ---
    const preferredLanguage = localStorage.getItem('preferredLanguage');
    setLanguage(preferredLanguage && translations[preferredLanguage] ? preferredLanguage : 'de');
    langDeButton.addEventListener('click', () => setLanguage('de'));
    langEnButton.addEventListener('click', () => setLanguage('en'));
    fetchData();
    if (refreshInterval) clearInterval(refreshInterval);
    refreshInterval = setInterval(fetchData, 30000);
});

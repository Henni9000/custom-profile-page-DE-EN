document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = 'https://api.lanyard.rest/v1/users/739397631998165023';
    const loader = document.getElementById('loader');
    const profileCard = document.getElementById('profile-card');
    const errorMessageElement = document.getElementById('error-message');
    const bodyElement = document.body; // Referenz zum Body

    // === Hintergrund-Logik ===
    const backgroundImageUrl = 'background.jpg'; // Der Name deines Bildes
    const imageTester = new Image();

    imageTester.onload = function() {
        // Bild wurde erfolgreich geladen
        console.log('Hintergrundbild erfolgreich geladen.');
        bodyElement.classList.add('image-background');
        bodyElement.classList.remove('gradient-background'); // Sicherstellen, dass Gradient entfernt wird
    };

    imageTester.onerror = function() {
        // Bild konnte nicht geladen werden (existiert nicht, Pfad falsch etc.)
        console.warn('Hintergrundbild konnte nicht geladen werden. Fallback zu Gradient.');
        bodyElement.classList.add('gradient-background');
        bodyElement.classList.remove('image-background'); // Sicherstellen, dass Bild-BG entfernt wird
    };

    // Starte den Ladevorgang des Bildes (NACHDEM die Handler gesetzt wurden!)
    imageTester.src = backgroundImageUrl;
    // ========================


    // --- Elemente zum Update (Discord-bezogen) ---
    const profilePicture = document.getElementById('profile-picture');
    const avatarDecoration = document.getElementById('avatar-decoration'); // Kann null sein, wenn ID nicht existiert
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
    let lastVolume = audioElement.volume; // Speicher für Lautstärke vor Mute

    let refreshInterval; // Für das automatische Aktualisieren der Discord-Daten

    // --- Initial Fetch Function ---
    const fetchData = () => {
        console.log("Fetching new data...");
        errorMessageElement.textContent = ''; // Clear previous errors

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.success && data.data) {
                    updateProfile(data.data);
                    // Only show card after first successful fetch
                    if (!profileCard.classList.contains('visible')) {
                        showCard();
                    }
                } else {
                    throw new Error('API did not return success or data is missing.');
                }
            })
            .catch(error => {
                console.error('Error fetching Discord data:', error);
                displayError(`Fehler: ${error.message}. Versuche es erneut...`);
                // Still show the card on error, but maybe with default/old data
                if (!profileCard.classList.contains('visible')) {
                     showCard(); // Show card even if initial fetch fails, maybe show error inside
                }
            });
    };

    // --- Function to Show Card with Animation ---
    const showCard = () => {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
            profileCard.style.visibility = 'visible'; // Make it take space
            profileCard.classList.add('visible');
        }, 500); // Match loader fade-out duration
    };


    // --- Function to Update DOM Elements (Discord Part) ---
    function updateProfile(userData) {
        const user = userData.discord_user;
        const activities = userData.activities;
        const status = userData.discord_status;

        // PFP and Basic Info
        const pfpUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith('a_') ? 'gif' : 'png'}?size=256`;
        profilePicture.src = pfpUrl;
        statusPfp.src = pfpUrl;

        // Handle Avatar Decoration (check if data exists and element exists)
        if (avatarDecoration && user.avatar_decoration_data?.asset) {
            const decorationUrl = `https://cdn.discordapp.com/avatar-decorations/${user.id}/${user.avatar_decoration_data.asset}.png?size=160`; // Adjust size if needed
            avatarDecoration.src = decorationUrl;
            avatarDecoration.style.display = 'block'; // Show it
        } else if (avatarDecoration) {
            avatarDecoration.style.display = 'none'; // Hide if no decoration or element doesn't exist
        }

        const displayName = user.global_name || user.username;
        usernameElement.textContent = displayName;
        bioElement.textContent = `Ich bin ${displayName}`;

        // Discord Username and Copy Button
        const fullUsername = user.discriminator === "0" ? user.username : `${user.username}#${user.discriminator}`;
        discordUserElement.textContent = fullUsername;
        copyUsernameButton.dataset.username = fullUsername; // Store username for copying

        // Status Indicator (with pulse animation class)
        statusIndicator.className = `status-dot ${status}`; // Base class + status
        // Add specific pulse class based on status
        statusIndicator.classList.remove('pulse-online', 'pulse-dnd'); // Remove old pulse classes first
        if (status === 'online') {
            statusIndicator.classList.add('pulse-online'); // Use if you define a specific online pulse
        } else if (status === 'dnd') {
            statusIndicator.classList.add('pulse-dnd');
        }

        // Activity Details, State, Timestamp, and Buttons
        let primaryActivity = activities.find(act => act.type !== 4) || activities.find(act => act.type === 4) || null; // Prefer non-custom status first

        activityButtonsContainer.innerHTML = ''; // Clear previous buttons
        activityTimeElement.textContent = ''; // Clear previous time

        if (primaryActivity) {
            let detailsText = '';
            let stateText = '';

            if (primaryActivity.type === 4 && primaryActivity.state) { // Custom Status
                detailsText = primaryActivity.state;
                if (primaryActivity.emoji?.name) {
                    // Note: You might need more complex emoji handling (custom vs unicode)
                    detailsText = `${primaryActivity.emoji.name} ${detailsText}`;
                }
            } else { // Other activities (Playing, Listening, etc.)
                detailsText = primaryActivity.name || '';
                if (primaryActivity.details) {
                    stateText = primaryActivity.details; // Often details is the primary line
                }
                if (primaryActivity.state) {
                     // Append state if it exists and is different from details
                    if (stateText && primaryActivity.state !== stateText) {
                         stateText += ` | ${primaryActivity.state}`;
                    } else if (!stateText) {
                        stateText = primaryActivity.state;
                    }
                }
            }

            activityDetailsElement.textContent = detailsText || 'Nichts zu sehen...';
            activityStateElement.textContent = stateText;
            activityStateElement.style.display = stateText ? 'block' : 'none';

            // Activity Timestamp
            if (primaryActivity.timestamps?.start) {
                activityTimeElement.textContent = `seit ${formatDuration(primaryActivity.timestamps.start)}`;
            }

            // Activity Buttons
            if (primaryActivity.buttons && primaryActivity.buttons.length > 0) {
                primaryActivity.buttons.forEach(buttonLabel => {
                     // Lanyard v1 usually only gives labels, not URLs for custom status buttons
                    const buttonElement = document.createElement('span'); // Use span if not clickable
                    buttonElement.classList.add('activity-button');
                    buttonElement.textContent = buttonLabel;
                    activityButtonsContainer.appendChild(buttonElement);
                });
            }

        } else {
            activityDetailsElement.textContent = 'Leerlauf';
            activityStateElement.style.display = 'none';
        }
    }

    // --- Helper Function to Format Duration ---
    function formatDuration(startTime) {
        const now = Date.now();
        const diffSeconds = Math.floor((now - startTime) / 1000);

        if (diffSeconds < 60) return `${diffSeconds} Sek.`;

        const diffMinutes = Math.floor(diffSeconds / 60);
        if (diffMinutes < 60) return `${diffMinutes} Min.`;

        const diffHours = Math.floor(diffMinutes / 60);
        const remainingMinutes = diffMinutes % 60;
        if (remainingMinutes === 0) return `${diffHours} Std.`;

        return `${diffHours} Std. ${remainingMinutes} Min.`;
    }

     // --- Helper Function to Format Time (MM:SS) ---
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`; // Führende Null für Sekunden
    }


    // --- Function to Display Errors ---
    function displayError(message) {
        errorMessageElement.textContent = message;
    }

    // --- Event Listener for Copy Username ---
    copyUsernameButton.addEventListener('click', () => {
        const usernameToCopy = copyUsernameButton.dataset.username;
        if (!usernameToCopy) return;

        navigator.clipboard.writeText(usernameToCopy)
            .then(() => {
                // Visual feedback
                copyUsernameButton.classList.add('copied');
                const originalTitle = copyUsernameButton.title;
                copyUsernameButton.title = "Kopiert!";
                setTimeout(() => {
                    copyUsernameButton.classList.remove('copied');
                    copyUsernameButton.title = originalTitle;
                }, 1500); // Reset after 1.5 seconds
            })
            .catch(err => {
                console.error('Kopieren fehlgeschlagen:', err);
                copyUsernameButton.title = "Kopieren fehlgeschlagen!";
                 setTimeout(() => { copyUsernameButton.title = "Benutzername kopieren"; }, 1500);
            });
    });

    // --- === Music Player Logic === ---

    // Funktion zum Umschalten von Play/Pause
    function togglePlayPause() {
        if (audioElement.paused || audioElement.ended) {
            audioElement.play().catch(error => console.error("Fehler beim Abspielen:", error)); // Fehler abfangen
        } else {
            audioElement.pause();
        }
    }

    // Funktion zum Aktualisieren des Play/Pause-Buttons
    function updatePlayPauseIcon() {
        if (audioElement.paused || audioElement.ended) {
            playPauseButton.classList.remove('fa-pause');
            playPauseButton.classList.add('fa-play');
        } else {
            playPauseButton.classList.remove('fa-play');
            playPauseButton.classList.add('fa-pause');
        }
    }

    // Funktion zum Aktualisieren des Fortschrittsbalkens und der Zeit
    function updateProgress() {
        if (audioElement.duration) {
            const progressPercent = (audioElement.currentTime / audioElement.duration) * 100;
            progressElement.style.width = `${progressPercent}%`;
            currentTimeElement.textContent = formatTime(audioElement.currentTime);
        } else {
            // Falls Dauer noch nicht geladen ist
             progressElement.style.width = '0%';
            currentTimeElement.textContent = formatTime(0);
        }
    }

     // Funktion zum Setzen der Abspielposition (Seeking)
     function setProgress(e) {
         // Berechne Breite des Fortschrittsbalkens
         const width = progressBar.clientWidth;
         // Berechne Klickposition relativ zum Balkenstart
         const clickX = e.offsetX;
         // Berechne Dauer des Songs, stelle sicher, dass sie nicht 0 ist
         const duration = audioElement.duration;

         if (duration) {
            // Setze die neue Zeit im Audio-Element
            audioElement.currentTime = (clickX / width) * duration;
         }
     }


    // Event Listener für den Play/Pause-Button
    playPauseButton.addEventListener('click', togglePlayPause);

    // Event Listener für das Audio-Element, um den Button-Status zu aktualisieren
    audioElement.addEventListener('play', updatePlayPauseIcon);
    audioElement.addEventListener('pause', updatePlayPauseIcon);
    audioElement.addEventListener('ended', updatePlayPauseIcon); // Auch bei Ende zurücksetzen

    // Event Listener, um die Gesamtzeit anzuzeigen, wenn Metadaten geladen sind
    audioElement.addEventListener('loadedmetadata', () => {
        totalTimeElement.textContent = formatTime(audioElement.duration);
        updateProgress(); // Initialisiere Fortschrittsanzeige
        // Setze initiale Lautstärke vom Audio Element auf den Slider
        const initialVolume = audioElement.volume;
        volumeSlider.value = initialVolume;
        lastVolume = initialVolume; // Auch lastVolume setzen
        updateVolumeIcon(initialVolume); // Initiales Icon setzen
    });

    // Event Listener, um Fortschritt während des Abspielens zu aktualisieren
    audioElement.addEventListener('timeupdate', updateProgress);

     // Event Listener für Klicks auf den Fortschrittsbalken (Seeking)
    progressBar.addEventListener('click', setProgress);

    // --- === End Music Player Logic === ---


    // --- === Volume Control Logic === ---

    // Funktion zum Aktualisieren des Lautstärke-Icons
    function updateVolumeIcon(volume) {
        volumeIconDisplay.classList.remove('fa-volume-high', 'fa-volume-low', 'fa-volume-off');
        if (audioElement.muted || volume === 0) {
            volumeIconDisplay.classList.add('fa-volume-off');
        } else if (volume < 0.5) {
            volumeIconDisplay.classList.add('fa-volume-low');
        } else {
            volumeIconDisplay.classList.add('fa-volume-high');
        }
    }

    // Event Listener für den Lautstärke-Slider
    volumeSlider.addEventListener('input', (e) => {
        const newVolume = parseFloat(e.target.value);
        audioElement.volume = newVolume;
        // Entmuten, wenn der Regler bewegt wird und vorher gemutet war
        if (audioElement.muted && newVolume > 0) {
            audioElement.muted = false;
        }
        lastVolume = newVolume; // Aktualisiere lastVolume nur bei manueller Änderung
        updateVolumeIcon(newVolume);
    });

    // Event Listener für Klick auf das Lautstärke-Icon (Mute Toggle)
    volumeIconDisplay.addEventListener('click', () => {
        if (audioElement.muted) {
            // Unmute
            audioElement.muted = false;
            audioElement.volume = lastVolume; // Zurück zur letzten Lautstärke
            volumeSlider.value = lastVolume; // Slider auch zurücksetzen
            updateVolumeIcon(lastVolume);
        } else {
            // Mute
            lastVolume = audioElement.volume; // Aktuelle Lautstärke speichern
            audioElement.muted = true;
            volumeSlider.value = 0; // Slider auf 0 setzen (visuelles Feedback)
            updateVolumeIcon(0); // Icon auf 'off' setzen
        }
    });

    // Optional: Aktualisiere auch bei externer Lautstärkeänderung (selten nötig)
    audioElement.addEventListener('volumechange', () => {
        // Aktualisiere Slider und Icon nur, wenn nicht gerade gemutet wurde
        if (!audioElement.muted) {
             volumeSlider.value = audioElement.volume;
             updateVolumeIcon(audioElement.volume);
             // lastVolume hier *nicht* ändern
        } else {
            // Wenn gemutet, stelle sicher, dass Slider und Icon den Mute-Status zeigen
            volumeSlider.value = 0;
            updateVolumeIcon(0);
        }
    });
    // --- === End Volume Control Logic === ---


    // --- Initial Fetch and Start Refresh Timer ---
    fetchData(); // Fetch data immediately on load
    if (refreshInterval) clearInterval(refreshInterval);
    refreshInterval = setInterval(fetchData, 30000); // Refresh Discord data every 30 seconds
});
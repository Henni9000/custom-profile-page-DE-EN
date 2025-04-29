# Custom Profil Website [DE]

*(For the English version of this README, please click here: [English README](README.en.md))*

---

Meine Profil Website 🚀 - Eine dynamische persönliche Profilseite, die Live-Discord-Status, Musikwiedergabe, Mehrsprachigkeit und mehr integriert.

![Vorschau der Website](preview.png)
<!-- Ersetze preview.png mit dem tatsächlichen Namen deines Screenshots/GIFs -->

## ✨ Features

*   **Dynamisches Profil:** Zeigt Benutzerinformationen wie Namen und eine kurze Bio an.
*   **Live Discord Status:**
    *   Ruft den aktuellen Discord-Status (Online, Idle, DND, Offline) über die [Lanyard API](https://lanyard.rest/) ab.
    *   Zeigt die aktuelle Aktivität (Spielen, Streamen, Musikhören, Custom Status) inklusive Details, Status und Dauer an.
    *   Zeigt klickbare Buttons aus der Discord Rich Presence an (falls vorhanden).
    *   Aktualisiert sich automatisch alle 30 Sekunden.
*   **Mehrsprachigkeit:** Unterstützt Deutsch und Englisch, umschaltbar über Buttons oben links. Die Auswahl wird im LocalStorage gespeichert.
*   **Discord PFP als Favicon:** Setzt das Browser-Favicon dynamisch auf das aktuelle Discord-Profilbild.
*   **Interaktiver Musikplayer:**
    *   Spielt eine lokale MP3-Datei (`song.mp3`).
    *   Zeigt Songtitel und Interpret an.
    *   Bietet Play/Pause-Steuerung.
    *   Zeigt aktuelle Wiedergabezeit und Gesamtdauer an.
    *   Interaktiver Fortschrittsbalken zum Springen im Song (Seeking).
*   **Lautstärkeregler:**
    *   Schwebender Regler oben links.
    *   Fährt beim Hovern auf Desktop aus / ist auf Mobilgeräten direkt sichtbar.
    *   Ermöglicht die Anpassung der Lautstärke.
    *   Mute-Funktion durch Klick auf das Icon.
*   **Responsives Design:** Angepasst für gute Darstellung und Bedienbarkeit auf Desktop- und Mobilgeräten.
*   **Benutzerfreundlichkeit:**
    *   Kopier-Button für den Discord-Benutzernamen.
    *   Verlinkungen zu sozialen Profilen (YouTube, Discord, GitHub) und benutzerdefinierten Projekten.
*   **Visuelle Effekte:**
    *   Ladeanimation beim Start.
    *   Sanfte Einblend-Animation für die Profilkarte und ihre Elemente.
    *   Pulsierende Statusanzeige (Online/DND).
    *   Hover-Effekte für interaktive Elemente (Desktop).
    *   Optionaler Bildhintergrund mit Fallback auf einen animierten Gradienten.

## 🚀 Live Demo

[**Hier klicken zur Live-Demo**](https://henni9000-profile.netlify.app/)
<!-- Stelle sicher, dass der Link korrekt ist -->

## 🛠️ Verwendete Technologien

*   **HTML5:** Struktur der Webseite.
*   **CSS3:** Styling, Layout (Flexbox), Media Queries (Responsive Design), Animationen und Effekte.
*   **JavaScript (Vanilla):**
    *   DOM-Manipulation.
    *   API-Anfragen (Fetch API) an Lanyard.
    *   Steuerung des Audio-Players.
    *   Event-Handling für Interaktionen.
    *   Dynamische Hintergrundauswahl.
    *   Sprachumschaltung und Speicherung.
*   **Browser LocalStorage:** Zum Speichern der Sprachpräferenz.
*   **[Lanyard API](https://lanyard.rest/):** Zum Abrufen des Live-Discord-Status.
*   **[Font Awesome](https://fontawesome.com/):** Für Icons.
*   **[Google Fonts](https://fonts.google.com/):** Für die Schriftart "Poppins".

## ⚙️ Setup und lokale Ausführung

1.  **Repository klonen:**
    ```bash
    git clone https://github.com/Henni9000/henni-profile.git
    cd henni-profile
    ```
    *(Stelle sicher, dass der Repository-Name `henni-profile` korrekt ist)*
2.  **Musikdatei hinzufügen:** Platziere deine gewünschte Musikdatei als `song.mp3` im Hauptverzeichnis des Projekts.
3.  **Hintergrundbild hinzufügen (Optional):** Platziere dein gewünschtes Hintergrundbild als `background.jpg` im Hauptverzeichnis. Wenn kein Bild gefunden wird, wird der animierte Gradient verwendet.
4.  **Lokalen Webserver starten:** Da die Seite API-Anfragen (Lanyard) durchführt und lokale Audiodateien lädt, funktioniert sie am besten über einen lokalen Webserver.
    *   **Option 1 (VS Code):** Installiere die "Live Server"-Erweiterung und starte sie.
    *   **Option 2 (Python 3):** `python -m http.server`
    *   **Option 3 (Node.js):** `npm install -g http-server && http-server .`
5.  **Öffnen:** Greife über die vom lokalen Server bereitgestellte URL (z.B. `http://localhost:8000`) auf die Seite zu.

## 🔧 Anpassung

*   **Discord User ID:** Ändere die ID in der `apiUrl`-Variable in `script.js`, um den Status eines anderen Benutzers anzuzeigen.
*   **Soziale Links:** Bearbeite die `<a>`-Tags im `<div class="social-links">`-Abschnitt in `index.html`.
*   **Songtitel:** Ändere den Text im `<span class="song-title">`-Element in `index.html`, um ihn an deine `song.mp3` anzupassen.
*   **Übersetzungen:** Füge neue Sprachen hinzu oder ändere bestehende Texte im `translations`-Objekt in `script.js`. Aktualisiere auch die Sprachbuttons und die `setLanguage`-Logik entsprechend.

## 🙏 Danksagungen

*   Wesentliche Teile des Codes für dieses Projekt wurden mithilfe des KI-Sprachmodells Google Gemini auf Basis spezifischer Anfragen und Anweisungen generiert und anschließend angepasst und integriert.
*   Ein Dank geht an die Entwickler der [Lanyard API](https://lanyard.rest/) für die einfache Bereitstellung der Discord-Präsenzdaten.
*   Danke an [Font Awesome](https://fontawesome.com/) und [Google Fonts](https://fonts.google.com/) für die Icons und Schriftarten.

## 📄 Lizenz

Dieses Projekt steht unter der [MIT-Lizenz](LICENSE).

---

Viel Spaß mit deiner Profilseite!

# Custom Profile Website [EN]

*(Deutsche Version dieser README hier verfügbar: [Deutsche README](README.md))*

---

My Profile Website 🚀 - A dynamic personal profile page integrating live Discord status, music playback, multi-language support, and more.

![Website Preview](preview.png)
<!-- Replace preview.png with the actual name of your screenshot/GIF -->

## ✨ Features

*   **Dynamic Profile:** Displays user information like name and a short bio.
*   **Live Discord Status:**
    *   Fetches the current Discord status (Online, Idle, DND, Offline) via the [Lanyard API](https://lanyard.rest/).
    *   Shows the current activity (Playing, Streaming, Listening, Custom Status) including details, state, and duration.
    *   Displays clickable buttons from Discord Rich Presence (if available).
    *   Automatically updates every 30 seconds.
*   **Multilingual:** Supports German and English, switchable via buttons in the top-left corner. The selection is saved in LocalStorage.
*   **Discord PFP as Favicon:** Dynamically sets the browser favicon to the current Discord profile picture.
*   **Interactive Music Player:**
    *   Plays a local MP3 file (`song.mp3`).
    *   Displays song title and artist.
    *   Provides Play/Pause controls.
    *   Shows current playback time and total duration.
    *   Interactive progress bar for seeking within the song.
*   **Volume Control:**
    *   Floating control in the top-left corner.
    *   Expands on hover on desktop / is directly visible on mobile.
    *   Allows adjusting the volume.
    *   Mute function by clicking the icon.
*   **Responsive Design:** Adapted for good display and usability on desktop and mobile devices.
*   **User Experience:**
    *   Copy button for the Discord username.
    *   Links to social profiles (YouTube, Discord, GitHub) and custom projects.
*   **Visual Effects:**
    *   Loading animation on startup.
    *   Smooth fade-in animation for the profile card and its elements.
    *   Pulsating status indicator (Online/DND).
    *   Hover effects for interactive elements (Desktop).
    *   Optional image background with a fallback to an animated gradient.

## 🚀 Live Demo

[**Click here for the Live Demo**](https://henni9000-profile.netlify.app/)
<!-- Make sure the link is correct -->

## 🛠️ Technologies Used

*   **HTML5:** Structure of the webpage.
*   **CSS3:** Styling, Layout (Flexbox), Media Queries (Responsive Design), Animations, and Effects.
*   **JavaScript (Vanilla):**
    *   DOM Manipulation.
    *   API Requests (Fetch API) to Lanyard.
    *   Audio Player Control.
    *   Event Handling for interactions.
    *   Dynamic Background Selection.
    *   Language Switching and Saving.
*   **Browser LocalStorage:** For saving the language preference.
*   **[Lanyard API](https://lanyard.rest/):** For fetching live Discord status.
*   **[Font Awesome](https://fontawesome.com/):** For icons.
*   **[Google Fonts](https://fonts.google.com/):** For the "Poppins" font.

## ⚙️ Setup and Local Execution

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/Henni9000/henni-profile.git
    cd henni-profile
    ```
    *(Make sure the repository name `henni-profile` is correct)*
2.  **Add Music File:** Place your desired music file as `song.mp3` in the project's root directory. *(See license note below)*
3.  **Add Background Image (Optional):** Place your desired background image as `background.jpg` in the root directory. If no image is found, the animated gradient will be used.
4.  **Start a Local Web Server:** Since the page makes API requests (Lanyard) and loads local audio files, it works best when served via a local web server.
    *   **Option 1 (VS Code):** Install the "Live Server" extension and start it.
    *   **Option 2 (Python 3):** `python -m http.server`
    *   **Option 3 (Node.js):** `npm install -g http-server && http-server .`
5.  **Open:** Access the page via the URL provided by the local server (e.g., `http://localhost:8000`).

## 🔧 Customization

*   **Discord User ID:** Change the ID in the `apiUrl` variable in `script.js` to display the status of a different user.
*   **Social Links:** Edit the `<a>` tags within the `<div class="social-links">` section in `index.html`.
*   **Song Title:** Change the text within the `<span class="song-title">` element in `index.html` to match your `song.mp3`.
*   **Translations:** Add new languages or modify existing texts in the `translations` object in `script.js`. Also, update the language buttons and the `setLanguage` logic accordingly.

## 🙏 Acknowledgements

*   Significant parts of the code for this project were generated with the assistance of the AI language model Google Gemini, based on specific requests and instructions, and subsequently adapted and integrated.
*   The music used is 'Cloud Dancer' by Kevin MacLeod. Downloaded from [incompetech.com](https://incompetech.com). Licensed under Creative Commons: By Attribution 4.0 ([CC BY 4.0](http://creativecommons.org/licenses/by/4.0/)).
*   Thanks to the developers of the [Lanyard API](https://lanyard.rest/) for easily providing Discord presence data.
*   Thanks to [Font Awesome](https://fontawesome.com/) and [Google Fonts](https://fonts.google.com/) for the icons and fonts.

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

Have fun with your profile page!

# Metrolink to Google Calendar Chrome Extension (Manifest V3)

A lightweight, privacy-focused Chrome Extension that adds an **"Add to Google Calendar"** button to Metrolink schedule cards, allowing you to add train departures, arrivals, stations, and transfer itineraries to your calendar with a single click.

---

## Features

- **Direct Placement**: Injected directly underneath the **"Where to Buy"** button inside the expanded "Details" drawer of any schedule card.
- **Native Look & Feel**: Styled in crisp white with dark uppercase typography, rounded corners, and subtle hover animations that seamlessly match Metrolink's design system.
- **Zero OAuth / 100% Private**: Uses Google Calendar's event template URL format (`calendar.google.com/calendar/render?action=TEMPLATE...`), which requires **no Google account access, no OAuth tokens, no API keys, and no personal data collection**.
- **Accurate Scheduling & Timezones**: Automatically resolves the departure and arrival times and sets the calendar timezone to Pacific Time (`America/Los_Angeles`).
- **Rich Multi-Leg Itineraries**: Includes departure station, arrival station, intermediate stops, transfer durations (e.g. 39m at L.A. Union Station), train numbers (`OC 1661`, `A769`), and a direct link back to the schedule in the event description.
- **Minimal Permissions**: Uses the latest Chrome Extension **Manifest V3** with zero background bloat and only the specific host permission for `metrolinktrains.com`.

---

## Installation Guide (Load Unpacked)

To test and use this extension in Google Chrome:

1. **Open Chrome Extensions**:
   - In Google Chrome, navigate to `chrome://extensions` in the address bar (or go to **Menu (⋮)** → **Extensions** → **Manage Extensions**).
2. **Enable Developer Mode**:
   - Toggle the **Developer mode** switch in the top-right corner to **ON**.
3. **Load the Extension**:
   - Click the **Load unpacked** button in the top-left corner.
   - Select this folder:
     ```
     c:\Users\hydro\OneDrive\Documents\vscode\.Projects\metrolink-cal
     ```
4. **Done!** The extension **"Metrolink to Google Calendar"** will now be active in Chrome.

---

## How to Test on Metrolink

1. Open any Metrolink schedule search in Chrome, for example:
   ```
   https://metrolinktrains.com/schedules/?type=station&originId=156&destinationId=103&weekend=3#0
   ```
2. Click **Details** on any train card (e.g. the 9:28 AM Tustin to Chatsworth train).
3. Look directly beneath the blue **"WHERE TO BUY"** button on the right side of the card details.
4. You will see the white **"ADD TO CALENDAR"** button.
5. Click **"ADD TO CALENDAR"**:
   - The button will display `✓ OPENING...` and a toast notification will appear.
   - A new tab will open directly to Google Calendar with your event prefilled (title, times, station location, and full itinerary).
   - Click **Save** in Google Calendar to add it to your schedule!

---

## Local Offline Testing

A standalone test fixture is included in `test/test-page.html` which mirrors the Metrolink schedule card and details drawer:

- Double-click or open `test/test-page.html` in Chrome.
- You can inspect the button positioning, styling, hover transitions, and click behaviors offline.

---

## Project Structure

```
metrolink-cal/
├── manifest.json         # Chrome Extension Manifest V3 configuration
├── content.js            # Content script: DOM observer, data parser, & GCal builder
├── content.css           # Button styling & layout matching Metrolink design
├── popup.html            # Extension action popup interface
├── popup.css             # Styling for the popup
├── popup.js              # Popup tab check and status logic
├── icons/                # Extension icons (16, 32, 48, 128 px)
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── test/                 # Local test harness
│   └── test-page.html    # Standalone HTML fixture reproducing Metrolink card
└── README.md             # Documentation & installation guide
```

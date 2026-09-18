# Metrolink to Google Calendar Chrome Extension (Manifest V3)

A lightweight, privacy-focused Chrome Extension that adds an **"Add to Google Calendar"** button to Metrolink schedule cards, allowing you to add train departures, arrivals, stations, and transfer itineraries to your calendar.

## Features

- **Direct Placement**: Injected directly underneath the **"Where to Buy"** button inside the expanded "Details" drawer of any schedule card.
- **Zero OAuth / 100% Private**: Uses Google Calendar's event template URL format (`calendar.google.com/calendar/render?action=TEMPLATE...`), which requires **no Google account access, no OAuth tokens, no API keys, and no personal data collection**.
- **Accurate Scheduling & Timezones**: Automatically resolves the departure and arrival times and sets the calendar timezone to Pacific Time (`America/Los_Angeles`).
- **Rich Multi-Leg Itineraries**: Includes departure station, arrival station, intermediate stops, transfer durations (e.g. 39m at L.A. Union Station), train numbers (`OC 1661`, `A769`), and a direct link back to the schedule in the event description.
- **Minimal Permissions**: Uses the latest Chrome Extension **Manifest V3** with zero background bloat and only the specific host permission for `metrolinktrains.com`.

## How to Use 

TBD, chrome web store link

## How to Test on Metrolink

1. Open any Metrolink schedule search in Chrome, for example:
   ```
   https://metrolinktrains.com/schedules/?type=station&originId=156&destinationId=103&weekend=3#0
   ```
2. Click **Details** on any train card (e.g. the 9:28 AM Tustin to Chatsworth train).
3. Look directly beneath the blue **"WHERE TO BUY"** button on the right side of the card details.
4. You will see the white **"ADD TO CALENDAR"** button.
5. Click **"ADD TO CALENDAR"**:
   - A new tab will open directly to Google Calendar with your event prefilled (title, times, station location, and full itinerary).
   - Click **Save** in Google Calendar to add it to your schedule!

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

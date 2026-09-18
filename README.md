# Metrolink to Google Calendar Chrome Extension

![alt text](img/metrolink-cal-promo.png)

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

## Images
![alt text](img/metrolink-cal-1.png)
*Image 1: New "Add to Calendar" button on https://metrolinktrains.com/schedules*

![alt text](img/metrolink-cal-2.png)
*Image 2: New calendar event! With auto-filled train schedule data*

![alt text](img/metrolink-cal-3.png)
*Image 3: Example of the new event on my calendar*
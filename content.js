/**
 * Metrolink to Google Calendar Chrome Extension
 * Content Script (Manifest V3)
 *
 * Injects an "Add to Google Calendar" button right beneath the "Where to Buy" button
 * on Metrolink schedule cards and formats a comprehensive calendar event.
 */

(function () {
  'use strict';


  /**
   * Determine the target schedule day (Saturday, Sunday, or Weekday)
   */
  function getScheduleDayContext() {
    // 1. Check active radio buttons on the page
    const satRadio = document.querySelector('input#saturday, input[value="3"]');
    if (satRadio && satRadio.checked) return 'saturday';

    const sunRadio = document.querySelector('input#sunday, input[value="4"]');
    if (sunRadio && sunRadio.checked) return 'sunday';

    const weekdayRadio = document.querySelector('input#weekday, input[value="0"]');
    if (weekdayRadio && weekdayRadio.checked) return 'weekday';

    // 2. Check URL parameters
    const params = new URLSearchParams(window.location.search);
    const weekendParam = params.get('weekend');
    if (weekendParam === '3') return 'saturday';
    if (weekendParam === '4') return 'sunday';
    if (weekendParam === '0' || weekendParam === '1') return 'weekday';

    // 3. Fallback: inspect page text headers
    const pageText = document.body.innerText || '';
    if (pageText.includes('Saturday')) return 'saturday';
    if (pageText.includes('Sunday')) return 'sunday';

    return 'weekday';
  }

  /**
   * Calculate the upcoming Date for a given schedule day context
   */
  function getUpcomingDate(scheduleDay, depTimeMinutes) {
    const now = new Date();
    // Convert to America/Los_Angeles local time representation
    const laDateStr = now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
    const localNow = new Date(laDateStr);

    const currentDayOfWeek = localNow.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const currentMinutes = localNow.getHours() * 60 + localNow.getMinutes();

    let targetDate = new Date(localNow);

    if (scheduleDay === 'saturday') {
      let daysUntilSat = (6 - currentDayOfWeek + 7) % 7;
      if (daysUntilSat === 0 && depTimeMinutes !== undefined && depTimeMinutes < currentMinutes) {
        daysUntilSat = 7; // Train departed today, jump to next Saturday
      }
      targetDate.setDate(localNow.getDate() + daysUntilSat);
    } else if (scheduleDay === 'sunday') {
      let daysUntilSun = (0 - currentDayOfWeek + 7) % 7;
      if (daysUntilSun === 0 && depTimeMinutes !== undefined && depTimeMinutes < currentMinutes) {
        daysUntilSun = 7; // Train departed today, jump to next Sunday
      }
      targetDate.setDate(localNow.getDate() + daysUntilSun);
    } else {
      // Weekday (Mon-Fri)
      let daysToAdd = 0;
      if (currentDayOfWeek === 0) {
        daysToAdd = 1; // Sunday -> Monday
      } else if (currentDayOfWeek === 6) {
        daysToAdd = 2; // Saturday -> Monday
      } else {
        // Monday - Friday
        if (depTimeMinutes !== undefined && depTimeMinutes < currentMinutes) {
          daysToAdd = currentDayOfWeek === 5 ? 3 : 1; // Friday evening -> Monday, else tomorrow
        }
      }
      targetDate.setDate(localNow.getDate() + daysToAdd);
    }

    return targetDate;
  }

  /**
   * Parse "9:28 AM" or "11:59 PM" into { hours: 24h, minutes, totalMinutes }
   */
  function parseTimeString(timeStr) {
    if (!timeStr) return null;
    const match = timeStr.trim().match(/(\d{1,2}):(\d{2})\s*([AP]M)/i);
    if (!match) return null;

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3].toUpperCase();

    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    return {
      hours,
      minutes,
      totalMinutes: hours * 60 + minutes
    };
  }

  /**
   * Format date & time into Google Calendar ISO string: YYYYMMDDTHHmm00
   */
  function formatGCalDateTime(date, parsedTime) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const hh = String(parsedTime.hours).padStart(2, '0');
    const mm = String(parsedTime.minutes).padStart(2, '0');
    return `${y}${m}${d}T${hh}${mm}00`;
  }

  /**
   * Extract comprehensive trip data from a schedule card
   */
  function extractTripData(cardElement) {
    if (!cardElement) return null;

    // Origin
    const fromStationEl = cardElement.querySelector('.stationToStation-card__from-station a, .stationToStation-card__from-station');
    const originStation = fromStationEl ? fromStationEl.textContent.trim() : 'Origin Station';

    // Departure Time
    const depTimeEl = cardElement.querySelector('.stationToStation-card__from .stationToStation-card__big-time');
    const depTimeStr = depTimeEl ? depTimeEl.textContent.replace(/\s+/g, ' ').trim() : '';

    // Destination
    const toStationEl = cardElement.querySelector('.stationToStation-card__to-station a, .stationToStation-card__to-station');
    const destStation = toStationEl ? toStationEl.textContent.trim() : 'Destination Station';

    // Arrival Time
    const arrTimeEl = cardElement.querySelector('.stationToStation-card__to .stationToStation-card__big-time');
    const arrTimeStr = arrTimeEl ? arrTimeEl.textContent.replace(/\s+/g, ' ').trim() : '';

    // Duration & Transfers
    const durationEl = cardElement.querySelector('.stationToStation-card__arrow-time');
    const durationStr = durationEl ? durationEl.textContent.trim() : '';

    const transferEl = cardElement.querySelector('.stationToStation-card__transfer');
    const transferCountStr = transferEl ? transferEl.textContent.replace(/\s+/g, ' ').trim() : '';

    // Train Line badges
    const trainBadges = [];
    cardElement.querySelectorAll('.stationToStation-card__from [class*="line"], .stationToStation-card-details__timeline-info div[class*="line"]').forEach(el => {
      const txt = el.textContent.trim();
      if (txt && !trainBadges.includes(txt)) {
        trainBadges.push(txt);
      }
    });

    // Sub-stops & Itinerary Timeline
    const timelineItems = [];
    cardElement.querySelectorAll('.stationToStation-card-details__timeline-item').forEach(item => {
      const timeEl = item.querySelector('.stationToStation-card-details__timeline-time');
      const locEl = item.querySelector('.stationToStation-card-details-timeline-location');
      const badgeEl = item.querySelector('.stationToStation-card-details__timeline-info div');
      const transferDetailEl = item.querySelector('.stationToStation__transfer');

      const time = timeEl ? timeEl.textContent.trim() : '';
      const loc = locEl ? locEl.textContent.trim() : '';
      const badge = badgeEl ? badgeEl.textContent.trim() : '';
      const transfer = transferDetailEl ? transferDetailEl.textContent.trim() : '';

      if (loc) {
        timelineItems.push({
          type: 'stop',
          time,
          location: loc,
          badge
        });
      }
      if (transfer) {
        timelineItems.push({
          type: 'transfer',
          details: transfer
        });
      }
    });

    return {
      originStation,
      depTimeStr,
      destStation,
      arrTimeStr,
      durationStr,
      transferCountStr,
      trainBadges,
      timelineItems
    };
  }

  /**
   * Build the Google Calendar URL with all prefilled fields
   */
  function buildGoogleCalendarUrl(tripData) {
    const scheduleDay = getScheduleDayContext();
    const depTime = parseTimeString(tripData.depTimeStr);
    const arrTime = parseTimeString(tripData.arrTimeStr);

    if (!depTime || !arrTime) {
      console.warn('[Metrolink-Cal] Unable to parse departure/arrival times:', tripData.depTimeStr, tripData.arrTimeStr);
      return null;
    }

    // Determine target departure date
    const depDate = getUpcomingDate(scheduleDay, depTime.totalMinutes);

    // If arrival time is earlier in the day than departure time, trip spans midnight
    const arrDate = new Date(depDate);
    if (arrTime.totalMinutes < depTime.totalMinutes) {
      arrDate.setDate(arrDate.getDate() + 1);
    }

    const startFormatted = formatGCalDateTime(depDate, depTime);
    const endFormatted = formatGCalDateTime(arrDate, arrTime);

    // Title: "[Station 1] >> [Station 2]"
    const title = `${tripData.originStation} >> ${tripData.destStation}`;

    // Location: Origin station
    const location = `${tripData.originStation} Station, CA`;

    // Description / Details (plain text, no emojis)
    const formattedDate = depDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const lines = [
      `METROLINK TRIP DETAILS`,
      `----------------------------------------`,
      `Date: ${formattedDate}`,
      `Departure: ${tripData.depTimeStr} - ${tripData.originStation}`,
      `Arrival:   ${tripData.arrTimeStr} - ${tripData.destStation}`,
      tripData.durationStr ? `Duration:  ${tripData.durationStr}` : '',
      tripData.transferCountStr ? `Transfers: ${tripData.transferCountStr}` : '',
      tripData.trainBadges.length ? `Train(s):  ${tripData.trainBadges.join(', ')}` : '',
      '',
      `ITINERARY:`
    ].filter(Boolean);

    if (tripData.timelineItems && tripData.timelineItems.length > 0) {
      tripData.timelineItems.forEach(item => {
        if (item.type === 'stop') {
          const badgeStr = item.badge ? ` [${item.badge}]` : '';
          lines.push(` • ${item.time.padEnd(8, ' ')} ${item.location}${badgeStr}`);
        } else if (item.type === 'transfer') {
          lines.push(`    -> Transfer: ${item.details}`);
        }
      });
    } else {
      lines.push(` - ${tripData.depTimeStr} Depart ${tripData.originStation}`);
      lines.push(` - ${tripData.arrTimeStr} Arrive ${tripData.destStation}`);
    }

    lines.push('');
    lines.push(`Schedule: ${window.location.href}\n`);
    lines.push(`Generated by Metrolink to Google Calendar Chrome Extension`);

    const details = lines.join('\n');

    // Assemble URL
    const baseUrl = 'https://calendar.google.com/calendar/render';
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      dates: `${startFormatted}/${endFormatted}`,
      details: details,
      location: location,
      ctz: 'America/Los_Angeles'
    });

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Inject the "Add to Calendar" button directly underneath "Where to Buy"
   */
  function injectCalendarButton(ticketsContainer) {
    if (!ticketsContainer || ticketsContainer.querySelector('.metrolink-cal')) {
      return; // Already injected
    }

    // Locate the schedule card ancestor
    const card = ticketsContainer.closest('.stationToStation-card');
    if (!card) return;

    // Find the "Where to Buy" button inside ticketsContainer
    const whereToBuyBtn = ticketsContainer.querySelector('a[href*="where-to-buy"], .btn--solid');

    // Create the "Add to Calendar" button matching Ticket Types anchor button exactly
    const calBtn = document.createElement('a');
    calBtn.href = '#';
    calBtn.setAttribute('role', 'button');
    calBtn.className = 'btn stationToStation-card-details__tickets-btn metrolink-cal';
    calBtn.textContent = 'Add to Calendar';

    // Click handler
    calBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const tripData = extractTripData(card);
      if (!tripData) {
        console.error('[Metrolink Cal] Unable to extract trip details.');
        return;
      }

      const gcalUrl = buildGoogleCalendarUrl(tripData);
      if (!gcalUrl) {
        console.error('[Metrolink Cal] Failed to create calendar event link.');
        return;
      }

      // Visual feedback on button
      calBtn.textContent = 'Opening...';

      // Open Google Calendar in new tab
      window.open(gcalUrl, '_blank', 'noopener,noreferrer');

      // Reset button state after a short delay
      setTimeout(() => {
        calBtn.textContent = 'Add to Calendar';
      }, 2500);
    });

    // Structure layout: place button right below "Where to Buy"
    if (whereToBuyBtn) {
      // Check if already in action group wrapper
      let actionGroup = whereToBuyBtn.closest('.metrolink-cal-action-group');
      if (!actionGroup) {
        actionGroup = document.createElement('div');
        actionGroup.className = 'metrolink-cal-action-group';

        // Insert actionGroup right where whereToBuyBtn is
        whereToBuyBtn.parentNode.insertBefore(actionGroup, whereToBuyBtn);
        // Move whereToBuyBtn inside the actionGroup
        actionGroup.appendChild(whereToBuyBtn);
      }
      // Append Add To Calendar button directly under Where To Buy
      actionGroup.appendChild(calBtn);
    } else {
      // Fallback: append directly to ticketsContainer
      ticketsContainer.appendChild(calBtn);
    }
  }

  /**
   * Scan DOM and inject buttons on any visible schedule card details
   */
  function scanAndInject() {
    const ticketSections = document.querySelectorAll('.stationToStation-card-details__tickets');
    ticketSections.forEach(section => {
      injectCalendarButton(section);
    });
  }

  /**
   * Setup MutationObserver to watch for Vue dynamic rendering when user toggles "Details"
   */
  let scheduled = false;
  function requestScan() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      scanAndInject();
    });
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        requestScan();
        break;
      }
    }
  });

  // Start observing when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      scanAndInject();
      observer.observe(document.body, { childList: true, subtree: true });
    });
  } else {
    scanAndInject();
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // Also hook into clicks on details buttons for instant responsiveness
  document.addEventListener('click', (e) => {
    if (e.target.closest('.stationToStation-card__details-btn') || e.target.closest('.stationToStation-card__face')) {
      setTimeout(scanAndInject, 50);
      setTimeout(scanAndInject, 200);
    }
  });

})();

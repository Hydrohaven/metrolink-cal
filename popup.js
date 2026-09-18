document.addEventListener('DOMContentLoaded', () => {
  const statusBadge = document.getElementById('statusBadge');
  const statusText = statusBadge ? statusBadge.querySelector('.status-text') : null;

  // Check current active tab
  if (chrome.tabs && chrome.tabs.query) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0] && tabs[0].url) {
        const url = tabs[0].url;
        if (url.includes('metrolinktrains.com')) {
          if (statusText) statusText.textContent = 'Active on Metrolink';
        } else {
          if (statusText) statusText.textContent = 'Ready';
        }
      }
    });
  }

  const openBtn = document.getElementById('openSchedulesBtn');
  if (openBtn) {
    openBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetUrl = 'https://metrolinktrains.com/schedules/';
      if (chrome.tabs && chrome.tabs.create) {
        chrome.tabs.create({ url: targetUrl });
      } else {
        window.open(targetUrl, '_blank');
      }
    });
  }
});

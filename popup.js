document.addEventListener('DOMContentLoaded', () => {
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


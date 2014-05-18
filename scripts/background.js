chrome.alarms.create('refresh', {periodInMinutes: 1});
chrome.alarms.onAlarm.addListener(updateCount);

chrome.runtime.onInstalled.addListener(onInit);
chrome.runtime.onStartup.addListener(function() {
    updateCount();
});

updateCount();

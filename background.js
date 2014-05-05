chrome.alarms.create('refresh', {periodInMinutes: 1});
chrome.alarms.onAlarm.addListener(updateCount);

chrome.runtime.onInstalled.addListener(function() {
    localStorage.rbStatus = JSON.stringify({
        lastPopupTime: new Date()
    });
    updateCount();
});
chrome.runtime.onStartup.addListener(function() {
    updateCount();
});

function updateCount() {
    updateAll(function(responseText, from_to) {
        localStorage['rbCount_' + from_to] = JSON.parse(responseText).review_requests.length;

        var cnt = (localStorage.rbCount_from || 0)*1 + (localStorage.rbCount_to || 0)*1;
        chrome.browserAction.setBadgeText({
            text: cnt === 0 ? '' : (cnt+'')
        });
    });
}

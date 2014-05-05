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

updateCount();

function updateCount() {
    updateAll(function(responseText, from_to) {
        var requests = ReviewRequest.createFromJSON(responseText, from_to);
        ReviewRequest.mergeWithHistory(requests, from_to);
        localStorage['rbCount_' + from_to] = requests.filter(function(req) {
            return req.state === 'unread';
        }).length;

        ReviewRequest.updateBadgeCount();
    });
}

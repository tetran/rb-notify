chrome.alarms.create('refresh', {periodInMinutes: 1});
chrome.alarms.onAlarm.addListener(updateCount);

chrome.runtime.onInstalled.addListener(function() {
    localStorage.rbStatus = JSON.stringify({
        lastPopupTime: new Date(0)
    });
    updateCount();
});
chrome.runtime.onStartup.addListener(function() {
    updateCount();
});

updateCount();

function updateCount() {
    updateAll(function(responseText) {
        var requests = ReviewRequest.createFromJSON(responseText);
        ReviewRequest.mergeWithHistory(requests);
        localStorage['rbCount'] = requests.filter(function(req) {
            return req.state === 'unread';
        }).length;

        ReviewRequest.updateBadgeCount();
    });
}

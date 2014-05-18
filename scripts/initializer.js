function onInit() {
    localStorage.rbCount = 0;
    localStorage.requests = JSON.stringify([]);
    localStorage.rbStatus = JSON.stringify({
        lastPopupTime: new Date(0)
    });
    chrome.browserAction.setBadgeText({text: ''});

    updateCount();
}

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

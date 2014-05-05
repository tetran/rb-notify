chrome.browserAction.setBadgeText({text: ''});
updateAll(function(responseText, from_to) {
    var requests = JSON.parse(responseText).review_requests.map(function(req) {
        console.log(req);
        return new ReviewRequest(req, from_to);
    });

    console.log(requests);
    mergeWithHistory(requests, from_to);
    console.log(requests);

    ReviewRequest.storeInMemory(requests, from_to);
    ReviewRequest.storeInStorage(from_to);

    renderUnread(requests);
});

localStorage.rbStatus = JSON.stringify({
    lastPopupTime: new Date()
});


function mergeWithHistory(requests, from_to) {
    var storedRequests = JSON.parse(localStorage['requests_' + from_to] || '[]').map(function(req) {
        return new ReviewRequest(req);
    });

    requests.forEach(function(req) {
        storedRequests.forEach(function(sReq) {
            if (req.isSameRequestAs(sReq)) {
                req.merge(sReq);
                sReq.merged = true;
                return;
            }
        });
    });
    Array.prototype.push.apply(requests, storedRequests.filter(function(req) {
        return !req.merged;
    }));
    requests.sort(function(a,b) {
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
    });
}
function renderUnread(requests) {
    requests.filter(function(req) {
        return req.state === 'unread';
    }).forEach(function(req) {
        req.render();
    });
}

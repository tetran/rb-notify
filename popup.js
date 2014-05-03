updateAll(function(requests, from_to) {
    if (!requests) return;

    console.log(requests);
    mergeWithHistory(requests, from_to);
    console.log(requests);

    ReviewRequest.storeInMemory(requests, from_to);
    ReviewRequest.storeInStorage(from_to);

    renderAll(requests);
});

function mergeWithHistory(requests, from_to) {
    var storedRequests = JSON.parse(localStorage['requests_' + from_to] || '[]').map(function(req) {
        return new ReviewRequest(req);
    });
    requests.forEach(function(req) {
        storedRequests.forEach(function(sReq) {
            if (req.isSameRequestAs(sReq)) {
                req.merge(sReq);
                return;
            }
        });
    })
}
function renderAll(requests) {
    requests.filter(function(req) {
        return req.state === 'unread';
    }).forEach(function(req) {
        req.render();
    });
}

updateAll(function(responseText, from_to) {
    var requests = ReviewRequest.createFromJSON(responseText, from_to);

    console.log(requests);
    ReviewRequest.mergeWithHistory(requests, from_to);
    console.log(requests);

    ReviewRequest.storeInMemory(requests, from_to);
    ReviewRequest.storeInStorage(from_to);

    renderUnreads(requests);
});

function renderUnreads(requests) {
    requests.filter(function(req) {
        return req.state === 'unread';
    }).forEach(function(req) {
        req.render();
    });
}

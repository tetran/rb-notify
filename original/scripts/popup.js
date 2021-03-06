document.addEventListener('DOMContentLoaded', function() {
    updateAll(handleResponse);

    localStorage.rbStatus = JSON.stringify({
        lastPopupTime: new Date()
    });

    function handleResponse(responseText) {
        var requests = ReviewRequest.createFromJSON(responseText);

        console.log(requests);
        ReviewRequest.mergeWithHistory(requests);
        console.log(requests);

        ReviewRequest.storeInMemory(requests);
        ReviewRequest.storeInStorage();
        ReviewRequest.updateBadgeCount();

        document.querySelector('#review-requests').innerHTML = '';
        renderUnreads(requests);
    }

    function renderUnreads(requests) {
        requests.filter(function(req) {
            return req.state === 'unread';
        }).forEach(function(req) {
            req.render();
        });
    }
});

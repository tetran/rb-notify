var rbRule,
    baseUri,
    reqUri_reviewer,
    reqUri_reviewee,
    requestTimeout = 1000*2,
    fetchTimerId,
    container_reviewer = document.getElementById('reviewer'),
    container_reviewee = document.getElementById('reviewee'),
    listTemplate = document.getElementById('updates-template').innerHTML;

try {
    rbRule = JSON.parse(localStorage.rbRule);
    baseUri = rbRule.uri.replace(/(.*)\/$/, '$1');
    reqUri_reviewer = baseUri + '/api/review-requests/?to-users=' + rbRule.username;
    reqUri_reviewee = baseUri + '/api/review-requests/?from-user=' + rbRule.username;
} catch (ignore) {
}

function update(uri, container) {
    if (!rbRule) return;

    var xhr = new XMLHttpRequest();
    var abortTimerId = window.setTimeout(function() {
        xhr.abort();  // synchronously calls onreadystatechange
    }, requestTimeout);

    try {
        xhr.onreadystatechange = function() {
            if (xhr.readyState != 4) return;
            if (xhr.status == 200) {
                JSON.parse(xhr.responseText).review_requests.forEach(function(req) {
                    console.log(req);
                    var li = document.createElement('li');
                    li.className = 'review-requests--update';
                    li.setAttribute('data-review-url', req.url);
                    li.innerHTML = Mustache.render(listTemplate, {
                        summary: req.summary,
                        time: req.last_updated
                    });
                    li.onclick = function(){
                        var thisUrl = baseUri+req.url;
                        console.log(thisUrl);
                        chrome.tabs.getAllInWindow(undefined, function(tabs) {
                            for (var i = 0, len = tabs.length; i < len; i++) {
                                var tab = tabs[i];
                                if (tab.url && tab.url.indexOf(thisUrl) == 0) {
                                    chrome.tabs.update(tab.id, {selected: true});
                                    return;
                                }
                            }
                            // could not find review board tab.
                            chrome.tabs.create({url: thisUrl});
                        });
                    };
                    container.appendChild(li);
                });
            }
            window.clearTimeout(abortTimerId);
        };

        xhr.open('GET', uri, true);
        xhr.send(null);
    } catch (e) {

    }
}
function clear() {
    container_reviewer.innerHTML = '';
    container_reviewee.innerHTML = '';
}
function updateAsReviewer() {
    update(reqUri_reviewer, container_reviewer);
}
function updateAsReviewee() {
    update(reqUri_reviewee, container_reviewee);
}
function updateAll() {
    clear();
    updateAsReviewer();
    updateAsReviewee();
}

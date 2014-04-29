var rbRule,
    baseurl,
    url_reviewer,
    url_reviewee,
    requestTimeout = 1000*2,
    fetchTimerId,
    container_reviewer = document.getElementById('reviewer'),
    container_reviewee = document.getElementById('reviewee'),
    listTemplate = document.getElementById('updates-template').innerHTML,
    lastUpdatedDate = new Date();

try {
    rbRule = JSON.parse(localStorage.rbRule);
    baseurl = rbRule.url.replace(/(.*)\/$/, '$1');
    url_reviewer = baseurl + '/api/review-requests/?to-users=' + rbRule.username;
    url_reviewee = baseurl + '/api/review-requests/?from-user=' + rbRule.username;
} catch (ignore) {
}

function update(url, container) {
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
                    var storageKey = url + '-' + req.id + '-' + req.last_updated;
                    if (localStorage[storageKey] === 'watched') {
                        return;
                    }
                    localStorage[storageKey] = 'fetched';

                    var li = document.createElement('li');
                    li.className = 'review-requests--update';
                    li.setAttribute('data-review-url', req.url);
                    li.innerHTML = Mustache.render(listTemplate, {
                        summary: req.summary,
                        time: req.last_updated
                    });
                    li.addEventListener('click', function() {
                        this.classList.add('fade-out');
                        localStorage[storageKey] = 'watched';
                        var thisUrl = baseurl+req.url,
                            self = this;
                        setTimeout(function() {
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
                            self.parentNode.removeChild(self);
                        }, 400);
                    }, false);
                    container.appendChild(li);
                });
            }
            window.clearTimeout(abortTimerId);
        };
        xhr.open('GET', url + '&last-updated-from=' + lastUpdated(), true);
        xhr.send(null);
    } catch (e) {
        console.log(e);
    }
}
function clear() {
    container_reviewer.innerHTML = '';
    container_reviewee.innerHTML = '';
}
function updateAsReviewer() {
    update(url_reviewer, container_reviewer);
}
function updateAsReviewee() {
    update(url_reviewee, container_reviewee);
}
function updateDate() {
    lastUpdatedDate = new Date();
}
function updateAll() {
    // clear();
    updateAsReviewer();
    updateAsReviewee();
    updateDate();
}
function lastUpdated() {
    return (function(date) {
        function padZero(val) {
            return ('0' + val).slice(-2);
        }
        return date.getFullYear() + '-' +
            padZero(date.getMonth() + 1) + '-' +
            padZero(date.getDate()) + 'T' +
            padZero(date.getHours()) + ':' +
            padZero(date.getMinutes());
    })(lastUpdatedDate);
}

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
/*
 * TODO
 */
var storedHtml_reviewer = localStorage.rbList_to;
if (storedHtml_reviewer) {
    localStorage.rbList_to = '';
    container_reviewer.innerHTML = storedHtml_reviewer;
    var elems = document.querySelectorAll('#reviewer .review-requests--update');
    for (var i = 0, li; i < elems.length; i++) {
        li = elems[i];
        console.log(li);
        addClickEvent(li, li.getAttribute('data-storage-key'));
    }
}

/*
 * TODO
 */
var storedHtml_reviewee = localStorage.rbList_from;
if (storedHtml_reviewee) {
    localStorage.rbList_from = '';
    container_reviewee.innerHTML = storedHtml_reviewee;
    var elems = document.querySelectorAll('#reviewee .review-requests--update');
    for (var i = 0, li; i < elems.length; i++) {
        li = elems[i];
        console.log(li);
        addClickEvent(li, li.getAttribute('data-storage-key'));
    }
}

function addClickEvent(li, storageKey) {
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
}

function update(url, container, type) {
    if (!rbRule) return;

    var xhr = new XMLHttpRequest();
    var abortTimerId = window.setTimeout(function() {
        xhr.abort();  // synchronously calls onreadystatechange
    }, requestTimeout);

    try {
        xhr.onreadystatechange = function() {
            if (xhr.readyState != 4) return;
            if (xhr.status == 200) {
                var allHtml = '';
                JSON.parse(xhr.responseText).review_requests.forEach(function(req) {
                    console.log(req);
                    var storageKey = type + '-' + req.id + '-' + req.last_updated;
                    if (localStorage[storageKey] === 'fetched') {
                        return;
                    }
                    localStorage[storageKey] = 'fetched';

                    var li = document.createElement('li');
                    li.className = 'review-requests--update';
                    li.setAttribute('data-storage-key', storageKey);
                    li.innerHTML = Mustache.render(listTemplate, {
                        summary: req.summary,
                        time: req.last_updated
                    });
                    addClickEvent(li, storageKey);
                    container.appendChild(li);
                    allHtml += li.outerHTML;
                });
                localStorage['rbList_' + type] = allHtml;
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
    update(url_reviewer, container_reviewer, 'to');
}
function updateAsReviewee() {
    update(url_reviewee, container_reviewee, 'from');
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

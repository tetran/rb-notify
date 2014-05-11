(function(window) {
    function ReviewRequest(data) {
        this.id = data.id;
        this.summary = data.summary;
        this.lastUpdated = data.last_updated;
        this.state = data.state || 'unread';
        this.key = this.id;

        // for view
        if (document.querySelector('#review-requests')) {
            this.container = document.querySelector('#review-requests');
            this.listTemplate = document.querySelector('#updates-template').innerHTML;
            this.el = document.createElement('li');
        }
    }

    ReviewRequest.prototype.toData = function() {
        return {
            id: this.id,
            summary: this.summary,
            last_updated: this.lastUpdated,
            state: this.state,
            key: this.key
        };
    };

    ReviewRequest.prototype.merge = function(another_older) {
        if (this.lastUpdated === another_older.lastUpdated) {
            this.state = another_older.state;
        }
    };

    ReviewRequest.prototype.isSameRequestAs = function(another) {
        return this.key === another.key;
    };

    ReviewRequest.prototype.render = function() {
        this.el.className = 'review-requests--update';
        this.el.innerHTML = Mustache.render(this.listTemplate, {
            summary: this.summary,
            time: formatDate(this.lastUpdated)
        });
        addClickEvent(this);
        this.container.appendChild(this.el);

        function addClickEvent(request) {
            var el = request.el,
                check = el.getElementsByClassName('control-check')[0],
                forward = el.getElementsByClassName('control-forward')[0],
                url = '/r/' + request.id,
                markAsRead = function() {
                    el.classList.add('fade-out');
                    request.state = 'read';
                    ReviewRequest.storeInStorage();
                    ReviewRequest.updateBadgeCount();
                    setTimeout(function() {
                        el.parentNode.removeChild(el);
                    }, 400);
                };
            
            forward.addEventListener('click', function() {
                markAsRead();
                chrome.tabs.getAllInWindow(undefined, function(tabs) {
                    var thisUrl = baseurl+url;
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
                
            }, false);
            
            check.addEventListener('click', markAsRead, false);
        }
    };

    function formatDate(dateString) {
        var date = new Date(dateString);
        function padZero(val) {
            return ('0' + val).slice(-2);
        }
        return date.getFullYear() + '-' +
            padZero(date.getMonth()+1) + '-' +
            padZero(date.getDate()) + '&nbsp;&nbsp;' +
            padZero(date.getHours()) + ':' +
            padZero(date.getMinutes()) + ':' +
            padZero(date.getSeconds());
    }

    // meta functions
    ReviewRequest.requests = [];
    ReviewRequest.storeInMemory = function(requests) {
        ReviewRequest.requests = requests;
    };
    ReviewRequest.storeInStorage = function() {
        var requests = ReviewRequest.requests,
            unreads = requests.filter(function(req) {
                return req.state === 'unread';
            });
        localStorage.requests = JSON.stringify(requests.map(function(req) {
            return req.toData();
        }));
        localStorage.rbCount = unreads.length;
    };
    ReviewRequest.createFromJSON = function(json) {
        var reqs = JSON.parse(json).review_requests;
        console.log(reqs);
        return reqs.map(function(req) {
            return new ReviewRequest(req);
        });
    };
    ReviewRequest.mergeWithHistory = function(requests) {
        var storedRequests = JSON.parse(localStorage.requests || '[]').map(function(req) {
            return new ReviewRequest(req);
        });

        requests.forEach(function(req) {
            storedRequests.forEach(function(sReq) {
                if (req.isSameRequestAs(sReq)) {
                    req.merge(sReq);
                    sReq.merged = true;
                    console.log('merged');
                    console.log(req);
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
    ReviewRequest.updateBadgeCount = function() {
        var cnt = (localStorage.rbCount || 0)*1;
        chrome.browserAction.setBadgeText({
            text: cnt === 0 ? '' : (cnt+'')
        });
    };

    window.ReviewRequest = ReviewRequest;
})(window);

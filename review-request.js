(function(window) {
    function ReviewRequest(data, from_to) {
        this.id = data.id;
        this.summary = data.summary;
        this.lastUpdated = data.last_updated;
        this.from_to = data.from_to || from_to;    // 'from' or 'to'. 'from' means you're a reviewee, and 'to' reviewer
        this.state = data.state || 'unread';
        this.key = this.id + '-' + this.from_to;

        // for view
        if (document.querySelector('#review-requests')) {
            this.container = document.querySelector('#review_' + this.from_to + '_you');
            this.listTemplate = document.querySelector('#updates-template').innerHTML;
            this.el = document.createElement('li');
        }
    }

    ReviewRequest.prototype.toData = function() {
        return {
            id: this.id,
            summary: this.summary,
            last_updated: this.lastUpdated,
            from_to: this.from_to,
            state: this.state,
            key: this.key
        };
    };

    ReviewRequest.prototype.merge = function(another) {
        if (this.lastUpdated === another.lastUpdated) {
            this.state = another.state;
        }
        this.lastUpdated = another.lastUpdated;
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
                url = '/r/' + request.id;
            el.addEventListener('click', function() {
                var thisUrl = baseurl+url,
                    self = this;
                this.classList.add('fade-out');
                request.state = 'read';
                ReviewRequest.storeInStorage(request.from_to);
                ReviewRequest.updateBadgeCount();

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
    ReviewRequest.from = [];
    ReviewRequest.to = [];
    ReviewRequest.storeInMemory = function(requests, from_to) {
        ReviewRequest[from_to] = requests;
    };
    ReviewRequest.storeInStorage = function(from_to) {
        var requests = ReviewRequest[from_to],
            unreads = requests.filter(function(req) {
                return req.state === 'unread';
            });
        localStorage['requests_' + from_to] = JSON.stringify(requests.map(function(req) {
            return req.toData();
        }));
        localStorage['rbCount_' + from_to] = unreads.length;
    };
    ReviewRequest.createFromJSON = function(json, from_to) {
        return JSON.parse(json).review_requests.map(function(req) {
            return new ReviewRequest(req, from_to);
        });
    };
    ReviewRequest.mergeWithHistory = function(requests, from_to) {
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
    ReviewRequest.updateBadgeCount = function() {
        var cnt = (localStorage.rbCount_from || 0)*1 + (localStorage.rbCount_to || 0)*1;
        chrome.browserAction.setBadgeText({
            text: cnt === 0 ? '' : (cnt+'')
        });
    };

    window.ReviewRequest = ReviewRequest;
})(window);

var rbRule,
    baseurl,
    url_reviewer,
    url_reviewee,
    requestTimeout = 1000*5;

function initParams() {
    try {
        rbRule = JSON.parse(localStorage.rbRule);
        baseurl = rbRule.url.replace(/(.*)\/$/, '$1');    // remove '/'(slash) at the end of url
        url_reviewer = baseurl + '/api/review-requests/?to-users=' + rbRule.username;
        url_reviewee = baseurl + '/api/review-requests/?from-user=' + rbRule.username;
    } catch (e) {
        console.log(e);
    }
}

function update(url, onSuccess) {
    if (!url) return;

    var xhr = new XMLHttpRequest();
    var abortTimerId = window.setTimeout(function() {
        xhr.abort();  // synchronously calls onreadystatechange
    }, requestTimeout);

    function handleSuccess(responseText) {
        window.clearTimeout(abortTimerId);
        if (responseText && onSuccess) {
            onSuccess(responseText);
        }
    }

    try {
        xhr.onreadystatechange = function() {
            if (xhr.readyState != 4) return;
            if (xhr.status == 200) {
                handleSuccess(xhr.responseText);
            }
        };
        xhr.open('GET', url + '&last-updated-from=' + lastUpdated(), true);
        xhr.send(null);
    } catch (e) {
        console.log(e);
    }
}

function updateAll(callback) {
    initParams();
    update(url_reviewer, callback);
    update(url_reviewee, callback);
}
function lastUpdated() {
    var date = new Date(JSON.parse(localStorage.rbStatus).lastPopupTime || new Date());
    return (function(date) {
        function padZero(val) {
            return ('0' + val).slice(-2);
        }
        return date.getFullYear() + '-' +
            padZero(date.getMonth()+1) + '-' +
            padZero(date.getDate()) + 'T' +
            padZero(date.getHours()) + ':' +
            padZero(date.getMinutes()-5) + ':' +    // -5 -> work around to handle time lag between server and client
            padZero(date.getSeconds());
    })(date);
}

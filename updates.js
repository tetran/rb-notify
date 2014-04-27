var rbRule,
    req_uri,
    requestTimeout = 1000*2;

try {
    rbRule = JSON.parse(localStorage.rbRule);
    req_uri = rbRule.uri + '/api/review-requests/?to-users=' + rbRule.username
} catch (ignore) {
}

function fetch() {
    console.log(req_uri)
    if (!rbRule) return;

    var xhr = new XMLHttpRequest();
    var abortTimerId = window.setTimeout(function() {
        xhr.abort();  // synchronously calls onreadystatechange
    }, requestTimeout);

    try {
        xhr.onreadystatechange = function() {
            if (xhr.readyState != 4) return;
            if (xhr.status == 200) {
                var json = xhr.responseText;
                console.log(json);
            }
            window.clearTimeout(abortTimerId);
        };

        xhr.open('GET', req_uri, true);
        xhr.send(null);
    } catch (e) {

    }
}

// for development
document.getElementById('fetch').onclick = fetch;

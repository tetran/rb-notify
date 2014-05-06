var rbRule;

function storeRule() {
    localStorage.rbRule = JSON.stringify({
        url: document.getElementById('rb-uri').value,
        username: document.getElementById('rb-username').value
        // password: document.getElementById('rb-password').value
    });
}

function loadStoredRule() {
    var storedRule = localStorage.rbRule;
    try {
        rbRule = JSON.parse(storedRule);
        setFieldValue('rb-uri', rbRule.url);
        setFieldValue('rb-username', rbRule.username);
        // setFieldValue('rb-password', rbRule.password);
    } catch (e) {
        rbRule = {};
        localStorage.rbRule = JSON.stringify(rbRule);
    }
}

function setFieldValue(elem_id, value) {
    document.getElementById(elem_id).value = value || '';
}

document.addEventListener('DOMContentLoaded', function() {
    loadStoredRule();
    document.getElementById('rb-register-btn').onclick = function() {
        storeRule();

        document.querySelector('#note').classList.add('animate');
        setTimeout(function() {
            document.querySelector('#note').classList.remove('animate');
            onInit();
        }, 2000);
    };
});

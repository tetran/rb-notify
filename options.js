var rbRule;

function storeRule(rule) {
    localStorage.rbRule = JSON.stringify({
        uri: document.getElementById('rb-uri').value,
        username: document.getElementById('rb-username').value,
        password: document.getElementById('rb-password').value
    });
}

function loadStoredRule() {
    var storedRule = localStorage.rbRule;
    try {
        rbRule = JSON.parse(storedRule);
        setFieldValue('rb-uri', rbRule.uri);
        setFieldValue('rb-username', rbRule.username);
        setFieldValue('rb-password', rbRule.password);
    } catch (e) {
        rbRule = {};
        localStorage.rbRule = JSON.stringify(rbRule);
    }
}

function setFieldValue(elem_id, value) {
    document.getElementById(elem_id).value = value || '';
}

function testAccount() {
    
}

window.onload = function() {
    loadStoredRule();
    document.getElementById('rb-register').onclick = function() {
        storeRule(rbRule || {});
    };
};

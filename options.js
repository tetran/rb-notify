var rbRule,
    registerBtn;

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
    registerBtn = document.querySelector('#rb-register-btn')
    registerBtn.addEventListener('click', handleRegister, false);
});

function handleRegister() {
    registerBtn.removeEventListener('click', handleRegister);
    var note = document.querySelector('#note');
    storeRule();
    note.classList.add('animate');
    setTimeout(function() {
        onInit();
        note.classList.remove('animate');
        registerBtn.addEventListener('click', handleRegister, false);
    }, 2000);
}

// Initialize variables
var $window = $(window);
var $userInput = $('.user-input'); // Input for username
var $messInput = $('.mess-input'); // Input for message
var $messages = $('.messages'); // Messages area
var $loginPage = $('.login-page'); // The login page
var $chatPage = $('.chat-page'); // The chat page

// Prompt for setting a username
var username;
var code;
var connected = false;
var $currentInput = $userInput.focus();

var socket = io();

// Functions

function setUsername() {
    username = $userInput.val().trim();

    // If the username is valid
    if (username) {
        connected = true;
        $loginPage.fadeOut();
        $chatPage.show();
        $currentInput = $messInput.focus();

        // Tell the server your username
        code = new Date().getUTCMilliseconds();
        socket.emit('make code', code);
    }
}

function sendMessage() {
    var message = $messInput.val();
    if (message) {
        $messInput.val('');
        socket.emit('make color', {
            user: username,
            code: code,
            mess: message
        });
    }
}

function printMessage(data) {
    if (!data.color) data.color = 'black';
    var userSpan = $('<span>').addClass('username')
        .css('color', data.color).text(data.user);
    var messSpan = $('<span>').addClass('message').text(data.mess);
    var messLine = $('<li>').addClass('message-line').append(userSpan).append(messSpan);
    $messages.append(messLine);

    $messages[0].scrollTop = $messages[0].scrollHeight;
}

// Keyboard events

$window.keydown((event) => {
    // Auto-focus the current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
        $currentInput.focus();
    }

    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
        if (username) {
            sendMessage();
        } else {
            setUsername();
        }
    }
});

// Click events

// Focus input when clicking anywhere on login page
$loginPage.click(function () {
    $currentInput.focus();
});

// Socket events

socket.on('print message', (data) => {
    if (connected) printMessage(data);
})
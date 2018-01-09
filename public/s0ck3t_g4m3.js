jQuery(function () {
    var socket = io();
    showLoader();
    socket.emit('start');

    // start
    socket.on('start', function (data) {
        in_game = false;
        jQuery('#type').val(data ? 'join' : 'create');
        jQuery('#game').val(data ? 'ENTRA' : 'CREA');
        loadPage("#splash");
    });

    // game_locked
    socket.on('locked_game', function (data) {
        loadPage("#locked");
    });

    // request
    jQuery('#game').on('click', function () {
        var nickname = jQuery('#nickname').val();
        if (!nickname) {
            showMessage('Nome obbligatorio!', 'bg-error');
        } else {
            showLoader();
            socket.emit(jQuery('#type').val() + '_game', nickname);
        }
        return false;
    });
    
    // stop game
    jQuery('#stop').on('click', function() {
        var nickname = jQuery('#nickname').val();
        socket.emit('stop', nickname);
    });

    // create game
    socket.on('create_game', function (data) {
        console.log("» create_game [" + data + "]");
        jQuery('#type').val('join');
        jQuery('#game').val('ENTRA');
        loadPage("#splash");
    });

    // nickname already in use
    socket.on('already_in_game', function (data) {
        console.log("» already in game");
        showMessage('Utente [' + data + '] gi&agrave; utilizzato!', 'bg-error');
    });

    // join game
    socket.on('join_game', function (data) {
        console.log("» join_game");
        var nickname = jQuery('#nickname').val();
        jQuery('#players').empty();
        jQuery.each(data, function (i, e) {
            jQuery('#players').append(
                    jQuery('<li></li>').addClass((e === nickname)
                    ? 'bg-success' : '').text(e));
        });
        in_game = true;
        loadPage("#lobby");
        showLoader();
    });

    // refresh lobby
    socket.on('refresh_game', function (data) {
        if (in_game) {
            console.log("» refresh_game");
            var nickname = jQuery('#nickname').val();
            jQuery('#players').empty();
            jQuery.each(data, function (i, e) {
                jQuery('#players').append(
                        jQuery('<li></li>').addClass((e === nickname)
                        ? 'bg-success' : '').text(e));
            });
        }
    });

    // start game
    socket.on('start_game', function (data) {
        console.log("» start_game");
        var nickname = jQuery('#nickname').val();
        jQuery('#master').text(data.master);
        jQuery.each(data.players, function (i, e) {
            jQuery('#foe').append(
                    jQuery('<li></li>').addClass((e === nickname)
                    ? 'bg-success' : '').text(e));
        });
        console.debug("» data » " + data);
        if (data.ismaster) {
            jQuery('#stop').show();
        }
        loadPage("#board");
    });

    // end game
    socket.on('end_game', function (data) {
        console.log("» end_game");
        showLoader();
        socket.emit('start');
        showMessage('Numero minimo di partecipanti ['
                + data + '] non raggiunto!', 'bg-warning');
    });
    
    // stop game
    socket.on('stop_game', function (data) {
        console.log("» stop_game");
        showLoader();
        socket.emit('start');
        showMessage('Partita terminata!', 'bg-success');
    });

});

var in_game = false;

// show loader
function showLoader() {
    $("#progress").removeClass("hidden");
}

// hide loader
function loadPage(page) {
    $("#progress").addClass("hidden");
    $(".app-panel").addClass("hidden");
    $(page).removeClass("hidden");
}

// show alert message
function showMessage(msg, status) {
    $("#message").html(msg).removeClass("hidden").addClass(status);
    setTimeout(hideMessage, 6000);
}

// hide alert message
function hideMessage() {
    $("#message").html("").removeClass().addClass("alert hidden");
}
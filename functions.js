function FireTotalPlayers(totalPlayers, socket) {
    socket.emit('UPDATE_TOTAL_PLAYER', totalPlayers);
}

function syncMove(socket, state, turn){
    socket.emit('SNYC_MOVE', state, turn);
}

module.exports = {
    FireTotalPlayers,
    syncMove
}
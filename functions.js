function FireTotalPlayers(totalPlayers, socket) {
    socket.emit('UPDATE_TOTAL_PLAYER', totalPlayers);
}

module.exports = {
    FireTotalPlayers
}
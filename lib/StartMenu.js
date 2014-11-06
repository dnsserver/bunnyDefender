BunnyDefender.StartMenu = function (game) {
    this.startBG = null;
    this.startPrompt = null;
};

BunnyDefender.StartMenu.prototype = {
    create: function () {
        this.startBG = this.add.image(0, 0, 'titlescreen');
        this.startBG.inputEnabled = true;
        this.startBG.events.onInputDown.addOnce(this.startGame, this);

        this.startPrompt = this.add.bitmapText(this.world.centerX - 155, this.world.centerY + 180, 'eightbitwonder', 'Touch to Start!', 24);
    },

    startGame: function (pointer) {
        this.state.start('Game');
    }
};

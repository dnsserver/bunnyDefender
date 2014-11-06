BunnyDefender.StartMenu = function (game) {
    this.startBG = null;
    this.startPrompt = null;
    this.ding = null;
};

BunnyDefender.StartMenu.prototype = {
    create: function () {

        this.ding = this.add.audio('select_audio');

        this.startBG = this.add.image(0, 0, 'titlescreen');
        this.startBG.inputEnabled = true;
        this.startBG.events.onInputDown.addOnce(this.startGame, this);

        this.startPrompt = this.add.bitmapText(this.world.centerX - 155, this.world.centerY + 180, 'eightbitwonder', 'Touch to Start!', 24);
    },

    startGame: function (pointer) {
        this.ding.play();
        this.state.start('Game');
    }
};

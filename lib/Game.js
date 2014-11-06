BunnyDefender.Game = function (game) {
    this.totalBunnies = null;
    this.bunnyGroup = null;
    this.totalSpacerocks = null;
    this.spacerockgroup = null;
    this.burst = null;
    this.gameover = null;
    this.countdown = null;

    this.overmessage  = null;
    this.secondsElapsed = null;
    this.timer = null;

    this.music = null;
    this.ouch = null;
    this.boom  = null;
    this.ding = null;
};

BunnyDefender.Game.prototype = {
    create: function () {
        this.totalBunnies = 20;
        this.totalSpacerocks = 13;
        this.gameover = false;
        this.secondsElapsed = 0;
        this.timer = this.time.create(false);
        this.timer.loop(1000, this.updateSeconds, this);

        this.music = this.add.audio('game_audio');
        this.music.play('', 0, 0.3, true);

        this.ouch = this.add.audio('hurt_audio');
        this.boom = this.add.audio('explosion_audio');
        this.ding = this.add.audio('select_audio');


        this.buildWorld ();
    },

    updateSeconds: function () {
        this.secondsElapsed ++;
    },

    buildWorld: function () {
        this.add.image(0, 0, 'sky');
        this.add.image(0, 800, 'hill');

        this.buildBunnies();
        this.buildSpaceRocks();
        this.buildEmitter();
        this.countdown = this.add.bitmapText(10, 10, 'eightbitwonder', 'Bunnies Left ' + this.totalBunnies, 20);

        this.timer.start();
    },

    buildBunnies: function (){
        this.bunnygroup = this.add.group();
        this.bunnygroup.enableBody = true;
        for(var i=0; i< this.totalBunnies; i++){
            var b = this.bunnygroup.create(
                this.rnd.integerInRange(-10,this.world.width-50),
                this.rnd.integerInRange(this.world.height-100, this.world.height - 60),
                'bunny', 'Bunny0000');
            b.anchor.setTo(0.5,0.5);
            b.body.moves = false;
            b.animations.add('Rest', this.game.math.numberArray(1,58));
            b.animations.add('Walk', this.game.math.numberArray(68,107));
            b.animations.play('Rest', 24, true);

            this.assignBunnyMovement(b);
        }
    },

    assignBunnyMovement: function (b) {
        var bposition = Math.floor(this.rnd.realInRange(50,this.world.width-50));
        var bdelay = this.rnd.integerInRange(2000,6000);
        if(bposition < b.x){
            b.scale.x = 1;
        }else{
            b.scale.x = -1;
        }

        t = this.add.tween(b).to({x:bposition}, 3500, Phaser.Easing.Quadratic.InOut, true, bdelay);
        t.onStart.add(this.startBunny, this);
        t.onComplete.add(this.stopBunny, this);
    },

    startBunny: function (b) {
        b.animations.stop('Rest');
        b.animations.play('Walk', 24, true);
    },

    stopBunny: function (b) {
        b.animations.stop('Walk');
        b.animations.play('Rest', 24, true);
        this.assignBunnyMovement(b);
    },

    buildSpaceRocks: function () {
        this.spacerockgroup = this.add.group();
        for(var i = 0; i < this.totalSpacerocks; i++){
            var initp = this.initParams();
            var r = this.spacerockgroup.create(initp.x,initp.y, 'spacerock', 'SpaceRock0000');
            var scale = this.rnd.realInRange(0.3,1.0);
            r.scale.x = scale;
            r.scale.y = scale;
            this.physics.enable(r, Phaser.Physics.ARCADE);
            r.enableBody = true;
            r.body.velocity.y = initp.v_y;
            r.animations.add('Fall');
            r.animations.play('Fall', 24, true);

            r.checkWorldBounds = true;
            r.events.onOutOfBounds.add(this.resetRock, this);
        }
    },

    resetRock: function (r) {
        if(r.y > this.world.height){
            this.respawnRock(r);
        }
    },

    initParams: function (){
        var a = {};
        a.x = this.rnd.integerInRange(0,this.world.width);
        a.y = this.rnd.realInRange(-1500, 0);
        a.v_y = this.rnd.integerInRange(200, 400);
        return a;
    },

    respawnRock: function (r) {
        if(this.gameover==false){
            var initp = this.initParams();
            r.reset(initp.x,initp.y);
            r.body.velocity.y = initp.v_y;
        }
    },

    buildEmitter: function () {
        this.burst = this.add.emitter(0,0,80);
        this.burst.minParticleScale = 0.3;
        this.burst.maxParticleScale = 1.2;
        this.burst.minParticleSpeed.setTo(-30,30);
        this.burst.maxParticleSpeed.setTo(30, -30);
        this.burst.makeParticles('explosion');
        this.input.onDown.add(this.fireBurst, this);
    },

    fireBurst: function (pointer) {
        if(this.gameover==false){
            this.boom.play();
            this.boom.volume = 0.2;

            this.burst.emitX = pointer.x;
            this.burst.emitY = pointer.y;
            this.burst.start(true, 2000, null, 20);
        }
    },

    burstCollision: function (r, b){
        this.respawnRock(r);
    },

    bunnyCollision: function (r, b){
        if(b.exists){
            this.ouch.play();
            this.respawnRock(r);
            this.makeGhost(b);
            b.kill();
            this.totalBunnies --;
            this.checkBunniesLeft();
        }
    },

    checkBunniesLeft: function () {
        if(this.totalBunnies <= 0){
            this.gameover = true;
            this.music.stop();
            this.countdown.setText('Bunnies Left 0');
            this.overmessage = this.add.bitmapText(this.world.centerX - 180,
                                                   this.world.centerY - 40,
                                                   'eightbitwonder',
                                                   'GAMEOVER\n\n' + this.secondsElapsed, 42);
            this.overmessage.align = 'center';
            this.overmessage.inputEnabled = true;
            this.overmessage.events.onInputDown.addOnce(this.quitGame, this);
        }else{
            this.countdown.setText('Bunnies Left ' + this.totalBunnies);
        }
    },

    quitGame: function (pointer) {
        this.ding.play();
        this.state.start('StartMenu');
    },

    friendlyFire: function(b, e){
        if(b.exists){
            this.ouch.play();
            this.makeGhost(b);
            b.kill();
            this.totalBunnies --;
            this.checkBunniesLeft();
        }
    },

    makeGhost: function (b) {
        var bunnyghost = this.add.sprite(b.x - 20, b.y - 180, 'ghost');
        bunnyghost.anchor.setTo(0.5,0.5);
        bunnyghost.scale.x = b.scale.x;
        this.physics.enable(bunnyghost, Phaser.Physics.ARCADE);
        bunnyghost.enableBody = true;
        bunnyghost.checkWorldBounds = true;
        bunnyghost.body.velocity.y = -800;
    },

    update: function () {
        this.physics.arcade.overlap(this.spacerockgroup, this.burst, this.burstCollision, null, this);
        this.physics.arcade.overlap(this.spacerockgroup, this.bunnygroup, this.bunnyCollision, null, this);
        this.physics.arcade.overlap(this.bunnygroup, this.burst, this.friendlyFire, null, this);
    }
};

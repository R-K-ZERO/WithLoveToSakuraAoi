const DISPLAY_WIDTH = 1280;
const DISPLAY_HEIGHT = 720;
const COUNT_DOUN_SPAN = 60;
const PLAY_TIME = 60;

var text_count1, text_count2, text_count3;
 

class SharedData {
    playerHeartCount;
    kagoHeartCount;
    chamgeKagoImg;
    timeCount;
    timeCountDown;
}

class StartScene extends Phaser.Scene {

    constructor() {
        super({ key: 'StartScene' });
    }

    preload() {
        SharedData.playerHeartCount = 0;
        SharedData.kagoHeartCount = 1;
        SharedData.chamgeKagoImg = true;
        SharedData.timeCount = 0;
        SharedData.timeCountDown = PLAY_TIME;

        this.load.image('background_title', 'assets/background_title.png');
        this.load.image('title', 'assets/title.png');
    }

    create() {
        this.add.image(DISPLAY_WIDTH/2, DISPLAY_HEIGHT/2, 'background_title');
        this.add.image(DISPLAY_WIDTH/2, DISPLAY_HEIGHT/2-100, 'title');

        let command_text = this.add.text(DISPLAY_WIDTH/2, DISPLAY_HEIGHT/2+280, 'PLESS SPACE', {color: "#000", fontSize: 64, fontFamily: "Arial"}).setOrigin(0.5);
        this.input.keyboard.on('keydown-SPACE', function () {
            this.scene.start('GameScene');
        }, this);
    }
}
 
class GameScene extends Phaser.Scene {

    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {

        this.load.spritesheet('hanabira','assets/hanabira.png',
            { frameWidth: 64, frameHeight: 64 }
        );
        this.load.image('background', 'assets/background.png');
        this.load.image('heart', 'assets/heart.png');
        this.load.image('bigHeart', 'assets/big_heart.png');
        this.load.spritesheet('kago','assets/kago.png',
            { frameWidth: 128, frameHeight: 128 }
        );

    }

    create() {
        // 背景
        this.add.image(DISPLAY_WIDTH/2, DISPLAY_HEIGHT/2, 'background');

        text_count1 = this.add.text(40, 10, '', {color: "#000", fontSize: 30, fontFamily: "Arial"})
        text_count2 = this.add.text(40, 50, '', {color: "#000", fontSize: 30, fontFamily: "Arial"});
        text_count3 = this.add.text(DISPLAY_WIDTH-100, 10, '', {color: "#000", fontSize: 30, fontFamily: "Arial"});


        // 巨大ハート
        this.bigHeart = this.add.image(300, DISPLAY_HEIGHT-220, 'bigHeart');
        this.physics.add.existing(this.bigHeart, true);

        // かご
        this.kago = this.add.sprite(DISPLAY_WIDTH-64, DISPLAY_HEIGHT-64, 'kago', 0);
        this.physics.add.existing(this.kago, true);

        this.anims.create({
            key: 'kago_fill',
            frames: this.anims.generateFrameNumbers('kago',
                { start: 0, end: 1 }),
            frameRate: 5,
            repeat: 0
        });
        
        // プレイヤー
        this.player = this.add.sprite(96,DISPLAY_HEIGHT-32, 'hanabira',2);
        this.physics.add.existing(this.player, false);
        this.player.body.setCollideWorldBounds(true);

        this.anims.create({
            key: 'move_left',
            frames: this.anims.generateFrameNumbers('hanabira',
            { start: 0, end: 1 }),
            frameRate: 5,
            repeat: 0
        });
        this.anims.create({
            key: 'move_right',
            frames: this.anims.generateFrameNumbers('hanabira',
            { start: 2, end: 3 }),
            frameRate: 5,
            repeat: 0
        });
        this.anims.create({
            key: 'jump',
            frames: this.anims.generateFrameNumbers('hanabira',
                { frames: [ 4, 5, 4, 2 ] }),
            frameRate: 15,
            repeat: 0
        });

        // HeartGroupの作成
        this.heartGroup = this.physics.add.group({
            bounceY: 0.8,
            bounceX: 0.8,
            collideWorldBounds: true
        });
        
        // 衝突判定
        this.physics.add.collider(this.player, this.bigHeart, this.popHeart, null, this);
        this.physics.add.collider(this.player, this.heartGroup, this.getHeart, null, this);
        this.physics.add.collider(this.player, this.kago, this.moveHeart, null, this);
        this.physics.add.collider(this.kago, this.heartGroup, this.heartIntoKago, null, this);

        this.cursors = this.input.keyboard.createCursorKeys();
    }

    createHearts(x, y) {
        // グループにオブジェクトを追加
        const heart = this.heartGroup.create(x, y, 'heart');
        
        // 初期速度の設定
        const velocityX = Phaser.Math.Between(-200, 500);
        const velocityY = -500;
        heart.setVelocity(velocityX, velocityY);

        return heart;
    }

    popHeart() {
        this.createHearts(300, DISPLAY_HEIGHT-270);
    }

    getHeart(player, heart) {
        SharedData.playerHeartCount += 1;
        // グループからオブジェクトを削除
        heart.destroy();
    }

    moveHeart() {
        SharedData.kagoHeartCount = SharedData.kagoHeartCount + SharedData.playerHeartCount;
        SharedData.playerHeartCount = 0;
    }

    heartIntoKago(kago, heart){
        SharedData.kagoHeartCount += 1;
        // グループからオブジェクトを削除
        heart.destroy();
    }

    update() {
        text_count1.setText("×" + SharedData.playerHeartCount);
        text_count2.setText("×" + SharedData.kagoHeartCount);
        text_count3.setText(SharedData.timeCountDown);
        
        //👇↑キーが押されたら、上に移動
        if (this.cursors.up.isDown && (this.player.body.touching.down || this.player.body.blocked.down) ) {
            this.player.anims.play('jump',false);
            this.player.body.setVelocityY(-305);
        }
        //👇↓キーが押されたら、下に移動
        else if (this.cursors.down.isDown) {
            this.player.body.setVelocityY(300);
        }

        //👇←キーが押されたら、左に移動
        if (this.cursors.left.isDown) {
            this.player.body.setVelocityX(-300);
            this.player.anims.play('move_left',true);
        }
        //👇→キーが押されたら、右に移動
        else if (this.cursors.right.isDown) {
            this.player.body.setVelocityX(300);
            this.player.anims.play('move_right',true);
        }else {
            this.player.body.setVelocityX(0);
        }

        if(SharedData.chamgeKagoImg){
            if(SharedData.kagoHeartCount >= 204){
                this.kago.anims.play('kago_fill',true);
                SharedData.chamgeKagoImg = false;
            }
        }

        SharedData.timeCount += 1;
        if(SharedData.timeCount > COUNT_DOUN_SPAN){
            SharedData.timeCount = 0;
            SharedData.timeCountDown -= 1;
            if(SharedData.timeCountDown < 0){
                if(SharedData.kagoHeartCount < 204){
                    this.scene.start('EndingScene1');
                } else {
                    this.scene.start('EndingScene2');
                }
                
            }
        }
    }

}

class EndingScene1 extends Phaser.Scene {
    constructor() {
        super({ key: 'EndingScene1' });
    }

    preload() {
        SharedData.timeCount = 0;

        this.load.spritesheet('hanabira','assets/hanabira.png',
            { frameWidth: 64, frameHeight: 64 }
        );
        this.load.image('background', 'assets/background.png');
        this.load.image('heart', 'assets/heart.png');
        this.load.image('kago_l','assets/kago_l.png');
        this.load.spritesheet('sakuchan','assets/saku_chan.png',
            { frameWidth: 128, frameHeight: 128 }
        );
    }

    create() {
        // 背景
        this.add.image(DISPLAY_WIDTH/2, DISPLAY_HEIGHT/2, 'background');

        // プレイヤー
        this.player = this.add.sprite(96,DISPLAY_HEIGHT-32, 'hanabira',2);
        this.physics.add.existing(this.player, false);
        this.player.body.setCollideWorldBounds(true);

        this.anims.create({
            key: 'move_right',
            frames: this.anims.generateFrameNumbers('hanabira',
            { start: 2, end: 3 }),
            frameRate: 5,
            repeat: 0
        });
        this.anims.create({
            key: 'jump',
            frames: this.anims.generateFrameNumbers('hanabira',
                { frames: [ 4, 5, 4, 2 ] }),
            frameRate: 15,
            repeat: 0
        });

        // かご
        this.kago = this.add.image(this.player.x+96,DISPLAY_HEIGHT-64, 'kago_l');
        this.physics.add.existing(this.kago, false);
        this.kago.body.setCollideWorldBounds(true);

        // さくちゃん
        this.sakuchan = this.add.sprite(DISPLAY_WIDTH/2+96,DISPLAY_HEIGHT-64, 'sakuchan',0);

        this.anims.create({
            key: 'saku_anim_1',
            frames: this.anims.generateFrameNumbers('sakuchan',
                { frames: [0, 1] }),
            frameRate: 5,
            repeat: 0
        });
        this.anims.create({
            key: 'saku_anim_2',
            frames: this.anims.generateFrameNumbers('sakuchan',
                { frames: [1, 2] }),
            frameRate: 5,
            repeat: 0
        });


        this.input.keyboard.on('keydown-SPACE', function () {
            this.scene.start('GameOverScene');
        }, this);
    }

    update() {

        SharedData.timeCount += 1;
        if(SharedData.timeCount < 150){
            this.player.body.setVelocityX(150);
            this.kago.body.setVelocityX(150);
            this.player.anims.play('move_right',true);
        } else if(SharedData.timeCount==150) {
            this.player.body.setVelocityX(50);
            this.kago.body.setVelocityX(50);
            this.sakuchan.anims.play('saku_anim_1', true);
        } else if(SharedData.timeCount<230){
            this.player.anims.play('move_right',true);
        } else if(SharedData.timeCount==230) {
            this.player.body.setVelocityX(0);
            this.kago.body.setVelocityX(0);
        } else if(SharedData.timeCount<300){
            // なし
        } else if(SharedData.timeCount==300){
            this.sakuchan.anims.play('saku_anim_2', true);
        } else if(SharedData.timeCount<340){
            // なし
        } else if(SharedData.timeCount<600 ) {
            if(this.player.body.touching.down || this.player.body.blocked.down){
                this.player.anims.play('jump',false);
                this.player.body.setVelocityY(-200);
            }
        } else{
            this.scene.start('GameOverScene');
        }
    }
}

class EndingScene2 extends Phaser.Scene {
    constructor() {
        super({ key: 'EndingScene2' });
        this.currentIndex = 0;
        this.currentSprite = null;
        this.nextSprite = null;
    }

    preload() {
        SharedData.timeCount = 0;

        this.load.image('happy_end_1', 'assets/happy_end_1.png');
        this.load.image('happy_end_2', 'assets/happy_end_2.png');
        this.load.image('happy_end_3', 'assets/happy_end_3.png');
        this.load.image('happy_end_4', 'assets/happy_end_4.png');
        this.load.image('happy_end_5', 'assets/happy_end_5.png');
        this.load.image('happy_end_6', 'assets/happy_end_6.png');
        this.load.image('happy_end_7', 'assets/happy_end_7.png');
        this.load.image('happy_end_8', 'assets/happy_end_8.png');
        this.load.image('happy_end_9', 'assets/happy_end_9.png');
        this.load.image('happy_end_10', 'assets/happy_end_10.png');
        this.load.image('happy_end_11', 'assets/happy_end_11.png');
        this.load.image('happy_end_12', 'assets/happy_end_12.png');
        this.load.image('happy_end_13', 'assets/happy_end_13.png');
    }

    create() {    
        this.imageKeys = ['happy_end_1', 'happy_end_2', 'happy_end_3', 'happy_end_4', 'happy_end_5', 'happy_end_6', 'happy_end_7',
             'happy_end_8', 'happy_end_9','happy_end_10', 'happy_end_11', 'happy_end_12', 'happy_end_13'];

        // 最初の画像を表示
        this.currentSprite = this.add.sprite(DISPLAY_WIDTH/2,DISPLAY_HEIGHT/2, this.imageKeys[0]);
        
        // 一定時間ごとに画像を切り替え
        this.time.addEvent({
            delay: 1500,  // 3秒ごとに切り替え
            callback: this.transitionToNextImage,
            callbackScope: this,
            loop: true
        });
        

        this.input.keyboard.on('keydown-SPACE', function () {
            this.scene.start('GameOverScene');
        }, this);
    }


    transitionToNextImage() {
        // 次の画像のインデックスを計算
        this.currentIndex = this.currentIndex + 1;

        if(this.currentIndex > 12){
            this.scene.start('GameOverScene');
        }
        
        // 次の画像をフェードインさせるためのスプライトを作成
        this.nextSprite = this.add.sprite(DISPLAY_WIDTH/2,DISPLAY_HEIGHT/2, this.imageKeys[this.currentIndex]);
        this.nextSprite.alpha = 0;

        // フェードアウト・フェードインのトゥイーンを作成
        this.tweens.add({
            targets: this.nextSprite,
            alpha: 1,
            duration: 500,
            ease: 'Linear',
            onComplete: () => {
                // 古い画像を削除し、新しい画像を現在の画像として設定
                this.currentSprite.destroy();
                this.currentSprite = this.nextSprite;
            }
        });
    }

    update() {

    }
}

class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    preload() {
        this.load.image('background_title', 'assets/background_title.png');
        this.load.image('bigHeart', 'assets/big_heart.png');
    }

    create() {
        this.add.image(DISPLAY_WIDTH/2, DISPLAY_HEIGHT/2, 'background_title');
        this.add.image(DISPLAY_WIDTH/2-120, DISPLAY_HEIGHT/2-125, 'bigHeart');

        let text_top = this.add.text(DISPLAY_WIDTH/2, DISPLAY_HEIGHT/2-250, 'あなたはさくちゃんに', {color: "#000", fontSize: 64, fontFamily: "Arial"}).setOrigin(0.5);
        let text_result = this.add.text(DISPLAY_WIDTH/2+80, DISPLAY_HEIGHT/2-125, SharedData.kagoHeartCount + "個", {color: "#000", fontSize: 96, fontFamily: "Arial"}).setOrigin(0.5);
        let text_bottom = this.add.text(DISPLAY_WIDTH/2, DISPLAY_HEIGHT/2, '愛を届けました！', {color: "#000", fontSize: 64, fontFamily: "Arial"}).setOrigin(0.5);
        let command_text = this.add.text(DISPLAY_WIDTH/2, DISPLAY_HEIGHT/2+280, 'PLESS SPACE', {color: "#000", fontSize: 64, fontFamily: "Arial"}).setOrigin(0.5);
        
        this.input.keyboard.on('keydown-UP', function () {
            this.postTwitter();
        }, this);

        this.input.keyboard.on('keydown-SPACE', function () {
            this.scene.start('StartScene');
        }, this);
    }

    // twitter投稿
    postTwitter(){
        var msg = 'あなたはさくちゃんに' + SharedData.kagoHeartCount + '個の愛を届けました！%0D%0A%0D%0A';
        var url = document.location.href;

        url = "http://x.com/share?url=" + encodeURI(url) + "&text=" + msg;
		window.open(url,"_blank");
    }
}
 
const config = {
    type: Phaser.AUTO,
    width: DISPLAY_WIDTH,
    height: DISPLAY_HEIGHT,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {x: 0,  y: 300},
            debug: false
        }
    },
    input: { keyboard: true },
    scene: [StartScene, GameScene, EndingScene1, EndingScene2, GameOverScene],
};
 
var game = new Phaser.Game(config);
//Cargamos un Objeto Quintus
window.addEventListener("load", function () {
    var Q = Quintus();
    Q.include("Scenes, TMX, Sprites, 2D, Anim, UI, Touch, Input")
    Q.setup({ maximize: false, width: 320, height: 480 });
    Q.controls();
    Q.touch();
    /**------------------SPRITE MARIO BROS----------------- */
    Q.Sprite.extend("Mario", {
        init: function (p) {

            this._super(p, {
                sprite: "mario", sheet: "mario_small",
                x: 150, y: 380
            });
            this.add('2d, platformerControls');

            this.on("died", this, "restart");
        },

        dying: function () {
            this.del('2d, platformerControls'); //elimina
            Q.stageScene("level1"); //volvemos al inicio
            //booleano End?
        },

        step: function (dt) {

            if (this.p.y > Q.height + 115) {
                this.dying();   //muerte cae en el vacio
            }
        }

    });

    Q.scene("level1", function (stage) {
        Q.stageTMX("level.tmx", stage);  //PUESTA EN ESCENA

        var mario = stage.insert(new Q.Mario());    //Mario a escena
        stage.add("viewport").follow(mario, { x: true, y: false }); //Seguir a Mario
        stage.centerOn(150, 380);
    });

    Q.load("mario_small.png, mario_small.json", function () {   //Cargamos los sprites
        Q.sheet("mario_small", "mario_small.png", { tilew: 32, tileh: 32 });
        Q.compileSheets("mario_small.png", "mario_small.json");

    });

    Q.loadTMX("level.tmx", function () {  //Cargamos el nivel tmx
        Q.stageScene("level1");
    });


});
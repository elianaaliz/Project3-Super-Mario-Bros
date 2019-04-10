//Cargamos un Objeto Quintus
window.addEventListener("load", function () {
    var Q = Quintus();
    Q.include("Scenes, TMX, Sprites, 2D, Anim, UI, Touch, Input")
    Q.setup({ maximize: false, width: 320, height: 480 });
    Q.controls();
    Q.touch();

    var gameOver = false;   //?

    Q.Sprite.extend("Bloopa",{
        init: function (p) {

            this._super(p, {
                sprite: "goomba", sheet: "goomba",
                vx: 30,
            });
            this.add('2d, aiBounce, Enemy');
        },

        step:function(dt){
            if(!gameOver){
                //algo
            } 
            else{
                //algo mas
                this.del('2d');
            } 
        }
    });

     /**------------------SPRITE GOOMBA----------------- */
    Q.component("Enemy", {
		added: function(){
			this.entity.on("bump.top",function(collision) { //muere Enemy
	      		if(collision.obj.isA("Mario")) { 
                      this.p.vx = 0;
                      this.destroy();   
	      		}
	    	});

	    	this.entity.on("bump.left,bump.right",function(collision) { //muere Mario
	    		if(collision.obj.isA("Mario")) { 
	        		collision.obj.dying();
	      		}
	    	});

		}
    });
    
    Q.Sprite.extend("Goomba",{
        init: function (p) {

            this._super(p, {
                sprite: "goomba", sheet: "goomba",
                vx: 30,
            });
            this.add('2d, aiBounce, Enemy');
        },

        step:function(dt){
            if(!gameOver){
                //algo
            } 
            else{
                //algo mas
                this.del('2d');
            } 
        }
    });
    /**------------------SPRITE MARIO BROS----------------- */
    Q.Sprite.extend("Mario", {
        init: function (p) {

            this._super(p, {
                sprite: "mario", sheet: "mario_small",
                x: 150, y: 380
            });
            this.add('2d, platformerControls');

        },

        dying: function () {
            //this.del('2d, platformerControls'); //elimina
            //gameOver = true;
            Q.stageScene("level1"); //volvemos al inicio
           
        },

        step: function (dt) {

            if (this.p.y > Q.height + 115) {
                this.dying();   //muerte cae en el vacio
            }
        }

    });

    Q.scene("level1", function (stage) {
        Q.stageTMX("level.tmx", stage);  //PUESTA EN ESCENA

        stage.insert(new Q.Goomba({x: 280, y: 528}));   //Insertamos al enemigo Goomba
        var mario = stage.insert(new Q.Mario());    //Mario a escena
        stage.add("viewport").follow(mario, { x: true, y: false }); //Seguir a Mario
        stage.centerOn(150, 380);
    });

    Q.load("mario_small.png, mario_small.json, goomba.png, goomba.json", function () {   //Cargamos los sprites
        Q.sheet("goomba","goomba.png", { tilew: 28, tileh: 28 });
        Q.sheet("mario_small", "mario_small.png", { tilew: 32, tileh: 32 });
        Q.compileSheets("mario_small.png", "mario_small.json");
        Q.compileSheets("goomba.png","goomba.json");

    });

    Q.loadTMX("level.tmx", function () {  //Cargamos el nivel tmx
        Q.stageScene("level1");
    });


});
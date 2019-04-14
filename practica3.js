//GAME: SUPER MARIO BROS
//Alumna: Eliana Aliz Chuquillanqui Julcapari
window.addEventListener("load",function() {
	//Creamos un objeto Quintus
	var Q = Quintus({ development: true, audioSupported: ["mp3", "ogg"] });
	Q.include("Scenes, TMX, Sprites, 2D, UI, Touch, Input, Anim, Audio").setup({maximize: false, width: 320, height:  480});
	Q.controls();
	Q.touch();
	Q.enableSound();

	//cargamos los recursos para el juego

    Q.load("piranha.png, piranha.json, koopa.png, koopa.json, mario_small.png, mario_small.json, goomba.png, goomba.json, bloopa.png, bloopa.json, princess.png, mainTitle.png, coin.png, coin.json, coin.mp3, music_level_complete.mp3,music_main.mp3, music_die.mp3", function() {
       Q.sheet("mainTitle","mainTitle.png", { tilew: 320, tileh: 480 });
       Q.sheet("mario_small","mario_small.png", { tilew: 32, tileh: 32 });
       Q.compileSheets("mario_small.png","mario_small.json"); 
       Q.sheet("goomba","goomba.png", { tilew: 28, tileh: 28 });
       Q.compileSheets("goomba.png","goomba.json");
       Q.sheet("bloopa","bloopa.png", { tilew: 28, tileh: 32 });
       Q.compileSheets("bloopa.png","bloopa.json");
       Q.sheet("princess","princess.png", { tilew: 30, tileh: 48 });
       Q.sheet("coin","coin.png", { tilew: 34, tileh: 34 });
       Q.compileSheets("coin.png","coin.json");
       Q.sheet("koopa","koopa.png", { tilew: 31, tileh: 48 });
       Q.compileSheets("koopa.png","koopa.json");
       Q.sheet("piranha","piranha.png", { tilew: 32, tileh: 50 });
       Q.compileSheets("piranha.png","piranha.json"); 
       Q.stageScene("startGame",2);
   });

   Q.loadTMX("level.tmx", function(){});	//cargamos el nivel TMX

	var gameOver = false;   //SI ES GAME OVER
	
    /**
     * PERSONAJE PLAYER MARIO
     */
	Q.Sprite.extend("Mario", {
		init: function(p){

			this._super(p, {sprite: "mario",sheet: "mario_small", 
				x: 150,y: 380, dir: "right", time: 0,
				vy_aux: 0, isFly: false});
			this.add('2d, platformerControls, animation');

			this.on("hit.sprite",function(collision) {
      			if(collision.obj.isA("Princess")) {
      				Q.audio.stop();
      				Q.audio.play("music_level_complete.mp3");
        			Q.stageScene("playAgain",1, { label: "You Won..!" });
        			this.destroy();
        			collision.obj.destroy();
      			} else if (collision.obj.isA("Coin")){
      				Q.audio.play("coin.mp3");
					collision.obj.chain({y: collision.obj.p.y-10}, 0.05, Q.Easing.Quadratic.Out, {callback: function(){this.destroy();Q.state.inc("score",1);}});
		
      			}
    		});

    		this.on("died", this, "restart");
		},

		restart: function(){
			this.destroy();
			Q.clearStages();
			if(Q.state.get("lives") < 0) Q.stageScene("gameOver",1);
			else Q.stageScene("lives",1);
		},

		dying: function(){
			this.del('2d, platformerControls');
			Q.state.dec("lives", 1);
	    	Q.state.set("score", 0);
			this.play("die_" + this.p.dir, 1);//Aunque es el mismo para ambas direcciones
			gameOver = true;
			this.p.vy = -7;
		},

		step: function(dt){
			if(gameOver){
				this.p.time+=dt;
				if(this.p.time >= 0.5){
					this.p.vy += 10*dt;
					this.p.y+=this.p.vy;
				}
			}else{
				if(this.p.y > Q.height+115){
					Q.audio.stop();
	    			Q.audio.play("music_die.mp3");
	        		this.dying();
				}

                if(this.p.vy_aux != this.p.vy){ this.p.isFly = true;}
                else{this.p.isFly = false;}

				this.p.vy_aux = this.p.vy;

				if(!this.p.isFly) this.p.dir = this.p.direction;

				if(this.p.isFly){
					this.play("jump_" + this.p.dir);
				}else if(this.p.vx > 0){
					this.play("run_right");
				}else if(this.p.vx < 0){
					this.play("run_left");
				}else{
					this.play("stand_" + this.p.dir);
				}
			}
		}
	});

    /**
     * COMPONENTE QUE TENDRAN LOS ENEMIGOS DE MARIO, SI
     * MARIO SALTA SOBRE ELLOS, ESTOS MUEREN, EN CASO CONTRARIO MARIO PIERDE.
     */
	Q.component("defaultEnemy", {
		added: function(){
			this.entity.on("bump.top",function(collision) {
	      		if(collision.obj.isA("Mario")) { 
	      			this.play("kill", 1);
	      			this.p.vx = 0;
                    collision.obj.p.vy = -200;
	      		}
                  Q.state.inc("score",3);   //si mata a un enemigo es triple puntaje
            });

	    	this.entity.on("bump.left,bump.right,bump.bottom",function(collision) {
	    		if(collision.obj.isA("Mario")) { 
	    			Q.audio.stop();
	    			Q.audio.play("music_die.mp3");
	        		collision.obj.dying();
	      		}
	    	});

	    	this.entity.on("enemyKilled", this.entity, "destroy");
		}
    });



    /**ENEMIGO GOOMBA */
	Q.Sprite.extend("Goomba",{
		init: function(p) {
			this._super(p, { sprite: 'goomba', sheet: 'goomba',
				vx: 30});
    		this.add('2d, aiBounce, animation, defaultEnemy');
    	},

  		step:function(dt){
  			if(!gameOver){
  				this.play("move");
  			} 
  			else{
  				this.play("stand");
  				this.del('2d');
  			} 
  		}
    });
    
    /**ENEMIGO BLOOPA */
	Q.Sprite.extend("Bloopa",{
		init: function(p) {
			this._super(p, { sprite: 'bloopa', sheet: 'bloopa',
				vy: -300});
    		this.add('2d, aiBounce, animation, defaultEnemy');

	    	this.on("step", function(dt) {
	    		if(!gameOver){
	    			this.play("release");

	    			if (this.p.vy >= 150){
	    				this.play("charge");
	    			} 

			    	if(this.p.vy == 0){
                        this.p.vy = -400;
                    }
                    
			    }else{
			    	this.del('2d');
			    }
	    	});
  		}
    });

    /**AGREGADO ENEMIGO NUEVO PLUS/EXTRA PIRANHA */
    /**
     * En esta version de juego implementada, si Mario aplasta a la planta, esta muere,
     * en la versión original no es así, pero se quiso agregar el componente anteriormente utilizado
     * en los demás enemigos.
     */
    Q.Sprite.extend("Piranha",{
		init: function(p){
			this._super(p, {
				sheet: 'piranha',
				sprite: "piranha",
				vy: -100
			});
			this.add('2d, aiBounce, defaultEnemy, animation');  //tambien tiene agregado el componente defaultEnemy
            
        },
        step:function(dt){
            if(!gameOver){
                this.play("move");
            } 
            else{
                this.play("stand");
                this.del('2d');
            } 
        }
    });
    
    
    /**AGREGADO ENEMIGO NUEVO PLUS/EXTRA KOOPA */
    Q.Sprite.extend("Koopa",{
		init: function(p) {
			this._super(p, { sprite: 'koopa', sheet: 'koopa',
				vx: -30, auxleft: 0, auxRight: 0});
            this.add('2d, aiBounce, animation, defaultEnemy');
            this.play("koopaLeft"); //EMPIEZA HACIA LA IZQUIERDA
            this.on("bump.left",this,"turnRight");
			this.on("bump.right",this,"turnLeft");
    	},

  		step:function(dt){
            
  			if(!gameOver){
                if(this.p.auxRight != 0){
                    if(this.p.x > this.p.auxRight) {
                        this.p.vx = 30;
                        this.play("koopaLeft");
                    }
                }
                if(this.p.auxLeft != 0) {
                    if(this.p.x < this.p.auxLeft) {
                        this.p.vx = -30;
                        this.play("koopaRight");
                    }
                }
  			} 
  			else{
  				this.play("stand");
  				this.del('2d');
  			} 
          },

        turnRight: function(collision) {//cambiar de direccion sprites
			this.play("koopaRight");
		},
		turnLeft: function(collision) {
			this.play("koopaLeft");
		},
	});

	Q.Sprite.extend("Coin",{    //Moneda
		init: function(p){
			this._super(p, { sprite: 'coin', sheet: 'coin',
				time: 0, gravity: 0, sensor: true});
    		this.add('2d, animation, tween');
		},

		step: function(dt){
			this.play("glow");
		}
	});

	Q.Sprite.extend("Princess", {   //Princesa
	 	init: function(p) {
	    	this._super(p, { sheet: 'princess' });
	  	}
	});

    Q.Sprite.extend("Icon", {   //icono de vidas Mario
		init: function(p){
			this._super(p, {sheet: "mario_small", x: Q.width/2-30 , y: Q.height/2 });
		}
    });
    
	Q.Sprite.extend("MainTitle", {  //Titulo Principal
	 	init: function(p) {
	    	this._super(p, { sheet: 'mainTitle' });
	  	}
	});

	Q.UI.Text.extend("Score",{  //Puntaje de coins
		init: function(p){
			this._super({
				label: "Score: 0", x: 10,y: 0
			});

			Q.state.on("change.score", this, "score");
		},

		score: function(score){
			this.p.label = "Score: " + score;
		}
	});

	Q.scene('hud',function(stage){  //El puntaje que llevas en el juego
		var box = stage.insert(new Q.UI.Container({
	    	x: 230, y: 10, fill: "rgba(255, 255, 0, 0.5)"
	  	}));

	  	var label = box.insert(new Q.Score());

	  	box.fit(10);
	});

	Q.scene('lives',function(stage){
		var box = stage.insert(new Q.UI.Container({
	    	x: Q.width/3 + 20 , y: Q.height/2, fill: "rgba(0,0,255,0.5)"
	  	}));

		var icon = box.insert(new Q.Icon({ x: 0, y: 0}));

	  	var label = box.insert(new Q.UI.Text({x:40, y: -10, color: "white",
	  								label: " X "+ Q.state.get("lives")}));

	  	var time = 0;

	  	stage.on("step", function(dt){
	  		time += dt;
	  		if(time >= 0.5){
	  			Q.clearStages();
	  			gameOver = false;
	    		Q.stageScene('level1');
	    		Q.stageScene('hud',1);
	  		}
	  	})

	  	box.fit(20);
	});
    
    Q.scene('startGame',function(stage) {

		stage.insert(new Q.MainTitle({x:160, y: 240}));

		var box = stage.insert(new Q.UI.Container({
	    	x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0)"
	  	}));
	  
		var button = box.insert(new Q.UI.Button({ x: 0, y: 0, h:480, w:320, fill: "rgba(0,0,0,0)"}));         
	  	
		var time = 0;

	  	button.on("click",function() {
	    	Q.clearStages();
	    	Q.state.reset({score: 0, lives: 3});
	    	Q.stageScene('lives',1);
	  	});

	  	button.on("step",function(dt) {
	  		time+=dt;
	  		if(time >= 0.5){
		    	if(Q.inputs['fire']){
			    	Q.clearStages();
			    	Q.state.reset({score: 0, lives: 3});
			    	Q.stageScene('lives',1);
			    }
			}
	  	});
	  	box.fit(100);
    });
    
	Q.scene('playAgain',function(stage) {
		var box = stage.insert(new Q.UI.Container({
	    	x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
	  	}));
        
	  	var button = box.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
	                                           label: "Play Again" }));         
	  	var label = box.insert(new Q.UI.Text({x:5, y: -8 -button.p.h, 
	                                        label: stage.options.label }));
	  	button.on("click",function() {
	  		Q.audio.stop();
	    	Q.clearStages();
	    	gameOver = false;
	    	Q.stageScene('startGame');
	  	});
	  	box.fit(20);
	});


    
	Q.scene('gameOver',function(stage) {

		var box = stage.insert(new Q.UI.Container({
	    	x: Q.width/2, y: Q.height/2, fill: "rgba(255,0,0,0.5)"
	  	}));

		var button = box.insert(new Q.UI.Button({ x: 0, y: 0, h:480, w:320, fill: "rgba(0,0,0,0)"}));         

	  	var label = box.insert(new Q.UI.Text({x:0, y: 0, color: "white",
	  								label: "GAME OVER"}));    
	  	
	  	button.on("click",function() {
	    	Q.clearStages();
	    	Q.state.reset({score: 0, lives: 3});
	    	Q.clearStages();
	    	Q.stageScene("startGame",2);
	  	});

	  	stage.on("step",function() {
	    	if(Q.inputs['fire']){
		    	Q.clearStages();
		    	Q.state.reset({score: 0, lives: 3});
		    	Q.clearStages();
		    	Q.stageScene("startGame",2);
		    }
	  	});
	  	box.fit(1000);
	});


	

	Q.scene("level1", function(stage){
        Q.stageTMX("level.tmx",stage);
        
        stage.insert(new Q.Piranha({x: 1500, y: 420}));

        stage.insert(new Q.Koopa({x: 330, y: 420}));

        stage.insert(new Q.Coin({x: 400, y: 500}));
		stage.insert(new Q.Coin({x: 430, y: 500}));
		stage.insert(new Q.Coin({x: 460, y: 500}));
		stage.insert(new Q.Coin({x: 1400, y: 420}));
		stage.insert(new Q.Coin({x: 1430, y: 420}));
		stage.insert(new Q.Coin({x: 1600, y: 420}));
		
		stage.insert(new Q.Bloopa({x: 1190, y: 420}));

		stage.insert(new Q.Goomba({x: 500, y: 420}));
		stage.insert(new Q.Goomba({x: 1620, y: 420}));
		stage.insert(new Q.Goomba({x: 1580, y: 420}));

		stage.insert(new Q.Princess({x: 1900, y: 452}));

		var mario = stage.insert(new Q.Mario());
		stage.add("viewport").follow(mario,{x:true, y:false});
		stage.centerOn(150,380);

		Q.audio.play("music_main.mp3", {loop: true});
	});
    
    /**
     * ANIMACIONES DE LOS OBJETOS
     */
	Q.animations("mario", {
		stand_right: {frames: [0], rate: 1/5},
		stand_left: {frames: [14], rate: 1/5},
		run_right: {frames: [1,2,3], rate: 1/5},
		run_left: {frames: [15,16,17], rate: 1/5},
		jump_right: {frames: [4], rate: 1/5},
		jump_left: {frames: [18], rate: 1/5},
		die_right: {frames: [12], loop: false, rate: 6, trigger: "died"},
		die_left: {frames: [26], loop: false, rate: 6, trigger: "died"}
	});
    
	Q.animations("goomba", {
		stand: {frames: [0], rate: 1/3},
		move: {frames: [0,1], rate: 1/3},
		kill: {frames: [2], loop: false, rate: 1/3, trigger: "enemyKilled"}
	});

	Q.animations("bloopa", {
		release:{frames: [0], rate: 1/3},
		charge: {frames: [1], rate: 1/3},
		kill: {frames: [2], loop: false, rate: 1/3, trigger: "enemyKilled"}
	});

	Q.animations("coin", {
		glow: {frames: [0,1,2], rate: 1/6}
    });
    
    Q.animations("piranha", {
        move: { frames: [0, 1], rate: 1/3 },
        stand: { frames: [0, 1], rate: 1/3 },
		kill: { frames: [0], loop: false, rate : 1/3, trigger: "enemyKilled"}
    });
    
    Q.animations("koopa", {
		koopaLeft: { frames: [4, 5], rate: 1/3},
        koopaRight: { frames: [0, 1], rate: 1/3},
        stand: {frames: [9], rate: 1/3},
        kill: {frames: [9], loop: false, rate: 1/3, trigger: "enemyKilled"}
    });

    
});

//Cargamos un ibjeto Quintus
window.addEventListener("load", function () {
    var Q = Quintus();
    Q.include("Scenes, TMX, Sprites, 2D, Anim, UI, Touch, Input")
    Q.setup({maximize: false, width: 320, height:  480});
	Q.controls();
	Q.touch();
    
    Q.scene("level1", function (stage) {
        Q.stageTMX("level.tmx",stage);  //PUESTA EN ESCENA

		
		stage.add("viewport");
		stage.centerOn(150,380);
    });

    Q.loadTMX("level.tmx", function(){  //Cargamos el nivel tmx
        Q.stageScene("level1"); 
    });


});


    // set up the renderer
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera( 70, window.innerWidth*0.75/window.innerHeight, 1, 1000 );
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth*0.75, window.innerHeight );
    gameBoard.appendChild( renderer.domElement );
    renderer.setClearColor( 0xbbbbbb );

    // set up material & geometry
    var basicGeometry = new THREE.BoxGeometry( 5, 0.1, 5  );
    var iconBox_small = new THREE.BoxGeometry( 0.5,0.5,0.5 );  
    var iconBox_big = new THREE.BoxGeometry( 0.7, 0.7, 0.7 );
    var colorInvis = new THREE.MeshLambertMaterial( {  opacity: 0, transparent: true } );
    var colorClickable = new THREE.MeshLambertMaterial( { color: 0x555555, opacity: 0.3, transparent: true } );
    var colorBlue  = new THREE.MeshLambertMaterial( { color: 0x0000ff  } );
    var TransBlue  = new THREE.MeshLambertMaterial( { color: 0x0000ff, opacity: 0.6, transparent: true } );
    var colorRed   = new THREE.MeshLambertMaterial( { color: 0xff0000  } );
    var TransRed   = new THREE.MeshLambertMaterial( { color: 0xff0000, opacity: 0.6, transparent: true } );
    var colorGray  = new THREE.MeshLambertMaterial( { color: 0x222222  } );
    var color = [ colorInvis , colorBlue , colorRed , colorClickable , TransBlue , TransRed ];

    // set up basic(called cube)
    var cube =  new THREE.Mesh( basicGeometry, colorGray );
    scene.add( cube );
    cube.position.x = 2.5;
    cube.position.z = 2.5;

    // set up Icon
    var p1Icon1 = new THREE.Mesh( iconBox_small, colorBlue );
    var p1Icon2 = new THREE.Mesh( iconBox_small, colorBlue );
    var p2Icon1 = new THREE.Mesh( iconBox_small, colorRed );
    var p2Icon2 = new THREE.Mesh( iconBox_small, colorRed );
    scene.add( p1Icon1 );
    scene.add( p1Icon2 );
    scene.add( p2Icon1 );
    scene.add( p2Icon2 );
    p1Icon1.position.x = -0.5;
    p1Icon1.position.z = -0.5;
    p1Icon2.position.x = 5.5;
    p1Icon2.position.z = 5.5;
    p2Icon1.position.x = -0.5;
    p2Icon1.position.z = 5.5;
    p2Icon2.position.x = 5.5;
    p2Icon2.position.z = -0.5;

    // set up cubes
    var cubes = [];
    for(var k=0; k<64; k++){
        cubes[k] = new THREE.Mesh( iconBox_small, colorInvis );
        scene.add(cubes[k]);
        cubes[k].situation = 0;
        cubes[k].Num = k;
        cubes[k].position.x += ((k-k%16)/16) + 1;
        cubes[k].position.y += k%4 + 0.4;
        cubes[k].position.z += (k%16-k%4)/4 + 1;
        if(k%4==0){
            cubes[k].material = colorClickable;
            cubes[k].situation = 3;
        }
    }
    
    // set up light
    var ambientLight = new THREE.AmbientLight( 0x888888 ,0.5 );
    scene.add( ambientLight );
    var directionalLight = new THREE.DirectionalLight( 0xcccccc );
    directionalLight.position.set( 1,2,2 ).normalize();
    scene.add( directionalLight );

    // camera controll
    var manualControl = false;
    var longitude = 0;
    var latitude = 0;
    var savedX;
    var savedY;
    var savedLongitude;
    var savedLatitude;
    var mouse = new THREE.Vector2();
    camera.target = new THREE.Vector3(0, 0, 0);

    // variable declared
    var player = 1;
    var moved = false;
    var iam;

    // set up raycaster
    var raycaster = new THREE.Raycaster();
    var firstVisibleObject,selected,intersects;
    
    render();

    function render(){

        renderer.setSize( window.innerWidth*0.75,window.innerHeight);
        requestAnimationFrame(render);
        // limiting latitude from 0 to 85
        latitude = Math.max(-85, Math.min(0, latitude));

        //set camera
        camera.target.x = 500 * Math.sin(THREE.Math.degToRad(90 - latitude)) * Math.cos(THREE.Math.degToRad(longitude));
        camera.target.y = 500 * Math.cos(THREE.Math.degToRad(90 - latitude));
        camera.target.z = 500 * Math.sin(THREE.Math.degToRad(90 - latitude)) * Math.sin(THREE.Math.degToRad(longitude));
        camera.lookAt(camera.target);
        camera.position.x = -camera.target.x/60 +2.5;
        camera.position.y = -camera.target.y/60 + 1;
        camera.position.z = -camera.target.z/60 +2.5;

        //set raycaster
        raycaster.setFromCamera( mouse, camera );
        intersects = raycaster.intersectObjects( scene.children );

        //check firstVisibleObject
        firstVisibleObject=null;
        for(var k = 0; k < intersects.length; k++){
            if( intersects[k].object.material != colorInvis && intersects[k].object.geometry != basicGeometry ){
                firstVisibleObject = intersects[k].object;
                break;
            }
        }

        //player's actions  ///Note: could be edit

        if ( firstVisibleObject ){
            if( selected != firstVisibleObject ){
                if( selected && selected.situation == 3 ) selected.material = colorClickable;
                selected = firstVisibleObject;
                if( selected.situation == 3 ){
                    if(iam==1)selected.material = TransBlue;
                    if(iam==2)selected.material = TransRed;
                } 
            }
        }
        else{
            if( selected && selected.situation == 3 )selected.material = colorClickable;
            selected = null;
        }

        //rotate icon
        if(turn==1){
            p1Icon1.rotation.y += 0.1;
            p1Icon2.rotation.y += 0.1;
        }
        else if(turn==2){
            p2Icon1.rotation.y += 0.1;
            p2Icon2.rotation.y += 0.1;
        }
        else if(turn==3){
            p1Icon1.rotation.y += 0.1;
            p1Icon2.rotation.y += 0.1;
            p2Icon1.rotation.y += 0.1;
            p2Icon2.rotation.y += 0.1;
        }
        renderer.render(scene, camera);
    }

    function renderRefresh(gameStat){
        for(var i=0;i<64;i++){
            cubes[i].material = color[gameStat[i]]
            cubes[i].situation = gameStat[i];
        }
    }

    var turn = 3;
    socket.on('restart',function(){
        alert("Game Start!")
        turn = 1;
        p1Icon1.material = colorBlue;
        p1Icon2.material = colorBlue;
        p2Icon1.material = colorRed;
        p2Icon2.material = colorRed;
        p1Icon1.geometry = iconBox_small;
        p1Icon2.geometry = iconBox_small;
        p2Icon1.geometry = iconBox_small;
        p2Icon2.geometry = iconBox_small;
        renderer.setClearColor( 0xbbbbbb );
    })
    socket.on('youare',function( youare ){
        iam = youare;
        if(iam==1){
            alert("藍方先下，請下子");
            renderer.setClearColor( 0xbbbbdd );
        }
        if(iam==2){
            alert("紅方後下，請稍候");
            renderer.setClearColor( 0xddbbbb );
        }
    })
    socket.on('refreshState',function( gameStat, k ){
        renderRefresh(gameStat);
        turn = k;
    })
    socket.on('gameOver',function(gameInfo){
        if (gameInfo.endWay == 3){
            alert("此局平手~ 10秒後等候另外兩位參賽者開啟新局");
        }
        if (gameInfo.endWay == 0){
            if(gameInfo.winnerId == 1) alert("紅方離開遊戲，藍方 " + gameInfo.winnerName + " 勝利~ 10秒後等候另外兩位參賽者開啟新局");
            if(gameInfo.winnerId == 2) alert("藍方離開遊戲，紅方 " + gameInfo.winnerName + " 勝利~ 10秒後等候另外兩位參賽者開啟新局");
        }
        else {
            if(gameInfo.winnerId == 1)alert("藍方 " + gameInfo.winnerName + " 勝利~ 10秒後等候另外兩位參賽者開啟新局");
            if(gameInfo.winnerId == 2)alert("紅方 " + gameInfo.winnerName + " 勝利~ 10秒後等候另外兩位參賽者開啟新局");
        }
        if(gameInfo.endWay != 3){
            p1Icon1.material = color[gameInfo.winnerId];
            p1Icon2.material = color[gameInfo.winnerId];
            p2Icon1.material = color[gameInfo.winnerId];
            p2Icon2.material = color[gameInfo.winnerId];
        }
        p1Icon1.geometry = iconBox_big;
        p1Icon2.geometry = iconBox_big;
        p2Icon1.geometry = iconBox_big;
        p2Icon2.geometry = iconBox_big;
        iam = null;
    })
    socket.on('loginHint',function(playing){
        if(playing)alert("遊戲已經開始，進入觀戰模式");
        else alert("遊戲尚未開始，請稍候");
    })

    // listeners
    gameBoard.addEventListener("mousedown", onDocumentMouseDown, false);
    gameBoard.addEventListener("mousemove", onDocumentMouseMove, false);
    gameBoard.addEventListener("mouseup", onDocumentMouseUp, false);

    function onDocumentMouseDown(event){

        manualControl = true;

        savedX = event.clientX;
        savedY = event.clientY;
        savedLongitude = longitude;
        savedLatitude = latitude;

        if( firstVisibleObject && firstVisibleObject.situation == 3){
            socket.emit('downReq', firstVisibleObject.Num );
        }
    }

    function onDocumentMouseMove(event){

        if( manualControl ){
            longitude = -(savedX - event.clientX) * 0.1 + savedLongitude;
            latitude = -(event.clientY - savedY) * 0.1 + savedLatitude;
        };
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
        moved = true;

    }

    function onDocumentMouseUp(event){
        manualControl = false;
    }

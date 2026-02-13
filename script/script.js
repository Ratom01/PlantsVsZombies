// fő div
let game_board;
// interval
let start;
// interval lövéshez
let shoot;
// zene lejátszó
let audio;
let audioOn = false;
// pont számlálás
let point = 100;
// jatekterulet szelessege, hosszusaga
let gb_width, gb_height;
// ellenseg
let enemy;
// mező
let place;
// növény kép
let plant_img;
// lövedék kép
let projectile_img;
// ellenseg szama
let enemy_number = 10;
// idő, amikor az ellenség megjelenik
let time_array=[10,20,30,40,50,60,70,80,90,100];
// tomb az ellensegnek
let enemy_array = [];
// idő számlálás
let time = 0;
// növények
let plant_array = [];
// teljesített szintek
let current_level = 0;
let ready_level = 0;

$(document).ready(function () {
    game_board = $('#game-board');
    enemy = $('<img src="../image/plant1.png">');
    plant_img = $('<img src="../image/zombie1.png">');
    projectile_img = $('<img src="../image/projectile1.png">');

    // a jatekter szelessegenek lekerdezese
    gb_width = parseInt(game_board.css('width'));
    // a jatekter magassaganak lekerdezese
    gb_height = parseInt(game_board.css('height'));


    possible_places();
    // $('#plant').on('drag', place_plant);
    $( "#plant" ).draggable({
        helper: 'clone',
        stop: function(event, ui) {
            let left = ui.position.left;
            let top = ui.position.top;
            if(100 < point){
                place_plant(left, top)
                point-=100;
            }
        }
    });
    $('#plant').draggable('disable');

    audio = new Audio('../audio/index.mp3');
    try{
        audio.volume = parseFloat(localStorage.getItem("volume"));

    }catch(e){
        audio.volume = 1;
        console.log(e.message);
    }
    try{
        if ("ready_level" in localStorage) {
            ready_level = parseInt(localStorage.getItem('ready_level'));
            // console.log("level: " + ready_level);
        }

    }catch(e){
        ready_level = 0;
        console.log(e.message);
    }
    // start = setInterval(start_game, 50);
    // setInterval(plant_shoot, 2000);
    grayScreen();

});
// helyek létrehozása
function possible_places(){
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 10; j++) {
            place = $('<div></div>');
            game_board.append(place);
            place.css({
                top: 90+i*123,
                left: 40+j*112
            });
            place.addClass('places');
            // console.log(50+i*100,100+j*100);
        }
    }
}
// növény helyezése
function place_plant(left, top){
    $('.places').each(function() {
        if(parseInt($(this).css('top')) < top &&
            parseInt($(this).css('top'))+123 > top &&
            parseInt($(this).css('left')) < left &&
            parseInt($(this).css('left'))+112 > left){
            // console.log("heeeeeelo");
            let act_img = plant_img.clone()

            // $(this).append(act_img);
            // act_img.css({
            //     height: 100,
            //     width: 100,
            //     display: 'block',
            //     position: 'absolute',
            //     left: 5,
            //     top: 10
            // });

            let top = 10 + parseInt($(this).css('top'));
            let left = 5 + parseInt($(this).css('left'));
            $('#game-board').append(act_img);
            act_img.css({
                height: 100,
                width: 100,
                display: 'block',
                position: 'absolute',
                left: left,
                top: top
            });
            act_img.addClass('plants');
            plant_array.push(
                {
                    image: act_img.clone(),
                    x:$(this).position().left,
                    y:$(this).position().top,
                    health: 20
                }
            );
        }
    });
}
// lövedék létrehozása
function plant_shoot(){
    for (let i = 0; i < plant_array.length; i++) {
        // console.log("Shoot");
        // console.log(plant_array[i].x, plant_array[i].y);
        let act_img = projectile_img.clone()
        game_board.append(act_img);
        act_img.css({
            height: 20,
            width: 20,
            position: 'absolute',
            left: plant_array[i].x+50,
            top: plant_array[i].y+50
        });
        act_img.addClass('projectile');
    }
}
//lövedék animációja és találat kezelése
function projectile_animate(){
    $('.projectile').each(function () {
        $(this).animate({
            left: '+=5'
        },50);
        let projectile = $(this)
        for (let i = 0; i < enemy_array.length; i++) {
            if($(this).position().left+20 > enemy_array[i].x_pos &&
                $(this).position().left-100 < enemy_array[i].x_pos &&
                $(this).position().top > enemy_array[i].y_pos &&
                $(this).position().top-70 < enemy_array[i].y_pos){

                $(this).remove();
                enemy_array[i].health--;
                if(enemy_array[i].health <= 0){
                    $('.enemy').eq(i).remove();
                    enemy_array.splice(i,1);
                    i--;
                }
            }
        }
        if($(this).position().left > 1200){
            $(this).remove();
        }
    });
}
//ellenség létrehozás
function createEnemys(){
    for (let i = 0; i < enemy_number; i++) {
        enemy_array.push({
            x_pos: gb_width,
            y_pos: parseInt(Math.random() * 5)*125+100,
            health: 5,
            time: time_array[i],
            imgObj: enemy.clone(),
            move: true
        })
    }
    draw_enemy();
}
// fuggveny az ellenseg kirajzolasara
function draw_enemy() {
    // vegigmegyunk az ellenseg tomb minden elemen
    for (let e in enemy_array) {
        // vesszuk az aktualis elemet
        let act_enemy = enemy_array[e];
        // lekerjuk a megjelenitendo kepet
        let act_img = act_enemy.imgObj;
        // hozzaadjuk az ellenseg kepet a jatekterulethez
        game_board.append(act_img);
        // beallitjuk az aktualis ellenseg (x, y) koordinatajat es a kep szelesseget
        act_img.css({
            left: act_enemy.x_pos,
            top: act_enemy.y_pos,
            height: 100,
            width: 100
        });
        // hozzaadjuk az enemy class-t
        act_img.addClass('enemy');
        // console.log(act_enemy.x_pos);
        // console.log(act_enemy.y_pos);
    }
}
//elenség mozgatása
function move_enemy(){
    $('.enemy').each(function (index) {
        // ha az aktualis pozicio 300px alatt van, akkor noveljuk az ellenseg y koordinatajat 20px-el
        if ($(this).position().left > -100){
            for (let i = 0; i < plant_array.length; i++) {
                if(enemy_array[index].x_pos < plant_array[i].x+100 &&
                    enemy_array[index].x_pos > plant_array[i].x &&
                    enemy_array[index].y_pos < plant_array[i].y+20 &&
                    enemy_array[index].y_pos > plant_array[i].y){

                    // console.log("tamad");
                    plant_array[i].health -= 1;
                    if(plant_array[i].health <= 0){
                        $('.plants').eq(i).remove();
                        plant_array.splice(i,1);
                        i--;
                    }
                    enemy_array[index].move = false;
                }
            }if(enemy_array[index].move === true && enemy_array[index].time < time) {
                $(this).animate({
                    left: '-=2'

                },50)
            }
        }
    });
    for (let i = 0; i < enemy_array.length; i++) {
        if(enemy_array[i].time < time){
            if(enemy_array[i].move === true){
                enemy_array[i].x_pos-=2;
            }
            enemy_array[i].move = true;
        }
    }
}
// pálya kiválasztása
function level_select(index){
    switch (index){
        case 1:
            enemy_number = 10;
            time_array = [10,20,30,40,50,60,70,80,90,100];
            current_level = 1;
            break;
        case 2:
            enemy_number = 15;
            time_array = [10,15,20,30,35,40,50,55,60,70,75,80,90,95,100];
            current_level = 2;
            break;
        default:
            enemy_number = 1;
            time_array = [1];
            current_level = 3;
            break;
    }
}
// menübe lépés
function back_to_menu(){
    // $('.menu').css('display','flex');
    if(!audioOn){
        $('#game-board .gray-screen').remove();
        audioOn = true;
        audio.pause();
        audio.src = '../audio/index.mp3';
        audio.load();
        audio.play();
        //console.log("audi indul");
    }

    $('#game-board .level-selector').remove();
    $('#game-board .point').remove();
    $('#game-board .victory').remove();
    $('#game-board .volume-box').remove();
    $('#game-board .tutorial').remove();
    $('.defeat').remove();
    $('#game-board').append('<div class="menu base-div">\n' +
        '        <div class="button button-hover" onClick="init_game(1)">START</div>\n' +
        '        <div class="button button-hover" onclick="to_level_select()">SELECT LEVEL</div>\n' +
        '        <div class="button button-hover" onclick="volume()">VOLUME</div>\n' +
        '        <div class="button button-hover" onclick="tutorial()">TUTORIAL</div>\n' +
        '    </div>');
    // $('.level-selector').css('display','none');

}
// szint választás
function to_level_select(){
    // $('.menu').css('display','none');
    // $('.level-selector').css('display','flex');
    $('#game-board .menu').remove();
    $('#game-board').append('<div class="level-selector base-div">\n' +
        '        <div class="level-selector-header">SELECT-LEVEL</div>\n' +
        '        <div class="level-selector-body">\n' +
        '            <div class="level button-hover" onClick="init_game(1)">1</div>\n' +
        '            <div class="level button-hover" onClick="init_game(2)">2</div>\n' +
        '            <div class="level button-hover" onClick="init_game(3)">3</div>\n' +
        '        </div>\n' +
        '        <div class="level-selector-footer button-hover" onClick="back_to_menu()">\n' +
        '            BACK\n' +
        '        </div>\n' +
        '    </div>');
    $('#game-board .level').each(function () {
        if(ready_level + 1 < $(this).text()){
            $(this).removeAttr('onclick');
            $(this).css('background','gray');
        }
    })

}
// játék előkészítése
function init_game(level){
    level_select(level);
    createEnemys();
    $('#game-board .level-selector').remove();
    $('#game-board .menu').remove();
    $('#game-board').append('<div class="point">100</div>');
    start = setInterval(start_game, 50);
    shoot = setInterval(plant_shoot, 2000);
    audio.pause();
    audio.src = '../audio/action.mp3';
    audio.load();
    audio.play();
    point = 100;

    $('#plant').draggable('enable');
}
//további ismétlődő dolgok meghívása
function start_game(){
    move_enemy();
    projectile_animate();
    time+=0.2;
    point += 1;
    $('.point').text(point);
    if(enemy_array.length == 0){
        endGame();
        victory();
    }
    $('.enemy').each(function (index) {
        // ha az aktualis pozicio 300px alatt van, akkor noveljuk az ellenseg y koordinatajat 20px-el
        if ($(this).position().left <= -100){
            endGame();
            defeat();
        }
    });
}
// játék leállítása
function endGame(){
    clearInterval(start);
    clearInterval(shoot);
    enemy_number = 0;
    enemy_array = [];
    time_array = [];
    plant_array = [];
    time = 0;
    $('.projectile').each(function () {
        $(this).remove();
    })
    $('.plants').each(function () {
        $(this).remove();
    })
    $('.enemy').each(function () {
        $(this).remove();
    })
}
// kattintás várása
function grayScreen(){
    $('#game-board').append('<div class="gray-screen" onclick="back_to_menu()">\n' +
        '        <div>click anywhere</div>\n' +
        '    </div>');
}
// győzelem üzenet
function victory(){
    $('#game-board').append('<div class="victory base-div">\n' +
        '        <div>VICTORY</div>\n' +
        '        <div class="button button-hover " onclick="back_to_menu()">OK</div>\n' +
        '    </div>');
    audio.pause();
    audio.src = '../audio/victory.mp3';
    audio.load();
    audio.play();
    audioOn = false;
    if(current_level > ready_level){
        ready_level = current_level;
        localStorage.setItem('ready_level', ready_level);
        // console.log(ready_level);
    }
    $('#plant').draggable('disable');
}
// veszítés üzenet
function defeat(){
    $('#game-board').append('<div class="defeat base-div">\n' +
        '        <div>DEFEAT</div>\n' +
        '        <div class="button button-hover" onclick="back_to_menu()">OK</div>\n' +
        '    </div>');
    audio.pause();
    audio.src = '../audio/defeat.mp3';
    audio.load();
    audio.play();
    audioOn = false;
    $('#plant').draggable('disable');
}
// hangerő állítás
function volume() {
    $('#game-board .menu').remove();
    $('#game-board').append('<div class="volume-box base-div">\n' +
            '<div>VOLUME</div>\n' +
                '<div>\n' +
                    '<input class="volume" type="range" min="0" max="1.0" step="0.1" value="1.0">\n' +
                    '<label class="volumetext"></label>\n' +
                '</div>\n' +
                '<div class="button button-hover" onclick="back_to_menu()">OK</div>\n' +
            '</div>');
    $('.volumetext').text(Math.round(audio.volume * 100) + '%');
    $('.volume').val(audio.volume);

    $('.volume').on('input', function () {
        const value = parseFloat($(this).val());
        $('.volumetext').text(Math.round(value * 100) + '%');
        audio.volume = value;
        localStorage.setItem('volume', value);

    });
}
// tutorial
function tutorial(){
    $('#game-board .menu').remove();
    $('#game-board').append('<div class="tutorial base-div">\n' +
        '        <div>\n' +
        '            <p>A játék a "Plants vs Zombies" játék alapján készült.</p>\n' +
        '            <p>A játék lényege:</p>\n' +
        '            <p>A növények megtámadnak téged és te különböző zombikat (jelenleg egy fajtát) helyezhetsz le, hogy megvéd otthonod.</p>\n' +
        '            <p>Ha a növények elérik az otthonod akkor veszítettél, ha a zombik legyőzik a növényeket akkor nyertél.</p>\n' +
        '            <p>Funkciók:</p>\n' +
        '            <p>A balfelső sarokban található elem segítségével tudsz lehelyezni zombikat (a mezőre huzásával).</p>\n' +
        '            <p>Minden zombi lehelyezése 100 egység pontba kerül, amit a jobb felső sarokban láthatsz.</p>\n' +
        '        </div>\n' +
        '        <button class="button button-hover" onclick="back_to_menu()">BACK</button>\n' +
        '    </div>');
}
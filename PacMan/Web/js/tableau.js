var mqtt;
var reconnectTimeout = 2000;
var host = "172.16.207.52";
var port = 9001;

function onFailure(message) {
    console.log('Connexion a ' + host + ':' + port + 'failed.');
    setTimeout(MQTTconnect, reconnectTimeout);
}

function onConnect() {
    console.log('Connecteeeee');
    mqtt.subscribe('pacman');
    mqtt.subscribe('mur');
    mqtt.subscribe('monstre');
    mqtt.subscribe('sortie');
    mqtt.subscribe('mort');
}

function onMessageArrived(msg) {
    let pos = msg.payloadString;
    console.log(pos + " ALLO " + msg.destinationName);

    if(msg.destinationName == 'pacman') {
        ajoutAuTableau('pacman', pos);
        posPacman = pos;
    }
    else if(msg.destinationName == 'mur') {
        ajoutAuTableau('mur', pos);
    }
    else if(msg.destinationName == 'monstre') {
        ajoutAuTableau('monstre', pos);
    }
    else if(msg.destinationName == 'sortie') {
        if(pos == 'sortie') {
            $('#tableau').hide();
            $('#leia').show();
        }
        else
            ajoutAuTableau('sortie', pos);
    }
    else if(msg.destinationName == 'mort') {
        $('#tableau').hide();
        $('#darth').show();
    }

    out_msg = 'Message recu ' + pos;
    console.log(out_msg);
}

function MQTTconnect() {
    console.log('Connexion a ' + host + ':' + port);
    var x = Math.floor(Math.random() * 10000);
    var cname = 'orderform-' + x;
    mqtt = new Paho.MQTT.Client(host, port, cname);
    var options = {
        timeout: 3,
        onSuccess: onConnect,
        onFailure: onFailure,
    };

    mqtt.onMessageArrived = onMessageArrived;
    mqtt.connect(options);
}

function recommencer() {
    for(let i = 0; i < 20; i++) {
        for(let j = 0; j < 20; j++) {
            $('#' + j + '-' + i).attr('src', 'img/noir.png');
        }
    }

    message = new Paho.MQTT.Message("commencer");
    message.destinationName = "jeu";
    message.retained = true;
    mqtt.send(message);

    $('#tableau').show();
    $('#darth').hide();
    $('#leia').hide();

    console.log('Partie recommencer!');
}

function commencer() {
    message = new Paho.MQTT.Message('commencer');
    message.destinationName = "jeu";
    message.retained = true;
    mqtt.send(message);

    $('#commencer').hide();
    $('#recommencer').show();
    console.log('Commencement de la partie...');
}

function generateTableau() {

    let divBouttons = document.createElement('div');
    document.body.appendChild(divBouttons);
    divBouttons.id = "bouttons";
    for(let h = 0;h < 2;h++){
        
        let p = document.createElement('p');
        divBouttons.appendChild(p);
        if(h == 0) {
            p.addEventListener("click", commencer);
            p.id = 'commencer';
            p.innerHTML = "Commencer";
        }
        else {
            p.addEventListener("click", recommencer);
            p.id = 'recommencer';
            p.innerHTML = "Recommencer";
        }
        
        p.classList.add('menu');
    }

    let divTable = $('<div></div>').attr('id', 'tableau-div');
    let table1 = $('<table></table>').attr('id', 'tableau');
    for(let i = 0; i < 20; i++) {
        let row = $('<tr></tr>');
        for(let j = 0; j < 20; j++) {
            let img = '<img id="' + j + '-' + i + '" src="img/noir.png">';
            let data = $('<td></td>');
            table1.append(row);
            row.append(data);
            data.prepend(img);
        }
    }

    let darth = $('<img src="img/darth.gif"></img>').attr('id', 'darth');
    let leia = $('<img src="img/leia.gif"></img>').attr('id', 'leia');

    divTable.append(table1);
    divTable.append(darth);
    divTable.append(leia);
    $('body').append(divTable);
    $('#darth').hide();
    $('#leia').hide();
    $('#recommencer').hide();
}

function ajoutAuTableau(objet, position) {
    let idX = '#' + position;

    if(objet == 'pacman'){
        $('#' + posPacman).attr('src', 'img/noir.png');
        $(idX).attr('src', 'img/pacman.png');
    }
    if(objet == 'mur'){
        $(idX).attr('src', 'img/mur.png');
    }
    if(objet == 'monstre'){
        $(idX).attr('src', 'img/monstre.png');
    }
    if(objet == 'sortie'){
        $(idX).attr('src', 'img/sortie.png');
    }
}

var posSortie;
var posPacman;

$(function() {
    MQTTconnect();
    generateTableau();
});
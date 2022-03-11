//Cedric Noel

//Nom des images
var nomImg;
//Emplacement des fichier d'images
var emplacementFichier;
//Intervale du mouvement de feu
var mouvementFeu;
//Intervale du mouvement de l'araigner
var mouvementArraigner;
//Nom de l'emplacement de la page actuelle
var nomEmp = document.location.href.replace(/^.*[\\\/]/, '');
//Score ammasser jusqu'à présent
var scoreActuel = 0;
//Nouvelle partie?
var nouvPartie = true;
//Entrer dans le donjon?
var entrerDungeon = true;
//Difficulté sélectionner dans le menu
var diffMenu;
//Tableau des noms
var noms = new Array(5);
//Tableau des scores
var scores = [0, 0, 0, 0, 0];
//Mur est vérouillé?
var murVer = true;

//Niveau de jeu
class Niveau {

    constructor(diff) {
        this.tuile = "img/grass.png";
        this.changeEmp = false;
        this.emp = "niv1";
        this.ancientEmp = "menu";
        this.difficulte = diff;
    }
}

//Joueur principal
class Joueur {

    constructor() {
        //Image du personnage
        this.perso = "img/perso.png";
        //Image du personnage mort
        this.mort = "img/mort.png";
        // 1 == vivant 0 == mort
        this.statut = 1;
        //Coordonnées du joueur
        this.x = 0;
        this.y = 0;
        //ID de l'élément joueur
        this.id = "" + this.y + this.x;
        //Combien de pièce le joueur possède
        this.coin = 0;
        //Prochain emplacement du joueur
        this.idProchain = "";
        //Est-ce que le joueur possède une arme
        this.arme = false;
        //Type d'arme du joueur
        this.typeArme = "";
        //Combien de clef le joueur possède
        this.clef = 0;
    }

    getId() {
        this.id = "" + this.y + this.x;
        return this.id;
    }

    setId() {
        this.id = "" + this.y + this.x;
    }
}

class Feu {

    constructor(_idFeu) {
        //ID de l'élément du feu
        this.idFeu = _idFeu;
    }
    //Vitesse de déplacement du feu
    static vitesse = 1000;
    //Direction du feu ( 0 = Gauche & 1 = Droite)
    static directionFeu = 0;
}

class Coin {

    constructor(_pos) {
        //Est-ce que le jeton est pris?
        this.pris = false;
        //Position du jeton
        this.pos = _pos;
    }
}

class Arraigner {

    constructor(y, x) {
        //Position de l'araigné
        this.pos = "" + y + x;
        //Points de vie de l'araigné
        this.vie = 3;
        //Coordonnées de l'araigné
        this.x = x;
        this.y = y;
        //Prochain emplacement de l'araigné
        this.idProchain = "";
    }

    setPos() {
        this.pos = "" + this.y + this.x;
    }
    //Vitesse de déplacement de l'araigné
    static vitesse = 1500;
}

class Clef {

    constructor(_pos) {
        //Position de la clef
        this.pos = _pos;
        //Est-ce que la clef a été pris?
        this.pris = false;
    }
}

//Les cookies NE FONCTIONNE PAS dans Chrome, seulement Firefox 
//Création du menu des scores
function menuScore() {
    document.body.innerHTML = "";

    $.getJSON("../JSON/scores.json");

    //Chargement des cookies dans les tableaux
    for(let i = 0; i < scores.length; i++){
        scores[i] = getCookie("score" + (i+1));
        if(scores[i] != 0)
            noms[i] = getCookie("joueur");
        else
            noms[i] = "-";
    }

    //Création de l'affichage de la page du menu 'Meilleurs Scores'
    $(function() {
        let div = $('<div></div>').attr('id', 'titre');
        let titre = $('<h1>Meilleurs Scores</h1>').attr('id', 'signeTitre');
        div.append(titre);
        let div2 = $('<div></div>').attr('id', 'choixMenu');
        let table2 = $('<table></table>').attr('id', 'tabMenu');
        //Création du tableau HTML
        for(let i = 1; i < 6; i++) {
            let row = $('<tr></tr>');
            for(let j = 0; j < 3; j++) {
                let data;
                if(j == 0) {
                    data = $("<td><p>" + i + "</p></td>");
                }
                else if(j == 1 && (getCookie("score" + i) != "" && getCookie("score" + i) != null)){
                    data = $("<td><p>" + noms[i-1] + "</p></td>").attr('id', 'score' + i);
                    console.log(getCookie("score" + i));
                }
                else if(j == 1){
                    data = $("<td></td>").attr('id', 'score' + i);
                }
                else if(j == 2 && (getCookie("score" + i) != "" && getCookie("score" + i) != null)) {
                    data = $("<td><p>" + getCookie("score" + i) + "</p></td>").attr('id', 'nomScore' + i);
                }
                else if(j == 2) {
                    data = $("<td></td>").attr('id', 'nomScore' + i);
                }
                row.append(data);
            }
            table2.append(row);
        }
        div2.append(table2);

        let div3 = $('<div></div>').attr('class', 'choixMenu');
        let liste1 = $('<ul></ul>').attr('class', 'choixMenu');
        let el1 = $('<li>Menu Principal</li>').attr('class', 'menuScore');
        let el2 = $('<li>Nouvelle Partie</li>').attr('class', 'menuScore');

        //Ajout des actions de click sur les boutons
        el1.click(function() {location.reload();});
        el2.click(startJeu);

        liste1.append(el1);
        liste1.append(el2);
        div3.append(liste1);

        //Création des choix de difficulté
        let div4 = $('<div></div>').attr('id', 'diff');
        let l1 = $('<label>Facile</label>');
        let i1 = $('<input type="radio" name="difficulte" value="facile" checked><br>');
        let l2 = $('<label>Medium</label>');
        let i2 = $('<input type="radio" name="difficulte" value="medium"><br>');
        let l3 = $('<label>Difficile</label>');
        let i3 = $('<input type="radio" name="difficulte" value="difficile"><br>');

        //Insertion des éléments dans la page
        div4.append(l1);
        div4.append(i1);
        div4.append(l2);
        div4.append(i2);
        div4.append(l3);
        div4.append(i3);

        $('body').append(div);
        $('body').append(div2);
        $('body').append(div3);
        $('body').append(div4);
    });

}

//Vérification si c'est une nouvelle partie
function nouvellePartie() {

    if(nouvPartie == true){
        verifNom();
    }
    nouvPartie = false;

}

//Commencement d'une nouvelle partie
function startJeu() {

    //Vérification de la difficulté sélectionner dans le menu
    let diff = document.getElementsByTagName("input");
    for(let f = 0; f < diff.length; f++) {
        if(diff[f].checked == true){
            diffMenu = diff[f];
        }
    }

    //Création des objets du jeu
    joueur = new Joueur();
    niveau = new Niveau(diffMenu.value);
    feu1 = new Feu(40);
    feu2 = new Feu(42);
    feu3 = new Feu(44);
    coin1 = new Coin(15);
    coin2 = new Coin(33);
    coin3 = new Coin(41);
    clef1 = new Clef(25);
    arraigner1 = new Arraigner(2, 4);

    //Changement de la vitesse des éléments selon la difficulté
    if(niveau.difficulte == "facile") {
        feu1.vitesse = 1000;
        arraigner1.vitesse = 1500;
    }
    else if(niveau.difficulte == "medium") {
        feu1.vitesse = 750;
        arraigner1.vitesse = 1250;
    }
    else if(niveau.difficulte == "difficile") {
        feu1.vitesse = 500;
        arraigner1.vitesse = 1000;
    }

    //Supprime les éléments de la page
    document.body.innerHTML = "";

    //L'emplacement du niveau est 'niv1'
    niveau.emp = "niv1"

    //Création des boutons
    let div = document.createElement('div');
    document.body.appendChild(div);
    div.id = "bouttons";
    for(let h = 0;h < 2;h++){
        
        let p = document.createElement('p');
        div.appendChild(p);
        p.classList.add('menu');
        if(h == 0) {
            p.addEventListener("click", confirmeQuitter);
            p.innerHTML = "Menu Principal";
        }
        else {
            p.addEventListener("click", confirmeRecommencer);
            p.innerHTML = "Recommencer la partie";
        }
    }

    //Création du tableau de jeu
    $(function() {
        let div = $('<div></div>');
        let table1 = $('<table></table>').attr('id', 'niv1');
        for(let i = 0; i < 6; i++) {
            let row = $('<tr></tr>');
            for(let j = 0; j < 6; j++) {
                let img = '<img id="' + i + j + '" src="img/grass.png">';
                let data = $("<td></td>");
                table1.append(row);
                row.append(data);
                data.prepend(img);
            }
        }

        let p = $('<p>Appuyer sur W,A,S,D pour vous déplacer et E pour frapper avec une arme.</p>');

        div.append(table1);
        div.append(p);
        $('body').append(div);

        //Création des objets audio
        let audio = $('<audio></audio>').attr('id', 'audio');
        let source = $('<source></source>').attr('type', 'audio/mpeg');
        audio.append(source);
        $('body').append(audio);
    });

    $(document).ready(initialise);
    $(document).ready(nouvellePartie);
    
}

//Innitialise le niveau de la partie
function initialise() {
    console.log("Emplacement: " + niveau.emp);

    //Innitialisation du niveau 1
    if(niveau.emp == "niv1") {

        //Changement de la position du joueur selon d'où il provient
        $('table').attr("id", "niv1");
        niveau.tuile = "img/grass.png";
        if(niveau.ancientEmp == "menu") {
            joueur.x = 0;
            joueur.y = 0;
        }
        else if(niveau.ancientEmp == "maison") {
            joueur.x = 2;
            joueur.y = 1;
        }
        if(niveau.ancientEmp == "dungeon") {
            joueur.x = 4;
            joueur.y = 5;
        }

        //Insertion des images sur le tableau de jeu
        for(let i = 0; i < 6; i++) {
            for(let j = 0; j < 6; j++){
                let id1 = "#" + i + j;

                if(id1 == "#00" && niveau.ancientEmp == "menu") {
                    $(id1).attr("src", joueur.perso);
                }
                else if(id1 == "#12" && niveau.ancientEmp == "maison") {
                    $(id1).attr("src", joueur.perso);
                }
                else if(id1 == "#54" && niveau.ancientEmp == "dungeon") {
                    $(id1).attr("src", joueur.perso);
                }
                else if (id1 == "#11") {
                    $(id1).attr("src", "img/maison.png");
                }
                else if(id1 == "#23" || id1 == "#31") {
                    $(id1).attr("src", "img/pic.png");
                }
                else if(id1 == "#40" || id1 == "#42" || id1 == "#44") {
                    $(id1).attr("src", "img/feu.png");
                }
                else if(id1 == "#41" && coin3.pris == false){
                    $(id1).attr("src", "img/coin.png");
                }
                else if(id1 == "#33" && coin2.pris == false){
                    $(id1).attr("src", "img/coin.png");
                }
                else if(id1 == "#15" && coin1.pris == false){
                    $(id1).attr("src", "img/coin.png");
                }
                else if(id1 == "#55") {
                    $(id1).attr("src", "img/porteNormal.png");
                }
                else {
                    $(id1).attr("src", niveau.tuile);
                }
            }
        }
    }
    //Innitialisation du magasin
    else if(niveau.emp == "maison"){
        //Changement de la position du joueur
        $('table').attr("id", "maison");
        niveau.tuile = "img/wood.png";
        joueur.x = 1;
        joueur.y = 0;
        
        //Insertion des images dans le magasin
        for(let i = 0; i < 6; i++) {

            for(let j = 0; j < 6; j++){

                let id1 = "" + i + j;

                if(id1 == "00") {
                    document.getElementById(id1).src = "img/porteMaison.png";
                }
                else if (id1 == "01") {
                    document.getElementById(id1).src = joueur.perso;
                }
                else if (id1 == "30" || id1 == "31" || id1 == "32" || id1 == "33" || id1 == "34" || id1 == "35" || id1 == "40" || id1 == "44" || id1 == "45" || id1 == "50" || id1 == "51" || id1 == "52" || id1 == "53" || id1 == "54" || id1 == "55") {
                    document.getElementById(id1).src = "img/vide.png";
                }
                else if(id1 == "41") {
                    document.getElementById(id1).src = "img/shop1.png";
                }
                else if(id1 == "42") {
                    document.getElementById(id1).src = "img/shop2.png";
                }
                else if(id1 == "43") {
                    document.getElementById(id1).src = "img/shop3.png";
                }
                else if (id1 == "04") {
                    document.getElementById(id1).src = "img/epe.png";
                }
                else if (id1 == "14") {
                    document.getElementById(id1).src = "img/hache.png";
                }
                else if (id1 == "24") {
                    document.getElementById(id1).src = "img/dague.png";
                }
                else if (id1 == "05") {
                    document.getElementById(id1).src = "img/caisse.png";
                }
                else if (id1 == "15") {
                    document.getElementById(id1).src = "img/marchant.png";
                }
                else if (id1 == "25") {
                    document.getElementById(id1).src = "img/table.png";
                }
                else {
                    document.getElementById(id1).src = niveau.tuile;
                }
            }
        }
    }
    //Innitialisation du donjon
    else if(niveau.emp == "dungeon") {

        //Changement de la position du joueur
        $('table').attr("id", "dungeon");
        niveau.tuile = "img/stone.png";
        joueur.x = 4;
        joueur.y = 0;

        arraigner1.x = 4;
        arraigner1.y = 2;
        arraigner1.setPos();

        //Insertion des images dans le tableau
        for(let i = 0; i < 6; i++) {
            for(let j = 0; j < 6; j++){
                let id1 = "#" + i + j;

                if(id1 == "#04") {
                    $(id1).attr("src", joueur.perso);
                }
                else if(id1 == "#05") {
                    $(id1).attr("src", "img/porteNormal.png");
                }
                else if(id1 == "#12" || id1 == "#13" || id1 == "#14" || id1 == "#15" || id1 == "#41"
                 || id1 == "#42" || id1 == "#43" || id1 == "#44" || id1 == "#45") {
                    $(id1).attr("src", "img/mur.png");
                }
                else if(id1 == "#40" && murVer == true) {
                    $(id1).attr("src", "img/murClef.png");
                }
                else if(id1 == "#24" && arraigner1.vie != 0) {
                    $(id1).attr("src", "img/arraigner.png");
                }
                else if(id1 == "#25" && clef1.pris == false) {
                    $(id1).attr("src", "img/clef.png");
                }
                else if(id1 == "#55") {
                    $(id1).attr("src", "img/tresor.png");
                }
                else {
                    $(id1).attr("src", niveau.tuile);
                }
            }
        }

    }

    mouvementPeriodique();
    //Ajout des événements sur la page
    document.addEventListener("keydown", mouvement);
    document.addEventListener("keydown", swing);
}

//Déplacement du joueur vers le haut
function haut() {
    verifsMouvement();
    //Vérification des obstacles et changement de la position du joueur
    if((joueur.y-1 >= 0)  && nomImg != "mur.png" && nomImg != "mur.png" && joueur.statut == 1 && niveau.changeEmp == false) {
        document.getElementById(joueur.id).src = niveau.tuile;
        joueur.y -= 1;
        let idM = "#" + joueur.y + joueur.x;
        $(idM).attr("src", joueur.perso);
    }
    verifFin();
}

//Déplacement du joueur vers la gauche
function gauche() {
    verifsMouvement();
    //Vérification des obstacles et changement de la position du joueur
    if((joueur.x-1 >= 0) && (nomImg != "mur.png") && joueur.statut == 1 && niveau.changeEmp == false) {
        document.getElementById(joueur.id).src = niveau.tuile;
        joueur.x -= 1;
        let idM = "#" + joueur.y + joueur.x;
        $(idM).attr("src", joueur.perso);
    }
    verifFin();
}

//Déplacement du joueur vers le bas
function bas() {
    verifsMouvement();
    //Vérification des obstacles et changement de la position du joueur
    if((joueur.y+1 < 6) && nomImg != "mur.png" && nomImg != "vide.png" && nomImg != "mur.png" && nomImg != "murClef.png" && joueur.statut == 1 
    && niveau.changeEmp == false && entrerDungeon == true) {
        document.getElementById(joueur.id).src = niveau.tuile;
        joueur.y += 1;
        let idM = "#" + joueur.y + joueur.x;
        $(idM).attr("src", joueur.perso);
    }
    entrerDungeon = true;
    verifFin();
}

//Déplacement du joueur vers la droite
function droite() {
    verifsMouvement();
    //Vérification des obstacles et changement de la position du joueur
    if((joueur.x+1 < 6) && nomImg != "marchant.png" && nomImg != "caisse.png" && nomImg != "table.png" 
    && nomImg != "hache.png" && nomImg != "epe.png" && nomImg != "dague.png" && nomImg != "mur.png" && joueur.statut == 1 
    && niveau.changeEmp == false  && entrerDungeon == true) {
        document.getElementById(joueur.id).src = niveau.tuile;
        joueur.x += 1;
        let idM = "#" + joueur.y + joueur.x;
        $(idM).attr("src", joueur.perso);
    }
    entrerDungeon = true;
    verifFin();
}

//Mouvement du joueur selon la touche enfoncée
function mouvement() {
    joueur.id = "" + joueur.y + joueur.x;
    switch(event.keyCode) {
        case 87: haut(); break;
        case 65: gauche(); break;
        case 83: bas(); break;
        case 68: droite(); break;
    }
}

//Vérifications du mouvement du joueur
function verifsMouvement() {
    niveau.changeEmp = false;
    verifMort();

    //Rammassage des jetons
    if(joueur.idProchain == coin1.pos && niveau.emp == "niv1"){
        coin1.pris = true;
    }
    else if(joueur.idProchain == coin2.pos && niveau.emp == "niv1"){
        coin2.pris = true;
    }
    else if(joueur.idProchain == coin3.pos && niveau.emp == "niv1"){
        coin3.pris = true;
    }

    if(joueur.idProchain == clef1.pos && niveau.emp == "dungeon"){
        clef1.pris = true;
    }

    //Achat d'une arme
    if((nomImg == "epe.png" || nomImg == "hache.png" || nomImg == "dague.png") && joueur.arme == false && joueur.coin >= 3){
        joueur.arme = true;
        playAudio("paye");

        if(nomImg == "epe.png"){
            joueur.perso = "img/persoEpe.png";
            joueur.typeArme = "epe";
        }
        else if(nomImg == "hache.png"){
            joueur.perso = "img/persoHache.png";
            joueur.typeArme = "hache";
        }
        else if(nomImg == "dague.png"){
            joueur.perso = "img/persoDague.png";
            joueur.typeArme = "dague";
        }
    }

    //Dévérouillage de la porte vérouillé
    if(nomImg == "murClef.png" && joueur.clef > 0){
        if(niveau.emp == "dungeon"){
            scoreActuel += 2;
            joueur.clef--;
            murVer = false;
            playAudio("unlock");
            document.getElementById("40").src = niveau.tuile;
        }
    }
    
    //Changement d'emplacement vers le magasin
    if(nomImg == "maison.png"){
        niveau.emp = "maison";
        niveau.ancientEmp = "niv1"
        clearInterval(mouvementFeu);
        initialise();
        niveau.changeEmp = true;
    }
    //Changement d'emplacement vers le niveau 1 depuis le magasin
    else if(nomImg == "porteMaison.png"){
        niveau.emp = "niv1";
        niveau.ancientEmp = "maison"
        initialise();
        niveau.changeEmp = true;
    }
    //Rammassage des jetons
    else if(nomImg == "coin.png"){
        playAudio("coin");
        joueur.coin++;
        scoreActuel++;
    }
    //Rammassage des clefs
    else if(nomImg == "clef.png"){
        joueur.clef++;
    }
    //Changement d'emplacement vers le donjon
    else if(nomImg == "porteNormal.png" && niveau.emp == "niv1"){
        //Confirmation de changement vers le donjon sans arme
        if(joueur.arme == false){
            confirmeDungeon();
        }
        else {
            niveau.emp = "dungeon";
            niveau.ancientEmp = "niv1"
            clearInterval(mouvementFeu);
            initialise();
            niveau.changeEmp = true;
        }
        //Augmentation du score pour avoir entré dans le donjon
        if(entrerDungeon == true && scoreActuel == 0){
            scoreActuel++;
        }

    }
    //Changement d'emplacement vers le niveau 1 depuis le donjon
    else if(nomImg == "porteNormal.png" && niveau.emp == "dungeon"){
        niveau.emp = "niv1";
        niveau.ancientEmp = "dungeon";
        clearInterval(mouvementArraigner);
        initialise();
        niveau.changeEmp = true;
    }

}

//Confirmation de vouloir entrer dans le donjon sans arme
function confirmeDungeon() {

    let passer = confirm("Êtes-vous certain de vouloir continuer sans arme?");
    if(passer == true){
        niveau.emp = "dungeon";
        clearInterval(mouvementFeu);
        initialise();
        niveau.changeEmp = true;
    }
    else{
        entrerDungeon = false;
    }

}

//Action de frapper avec une arme
function swing() {

    if(event.keyCode == 69 && joueur.arme == true) {
        let timeChange;
        clearTimeout(timeChange);
        changeBack();
        playAudio("swing");
        //Changement de l'image du personnage selon l'arme qu'il possède
        if(joueur.perso == "img/persoDague.png"){
            document.getElementById(joueur.id).src = "img/persoDagueSwing.png";
            timeChange = setTimeout(changeBack, 750);
        }
        else if(joueur.perso == "img/persoHache.png"){
            document.getElementById(joueur.id).src = "img/persoHacheSwing.png";
            timeChange = setTimeout(changeBack, 750);
        } 
        else if(joueur.perso == "img/persoEpe.png"){
            document.getElementById(joueur.id).src = "img/persoEpeSwing.png";
            timeChange = setTimeout(changeBack, 750);
        }
        //Endroit ou l'arme peut frapper
        let joueurHaut = "" + (joueur.y - 1) + joueur.x;
        let joueurBas = "" + (joueur.y + 1) + joueur.x;
        let joueurGauche = "" + joueur.y + (joueur.x - 1);
        let joueurDroite = "" + joueur.y + (joueur.x + 1);
        //Vérification du contact de la frappe
        if((arraigner1.pos == joueurHaut || arraigner1.pos == joueurBas || arraigner1.pos == joueurGauche
            || arraigner1.pos == joueurDroite) && niveau.emp == "dungeon"){
                playAudio("hitArraigner");
                arraigner1.vie--;

                console.log("Vie de l'arraigner: " + arraigner1.vie);
                //Mort de l'araigner
                if(arraigner1.vie == 0) {
                    clearInterval(mouvementArraigner);
                    playAudio("mortArraigner");
                    document.getElementById(arraigner1.pos).src = niveau.tuile;
                    arraigner1.pos = "";
                    scoreActuel += 3;
                }
        }
        
    }

}

//Retour à l'image avant la frappe du personnage
function changeBack() {

    document.getElementById(joueur.id).src = joueur.perso;

}

//Vérification de la fin de la partie
function verifFin() {
    joueur.setId();

    if(joueur.id == 55 && niveau.emp == "dungeon"){
        playAudio("fin");
        document.removeEventListener("keydown", mouvement);
        document.removeEventListener("keydown", swing);
        clearInterval(mouvementArraigner);
        scoreActuel += 20;
        alert("Vous avez atteind la fin fu jeu! Félicitation!\n\nScore final: " + scoreActuel);
        verifScore();
    }
}

//Vérification de la mort du joueur
function verifMort() {

    if(event.keyCode == 65) {
        joueur.idProchain = "" + joueur.y + (joueur.x - 1);
        emplacementFichier = document.getElementById(joueur.idProchain).src;
    }
    else if(event.keyCode == 68) {
        joueur.idProchain = "" + joueur.y + (joueur.x + 1);
        emplacementFichier = document.getElementById(joueur.idProchain).src;
    }
    else if(event.keyCode == 83) {
        joueur.idProchain = "" + (joueur.y + 1) + joueur.x;
        emplacementFichier = document.getElementById(joueur.idProchain).src;
    }
    else if(event.keyCode == 87) {
        joueur.idProchain = "" + (joueur.y - 1) + joueur.x;
        emplacementFichier = document.getElementById(joueur.idProchain).src;
    }

    nomImg = emplacementFichier.replace(/^.*[\\\/]/, '');

    console.log("Nom image: " + nomImg);
    //Vérification du contact avec le feu, les pic ou l'araigné
    if(nomImg == "feu.png" || nomImg == "pic.png" || nomImg == "arraigner.png") {
        if(nomImg == "feu.png") {
            playAudio("feu");
        }
        else if(nomImg == "pic.png") {
            playAudio("pic");
        }
        joueur.statut = 0;
        document.getElementById(joueur.id).src = joueur.mort;
        document.body.onkeydown = null;
        clearInterval(mouvementFeu);
        clearInterval(mouvementArraigner);
        verifScore();
        alert("Vous êtes mort!");
        setTimeout(recommencer, 1000);
    }
}

//Vérification de la mort par le mouvement du feu
function verifMortFeu() {
    //Nom des images de feu
    let empFichFeu1 = document.getElementById(feu1.idFeu).src;
    let empFichFeu2 = document.getElementById(feu2.idFeu).src;
    let empFichFeu3 = document.getElementById(feu3.idFeu).src;

    let nomImgFeu1 = empFichFeu1.replace(/^.*[\\\/]/, '');
    let nomImgFeu2 = empFichFeu2.replace(/^.*[\\\/]/, '');
    let nomImgFeu3 = empFichFeu3.replace(/^.*[\\\/]/, '');
    let nomPerso = joueur.perso.replace(/^.*[\\\/]/, '');
    //Vérification de la mort
    if(nomImgFeu1 == nomPerso || nomImgFeu2 == nomPerso || nomImgFeu3 == nomPerso) {
        playAudio("feu");
        joueur.statut = 0;
        document.getElementById(joueur.id).src = joueur.mort;
        document.body.onkeydown = null;
        clearInterval(mouvementFeu);
        clearInterval(mouvementArraigner);
        verifScore();
        alert("Vous êtes mort!");
        setTimeout(recommencer, 500);
    }
}

//Vérification de la mort par le mouvement de l'araigné
function mortArraigner() { 
    
    if(arraigner1.idProchain == joueur.getId()){
        playAudio("arraigner");
        joueur.statut = 0;
        document.getElementById(joueur.id).src = joueur.mort;
        document.body.onkeydown = null;
        clearInterval(mouvementArraigner);
        verifScore();
        alert("Vous êtes mort!");
        setTimeout(recommencer, 1000);
    }

}

//Recommencer la partie
function recommencer() {
    let restart = confirm("Voulez-vous recommencer?");
    if(restart == true){
        resetVar();
        initialise();
    }
    else{
        alert("Meilleure chance la prochaine fois!");
        location.reload();
    }
}

//Réinnitialise les variables
function resetVar() {
    coin1.pris = false;
    coin2.pris = false;
    coin3.pris = false;
    clef1.pris = false;
    niveau = new Niveau();
    arraigner1.vie = 3;
    scoreActuel = 0;
    joueur = new Joueur();
}

//Bouge le feu du premier niveau
function bougeFeu() {
    //Vérification du jeton sous le feu
    if(feu1.idFeu != 41 || coin3.pris == true){
        document.getElementById(feu1.idFeu).src = niveau.tuile;
    }
    else if(coin3.pris == false) {
        document.getElementById(feu1.idFeu).src = "img/coin.png";
    }

    document.getElementById(feu2.idFeu).src = niveau.tuile;
    document.getElementById(feu3.idFeu).src = niveau.tuile;
    //Déplacement du feu
    if(feu1.directionFeu == 0) {
        feu1.idFeu--;
        feu2.idFeu--;
        feu3.idFeu--;
        verifMortFeu();
        document.getElementById(feu1.idFeu).src = "img/feu.png";
        document.getElementById(feu2.idFeu).src = "img/feu.png";
        document.getElementById(feu3.idFeu).src = "img/feu.png";
    }
    else {
        feu1.idFeu++;
        feu2.idFeu++;
        feu3.idFeu++;
        verifMortFeu();
        document.getElementById(feu1.idFeu).src = "img/feu.png";
        document.getElementById(feu2.idFeu).src = "img/feu.png";
        document.getElementById(feu3.idFeu).src = "img/feu.png";
    }
    //Changement de la direction du feu
    if(feu1.directionFeu == 0) {
        feu1.directionFeu = 1;
    }
    else {
        feu1.directionFeu = 0;
    }

}

//Mouvement de l'araigné
function bougeArraigner() {
    let direction = Math.round(Math.random() * 4);

    switch(direction) {
        case 0: ; break;
        case 1: hautArraigner(); break;
        case 2: gaucheArraigner(); break;
        case 3: basArraigner(); break;
        case 4: droiteArraigner(); break;
    }

}

//Déplacement de l'araigné vers le haut
function hautArraigner() {
    //Nom de l'image dans la direction du déplacement de l'araigné
    arraigner1.idProchain = "" + (arraigner1.y - 1) + arraigner1.x;
    empImgArraigner = document.getElementById(arraigner1.idProchain).src;
    let nomImgArraigner = empImgArraigner.replace(/^.*[\\\/]/, '');
    //Vérification des obstacles
    if(nomImgArraigner != "perso.png" && nomImgArraigner != "mur.png" && nomImgArraigner != "porteNormal.png" && nomImgArraigner != "clef.png" && arraigner1.y - 1 >= 0 && arraigner1.idProchain != joueur.getId()){
        document.getElementById(arraigner1.pos).src = niveau.tuile;
        arraigner1.y -= 1;
        arraigner1.setPos();
        document.getElementById(arraigner1.pos).src = "img/arraigner.png";
    }
    mortArraigner();

}

//Déplacement de l'araigné vers le bas
function basArraigner() {
    //Nom de l'image dans la direction du déplacement de l'araigné
    arraigner1.idProchain = "" + (arraigner1.y + 1) + arraigner1.x;
    empImgArraigner = document.getElementById(arraigner1.idProchain).src;
    let nomImgArraigner = empImgArraigner.replace(/^.*[\\\/]/, '');
    //Vérification des obstacles
    if(nomImgArraigner != "perso.png" && nomImgArraigner != "mur.png" && nomImgArraigner != "porteNormal.png" && nomImgArraigner != "clef.png" && arraigner1.y + 1 < 7 && arraigner1.idProchain != joueur.getId()){
        document.getElementById(arraigner1.pos).src = niveau.tuile;
        arraigner1.y += 1;
        arraigner1.setPos();
        document.getElementById(arraigner1.pos).src = "img/arraigner.png";
    }
    mortArraigner();

}

//Déplacement de l'araigné vers la droite
function droiteArraigner() {
    //Nom de l'image dans la direction du déplacement de l'araigné
    arraigner1.idProchain = "" + arraigner1.y + (arraigner1.x + 1);
    empImgArraigner = document.getElementById(arraigner1.idProchain).src;
    let nomImgArraigner = empImgArraigner.replace(/^.*[\\\/]/, '');
    //Vérification des obstacles
    if(nomImgArraigner != "perso.png" && nomImgArraigner != "mur.png" && nomImgArraigner != "porteNormal.png" && nomImgArraigner != "clef.png" && arraigner1.x + 1 < 7 && arraigner1.idProchain != joueur.getId()){
        document.getElementById(arraigner1.pos).src = niveau.tuile;
        arraigner1.x += 1;
        arraigner1.setPos();
        document.getElementById(arraigner1.pos).src = "img/arraigner.png";
    }
    mortArraigner();

}

//Déplacement de l'araigné vers la gauche
function gaucheArraigner() {
    //Nom de l'image dans la direction du déplacement de l'araigné
    arraigner1.idProchain = "" + arraigner1.y + (arraigner1.x - 1);
    empImgArraigner = document.getElementById(arraigner1.idProchain).src;
    let nomImgArraigner = empImgArraigner.replace(/^.*[\\\/]/, '');
    //Vérification des obstacles
    if(nomImgArraigner != "perso.png" && nomImgArraigner != "mur.png" && nomImgArraigner != "porteNormal.png" && nomImgArraigner != "clef.png" && arraigner1.x - 1 >= 0 && arraigner1.idProchain != joueur.getId()){
        document.getElementById(arraigner1.pos).src = niveau.tuile;
        arraigner1.x -= 1;
        arraigner1.setPos();
        document.getElementById(arraigner1.pos).src = "img/arraigner.png";
    }
    mortArraigner();

}

//Mouvements périodiques du niveau
function mouvementPeriodique() {
    //Mouvement du feu
    if(niveau.emp == "niv1"){
        mouvementFeu = setInterval(bougeFeu, feu1.vitesse);
    }
    //Mouvement de l'araigné
    else if(niveau.emp == "dungeon" && arraigner1.vie != 0){
        mouvementArraigner = setInterval(bougeArraigner, arraigner1.vitesse);
    }
}

//Confirmation pour quitter la partie
function confirmeQuitter() {
    let quitter = confirm("Voulez-vous vraiment quitter la partie en cours?");
    if(quitter == true){
        location.reload();
    }
}

//Confirmation pour recommencer la partie
function confirmeRecommencer() {
    let restart = confirm("Voulez-vous vraiment quitter la partie en cours?");
    if(restart == true){
        clearInterval(mouvementFeu);
        clearInterval(mouvementArraigner);
        resetVar();
        document.getElementById(joueur.id).src = niveau.tuile;
        initialise();
    }
}

//Fonctionne dans Firefox mais pas chrome??????
//Cookie dans chrome????????????????????????????????????????

//Écrit un cookie
function setCookie(_nom, _valeur, _temps) {
    let d = new Date();
    d.setTime(d.getTime() + (_temps*24*60*60*1000));
    let exp = "expires="+ d.toUTCString();
    document.cookie = _nom + "=" + _valeur + ";" + exp + ";path=/";
  }

//Retourne un cookie
function getCookie(_nom) {
    let name = _nom + "=";
    let dNom = decodeURIComponent(document.cookie);
    let ca = dNom.split(';');

    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }

    return "";
  }

//Vérification du nom du joueur
function verifNom() {
    let nom = getCookie("joueur");

    if (nom != "") {
        alert("Bonne chance " + nom);
    }
    else {
        nom = prompt("Entrez votre nom:", "");
        if (nom != "" && nom != null) {
            setCookie("joueur", nom, 365);
        }
    }
}

//Vérification du score à comparer aux autres scores enregistrer
function verifScore() {

    for(let j = 0; j < noms.length; j++) {

        let nomJr = getCookie("joueur");

        if(scoreActuel > scores[j]){
            scores.splice(j, 0, scoreActuel);
            noms.splice(j, 0, nomJr);
            console.log(noms);
            console.log(scores);
            noms.pop();
            scores.pop();
            break;
        }
    }

    for(let i = 0; i < scores.length; i++){
        setCookie("score" + (i+1), scores[i], 365);
    }

}

//Fait jouer l'audio des différents composants du jeu
function playAudio(x) {
    
    let sc = document.getElementById("audio");
    sc.volume = 0.2;

    if(x == "coin")
        sc.src = "sons/coin.mp3";
    else if(x == "feu")
        sc.src = "sons/feu.mp3"
    else if(x == "pic")
        sc.src = "sons/pic.mp3"
    else if(x == "paye")
        sc.src = "sons/paye.mp3";
    else if(x == "swing")
        sc.src = "sons/swing.mp3";
    else if(x == "arraigner")
        sc.src = "sons/arraigner.mp3";
    else if(x == "hitArraigner")
        sc.src = "sons/hitArraigner.mp3";
    else if(x == "mortArraigner")
        sc.src = "sons/mortArraigner.mp3";
    else if(x == "unlock")
        sc.src = "sons/unlock.mp3";
    else if(x == "fin")
        sc.src = "sons/fin.mp3";

    sc.play();
    
}
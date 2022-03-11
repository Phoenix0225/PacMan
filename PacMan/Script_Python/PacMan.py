###################################
# Jeu de pac-man
# 18 février 2022
# Francis Blanchette, Jérémy Lord et Cédric Noel
###################################

import RPi.GPIO as GPIO
import time
import logging
import threading
import random
import os
from Sonar import Sonar
from Carte import Carte
import paho.mqtt.client as pah

sortie = (0,0)
pacMan = (0,0)

# Valide si le jeu ouvre pour la première fois
firstTime = True

# MQTT
broker  = "localhost"
client  = pah.Client("client-publisher")
subscri = pah.Client("client-subscriber")

print("Connecting to broker ",broker)
client.connect(broker)

def printDebut():
    print("----------Bienvenu dans notre jeu de Pac-Man----------------")
    print("------------------------------------------------------------")
    print("-- Pour avancer, appuyer sur le bouton rouge              --")
    print("-- Pour reculer ,appuyer sur le bouton bleu               --")
    print("-- Pour aller à gauche, appuyer sur le bouton vert        --")
    print("-- Pour aller à droite ,appuyer sur le bouton jaune       --")
    print("------------------------------------------------------------")

# Setup des GPIO
def setup():
    
    GPIO.setwarnings(False)
    GPIO.setmode(GPIO.BOARD)
    
    # Setup des boutons
    GPIO.setup(37, GPIO.IN, pull_up_down=GPIO.PUD_DOWN) # Bouton vert
    GPIO.setup(35, GPIO.IN, pull_up_down=GPIO.PUD_DOWN) # Bouton rouge
    GPIO.setup(33, GPIO.IN, pull_up_down=GPIO.PUD_DOWN) # Bouton Bleu
    GPIO.setup(31, GPIO.IN, pull_up_down=GPIO.PUD_DOWN) # Bouton jaune

    #Setup des LED
    GPIO.setup(32, GPIO.OUT) # Lumiere Jaune
    GPIO.setup(36, GPIO.OUT) # Lumiere Bleu
    GPIO.setup(38, GPIO.OUT) # Lumiere Rouge
    GPIO.setup(40, GPIO.OUT) # Lumiere Vert
    
    #Setup du buzzer
    GPIO.setup(15, GPIO.OUT) # Buzzer

# Valide si le joueur peut effectuer un déplacement
def valid_position(pacman, deplacement):
    mov1, mov2 = pacman
    if deplacement == "D":
        if mov1 < 19:
            a,b =carte.regarde_au_loin(sonar1.getDistance(), "D")
            je_publie_pac_man(a, str(b))
            return True
    elif deplacement == "W":
        if mov2 > 0:
            a,b = carte.regarde_au_loin(sonar1.getDistance(), "W")
            je_publie_pac_man(a, str(b))
            return True
    elif deplacement == "S":
        if mov2 < 19:
            a,b = carte.regarde_au_loin(sonar1.getDistance(), "S")
            je_publie_pac_man(a, str(b))
            return True
    elif deplacement == "A":
        if mov1 > 0:
            a,b = carte.regarde_au_loin(sonar1.getDistance(), "A")
            je_publie_pac_man(a, str(b))
            return True
    else:
        return False

# Retourne la position de pacman
def getPublishPosition():
    p1, p2 = carte.getPacMan()
    p = str(p2) + "-" + str(p1)
    return p

#Thread pour les boutons
def thread_bouton():
    sonar1 = Sonar(16,18)
    
    pacman = carte.getPacMan()
    mov2, mov1 = pacman
    
    while True:
        pacman = carte.getPacMan()
        # Valide qu'un bouton n'est pas deja pesse
        if not any((GPIO.input(37), GPIO.input(35), GPIO.input(33), GPIO.input(31))):       
            if GPIO.input(37) == GPIO.HIGH:  #Bouton Jaune
                print("Pac-Man tourne à droite")
                if valid_position(pacman, "D"):
                    a, b, c = carte.y_a_t_il_un_monstre(pacman, "D")
                    if a:
                        pacman = b
                        GPIO.output(32,1) # Alume la lumière
                    else :
                        if c == "sortie":
                            je_publie_pac_man("sortie", str("sortie"))
                            time.sleep(1)
                        elif c == "mort":
                            je_publie_pac_man("mort", str(getPublishPosition()))
                            time.sleep(1)
                        GPIO.output(15,1)
                        time.sleep(0.5)
                        GPIO.output(15,0)
                else:
                    print("Pac-Man ne peut pas faire ce mouvement")
                    GPIO.output(15,1)
                    time.sleep(1)
                    GPIO.output(15,0)

                time.sleep(0.5)
                GPIO.output(32,0)
                print("Votre position", carte.getPacMan())
                p1, p2 = carte.getPacMan()
                p = str(p1) + "-" + str(p2)
                je_publie_pac_man("pacman", str(p))

            if GPIO.input(35) == GPIO.HIGH: #Bouton bleu             
                print("Pac-Man recule")
                if valid_position(pacman, "S"):
                    a, b, c = carte.y_a_t_il_un_monstre(pacman, "S")
                    if a:
                        pacman = b
                        GPIO.output(36,1) # Alume la lumière
                    else :
                        if c == "sortie":
                            je_publie_pac_man("sortie", str("sortie"))
                            time.sleep(1)
                        elif c == "mort":
                            je_publie_pac_man("mort", str(getPublishPosition()))
                            time.sleep(0.5)
                        GPIO.output(15,1)
                        time.sleep(1)
                        GPIO.output(15,0)
                else:
                    print("Pac-Man ne peut pas faire ce mouvement")
                    GPIO.output(15,1)
                    time.sleep(1)
                    GPIO.output(15,0)
                time.sleep(0.5)
                GPIO.output(36,0)
                print("Votre position", carte.getPacMan())
                p1, p2 = carte.getPacMan()
                p = str(p1) + "-" + str(p2)
                je_publie_pac_man("pacman", str(p))

            if GPIO.input(33) == GPIO.HIGH: #Bouton rouge
                print("Pac-Man avance")
                if valid_position(pacman, "W"):
                    a, b, c = carte.y_a_t_il_un_monstre(pacman, "W")
                    if a:
                        pacman = b
                        GPIO.output(38,1) # Alume la lumière
                    else :
                        if c == "sortie":
                            je_publie_pac_man("sortie", str("sortie"))
                            time.sleep(1)
                        elif c == "mort":
                            je_publie_pac_man("mort", str(getPublishPosition()))
                            time.sleep(1)
                        GPIO.output(15,1)
                        time.sleep(1)
                        GPIO.output(15,0)
                else:
                    print("Pac-Man ne peut pas faire ce mouvement")
                    GPIO.output(15,1)
                    time.sleep(1)
                    GPIO.output(15,0)
                time.sleep(0.5)
                GPIO.output(38,0)
                print("Votre position", carte.getPacMan())
                p1, p2 = carte.getPacMan()
                p = str(p1) + "-" + str(p2)
                je_publie_pac_man("pacman", str(p))

            if GPIO.input(31) == GPIO.HIGH: #Bouton vert
                print("Pac-Man tourne à gauche")
                if valid_position(pacman, "A"):
                    a, b, c = carte.y_a_t_il_un_monstre(pacman, "A")
                    if a:
                        pacman = b
                        GPIO.output(40,1) # Alume la lumière
                    else :
                        if c == "sortie":
                            je_publie_pac_man("sortie", str("sortie"))
                            time.sleep(1)
                        elif c == "mort":
                            je_publie_pac_man("mort", str(getPublishPosition()))
                            time.sleep(1)
                        GPIO.output(15,1)
                        time.sleep(1)
                        GPIO.output(15,0)
                else:
                    print("Pac-Man ne peut pas faire ce mouvement")
                    GPIO.output(15,1)
                    time.sleep(1)
                    GPIO.output(15,0)
                time.sleep(0.5)
                GPIO.output(40,0)
                print("Votre position", carte.getPacMan())
                p1, p2 = carte.getPacMan()
                p = str(p1) + "-" + str(p2)
                je_publie_pac_man("pacman", str(p))
                
# Publie la position de pac-man au MQTT
def je_publie_pac_man(a, b):
    client.publish(a, b)
    print(carte.getCarte())

# Recoit le message MQTT qui dit de commencer la partie
def on_message(client, userdate, message):
    print("Message : ", message.payload.decode("utf-8"))
    if str(message.payload.decode("utf-8")) == "commencer" :
        debuter()

# Initialise une nouvelle partie
def debuter():
    print("Nouvelle partie")
    #Initialise la carte
    mur = random.randint(5, 20)
    global firstTime

    carte.setCarte()

    print(carte.getPacMan())

    p1, p2 = carte.getPacMan()
    p = str(p1) + "-" + str(p2)
    je_publie_pac_man("pacman", str(p))

    # Si première fois qu'on démarre le jeu, on part le thread pour les boutons
    if firstTime :
        th_bouton = threading.Thread(target=thread_bouton)
        th_bouton.start()
        firstTime = False

# Ferme le jeu
def destroy():
    GPIO.cleanup()
    exit()

#Début du programme
if __name__ == '__main__':

    try:
        #Initialise les GPIO
        setup()

        #Affiche le début du jeu
        printDebut()

        #Déclare le sonar 
        sonar1 = Sonar(16,18)

        mur = random.randint(5, 20)
        carte = Carte(int(mur))
        carte.setCarte()

        f = open('StartGame.txt', 'r')
        file_contents = f.read()
        print(file_contents)
        f.close()

        #MQTT
        subscri.on_message = on_message

        subscri.connect(broker)
        subscri.subscribe("jeu")
        subscri.loop_forever()
    except KeyboardInterrupt:
        destroy()

###################################
# Jeu de pac-man
# 18 février 2022
# Francis Blanchette, Jérémy Lord et Cédric Noel
###################################

import random
import RPi.GPIO as GPIO
import time

class Carte:

    #Tableau du niveau
    carte = [ [0]*20 for i in range(20)]

    #Nombre de mur dans le niveau
    nbrMurGen = 0

    # Pacman a 0,0
    pac_man = (0,0)

    def __init__(self, nbMur):
        self.nbrMurGen = nbMur
        #Setup du buzzer
        GPIO.setup(15, GPIO.OUT) # Buzzer
        
        self.carte = [ [0]*20 for i in range(20)]
        self.pac_man = (0,0)

    #Regarde si la tuile est prise
    #Retourne True si la case est libre
    def checkTuile(self,y, x):
        if self.carte[y][x] == 'S'or self.carte[y][x] == 'P' or self.carte[y][x] == 'M' or self.carte[y][x] == 'X':
            return False
        else :
            return True

    #Le nombre de mur entrer est invalide
    def setCarte(self):

        #Réinitialise les variables
        self.carte = [ [0]*20 for i in range(20)]
        self.pac_man = (0,0)
        
        #   0=haut, 1=droite, 2=bas, 3=gauche 
        coteSortie = random.randrange(4)
        #   Position de la sortie selon le coter
        positionSortie = random.randrange(20)

        if coteSortie == 0:
            self.carte[positionSortie][0] = 'S'
        elif coteSortie == 1:
            self.carte[19][positionSortie] = 'S'
        elif coteSortie == 2:
            self.carte[positionSortie][19] = 'S'
        elif coteSortie == 3:
            self.carte[0][positionSortie] = 'S'

        #Permet de voir si la tuile est occuper
        tuilePrise = True

        while tuilePrise:
            y = random.randrange(20)
            x = random.randrange(20)
            if self.checkTuile(y, x):
                tuilePrise = False
                self.carte[y][x] = 'P'
                self.pac_man = (y,x)

        #Nombre de monstre generer
        monstre = 0
        while monstre < 4:
            tuilePrise = True
            while tuilePrise:
                y = random.randrange(20)
                x = random.randrange(20)
                if self.checkTuile(x, y):
                    tuilePrise = False
                    self.carte[y][x] = 'M'
                    monstre += 1

        #Nombre de mur generer
        mur = 0
        while mur < self.nbrMurGen:
            tuilePrise = True
            while tuilePrise:
                y = random.randrange(20)
                x = random.randrange(20)

                if self.checkTuile(x, y):
                    tuilePrise = False
                    self.carte[y][x] = 'X'
                    mur += 1

        print('Niveau generer!')

    #Retourne pac-man
    def getPacMan(self):
        return self.pac_man

    #Retourne la carte
    def getCarte(self):
        return self.carte

    #Valide ce qu'il y a devant pacman selon de déplacement
    def y_a_t_il_un_monstre(self, pacman, deplacement):
        mov1, mov2 = pacman
        if deplacement == "D":
            mov1 = mov1 + 1
        elif deplacement == "W":
            mov2 = mov2 - 1
        elif deplacement == "S":
            mov2 = mov2 + 1
        elif deplacement == "A":
            mov1 = mov1 - 1
        
        val = self.carte[mov1][mov2]
        obstacle = ""
        if(val == 0):
            pacman = (mov1, mov2)
            self.updatePacMan(pacman)
            return True, pacman, "."
        elif(val == "M"):
            print("Pacman est mort.....")
            obstacle = "mort"
        elif(val == "X"):
            print("Pacman a frappé un mur!!")
            obstacle = "mur"
            GPIO.output(15,1)
            time.sleep(1)
            GPIO.output(15,0)
        elif(val == "S"):
            f = open('Win.txt', 'r')
            file_contents = f.read()
            print(file_contents)
            f.close()
            obstacle = "sortie"

        return False, pacman, obstacle

    #Retourne la carte dans un format facile a lire
    def getBelleCarte(self):
        carte2 = [ [0]*20 for i in range(20)]
        for a in range(20):
            for b in range(20):
                carte2[b][a] = self.carte[a][b]
            print(carte2[a])

    #Met a jout la position de pac-man
    def updatePacMan(self, newPacMan):
        p1, p2 = self.pac_man
        self.carte[p1][p2] = 0
        
        p1,p2 = newPacMan
        self.carte[p1][p2] = "P"

        self.pac_man = newPacMan

    # Valide ce qu'il y a devant pacman selon les informations du sonar
    def regarde_au_loin(self, distance, mouvement):
        if distance < 10 and distance != 0:
            print("BOOM")
            self.mort_de_pacman()
        elif distance >= 20 and distance < 30:
            return self.valide_next(mouvement, 2)
        elif distance >= 30 and distance < 40:
            return self.valide_next(mouvement, 3)
        elif distance >= 40 and distance < 50:
            return self.valide_next(mouvement, 4)
        elif distance >= 50:
            print("Pac-Man ne voit rien")
    
        return ("libre", "0-0")

    # Retourne ce qui se trouve devant pacman selon le nombre de case a vérifier 
    def valide_next(self, mouvement, nbr_case):
        x, y = self.pac_man

        for a in range(nbr_case):
            if mouvement == "W":
                y = y - 1
            elif mouvement == "S":
                y = y + 1
            elif mouvement == "A":
                x = x - 1
            elif mouvement == "D":
                x = x + 1
               
            if y < 0 or y > 19 or x < 0 or x > 19:
                print("La voie est libre")
                return ("libre", "0-0")
                break
                
            if self.carte[x][y] == "M":
                print("Il y a un monstre dans ", a, " case")
                p = str(x) + "-" + str(y)
                return ("monstre", str(p))
                break
            elif self.carte[x][y] == "X":
                print("Il y a un mur dans ", a, " case")
                p = str(x) + "-" +  str(y)
                return ("mur", str(p))
                break
            elif self.carte[x][y] == "S":
                print("La sortie est dans ", a, " case")
                p = str(x) + "-" +  str(y)
                return ("sortie", str(p))
                break
            elif a == nbr_case-1:
                print("La voie est libre")
                return ("libre", "0-0")
                break
    
    # pacman est mort
    def mort_de_pacman(self):
        f = open('Dark_Vador.txt', 'r')
        file_contents = f.read()
        print(file_contents)
        f.close()
        GPIO.output(15,1)
        time.sleep(1)
        GPIO.output(15,0)
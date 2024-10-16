# Le Jeu de Noé

## Description

Le jeu de Noé est un jeu qui se joue initialement avec un paquet de 52 cartes classique.
Un joueur est nommé maître du jeu (MJ), il tiendra le paquet.

### Initialisation du jeu
- Le MJ distribue "aléatoirement" quatre cartes à chaque joueur, lui compris.
- Trois de ces cartes représentent des points de vie. Elles sont placées verticalement par rapport au joueur.
- La dernière carte appelée "bouclier" représente la défense. Elle est placée horizontalement par rapport au joueur.

### Tour de jeu
Le joueur dont c'est le tour a quatre choix possible.

- Attaquer le joueur à sa droite ou à sa gauche.
- Charger une attaque.
- Renforcer son bouclier.
- Changer le bouclier de n'importe quel joueur.

### Fin de partie
Un joueur est éliminé quand il n'a plus de vie. La partie se termine quand il ne reste plus qu'un joueur en course, qui devient alors le gagnant.

## Mécaniques
### Valeur des cartes
On attribue des points à des cartes, As = 1 2 = 2 etc... Valet = 11, Dame = 12 et Roi = 13.
### Points de vie
Les points de vie sont la somme des cartes qui sont placées tout devant le joueur. Au début, il y en a trois et seulement le déroulé de la partie moins. Exemple : Si un joueur a devant lui Dame de pique | 8 de carreaux | As de trèfle, il aura 12 + 8 + 1 (21) points de vie.
### Charge d'attaque
Quand un joueur charge une attaque, le MJ lui donne une carte face cachée. Elle ne sera révélée qu'au moment d'une attaque. 
Un joueur peut cumuler des charges jusqu'à trois.
### Renforcement de bouclier
Quand un joueur renforce son bouclier, le MJ lui donne une carte face cachée. Le joueur placera la carte face cachée de la même manière que son bouclier.
Elle ne sera révélée qu'au moment d'une attaque.
Le renforcement de bouclier ne tient qu'un tour.
### Attaque
Quand un joueur (A) attaque un autre joueur (B), voici le déroulé :

- Le MJ sort une carte du jeu qui représente l'attaque (Att).
- Si A possède des charges, il les révèle (Ch 1,2,3)
- L'attaque de A sera alors de Att + Ch 1 + Ch 2 + Ch 3
- Si l'attaque de A ne dépasse pas la valeur du bouclier de B, l'interaction est terminée.
- Sinon, si B possède un renforcement de bouclier (Ren), il le révèle sinon (Ren = 0). Sa défense devient Bou + Ren.
- Si l'attaque de A ne dépasse pas la valeur Bou + Ren, l'interaction est terminée.
- Sinon, la différence Att + Ch1 + Ch2 + Ch3 - Bou - Ren est infligée aux points de vie de B.
- Dans le cas où B possèdait des charges d'attaque : en perdant ses points de vie, il perd également toutes ses charges.
En pratique, le MJ s'arrangera avec ce qu'il y a dans le paquet pour transformer les cartes points de vie de B pour qu'elles correspondent au point de vie de B.

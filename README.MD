# Installation
Si vous souhaitez installer l'API en local, il vous suffit de :
1. git clone le repo.
2. Puis, installez les nodes-modules via votre gestionnaire de paquet *(npm install)*

## Quelques commandes à connaître
Voici la liste des commandes disponibles :
- npm run watch : permet de lancer l'application en mode développement / locale
- npm run server-prod : permet de lancer l'application en mode production
- npm run test : permet de lancer tous les tests. Vous pouvez voir un rapport du coverage directement dans le dossier (*coverage/lcov-report/index.html*) après avoir exécuté cette commande.

---
# Documentation sur l'API
## Généralités
Cette API vous permet de transformer un texte fouillis, en un super texte justifié !

*Comment l'utiliser ??*

Rien de plus simple. Une première requête pour se connecter, une autre pour utiliser le service. :) Alors convaincu ?

## Développeur
### L'authentification
Pour s'authentifier, il suffit de faire une requête POST contenant un JSON en corps sous la forme {"email": "foo@bar.com"}. Vous recevrez un token en cadeau!

**URL : https://tictactrip.hidemyhome.ovh/api/token**

Quelques exemples, parce qu'on est sympa chez Tictactrip! :)

Un exemple avec curl :
```bash
curl --location --request POST 'https://tictactrip.hidemyhome.ovh/api/token' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "foo@bar.com"
}'
```

Et avec axios :
``` js
const axios = require('axios')
const data = JSON.stringify({
  "email": "foo@bar.com"
})

const config = {
  method: 'post',
  url: 'https://tictactrip.hidemyhome.ovh/api/token',
  headers: { 
    'Content-Type': 'application/json'
  },
  data,
}

axios(config)
.then((response) => {
  console.log(JSON.stringify(response.data))
})
.catch((error) => {
  console.log(error)
})

```

### Justification du texte
Pour utiliser notre service, nous avons besoin du token en en-tête (ou header pour les puristes). Il doit être sous la forme token --> [ici le token retourné par l'API].  
Ensuite, il vous suffit de faire à nouveau une requête POST contenant un texte (en mode plain/text pour les puristes). Si vous êtes sage, et, si vous n'avez pas abusé de notre générosité, vous serez récompensé par le beau sésame ! Un texte tout joli et justifier.

**URL : https://tictactrip.hidemyhome.ovh/api/justify**

Un exemple avec curl :
```bash
curl --location --request POST 'https://tictactrip.hidemyhome.ovh/api/justify' \
--header 'token: 2022-06-07-wKkCcDXVDc-VY7rY735Ey' \
--header 'Content-Type: text/plain' \
--data-raw ''\''Mon texte tout moche!'\''
'
```

Et avec axios :
``` js
const axios = require('axios')
const data = 'Mon texte tout moche!'

const config = {
  method: 'post',
  url: 'https://tictactrip.hidemyhome.ovh/api/justify',
  headers: { 
    'token': '2022-06-07-wKkCcDXVDc-VY7rY735Ey', 
    'Content-Type': 'text/plain'
  },
  data,
}

axios(config)
.then((response) => {
  console.log(JSON.stringify(response.data))
})
.catch((error) => {
  console.log(error)
})

```


## Sécurités, limitations, vie privée
### Sécurités
- Un token est valable **sur la journée en cours**. 
Exemple, le token commençant par *2022-06-07*, sera valable **uniquement** le 7 juin 2022. Il sera automatiquement périmé le 08 juin 2022.
- Il peut être révoqué facilement en refaisant une authentification

### Limitations
Sur la version gratuite, vous avez le droit à 80 000 mots par jour, et, par utilisateur.

### Vie privée
Nous stockons **exclusivement** l'adresse mail de connexion + le dernier token généré + votre compteur de mot.
Grâce au RPGD, vous pouvez nous demander les données que nous avons sur vous, et, aussi, en demandé l'effacement. Rien de plus simple, envoyez-moi un message avec l'adresse mail en question.

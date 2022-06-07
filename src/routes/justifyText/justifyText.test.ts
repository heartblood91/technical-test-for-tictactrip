import { database_util, date_util } from '../../utils'
import token from '../token'
import justifyText from './justifyText'

const setTheDatabase = async ({
  counter_of_words,
  user_token,
}: {
  counter_of_words?: number,
  user_token?: string,
}) => {
  const now = date_util.getTodaysDate()
  let token
  if (user_token) {
    token = user_token
  } else {
    token = `${now}-fake_token_1`
  }

  const new_database: database_util.DatabaseType = {
    user: {
      'user1@email.com': {
        token,
        counter_of_words,
      }
    }
  }

  await database_util.db.save(new_database)
}

describe('justifyText', () => {
  describe('countNumberOfWords', () => {
    it('should return the number of word in a text', () => {
      const sentence_with_twenty_words = 'Logoden biniou degemer mat an penn, ar bed serret mouchouer. Vuzell goulou harzhal c’hezeg dilhad ijinañ, vihanañ daouzek bod houad.'

      const number_of_words = justifyText.countNumberOfWords(sentence_with_twenty_words)

      expect(number_of_words).toEqual(20)
    })
  })

  describe('saveNumberOfWordsOnUser', () => {
    beforeEach(async () => {
      await setTheDatabase({ counter_of_words: 50 })
    })

    describe('if the limit is NOT exceeded', () => {
      it('should update the database', async () => {
        const previous_database = await database_util.db.read()

        const user_email = 'user1@email.com'
        await justifyText.saveNumberOfWordsOnUser({
          user_email,
          number_of_words: 70,
        })

        const next_database = await database_util.db.read()

        expect(previous_database.user?.[user_email]?.counter_of_words).toEqual(50)
        expect(next_database.user?.[user_email]?.counter_of_words).toEqual(120)
      })
    })

    describe('if the limit is exceeded', () => {
      it('should NOT update the database', async () => {
        const previous_database = await database_util.db.read()

        const user_email = 'user1@email.com'
        await expect(justifyText.saveNumberOfWordsOnUser({
          user_email,
          number_of_words: 80000,
        })).rejects.toThrow()

        const next_database = await database_util.db.read()

        expect(previous_database.user[user_email]?.counter_of_words).toEqual(50)
        expect(next_database.user[user_email]?.counter_of_words).toEqual(50)
      })
    })
  })

  describe('saveNumberOfWordsOnUser without beforeEach', () => {
    describe('if the number of words is not defined', () => {
      it('should update the database', async () => {
        await setTheDatabase({})
        const previous_database = await database_util.db.read()

        const user_email = 'user1@email.com'
        await justifyText.saveNumberOfWordsOnUser({
          user_email,
          number_of_words: 70,
        })

        const next_database = await database_util.db.read()

        expect(previous_database.user[user_email]?.counter_of_words).toEqual(undefined)
        expect(next_database.user[user_email]?.counter_of_words).toEqual(70)
      })
    })
  })


  describe('justifyIt', () => {
    it('should return the text but justify', () => {
      const content = 'Longtemps, je me suis couché de bonne heure. Parfois, à peine ma bougie éteinte, mes yeux se fermaient si vite que je n’avais pas le temps de me dire : « Je m’endors. » Et, une demi-heure après, la pensée qu’il était temps de chercher le sommeil m’éveillait ; je voulais poser le volume que je croyais avoir encore dans les mains et souffler ma lumière ; je n’avais pas cessé en dormant de faire des réflexions sur ce que je venais de lire, mais ces réflexions avaient pris un tour un peu particulier ; il me semblait que j’étais moi-même ce dont parlait l’ouvrage : une église, un quatuor, la rivalité de François Ier et de Charles-Quint.\nCette croyance survivait pendant quelques secondes à mon réveil ; elle ne choquait pas ma raison mais pesait comme des écailles sur mes yeux et les empêchait de se rendre compte que le bougeoir n’était plus allumé.\nPuis elle commençait à me devenir inintelligible, comme après la métempsycose les pensées d’une existence antérieure ; le sujet du livre se détachait de moi, j’étais libre de m’y appliquer ou non ; aussitôt je recouvrais la vue et j’étais bien étonné de trouver autour de moi une obscurité, douce et reposante pour mes yeux, mais peut-être plus encore pour mon esprit, à qui elle apparaissait comme une chose sans cause, incompréhensible, comme une chose vraiment obscure. Je me demandais quelle heure il pouvait être ; j’entendais le sifflement des trains qui, plus ou moins éloigné, comme le chant d’un oiseau dans une forêt, relevant les distances, me décrivait l’étendue de la campagne déserte où le voyageur se hâte vers la station prochaine ; et le petit chemin qu’il suit va être gravé dans son souvenir par l’excitation qu’il doit à des lieux nouveaux, à des actes inaccoutumés, à la causerie récente et aux adieux sous la lampe étrangère qui le suivent encore dans le silence de la nuit, à la douceur prochaine du retour.'

      const content_justify = justifyText.justifyIt(content)

      const value_expected = 'Longtemps, je me suis couché de bonne heure. Parfois, à peine ma bougie éteinte,\n' +
        'mes yeux se fermaient si vite que je n’avais pas le temps de me dire : « Je\n' +
        'm’endors. » Et, une demi-heure après, la pensée qu’il était temps de chercher le\n' +
        'sommeil m’éveillait ; je voulais poser le volume que je croyais avoir encore\n' +
        'dans les mains et souffler ma lumière ; je n’avais pas cessé en dormant de faire\n' +
        'des réflexions sur ce que je venais de lire, mais ces réflexions avaient pris un\n' +
        'tour un peu particulier ; il me semblait que j’étais moi-même ce dont parlait\n' +
        'l’ouvrage : une église, un quatuor, la rivalité de François Ier et de\n' +
        'Charles-Quint.\n' +
        'Cette croyance survivait pendant quelques secondes à mon réveil ; elle ne\n' +
        'choquait pas ma raison mais pesait comme des écailles sur mes yeux et les\n' +
        'empêchait de se rendre compte que le bougeoir n’était plus allumé.\n' +
        'Puis elle commençait à me devenir inintelligible, comme après la métempsycose\n' +
        'les pensées d’une existence antérieure ; le sujet du livre se détachait de moi,\n' +
        'j’étais libre de m’y appliquer ou non ; aussitôt je recouvrais la vue et j’étais\n' +
        'bien étonné de trouver autour de moi une obscurité, douce et reposante pour mes\n' +
        'yeux, mais peut-être plus encore pour mon esprit, à qui elle apparaissait comme\n' +
        'une chose sans cause, incompréhensible, comme une chose vraiment obscure. Je me\n' +
        'demandais quelle heure il pouvait être ; j’entendais le sifflement des trains\n' +
        'qui, plus ou moins éloigné, comme le chant d’un oiseau dans une forêt, relevant\n' +
        'les distances, me décrivait l’étendue de la campagne déserte où le voyageur se\n' +
        'hâte vers la station prochaine ; et le petit chemin qu’il suit va être gravé\n' +
        'dans son souvenir par l’excitation qu’il doit à des lieux nouveaux, à des actes\n' +
        'inaccoutumés, à la causerie récente et aux adieux sous la lampe étrangère qui le\n' +
        'suivent encore dans le silence de la nuit, à la douceur prochaine du retour.'

      expect(content_justify).toEqual(value_expected)
    })
  })

  describe('completeQuery', () => {
    describe('if token is invalid', () => {
      it('should return the status code 401 without justify_text', async () => {
        const {
          status_code,
          justify_text,
        } = await justifyText.completeQuery({
          user_token: 'lkjlkjlkjljlkj',
          text: 'Qui êtes-vous ? - Qui ? " Qui " n\'est autre que la forme qui résulte de la fonction de " qu\'est-ce-que ", et ce que je suis c\'est un homme sous un masque. - Ça je vois... - De toute évidence. Je ne mets pas en doute ton sens de l\'observation, je ne fais que mettre en exergue le paradoxe qui est de demander à un homme masqué qui il est.'
        })

        expect(status_code).toEqual(401)
        expect(justify_text).toEqual(undefined)
      })
    })

    describe('if token is valid', () => {
      describe('if the user excedeed the limit', () => {
        it('should return the status code 402 without justify_text', async () => {
          const user_token = token.create()
          await setTheDatabase({ user_token, counter_of_words: 79999 })

          const {
            status_code,
            justify_text,
          } = await justifyText.completeQuery({
            user_token,
            text: 'Messire, messire, un sarrasin dans une charriote du diable ! c\'est tout ferré y\'a point d\'boeuf pour tirer !'
          })

          expect(status_code).toEqual(402)
          expect(justify_text).toEqual(undefined)
        })
      })
      describe('if the user NOT excedeed the limit', () => {
        it('should return the status code 200 with justify_text', async () => {
          const user_token = token.create()
          await setTheDatabase({ user_token })

          const {
            status_code,
            justify_text,
          } = await justifyText.completeQuery({
            user_token,
            text: 'Tu diras bonjour à ton frère. Bon voyage espèce d\'enfoiré !',
          })

          expect(status_code).toEqual(200)
          expect(justify_text).toEqual('Tu diras bonjour à ton frère. Bon voyage espèce d\'enfoiré !')
        })
      })
    })
  })
})

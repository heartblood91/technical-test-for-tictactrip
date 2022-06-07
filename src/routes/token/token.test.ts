import token from './token'
import { date_util, database_util } from '../../utils'

const clearAndCreateATokenInDatabase = async () => {
  const user_token = token.create()
  const new_database: database_util.DatabaseType = {
    user: {
      'me@tictactrip.fr': {
        token: user_token,
      }
    }
  }

  await database_util.db.save(new_database)

  return user_token
}

describe('token', () => {
  describe('create', () => {
    describe('should return a string', () => {
      const res = token.create()

      expect(typeof res).toEqual('string')
    })
    it('should return an uniq string', () => {
      const a = token.create()
      const b = token.create()

      expect(a).not.toEqual(b)
    })
    it('should return a string size of 32 char', () => {
      const res = token.create()

      expect(res.length).toEqual(32)
    })
    it('should return a string contain hyphens', () => {
      const res = token.create()

      expect(res.match(/-/g)?.length).toEqual(4)
    })
    it('should contain the today s date', () => {
      const res = token.create()

      const today = date_util.getTodaysDate()

      expect(res.match(today)?.length).toEqual(1)
    })
  })

  describe('isValid', () => {
    let user_token =  ''
    beforeEach(async () => {
      user_token = await clearAndCreateATokenInDatabase()
    })

    it('should return true if the token is a really good', async () => {
      const good_token = user_token

      const is_really_good = await token.isValid(good_token)

      expect(is_really_good).toEqual(true)
    })

    it('should return false if the token is falsified', async () => {
      const bad_token = 'is-token-is-invalid'

      const is_really_good = await token.isValid(bad_token)

      expect(is_really_good).toEqual(false)
    })

    it('should return false if the token is not in the database', async () => {
      const good_token_but_not_in_database = token.create()

      const is_really_good = await token.isValid(good_token_but_not_in_database)

      expect(is_really_good).toEqual(false)
    })
  })

  describe('save', () => {
    beforeEach(async () => {
      await database_util.db.reset()
    })

    it('should overwrite the testing database file with my data', async () => {
      await token.save({
        email: 'user@email.com',
        token: 'fake_token'
      })

      const database = await database_util.db.read()

      const value_expected: database_util.DatabaseType = {
        user: {
          'user@email.com': {
            token: 'fake_token',
          }
        }
      }

      expect(database).toEqual(value_expected)
    })

    it('should overwrite the testing database file with my data without losing the present data', async () => {
      await token.save({
        email: 'user1@email.com',
        token: 'fake_token_1'
      })
      await token.save({
        email: 'user2@email.com',
        token: 'fake_token_2'
      })

      const database = await database_util.db.read()

      const value_expected: database_util.DatabaseType = {
        user: {
          'user1@email.com': {
            token: 'fake_token_1',
          },
          'user2@email.com': {
            token: 'fake_token_2',
          },
        }
      }

      expect(database).toEqual(value_expected)
    })
  })

  describe('completeQuery', () => {
    describe('if the email is valid', () => {
      it('should return the user token with status code 200', async () => {
        const valid_email = 'cedric@hire.me'

        const {
          status_code,
          user_token,
        } = await token.completeQuery(valid_email)

        expect(status_code).toEqual(200)
        expect(user_token).not.toEqual('')
        expect(user_token).not.toEqual(undefined)
      })
    })

    describe('if the email is NOT valid', () => {
      it('should return the status code 400', async () => {
        const very_wrong_email = 'another_candidate'

        const {
          status_code,
          user_token,
        } = await token.completeQuery(very_wrong_email)

        expect(status_code).toEqual(400)
        expect(user_token).toEqual(undefined)
      })
    })
  })
})

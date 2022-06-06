import token, { DatabaseType } from './token'
import fs from 'fs'

const clearTestingDatabase = async () => {
  await fs.writeFileSync('src/databases/testing-database.json', JSON.stringify({}))
}

const readTestingDatabase = async () => {
  return JSON.parse(await fs.readFileSync('src/databases/testing-database.json', 'utf-8')) as DatabaseType
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

      const today = new Date().toISOString().split('T')[0]

      expect(res.match(today)?.length).toEqual(1)
    })
  })

  describe('isValid', () => {
    it('should return true if the token is a really good', () => {
      const good_token = token.create()

      const is_really_good = token.isValid(good_token)

      expect(is_really_good).toEqual(true)
    })

    it('should return false if the token is falsified', () => {
      const bad_token = 'is-token-is-invalid'

      const is_really_good = token.isValid(bad_token)

      expect(is_really_good).toEqual(false)
    })
  })

  describe('save', () => {
    beforeEach(async () => {
      await clearTestingDatabase()
    })

    it('should overwrite the testing database file with my data', async () => {
      await token.save({
        email: 'user@email.com',
        token: 'fake_token'
      })
      
      const database = await readTestingDatabase()

      const value_expected: DatabaseType = {
        user: {
          'user@email.com': 'fake_token'
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

      const database = await readTestingDatabase()

      const value_expected: DatabaseType = {
        user: {
          'user1@email.com': 'fake_token_1',
          'user2@email.com': 'fake_token_2'
        }
      }

      expect(database).toEqual(value_expected)
    })
  })
})

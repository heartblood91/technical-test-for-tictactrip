import http from 'http'

import token from './token'
import { database_util } from '../utils'

type ReponseRequestType = {
  data?: string,
  status_code?: number,
  headers?: http.IncomingHttpHeaders,
}

type LoginInputType = {
  email: string,
}

const makeRequest = ({
  path,
  method,
  headers,
  login_input,
  text_input,
}: {
  path: string,
  method?: string,
  headers?: http.OutgoingHttpHeaders,
  login_input?: LoginInputType,
  text_input?: string,
}): Promise<ReponseRequestType> => {
  return new Promise((resolve, reject) => {
    const req = http.request({
      path,
      port: '3000',
      hostname: 'localhost',
      method,
      headers,
    }, (res) => {
      const { statusCode: status_code, headers } = res
      let data = ''
      res.on('data', _data => (data += _data))
      res.on('end', () => resolve({
        data,
        status_code,
        headers,
      }))
    })

    if (login_input) {
      req.write(JSON.stringify(login_input))
    } else if (text_input) {
      req.write(text_input)
    }

    req.on('error', (e) => {
      reject(`problem with request: ${e.message}`)
    })

    req.end()
  })
}

type ApiTokenDataResponseType = {
  token?: string,
}

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

describe('run each routes', () => {
  describe('POST /api/token', () => {
    it('should return an error if login_input is not define', async () => {
      const response = await makeRequest({
        path: '/api/token',
        method: 'POST',
      })
  
      expect(response.status_code).toEqual(400)
    })
    it('should return an error if email is not valid', async () => {
      const response = await makeRequest({
        path: '/api/token',
        method: 'POST',
        login_input: {
          email: 'not_valid'
        },
        headers: {
          'Content-Type': 'application/json'
        }
      })
  
      expect(response.status_code).toEqual(400)
    })
    it('should return a body with content type is application/json', async () => {
      const response = await makeRequest({
        path: '/api/token',
        method: 'POST',
        login_input: {
          email: 'foo1@bar.com'
        },
        headers: {
          'Content-Type': 'application/json'
        }
      })
  
      expect(response.headers?.['content-type']).toContain('application/json')
      expect(response.status_code).toEqual(200)
    })
  
    it('should return a token in JSON format', async () => {
      const response = await makeRequest({
        path: '/api/token',
        method: 'POST',
        login_input: {
          email: 'foo2@bar.com'
        },
        headers: {
          'Content-Type': 'application/json'
        }
      })
  
      const data: ApiTokenDataResponseType = JSON.parse(response.data ?? '')
  
      expect(data).toHaveProperty('token')
    })
  
    it('should return an uniq and valid token', async () => {
      const response = await makeRequest({
        path: '/api/token',
        method: 'POST',
        login_input: {
          email: 'foo3@bar.com'
        },
        headers: {
          'Content-Type': 'application/json'
        }
      })
  
      const data: ApiTokenDataResponseType = JSON.parse(response.data ?? '')
  
      const is_token_valid = await token.isValid(data.token ?? '')
  
      expect(is_token_valid).toEqual(true)
    })
  })

  
  describe('POST /api/justify', () => {
    let user_token =  ''
    beforeEach(async () => {
      user_token = await clearAndCreateATokenInDatabase()
    })

    it('should return an error if token is not define', async () => {
      const response = await makeRequest({
        path: '/api/justify',
        method: 'POST',
      })
  
      expect(response.status_code).toEqual(401)
    })
    it('should return an error if token is not valid', async () => {
      const response = await makeRequest({
        path: '/api/justify',
        method: 'POST',
        headers: {
          token: 'user_token',
        }
      })
  
      expect(response.status_code).toEqual(401)
    })
    it('should return an error if token is revocated', async () => {
      const response = await makeRequest({
        path: '/api/justify',
        method: 'POST',
        headers: {
          token: '2022-06-07-cs7LnWOOuX-4P15HedXzD',
        }
      })
  
      expect(response.status_code).toEqual(401)
    })
    it('should return a body with content type is text/plain', async () => {
      const response = await makeRequest({
        path: '/api/justify',
        method: 'POST',
        headers: {
          token: user_token,
          'Content-Type': 'text/plain'
        },
        text_input: 'C\'est trop calme. j\'aime pas trop beaucoup ça. J\'préfère quand c\'est un peu trop plus moins calme.',
      })

      expect(response.headers?.['content-type']).toContain('text/plain')
      expect(response.status_code).toEqual(200)
    })
  
    it('should return the text but justify', async () => {
      const response = await makeRequest({
        path: '/api/justify',
        method: 'POST',
        headers: {
          token: user_token,
          'Content-Type': 'text/plain'
        },
        text_input: 'C\'est trop calme. j\'aime pas trop beaucoup ça. J\'préfère quand c\'est un peu trop plus moins calme.',
      })
      const data = response.data ?? ''

      const value_expected = 'C\'est trop calme. j\'aime pas trop beaucoup ça. J\'préfère quand c\'est un peu trop\nplus moins calme.'
      expect(data).toEqual(value_expected)
    })
  })
})


import http from 'http'
import token from './token'

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
}: {
  path: string,
  method?: string,
  headers?: http.OutgoingHttpHeaders,
  login_input?: LoginInputType,
}): Promise<ReponseRequestType> => {
  return new Promise((resolve, reject) => {
    const req = http.request({
      path,
      port: '3000',
      hostname: 'localhost',
      method,
      headers: {
        ...headers,
        testing_mode: 'true',
      },
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
    }

    req.on('error', (e) => {
      reject(`problem with request: ${e.message}`)
    })

    req.end()
  })
}

type ApiTokenDataResponse = {
  token?: string,
}

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

    const data: ApiTokenDataResponse = JSON.parse(response.data ?? '')

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

    const data: ApiTokenDataResponse = JSON.parse(response.data ?? '')

    const is_token_valid = token.isValid(data.token ?? '')

    expect(is_token_valid).toEqual(true)
  })
})


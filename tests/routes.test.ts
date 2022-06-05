import http from 'http'

const request = () => {
  return new Promise(resolve => {
    http.get({
      path: '/',
      port: '3000',
      hostname: 'localhost',
    }, (res) => {
      let data = ''
      res.on('data', _data => (data += _data))
      res.on('end', () => resolve(data))
    })
  })
}
 
describe('Get /', () => {
  it('should return hello world', async () => {
    const response = await request()
    expect(response).toEqual('hello world')
  })
})


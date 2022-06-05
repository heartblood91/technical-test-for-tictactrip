import express from 'express'

const app = express()

app.listen(3000, (): void => {
  'Now listening on 3000'
})

app.get('/', (_, res) => {
  res.send('hello world')
})

import express from 'express'

import {
  token,
  justifyText,
} from './routes'
import {
  email_util,
  headers_util,
} from './utils'

const app = express()

app.listen(3000, (): void => {
  'Now listening on 3000'
})

app.use(express.json())
app.use(express.text())

app.post('/api/token', async (req, res) => {
  const { body } = req

  const {
    status_code,
    user_token,
  } = await token.completeQuery(body.email)

  if (status_code === 200) {
    res.status(status_code)
      .json({ token: user_token})
      .send()
  } else {
    res.status(status_code).send()
  }
})

app.post('/api/justify', async (req, res) => {
  const { body, headers } = req
  const text = body ?? ''

  const user_token = headers_util.getOneValueOnHeader(headers.token)

  const {
    status_code,
    justify_text,
  } = await justifyText.completeQuery({
    user_token,
    text,
  })

  if (status_code === 200) {
    res.status(status_code)
      .header('content-type', 'text/plain')
      .send(justify_text)
  } else {
    res.status(status_code).send()
  }

})


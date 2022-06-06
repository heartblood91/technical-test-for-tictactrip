import express from 'express'

import { token } from './routes'
import { email_util } from './utils'

const app = express()

app.listen(3000, (): void => {
  'Now listening on 3000'
})

app.use(express.json())

app.post('/api/token', async (req, res) => {
  const { body, headers } = req
  const is_email_valid = email_util.checkIsMailIsCorrect(body.email)

  if (is_email_valid) {
    const new_token = token.create()

    if (!headers.testing_mode) {
      await token.save({
        email: body.email,
        token: new_token,
      })
    }

    res
      .status(200)
      .json({ token: new_token })
      .send()
  }

  res
    .status(400)
    .send()
})

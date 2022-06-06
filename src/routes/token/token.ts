import fs from 'fs'
import { email_util } from '../../utils'

type TokenType = {
  create: () => string,
  isValid: (token: string) => boolean,
  save: ({email, token}: {email: string, token: string}) => Promise<void>,
}

export type DatabaseType = {
  user: Record<string, string | undefined>,
}

const token = {} as TokenType


const genDatePart = () => new Date().toISOString().split('T')[0]
const genRandomCharPart = () => {
  const char_valid = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const random_chart_size = 10

  let random_chart = ''
  for (let i = 0; i < random_chart_size; i++) {
    const random_number = Math.random() * char_valid.length
    const random_index = Math.floor(random_number)

    random_chart += char_valid.charAt(random_index)
  }

  return random_chart
}

const checkIsANumber = (value: string) => {
  const value_in_number = parseInt(value)

  if (isNaN(value_in_number)) {
    return false
  } else {
    return true
  }
}
const checkRandomDataIsAGoodFormat = (random_date: string) => {
  const [year, month, date] = random_date.split('-')

  const is_real_year = checkIsANumber(year) && year.length === 4
  const is_real_month = checkIsANumber(month) && month.length === 2
  const is_real_date = checkIsANumber(date) && date.length === 2

  if (is_real_date && is_real_month && is_real_year) {
    return true
  } else {
    return false
  }
}
const checkRandomCharIsAGoodFormat = (random_chart: string) => {
  const is_length = random_chart.length === 10
  const is_format = random_chart.match(/^[0-9a-zA-Z]+$/g)?.length === 1

  if (is_length && is_format) {
    return true
  } else {
    return false
  }
} 

token.create = () => `${genDatePart()}-${genRandomCharPart()}-${genRandomCharPart()}`

token.isValid = (token) => {
  const [year, month, date, random_first_part, random_second_part] = token.split('-')
  const random_date = `${year}-${month}-${date}`
  
  const random_data_has_a_good_format = checkRandomDataIsAGoodFormat(random_date)
  const random_first_part_has_a_good_format = checkRandomCharIsAGoodFormat(random_first_part ?? '')
  const random_second_part_has_a_good_format = checkRandomCharIsAGoodFormat(random_second_part ?? '')

  if (random_data_has_a_good_format && random_first_part_has_a_good_format && random_second_part_has_a_good_format) {
    return true
  } else {
    return false
  }
}

token.save = async ({
  token,
  email,
}: {
  token: string,
  email: string,
}) => {
  let file_url
  if (process.env.NODE_ENV === 'test') {
    file_url = 'src/databases/testing-database.json'
  } else {
    file_url = 'src/databases/database.json'
  }

  const database: DatabaseType = JSON.parse(await fs.readFileSync(file_url, 'utf-8'))
  const new_dabase = {
    ...database,
    user: {
      ...database.user,
      [email]: token,
    }
  }
  await fs.writeFileSync(file_url, JSON.stringify(new_dabase))
}

export default token

import {
  date_util,
  database_util,
  email_util,
} from '../../utils'

type TokenType = {
  create: () => string,
  isValid: (token: string) => Promise<boolean>,
  save: ({ email, token }: { email: string, token: string }) => Promise<void>,
  getEmailFromToken: (token: string) => Promise<string>,
  completeQuery: (email: string) => Promise<{ status_code: number, user_token?: string }>,
}


const token = {} as TokenType


const genDatePart = () => date_util.getTodaysDate()

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

const checkIsGoodDate = (random_date: string) => {
  const now = date_util.getTodaysDate()

  if (now === random_date) {
    return true
  } else {
    return false
  }
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

const checkIfUserTokenHasBeenGeneratedByTheAPI = async (user_token: string) => {
  const user_mail = await token.getEmailFromToken(user_token)

  if (user_mail) {
    return true
  } else {
    return false
  }
}

token.create = () => `${genDatePart()}-${genRandomCharPart()}-${genRandomCharPart()}`

token.isValid = async (token) => {
  const [year, month, date, random_first_part, random_second_part] = token.split('-')
  const random_date = `${year}-${month}-${date}`

  const random_date_has_a_good_date = checkIsGoodDate(random_date)
  const random_data_has_a_good_format = checkRandomDataIsAGoodFormat(random_date)
  const random_first_part_has_a_good_format = checkRandomCharIsAGoodFormat(random_first_part ?? '')
  const random_second_part_has_a_good_format = checkRandomCharIsAGoodFormat(random_second_part ?? '')
  const user_token_has_been_generated_by_the_api = await checkIfUserTokenHasBeenGeneratedByTheAPI(token)

  if (
    random_date_has_a_good_date && random_data_has_a_good_format &&
    random_first_part_has_a_good_format && random_second_part_has_a_good_format &&
    user_token_has_been_generated_by_the_api
  ) {
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
  const database = await database_util.db.read()
  const new_database = {
    ...database,
    user: {
      ...database.user,
      [email]: {
        ...database.user?.[email],
        token,
      },
    }
  }

  await database_util.db.save(new_database)
}

token.getEmailFromToken = async (token_id) => {
  const database = await database_util.db.read()

  return Object.entries(database.user).reduce<string>((acc, [key, value]) => {
    if (value?.token === token_id) {
      return key
    } else {
      return acc
    }
  }, '')
}

token.completeQuery = async (email) => {
  const is_email_valid = email_util.checkIsMailIsCorrect(email)

  if (is_email_valid) {
    const user_token = token.create()

    await token.save({
      email,
      token: user_token,
    })

    return {
      status_code: 200,
      user_token,
    }
  } 

  return {
    status_code: 400,
  }
}

export default token

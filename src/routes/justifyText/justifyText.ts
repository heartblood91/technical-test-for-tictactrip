import { database_util, date_util } from '../../utils'
import token from '../token'

type JustifyTextType = {
  countNumberOfWords: (text: string) => number,
  saveNumberOfWordsOnUser: ({ number_of_words, user_email }: { number_of_words: number, user_email: string }) => Promise<void>,
  justifyIt: (text: string) => string,
  completeQuery: ({ user_token, text }: { user_token: string, text: string }) => Promise<{ status_code: number, justify_text?: string }>,
}

const justifyText = {} as JustifyTextType

justifyText.countNumberOfWords = (text) => {
  return text.split(' ').length
}

const getHasThelimitBeenExceeded = (number_of_words: number) => {
  if (80000 < number_of_words) {
    return true
  } else {
    return false
  }
}

justifyText.saveNumberOfWordsOnUser = async ({
  user_email,
  number_of_words,
}) => {
  const database = await database_util.db.read()
  const { token, counter_of_words } = database.user[user_email] ?? {}

  const now = date_util.getTodaysDate()
  const [year, month, date] = token?.split('-') ?? []
  const token_date = `${year}-${month}-${date}`

  let next_counter_of_words
  if (now === token_date) {
    next_counter_of_words = (counter_of_words ?? 0) + number_of_words
  } else {
    next_counter_of_words = number_of_words
  }

  const has_limit_been_exceeded = getHasThelimitBeenExceeded(next_counter_of_words)

  if (has_limit_been_exceeded) {
    throw new Error('Tu as depassé les bornes des limites! Non mais oh!')
  } else {
    const new_database = {
      ...database,
      user: {
        ...database.user,
        [user_email]: {
          ...database.user[user_email],
          token: token ?? '',
          counter_of_words: next_counter_of_words,
        }
      }
    }
    await database_util.db.save(new_database)
  }
}

const recursivelySplitContent = ({
  content_length_max,
  content,
  array_of_lines,
}: {
  content_length_max: number,
  content: string,
  array_of_lines: Array<string>,
}) => {
  if (content_length_max < content.length) {
    const content_with_max_size = content.slice(0, content_length_max + 1)

    let last_index_of_the_first_space
    if (content_with_max_size.includes('\n')) {
      last_index_of_the_first_space = content_with_max_size.indexOf('\n')
    } else {
      last_index_of_the_first_space = content_with_max_size.lastIndexOf(' ')
    }

    const substring = content.substring(0, last_index_of_the_first_space)
    const remaining = content.substring(last_index_of_the_first_space).trim()

    array_of_lines.push(substring)

    recursivelySplitContent({ content_length_max, content: remaining, array_of_lines })
  } else {
    array_of_lines.push(content)
  }
}

justifyText.justifyIt = (content) => {
  const content_length_max = 80
  const array_of_lines: Array<string> = []

  recursivelySplitContent({
    content_length_max,
    content,
    array_of_lines,
  })

  const content_justify = array_of_lines.join('\n')

  return content_justify
}

justifyText.completeQuery = async ({
  user_token,
  text,
}: {
  user_token: string,
  text: string,
}) => {
  const is_token_valid = await token.isValid(user_token)
  const user_email = await token.getEmailFromToken(user_token)

  if (is_token_valid) {
    try {
      const number_of_words = await justifyText.countNumberOfWords(text)

      await justifyText.saveNumberOfWordsOnUser({
        number_of_words,
        user_email,
      })

      const justify_text = justifyText.justifyIt(text)

      return {
        status_code: 200,
        justify_text,
      }
    } catch (e) {
      return {
        status_code: 402,
      }
    }
  } else {
    return {
      status_code: 401,
    }
  }
}

export default justifyText

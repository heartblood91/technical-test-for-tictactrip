import { checkIsMailIsCorrect } from './email'

describe('email-util', () => {
  it('valid mail', () => {
    const array_of_valid_mails = [
      'email@example.com',
      'firstname.lastname@example.com',
      'email@subdomain.example.com',
      'firstname+lastname@example.com',
      '"email"@example.com',
      '1234567890@example.com',
      'email@example-one.com',
      '_______@example.com',
      'email@example.name',
      'email@example.museum',
      'email@example.co.jp',
      'firstname-lastname@example.com',
      'email@example.web',
      '"email"@example.com',
    ]

    const all_mails_are_valid = array_of_valid_mails.reduce<boolean>((acc, val) => {
      const is_valid = checkIsMailIsCorrect(val)

      if (acc && !is_valid) {
        return false
      } else {
        return acc
      }
    }, true)

    expect(all_mails_are_valid).toEqual(true)
  })

  describe('testing a list of wrong email', () => {
    it('should return false on every mail', () => {
      const array_of_invalid_mails = [
        'plainaddress',
        '#@%^%#$@#$@#.com',
        '@example.com',
        'Joe Smith <email@example.com>',
        'email.example.com',
        'email@example@example.com',
        '.email@example.com',
        'email.@example.com',
        'email..email@example.com',
        'email@example.com (Joe Smith)',
        'email@example',
        'email@111.222.333.44444',
        'email@example..com',
        'Abc..123@example.com',
        'email@123.123.123.123',
      ]

      const all_mails_are_invalid = array_of_invalid_mails.reduce<boolean>((acc, val) => {
        const is_valid = checkIsMailIsCorrect(val)

        if (!acc && is_valid) {
          return true
        } else {
          return acc
        }
      }, false)

      expect(all_mails_are_invalid).toEqual(false)
    })
  })
})
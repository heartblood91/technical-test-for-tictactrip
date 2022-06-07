import { getOneValueOnHeader } from './headers'

describe('getOneValueOnHeader', () => {
  describe('if my property return an array', () => {
    it('should return the last value', () => {
      const res = getOneValueOnHeader(['hello', 'world'])

      expect(res).toEqual('world')
    })
  })
  describe('if my property is a string', () => {
    it('should return the string', () => {
      const res = getOneValueOnHeader('coucou')

      expect(res).toEqual('coucou')
    })
  })
  describe('if my property is a undefined', () => {
    it('should return an empty string', () => {
      const res = getOneValueOnHeader()

      expect(res).toEqual('')
    })
  })
})

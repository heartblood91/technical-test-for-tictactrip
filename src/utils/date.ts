const getTodaysDate = () => new Date().toISOString().split('T')[0]

export {
  getTodaysDate,
}

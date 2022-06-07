const checkIsMailIsCorrect = (email?: string) => {
  const is_email_valid = email?.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/g)?.length === 1

  if (email && is_email_valid) {
    return true
  } else {
    return false
  }
}

export {
  checkIsMailIsCorrect,
}
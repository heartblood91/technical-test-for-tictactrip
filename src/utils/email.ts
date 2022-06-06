const checkIsMailIsCorrect = (email?: string) => {
  const is_email_valid = email?.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g)?.length === 1

  if (email && is_email_valid) {
    return true
  } else {
    return false
  }
}

export {
  checkIsMailIsCorrect,
}
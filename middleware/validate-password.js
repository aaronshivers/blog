const validatePassword = (password) => {
  const regex = /((?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)).{8,100}/
  const errorMsg = `Password must contain 8-100 characters, with at least one lowercase letter, one uppercase letter, one number, and one special character.`
  
  return new Promise((resolve, reject) => {
    if (password.match(regex)) {
      return resolve(password)
    }
    reject(new Error(errorMsg))
  })
}

module.exports = validatePassword

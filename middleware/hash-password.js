const bcrypt = require('bcrypt')

const hashPassword = (userSchema) => {

  userSchema.pre('save', function(next) {
    const user = this

    if (!user.isModified('password')) return next()

    const saltingRounds = 10

    bcrypt.hash(user.password, saltingRounds, (err, hash) => {
      if (err) return next(err)
      
      user.password = hash
      next()
    })
  })
}

module.exports = hashPassword

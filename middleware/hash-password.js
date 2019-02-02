const bcrypt = require('bcrypt')

const hashPassword = (userSchema) => {

  userSchema.pre('save', async function(next) {
    const user = this

    if (!user.isModified('password')) return next()

    const saltingRounds = 10

    try {
      const hash = await bcrypt.hash(user.password, saltingRounds)
      user.password = hash
      next()
    } catch (error) {
      throw new Error (error)
    }
  })
}

module.exports = hashPassword

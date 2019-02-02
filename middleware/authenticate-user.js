const jwt = require('jsonwebtoken')

const User = require(`../models/user-model`)

const authenticateUser = async (req, res, next) => {
  const token = req.cookies.token
  const secret = process.env.JWT_SECRET
  const handleError = (error) => res.status(401).render('error', { errorMessage: error })

  try {
    const decoded = await jwt.verify(token, secret)
    const user = await User.findById(decoded._id)
    user ? next() : handleError(error)
  } catch (error) {
    handleError(error)
  }
}

module.exports = authenticateUser

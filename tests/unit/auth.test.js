// const { User } = require('../../models/user-model')
// const authenticateUser = require('../../middleware/authenticate-user')
// const { ObjectId } = require('mongodb')

// describe('auth middleware', () => {
//   it('should populate req.user with the valid JWT', () => {
//     const user = { _id: new ObjectId(), isAdmin: true }
//     const token = new User(user).createAuthToken()
//     const req = {
//       header: jest.fn().mockReturnValue(token)
//     }
//     const res = {}
//     const next = jest.fn()

//     authenticateUser(req, res, next)

//     expect(req.user).toMatchObject(user)
//   })
// })

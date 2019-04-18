const expect = require('expect')
const request = require('supertest')
const { ObjectId } = require('mongodb')

const Blog = require(`../../models/blog-model`)
const User = require(`../../models/user-model`)
const app = require('../../app')
const {
  populateUsers,
  populateBlogs,
  users,
  blogs,
  tokens
} = require(`./seed`)

beforeEach(populateUsers)
beforeEach(populateBlogs)

// GET /
describe('GET /', async () => {
  it('should respond 302, and redirect to /blogs', async () => {
    await request(app)
      .get('/')
      .expect(302)
      .expect((res) => {
        expect(res.header.location).toEqual('/blogs')
      })
  })
})

// GET /admin
describe('GET /admin', async () => {

  it('should respond 200, if user is logged in, and is admin', async () => {
    const cookie = `token=${tokens[1]}`

    await request(app)
      .get('/admin')
      .set('Cookie', cookie)
      .expect(200)
  })

  it('should respond 401, if user is logged in, and is NOT admin', async () => {
    const cookie = `token=${tokens[0]}`

    await request(app)
      .get('/admin')
      .set('Cookie', cookie)
      .expect(401)
  })

  it('should respond 401, if user is NOT logged in', async () => {

    await request(app)
      .get('/admin')
      .expect(401)
  })
})



// USER TESTS =====================================================

// GET /users/new
describe('GET /users/signup', async () => {

  it('should return 200', async () => {
    await request(app)
      .get(`/users/signup`)
      .expect(200)
  })
})

// GET /profile
describe('GET /users/profile', async () => {

  it('should respond 200, if user is logged in', async () => {
    const cookie = `token=${tokens[0]}`

    await request(app)
      .get('/users/profile')
      .set('Cookie', cookie)
      .expect(200)
  })

  it('should respond 401, if user is NOT logged in', async () => {

    await request(app)
      .get('/users/profile')
      .expect(401)
  })

  it('should respond 401, if user has token, but is not in database', async () => {
    const cookie = `token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YzMxNWJhYWViNjc5ZjdhMWVlNzAzYjEiLCJhZG1pbiI6ZmFsc2UsImlhdCI6MTU0NjczODYwMiwiZXhwIjoxNTQ2ODI1MDAyfQ.ZSDfhUNvJBs2TyknQXbStu77-qpVJFDakm9KBFV7IWA`

    await request(app)
      .get('/users/profile')
      .set('Cookie', cookie)
      .expect(401)
  })
})

// POST /users
describe('POST /users', async () => {

  it('should return 302, create a new user, and redirect to /profile', async () => {
    const { email, password } = users[2]

    await request(app)
      .post('/users')
      .send(`email=${ email }`)
      .send(`password=${ password }`)
      .expect(302)
      .expect((res) => {
        expect(res.header.location).toEqual('/users/profile')
        expect(res.header).toHaveProperty('set-cookie')
      })

      const foundUser = await User.findOne({ email })
      expect(foundUser).toBeTruthy()
      expect(foundUser.email).toEqual(email.toLowerCase())
      expect(foundUser.password).not.toEqual(password)
  })

  it('should return 400, and NOT create a duplicate user', async () => {
    const { email, password } = users[0]

    await request(app)
      .post('/users')
      .send(`email=${ email }`)
      .send(`password=${ password }`)
      .expect(400)

    const foundUsers = await User.find()
    expect(foundUsers.length).toBe(2)
  })

  it('should return 400, and NOT create a user with an invalid email', async () => {
    const { email, password } = users[3]

    await request(app)
      .post('/users')
      .send(`email=${ email }`)
      .send(`password=${ password }`)
      .expect(400)

    const foundUser = await User.findOne({ email })
    expect(foundUser).toBeFalsy()
  })

  it('should return 400, and NOT create a user with an invalid password', async () => {
    const { email, password } = users[4]

    await request(app)
      .post('/users')
      .send(`email=${ email }`)
      .send(`password=${ password }`)
      .expect(400)

      const foundUser = await User.findOne({ email })
      expect(foundUser).toBeFalsy()
  })
})

// GET /users
describe('GET /users', async () => {

  it('should respond 200, if user is logged in, and is Admin', async () => {
    const cookie = `token=${tokens[1]}`

    await request(app)
      .get('/users')
      .set('Cookie', cookie)
      .expect(200)
  })

  it('should respond 401, if user is NOT logged in', async () => {
    await request(app)
      .get('/users')
      .expect(401)
  })

  it('should respond 401, if user is logged in, but NOT Admin', async () => {
    const cookie = `token=${tokens[0]}`

    await request(app)
      .get('/users')
      .set('Cookie', cookie)
      .expect(401)
  })
})

// GET /users/:id/view
describe('GET /users/:id/view', async () => {

  it('should respond 200, if user is logged in', async () => {
    const cookie = `token=${tokens[0]}`
    const { _id } = users[0]._id

    await request(app)
      .get(`/users/${ _id }/view`)
      .set('Cookie', cookie)
      .expect(200)
  })

  it('should respond 401, if user is NOT logged in', async () => {
    const { _id } = users[0]._id

    await request(app)
      .get(`/users/${ _id }/view`)
      .expect(401)
  })
})

// GET /login
describe('GET /users/login', async () => {

  it('should respond 200', async () => {
    await request(app)
      .get('/users/login')
      .expect(200)
  })
})

describe('POST /users/login', async () => {
  
  it('should return 302, login user, and create a token', async () => {
    const { email, password } = users[0]
  
    await request(app)
      .post('/users/login')
      .send(`email=${email}`)
      .send(`password=${password}`)
      .expect(302)
      .expect((res) => {
        expect(res.header.location).toEqual('/users/profile')
        expect(res.header['set-cookie']).toBeTruthy()
      })
  })

  it('should return 401, and NOT login user if email is not in the database', async () => {
    const { email, password } = users[2]
    
    await request(app)
      .post('/users/login')
      .send(`email=${email}`)
      .send(`password=${password}`)
      .expect(401)
      .expect((res) => {
        expect(res.header['set-cookie']).toBeFalsy()
      })
  })

  it('should return 401, NOT login user if password is incorrect', async () => {
    const { email } = users[0]
    const { password } = users[2]
    
    await request(app)
      .post('/users/login')
      .send(`email=${email}`)
      .send(`password=${password}`)
      .expect(401)
      .expect((res) => {
        expect(res.header['set-cookie']).toBeFalsy()
      })
  })
})

// GET /logout
describe('GET /users/logout', async () => {
  
  it('should return 302, logout user and delete auth token', async () => {
    const cookie = `token=${tokens[0]}`
    
    await request(app)
      .get('/users/logout')
      .set('Cookie', cookie)
      .expect(302)
      .expect((res) => {
        expect(res.header.location).toEqual('/blogs')
        expect(res.header['set-cookie']).toEqual(["token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT"])
      })
  })
})

// GET /users/:id/edit
describe('GET /users/edit', async () => {

  it('should respond 200, and GET /blogs/edit, if user is logged in.', async () => {
    const cookie = `token=${tokens[0]}`
    const { _id } = users[0]._id

    await request(app)
      .get(`/users/edit`)
      .set('Cookie', cookie)
      .expect(200)
  })

  it('should respond 401, if user is NOT logged in.', async () => {
    const { _id } = users[0]._id

    await request(app)
      .get(`/users/edit`)
      .expect(401)
  })

  it('should respond 401, if user has token, but user NOT in the database.', async () => {
    const cookie = `token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YzMyOTEwNTYyYzM0ZDZjZGYwMWZkODciLCJhZG1pbiI6ZmFsc2UsImlhdCI6MTU0NjgxNzc5NywiZXhwIjoxNTQ2OTA0MTk3fQ.FvyXCMXxjLiQlFXQe-Y7uPVn0W41F8uyTQGnJAxe1eI`

    await request(app)
      .get(`/users/edit`)
      .set('Cookie', cookie)
      .expect(401)
  })
})

// PATCH /users
describe('PATCH /users/:id', async () => {
  
  it('should return 302, and update the specified user, if logged in and user is creator', async () => {
    const { _id } = users[0]
    const { email, password } = users[2]
    const cookie = `token=${tokens[0]}`

    await request(app)
      .patch(`/users/${ _id }`)
      .set('Cookie', cookie)
      .send(`email=${email}`)
      .send(`password=${password}`)
      .expect(302)
      .expect((res) => {
        expect(res.header.location).toEqual('/profile')
      })

      const foundUser = await User.findById(_id)
      expect(foundUser).toBeTruthy()
      expect(foundUser._id).toEqual(_id)
      expect(foundUser.email).toEqual(email.toLowerCase())
      expect(foundUser.password).not.toEqual(password)
  })

  it('should return 401, and NOT update the specified user, if user is logged in, but NOT creator', async () => {
    const { _id } = users[1]
    const { email, password } = users[2]
    const cookie = `token=${tokens[0]}`

    await request(app)
      .patch(`/users/${ _id }`)
      .set('Cookie', cookie)
      .send(`email=${email}`)
      .send(`password=${password}`)
      .expect(401)

      const foundUser = await User.findById(_id)
      expect(foundUser).toBeTruthy()
      expect(foundUser._id).toEqual(_id)
      expect(foundUser.email).not.toEqual(email.toLowerCase())
  })

  it('should return 404, if specified user is NOT found', async () => {
    const { _id } = new ObjectId()
    const { email, password } = users[2]
    const cookie = `token=${tokens[0]}`

    await request(app)
      .patch(`/users/${ _id }`)
      .set('Cookie', cookie)
      .send(`email=${email}`)
      .send(`password=${password}`)
      .expect(404)

      const foundUser = await User.findById(_id)
      expect(foundUser).toBeFalsy()
  })

  it('should return 400, and NOT update if user already exists', async () => {
    const { _id } = users[0]
    const { email, password } = users[1]
    const cookie = `token=${tokens[0]}`

    await request(app)
      .patch(`/users/${ _id }`)
      .set('Cookie', cookie)
      .send(`email=${email}`)
      .send(`password=${password}`)
      .expect(400)

      const foundUser = await User.findById(_id)
      expect(foundUser._id).toEqual(_id)
      expect(foundUser.email).not.toEqual(email)
  })

  it('should return 400, and NOT update a user with an invalid email', async () => {
    const { _id } = users[0]
    const { email, password } = users[3]
    const cookie = `token=${tokens[0]}`

    await request(app)
      .patch(`/users/${ _id }`)
      .set('Cookie', cookie)
      .send(`email=${email}`)
      .send(`password=${password}`)
      .expect(400)

      const foundUser = await User.findById(_id)
      expect(foundUser._id).toEqual(_id)
      expect(foundUser.email).not.toEqual(email)
  })

  it('should return 402, and NOT update a user with an invalid password', async () => {
    const { _id } = users[0]
    const { email, password } = users[4]
    const cookie = `token=${tokens[0]}`

    await request(app)
      .patch(`/users/${ _id }`)
      .set('Cookie', cookie)
      .send(`email=${email}`)
      .send(`password=${password}`)
      .expect(400)

      const foundUser = await User.findById(_id)
      expect(foundUser._id).toEqual(_id)
      expect(foundUser.email).not.toEqual(email)
  })

  it('should return 302, and NOT allow user to change Admin field', async () => {
    const { _id } = users[0]
    const cookie = `token=${tokens[0]}`
    const { email, password } = users[0]
    const { admin } = { 'admin' : true }

    await request(app)
      .patch(`/users/${ _id }`)
      .set('Cookie', cookie)
      .send(`email=${email}`)
      .send(`password=${password}`)
      .send(`admin=${admin}`)
      .expect(302)
      .expect((res) => {
        expect(res.header.location).toEqual('/profile')
      })

      const foundUser = await User.findById(_id)
      expect(foundUser).toBeTruthy()
      expect(foundUser._id).toEqual(_id)
      expect(foundUser.email).toEqual(email.toLowerCase())
      expect(foundUser.password).not.toEqual(password)
      expect(foundUser.admin).not.toEqual(admin)
  })
})


// DELETE /users/:id
describe('DELETE /users/delete', async () => {
  
  it('should return 302, delete the specified user, and redirect to /blogs', async () => {
    const cookie = `token=${tokens[0]}`

    await request(app)
      .delete(`/users/delete`)
      .set('Cookie', cookie)
      .expect(302)
      .expect((res) => {
        expect(res.header.location).toEqual('/blogs')
        expect(res.header['set-cookie']).toEqual(["token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT"])
      })

      const foundUsers = await User.find()
      expect(foundUsers.length).toBe(1)
  })

  it('should return 401, if user has a token, but is NOT found in the database', async () => {
    const cookie = `token=${tokens[2]}`

    await request(app)
      .delete(`/users/delete`)
      .set('Cookie', cookie)
      .expect(401)

    const foundUser = await User.find()
    expect(foundUser.length).toBe(2)
  })
})

// GET /users/search
describe('GET /users/search', async () => {

  it('should respond 200, if user is logged in, and is admin', async () => {
    const cookie = `token=${tokens[1]}`
    const term = users[0].email

    await request(app)
      .get('/users/search')
      .set('Cookie', cookie)
      .expect(200)
      .query({ term: term })
  })

  it('should respond 401, if user is logged in, and is NOT admin', async () => {
    const cookie = `token=${tokens[0]}`
    const term = users[0].email

    await request(app)
      .get('/users/search')
      .set('Cookie', cookie)
      .expect(401)
      .query({ term: term })
  })
  
  it('should respond 401, if user is NOT logged in', async () => {
    const term = users[0].email

    await request(app)
      .get('/users/search')
      .expect(401)
      .query({ term: term })
  })

  it(`should respond 404, search term isn't found`, async () => {
    const cookie = `token=${tokens[1]}`
    const term = 'somethingthatsprobablynotinthedatabase'

    await request(app)
      .get('/users/search')
      .set('Cookie', cookie)
      .expect(404)
      .query({ term: term })
  })
})

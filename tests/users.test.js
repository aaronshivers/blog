const expect = require('expect')
const request = require('supertest')
const { ObjectId } = require('mongodb')

const Blog = require(`../models/blog-model`)
const User = require(`../models/user-model`)
const app = require('../app')
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
describe('GET /', () => {
  it('should respond 302, and redirect to /blogs', (done) => {
    request(app)
      .get('/')
      .expect(302)
      .expect((res) => {
        expect(res.header.location).toEqual('/blogs')
      })
      .end(done)
  })
})

// GET /admin
describe('GET /admin', () => {

  it('should respond 200, if user is logged in, and is admin', (done) => {
    const cookie = `token=${tokens[1]}`

    request(app)
      .get('/admin')
      .set('Cookie', cookie)
      .expect(200)
      .end(done)
  })

  it('should respond 401, if user is logged in, and is NOT admin', (done) => {
    const cookie = `token=${tokens[0]}`

    request(app)
      .get('/admin')
      .set('Cookie', cookie)
      .expect(401)
      .end(done)
  })

  it('should respond 401, if user is NOT logged in', (done) => {

    request(app)
      .get('/admin')
      .expect(401)
      .end(done)
  })
})



// USER TESTS =====================================================

// GET /users/new
describe('GET /signup', () => {

  it('should return 200', (done) => {
    request(app)
      .get(`/signup`)
      .expect(200)
      .end(done)
  })
})

// GET /profile
describe('GET /profile', () => {

  it('should respond 200, if user is logged in', (done) => {
    const cookie = `token=${tokens[0]}`

    request(app)
      .get('/profile')
      .set('Cookie', cookie)
      .expect(200)
      .end(done)
  })

  it('should respond 401, if user is NOT logged in', (done) => {

    request(app)
      .get('/profile')
      .expect(401)
      .end(done)
  })

  it('should respond 401, if user has token, but is not in database', (done) => {
    const cookie = `token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YzMxNWJhYWViNjc5ZjdhMWVlNzAzYjEiLCJhZG1pbiI6ZmFsc2UsImlhdCI6MTU0NjczODYwMiwiZXhwIjoxNTQ2ODI1MDAyfQ.ZSDfhUNvJBs2TyknQXbStu77-qpVJFDakm9KBFV7IWA`

    request(app)
      .get('/profile')
      .set('Cookie', cookie)
      .expect(401)
      .end(done)
  })
})

// POST /users
describe('POST /users', () => {

  it('should return 302, create a new user, and redirect to /profile', (done) => {
    const { email, password } = users[2]

    request(app)
      .post('/users')
      .send(`email=${ email }`)
      .send(`password=${ password }`)
      .expect(302)
      .expect((res) => {
        expect(res.header.location).toEqual('/profile')
        expect(res.header).toHaveProperty('set-cookie')
      })
      .end((err) => {
        if (err) {
          return done(err)
        } else {
          User.findOne({ email }).then((user) => {
            expect(user).toBeTruthy()
            expect(user.email).toEqual(email.toLowerCase())
            expect(user.password).not.toEqual(password)
            done()
          }).catch(err => done(err))
        }
      })
  })

  it('should return 400, and NOT create a duplicate user', (done) => {
    const { email, password } = users[0]

    request(app)
      .post('/users')
      .send(`email=${ email }`)
      .send(`password=${ password }`)
      .expect(400)
      .end((err) => {
        if (err) return done(err)

        User.find().then((users) => {
          expect(users.length).toBe(2)
          done()
        }).catch(err => done(err))
      })
  })

  it('should return 400, and NOT create a user with an invalid email', (done) => {
    const { email, password } = users[3]

    request(app)
      .post('/users')
      .send(`email=${ email }`)
      .send(`password=${ password }`)
      .expect(400)
      .end((err) => {
        if (err) return done(err)

        User.findOne({ email }).then((user) => {
          expect(user).toBeFalsy()
          done()
        }).catch(err => done(err))
      })
  })

  it('should return 400, and NOT create a user with an invalid password', (done) => {
    const { email, password } = users[4]

    request(app)
      .post('/users')
      .send(`email=${ email }`)
      .send(`password=${ password }`)
      .expect(400)
      .end((err) => {
        if (err) return done(err)

        User.findOne({ email }).then((user) => {
          expect(user).toBeFalsy()
          done()
        }).catch(err => done(err))
      })
  })
})

// GET /users
describe('GET /users', () => {

  it('should respond 200, if user is logged in, and is Admin', (done) => {
    const cookie = `token=${tokens[1]}`

    request(app)
      .get('/users')
      .set('Cookie', cookie)
      .expect(200)
      .end(done)
  })

  it('should respond 401, if user is NOT logged in', (done) => {
    request(app)
      .get('/users')
      .expect(401)
      .end(done)
  })

  it('should respond 401, if user is logged in, but NOT Admin', (done) => {
    const cookie = `token=${tokens[0]}`

    request(app)
      .get('/users')
      .set('Cookie', cookie)
      .expect(401)
      .end(done)
  })
})

// GET /users/:id/view
describe('GET /users/:id/view', () => {

  it('should respond 200, if user is logged in', (done) => {
    const cookie = `token=${tokens[0]}`
    const { _id } = users[0]._id

    request(app)
      .get(`/users/${ _id }/view`)
      .set('Cookie', cookie)
      .expect(200)
      .end(done)
  })

  it('should respond 401, if user is NOT logged in', (done) => {
    const { _id } = users[0]._id

    request(app)
      .get(`/users/${ _id }/view`)
      .expect(401)
      .end(done)
  })
})

// GET /login
describe('GET /login', () => {

  it('should respond 200', (done) => {
    request(app)
      .get('/login')
      .expect(200)
      .end(done)
  })
})

describe('POST /login', () => {
  
  it('should return 302, login user, and create a token', (done) => {
    const { email, password } = users[0]
  
    request(app)
      .post('/login')
      .send(`email=${email}`)
      .send(`password=${password}`)
      .expect(302)
      .expect((res) => {
        expect(res.header.location).toEqual('/profile')
        expect(res.header['set-cookie']).toBeTruthy()
      })
      .end(done)
  })

  it('should return 401, and NOT login user if email is not in the database', (done) => {
    const { email, password } = users[2]
    
    request(app)
      .post('/login')
      .send(`email=${email}`)
      .send(`password=${password}`)
      .expect(401)
      .expect((res) => {
        expect(res.header['set-cookie']).toBeFalsy()
      })
      .end(done)
  })

  it('should return 401, NOT login user if password is incorrect', (done) => {
    const { email } = users[0]
    const { password } = users[2]
    
    request(app)
      .post('/login')
      .send(`email=${email}`)
      .send(`password=${password}`)
      .expect(401)
      .expect((res) => {
        expect(res.header['set-cookie']).toBeFalsy()
      })
      .end(done)
  })
})

// GET /logout
describe('GET /logout', () => {
  
  it('should return 302, logout user and delete auth token', (done) => {
    const cookie = `token=${tokens[0]}`
    
    request(app)
      .get('/logout')
      .set('Cookie', cookie)
      .expect(302)
      .expect((res) => {
        expect(res.header.location).toEqual('/blogs')
        expect(res.header['set-cookie']).toEqual(["token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT"])
      })
      .end(done)
  })
})

// GET /users/:id/edit
describe('GET /users/edit', () => {

  it('should respond 200, and GET /blogs/edit, if user is logged in.', (done) => {
    const cookie = `token=${tokens[0]}`
    const { _id } = users[0]._id

    request(app)
      .get(`/users/edit`)
      .set('Cookie', cookie)
      .expect(200)
      .end(done)
  })

  it('should respond 401, if user is NOT logged in.', (done) => {
    const { _id } = users[0]._id

    request(app)
      .get(`/users/edit`)
      .expect(401)
      .end(done)
  })

  it('should respond 401, if user has token, but user NOT in the database.', (done) => {
    const cookie = `token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YzMyOTEwNTYyYzM0ZDZjZGYwMWZkODciLCJhZG1pbiI6ZmFsc2UsImlhdCI6MTU0NjgxNzc5NywiZXhwIjoxNTQ2OTA0MTk3fQ.FvyXCMXxjLiQlFXQe-Y7uPVn0W41F8uyTQGnJAxe1eI`

    request(app)
      .get(`/users/edit`)
      .set('Cookie', cookie)
      .expect(401)
      .end(done)
  })
})

// PATCH /users
describe('PATCH /users/:id', () => {
  
  it('should return 302, and update the specified user, if logged in and user is creator', (done) => {
    const { _id } = users[0]
    const { email, password } = users[2]
    const cookie = `token=${tokens[0]}`

    request(app)
      .patch(`/users/${ _id }`)
      .set('Cookie', cookie)
      .send(`email=${email}`)
      .send(`password=${password}`)
      .expect(302)
      .expect((res) => {
        expect(res.header.location).toEqual('/profile')
      })
      .end((err) => {
        if (err) return done(err)

        User.findById(_id).then((user) => {
          expect(user).toBeTruthy()
          expect(user._id).toEqual(_id)
          expect(user.email).toEqual(email.toLowerCase())
          expect(user.password).not.toEqual(password)
          done()
        }).catch(err => done(err))
      })
  })

  it('should return 401, and NOT update the specified user, if user is logged in, but NOT creator', (done) => {
    const { _id } = users[1]
    const { email, password } = users[2]
    const cookie = `token=${tokens[0]}`

    request(app)
      .patch(`/users/${ _id }`)
      .set('Cookie', cookie)
      .send(`email=${email}`)
      .send(`password=${password}`)
      .expect(401)
      .end((err) => {
        if (err) return done(err)

        User.findById(_id).then((user) => {
          expect(user).toBeTruthy()
          expect(user._id).toEqual(_id)
          expect(user.email).not.toEqual(email.toLowerCase())
          done()
        }).catch(err => done(err))
      })
  })

  it('should return 404, if specified user is NOT found', (done) => {
    const { _id } = new ObjectId()
    const { email, password } = users[2]
    const cookie = `token=${tokens[0]}`

    request(app)
      .patch(`/users/${ _id }`)
      .set('Cookie', cookie)
      .send(`email=${email}`)
      .send(`password=${password}`)
      .expect(404)
      .end((err) => {
        if (err) return done(err)

        User.findById(_id).then((user) => {
          expect(user).toBeFalsy()
          done()
        }).catch(err => done(err))
      })
  })

  it('should return 400, and NOT update if user already exists', (done) => {
    const { _id } = users[0]
    const { email, password } = users[1]
    const cookie = `token=${tokens[0]}`

    request(app)
      .patch(`/users/${ _id }`)
      .set('Cookie', cookie)
      .send(`email=${email}`)
      .send(`password=${password}`)
      .expect(400)
      .end((err) => {
        if (err) return done(err)

        User.findById(_id).then((user) => {
          expect(user._id).toEqual(_id)
          expect(user.email).not.toEqual(email)
          done()
        }).catch(err => done(err))
      })
  })

  it('should return 400, and NOT update a user with an invalid email', (done) => {
    const { _id } = users[0]
    const { email, password } = users[3]
    const cookie = `token=${tokens[0]}`

    request(app)
      .patch(`/users/${ _id }`)
      .set('Cookie', cookie)
      .send(`email=${email}`)
      .send(`password=${password}`)
      .expect(400)
      .end((err) => {
        if (err) return done(err)

        User.findById(_id).then((user) => {
          expect(user._id).toEqual(_id)
          expect(user.email).not.toEqual(email)
          done()
        }).catch(err => done(err))
      })
  })

  it('should return 402, and NOT update a user with an invalid password', (done) => {
    const { _id } = users[0]
    const { email, password } = users[4]
    const cookie = `token=${tokens[0]}`

    request(app)
      .patch(`/users/${ _id }`)
      .set('Cookie', cookie)
      .send(`email=${email}`)
      .send(`password=${password}`)
      .expect(400)
      .end((err) => {
        if (err) return done(err)

        User.findById(_id).then((user) => {
          expect(user._id).toEqual(_id)
          expect(user.email).not.toEqual(email)
          done()
        }).catch(err => done(err))
      })
  })

  it('should return 302, and NOT allow user to change Admin field', (done) => {
    const { _id } = users[0]
    const cookie = `token=${tokens[0]}`
    const { email, password } = users[0]
    const { admin } = { 'admin' : true }

    request(app)
      .patch(`/users/${ _id }`)
      .set('Cookie', cookie)
      .send(`email=${email}`)
      .send(`password=${password}`)
      .send(`admin=${admin}`)
      .expect(302)
      .expect((res) => {
        expect(res.header.location).toEqual('/profile')
      })
      .end((err) => {
        if (err) return done(err)

        User.findById(_id).then((user) => {

          expect(user).toBeTruthy()
          expect(user._id).toEqual(_id)
          expect(user.email).toEqual(email.toLowerCase())
          expect(user.password).not.toEqual(password)
          expect(user.admin).not.toEqual(admin)
          done()
        }).catch(err => done(err))
      })
  })
})


// DELETE /users/:id
describe('DELETE /users/delete', () => {
  
  it('should return 302, delete the specified user, and redirect to /blogs', (done) => {
    const cookie = `token=${tokens[0]}`

    request(app)
      .delete(`/users/delete`)
      .set('Cookie', cookie)
      .expect(302)
      .expect((res) => {
        expect(res.header.location).toEqual('/blogs')
        expect(res.header['set-cookie']).toEqual(["token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT"])
      })
      .end((err) => {
        if (err) return done(err)

        User.find().then((users) => {
          expect(users.length).toBe(1)
          done()
        }).catch(err => done(err))
      })
  })

  it('should return 401, if user has a token, but is NOT found in the database', (done) => {
    const cookie = `token=${tokens[2]}`

    request(app)
      .delete(`/users/delete`)
      .set('Cookie', cookie)
      .expect(401)
      .end((err) => {
        if (err) return done(err)

        User.find().then((users) => {
          expect(users.length).toBe(2)
          done()
        }).catch(err => done(err))
      })
  })
})

// GET /users/search
describe('GET /users/search', () => {

  it('should respond 200, if user is logged in, and is admin', (done) => {
    const cookie = `token=${tokens[1]}`
    const term = users[0].email

    request(app)
      .get('/users/search')
      .set('Cookie', cookie)
      .expect(200)
      .query({ term: term })
      .end(done)
  })

  it('should respond 401, if user is logged in, and is NOT admin', (done) => {
    const cookie = `token=${tokens[0]}`
    const term = users[0].email

    request(app)
      .get('/users/search')
      .set('Cookie', cookie)
      .expect(401)
      .query({ term: term })
      .end(done)
  })
  
  it('should respond 401, if user is NOT logged in', (done) => {
    const term = users[0].email

    request(app)
      .get('/users/search')
      .expect(401)
      .query({ term: term })
      .end(done)
  })

  it(`should respond 404, search term isn't found`, (done) => {
    const cookie = `token=${tokens[1]}`
    const term = 'somethingthatsprobablynotinthedatabase'

    request(app)
      .get('/users/search')
      .set('Cookie', cookie)
      .expect(404)
      .query({ term: term })
      .end(done)
  })
})

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

// // GET /
// describe('GET /', () => {
//   it('should respond 302, and redirect to /blogs', (done) => {
//     request(app)
//       .get('/')
//       .expect(302)
//       .expect((res) => {
//         expect(res.header.location).toEqual('/blogs')
//       })
//       .end(done)
//   })
// })

// // BLOG TESTS =====================================================
// console.log(`BLOG TESTS ***************************************`)

// // GET /blogs/new
// describe('GET /blogs/new', () => {

//   it('should respond 200, and GET /blogs, if user is logged in.', (done) => {
//     const cookie = `token=${tokens[0]}`

//     request(app)
//       .get('/blogs/new')
//       .set('Cookie', cookie)
//       .expect(200)
//       .end(done)
//   })

//   it('should respond 401, if user is NOT logged in.', (done) => {

//     request(app)
//       .get('/blogs/new')
//       .expect(401)
//       .end(done)
//   })
// })

// // POST /blogs
// describe('POST /blogs', () => {

//   it('should respond 302, redirect to /blogs, and create a new blog if user is logged in', (done) => {
//     const cookie = `token=${tokens[0]}`
//     const { title, body, image } = blogs[2]
    
//     request(app)
//       .post('/blogs')
//       .set('Cookie', cookie)
//       .type('form')
//       .send(`title=${ title }`)
//       .send(`body=${ body }`)
//       .send(`image=${ image }`)
//       .expect(302)
//       .expect((res) => {
//         expect(res.header.location).toEqual('/blogs')
//       })
//       .end((err, res) => {
//         if (err) return done(err)

//         Blog.findOne({ title }).then((blog) => {
//           expect(blog.title).toEqual(title)
//           expect(blog.body).toEqual(body)
//           expect(blog.image).toEqual(image)
//           done()
//         }).catch((err) => done(err.message))
//       })
//   })

//   it('should respond 400, and NOT create a duplicate blog', (done) => {
//     const cookie = `token=${tokens[0]}`
//     const { title, body, image } = blogs[0]
    
//     request(app)
//       .post(`/blogs/`)
//       .set('Cookie', cookie)
//       .type('form')
//       .send(`title=${ title }`)
//       .send(`body=${ body }`)
//       .send(`image=${ image }`)
//       .expect(400)
//       .end((err, res) => {
//         if (err) return done(err.message)

//         Blog.find().then((blogs) => {
//           expect(blogs.length).toBe(2)
//           done()
//         }).catch((err) => done(err.message))
//       })
//   })

//   it('should respond 400, and NOT create a new blog, if data is invalid', (done) => {
//     const cookie = `token=${tokens[0]}`

//     request(app)
//       .post('/blogs')
//       .set('Cookie', cookie)
//       .type('form')
//       .send()
//       .expect(400)
//       .end((err, res) => {
//         if (err) {
//           return done(err.message)
//         }
        
//         Blog.find().then((blogs) => {
//           expect(blogs.length).toBe(2)
//           done()
//         }).catch((err) => done(err.message))
//       })
//   })

//   it('should respond 401, and NOT create a new blog, if user is NOT logged in', (done) => {
//     const { title, body, image } = blogs[2]

//     request(app)
//       .post('/blogs')
//       .type('form')
//       .send(`title=${ title }`)
//       .send(`body=${ body }`)
//       .send(`image=${ image }`)
//       .expect(401)
//       .end((err, res) => {
//         if (err) {
//           return done(err.message)
//         }
        
//         Blog.find().then((blogs) => {
//           expect(blogs.length).toBe(2)
//           done()
//         }).catch((err) => done(err.message))
//       })
//   })
// })

// // GET /blogs
// describe('GET /blogs', () => {
//   it('should respond 200, and GET /blogs', (done) => {
//     request(app)
//       .get('/blogs')
//       .expect(200)
//       .end(done)
//   })
// })

// // GET /blogs/list
// describe('GET /blogs/list', () => {

//   it('should respond 200, and GET /blogs/list, if user logged in and is creator', (done) => {
//     const cookie = `token=${tokens[0]}`
//     const { _id } = users[0]

//     request(app)
//       .get(`/blogs/list`)
//       .set('Cookie', cookie)
//       .expect(200)
//       .end(done)
//   })

//   it('should respond 401, if user is NOT logged in', (done) => {
//     const { _id } = users[0]

//     request(app)
//       .get(`/blogs/list`)
//       .expect(401)
//       .end(done)
//   })

//   it('should respond 401, if user is logged in, but NOT creator', (done) => {

//     const cookie = `token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YzMxNWJhYWViNjc5ZjdhMWVlNzAzYjEiLCJhZG1pbiI6ZmFsc2UsImlhdCI6MTU0NjczODYwMiwiZXhwIjoxNTQ2ODI1MDAyfQ.ZSDfhUNvJBs2TyknQXbStu77-qpVJFDakm9KBFV7IWA`
//     const { _id } = users[0]

//     request(app)
//       .get(`/blogs/list`)
//       .set('Cookie', cookie)
//       .expect(401)
//       .end(done)
//   })
// })

// // GET /blogs/:id/view
// describe('GET /blogs/:id/view', () => {
  
//   it('should respond with 200, if specified blog exists', (done) => {
//     const { _id } = blogs[0]
//     request(app)
//       .get(`/blogs/${ _id }/view`)
//       .expect(200)
//       .end(done)
//   })

//   it('should respond with 404, if specified blog does NOT exist', (done) => {
//     const { _id } = new ObjectId()
//     request(app)
//       .get(`/blogs/${ _id }/view`)
//       .expect(404)
//       .end(done)
//   })

//   it('should respond with 400, if ObjectId is invalid', (done) => {
//     const { _id } = `invalidObjectId`
//     request(app)
//       .get(`/blogs/${ _id }/view`)
//       .expect(400)
//       .end(done)
//   })
// })

// // GET /blogs/:id/edit
// describe('GET /blogs/:id/edit', () => {

//   it('should respond 200, and GET /blogs/:id/edit, if user is logged in, and is the creator.', (done) => {
//     const cookie = `token=${tokens[0]}`
//     const { _id } = blogs[0]._id

//     request(app)
//       .get(`/blogs/${ _id }/edit`)
//       .set('Cookie', cookie)
//       .expect(200)
//       .end(done)
//   })

//   it('should respond 401, if user is NOT logged in.', (done) => {
//     const { _id } = blogs[0]._id

//     request(app)
//       .get(`/blogs/${ _id }/edit`)
//       .expect(401)
//       .end(done)
//   })

//   it('should respond 401, if user is logged in, but NOT the creator.', (done) => {
//     const cookie = `token=${tokens[1]}`
//     const { _id } = blogs[0]._id

//     request(app)
//       .get(`/blogs/${ _id }/edit`)
//       .set('Cookie', cookie)
//       .expect(401)
//       .end(done)
//   })
// })

// // PATCH /blogs
// describe('PATCH /blogs/:id', () => {

//   it('should respond 302, redirect to /blogs, and update the specified blog, if user is logged in, and is creator', (done) => {
//     const { _id } = blogs[0]
//     const cookie = `token=${tokens[0]}`
//     const { title, body, image } = blogs[3]
    
//     request(app)
//       .patch(`/blogs/${ _id }`)
//       .set('Cookie', cookie)
//       .type('form')
//       .send(`title=${ title }`)
//       .send(`body=${ body }`)
//       .send(`image=${ image }`)
//       .expect(302)
//       .expect((res) => {
//         expect(res.header.location).toEqual('/blogs')
//       })
//       .end((err, res) => {
//         if (err) return done(err.message)

//         Blog.findById({ _id }).then((blog) => {
//           expect(blog).toBeTruthy()
//           expect(blog.title).toEqual(title)
//           expect(blog.body).toEqual(body)
//           expect(blog.image).toEqual(image)
//           done()
//         }).catch((err) => done(err.message))
//       })
//   })

//   it('should respond 404, if specified blog is not found', (done) => {
//     const { _id } = new ObjectId()
//     const cookie = `token=${tokens[0]}`
//     const { title, body, image } = blogs[3]

//     request(app)
//       .patch(`/blogs/${ _id }`)
//       .set('Cookie', cookie)
//       .type('form')
//       .send(`title=${ title }`)
//       .send(`body=${ body }`)
//       .send(`image=${ image }`)
//       .expect(404)
//       .end((err, res) => {
//         if (err) return done(err.message)

//         Blog.findOne({ title }).then((blog) => {
//           expect(blog).toBeFalsy()
//           done()
//         }).catch((err) => done(err.message))
//       })
//   })

//   it('should respond 400, and NOT update a duplicate blog', (done) => {
//     const { _id } = blogs[0]
//     const cookie = `token=${tokens[0]}`
//     const { title, body, image } = blogs[1]
    
//     request(app)
//       .patch(`/blogs/${ _id }`)
//       .set('Cookie', cookie)
//       .expect(400)
//       .type('form')
//       .send(`title=${ title }`)
//       .send(`body=${ body }`)
//       .send(`image=${ image }`)
//       .end((err, res) => {
//         if (err) return done(err.message)

//         Blog.find({ title }).then((blogs) => {
//           expect(blogs.length).toBe(1)
//           done()
//         }).catch((err) => done(err.message))
//       })
//   })

//   it('should respond 400, and NOT update specified blog, if data is invalid', (done) => {
//     const { _id } = blogs[0]
//     const cookie = `token=${tokens[0]}`

//     request(app)
//       .patch(`/blogs/${ _id }`)
//       .set('Cookie', cookie)
//       .type('form')
//       .send()
//       .expect(400)
//       .end((err, res) => {
//         if (err) {
//           return done(err.message)
//         }
        
//         Blog.find().then((blogs) => {
//           expect(blogs.length).toBe(2)
//           done()
//         }).catch((err) => done(err.message))
//       })
//   })

//   it('should respond 401, and NOT update specified blog, if user is NOT logged in', (done) => {
//     const { _id } = blogs[0]
//     const { title, body, image } = blogs[3]

//     request(app)
//       .patch(`/blogs/${ _id }`)
//       .expect(401)
//       .type('form')
//       .send(`title=${ title }`)
//       .send(`body=${ body }`)
//       .send(`image=${ image }`)
//       .end((err, res) => {
//         if (err) return done(err.message)
        
//         Blog.find().then((blogs) => {
//           expect(blogs.length).toBe(2)
//           done()
//         }).catch((err) => done(err.message))
//       })
//   })

//   it('should respond 401, and NOT update the specified blog, if user is logged in, and is NOT creator', (done) => {
//     const { _id } = blogs[0]
//     const cookie = `token=${tokens[2]}`
//     const { title, body, image, creator } = blogs[2]

//     request(app)
//       .patch(`/blogs/${ _id }`)
//       .set('Cookie', cookie)
//       .expect(401)
//       .type('form')
//       .send(`title=${ title }`)
//       .send(`body=${ body }`)
//       .send(`image=${ image }`)
//       .end((err, res) => {
//         if (err) return done(err.message)

//         Blog.findById({ _id }).then((blog) => {

//           expect(blog).toBeTruthy()
//           expect(blog.title).not.toEqual(title)
//           expect(blog.body).not.toEqual(body)
//           expect(blog.image).not.toEqual(image)
//           expect(blog.creator).not.toEqual(creator)
//           done()
//         }).catch((err) => done(err.message))
//       })
//   })
// })

// // DELETE /items/:id
// describe('DELETE /blogs/:id', () => {

//   it('should respond 302, and delete a blog, if user is logged in, and is creator', (done) => {
//     const { _id } = blogs[0]
//     const cookie = `token=${tokens[0]}`

//     request(app)
//       .delete(`/blogs/${ _id }`)
//       .set('Cookie', cookie)
//       .expect(302)
//       .expect((res) => {
//         expect(res.header.location).toEqual('/blogs')
//       })
//       .end((err, res) => {
//         if (err) return done(err.message)

//         Blog.findById({ _id }).then((blog) => {
//           expect(blog).toBeFalsy()
//           done()
//         }).catch((err) => done(err.message))
//       })
//   })

//   it('should return 404 if specified item is not found', (done) => {
//     const id =  new ObjectId()
//     const cookie = `token=${tokens[0]}`

//     request(app)
//       .delete(`/blogs/${id}`)
//       .set('Cookie', cookie)
//       .expect(404)
//       .end((err, res) => {
//         if (err) return done(err.message)

//         Blog.find().then((blogs) => {
//           expect(blogs.length).toBe(2)
//           done()
//         }).catch((err) => done(err.message))
//       })
//   })

//   it('should return 401, if user is NOT logged in', (done) => {
//     const { _id } = blogs[0]

//     request(app)
//       .delete(`/blogs/${ _id }`)
//       .expect(401)
//       .end((err, res) => {
//         if (err) return done(err.message)

//         Blog.findById({ _id }).then((blog) => {
//           expect(blog).toBeTruthy()
//           done()
//         }).catch((err) => done(err.message))
//       })
//   })

//   it('should return 401, if user is logged in, but NOT creator', (done) => {
//     const { _id } = blogs[0]
//     const cookie = `token=${tokens[2]}`

//     request(app)
//       .delete(`/blogs/${ _id }`)
//       .set('Cookie', cookie)
//       .expect(401)
//       .end((err, res) => {
//         if (err) return done(err.message)

//         Blog.findById({ _id }).then((blog) => {
//           expect(blog).toBeTruthy()
//           done()
//         }).catch((err) => done(err.message))
//       })
//   })
// })

// USER TESTS =====================================================
console.log(`USER TESTS ***************************************`)

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
      .type('form')
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
      .type('form')
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
      .type('form')
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
      .type('form')
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

  it('should respond 200, if user is logged in', (done) => {
    const cookie = `token=${tokens[0]}`

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
      .type('form')
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
      .type('form')
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
      .type('form')
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

  it('should respond 200, and GET /blogs/:id/edit, if user is logged in.', (done) => {
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
      .type('form')
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
      .type('form')
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
      .type('form')
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

  it('should return 409, and NOT update if user already exists', (done) => {
    const { _id } = users[0]
    const { email, password } = users[1]
    const cookie = `token=${tokens[0]}`

    request(app)
      .patch(`/users/${ _id }`)
      .set('Cookie', cookie)
      .type('form')
      .send(`email=${email}`)
      .send(`password=${password}`)
      .expect(409)
      .end((err) => {
        if (err) return done(err)

        User.findById(_id).then((user) => {
          expect(user._id).toEqual(_id)
          expect(user.email).not.toEqual(email)
          done()
        }).catch(err => done(err))
      })
  })

  it('should return 409, and NOT update a user with an invalid email', (done) => {
    const { _id } = users[0]
    const { email, password } = users[3]
    const cookie = `token=${tokens[0]}`

    request(app)
      .patch(`/users/${ _id }`)
      .set('Cookie', cookie)
      .type('form')
      .send(`email=${email}`)
      .send(`password=${password}`)
      .expect(409)
      .end((err) => {
        if (err) return done(err)

        User.findById(_id).then((user) => {
          expect(user._id).toEqual(_id)
          expect(user.email).not.toEqual(email)
          done()
        }).catch(err => done(err))
      })
  })

  it('should NOT update a user with an invalid password', (done) => {
    const { _id } = users[0]
    const { email, password } = users[4]
    const cookie = `token=${tokens[0]}`

    request(app)
      .patch(`/users/${ _id }`)
      .set('Cookie', cookie)
      .type('form')
      .send(`email=${email}`)
      .send(`password=${password}`)
      .expect(409)
      .end((err) => {
        if (err) return done(err)

        User.findById(_id).then((user) => {
          expect(user._id).toEqual(_id)
          expect(user.email).not.toEqual(email)
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

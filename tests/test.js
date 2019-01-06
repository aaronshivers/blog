const expect = require('expect')
const request = require('supertest')
const { ObjectId } = require('mongodb')

const Blog = require(`../models/blog-model`)
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

// GET /blogs/new
describe('GET /blogs/new', () => {

  it('should respond 200, and GET /blogs, if user is logged in.', (done) => {
    const cookie = `token=${tokens[0]}`

    request(app)
      .get('/blogs/new')
      .set('Cookie', cookie)
      .expect(200)
      .end(done)
  })

  it('should respond 401, if user is NOT logged in.', (done) => {

    request(app)
      .get('/blogs/new')
      .expect(401)
      .end(done)
  })
})

// POST /blogs
describe('POST /blogs', () => {

  it('should respond 302, redirect to /blogs, and create a new blog if user is logged in', (done) => {
    const cookie = `token=${tokens[0]}`
    const { title, body, image } = blogs[2]
    
    request(app)
      .post('/blogs')
      .set('Cookie', cookie)
      .type('form')
      .send(`title=${ title }`)
      .send(`body=${ body }`)
      .send(`image=${ image }`)
      .expect(302)
      .expect((res) => {
        expect(res.header.location).toEqual('/blogs')
      })
      .end((err, res) => {
        if (err) return done(err)

        Blog.findOne({ title }).then((blog) => {
          expect(blog.title).toEqual(title)
          expect(blog.body).toEqual(body)
          expect(blog.image).toEqual(image)
          done()
        }).catch((err) => done(err.message))
      })
  })

  it('should respond 400, and NOT create a duplicate blog', (done) => {
    const cookie = `token=${tokens[0]}`
    const { title, body, image } = blogs[0]
    
    request(app)
      .post(`/blogs/`)
      .set('Cookie', cookie)
      .type('form')
      .send(`title=${ title }`)
      .send(`body=${ body }`)
      .send(`image=${ image }`)
      .expect(400)
      .end((err, res) => {
        if (err) return done(err.message)

        Blog.find().then((blogs) => {
          expect(blogs.length).toBe(2)
          done()
        }).catch((err) => done(err.message))
      })
  })

  it('should respond 400, and NOT create a new blog, if data is invalid', (done) => {
    const cookie = `token=${tokens[0]}`

    request(app)
      .post('/blogs')
      .set('Cookie', cookie)
      .type('form')
      .send()
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err.message)
        }
        
        Blog.find().then((blogs) => {
          expect(blogs.length).toBe(2)
          done()
        }).catch((err) => done(err.message))
      })
  })

  it('should respond 401, and NOT create a new blog, if user is NOT logged in', (done) => {
    const { title, body, image } = blogs[2]

    request(app)
      .post('/blogs')
      .type('form')
      .send(`title=${ title }`)
      .send(`body=${ body }`)
      .send(`image=${ image }`)
      .expect(401)
      .end((err, res) => {
        if (err) {
          return done(err.message)
        }
        
        Blog.find().then((blogs) => {
          expect(blogs.length).toBe(2)
          done()
        }).catch((err) => done(err.message))
      })
  })
})

// GET /blogs
describe('GET /blogs', () => {
  it('should respond 200, and GET /blogs', (done) => {
    request(app)
      .get('/blogs')
      .expect(200)
      .end(done)
  })
})

// GET /blogs/list
describe('GET /blogs/list', () => {

  it('should respond 200, and GET /blogs/list, if user logged in and is creator', (done) => {
    const cookie = `token=${tokens[0]}`
    const { _id } = users[0]

    request(app)
      .get(`/blogs/list`)
      .set('Cookie', cookie)
      .expect(200)
      .end(done)
  })

  it('should respond 401, if user is NOT logged in', (done) => {
    const { _id } = users[0]

    request(app)
      .get(`/blogs/list`)
      .expect(401)
      .end(done)
  })

  it('should respond 401, if user is logged in, but NOT creator', (done) => {

    const cookie = `token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YzMxNWJhYWViNjc5ZjdhMWVlNzAzYjEiLCJhZG1pbiI6ZmFsc2UsImlhdCI6MTU0NjczODYwMiwiZXhwIjoxNTQ2ODI1MDAyfQ.ZSDfhUNvJBs2TyknQXbStu77-qpVJFDakm9KBFV7IWA`
    const { _id } = users[0]

    request(app)
      .get(`/blogs/list`)
      .set('Cookie', cookie)
      .expect(401)
      .end(done)
  })
})

// GET /blogs/:id/view
describe('GET /blogs/:id/view', () => {
  
  it('should respond with 200, if specified blog exists', (done) => {
    const { _id } = blogs[0]
    request(app)
      .get(`/blogs/${ _id }/view`)
      .expect(200)
      .end(done)
  })

  it('should respond with 404, if specified blog does NOT exist', (done) => {
    const { _id } = new ObjectId()
    request(app)
      .get(`/blogs/${ _id }/view`)
      .expect(404)
      .end(done)
  })

  it('should respond with 400, if ObjectId is invalid', (done) => {
    const { _id } = `invalidObjectId`
    request(app)
      .get(`/blogs/${ _id }/view`)
      .expect(400)
      .end(done)
  })
})

// GET /blogs/:id/edit
describe('GET /blogs/:id/edit', () => {

  it('should respond 200, and GET /blogs/:id/edit, if user is logged in, and is the creator.', (done) => {
    const cookie = `token=${tokens[0]}`
    const { _id } = blogs[0]._id

    request(app)
      .get(`/blogs/${ _id }/edit`)
      .set('Cookie', cookie)
      .expect(200)
      .end(done)
  })

  it('should respond 401, if user is NOT logged in.', (done) => {
    const { _id } = blogs[0]._id

    request(app)
      .get(`/blogs/${ _id }/edit`)
      .expect(401)
      .end(done)
  })

  it('should respond 401, if user is logged in, but NOT the creator.', (done) => {
    const cookie = `token=${tokens[1]}`
    const { _id } = blogs[0]._id

    request(app)
      .get(`/blogs/${ _id }/edit`)
      .set('Cookie', cookie)
      .expect(401)
      .end(done)
  })
})

// PATCH /blogs
describe('PATCH /blogs/:id', () => {

  it('should respond 302, redirect to /blogs, and update the specified blog, if user is logged in, and is creator', (done) => {
    const { _id } = blogs[0]
    const cookie = `token=${tokens[0]}`
    const { title, body, image } = blogs[3]
    
    request(app)
      .patch(`/blogs/${ _id }`)
      .set('Cookie', cookie)
      .type('form')
      .send(`title=${ title }`)
      .send(`body=${ body }`)
      .send(`image=${ image }`)
      .expect(302)
      .expect((res) => {
        expect(res.header.location).toEqual('/blogs')
      })
      .end((err, res) => {
        if (err) return done(err.message)

        Blog.findById({ _id }).then((blog) => {
          expect(blog).toBeTruthy()
          expect(blog.title).toEqual(title)
          expect(blog.body).toEqual(body)
          expect(blog.image).toEqual(image)
          done()
        }).catch((err) => done(err.message))
      })
  })

  it('should respond 404, if specified blog is not found', (done) => {
    const { _id } = new ObjectId()
    const cookie = `token=${tokens[0]}`
    const { title, body, image } = blogs[3]

    request(app)
      .patch(`/blogs/${ _id }`)
      .set('Cookie', cookie)
      .type('form')
      .send(`title=${ title }`)
      .send(`body=${ body }`)
      .send(`image=${ image }`)
      .expect(404)
      .end((err, res) => {
        if (err) return done(err.message)

        Blog.findOne({ title }).then((blog) => {
          expect(blog).toBeFalsy()
          done()
        }).catch((err) => done(err.message))
      })
  })

  it('should respond 400, and NOT update a duplicate blog', (done) => {
    const { _id } = blogs[0]
    const cookie = `token=${tokens[0]}`
    const { title, body, image } = blogs[1]
    
    request(app)
      .patch(`/blogs/${ _id }`)
      .set('Cookie', cookie)
      .expect(400)
      .type('form')
      .send(`title=${ title }`)
      .send(`body=${ body }`)
      .send(`image=${ image }`)
      .end((err, res) => {
        if (err) return done(err.message)

        Blog.find({ title }).then((blogs) => {
          expect(blogs.length).toBe(1)
          done()
        }).catch((err) => done(err.message))
      })
  })

  it('should respond 400, and NOT update specified blog, if data is invalid', (done) => {
    const { _id } = blogs[0]
    const cookie = `token=${tokens[0]}`

    request(app)
      .patch(`/blogs/${ _id }`)
      .set('Cookie', cookie)
      .type('form')
      .send()
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err.message)
        }
        
        Blog.find().then((blogs) => {
          expect(blogs.length).toBe(2)
          done()
        }).catch((err) => done(err.message))
      })
  })

  it('should respond 401, and NOT update specified blog, if user is NOT logged in', (done) => {
    const { _id } = blogs[0]
    const { title, body, image } = blogs[3]

    request(app)
      .patch(`/blogs/${ _id }`)
      .expect(401)
      .type('form')
      .send(`title=${ title }`)
      .send(`body=${ body }`)
      .send(`image=${ image }`)
      .end((err, res) => {
        if (err) return done(err.message)
        
        Blog.find().then((blogs) => {
          expect(blogs.length).toBe(2)
          done()
        }).catch((err) => done(err.message))
      })
  })

  it('should respond 401, and NOT update the specified blog, if user is logged in, and is NOT creator', (done) => {
    const { _id } = blogs[0]
    const cookie = `token=${tokens[2]}`
    const { title, body, image, creator } = blogs[2]

    request(app)
      .patch(`/blogs/${ _id }`)
      .set('Cookie', cookie)
      .expect(401)
      .type('form')
      .send(`title=${ title }`)
      .send(`body=${ body }`)
      .send(`image=${ image }`)
      .end((err, res) => {
        if (err) return done(err.message)

        Blog.findById({ _id }).then((blog) => {

          expect(blog).toBeTruthy()
          expect(blog.title).not.toEqual(title)
          expect(blog.body).not.toEqual(body)
          expect(blog.image).not.toEqual(image)
          expect(blog.creator).not.toEqual(creator)
          done()
        }).catch((err) => done(err.message))
      })
  })
})

// DELETE /items/:id
describe('DELETE /blogs/:id', () => {

  it('should respond 302, and delete a blog, if user is logged in, and is creator', (done) => {
    const { _id } = blogs[0]
    const cookie = `token=${tokens[0]}`

    request(app)
      .delete(`/blogs/${ _id }`)
      .set('Cookie', cookie)
      .expect(302)
      .expect((res) => {
        expect(res.header.location).toEqual('/blogs')
      })
      .end((err, res) => {
        if (err) return done(err.message)

        Blog.findById({ _id }).then((blog) => {
          expect(blog).toBeFalsy()
          done()
        }).catch((err) => done(err.message))
      })
  })

  it('should return 404 if specified item is not found', (done) => {
    const id =  new ObjectId()
    const cookie = `token=${tokens[0]}`

    request(app)
      .delete(`/blogs/${id}`)
      .set('Cookie', cookie)
      .expect(404)
      .end((err, res) => {
        if (err) return done(err.message)

        Blog.find().then((blogs) => {
          expect(blogs.length).toBe(2)
          done()
        }).catch((err) => done(err.message))
      })
  })

  it('should return 401, if user is NOT logged in', (done) => {
    const { _id } = blogs[0]

    request(app)
      .delete(`/blogs/${ _id }`)
      .expect(401)
      .end((err, res) => {
        if (err) return done(err.message)

        Blog.findById({ _id }).then((blog) => {
          expect(blog).toBeTruthy()
          done()
        }).catch((err) => done(err.message))
      })
  })

  it('should return 401, if user is logged in, but NOT creator', (done) => {
    const { _id } = blogs[0]
    const cookie = `token=${tokens[2]}`

    request(app)
      .delete(`/blogs/${ _id }`)
      .set('Cookie', cookie)
      .expect(401)
      .end((err, res) => {
        if (err) return done(err.message)

        Blog.findById({ _id }).then((blog) => {
          expect(blog).toBeTruthy()
          done()
        }).catch((err) => done(err.message))
      })
  })
})

// GET /profile
describe('GET /profile', () => {

  it('should respond 401, if user has token, but is not in database', (done) => {
    const cookie = `token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YzMxNWJhYWViNjc5ZjdhMWVlNzAzYjEiLCJhZG1pbiI6ZmFsc2UsImlhdCI6MTU0NjczODYwMiwiZXhwIjoxNTQ2ODI1MDAyfQ.ZSDfhUNvJBs2TyknQXbStu77-qpVJFDakm9KBFV7IWA`

    request(app)
      .get('/profile')
      .set('Cookie', cookie)
      .expect(401)
      .end(done)
  })
})
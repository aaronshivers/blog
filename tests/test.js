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

// POST /blogs
describe('POST /blogs', () => {

  it('should respond 302, redirect to /blogs, and create a new blog', (done) => {
    const cookie = `token=${tokens[0]}`
    const { title, body, image, creator } = blogs[2]
    
    request(app)
      .post('/blogs')
      .set('Cookie', cookie)
      .type('form')
      .send(`title=${ title }`)
      .send(`body=${ body }`)
      .send(`image=${ image }`)
      .send(`creator=${ creator }`)
      .expect(302)
      .expect((res) => {
        expect(res.header.location).toEqual('/blogs')
      })
      .end((err, res) => {
        if (err) return done(err)

        Blog.find({ title }).then((blog) => {
          expect(blog.length).toBe(1)
          expect(blog[0].title).toEqual(title)
          expect(blog[0].body).toEqual(body)
          expect(blog[0].image).toEqual(image)
          expect(blog[0].creator).toEqual(creator)
          done()
        }).catch((err) => done(err))
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
          return done(err)
        }
        
        Blog.find().then((blogs) => {
          expect(blogs.length).toBe(2)
          done()
        })
      })
  })

  it('should respond 401, and NOT create a new blog, if user is not logged in', (done) => {
    const { title, body, image, creator } = blogs[2]

    request(app)
      .post('/blogs')
      .type('form')
      .send(`title=${ title }`)
      .send(`body=${ body }`)
      .send(`image=${ image }`)
      .send(`creator=${ creator }`)
      .expect(401)
      .end((err, res) => {
        if (err) {
          return done(err)
        }
        
        Blog.find().then((blogs) => {
          expect(blogs.length).toBe(2)
          done()
        })
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

const expect = require('expect')
const request = require('supertest')
const { ObjectId } = require('mongodb')

const app = require('../app')
const {
  populateUsers,
  populateBlogs,
  users,
  blogs
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

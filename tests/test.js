const expect = require('expect')
const request = require('supertest')

const app = require('../app')
const { populateBlogs } = require(`./seed`)

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

// GET /
describe('GET /blogs', () => {
  it('should respond 200, and GET /blogs', (done) => {
    request(app)
      .get('/blogs')
      .expect(200)
      .end(done)
  })
})

// GET /
describe('GET /blogs/:id/view', () => {
  it('should respond with 200, and GET /blogs/:id/view', (done) => {
    request(app)
      .get('/blogs/5c30c0bd3f8cbd5b68bc0617/view')
      .expect(200)
      .end(done)
  })
})

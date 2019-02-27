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

// GET /blogs/new
describe('GET /blogs/new', () => {

  it('should respond 200, and GET /blogs, if user is logged in.', async () => {
    const cookie = `token=${tokens[0]}`

    await request(app)
      .get('/blogs/new')
      .set('Cookie', cookie)
      .expect(200)
  })

  it('should respond 401, if user is NOT logged in.', async () => {

    await request(app)
      .get('/blogs/new')
      .expect(401)
  })
})

// POST /blogs
describe('POST /blogs', () => {

  it('should respond 302, redirect to /blogs, and create a new blog if user is logged in', async () => {
    const cookie = `token=${tokens[0]}`
    const { title, body, image } = blogs[2]
    
    await request(app)
      .post('/blogs')
      .set('Cookie', cookie)
      .send(`title=${ title }`)
      .send(`body=${ body }`)
      .send(`image=${ image }`)
      .expect(302)
      .expect((res) => {
        expect(res.header.location).toEqual('/blogs')
      })

    const foundBlog = await Blog.findOne({ title })
    expect(foundBlog.title).toEqual(title)
    expect(foundBlog.body).toEqual(body)
    expect(foundBlog.image).toEqual(image)
  })

  it('should respond 400, and NOT create a duplicate blog', async () => {
    const cookie = `token=${tokens[0]}`
    const { title, body, image } = blogs[0]
    
    await request(app)
      .post(`/blogs/`)
      .set('Cookie', cookie)
      .send(`title=${ title }`)
      .send(`body=${ body }`)
      .send(`image=${ image }`)
      .expect(400)

    const foundBlogs = await Blog.find()
    expect(foundBlogs.length).toBe(2)
  })

  it('should respond 400, and NOT create a new blog, if data is invalid', async () => {
    const cookie = `token=${tokens[0]}`

    await request(app)
      .post('/blogs')
      .set('Cookie', cookie)
      .send()
      .expect(400)
        
    const foundBlogs = await Blog.find()
    expect(foundBlogs.length).toBe(2)
  })

  it('should respond 401, and NOT create a new blog, if user is NOT logged in', async () => {
    const { title, body, image } = blogs[2]

    await request(app)
      .post('/blogs')
      .send(`title=${ title }`)
      .send(`body=${ body }`)
      .send(`image=${ image }`)
      .expect(401)
        
    const foundBlogs = await Blog.find()
    expect(foundBlogs.length).toBe(2)
  })
})

// GET /blogs
describe('GET /blogs', () => {
  it('should respond 200, and GET /blogs', async () => {
    await request(app)
      .get('/blogs')
      .expect(200)
  })
})

// GET /blogs/list
describe('GET /blogs/list', () => {

  it('should respond 200, and GET /blogs/list, if user logged in and is creator', async () => {
    const cookie = `token=${tokens[0]}`
    const { _id } = users[0]

    await request(app)
      .get(`/blogs/list`)
      .set('Cookie', cookie)
      .expect(200)
  })

  it('should respond 401, if user is NOT logged in', async () => {
    const { _id } = users[0]

    await request(app)
      .get(`/blogs/list`)
      .expect(401)
  })

  it('should respond 401, if user is logged in, but NOT creator', async () => {

    const cookie = `token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YzMxNWJhYWViNjc5ZjdhMWVlNzAzYjEiLCJhZG1pbiI6ZmFsc2UsImlhdCI6MTU0NjczODYwMiwiZXhwIjoxNTQ2ODI1MDAyfQ.ZSDfhUNvJBs2TyknQXbStu77-qpVJFDakm9KBFV7IWA`
    const { _id } = users[0]

    await request(app)
      .get(`/blogs/list`)
      .set('Cookie', cookie)
      .expect(401)
  })
})

// GET /blogs/:id/view
describe('GET /blogs/:id/view', () => {
  
  it('should respond with 200, if specified blog exists', async () => {
    const { _id } = blogs[0]
    await request(app)
      .get(`/blogs/${ _id }/view`)
      .expect(200)
  })

  it('should respond with 404, if specified blog does NOT exist', async () => {
    const { _id } = new ObjectId()
    await request(app)
      .get(`/blogs/${ _id }/view`)
      .expect(404)
  })

  it('should respond with 400, if ObjectId is invalid', async () => {
    const { _id } = `invalidObjectId`
    await request(app)
      .get(`/blogs/${ _id }/view`)
      .expect(400)
  })
})

// GET /blogs/:id/edit
describe('GET /blogs/:id/edit', () => {

  it('should respond 200, and GET /blogs/:id/edit, if user is logged in, and is the creator.', async () => {
    const cookie = `token=${tokens[0]}`
    const { _id } = blogs[0]._id

    await request(app)
      .get(`/blogs/${ _id }/edit`)
      .set('Cookie', cookie)
      .expect(200)
  })

  it('should respond 401, if user is NOT logged in.', async () => {
    const { _id } = blogs[0]._id

    await request(app)
      .get(`/blogs/${ _id }/edit`)
      .expect(401)
  })

  it('should respond 401, if user is logged in, but NOT the creator.', async () => {
    const cookie = `token=${tokens[1]}`
    const { _id } = blogs[0]._id

    await request(app)
      .get(`/blogs/${ _id }/edit`)
      .set('Cookie', cookie)
      .expect(401)
  })
})

// PATCH /blogs/:id
describe('PATCH /blogs/:id', () => {

  it('should respond 302, redirect to /blogs, and update the specified blog, if user is logged in, and is creator', async () => {
    const { _id } = blogs[0]
    const cookie = `token=${tokens[0]}`
    const { title, body, image } = blogs[3]
    
    await request(app)
      .patch(`/blogs/${ _id }`)
      .set('Cookie', cookie)
      .send(`title=${ title }`)
      .send(`body=${ body }`)
      .send(`image=${ image }`)
      .expect(302)
      .expect((res) => {
        expect(res.header.location).toEqual('/blogs')
      })

    const foundBlog = await Blog.findById({ _id })
    expect(foundBlog).toBeTruthy()
    expect(foundBlog.title).toEqual(title)
    expect(foundBlog.body).toEqual(body)
    expect(foundBlog.image).toEqual(image)
  })

  it('should respond 404, if specified blog is not found', async () => {
    const { _id } = new ObjectId()
    const cookie = `token=${tokens[0]}`
    const { title, body, image } = blogs[3]

    await request(app)
      .patch(`/blogs/${ _id }`)
      .set('Cookie', cookie)
      .send(`title=${ title }`)
      .send(`body=${ body }`)
      .send(`image=${ image }`)
      .expect(404)

    const foundBlog = await Blog.findOne({ title })
    expect(foundBlog).toBeFalsy()
  })

  it('should respond 400, and NOT update a duplicate blog', async () => {
    const { _id } = blogs[0]
    const cookie = `token=${tokens[0]}`
    const { title, body, image } = blogs[1]
    
    await request(app)
      .patch(`/blogs/${ _id }`)
      .set('Cookie', cookie)
      .expect(400)
      .send(`title=${ title }`)
      .send(`body=${ body }`)
      .send(`image=${ image }`)

    const foundBlogs = await Blog.find({ title })
    expect(foundBlogs.length).toBe(1)
  })

  it('should respond 400, and NOT update specified blog, if data is invalid', async () => {
    const { _id } = blogs[0]
    const cookie = `token=${tokens[0]}`

    await request(app)
      .patch(`/blogs/${ _id }`)
      .set('Cookie', cookie)
      .send()
      .expect(400)
      
      const foundBlogs = await Blog.find()
      expect(foundBlogs.length).toBe(2)
  })

  it('should respond 401, and NOT update specified blog, if user is NOT logged in', async () => {
    const { _id } = blogs[0]
    const { title, body, image } = blogs[3]

    await request(app)
      .patch(`/blogs/${ _id }`)
      .expect(401)
      .send(`title=${ title }`)
      .send(`body=${ body }`)
      .send(`image=${ image }`)
      
    const foundBlogs = await Blog.find()
    expect(foundBlogs.length).toBe(2)
  })

  it('should respond 401, and NOT update the specified blog, if user is logged in, and is NOT creator', async () => {
    const { _id } = blogs[0]
    const cookie = `token=${tokens[2]}`
    const { title, body, image, creator } = blogs[2]

    await request(app)
      .patch(`/blogs/${ _id }`)
      .set('Cookie', cookie)
      .expect(401)
      .send(`title=${ title }`)
      .send(`body=${ body }`)
      .send(`image=${ image }`)

    const foundBlog = await Blog.findById({ _id })
    expect(foundBlog).toBeTruthy()
    expect(foundBlog.title).not.toEqual(title)
    expect(foundBlog.body).not.toEqual(body)
    expect(foundBlog.image).not.toEqual(image)
    expect(foundBlog.creator).not.toEqual(creator)
  })
})

// DELETE /items/:id
describe('DELETE /blogs/:id', () => {

  it('should respond 302, and delete a blog, if user is logged in, and is creator', async () => {
    const { _id } = blogs[0]
    const cookie = `token=${tokens[0]}`

    await request(app)
      .delete(`/blogs/${ _id }`)
      .set('Cookie', cookie)
      .expect(302)
      .expect((res) => {
        expect(res.header.location).toEqual('/blogs')
      })

    const foundBlog = await Blog.findById({ _id })
    expect(foundBlog).toBeFalsy()
  })

  it('should return 404 if specified item is not found', async () => {
    const id =  new ObjectId()
    const cookie = `token=${tokens[0]}`

    await request(app)
      .delete(`/blogs/${id}`)
      .set('Cookie', cookie)
      .expect(404)

    const foundBlogs = await Blog.find()
    expect(foundBlogs.length).toBe(2)
  })

  it('should return 401, if user is NOT logged in', async () => {
    const { _id } = blogs[0]

    await request(app)
      .delete(`/blogs/${ _id }`)
      .expect(401)

    const foundBlog = await Blog.findById({ _id })
    expect(foundBlog).toBeTruthy()
  })

  it('should return 401, if user is logged in, but NOT creator', async () => {
    const { _id } = blogs[0]
    const cookie = `token=${tokens[2]}`

    await request(app)
      .delete(`/blogs/${ _id }`)
      .set('Cookie', cookie)
      .expect(401)

    const foundBlog = await Blog.findById({ _id })
    expect(foundBlog).toBeTruthy()
  })
})

// GET /blogs/search
describe('GET /blogs/search', () => {

  it('should respond 200', async () => {
    const term = blogs[0].title

    await request(app)
      .get('/blogs/search')
      .expect(200)
      .query({ term: term })
  })

  it(`should respond 404, search term isn't found`, async () => {
    const term = 'somethingthatsprobablynotinthedatabase'

    await request(app)
      .get('/blogs/search')
      .expect(404)
      .query({ term: term })
  })
})

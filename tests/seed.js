const { ObjectId } = require('mongodb')

const Blog = require(`../models/blog-model`)

const populateBlogs = () => {
  const _id = new ObjectId()
  const title = `test blog title`
  const body = `test blog body`
  const image = `test blog image`
  const newBlog = { title, body, image }
  const blog = new Blog(newBlog)

  blog.save()
}



module.exports = {
  populateBlogs
}

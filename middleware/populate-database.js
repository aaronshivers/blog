const faker = require('faker')
const app = require('../app.js')

const User = require('../models/user-model')
const Blog = require('../models/blog-model')

const populateUsers = async () => {
  const userQty = 100

  try {
    await User.deleteMany()
    for (let i = 0; i < userQty; i++) {
      const email = faker.internet.email()
      const password = faker.internet.password()
      const avatar = faker.image.avatar()
      const firstName = faker.name.firstName()
      const lastName = faker.name.lastName()
      const jobTitle = faker.name.jobTitle()
      const jobArea = faker.name.jobArea()
      const jobType = faker.name.jobType()
      const jobDescriptor = faker.name.jobDescriptor()
      const streetAddress = faker.address.streetAddress()
      const city = faker.address.city()
      const state = faker.address.state()
      const zipCode = faker.address.zipCode()

      const newUser = {
        email, password, firstName, lastName,
        jobTitle, jobDescriptor, jobArea, jobType,
        streetAddress, city, state, zipCode, avatar
      }

      const user = new User(newUser)
      
      user.save()
    }
  } catch (error) {
    throw new Error (error)
  }
}

const populateBlogs = async () => {

  try {
    await Blog.deleteMany()
    const users = await User.find()
    const blogQty = 100
    const max = users.length

    for (let i = 0; i < blogQty; i++) {
      const num = Math.floor(Math.random() * Math.floor(max))
      const title = faker.company.catchPhrase()
      const body = faker.hacker.phrase()
      const image = faker.image.image()
      const creator = users[num]._id
      const newBlog = { title, body, image, creator }
      const blog = new Blog(newBlog)

      blog.save()
    }
  } catch (error) {
    throw new Error (error)
  }
}

module.exports = {
  populateUsers,
  populateBlogs
}

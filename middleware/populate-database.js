const faker = require('faker')
const app = require('../app.js')

const User = require('../models/user-model')
const Blog = require('../models/blog-model')

const populateDatabase = () => {
  const userQty = 10
  const blogQty = 100

  User.deleteMany().then(() => {

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
  }).catch(err => console.log(err))

  Blog.deleteMany().then(() => {

    User.find().then((users) => {

      const max = users.length
      const num = Math.floor(Math.random() * Math.floor(max))

      for (let i = 0; i < blogQty; i++) {
        const title = faker.company.catchPhrase()
        const body = faker.hacker.phrase()
        const image = faker.image.image()
        const creator = users[num]._id
        const newBlog = { title, body, image, creator }
        const blog = new Blog(newBlog)

        blog.save()
      }
    }).catch(err => console.log(err))
  })
}

populateDatabase()

module.exports = populateDatabase

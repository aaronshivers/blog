const faker = require('faker')
const app = require('../app.js')

const User = require('../models/user-model')

const populateDatabase = () => {
  const userQty = 1000

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
  })
}

module.exports = populateDatabase

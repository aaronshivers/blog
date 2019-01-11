const faker = require('faker')
const { ObjectId } = require('mongodb')

const User = require(`../models/user-model`)
const Blog = require(`../models/blog-model`)
const { createToken } = require('../middleware/handle-tokens')

const users = [{
  _id: new ObjectId(),
  email: faker.internet.email(),
  password: `0asdfASDF1234!@#`,
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  jobTitle: faker.name.jobTitle(),
  avatar: faker.image.avatar()
}, {
  _id: new ObjectId(),
  email: faker.internet.email(),
  password: `1asdfASDF1234!@#`,
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  jobTitle: faker.name.jobTitle(),
  avatar: faker.image.avatar(),
  admin: true // Admin Account
}, {
  _id: new ObjectId(),
  email: faker.internet.email(),
  password: `2asdfASDF1234!@#`,
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  jobTitle: faker.name.jobTitle(),
  avatar: faker.image.avatar()
}, {
  _id: new ObjectId(),
  email: `invalid.email@net`, // invalid email
  password: `3asdfASDF1234!@#`,
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  jobTitle: faker.name.jobTitle(),
  avatar: faker.image.avatar()
}, {
  _id: new ObjectId(),
  email: faker.internet.email(),
  password: `4asdfASDF1234`, // invalid password
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  jobTitle: faker.name.jobTitle(),
  avatar: faker.image.avatar()
}]

const blogs = [{
  _id: new ObjectId(),
  title: faker.company.catchPhrase(),
  body: faker.hacker.phrase(),
  image: faker.image.image(),
  creator: users[0]._id
}, {
  _id: new ObjectId(),
  title: faker.company.catchPhrase(),
  body: faker.hacker.phrase(),
  image: faker.image.image(),
  creator: users[1]._id
}, {
  _id: new ObjectId(),
  title: faker.company.catchPhrase(),
  body: faker.hacker.phrase(),
  image: faker.image.image(),
  creator: users[2]._id
}, {
  _id: new ObjectId(),
  title: faker.company.catchPhrase(),
  body: faker.hacker.phrase(),
  image: faker.image.image(),
  creator: users[0]._id
}]

const populateUsers = (done) => {
  User.deleteMany().then(() => {
    const user0 = new User(users[0]).save()
    const user1 = new User(users[1]).save()

    return Promise.all([user0, user1])
  }).then(() => done())
}

const populateBlogs = (done) => {
  Blog.deleteMany().then(() => {
    const blog0 = new Blog(blogs[0]).save()
    const blog1 = new Blog(blogs[1]).save()

    return Promise.all([blog0, blog1])
  }).then(() => done())
}

const tokens = []
  
users.forEach((user) => {
  createToken(user).then((token) => {
    tokens.push(token)
  })
})

module.exports = {
  populateUsers,
  populateBlogs,
  users,
  blogs,
  tokens
}

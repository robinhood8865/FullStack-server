/*eslint linebreak-style: ['error', 'windows']*/

const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require ('../models/user')

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body
  console.log(request)
  const existingUser = await User.findOne({ username })
  if(existingUser){
    return response.status(400).json({
      error: 'username must be unique'
    })
  }
  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)
  const user = new User({
    username,
    name,
    passwordHash,
  })
  const savedUser = await user.save()
  response.status(201).json(savedUser)

})

usersRouter.get('/', async (request, response) => {
  //if the value is 1, show data
  // const users = await User.find({}).populate('notes', { content: 1, date : 1 })
  const users = await User.find({}).populate('notes')
  response.json(users)
})


module.exports = usersRouter

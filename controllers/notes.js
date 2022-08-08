/*eslint linebreak-style: ['error', 'windows']*/

const jwt = require('jsonwebtoken')
const notesRouter = require('express').Router()
const Note = require('../models/note')
const User = require('../models/user')

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if(authorization && authorization.toLowerCase().startsWith('bearer ')){
    return authorization.substring()
  }
  return null
}

// notesRouter.get('/', (request, response) => {
//   Note.find({}).then(notes => {
//     response.json(notes)
//   })
// })

//It's same to above code
notesRouter.get('/', async (request, response) => {
  const notes = await Note.find({})
  response.json(notes)
})


notesRouter.get('/:id', async (request, response, next) => {
  try {
    const note = await Note.findById(request.params.id)
    if (note) {
      response.json(note)
    } else {
      response.status(404).end()
    }
  } catch(exception){
    next(exception)
  }

  //same as above
  // Note.findById(request.params.id)
  //   .then(note => {
  //     if (note) {
  //       response.json(note)
  //     } else {
  //       response.status(404).end()
  //     }
  //   })
  //   .catch(error => next(error))
})

notesRouter.post('/', async (request, response) => {
  const body = request.body
  const token = getTokenFrom(request)
  console.log('posttoken:', token)
  const decodedToken = jwt.verify(token, process.env.SECRET)
  console.log('decodedToken:', decodedToken)
  if(!decodedToken.id){
    return response.status(400).json({ error: 'token missing or invalid' })
  }
  const user = await User.findById(decodedToken.userId)
  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date(),
    user: user._id
  })

  const savedNote = await note.save()
  user.notes = user.notes.concat(savedNote._id)
  await user.save()
  response.status(201).json(savedNote)

})


notesRouter.delete('/:id', async (request, response) => {
  await Note.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

// same as above
// notesRouter.delete('/:id', (request, response, next) => {
//   Note.findByIdAndRemove(request.params.id)
//     .then(() => {
//       response.status(204).end()
//     })
//     .catch(error => next(error))
// })

notesRouter.put('/:id', (request, response, next) => {
  const body = request.body

  const note = {
    content: body.content,
    important: body.important,
  }

  Note.findByIdAndUpdate(request.params.id, note, { new: true })
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
})

module.exports = notesRouter
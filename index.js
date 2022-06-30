const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()
const Person = require('./models/person')


app.use(express.static('build'))
app.use(express.json())
morgan.token('type', function (req) {
    if (req.method === 'POST') {
        return JSON.stringify(req.body)
    }
    return ''

})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :type'))
app.use(cors())

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/info', (request, response) => {
    Person.find({}).then(persons => {
        response.send(
            `<p>Phonebook has info for ${persons.length} people</p>
            <p>${new Date()}</p>`
        )
    })
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then((person) => {
            if (!person) {
                response.status(404).end()
            }
            response.json(person)
        })
        .catch(error => next(error))
})


app.post('/api/persons', (request, response, next) => {
    const body = request.body

    if (body.name === undefined) {
        return response.status(400).json({
            error: 'name is missing'
        })
    }

    if (body.number === undefined) {
        return response.status(400).json({
            error: 'number is missing'
        })
    }

    let validationError

    const person = new Person({
        name: body.name,
        number: body.number
    })

    validationError =  person.validateSync()
    console.log(validationError)


    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
        .catch(error => next(error))
})


app.put('/api/persons/:id', (request, response, next) => {
    const { name, number } = request.body

    Person.findByIdAndUpdate(
        request.params.id, { name, number }, { new: true, runValidators: true, context:'query' })
        .then((updatedPerson) => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))

})


app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(() => {
            response.status(204).end()
        })
        .catch(error => next(error))
})




const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }


    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
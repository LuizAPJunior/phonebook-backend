const mongoose = require('mongoose')
require('dotenv').config()

if (process.argv.length < 3) {
    console.log('Please provide the password: node mongo.js <password>')
    process.exit(1)
}


const name = process.argv[3]
const number = process.argv[4]

const url = process.env.MONGODB_URI

const personSchema = new mongoose.Schema({
    name: String,
    number: String
})

const Person = mongoose.model('Person', personSchema)

const mongoConnected = mongoose.connect(url)
if (process.argv.length < 4) {
    mongoConnected.then(() => {
        console.log('connected')
        Person.find({}).then(result => {
            console.log('phonebook: ')
            result.forEach(person => {
                console.log(`${person.name} ${person.number}`)
            })
            mongoose.connection.close()
        })
    })
}
else if (process.argv.length > 3) {
    mongoConnected
        .then(() => {
            const person = new Person({
                name: name,
                number: number
            })

            return person.save()
        })
        .then((result) => {
            console.log(`added ${result.name} number ${result.number} to phonebook`)
            mongoose.connection.close()
        })
        .catch((err) => console.log(err))
}

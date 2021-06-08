const bcrypt = require('bcrypt')
const hashedPassword = bcrypt.hash('org0', 10)
const users = []
users.push({
    id: Date.now().toString(),
    name: 'org0',
    email: 'test@test',
    password: hashedPassword})
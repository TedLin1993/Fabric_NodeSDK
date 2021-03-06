if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const app = express()
const port = 3000
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const initializePassport = require('./passport-config')
initializePassport(
  passport,
  username => users.find(user => user.name === username),
  id => users.find(user => user.id === id)
)

//test: store user information in memory, not in db, it is for demo
const users = []

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

//login username
let user

app.get('/', checkAuthenticated, (req, res) => {
  user = req.user.name
  res.render('index.ejs', { name: user })
})

const queryModule = require('./scripts/query')
app.get('/query', checkAuthenticated, (req, res) => {
  res.render('query.ejs', { name: user, logStr: '' })
})
app.post('/query', checkAuthenticated, async (req, res) => {
  let queryStrList = []

  if (req.body.id_number !== ''){
    queryStrList.push(`"id_number": "${req.body.id_number}"`)
  }
  if (req.body.data_owner !== ''){
    queryStrList.push(`"data_owner": "${req.body.data_owner}"`)
  } 
  if (req.body.last_name !== ''){
    queryStrList.push(`"last_name": "${req.body.last_name}"`)
  }
  if (req.body.first_name !== ''){
    queryStrList.push(`"first_name": "${req.body.first_name}"`)
  }
  if (req.body.dob !== ''){
    queryStrList.push(`"dob": "${req.body.dob}"`)
  }
  if (req.body.country !== ''){
    queryStrList.push(`"country": "${req.body.country}"`)
  }

  //get query information
  let queryStr = queryStrList.join(',')
  let {logStr, queryResponseJson} = await queryModule.Query(user, queryStr)
  res.render('query.ejs', { name: user, logStr: logStr, queryResponseJson: queryResponseJson })
})

//create, update and delete use invoke module
const invokeModule = require('./scripts/invoke')

app.get('/create', checkAuthenticated, (req, res) => {
  res.render('create.ejs', { name: user, logStr: '' })
})

app.post('/create', checkAuthenticated, async (req, res) => {
  let invoke = {}
  invoke.function = 'Create'
  invoke.last_name = req.body.last_name
  invoke.first_name = req.body.first_name
  invoke.dob = req.body.dob
  invoke.country = req.body.country
  invoke.id_number = req.body.id_number
  invoke.data_owner =req.body.data_owner
  invoke.risk_level = req.body.risk_level
  let logStr = await invokeModule.Invoke(user, invoke)
  res.render('create.ejs', { name: user, logStr: logStr})
})

app.get('/update', checkAuthenticated, (req, res) => {
  res.render('update.ejs', { name: user, logStr: '' })
})

app.post('/update', checkAuthenticated, async (req, res) => {
  let invoke = {}
  invoke.function = 'Update'
  invoke.last_name = req.body.last_name
  invoke.first_name = req.body.first_name
  invoke.dob = req.body.dob
  invoke.country = req.body.country
  invoke.id_number = req.body.id_number
  invoke.risk_level = req.body.risk_level
  let logStr = await invokeModule.Invoke(user, invoke)
  res.render('update.ejs', { name: user, logStr: logStr})
})


app.get('/delete', checkAuthenticated, (req, res) => {
  res.render('delete.ejs', { name: user, logStr: '' })
})

app.post('/delete', checkAuthenticated, async (req, res) => {
  let invoke = {}
  invoke.function = 'Delete'
  invoke.id_number = req.body.id_number
  let logStr = await invokeModule.invokeModule(user, invoke)
  res.render('delete.ejs', { name: user, logStr: logStr})
})

const getHistoryModule = require('./scripts/getHistory')
app.get('/getHistory', checkAuthenticated, (req, res) => {
  res.render('getHistory.ejs', { name: user, logStr: '' })
})

app.post('/getHistory', checkAuthenticated, async (req, res) => {
  let queryParam = {}
  queryParam.id_number = req.body.id_number
  queryParam.data_owner =req.body.data_owner

  let logStr = await getHistoryModule.GetHistory(user, queryParam)
  res.render('getHistory.ejs', { name: user, logStr: logStr})
})


app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}

app.listen(port, () => {
  users.push({
    id: Date.now().toString(),
    name: 'org0',
    email: 'test@test',
    password: 'org0'
  })
  console.log(users)
  console.log(`Example app listening at http://localhost:${port}`)
})
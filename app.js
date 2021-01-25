const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const mongoose = require("mongoose")
const app = express()
const admin = require("./rotas/admin")
const path = require("path")
const session = require("express-session")
const flash = require("connect-flash")

//Sessão

app.use(session({
    secret: "admin000",
    resave: true,
    saveUninitialized:true
}))

app.use(flash())

//Middleware

app.use(function(req, res, next){
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg = req.flash("error_msg")
    next()
})

//Configuração do BodyParser!
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())

//Configuração do handlebars

app.engine('handlebars',handlebars({defaultLayout:'main'}))
app.set('view engine', 'handlebars');

//Config Mongoose.

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/blogapp",{useNewUrlParser:true,
useUnifiedTopology:true}).then(function(){
    console.log("Connect!")
}).catch(function(error){
    console.log("Error connecting to"+error)
});


//Public

app.use(express.static(path.join(__dirname,"public")))

//Middlewares

app.use(function(req,res,next){
    console.log("Middlewares Ativo!")
    next();
})

//Rotas

app.use('/admin',admin)



const port = 8081
app.listen(port, function(){
    console.log('Servidor Rodando!')
})
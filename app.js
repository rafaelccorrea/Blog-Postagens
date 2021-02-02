const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const mongoose = require("mongoose")
const app = express()
const admin = require("./rotas/admin")
const path = require("path")
const session = require("express-session")
const flash = require("connect-flash")
require("./models/Postagem")
const Postagem = mongoose.model("postagens")
require("./models/categorias")
const Categoria = mongoose.model('categorias')
const usuarios = require("./rotas/usuario")
const passport = require("passport")
require("./config/auth")(passport)
//Config

//Sessão

app.use(session({
    secret: "admin000",
    resave: true,
    saveUninitialized:true
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

//Middleware

app.use(function(req, res, next){
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg = req.flash("error_msg")
    res.locals.error = req.flash("error")
    res.locals.user = req.user;
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

app.get("/", function(req,res){
    Postagem.find().lean().populate("categoria").sort({data: "desc"}).then((postagens)=>{
        res.render("index", {postagens:postagens});
    }).catch((err)=>{
        req.flash("error_msg", "Erro ao carregar as postagens" )
        res.redirect("/404")
    })
})

app.get("/postagem/:slug",(req,res)=>{
    Postagem.findOne({slug:req.params.slug}).lean().then((postagem)=>{
        if(postagem){

                res.render("postagem/index", {postagem:postagem})

        }else{
            req.flash("error_msg", "Esta Postagem Não existe")
            res.redirect("/")
        }
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro!")
        res.redirect("/")
    })
})

app.get("/categorias", (req, res)=>{
    Categoria.find().lean().then((categorias)=>{
        res.render("categorias/index", {categorias:categorias})
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro ao listar as categorias")
        res.redirect("/")
    })
})

app.get("/categorias/:slug", (req, res) =>{
    Categoria.findOne({slug: req.params.slug}).lean().then((categoria)=>{
        if(categoria){

            Postagem.find({categoria: categoria._id}).lean().then((postagens) =>{
                res.render("categorias/postagens",{postagens: postagens, categoria: categoria})

            }).catch((err)=>{
                req.flash("error_msg", "Houve Um erro!")
                res.redirect("/")
            })
        }else{
                req.flash("error_msg", "Esta categoria Não Existe")
                res.redirect("/")
        }
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro ao carregar a pagina!")
        res.redirect("/")
    })
})

app.get("/404", (req,res)=>{
    res.send("erro")
})

app.use('/admin',admin)
app.use("/usuarios",usuarios)


const port = 8081
app.listen(port, function(){
    console.log('Servidor Rodando!')
})
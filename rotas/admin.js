const express = require('express');
const rota = express.Router()
const mongoose = require("mongoose")
require("../models/categorias")
const Categoria = mongoose.model('categorias')
require("../models/Postagem")
const Postagem = mongoose.model('postagens')

rota.get('/',function(req,res) {
    res.render("admin/index")
})

rota.get('/posts', function(req,res) {
    res.send('Pagina de posts')
})

rota.get('/categorias', (req,res) => {
    Categoria.find().sort({date: 'desc'}).lean().then((categorias) => {
        res.render("admin/categorias", {categorias: categorias})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as categorias")
        res.redirect("/admin")
    })
})

rota.get('/add',function(req,res) {
    res.render("admin/add")
})


rota.post("/categorias/nova",function(req,res) {

    var erros =[]

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto:"Nome invalido!"})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto:"Slug invalido!"})
    }

    if(req.body.nome.length < 4){
        erros.push({texto:"Nome da categoria muito pequeno!"})
    }

    if (erros.length > 0){
        res.render("admin/add", {erros: erros})
    }else{
        const novaCategoria = {
            nome:req.body.nome,
            slug:req.body.slug
        }
        new Categoria(novaCategoria).save().then(() =>{
            req.flash("success_msg",'Categoria criada com sucesso!')
            res.redirect("/admin/categorias")
        }).catch(function(err){
            req.flash('error_msg', 'Hove um erro ao registrar a nova categoria!')
            res.redirect("/admin")
        })
    }
})

rota.get("/categorias/edit/:id", function(req, res){
    Categoria.findOne({_id:req.params.id}).lean().then((categoria) => {
    req.flash("Categoria alterada com sucesso!")
     res.render("admin/edit", {categoria: categoria})
}).catch((err) => {
    req.flash("error_msg", "Esta categoria näo existe")
    res.redirect("/admin/categorias")
})
})


rota.post("/categorias/edit", function(req, res){
    Categoria.findOne({_id: req.body.id}).then((categoria) => {
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug
        categoria.save().then(() => {
            req.flash("success_msg", "Categoria Editada com sucesso!")
            res.redirect("/admin/categorias")
        }).catch(err => {
            req.flash("error_msg", "Houve um erro ao salvar a categoria")
            res.redirect("/admin/categorias")
        })

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao editar a categoria")
        res.redirect("/admin/categorias")
    })
})

rota.post("/categorias/deletar/:id", function(req, res){
    Categoria.remove({_id: req.body.id}).then(function(){
        req.flash("success_msg", "Categoria Deletada!")
        res.redirect("/admin/categorias")
    }).catch((err) => {
        req.flash("error_msg", "erro ao deletar a categoria!")
        res.redirect("/admin/categorias")
    })
})


rota.get("/postagens", function(req, res) {
    Postagem.find().lean().populate("categorias").sort({date: "desc"}).then((postagens)=>{
        res.render("admin/postagens", {postagens: postagens})
    }).catch(err=>{
        req.flash("error_msg", "Houve um erro ao carregar a listagem!")
        res.redirect("/admin")
    })
})


rota.get("/postagem/add", function(req, res){
    Categoria.find().lean().then((categorias)=>{
        res.render("admin/addpostagem", {categorias: categorias})
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro ao carregar o formulario")
        res.redirect("/admin")
    })
})

rota.post("/postagens/nova",(req, res)=> {
    var erros = []

    if(req.body.categoria == "0"){
        erros.push({texto: "Categoria invalida! Registre uma categoria."})
    }
    if(erros.length > 0) {
            Categoria.find().then(categorias => {
                res.render("admin/addpostagem", {categorias: erros})
            })
    }else{
            const novaPostagem = {
                titulo: req.body.titulo,
                descricao: req.body.descricao,
                conteudo: req.body.conteudo,
                categoria: req.body.categoria,
                slug: req.body.slug
            }

            new Postagem(novaPostagem).save().then(() =>{
                req.flash("success_msg", "Postagem Criada com Sucesso!")
                res.redirect("/admin/postagens")
            }).catch((err) =>{
                req.flash("error_msg", "Houve um erro ao salvar a postagem!")
                res.redirect("/admin/postagens")
            })
    }
})


rota.get("/postagens/edit/:id", function(req, res){

    Postagem.findOne({_id:req.params.id}).lean().then((postagem)=>{

        Categoria.find().lean().then((categorias)=>{
            res.render("admin/editpostagens", {categorias: categorias, postagem: postagem})
        }).catch(error=>{
            req.flash('error_msg', "Houve um erro ao listar as categorias")
            res.redirect("/admin/postagens")
        })

    }).catch(error=>{
        req.flash("error_msg", "Houve um erro ao carregar o formulario de edição")
        res.redirect("/admin/postagens")
    })
})

rota.post("/postagem/edit", (req,res)=>{
    Postagem.findOne({_id:req.body.id}).then((postagem)=>{

        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(()=>{
            req.flash("success_msg", "Categoria editada com sucesso")
            res.redirect("/admin/postagens")
        }).catch((err) =>{
            req.flash("error_msg", "Erro Interno")
            res.redirect("/admin/postagens")
        })

    }).catch((err)=>{
        console.log(err)
        req.flash("error_msg", "Houve um erro ao salvar!")
        res.redirect("/admin/postagens")
    })
})
 
module.exports = rota
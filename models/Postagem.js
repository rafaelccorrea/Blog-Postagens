const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const Postagem = new Schema({

        titulo:{
            type:'string',
            required: true
        },
        slug:{
            type: 'string',
            required: true
        },
        descricao:{
            type: 'string',
            required: true
        },
        conteudo:{
            type: 'string',
            required: true
        },
        categoria:{
            type:Schema.Types.ObjectId,
            ref:"categorias",
            required: true
        },
        data:{
            type: 'Date',
            default: Date.now()
        }
})

mongoose.model("postagens", Postagem)
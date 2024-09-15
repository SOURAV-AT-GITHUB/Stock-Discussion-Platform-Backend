const mongoose = require('mongoose')

const postSchema = mongoose.Schema({
      title:{type:String,required:true},
      description :{type:String,required:true},
      stockSymbol:{type:String,required:true},
      tags:{type:[String],required:true},
      author:{type:String,required:true},
      username:{type:String,required:true},
      createdAt:{type:Date,default:Date.now()}
})

const PostModel = mongoose.model('post',postSchema)
module.exports = PostModel
var mongoose=require('mongoose');
var article=mongoose.Schema({
    title: String,
    text: String,
});

article.methods.show=function(){
    console.log(this.title+':'+this.text);
}

var Article=mongoose.model('article', article);

module.exports=Article;



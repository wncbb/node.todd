var mongoose=require('mongoose');
mongoose.Promise=global.Promise;
//var db=new mongoose.Mongoose('mongodb://localhost/xiaoyu');
var db=mongoose.connect('mongodb://localhost/xiaoyu');

var ArticleSchema=db.Schema({
  title: String,
  text: String,
  createTime: {type: Date, default: Date.now}
});
//好奇怪，这里写成()=>{}就不行了
ArticleSchema.methods.echoMe=function(){
  console.log(`title:${this.title}, text:${this.text}`);
};

var articleModel=db.model('article', ArticleSchema);

module.exports={
    mid: function(inArg){
        return async(ctx, next)=>{
            ctx.mongo=db;
            await next();
            //ctx.mongo.disconnect();
        };
    },
    articleModel: articleModel,
};



var mongoose=require('mongoose');
mongoose.Promise=global.Promise;
//var db=mongoose.connect('mongodb://localhost/xiaoyu');
//var db=mongoose.connect('mongodb://test:test123@127.0.0.1:30002/xiaoyu');
//var db=mongoose.connect('mongodb://test:test123@localhost:30002/test');
var loginStr='mongodb://'+global.config.db.huge.mongo_0_0.user+':'+global.config.db.huge.mongo_0_0.pwd+'@'+global.config.db.huge.mongo_0_0.host+':'+global.config.db.huge.mongo_0_0.port+'/'+global.config.db.huge.mongo_0_0.db;
console.log(loginStr);
var db=mongoose.connect(loginStr);
//var db=new mongoose.Mongoose('mongodb://localhost/xiaoyu');

var bluePrint={
    article: {
        schema: {
            userId: String,
            title: String,
            text: String,
            createTime: {type: Date, default: Date.now},
            updateTime: {type: Date, default: Date.now},
            category: String,
        },
        name: 'article',
    },
};

var schemaMap={};
var modelMap={};

for(let k in bluePrint){
    let loopName=bluePrint[k]['name'];
    let loopSchema=bluePrint[k]['schema'];
    schemaMap[loopName]=db.Schema(loopSchema);
    modelMap[loopName]=db.model(loopName, schemaMap[loopName]);
}

//好奇怪，这里写成()=>{}就不行了
/*
ArticleSchema.methods.echoMe=function(){
  console.log(`title:${this.title}, text:${this.text}`);
};
*/

module.exports={
    mid: function(inArg){
        return async(ctx, next)=>{
            ctx.model=modelMap;
            await next();
        };
    },
    //articleModel: articleModel,
};



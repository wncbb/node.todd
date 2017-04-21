var mongoose=require('mongoose');
mongoose.Promise=global.Promise;
var db=mongoose.connect('mongodb://localhost/xiaoyu');
//var db=new mongoose.Mongoose('mongodb://localhost/xiaoyu');
//

var bluePrint={
    article: {
        schema: {
            title: String,
            text: String,
            createTime: {type: Date, default: Date.now}
        },
        name: 'article',
    },
};

var schemaMap={};
var modelMap={};

for(let k in bluePrint){
    schemaMap[bluePrint[k]['name']]=db.Schema(bluePrint['schema']);
    modelMap[bluePrint[k]['name']]=db.model(bluePrint[k]['name'], schemaMap[bluePrint[k]['name']]);
}
/*
var ArticleSchema=db.Schema({
  title: String,
  text: String,
  createTime: {type: Date, default: Date.now}
});
*/

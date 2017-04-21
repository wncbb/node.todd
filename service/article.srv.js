class Article{
    constructor(model){
        this.model=model;
    }
    async all(saveInfo){
        var ret=await this.model.find().exec();
        return ret; 
    }
    async find(qryInfo){
        var ret=await this.model.find(qryInfo).exec();
        return ret; 
    }
    async save(articleInfo){
        var saveArticle=new this.model(articleInfo);
        var ret=await saveArticle.save();
        return ret;
    }
}

module.exports=Article;

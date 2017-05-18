class ArticleController{
  constructor({
    srv=null,
  }={}){
    this.srv=srv;
    this.userId=-1;
    this.articleId='';
    this.acInfo={};
  }

  async delete(){
    var ret={};
    ret.code=0;
    if(this.userId<=0){
      ret.code=-1;
      ret.msg='未登录.ctr.article.16';
      return ret;
    }
    if(''==this.articleId){
      ret.code=-1;
      ret.msg='articleId Error.ctr.article.21';
      return ret;
    }
    ret=await this.srv.delete({
      userId: this.userId,
      selector: {
        articleId: this.articleId,
      },
    });
    return ret;
  }

  async edit(){
    var ret={};
    ret.code=0;
    if(this.userId<=0){
      ret.code=-1;
      ret.msg='未登录.ctr.article.35';
      return ret;
    }

    if(''==this.articleId && acInfo.articleId){
      this.articleId=this._checkArticleId(acInfo.articleId);
    }
    var findRst=await this.findById();
    if(findRst.code<0){
      return findRst;
    }

    if(findRst.data.articleInfo.userId!=this.userId){
      ret.code=-1;
      ret.msg='只能修改自己的article.ctr.article.30';
      return ret;
    }

    return findRst;
  }

  async show(){
    if(''==this.articleId && acInfo.articleId){
      this.articleId=this._checkArticleId(acInfo.articleId);
    }
    return await this.findById();
  }

  async update(){
    return await this.srv.update({
      userId: this.userId,
      articleId: this.articleId,
      update: this.acInfo,
    });
  }

  async all(){
    var ret=await this.srv.all();
    return ret;
  }

  async create(){
    delete(this.acInfo.articleId);
    var ret=await this.srv.save({
      userId: this.userId,
      doc: this.acInfo,
    });
    return ret;
  }

  async findById(){
    var ret={};
    ret.code=0;

    if(''==this.articleId && acInfo.articleId){
      this.articleId=this._checkArticleId(acInfo.articleId);
    }

    if(''==this.articleId){
      ret.code=-1;
      ret.msg='article未找到.ctr.article.29';
      return ret;
    }

    var qryRst=await this.srv.findById({
      articleId: this.articleId,
    });
    return qryRst;
  }

  _checkArticleId(articleId){
    if(!articleId.match(/[0-9a-z]{24}/)){
      articleId='';
    }
    return articleId;
  }

  async control({
    userId=-1,
    articleId='',
    acInfo=-1,
  }={}){

    var ret={};
    ret.code=0;

    this.userId=userId;
    this.articleId=this._checkArticleId(articleId);
    this.acInfo=acInfo;

    var ret={};
    ret.code=0;
    switch(acInfo.ac){
      case 'delete':
        ret=await this.delete();
        break;
      case 'update':
        ret=await this.update();
        break;
      case 'show':
        ret=await this.show();
        break;
      case 'edit':
        ret=await this.edit();
        break;
      case 'findById':
        ret=await this.findById();
        break;
      case 'all':
        ret=await this.all();
        break;
      case 'create':
        ret=await this.create();
        break;
      default:
        ret.code=-1;
        ret.msg='unknown ac.ctr.article.45';
        break;
    }
    return ret;
  }

}

module.exports=ArticleController;
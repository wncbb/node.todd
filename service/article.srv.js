class Article{
    constructor({
        db=null,
    }={}){
        this.db=db;
    }


    async findById({
        articleId='',
    }={}){
        var ret={};
        ret.code=0;
        var hugeRst=await this.db.init({
            type0: 'huge',
            type1: 'test',
        });
        if(hugeRst.code<0){
            ret.code=-1;
            ret.msg='huge数据库初始化失败.srv.article.17';
            return ret;
        }
        var article=hugeRst.con.collection('article');
        console.log('articleId: '+articleId);
        var findRst=await article.find({
            _id: articleId,
        });
        if(findRst.code<0){
            ret.code=-1;
            ret.msg='查找失败.srv.article.29';
            return ret;
        }
        if(1!=findRst.data.length){
            ret.code=-1;
            ret.msg='查找失败.srv.article.34';
            return ret;
        }

        ret.code=1;
        ret.data={
            articleInfo: findRst.data[0],
        };
        return ret;
    }

    /*
     * mongodb removeOne selector区分类型的
    */
    async delete({
        userId=-1,
        selector={},
    }={}){
        var ret={};
        ret.code=0;
        var hugeRst=await this.db.init({
            type0: 'huge',
            type1: 'test',
        });
        if(hugeRst.code<0){
            ret.code=-1;
            ret.msg='huge数据库初始化失败.srv.article.17';
            return ret;
        }
        var article=hugeRst.con.collection('article');
        var deleteRst=await article.removeOne({
            _id: selector.articleId,
            userId: Number.parseInt(userId),
        });
        return deleteRst;
    }

    async find(query){
        var ret={};
        ret.code=0;
        var hugeRst=await this.db.init({
            type0: 'huge',
            type1: 'test',
        });
        if(hugeRst.code<0){
            ret.code=-1;
            ret.msg='huge数据库初始化失败.srv.article.17';
            return ret;
        }
        var article=hugeRst.con.collection('article');
        var findRst=await article.find(query);
        if(findRst.code<0){
            ret.code=-1;
            ret.msg='查找失败.srv.article.37';
            return ret;
        }
        if(1!=findRst.data.length){
            ret.code=-1;
            ret.msg='查找失败.srv.article.42';
            return ret;
        }

        ret.code=1;
        ret.data={
            articleInfo: findRst.data[0],
        };
        return ret;
    }

    async all(){
        var ret={};
        ret.code=0;
        var hugeRst=await this.db.init({
            type0: 'huge',
            type1: 'test',
        });
        if(hugeRst.code<0){
            ret.code=-1;
            ret.msg='huge数据库初始化失败.srv.article.33';
            return ret;
        }
        var article=hugeRst.con.collection('article');
        var ret=await article.find();
        return ret; 
    }

    checkTitle(title){
        var ret={};
        ret.code=0;
        if(undefined===title){
            ret.code=-1;
            ret.msg='title不能为空.srv.article.30';
            return ret;
        }
        title=title.toString();
        if(title.length>40){
            ret.code=-1;
            ret.msg='标题过长';
            return ret;
        }

        ret.code=1;
        ret.data={
            title: title,
        };
        return ret;
    }

    async update({
        userId=-1,
        articleId='',
        update={},
    }){
        var ret={};
        ret.code=0;
        if(userId<=0){
            ret.code=-1;
            ret.msg='need login.srv.article.130';
            return ret;
        }
        if(''==articleId){
            ret.code=-1;
            ret.msg='articleId error.srv.article.135';
            return ret;
        }
        var oldInfo=await this.findById({
            userId: userId,
            articleId: articleId        });
        if(oldInfo.code<0){
            return oldInfo;
        }
        if(oldInfo.data.articleInfo.userId!=userId){
            ret.code=-1;
            ret.msg='只有本人可以修改.srv.article.170';
            return ret;
        }

        var setOp={};

        if(update.title){
            setOp.title=update.title;
        }
        if(update.text){
            setOp.text=update.text;
        }
        if(update.category){
            setOp.category=update.category;
        }
        setOp.updateTime=new Date();

        var realUpdate={
            $set: setOp,
        };

        var hugeRst=await this.db.init({
            type0: 'huge',
            type1: 'test',
        });
        if(hugeRst.code<0){
            ret.code=-1;
            ret.msg='huge数据库初始化失败.srv.article.33';
            return ret;
        }

        var article=hugeRst.con.collection('article');
        var updateRst=await article.updateOne({
            _id: articleId,
            userId: Number.parseInt(userId),
        }, realUpdate);
        return updateRst;
    }

    async save({
        userId=-1,
        doc={},
    }={}){
        var ret={};
        ret.code=0;

        var checkTitleRst=this.checkTitle(doc.title);
        if(checkTitleRst.code<=0){
            return checkTitleRst;
        }
        var saveDoc={};
        saveDoc.title=checkTitleRst.data.title;
        saveDoc.text=doc.text;
        saveDoc.category=doc.category;

        if(doc.articleId){
            saveDoc._id=doc.articleId;
            saveDoc.updateTime=new Date();
        }else{
            saveDoc.updateTime=new Date();
            saveDoc.createTime=saveDoc.updateTime;
        }

        userId=Number.parseInt(userId);
        if(userId<=0){
            ret.code=-1;
            ret.msg='userId错误.srv.article.33';
            return ret;
        }
        saveDoc.userId=userId;
        var hugeRst=await this.db.init({
            type0: 'huge',
            type1: 'test',
        });
        if(hugeRst.code<0){
            ret.code=-1;
            ret.msg='huge数据库初始化失败.srv.article.17';
            return ret;
        }
        var article=hugeRst.con.collection('article');
        var rst=await article.save(saveDoc);

        ret.code=1;
        ret.data={};

        if(doc.articleId){
            ret.data.rst=rst.result;
        }else{
            ret.data.articleId=rst.ops[0]._id;
        }
        return ret;
    }

}












module.exports=Article;

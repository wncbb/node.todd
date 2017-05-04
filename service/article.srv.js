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

    /*
    {
        userId: String,
        title: String,
        text: String,
        createTime: {type: Date, default: Date.now},
        updateTime: {type: Date, default: Date.now},
        category: String,
    }
    */
    checkSave({
        userId=0,
        info={},
    }={}){
        var ret={
            errCode: 0,
        };
        if(!(Number.parseInt(userId)>0)){
            ret.errCode=-1;
            ret.errMsg='userId错误.srv.article.33';
            return ret;
        }
        if(!(info.title && info.title.toString().length>0)){
            ret.errCode=-1;
            ret.errMsg='title错误.srv.article.38';
            return ret;
        }
        //TODO check text, createTime, updateTime, category
        ret.errCode=1;
        var curDate=new Date();
        ret.data={
            saveInfo: {
                userId: userId,
                title: info.title,
                text: info.text,
                createTime: curDate,
                updateTime: curDate,
                category: info.category,
            },
        };
        return ret;
    }

    async save({
        userId=0,
        info={},
    }={}){
        var saveRst={};
        if(Number.parseInt(info.id)>0){
            saveRst=await this._update({
                userId: userId,
                info: info,
            });
        }else{
            console.log('update.68');
            saveRst=await this._save({
                userId: userId,
                info: info,
            });
        }
        return saveRst;
    }

    async _save({
        userId=0,
        info={},
    }={}){

        var ret={
            errCode: 0,
        };
        if(!(Number.parseInt(userId)>0)){
            ret.errCode=-1;
            ret.errMsg='userId错误.srv.article.86';
            return ret;
        }

        var checkRst=this.checkSave({
            userId: userId,
            info: info,
        });
        if(checkRst.errCode<=0){
            return checkRst;
        }

        var saveArticle=new this.model(checkRst.data.saveInfo);
        var saveRst=await saveArticle.save();
        if(saveRst){
            ret.errCode=1;
            ret.data={
                id: saveRst._id,
            };
        }else{
            ret.errCode=-1;
            ret.errMsg='保存错误.srv.article.107';
        }
        return ret;
    }
    checkUpdate({
        userId=0,
        info={},
    }){
        var ret={
            errCode: 0,
        };
        if(!(Number.parseInt(userId)>0)){
            ret.errCode=-1;
            ret.errMsg='need login first.srv.article.120';
            return ret;
        }
    
        if(!(info.id && info.id.length>0)){
            ret.errCode=-1;
            ret.errMsg='id错误.srv.article.126';
            return ret;
        }

        var updateInfo={};
        var legalField=['title', 'text', 'category'];
        for(let v of legalField){
            if(info[v]){
                if(info[v].toString().length>0){
                    updateInfo[v]=info[v];
                }else{
                    ret.errCode=-1;
                    ret.errMsg=v+'错误.srv.article.138';
                    return ret;
                }
            }
        }



        ret.errCode=1;
        ret.data={
            updateInfo: updateInfo,
        };
        return ret;
    }
    async _update({
        userId=0,
        info={},
    }){
        var ret={
            errCode: 0,
        };
        if(!(Number.parseInt(userId)>0)){
            ret.errCode=-1;
            ret.errMsg='userId错误.srv.article.161';
            return ret;
        }
        var checkRst=this.checkUpdate({
            userId: userId,
            info: info,
        });
        if(checkRst.errCode<=0){
            return checkRst;
        }

        var findRst=await this.model.findById(info.id);
        if(!findRst){
            ret.errCode=-1;
            ret.errMsg='id错误.srv.article.175';
            return ret;
        }
        var legalField=['title', 'text', 'category'];
        for(let v of legalField){
            if(checkRst.data.updateInfo[v]){
                findRst[v]=checkRst.data.updateInfo[v];
            }
        }

        var updateRst=await findRst.save();
        if(!updateRst){
            ret.errCode=-1;
            ret.errMsg='update失败.srv.article.188';
            return ret;
        }

        ret.errCode=1;
        ret.data={
            id: updateRst._id,
        };
        return ret;
    }
}












module.exports=Article;

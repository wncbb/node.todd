class ArticleCategory{
    constructor({
        db=null,
    }={}){
        this.db=db;
    }

    escapeHtmlSpecialChar_sf(str){
        str = str.replace(/&/g, '&amp;');  
        console.log('1'+str);
        str = str.replace(/</g, '&lt;');  
        console.log('2'+str);
        str = str.replace(/>/g, '&gt;');
        console.log('3'+str);
        str = str.replace(/"/g, '&quot;');
        console.log('4'+str);
        str = str.replace(/'/g, '&#039;');
        console.log('5'+str);

        return str;  
    }

    checkLiteral({
        text='',
    }={}){
        var ret={};
        ret.code=-1;
        text=text.trim();
        if(text.length<=0 || text.length>=20){
            ret.code=-1;
            ret.msg='长度不被允许.srv.articleCategory.15';
            return ret;
        }
        if(!text.match(/[0-9a-zA-Z\u4e00-\u9fa5]+/)){
            ret.code=-1;
            ret.msg='内容不被允许.srv.articleCategory.20';
            return ret;
        }
        ret.code=1;
        ret.data={
            text: text,
        };
        return ret;
    }

    async _exist({
        userId=-1,
        category='',
    }={}){
        userId=Number.parseInt(userId);
        var ret={
            code: -1,
        };
        if(-1==userId){
            ret.code=-1; 
            ret.msg='userId错误.srv.articleCategory.16';
            return ret;
        }
        if(''==category){
            ret.code=-1;
            ret.msg='category错误.srv.articleCategory.21';
            return ret;
        }

        var coreRst=await this.db.init({
            type0: 'core',
            type1: 'read0',
        });
        if(coreRst.code<0){
            ret.code=-1;
            ret.msg='初始化core数据库失败.srv.articleCategory.31';
            return ret;
        }

        var qryStr=`select count(1) as rst_num from article_category where user_id=? and category=?;`;
        var qryRst=await coreRst.con.query(qryStr, [userId, category]);
        if(qryRst[0][0]['rst_num']>0){
            ret.code=-1;
            ret.msg='已经存在该category';
            return ret;
        }
        ret.code=1;
        return ret;
    }

    async incrNum({
        userId=-1,
        categoryId=-1,
        step=0,
    }={}){
        var ret={};
        ret.code=-1;
        userId=Number.parseInt(userId);
        if(userId<=0){
            ret.code=-1;
            ret.msg='userId错误.srv.articleCategory.58';
            return ret;
        }
        categoryId=Number.parseInt(categoryId);
        if(categoryId<=0){
            ret.code=-1;
            ret.msg='categoryId错误.srv.articleCategory.64';
            return ret;
        }
        step=Number.parseInt(step);
        if(0==step){
            ret.code=0;
            return ret;
        }

        var fastRst=await this.db.init({
            type0: 'fast',
            type1: 'write0',
        });
        if(fastRst.code<0){
            ret.code=-1;
            ret.msg='初始化fast数据库失败.srv.articleCategory.79';
            return ret;
        }
        var categoryInfo=await fastRst.con.hgetall(ArticleCategory.articleCategoryInfoHKey+categoryId);
        if(!(categoryInfo && categoryInfo.userId && userId==categoryInfo.userId)){
            ret.code=-1;
            ret.msg='不允许此操作.srv.articleCategory.85';
            return ret;
        }

        var rst=Number.parseInt(categoryInfo.num)+Number.parseInt(step);
        if(rst<0){
            rst=0;
        }

        await fastRst.con.hmset(ArticleCategory.articleCategoryInfoHKey+categoryId, {
            num: rst,
        });

        var coreRst=await this.db.init({
            type0: 'core',
            type1: 'write0',
        });
        if(coreRst.code<0){
            ret.code=-1;
            ret.msg='初始化core数据库失败.srv.articleCategory.99';
            return ret;
        }
        var qryStr='update article_category set num=? where id=? and user_id=?';
        var qryRst=await coreRst.con.query(qryStr, [rst, categoryId, userId]);
        ret.code=1;
        ret.data={
            num: rst,
        };
        return ret;
    }
    async incrShowNum({
        userId=-1,
        categoryId=-1,
        step=0,
    }={}){
        var ret={};
        ret.code=-1;
        userId=Number.parseInt(userId);
        if(userId<=0){
            ret.code=-1;
            ret.msg='userId错误.srv.articleCategory.125';
            return ret;
        }
        categoryId=Number.parseInt(categoryId);
        if(categoryId<=0){
            ret.code=-1;
            ret.msg='categoryId错误.srv.articleCategory.131';
            return ret;
        }
        step=Number.parseInt(step);
        if(0==step){
            ret.code=0;
            return ret;
        }

        var fastRst=await this.db.init({
            type0: 'fast',
            type1: 'write0',
        });
        if(fastRst.code<0){
            ret.code=-1;
            ret.msg='初始化fast数据库失败.srv.articleCategory.79';
            return ret;
        }
        var categoryInfo=await fastRst.con.hgetall(ArticleCategory.articleCategoryInfoHKey+categoryId);
        if(!(categoryInfo && categoryInfo.userId && userId==categoryInfo.userId)){
            ret.code=-1;
            ret.msg='不允许此操作.srv.articleCategory.85';
            return ret;
        }

        var rst=Number.parseInt(categoryInfo.showNum)+Number.parseInt(step);
        if(rst<0){
            rst=0;
        }

        await fastRst.con.hmset(ArticleCategory.articleCategoryInfoHKey+categoryId, {
            showNum: rst,
        });

        var coreRst=await this.db.init({
            type0: 'core',
            type1: 'write0',
        });
        if(coreRst.code<0){
            ret.code=-1;
            ret.msg='初始化core数据库失败.srv.articleCategory.99';
            return ret;
        }
        var qryStr='update article_category set show_num=? where id=? and user_id=?';
        var qryRst=await coreRst.con.query(qryStr, [rst, categoryId, userId]);
        ret.code=1;
        ret.data={
            showNum: rst,
        };
        return ret;
    }

    async delete({
        userId=-1,
        categoryId=-1,
    }={}){
        var ret={};
        ret.code=-1;
        userId=Number.parseInt(userId);
        if(userId<=0){
            ret.code=-1;
            ret.msg='userId错误.srv.articleCategory.57';
            return ret;
        }
        categoryId=Number.parseInt(categoryId);
        if(categoryId<=0){
            ret.code=-1;
            ret.msg='categoryId错误.srv.articleCategory.63';
            return ret;
        }

        var fastRst=await this.db.init({
            type0: 'fast',
            type1: 'write0',
        });
        if(fastRst.code<0){
            return fastRst;
        }
        var categoryInfo=await fastRst.con.hgetall(ArticleCategory.articleCategoryInfoHKey+categoryId);
        if(!(categoryInfo && categoryInfo.userId && userId==categoryInfo.userId)){
            ret.code=-1;
            ret.msg='无权限进行此操作.srv.articleCategory.77';
            return ret;
        }

        await fastRst.con.lrem(ArticleCategory.articleCategoryUserLKey+userId, 0, categoryId);

        var coreRst=await this.db.init({
            type0: 'core',
            type1: 'write0',
        });
        if(coreRst.code<0){
            ret.code=-1;
            ret.msg='初始化fast数据库失败.srv.articleCategory.72';
            return ret;
        }
        var qryStr='update article_category set valid=0 where id=? and user_id=?';
        var qryRst=await coreRst.con.query(qryStr, [categoryId, userId]);
        return qryRst;
    }

    async rebuildFast({
        userId=-1,
    }={}){
        userId=Number.parseInt(userId);
        var ret={};
        ret.code=-1;
        if(userId<=0){
            ret.code=-1;
            ret.msg='userId错误.srv.articleCategory.56';
            return ret;
        }

        var allRst=await this.all_core({
            userId: userId,
            tUserId: userId,
        });
        if(allRst.code<0){
            return allRst;
        }

        var fastRst=await this.db.init({
            type0: 'fast',
            type1: 'write0',
        });
        if(fastRst.code<0){
            ret.code=-1;
            ret.msg='初始化fast数据库失败.srv.articleCategory.74';
            return ret;
        }
        await fastRst.con.del(ArticleCategory.articleCategoryUserLKey+userId);
        for(let v of allRst.data.list){
            await fastRst.con.lpush(ArticleCategory.articleCategoryUserLKey+userId, v.id);
            await fastRst.con.hmset(ArticleCategory.articleCategoryInfoHKey+v.id, {
                userId: userId,
                num: v.num,
                showNum: v.showNum,
                text: v.category,
            });
        }
        ret.code=1;
        return ret;
    }

    async all_fast({
        userId=1,
        tUserId=-1,
    }){
        userId=Number.parseInt(userId);
        tUserId=Number.parseInt(tUserId);
        var ret={
            code: -1,
        };

        if(tUserId<=0){
            ret.code=-1; 
            ret.msg='tUserId错误.srv.articleCategory.57';
            return ret;
        }

        if(userId<=0){
            ret.code=-1; 
            ret.msg='userId错误.srv.articleCategory.63';
            return ret;
        }

        var fastRst=await this.db.init({
            type0: 'fast',
            type1: 'read0',
        });

        if(fastRst.code<0){
            return fastRst;
        }

        var categoryList=await fastRst.con.lrange(ArticleCategory.articleCategoryUserLKey+tUserId, 0, -1);
        ret.data={
            list:[],
        };
        for(let v of categoryList){
            var lpQryRst=await fastRst.con.hgetall(ArticleCategory.articleCategoryInfoHKey+v);
            lpQryRst.id=v;
            delete(lpQryRst.userId);
            ret.data.list.push(lpQryRst);
        }
        ret.code=1;
        return ret;
    }

    async all({
        userId=-1,
        tUserId=-1,
    }={}){
        var ret=await this.all_fast({
            userId: userId,
            tUserId: tUserId,
        });
        return ret;
    }

    async all_core({
        userId=-1,
        tUserId=-1,
    }={}){
        userId=Number.parseInt(userId);
        tUserId=Number.parseInt(tUserId);
        var ret={
            code: -1,
        };

        if(tUserId<=0){
            ret.code=-1; 
            ret.msg='tUserId错误.srv.articleCategory.57';
            return ret;
        }

        if(userId<=0){
            ret.code=-1; 
            ret.msg='userId错误.srv.articleCategory.63';
            return ret;
        }

        var coreRst=await this.db.init({
            type0: 'core',
            type1: 'read0',
        });
        if(coreRst.code<0){
            ret.code=-1;
            ret.msg='初始化core数据库失败.srv.articleCategory.64';
            return ret;
        }
        var qryStr=`select id, category, num, show_num from article_category where user_id=? and valid=1 order by id;`;
        var qryRst=await coreRst.con.query(qryStr, [tUserId]);
        for(let k in qryRst[0]){
            qryRst[0][k]['showNum']=qryRst[0][k]['show_num'];
            delete(qryRst[0][k]['show_num']);
        }
        ret.code=1;
        ret.data={
            list: qryRst[0],
        };
        return ret;
    }

    async create({
        userId=-1,
        category='',
    }){
        var ret={
            code: -1,
        };
        userId=Number.parseInt(userId);
        if(userId<=0){
            ret.code=-1;
            ret.msg='userId错误.srv.articleCategory.408';
            return ret;
        }

        var checkLiteral=this.checkLiteral({
            text: category,
        });
        if(checkLiteral.code<0){
            ret.code=-1;
            ret.msg='category不合法.srv.articleCategory.417';
            return checkLiteral;
            return ret;
        }
        category=checkLiteral.data.text;

        /*
        var checkExist=await this._exist({
            userId: userId,
            category: category,
        });
        if(checkExist.code<0){
            return checkExist;
        }
        */
        var allRst=await this.all_core({
            userId: userId,
            tUserId: userId,
        });
        if(allRst.code<=0){
            return allRst;
        }
        if(allRst.data.list.length>=ArticleCategory.maxNum){
            ret.code=-1;
            ret.msg='最多创建20个分类.srv.articleCategory.115';
            return;
        }

        for(let v of allRst.data.list){
            if(v.category==category){
                ret.code=-1;
                ret.msg='已经存在该分类.srv.articleCategory.122';
                return ret;
            }
        }

        var createRst=await this._create({
            userId: userId,
            category: category,
        });
        return createRst;
    }

    async _create({
        userId=-1,
        category='',
    }={}){
        userId=Number.parseInt(userId);
        var ret={
            code: -1,
        };
        if(userId<=0){
            ret.code=-1; 
            ret.msg='userId错误.srv.articleCategory.99';
            return ret;
        }
        if(''==category){
            ret.code=-1;
            ret.msg='category错误.srv.articleCategory.104';
            return ret;
        }

        var checkLiteral=this.checkLiteral({
            text: category,
        });
        if(checkLiteral.code<0){
            ret.code=-1;
            ret.msg='category不合法.srv.articleCategory.483';
            return ret;
        }
        category=checkLiteral.data.text;

        var coreRst=await this.db.init({
            type0: 'core',
            type1: 'write0',
        });
        if(coreRst.code<0){
            ret.code=-1;
            ret.msg='初始化core数据库失败.srv.articleCategory.114';
            return ret;
        }
        var qryStr=`insert into article_category(user_id, category) values(?, ?);`;
        var qryRst=await coreRst.con.query(qryStr, [userId, category]);
        if(qryRst.length>0 && qryRst[0].insertId>0){
            ret.code=1;
            ret.data={
                id: qryRst[0].insertId,
            };
        }

        var fastRst=await this.db.init({
            type0: 'fast',
            type1: 'write0',
        });
        if(fastRst.code<0){
            ret.code=-1;
            ret.msg='初始化fast数据库失败.srv.articleCategory.177';
            return ret;
        }
 
        await fastRst.con.lpush(ArticleCategory.articleCategoryUserLKey+userId, ret.data.id);
        await fastRst.con.hmset(ArticleCategory.articleCategoryInfoHKey+ret.data.id, {
            userId: userId,
            text: category,
            num: 0,
            showNum: 0,
        });
        return ret;
    }
}

ArticleCategory.maxNum=20;
/*
article:category:h:<userid>   id {text: '', num: 0}
*/
ArticleCategory.articleCategoryUserLKey='atc:ctgr:user:l:';
ArticleCategory.articleCategoryInfoHKey='atc:ctgr:info:h:';



module.exports=ArticleCategory;

var util=require('util');

var IoRedis=require('ioredis');
var mysql2pro=require('mysql2/promise');

var mongo=require('wncbb-mongo-promise');

//TODO: mongodb


class Db{
/*
config={
    fast: {
        write0: {
            host:, 
            port:,
            db:,
            password:,
            family:,
        }, ...
    },
    core: {
        write0: {
            host:,
            port:,
            user:,
            password:,
            database:,
        } 
    },
    huge: {
        test: {
            url: 'mongodb://test:test123@127.0.0.1:30002/test',
        }
    },
}
*/
  constructor(inConfig){
    this.config=inConfig;
    this.fast={};
    this.core={};
    this.huge={};
  }
  closeFast(){
    for(let key in this.fast){
      //may lose some data
      //this.disconnect();
      this.fast[key].quit();
      //end is deprecated
      //this.fast[key].end();
      delete(this.fast[key]);
      console.log('CLOSE FAST '+key);
    }
  }
  closeCore(){
    for(let key in this.core){
      this.core[key].end();
      delete(this.core[key]);
    }
  }
  async closeHuge(){
    for(let key in this.huge){
      await this.huge[key].close();
      delete(this.huge[key]);
    }
  }
  async close(){
    this.closeCore();
    this.closeFast();
    await this.closeHuge();
  }
  async makeFast(inArg){
    var ret={};
    ret.code=-1;
    var needConfig;

    if(inArg.type in this.config['fast']){
      needConfig=this.config['fast'][inArg.type];
      ret.code=1;
    }else{
      ret.code=-10001;
      ret.msg='type1 wrong';
    }

    if(1==ret.code){
      ret.con=new IoRedis(needConfig);
    }
    return ret;
  }


  async makeCore(inArg){
    var ret={};
    ret.code=-1;
    var needConfig;

    if(inArg.type in this.config['core']){
      needConfig=this.config['core'][inArg.type];
      ret.code=1;
    }else{
      ret.code=-2001;
      ret.msg='type1 wrong';
    }

    if(1==ret.code){
      ret.con=await mysql2pro.createConnection({
        host: needConfig.host,
        port: needConfig.port||3306,
        user: needConfig.user,
        password: needConfig.password,
        database: needConfig.database,
      });
    }
    return ret;
  }

  async makeHuge(inArg){
    var ret={};
    ret.code=-1;
    var needConfig;
    if(!(inArg.type in this.config['huge'])){
      ret.code=-1;
      ret.msg='makeHuge error.mid.db.127';
      return ret;
    }

    needConfig=this.config['huge'][inArg.type];
    var mongoClient=new mongo(needConfig.url);  
    var con=await mongoClient.connect();
    console.log('mid.db.131: '+(typeof con));
    if(typeof con == 'error'){
      ret.code=-1;
      ret.msg='makeHuge error.mid.db.133';
      return ret;
    }

    ret.code=1;
    ret.con=mongoClient;
    return ret;
    
  }
/*
inArg: {
    type0:,
    type1:,
}

*/
  async init(inArg){
    var ret={};
    ret.code=-1;
    switch(inArg.type0){
        case 'core':
            break;
        case 'fast':
            break;
        case 'huge':
            break;
        default:
            ret.code=-1;
            ret.msg=`unknown type0=${inArg.type0}`;
            return ret;
            break;
    }

    if(!this.config[inArg.type0][inArg.type1]){
        ret.code=-1;
        ret.msg=`unknown type1=${inArg.type1}`;
        return ret;
    }

    if(this[inArg.type0][inArg.type1]==undefined){
      switch(inArg.type0){
        case "core":
          var tmpRst=await this.makeCore({
            type: inArg.type1
          });
          if(1==tmpRst.code){
            ret.code=1;
            this[inArg.type0][inArg.type1]=tmpRst.con;
          }
          break;
        case "fast":
          var tmpRst=await this.makeFast({
            type: inArg.type1
          });
          if(1==tmpRst.code){
            ret.code=1;
            this[inArg.type0][inArg.type1]=tmpRst.con;
          }
          break;
        case 'huge':
          var tmpRst=await this.makeHuge({
            type: inArg.type1
          });
          if(tmpRst.code>0){
            ret.code=1;
            this[inArg.type0][inArg.type1]=tmpRst.con;
          }
        default:
          break;
      }
    }else{
      ret.code=1;
    }
    if(1==ret.code){
      ret.con=this[inArg.type0][inArg.type1];
    }

    return ret;
  }

}

module.exports=function(inArg){
  return async function(ctx, next){
    ctx.db=new Db(inArg);
    await next();
    await ctx.db.close();
  };

}



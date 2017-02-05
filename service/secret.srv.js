var rndm=require('rndm');

class Secret{
    constructor(db, {
        ttl=60,
        kLength=8,
        vLength=8,
    }={}){
        this.db=db;
        this.config={};
        this.config.ttl    =ttl;
        this.config.kLength=kLength;
        this.config.vLength=vLength;
    }

    async verify(check){
        var ret={};
        ret.errCode=-1;
        var fastRst=await this.db.init({
            type0: 'fast',
            type1: 'write0',
        }); 
        if(fastRst.errCode<0){
            ret=fastRst;
            return ret;
        }
        var k=check.substr(0, this.config.kLength);
        var v=check.substr(this.config.kLength, this.config.vLength);
        console.log('k:'+k+' v:'+v);
        var right=await fastRst.con.get(Secret.fastKey.secret(k));
        console.log('right: '+right);
        if(right==v){
            ret.valid=true;
        }else{
            ret.valid=false;
        }
        ret.errCode=1; 
        return ret; 
    }

    async create(){
        var ret={};
        ret.errCode=-1;
        var fastRst=await this.db.init({
            type0: 'fast',
            type1: 'write0',
        }); 
        if(fastRst.errCode<0){
            ret=fastRst;
            return ret;
        }
        var k=rndm(this.config.kLength);
        var v=rndm(this.config.vLength);

        var multi=fastRst.con.multi();
        multi.set(Secret.fastKey.secret(k), v)
            .expire(Secret.fastKey.secret(k), this.config.ttl);
        await multi.exec();
        ret.errCode=1;
        ret.secret=k+v;
        return ret;
    }
}

Secret.fastKey={
    secret:(uniq)=>{
        return 'secret:'+uniq;
    }
};





module.exports=Secret;

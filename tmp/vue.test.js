var vm=new Vue({
    el: '#123',
    data: {
        message: '123',
    },
    //调用不用加括号，直接用reversedMssage
    //会有缓存哟,依赖不变不重新计算
    computed: {
        reversedMessage: function(){
            return this.message.split('').reverse().join('');
        },
    },
    //调用加括号，reversedMssageFunc()
    //每次调用重新执行
    methods: {
        reversedMessageFunc: function(){
            return this.message.split('').reverse().join('');
        },
    },
    watch: {
        message: function(val){
        }
    },

});

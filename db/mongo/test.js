var mongoose=require('mongoose');
var Article=require('./article.js');

var firstArticle=new Article({
    title: 'first artile',
    text: 'This is first article\'s text',
});

firstArticle.show();

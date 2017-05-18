$(document).ready(function(){



  function editorOnHandler(cm, co) {
    $('.markdown-body').html(marked(cm.getValue()));
    $('.markdown-body pre code').each(function(i, block) {
      Prism.highlightElement(block);
    });
  }
  // marked
  var markedRender = new marked.Renderer();
  marked.setOptions({
    renderer: markedRender,
    gfm: true,
    tables: true,
    breaks: true,  // '>' 换行，回车换成 <br>
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false
  });

  // codemirror editor
  //var editor = CodeMirror.fromTextArea($('#editor').get(0), {
  window.editor = CodeMirror.fromTextArea($('#editor').get(0), {
    mode: 'markdown',
    lineNumbers: true,
    autoCloseBrackets: true,
    matchBrackets: true,
    showCursorWhenSelecting: true,
    lineWrapping: true,  // 长句子折行
    //theme: "material",
    //keyMap: 'sublime',
    extraKeys: {"Enter": "newlineAndIndentContinueMarkdownList"},
    width: '100%',
    height: '100%',
    autoMatchParens: true,
  });
  editor.on('change', editorOnHandler);
  
  if($('#articleId').val()!=''){
    var url='/article/'+$('#articleId').val();
    $.ajax({
        url: url,
        type: 'POST',
        data: {
            ac: 'findById',
            articleId: $('#articleId').val(),
        },
        success: function(rsp){
            console.log('Success:');
            console.log(rsp);
            editor.setValue(rsp.data.articleInfo.text);
        },
        error: function(err){
            console.log('Error:');
            console.log(err);
        },
    });
  }

  $('#saveArticle').on('click', function(e){
    e.preventDefault();
    var ac='create';
    var url='/article';
    console.log('val: '+$('#articleId').val());
    if(''!=$('#articleId').val() && undefined!=$('#articleId').val()){
      ac='update';
      url=url+'/'+$('#articleId').val();
    }
    console.log('url: '+url);
    console.log('ac: '+ac);
    console.log($('#articleId').val());

    $.ajax({
      url: url,
      type: 'POST',
      data: {
        ac: ac,
        id: $('#articleId').val(),
        text: editor.getValue(),
        title: $('#articleTitle').val(),
        category: $('#articleCategory').val(),
      },
      success: function(rsp){
        if(rsp.code>0){
          $('#articleId').val(rsp.data.articleId);
        }
        console.log('fromServer:SUCCESS: '+JSON.stringify(rsp));
      },
      error: function(err){
        console.log('fromServer:ERROR: '+err);
      },
     
      
    });
  });



});


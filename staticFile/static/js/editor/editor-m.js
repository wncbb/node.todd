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
  


  $('#saveArticle').on('click', function(e){
    e.preventDefault();
    $.ajax({
      url: '/article/save',
      type: 'POST',
      data: {
        id: $('#articleId').val(),
        text: editor.getValue(),
        title: $('#articleTitle').val(),
        category: $('#articleCategory').val(),
      },
      success: function(rsp){
        if(rsp.code>0){
          $('#articleId').val(rsp.data.id);
        }
        console.log('fromServer:SUCCESS: '+JSON.stringify(rsp));
      },
      error: function(err){
        console.log('fromServer:ERROR: '+err);
      },
     
      
    });
  });



});


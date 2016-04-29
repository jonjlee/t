function initUI() {
  // Initialize editors
  tinymce.init({
    selector: '.editor',
    plugins: ['lists table contextmenu paste'],
    toolbar: false, //'bold italic | bullist numlist outdent indent | link image',
    menubar: false,
    statusbar: false,
  });
  
  // Initialize js console
  $('#console').terminal(function (command, term) {
    if (command !== '') {
      try {
        var result = window.eval(command);
        if (result !== undefined) {
          term.echo(new String(result));
        }
      } catch (e) {
        term.error(new String(e));
      }
    } else {
      term.echo('');
    }
  }, {
      greetings: '',
      name: 'jsconsole',
      height: 100,
      prompt: '> '
  });
  
  // Initialize handlers
  $('#submit-note').click(submitNote);
}

function submitNote() {
  var text = tinymce.get('editor-in').getContent({format: 'text'}),
      html = tinymce.get('editor-in').getContent({format: 'html'}),
      unescaped = _.unescape(html),
      preprocessed = preprocess(text, unescaped),
      compiled = _.template(preprocessed, {
        variable: 'd'
      });
  $('#editor-out').html(compiled({}));
}

function preprocess(text, html, delimiters) {
  delimiters = delimiters || ['<%%', '%>'];
  var code = text.match(new RegExp(delimiters[0] + '((?:.|[\r\n])*?)' + delimiters[1]));
  if (code) {
    try {
      window.eval(code[1]);
    } catch (e) {
      console.log(e);
    }
  } 
  return html.replace(new RegExp(delimiters[0] + '.*?' + delimiters[1] + '\s*(:?<br />)?'), '');
}

jQuery(document).ready(function($) {
  initUI();
});

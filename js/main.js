var quillIn = null, 
    quillOut = null;

function initUI() {
  // Initialize quill.js editors
  quillIn = new Quill('#editor-in', {
    modules: { toolbar: '#editor-in-toolbar' },
    theme: 'snow'
  });
  quillOut = new Quill('#editor-out', {
    modules: { toolbar: '#editor-out-toolbar' },
    theme: 'snow'
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
  var quillInKeyboard = quillIn.getModule('keyboard');
  $('#submit-note').click(submitNote);
  quillInKeyboard.addHotkey({ key: 13, metaKey: true }, submitNote);
}

function submitNote() {
  var text = quillIn.getText(),
      html = quillIn.getHTML(),
      unescaped = _.unescape(html),
      preprocessed = preprocess(text, unescaped);
      compiled = _.template(preprocessed, {
        variable: 'd'
      }),
  
  quillOut.setHTML(compiled({}));
}

function preprocess(text, html, delimiters) {
  delimiters = delimiters || ['<%==', '%>'];
  var code = text.match(new RegExp(delimiters[0] + '((?:.|[\r\n])*?)' + delimiters[1]));
  if (code) {
    try {
      window.eval(code[1]);
    } catch (e) {
      console.log(e);
    }
  } 
  return html.replace(new RegExp(delimiters[0] + '.*?' + delimiters[1] + '\s*<\/div>'), '');
}

jQuery(document).ready(function($) {
  initUI();
});

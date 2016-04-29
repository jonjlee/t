function initUI() {
  // Initialize editors
  tinymce.init({
    selector: '.editor',
    plugins: ['lists table paste'],
    toolbar: false, //'bold italic | bullist numlist outdent indent | link image',
    menubar: false,
    statusbar: false,
    setup: function(editor) {
      editor.addShortcut('ctrl+13, meta+13', 'Process', submitNote);
    }
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

  // Keyboard shortcuts
  key('ctrl+enter, ⌘+enter', submitNote);
}

function submitNote() {
  var text = tinymce.get('editor-in').getContent({format: 'text'}),
      html = tinymce.get('editor-in').getContent({format: 'html'}),
      preprocessed = preprocess(text, html),
      compiled = _.template(preprocessed, {
        variable: 'd'
      });
  $('#editor-out').html(compiled({}));
}

function preprocess(text, html, delimiters) {
  delimiters = delimiters || ['<script>', '</script>'];
  
  var script = getScripts(text, delimiters),
      noscript = removeScripts(html, delimiters),
      unescaped = unescapeTemplateTags(noscript);

  return unescaped;
}

function getScripts(text, delimiters) {
  var newlines = /\r?\n/g,
      matcher = new RegExp(delimiters[0] + '([\\s\\S]*?)' + delimiters[1], 'g'),
      section = '',
      script = '';

  while (section = matcher.exec(text)) {
    script += section[1] + '; ';
  }

  return _.template('<% ' + script + ' %>');
}

function removeScripts(html, delimiters) {
  delimiters = _.map(delimiters, _.escape);
  var matcher = new RegExp(delimiters[0] + '([\\s\\S]*?)' + delimiters[1] + '(?:\\s*<br\\s*/>)?', 'g');
  return html.replace(matcher, '');
}

function unescapeTemplateTags(html) {
  var tags = ['<%', '<%=', '<%-', '%>'],
      escaped = _.map(tags, _.escape).join('|'),
      matcher = new RegExp(escaped, 'g');
  
  html = html.replace(matcher, function(match, offset) {
    return _.unescape(match);
  });
  
  return html;
}

jQuery(document).ready(function($) {
  initUI();
});

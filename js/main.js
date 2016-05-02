var terminal = null;

function initUI() {
  // Initialize editors
  tinymce.init({
    selector: '.editor',
    auto_focus: 'editor-in',
    plugins: ['lists table paste'],
    content_css: 'css/stylesheet.css',
    min_height: '100px',
    nowrap: false,
    toolbar: false, //'bold italic | bullist numlist outdent indent | link image',
    menubar: false,
    statusbar: false,
    setup: function(editor) {
      editor.addShortcut('ctrl+13, meta+13', 'Process', submitNote);
      editor.addShortcut('ctrl+1', 'Focus Note Text', focusEditor);
      editor.addShortcut('ctrl+2', 'Focus Processed Text', focusProcessed);
      editor.addShortcut('ctrl+3', 'Focus Calculator', focusConsole);
    }
  });
  
  // Initialize js console
  terminal = $('#console').terminal(function (command, term) {
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
      height: 200,
      prompt: '> ',
      enabled: false,
      keydown: function(e) {
        if (e.ctrlKey && e.which == 49) {
          focusEditor();
          return false;
        } else if (e.ctrlKey && e.which == 50) {
          focusProcessed();
          return false;
        } else if (e.ctrlKey && e.which == 13) {
          submitNote();
          return false;
        }
      }
  });
  
  // Initialize handlers
  $('#submit-note').click(submitNote);

  // Keyboard shortcuts
  key('ctrl+enter, ⌘+enter', submitNote);
  key('ctrl+1', focusEditor);
  key('ctrl+2', focusProcessed);
  key('ctrl+3', focusConsole);
}

function focusEditor() {
  tinymce.get('editor-in').focus();
}

function focusProcessed() {
  tinymce.get('editor-out').focus();
}

function focusConsole() {
  terminal.focus();
}

function submitNote() {
  var text = tinymce.get('editor-in').getContent({format: 'text'}),
      html = tinymce.get('editor-in').getContent({format: 'raw'}),
      preprocessed = preprocess(text, html);
  
  var compiled = null;
  try {  
    compiled = _.template(preprocessed);
  } catch (e) {
    compiled = function() { return 'Template compile error: ' + e; };
    console.error(e);
  }
  
  var processed = '';
  try {
    processed = compiled({});
  } catch (e) {
    processed = 'Template run error: ' + e;
    console.error(e);
  }

  tinymce.get('editor-out').setContent(processed);
  //$('#editor-out').html(compiled({}));
}

function preprocess(text, html, delimiters) {
  delimiters = delimiters || ['<script>', '</script>'];
  
  // Get html without <script> sections
  var noscript = removeScripts(html, delimiters),
      unescaped = unescapeTemplateTags(noscript),
      data = {text: unescaped};
      
  // Convert <script> sections into a function then execute
  // with the html in the variable text 
  var preprocessor = getScripts(text, delimiters);
  
  var scriptFn = null;
  try {
    preprocessor(data);
  } catch (e) {
    data.text = '<p>SCRIPT RUN ERROR: ' + e + '</p><p></p>' + data.text;
    console.error(e);
  }
  
  return data.text;
}

function getScripts(text, delimiters) {
  var newlines = /\r?\n/g,
      multilinestr = /"""([\s\S]*?)"""/g,
      matcher = new RegExp(delimiters[0] + '([\\s\\S]*?)' + delimiters[1], 'g'),
      section = '',
      script = '';

  // Extract and combine <script> sections
  while (section = matcher.exec(text)) {
    script += section[1] + '; ';
  }

  // Combine multiline strings
  script = script.replace(multilinestr, function(match, str, offset) {
    return '"' + str.replace(newlines, '\\n') + '"';
  });

  var scriptFn = null;
  try {
    scriptFn = _.template('<% ' + script + ' %>');
  } catch (e) {
    scriptFn = function(data) { data.text = '<p>SCRIPT COMPILE ERROR: ' + e + '</p><p></p>' + data.text };
    console.error(e);
  }
  
  return scriptFn;
}

function removeScripts(html, delimiters) {
  delimiters = _.map(delimiters, _.escape);
  var matcher = new RegExp('(?:<p>)?' + delimiters[0] + '([\\s\\S]*?)' + delimiters[1] + '(?:</p>)?(?:\\s*<br\\s*/>)?', 'g');
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

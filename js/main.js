jQuery(document).ready(function($) {
    $('#console').terminal(function(command, term) {
        if (command !== '') {
            try {
                var result = window.eval(command);
                if (result !== undefined) {
                    term.echo(new String(result));
                }
            } catch(e) {
                term.error(new String(e));
            }
        } else {
          term.echo('');
        }
    }, {
        greetings: '',
        name: 'jsconsole',
        height: 250,
        prompt: '> '});
});

package CodeMirrorComplete;

use strict;
use warnings;
use MT::Util;

sub template_param_edit_template {
    my ( $cb, $app, $param, $tmpl ) = @_;

    my $plugin      = $app->component('CodeMirrorComplete');
    my $static_path = $app->static_path();
    my $blocks      = do {
        my $blocks = $app->registry( 'tags', 'block' );
        MT::Util::to_json(
            {   map { ( my $name = lc($_) ) =~ s/\?$//; $name => 1 }
                    keys(%$blocks)
            }
        );
    };
    my $modifiers = do {
        my $mods = $app->registry( 'tags', 'modifier' );
        MT::Util::to_json( { map { $_ => [] } keys(%$mods) } );
    };
    my $keybinds = do {
        MT::Util::to_json(
            [ split( ',', $plugin->get_config_value('keybind') ) ] );
    };

    $param->{html_body_footer} ||= '';
    $param->{html_body_footer} .= <<__HTML__;
<link rel="stylesheet" href="${static_path}codemirror/lib/util/simple-hint.css">
<style type="text/css">
.CodeMirror-completions select {
    height: auto;
}
</style>
<script type="text/javascript" src="${static_path}codemirror/lib/util/simple-hint.js"></script>
<script type="text/javascript" src="${static_path}plugins/CodeMirrorComplete/js/getHints.js"></script>
<script type="text/javascript" src="${static_path}plugins/CodeMirrorComplete/js/attributes.js"></script>
<script type="text/javascript">
(function() {

CodeMirrorComplete.modifiers[''] = jQuery.extend(
    $modifiers, CodeMirrorComplete.modifiers['']
);
CodeMirrorComplete.blocks = $blocks;

var extraKeys = editor.getOption('extraKeys') || {};
jQuery.each($keybinds, function() {
    extraKeys[this+''] = CodeMirrorComplete.complete;
});
editor.setOption('extraKeys', extraKeys);

})();
</script>
__HTML__
}

1;

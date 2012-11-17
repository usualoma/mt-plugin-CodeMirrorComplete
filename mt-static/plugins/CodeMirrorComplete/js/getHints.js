var CodeMirrorComplete = function() {};
(function($) {

var tags = [];
$.each(tag_docs, function(k, v) {
    tags = tags.concat($.map($.grep(v.split(','), function(t) {
        return t;
    }), function(str) {
        return str.replace(/\?$/, '');
    }));
});
tags.sort();
var tags_with_lowercase = $.map(tags, function(t) {
    return [[t.toLowerCase(), t]];
});

function select(list, part) {
    if (part == '' || part == undefined) {
        return list;
    }

    return $.grep(list, function(t) {
        return t.indexOf(part) == 0;
    });
}

function select_by_head(list, part) {
    if (part == '' || part == undefined) {
        return $.map(list, function(t) {
            return t[1];
        });
    }

    return $.map($.grep(list, function(t) {
        return t[0].indexOf(part) == 0;
    }), function(t) {
        return t[1];
    });
}

function completeTag(part) {
    if (! part) {
        return tags;
    }

    return select_by_head(tags_with_lowercase, part.toLowerCase());
}

function completeName(part) {
    var value = editor.getValue();
    var ms = value.match(/<\s*mt:?[^>]*(name|setvar)=("|')(.*?)\2/g) || [];
    var defaultNames = [
        '__key__', '__value__',
        '__first__', '__last__',
        '__odd__', '__even__', '__counter__',
        '__cond_value__', '__cond_name__'
    ];
    var namesFromSource = $.map(ms, function(m) {
        var n = m.match(/.*(name|setvar)=("|')(.*?)\2/)[3];
        if ($.inArray(n, defaultNames) == -1) {
            return n;
        }
        else {
            return [];
        }
    });
    namesFromSource.sort();
    namesFromSource = $.unique(namesFromSource);

    return select(namesFromSource.concat(defaultNames), part.toLowerCase());
}

var candidates_for_tag = {};
function completeModifier(tag, part) {
    tag = tag.toLowerCase();

    if (! candidates_for_tag[tag]) {
        var candidates = [];
        $.each(['', tag], function() {
            var modifiers = CodeMirrorComplete.modifiers[this + ''];
            if (! modifiers) {
                return;
            }
            $.each(modifiers, function(k, v) {
                candidates.add(k);
            });
        });
        candidates.sort();

        candidates_for_tag[tag] = candidates;
    }
    return select(candidates_for_tag[tag], part.toLowerCase());
}

var candidates_for_tag_modifire = {};
function completeModifierValue(tag, modifire, part) {
    tag = tag.toLowerCase();
    modifire = modifire.toLowerCase();

    if (
        ! candidates_for_tag_modifire[tag] ||
        ! candidates_for_tag_modifire[tag][modifire]
    ) {
        if (! candidates_for_tag_modifire[tag]) {
            candidates_for_tag_modifire[tag] = {};
        }
        candidates_for_tag_modifire[tag][modifire] = [];

        var values = [];
        $.each(['', tag], function() {
            var modifiers = CodeMirrorComplete.modifiers[this + ''];
            if (! modifiers) {
                return;
            }
            values = values.concat(modifiers[modifire] || []);
        });
        values.sort();

        candidates_for_tag_modifire[tag][modifire] = values;
    }

    var candidates = candidates_for_tag_modifire[tag][modifire];
    return select(candidates, part.toLowerCase());
}

function complete(editor) {
    CodeMirror.simpleHint(editor, function(editor) {
        var cur = editor.getCursor();

        function tryToComplete(func, part) {
            if (part == undefined) {
                part = '';
            }

            var list = func(part);
            if (! list || ! list.length) {
                return null;
            }

            return {
                from: { line: cur.line, ch: cur.ch - part.length },
                to: { line: cur.line, ch: cur.ch },
                list: list
            };
        }


        var str = editor.getRange(
            { line: cur.line, ch: 0 },
            { line: cur.line, ch: cur.ch }
        );

        var fetchedLine = cur.line;
        var m;
        for (var i = 1; i <= 10; i++) {
            m = str.match(/<\s*(\/?)\$?(mt:?([\w:]*))(\s*[^>]*)$/i);
            if (m || fetchedLine == 0) {
                break;
            }
            str = editor.getLine(--fetchedLine) + '\n' + str;
        }

        if (! m) {
            return null;
        }

        if (! m[4]) {
            if (m[1]) {
                function completeCloseTag(part) {
                    if (part == undefined) {
                        part = '';
                    }

                    while (true) {
                        var ms = str.match(/<\s*(\/?)mt:?([\w:]*)\s*[^>]*>/gi);
                        var notClosedTag = null;
                        var stack = [];
                        if (ms) {
                            $.each(ms.reverse(), function() {
                                var tag = this + '';
                                var m = tag.match(/<\s*(\/?)(mt:?([\w:]*))/i);
                                if (m[1]) {
                                    stack.unshift(m[3].toLowerCase());
                                }
                                else if (m[3] && CodeMirrorComplete.blocks[m[3].toLowerCase()]) {
                                    if (stack[0] == m[3].toLowerCase()) {
                                        stack.shift();
                                    }
                                    else {
                                        notClosedTag = m[2];
                                        return false;
                                    }
                                }
                            });
                        }

                        if (notClosedTag) {
                            return [notClosedTag];
                        }

                        if (fetchedLine == 0) {
                            break;
                        }
                        str = editor.getLine(--fetchedLine) + '\n' + str;
                    }

                    return null;
                }
                return tryToComplete(completeCloseTag, m[2]);
            }
            else {
                return tryToComplete(completeTag, m[3]);
            }
        }

        var tag = m[3];
        m = m[4].match(/^(\s*\w+=("|').*?\2\s*)*\s*(\w+)?(=("|')(.*))?$/);

        if (! m || ! m[3] || ! m[4]) {
            return tryToComplete(function(part) {
                return completeModifier(tag, part);
            }, m ? m[3] : '');
        }
        else if (
            m[3] == 'name' ||
            m[3] == 'setvar' ||
            (m[6] && m[6].substring(0, 1) == '$')
        ) {
            return tryToComplete(
                completeName,
                (m[3] == 'name' || m[3] == 'setvar') ? m[6] : m[6].substring(1)
            );
        }
        else if (m[3] == 'tag') {
            return tryToComplete(completeTag, m[6]);
        }
        else {
            return tryToComplete(function(part) {
                return completeModifierValue(tag, m[3], part);
            }, m[6]);
        }

        return null;
    });
}
CodeMirrorComplete.complete = complete;

})(jQuery);

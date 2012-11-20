# CodeMirror Complete

This plugin enables the Movable Type to complete MT-tag and modifier at the template editing page.


## Features

* Complete various object about MT-tag
  * Tag name (including plugin's tag and customfield's tag)
  * Attribute (a.k.a Modifier) name
  * Attribute value
  * Variable name
* Complete matched close tag
* Support any format
  * &lt;mt:Tag&gt;
  * &lt;MTTag&gt;
  * &lt;$MTTag$&gt;


### Screenshot

![Screenshot](https://github.com/usualoma/mt-plugin-CodeMirrorComplete/raw/master/artwork/screenshot.png)

### System Config

![System Config](https://github.com/usualoma/mt-plugin-CodeMirrorComplete/raw/master/artwork/system_config.png)

### Demo Movie

http://screencast.com/t/t3O7GoN2T



## Requirements

* Movable Type 5.13 or any later version

## Installation

1. Unpack the `CodeMirrorComplete` archive.
2. Upload the contents to the MT `plugins` directory.

Should look like this when installed:

    $MT_HOME/
        plugins/
            CodeMirrorComplete/
        mt-static/
            plugins/
                CodeMirrorComplete/

## Keybind

By default, a MT-tag is completed by typing "Control + Space" or "Control + p".
This keybind can be changed at the "System Plugin Settings".

## LICENSE

Copyright (c) 2012 ToI Inc.

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

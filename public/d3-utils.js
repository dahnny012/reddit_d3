// Various utils from other libraries

// From d3-jetpack
d3.wordwrap = function(line, maxCharactersPerLine) {
        if(line === undefined)
            return ['MORE']
        var w = line.split(' '),
            lines = [],
            words = [],
            maxChars = maxCharactersPerLine || 40,
            l = 0;
        w.forEach(function(d) {
            if (l+d.length > maxChars) {
                lines.push(words.join(' '));
                words.length = 0;
                l = 0;
            }
            l += d.length;
            words.push(d);
        });
        if (words.length) {
            lines.push(words.join(' '));
        }
        return lines;
    };
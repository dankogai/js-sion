[![build status](https://secure.travis-ci.org/dankogai/js-sion.png)](http://travis-ci.org/dankogai/js-sion)

# js-sion

[SION] deserializer/serializer for ECMAScript

[SION]: https://dankogai.github.io/SION/

## Synopsis

```javascript
import SION from './sion.js';
//...
let obj = SION.parse('["formats":["JSON","SION"]]');
let str = SION.stringify({formats: ["JSON", "SION"]});
//...
```

## Usage

[sion.js] has no dependency so you can simply put it anywhere handy.  It is a [ES6 module] so you need a faily modern environments.

[sion.js]: ./sion.js
[ES6 module]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import

### on browsers

In your JS script:

```javascript
import SION from './sion.js'; // or wherever you put it
```

Or in your HTML:

```html
<script type="module">
    import SION from './sion.js';
</script>
```

### on node.js

There are verious -- too many -- ways to use modules in node.js.  Among which I found [esm] the easiest to use.

[esm]: https://github.com/standard-things/esm


```sh
$ npm install esm js-sion
$ node -r esm
% node -r esm 
> let SION = require('./sion').default;
undefined
> SION.parse('["formats":["JSON","SION"]]');
{ formats: [ 'JSON', 'SION' ] }
>  SION.stringify({formats: ["JSON", "SION"]});
'["formats":["JSON","SION"]]'
```


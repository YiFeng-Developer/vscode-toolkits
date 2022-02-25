const globby = require('globby');
const path = require('path');

console.time('globby');
const paths = globby.sync('/Users/zyf/terminus/gaia-mall/mall-sea/client/design/design.*');

console.log('paths >>> ', paths);

console.timeEnd('globby');

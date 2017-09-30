/**
 * Created by zhijie.huang on 2017/9/29.
 */

if (typeof __DEV__ === 'undefined') {
    // In browser
    if (typeof window !== 'undefined') {
        window.__DEV__ = true;
    }
    // In node
    else if (typeof global !== 'undefined') {
        global.__DEV__ = true;
    }
}

require('./flowLines/LinesSeries');
require('./flowLines/LinesView');

var echarts = require('echarts');
echarts.registerLayout(
    require('./flowLines/linesLayout')
);
echarts.registerVisual(
    require('./flowLines/linesVisual')
);

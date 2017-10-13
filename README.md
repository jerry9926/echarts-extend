#扩展echarts图表类型

##背景
之前有这样一个需求，显示一个世界地图，在地图上面的某些城市的位置上面显示出来当地的某项数据值。数值的显示的形式是，从下往上飘。（有点像冒烟一样）。静态图效果如图。
![Alt text](./1506741294376.png)

##分析
基于之前的技术积累，我使用过echarts（一个[图表开源库](http://echarts.baidu.com)）。这里考虑使用echarts实现。首先看看官方的文档，里面没有这样的demo。但是有类似表现形式的图。在地图上，显示飞机飞行的航线的图。[查看demo](http://www.echartsjs.com/gallery/editor.html?c=geo-lines)
![Alt text](./1506741621414.png)

首先分析一下这个图。可以分为两部分来看，一是地图，二是地图上面飞机的航线图。
关于地图的绘制，问题不大，使用`geo`属性进行设置即可，文档中已经有详细的介绍，这里就不多说了。
```
geo: {
    map: 'china',
    label: {
        emphasis: {
            show: false
        }
    },
    roam: true,
    itemStyle: {
        normal: {
            areaColor: '#323c48',
            borderColor: '#404a59'
        },
        emphasis: {
            areaColor: '#2a333d'
        }
    }
},
```
然后看看航线的这部分。这部分是设置`series`属性，增加`type`为`lines`的图表类型。简单说说`series`属性。在echarts里面，这个属性是十分重要的核心属性。`series`属性值为数组，数组中的元素，每个就是表示一个图表类型和具体的显示特性。其中主要的属性有`type`和`data`。`type`就是表示使用哪种图表类型，`data`是表示这个图表的数据。其他还有很多属性值，就不一一介绍了。
对照这个demo和需求的不同点，如果可以把飞机换成需要显示的数字，然后航线隐藏掉，这个基本符合我的需求了。

至此，基本上确定思路就是**对`type`为`lines`的这类图表进行扩展**，来实现需求的效果。

##开始动手

###新增一个图表类型
首先把`lines`类型的相关文件从echarts包里面拷贝一份到项目中。
进入echarts包目录，打开`index.js`，看到里面很整齐的列出了所有的模块。我们的目标是`lines`模块。
```
require('./lib/chart/lines');
```
继续深入，打开`./lib/chart/lines`。
```
    require('./lines/LinesSeries');
    require('./lines/LinesView');

    var echarts = require('../echarts');
    echarts.registerLayout(
        require('./lines/linesLayout')
    );
    echarts.registerVisual(
        require('./lines/linesVisual')
    );
```
可以看到一个图表类型里面包含了四块内容，`Series`、`View`、`Layout`、`Visual`。粗略来看，
- `Series`是定义整个图表类型。
- `View`是这个图表视图方面的定义。
- `Layout`是具体视图布局的定义。
- `Visual`是视图视觉效果的定义。

继续顺藤摸瓜，把定义一个图表类型的文件都拷贝了一份，然后我把这份`lines`类型重新命名为`flowLines`。涉及到的文件如下：
```
├─ flowLines
├─ flowLines.js
├─ flowLines/linesLayout.js
├─ flowLines/LinesSeries.js
├─ flowLines/LinesView.js
├─ flowLines/linesVisual.js
├─ flowLinesHelper
├─ flowLinesHelper/EffectLine.js
├─ flowLinesHelper/EffectPolyline.js
├─ flowLinesHelper/EffectSymbol.js
├─ flowLinesHelper/LargeLineDraw.js
├─ flowLinesHelper/Line.js
├─ flowLinesHelper/LineDraw.js
└─ flowLinesHelper/Polyline.js
```
其中，既然重新命名为`flowLines`，等于多了一个新的`type`类型。在相关的位置要把原来写着`lines`的地方替换为`flowLines`。
在文件`linesSeries.js`中
```
var LinesSeries = SeriesModel.extend({
    type: 'series.flowLines',
    dependencies: ['grid', 'polar'],
    ...
})
```
在文件`linesLayout.js`中
```
ecModel.eachSeriesByType('flowLines', function (seriesModel) {
	...
}
```
在文件`linesView.js`中
```
require('echarts').extendChartView({
        type: 'flowLines',
        init: function () {},
        ...
})
```
在文件`linesVisual.js`中
```
ecModel.eachSeriesByType('flowLines', function (seriesModel) {
	...
}
```
现在已经新增了一个图表类型，名字为`flowLines`。当然现在已经可以使用这个类型了，只是现在`flowLines`的定义和显示效果是和`lines`一模一样的。
接下来要要对`flowLines`进行功能的扩展。

>在顺藤摸瓜拷贝文件的时候，哪些文件要拷贝，哪些文件不要拷贝呢？或者说这个拷贝的“深度”怎么确定呢？
>其实*echarts*的代码层次写得很清晰，`chart`相关的代码就是一个层，里面引用到的工具类的或者底层画图类的代码并不是我们关心的，这些就不需要拷贝出来。如果不确定是否的要拷贝的话，先不拷贝，在后续的扩展过程发现需要修改的文件再拷贝出来就可以了。

###扩展flowLines
现在可以正式扩展`flewLines`的功能了。上面分析的时候提到，现在要做的就是，一是把demo的小飞机换成数字，二是把飞行的航线去掉。
先看飞行航线去掉。这点是很容易的，在`lines`里面的配置项，有一个`width`属性，只要设置为0。这线条就没有宽度，也就不会显示了。
那么怎么把小飞机换成数字呢？在原来的配置项里面，小飞机的显示是`symbol`属性控制的。
####增加文字symbol
那么我找到生成这个`symbol`的代码，在`EffectLines.js`里面的方法`_updateEffectSymbol`。要增加一种`symbol`的类型，需要一个标识判断一下，我定义这种`symbolType`为`flowLines.text`。我先把这个判断写上，然后继续看里面的实现。
```
// 增加 文字symbol
if (symbolType === 'flowLines.text') {
	// 实现
} else {
    symbol = symbolUtil.createSymbol(
        symbolType, -0.5, -0.5, 1, 1, color
    );
}
```
生成`symbol`的方法是`symbolUtil.createSymbol`里面，涉及到`symbol.js`文件，之前没有复制出来，现在复制一份。在里面增加生成文字的逻辑代码。
```
// 增加一个参数 style
createSymbol: function (symbolType, x, y, w, h, color, style) {
// ...
// 增加text处理
if (symbolType.indexOf('text') !== -1) {
    symbolPath = new graphic.Text({
        style: style || {}
    });
} else if (symbolType.indexOf('image://') === 0) {
    // ...
}
...
```
继续把上面`_updateEffectSymbol`方法里没有实现的代码补上。这里主要是要把`style`属性给创建出来。主要有
- `text` 显示的文字
- `textFill` 文字的颜色
- `textFont` 字体
- `textAlign` 对齐方式

相关的属性在echarts文档中[graphic.elements-text](http://echarts.baidu.com/option.html#graphic.elements-text)部分有介绍。
```
// 增加 文字symbol
if (symbolType === 'flowLines.text') {
	// 实现
	size = [1, 1];

    var labelModel = effectModel.getModel('label');
    var textStyleModel = labelModel.getModel('textStyle');
    var textFont = textStyleModel.getFont();
    var formatter = labelModel.get('formatter');
    var seriesModel = lineData.hostModel;
    var text = formatter(seriesModel.getDataParams(idx));

    var style = {
        text: text,
        x: 0,
        y: 0,
        textFill: textStyleModel.getTextColor(),
        textFont : textFont,
        textAlign: 'middle'
    };
    symbol = symbolUtil.createSymbol(symbolType, undefined, undefined, undefined, undefined, undefined, style);
}
```

这时按照我们扩展的类型类来设置`series`已经有效果了。
```
const series = [
    {
        name: "FlowLines Demo",
        type: "flowLines",
        zlevel: 1,
        effect: {
            show: true,
            period: 6,
            trailLength: 0,
            color: "#fff",
            symbol: 'flowLines.text',
            label: {
                show: true,
                textStyle: {
                    color: '#fff',
                    fontSize: 16,
                    textPosition: 'indexTop'
                },
                formatter: formatLabel
            }
        },
        lineStyle: {
            normal: {
                color: "#fff",
                width: 1,  // 设置0隐藏线条
                curveness: 0
            }
        },
        data: getData(points)
        // data格式 [{coords: [p1, p2], value: val}]
    }
];
```
这时的效果。可以说这个时候已经完成的大部分工作了，接下来要实现两个效果，一个是冒泡的出现，一个是淡淡的消失（淡出）。
![Alt text](./1507616495260.png)

####冒泡效果
所谓冒泡效果，看起来就是显示的数字是一个一个从上至下开始显示出来，好像在起点位置的下方数字被盖住了那样，数字移动的位置超过起点才显示出来。比如1234，先显示1随着数字往上移动，渐渐露出2，之后是3、4。
明白了这个效果的本质后，我们要做的就是通过计算文字的位置，而改变需要显示的内容。以1234为例。用移动的位置减去起点的位置，这段距离是文字可以显示的高度。而文字显示完整需要的高度是，**行高乘以行数**。把可显示的高度除以行高，就得到了可以显示的行数。如果只能显示一行，这里就等于显示的文字就是1，能显示两行，就显示文字12，如此类推。
![Alt text](./1507623160703.png)
在`EffectLine.js`里增加代码
```
/**
 * 截断文字
 * @param symbol
 * @param text
 * @param style
 * @returns {string}
 * @private
 */
effectLineProto._subStringText = function (symbol, text, style) {
	// 这个rect是文字的绘制的矩形范围
	// 方法参考zrender/lib/graphic/Text.js里getBoundingTect方法
    var rect = textContain.getBoundingRect(
        text,
        style.font,
        style.textAlign,
        style.textVerticalAlign,
        style.textPadding,
        style.rich
    );
    var textNew = text.split('\n');
    var lines = Math.round(Math.abs(symbol.position[1] - symbol.__p1[1]) / rect.lineHeight);

    if (lines < textNew.length) {
        textNew.length = lines;
    }

    return textNew.join('\n');
};
```
这里得到了需要显示的文字`text`，要把修改的内容更新到`symbol`中。这个变化的过程就是动画的过程，动画的过程在`_updateEffectAnimation`方法中，需要把代码写在动画回调里面。
```
effectLineProto._updateEffectAnimation = function (lineData, effectModel, idx) {
	// ...
	var animator = symbol.animate('', loop)
	    .when(period, {
	        __t: 1
	    })
	    .delay(delay)
	    .during(function (shape, t) {
	        self.updateSymbolPosition(symbol);
	        // 增加文字的处理
        	var text = this._subStringText(symbol, text, style);
			var style = {
				text: text
			}

			// 更新symbol
			symbol.attr('style', style);
			symbol.ignore = false;
	    });
	// ...
}
```

####淡出效果
淡出效果就比较简单了，主要是设置透明度`opacity`。

####增加配置项
为冒泡效果和淡出效果增加两个配置项`bubbleIn`和`fadeOut`。

配置
```
{
   name: "FlowLines Demo",
    type: "flowLines",
    zlevel: 1,
    effect: {
        show: true,
        period: 6,
        trailLength: 0,
        color: "#fff",
        symbol: 'flowLines.text',
        fadeOut: true,
        bubbleIn: true,
        label: {
            show: true,
            textStyle: {
                color: '#fff',
                fontSize: 14,
                textPosition: 'indexTop'
            },
            formatter: formatLabel
        }
    },
    lineStyle: {
        normal: {
            color: "#fff",
            width: 0,
            curveness: 0
        }
    },
    data: getData(points)
    // data格式 [{coords: [p1, p2], value: val}]
}
```

`EffectLine.js`里的完整修改。
新增方法`updateSymbolText`和`_subStringText `。
```
/**
 * 更新symbol文字
 */
effectLineProto.updateSymbolText = function (symbol, text, t, fadeOut, bubbleIn) {
    // var style = symbol.style;
    var style = null;

    if (bubbleIn) {
        if (style === null) style = {};
        var text = this._subStringText(symbol, text, style);
        style.text = text;
    }

    if (fadeOut) {
        if (style === null) style = {};
        style.opacity = 1 - Math.pow(t, 3);
    }

    if (style !== null) {
        symbol.attr('style', style);
        symbol.ignore = false;
    }
};

/**
 * 截断文字
 * @param symbol
 * @param text
 * @param style
 * @returns {string}
 * @private
 */
effectLineProto._subStringText = function (symbol, text, style) {
    var rect = textContain.getBoundingRect(
        text,
        style.font,
        style.textAlign,
        style.textVerticalAlign,
        style.textPadding,
        style.rich
    );
    var textNew = text.split('\n');
    var lines = Math.round(Math.abs(symbol.position[1] - symbol.__p1[1]) / rect.lineHeight);

    if (lines < textNew.length) {
        textNew.length = lines;
    }

    return textNew.join('\n');
};
```
修改方法`_updateEffectSymbol`。
```
effectLineProto._updateEffectSymbol = function (lineData, idx) {
    // ...

    if (this._symbolType !== symbolType) {
        // Remove previous
        this.remove(symbol);

        // 增加 文字symbol
        if (symbolType === 'flowLines.text') {

            size = [1, 1];

            var labelModel = effectModel.getModel('label');
            var textStyleModel = labelModel.getModel('textStyle');
            var textFont = textStyleModel.getFont();
            var formatter = labelModel.get('formatter');
            var seriesModel = lineData.hostModel;
            var text = formatter(seriesModel.getDataParams(idx));

            var style = {
                text: text,
                x: 0,
                y: 0,
                textFill: textStyleModel.getTextColor(),
                textFont : textFont,
                textAlign: 'middle'
            };
            symbol = symbolUtil.createSymbol(symbolType, undefined, undefined, undefined, undefined, undefined, style);
        } else {
            symbol = symbolUtil.createSymbol(
                symbolType, -0.5, -0.5, 1, 1, color
            );
        }

        // ...
    }

    // ...
};
```

修改方法`_updateEffectAnimation`。
```
effectLineProto._updateEffectAnimation = function (lineData, effectModel, idx) {

    var symbol = this.childAt(1);
    if (!symbol) {
        return;
    }

    var self = this;

    // ...

    var text = symbol.style.text || '';
    var fadeOut = effectModel.get('fadeOut');
    var bubbleIn = effectModel.get('bubbleIn');

    // ...

    if (period !== this._period || loop !== this._loop) {

        // ...
        var animator = symbol.animate('', loop)
            .when(period, {
                __t: 1
            })
            .delay(delay)
            .during(function (shape, t) {
                self.updateSymbolPosition(symbol);
                // 更新symbol文字
                self.updateSymbolText(symbol, text, t, fadeOut, bubbleIn);
            });
        if (!loop) {
            animator.done(function () {
                self.remove(symbol);
            });
        }
        animator.start();
    }

    this._period = period;
    this._loop = loop;
};
```
###优化
到此为止，需要实现的效果已经出来了。后续为了更好的显示效果可以继续优化一下，比如使用多套的配置方案，有的速度快有的慢（使用`period`），有的字体大有的小（使用`fontSize`）。使得每个数字线条的效果更丰富，更立体。
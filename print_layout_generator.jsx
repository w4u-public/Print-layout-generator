#target 'Illustrator';

// Print Layout Generator 1.0b
// Github: https://github.com/w4u-public/Print-layout-generator
// Lisence: MIT

(function() {

        //================
        // Default Settings
        // セッティングメニューの初期設定
        //================

        // Settings
        var $outputPath = '~/Desktop'; // 初期保存場所
        var $dobu = 3; // 通常のドブの幅 (mm)
        var $trimMark = true; // トンボの有無
        var $trimMarkJPN = true; //日本式トンボ
        var $CompatibleVer = 17; // 互換バージョン (指定しない場合は 0)
        var $colorModeCMYK = true; // カラーモード (false は RGB)
        var $visualRectColor = 'red'; // 見え寸線の色 (red | green | blue)
        var $closeDoc = false; // 生成後に保存じて閉じる
        var $multiArtboards = true; //

        // Options
        var $layerLock = false; // 非編集レイヤーのロック
        var $displaySize = true; // 寸法を図に明記
        var $frameView = false; // 見え寸領域の外をフレームで覆う
        var $insertTag = true; // タグの挿入
        var $numbering = false; // ファイル名の先頭に番号を付ける

        // Footer stamp
        var $dateStamp = false; // フッターに制作日を記述
        var $ratioStamp = false; // フッターにレイアウトの比率を記述
        var $squareStamp = false; //フッターに平米数を記述
        var $freeTextStamp = ''//フッターに任意の文字挿入

        // その他の設定
        var $HxW = true; //サイズ表記でHが先 (falseで W x H)
        var $frameColor = [250, 250, 250]; // フレームの色 (RGB)
        var $exclamation = false // CSVで「!」ラインだけを書き出す (SKIP機能の反転)
        var $fontFamily = ['Meiryo', 'KozGoPr6N-Regular', 'Osaka']; // 文字のフォント (左優先)

        // CSV 取得項目キーワード（任意のキーワードに変更可能
        var $keywords1 = [
            '名前', // タイトル(名前 ~ 名前5は順に連結されます)
            '名前1',
            '名前2',
            '名前3',
            '名前4',
            '名前5',
            '概要', // 挿入位置: 名前下
            'テキスト1', // 概要下 その1
            'テキスト2',  // 概要下 その2 
            'テキスト3', // レイアウト下中央
            'テキスト4', // アートボード右上
            'テキスト5', // アートボード右下
            '枚数',
            'フォルダ'
        ];

        // CSV 取得サイズ項目キーワード（任意のキーワードに変更可能
        var $keywords2 = [
            'VW',　// Visual Width - 変更例: 見え寸W, 内寸W, 有効表示寸法W, 表示寸法W など
            'VH', // Visual Height - 変更例: 見え寸H, 内寸H, 有効表示寸法H, 表示寸法H など
            'OW', // Outer Width - 変更例: 外寸W, カット寸W, 板寸W, 仕上がり寸法W など
            'OH', // Outer Height - 変更例: 外寸H, カット寸H, 板寸H, 仕上がり寸法H など
            'ドブ' // 変更例: 塗り足し, 裁ち落とし, のばし など
        ]

        // 色キーワード定義 (RGB)
        var $colorOptions = {
            '{R}': [182, 41, 44],
            '{G}': [14, 139, 67],
            '{B}': [8, 106, 174],
            '{P}': [147, 39, 143], // Purple
            '{O}': [204, 101, 21], // Orange
            '{Y}': [171, 156, 27], // Yellow
            '{BLACK}': [0, 0, 0]
        };

        // 保存オプションの設定 (AI, PDF, EPS)
        var $saveOptions = {
            ai: {
                pdfCompatible: true, //PDF互換ファイルを作成
                embedICCProfile: false, //ICCプロファイルを埋め込む
                embedLinkedFiles: false, //配置した画像を含む
                compressed: true //　圧縮を使用
            },
            pdf: {
                generateThumbnails: true, // サムネイルを生成する
                preserveEditability: false, // 編集可能にする
                registrationMarks: false, // レジストレーションマークを描画
                acrobatLayers: false, // 保存するアートボードの範囲
                compatibility: PDFCompatibility.ACROBAT6 // Acrobatの互換バージョン
            },
            eps: {
                embedLinkedFiles: false,
                embedAllFonts: true,
                includeDocumentThumbnails: false,
                preview: EPSPreview.None
            }
        }

        // 規格サイズ (OHに入力で縦型, OWに入力で横型)
        var $standardSize = {

            // A判
            'A0': {w: 841, h: 1189},
            'A1': {w: 594, h: 841},
            'A2': {w: 420, h: 594},
            'A3': {w: 297, h: 420},
            'A4': {w: 210, h: 297},
            'A5': {w: 148, h: 210},
            'A6': {w: 105, h: 148},
            'A7': {w: 74, h: 105},
            'A8': {w: 52, h: 74},
            'A10': {w: 26, h: 37},

            // B判
            'B0': {w: 1030, h: 1456},
            'B1': {w: 728, h: 1030},
            'B2': {w: 515, h: 728},
            'B3': {w: 364, h: 515},
            'B4': {w: 257, h: 364},
            'B5': {w: 182, h: 257},
            'B6': {w: 128, h: 182},
            'B7': {w: 91, h: 128},
            'B8': {w: 64, h: 91},
            'B9': {w: 32, h: 45}
        }

        //　設定ここまで==============

        //================
        // Polyfill
        //================

        if (!Array.prototype.forEach) {
          Array.prototype.forEach = function(callback, thisArg) {
            var T, k;
            if (this == null) {
              throw new TypeError(" this is null or not defined");
            }
            var O = Object(this);
            var len = O.length >>> 0;
            if ({}.toString.call(callback) != "[object Function]") {
              throw new TypeError(callback + " is not a function");
            }
            if (thisArg) {
              T = thisArg;
            }
            k = 0;
            while(k < len) {
              var kValue;
              if (k in O) {
                kValue = O[ k ];
                callback.call(T, kValue, k, O);
              }
              k++;
            }
          };
        }

        //================
        // Functions
        //================

        var isObject = function(data) {
            return (Object.prototype.toString.call(data) == '[object Object]') ? true : false;
        }

        var isArray = function(data) {
            return data instanceof Array;
        }

        var mmToPt = function(mm) {
           return  mm * 2.83464566929134;
        }

        var ptToMm = function(pt) {
            return pt / 2.83464566929134;
        }

        var rgb = function(r, g, b) {
            var color = new RGBColor();
            if(arguments.length == 1 && isArray(arguments[0])) {
                color.red = arguments[0][0];
                color.green = arguments[0][1];
                color.blue = arguments[0][2];
            } else {
                color.red = r;
                color.green = g;
                color.blue = b;
            }
            return color;
        }

        var getColorCode = function(color) {
            if(color == undefined) {
                return rgb(0, 0, 0);
            } else if(color.typename == 'CMYKColor' || color.typename == 'RGBColor') {
                return color;
            } else if(isArray(color)) {
                return rgb(color);
            } else {
                throw new Error('invalid color value');
            }
        }

        var zenkakuToHankaku = function(str) {
            if(!/[０-９]/.test(str)) return str;
            var zen = ["１","２","３","４","５","６","７","８","９","０"];
            var han = [1,2,3,4,5,6,7,8,9,0];
            while(/[０-９]/.test(str)) {
                zen.forEach(function(e, i) {
                    str = str.replace(zen[i], han[i]);
                })
            }
            return str;
        };

        var normalizeChara = function(str) {
            var meta = ['>', '<', '[?]', ':', ';', '"', '[*]', '[|]', '%', '[.]', '/'];
            var zen = ['＞', '＜', '？', '：', '；', '”', '＊', '｜', '％', '-', '／'];
            meta.forEach(function(e, i) {
                var reg = new RegExp(e, 'g');
                if(reg.test(str)) {
                    str = str.replace(reg, zen[i])
                }
            });
            return str;
        }

        var zeroPadding = function(num, digit) {
            var str = num.toString();
            var c = digit - str.length;
            for(var i = 0; i < c; i++) {
                str = '0' + str;
            }
            return str;
        }

        var getDate = function(type) {
            var o = new Date();
            var y = o.getFullYear().toString();
            var m = (o.getMonth() + 1).toString();
            var d = o.getDate().toString();
            if(m.length == 1) m = "0" + m;
            if(d.length == 1) d = "0" + d;
            switch(type) {
                case 'dot':
                    return y + '.'+  m + '.' + d;
                case 'full':
                    var h = o.getHours().toString();
                    var min = o.getMinutes().toString();
                    if(h.length == 1) h = "0" + h;
                    if(min.length == 1) min = "0" + min;
                    return y + '-' + m + d + '-' + h + min;
                default:
                    return s = y + m + d;
            }
        }

        var paletteCountDown = function(title) {
            var w = new Window('palette', title);
            w.text = '';
            w.preferredSize.width = 110;
            w.preferredSize.height = 0;
            w.show();
            return {
                set: function(count) {
                    w.text = '残り: ' + count;
                },
                close: function() {
                    w.close();
                }
            };
        }

        var drawLine = function(group, x1, y1, x2, y2, lineWidth, color) {
            var path = group.pathItems.add();
            path.pixelAligned = false;
            path.filled = false;
            path.stroked = true;
            path.strokeWidth = (lineWidth !== undefined) ? mmToPt(lineWidth) : mmToPt(0.25);
            path.strokeColor = getColorCode(color);
            path.setEntirePath([[x1, y1], [x2, y2]]);
            return path;
        }

        // param
        // layer, group, color, fillColor, stroke, x, y, w, h, lineWidth, name
        var drawRect = function(param) {
            var rect;
            if(param.layer) {
                rect = param.layer.pathItems.rectangle(param.y, param.x, param.w, param.h);
            } else if(param.group) {
                rect = param.group.pathItems.rectangle(param.y, param.x, param.w, param.h);
            }
            rect.name = param.name || '';
            rect.pixelAligned = false;
            rect.strokeColor = getColorCode(param.color);
            rect.strokeWidth = (param.lineWidth !== undefined) ? mmToPt(param.lineWidth) : mmToPt(0.25);
            if(param.fillColor) {
                rect.filled = true;
                rect.fillColor = rgb(param.fillColor);
            } else {
                rect.filled = false;
            }
            switch(param.stroke) {
                case "none":
                    rect.stroked = false;
                    break;
                case "dashed":
                    rect.strokeDashes = [param.w / 100, param.w / 100];
                    break;
                default:
                    rect.stroked = true;
            }
            return rect;
        }

        var getBounds = function(item) {
            return {
                t: item.geometricBounds[1],
                r: item.geometricBounds[2],
                b: item.geometricBounds[3],
                l: item.geometricBounds[0],
                w: item.geometricBounds[2] - item.geometricBounds[0],
                h: item.geometricBounds[1] - item.geometricBounds[3]
            }
        }

        var getSquare = function(w, h) {
            var sq = ((h / 1000) * (w / 1000)) * 100;
            return Math.round(sq) / 100;
        }

        // param
        // layer, name, contents, x, y, size, justifi,  sep, tracking
        var drawText = function(param) {
            var textFrames;
            var font = getFontFace($fontFamily);
            var x = 0;
            var y = 0;
            if(param.layer) {
                textFrames = param.layer.textFrames.add();
            } else if(param.group) {
                textFrames = param.group.textFrames.add()
            }
            textFrames.pixelAligned = false;
            textFrames = drawContents(textFrames, param.contents);
            textFrames.textRange.size = param.size;
            textFrames.textRange.textFont = font;
            textFrames.top = param.y;
            textFrames.left = param.x;
            textFrames.name = param.name || "";
            if(param.justifi) {
                textFrames = setJustification(textFrames, param.justifi, param.x);
            };
            if(param.tracking) {
                textFrames.textRange.tracking = param.tracking;
            };
            return textFrames;

            function setJustification(textFrames, justifi, x) {
                var _textFrames = textFrames;
                var _justifi = '';
                switch(justifi) {
                    case 'center':
                        _justifi = Justification.CENTER;
                        break;
                    case 'right':
                        _justifi = Justification.RIGHT;
                        break;
                    default:
                }
                for(var i = 0; i < _textFrames.paragraphs.length; i++) {
                    var p = _textFrames.paragraphs[i];
                    p.justification = _justifi;
                }
                return _textFrames;
            }

            function getFontFace(fontFamily) {
                var font;
                for(var i = 0; i < fontFamily.length; i++) {
                    try {
                        return app.textFonts[fontFamily[i]]
                    } catch(e) {
                        continue;
                    }
                }
                return false;
            }

            function drawContents(textFrames, contents) {
                var _textFrames = textFrames;
                if(typeof contents == 'string') {
                    _textFrames.contents = contents;
                } else if(isArray(contents)) {
                    _textFrames = drawArrayText(textFrames, contents);
                } else if(isObject(contents) && ('color' in contents)) {
                    _textFrames = fillText({textFrames: textFrames, set: contents});
                } else {
                    throw new TypeError(contents + " :invalid value");
                }
                return _textFrames;

                function drawArrayText(textFrames, array) {
                    var _textFrames = textFrames;
                    var textArray = [];
                    var colorArray = [];
                    for(var i = 0; i < array.length; i++) {
                        var text = array[i];
                        if(!text || !text.text) continue;
                        if(isObject(text) && ('color' in text)) {
                            textArray.push(text.text);
                            colorArray.push(text.color);
                        } else {
                            textArray.push(text);
                        }
                    }
                    if(colorArray.length) {
                        _textFrames = fillText({
                            textFrames: textFrames,
                            sets: {
                                text: textArray,
                                color: colorArray
                            }
                        });
                    } else {
                        _textFrames.contents = textArray.join(' - ');
                    }
                    return _textFrames;
                }

                // Param
                // textFrames, set, sets
                function fillText(param) {
                    var _textFrames = param.textFrames;
                    if(param.sets) {
                        fillArrayContents(_textFrames, param.sets.text, param.sets.color);
                    } else if(param.set) {
                        _textFrames.contents = param.set.text;
                        if(typeof param.set.text == 'number') {
                            param.set.text = String(param.set.text);
                        }
                        fillCharacter(_textFrames, 0, param.set.text.length, param.set.color);
                    }
                    return _textFrames;

                    function fillArrayContents(textFrames, textArray, colorArray) {
                        var _textFrames = textFrames;
                        var start = 0;
                        var end = 0;
                        var filltext = '';
                        var separetor = ' - ';
                        _textFrames.contents = fillText = textArray.join(separetor);
                        for(var i = 0; i < textArray.length; i++) {
                            var text = textArray[i];
                            var color = colorArray[i];
                            end = start + text.length;
                            if(color) {
                                fillText.indexOf(text, start);
                                _textFrames = fillCharacter(_textFrames, start, end, color);
                            }
                            start += text.length + separetor.length;
                        }
                        return _textFrames;
                    }

                    function fillCharacter(textFrames, start, end, color) {
                        if(!color) return;
                        var _textFrames = textFrames;
                        for(var i = start;  i < end; i++) {
                            var s = _textFrames.characters[i];
                            s.fillColor = getColorCode(color);
                        }
                        return _textFrames;
                    }
                }
            }
        }

        var docData = (function() {
            var inputType = null;
            var csvName = null;
            var csvPath = null;
            var layoutsData = null;
            var saveFolder = null;
            var converter = {
                path: null,
                files: null,
            }
            var doc = null;
            var layers = {};
            var posAxis = {}
            var isOrverArea = false;

            return {
                set: {
                    data: function(obj) {
                        csvName = obj.name;
                        csvPath = obj.path;
                        layoutsData = obj.data;
                    },
                    saveFolder: function(folderObj) {
                        saveFolder = folderObj;
                    },
                    converter: {
                        path: function(path) {
                            converter.path = path;
                        },
                        files: function(files) {
                            converter.files = files;
                        }
                    },
                    createdDoc: function(layer) {
                        createdDoc.locked = layer;
                    },
                    inputType: function(type) {
                        inputType = type;
                    },
                    doc: function(mainDoc) {
                        doc = mainDoc;
                    },
                    layers: function(obj) {
                        layers = obj;
                    },
                    isOrverArea: function(isOrverFlag) {
                        isOrverArea = isOrverFlag;
                    }
                },
                get: {
                    csvName: function() {
                        return csvName;
                    },
                    csvPath: function() {
                        return csvPath;
                    },
                    layoutsData: function() {
                        return layoutsData;
                    },
                    layoutsCount: function() {
                        return layoutsData.length;
                    },
                    saveFolder: function() {
                        return saveFolder;
                    },
                    converter: {
                        path: function() {
                            return converter.path;
                        },
                        files: function() {
                            return converter.files;
                        }
                    },
                    inputType: function() {
                        return inputType;
                    },
                    doc: function() {
                        return doc;
                    },
                    layers: function() {
                        return layers;
                    },
                    layer: function(name) {
                        return layers[name];
                    },
                    isOrverArea: function() {
                        return isOrverArea;
                    }
                },
                layersLock: function() {
                    for(var key in layers) {
                        if(key == 'layout' || key == 'mask' || key == 'contents') continue;
                        layers[key].locked = true;
                    }
                }
            }
        })();

        var generateLayout = function(layoutsData) {
            for(var i = 1, l = layoutsData.length; i < l; i++) {
                var alert = paletteCountDown();
                alert.set(layoutsData.length - i);
                var layout = new Layout(layoutsData[i]);
                if(!layout.setup()) return;
                if(!$multiArtboards) {
                    if($layerLock) docData.layersLock();
                    layout.save()
                    if($closeDoc) activeDocument.close();
                }
                alert.close();
            }
            if($multiArtboards) {
                if($layerLock) docData.layersLock();
                layout.save()
                if($closeDoc) activeDocument.close();
            }
            return true;
        }

        //================
        // Layout Class
        //================

        var Layout = (function() {
            var Layout = function(layoutData) {
                this.num = layoutData.num;
                this.names = layoutData.names;
                this.size = layoutData.size;
                this.dobu = layoutData.dobu || mmToPt($dobu);
                this.text = layoutData.text;
                this.sheet = layoutData.sheet;
                this.folder = layoutData.folder;
                this.artboard = null;
                this.base = {
                    fontSize: null,
                    lineWidth: null
                }
                this.items = {};
                this.artboardSize = {};
            }

            var proto = Layout.prototype;

            proto.setup = function() {
                if($multiArtboards) {
                    if(!docData.get.doc()) {
                        this.createDocument(this.getArtboardSize());
                        docData.set.layers(this.addLayerSets());
                    } else {
                        if(!this.addArtboard(this.getArtboardSize())) return false;
                    }
                } else {
                    this.createDocument(this.getArtboardSize());
                    docData.set.layers(this.addLayerSets());
                }
                this.setArtboardStatus();
                this.items = this.addLayoutRects();
                if($trimMark) this.items.trimMark = this.addTrimMark();
                this.items.title = this.addTitle();
                this.items.size = this.addSize();
                if($displaySize) this.items.displaySize = this.addDisplaySize();
                this.items.text = this.addDetailTexts();
                if(this.sheet) this.items.sheet = this.addOrderCount();
                if($insertTag) this.items.tag = this.addTag();
                this.items.footer = this.addFooterStamp();
                return true;
            }

            proto.getRatio = function(w, h) {
                var _w = w || this.size.vw.val || this.size.ow.val;
                var _h = h || this.size.vh.val || this.size.ow.val;
                var ratio = Math.round((_w / _h) * 100) / 100;
                if(String(ratio).length == 1) {
                    ratio = ratio + ".00";
                  } else if(ratio.length == 3) {
                    ratio = ratio + "0";
                  }
                return ratio;
            }

            proto.getFullName = function(separetor) {
                var array = [];
                var separetor = separetor ? separetor : ' ';
                for(var i = 0; i < this.names.length; i++) {
                    if(this.names[i] == null || this.names[i].text == undefined) continue;
                    array.push(this.names[i].text)
                }
                return array.join(separetor);
            }

            proto.getSizeText = function(type) {
                var vw = this.size.vw.val;
                var vh = this.size.vh.val;
                var ow = this.size.ow.val;
                var oh = this.size.oh.val;
                switch(type) {
                    case 'visual':
                        if($HxW) {
                            return  'H' + vh + ' x W' + vw;
                        } else {
                            return  'W' + vw + ' x H' + vh;
                        }
                    case 'outer':
                        if($HxW) {
                            return 'H' + oh + ' x W' + ow;
                        } else {
                            return 'W' + ow + ' x H' + oh;
                        }
                        break;
                    default:
                        if(vw && ow) {
                            if($HxW) {
                                return 'H' + vh + ' x W' + vw + ' (H' + oh + ' x W' + ow + ')';
                            } else {
                                return 'W' + vw + ' x H' + vh+ ' (W' + ow + ' x H' + oh + ')';
                            }
                        } else {
                            if($HxW) {
                                return 'H' + oh + ' x W' + ow;
                            } else {
                                return 'W' + ow + ' x H' + oh;
                            }
                        }
                }
                return false;
            }

            proto.addTitle = function() {
                var margin = this.artboardSize.w / 10.5;
                var textFrames = drawText({
                    layer: docData.get.layer('text'),
                    name: 'タイトル',
                    contents: this.names,
                    size: this.base.fontSize,
                    x: this.artboardSize.x + margin,
                    y: this.artboardSize.t -  (this.artboardSize.h / 14)
                });
                var bounds = getBounds(textFrames);
                if(bounds.r > this.artboardSize.r - (margin * 2)) {
                    textFrames.width = this.artboardSize.r - bounds.l - (margin * 2);
                }
                return textFrames;
            }

            proto.addSize = function() {
                return drawText({
                    layer: docData.get.layer('text'),
                    name: 'サイズ',
                    contents: this.getSizeText(),
                    size: this.base.fontSize * 0.7,
                    x: getBounds(this.items.title).l,
                    y: getBounds(this.items.title).b - (this.base.fontSize * 0.2),
                    tracking: 80
                });
            }

            proto.addDetailTexts = function() {
                var layer = docData.get.layer('text');
                var base = this.base.fontSize;
                var array = [];
                var x = 0;
                var y = 0;
                var fontSize = 0;
                for(var i = 0, l = this.text.length; i < l; i++) {
                    var textObj = this.text[i];
                    if(!textObj || !textObj.text) continue;
                    switch(i) {
                        case 0:　// タイトル下 概要
                            array[i] = drawText({
                                layer: layer,
                                name: $keywords1[6],
                                contents: textObj,
                                size: base * 0.6,
                                x: getBounds(this.items.size).l,
                                y: getBounds(this.items.size).b - (base * 0.3),
                                tracking: 50
                            });
                            break;
                        case 1:　// 概要 下 1
                            if(array[0]) {
                                x = getBounds(this.items.size).l;
                                y = getBounds(array[0]).b - (base * 0.6);
                            } else {
                                x = getBounds(this.items.size).l;
                                y = getBounds(this.items.size).b - (base * 0.7);
                            }
                            array[i] = drawText({
                                layer: layer,
                                name: $keywords1[7],
                                contents: textObj,
                                size: base * 0.6,
                                x: x,
                                y: y
                            });
                            break;
                        case 2: // 概要 下 2
                            if(array[0]) {
                                x = getBounds(this.items.title).l;
                                y = getBounds(array[0]).b - (base * 0.6);
                            } else {
                                x = getBounds(this.items.title).l;
                                y = getBounds(this.items.title).b - (base * 0.7);
                            }
                            if(array[1]) {
                                x = getBounds(array[1]).r + (getBounds(array[1]).h * 0.4);
                            }
                            array[i] = drawText({
                                layer: layer,
                                name: $keywords1[8],
                                contents: textObj,
                                size: base * 0.6,
                                x: x,
                                y: y
                            });
                            break;
                        case 3:　// レイアウト下中央
                            var outerBounds = getBounds(this.items.outer);
                            var text3posY = getBounds(this.items.mask).b - (base * 2);
                            if(this.items.displaySize && this.items.displaySize.outer) {
                                text3posY = getBounds(this.items.displaySize.outer.ow).b - (base * 1.5);
                            }
                            array[i] = drawText({
                                layer: layer,
                                name: $keywords1[9],
                                contents: textObj,
                                size: base * 0.6,
                                x: outerBounds.l + (outerBounds.w / 2),
                                y: text3posY,
                                justifi: 'center'
                            });
                            break;
                        case 4: // アートボード右上
                            array[i] = drawText({
                                layer: layer,
                                contents: textObj,
                                size: base * 0.4,
                                x: this.artboardSize.r - (base * 1.5),
                                y: this.artboardSize.t - (base * 1.5),
                                justifi: 'right'
                            });
                            array[i] = array[i].createOutline();
                            array[i].name = $keywords1[10];
                            var bounds = getBounds(array[i]);
                            drawRect({
                                layer: layer,
                                color: textObj.color || [0, 0, 0],
                                lineWidth: this.base.lineWidth * 2,
                                name: $keywords1[10] +'_矩形',
                                x: bounds.l - (base * 0.3),
                                y: bounds.t + (base * 0.3),
                                w: bounds.w + (base * 0.6),
                                h: bounds.h + (base * 0.6)
                            });
                            break;
                        case 5: // アートボード右下
                            array[i] = drawText({
                                layer: layer,
                                name: $keywords1[11],
                                contents: textObj,
                                size: base * 0.5,
                                x: this.artboardSize.r - (base * 1.5),
                                y: this.artboardSize.b,
                                justifi: 'right'
                            });
                            array[i].top = array[i].top + (base * 1.5);
                            break;
                        default:
                    }
                }
                return array;
            }

            proto.getHeaderBounds = function() {
                var headerItems = [
                    this.items.title,
                    this.items.size,
                    this.items.text[0],
                    this.items.text[1],
                    this.items.text[2]
                ]
                var bounds = {
                    t: getBounds(this.items.title).t,
                    r: null,
                    b: this.artboardSize.h,
                    l: getBounds(this.items.title).l,
                    w: null,
                    h: null
                }
                for(var i = 0, l = headerItems.length; i < l; i++) {
                    var item = headerItems[i];
                    if(!item) continue;
                    var itemBounds = getBounds(item);
                    if(itemBounds.r > bounds.r) bounds.r = itemBounds.r;
                    if(itemBounds.b < bounds.b) bounds.b = itemBounds.b;
                    bounds.w = bounds.r - bounds.l;
                    bounds.h = bounds.t - bounds.b;
                }
                return bounds;
            }

            proto.addOrderCount = function() {
                var group = docData.get.layer('text').groupItems.add();
                var margin = this.artboardSize.w / 10.5;
                group.name = '枚数';
                var l = (this.base.fontSize * 0.5);
                var m = l * 4;
                var hb = this.getHeaderBounds();
                var textPosX = hb.r + m * 2;
                if(hb.r > this.artboardSize.r - (margin * 2.5)) {
                    textPosX = hb.r;
                } else {
                    var path1 = addEntirePath(group.pathItems.add(), [
                            [hb.r + m, hb.t - (l * 0.5)],
                            [hb.r + m + l, hb.t - (l * 0.5)],
                            [hb.r + m + l, hb.b + (l * 0.5)],
                            [hb.r + m , hb.b + (l * 0.5)]
                    ]);
                    var path2 = addEntirePath(group.pathItems.add(), [
                        [hb.r + m + l, hb.t - (hb.h / 2) ],
                        [hb.r + m + l * 2, hb.t - (hb.h / 2)]
                    ]);
                }
                drawText({
                    group: group,
                    size: this.base.fontSize * 0.8,
                    contents: {
                        text: 'x ' + this.sheet,
                        color: $colorOptions['{R}'],
                    },
                    x: textPosX,
                    y: hb.t - (hb.h / 2) * 0.8
                });

                return group;

                function addEntirePath(item, pathArray) {
                    item.pixelAligned = false;
                    item.filled = false;
                    item.stroked = true;
                    item.strokeWidth = l / 15;
                    item.strokeColor = rgb(150, 150, 150);
                    item.setEntirePath(pathArray);
                    return item;
                }
            }

            proto.addTag = function() {
                var self = this;
                var text = this.names.concat();
                var size = mmToPt(5);
                text.push({color: null, text: this.getSizeText()});
                if(this.text[1]) text.push(this.text[1]);
                if(this.text[2]) text.push(this.text[2]);
                if(this.text[4]) text.push(this.text[4]);
                var textFrames = drawText({
                    layer: docData.get.layer('tag'),
                    name: 'タグ',
                    contents: text,
                    size: size,
                    x: getBounds(this.items.outer).l + mmToPt(6),
                    y: getBounds(this.items.outer).t + this.dobu + size + 2,
                    tracking: -50
                });
                return resizeTagWidth(textFrames);

                function resizeTagWidth(textFrames) {
                    var _textFrames = textFrames;
                    var r1 = getBounds(_textFrames).r;
                    var r2 = getBounds(self.items.outer).r;
                    if(r1 > r2) {
                        var offset = r1 - r2;
                        _textFrames.width = _textFrames.width - offset - 6;
                    }
                    return _textFrames;
                }
            }

            proto.addFooterStamp = function() {
                var array = [];

                /*比率*/　if($ratioStamp) array.push('Ratio: ' + this.getRatio());
                /*平米*/　if($squareStamp) array.push('Square: ' + getSquare(this.size.ow.val, this.size.oh.val) + '㎡');
                /*日付*/　if($dateStamp) array.push('Created: ' + getDate('dot'));
                /*フリーテキスト*/　if($freeTextStamp !== '') array.push($freeTextStamp);

                if(array.length == 0) return;
                var layer = docData.get.layer('text');
                var base = this.base.fontSize;
                var textFrames = drawText({
                    layer: layer,
                    name: 'フッター',
                    contents: {text: array.join(' - '), color: [100, 100, 100]},
                    size: base * 0.4,
                    x: this.artboardSize.x + this.artboardSize.w / 10.5,
                    y: this.artboardSize.b + (base * 2),
                });
                return textFrames;
            }

            proto.addLayer = function(param) {
                var layer = param.parent ? param.parent.layers.add() : activeDocument.layers.add();
                layer.name = param.name || '';
                layer.color = getColorCode(param.color);
                if(param.lock) layer.locked = true;
                return layer;
            }

            proto.addLayerSets = function() {
                var layers = {}
                layers.layout = this.addLayer({name: 'レイアウト', color: [0, 200, 255]});
                app.activeDocument.layers[1].remove();
                layers.mask = this.addLayer({parent: layers.layout, name: '内容', color: [0, 105, 205]});
                layers.tag = this.addLayer({parent: layers.layout, name: 'タグ', color: [0, 105, 205]});
                layers.draftDel = this.addLayer({name: '入稿時削除', color: [255, 0, 200]});
                if($trimMark) {
                    layers.trimMark = this.addLayer({parent: layers.layout, name: 'トンボ', color: [0, 105, 205]});
                    layers.outer = this.addLayer({parent: layers.draftDel, name: '仕上がり罫線', color: [190, 0, 140]});
                } else {
                    layers.outer = this.addLayer({parent: layers.layout, name: '仕上がり罫線', color: [190, 0, 140]});
                }
                layers.text = this.addLayer({parent: layers.draftDel, name: 'テキスト', color: [190, 0, 140]});
                if(this.size.vw.val) {
                    layers.visual = this.addLayer({parent: layers.draftDel, name: '見え寸', color: [190, 0, 140]});
                }
                if($frameView) {
                    layers.frame = this.addLayer({parent: layers.draftDel, name: 'フレーム', color: [190, 0, 140]});
                }
                return layers;
            }

            proto.addLayoutRects = function() {
                var self = this;
                var items = {};
                items.outer = drawRect({
                    layer: docData.get.layer('outer'),
                    x: this.artboardSize.cx - (this.size.ow.pt / 2),
                    y: this.artboardSize.cy + (this.size.oh.pt / 2),
                    w: this.size.ow.pt,
                    h: this.size.oh.pt,
                    lineWidth: this.base.lineWidth,
                    color: [0, 0, 0]
                });
                items.mask = drawRect({
                    layer: docData.get.layer('mask'),
                    x: this.artboardSize.cx - (this.size.ow.pt / 2) - this.dobu,
                    y: this.artboardSize.cy + (this.size.oh.pt / 2) + this.dobu,
                    w: this.size.ow.pt + (this.dobu * 2),
                    h: this.size.oh.pt + (this.dobu * 2),
                    lineWidth: this.base.lineWidth,
                    color: [100, 100, 100],
                    dobu: this.dobu,
                    stroke: 'dashed',
                    name: 'マスクパス'
                });
                if(this.size.vh.val) items.visual = drawVisualRect();
                if($frameView) items.frame = drawFrame();
                return items;

                function drawVisualRect() {
                    var pos = getRectPosition();
                    return drawRect({
                        layer: docData.get.layer('visual'),
                        x: pos.x,
                        y: pos.y,
                        w: self.size.vw.pt,
                        h: self.size.vh.pt,
                        color: getRectColor(),
                        lineWidth: self.base.lineWidth
                    });

                    function getRectPosition() {
                        var x = self.artboardSize.cx - (self.size.vw.pt / 2);
                        var y = self.artboardSize.cy + (self.size.vh.pt / 2);
                        var outerBounds = getBounds(items.outer);
                        if('pos' in self.size.vh) {
                            if(self.size.vh.pos.top !== undefined) {
                                y = outerBounds.t - self.size.vh.pos.top;
                            } else if(self.size.vh.pos.bottom !== undefined) {
                                y = outerBounds.b + self.size.vh.pos.bottom + self.size.vh.pt;
                            }
                        }
                        if('pos' in self.size.vw) {
                            if(self.size.vw.pos.left !== undefined) {
                                x = outerBounds.l + self.size.vw.pos.left;
                            } else if(self.size.vw.pos.right !== undefined) {
                                x = outerBounds.r - self.size.vw.pos.right - self.size.vw.pt;
                            }
                        }
                        return {
                            x: x,
                            y: y
                        }
                    }

                    function getRectColor() {
                        switch($visualRectColor) {
                            case 'red':
                                return $colorOptions['{R}'];
                            case 'green':
                                return $colorOptions['{G}'];
                            case 'blue':
                                return $colorOptions['{B}'];
                        default:
                        }
                    }
                }

                function drawFrame() {
                    var group = docData.get.layer("frame").groupItems.add();
                    drawFrameOuter(group);
                    drawFrameInner(group);
                    group.selected = true;
                    app.executeMenuCommand("Live Pathfinder Exclude");
                    app.executeMenuCommand('expandStyle');
                    group.selected = false;
                    return group;

                    function drawFrameInner() {
                        var bounds = items.visual ? getBounds(items.visual) : getBounds(items.outer)
                        return drawRect({
                            group: group,
                            x: bounds.l,
                            y: bounds.t,
                            w: bounds.w,
                            h: bounds.h,
                            stroke: 'none',
                            color: [100, 100, 100],
                            fillColor: $frameColor
                        });
                    }

                    function drawFrameOuter(group) {
                        var trimLength = 0;
                        if($trimMark) {
                            trimLength = mmToPt(6);
                            if($trimMarkJPN) trimLength = mmToPt(9);
                        }
                        var mBounds = getBounds(items.mask);
                        return drawRect({
                            group: group,
                            x: mBounds.l - trimLength,
                            y: mBounds.t + trimLength,
                            w: mBounds.w + (trimLength * 2),
                            h: mBounds.h + (trimLength * 2),
                            color: [100, 100, 100],
                            stroke: 'none'
                        });
                    }
                }
            }

            proto.addTrimMark = function() {
                var group = docData.get.layer('trimMark').groupItems.add();
                var m = this.dobu;
                var lineWidth = 0.1; //トンボの太さ
                var outerRect = this.items.outer;
                var x = outerRect.geometricBounds[0];
                var y = outerRect.geometricBounds[1];
                var w = outerRect.width;
                var h = outerRect.height;
                if($trimMarkJPN) {
                    drawTrimMarkJPN();
                } else {
                    drawTrimMark();
                }

                return group;

                function drawTrimMark() {
                    var d = mmToPt(6); //トンボの長さ
                    drawLine(group, x, y + m, x, y + m + d, lineWidth),
                    drawLine(group, x - m, y, x - m - d, y, lineWidth),
                    drawLine(group, x + w, y + m, x + w, y + m + d, lineWidth),
                    drawLine(group, x + w + m, y, x + w + m + d, y, lineWidth),
                    drawLine(group, x, y - h - m, x, y - h - m - d, lineWidth),
                    drawLine(group, x - m, y - h, x - m - d, y - h, lineWidth),
                    drawLine(group, x + w, y - h - m, x + w, y - h - m - d, lineWidth),
                    drawLine(group, x + w + m, y - h, x + w + m + d, y - h, lineWidth)
                }

                function drawTrimMarkJPN() {
                    var d = mmToPt(9); //トンボの長さ

                    // Corner line
                    var topLeft = group.groupItems.add();
                    drawLine(topLeft, x - m - d, y + m, x, y + m, lineWidth);
                    drawLine(topLeft, x, y + m, x, y + m + d, lineWidth);
                    drawLine(topLeft, x - m, y + m + d, x - m, y, lineWidth);
                    drawLine(topLeft, x - m, y, x - m - d, y, lineWidth);
                    var topRight = topLeft.duplicate();
                    topRight.rotate(-90);
                    topRight.translate(w + m + d, 0);
                    var bottomRight = topRight.duplicate();
                    bottomRight.rotate(-90);
                    bottomRight.translate(0, -h - m - d);
                    var bottomLeft = bottomRight.duplicate();
                    bottomRight.rotate(-90);
                    bottomRight.translate(-w - m - d, 0);

                    // Center line
                    var topCenter = group.groupItems.add();
                    drawLine(topCenter, x + (w / 2), y + m + mmToPt(1.233), x + (w / 2), y + m + mmToPt(8.467) + mmToPt(1.233), lineWidth);
                    drawLine(topCenter, x + (w / 2) - (mmToPt(25.4) / 2), y + m + mmToPt(3.35), x + (w / 2) + (mmToPt(25.4) / 2), y + m + mmToPt(3.35), lineWidth);
                    var rightCenter = topCenter.duplicate();
                    rightCenter.rotate(-90);
                    rightCenter.translate((w / 2) + m + mmToPt(5.466), (-h / 2) - m - mmToPt(5.466));
                    var bottomCenter = rightCenter.duplicate();
                    bottomCenter.rotate(-90);
                    bottomCenter.translate((-w / 2) - m - mmToPt(5.466), (-h / 2) - m - mmToPt(5.466));
                    var leftCenter = bottomCenter.duplicate();
                    leftCenter.rotate(-90);
                    leftCenter.translate((-w / 2) - m - mmToPt(5.466 ), (h / 2) + m + mmToPt(5.592));
                }
            }

            proto.createDocument = function(size) {
                var dp = new DocumentPreset;
                dp.colorMode = $colorModeCMYK ? DocumentColorSpace.CMYK : DocumentColorSpace.RGB;
                dp.units = RulerUnits.Millimeters;
                dp.width = size.w;
                dp.height = size.h;
                var doc = app.documents.addDocument("", dp);
                var artboard = doc.artboards[doc.artboards.length - 1];
                artboard.name = this.getFullName(this.name);
                docData.set.doc(doc);
                return doc;
            }

            proto.addArtboard = function(size){
                var that = this;
                app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;
                var artboards = activeDocument.artboards;
                var createdArtboard;
                var grid = 'GridByRow';
                var margin = mmToPt(20);
                for(var i = 10; i > 0; i--) {
                    try {
                        if(!activeDocument.saved) this.save(); // artBoardRect の更新
                        activeDocument.rearrangeArtboards(DocumentArtboardLayout[grid], i);
                        if(createdArtboard = artboards.add(getLastRectPos())) {
                            createdArtboard.name = this.getFullName(this.name);
                            app.userInteractionLevel = UserInteractionLevel.DISPLAYALERTS;
                            return true;
                        };
                    } catch(e) {
                        if(i > 1) continue;
                        alert('レイアウトが入り切りませんので処理を中断します。\n・' + (this.num + 1) + '行目のレイアウトが配置しきれませんでした。');
                        return false;
                    }
                }

                function getLastRectPos() {
                    var rect = artboards[artboards.length - 1].artboardRect;
                    var pos = [
                        rect[2] + margin,
                        rect[1],
                        rect[2] + margin + size.w,
                        rect[1] - size.h
                    ];
                    return pos;
                }
            }

            proto.getArtboardSize = function() {
                var A4_WIDTH_RATIO = 0.7070;
                var w, h;
                var scale = 2;
                var trimMarkLength = 0;
                if($trimMark) {
                    if($trimMarkJPN) {
                        trimMarkLength = mmToPt(6);
                    } else {
                        trimMarkLength = mmToPt(9);
                    }
                }
                var ratio = this.getRatio(this.size.ow.pt, this.size.oh.pt);
                if(Number(ratio) < 1) {
                    h = (this.size.oh.pt + (this.dobu * 2) + (trimMarkLength * 2)) * scale;
                } else {
                    h = (this.size.ow.pt + (this.dobu * 2) + (trimMarkLength * 2)) * scale;
                }
                w = h * A4_WIDTH_RATIO;
                return {
                    w: w,
                    h: h
                };
            }

            proto.setArtboardStatus = function() {
                this.artboard = activeDocument.artboards[activeDocument.artboards.getActiveArtboardIndex()];
                var obj = {};
                var rect = this.artboard.artboardRect;
                obj.x = obj.l = rect[0];
                obj.y = rect[1];
                obj.w = rect[2] - rect[0];
                obj.h = rect[1] - rect[3];
                obj.t = rect[1];
                obj.r = obj.x + obj.w;
                obj.b = obj.y - obj.h;
                obj.cx = obj.r - (obj.w / 2);
                obj.cy = obj.t - (obj.h / 2);
                this.base.fontSize = obj.h / 36;
                this.base.lineWidth = this.base.fontSize / 100;
                this.artboardSize = obj;
            }

            proto.save = function() {
                var self = this;
                var fileName
                if($multiArtboards) {
                    fileName = normalizeChara(docData.get.csvName()) + '_SET';
                } else {
                    fileName = normalizeChara(this.getFullName("_") + '_' + this.getSizeText('outer').replace(/\s/g, ''));
                    if($numbering) fileName = zeroPadding(this.num, 2) + '_' + fileName;
                    if(this.text[4] && this.text[4].text) fileName = fileName + '_[' + this.text[4].text + ']';
                    if(this.folder) saveFolder = createLocalFolder();
                }
                var saveFolder = docData.get.saveFolder();
                if(!saveFolder) saveFolder = createSaveFolder();
                var saveFile = new File(saveFolder + "/" + fileName);
                var options = new IllustratorSaveOptions();
                if($CompatibleVer) {
                    options.compatibility = Compatibility['ILLUSTRATOR' + $CompatibleVer];
                }
                options.pdfCompatible = $saveOptions.ai.pdfCompatible;
                options.embedICCProfile　= $saveOptions.ai.embedICCProfile;
                options.embedLinkedFiles = $saveOptions.ai.embedLinkedFiles;
                options.compressed = $saveOptions.ai.compressed;
                activeDocument.saveAs(saveFile, options);

                function createSaveFolder() {
                    var name = getDate();
                    if(docData.get.csvName()) {
                        name = name + '_' + docData.get.csvName();
                    } else {
                        name = name + '_EXPORTED';
                    }
                   var folder = new Folder($outputPath + '/' + name);
                    if(!folder.exists) folder.create();
                    docData.set.saveFolder(folder);
                    return folder;
                }

                function createLocalFolder() {
                    var folder = new Folder(docData.get.saveFolder() + '/' + self.folder);
                    if(!folder.exists) folder.create();
                    return folder;
                }
            }

            proto.addDisplaySize = function() {
                var self = this;
                var group = {};
                var oBounds = getBounds(this.items.outer);
                var color = [100, 100, 100];
                var bfs = this.base.fontSize;
                var lineW = bfs * 0.01;
                var lineL = bfs * 0.6;
                var m = bfs * 2.2;
                group.outer = drawOuterDisplaySize();
                if(this.size.vw.val !== null) {
                    var vBounds = getBounds(this.items.visual);
                    group.visual = drawVisualDisplaySize();
                }
                return group;

                function drawOuterDisplaySize() {
                    var ohGroup = docData.get.layer('text').groupItems.add();
                    ohGroup.name = '外寸 - 寸法H';
                    drawLine(ohGroup, oBounds.r + m, oBounds.t, oBounds.r + m + lineL, oBounds.t, lineW, color);
                    drawLine(ohGroup, oBounds.r + m, oBounds.b, oBounds.r + m + lineL, oBounds.b, lineW, color);
                    drawLine(ohGroup, oBounds.r + m + (lineL / 2), oBounds.t, oBounds.r + m + (lineL / 2), oBounds.b, lineW, color);
                    drawText({
                        group: ohGroup,
                        name: 'H',
                        contents: {
                            color: color,
                            text: self.size.oh.val
                        },
                        x: oBounds.r + (m * 1.25),
                        y: oBounds.t - (oBounds.h / 2),
                        size: (lineL * 0.6),
                        tracking: 50
                    });
                    var owGroup = docData.get.layer('text').groupItems.add();
                    owGroup.name = '外寸 - 寸法W';
                    drawLine(owGroup, oBounds.l, oBounds.b - m, oBounds.l, oBounds.b - m - lineL, lineW, color);
                    drawLine(owGroup, oBounds.r, oBounds.b - m, oBounds.r, oBounds.b - m - lineL, lineW, color);
                    drawLine(owGroup, oBounds.l, oBounds.b - m - (lineL / 2), oBounds.r, oBounds.b - m - (lineL / 2), lineW, color);
                    var owSizeText = drawText({
                        group: owGroup,
                        name: ' W',
                        contents: {
                            color: color,
                            text: self.size.ow.val
                        },
                        x: oBounds.l,
                        y: oBounds.b - (m * 1.3),
                        size: (lineL * 0.6),
                        tracking: 50
                    });
                    var owSizeTextBounds = getBounds(owSizeText);
                    owSizeText.translate((oBounds.w / 2) - (owSizeTextBounds.w / 2));
                    return {
                        oh: ohGroup,
                        ow: owGroup
                    }
                }

                function drawVisualDisplaySize() {
                    var vhGroup = docData.get.layer('text').groupItems.add();
                    var nobashiVal = getNobashiValText();
                    vhGroup.name = '見え寸 - 寸法H';
                    drawLine(vhGroup, oBounds.r + m, vBounds.t, oBounds.r + m + (lineL / 2), vBounds.t, lineW, self.items.visual.strokeColor);
                    drawLine(vhGroup, oBounds.r + m, vBounds.b, oBounds.r + m + (lineL / 2), vBounds.b, lineW, self.items.visual.strokeColor);
                    drawText({
                        group: vhGroup,
                        name: 'H',
                        contents: {
                            color: self.items.visual.strokeColor,
                            text: self.size.vh.val
                        },
                        x: oBounds.r + (m),
                        y: vBounds.t - (vBounds.h / 2),
                        size: (lineL * 0.6),
                        justifi: 'right',
                        tracking: 50
                    });
                    drawText({
                        group: vhGroup,
                        name: '延ばし上',
                        contents: {
                            color: color,
                            text: nobashiVal.top
                        },
                        x: oBounds.r + (m / 1.3),
                        y: oBounds.t - ((oBounds.t - vBounds.t) / 2) + ((lineL * 0.6) / 2),
                        size: (lineL * 0.6),
                        tracking: 50
                    });
                    drawText({
                        group: vhGroup,
                        name: '延ばし下',
                        contents: {
                            color: color,
                            text: nobashiVal.bottom
                        },
                        x: oBounds.r + (m / 1.3),
                        y: oBounds.b - ((oBounds.b - vBounds.b) / 2) + ((lineL * 0.6) / 2),
                        size: (lineL * 0.6),
                        tracking: 50
                    });
                    var vwGroup = docData.get.layer('text').groupItems.add();
                    vwGroup.name = '見え寸 - 寸法W';
                    drawLine(vwGroup, vBounds.l, oBounds.b - m, vBounds.l, oBounds.b - m - (lineL / 2), lineW, self.items.visual.strokeColor);
                    drawLine(vwGroup, vBounds.r, oBounds.b - m, vBounds.r, oBounds.b - m - (lineL / 2), lineW, self.items.visual.strokeColor);
                    var vwSizeText = drawText({
                        group: vwGroup,
                        name: 'W',
                        contents: {
                            color: self.items.visual.strokeColor,
                            text: self.size.vw.val
                        },
                        x: vBounds.l,
                        y: oBounds.b - (m / 1.2),
                        size: (lineL * 0.6),
                        tracking: 50
                    });
                    var vwSizeTextBounds = getBounds(vwSizeText);
                    vwSizeText.translate((vBounds.w / 2) - (vwSizeTextBounds.w / 2), 0);
                    drawText({
                        group: vwGroup,
                        name: '延ばし左',
                        contents: {
                            color: color,
                            text: nobashiVal.left
                        },
                        x: oBounds.l + ((vBounds.l - oBounds.l) / 2) - ((lineL * 0.6) / 2),
                        y: oBounds.b - (m / 1.2),
                        size: (lineL * 0.6),
                        tracking: 50
                    });
                    drawText({
                        group: vwGroup,
                        name: '延ばし右',
                        contents: {
                            color: color,
                            text: nobashiVal.right
                        },
                        x: oBounds.r + ((vBounds.r - oBounds.r) / 2) - ((lineL * 0.6) / 2),
                        y: oBounds.b - (m / 1.2),
                        size: (lineL * 0.6),
                        tracking: 50
                    });

                    return {
                        vh: vhGroup,
                        vw: vwGroup
                    }

                    function getNobashiValText(directoin) {
                        var obj = {
                            top: (self.size.oh.val - self.size.vh.val) / 2,
                            bottom: (self.size.oh.val - self.size.vh.val) / 2,
                            left: (self.size.ow.val - self.size.vw.val) / 2,
                            right: (self.size.ow.val - self.size.vw.val) / 2
                        }
                        if(!self.size.vw.pos) return obj;
                        if(self.size.vh.pos.top !== undefined) {
                            obj.top = ptToMm(self.size.vh.pos.top);
                            obj.bottom =  self.size.oh.val - self.size.vh.val - obj.top;
                        } else if(self.size.vh.pos.bottom !== undefined) {
                            obj.bottom =  ptToMm(self.size.vh.pos.bottom);
                            obj.top =  self.size.oh.val - self.size.vh.val - obj.bottom;
                        }
                        if(self.size.vw.pos.left !== undefined) {
                            obj.left =  ptToMm(self.size.vw.pos.left);
                            obj.right =  self.size.ow.val - self.size.vw.val - obj.left;
                        } else if(self.size.vw.pos.right !== undefined) {
                            obj.right = ptToMm(self.size.vw.pos.right);
                            obj.left = self.size.ow.val - self.size.vw.val - obj.right;
                        }
                        return obj;
                    }
                }
            }

            return Layout;
        })();

        //================
        // Transfom
        //================

        var converteLayouts = function(settings) {
            var layoutsFolder = docData.get.converter.path();
            var files = docData.get.converter.files();
            var fileSave = exporter('default', settings.saveCopy);

            if(settings.pdf) {
                var pdf = exporter('pdf');
            }
            if(settings.eps) {
                var eps = exporter('eps');
            }

            files.forEach(function(e, i) {
                var alert = paletteCountDown();
                app.open(File(e));

                alert.set(files.length - i);
                var mainLayer = activeDocument.layers['レイアウト'];
                var mainLayerStatus = changeItemStatus(mainLayer);
                mainLayerStatus.editable();

                if(settings.outline) outline(mainLayer);
                if(settings.collectLink) collectLinkImage(fileSave);
                if(settings.embed) embedImage(mainLayer);
                if(settings.pdf) pdf.save();
                if(settings.finalize) finalize();
                if(settings.eps) eps.save();

                mainLayerStatus.uneditable();
                fileSave.save();
                activeDocument.close();
                alert.close();
            });

        }

        var collectLinkImage = function(exporter) {
            var placedItems = activeDocument.placedItems;
            for(var i = 0; i < placedItems.length; i++) {
                var exportFolder = exporter.getSaveFolder();
                var item = placedItems[i];
                var file = item.file;
                var distFile = exportFolder + '/' + file.name;
                file.copy(distFile);
                file = new File(distFile);
            }
        }

        var changeItemStatus = function(layer) {
            var lockedItems = [];
            var invisibleItems = [];
            return {
                editable : function() {
                    lockedItems = getItems(layer, 'pageItems', function(item) {
                        if(item.locked) {
                            item.locked = false;
                            return true;
                        }
                    });
                    invisibleItems = getItems(layer, 'pageItems', function(item) {
                        if(!item.visible) {
                            item.visible = true;
                            return true;
                        }
                    });
                },
                uneditable: function() {
                    lockedItems.forEach(function(e) {
                        e.locked = true;
                    });
                    invisibleItems.forEach(function(e) {
                        e.visible = false;
                    });
                }
            }
        };

        var getItems = function(layer, itemName, callback) {
            var items = [];
            searchItems(layer, itemName);

            function searchItems(layer, itemName) {
                var siblingItems = layer[itemName];
                for(var i = 0, l = siblingItems.length; i < l; i++) {
                    if(callback) {
                        if(callback(siblingItems[i])) items.push(siblingItems);
                    } else {
                        items.push(siblingItems[i]);
                    }
                }
                if(layer.layers) {
                    for(var i = 0, l = layer.layers.length; i < l;  i++) {
                        var childLayer = layer.layers[i];
                        if(callback) {
                            if(callback(childLayer)) items.push(childLayer);
                        }
                        searchItems(childLayer, itemName);
                    }
                }
                if(layer.groupItems) {
                    for(var i = 0, l = layer.groupItems.length; i < l;  i++) {
                        var group = layer.groupItems[i];
                        if(callback) {
                            if(callback(group)) items.push(group);
                        }
                        searchItems(group, itemName);
                    }
                }
            }

            return items;
        }

        var outline = function(layer) {
            getItems(layer, 'textFrames').forEach(function(e) {
                e.createOutline();
            })
        }

        var embedImage = function(layer) {
            getItems(layer, 'placedItems').forEach(function(e) {
                e.embed();
            })
        }

        var finalize = function() {
            try {
                var deleteLayer = activeDocument.layers['入稿時削除'];
            } catch(e) {
                return;
            }
            deleteLayer.locked = false;
            deleteLayer.remove();
        }

        var exporter = function(type, saveCopy) {
            var fileType = type;
            var options = null;
            var saveFolder = null;
            var saveCopy = saveCopy ? true : false;

            setup();

            return {
                save: function(fileName) {
                    var name = fileName || activeDocument.name;
                    var saveFile = new File(saveFolder + '/' + name);
                    activeDocument.saveAs(saveFile, options);
                },
                getSaveFolder: function() {
                    return saveFolder;
                }
            }

             function setup() {
                switch(fileType) {
                    case 'pdf':
                        saveFolder = new Folder(docData.get.converter.path() + '/_' + getDate('full') + '_PDF');
                        options = new PDFSaveOptions();
                        options.generateThumbnails = $saveOptions.pdf.generateThumbnails;
                        options.preserveEditability = $saveOptions.pdf.preserveEditability;
                        options.registrationMarks = $saveOptions.pdf.registrationMarks;
                        options.acrobatLayers = $saveOptions.pdf.acrobatLayers;
                        options.compatibility = $saveOptions.pdf.compatibility;
                        break;
                    case 'eps':
                        saveFolder = new Folder(docData.get.converter.path() + '/_' + getDate('full') + '_EPS');
                        options = new EPSSaveOptions();
                        options.embedLinkedFiles = $saveOptions.eps.embedLinkedFiles;
                        options.embedAllFonts = $saveOptions.eps.embedAllFonts;
                        options.includeDocumentThumbnails = $saveOptions.eps.includeDocumentThumbnails;
                        options.preview = $saveOptions.eps.preview;
                        break;
                    default:
                        if(saveCopy) {
                            saveFolder = new Folder(docData.get.converter.path() + "/_" + getDate('full') + decodeURI('_CONVERTED'));
                        } else {
                            saveFolder = new Folder(docData.get.converter.path() + "/");
                        }
                        options = new IllustratorSaveOptions();
                        options.compatibility = Compatibility['ILLUSTRATOR' + $CompatibleVer];
                        options.pdfCompatible = $saveOptions.ai.pdfCompatible;
                        options.embedICCProfile　= $saveOptions.ai.embedICCProfile;
                        options.embedLinkedFiles = $saveOptions.ai.embedLinkedFiles;
                        options.compressed = $saveOptions.ai.compressed;
                }
                if(!saveFolder.exists) {
                    saveFolder.create();
                }
            }
        }

        //================
        // Setting Menu GUI
        //================

        var openSettings = function() {
            var ready = false;
            var layoutDataObj = {};
            var w = new Window("dialog", 'Settings');
            var main = w.add("group");
            main.orientation = "row";

                // COLUMN1
                var column1 = main.add('panel', undefined, 'Layout Generator');
                column1.alignment = [ScriptUI.Alignment.FILL, ScriptUI.Alignment.TOP];
                column1.orientation = "column";

                    var layoutData = column1.add('panel');
                    layoutData.alignChildren = "left";
                    layoutData.orientation = 'column';

                       var layoutTitle = layoutData.add('panel');
                       layoutTitle.alignment = [ScriptUI.Alignment.FILL, ScriptUI.Alignment.TOP];
                       layoutTitle.alignChildren = "left";
                       var layoutTitleGroup = layoutTitle.add('group');
                            layoutTitleGroup.title = layoutTitleGroup.add('statictext', undefined, 'Title:');
                            layoutTitleGroup.title.helpTip = '表題を入力して下さい';
                            layoutTitleGroup.input = layoutTitleGroup.add('edittext {preferredSize: [300, 20], properties: {multiline: false}, text: ""}');

                       var inputSizeGroup = layoutData.add('group');
                            var visualSize = inputSizeGroup.add('panel', undefined,);
                                var visualTitle = $keywords2[0].replace(/W/, '');
                                visualSize.text = /^V$/.test(visualTitle) ? 'Visual size' : visualTitle;
                                var visualInputGroup = visualSize.add('group');

                                    if($HxW) {
                                        var vhGroup = visualInputGroup.add('group');
                                        vhGroup.title = vhGroup.add('statictext', undefined, 'H');
                                        vhGroup.input = vhGroup.add('edittext {preferredSize: [46, 20], properties: {multiline: false}, text: "none"}');
                                        var vwGroup = visualInputGroup.add('group');
                                        vwGroup.title = vwGroup.add('statictext', undefined, 'x  W');
                                        vwGroup.input = vwGroup.add('edittext {preferredSize: [46, 20], properties: {multiline: false}, text: "none"}');
                                    } else {
                                        var vwGroup = visualInputGroup.add('group');
                                        vwGroup.title = vwGroup.add('statictext', undefined, 'W');
                                        vwGroup.input = vwGroup.add('edittext {preferredSize: [46, 20], properties: {multiline: false}, text: "none"}');
                                        var vhGroup = visualInputGroup.add('group');
                                        vhGroup.title = vhGroup.add('statictext', undefined, 'x H');
                                        vhGroup.input = vhGroup.add('edittext {preferredSize: [46, 20], properties: {multiline: false}, text: "none"}');
                                    }

                                    // EVENT
                                    vhGroup.input.addEventListener('focus', function() {
                                        if(this.text == 'none') this.text = '';
                                    });
                                    vhGroup.input.addEventListener('blur', function() {
                                        if(this.text == '') this.text = 'none'
                                    });

                                    // EVENT
                                    vwGroup.input.addEventListener('focus', function() {
                                        if(this.text == 'none') this.text = '';
                                    });
                                    vwGroup.input.addEventListener('blur', function() {
                                        if(this.text == '') this.text = 'none'
                                    });

                            var outerSize = inputSizeGroup.add('panel', undefined, 'Outer size:');
                                var outerTitle = $keywords2[2].replace(/W/, '');
                                outerSize.text = /^O$/.test(outerTitle) ? 'Outer size' : outerTitle;
                                var outerInputGroup = outerSize.add('group');

                                    if($HxW) {
                                        var ohGroup = outerInputGroup.add('group');
                                            ohGroup.title = ohGroup.add('statictext', undefined, 'H');
                                            ohGroup.input = ohGroup.add('edittext {preferredSize: [46, 20], properties: {multiline: false}, text: ""}');
                                        var owGroup = outerInputGroup.add('group');
                                            owGroup.title = owGroup.add('statictext', undefined, 'x  W');
                                            owGroup.input = owGroup.add('edittext {preferredSize: [46, 20], properties: {multiline: false}, text: ""}');
                                    } else {
                                        var owGroup = outerInputGroup.add('group');
                                            owGroup.title = owGroup.add('statictext', undefined, 'W');
                                            owGroup.input = owGroup.add('edittext {preferredSize: [46, 20], properties: {multiline: false}, text: ""}');
                                        var ohGroup = outerInputGroup.add('group');
                                            ohGroup.title = ohGroup.add('statictext', undefined, 'x H');
                                            ohGroup.input = ohGroup.add('edittext {preferredSize: [46, 20], properties: {multiline: false}, text: ""}');
                                    }

                        var horizontalLine1 = layoutData.add('panel');
                        horizontalLine1.alignment = [ScriptUI.Alignment.FILL, ScriptUI.Alignment.TOP];
                        horizontalLine1.orientation = 'column';

                        var loadCSVGroup = layoutData.add('group');
                        loadCSVGroup.alignment = 'right';
                        loadCSVGroup.info = loadCSVGroup.add('statictext {preferredSize: [290, 20], properties: {multiline: false}, text: ""}');
                        loadCSVGroup.exclamation = loadCSVGroup.add('checkbox', undefined, '!');
                        loadCSVGroup.button = loadCSVGroup.add('button', undefined, 'CSV');

                        loadCSVGroup.exclamation.onClick = function() {
                            $exclamation = this.value;
                        };

                        // EVENT
                        loadCSVGroup.button.addEventListener('mousedown', function() {
                            layoutDataObj = readCSV();
                            if(layoutDataObj.data) {
                                changeInputLayoutType(true);
                            } else {
                                changeInputLayoutType(false);
                            }
                        });

                    var settingsGroup = column1.add('group');
                    settingsGroup.alignment = [ScriptUI.Alignment.FILL, ScriptUI.Alignment.TOP];
                    settingsGroup.orientation = 'row';
                    settingsGroup.alignChildren = 'left';

                        // ROW1
                        var settings1 = settingsGroup.add('panel', undefined, 'Settings');
                        settings1.alignment = [ScriptUI.Alignment.FILL, ScriptUI.Alignment.TOP];
                        settings1.alignChildren = 'left';

                            var dobuGroup = settings1.add('group');
                            dobuGroup.margins.top = 7;
                            dobuGroup.title = dobuGroup.add('statictext', undefined, '・Dobu size: ');
                            dobuGroup.title.helpTip = 'ドブの幅 (mm)';
                            dobuGroup.input = dobuGroup.add('edittext {preferredSize: [25, 20], properties: {multiline: false}, text: ""}');
                            dobuGroup.input.text = $dobu;

                            var trimMarkGroup = settings1.add('group');
                            trimMarkGroup.title = trimMarkGroup.add('statictext', undefined, '・Trim mark: ');
                            trimMarkGroup.title.helpTip = 'トンボの有無';
                            trimMarkGroup.box = trimMarkGroup.add('checkbox');
                            trimMarkGroup.box.value = $trimMark;

                            trimMarkGroup.box.onClick = function() {
                                if(this.value) {
                                    trimMarkJpnGroup.enabled = true;
                                } else {
                                    trimMarkJpnGroup.enabled = false;
                                }
                            };

                            var trimMarkJpnGroup = settings1.add('group');
                            trimMarkJpnGroup.title = trimMarkJpnGroup.add('statictext', undefined, '└ JPN style: ');
                            trimMarkJpnGroup.title.helpTip = '日本式トンボ';
                            trimMarkJpnGroup.box = trimMarkJpnGroup.add('checkbox');
                            trimMarkJpnGroup.box.value = $trimMarkJPN;
                            trimMarkJpnGroup.enabled = false;

                            if(trimMarkGroup.box.value) {
                                trimMarkJpnGroup.enabled = true;
                            }

                            var compatible = settings1.add('group');
                            compatible.title = compatible.add('statictext', undefined, '・Compatible: ');
                            compatible.title.helpTip = '互換バージョン'
                            compatible.input = compatible.add('edittext {preferredSize: [29, 20], properties: {multiline: false}, text: ""}');
                            compatible.input.text = $CompatibleVer;

                            var multiArtboards = settings1.add('group');
                            multiArtboards.title = multiArtboards.add('statictext', undefined, '・Multi Artboards ');
                            multiArtboards.title.helpTip = '1つのドキュメントにレイアウトをまとめる';
                            multiArtboards.box = multiArtboards.add('checkbox');
                            multiArtboards.box.value = $multiArtboards;

                            var closeDocGroup = settings1.add('group');
                            closeDocGroup.title = closeDocGroup.add('statictext', undefined, '・Close doc: ');
                            closeDocGroup.title.helpTip = '生成後に保存じて閉じる';
                            closeDocGroup.box = closeDocGroup.add('checkbox');
                            closeDocGroup.box.value = $closeDoc;

                            var colorModeGroup = settings1.add('group');
                            colorModeGroup.cmyk = colorModeGroup.add('radiobutton', undefined, 'CMYK');
                            colorModeGroup.cmyk.helpTip = 'ドキュメントのカラーモード';
                            colorModeGroup.rgb = colorModeGroup.add('radiobutton', undefined, 'RGB');

                            if($colorModeCMYK) {
                                colorModeGroup.cmyk.value = true;
                            } else {
                                colorModeGroup.rgb.value = true;
                            }

                        // ROW2
                        var settings2 = settingsGroup.add('panel', undefined, 'Options');
                        settings2.alignment = [ScriptUI.Alignment.FILL, ScriptUI.Alignment.TOP];
                        settings2.alignChildren = 'left';

                        var layerLockGroup = settings2.add('group');
                        layerLockGroup.margins.top = 7;
                        layerLockGroup.title = layerLockGroup.add('statictext', undefined, '・Layer lock: ');
                        layerLockGroup.title.helpTip = '非編集レイヤーを全てロック';
                        layerLockGroup.box = layerLockGroup.add('checkbox');
                        layerLockGroup.box.value = $layerLock;

                        var displaySizeGroup = settings2.add('group');
                        displaySizeGroup.title = displaySizeGroup.add('statictext', undefined, '・Display size: ');
                        displaySizeGroup.title.helpTip = '寸法を図に明記';
                        displaySizeGroup.box = displaySizeGroup.add('checkbox');
                        displaySizeGroup.box.value = $displaySize;

                        var frameViewGroup = settings2.add('group');
                        frameViewGroup.title = frameViewGroup.add('statictext', undefined, '・Frame: ');
                        frameViewGroup.title.helpTip = '見え寸領域の外をフレームで覆う';
                        frameViewGroup.box = frameViewGroup.add('checkbox');
                        frameViewGroup.box.value = $frameView;

                        var insertTagGroup = settings2.add('group');
                        insertTagGroup.title = insertTagGroup.add('statictext', undefined, '・Tag: ');
                        insertTagGroup.title.helpTip = 'レイアウト情報タグを挿入';
                        insertTagGroup.box = insertTagGroup.add('checkbox');
                        insertTagGroup.box.value = $insertTag;

                        var numberringGroup = settings2.add('group');
                        numberringGroup.title = numberringGroup.add('statictext', undefined, '・Numbering: ');
                        numberringGroup.title.helpTip = 'ファイル名の先頭に数字を付ける';
                        numberringGroup.box = numberringGroup.add('checkbox');
                        numberringGroup.box.value = $numbering;

                        var visualRectColorTitle = settings2.add('statictext', undefined, '・Visual rect color: ');
                        visualRectColorTitle.helpTip = '見え寸の線の色 (Red, Green, Blue)';
                        var visualRectColorGroup = settings2.add('group');
                        visualRectColorGroup.red = visualRectColorGroup.add('radiobutton', undefined, 'R');
                        visualRectColorGroup.green = visualRectColorGroup.add('radiobutton', undefined, 'G');
                        visualRectColorGroup.blue = visualRectColorGroup.add('radiobutton', undefined, 'B');

                        switch($visualRectColor) {
                            case 'red':
                                visualRectColorGroup.red.value = true;
                                break;
                            case 'green':
                                visualRectColorGroup.green.value = true;
                                break;
                            case 'blue':
                                visualRectColorGroup.blue.value = true;
                                break;
                            default:
                        }

                    // ROW3
                    var settings3 = settingsGroup.add('panel', undefined, 'Footer stamp');
                    settings3.alignment = [ScriptUI.Alignment.FILL, ScriptUI.Alignment.TOP];
                    settings3.alignChildren = 'left';

                        var dateStampGroup = settings3.add('group');
                        dateStampGroup.margins.top = 8;
                        var dateStampBox = dateStampGroup.add('checkbox', undefined, 'Date');
                        dateStampBox.helpTip = '日付を記入';
                        dateStampBox.value =  $dateStamp;

                        var ratioStampGroup = settings3.add('group');
                        var ratioStampBox = ratioStampGroup.add('checkbox', undefined, 'Ratio');
                        ratioStampBox.helpTip = '高さと幅の比率を記入';
                        ratioStampBox.value = $ratioStamp;

                        var squareStampGroup = settings3.add('group');
                        var squareStampBox = squareStampGroup.add('checkbox', undefined, 'Square');
                        squareStampBox.value = $squareStamp;
                        squareStampBox.helpTip = '平米数を記入'

                        var freeTextGroup = settings3.add('group');
                        freeTextGroup.input = freeTextGroup.add('edittext {preferredSize: [80, 20], properties: {multiline: false}, text: ""}');
                        freeTextGroup.input.helpTip = '記入文字の記入'
                        freeTextGroup.input.text = $freeTextStamp;

                var horizontalLine2 = column1.add('panel');
                horizontalLine2.alignment = [ScriptUI.Alignment.FILL, ScriptUI.Alignment.TOP];
                horizontalLine2.orientation = 'column';

                var saveLocation = column1.add('panel');
                saveLocation.alignment = [ScriptUI.Alignment.FILL, ScriptUI.Alignment.TOP];
                saveLocation.orientation = 'row';
                saveLocation.alignChildren = 'left';
                saveLocation.button = saveLocation.add('button', undefined, 'Save location');
                saveLocation.button.helpTip = '書き出し保存する場所';
                saveLocation.path = saveLocation.add('statictext {characters: 26, properties: {multiline: false}}');
                saveLocation.path.text = $outputPath;

                // EVENT
                saveLocation.button.addEventListener("click", function() {
                    var path = Folder.selectDialog("保存先フォルダの選択");
                    if(path) saveLocation.path.text = $outputPath = decodeURI(path);
                });

                var horizontalLine3 = column1.add('panel');
                horizontalLine3.alignment = [ScriptUI.Alignment.FILL, ScriptUI.Alignment.TOP];
                horizontalLine3.orientation = 'column';

                var action = column1.add('group');
                action.buttonCancel = action.add('button', undefined, 'Cancel');
                action.buttonOK = action.add('button', undefined, 'Run');

                // EVENT
                action.buttonOK.addEventListener('click', function() {
                    if(!loadCSVGroup.info.text) {
                        createInputLayoutData();
                    }
                    if(docData.get.layoutsData()) {
                        w.close();
                    } else {
                        alert('レイアウト情報を入力してください');
                    }
                    ready = setDefaultSettings();
                 });

                 action.buttonCancel.addEventListener('click', function() {
                    w.close();
                    return false;
                 });

            // COLUMN2
            var column2 = main.add('group');
            column2.alignment = [ScriptUI.Alignment.FILL, ScriptUI.Alignment.TOP];
            column2.orientation = "column";

                var converter = column2.add('panel', undefined, 'Converter');
                converter.alignment = [ScriptUI.Alignment.FILL, ScriptUI.Alignment.TOP];
                converter.orientation = 'column';
                converter.alignChildren = 'left';
                converter.spacing = 5;

                    var fileLocationGroup = converter.add('group');
                    fileLocationGroup.orientation = 'column';
                    fileLocationGroup.alignChildren = 'left';
                    fileLocationGroup.margins.top = 7;
                    fileLocationGroup.margins.bottom = 3;
                    fileLocationGroup.button = fileLocationGroup.add('button', undefined, 'Layout folder');
                    fileLocationGroup.button.helpTip = 'レイアウトファイルのある場所'
                    fileLocationGroup.subFolder = fileLocationGroup.add('checkbox', undefined, 'Sub folder');
                    fileLocationGroup.subFolder.helpTip = 'サブディレクリ内も含める'

                    fileLocationGroup.button.addEventListener('click', function() {
                        var path = Folder.selectDialog("レイアウトフォルダの選択");
                        if(path) setConvertSettings(path);
                    });

                    fileLocationGroup.subFolder.onClick = function() {
                        if(docData.get.converter.files()) {
                            setConvertSettings(docData.get.converter.path())
                        }
                    };

                    var fileDataGroup = converter.add('panel');
                    fileDataGroup.margins.top = 8;
                    fileDataGroup.spacing = 8;
                    fileDataGroup.alignment = [ScriptUI.Alignment.FILL, ScriptUI.Alignment.TOP];
                    fileDataGroup.orientation = 'column';
                    fileDataGroup.alignChildren = 'left';

                        var countGroup = fileDataGroup.add('group');
                        countGroup.title = countGroup.add('statictext', undefined, 'Count: -');
                        countGroup.title.helpTip = '見つかったレイアウトの数'
                        countGroup.title.characters = 10;

                        var squareGroup = fileDataGroup.add('group');
                        squareGroup.title = squareGroup.add('statictext', undefined, 'Square: -');
                        squareGroup.title.helpTip = '合計平米数'
                        squareGroup.title.characters = 10;

                    var checkboxGroup = converter.add('group');
                    checkboxGroup.alignment = [ScriptUI.Alignment.FILL, ScriptUI.Alignment.TOP];
                    checkboxGroup.margins.top = 10;
                    checkboxGroup.margins.bottom = 5;
                    checkboxGroup.spacing = 5;
                    checkboxGroup.orientation = 'column';
                    checkboxGroup.alignChildren = 'left';

                    var outline = checkboxGroup.add('checkbox', undefined, 'Outline');
                    outline.helpTip = '文字のアウトライン化';
                    var collectLink = checkboxGroup.add('checkbox', undefined, 'Collect Link img');
                    collectLink.helpTip = 'リンクされた画像を配下にコピー & リンク先をそこに変更';
                    var embed = checkboxGroup.add('checkbox', undefined, 'Embed image');
                    embed.helpTip = 'リンク画像を埋め込み';
                    var outputPDF = checkboxGroup.add('checkbox', undefined, 'Export PDF');
                    outputPDF.helpTip = 'PDFファイルを書き出す'
                    var finalize = checkboxGroup.add('checkbox', undefined, 'Finalize');
                    finalize.helpTip = '「入稿時削除」レイヤーを削除する';
                    var outputEPS = checkboxGroup.add('checkbox', undefined, 'Export EPS');
                    outputEPS.helpTip = 'EPSを書き出す';

                    var horizontalLine4 = converter.add('panel');
                    horizontalLine4.alignment = [ScriptUI.Alignment.FILL, ScriptUI.Alignment.TOP];
                    horizontalLine4.orientation = 'column';

                    var saveTypeGroup = converter.add('group');
                    saveTypeGroup.margins.top = 5;
                    saveTypeGroup.margins.bottom = 5;
                    saveTypeGroup.spacing = 5;
                    saveTypeGroup.orientation = 'column';
                    saveTypeGroup.alignChildren = 'left';
                    var copy = saveTypeGroup.add('radiobutton', undefined, 'Save a copy');
                    copy.helpTip = 'コピーして保存（元ファイルに変更を加えない)';
                    copy.value = true;
                    var overwrite = saveTypeGroup.add('radiobutton', undefined, 'Overwrite file');
                    overwrite.helpTip = '元ファイルを上書き保存';
                    var horizontalLine5 = converter.add('panel');
                    horizontalLine5.alignment = [ScriptUI.Alignment.FILL, ScriptUI.Alignment.TOP];
                    horizontalLine5.orientation = 'column';

                    var executeButtonGroup = converter.add('group');
                    executeButtonGroup.margins.top = 10;
                    executeButtonGroup.alignment = [ScriptUI.Alignment.FILL, ScriptUI.Alignment.TOP];
                    executeButtonGroup.orientation = 'column';
                    var executeButton = executeButtonGroup.add('button', undefined, 'Execute');
                    executeButton.alignment = 'center';
                    executeButton.enabled = false;

                    executeButton.addEventListener('click', function() {
                        w.close();
                        converteLayouts({
                            outline: outline.value,
                            collectLinkImage: collectLinkImage.value,
                            embed: embed.value,
                            pdf: outputPDF.value,
                            finalize: finalize.value,
                            eps: outputEPS.value,
                            saveCopy: copy.value
                        });
                    });

            w.show();
            return ready;

            function readCSV() {
                var read;
                if(read = File.openDialog('CSVファイルを選択', '*.csv')) {
                    var fileData = new File(read);
                    return {
                        inputType: 'csv',
                        name: read.name.replace(/\.csv$/, ''),
                        path: read.path,
                        data: convertLayoutsData(moldingCSV(fileData))
                    };
                }
                return false;

                function moldingCSV(data) {
                     if(!data.open('r')) return false;
                     var layoutsData = [];
                     var csvData = data.read();
                     csvData = csvData.replace(/\n+$/g, '').split('\n');
                     csvData.forEach(function(e) {
                        layoutsData.push(e.split(','));
                     });
                     return layoutsData;
                }
            }

            function convertLayoutsData(csv) {

                var keywords = (function(keys1, keys2) {
                    var array = [];
                    var allKeys = keys1.concat(keys2);
                    allKeys.forEach(function(e) {
                        e = e.replace(/\s/g, '');
                        array.push(new RegExp('^(\\{.*\\})?' + e + '$'));
                    });
                    return array;
                })($keywords1, $keywords2);

                var collectedKeywords = (function(csv) {
                    var array = [];
                    csv[0].forEach(function(v, i) {
                        v = zenkakuToHankaku(v);
                        keywords.forEach(function(key){
                            if(key.test(v)) {
                                var obj = {};
                                var color;
                                if(color = getColorOption(v)) {
                                    obj.name = color.fixName;
                                    obj.color = color.val;
                                } else {
                                    obj.name = v;
                                }
                                obj.index = i;
                                array.push(obj);
                            };
                        });
                    });
                    return array;
                })(csv);

                var completeLayoutData = (function() {
                    var count = 0;
                    var layouts = [];
                    return {
                        create: function(index, c) {
                            count = c;
                            var obj = {
                                num: index,
                                names: [
                                    null,
                                    null,
                                    null,
                                    null,
                                    null
                                ],
                                size: {
                                    vw: {},
                                    vh: {},
                                    ow: {},
                                    oh: {}
                                },
                                dobu: null,
                                text: [],
                                sheet: null,
                                folder: null
                            };
                            layouts[count] = obj;
                        },
                        set: function(type, param) {

                            (function() {
                                var localColor;
                                if(localColor = getColorOption(param.val)) {
                                    param.val = localColor.fixName;
                                    param.color = localColor.val;
                                }
                            })();

                            switch(type) {
                                case 'name':
                                    layouts[count].names[param.index] = {
                                        text: param.val || null,
                                        color: param.color ? param.color : null
                                    };
                                    break;
                                case 'text':
                                    layouts[count].text[param.index] = {
                                        text: param.val || null,
                                        color: param.color ? param.color : null 
                                    };
                                    break;
                                case 'size':
                                    if(param.type == 'vw' || param.type == 'vh') {
                                        var shiftPosKey = getShiftPosition(param.val);
                                        if(shiftPosKey) {
                                            param.val = shiftPosKey.fixVal;
                                            layouts[count].size[param.type].pos = shiftPosKey.posObj;
                                        }
                                    }
                                    if(param.type == 'ow' || param.type == 'oh') {
                                        if(setStandardSize(param)) break;
                                    }
                                    layouts[count].size[param.type].val = normalizeSizeVal(param.val);
                                    layouts[count].size[param.type].pt = mmToPt(param.val);
                                    break;
                                case 'dobu':
                                    layouts[count].dobu = (param.val == '') ? mmToPt($dobu) : mmToPt(param.val);
                                    break;
                                case 'folder':
                                    layouts[count].folder = param.val;
                                    break;
                                case 'sheet':
                                    layouts[count].sheet = param.val || null;
                                    break;
                                default:
                            }
                        },
                        get: function() {
                            return layouts;
                        },
                        validate: function() {
                            var error = [];
                            if(layouts.length == 0) {
                                alert('レイアウトデータが見つかりません。');
                                return false;
                            }
                            for(var i = 1, l = layouts.length; i < l; i++) {
                                var layout = layouts[i];
                                var errorPrefix = (docData.get.inputType() == 'input') ? "入力項目: "  :  "csv " + (i + 1) + "行目: " ;
                                if(!hasName(layout.names)) error.push(errorPrefix + " 名前 項目が見つかりません。");
                                if(!layout.size.ow.val)  error.push(errorPrefix + "「" + $keywords2[2] + "」項目が見つかりません。");
                                if(!layout.size.oh.val)  error.push(errorPrefix + "「" + $keywords2[3] + "」項目が見つかりません。");
                                if(layout.size.vw.val !== null && layout.size.vh.val == null) error.push(errorPrefix +  "「" + $keywords2[1] + "」項目が見つかりません。");
                                if(layout.size.vh.val !== null && layout.size.vw.val == null) error.push(errorPrefix + "「" + $keywords2[0] + "」項目が見つかりません。");
                                if(layout.size.ow.val && layout.size.vw.val !== null && (layout.size.vw.val > layout.size.ow.val)) error.push(errorPrefix + "「" + $keywords2[0] + "」の数値が「" + $keywords2[2] + "」よりも大きいです。");
                                if(layout.size.oh.val && layout.size.vh.val !== null && (layout.size.vh.val > layout.size.oh.val)) error.push(errorPrefix + "「" + $keywords2[1]　+ "」の数値が「" + $keywords2[3] + "」よりも大きいです。");
                            }
                            if(error.length == 0) return true;
                            alert(error.join("\n"));
                            return false;
                        }
                    }

                    function setStandardSize(param) {
                        if(typeof param.val == 'number') return false;
                        if(param.val == '') return true;
                        if(param.val in $standardSize) {
                            var h, w;
                            switch(param.type) {
                                case 'ow':
                                    w = $standardSize[param.val].h;
                                    h = $standardSize[param.val].w;
                                    break;
                                case 'oh':
                                    w = $standardSize[param.val].w;
                                    h = $standardSize[param.val].h
                                    break;
                            }
                            layouts[count].size['ow'].val = normalizeSizeVal(w);
                            layouts[count].size['ow'].pt = mmToPt(w);
                            layouts[count].size['oh'].val = normalizeSizeVal(h);
                            layouts[count].size['oh'].pt = mmToPt(h);
                            return true;
                        }
                        return false;
                    }

                    function normalizeSizeVal(str) {
                        if(typeof str == 'number') return str;
                        if(str == '') return null;
                        var _str = zenkakuToHankaku(str);
                        _str = _str.replace(/[^\d]/g, '');
                        return parseInt(_str);
                    }

                    function hasName(names) {
                        for(var i = 0, l = names.length; i < l; i++) {
                            if(names[i] == null) continue;
                            var nameObj = names[i];
                           for(var key in nameObj) {
                             if(nameObj.name !== '') return true;
                           }
                        }
                        return false;
                    }
                })();

                for(var i = 1, count = 1, l = csv.length; i < l; i++, count++) {
                    var line = csv[i];
                    if(isSkipLayout(line)) {
                        count--;
                        continue;
                    };
                    completeLayoutData.create(i, count);
                    line.forEach(function(val, valIndex) {
                        collectedKeywords.forEach(function(key) {
                            if(valIndex !== key.index) return;
                            if(/^!/.test(val)) val = val.replace('!', '');
                            switch(key.name) {
                                case $keywords1[0]:
                                    completeLayoutData.set('name', {val: val, color: key.color, index: 0});
                                    break;
                                case $keywords1[1]:
                                    completeLayoutData.set('name', {val: val, color: key.color, index: 1});
                                    break;
                                case $keywords1[2]:
                                    completeLayoutData.set('name', {val: val, color: key.color, index: 2});
                                    break;
                                case $keywords1[3]:
                                    completeLayoutData.set('name', {val: val, color: key.color, index: 3});
                                    break;
                                case $keywords1[4]:
                                    completeLayoutData.set('name', {val: val, color: key.color, index: 4});
                                    break;
                                case $keywords1[5]:
                                    completeLayoutData.set('name', {val: val, color: key.color, index: 5});
                                    break;
                                case $keywords1[6]:
                                    completeLayoutData.set('text', {val: val, color: key.color, index: 0});
                                    break;
                                case $keywords1[7]:
                                    val = val ? '※' + val : val;
                                    completeLayoutData.set('text', {val: val, color: key.color, index: 1});
                                    break;
                                case $keywords1[8]:
                                    completeLayoutData.set('text', {val: val, color: key.color, index: 2});
                                    break;
                                case $keywords1[9]:
                                    completeLayoutData.set('text', {val: val, color: key.color, index: 3});
                                    break;
                                case $keywords1[10]:
                                    completeLayoutData.set('text', {val: val, color: key.color, index: 4});
                                    break;
                                case $keywords1[11]:
                                     completeLayoutData.set('text', {val: val, color: key.color, index: 5});
                                    break;
                                case $keywords1[12]:
                                    completeLayoutData.set('sheet', {val: val});
                                    break;
                                case $keywords1[13]:
                                    completeLayoutData.set('folder', {val: val});
                                    break;
                                case $keywords2[0]:
                                    completeLayoutData.set('size', {type: 'vw', val: val});
                                    break;
                                case $keywords2[1]:
                                    completeLayoutData.set('size', {type: 'vh', val: val});
                                    break;
                                case $keywords2[2]:
                                    completeLayoutData.set('size', {type: 'ow', val: val});
                                    break;
                                case $keywords2[3]:
                                    completeLayoutData.set('size', {type: 'oh', val: val});
                                    break;
                                case $keywords2[4]:
                                    completeLayoutData.set('dobu', {val: val});
                                    break;
                                default:
                            }
                        });
                    });
                }
                if(!completeLayoutData.validate()) return false;

                return completeLayoutData.get();

                function isSkipLayout(line) {
                    if($exclamation) {
                        return /^(?!!)/.test(line[0]);
                    } else {
                        return /^!/.test(line[0]);
                    }
                }

                function getColorOption(str) {
                    var obj = {};
                    for(var key in $colorOptions) {
                        if(str.indexOf(key) > -1) {
                            obj.fixName = str.replace(key, "");
                            obj.val = $colorOptions[key];
                            return obj;
                        }
                    }
                    return null;
                }

                function getShiftPosition(str) {
                    var obj = {};
                    var str = str.replace(/\s/, '');
                    str = zenkakuToHankaku(str);
                    var keys = str.match(/(\d+)(?:(?:\(|（)(?:(上|下|右|左)(\d+))(?:\)|）))/);
                    if(!keys) return;
                    var direction = keys[2];
                    var shiftVal = mmToPt(keys[3]);
                    var fixVal = keys[1];
                    if(direction && shiftVal !== null) {
                        var key;
                        switch(direction) {
                            case '上':
                                obj.top = shiftVal;
                                break;
                            case '下':
                                obj.bottom = shiftVal;
                                break;
                            case '左':
                                obj.left = shiftVal;
                                break;
                            case '右':
                                obj.right = shiftVal;
                                break;
                            default:
                        }
                        return {
                            fixVal: fixVal,
                            posObj: obj
                        }
                    }
                }
            }

            function createInputLayoutData() {
                docData.set.inputType('input');
                var array = [
                    [$keywords1[0], 'VH', 'VW', 'OH', 'OW']
                ];
                var title = (layoutTitleGroup.input.text == '') ? 'NO NAME' : layoutTitleGroup.input.text;
                var vh = (vhGroup.input.text == 'none') ? '' : vhGroup.input.text;
                var vw = (vwGroup.input.text == 'none') ? '' : vwGroup.input.text;
                var oh = ohGroup.input.text;
                var ow = owGroup.input.text;
                array.push([title, vh, vw, oh, ow]);
                docData.set.data({
                    name: 'GENERATED',
                    data: convertLayoutsData(array),
                    path: $outputPath
                });
                return true;
            }

            function changeInputLayoutType(flag) {
                if(flag) {
                    docData.set.inputType('csv');
                    loadCSVGroup.info.text = '・' + layoutDataObj.name + '.csv > Layout x ' + (layoutDataObj.data.length - 1);
                    loadCSVGroup.info.graphics.foregroundColor = w.graphics.newPen(w.graphics.PenType.SOLID_COLOR, [0.4, .8, 0],1);
                    layoutTitle.enabled = false;
                    inputSizeGroup.enabled = false;
                    docData.set.data(layoutDataObj);
                    saveLocation.path.text = $outputPath = decodeURI(docData.get.csvPath());
                } else {
                    docData.set.inputType(null);
                    loadCSVGroup.info.text = '';
                    layoutTitle.enabled = true;
                    inputSizeGroup.enabled = true;
                    docData.set.data(layoutDataObj = '');
                    saveLocation.path.text = $outputPath;
                }
            }

            function setDefaultSettings() {
                $dobu = dobuGroup.input.text;
                $numbering = numberringGroup.box.value;
                $displaySize = displaySizeGroup.box.value;
                $trimMark = trimMarkGroup.box.value;
                $layerLock = layerLockGroup.box.value;
                $insertTag = insertTagGroup.box.value;
                $compatibleVer = compatible.input.text;
                $colorModeCMYK = colorModeGroup.cmyk.value ? true : false;
                $visualRectColor = getVisualRectColor();
                $dateStamp = dateStampBox.value;
                $squareStamp = squareStampBox.value;
                $ratioStamp = ratioStampBox.value;
                $freeTextStamp = freeTextGroup.input.text;
                $frameView = frameViewGroup.box.value;
                $closeDoc = closeDocGroup.box.value;
                $multiArtboards = multiArtboards.box.value;
                return true;
            }

            function getVisualRectColor() {
                if(visualRectColorGroup.red.value) {
                    return 'red';
                } else if (visualRectColorGroup.green.value) {
                    return 'green';
                } else if (visualRectColorGroup.blue.value) {
                    return 'blue';
                }
            }

            function getAllSquare(files) {
                var squareAll = 0;
                files.forEach(function(e) {
                    var h = e.name.match(/H(\d{2,5})/)[1];
                    var w = e.name.match(/W(\d{2,5})/)[1];
                    squareAll += getSquare(w, h);
                });
                return squareAll;
            }

            function resetLayoutData() {
                fileDataGroup.graphics.backgroundColor = w.graphics.newBrush(w.graphics.BrushType.SOLID_COLOR, [0.3, 0.3, 0.3]);
                fileLocationGroup.button.helpTip = path.name;
                countGroup.title.text = 'Count: -';
                squareGroup.title.text = 'Square: -';
                executeButton.enabled = false;
                docData.set.converter.path(null);
                docData.set.converter.files(null);
            }

            function updateLayoutData(path, files) {
                fileDataGroup.graphics.backgroundColor = w.graphics.newBrush(w.graphics.BrushType.SOLID_COLOR, [0.2, 0.3, 0.5]);
                fileLocationGroup.button.helpTip = path.name;
                countGroup.title.text = 'Count: ' + files.length;
                squareGroup.title.text = 'Square: ' + getAllSquare(files) + '㎡';
                executeButton.enabled = true;
                docData.set.converter.path(path);
                docData.set.converter.files(files);
            }

            function setConvertSettings(path) {
                var aiFiles = [];
                if(fileLocationGroup.subFolder.value) {
                    getAllAiFiles(path);
                } else {
                    aiFiles = path.getFiles('*.ai');
                }
                if(!aiFiles.length) {
                    resetLayoutData();
                    return false;
                }
                updateLayoutData(path, aiFiles);

                function getAllAiFiles(path) {
                    var list = path.getFiles();
                    if(list.length == 0) return;
                    list.forEach(function(e) {
                        if(e.constructor.name == 'Folder') {
                            getAllAiFiles(e);
                        } else if(/\.ai$/.test(e.name)) {
                            aiFiles.push(e);
                        }
                    });
                }
            }
        }

        //================
        // Run
        //================

        if(openSettings()) {
            generateLayout(docData.get.layoutsData());
        };

        // $.writeln("===< " + '--' + " ms >===");

})();

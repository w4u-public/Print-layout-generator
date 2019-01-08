# 印刷レイアウトジェネレータ 
印刷物をイラストレーターで入稿する際、タイトルや寸法情報などを手動で記述するのは大変骨の折れる作業です。1つのレイアウトだけならまだしも、発注書の情報通りに数十、数百のレイアウトを手作業で作っていては思わぬミスが起こりかねません。

このスクリプトは、そのような慎重さの必要なつまらない単純作業から製作者を開放します。レイアウトデータはCSVの情報通りに生成されます。生成されたデータは、どのような寸法であってもA4比率のキャンバスに収められ、タイトルや付属情報、ファイル名まで統一されたフォーマットにすることができます。

また、生成されたファイルを一括で入稿ファイル化、リンク画像の収集・埋め込み、PDFの出力、などができるコンバート機能も備えています。

![image](https://raw.githubusercontent.com/w4u-public/Print-layout-generator/images/image001.gif)


## 概要

サイズ等の記入されたCSV情報を元に、印刷の下地となるレイアウトを統一フォーマットで自動生成するスクリプトです。
コンバート機能により、生成したレイアウトデータをアウトライン化、PDF化、入稿用ファイル化、画像データのリンク収集などが一括で行えます。


## 使用方法


Illustratorを起動し、「ファイル > スクリプト > その他のスクリプト」にて、print-layout-generator.jsxを読み込みます。

以下の場所にスクリプトファイルを保存することで、スクリプトのメニューに追加することもできます。

```アプリケーション/Adobe Illustrator (バージョン名)/Presets/ja_JP/スクリプト/```


## 機能

スクリプトを起動すると以下のメニューが表れます。
メニューは大きく左右に分かれており、レイアウト生成用のジェネレーターメニューと、生成レイアウトを一括変換するためのコンバートメニューで構成されます。

![image](https://raw.githubusercontent.com/w4u-public/Print-layout-generator/images/image002.png)


### 1.マニュアル生成

![image](https://raw.githubusercontent.com/w4u-public/Print-layout-generator/images/image003.png)

レイアウトのタイトルと寸法を記入して1つのレイアウトデータを生成します。後述するCSV生成では、CSVの情報から複数のレイアウトデータを自動生成できますが、こちらは1つだけ簡易的に作りたい場合に利用します。

### 2.CSVからの生成

![image](https://raw.githubusercontent.com/w4u-public/Print-layout-generator/images/image004.png)

#### キーワード項目


CSVからレイアウトを生成する場合は、スクリプトはCSVの1行目から__キーワード項目__(後述)を探し出し、見つかった項目列の情報を元に名前や寸法等をレイアウト情報として使用します。

レイアウトを生成するには、__最低限「名前」「OH」「OW」の３つのキーワード項目が必要__になります。以下は最低限の情報で構成されたCSVの内容になります。(OHは高さ Outer Height, OWは幅 Outer Widthを表します。このキーワード名は変更することが出来ます)

| 名前 | OH | OW |
|:-:|:-:|:-:|
|  Qiita様 納品用ポスターA |  550 |  350 |
|  Qiita様 納品用ポスターB |  800 |  300 |
|  Qiita様 納品用ステッカー・シール | 300  |  300 |

上記「最低限必要な項目.csv」ファイルをCSVボタンより読み込むと、データに不備が無ければ次の画像のようにCSVファイル名とレイアウト数が表示されます。RUNボタンを押すと実行されます。(セッティングやオプションメニューは後述します)

![image](https://raw.githubusercontent.com/w4u-public/Print-layout-generator/images/image005.png)

以下がもっともシンプルな情報で生成されたレイアウトデータになります。

![image](https://raw.githubusercontent.com/w4u-public/Print-layout-generator/images/image006.png)

CSV情報の通り、3つのレイアウトファイルがフォルダとともに生成されました。

![image](https://raw.githubusercontent.com/w4u-public/Print-layout-generator/images/image007.png)

#### キーワード項目の種類

スクリプトはキーワード項目をCSVの１行目から探し、見つけるとその列の情報を決められた位置に表記します。__キーワードの出現する順番は関係ありません。また、キーワード以外の項目があっても構いません__。

![image](https://raw.githubusercontent.com/w4u-public/Print-layout-generator/images/image008.png)

上記のCSVは下のレイアウトを出力します。

![image](https://raw.githubusercontent.com/w4u-public/Print-layout-generator/images/image009.png)

##### タイトル・キーワード

レイアウトのタイトル表記とファイル名に使用されます。「名前」と「名前1」~「名前5」があり、これらは番号の少ない順に連結されて１つのタイトルになります。全部使用する必要は無く、例えばタイトルにカテゴリー名などを入れる場合に使用します。

| キーワード項目名 |特殊|
|:-:|:-:|
| 名前 | 必須 |
| 名前1  | 省略可 |
| 名前2  | 省略可 |
| 名前3 | 省略可 |
| 名前4  | 省略可 |


##### テキスト・キーワード

| キーワード項目名 | 説明 |特殊|
|:-:|:--|:--|
| 概要  |  名前の下に挿入される文字 |-|
| テキスト1  |  概要の下に挿入される文字 その1 | タグに挿入 |
| テキスト2  |  概要の下に挿入される文字 その2 | タグに挿入 |
| テキスト3 |  レイアウト枠の下中央に挿入される文字 | - |
| テキスト4  | アートボード右上に挿入される文字 | ファイル名に挿入 |
| テキスト5  | アートボード右下に挿入される文字 | - |


##### サイズ・キーワード

印刷業界の寸法を表す用語は会社によってまちまちです。スクリプトでは記入の簡易さから、以下のキーワードを使用しています。これらのキーワードは任意のものに変更可能です。

| キーワード項目名 | 意味 | 説明 |
|:-:|:-:|:--|
| VH  | Visual Height  |  見え寸、内寸, 有効表示寸法などと呼ばれる表示される領域の高さの寸法 |
| VW  | Visual Width  |  同上、幅の寸法 |
|  OH | Outer Height  |  外寸, カット寸, 板寸, 仕上がり寸法などと呼ばれる出力の実際のサイズの高さの寸法 |
| OW |  Outer Width | 同上、幅の寸法  |
|  ドブ |    | 塗り足し, 裁ち落としと呼ばれる、仕上がり寸法の外に伸びる領域 |


##### 規格サイズキーワード

レイアウトのサイズは数値による指定以外に、規格サイズでの指定が可能です。下の画像のように、「OH」と「OW」のどちらかに規格サイズキーワードを記述することで、縦型・横型が判定されます。

![image](https://raw.githubusercontent.com/w4u-public/Print-layout-generator/images/image010.png)

規格サイズキーワードは
A0 ~ A10, B0 ~ B9まで用意されています。


##### 接頭着色キーワード

タイトル・キーワードとテキスト・キーワードは、接頭キーワードで着色することができます。1行目に使用すると、すべてのレイアウトに反映されます。個別に使用することもできます。

| 接頭着色キーワード名 | 説明 |
|:-:|:-:|
|  {R} | 文字を赤色に着色  |
| {G}  | 文字を緑色に着色  |
| {B}  | 文字を青色に着色  |

![image](https://raw.githubusercontent.com/w4u-public/Print-layout-generator/images/image011.png)

上記の場合、{R}は１行目の項目に記入されているので、2つのファイルの名前項目は赤に着色されます。{B}は１つめのレイアウトの「テキスト1」の内容を青鬼着色し、{G}は２つめのレイアウトの「名前2」の内容を緑に着色します。

##### その他のキーワード


| キーワード項目名 |特殊|
|:-:|:--|
| フォルダ | 指定した名前のフォルダを生成してファイルをそこに保存する |
|枚数|出力枚数などを表記する|
|!|生成スキップ (１列目の先頭に記入)|

![image](https://raw.githubusercontent.com/w4u-public/Print-layout-generator/images/image012.png)

##### 枚数の表記

![image](https://raw.githubusercontent.com/w4u-public/Print-layout-generator/images/image013.png)

↑タイトルの右に枚数が表記されます。

##### フォルダへ保存

![image](https://raw.githubusercontent.com/w4u-public/Print-layout-generator/images/image014.png)

↑レイアウトファイルは指定したフォルダに保存されます。


##### 生成スキップ

１列目のセル内の先頭に「!」を付けると、スクリプトはその行をスキップしてレイアウトを生成しません。制作が保留になっているものや、生成の必要のない行に使用できます。

![image](https://raw.githubusercontent.com/w4u-public/Print-layout-generator/images/image015.png)

メニューのCSV読み込みの横にある「!」チェックボックスにチェックを入れると、「!」のついたスキップ行だけを生成します。生成を保留していた行をすべて書き出す場合や、膨大なデータのうち、「!」を付けた行だけを生成したい場合などに使用できます。

![image](https://raw.githubusercontent.com/w4u-public/Print-layout-generator/images/image016.png)



##### 特筆事項

先に書いた通り、キーワード項目の記述位置は関係なく、また、キーワード以外の項目があっても問題ありません。
例えば、__以下の３つのCSVファイルは、同一のレイアウトファイルを生成します__。

![image](https://raw.githubusercontent.com/w4u-public/Print-layout-generator/images/image017.png)

↑素直な記述。

![image](https://raw.githubusercontent.com/w4u-public/Print-layout-generator/images/image018.png)

↑順序がバラバラでも、名前は番号の少ない順から連結されます。他のキーワード項目も記述位置は関係ありません。

![image](https://raw.githubusercontent.com/w4u-public/Print-layout-generator/images/image019.png)

↑キーワード以外のデータが混入していても、レイアウト生成に影響はありません。


##### 発注データからのレイアウト生成

例として、発注データをエクセルでやり取りしている場合、レイアウトの生成に必要な項目を選び出してキーワード項目に改変し、そのままレイアウトデータを生成するといった使用法があります。

以下のような発注書のデータの場合、必要なデータ列の項目を選び、キーワード項目に置き換えます。

![image](https://raw.githubusercontent.com/w4u-public/Print-layout-generator/images/image020.png)

生成に必要な項目と、表記したい内容の項目名をキーワード項目に編集します。濃い赤は編集した項目、薄い赤は新規に挿入した項目になります。

![image](https://raw.githubusercontent.com/w4u-public/Print-layout-generator/images/image021.png)

出力結果は下のようになります。（１枚だけ掲載）

![image](https://raw.githubusercontent.com/w4u-public/Print-layout-generator/images/image022.png)
CSV情報の通り、6つのレイアウトが出力されました。

![image](https://raw.githubusercontent.com/w4u-public/Print-layout-generator/images/image023.png)

## Settings menu
生成するレイアウトの基本設定を操作するメニューです。生成するレイアウト全てに有効になります。

![image](https://raw.githubusercontent.com/w4u-public/Print-layout-generator/images/image024.png)

| 項目名| 説明 |
|:-:|:--|
|  Dobu size | 基本のドブサイズ  |
| Trim mark  | トリムマーク、トンボを付ける  | 
| ┗ JPN style | 日本式トンボにする  | 
|Compatible|保存するIllustratorのバージョン|
|Multi Artboards|レイアウトを１つのファイルの複数のアートボードにまとめる|
|Close doc|生成後にファイルを閉じる|
|CMTYK or RGB|カラーモードの指定|

### Trim mark : JPN style
トリムマークの種類

![image](https://raw.githubusercontent.com/w4u-public/Print-layout-generator/images/image025.png)

### Multi artboards
マルチアートボードをONにすると、１つのファイル内にアートボードとして複数のレイアウトをまとめて生成します。

![image](https://raw.githubusercontent.com/w4u-public/Print-layout-generator/images/image026.png)

## Options

![image](https://raw.githubusercontent.com/w4u-public/Print-layout-generator/images/image027.png)

| 項目名| 説明 |
|:-:|:--|
| Layer lock  | 非編集レイヤーをロック状態にするか  |
| Display size |  見え寸、外寸の寸法のガイド表記をするか |
| Frame  | 見え寸だけを表示させるフレームレイヤーを追加するか |
|Tag|裁断の際に識別できるタグを挿入するか|
|Numbering| ファイルに番号をつけるか|
|Visual rect color|見え寸領域の枠の色を３色から選ぶ|

### Layer lock
編集の必要の無いレイヤーをロックした状態で生成します。

![image](https://raw.githubusercontent.com/w4u-public/Print-layout-generator/images/image028.png)

### Display size
見え寸(表示寸法)と外寸、その間のサイズを表記します。

![image](https://raw.githubusercontent.com/w4u-public/Print-layout-generator/images/image029.png)

### Frame
見え寸領域だけを表示させるための灰色の額縁の形状をしたレイヤーが追加され、表示確認に利用できます。

![image](https://raw.githubusercontent.com/w4u-public/Print-layout-generator/images/image030.png)

上の画像は、左はフレーム無し、右はフレーム有りの表示です。

![image](https://raw.githubusercontent.com/w4u-public/Print-layout-generator/images/image031.png)

### Numbering
ファイル名にCSVの記述順序で通し番号を付けます。

![image](https://raw.githubusercontent.com/w4u-public/Print-layout-generator/images/image032.png)

## Footer Stamp

![image](https://raw.githubusercontent.com/w4u-public/Print-layout-generator/images/image033.png)

| 項目名| 説明 |
|:-:|:--|
|Date|生成日を表記|
|Ratio|見え寸の比率を表記|
|Square|平米数を表記|
|空欄|入力した文字をフッターに表記|

![image](https://raw.githubusercontent.com/w4u-public/Print-layout-generator/images/image034.png)

## コンバート機能
コンバート機能は、スクリプトによって生成したファイルを一括で処理するのに使用します。
「Layout folder」で指定したフォルダ内のaiファイルにチェックボックスをONにした処理を適用します。

![image](https://raw.githubusercontent.com/w4u-public/Print-layout-generator/images/image035.png)

| 項目名 | 説明 |
|:-:|:--|
|  Outline |  テキストをアウトライン化 |
|  Collect Link img |  リンク画像を全て同一フォルダにコピーする |
|Embed image|リンク画像を埋め込む|
|Export PDF|PDFを書き出す|
|Finilize|印刷に必要のないレイヤーを全て削除する|
|Export EPS|EPSファイルを書き出す|
|Save a copy|変換したファイルを別ファイルとして保存|
|Overwrite file|変換したファイルを元ファイルに上書き保存|

チェックされた処理は、上から順に適用されます。
アウトライン化して画像を埋め込んだ後にPDFで書き出してから入稿ファイルを用意する、というような処理が可能です。

![image](https://raw.githubusercontent.com/w4u-public/Print-layout-generator/images/image036.png)

上記フォルダを読み込み、「Excute」ボタンを押すと、以下の通り処理を適用したファイルを出力します。

![image](https://raw.githubusercontent.com/w4u-public/Print-layout-generator/images/image037.png)

## デフォルト設定、キーワード項目の編集

スクリプトの初期設定やキーワードは、スクリプトファイルをテキストエディター等で開いて簡単に調整できるようになっています。

### メニュー項目のデフォルト設定

スクリプト起動時に表示されるセッティングの初期状態を編集できます。
「true」は「ON」、「false」は「OFF」を表します。よく使う設定であれば、この初期設定を指定すると便利です。

![image](https://raw.githubusercontent.com/w4u-public/Print-layout-generator/images/image038.png)

### キーワード項目の編集
キーワード項目名を任意のものに変更できます。お使いのフォーマットルールに合わせて調整してください。
印刷業界ではサイズに関する用語は多様な呼び名が使われておりますので、使い慣れた用語に変更できるようにしました。
例えばサイズ表記に関して、「VW」を「見え寸の幅」と変更すると、スクリプトは変更後のキーワードをCSVファイルの1行目から探します。

![image](https://raw.githubusercontent.com/w4u-public/Print-layout-generator/images/image039.png)

### セーブ・エクスポートオプション
イラストレーターの書き出し・保存オプションの設定を調整できます。
![image](https://raw.githubusercontent.com/w4u-public/Print-layout-generator/images/image040.png)

### 規格サイズキーワード項目
通常編集する必要はありませんが、よく使うサイズがあれば規格キーワード項目としてこちらに追加することができます。

![image](https://raw.githubusercontent.com/w4u-public/Print-layout-generator/images/image041.png)

## レイアウトの使い方
編集できるのは「内容レイヤー」のみで、このレイヤーには予め「外寸(カット寸法)+のばし」の大きさの矩形パスが配置されています。このパスで内容画像をクリッピングマスクにかけるとレイアウトは完成します。

![image](https://raw.githubusercontent.com/w4u-public/Print-layout-generator/images/image042.gif)

1. レイアウトを開き、「CMD + A」 (全選択)をすると、ロックされていない「内容レイヤー」が選択されます。
2. 内容(この場合画像)を貼り付け、センターに合わせます。(矩形エリアは常に中央に生成されています)
3. 「Shift + CMD + [」で2で貼り付けた画像を最背面に配置します。
4. 「CMD + A」で全選択をすると、画像とマスク用の矩形が選択されます。
5. そのままクリッピングマスクを実行します。

## 免責事項

- ライセンス: MIT
- 業務で利用する場合は十分なテストの上でご使用ください。本スクリプトによって生じたいかなる損害に対して、当方は一切の責任を負いかねます。



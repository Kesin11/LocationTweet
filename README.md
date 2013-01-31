#Location Tweet
##URL
http://location-tweet.herokuapp.com/

##アプリの概要
有名な場所についてのツイートを、地図上から手軽に見ることができるWebアプリです。ツイートの位置情報を使用していないため、その場所について内容のあるつぶやきを見ることができます。
Python/Javascript/MongoDBで実装し、Herokuを利用して公開しています。
場所の位置情報は外部APIを使用せず、Wikipediaの記事中から有名な場所や会社などの名前、座標、カテゴリを抽出し、自前でDBを構築しています。
https://github.com/Kesin11/wikipedia_geomining

##ブログエントリ

- [LocationTweet 気になる場所の今のつぶやきを見る](http://d.hatena.ne.jp/Kesin/20121001/1349081804)
- [Wikipediaから位置情報のデータベースを作る](http://d.hatena.ne.jp/Kesin/20120929/1348917792)


##注意
本コードは公開用バージョンになります

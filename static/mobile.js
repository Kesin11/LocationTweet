//色別マーカーの用意
var iconOffset = new google.maps.Point(34, 34);
var iconPosition = new google.maps.Point(0, 0);
var iconSize = new google.maps.Size(34, 34);
var iconShadowSize = new google.maps.Size(37, 34);

var blueIcon = new google.maps.MarkerImage("static/marker/blue-dot.png", iconSize, iconPosition, iconOffset);
var orangeIcon= new google.maps.MarkerImage("static/marker/orange-dot.png", iconSize, iconPosition, iconOffset);
var greenIcon= new google.maps.MarkerImage("static/marker/green-dot.png", iconSize, iconPosition, iconOffset);
var yellowIcon= new google.maps.MarkerImage("static/marker/yellow-dot.png", iconSize, iconPosition, iconOffset);
var purpleIcon= new google.maps.MarkerImage("static/marker/purple-dot.png", iconSize, iconPosition, iconOffset);
var shadowIcon= new google.maps.MarkerImage("static/marker/msmarker-shodow.png", iconShadowSize, iconPosition, iconOffset);
var customIcon = {
	//交通機関: 青
	railwaystation:
		{icon: blueIcon, shadow: shadowIcon},
	airport:
		{icon: blueIcon, shadow: shadowIcon},
	//ランドマーク: オレンジ
	landmark:
		{icon: orangeIcon, shadow: shadowIcon},
	building:
		{icon: orangeIcon, shadow: shadowIcon},
	//教育機関
	edu:
		{icon: yellowIcon, shadow: shadowIcon},
	//イベント: 紫
	event:
		{icon: purpleIcon, shadow: shadowIcon},
	//自然: 緑
	mountain:
		{icon: greenIcon, shadow: shadowIcon},
	river:
		{icon: greenIcon, shadow: shadowIcon},
	waterbody:
		{icon: greenIcon, shadow: shadowIcon},
	forest:
		{icon: greenIcon, shadow: shadowIcon}
};

/*GoogleMapを表示する*/
function initialize(){
	/*地図を表示する*/
	var myOptions = {
		zoom: 16,
		minZoom: 15,
		disableDefaultUI: true,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		zoomControl: true,
		zoomControlOptions: {
			style: google.maps.ZoomControlStyle.LARGE
		}
	};
	var map = new google.maps.Map($("#map_canvas").get(0), myOptions);

	var pageHeight = $(window).height();
	//アドホックだけどiPhoneで下の空間を埋める方法が分からない・・・
	$('#map_canvas').css('height', pageHeight+25);
	setCurrentCoord(map);
	
	//map生成直後はgetBounds()で取得できない？
	//表示されている地図のlatlng
	var pos, bounds;
	google.maps.event.addListener(map, "bounds_changed", function(){
		pos = map.getBounds();
		bounds = pos.toUrlValue();
	});
	
	/*情報ウィンドウ初期化*/
	var infoWindow = new google.maps.InfoWindow(
		{content:'',
		disableAutoPan:true
		});
	/*マーカーを管理するマーカーリスト*/
	var marker_list = new google.maps.MVCArray();
	
	/*地図をドラッグしたときにサーバーからのplaceをピンで表示する*/
	google.maps.event.addListener(map, "dragend", function(){
		removeAllMarker(marker_list);
		dropMarker(map, infoWindow, bounds, marker_list);
		});
	/*地図を検索でジャンプしたときにピンを表示する*/
	google.maps.event.addListener(map, "tilesloaded", function(){
		removeAllMarker(marker_list);
		dropMarker(map, infoWindow, bounds, marker_list);
	});

	/*現在地ボタンをクリック時に地図の座標を現在地に移動させる*/
	$('#coordButton').click(function(){
		setCurrentCoord(map);
	});

	//検索窓でEnterを押したとき
	$('#queryField').keypress(function(event){
		var keyCode = event.keyCode; //? event.keyCode : event.which ? event.which : event.charCode;  
        if (keyCode == 13) {  
			//フォーカスを外す
			$(this).blur();
            setMapCenter(map);
            return false;  
        }   
        else{  
          return true;  
		}
	});
}
/*Geolocation APIから取得した座標で地図を表示*/
/*クロージャーの中を処理する前にreturnされてしまうのでmapを引数でもらっておく必要がある*/
function setCurrentCoord(map){
    //Geolocation APIが使用不可、又はエラー時には東京タワーにセット
	var initialLocation = new google.maps.LatLng(35.65861, 139.745447);
	if(navigator.geolocation){
		navigator.geolocation.getCurrentPosition(function(position){
			initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
			map.setCenter(initialLocation);
		}, function(error){
			alert("現在地の取得に失敗しました。\n東京タワー周辺を表示します");
			map.setCenter(initialLocation);
		});
	}
	else{
		initialLocation = new google.maps.LatLng(35.65861, 139.745447);
		map.setCenter(initialLocation);
	}
}

/*地図の検索*/
function setMapCenter(map) {
	var geocoder = new google.maps.Geocoder();
	var queryAddress = $('input[name="query"]').val();
	geocoder.geocode({address : queryAddress}, function(results, status) {
		if(status == google.maps.GeocoderStatus.OK) {
			map.setCenter(results[0].geometry.location);
			map.setZoom(17);
		}
		else {
			alert("Geocode was not successful for the following reason" + status);
		}
	});
}
/*サーバーからマーカー座標を取得して地図に表示する*/
function dropMarker(map, infoWindow, bounds, marker_list) {
	$.getJSON("/get_place", {bounds : bounds}, function(result) {
		for(var i = 0; i < result.places.length; i++) {
			var place = result.places[i];
			marker_list.push(createMarker(map, infoWindow, place.lat, place.lng, place.title, place.category));
		}
	});
}
	
/*マーカーと情報ウィンドウを表示する*/
function createMarker(map, infoWindow, lat, lng, title, category) {
	var position = new google.maps.LatLng(lat, lng);

	var icon = customIcon[category] || {};
	var marker = new google.maps.Marker({
		position : position,
		map : map,
		title : title,
		icon: icon.icon,
		shadow: icon.shadow
	});
	/*クリックされたマーカーの場所に対応するツイートページを表示*/
	google.maps.event.addListener(marker, "click", function() {
		$.mobile.changePage("#tweetPage");
		$("#tweetPage").bind('pageshow', getTweet(title));
	});
	return marker;
}

/*マーカーを全て削除する*/
function removeAllMarker(marker_list) {
	marker_list.forEach(function(marker, i) {
		marker.setMap(null);
	});
}

/*場所の名前からツイートを取得して表示*/
function getTweet(title){
	var html = '';
	var url = "http://search.twitter.com/search.json?callback=?&q=" + title;
	var embedded_text, amountTime;
	$("#tweetPage-header > h3").empty();
	$("#tweet").empty();
	$.mobile.showPageLoadingMsg();

	$.getJSON(url, function(result){
		if(result.results.length > 0){
			$.each(result.results, function(i, item){
				embedded_text = embedLink(item.text);
				amountTime = niceTime(item.created_at);

				html += "<div class=tweetBlock>";
					html += "<p class=image-left><img src=" + item.profile_image_url + "></p>";
					html += "<div class=text>";
						html += "<strong>" + item.from_user + "</strong>";
						html += "<p>" + embedded_text + "</p>";
						html += "<p class=time>" + amountTime + "</p>"; 
					html += "</div>";
				html += "</div>";
			});
		}
		else{
			html += "この場所のツイートはありませんでした";
		}
		$.mobile.hidePageLoadingMsg();
		$("#tweetPage-header > h3").append(title);
		$("#tweet").append(html);
	});
}

/*ツイートのリンクテキストに<a>タグを付与する。必要があればユーザ名にも*/
function embedLink(rawText){
	var text = rawText;
	text = text.replace( new RegExp(  /((http[s]?:\/\/)([a-zA-Z0-9_]+)(\.[a-zA-Z0-9_\/\.?=]+))/g), '<a href=\"$1\" target="_blank">$1</a>' );
	return text;
}

/*ツイートの生成日時を現在からの相対時間に変換 http://james.padolsey.com/javascript/recursive-pretty-date/*/
var niceTime = (function() {
	var ints = {
		'秒': 1,
		'分': 60,
		'時間': 3600,
		'日': 86400,
		'週間': 604800,
		'ヶ月': 2592000,
		'年': 31536000
	}; 
	return function(time) {
		time = +new Date(time);
		var gap = ((+new Date()) - time) / 1000;
		var amount, measure;

		for (var i in ints) {
			if (gap > ints[i]) { measure = i; }
		}
		if(measure === '秒'){
			return '今';
		}
		amount = gap / ints[measure];
		amount = gap > ints.day ? (Math.round(amount * 100) / 100) : Math.round(amount);
		amount += ' ' + measure + '前';

		return amount;
	};
})();

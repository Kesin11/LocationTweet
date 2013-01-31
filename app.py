#coding: utf-8
'''
TODO: Wikipediaから位置情報のマイニング
'''
import os
from flask import Flask, render_template, request, jsonify
import model

app = Flask(__name__)
#大文字の変数を全て取得。ここでは__name__から取得
app.config.from_object(__name__)

place = model.Place()

@app.route('/')
def index():
    #テンプレートからレンダリング
    return render_template('mobile.html')

@app.route('/get_place')
def get_place():
    bounds = request.values.get('bounds','').split(',')
    places = place.get_box_places(bounds)
    return jsonify(places=places)

if __name__ == '__main__':
#DEBUG
#port = int(os.environ.get('PORT', 5000))
#app.run(host="0.0.0.0", port=port,debug=True)
    app.run()

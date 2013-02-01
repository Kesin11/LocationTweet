#coding: utf-8
import os
from urlparse import urlparse
from pymongo import Connection

MONGO_URL = os.environ.get('MONGOHQ_URL')

class Place(object):
    '''Connect to MongoDB"'''
    def __init__(self):
        '''Connect to database'''
        if MONGO_URL:
            conn = Connection(MONGO_URL)
            self.db = conn[urlparse(MONGO_URL).path[1:]]
        #Debug in local'''
        else:
            conn = Connection()
            self.db = conn.wikipedia

    def get_box_places(self, bounds):
        '''Get places in box'''
        lat_low = float(bounds[0])
        lat_high = float(bounds[2])
        lng_low = float(bounds[1])
        lng_high = float(bounds[3])
        #左下と右上のコーナーを指定する
        places = self.db.places.find({'coord':
                                    {'$within':
                                        {'$box': [[lng_low, lat_low],[lng_high, lat_high]]
                                        }
                                    }
                                    })
        places_dic = [{'title':place['title'], 'category':place['category'], 'lat':place['coord'][1], 'lng':place['coord'][0]} for place in places]
        return places_dic
        
if __name__ == "__main__":
    '''テスト用'''
    place = Place()
    bounds = ['35.653754', '139.733087', '35.663465', '139.757807']
    places = place.get_box_places(bounds)
    print places

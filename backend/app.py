from flask import Flask, request, jsonify, abort, session
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_session import Session
from dotenv import load_dotenv
import redis
from dateutil.relativedelta import relativedelta
import os
import requests
import datetime
from bs4 import BeautifulSoup

load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.secret_key = os.getenv('SECRET_KEY')
app.config['PERMANENT_SESSION_LIFETIME'] = datetime.timedelta(minutes=5)


app.config['SESSION_TYPE'] = 'redis'
app.config['SESSION_PERMANENT'] = False
app.config['SESSION_USE_SIGNER'] = True
app.config['SESSION_KEY_PREFIX'] = 'myapp:session:'
app.config['SESSION_REDIS'] = redis.Redis(host='localhost', port=6379, password=os.getenv('REDIS_AUTH'), db=0)


Session(app)



limiter = Limiter(
    get_remote_address,
    app=app,
    storage_uri=f"redis://:{os.getenv('REDIS_AUTH')}@localhost:6379/1",
    default_limits=["1 per 3 seconds"]
)



@app.route('/submit', methods = ['POST'])
@limiter.limit('1 per 3 seconds')
def get_data():

    now = datetime.datetime.now()
    five_years_ago = now - relativedelta(years=5)

    data = request.json
    query = data.get('query')


    url = f"{os.getenv('DATA_URL')}{query}/history/?period1={int(five_years_ago.timestamp())}&period2={int(now.timestamp())}"
    headers = {'user-agent': os.getenv('USER_AGENT')}
    
    r = requests.get(url, headers=headers)


    soup = BeautifulSoup(r.content, 'html.parser')
    h1 = soup.find('title')
    elements = soup.find('tbody')
    rows = elements.find_all('tr')

    

    if ')' in h1.text:
        title = h1.text.split(')', 1)[0] + ')'
    else:
        abort(422)

    
    dates = []
    prices = []
    for row in rows:
        val = row.find_all('td')
        if len(val) == 7:
            dates.append(val[0].text.strip())
            prices.append(float(val[4].text.strip()))


    
    dates.reverse()
    prices.reverse()

    
    session['prices'] = prices
    session['dates'] = dates




    dates = [datetime.datetime.strptime(d, '%b %d, %Y') for d in dates]
    range = now - relativedelta(months=6)

    filtered_dates = []
    filtered_prices = []

    for date, price in zip(dates, prices):
            if date >= range:
                filtered_dates.append(date.strftime('%Y-%m-%d'))
                filtered_prices.append(price)

    
    print(f"get_data request from IP: {request.remote_addr}")
    print(f"Query received: {query}")
    print(f"Request time: {now}")

    return jsonify(date=filtered_dates, price=filtered_prices, title=title)



@app.route('/graph-button', methods = ['POST'])
@limiter.limit("10 per 1 second")
def modify_data():
    data = request.json
    value = data.get('query')

    now = datetime.datetime.now()



    dates = session.get('dates')
    prices= session.get('prices')


    if not dates or not prices:
        abort(401)




    dates = [datetime.datetime.strptime(d, '%b %d, %Y') for d in dates]


    filtered_dates = []
    filtered_prices = []

    if value == '1':
        range = now - relativedelta(months=1)
    elif value == '2':
        range = now - relativedelta(months=3)
    elif value == '3':
        range = now - relativedelta(months=6)
    elif value == '4':
        range = now - relativedelta(years=1)
    elif value == '5':
        range = now - relativedelta(years=5)


    for date, price in zip(dates, prices):
            if date >= range:
                filtered_dates.append(date.strftime('%Y-%m-%d'))
                filtered_prices.append(price)

    print(f"modify_data request from IP: {request.remote_addr}")
    print(f"Query received: {value}")
    print(f"Request time: {now}")

    
    return jsonify(date=filtered_dates, price=filtered_prices, title=None)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
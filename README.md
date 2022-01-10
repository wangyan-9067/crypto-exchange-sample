# How to run the app
1. `npm install`
2. `npm start`

# App structure
- styled/* // theme & common styled components
- index.tsx // root js
- CryptoContext.tsx // app store and caches all data
- setupProxy.js // proxy file to fix cross domain problem

# App Features
- A charting widget show candlesticks (real data from crypto.com Derivatives Exchange API)
- An order entry ticket to allow the user to buy and sell by inputing the price, qty (fake data)
- A position widget (fake data)
- An order book widget (real data from crypto.com Derivatives Exchange API)
- an instrument picker
- an interval picker
- support responsive UI
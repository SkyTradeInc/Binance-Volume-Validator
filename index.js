const WebSocket = require('ws')
const log = console.log

let bestBid = 0
let bestAsk = 0
let legitVolume = 0
let fakeVolume = 0
let legitTrades = 0
let fakeTrades = 0

let lastTradeTime;

function startWS() {
  connecting = false
  const socket = new WebSocket('wss://stream.binance.com:9443/stream?streams=btcusdt@bookTicker/btcusdt@aggTrade')

  socket.on('open', () => {
    log('Connected to Socket')
  })

  socket.on('close', () => {
    log('Disconnected to Socket')
  })

  socket.on('ping', () => {
    socket.pong(()=>{})
  })

  socket.on('message', (message) => {
    message = JSON.parse(message)
    if(message.data.e === 'aggTrade') {
      const tradeTime = message.data.T
      if(tradeTime < lastTradeTime) {
        log('Error')
      } else {
        const price = message.data.p
        if(price > bestBid && price < bestAsk) {
          fakeVolume += parseFloat(message.data.q)
          fakeTrades += 1
        } else {
          legitVolume += parseFloat(message.data.q)
          legitTrades += 1
        }
        process.stdout.write("\u001b[2J\u001b[0;0H")
        log(`Fake Volume: ${parseInt(fakeVolume)}btc`)
        log(`Fake Trades: ${fakeTrades}`)
        log(`Legit Volume: ${parseInt(legitVolume)}btc`)
        log(`Legit Trades: ${legitTrades}`)
        log('******************')
        log(`Legit Trades ${parseFloat((legitTrades/(fakeTrades+legitTrades))*100).toFixed(2)}%`)
        log(`Legit Trade Volume ${parseFloat((legitVolume/(fakeVolume+legitVolume))*100).toFixed(2)}%`)

      }
    } else {
      bestBid = parseFloat(message.data.b)
      bestAsk = parseFloat(message.data.a)
    }
  })
}

startWS()

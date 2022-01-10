import React, { ReactNode, FC, useEffect, useCallback, useState, useContext } from "react";
import { BarData, UTCTimestamp } from 'lightweight-charts';

export interface ICryptoContextState {
    instrument: string;
    instruments: ITicker[];
    interval: IInterval;
    index: string;
    mark: string;
    funding: string;
    reset: (interval: IInterval, instrument: string) => void;
    candlesticks: {[key: number]: BarData } | null;
    ticker: ITicker | null;
    newStick: BarData | null;
    orderBook: IOrderBook | null;
    getPage: () => Promise<void>;
    positions: IPosition[];
    addPosition: (side: IPositionType, price: string, size: string) => void;
}

export interface ICryptoProviderProps {
    children: ReactNode;
}

export interface ICryptoMessage {
    id: number;
    method: string;
    code: number;
    result: {
        channel: string,
        instrument_name: string,
        subscription: string,
        data: ITicker[] | ICandlestick[],
        interval: string;
    }
}

export interface ITicker {
    a: string;
    b: string;
    c: string;
    h: string;
    i: string;
    k: string;
    l: string;
    oi: string;
    t: number;
    v: string;
    vv: string;
}

export interface IOrderBook {
    asks: string[][];
    bids: string[][];
    maxAsk: number;
    maxBid: number;
}


export interface ICandlestick {
    c: string;
    h: string;
    l: string;
    o: string;
    t: number;
    v: string;
}

export interface IPosition {
    time: number;
    instrument: string;
    side: IPositionType;
    size: string;
    price: string;
}

// interface CandlestickPage {
//     startTime: number,
//     endTime: number,
//     data: BarData[],
//     status: 'pending' | 'finished'
// }

export type IPositionType = 'buy' | 'sell';
export type IInterval = '1m' | '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '12h' | '1D';

let socket: WebSocket;
export const CryptoContext = React.createContext<ICryptoContextState>({} as ICryptoContextState);
const BASE_URL = '/api/v1/public';
export const TIME_OFFSET = {
    '1m': 1000 * 60,
    '5m': 1000 * 60 * 5,
    '15m': 1000 * 60 * 15,
    '30m': 1000 * 60 * 30,
    '1h': 1000 * 3600,
    '2h': 1000 * 3600 * 2,
    '4h': 1000 * 3600 * 4,
    '12h': 1000 * 3600 * 12,
    '1D': 1000 * 3600 * 24
};
export const TIME_FRAME_COUNT = {
    '1m': 300,
    '5m': 300,
    '15m': 300,
    '30m': 300,
    '1h': 300,
    '2h': 168,
    '4h': 84,
    '12h': 28,
    '1D': 14
}
let startTime: number; // data startTime in map, means all data after startTime is retrieved
let finished = false;
let candlesticksData: { [key: string]: BarData } = {};

function _connectSocket() {
    socket = new WebSocket("wss://deriv-stream.crypto.com/v1/market");


    const disconnectHandler = () => {
        console.log('socket disconnected');
        setTimeout(() => {
            _connectSocket();
        }, 1000);
    }

    socket.onclose = disconnectHandler;
    socket.onerror = disconnectHandler;
}

async function _httpRequest(url: string) {
    const response = await fetch(url);

    if (response.ok) {
        const result = await response.json();

        if (result.code === 0) {
            return result.result.data;
        }
    }

    return [];
}

function _getCandlesticks(start: number, end: number, instrument: string, timeframe: IInterval): Promise<ICandlestick[]> {
    return _httpRequest(`${BASE_URL}/get-candlestick?count=300&end_ts=${end}&instrument_name=${instrument}&start_ts=${start}&timeframe=${timeframe}`);
}


function _getAllInstruments(): Promise<ITicker[]> {
    return _httpRequest(`${BASE_URL}/get-tickers`);
}

async function _getPage(interval: IInterval, instrument: string) {
    if (finished) {
        return;
    }
    let timeFrame = TIME_OFFSET[interval];
    let count = TIME_FRAME_COUNT[interval];
    let endTime = startTime || toCandleMapKey(new Date(), interval === '1D' ? 'd' : 's');
    startTime = endTime - timeFrame * (count - 1);

    let pageData = await _getCandlesticks(startTime, endTime, instrument, interval);

    if (pageData.length === 0) {
        finished = true;
    } else {
        for (let i = 0; i < pageData.length; i++) {
            candlesticksData[pageData[i].t] = _convertCandlestickToBarData(pageData[i]);
        }
    }
};

function _timeToLocal(originalTime: number) {
    const d = new Date(originalTime);
    return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds()) / 1000;
}

function _convertCandlestickToBarData(data: ICandlestick) {
    return {
        time: _timeToLocal(data.t) as UTCTimestamp,
        open: parseFloat(data.o),
        high: parseFloat(data.h),
        low: parseFloat(data.l),
        close: parseFloat(data.c)
    } as BarData;
}

function _sendSocketMessage(method: string, channels: string[]) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            id: new Date().getTime(),
            nonce: new Date().getTime(),
            method,
            params: {
                channels
            }
        }));
    } else {
        console.error('try to send message, but socket not ready');
    }
}

export function toCandleMapKey(date?: Date, type: 'd' | 's' = 'd') {
    if (!date) {
        date = new Date();
    }

    if (type === 'd') {
        return new Date(date.toISOString().replace(/\d\d:\d\d:\d\d\.\d\d\d/, '00:00:00.000')).getTime();
    }

    return new Date(date.toISOString().replace(/\d\d\.\d\d\d/, '00.000')).getTime();
}

let debounceTimer: NodeJS.Timeout;

export function debounce(func: Function, timeout = 500){
    return (...args: any) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            func.apply(null, args);
        }, timeout);
    };
}

var throttleLastTime = 0;
export function throttle(func: Function, timeFrame = 100) {
    return function () {
        var now = new Date().getTime();
        if (now - throttleLastTime >= timeFrame) {
            throttleLastTime = now;
            func();
        }
    };
  }

export const CryptoProvider: FC<ICryptoProviderProps> = ({
    children
}) => {
    const [instrument, setInstrument] = useState<string>('BTCUSD-PERP');
    const [instruments, setInstruments] = useState<ITicker[]>([]);
    const [interval, setInterval] = useState<IInterval>('1D');
    const [ticker, setTicker] = useState<ITicker | null>(null);
    const [candlesticks, setCandlesticks] = useState<{[key: number]: BarData }>({});
    const [newStick, setNewStick] = useState<BarData | null>(null);
    const [orderBook, setOrderBook] = useState<IOrderBook | null>(null);
    const [mark, setMark] = useState<string>('');
    const [index, setIndex] = useState<string>('');
    const [funding, setFunding] = useState<string>('');
    const [positions, setPositions] = useState<IPosition[]>([]);
    // const [candlesticksPage, setCandlesticksPage] = useState<{[key: number]: CandlestickPage } | null>(null);
    const onMessageHandler = useCallback((data: any) => {
        data = JSON.parse(data.data) as ICryptoMessage;

        switch(data.method) {
            case 'public/heartbeat':
                socket.send(JSON.stringify({id: data.id, method: 'public/respond-heartbeat'}));
                break;
            case 'subscribe':
                switch(data.result.channel) {
                    case 'ticker':
                        setTicker(data.result.data[0]);
                        break;

                    case 'candlestick': {
                        if (data.id === -1 && data.result.interval === interval) {
                            setNewStick(_convertCandlestickToBarData(data.result.data[0]));
                        }
                        break;
                    }

                    case 'book': {
                        let book = data.result.data[0];
                        let askSum = 0, bidSum = 0, maxAsk = 0, maxBid = 0;
                        let asks = book.asks.slice(0, 9).reverse();
                        let bids = book.bids.slice(0, 9);

                        for (let i = asks.length - 1; i >= 0; i--) {
                            let size = parseFloat(asks[i][1]);
                            maxAsk = Math.max(size, maxAsk);
                            askSum += size;
                            asks[i][3] = askSum.toFixed(4);
                        }

                        for (let i = 0; i < bids.length; i++) {
                            let size = parseFloat(bids[i][1]);
                            maxBid = Math.max(size, maxBid);
                            bidSum += size;
                            bids[i][3] = bidSum.toFixed(4);
                        }

                        setOrderBook({
                            asks,
                            bids,
                            maxAsk,
                            maxBid
                        });
                        break;
                    }

                    case 'mark': {
                        setMark(parseFloat(data.result.data[0].v).toFixed(1));
                        break;
                    }

                    case 'index': {
                        setIndex(parseFloat(data.result.data[0].v).toFixed(1));
                        break;
                    }

                    case 'funding': {
                        setFunding(`${(parseFloat(data.result.data[0].v) * 100).toFixed(4)}%`);
                        break;
                    }

                    default:
                        break;
                }
                break;

            default:
                break;
        }
    }, [interval, setTicker, setNewStick]);

    const onOpenHandler = useCallback((data: any) => {
        console.log('on open');
        setTimeout(() => {
            _sendSocketMessage('subscribe', [
                `mark.${instrument}`,
                `index.${instrument.replace('PERP', 'INDEX')}`,
                `funding.${instrument}`,
                `book.${instrument}`,
                // `trade.${instrument}`,
                `ticker.${instrument}`,
                `candlestick.${interval}.${instrument}`
            ]);
        }, 1000);
    }, [instrument, interval]);



    useEffect(() => {
        if (!socket || socket.readyState === WebSocket.CLOSED) {
            _connectSocket();
        }

        socket.onmessage = onMessageHandler;
        socket.onopen = onOpenHandler;
    }, [onMessageHandler, onOpenHandler]);

    useEffect(() => {
        const init = async () => {
            await _getPage(interval, instrument);
            setCandlesticks({...candlesticksData});

            let instruments = await _getAllInstruments();
            setInstruments([...instruments.filter((value) => value.i.indexOf('PERP') > -1)]);
        }

        init();
    }, []);

    const reset = useCallback(async (newInterval: IInterval, newInstrument: string) => {
        finished = false;
        startTime = 0;
        candlesticksData = {};
        setInterval(newInterval);
        setInstrument(newInstrument);
        setOrderBook(null);
        setTicker(null);
        _sendSocketMessage('unsubscribe', [
            `mark.${instrument}`,
            `index.${instrument.replace('PERP', 'INDEX')}`,
            `funding.${instrument}`,
            `book.${instrument}`,
            // `trade.${instrument}`,
            `ticker.${instrument}`,
            `candlestick.${interval}.${instrument}`
        ]);
        _sendSocketMessage('subscribe', [
            `mark.${newInstrument}`,
            `index.${newInstrument.replace('PERP', 'INDEX')}`,
            `funding.${newInstrument}`,
            `book.${newInstrument}`,
            // `trade.${newInstrument}`,
            `ticker.${newInstrument}`,
            `candlestick.${newInterval}.${newInstrument}`
        ]);
        await _getPage(newInterval, newInstrument);
        setCandlesticks({...candlesticksData});
    }, [interval, instrument, setInterval, setInstrument, setCandlesticks]);

    const getPage = useCallback(async () => {
        await _getPage(interval, instrument);
        setCandlesticks({...candlesticksData});
    }, [interval, instrument, setCandlesticks]);

    const addPosition = useCallback((side: IPositionType, price: string, size: string) => {
        setPositions([
            ...positions,
            {
                time: new Date().getTime(),
                instrument,
                side,
                price,
                size
            }
        ])
    }, [setPositions, positions, instrument]);

    return (
        <CryptoContext.Provider value={{
            instrument,
            instruments,
            interval,
            index,
            mark,
            funding,
            reset,
            candlesticks,
            ticker,
            orderBook,
            newStick,
            getPage,
            positions,
            addPosition
        }}>
            {children}
        </CryptoContext.Provider>
    )
}

export function useCrypto(): ICryptoContextState {
    return useContext(CryptoContext);
}


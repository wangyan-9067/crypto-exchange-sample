import React, { FC } from "react";
import styled from 'styled-components';
import { useCrypto } from "./CryptoContext";
import Grid from '@mui/material/Grid';
import { SectionTitle } from './styled/Common';

interface IOrderParam {
    ask: boolean;
    price: string;
    quantity: string;
    num: string;
    sum: string;
    max: number;
}

const OrderBookContainer = styled.div`
    height: 28rem;

    & .textRight {
        text-align: right;
    }
`;

const OrderContainer = styled.div`
    position: relative;
    height: 1.3rem;

    & .bg {
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        transform-origin: 0 center;
        transition: transform 0.25s ease;
    }

    & .bg.ask {
        background-color: ${params => params.theme.colors.redBg};
    }
    & .ask {
        color: ${params => params.theme.colors.redText};
    }
    & .bg.bid {
        background-color: ${params => params.theme.colors.greenBg};
    }
    & .bid {
        color: ${params => params.theme.colors.greenText};
    }
`;

const LatestTrade = styled.div`
    padding: 0 1rem;
    font-size: 1.5rem;
    color: ${params => params.theme.colors.greenText};
`;

const Order: FC<IOrderParam> = (params: IOrderParam) => {
    return (
        <OrderContainer>
            <div className={`bg ${params.ask ? 'ask' : 'bid'}`} style={{transform: `scaleX(${Math.min(1, parseFloat(params.quantity) / params.max)})`}}></div>
            <Grid container>
                <Grid item xs={4} className={params.ask ? 'ask' : 'bid'} sx={{padding: '0 1rem'}}>{params.price}</Grid>
                <Grid item xs={4} className="textRight">{params.quantity}</Grid>
                <Grid item xs={3} className="textRight">{params.sum}</Grid>
            </Grid>
        </OrderContainer>
    )
};

export const OrderBook: FC = () => {
    const { orderBook, ticker, instrument } = useCrypto();

    if (!orderBook) {
        return (<></>);
    }

    return (
        <OrderBookContainer>
            <SectionTitle style={{padding: '0 1rem'}}>Order Book</SectionTitle>
            <Grid container>
                <Grid item xs={4} sx={{padding: '0 1rem'}}>Price</Grid>
                <Grid item xs={4} className="textRight">Size({instrument.replace('USD-PERP', '')})</Grid>
                <Grid item xs={3} className="textRight">Sum({instrument.replace('USD-PERP', '')})</Grid>
            </Grid>
            {orderBook.asks.map(value => (
                <Order key={value[0]} ask price={value[0]} quantity={value[1]} num={value[2]} sum={value[3]} max={orderBook.maxAsk}/>
            ))}
            {ticker ? (<LatestTrade>{ticker.a}</LatestTrade>) : (<></>)}
            {orderBook.bids.map(value => (
                <Order key={value[0]} ask={false} price={value[0]} quantity={value[1]} num={value[2]} sum={value[3]} max={orderBook.maxBid}/>
            ))}

        </OrderBookContainer>
    )
};
import React, { FC, useEffect, useState } from "react";
import styled from 'styled-components';
import { useCrypto, IInterval } from "./CryptoContext";
import Grid from '@mui/material/Grid';
import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { SelectableButton } from './styled/Buttons';

const InstrumentHead = styled.div`
    margin: 1rem;
    & > span {
        margin-right: 1rem;
    }
`;

const TickerContainer = styled.div`
    & .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 2rem;

        & .price {
            font-size: 2rem;
        }
    }

    & .item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.8rem;

        ${params => params.theme.breakpoints.up('md')} {
            flex-flow: column;
        }

        & > .itemTitle {
            color: rgba(0, 0, 0, 0.5);
        }

        & > .itemBody {
            color: #000
        }
    }

    & .green {
        color: ${params => params.theme.colors.greenText} !important;
    }
    & .red {
        color: ${params => params.theme.colors.redText} !important;
    }
`;

const DropDownContainer = styled.div`
    padding-right: 1rem;
    margin-bottom: 0.5rem;
    display: inline-block;
`;

const padZero = (val: number) => {
    if (val < 10) {
        return `0${val}`;
    }

    return `${val}`;
};

const Countdown: FC = () => {
    const [countdown, setCountDown] = useState(0);

    useEffect(() => {
        let date = new Date();
        setCountDown(3600 - date.getUTCMinutes() * 60 - date.getUTCSeconds());

        let timer = setInterval(() => {
            let date = new Date();
            setCountDown(3600 - date.getUTCMinutes() * 60 - date.getUTCSeconds());
        }, 1000);

        return () => {
            clearInterval(timer);
        }
    }, []);
    return (
        <div>{`00:${padZero(Math.trunc(countdown / 60))}:${padZero(countdown % 60)}`}</div>
    );
}

const DropDown: FC = () => {
    const { instrument, instruments, interval, reset } = useCrypto();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const selectInstrument = (value: string) => () => {
        reset(interval, value);
        handleClose();
    }
    return (
        <DropDownContainer>
            <Button
                variant="contained"
                id="menu-button"
                aria-controls="menu"
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
            >
                {instrument}
            </Button>
            <Menu
                id="menu"
                aria-labelledby="menu-button"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                {instruments.length > 0 ? instruments.map((ticker) => (
                    <MenuItem key={ticker.i} onClick={selectInstrument(ticker.i)}>{ticker.i}</MenuItem>
                )) : <></>}
            </Menu>
        </DropDownContainer>
    )
}

export const Ticker: FC = () => {
    const { ticker, instrument, interval, index, mark, funding, reset } = useCrypto();

    const onChangeInterval = (val: IInterval) => {
        reset(val, instrument);
    };

    if (!ticker) {
        return (<></>);
    }

    const color = parseFloat(ticker.c) > 0 ? 'green' : 'red';

    return (
        <div>
            <InstrumentHead>
                <DropDown />
                <ButtonGroup variant="outlined">
                    <SelectableButton className={interval === '1m' ? 'selected' : ''} onClick={() => onChangeInterval('1m')}>1m</SelectableButton>
                    <SelectableButton className={interval === '5m' ? 'selected' : ''} onClick={() => onChangeInterval('5m')}>5m</SelectableButton>
                    <SelectableButton className={interval === '15m' ? 'selected' : ''} onClick={() => onChangeInterval('15m')}>15m</SelectableButton>
                    <SelectableButton className={interval === '30m' ? 'selected' : ''} onClick={() => onChangeInterval('30m')}>30m</SelectableButton>
                    <SelectableButton className={interval === '1h' ? 'selected' : ''} onClick={() => onChangeInterval('1h')}>1h</SelectableButton>
                    <SelectableButton className={interval === '2h' ? 'selected' : ''} onClick={() => onChangeInterval('2h')}>2h</SelectableButton>
                    <SelectableButton className={interval === '4h' ? 'selected' : ''} onClick={() => onChangeInterval('4h')}>4h</SelectableButton>
                    <SelectableButton className={interval === '12h' ? 'selected' : ''} onClick={() => onChangeInterval('12h')}>12h</SelectableButton>
                    <SelectableButton className={interval === '1D' ? 'selected' : ''} onClick={() => onChangeInterval('1D')}>1D</SelectableButton>
                </ButtonGroup>
            </InstrumentHead>
            <TickerContainer>
                <div className="header">
                    <div className="price">{ticker.a}</div>
                    <div className={`change ${color}`}>{(parseFloat(ticker.a) * parseFloat(ticker.c)).toFixed(2)}</div>
                    <div className={`change ${color}`}>{`${(parseFloat(ticker.c) * 100).toFixed(2)}%`}</div>
                </div>
                <Grid container spacing={2} sx={{padding: '0 1rem'}}>
                    <Grid item xs={6} md={1}>
                        <div className="item">
                            <div className="itemTitle">Mark Price</div>
                            <div className="itemBody">{mark}</div>
                        </div>
                    </Grid>
                    <Grid item xs={6} md={1}>
                        <div className="item">
                            <div className="itemTitle">Index Price</div>
                            <div className="itemBody">{index}</div>
                        </div>
                    </Grid>
                    <Grid item xs={6} md={1}>
                        <div className="item">
                            <div className="itemTitle">High</div>
                            <div className="itemBody">{ticker.h}</div>
                        </div>
                    </Grid>
                    <Grid item xs={6} md={1}>
                        <div className="item">
                            <div className="itemTitle">Low</div>
                            <div className="itemBody">{ticker.l}</div>
                        </div>
                    </Grid>
                    <Grid item xs={6} md={1}>
                        <div className="item">
                            <div className="itemTitle">24H Change</div>
                            <div className={`itemBody ${color}`}>{`${(parseFloat(ticker.c) * 100).toFixed(2)}%`}</div>
                        </div>
                    </Grid>
                    <Grid item xs={6} md={1}>
                        <div className="item">
                            <div className="itemTitle">24H Vol(USD)</div>
                            <div className="itemBody">{ticker.vv}</div>
                        </div>
                    </Grid>
                    <Grid item xs={6} md={1}>
                        <div className="item">
                            <div className="itemTitle">24H Vol(BTC)</div>
                            <div className="itemBody">{ticker.v}</div>
                        </div>
                    </Grid>
                    <Grid item xs={6} md={1}>
                        <div className="item">
                            <div className="itemTitle">Funding/1h</div>
                            <div className="itemBody">{funding}</div>
                        </div>
                    </Grid>
                    <Grid item xs={6} md={1}>
                        <div className="item">
                            <div className="itemTitle">Countdown</div>
                            <div className="itemBody"><Countdown /></div>
                        </div>
                    </Grid>
                </Grid>
            </TickerContainer>
        </div>
    )
}
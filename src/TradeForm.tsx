import React, { FC, useEffect, useState } from "react";
import styled from 'styled-components';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Grid from '@mui/material/Grid';
import { SectionTitle } from './styled/Common';
import { IPositionType, useCrypto } from "./CryptoContext";
import { TradeButton } from './styled/Buttons';

type InputProps = {
    text: string,
    onChange: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement> | undefined,
    label: string,
    suffix: string
}

type FormState = {
    instrument: string,
    price: string,
    quantity: string,
    orderValue: string
}

const InputContainer = styled.div`
    display: flex;
    align-items: center;
    padding: 0.5rem 1rem;
    & .inputLabel {
        width: 5rem;
    }
`;
const Input = styled(OutlinedInput)`
    width: 100%;
`;


const CryptoInput: FC<InputProps> = (props) => {
    return (
        <InputContainer>
            <div className="inputLabel">{props.label}</div>
            <Input
            value={props.text}
            type="number"
            onChange={props.onChange}
            endAdornment={<InputAdornment position="end">{props.suffix}</InputAdornment>}
            aria-describedby="helper-text"
          />
        </InputContainer>
    )
}

export const TradeForm: FC = () => {
    const { instrument, ticker, addPosition } = useCrypto();
    const [form, setForm] = useState<FormState>({
        instrument: '',
        price: ticker?.a || '',
        quantity: '',
        orderValue: ''
    });

    const handleChange = (prop: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
        let value = event.target.value;

        if (prop === 'price' && form.quantity) {
            form.orderValue = value ? (parseFloat(value) * parseFloat(form.quantity)).toFixed(1) : '';
        } else if (prop === 'quantity' && form.price) {
            form.orderValue = value ? (parseFloat(value) * parseFloat(form.price)).toFixed(1) : '';
        } else if (prop === 'orderValue' && form.price) {
            form.quantity = value ? (parseFloat(value) / parseFloat(form.price)).toFixed(4) : '';
        }

        setForm({
            ...form,
            [prop]: value
        });
    };

    const handleTrade = (side: IPositionType) => (event: React.MouseEvent<HTMLElement>) => {
        if (!ticker) {
            return;
        }

        if (form.price && form.quantity && parseFloat(form.price) > 0 && parseFloat(form.quantity) > 0) {
            addPosition(side, form.price, form.quantity);
            setForm({
                instrument: ticker.i,
                price: ticker.a,
                quantity: '',
                orderValue: ''
            });
        }
    };

    useEffect(() => {
        if (!ticker) {
            setForm({
                instrument: '',
                price: '',
                quantity: '',
                orderValue: ''
            });
            return;
        }

        if (form.instrument !== ticker.i) {
            setForm({
                instrument: ticker.i,
                price: ticker.a,
                quantity: '',
                orderValue: ''
            });
        }
    }, [form, ticker]);

    return (
        <div>
            <SectionTitle style={{padding: '0 1rem'}}>Trade Form</SectionTitle>
            <CryptoInput text={form.price} onChange={handleChange('price')} label="Price" suffix="USD"/>
            <CryptoInput text={form.quantity} onChange={handleChange('quantity')} label="Quantity" suffix={instrument.replace('USD-PERP', '')}/>
            <CryptoInput text={form.orderValue} onChange={handleChange('orderValue')} label="Order Value" suffix="USD"/>
            <Grid container spacing={4} style={{padding: '0 1rem'}}>
                <Grid item xs={6}>
                    <TradeButton className="buy" onClick={handleTrade('buy')}>Buy</TradeButton>
                </Grid>
                <Grid item xs={6}>
                    <TradeButton className="sell" onClick={handleTrade('sell')}>Sell</TradeButton>
                </Grid>
            </Grid>
        </div>
    )
};
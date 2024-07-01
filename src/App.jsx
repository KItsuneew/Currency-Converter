import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
	const [exchangeRates, setExchangeRates] = useState('USD');
	const [prevRates, setPrevRates] = useState(null);
	const [amount, setAmount] = useState(0);
	const [convertedAmount, setConvertedAmount] = useState(0);
	const [targetCurrency, setTargetCurrency] = useState('USD');

	useEffect(() => {
		const fetchExchangeRates = async () => {
			try {
				const response = await axios.get(
					'https://www.cbr-xml-daily.ru/daily_json.js'
				);
				const storedPrevRates = localStorage.getItem('prevRates');
				setPrevRates(storedPrevRates ? JSON.parse(storedPrevRates) : null);
				setExchangeRates(response.data.Valute);
				localStorage.setItem('prevRates', JSON.stringify(response.data.Valute));
			} catch (error) {
				console.error('Ошибка при получении курсов валют:', error);
			}
		};

		fetchExchangeRates();
	}, []);

	const getRateColor = (currency) => {
		if (prevRates && exchangeRates) {
			const prevRate = prevRates[currency].Previous;
			const currentRate = exchangeRates[currency].Value;
			return currentRate < prevRate ? 'green' : 'red';
		}
		return 'black';
	};

	const handleAmountChange = (e) => {
		const inputAmount = parseFloat(e.target.value);
		setAmount(inputAmount);
		const convertedValue = convertCurrency(inputAmount, targetCurrency);
		setConvertedAmount(convertedValue);
	};

	const handleCurrencyChange = (e) => {
		const selectedCurrency = e.target.value;
		setTargetCurrency(selectedCurrency);
		const convertedValue = convertCurrency(amount, selectedCurrency);
		setConvertedAmount(convertedValue);
	};

	const convertCurrency = (amount, currency) => {
		if (exchangeRates && exchangeRates[currency]) {
			const rate = exchangeRates[currency].Value;
			return (amount / rate).toFixed(2);
		}
		return 0;
	};

	return (
		<div className='converter-container'>
			<h2 className='text-3xl text-center'>Конвертер валют</h2>
			<div className='exchange-rates'>
				{exchangeRates && exchangeRates.USD && (
					<div className='rate flex'>
						<span className='rate-label'>Курс USD</span>
						<span className='rate-value' style={{ color: getRateColor('USD') }}>
							{exchangeRates.USD.Value.toFixed(2)}
						</span>
					</div>
				)}
				{exchangeRates && exchangeRates.EUR && (
					<div className='rate flex flex-col'>
						<span className='rate-label'>Курс EUR</span>
						<span className='rate-value' style={{ color: getRateColor('EUR') }}>
							{exchangeRates.EUR.Value.toFixed(2)}
						</span>
					</div>
				)}
				{exchangeRates && exchangeRates.GBP && (
					<div className='rate flex'>
						<span className='rate-label'>Курс GBP</span>
						<span className='rate-value' style={{ color: getRateColor('GBP') }}>
							{exchangeRates.GBP.Value.toFixed(2)}
						</span>
					</div>
				)}
			</div>
			<div className='conversion-form'>
				<div className='input-group'>
					<label>Отдаю:</label>
					<select disabled>
						<option value='RUB'>RUB — Рубли</option>
					</select>
					<input
						type='number'
						placeholder='Введите сумму'
						onChange={handleAmountChange}
						style={{ borderColor: amount === 0 ? 'red' : 'initial' }}
					/>
				</div>
				<div className='input-group'>
					<label>Получаю:</label>
					<select onChange={handleCurrencyChange}>
						<option value='USD'>USD — Доллар США</option>
						<option value='EUR'>EUR — Евро</option>
						<option value='GBP'>GPB — Фунт стерлингов</option>
					</select>
					<input type='text' value={convertedAmount} readOnly />
				</div>
			</div>
		</div>
	);
}

export default App;

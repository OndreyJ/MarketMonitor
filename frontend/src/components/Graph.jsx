import { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend} from 'chart.js';



ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Graph = ({ processedData, loading, setLoading, noSymbolAlert, setNoSymbolAlert, setSessionAlert, sessionAlert}) => {
    const [date, setDate] = useState([]);
    const [price, setPrice] = useState([]);
    const [title, setTitle] = useState([]);
    const [activeButton, setActiveButton] = useState('3');


    useEffect(() => {

        if(processedData){
            const {date, price, title} = processedData;
            
            setTitle(title);
            setDate(date);
            setPrice(price);
            setLoading(false);
            setNoSymbolAlert(false);
        }
    }, [processedData])

    const handleButton = async (value) => {

        if(value != activeButton){
            setActiveButton(value);

            try {
                axios.defaults.withCredentials = true;
                const response = await axios.post(import.meta.env.VITE_API_URL + 'graph-button', { query: value });
                const { date, price, title } = response.data;

                setDate(date);
                setPrice(price);

            } catch (error) {
                if (error.response && error.response.status === 401) {
                    setSessionAlert(true);
                    setTimeout(() => window.location.reload(), 2000);
                }
            }
        }
    }




    const options = {
        responsive: true,
        interaction: {
            intersect: false,
            mode: 'index',
            bodyFont: {
                size: 24,
                weight: 'bold',
            },
            titleFont: {
                size: 24,
                weight: 'bold',
            },
            padding: 12,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            borderWidth: 1,
            displayColors: false,
            caretPadding: 10,
        },
        scales: {
            x: {
                ticks: {
                    maxTicksLimit: 12,
                    maxRotation: 45,
                    minRotation: 45,
                    font: {
                        size: 15
                    }
                },
                grid: {
                    display: false
                }
            },
            y: {
                grid: {
                    display: false
                }
            }
        },
        plugins: {
            legend: {
                display: false
            }
        },
        elements: {
            point: {
                radius: 0
            }
        }
    };

    const data = {
        labels: date,
        datasets: [
            {
                label: 'Closing Price',
                data: price,
                borderColor: 'rgb(37, 99, 235)',
            }
        ]
    };

    const buttons = [
        { label: '1 Month', value: '1' },
        { label: '3 Months', value: '2' },
        { label: '6 Months', value: '3' },
        { label: '1 Year', value: '4' },
        { label: '5 Years', value: '5' },
      ];



    return (
        <div className = 'mx-auto flex flex-col items-center'>
            { loading === true ? (
                <div className='flex justify-center items-center h-screen'>
                    <div className='animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-500'></div>
                </div>
            ) : noSymbolAlert === true ? (
                <div className='flex justify-center items-center h-screen'>
                    <div className='bg-gray-200 w-3/4 p-3 rounded-lg shadow-xl'>
                        <p className='text-black text-2xl text-center'>Invalid Stock Symbol</p>
                    </div>
                </div>
            ) : sessionAlert === true ? (
                <div className='flex justify-center items-center h-screen'>
                    <div className='bg-gray-200 w-3/4 p-5 rounded-lg shadow-xl'>
                        <p className='text-black text-2xl text-center'>Session Timeout... Reloading</p>
                    </div>
                </div>
            ) : (
                <div className='flex-col items-center md:w-2/3 w-screen flex-1'>    
                    <h1 className='mt-20 mb-5 text-center text-blue-500 sm:text-4xl text-xl font-roboto'>{title}</h1>
                    <div className='flex-col items-center flex-1 w-full'>
                        <div className='flex m-5'>
                            {buttons.map(({ label, value }) => (
                                <button
                                    key={value}
                                    onClick={() => handleButton(value)}
                                    className={
                                        `${activeButton === value ? 'bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'} 
                                        ${value === '1' ? 'rounded-l-full' : value === '5' ? 'rounded-r-full' : 'rounded-none' } 
                                        md:text-base text-sm w-1/5 px-4 py-2 text-black`
                                    }
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                            <Line options={options} data={data}/>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Graph;
import { useState } from 'react';
import NavBar from './NavBar.jsx';
import Graph from './Graph.jsx';

const Dashboard = () => {

    const [processedData, setProcessedData] = useState('');
    const [loading, setLoading] = useState(true);
    const [noSymbolAlert, setNoSymbolAlert] = useState(false);
    const [sessionAlert, setSessionAlert] = useState(false);


    const handleProcessedData = (data) => {
        setProcessedData(data);
    }


    return(
        <>
            <NavBar 
                onProcessedData={handleProcessedData} 
                loading={loading} 
                setLoading={setLoading} 
                setNoSymbolAlert={setNoSymbolAlert}
                setSessionAlert={setSessionAlert}
            />

            <Graph 
                processedData={processedData} 
                loading={loading} 
                setLoading={setLoading} 
                setNoSymbolAlert={setNoSymbolAlert}
                noSymbolAlert={noSymbolAlert}
                setSessionAlert={setSessionAlert}
                sessionAlert={sessionAlert}
            />
        </>
    )
}

export default Dashboard;
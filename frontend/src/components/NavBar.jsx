import { useState, useEffect } from 'react';
import { FaSearch, FaGithub } from 'react-icons/fa';
import axios from 'axios';

const Navbar = ({onProcessedData, loading, setLoading, setNoSymbolAlert, setSessionAlert}) => {
  
	const [searchClicked, setSearchClicked] = useState(false);
	const [searchQuery, setSearchQuery] = useState(import.meta.env.VITE_INTRO_SYMBOL);

	const navItems = [
		// {id: 1, name: 'Log In'}
		{id: 1, link: import.meta.env.VITE_GITHUB_URL}
	];

	const toggleSearch = () => {
		setSearchClicked(true);
	};

	const sendRequest = async () => {
    	try {
    		const symbol = searchQuery;
    		setSearchQuery('');

			axios.defaults.withCredentials = true;
      		const response = await axios.post(import.meta.env.VITE_API_URL + 'submit', { query: symbol });
      		onProcessedData(response.data);
    	} catch (error) {
      		if (error.response && error.response.status === 429) {
        		console.log('Rate limit exceeded. Retrying...');
        		setTimeout(() => sendRequest(), 3000)

      		} else if (error.response && error.response.status === 422){
        		setLoading(false);
        		setNoSymbolAlert(true);
      		}
    	}
	}

	const handleSearchSubmit = async (e) => {
    	e.preventDefault();

    	if(!loading){
    		setLoading(true);
    		setNoSymbolAlert(false);
			setSessionAlert(false);
    		sendRequest();
    	}
  	};

  	useEffect(() => {
  		sendRequest();
  	}, []);
  

  	return (	
    	<div className = 'bg-gray-200 h-10 m-4 mx-auto w-4/5 flex items-center rounded-full shadow-xl fixed top-0 left-1/2 -translate-x-1/2'>
      		<h1 className = 'sm:text-2xl text-xs font-bold text-blue-500 sm:ml-10 ml-5'>Market Monitor</h1>
      		{ searchClicked ? (
				<div className='absolute left-1/2 transform -translate-x-1/2 w-full flex justify-center'>
					<form onSubmit = {handleSearchSubmit} className = 'sm:text-xl text-sm max-w-md'>
        				<input 
          					type = 'text'
          					value = {searchQuery}
          					onChange = {(e) => setSearchQuery(e.target.value)}
          					placeholder='Enter Stock Symbol'
          					autoFocus
							className='w-full p-2 text-sm rounded-full border border-gray-300 focus:outline-none focus:border-black text-center'
        				/>
       				</form>
				</div>
      		) : (
        	<FaSearch className='absolute left-1/2 transform -translate-x-1/2 text-lg' onClick = {toggleSearch}/>
      		)}
      		<ul className = 'flex ml-auto sm:mr-10 mr-5 space-x-5'>
        		{navItems.map((item) => (
          			<li key={item.id}>
            			<a href = {item.link} className = 'text-2xl font-bold'>
              				<FaGithub/>
            			</a>
          			</li>
        		))}
      		</ul>
    	</div>
  	)
};

export default Navbar;
import './App.css';
import './styles.css';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import React, { Suspense, useEffect, useState } from 'react';

const Map = React.lazy(() => import('./components/map/MapPage'));
const Home = React.lazy(() => import('./components/home/HomePage'));
const User = React.lazy(() => import('./components/user/UserPage'));
const Logic = React.lazy(() => import('./components/logic/LogicPage'));
const Schematic = React.lazy(() => import('./components/schematic/SchematicPage'));
const Login = React.lazy(() => import('./components/login/LoginPage'));
const Upload = React.lazy(() => import('./components/upload/UploadSchematicPage'));
const Admin = React.lazy(() => import('./components/admin/AdminPage'));

import NavigationBar from './components/navigation/NavigationBar';
import PrivateRoute from './components/common/PrivateRoute';
import OAuth2RedirectHandler from './components/login/OAuth2RedirectHandler';
import { ACCESS_TOKEN, USER_DATA } from './config/Config';
import { API } from './AxiosConfig';

function App() {
	const [authenticated, setAuthenticated] = useState<boolean>(false);
	const [currentUser, setCurrentUser] = useState<UserInfo>();
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		try {
			setLoading(true);

			let accessToken = localStorage.getItem(ACCESS_TOKEN);
			if (accessToken) {
				let headers = { Authorization: 'Bearer ' + accessToken };
				API.get('/users', { headers: headers }) //
					.then((result) => setUser(result.data))
					.catch((error) => console.log(error))
					.finally(() => setLoading(false));
					
			} else setLoading(false);
		} catch (e) {
			handleLogOut();
		}
	}, []);

	function setUser(user: UserInfo) {
		if (user) {
			setAuthenticated(true);
			setCurrentUser(user);
		} else console.log('Login failed');
	}

	function handleLogOut() {
		setAuthenticated(false);
		setCurrentUser(undefined);

		localStorage.removeItem(USER_DATA);
		localStorage.removeItem(ACCESS_TOKEN);
	}

	if (loading) return <div className='flexbox-center dark-background'>Loading</div>;

	return (
		<div className='app image-background'>
			<Router>
				<img className='mindustry-logo' src='https://cdn.discordapp.com/attachments/1010373926100148356/1106488674935394394/a_cda53ec40b5d02ffdefa966f2fc013b8.gif' alt='Error' hidden></img>

				{authenticated ? (
					<button className='logout-button dark-background' type='button' onClick={() => handleLogOut()}>
						Logout
					</button>
				) : (
					<button className='logout-button dark-background' type='button'>
						<a href='/login'>Login</a>
					</button>
				)}
				<NavigationBar authenticated={authenticated} user={currentUser} />
				<Suspense fallback={<label className='flexbox-center'>Loading</label>}>
					<Routes>
						<Route path='/' element={<Home />} />
						<Route path='/map' element={<Map />} />
						<Route path='/home' element={<Home />} />
						<Route path='/logic' element={<Logic />} />
						<Route path='/login' element={<Login />} />
						<Route path='/upload' element={<Upload user={currentUser} />} />
						<Route path='/schematic' element={<Schematic />} />
						<Route path='/oauth2/redirect' element={<OAuth2RedirectHandler />} />
						<Route
							path='/user'
							element={
								<PrivateRoute authenticated={authenticated}>
									<User user={currentUser} />
								</PrivateRoute>
							}
						/>
						<Route
							path='/admin'
							element={
								<PrivateRoute authenticated={authenticated}>
									<Admin user={currentUser} />
								</PrivateRoute>
							}
						/>
					</Routes>
				</Suspense>
			</Router>
		</div>
	);
}

export default App;

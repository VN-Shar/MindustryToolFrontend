import React, { useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API } from 'src/API';
import User from 'src/data/User';
import LoadingSpinner from 'src/components/LoadingSpinner';
import { PopupMessageContext } from 'src/context/PopupMessageProvider';
import i18n from 'src/util/I18N';
import { Trans } from 'react-i18next';
import MessageScreen from 'src/components/MessageScreen';
import SwitchBar from 'src/components/SwitchBar';
import UserSchematicTab from 'src/routes/user/UserSchematicTab';
import UserMapTab from 'src/routes/user/UserMapTab';
import UserPostTab from 'src/routes/user/UserPostTab';
import UserInfoTab from 'src/routes/user/UserInfoTab';

export default function UserPage() {
	const { userId } = useParams();

	const [loading, setLoading] = React.useState(true);

	const [user, setUser] = React.useState<User>();

	const popup = useContext(PopupMessageContext);

	useEffect(() => {
		if (userId)
			API.getUser(userId) //
				.then((result) => setUser(result.data)) //
				.catch(() => popup.addPopup(i18n.t('user.load-fail'), 5, 'error'))
				.finally(() => setLoading(false));
	}, [userId, popup]);

	if (!userId)
		return (
			<MessageScreen>
				<Trans i18nKey='user-invalid-id' />
			</MessageScreen>
		);

	if (loading) return <LoadingSpinner />;

	if (!user)
		return (
			<MessageScreen>
				<Trans i18nKey='user-not-found' />
			</MessageScreen>
		);

	return (
		<main className='flex flex-col w-full h-full'>
			<SwitchBar
				className='flex flex-col w-full h-full'
				elements={[
					{
						id: 'info',
						name: (
							<div className='flex gap-1'>
								<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-6 h-6'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										d='M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z'
									/>
								</svg>
								<Trans i18nKey='user-information' />
							</div>
						),
						element: <UserInfoTab user={user} />,
					},
					{
						id: 'schematic',
						name: (
							<div className='flex gap-1'>
								<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-6 h-6'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										d='M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z'
									/>
								</svg>
								<Trans i18nKey='schematic' />
							</div>
						),
						element: <UserSchematicTab user={user} />,
					},
					{
						id: 'map',
						name: (
							<div className='flex gap-1'>
								<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-6 h-6'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										d='M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z'
									/>
								</svg>
								<Trans i18nKey='map' />
							</div>
						),
						element: <UserMapTab user={user} />,
					},
					{
						id: 'post',
						name: (
							<div className='flex gap-1'>
								<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-6 h-6'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										d='M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25'
									/>
								</svg>
								<Trans i18nKey='post' />
							</div>
						),
						element: <UserPostTab user={user} />,
					},
				]}
			/>
		</main>
	);
}

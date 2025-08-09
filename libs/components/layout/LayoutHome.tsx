import React, { useEffect } from 'react';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import { Stack } from '@mui/material';
import HeaderFilter from '../homepage/HeaderFilter';
import { userVar } from '../../../apollo/store';
import { useReactiveVar } from '@apollo/client';
import { getJwtToken, updateUserInfo } from '../../auth';
import Chat from '../Chat';

const withLayoutMain = (Component: any) => {
	return (props: any) => {
		const user = useReactiveVar(userVar);

		/** LIFECYCLE **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

		/** HANDLERS **/

		return (
			<>
				<Head>
					<title>JobBoardAI</title>
					<meta name={'title'} content={`JobBoardAI`} />
				</Head>
				<Stack id="pc-wrap">
					<Stack id={'top'}>
						<Top />
					</Stack>

					<Stack className={'header-main'}>
						<Stack className={'container'}>
							<HeaderFilter />
						</Stack>
					</Stack>

					<Stack id={'main'}>
						<Component {...props} />
					</Stack>

					{user?._id && <Chat />}

					<Stack id={'footer'}>
						<Footer />
					</Stack>
				</Stack>
			</>
		);
	};
};

export default withLayoutMain;

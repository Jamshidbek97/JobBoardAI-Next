import React, { useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Pagination, Stack, Typography } from '@mui/material';
import PropertyCard from '../job/JobRow';
import { T } from '../../types/common';
import { useMutation, useQuery } from '@apollo/client';
import { GET_FAVORITES } from '../../../apollo/user/query';
import { LIKE_TARGET_JOB } from '../../../apollo/user/mutation';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import { Messages } from '../../config';
import { Job } from '../../types/job/job';

const MyFavorites: NextPage = () => {
	const device = useDeviceDetect();
	const [myFavorites, setMyFavorites] = useState<Job[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [searchFavorites, setSearchFavorites] = useState<T>({ page: 1, limit: 6 });

	/** APOLLO REQUESTS **/
	const [likeTargetProperty] = useMutation(LIKE_TARGET_JOB);
	const {
		loading: getFavoritesLoading,
		data: getFavoritesData,
		error: getFavoritesError,
		refetch: getFavoritesRefetch,
	} = useQuery(GET_FAVORITES, {
		fetchPolicy: 'network-only',
		variables: { input: searchFavorites },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setMyFavorites(data?.getFavorites?.list);
			setTotal(data?.getFavorites?.metaCounter[0]?.total || 0);
		},
	});

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchFavorites({ ...searchFavorites, page: value });
	};

	const likePropertyHandler = async (user: any, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);

			await likeTargetProperty({
				variables: {
					input: id,
				},
			});
		} catch (error: any) {
			console.log('Err: LikePropertyHandler', error.message);
			sweetMixinErrorAlert(error.message).then();
		}
	};

	if (device === 'mobile') {
		return <div>JobBoardAI MY FAVORITES MOBILE</div>;
	} else {
		return (
			<div id="my-favorites-page" style={{ width: '100%', padding: '20px' }}>
				<Stack className="main-title-box" style={{ marginBottom: '30px' }}>
					<Stack className="right-box">
						<Typography className="main-title" style={{ 
							fontSize: '30px', 
							fontWeight: 600, 
							marginBottom: '10px',
							color: '#181a20'
						}}>
							My Favorites
						</Typography>
						<Typography className="sub-title" style={{ 
							fontSize: '14px', 
							color: '#666',
							lineHeight: '1.5'
						}}>
							We are glad to see you again!
						</Typography>
					</Stack>
				</Stack>
				
				<Stack className="favorites-list-box" style={{
					padding: '30px',
					borderRadius: '12px',
					border: '1px solid rgba(196, 196, 196, 0.79)',
					background: '#fff',
					boxShadow: '0px 1px 4px 0px rgba(24, 26, 32, 0.07)',
					minHeight: '400px'
				}}>
					{myFavorites?.length ? (
						<div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
							{myFavorites?.map((job: Job, index: number) => {
								return (
									<div key={job._id || index} style={{
										padding: '20px',
										border: '1px solid #e5e7eb',
										borderRadius: '12px',
										background: '#fff',
										transition: 'all 0.2s ease',
										cursor: 'pointer'
									}}
									onMouseEnter={e => {
										e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
										e.currentTarget.style.borderColor = '#2563eb';
									}}
									onMouseLeave={e => {
										e.currentTarget.style.boxShadow = '';
										e.currentTarget.style.borderColor = '#e5e7eb';
									}}>
										<PropertyCard job={job} likePropertyHandler={likePropertyHandler} />
									</div>
								);
							})}
						</div>
					) : (
						<div className={'no-data'} style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
							padding: '80px 20px',
							textAlign: 'center',
							color: '#666'
						}}>
							<img src="/img/icons/icoAlert.svg" alt="" style={{ 
								width: '80px', 
								height: '80px', 
								marginBottom: '30px',
								opacity: '0.6'
							}} />
							<p style={{ 
								fontSize: '18px', 
								margin: '0 0 10px 0',
								color: '#181a20',
								fontWeight: 600
							}}>
								No Favorites Found!
							</p>
							<p style={{ 
								fontSize: '14px', 
								margin: '0',
								color: '#666',
								maxWidth: '400px',
								lineHeight: '1.5'
							}}>
								You haven't saved any jobs to your favorites yet. Start browsing jobs and click the heart icon to save your favorites!
							</p>
						</div>
					)}
				</Stack>
				
				{myFavorites?.length ? (
					<Stack className="pagination-config" style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						marginTop: '30px',
						padding: '20px 30px',
						borderRadius: '12px',
						border: '1px solid rgba(196, 196, 196, 0.79)',
						background: '#fff',
						boxShadow: '0px 1px 4px 0px rgba(24, 26, 32, 0.07)'
					}}>
						<Stack className="pagination-box">
							<Pagination
								count={Math.ceil(total / searchFavorites.limit)}
								page={searchFavorites.page}
								shape="circular"
								color="primary"
								onChange={paginationHandler}
							/>
						</Stack>
						<Stack className="total-result">
							<Typography style={{ 
								fontSize: '14px', 
								color: '#666',
								fontWeight: 500
							}}>
								Total {total} favorite job{total !== 1 ? 's' : ''}
							</Typography>
						</Stack>
					</Stack>
				) : null}
			</div>
		);
	}
};

export default MyFavorites;

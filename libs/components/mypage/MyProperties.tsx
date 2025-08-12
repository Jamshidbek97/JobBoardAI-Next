import React, { useState } from 'react';
import { NextPage } from 'next';
import { Pagination, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { PropertyCard } from './PropertyCard';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { T } from '../../types/common';
import { userVar } from '../../../apollo/store';
import { useRouter } from 'next/router';

import { GET_AGENT_JOBS } from '../../../apollo/user/query';
import { sweetConfirmAlert, sweetErrorHandling } from '../../sweetAlert';
import { Job } from '../../types/job/job';
import { AgentJobsInquiry } from '../../types/job/job.input';
import { JobStatus } from '../../enums/job.enum';
import { UPDATE_JOB } from '../../../apollo/user/mutation';

const MyProperties: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const [searchFilter, setSearchFilter] = useState<AgentJobsInquiry>(initialInput);
	const [agentProperties, setAgentProperties] = useState<Job[]>([]);
	const [total, setTotal] = useState<number>(0);
	const user = useReactiveVar(userVar);
	const router = useRouter();

	/** APOLLO REQUESTS **/
	const [updateProperty] = useMutation(UPDATE_JOB);
	const {
		loading: getAgentPropertiesLoading,
		data: getAgentPropertiesData,
		error: getAgentPropertiesError,
		refetch: getAgentPropertiesRefetch,
	} = useQuery(GET_AGENT_JOBS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setAgentProperties(data?.getAgentJobs?.list);
			setTotal(data?.getAgentJobs?.metaCounter[0]?.total);
		},
	});

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	const changeStatusHandler = (value: JobStatus) => {
		setSearchFilter({ ...searchFilter, search: { jobStatus: value } });
	};

	const deletePropertyHandler = async (id: string) => {
		try {
			if (await sweetConfirmAlert('Are you sure to delete this property?')) {
				await updateProperty({
					variables: {
						input: {
							_id: id,
							propertyStatus: 'DELETE',
						},
					},
				});

				await getAgentPropertiesRefetch({ input: searchFilter });
			}
		} catch (error) {
			await sweetErrorHandling(error);
		}
	};

	const updatePropertyHandler = async (status: string, id: string) => {
		try {
			if (await sweetConfirmAlert('Are you sure to update this property?')) {
				await updateProperty({
					variables: {
						input: {
							_id: id,
							propertyStatus: status,
						},
					},
				});

				await getAgentPropertiesRefetch({ input: searchFilter });
			}
		} catch (error) {
			await sweetErrorHandling(error);
		}
	};
	if (user?.memberType !== 'AGENT') {
		router.back();
	}

	if (device === 'mobile') {
		return <div>JobBoardAI PROPERTIES MOBILE</div>;
	} else {
		return (
			<div id="my-property-page" style={{ width: '100%', padding: '20px' }}>
				<Stack className="main-title-box" style={{ marginBottom: '30px' }}>
					<Stack className="right-box">
						<Typography className="main-title" style={{ 
							fontSize: '30px', 
							fontWeight: 600, 
							marginBottom: '10px',
							color: '#181a20'
						}}>
							My Posted Jobs
						</Typography>
						<Typography className="sub-title" style={{ 
							fontSize: '14px', 
							color: '#666',
							lineHeight: '1.5'
						}}>
							Manage your job postings and track their performance
						</Typography>
					</Stack>
				</Stack>
				
				<Stack className="property-list-box" style={{
					padding: '30px',
					borderRadius: '12px',
					border: '1px solid rgba(196, 196, 196, 0.79)',
					background: '#fff',
					boxShadow: '0px 1px 4px 0px rgba(24, 26, 32, 0.07)'
				}}>
					<Stack className="tab-name-box" style={{
						display: 'flex',
						gap: '40px',
						marginBottom: '30px',
						borderBottom: '1px solid #e5e7eb',
						paddingBottom: '15px'
					}}>
						<Typography
							onClick={() => changeStatusHandler(JobStatus.OPEN)}
							className={searchFilter.search.jobStatus === 'OPEN' ? 'active-tab-name' : 'tab-name'}
							style={{
								fontSize: '16px',
								fontWeight: searchFilter.search.jobStatus === 'OPEN' ? 600 : 400,
								color: searchFilter.search.jobStatus === 'OPEN' ? '#181a20' : '#666',
								cursor: 'pointer',
								padding: '8px 0',
								borderBottom: searchFilter.search.jobStatus === 'OPEN' ? '2px solid #181a20' : 'none',
								transition: 'all 0.2s ease'
							}}
						>
							Active Jobs
						</Typography>
						<Typography
							onClick={() => changeStatusHandler(JobStatus.CLOSED)}
							className={searchFilter.search.jobStatus === 'CLOSED' ? 'active-tab-name' : 'tab-name'}
							style={{
								fontSize: '16px',
								fontWeight: searchFilter.search.jobStatus === 'CLOSED' ? 600 : 400,
								color: searchFilter.search.jobStatus === 'CLOSED' ? '#181a20' : '#666',
								cursor: 'pointer',
								padding: '8px 0',
								borderBottom: searchFilter.search.jobStatus === 'CLOSED' ? '2px solid #181a20' : 'none',
								transition: 'all 0.2s ease'
							}}
						>
							Closed Jobs
						</Typography>
					</Stack>
					
					<Stack className="list-box">
						<Stack className="listing-title-box" style={{
							display: 'grid',
							gridTemplateColumns: searchFilter.search.jobStatus === 'OPEN' 
								? '2fr 1fr 1fr 1fr 1fr' 
								: '2fr 1fr 1fr 1fr',
							gap: '20px',
							padding: '15px 20px',
							background: '#f8f9fa',
							borderRadius: '8px',
							marginBottom: '20px',
							border: '1px solid #e5e7eb'
						}}>
							<Typography className="title-text" style={{ 
								fontSize: '14px', 
								fontWeight: 600, 
								color: '#181a20'
							}}>
								Job Title
							</Typography>
							<Typography className="title-text" style={{ 
								fontSize: '14px', 
								fontWeight: 600, 
								color: '#181a20'
							}}>
								Date Posted
							</Typography>
							<Typography className="title-text" style={{ 
								fontSize: '14px', 
								fontWeight: 600, 
								color: '#181a20'
							}}>
								Status
							</Typography>
							<Typography className="title-text" style={{ 
								fontSize: '14px', 
								fontWeight: 600, 
								color: '#181a20'
							}}>
								Views
							</Typography>
							{searchFilter.search.jobStatus === 'OPEN' && (
								<Typography className="title-text" style={{ 
									fontSize: '14px', 
									fontWeight: 600, 
									color: '#181a20'
								}}>
									Actions
								</Typography>
							)}
						</Stack>

						{agentProperties?.length === 0 ? (
							<div className={'no-data'} style={{
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								justifyContent: 'center',
								padding: '60px 20px',
								textAlign: 'center',
								color: '#666'
							}}>
								<img src="/img/icons/icoAlert.svg" alt="" style={{ 
									width: '60px', 
									height: '60px', 
									marginBottom: '20px',
									opacity: '0.6'
								}} />
								<p style={{ 
									fontSize: '16px', 
									margin: '0',
									color: '#666'
								}}>
									No jobs found!
								</p>
								<p style={{ 
									fontSize: '14px', 
									margin: '10px 0 0 0',
									color: '#999'
								}}>
									{searchFilter.search.jobStatus === 'OPEN' 
										? 'You haven\'t posted any active jobs yet.' 
										: 'You don\'t have any closed jobs yet.'
									}
								</p>
							</div>
						) : (
							<div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
								{agentProperties.map((property: Job, index: number) => {
									return (
										<div key={property._id || index} style={{
											display: 'grid',
											gridTemplateColumns: searchFilter.search.jobStatus === 'OPEN' 
												? '2fr 1fr 1fr 1fr 1fr' 
												: '2fr 1fr 1fr 1fr',
											gap: '20px',
											padding: '15px 20px',
											background: '#fff',
											borderRadius: '8px',
											border: '1px solid #e5e7eb',
											alignItems: 'center',
											transition: 'all 0.2s ease',
											boxShadow: undefined,
										}}
										onMouseEnter={e => {
											(e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
										}}
										onMouseLeave={e => {
											(e.currentTarget as HTMLDivElement).style.boxShadow = '';
										}}>
											<div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
												<Typography style={{ 
													fontSize: '16px', 
													fontWeight: 600, 
													color: '#181a20',
													cursor: 'pointer'
												}}>
													{property.positionTitle}
												</Typography>
												<Typography style={{ 
													fontSize: '14px', 
													color: '#666'
												}}>
													{property.companyName}
												</Typography>
											</div>
											
											<Typography style={{ 
												fontSize: '14px', 
												color: '#666'
											}}>
												{new Date(property.createdAt).toLocaleDateString()}
											</Typography>
											
											<div style={{
												padding: '4px 12px',
												borderRadius: '20px',
												background: property.jobStatus === 'OPEN' ? '#e8f5e8' : '#ffe8e8',
												color: property.jobStatus === 'OPEN' ? '#2d5a2d' : '#8b2d2d',
												fontSize: '12px',
												fontWeight: 600,
												textAlign: 'center',
												width: 'fit-content'
											}}>
												{property.jobStatus === 'OPEN' ? 'Active' : 'Closed'}
											</div>
											
											<Typography style={{ 
												fontSize: '14px', 
												color: '#666',
												textAlign: 'center'
											}}>
												{property.jobViews || 0}
											</Typography>
											
											{searchFilter.search.jobStatus === 'OPEN' && (
												<div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
													<button
														onClick={() => router.push(`/mypage?category=myProfile&jobId=${property._id}`)}
														style={{
															padding: '6px 12px',
															background: '#2563eb',
															color: '#fff',
															border: 'none',
															borderRadius: '6px',
															fontSize: '12px',
															cursor: 'pointer',
															transition: 'background 0.2s ease'
														}}
														onMouseOver={(e) => e.currentTarget.style.background = '#1d4ed8'}
														onMouseOut={(e) => e.currentTarget.style.background = '#2563eb'}
													>
														Edit
													</button>
													<button
														onClick={() => updatePropertyHandler('CLOSED', property._id)}
														style={{
															padding: '6px 12px',
															background: '#dc2626',
															color: '#fff',
															border: 'none',
															borderRadius: '6px',
															fontSize: '12px',
															cursor: 'pointer',
															transition: 'background 0.2s ease'
														}}
														onMouseOver={(e) => e.currentTarget.style.background = '#b91c1c'}
														onMouseOut={(e) => e.currentTarget.style.background = '#dc2626'}
													>
														Close
													</button>
													<button
														onClick={() => deletePropertyHandler(property._id)}
														style={{
															padding: '6px 12px',
															background: '#6b7280',
															color: '#fff',
															border: 'none',
															borderRadius: '6px',
															fontSize: '12px',
															cursor: 'pointer',
															transition: 'background 0.2s ease'
														}}
														onMouseOver={(e) => e.currentTarget.style.background = '#4b5563'}
														onMouseOut={(e) => e.currentTarget.style.background = '#6b7280'}
													>
														Delete
													</button>
												</div>
											)}
										</div>
									);
								})}
							</div>
						)}

						{agentProperties.length !== 0 && (
							<Stack className="pagination-config" style={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
								marginTop: '30px',
								paddingTop: '20px',
								borderTop: '1px solid #e5e7eb'
							}}>
								<Stack className="pagination-box">
									<Pagination
										count={Math.ceil(total / searchFilter.limit)}
										page={searchFilter.page}
										shape="circular"
										color="primary"
										onChange={paginationHandler}
									/>
								</Stack>
								<Stack className="total-result">
									<Typography style={{ 
										fontSize: '14px', 
										color: '#666'
									}}>
										{total} job{total !== 1 ? 's' : ''} available
									</Typography>
								</Stack>
							</Stack>
						)}
					</Stack>
				</Stack>
			</div>
		);
	}
};

MyProperties.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		search: {
			propertyStatus: 'ACTIVE',
		},
	},
};

export default MyProperties;

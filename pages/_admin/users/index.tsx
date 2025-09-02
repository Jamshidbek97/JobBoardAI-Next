import React, { useCallback, useEffect, useState } from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { MemberPanelList } from '../../../libs/components/admin/users/MemberList';
import { Box, InputAdornment, List, ListItem, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { TabContext } from '@mui/lab';
import OutlinedInput from '@mui/material/OutlinedInput';
import TablePagination from '@mui/material/TablePagination';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { MembersInquiry } from '../../../libs/types/member/member.input';
import { Member } from '../../../libs/types/member/member';
import { MemberStatus, MemberType } from '../../../libs/enums/member.enum';
import { sweetErrorHandling } from '../../../libs/sweetAlert';
import { MemberUpdate } from '../../../libs/types/member/member.update';
import { useMutation, useQuery } from '@apollo/client';
import { GET_ALL_MEMBERS_BY_ADMIN } from '../../../apollo/admin/query';
import { T } from '../../../libs/types/common';
import { UPDATE_MEMBER_BY_ADMIN } from '../../../apollo/admin/mutation';

const AdminUsers: NextPage = ({ initialInquiry, ...props }: any) => {
	const [anchorEl, setAnchorEl] = useState<[] | HTMLElement[]>([]);
	const [membersInquiry, setMembersInquiry] = useState<MembersInquiry>(initialInquiry);
	const [members, setMembers] = useState<Member[]>([]);
	const [membersTotal, setMembersTotal] = useState<number>(0);
	const [value, setValue] = useState(
		membersInquiry?.search?.memberStatus ? membersInquiry?.search?.memberStatus : 'ALL',
	);
	const [searchText, setSearchText] = useState('');
	const [searchType, setSearchType] = useState('ALL');

	/** APOLLO REQUESTS **/
	const [updateMemberByAdmin] = useMutation(UPDATE_MEMBER_BY_ADMIN);
	const {
		loading: getMembersLoading,
		data: getMembersData,
		error: getMembersError,
		refetch: getMembersRefetch,
	} = useQuery(GET_ALL_MEMBERS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: {
			input: membersInquiry,
		},
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setMembers(data?.getAllMembersByAdmin?.list);
			setMembersTotal(data?.getAllMembersByAdmin?.metaCounter[0]?.total);
		},
	});

	/** LIFECYCLE **/
	useEffect(() => {
		getMembersRefetch({ input: membersInquiry }).then();
	}, [membersInquiry]);

	/** HANDLERS **/
	const changePageHandler = async (event: unknown, newPage: number) => {
		membersInquiry.page = newPage + 1;
		getMembersRefetch({ input: membersInquiry }).then();
		setMembersInquiry({ ...membersInquiry });
	};

	const changeRowsPerPageHandler = async (event: React.ChangeEvent<HTMLInputElement>) => {
		membersInquiry.limit = parseInt(event.target.value, 10);
		membersInquiry.page = 1;
		setMembersInquiry({ ...membersInquiry });
	};

	const menuIconClickHandler = (e: any, index: number) => {
		const tempAnchor = anchorEl.slice();
		tempAnchor[index] = e.currentTarget;
		setAnchorEl(tempAnchor);
	};

	const menuIconCloseHandler = () => {
		setAnchorEl([]);
	};

	const tabChangeHandler = async (event: any, newValue: string) => {
		setValue(newValue);
		setSearchText('');

		setMembersInquiry({ ...membersInquiry, page: 1, sort: 'createdAt' });

		switch (newValue) {
			case 'ACTIVE':
				setMembersInquiry({ ...membersInquiry, search: { memberStatus: MemberStatus.ACTIVE } });
				break;
			case 'BLOCK':
				setMembersInquiry({ ...membersInquiry, search: { memberStatus: MemberStatus.BLOCK } });
				break;
			case 'DELETE':
				setMembersInquiry({ ...membersInquiry, search: { memberStatus: MemberStatus.DELETE } });
				break;
			default:
				delete membersInquiry?.search?.memberStatus;
				setMembersInquiry({ ...membersInquiry });
				break;
		}
	};

	const updateMemberHandler = async (updateData: MemberUpdate) => {
		try {
			await updateMemberByAdmin({
				variables: {
					input: updateData,
				},
			});
			await getMembersRefetch({ input: membersInquiry });
			menuIconCloseHandler();
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const textHandler = useCallback((value: string) => {
		try {
			setSearchText(value);
		} catch (err: any) {
			console.log('textHandler: ', err.message);
		}
	}, []);

	const searchTextHandler = () => {
		try {
			setMembersInquiry({
				...membersInquiry,
				search: {
					...membersInquiry.search,
					text: searchText,
				},
			});
		} catch (err: any) {
			console.log('searchTextHandler: ', err.message);
		}
	};

	const searchTypeHandler = async (newValue: string) => {
		try {
			setSearchType(newValue);

			if (newValue !== 'ALL') {
				setMembersInquiry({
					...membersInquiry,
					page: 1,
					sort: 'createdAt',
					search: {
						...membersInquiry.search,
						memberType: newValue as MemberType,
					},
				});
			} else {
				delete membersInquiry?.search?.memberType;
				setMembersInquiry({ ...membersInquiry });
			}
		} catch (err: any) {
			console.log('searchTypeHandler: ', err.message);
		}
	};

	return (
		<Box component={'div'} className={'content'} sx={{ p: 3, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
			{/* Header Section */}
			<Box sx={{ mb: 4 }}>
				<Typography 
					variant={'h3'} 
					sx={{ 
						fontWeight: 700, 
						color: '#1a237e',
						mb: 1,
						display: 'flex',
						alignItems: 'center',
						gap: 2
					}}
				>
					👥 User Management Dashboard
				</Typography>
				<Typography variant={'body1'} sx={{ color: '#666', fontSize: '1.1rem' }}>
					Monitor and manage all user accounts across the platform
				</Typography>
			</Box>

			{/* Stats Cards */}
			<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3, mb: 4 }}>
				<Box sx={{ 
					bg: 'white', 
					p: 3, 
					borderRadius: 3, 
					boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
					border: '1px solid #e0e0e0',
					textAlign: 'center'
				}}>
					<Typography variant={'h4'} sx={{ color: '#4caf50', fontWeight: 700, mb: 1 }}>
						{members?.filter(member => member.memberStatus === 'ACTIVE').length || 0}
					</Typography>
					<Typography variant={'body2'} sx={{ color: '#666' }}>Active Users</Typography>
				</Box>
				<Box sx={{ 
					bg: 'white', 
					p: 3, 
					borderRadius: 3, 
					boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
					border: '1px solid #e0e0e0',
					textAlign: 'center'
				}}>
					<Typography variant={'h4'} sx={{ color: '#ff9800', fontWeight: 700, mb: 1 }}>
						{members?.filter(member => member.memberStatus === 'BLOCK').length || 0}
					</Typography>
					<Typography variant={'body2'} sx={{ color: '#666' }}>Blocked Users</Typography>
				</Box>
				<Box sx={{ 
					bg: 'white', 
					p: 3, 
					borderRadius: 3, 
					boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
					border: '1px solid #e0e0e0',
					textAlign: 'center'
				}}>
					<Typography variant={'h4'} sx={{ color: '#f44336', fontWeight: 700, mb: 1 }}>
						{members?.filter(member => member.memberStatus === 'DELETE').length || 0}
					</Typography>
					<Typography variant={'body2'} sx={{ color: '#666' }}>Deleted Users</Typography>
				</Box>
				<Box sx={{ 
					bg: 'white', 
					p: 3, 
					borderRadius: 3, 
					boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
					border: '1px solid #e0e0e0',
					textAlign: 'center'
				}}>
					<Typography variant={'h4'} sx={{ color: '#2196f3', fontWeight: 700, mb: 1 }}>
						{membersTotal || 0}
					</Typography>
					<Typography variant={'body2'} sx={{ color: '#666' }}>Total Users</Typography>
				</Box>
			</Box>

			{/* Main Content Card */}
			<Box sx={{ 
				bg: 'white', 
				borderRadius: 4, 
				boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
				overflow: 'hidden',
				border: '1px solid #e0e0e0'
			}}>
				{/* Tab Navigation */}
				<Box sx={{ 
					borderBottom: '2px solid #f0f0f0',
					backgroundColor: '#fafafa'
				}}>
					<Box sx={{ display: 'flex', gap: 0 }}>
						{[
							{ value: 'ALL', label: 'All Users', color: '#666' },
							{ value: 'ACTIVE', label: 'Active', color: '#4caf50' },
							{ value: 'BLOCK', label: 'Blocked', color: '#ff9800' },
							{ value: 'DELETE', label: 'Deleted', color: '#f44336' }
						].map((tab) => (
							<Box
								key={tab.value}
								onClick={(e: any) => tabChangeHandler(e, tab.value)}
								sx={{
									flex: 1,
									p: 3,
									cursor: 'pointer',
									borderBottom: value === tab.value ? `3px solid ${tab.color}` : '3px solid transparent',
									backgroundColor: value === tab.value ? 'white' : 'transparent',
									transition: 'all 0.3s ease',
									'&:hover': {
										backgroundColor: value === tab.value ? 'white' : '#f5f5f5'
									}
								}}
							>
								<Typography 
									sx={{ 
										color: value === tab.value ? tab.color : '#666',
										fontWeight: value === tab.value ? 600 : 400,
										textAlign: 'center',
										fontSize: '1rem'
									}}
								>
									{tab.label}
								</Typography>
							</Box>
						))}
					</Box>
				</Box>

				{/* Search and Filter Section */}
				<Box sx={{ p: 3, borderBottom: '1px solid #f0f0f0' }}>
					<Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
						<OutlinedInput
							value={searchText}
							onChange={(e: any) => textHandler(e.target.value)}
							sx={{ 
								flex: 1, 
								minWidth: '300px',
								'& .MuiOutlinedInput-root': {
									borderRadius: 2,
									'&:hover .MuiOutlinedInput-notchedOutline': {
										borderColor: '#2196f3'
									}
								}
							}}
							placeholder="Search user name, email, or phone..."
							onKeyDown={(event: any) => {
								if (event.key == 'Enter') searchTextHandler();
							}}
							endAdornment={
								<>
									{searchText && (
										<CancelRoundedIcon
											style={{ cursor: 'pointer', color: '#999' }}
											onClick={async () => {
												setSearchText('');
												setMembersInquiry({
													...membersInquiry,
													search: {
														...membersInquiry.search,
														text: '',
													},
												});
												await getMembersRefetch({ input: membersInquiry });
											}}
										/>
									)}
									<InputAdornment position="end" onClick={() => searchTextHandler()}>
										<img src="/img/icons/search_icon.png" alt={'searchIcon'} style={{ cursor: 'pointer' }} />
									</InputAdornment>
								</>
							}
						/>
						<Select 
							value={searchType}
							sx={{ 
								minWidth: '160px',
								'& .MuiOutlinedInput-root': {
									borderRadius: 2
								}
							}}
						>
							<MenuItem value={'ALL'} onClick={() => searchTypeHandler('ALL')}>
								All Types
							</MenuItem>
							<MenuItem value={'USER'} onClick={() => searchTypeHandler('USER')}>
								Regular Users
							</MenuItem>
							<MenuItem value={'AGENT'} onClick={() => searchTypeHandler('AGENT')}>
								Agents
							</MenuItem>
							<MenuItem value={'ADMIN'} onClick={() => searchTypeHandler('ADMIN')}>
								Administrators
							</MenuItem>
						</Select>
					</Box>
				</Box>

				{/* Users Table */}
				<Box sx={{ p: 0 }}>
					<MemberPanelList
						members={members}
						anchorEl={anchorEl}
						menuIconClickHandler={menuIconClickHandler}
						menuIconCloseHandler={menuIconCloseHandler}
						updateMemberHandler={updateMemberHandler}
					/>
				</Box>

				{/* Pagination */}
				<Box sx={{ 
					p: 3, 
					borderTop: '1px solid #f0f0f0',
					backgroundColor: '#fafafa',
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center'
				}}>
					<Typography variant={'body2'} sx={{ color: '#666' }}>
						Showing {members?.length || 0} of {membersTotal || 0} users
					</Typography>
					<TablePagination
						rowsPerPageOptions={[10, 20, 50, 100]}
						component="div"
						count={membersTotal}
						rowsPerPage={membersInquiry?.limit}
						page={membersInquiry?.page - 1}
						onPageChange={changePageHandler}
						onRowsPerPageChange={changeRowsPerPageHandler}
						sx={{
							'& .MuiTablePagination-select': {
								borderRadius: 1
							}
						}}
					/>
				</Box>
			</Box>
		</Box>
	);
};

AdminUsers.defaultProps = {
	initialInquiry: {
		page: 1,
		limit: 10,
		sort: 'createdAt',
		search: {},
	},
};

export default withAdminLayout(AdminUsers);

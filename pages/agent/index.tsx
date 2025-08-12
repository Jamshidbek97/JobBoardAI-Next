import React, { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Stack, Box, Button, Pagination, TextField, InputAdornment, Typography } from '@mui/material';
import { Menu, MenuItem } from '@mui/material';
import {
	KeyboardArrowDownRounded as ArrowDownIcon,
	Search as SearchIcon,
	FilterList as FilterIcon,
	Business as BusinessIcon,
	People as PeopleIcon,
} from '@mui/icons-material';
import AgentCard from '../../libs/components/common/AgentCard';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Member } from '../../libs/types/member/member';
import { LIKE_TARGET_MEMBER, SUBSCRIBE, UNSUBSCRIBE } from '../../apollo/user/mutation';
import { useMutation, useQuery } from '@apollo/client';
import { GET_AGENTS } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { Messages } from '../../libs/config';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const HiringManagerList: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [filterSortName, setFilterSortName] = useState('Recent');
	const [sortingOpen, setSortingOpen] = useState(false);
	const [searchFilter, setSearchFilter] = useState<any>(
		router?.query?.input ? JSON.parse(router?.query?.input as string) : initialInput,
	);
	const [hiringManagers, setHiringManagers] = useState<Member[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [searchText, setSearchText] = useState<string>('');

	/** APOLLO REQUESTS **/
	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);
	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);

	const {
		loading: getAgentsLoading,
		data: getAgentsData,
		error: getAgentsError,
		refetch: getAgentsRefetch,
	} = useQuery(GET_AGENTS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setHiringManagers(data?.getAgents?.list);
			setTotal(data?.getAgents?.metaCounter[0]?.total);
		},
	});

	/** LIFECYCLE **/
	useEffect(() => {
		if (router.query.input) {
			const input_obj = JSON.parse(router?.query?.input as string);
			setSearchFilter(input_obj);
		} else
			router.replace(`/agent?input=${JSON.stringify(searchFilter)}`, `/agent?input=${JSON.stringify(searchFilter)}`);

		setCurrentPage(searchFilter.page === undefined ? 1 : searchFilter.page);
	}, [router]);

	/** HANDLERS **/
	const sortingClickHandler = (e: MouseEvent<HTMLElement>) => {
		setAnchorEl(e.currentTarget);
		setSortingOpen(true);
	};

	const sortingCloseHandler = () => {
		setSortingOpen(false);
		setAnchorEl(null);
	};

	const sortingHandler = (e: React.MouseEvent<HTMLLIElement>) => {
		switch (e.currentTarget.id) {
			case 'recent':
				setSearchFilter({ ...searchFilter, sort: 'createdAt', direction: 'DESC' });
				setFilterSortName('Recent');
				break;
			case 'old':
				setSearchFilter({ ...searchFilter, sort: 'createdAt', direction: 'ASC' });
				setFilterSortName('Oldest');
				break;
			case 'likes':
				setSearchFilter({ ...searchFilter, sort: 'memberLikes', direction: 'DESC' });
				setFilterSortName('Most Liked');
				break;
			case 'views':
				setSearchFilter({ ...searchFilter, sort: 'memberViews', direction: 'DESC' });
				setFilterSortName('Most Viewed');
				break;
			case 'followers':
				setSearchFilter({ ...searchFilter, sort: 'memberFollowers', direction: 'DESC' });
				setFilterSortName('Most Followed');
				break;
			case 'jobs':
				setSearchFilter({ ...searchFilter, sort: 'memberPostedJobs', direction: 'DESC' });
				setFilterSortName('Most Active');
				break;
		}

		setSortingOpen(false);
		setAnchorEl(null);
	};

	const paginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		searchFilter.page = value;
		await router.push(`/agent?input=${JSON.stringify(searchFilter)}`, `/agent?input=${JSON.stringify(searchFilter)}`, {
			scroll: false,
		});
		setCurrentPage(value);
	};

	const likeMemberHandler = async (user: any, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);

			await likeTargetMember({
				variables: {
					input: id,
				},
			});

			await getAgentsRefetch({ input: searchFilter });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR, likeMemberHandler', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const followMemberHandler = async (user: any, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);

			// Check if already following
			const targetManager = hiringManagers.find((manager) => manager._id === id);
			const isFollowing = targetManager?.meFollowed && targetManager.meFollowed.length > 0 && targetManager.meFollowed[0]?.myFollowing === true;

			if (isFollowing) {
				await unsubscribe({
					variables: {
						input: id,
					},
				});
				await sweetTopSmallSuccessAlert('Unfollowed successfully', 800);
			} else {
				await subscribe({
					variables: {
						input: id,
					},
				});
				await sweetTopSmallSuccessAlert('Followed successfully', 800);
			}

			await getAgentsRefetch({ input: searchFilter });
		} catch (err: any) {
			console.log('ERROR, followMemberHandler', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const handleSearch = () => {
		setSearchFilter({
			...searchFilter,
			search: { ...searchFilter.search, text: searchText },
		});
	};

	const handleSearchKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === 'Enter') {
			handleSearch();
		}
	};

	if (getAgentsLoading) {
		return (
			<Stack className="hiring-managers-page">
				<Stack className="container">
					<Box className="loading-state">
						<PeopleIcon className="loading-icon" />
						<Typography className="loading-text">Loading hiring managers...</Typography>
					</Box>
				</Stack>
			</Stack>
		);
	}

	if (device === 'mobile') {
		return <h1>HIRING MANAGERS PAGE MOBILE</h1>;
	} else {
		return (
			<Stack className="hiring-managers-page">
				<Stack className="container">
					{/* Page Header */}
					<Box className="page-header">
						<Box className="header-content">
							<BusinessIcon className="header-icon" />
							<Box className="header-text">
								<Typography className="page-title">Hiring Managers</Typography>
								<Typography className="page-subtitle">Connect with top recruiters and hiring managers</Typography>
							</Box>
						</Box>
						<Typography className="total-count">
							{total} hiring manager{total !== 1 ? 's' : ''} available
						</Typography>
					</Box>

					{/* Search and Filter Section */}
					<Stack className="search-filter-section">
						<Box className="search-box">
							<TextField
								fullWidth
								placeholder="Search for hiring managers, companies, or skills..."
								value={searchText}
								onChange={(e) => setSearchText(e.target.value)}
								onKeyDown={handleSearchKeyDown}
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<SearchIcon className="search-icon" />
										</InputAdornment>
									),
									endAdornment: (
										<InputAdornment position="end">
											<Button variant="contained" onClick={handleSearch} className="search-btn">
												Search
											</Button>
										</InputAdornment>
									),
								}}
								className="search-input"
							/>
						</Box>

						<Box className="filter-box">
							<Box className="filter-label">
								<FilterIcon className="filter-icon" />
								<Typography>Sort by</Typography>
							</Box>
							<Button onClick={sortingClickHandler} endIcon={<ArrowDownIcon />} className="sort-button">
								{filterSortName}
							</Button>
							<Menu anchorEl={anchorEl} open={sortingOpen} onClose={sortingCloseHandler} className="sort-menu">
								<MenuItem onClick={sortingHandler} id="recent" disableRipple>
									Recent
								</MenuItem>
								<MenuItem onClick={sortingHandler} id="old" disableRipple>
									Oldest
								</MenuItem>
								<MenuItem onClick={sortingHandler} id="likes" disableRipple>
									Most Liked
								</MenuItem>
								<MenuItem onClick={sortingHandler} id="views" disableRipple>
									Most Viewed
								</MenuItem>
								<MenuItem onClick={sortingHandler} id="followers" disableRipple>
									Most Followed
								</MenuItem>
								<MenuItem onClick={sortingHandler} id="jobs" disableRipple>
									Most Active
								</MenuItem>
							</Menu>
						</Box>
					</Stack>

					{/* Cards Grid */}
					<Stack className="cards-grid">
						{hiringManagers?.length === 0 ? (
							<Box className="no-data">
								<PeopleIcon className="no-data-icon" />
								<Typography className="no-data-title">No Hiring Managers Found</Typography>
								<Typography className="no-data-subtitle">
									Try adjusting your search criteria or check back later
								</Typography>
							</Box>
						) : (
							hiringManagers.map((manager: Member) => {
								return (
									<AgentCard
										key={manager._id}
										agent={manager}
										likeMemberHandler={likeMemberHandler}
										followMemberHandler={followMemberHandler}
									/>
								);
							})
						)}
					</Stack>

					{/* Pagination */}
					{hiringManagers.length > 0 && (
						<Stack className="pagination-section">
							<Pagination
								page={currentPage}
								count={Math.ceil(total / searchFilter.limit)}
								onChange={paginationChangeHandler}
								shape="circular"
								color="primary"
								className="pagination"
							/>
							<Typography className="pagination-info">
								Showing {(currentPage - 1) * searchFilter.limit + 1} to{' '}
								{Math.min(currentPage * searchFilter.limit, total)} of {total} hiring managers
							</Typography>
						</Stack>
					)}
				</Stack>
			</Stack>
		);
	}
};

HiringManagerList.defaultProps = {
	initialInput: {
		page: 1,
		limit: 3,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default withLayoutBasic(HiringManagerList);

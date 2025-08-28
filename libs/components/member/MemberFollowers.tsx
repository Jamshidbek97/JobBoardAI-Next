import React, { ChangeEvent, useEffect, useState } from 'react';
import { Box, Button, Pagination, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useRouter } from 'next/router';
import { FollowInquiry } from '../../types/follow/follow.input';
import { useQuery, useReactiveVar } from '@apollo/client';
import { Follower } from '../../types/follow/follow';
import { REACT_APP_API_URL } from '../../config';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { userVar } from '../../../apollo/store';
import { T } from '../../types/common';
import { GET_MEMBER_FOLLOWERS } from '../../../apollo/user/query';

interface MemberFollowsProps {
	initialInput: FollowInquiry;
	subscribeHandler: any;
	unsubscribeHandler: any;
	redirectToMemberPageHandler: any;
	likeMemberHandler: any;
}

const MemberFollowers = (props: MemberFollowsProps) => {
	const { initialInput, subscribeHandler, unsubscribeHandler, redirectToMemberPageHandler, likeMemberHandler } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [total, setTotal] = useState<number>(0);
	const category: any = router.query?.category ?? 'properties';
	const [followInquiry, setFollowInquiry] = useState<FollowInquiry>({
		...initialInput,
		search: {
			...initialInput.search,
			followingId: user?._id || ''
		}
	});
	const [memberFollowers, setMemberFollowers] = useState<Follower[]>([]);

	/** APOLLO REQUESTS **/
	const {
		loading: getFollowersLoading,
		data: getFollowersData,
		error: getFollowersError,
		refetch: getFollowersRefetch,
	} = useQuery(GET_MEMBER_FOLLOWERS, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: followInquiry,
		},
		skip: !followInquiry.search.followingId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setMemberFollowers(data?.getMemberFollowers?.list);
			setTotal(data?.getMemberFollowers?.metaCounter[0]?.total);
		},
	});
	/** LIFECYCLE **/
	useEffect(() => {
		if (router.query.memberId)
			setFollowInquiry({ ...followInquiry, search: { followingId: router.query.memberId as string } });
		else setFollowInquiry({ ...followInquiry, search: { followingId: user?._id } });
	}, [router]);

	useEffect(() => {
		getFollowersRefetch({ input: followInquiry }).then();
	}, [followInquiry]);

	/** HANDLERS **/
	const paginationHandler = async (event: ChangeEvent<unknown>, value: number) => {
		followInquiry.page = value;
		setFollowInquiry({ ...followInquiry });
	};

	if (device === 'mobile') {
		return <div>JobBoardAI FOLLOWS MOBILE</div>;
	} else {
		return (
			<div id="member-follows-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">{category === 'followers' ? 'Followers' : 'Followings'}</Typography>
					</Stack>
				</Stack>
				<Stack className="follows-list-box">
					{/* Error and Debug Info */}
					{getFollowersError && (
						<div style={{
							padding: '15px',
							background: '#fee',
							border: '1px solid #fcc',
							borderRadius: '8px',
							marginBottom: '20px',
							color: '#c33'
						}}>
							<strong>Error:</strong> {getFollowersError.message}
						</div>
					)}
					
					{getFollowersLoading && (
						<div style={{
							padding: '15px',
							textAlign: 'center',
							color: '#666'
						}}>
							Loading followers...
						</div>
					)}
					
					<Stack className="listing-title-box">
						<Typography className="title-text">Name</Typography>
						<Typography className="title-text">Details</Typography>
						<Typography className="title-text">Subscription</Typography>
					</Stack>
					{memberFollowers?.length === 0 && (
						<div className={'no-data'}>
							<img src="/img/icons/icoAlert.svg" alt="" />
							<p>No Followers yet!</p>
						</div>
					)}
					{memberFollowers.map((follower: Follower) => {
						const imagePath: string = follower?.followerData?.memberImage
							? `${REACT_APP_API_URL}/${follower?.followerData?.memberImage}`
							: '/img/profile/defaultUser.svg';
						

						return (
							<Stack className="follows-card-box" key={follower._id}>
								<Stack className={'info'} onClick={() => redirectToMemberPageHandler(follower?.followerData?._id)}>
									<Stack className="image-box">
										<img src={imagePath} alt="" />
									</Stack>
									<Stack className="information-box">
										<Typography className="name">{follower?.followerData?.memberNick}</Typography>
									</Stack>
								</Stack>
								<Stack className={'details-box'}>
									<Box className={'info-box'} component={'div'}>
										<p>Followers</p>
										<span>({follower?.followerData?.memberFollowers})</span>
									</Box>
									<Box className={'info-box'} component={'div'}>
										<p>Followings</p>
										<span>({follower?.followerData?.memberFollowings})</span>
									</Box>
									<Box className={'info-box'} component={'div'}>
										{follower?.meLiked && follower?.meLiked[0]?.myFavorite ? (
											<FavoriteIcon
												color="primary"
												onClick={() =>
													likeMemberHandler(follower?.followerData?._id, getFollowersRefetch, followInquiry)
												}
											/>
										) : (
											<FavoriteBorderIcon
												onClick={() =>
													likeMemberHandler(follower?.followerData?._id, getFollowersRefetch, followInquiry)
												}
											/>
										)}
										<span>({follower?.followerData?.memberLikes})</span>
									</Box>
								</Stack>
								{user?._id !== follower?.followerData?._id && (
									<Stack className="action-box">
										{/* Debug info */}
										<div style={{ fontSize: '8px', color: '#ccc', marginBottom: '2px' }}>
											meFollowed: {follower.meFollowed?.length || 0} items
										</div>
										
										{/* Check if current user is following this follower */}
										{follower.meFollowed && follower.meFollowed.length > 0 ? (
											<>
												<Typography sx={{ fontSize: '12px', color: '#666', mb: 1 }}>Following</Typography>
												<Button
													variant="outlined"
													size="small"
													sx={{ 
														background: '#ed5858', 
														color: '#fff',
														borderColor: '#ed5858',
														':hover': { 
															background: '#ee7171',
															borderColor: '#ee7171'
														} 
													}}
													onClick={() =>
														unsubscribeHandler(follower?.followerData?._id, getFollowersRefetch, followInquiry)
													}
												>
													Unfollow
												</Button>
											</>
										) : (
											<Button
												variant="contained"
												size="small"
												sx={{ 
													background: '#60eb60d4', 
													':hover': { background: '#60eb60d4' } 
												}}
												onClick={() =>
													subscribeHandler(follower?.followerData?._id, getFollowersRefetch, followInquiry)
												}
											>
												Follow
											</Button>
										)}
									</Stack>
								)}
							</Stack>
						);
					})}
				</Stack>
				{memberFollowers.length !== 0 && (
					<Stack className="pagination-config">
						<Stack className="pagination-box">
							<Pagination
								page={followInquiry.page}
								count={Math.ceil(total / followInquiry.limit)}
								onChange={paginationHandler}
								shape="circular"
								color="primary"
							/>
						</Stack>
						<Stack className="total-result">
							<Typography>{total} followers</Typography>
						</Stack>
					</Stack>
				)}
			</div>
		);
	}
};

MemberFollowers.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		search: {},
	},
};

export default MemberFollowers;

import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import { 
	Stack, 
	Box, 
	Container,
	Fade,
	CircularProgress,
	Typography
} from '@mui/material';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import MyProperties from '../../libs/components/mypage/MyProperties';
import MyFavorites from '../../libs/components/mypage/MyFavorites';
import RecentlyVisited from '../../libs/components/mypage/RecentlyVisited';
import MyProfile from '../../libs/components/mypage/MyProfile';
import MyArticles from '../../libs/components/mypage/MyArticles';
import { useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import MyMenu from '../../libs/components/mypage/MyMenu';
import WriteArticle from '../../libs/components/mypage/WriteArticle';
import MemberFollowers from '../../libs/components/member/MemberFollowers';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import MemberFollowings from '../../libs/components/member/MemberFollowings';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { LIKE_TARGET_MEMBER, SUBSCRIBE, UNSUBSCRIBE } from '../../apollo/user/mutation';
import { Messages } from '../../libs/config';
import AddProperty from '../../libs/components/mypage/AddNewProperty';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const MyPage: NextPage = () => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const category: any = router.query?.category ?? 'myProfile';

	/** APOLLO REQUESTS **/
	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);
	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);

	/** LIFECYCLE **/
	useEffect(() => {
		if (!user._id) router.push('/').then();
	}, [user]);

	/** HANDLERS **/
	const subscribeHandler = async (id: string, refetch: any, query: any) => {
		try {
			console.log('id: ', id);
			if (!id) throw new Error(Messages.error1);
			if (!user._id) throw new Error(Messages.error2);

			await subscribe({
				variables: {
					input: id,
				},
			});
			await sweetTopSmallSuccessAlert('Subscribed', 800);
			await refetch({ input: query });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const unsubscribeHandler = async (id: string, refetch: any, query: any) => {
		try {
			if (!id) throw new Error(Messages.error1);
			if (!user._id) throw new Error(Messages.error2);

			await unsubscribe({
				variables: {
					input: id,
				},
			});
			await sweetTopSmallSuccessAlert('Subscribed', 800);
			await refetch({ input: query });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const likeMemberHandler = async (id: string, refetch: any, query: any) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);

			await likeTargetMember({
				variables: {
					input: id,
				},
			});
			await sweetTopSmallSuccessAlert('Subscribed', 800);
			await refetch({ input: query });
		} catch (error: any) {
			console.log('Error: likeMemberHandler', error);
			sweetMixinErrorAlert(error.message).then();
		}
	};

	const redirectToMemberPageHandler = async (memberId: string) => {
		try {
			if (memberId === user?._id) await router.push(`/mypage?memberId=${memberId}`);
			else await router.push(`/member?memberId=${memberId}`);
		} catch (error) {
			await sweetErrorHandling(error);
		}
	};

	const getCategoryTitle = (category: string) => {
		switch (category) {
			case 'addProperty': return 'Create New Job';
			case 'myProperties': return 'My Posted Jobs';
			case 'myFavorites': return 'My Favorites';
			case 'recentlyVisited': return 'Recently Visited';
			case 'myArticles': return 'My Articles';
			case 'writeArticle': return 'Write Article';
			case 'myProfile': return 'My Profile';
			case 'followers': return 'My Followers';
			case 'followings': return 'My Followings';
			default: return 'My Profile';
		}
	};

	if (device === 'mobile') {
		return <div>MY PAGE MOBILE</div>;
	}

	return (
		<Box className="my-page" sx={{ 
			minHeight: '100vh',
			background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
			pt: 8,
			pb: 6
		}}>
			<Container maxWidth="xl">
				{/* Header Section */}
				<Box sx={{ mb: 4 }}>
					<Box sx={{ 
						display: 'flex', 
						alignItems: 'center', 
						justifyContent: 'space-between',
						p: 3,
						bgcolor: 'white',
						borderRadius: 3,
						boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
						mb: 4
					}}>
						<Box>
							<Typography variant="h3" sx={{ 
								fontWeight: 700, 
								color: '#1a1a1a',
								mb: 1
							}}>
								{getCategoryTitle(category)}
							</Typography>
							<Typography variant="body1" sx={{ color: '#666' }}>
								Manage your account, listings, and preferences
							</Typography>
						</Box>
					</Box>
				</Box>

				{/* Main Content */}
				<Box sx={{ display: 'flex', gap: 4 }}>
					{/* Sidebar */}
					<Box sx={{ 
						width: 320, 
						flexShrink: 0,
						position: 'sticky',
						top: 100,
						height: 'fit-content'
					}}>
						<MyMenu />
					</Box>

					{/* Main Content Area */}
					<Box sx={{ flex: 1 }}>
						<Fade in={true} timeout={500}>
							<Box sx={{ 
								bgcolor: 'white',
								borderRadius: 3,
								boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
								overflow: 'hidden'
							}}>
								{category === 'addProperty' && <AddProperty />}
								{category === 'myProperties' && <MyProperties />}
								{category === 'myFavorites' && <MyFavorites />}
								{category === 'recentlyVisited' && <RecentlyVisited />}
								{category === 'myArticles' && <MyArticles />}
								{category === 'writeArticle' && <WriteArticle />}
								{category === 'myProfile' && <MyProfile />}
								{category === 'followers' && (
									<MemberFollowers
										subscribeHandler={subscribeHandler}
										unsubscribeHandler={unsubscribeHandler}
										likeMemberHandler={likeMemberHandler}
										redirectToMemberPageHandler={redirectToMemberPageHandler}
									/>
								)}
								{category === 'followings' && (
									<MemberFollowings
										subscribeHandler={subscribeHandler}
										unsubscribeHandler={unsubscribeHandler}
										likeMemberHandler={likeMemberHandler}
										redirectToMemberPageHandler={redirectToMemberPageHandler}
									/>
								)}
							</Box>
						</Fade>
					</Box>
				</Box>
			</Container>
		</Box>
	);
};

export default withLayoutBasic(MyPage);

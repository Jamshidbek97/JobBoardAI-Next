import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Box, Stack, Typography, Button, Chip, Paper } from '@mui/material';
import {
	Support as SupportIcon,
	Notifications as NotificationsIcon,
	QuestionAnswer as QuestionAnswerIcon,
	Search as SearchIcon,
	Email as EmailIcon,
	Phone as PhoneIcon,
	Chat as ChatIcon,
	ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Notice from '../../libs/components/cs/Notice';
import Faq from '../../libs/components/cs/Faq';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const CS: NextPage = () => {
	const device = useDeviceDetect();
	const router = useRouter();

	/** HANDLERS **/
	const changeTabHandler = (tab: string) => {
		router.push(
			{
				pathname: '/cs',
				query: { tab: tab },
			},
			undefined,
			{ scroll: false },
		);
	};

	const handleContactClick = (type: string) => {
		// Handle different contact methods
		switch (type) {
			case 'email':
				window.location.href = 'mailto:support@jobboard.com';
				break;
			case 'phone':
				window.location.href = 'tel:+1234567890';
				break;
			case 'chat':
				// Open chat widget or redirect to chat page
				console.log('Opening chat...');
				break;
			default:
				break;
		}
	};

	const tab = router.query.tab ?? 'notice';

	if (device === 'mobile') {
		return <h1>CS PAGE MOBILE</h1>;
	} else {
		return (
			<Stack className={'cs-page'}>
				<Stack className={'container'}>
					{/* Hero Section */}
					<Box component={'div'} className={'cs-hero'}>
						<Box component={'div'} className={'hero-content'}>
							<Box component={'div'} className={'hero-left'}>
								<Chip 
									icon={<SupportIcon />} 
									label="Customer Support" 
									className={'support-badge'}
									color="primary"
								/>
								<Typography variant="h1" className={'hero-title'}>
									How can we help you today?
								</Typography>
								<Typography variant="body1" className={'hero-subtitle'}>
									We're here to help you find your dream job and navigate our platform with ease. 
									Get quick answers to common questions or reach out to our support team.
								</Typography>
								
								{/* Quick Contact Options */}
								<Box component={'div'} className={'quick-contact'}>
									<Button
										variant="outlined"
										startIcon={<EmailIcon />}
										onClick={() => handleContactClick('email')}
										className={'contact-btn'}
									>
										Email Support
									</Button>
									<Button
										variant="outlined"
										startIcon={<PhoneIcon />}
										onClick={() => handleContactClick('phone')}
										className={'contact-btn'}
									>
										Call Us
									</Button>
									<Button
										variant="outlined"
										startIcon={<ChatIcon />}
										onClick={() => handleContactClick('chat')}
										className={'contact-btn'}
									>
										Live Chat
									</Button>
								</Box>
							</Box>
							
							<Box component={'div'} className={'hero-right'}>
								<Box component={'div'} className={'hero-visual'}>
									<SupportIcon className={'hero-icon'} />
								</Box>
							</Box>
						</Box>
					</Box>

					{/* Search Section */}
					<Box component={'div'} className={'search-section'}>
						<Paper elevation={0} className={'search-container'}>
							<SearchIcon className={'search-icon'} />
							<input 
								type="text" 
								placeholder="Search for answers, topics, or keywords..."
								className={'search-input'}
							/>
							<Button variant="contained" className={'search-btn'}>
								Search
							</Button>
						</Paper>
					</Box>

					{/* Navigation Tabs */}
					<Box component={'div'} className={'cs-navigation'}>
						<Box component={'div'} className={'nav-tabs'}>
							<Button
								variant={tab === 'notice' ? 'contained' : 'outlined'}
								startIcon={<NotificationsIcon />}
								onClick={() => changeTabHandler('notice')}
								className={`nav-tab ${tab === 'notice' ? 'active' : ''}`}
							>
								Announcements & Updates
							</Button>
							<Button
								variant={tab === 'faq' ? 'contained' : 'outlined'}
								startIcon={<QuestionAnswerIcon />}
								onClick={() => changeTabHandler('faq')}
								className={`nav-tab ${tab === 'faq' ? 'active' : ''}`}
							>
								Frequently Asked Questions
							</Button>
						</Box>
					</Box>

					{/* Content Section */}
					<Box component={'div'} className={'cs-content'}>
						{tab === 'notice' && <Notice />}
						{tab === 'faq' && <Faq />}
					</Box>

					{/* Help Section */}
					<Box component={'div'} className={'help-section'}>
						<Paper elevation={0} className={'help-card'}>
							<Box component={'div'} className={'help-content'}>
								<Typography variant="h3" className={'help-title'}>
									Still need help?
								</Typography>
								<Typography variant="body1" className={'help-text'}>
									Can't find what you're looking for? Our support team is ready to help you with any questions or concerns.
								</Typography>
								<Button
									variant="contained"
									endIcon={<ArrowForwardIcon />}
									onClick={() => handleContactClick('email')}
									className={'help-btn'}
								>
									Contact Support
								</Button>
							</Box>
						</Paper>
					</Box>
				</Stack>
			</Stack>
		);
	}
};

export default withLayoutBasic(CS);

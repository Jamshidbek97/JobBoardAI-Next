import React from 'react';
import { Stack, Box, Typography, Chip, Paper } from '@mui/material';
import {
	Notifications as NotificationsIcon,
	Event as EventIcon,
	Info as InfoIcon,
} from '@mui/icons-material';
import useDeviceDetect from '../../hooks/useDeviceDetect';

const Notice = () => {
	const device = useDeviceDetect();

	/** APOLLO REQUESTS **/
	/** LIFECYCLES **/
	/** HANDLERS **/

	const data = [
		{
			no: 1,
			event: true,
			title: '🎉 New Feature: AI-Powered Job Matching',
			subtitle: 'Find your perfect job match with our advanced AI algorithm',
			date: '2024-01-15',
			category: 'feature',
		},
		{
			no: 2,
			title: '📢 Platform Maintenance Notice',
			subtitle: 'Scheduled maintenance on January 20th, 2024',
			date: '2024-01-10',
			category: 'maintenance',
		},
		{
			no: 3,
			title: '💼 New Job Categories Added',
			subtitle: 'Explore opportunities in emerging tech fields',
			date: '2024-01-08',
			category: 'update',
		},
		{
			no: 4,
			title: '🔒 Enhanced Security Features',
			subtitle: 'Your data protection is our top priority',
			date: '2024-01-05',
			category: 'security',
		},
	];

	const getCategoryIcon = (category: string) => {
		switch (category) {
			case 'feature':
				return <EventIcon />;
			case 'maintenance':
				return <InfoIcon />;
			case 'update':
				return <NotificationsIcon />;
			case 'security':
				return <InfoIcon />;
			default:
				return <NotificationsIcon />;
		}
	};

	const getCategoryColor = (category: string) => {
		switch (category) {
			case 'feature':
				return '#10b981';
			case 'maintenance':
				return '#f59e0b';
			case 'update':
				return '#3b82f6';
			case 'security':
				return '#ef4444';
			default:
				return '#6b7280';
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	if (device === 'mobile') {
		return <div>NOTICE MOBILE</div>;
	} else {
		return (
			<Stack className={'notice-content'}>
				<Box component={'div'} className={'notice-header'}>
					<Typography variant="h2" className={'notice-title'}>
						Latest Updates & Announcements
					</Typography>
					<Typography variant="body1" className={'notice-subtitle'}>
						Stay informed about new features, updates, and important information
					</Typography>
				</Box>

				<Stack className={'notice-grid'}>
					{data.map((item: any) => (
						<Paper key={item.title} className={`notice-card ${item?.event ? 'event' : ''}`} elevation={0}>
							<Box component={'div'} className={'notice-card-header'}>
								<Box component={'div'} className={'notice-meta'}>
									{item?.event ? (
										<Chip
											icon={<EventIcon />}
											label="New Feature"
											className={'event-badge'}
											style={{ backgroundColor: getCategoryColor(item.category) }}
										/>
									) : (
										<Box component={'div'} className={'notice-number'}>
											{getCategoryIcon(item.category)}
										</Box>
									)}
									<Chip
										label={item.category}
										size="small"
										className={'category-badge'}
										style={{ 
											backgroundColor: `${getCategoryColor(item.category)}20`,
											color: getCategoryColor(item.category),
											border: `1px solid ${getCategoryColor(item.category)}40`
										}}
									/>
								</Box>
								<Typography variant="caption" className={'notice-date'}>
									{formatDate(item.date)}
								</Typography>
							</Box>

							<Box component={'div'} className={'notice-card-content'}>
								<Typography variant="h6" className={'notice-card-title'}>
									{item.title}
								</Typography>
								<Typography variant="body2" className={'notice-card-subtitle'}>
									{item.subtitle}
								</Typography>
							</Box>

							<Box component={'div'} className={'notice-card-footer'}>
								<Typography variant="caption" className={'read-more'}>
									Read more →
								</Typography>
							</Box>
						</Paper>
					))}
				</Stack>

				<Box component={'div'} className={'notice-footer'}>
					<Typography variant="body2" className={'footer-text'}>
						Want to stay updated? Subscribe to our newsletter for the latest news and updates.
					</Typography>
				</Box>
			</Stack>
		);
	}
};

export default Notice;

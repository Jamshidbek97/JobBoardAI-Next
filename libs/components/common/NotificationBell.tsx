// @ts-nocheck
import React, { useState, useEffect } from 'react';
import type { SxProps, Theme } from '@mui/material/styles';

// CSS styles to avoid TypeScript sx prop complexity
const styles = {
	notificationHeader: {
		padding: '16px',
		borderBottom: '1px solid #e0e0e0',
	},
	notificationTitle: {
		fontWeight: 600,
	},
	notificationContentContainer: {
		maxHeight: '400px',
		overflow: 'auto',
	},
	debugInfo: {
		padding: '16px',
		backgroundColor: '#e3f2fd',
		color: '#1976d2',
		marginBottom: '16px',
	},
	errorDisplay: {
		padding: '16px',
		backgroundColor: '#ffebee',
		color: '#d32f2f',
		marginBottom: '16px',
	},
	loadingContainer: {
		display: 'flex',
		justifyContent: 'center',
		padding: '24px',
	},
	emptyContainer: {
		padding: '24px',
		textAlign: 'center',
	},
	notificationItem: {
		display: 'flex',
		alignItems: 'flex-start',
		padding: '16px',
		borderBottom: '1px solid #e0e0e0',
	},
	notificationIcon: {
		width: '48px',
		height: '48px',
		borderRadius: '50%',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		fontSize: '24px',
		flexShrink: 0,
	},
	notificationContentInner: {
		flex: 1,
		minWidth: 0,
		paddingRight: '16px',
	},
	notificationTitleText: {
		fontWeight: 400,
		marginBottom: '8px',
		lineHeight: 1.4,
		fontSize: '0.95rem',
	},
	notificationMessage: {
		display: '-webkit-box',
		WebkitLineClamp: 3,
		WebkitBoxOrient: 'vertical',
		overflow: 'hidden',
		lineHeight: 1.3,
		marginBottom: '8px',
		fontSize: '0.875rem',
	},
	notificationTime: {
		marginTop: '4px',
		display: 'block',
		fontSize: '0.75rem',
		opacity: 0.8,
	},
	footer: {
		padding: '16px',
		borderTop: '1px solid #e0e0e0',
	},
};
import {
	Badge,
	IconButton,
	Menu,
	MenuItem,
	Typography,
	Box,
	Stack,
	Button,
	Divider,
	CircularProgress,
	Alert,
	Avatar,
} from '@mui/material';
import {
	Notifications as NotificationsIcon,
	CheckCircle as CheckIcon,
	Delete as DeleteIcon,
	MoreVert as MoreIcon,
} from '@mui/icons-material';
import { useQuery, useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { GET_NOTIFICATIONS, GET_UNREAD_NOTIFICATIONS_COUNT, GET_ALL_NOTIFICATIONS } from '../../../apollo/user/query';
import { MARK_NOTIFICATIONS_AS_READ, MARK_ALL_NOTIFICATIONS_AS_READ, DELETE_NOTIFICATIONS } from '../../../apollo/user/mutation';
import { Notification, getNotificationIcon } from '../../types/notification/notification';
import { REACT_APP_API_URL } from '../../config';
import { useTranslationUtils } from '../../utils/translationUtils';
import Image from 'next/image';

// Helper function to safely type sx props
const safeSx = (styles: any) => styles;

const NotificationBell: React.FC = () => {
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const { t, formatTimeAgo } = useTranslationUtils();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

	const { data: notificationsData, loading, refetch, error: notificationsError } = useQuery(GET_NOTIFICATIONS, {
		variables: {
			input: {
				page: 1,
				limit: 10,
			},
		},
		skip: !user?._id,
		// Remove polling to prevent constant requests
		// pollInterval: 30000,
		fetchPolicy: 'cache-first', // Use cache first, only fetch if no data
		onError: (error) => {
			console.error('NotificationBell - GET_NOTIFICATIONS error:', error);
		},
		onCompleted: (data) => {
			console.log('NotificationBell - GET_NOTIFICATIONS completed:', data);
			if (data?.getNotifications) {
				console.log('Raw notifications response:', JSON.stringify(data.getNotifications, null, 2));
			}
		}
	});

	const { data: unreadCountData, refetch: refetchCount, error: unreadCountError } = useQuery(GET_UNREAD_NOTIFICATIONS_COUNT, {
		skip: !user?._id,
		// Remove polling to prevent constant requests
		// pollInterval: 30000,
		fetchPolicy: 'cache-first', // Use cache first, only fetch if no data
		onError: (error) => {
			console.error('NotificationBell - GET_UNREAD_NOTIFICATIONS_COUNT error:', error);
		},
		onCompleted: (data) => {
			console.log('NotificationBell - GET_UNREAD_NOTIFICATIONS_COUNT completed:', data);
		}
	});



	const [markAsRead] = useMutation(MARK_NOTIFICATIONS_AS_READ);
	const [markAllAsRead] = useMutation(MARK_ALL_NOTIFICATIONS_AS_READ);
	const [deleteNotifications] = useMutation(DELETE_NOTIFICATIONS);

	// Filter to show only unread notifications when bell is opened
	const allNotifications = notificationsData?.getNotifications?.list || [];
	const notifications = allNotifications.filter((notification: Notification) => !notification.isRead);
	const unreadCount = unreadCountData?.getUnreadNotificationsCount?.count || 0;

	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
		// Refresh notifications when opening the menu
		refetch();
		refetchCount();
	};

	const handleClose = () => {
		setAnchorEl(null);
		setSelectedNotifications([]);
	};

	const handleNotificationClick = async (notification: Notification) => {
		if (!notification.isRead) {
			try {
				const result = await markAsRead({
					variables: {
						input: {
							notificationIds: [notification._id],
						},
					},
				});
				
				if (result.data?.markNotificationsAsRead) {
					console.log('Notification marked as read successfully');
					// Force refetch to update the UI immediately
					await Promise.all([refetch(), refetchCount()]);
				}
			} catch (error) {
				console.error('Error marking notification as read:', error);
			}
		}

		// Navigate based on notification type
		if (notification.relatedEntityId && notification.relatedEntityType) {
			switch (notification.relatedEntityType) {
				case 'JOB':
					router.push(`/jobs/${notification.relatedEntityId}`);
					break;
				case 'MEMBER':
					router.push(`/member/${notification.relatedEntityId}`);
					break;
				case 'ARTICLE':
					router.push(`/community/${notification.relatedEntityId}`);
					break;
				default:
					break;
			}
		}

		handleClose();
	};

	const handleMarkAllAsRead = async () => {
		try {
			const result = await markAllAsRead();
			
			if (result.data?.markAllNotificationsAsRead) {
				console.log('All notifications marked as read successfully');
				// Force refetch to update the UI immediately
				await Promise.all([refetch(), refetchCount()]);
			}
		} catch (error) {
			console.error('Error marking all notifications as read:', error);
		}
	};

	const handleDeleteSelected = async () => {
		if (selectedNotifications.length === 0) return;

		try {
			const result = await deleteNotifications({
				variables: {
					input: {
						notificationIds: selectedNotifications,
					},
				},
			});
			
			if (result.data?.deleteNotifications) {
				console.log('Notifications deleted successfully');
				setSelectedNotifications([]);
				// Force refetch to update the UI immediately
				await Promise.all([refetch(), refetchCount()]);
			}
		} catch (error) {
			console.error('Error deleting notifications:', error);
		}
	};

	const handleSelectNotification = (notificationId: string) => {
		setSelectedNotifications(prev => 
			prev.includes(notificationId)
				? prev.filter(id => id !== notificationId)
				: [...prev, notificationId]
		);
	};



	// Debug logging - only run once on mount and when user changes
	useEffect(() => {
		console.log('NotificationBell - User:', user);
	}, [user]);

	// Debug logging for notifications - only run when data actually changes
	useEffect(() => {
		if (notificationsData) {
			console.log('NotificationBell - Notifications data:', notificationsData);
		}
		if (unreadCountData) {
			console.log('NotificationBell - Unread count data:', unreadCountData);
		}
		if (notificationsError) {
			console.error('NotificationBell - Notifications error:', notificationsError);
		}
		if (unreadCountError) {
			console.error('NotificationBell - Unread count error:', unreadCountError);
		}
	}, [notificationsData, unreadCountData, notificationsError, unreadCountError]);

	if (!user) return null;

	return (
		<>
			<IconButton
				color="inherit"
				onClick={handleClick}
				sx={{ position: 'relative' }}
			>
				<Badge badgeContent={unreadCount} color="error" max={99}>
					<NotificationsIcon />
				</Badge>
			</IconButton>

			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={handleClose}
				PaperProps={{
					sx: {
						width: 500, // Increased from 400 to 500
						maxHeight: 500,
					},
				}}
				transformOrigin={{ horizontal: 'right', vertical: 'top' }}
				anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
			>
				<Box sx={styles.notificationHeader}>
					<Stack direction="row" justifyContent="space-between" alignItems="center">
						<Typography variant="h6" className="notification-title">
							{t('Notifications')}
						</Typography>
						<Stack direction="row" spacing={1}>
							<Button
								size="small"
								startIcon={<CheckIcon />}
								onClick={() => {
									refetch();
									refetchCount();
								}}
								color="primary"
							>
								{t('Refresh')}
							</Button>
							{selectedNotifications.length > 0 && (
								<Button
									size="small"
									startIcon={<DeleteIcon />}
									onClick={handleDeleteSelected}
									color="error"
								>
									{t('Delete')}
								</Button>
							)}
							{unreadCount > 0 && (
								<Button
									size="small"
									startIcon={<CheckIcon />}
									onClick={handleMarkAllAsRead}
								>
									{t('Mark all read')}
								</Button>
							)}
						</Stack>
					</Stack>
				</Box>

				<Box sx={styles.notificationContentContainer}>
					{/* Debug Info */}
					<Box sx={styles.debugInfo}>
						<Typography variant="body2">
							Debug: Unread: {unreadCount} | Showing: {notifications.length} | Total: {allNotifications.length}
						</Typography>
					</Box>
					
					{/* Error Display */}
					{(notificationsError || unreadCountError) && (
						<Box sx={styles.errorDisplay}>
							<Typography variant="body2">
								Error loading notifications. Check console for details.
							</Typography>
						</Box>
					)}
					
					{loading ? (
						<Box sx={styles.loadingContainer}>
							<CircularProgress size={24} />
						</Box>
					) : notifications.length === 0 ? (
						<Box sx={styles.emptyContainer}>
							<Typography color="text.secondary" sx={{ mb: 1 }}>
								{t('No unread notifications')}
							</Typography>
							<Typography variant="caption" color="text.secondary">
								You have {allNotifications.length} total notifications
							</Typography>
						</Box>
					) : (
						notifications.map((notification: Notification) => {
							const icon = getNotificationIcon(notification.type);
							const isSelected = selectedNotifications.includes(notification._id);

							return (
								<MenuItem
									key={notification._id}
									onClick={() => handleNotificationClick(notification)}
									sx={{
										display: 'flex',
										alignItems: 'flex-start',
										p: 2,
										borderBottom: 1,
										borderColor: 'divider',
										backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
										'&:hover': {
											backgroundColor: 'action.selected',
										},
									} as any}
								>
									<Stack direction="row" spacing={3} sx={safeSx({ width: '100%' })}>
										{/* Notification Icon */}
										<Box
											sx={{
												width: 48, // Increased from 40 to 48
												height: 48, // Increased from 40 to 48
												borderRadius: '50%',
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												backgroundColor: `${icon.color}20`,
												color: icon.color,
												fontSize: 24, // Increased from 20 to 24
												flexShrink: 0,
											} as any}
										>
											{icon.icon}
										</Box>

										{/* Notification Content */}
										<Box sx={safeSx({ flex: 1, minWidth: 0, pr: 2 })}>
											<Typography
												variant="body2"
												sx={{
													fontWeight: notification.isRead ? 400 : 600,
													mb: 1,
													lineHeight: 1.4,
													fontSize: '0.95rem',
												} as any}
											>
												{notification.title}
											</Typography>
											<Typography
												variant="body2"
												color="text.secondary"
												sx={{
													display: '-webkit-box',
													WebkitLineClamp: 3, // Increased from 2 to 3
													WebkitBoxOrient: 'vertical',
													overflow: 'hidden',
													lineHeight: 1.3,
													mb: 1,
													fontSize: '0.875rem',
												} as any}
											>
												{notification.message}
											</Typography>
											<Typography
												variant="caption"
												color="text.secondary"
												sx={{ 
													mt: 0.5, 
													display: 'block',
													fontSize: '0.75rem',
													opacity: 0.8
												} as any}
											>
												{formatTimeAgo(notification.createdAt)}
											</Typography>
										</Box>

										{/* Action Menu */}
										<IconButton
											size="small"
											onClick={(e: React.MouseEvent) => {
												e.stopPropagation();
												handleSelectNotification(notification._id);
											}}
											sx={{
												color: isSelected ? 'primary.main' : 'text.secondary',
											} as any}
										>
											<MoreIcon fontSize="small" />
										</IconButton>
									</Stack>
								</MenuItem>
							);
						})
					)}
				</Box>

				{notifications.length > 0 && (
					<Box sx={safeSx({ p: 2, borderTop: 1, borderColor: 'divider' })}>
						<Button
							fullWidth
							onClick={() => {
								handleClose();
								router.push('/mypage/notifications');
							}}
						>
							{t('View All Notifications')} ({allNotifications.length})
						</Button>
					</Box>
				)}
			</Menu>
		</>
	);
};

export default NotificationBell;

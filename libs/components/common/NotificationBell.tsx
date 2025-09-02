import React, { useState, useEffect } from 'react';
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

	// Test query to get all notifications without filters
	const { data: testNotificationsData, loading: testLoading } = useQuery(GET_ALL_NOTIFICATIONS, {
		skip: !user?._id,
		fetchPolicy: 'cache-first', // Use cache first
		onCompleted: (data) => {
			console.log('Test query - GET_ALL_NOTIFICATIONS completed:', data);
			if (data?.getNotifications) {
				console.log('Test query - Raw response:', JSON.stringify(data.getNotifications, null, 2));
			}
		}
	});

	const [markAsRead] = useMutation(MARK_NOTIFICATIONS_AS_READ);
	const [markAllAsRead] = useMutation(MARK_ALL_NOTIFICATIONS_AS_READ);
	const [deleteNotifications] = useMutation(DELETE_NOTIFICATIONS);

	const notifications = notificationsData?.getNotifications?.list || [];
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
				await markAsRead({
					variables: {
						input: {
							notificationIds: [notification._id],
						},
					},
				});
				refetch();
				refetchCount();
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
			await markAllAsRead();
			refetch();
			refetchCount();
		} catch (error) {
			console.error('Error marking all notifications as read:', error);
		}
	};

	const handleDeleteSelected = async () => {
		if (selectedNotifications.length === 0) return;

		try {
			await deleteNotifications({
				variables: {
					input: {
						notificationIds: selectedNotifications,
					},
				},
			});
			setSelectedNotifications([]);
			refetch();
			refetchCount();
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
						width: 400,
						maxHeight: 500,
					},
				}}
				transformOrigin={{ horizontal: 'right', vertical: 'top' }}
				anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
			>
				<Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
					<Stack direction="row" justifyContent="space-between" alignItems="center">
						<Typography variant="h6" sx={{ fontWeight: 600 }}>
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

				<Box sx={{ maxHeight: 400, overflow: 'auto' }}>
					{/* Debug Info */}
					<Box sx={{ p: 2, bgcolor: 'info.light', color: 'info.contrastText', mb: 2 }}>
						<Typography variant="body2">
							Debug: Unread: {unreadCount} | Notifications: {notifications.length} | Test: {testNotificationsData?.getNotifications?.list?.length || 0}
						</Typography>
					</Box>
					
					{/* Error Display */}
					{(notificationsError || unreadCountError) && (
						<Box sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText', mb: 2 }}>
							<Typography variant="body2">
								Error loading notifications. Check console for details.
							</Typography>
						</Box>
					)}
					
					{loading ? (
						<Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
							<CircularProgress size={24} />
						</Box>
					) : notifications.length === 0 ? (
						<Box sx={{ p: 3, textAlign: 'center' }}>
							<Typography color="text.secondary">
								{t('No new notifications')}
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
									} as const}
								>
									<Stack direction="row" spacing={2} sx={{ width: '100%' }}>
										{/* Notification Icon */}
										<Box
											sx={{
												width: 40,
												height: 40,
												borderRadius: '50%',
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												backgroundColor: `${icon.color}20`,
												color: icon.color,
												fontSize: 20,
												flexShrink: 0,
											} as const}
										>
											{icon.icon}
										</Box>

										{/* Notification Content */}
										<Box sx={{ flex: 1, minWidth: 0 }}>
											<Typography
												variant="body2"
												sx={{
													fontWeight: notification.isRead ? 400 : 600,
													mb: 0.5,
													lineHeight: 1.3,
												} as const}
											>
												{notification.title}
											</Typography>
											<Typography
												variant="caption"
												color="text.secondary"
												sx={{
													display: '-webkit-box',
													WebkitLineClamp: 2,
													WebkitBoxOrient: 'vertical',
													overflow: 'hidden',
													lineHeight: 1.2,
												} as const}
											>
												{notification.message}
											</Typography>
											<Typography
												variant="caption"
												color="text.secondary"
												sx={{ mt: 0.5, display: 'block' }}
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
											} as const}
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
					<Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
						<Button
							fullWidth
							onClick={() => {
								handleClose();
								router.push('/mypage/notifications');
							}}
						>
							{t('View All Notifications')}
						</Button>
					</Box>
				)}
			</Menu>
		</>
	);
};

export default NotificationBell;

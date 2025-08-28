import React, { useState } from 'react';
import type { NextPage } from 'next';
import { useQuery, useMutation } from '@apollo/client';
import {
	Box,
	Typography,
	Paper,
	Stack,
	Button,
	TextField,
	InputAdornment,
	Card,
	CardContent,
	IconButton,
	Alert,
	CircularProgress,
	Pagination,
	FormControl,
	InputLabel,
	Select,
	Chip,
	Checkbox,
	Divider,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
    MenuItem,
} from '@mui/material';
import {
	Search as SearchIcon,
	FilterList as FilterIcon,
	CheckCircle as CheckIcon,
	Delete as DeleteIcon,
	MoreVert as MoreIcon,
	Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { GET_NOTIFICATIONS } from '../../apollo/user/query';
import { MARK_NOTIFICATIONS_AS_READ, MARK_ALL_NOTIFICATIONS_AS_READ, DELETE_NOTIFICATIONS } from '../../apollo/user/mutation';
import { Notification, NotificationType, getNotificationIcon } from '../../libs/types/notification/notification';
import { REACT_APP_API_URL } from '../../libs/config';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useTranslationUtils } from '../../libs/utils/translationUtils';

const NotificationsPage: NextPage = () => {
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const { t, formatTimeAgo, getNotificationTypeLabel } = useTranslationUtils();
	const [currentPage, setCurrentPage] = useState(1);
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('ALL');
	const [typeFilter, setTypeFilter] = useState('ALL');
	const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	const { data, loading, error, refetch } = useQuery(GET_NOTIFICATIONS, {
		variables: {
			input: {
				page: currentPage,
				limit: 20,
				search: {
					...((searchTerm && { search: searchTerm }) || {}),
					...((statusFilter !== 'ALL' && { isRead: statusFilter === 'READ' }) || {}),
					...((typeFilter !== 'ALL' && { type: typeFilter }) || {}),
				},
			},
		},
		skip: !user?._id,
	});

	const [markAsRead] = useMutation(MARK_NOTIFICATIONS_AS_READ);
	const [markAllAsRead] = useMutation(MARK_ALL_NOTIFICATIONS_AS_READ);
	const [deleteNotifications] = useMutation(DELETE_NOTIFICATIONS);

	const notifications = data?.getNotifications?.list || [];
	const totalNotifications = data?.getNotifications?.metaCounter?.total || 0;
	const totalPages = Math.ceil(totalNotifications / 20);

	const handleMarkAsRead = async (notificationIds: string[]) => {
		try {
			await markAsRead({
				variables: {
					input: { notificationIds },
				},
			});
			refetch();
		} catch (error) {
			console.error('Error marking notifications as read:', error);
		}
	};

	const handleMarkAllAsRead = async () => {
		try {
			await markAllAsRead();
			refetch();
		} catch (error) {
			console.error('Error marking all notifications as read:', error);
		}
	};

	const handleDeleteSelected = async () => {
		if (selectedNotifications.length === 0) return;

		try {
			await deleteNotifications({
				variables: {
					input: { notificationIds: selectedNotifications },
				},
			});
			setSelectedNotifications([]);
			setDeleteDialogOpen(false);
			refetch();
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

	const handleSelectAll = () => {
		if (selectedNotifications.length === notifications.length) {
			setSelectedNotifications([]);
		} else {
			setSelectedNotifications(notifications.map((n: Notification) => n._id));
		}
	};

	const handleNotificationClick = async (notification: Notification) => {
		if (!notification.isRead) {
			await handleMarkAsRead([notification._id]);
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
	};



	if (!user) {
		return (
			<Box sx={{ p: 3, textAlign: 'center' }}>
				<Alert severity="warning">
					{t('Please log in to view your notifications.')}
				</Alert>
			</Box>
		);
	}

	return (
		<Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
			{/* Header */}
			<Box sx={{ mb: 4 }}>
				<Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
					{t('Notifications')}
				</Typography>
				<Typography variant="body1" color="text.secondary">
					{t('Stay updated with your latest activities and updates')}
				</Typography>
			</Box>

			{/* Filters and Actions */}
			<Paper sx={{ p: 3, mb: 3 }}>
				<Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" sx={{ mb: 3 }}>
					<TextField
						placeholder={t('Search notifications...')}
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<SearchIcon />
								</InputAdornment>
							),
						}}
						sx={{ flex: 1 }}
					/>
					<FormControl sx={{ minWidth: 150 }}>
						<InputLabel>{t('Status')}</InputLabel>
						<Select
							value={statusFilter}
							label={t('Status')}
							onChange={(e) => setStatusFilter(e.target.value)}
						>
							<MenuItem value="ALL">{t('All')}</MenuItem>
							<MenuItem value="UNREAD">{t('Unread')}</MenuItem>
							<MenuItem value="READ">{t('Read')}</MenuItem>
						</Select>
					</FormControl>
					<FormControl sx={{ minWidth: 150 }}>
						<InputLabel>{t('Type')}</InputLabel>
						<Select
							value={typeFilter}
							label={t('Type')}
							onChange={(e) => setTypeFilter(e.target.value)}
						>
							<MenuItem value="ALL">{t('All Types')}</MenuItem>
							<MenuItem value={NotificationType.JOB_APPLICATION_RECEIVED}>{t('Job Applications')}</MenuItem>
							<MenuItem value={NotificationType.NEW_FOLLOWER}>{t('Followers')}</MenuItem>
							<MenuItem value={NotificationType.LIKE_RECEIVED}>{t('Likes')}</MenuItem>
							<MenuItem value={NotificationType.COMMENT_RECEIVED}>{t('Comments')}</MenuItem>
							<MenuItem value={NotificationType.GENERAL}>{t('General')}</MenuItem>
						</Select>
					</FormControl>
					<Button
						variant="contained"
						onClick={() => refetch()}
						startIcon={<FilterIcon />}
					>
						{t('Search')}
					</Button>
				</Stack>

				{/* Bulk Actions */}
				<Stack direction="row" spacing={2} alignItems="center">
					<Checkbox
						checked={selectedNotifications.length === notifications.length && notifications.length > 0}
						indeterminate={selectedNotifications.length > 0 && selectedNotifications.length < notifications.length}
						onChange={handleSelectAll}
					/>
					<Typography variant="body2" color="text.secondary">
						{selectedNotifications.length} {t('selected')}
					</Typography>
					<Divider orientation="vertical" flexItem />
					{selectedNotifications.length > 0 && (
						<>
							<Button
								size="small"
								startIcon={<CheckIcon />}
								onClick={() => handleMarkAsRead(selectedNotifications)}
							>
								{t('Mark as Read')}
							</Button>
							<Button
								size="small"
								startIcon={<DeleteIcon />}
								onClick={() => setDeleteDialogOpen(true)}
								color="error"
							>
								{t('Delete')}
							</Button>
						</>
					)}
					<Box sx={{ flex: 1 }} />
					<Button
						size="small"
						startIcon={<CheckIcon />}
						onClick={handleMarkAllAsRead}
					>
						{t('Mark All as Read')}
					</Button>
				</Stack>
			</Paper>

			{/* Notifications List */}
			{loading ? (
				<Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
					<CircularProgress />
				</Box>
			) : error ? (
				<Alert severity="error" sx={{ mb: 3 }}>
					{t('Failed to load notifications. Please try again.')}
				</Alert>
			) : notifications.length === 0 ? (
				<Paper sx={{ p: 4, textAlign: 'center' }}>
					<NotificationsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
					<Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
						{t('No notifications found')}
					</Typography>
					<Typography variant="body2" color="text.secondary">
						{searchTerm || statusFilter !== 'ALL' || typeFilter !== 'ALL'
							? t('Try adjusting your search criteria')
							: t('You\'re all caught up! No notifications yet.')
						}
					</Typography>
				</Paper>
			) : (
				<Stack spacing={2}>
					{notifications.map((notification: Notification) => {
						const icon = getNotificationIcon(notification.type);
						const isSelected = selectedNotifications.includes(notification._id);

						return (
							<Card 
								key={notification._id} 
								sx={{ 
									'&:hover': { boxShadow: 3 },
									borderLeft: notification.isRead ? 'none' : `4px solid ${icon.color}`,
								}}
							>
								<CardContent>
									<Stack direction="row" spacing={2} alignItems="flex-start">
										<Checkbox
											checked={isSelected}
											onChange={() => handleSelectNotification(notification._id)}
											onClick={(e) => e.stopPropagation()}
										/>
										
										{/* Notification Icon */}
										<Box
											sx={{
												width: 48,
												height: 48,
												borderRadius: '50%',
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												backgroundColor: `${icon.color}20`,
												color: icon.color,
												fontSize: 24,
												flexShrink: 0,
											}}
										>
											{icon.icon}
										</Box>

										{/* Notification Content */}
										<Box sx={{ flex: 1, minWidth: 0 }}>
											<Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
												<Box sx={{ flex: 1 }}>
													<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
														<Typography
															variant="h6"
															sx={{
																fontWeight: notification.isRead ? 400 : 600,
																lineHeight: 1.3,
															}}
														>
															{notification.title}
														</Typography>
														<Chip
															label={getNotificationTypeLabel(notification.type)}
															size="small"
															sx={{ backgroundColor: `${icon.color}20`, color: icon.color }}
														/>
													</Stack>
													<Typography
														variant="body2"
														color="text.secondary"
														sx={{ mb: 1, lineHeight: 1.4 }}
													>
														{notification.message}
													</Typography>
													<Typography
														variant="caption"
														color="text.secondary"
													>
														{formatTimeAgo(notification.createdAt)}
													</Typography>
												</Box>

												<Stack direction="row" spacing={1}>
													{!notification.isRead && (
														<IconButton
															size="small"
																													onClick={(e: any) => {
															e.stopPropagation();
															handleMarkAsRead([notification._id]);
														}}
														title={t('Mark as read')}
														>
															<CheckIcon fontSize="small" />
														</IconButton>
													)}
													<IconButton
														size="small"
														onClick={(e: any) => {
															e.stopPropagation();
															handleSelectNotification(notification._id);
														}}
														title={t('Select')}
													>
														<MoreIcon fontSize="small" />
													</IconButton>
												</Stack>
											</Stack>
										</Box>
									</Stack>
								</CardContent>
							</Card>
						);
					})}
				</Stack>
			)}

			{/* Pagination */}
			{totalPages > 1 && (
				<Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
					<Pagination
						count={totalPages}
						page={currentPage}
						onChange={(event, page) => setCurrentPage(page)}
						color="primary"
					/>
				</Box>
			)}

			{/* Delete Confirmation Dialog */}
			<Dialog
				open={deleteDialogOpen}
				onClose={() => setDeleteDialogOpen(false)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>{t('Delete Notifications')}</DialogTitle>
				<DialogContent>
					<Typography>
						{t('Are you sure you want to delete {count} notification(s)? This action cannot be undone.', { count: selectedNotifications.length })}
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDeleteDialogOpen(false)}>{t('Cancel')}</Button>
					<Button onClick={handleDeleteSelected} color="error" variant="contained">
						{t('Delete')}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default withLayoutBasic(NotificationsPage);

export interface Notification {
	_id: string;
	recipientId: string;
	senderId?: string;
	type: NotificationType;
	title: string;
	message: string;
	relatedEntityId?: string;
	relatedEntityType?: string;
	isRead: boolean;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	readAt?: string;
}

export enum NotificationType {
	// Job-related notifications
	JOB_APPLICATION_RECEIVED = 'JOB_APPLICATION_RECEIVED',
	JOB_APPLICATION_STATUS_CHANGED = 'JOB_APPLICATION_STATUS_CHANGED',
	JOB_APPLICATION_ACCEPTED = 'JOB_APPLICATION_ACCEPTED',
	JOB_APPLICATION_REJECTED = 'JOB_APPLICATION_REJECTED',
	JOB_INTERVIEW_SCHEDULED = 'JOB_INTERVIEW_SCHEDULED',
	JOB_VIEWED_BY_COMPANY = 'JOB_VIEWED_BY_COMPANY',
	
	// Job posting notifications
	JOB_POSTING_EXPIRES_SOON = 'JOB_POSTING_EXPIRES_SOON',
	JOB_POSTING_EXPIRED = 'JOB_POSTING_EXPIRED',
	JOB_POSTING_CLOSED = 'JOB_POSTING_CLOSED',
	
	// Social notifications
	NEW_FOLLOWER = 'NEW_FOLLOWER',
	FOLLOWED_BACK = 'FOLLOWED_BACK',
	LIKE_RECEIVED = 'LIKE_RECEIVED',
	COMMENT_RECEIVED = 'COMMENT_RECEIVED',
	
	// System notifications
	WELCOME_MESSAGE = 'WELCOME_MESSAGE',
	ACCOUNT_VERIFIED = 'ACCOUNT_VERIFIED',
	PASSWORD_CHANGED = 'PASSWORD_CHANGED',
	SYSTEM_MAINTENANCE = 'SYSTEM_MAINTENANCE',
	
	// Community notifications
	ARTICLE_PUBLISHED = 'ARTICLE_PUBLISHED',
	ARTICLE_LIKED = 'ARTICLE_LIKED',
	ARTICLE_COMMENTED = 'ARTICLE_COMMENTED',
	
	// General notifications
	GENERAL = 'GENERAL',
	REMINDER = 'REMINDER',
	ANNOUNCEMENT = 'ANNOUNCEMENT'
}

export interface NotificationIcon {
	type: NotificationType;
	icon: string;
	color: string;
}

export const NOTIFICATION_ICONS: NotificationIcon[] = [
	{ type: NotificationType.JOB_APPLICATION_RECEIVED, icon: '📝', color: '#2196F3' },
	{ type: NotificationType.JOB_APPLICATION_STATUS_CHANGED, icon: '🔄', color: '#FF9800' },
	{ type: NotificationType.JOB_APPLICATION_ACCEPTED, icon: '✅', color: '#4CAF50' },
	{ type: NotificationType.JOB_APPLICATION_REJECTED, icon: '❌', color: '#F44336' },
	{ type: NotificationType.JOB_INTERVIEW_SCHEDULED, icon: '📅', color: '#9C27B0' },
	{ type: NotificationType.JOB_VIEWED_BY_COMPANY, icon: '👁️', color: '#607D8B' },
	{ type: NotificationType.JOB_POSTING_EXPIRES_SOON, icon: '⏰', color: '#FF5722' },
	{ type: NotificationType.JOB_POSTING_EXPIRED, icon: '⏳', color: '#795548' },
	{ type: NotificationType.JOB_POSTING_CLOSED, icon: '🔒', color: '#9E9E9E' },
	{ type: NotificationType.NEW_FOLLOWER, icon: '👤', color: '#E91E63' },
	{ type: NotificationType.FOLLOWED_BACK, icon: '🤝', color: '#00BCD4' },
	{ type: NotificationType.LIKE_RECEIVED, icon: '❤️', color: '#E91E63' },
	{ type: NotificationType.COMMENT_RECEIVED, icon: '💬', color: '#FF9800' },
	{ type: NotificationType.WELCOME_MESSAGE, icon: '🎉', color: '#4CAF50' },
	{ type: NotificationType.ACCOUNT_VERIFIED, icon: '✓', color: '#4CAF50' },
	{ type: NotificationType.PASSWORD_CHANGED, icon: '🔐', color: '#FF9800' },
	{ type: NotificationType.SYSTEM_MAINTENANCE, icon: '🔧', color: '#607D8B' },
	{ type: NotificationType.ARTICLE_PUBLISHED, icon: '📰', color: '#2196F3' },
	{ type: NotificationType.ARTICLE_LIKED, icon: '👍', color: '#E91E63' },
	{ type: NotificationType.ARTICLE_COMMENTED, icon: '💭', color: '#FF9800' },
	{ type: NotificationType.GENERAL, icon: '📢', color: '#607D8B' },
	{ type: NotificationType.REMINDER, icon: '⏰', color: '#FF9800' },
	{ type: NotificationType.ANNOUNCEMENT, icon: '📢', color: '#2196F3' }
];

export const getNotificationIcon = (type: NotificationType): NotificationIcon => {
	return NOTIFICATION_ICONS.find(icon => icon.type === type) || 
		{ type: NotificationType.GENERAL, icon: '📢', color: '#607D8B' };
};

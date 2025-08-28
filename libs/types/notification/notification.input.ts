import { NotificationType } from './notification';

export interface CreateNotificationInput {
	recipientId: string;
	senderId?: string;
	type: NotificationType;
	title: string;
	message: string;
	relatedEntityId?: string;
	relatedEntityType?: string;
}

export interface UpdateNotificationInput {
	_id: string;
	isRead?: boolean;
	isActive?: boolean;
}

export interface NotificationInquiry {
	page: number;
	limit: number;
	search?: {
		isRead?: boolean;
		type?: NotificationType;
		relatedEntityId?: string;
		relatedEntityType?: string;
	};
}

export interface MarkNotificationsAsReadInput {
	notificationIds: string[];
}

export interface DeleteNotificationsInput {
	notificationIds: string[];
}

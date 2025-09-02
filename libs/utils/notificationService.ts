import { useMutation } from '@apollo/client';
import { CREATE_NOTIFICATION } from '../../apollo/user/mutation';
import { NotificationType } from '../types/notification/notification';
import { useTranslation } from 'next-i18next';

// Hook for creating notifications
export const useCreateNotification = () => {
	const [createNotification] = useMutation(CREATE_NOTIFICATION);
	const { t } = useTranslation('common');

	const sendNotification = async (params: {
		recipientId: string;
		senderId?: string;
		type: NotificationType;
		title: string;
		message: string;
		relatedEntityId?: string;
		relatedEntityType?: string;
	}) => {
		try {
			await createNotification({
				variables: {
					input: params,
				},
			});
		} catch (error) {
			console.error('Error creating notification:', error);
		}
	};

	return { sendNotification, t };
};

// Utility functions for common notification types
export const createJobApplicationNotification = (
	recipientId: string,
	senderId: string,
	jobId: string,
	positionTitle: string,
	applicantName: string,
	t: (key: string) => string
) => ({
	recipientId,
	senderId,
	type: NotificationType.JOB_APPLICATION_RECEIVED,
	title: t('New Job Application Received'),
	message: `${applicantName} ${t('has applied for your job posting')}: ${positionTitle}`,
	relatedEntityId: jobId,
	relatedEntityType: 'JOB',
});

export const createApplicationStatusNotification = (
	recipientId: string,
	jobId: string,
	positionTitle: string,
	status: string,
	companyName: string
) => ({
	recipientId,
	senderId: undefined, // System notification
	type: NotificationType.JOB_APPLICATION_STATUS_CHANGED,
	title: 'Application Status Updated',
	message: `Your application for ${positionTitle} at ${companyName} has been ${status.toLowerCase()}`,
	relatedEntityId: jobId,
	relatedEntityType: 'JOB',
});

export const createInterviewNotification = (
	recipientId: string,
	jobId: string,
	positionTitle: string,
	interviewDate: string,
	companyName: string
) => ({
	recipientId,
	senderId: undefined,
	type: NotificationType.JOB_INTERVIEW_SCHEDULED,
	title: 'Interview Scheduled',
	message: `An interview has been scheduled for ${positionTitle} at ${companyName} on ${interviewDate}`,
	relatedEntityId: jobId,
	relatedEntityType: 'JOB',
});

export const createNewFollowerNotification = (
	recipientId: string,
	senderId: string,
	followerName: string
) => ({
	recipientId,
	senderId,
	type: NotificationType.NEW_FOLLOWER,
	title: 'New Follower',
	message: `${followerName} started following you`,
	relatedEntityId: senderId,
	relatedEntityType: 'MEMBER',
});

export const createLikeNotification = (
	recipientId: string,
	senderId: string,
	senderName: string,
	entityType: 'ARTICLE' | 'COMMENT',
	entityId: string
) => ({
	recipientId,
	senderId,
	type: NotificationType.LIKE_RECEIVED,
	title: 'New Like',
	message: `${senderName} liked your ${entityType.toLowerCase()}`,
	relatedEntityId: entityId,
	relatedEntityType: entityType,
});

export const createCommentNotification = (
	recipientId: string,
	senderId: string,
	senderName: string,
	entityType: 'ARTICLE' | 'COMMENT',
	entityId: string
) => ({
	recipientId,
	senderId,
	type: NotificationType.COMMENT_RECEIVED,
	title: 'New Comment',
	message: `${senderName} commented on your ${entityType.toLowerCase()}`,
	relatedEntityId: entityId,
	relatedEntityType: entityType,
});

export const createWelcomeNotification = (recipientId: string, userName: string) => ({
	recipientId,
	senderId: undefined,
	type: NotificationType.WELCOME_MESSAGE,
	title: 'Welcome to JobBoard AI!',
	message: `Welcome ${userName}! We're excited to have you on board. Start exploring jobs, connecting with companies, and building your career.`,
	relatedEntityId: undefined,
	relatedEntityType: undefined,
});

export const createJobExpiryNotification = (
	recipientId: string,
	jobId: string,
	positionTitle: string,
	daysLeft: number
) => ({
	recipientId,
	senderId: undefined,
	type: NotificationType.JOB_POSTING_EXPIRES_SOON,
	title: 'Job Posting Expires Soon',
	message: `Your job posting "${positionTitle}" will expire in ${daysLeft} day${daysLeft > 1 ? 's' : ''}. Consider extending it to reach more candidates.`,
	relatedEntityId: jobId,
	relatedEntityType: 'JOB',
});

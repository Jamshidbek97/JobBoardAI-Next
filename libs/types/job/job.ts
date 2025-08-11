import { EducationLevel, JobLocation, JobStatus, JobType } from '../../enums/job.enum';
import { Member } from '../member/member';

export interface MeLiked {
	memberId: string;
	likeRefId: string;
	myFavorite: boolean;
}

export interface TotalCounter {
	total: number;
}

export interface Job {
	_id: string;
	jobType: JobType;
	jobStatus: JobStatus;
	jobLocation: JobLocation;
	jobAddress?: string;
	companyName: string;
	positionTitle: string;
	jobSalary: number;
	skillsRequired?: string[];
	experienceYears?: number;
	educationLevel: EducationLevel;
	jobViews: number;
	jobLikes: number;
	jobComments: number;
	jobRank: number;
	jobImages: string[];
	jobDesc?: string;
	isRemote: boolean;
	companyLogo: string;
	memberId: string;
	closedAt?: Date;
	deletedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	/** from aggregation **/
	meLiked?: MeLiked[];
	memberData?: Member;
}

export interface Jobs {
	list: Job[];
	metaCounter: TotalCounter[];
}

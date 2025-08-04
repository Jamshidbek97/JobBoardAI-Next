import { EducationLevel, JobLocation, JobStatus, JobType } from '../../enums/job.enum';

export interface PropertyUpdate {
	_id: string;
	jobType?: JobType;
	jobStatus?: JobStatus;
	jobLocation?: JobLocation;
	jobAddress?: string;
	positionTitle?: string;
	jobSalary?: number;
	skillsRequired?: string[];
	experienceYears?: number;
	educationLevel?: EducationLevel;
	jobImages?: string[];
	jobDesc?: string;
	isRemote?: boolean;
	companyLogo?: string;
	closedAt?: Date;
	deletedAt?: Date;
}

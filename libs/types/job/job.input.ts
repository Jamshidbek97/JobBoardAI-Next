import { EducationLevel, EmploymentLevel, JobLocation, JobStatus, JobType } from '../../enums/job.enum';
import { Direction } from '../../enums/common.enum';

export interface JobInput {
	jobType: JobType;
	jobLocation: JobLocation;
	jobAddress: string;
	companyName: string;
	positionTitle: string;
	jobSalary?: number;
	experienceYears?: number;
	educationLevel?: EducationLevel;
	employmentLevel?: EmploymentLevel;
	skillsRequired?: string[];
	isRemote?: boolean;
	deadline?: Date;
	jobImages?: string[];
	companyLogo: string;
	jobDesc: string;
}

interface JISearch {
	memberId?: string;
	locationList?: JobLocation[];
	typeList?: JobType[];
	options?: string[];
	salaryRange?: Range;
	experienceRange?: number;
	periodsRange?: PeriodsRange;
	educationLevelList?: EducationLevel[];
	employmentLevels: EmploymentLevel[];
	skillsRequired?: string[];
	isRemote: boolean;
	text?: string;
}

export interface JobInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: JISearch;
}

interface AJISearch {
	jobStatus?: JobStatus;
}

export interface AgentPropertiesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: AJISearch;
}

interface ALJISearch {
	jobStatus?: JobStatus;
	jobLocation?: JobLocation[];
}

export interface AllJobsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: ALJISearch;
}

interface Range {
	start: number;
	end: number;
}

interface PeriodsRange {
	start: Date | number;
	end: Date | number;
}

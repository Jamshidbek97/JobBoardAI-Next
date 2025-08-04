import { Direction } from '../../enums/common.enum';

interface FollowSearch {
	followingId?: string;
	followerId?: string;
}

export interface FollowInquiry {
	page: number;
	limit: number;
	direction?: Direction.DESC;
	search: FollowSearch;
}

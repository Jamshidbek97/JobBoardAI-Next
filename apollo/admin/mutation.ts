import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const UPDATE_MEMBER_BY_ADMIN = gql`
	mutation UpdateMemberByAdmin($input: MemberUpdate!) {
		updateMemberByAdmin(input: $input) {
			_id
			memberType
			memberStatus
			memberAuthType
			memberPhone
			memberNick
			memberFullName
			memberImage
			memberAddress
			memberDesc
			memberPostedJobs
			memberRank
			memberArticles
			memberPoints
			memberLikes
			memberViews
			memberWarnings
			memberBlocks
			deletedAt
			createdAt
			updatedAt
			accessToken
		}
	}
`;

/**************************
 *           JOB          *
 *************************/

export const UPDATE_JOB_BY_ADMIN = gql`
	mutation UpdateJobByAdmin($input: JobUpdate!) {
		updateJobByAdmin(input: $input) {
			_id
			jobType
			jobStatus
			jobLocation
			jobAddress
			positionTitle
			companyName
			jobSalary
			jobDescription
			jobRequirements
			jobViews
			jobLikes
			companyLogo
			memberId
			closedAt
			deletedAt
			createdAt
			updatedAt
		}
	}
`;

export const REMOVE_JOB_BY_ADMIN = gql`
	mutation RemoveJobByAdmin($input: String!) {
		removeJobByAdmin(jobId: $input) {
			_id
			jobType
			jobStatus
			jobLocation
			jobAddress
			positionTitle
			companyName
			jobSalary
			jobDescription
			jobRequirements
			jobViews
			jobLikes
			companyLogo
			memberId
			closedAt
			deletedAt
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *      BOARD-ARTICLE     *
 *************************/

export const UPDATE_BOARD_ARTICLE_BY_ADMIN = gql`
	mutation UpdateBoardArticleByAdmin($input: BoardArticleUpdate!) {
		updateBoardArticleByAdmin(input: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			memberId
			createdAt
			updatedAt
		}
	}
`;

export const REMOVE_BOARD_ARTICLE_BY_ADMIN = gql`
	mutation RemoveBoardArticleByAdmin($input: String!) {
		removeBoardArticleByAdmin(articleId: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			memberId
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *         COMMENT        *
 *************************/

export const REMOVE_COMMENT_BY_ADMIN = gql`
	mutation RemoveCommentByAdmin($input: String!) {
		removeCommentByAdmin(commentId: $input) {
			_id
			commentStatus
			commentGroup
			commentContent
			commentRefId
			memberId
			createdAt
			updatedAt
		}
	}
`;

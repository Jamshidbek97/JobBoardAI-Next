import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const GET_AGENTS = gql`
	query GetAgents($input: AgentsInquiry!) {
		getAgents(input: $input) {
			list {
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
				memberArticles
				memberFollowers
				memberFollowings
				memberPoints
				memberLikes
				memberViews
				memberComments
				memberRank
				memberWarnings
				memberBlocks
				deletedAt
				createdAt
				updatedAt
				accessToken
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				meFollowed {
					followingId
					followerId
					myFollowing
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_MEMBER = gql(`
query GetMember($input: String!) {
    getMember(memberId: $input) {
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
        memberArticles
        memberFollowers
        memberFollowings
        memberPoints
        memberLikes
        memberViews
        memberComments
        memberRank
        memberWarnings
        memberBlocks
        deletedAt
        createdAt
        updatedAt
        accessToken
        meLiked {
            memberId
            likeRefId
            myFavorite
        }
        meFollowed {
            followingId
            followerId
            myFollowing
        }
    }
}

`);

/**************************
 *        PROPERTY        *
 *************************/

export const GET_JOB = gql`
	query GetJob($input: String!) {
		getJob(jobId: $input) {
			_id
			jobType
			jobStatus
			jobLocation
			employmentLevel
			positionTitle
			jobSalary
			skillsRequired
			experienceYears
			educationLevel
			jobViews
			jobLikes
			jobComments
			jobRank
			jobImages
			companyName
			companyLogo
			jobDesc
			memberId
			closedAt
			deletedAt
			createdAt
			updatedAt
			memberData {
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
				memberArticles
				memberFollowers
				memberFollowings
				memberPoints
				memberLikes
				memberViews
				memberComments
				memberRank
				memberWarnings
				memberBlocks
				deletedAt
				createdAt
				updatedAt
				accessToken
			}
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
		}
	}
`;

export const GET_JOBS = gql`
	query GetJobs($input: JobsInquiry!) {
		getJobs(input: $input) {
			list {
				_id
				jobType
				jobStatus
				jobLocation
				employmentLevel
				positionTitle
				jobSalary
				skillsRequired
				experienceYears
				educationLevel
				jobViews
				jobLikes
				jobComments
				jobRank
				jobImages
				companyName
				companyLogo
				jobDesc
				memberId
				closedAt
				deletedAt
				createdAt
				updatedAt
				memberData {
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
					memberArticles
					memberFollowers
					memberFollowings
					memberPoints
					memberLikes
					memberViews
					memberComments
					memberRank
					memberWarnings
					memberBlocks
					deletedAt
					createdAt
					updatedAt
					accessToken
				}
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_AGENT_JOBS = gql`
	query GetAgentJobs($input: AgentJobsInquiry!) {
    getAgentJobs(input: $input) {
        list {
            _id
            jobType
            jobStatus
            jobLocation
            positionTitle
            jobSalary
            skillsRequired
            experienceYears
            educationLevel
            jobViews
            jobLikes
            jobComments
            jobRank
            jobImages
            companyLogo
            jobDesc
            memberId
            closedAt
            deletedAt
            createdAt
            updatedAt
            meLiked {
                memberId
                likeRefId
                myFavorite
            }
            memberData {
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
                memberArticles
                memberFollowers
                memberFollowings
                memberPoints
                memberLikes
                memberViews
                memberComments
                memberRank
                memberWarnings
                memberBlocks
                deletedAt
                createdAt
                updatedAt
                accessToken
            }
        }
        metaCounter {
            total
        }
    }
}

`;

export const GET_FAVORITES = gql`
	query GetFavorites($input: OrdinaryInquiry!) {
		getFavorites(input: $input) {
			list {
				_id
				propertyType
				propertyStatus
				propertyLocation
				propertyAddress
				propertyTitle
				propertyPrice
				propertySquare
				propertyBeds
				propertyRooms
				propertyViews
				propertyLikes
				propertyComments
				propertyRank
				propertyImages
				propertyDesc
				propertyBarter
				propertyRent
				memberId
				soldAt
				deletedAt
				constructedAt
				createdAt
				updatedAt
				memberData {
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
					memberProperties
					memberArticles
					memberPoints
					memberLikes
					memberViews
					memberComments
					memberFollowings
					memberFollowers
					memberRank
					memberWarnings
					memberBlocks
					deletedAt
					createdAt
					updatedAt
					accessToken
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_VISITED = gql`
	query GetVisited($input: OrdinaryInquiry!) {
		getVisited(input: $input) {
			list {
				_id
				propertyType
				propertyStatus
				propertyLocation
				propertyAddress
				propertyTitle
				propertyPrice
				propertySquare
				propertyBeds
				propertyRooms
				propertyViews
				propertyLikes
				propertyComments
				propertyRank
				propertyImages
				propertyDesc
				propertyBarter
				propertyRent
				memberId
				soldAt
				deletedAt
				constructedAt
				createdAt
				updatedAt
				memberData {
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
					memberArticles
					memberPoints
					memberLikes
					memberViews
					memberComments
					memberFollowings
					memberFollowers
					memberRank
					memberWarnings
					memberBlocks
					deletedAt
					createdAt
					updatedAt
					accessToken
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *      BOARD-ARTICLE     *
 *************************/

export const GET_BOARD_ARTICLE = gql`
	query GetBoardArticle($input: String!) {
    getBoardArticle(articleId: $input) {
        _id
        articleCategory
        articleStatus
        articleTitle
        articleContent
        articleImage
        articleViews
        articleLikes
        articleComments
        memberId
        createdAt
        updatedAt
        memberData {
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
            memberArticles
            memberFollowers
            memberFollowings
            memberPoints
            memberLikes
            memberViews
            memberComments
            memberRank
            memberWarnings
            memberBlocks
            deletedAt
            createdAt
            updatedAt
            accessToken
            meLiked {
                memberId
                likeRefId
                myFavorite
            }
            meFollowed {
                followingId
                followerId
                myFollowing
            }
        }
        meLiked {
            memberId
            likeRefId
            myFavorite
        }
    }
}

`;

export const GET_BOARD_ARTICLES = gql`
	query GetBoardArticles($input: BoardArticlesInquiry!) {
    getBoardArticles(input: $input) {
        list {
            _id
            articleCategory
            articleStatus
            articleTitle
            articleContent
            articleImage
            articleViews
            articleLikes
            articleComments
            memberId
            createdAt
            updatedAt
			 meLiked {
                memberId
                likeRefId
                myFavorite
            }
            memberData {
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
                memberArticles
                memberFollowers
                memberFollowings
                memberPoints
                memberLikes
                memberViews
                memberComments
                memberRank
                memberWarnings
                memberBlocks
                deletedAt
                createdAt
                updatedAt
                accessToken
            }
           
        }
        metaCounter {
            total
        }
    }
}

`;

/**************************
 *         COMMENT        *
 *************************/

export const GET_COMMENTS = gql`
	query GetComments($input: CommentsInquiry!) {
		getComments(input: $input) {
			list {
				_id
				commentStatus
				commentGroup
				commentContent
				commentRefId
				memberId
				createdAt
				updatedAt
				memberData {
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
					memberWarnings
					memberBlocks
					memberPostedJobs
					memberRank
					memberPoints
					memberLikes
					memberViews
					deletedAt
					createdAt
					updatedAt
					accessToken
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         FOLLOW        *
 *************************/
export const GET_MEMBER_FOLLOWERS = gql`
	query GetMemberFollowers($input: FollowInquiry!) {
		getMemberFollowers(input: $input) {
			list {
				_id
				followingId
				followerId
				createdAt
				updatedAt
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				meFollowed {
					followingId
					followerId
					myFollowing
				}
				followerData {
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
					memberArticles
					memberPoints
					memberLikes
					memberViews
					memberComments
					memberFollowings
					memberFollowers
					memberRank
					memberWarnings
					memberBlocks
					deletedAt
					createdAt
					updatedAt
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_MEMBER_FOLLOWINGS = gql`
	query GetMemberFollowings($input: FollowInquiry!) {
		getMemberFollowings(input: $input) {
			list {
				_id
				followingId
				followerId
				createdAt
				updatedAt
				followingData {
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
					memberArticles
					memberPoints
					memberLikes
					memberViews
					memberComments
					memberFollowings
					memberFollowers
					memberRank
					memberWarnings
					memberBlocks
					deletedAt
					createdAt
					updatedAt
					accessToken
				}
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				meFollowed {
					followingId
					followerId
					myFollowing
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

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

export const GET_SIMILAR_JOBS = gql`
	query GetSimilarJobs($jobId: String!, $limit: Float) {
	getSimilarJobs(jobId: $jobId, limit: $limit) {
	  list {
		_id
		positionTitle
		companyName
		jobSalary
		jobLocation
		jobType
		educationLevel
		employmentLevel
		experienceYears
		companyLogo
		jobDesc
		skillsRequired
		jobViews
		jobLikes
		jobComments
		jobRank
		memberId
		createdAt
		updatedAt
		memberData {
		  _id
		  memberNick
		  memberType
		  memberImage
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
  }`;

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
            companyName
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

export const GET_VISITED = gql`
	query GetVisited($input: OrdinaryInquiry!) {
    getVisited(input: $input) {
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

export const GET_APPLICATION = gql`
	query GetApplication($applicationId: String!) {
		getApplication(applicationId: $applicationId) {
			_id
			jobId {
				_id
				positionTitle
				companyName
				jobLocation
				jobSalary
				jobDesc
				companyLogo
				jobType
				employmentLevel
				experienceYears
				educationLevel
				skillsRequired
			}
			applicantId {
				_id
				memberFullName
				memberEmail
				memberPhone
				memberImage
				profile {
					skills
					experience
					education
				}
			}
			status
			coverLetter
			resumeUrl
			expectedSalary
			additionalDocuments
			notes
			interviewDate
			feedback
			isViewedByCompany
			viewedAt
			appliedAt
			updatedAt
		}
	}
`;

export const GET_APPLICATIONS = gql`
	query GetApplications($input: ApplicationsInquiry!) {
		getApplications(input: $input) {
			list {
				_id
				jobId {
					_id
					positionTitle
					companyName
					jobLocation
					jobSalary
					companyLogo
					jobType
					employmentLevel
				}
				applicantId {
					_id
					memberFullName
					memberEmail
					memberPhone
					memberImage
				}
				status
				coverLetter
				resumeUrl
				expectedSalary
				additionalDocuments
				isViewedByCompany
				appliedAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_APPLICATION_STATS = gql`
	query GetApplicationStats {
		getApplicationStats {
			totalApplications
			pendingApplications
			reviewingApplications
			acceptedApplications
			rejectedApplications
			withdrawnApplications
			applicationsThisMonth
			applicationsThisWeek
		}
	}
`;

export const GET_MY_APPLICATIONS = gql`
	query GetMyApplications {
  getMyApplications {
    list {
      _id
      jobId
      applicantId
      companyId
      status
      appliedAt
      expectedSalary
      coverLetter
      resumeUrl
     additionalDocuments
            notes
            interviewDate
            feedback
            isActive
            expectedSalary
            availabilityDate
            isRemotePreferred
            relevantExperience
            skills
            currentPosition
            currentCompany
            yearsOfExperience
            preferredWorkSchedule
            isRelocationWilling
            relocationLocation
            earliestStartDate
            motivation
            references
            applicationSource
            isViewedByCompany
            viewedAt
            viewCount
            createdAt
            jobData {
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
                jobApplications
                jobRank
                jobImages
                companyLogo
                employmentLevel
                jobDesc
                companyName
                memberId
                closedAt
                deletedAt
                applications
                applicationCount
                applicationDeadline
                maxApplications
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

export const GET_JOB_APPLICATIONS = gql`
	query GetJobApplications($input: ApplicationsInquiry!) {
		getJobApplications(input: $input) {
			list {
				_id
				jobId
				applicantId
				status
				appliedAt
				expectedSalary
				coverLetter
				resumeUrl
				additionalDocuments
				notes
				interviewDate
				feedback
				isActive
				availabilityDate
				isRemotePreferred
				relevantExperience
				skills
				currentPosition
				currentCompany
				yearsOfExperience
				preferredWorkSchedule
				isRelocationWilling
				relocationLocation
				earliestStartDate
				motivation
				references
				applicationSource
				isViewedByCompany
				viewedAt
				viewCount
				createdAt
				updatedAt
				jobData {
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
					jobApplications
					jobRank
					jobImages
					companyLogo
					employmentLevel
					jobDesc
					companyName
					memberId
					closedAt
					deletedAt
					applications
					applicationCount
					applicationDeadline
					maxApplications
					createdAt
					updatedAt
				}
				applicantData {
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

export const GET_NOTIFICATIONS = gql`
	query GetNotifications($input: NotificationInquiry!) {
		getNotifications(input: $input) {
			list {
				_id
				recipientId
				senderId
				type
				title
				message
				relatedEntityId
				relatedEntityType
				isRead
				isActive
				createdAt
				updatedAt
				readAt
				senderData {
					_id
					memberNick
					memberFullName
					memberImage
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_UNREAD_NOTIFICATIONS_COUNT = gql`
	query GetUnreadNotificationsCount {
		getUnreadNotificationsCount {
			count
		}
	}
`;

export const GET_NOTIFICATION_BY_ID = gql`
	query GetNotificationById($id: String!) {
		getNotificationById(id: $id) {
			_id
			recipientId
			senderId
			type
			title
			message
			relatedEntityId
			relatedEntityType
			isRead
			isActive
			createdAt
			updatedAt
			readAt
			senderData {
				_id
				memberNick
				memberFullName
				memberImage
			}
		}
	}
`;

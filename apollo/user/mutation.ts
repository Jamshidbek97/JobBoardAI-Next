import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

// apollo/user/mutation.ts

export const APPLY_JOB = gql`
  mutation ApplyJob($input: ApplyJobInput!) {
    applyJob(input: $input) {
      _id
      status
      createdAt
    }
  }
`;

/**************************
 *      APPLICATION       *
 *************************/

export const CREATE_APPLICATION = gql`
  mutation CreateApplication($input: ApplicationInput!) {
    createApplication(input: $input) {
        _id
        jobId
        applicantId
        companyId
        status
        appliedAt
        updatedAt
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
    }
}

`;

export const UPDATE_APPLICATION = gql`
  mutation UpdateApplication($input: ApplicationUpdate!) {
    updateApplication(input: $input) {
      _id
      status
      coverLetter
      expectedSalary
      additionalDocuments
      notes
      interviewDate
      feedback
      updatedAt
    }
  }
`;

export const WITHDRAW_APPLICATION = gql`
  mutation WithdrawApplication($applicationId: String!) {
    withdrawApplication(applicationId: $applicationId) {
      _id
      status
      updatedAt
    }
  }
`;

export const MARK_AS_VIEWED = gql`
  mutation MarkAsViewed($applicationId: String!) {
    markApplicationAsViewed(applicationId: $applicationId) {
      _id
      isViewed
      viewedAt
    }
  }
`;

export const DELETE_APPLICATION = gql`
  mutation DeleteApplication($applicationId: String!) {
    deleteApplication(applicationId: $applicationId) {
      _id
      isActive
    }
  }
`;

export const UPLOAD_RESUME = gql`
  mutation UploadResume($file: Upload!) {
    uploadResume(file: $file)
  }
`;

export const SAVE_JOB = gql`
  mutation SaveJob($jobId: String!) {
    saveJob(jobId: $jobId) {
      _id
      savedJobs
    }
  }
`;

export const UNSAVE_JOB = gql`
  mutation UnsaveJob($jobId: String!) {
    unsaveJob(jobId: $jobId) {
      _id
      savedJobs
    }
  }
`;


export const SIGN_UP = gql`
	mutation Signup($input: MemberInput!) {
		signup(input: $input) {
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
			memberArticles
			memberPoints
			memberLikes
			memberViews
			deletedAt
			createdAt
			updatedAt
			accessToken
		}
	}
`;

export const LOGIN = gql`
	mutation Login($input: LoginInput!) {
		login(input: $input) {
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
`;

export const UPDATE_MEMBER = gql`
	mutation UpdateMember($input: MemberUpdate!) {
		updateMember(input: $input) {
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
`;

export const LIKE_TARGET_MEMBER = gql`
mutation LikeTargetMember($input: String!) {
    likeTargetMember(memberId: $input) {
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

`;

/**************************
 *        PROPERTY        *
 *************************/

export const CREATE_JOB = gql`
	mutation CreateJob($input: JobInput!) {
		createJob(input: $input) {
			_id
			jobType
			jobStatus
			jobLocation
			employmentLevel
			jobSalary
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
			positionTitle
			skillsRequired
		}
	}
`;

export const UPDATE_JOB = gql`
	mutation UpdateJob($input: JobUpdate!) {
		updateJob(input: $input) {
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
			companyLogo
			jobDesc
			memberId
			closedAt
			deletedAt
			createdAt
			updatedAt
		}
	}
`;

export const LIKE_TARGET_JOB = gql`
	mutation LikeTargetJob($input: String!) {
		likeTargetJob(jobId: $input) {
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
			companyLogo
			jobDesc
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

export const CREATE_BOARD_ARTICLE = gql`
	mutation CreateBoardArticle($input: BoardArticleInput!) {
    createBoardArticle(input: $input) {
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
    }
}

`;

export const UPDATE_BOARD_ARTICLE = gql`
	mutation UpdateBoardArticle($input: BoardArticleUpdate!) {
		updateBoardArticle(input: $input) {
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

export const LIKE_TARGET_BOARD_ARTICLE = gql`
	mutation LikeTargetBoardArticle($input: String!) {
		likeTargetBoardArticle(articleId: $input) {
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

export const CREATE_COMMENT = gql`
	mutation CreateComment($input: CommentInput!) {
		createComment(input: $input) {
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

export const UPDATE_COMMENT = gql`
	mutation UpdateComment($input: CommentUpdate!) {
		updateComment(input: $input) {
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

/**************************
 *         FOLLOW        *
 *************************/

export const SUBSCRIBE = gql`
	mutation Subscribe($memberId: String!) {
		subscribe(memberId: $memberId) {
			_id
			followingId
			followerId
			createdAt
			updatedAt
		}
	}
`;

export const UNSUBSCRIBE = gql`
	mutation Unsubscribe($memberId: String!) {
		unsubscribe(memberId: $memberId) {
			_id
			followingId
			followerId
			createdAt
			updatedAt
		}
	}
`;

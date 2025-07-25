
/* !!! This is code generated by Prisma. Do not edit directly. !!!
/* eslint-disable */

Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.11.1
 * Query Engine version: f40f79ec31188888a2e33acda0ecc8fd10a853a9
 */
Prisma.prismaVersion = {
  client: "6.11.1",
  engine: "f40f79ec31188888a2e33acda0ecc8fd10a853a9"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id'
};

exports.Prisma.UserProfileScalarFieldEnum = {
  id: 'id',
  email: 'email',
  fullName: 'fullName',
  avatarUrl: 'avatarUrl',
  preferences: 'preferences',
  totalProcessedContent: 'totalProcessedContent',
  totalEmbeddings: 'totalEmbeddings',
  monthlyQuotaUsed: 'monthlyQuotaUsed',
  lastActiveDate: 'lastActiveDate',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.SpaceScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  color: 'color',
  domain: 'domain',
  isDefault: 'isDefault',
  contentCount: 'contentCount',
  lastAccessed: 'lastAccessed',
  pineconeNamespace: 'pineconeNamespace',
  userId: 'userId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.ResourceScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  url: 'url',
  type: 'type',
  content: 'content',
  tags: 'tags',
  domain: 'domain',
  language: 'language',
  metadata: 'metadata',
  complexityLevel: 'complexityLevel',
  estimatedReadTimeMinutes: 'estimatedReadTimeMinutes',
  wordCount: 'wordCount',
  processingStatus: 'processingStatus',
  processedAt: 'processedAt',
  actionDensity: 'actionDensity',
  noveltyScore: 'noveltyScore',
  practicalApplicability: 'practicalApplicability',
  userId: 'userId',
  spaceId: 'spaceId',
  classificationId: 'classificationId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.ResourceVersionScalarFieldEnum = {
  id: 'id',
  versionNumber: 'versionNumber',
  title: 'title',
  content: 'content',
  tags: 'tags',
  metadata: 'metadata',
  resourceId: 'resourceId',
  createdBy: 'createdBy',
  createdAt: 'createdAt'
};

exports.Prisma.ClassificationScalarFieldEnum = {
  id: 'id',
  name: 'name',
  code: 'code',
  description: 'description',
  domain: 'domain',
  usageCount: 'usageCount',
  isSystemDefault: 'isSystemDefault',
  parentId: 'parentId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.ContentSummaryScalarFieldEnum = {
  id: 'id',
  executiveSummary: 'executiveSummary',
  keyInsights: 'keyInsights',
  immediateActions: 'immediateActions',
  criticalWarnings: 'criticalWarnings',
  keyMetrics: 'keyMetrics',
  toolsResources: 'toolsResources',
  peopleCompanies: 'peopleCompanies',
  primaryKeywords: 'primaryKeywords',
  semanticTags: 'semanticTags',
  questionBasedTags: 'questionBasedTags',
  totalChunks: 'totalChunks',
  embeddingModel: 'embeddingModel',
  avgChunkTokens: 'avgChunkTokens',
  resourceId: 'resourceId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.VectorChunkScalarFieldEnum = {
  id: 'id',
  chunkIndex: 'chunkIndex',
  chunkType: 'chunkType',
  content: 'content',
  tokenCount: 'tokenCount',
  pineconeId: 'pineconeId',
  pineconeNamespace: 'pineconeNamespace',
  embeddingModel: 'embeddingModel',
  vectorDimension: 'vectorDimension',
  overlappingChunks: 'overlappingChunks',
  semanticDensity: 'semanticDensity',
  retrievalFrequency: 'retrievalFrequency',
  lastRetrieved: 'lastRetrieved',
  resourceId: 'resourceId',
  summaryId: 'summaryId',
  parentChunkId: 'parentChunkId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.ContentRelationshipScalarFieldEnum = {
  id: 'id',
  relationshipType: 'relationshipType',
  confidenceScore: 'confidenceScore',
  relationshipReason: 'relationshipReason',
  isAutoGenerated: 'isAutoGenerated',
  sourceResourceId: 'sourceResourceId',
  targetResourceId: 'targetResourceId',
  createdBy: 'createdBy',
  createdAt: 'createdAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.KnowledgeNodeScalarFieldEnum = {
  id: 'id',
  name: 'name',
  type: 'type',
  description: 'description',
  domain: 'domain',
  importanceScore: 'importanceScore',
  mentionFrequency: 'mentionFrequency',
  mentionedInResources: 'mentionedInResources',
  firstMentionedDate: 'firstMentionedDate',
  lastMentionedDate: 'lastMentionedDate',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.KnowledgeEdgeScalarFieldEnum = {
  id: 'id',
  relationshipType: 'relationshipType',
  strength: 'strength',
  evidenceResources: 'evidenceResources',
  isAutoGenerated: 'isAutoGenerated',
  sourceNodeId: 'sourceNodeId',
  targetNodeId: 'targetNodeId',
  createdBy: 'createdBy',
  createdAt: 'createdAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.SearchQueryScalarFieldEnum = {
  id: 'id',
  query: 'query',
  queryType: 'queryType',
  resultsCount: 'resultsCount',
  avgRelevanceScore: 'avgRelevanceScore',
  clickedResults: 'clickedResults',
  extractedIntent: 'extractedIntent',
  domainClassification: 'domainClassification',
  complexityDetected: 'complexityDetected',
  responseTimeMs: 'responseTimeMs',
  userSatisfaction: 'userSatisfaction',
  userId: 'userId',
  createdAt: 'createdAt'
};

exports.Prisma.LearningAnalyticScalarFieldEnum = {
  id: 'id',
  eventType: 'eventType',
  eventDetails: 'eventDetails',
  sessionId: 'sessionId',
  comprehensionLevel: 'comprehensionLevel',
  implementationStatus: 'implementationStatus',
  deviceType: 'deviceType',
  timeSpentSeconds: 'timeSpentSeconds',
  referralSource: 'referralSource',
  userId: 'userId',
  resourceId: 'resourceId',
  createdAt: 'createdAt'
};

exports.Prisma.BatchJobScalarFieldEnum = {
  id: 'id',
  status: 'status',
  progress: 'progress',
  totalItems: 'totalItems',
  userId: 'userId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PromptLogScalarFieldEnum = {
  id: 'id',
  queryText: 'queryText',
  tier: 'tier',
  response: 'response',
  error: 'error',
  latencyMs: 'latencyMs',
  userId: 'userId',
  createdAt: 'createdAt'
};

exports.Prisma.ChangeLogScalarFieldEnum = {
  id: 'id',
  changeType: 'changeType',
  changeDetails: 'changeDetails',
  userId: 'userId',
  changedAt: 'changedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.ContentDomain = exports.$Enums.ContentDomain = {
  business: 'business',
  technology: 'technology'
};

exports.ResourceType = exports.$Enums.ResourceType = {
  video: 'video',
  article: 'article',
  pdf: 'pdf',
  onenote: 'onenote'
};

exports.ComplexityLevel = exports.$Enums.ComplexityLevel = {
  beginner: 'beginner',
  intermediate: 'intermediate',
  advanced: 'advanced'
};

exports.ProcessingStatus = exports.$Enums.ProcessingStatus = {
  pending: 'pending',
  processing: 'processing',
  completed: 'completed',
  failed: 'failed'
};

exports.ActionDensity = exports.$Enums.ActionDensity = {
  low: 'low',
  medium: 'medium',
  high: 'high'
};

exports.PracticalApplicability = exports.$Enums.PracticalApplicability = {
  immediate: 'immediate',
  short_term: 'short_term',
  long_term: 'long_term'
};

exports.ChunkType = exports.$Enums.ChunkType = {
  text: 'text',
  image: 'image',
  audio: 'audio',
  video: 'video'
};

exports.RelationshipType = exports.$Enums.RelationshipType = {
  RELATED: 'RELATED',
  SEQUEL: 'SEQUEL',
  PREQUEL: 'PREQUEL',
  SUPPORTS: 'SUPPORTS',
  CONTRADICTS: 'CONTRADICTS'
};

exports.ImplementationStatus = exports.$Enums.ImplementationStatus = {
  not_started: 'not_started',
  in_progress: 'in_progress',
  completed: 'completed',
  abandoned: 'abandoned'
};

exports.BatchJobStatus = exports.$Enums.BatchJobStatus = {
  pending: 'pending',
  processing: 'processing',
  completed: 'completed',
  failed: 'failed'
};

exports.PromptLogTier = exports.$Enums.PromptLogTier = {
  extract: 'extract',
  validate: 'validate',
  rag: 'rag'
};

exports.Prisma.ModelName = {
  User: 'User',
  UserProfile: 'UserProfile',
  Space: 'Space',
  Resource: 'Resource',
  ResourceVersion: 'ResourceVersion',
  Classification: 'Classification',
  ContentSummary: 'ContentSummary',
  VectorChunk: 'VectorChunk',
  ContentRelationship: 'ContentRelationship',
  KnowledgeNode: 'KnowledgeNode',
  KnowledgeEdge: 'KnowledgeEdge',
  SearchQuery: 'SearchQuery',
  LearningAnalytic: 'LearningAnalytic',
  BatchJob: 'BatchJob',
  PromptLog: 'PromptLog',
  ChangeLog: 'ChangeLog'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }

        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)

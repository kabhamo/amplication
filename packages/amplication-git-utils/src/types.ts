import { GitClient } from "./providers/git-client";

export enum EnumPullRequestMode {
  Basic = "Basic",
  Accumulative = "Accumulative",
}

export enum EnumGitOrganizationType {
  User = "User",
  Organization = "Organization",
}

export enum EnumGitProvider {
  Github = "Github",
  Bitbucket = "Bitbucket",
}

export interface BitBucketConfiguration {
  clientId: string;
  clientSecret: string;
}

export interface GitHubConfiguration {
  clientId: string;
  clientSecret: string;
  appId: string;
  privateKey: string;
  installationUrl: string;
}

export interface GitProvidersConfiguration {
  gitHubConfiguration: GitHubConfiguration;
  bitBucketConfiguration: BitBucketConfiguration;
}

export interface GitProviderArgs {
  provider: EnumGitProvider;
  providerOrganizationProperties: any;
}

export interface GitProviderConstructorArgs {
  installationId: string;
}

export interface RemoteGitOrganization {
  name: string;
  type: EnumGitOrganizationType;
  useGroupingForRepositories: boolean;
}

export interface Branch {
  name: string;
  sha: string;
}

export interface RemoteGitRepository {
  name: string | null;
  url: string | null;
  private: boolean | null;
  fullName: string | null;
  admin: boolean | null;
  defaultBranch: string;
}

export interface RemoteGitRepos {
  repos: RemoteGitRepository[];
  totalRepos: number | null;
  currentPage: number | null;
  pageSize: number | null;
}

export type File = {
  path: string;
  content: string | null;
};

export type UpdateFile = {
  path: string;
  content: string | null | UpdateFileFn;
};

export type UpdateFileFn = ({ exists }: { exists: boolean }) => string | null;

export interface GitFile {
  name: string | null;
  path: string | null;
  content: string;
  htmlUrl: string | null;
}

export interface GitResourceMeta {
  serverPath: string;
  adminUIPath: string;
}

export interface GetRepositoryArgs {
  owner: string;
  repositoryName: string;
  gitGroupName?: string;
}

export interface CreateRepositoryArgs {
  gitOrganization: RemoteGitOrganization;
  owner: string;
  repositoryName: string;
  isPrivateRepository: boolean;
  gitGroupName?: string;
}

export interface GetRepositoriesArgs {
  limit: number;
  page: number;
  gitGroupName?: string;
}

export interface GetFileArgs {
  owner: string;
  repositoryName: string;
  baseBranchName?: string;
  path: string;
}

export interface CreatePullRequestArgs {
  owner: string;
  repositoryName: string;
  branchName: string;
  commitMessage: string;
  pullRequestTitle: string;
  pullRequestBody: string;
  pullRequestMode: EnumPullRequestMode;
  gitResourceMeta: GitResourceMeta;
  files: File[];
}

export interface CreatePullRequestFromFilesArgs {
  owner: string;
  repositoryName: string;
  branchName: string; // head
  commitMessage: string;
  pullRequestTitle: string;
  pullRequestBody: string;
  files: UpdateFile[];
}

export interface GetPullRequestForBranchArgs {
  owner: string;
  repositoryName: string;
  branchName: string;
}

export interface CreatePullRequestForBranchArgs {
  owner: string;
  repositoryName: string;
  branchName: string;
  defaultBranchName: string;
  pullRequestTitle: string;
  pullRequestBody: string;
}

export interface CreateCommitArgs {
  owner: string;
  repositoryName: string;
  commitMessage: string;
  branchName: string;
  files: UpdateFile[];
}

export interface LinksMetadata {
  href: string;
  name: string;
}

export interface CurrentUser {
  links: {
    avatar: LinksMetadata;
  };
  username: string;
  uuid: string;
  displayName: string;
  useGroupingForRepositories: boolean;
}

export interface OAuthData {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresAt: number; // Unix timestamp
  scopes: string[];
}

export interface OAuth2FlowArgs {
  accessToken: string;
  refreshToken: string;
}

export interface PaginatedGitGroup {
  size: number;
  page: number;
  pagelen: number;
  next: string;
  previous: string;
  groups: GitGroup[];
}

export interface GitGroup {
  id: string;
  name: string;
  slug: string;
}

export interface GetBranchArgs {
  owner: string;
  repositoryName: string;
  branchName: string;
}

export interface CreateBranchIfNotExistsArgs {
  owner: string;
  repositoryName: string;
  branchName: string;
  gitClient: GitClient;
}

export interface CreateBranchArgs {
  owner: string;
  repositoryName: string;
  branchName: string;
  pointingSha: string;
}

export interface Commit {
  sha: string;
}

export interface GitUser {
  id: string;
  login: string;
}

export interface CloneUrlArgs {
  owner: string;
  repositoryName: string;
  token: string;
}

export interface PreCommitProcessArgs {
  gitClient: GitClient;
  branchName: string;
  owner: string;
  repositoryName: string;
}

export type PreCommitProcessResult = Promise<{
  diff: string | null;
}>;

export interface PostCommitProcessArgs {
  diffPath: string;
  gitClient: GitClient;
}

export interface FindOneIssueInput {
  owner: string;
  repositoryName: string;
  issueNumber: number;
}

interface CreatePullRequestCommentInput {
  body: string;
}

export interface CreatePullRequestCommentArgs {
  where: FindOneIssueInput;
  data: CreatePullRequestCommentInput;
}

export interface PullRequest {
  url: string;
  number: number;
}

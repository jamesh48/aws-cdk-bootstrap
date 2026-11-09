#!/usr/bin/env node
import 'source-map-support/register';
//
import * as dotenv from 'dotenv';
dotenv.config();

import * as cdk from 'aws-cdk-lib';
import { AwsBootstrapCdkStack } from '../lib/aws_bootstrap_cdk-stack';
import { GithubOidcStack } from '../lib/github_oidc-stack';

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

new AwsBootstrapCdkStack(app, 'AwsBootstrapCdkStack', { env });

new GithubOidcStack(app, 'GithubOidcStack', {
  env,
  repos: [
    'jamesh48/aws-cdk-bootstrap',
    'jamesh48/PostgresEc2Stack-CDK',
    'jamesh48/fsh-ai-job-coach',
  ],
});

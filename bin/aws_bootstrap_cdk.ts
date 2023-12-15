#!/usr/bin/env node
import 'source-map-support/register';
//
import * as dotenv from 'dotenv';
dotenv.config();

import * as cdk from 'aws-cdk-lib';
import { AwsBootstrapCdkStack } from '../lib/aws_bootstrap_cdk-stack';

const app = new cdk.App();
const { AWS_ACM_FSH_CERTIFICATE_ARN, AWS_VPC_ID } = process.env;

if (!AWS_ACM_FSH_CERTIFICATE_ARN) {
  throw new Error('AWS_ACM_FSH_CERTIFICATE_ARN env is undefined!');
}

if (!AWS_VPC_ID) {
  throw new Error('AWS_VPC_ID env is undefined');
}

new AwsBootstrapCdkStack(app, 'AwsBootstrapCdkStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  aws_env: {
    AWS_ACM_FSH_CERTIFICATE_ARN,
    AWS_VPC_ID,
  },
});

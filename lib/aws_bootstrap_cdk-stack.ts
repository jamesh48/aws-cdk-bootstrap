import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

import {
  ALB,
  ECSTaskDefinitionRole,
  ECSTaskExecutionRole,
  ECSCluster,
  LambdaExecutionRole,
  Vpc,
} from './components';

interface AwsBootstrapCdkStackProps extends cdk.StackProps {
  aws_env: {
    AWS_ACM_BCP_CERTIFICATE_ARN: string;
    AWS_ACM_CDB_CERTIFICATE_ARN: string;
    AWS_ACM_FSH_CERTIFICATE_ARN: string;
    AWS_ACM_LMK_CERTIFICATE_ARN: string;
    AWS_ACM_SRG_CERTIFICATE_ARN: string;
    AWS_VPC_ID: string;
  };
}

export class AwsBootstrapCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AwsBootstrapCdkStackProps) {
    super(scope, id, props);

    const generatedVpc = new Vpc(this, 'jh-e1-vpc', {
      maxAzs: 2,
      enableDnsHostnames: true,
      enableDnsSupport: true,
      defaultInstanceTenancy: ec2.DefaultInstanceTenancy.DEFAULT,
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        // {
        //   cidrMask: 24,
        //   name: 'Private',
        //   subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        // },
      ],
    });

    new ECSTaskExecutionRole(this, 'jh-ecs-task-execution-role', {
      roleName: 'jh-ecs-task-execution-role',
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });

    new ECSTaskDefinitionRole(this, 'jh-ecs-task-definition-role', {
      roleName: 'jh-ecs-task-definition-role',
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });

    new LambdaExecutionRole(this, 'jh-ecs-lambda-role', {
      roleName: 'jh-lambda-execution-role',
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    });

    new ECSCluster(this, 'jh-ecs-cluster', {
      clusterName: 'jh-e1-ecs-cluster',
      vpc: generatedVpc,
    });

    new ALB(this, 'jh-alb', {
      loadBalancerName: 'jh-alb',
      vpc: generatedVpc,
      internetFacing: true,
      aws_env: props.aws_env,
      idleTimeout: cdk.Duration.seconds(120),
    });
  }
}

import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class LambdaExecutionRole extends iam.Role {
  constructor(scope: Construct, id: string, props: iam.RoleProps) {
    super(scope, id, props);

    this.addToPolicy(
      new iam.PolicyStatement({
        actions: [
          'ec2:DescribeInstances',
          'ec2:CreateNetworkInterface',
          'ec2:AttachNetworkInterface',
          'ec2:DescribeNetworkInterfaces',
          'autoscaling:CompleteLifecycleAction',
          'ec2:DeleteNetworkInterface',
        ],
        sid: 'vpclambda',
        effect: iam.Effect.ALLOW,
        resources: ['*'],
      })
    );

    this.addToPolicy(
      new iam.PolicyStatement({
        actions: ['dynamodb:GetItem'],
        effect: iam.Effect.ALLOW,
        resources: ['*'],
      })
    );

    this.addToPolicy(
      new iam.PolicyStatement({
        actions: ['lambda:InvokeFunction'],
        effect: iam.Effect.ALLOW,
        resources: ['*'],
      })
    );

    this.addToPolicy(
      new iam.PolicyStatement({
        actions: [
          'logs:CreateLogGroup',
          'logs:CreateLogStream',
          'logs:DescribeLogGroups',
          'logs:DescribeLogStreams',
          'logs:PutLogEvents',
          'ssmmessages:CreateControlChannel',
          'ssmmessages:CreateDataChannel',
          'ssmmessages:OpenControlChannel',
          'ssmmessages:OpenDataChannel',
        ],
        effect: iam.Effect.ALLOW,
        resources: ['*'],
      })
    );
  }
}

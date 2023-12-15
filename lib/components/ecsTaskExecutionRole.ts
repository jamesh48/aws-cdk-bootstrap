import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class ECSTaskExecutionRole extends iam.Role {
  constructor(scope: Construct, id: string, props: iam.RoleProps) {
    super(scope, id, props);

    this.addToPolicy(
      new iam.PolicyStatement({
        actions: [
          'ecr:BatchCheckLayerAvailability',
          'ecr:BatchGetImage',
          'ecr:GetDownloadUrlForLayer',
        ],
        effect: iam.Effect.ALLOW,
        resources: ['arn:aws:ecr:*:471507967541:repository/*'],
      })
    );

    this.addToPolicy(
      new iam.PolicyStatement({
        actions: ['ecr:GetAuthorizationToken'],
        effect: iam.Effect.ALLOW,
        resources: ['*'],
      })
    );

    this.addToPolicy(
      new iam.PolicyStatement({
        actions: ['logs:CreateLogStream', 'logs:PutLogEvents'],
        effect: iam.Effect.ALLOW,
        resources: ['arn:aws:logs:*:471507967541:log-group:*'],
      })
    );
  }
}

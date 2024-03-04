import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { Construct } from 'constructs';

interface JHALBProps extends elbv2.ApplicationLoadBalancerProps {
  aws_env: {
    AWS_ACM_FSH_CERTIFICATE_ARN: string;
    AWS_ACM_SRG_CERTIFICATE_ARN: string;
    AWS_ACM_LMK_CERTIFICATE_ARN: string;
  };
}

export class ALB extends elbv2.ApplicationLoadBalancer {
  constructor(scope: Construct, id: string, props: JHALBProps) {
    super(scope, id, props);

    this.addRedirect({
      sourcePort: 80,
      targetPort: 443,
      sourceProtocol: elbv2.ApplicationProtocol.HTTP,
      targetProtocol: elbv2.ApplicationProtocol.HTTPS,
    });

    this.addListener('jh-https-listener', {
      certificates: [
        // FSH
        acm.Certificate.fromCertificateArn(
          this,
          'fsh-imported-certificate',
          props.aws_env.AWS_ACM_FSH_CERTIFICATE_ARN
        ),
        // SRG
        acm.Certificate.fromCertificateArn(
          this,
          'srg-imported-certificate',
          props.aws_env.AWS_ACM_SRG_CERTIFICATE_ARN
        ),
        // LMK
        acm.Certificate.fromCertificateArn(
          this,
          'lmk-imported-certificate',
          props.aws_env.AWS_ACM_LMK_CERTIFICATE_ARN
        ),
      ],
      port: 443,
      defaultAction: elbv2.ListenerAction.fixedResponse(200, {
        contentType: 'text/plain',
        messageBody: 'ok',
      }),
    });
  }
}

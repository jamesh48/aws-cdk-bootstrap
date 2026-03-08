import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';

interface JHALBProps extends elbv2.ApplicationLoadBalancerProps {}

export class ALB extends elbv2.ApplicationLoadBalancer {
  constructor(scope: Construct, id: string, props: JHALBProps) {
    super(scope, id, props);

    this.addRedirect({
      sourcePort: 80,
      targetPort: 443,
      sourceProtocol: elbv2.ApplicationProtocol.HTTP,
      targetProtocol: elbv2.ApplicationProtocol.HTTPS,
    });

    const hostedZoneJobCoach = route53.HostedZone.fromLookup(
      this,
      'HostedZoneJobCoach',
      {
        domainName: 'lmkn.net',
      },
    );

    const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
      domainName: 'cassanova.net',
    });

    const hostedZoneSRG = route53.HostedZone.fromLookup(
      this,
      'HostedZone-SRG',
      {
        domainName: 'stravareportgenerator.com',
      },
    );

    const cassanovaCert = new acm.Certificate(this, 'Certificate', {
      domainName: 'cassanova.net',
      subjectAlternativeNames: ['*.cassanova.net'],
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    const srgCert = new acm.Certificate(this, 'Certificate-SRG', {
      domainName: 'stravareportgenerator.com',
      subjectAlternativeNames: ['*.stravareportgenerator.com'],
      validation: acm.CertificateValidation.fromDns(hostedZoneSRG),
    });

    const jobCoachCert = new acm.Certificate(this, 'Certificate-JobCoach', {
      domainName: 'lmkn.net',
      subjectAlternativeNames: ['*.lmkn.net'],
      validation: acm.CertificateValidation.fromDns(hostedZoneJobCoach),
    });

    this.addListener('jh-https-listener', {
      certificates: [
        // Cassanova
        cassanovaCert,
        // Strava Report Generator
        srgCert,
        // Job Coach
        jobCoachCert,
      ],
      port: 443,
      defaultAction: elbv2.ListenerAction.fixedResponse(200, {
        contentType: 'text/plain',
        messageBody: 'ok',
      }),
    });
  }
}

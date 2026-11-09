# aws-cdk-bootstrap

CDK (TypeScript) app for shared AWS infrastructure in `us-east-1`.

## Stacks

| Stack | Contents |
|---|---|
| `AwsBootstrapCdkStack` | VPC, ECS cluster, ALB (with Route 53 / ACM certificates), and shared IAM roles for ECS tasks and Lambda |
| `GithubOidcStack` | GitHub Actions OIDC provider and the `github-actions-cdk-deploy` role the deploy workflow assumes |

`GithubOidcStack` is kept separate so destroying `AwsBootstrapCdkStack` from GitHub Actions doesn't delete the role the workflow runs as.

## Commands

| Command | Description |
|---|---|
| `npm run build` | Compile TypeScript |
| `npm run watch` | Compile on change |
| `npm run test` | Run Jest tests |
| `npm run diff` | Diff `AwsBootstrapCdkStack` against what's deployed |
| `npm run deploy` | Deploy `AwsBootstrapCdkStack` |
| `npm run destroy` | Destroy `AwsBootstrapCdkStack` |
| `npm run diff:oidc` | Diff `GithubOidcStack` |
| `npm run deploy:oidc` | Deploy `GithubOidcStack` |
| `npm run destroy:oidc` | Destroy `GithubOidcStack` |

Extra CDK flags go after `--`, e.g. `npm run deploy -- --require-approval never`.

The target account and region come from your active AWS credentials/profile.

## Deploying with GitHub Actions

The **Deploy CDK Stack** workflow (`.github/workflows/deploy.yml`) is run manually from the Actions tab and runs `diff`, `deploy`, or `destroy` against `AwsBootstrapCdkStack`. Destroy requires typing `AwsBootstrapCdkStack` into the `confirm_destroy` input.

### One-time setup

1. Bootstrap CDK in the account/region if it hasn't been already:
   ```bash
   npx cdk bootstrap
   ```
2. Deploy the OIDC stack locally (the workflow can't create the role it signs in with):
   ```bash
   npm run deploy:oidc
   ```
   Note the `DeployRoleArn` output.
3. In the repo's **Settings → Secrets and variables → Actions**, add:

   | Name | Kind | Value |
   |---|---|---|
   | `AWS_REGION` | Variable | `us-east-1` |
   | `AWS_DEPLOY_ROLE_ARN` | Secret | The `DeployRoleArn` output from step 2 |

Route 53 hosted-zone lookups are cached in `cdk.context.json`; commit changes to it so the workflow uses the same values.

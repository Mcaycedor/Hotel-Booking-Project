# Developer Setup Guide

## TL;DR

### AWS CLI & Credentials

- Configure your AWS CLI credentials for the dev environment

### Podman

- Download and install [Podman Desktop](https://podman-desktop.io/downloads) including Podman runtime

### Local Environment Variables

- Make sure you have a local `.env.local` file in the root of this project, with:

```bash
# Local SonarQube server URL
SONAR_HOST_URL=http://localhost:9000
# Your SonarQube user token
SONAR_TOKEN=<your-sonar-token>

# CDK Deployment Configuration
ENV_PREFIX='philippe'   # developer name as distinguishable environment prefix
PROJECT_NAME='gigisa'    # application stack name, e.g.: GEN Platform Starter App
VPC_PREFIX='Dev'        # VPC AWS environment
AWS_PROFILE='gen-dev'   # developer AWS profile (bounded to an AWS account and region)

# Using Podman locally instead of default Docker
DOCKER_HOST='npipe:////./pipe/podman-machine-default'
DOCKER_BUILDKIT=0
```

Refer to the README files in each package for additional documentation.

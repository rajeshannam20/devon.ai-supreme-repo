
# Security Policy

## Supported Versions

The following versions of the Devonn.AI platform are currently receiving security updates:

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | :white_check_mark: |
| 1.9.x   | :white_check_mark: |
| 1.8.x   | :white_check_mark: |
| 1.7.x   | :x:                |
| < 1.7   | :x:                |

## Security Update Policy

- **Critical** security patches will be released as soon as possible, typically within 24-48 hours
- **High** severity issues will be addressed within 7 days
- **Medium** and **Low** severity issues will be included in the next scheduled release

## Reporting a Vulnerability

We take security vulnerabilities seriously. Please help us protect our users by responsibly disclosing security issues.

### How to Report

1. **DO NOT** create public GitHub issues for security vulnerabilities
2. Report security vulnerabilities by email to: **security@devonn.ai**
3. Include as much detail as possible about the vulnerability:
   - Type of issue
   - Full paths of source files related to the issue
   - Location of the affected source code
   - Any special configuration required to reproduce the issue
   - Step-by-step instructions to reproduce the issue
   - Proof-of-concept or exploit code (if possible)
   - Impact of the issue, including how an attacker might exploit it

### What to Expect

- You will receive an acknowledgment within 24 hours
- We will validate the vulnerability and determine its impact
- We will release a patch and credit the reporter (unless anonymity is requested)

## Security Measures

Devonn.AI implements these security measures:

1. **Infrastructure Security**
   - Multi-factor authentication for all infrastructure access
   - Just-in-time access provisioning for administrative functions
   - Regular vulnerability scanning of infrastructure components
   - Automated security updates for operating system packages

2. **Data Security**
   - Encryption at rest for all data stores
   - Encryption in transit using TLS 1.2+
   - Secure key management with AWS KMS
   - Regular backup validation procedures

3. **Code Security**
   - Static code analysis in CI/CD pipeline
   - Dependency vulnerability scanning
   - Regular penetration testing
   - Secure development practices training

4. **Operational Security**
   - Security monitoring and alerting
   - Incident response procedures
   - Least privilege access control
   - Regular security reviews and audits

## Vulnerability Disclosure Timeline

When a security vulnerability is reported, we follow this disclosure timeline:

1. **0 days**: Initial report received and acknowledged
2. **1-3 days**: Vulnerability validated and severity assessed
3. **4-10 days**: Patch developed and tested (timeline may vary based on complexity)
4. **Up to 30 days**: Patch released to all supported versions
5. **30-90 days**: Public disclosure after patch has been widely deployed

This timeline may be adjusted based on the severity of the vulnerability, the complexity of the fix, and other factors.

## Third-Party Vulnerability Management

For vulnerabilities in third-party dependencies:

1. We monitor security advisories for all dependencies
2. We use automated tools to identify vulnerabilities in the dependency graph
3. We promptly update dependencies with security patches
4. We maintain a Software Bill of Materials (SBOM) for our applications

## Security Contacts

For security inquiries, please contact:
- Security Team: security@devonn.ai
- Security Response Team Lead: security-lead@devonn.ai

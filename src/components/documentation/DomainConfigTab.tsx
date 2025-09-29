
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const DomainConfigTab: React.FC = () => {
  return (
    <div className="mt-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Domain Configuration</CardTitle>
          <CardDescription>Set up your DEVONN.AI Framework on devonn.ai domain</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <h3 className="text-lg font-semibold">DNS Configuration</h3>
          <p>To point your devonn.ai domain to your Kubernetes cluster, you'll need to update your DNS settings:</p>
          
          <div className="bg-secondary p-4 rounded-md mt-2 mb-4">
            <p className="font-semibold">Current nameservers:</p>
            <ul className="list-disc pl-6">
              <li>ns1.dns-parking.com</li>
              <li>ns2.dns-parking.com</li>
            </ul>
            <p className="mt-2">These need to be updated to point to your cloud provider's nameservers.</p>
          </div>
          
          <h3 className="text-lg font-semibold mt-4">AWS Route53 Configuration</h3>
          <p>For AWS deployment, set up Route53:</p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Create a hosted zone for devonn.ai in Route53</li>
            <li>Note the 4 nameservers assigned to your hosted zone</li>
            <li>Update your domain registrar to use these nameservers</li>
            <li>Create required DNS records:</li>
          </ol>
          
          <pre className="bg-secondary p-4 rounded-md overflow-x-auto mt-2">
            <code>{`# A record for apex domain
devonn.ai.                 300    IN    A    <ELB-IP>

# CNAME for www subdomain
www.devonn.ai.             300    IN    CNAME    devonn.ai.

# TXT record for domain verification
devonn.ai.                 300    IN    TXT    "v=spf1 include:_spf.google.com ~all"

# For automatic SSL with cert-manager
_acme-challenge.devonn.ai. 300    IN    TXT    <ACME-CHALLENGE-VALUE>`}</code>
          </pre>
          
          <h3 className="text-lg font-semibold mt-4">Kubernetes Ingress Configuration</h3>
          <p>Configure your Ingress to use your domain:</p>
          
          <pre className="bg-secondary p-4 rounded-md overflow-x-auto mt-2">
            <code>{`apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: devonn-ai-ingress
  annotations:
    kubernetes.io/ingress.class: "alb"
    alb.ingress.kubernetes.io/scheme: "internet-facing"
    alb.ingress.kubernetes.io/target-type: "ip"
    alb.ingress.kubernetes.io/certificate-arn: "<ACM-CERTIFICATE-ARN>"
spec:
  rules:
  - host: devonn.ai
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
  - host: www.devonn.ai
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
  - host: api.devonn.ai
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 8080
  tls:
  - hosts:
    - devonn.ai
    - www.devonn.ai
    - api.devonn.ai
    secretName: devonn-ai-tls`}</code>
          </pre>
          
          <h3 className="text-lg font-semibold mt-4">SSL Certificate with cert-manager</h3>
          <p>Automatically provision and renew SSL certificates:</p>
          
          <pre className="bg-secondary p-4 rounded-md overflow-x-auto mt-2">
            <code>{`apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: devonn-ai-cert
  namespace: devonn
spec:
  secretName: devonn-ai-tls
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer
  dnsNames:
  - devonn.ai
  - www.devonn.ai
  - api.devonn.ai`}</code>
          </pre>
          
          <h3 className="text-lg font-semibold mt-4">Terraform DNS Configuration</h3>
          <p>Automate DNS management with Terraform:</p>
          
          <pre className="bg-secondary p-4 rounded-md overflow-x-auto mt-2">
            <code>{`# Create Route53 zone
resource "aws_route53_zone" "devonn_ai" {
  name = "devonn.ai"
  
  tags = {
    Project = "DevonnAI"
  }
}

# Create A record pointing to ALB
resource "aws_route53_record" "devonn_ai_a" {
  zone_id = aws_route53_zone.devonn_ai.zone_id
  name    = "devonn.ai"
  type    = "A"
  
  alias {
    name                   = module.alb.lb_dns_name
    zone_id                = module.alb.lb_zone_id
    evaluate_target_health = true
  }
}

# Create www CNAME
resource "aws_route53_record" "www_devonn_ai" {
  zone_id = aws_route53_zone.devonn_ai.zone_id
  name    = "www.devonn.ai"
  type    = "CNAME"
  ttl     = 300
  records = ["devonn.ai"]
}

# Output nameservers to update with registrar
output "nameservers" {
  value = aws_route53_zone.devonn_ai.name_servers
}`}</code>
          </pre>
          
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-md mt-6">
            <h4 className="font-semibold text-amber-800">Important Notes:</h4>
            <ul className="list-disc pl-6 text-amber-900 mt-2">
              <li>After updating nameservers, DNS propagation may take up to 48 hours</li>
              <li>Always test your SSL configuration before going live</li>
              <li>Set up monitoring for certificate expiration</li>
              <li>The domain devonn.ai is valid until 2026-04-04 with auto-renewal enabled</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DomainConfigTab;

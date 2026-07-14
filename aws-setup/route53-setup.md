# Route 53 — catalogue.surpluss.co Setup

## Option A: Point to Vercel (fastest, recommended for now)
1. Go to AWS Console → Route 53 → Hosted zones → surpluss.co
2. Create record:
   - Record name: catalogue
   - Record type: CNAME
   - Value: cname.vercel-dns.com
   - TTL: 300
3. In Vercel: Settings → Domains → Add → catalogue.surpluss.co

## Option B: Point to your EC2/ECS running Next.js
1. Get your EC2 public IP or load balancer DNS
2. Create record:
   - Record name: catalogue
   - Record type: A (for IP) or CNAME (for DNS)
   - Value: your EC2 IP or load balancer DNS

## After DNS propagates (5-30 minutes):
- catalogue.surpluss.co → your Next.js app
- All deal links: catalogue.surpluss.co/deals/your-slug

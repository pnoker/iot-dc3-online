---
layout: page
title: Pricing & Plans
description: IoT DC3 pricing — the Community edition is free and open source forever (AGPL-3.0); Professional is a plan tiered by point count with monthly/annual billing and per-node distributed add-on; Enterprise adds commercial licensing, custom drivers and services.
---

<PricingPlans />

<div class="pricing-article">

## FAQ

### What is a point (tag), and how is it billed?

A point is one collected data point on a device (a temperature, a pressure, a switch…). Professional is billed in whole point tiers — ≤ 500 / ≤ 1,000 / ≤ 5,000 / ≤ 10,000 points. Exceeding a tier moves you to the next one; there is no per-point metering.

Point count is only access scale — real load also depends on sampling frequency and history volume: the same 500 points write about 43M rows a day at 1-second sampling versus roughly 12k at hourly. Each tier therefore also includes a monthly history-write cap (5M – 100M rows) with storage sized at roughly 12× the monthly cap; exceeding either the point count or the data volume moves you up a tier, and usage beyond your tier falls outside the support coverage. The self-hosted Community edition has no such limits.

### How is distributed (multi-node) deployment billed?

The Community edition ships distributed capabilities fully open source — deploy and operate them yourself. Professional includes 1 standalone production instance; each cluster node is a flat add-on (+$19/node·month, $228/year). Enterprise has no node limit and includes a high-availability architecture review. Multiple environments (e.g. production and testing) are billed separately by instance and node.

### What if I need a driver beyond the 36 standard ones?

Standard drivers are included with every plan at no cost. A private or proprietary protocol driver is a one-off custom development from $4,000 per driver, delivered with source code and docs. Enterprise includes custom driver development credits.

### What is the difference between monthly and annual billing?

Annual saves 20% overall at the same tier and supports a single consolidated invoice. Monthly is flexible — change tiers anytime. The difference is the billing cycle, not features.

### How do payment and invoicing work?

Once we confirm the plan by email, we provide a formal quotation and a service agreement. We accept Alipay, WeChat Pay and bank transfer; businesses can book the expense against the agreement and invoice. We issue VAT general invoices (fapiao) for IT services; special VAT invoices are not supported yet — mention it in your email if you need one. Emails are answered within 3 business days.

### Can I use the Community edition commercially for free?

Yes. IoT DC3 is licensed under AGPL-3.0, which permits commercial and internal use as long as the license terms are followed (for example, releasing the source of your modified version to those you serve). If your scenario cannot satisfy the AGPL — such as closed-source integration or OEM distribution — you need an Enterprise commercial license.

### Is Professional different from Community in features?

No. Tiers define the officially backed scale boundary, not a feature unlock: every capability ships fully open in the Community edition, and your point count and data volume set the tier.

### How do I upgrade from Community to Professional or Enterprise?

The code is the same source — no migration or reinstallation needed. Keep your current deployment and reach us at [pnokers@icloud.com](mailto:pnokers@icloud.com) to activate your tier and license.

### Will a hosted (SaaS) edition be offered?

It is on the roadmap. Tell us your scale and scenario at [pnokers@icloud.com](mailto:pnokers@icloud.com) to help us prioritize.

</div>

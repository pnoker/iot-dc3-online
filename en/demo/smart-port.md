---
layout: page
navbar: false
title: 'Smart Port IoT Dashboard - Quay Crane and Berth Scheduling'
description: 'IoT DC3 Smart Port IoT dashboard: quay cranes, yard flows and berth turns at a glance, with top-down dispatch, 3D yard and berth Gantt showing the whole port cadence.'
---
<SmartPortPanel />

<div class="demo-seo-desc">
<p>This dashboard demonstrates IoT DC3 for smart ports: quay cranes, yard flows and berth turns on one screen, with 3D yard capacity and a berth-operation Gantt showing the whole port cadence and live crane efficiency for lean dispatch.</p>
</div>


<div class="demo-article">

## Dashboard highlights

- Berth-crane operation Gantt: vessel berthing and quay-crane progress at a glance.
- Tide windows visualized to support berthing decisions.
- Yard block profiles, throughput trends and KPIs, STS efficiency ranking, crane moves gauge and autonomous-truck dispatch view.

## Business value

- Berth and crane efficiency benchmarked, bottlenecks located.
- Better tide-window utilization cuts waiting time.
- Yard turnover and equipment efficiency on one scorecard.

## How to build this on IoT DC3

Terminal operating systems, crane PLCs, gate and positioning data onboard through protocol drivers and ODBC. Operations events and equipment states share one time-series model, with efficiency indicators computed live by the rule engine. See the [documentation](https://docs.dc3.site/en/) and the [GitHub repository](https://github.com/pnoker/iot-dc3).

## FAQ

### Is the data real?

This page runs on mock data; connect your TOS and equipment feeds to reproduce it.

### Can existing TOS data be ingested?

Yes — the ODBC driver pulls operational data from TOS databases, while PLC drivers add real-time equipment state.

</div>

---
layout: page
navbar: false
title: 'Cold Chain IoT Dashboard - End-to-end Temperature Traceability'
description: 'IoT DC3 Cold Chain IoT dashboard: from warehouse to trailer door, every degree in sight — route temperature zones, compliance bands and chain-break Sankey for full traceability.'
---
<ColdChainPanel />

<div class="demo-seo-desc">
<p>This dashboard demonstrates IoT DC3 for cold-chain logistics: from cold-storage slots to trailer-door handover, route traces overlaid with temperature zones, compliance bands and a chain-break Sankey flagging risk segments — full temperature and route traceability.</p>
</div>


<div class="demo-article">

## Dashboard highlights

- Fleet temperature-layer map: routes overlaid with temperature zones, in-transit deviations visible instantly.
- Cold-storage zone distribution and compliance bands at slot level.
- Chain-break Sankey pinpointing risk segments, with dock-operation Gantt for handover.
- Refrigerant loop, efficiency and fleet ranking, and end-to-end temperature trends.

## Business value

- GSP/HACCP-compliant temperature records with complete evidence.
- Chain breaks traceable to a transport leg or handover point.
- Refrigeration efficiency benchmarking cuts cold-store operating cost.

## How to build this on IoT DC3

Vehicle terminals (GPS + temperature/humidity) report over MQTT/HTTP, while cold-store sensors and refrigeration equipment connect over Modbus. Route and temperature series share one time-series store, and chain-break rules automatically raise alarms and traceability records. See the [documentation](https://docs.dc3.site/en/) and the [GitHub repository](https://github.com/pnoker/iot-dc3).

## FAQ

### Is the data real?

This page runs on mock data; with real vehicle terminals and cold-store sensors, the traceability chain looks the same.

### How long is temperature data kept?

The time-series store supports multi-year retention and export, meeting GSP-style record-keeping requirements.

</div>

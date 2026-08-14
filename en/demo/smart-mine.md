---
layout: page
navbar: false
title: 'Smart Mine IoT Dashboard - Gas Ventilation and Safety Alerts'
description: 'IoT DC3 Smart Mine IoT dashboard: one map above and below ground sensing gas, ventilation, personnel and equipment, with three-tier methane alerts for safety.'
---
<SmartMinePanel />

<div class="demo-seo-desc">
<p>This dashboard demonstrates IoT DC3 for smart mining: one map above and below ground consolidating methane, ventilation, personnel and shearer status, with three-tier methane thresholds triggering second-level alerts, power cut-off and evacuation.</p>
</div>


<div class="demo-article">

## Dashboard highlights

- Gas concentration trends against three threshold lines with tiered alarms.
- Ventilation network topology and main-fan gauges.
- Tunnel profiles, personnel distribution, equipment runtime matrix, output ranking, sump levels and tunneling rates.

## Business value

- Gas and ventilation anomalies alarmed in seconds for early response.
- Personnel location and equipment runtime made transparent for management.
- Water (sump level) and tunneling progress supervised on the same screen.

## How to build this on IoT DC3

Mine safety monitoring, personnel positioning and longwall equipment connect through Modbus, MQTT and other drivers. Gas follows three-tier threshold rules, and ventilation and personnel data share one model, ready to interwork with broadcast and power-interlock systems. See the [documentation](https://docs.dc3.site/en/) and the [GitHub repository](https://github.com/pnoker/iot-dc3).

## FAQ

### Is the data real?

This page runs on mock data including occasional gas surges; connect the mine safety system to go live.

### What about unstable underground networks?

Edge gateways sit on the underground ring network, buffering during outages and resuming automatically — critical data is not lost.

</div>

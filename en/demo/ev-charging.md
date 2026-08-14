---
layout: page
navbar: false
title: 'EV Charging IoT Dashboard - Charger Load and PV-Storage-Charging'
description: 'IoT DC3 EV Charging IoT dashboard: a citywide charging atlas of stall distribution, live load and order flow, with PV-storage-charging Sankey and per-gun heatmaps.'
---
<EvChargingPanel />

<div class="demo-seo-desc">
<p>This dashboard demonstrates IoT DC3 for citywide EV charging: charger LBS distribution and live load at a glance, order flow and per-gun utilization heatmaps identifying busy stations, and a PV-storage-charging Sankey showing green-energy uptake.</p>
</div>


<div class="demo-article">

## Dashboard highlights

- Citywide station map with power capsules: load distribution and busy sites in real time.
- Session heatmaps by time-of-day and per-gun utilization rankings.
- Storage SOC, transformer gauges, PV-storage-charging Sankey and power-quality monitoring.

## Business value

- Peak-shaving guidance and load dispatch relieve grid stress.
- Transformer overload warnings keep sites safe.
- The PV-storage-charging Sankey shows how green energy is consumed.

## How to build this on IoT DC3

Chargers, storage and PV connect via MQTT, Modbus and other drivers, with operations orders joined through ODBC/HTTP. Load, SOC and transformer capacity share one model, and rules alarm on overloads and power-quality anomalies in real time. See the [documentation](https://docs.dc3.site/en/) and the [GitHub repository](https://github.com/pnoker/iot-dc3).

## FAQ

### Is the data real?

This page runs on mock data; connect your charger network and order system to go live.

### Does it support smart (ordered) charging?

Yes — the platform provides the real-time load data foundation plus a command channel, so smart-charging strategies can be dispatched per station and time window.

</div>

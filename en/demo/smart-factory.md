---
layout: page
navbar: false
title: 'Smart Factory IoT Dashboard - Real-time OEE Monitoring'
description: 'IoT DC3 Smart Factory IoT dashboard: a real-time OEE war room for discrete manufacturing — equipment status matrix, six-big-loss waterfall and process topology on one screen.'
---
<SmartFactoryPanel />

<div class="demo-seo-desc">
<p>This dashboard demonstrates IoT DC3 in discrete manufacturing: a real-time OEE war room combining a machine status matrix, a six-big-loss waterfall and process flow topology to track throughput, yield and equipment pace. All data is collected and normalized by IoT DC3's multi-protocol drivers, with edge-to-cloud delivery and alarm linkage.</p>
</div>


<div class="demo-article">

## Dashboard highlights

- Equipment status matrix: running, idle, fault and down states for the whole line on one screen.
- OEE ring and six-big-loss waterfall: availability, performance and quality decomposed step by step.
- Process flow topology: live routing from raw material to finished goods with key cycle times.
- Output and work-order completion rankings across shifts and lines.
- Tank levels, trends and an alarm/event log linked for root-cause tracing.

## Business value

- OEE moves from after-the-fact reporting to a real-time war room with losses pointing at improvement actions.
- Alarm-to-status linkage cuts unplanned downtime.
- Output and yield data is retained automatically for lean improvement and quality traceability.

## How to build this on IoT DC3

Line PLCs, sensors and SCADA connect through Modbus, OPC-UA, MQTT and other pluggable drivers, then map onto the unified device-point model (value + quality + timestamp). The rule engine raises alarms on thresholds and durations, while time-series storage keeps history for trend analysis. See the [documentation](https://docs.dc3.site/en/) and the [GitHub repository](https://github.com/pnoker/iot-dc3).

## FAQ

### Is the data real?

This page runs on mock data to demonstrate the visualization and metric definitions; once real devices are connected, the data pipeline is identical.

### What if my protocol is not in the driver list?

Drivers are pluggable: beyond the 28+ built-ins, IoT DC3 supports custom TCP/UDP driver development — see the driver-development guide in the docs.

</div>

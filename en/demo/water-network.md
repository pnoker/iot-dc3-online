---
layout: page
navbar: false
title: 'Water Network IoT Dashboard - Distribution Digital Twin'
description: 'IoT DC3 Water Network IoT dashboard: a digital twin of the urban water network from source to tap, with GIS, DMA four-quadrant leakage analysis and a flow Sankey diagram.'
---
<WaterNetworkPanel />

<div class="demo-seo-desc">
<p>This dashboard demonstrates IoT DC3 across an urban water network: a digital twin from source works to end taps, with a GIS overview, DMA four-quadrant leakage analysis and a flow Sankey that localize pipe losses, while pressure compliance is tracked in real time.</p>
</div>


<div class="demo-article">

## Dashboard highlights

- GIS digital twin of the network: source, treatment and distribution on one map.
- DMA quadrant view: night minimum flow vs. pressure to localize leaky district zones.
- Flow Sankey: water balance from intake to sales, making non-revenue water visible.
- Pump gauges, reservoir levels, quality heatmaps and pressure/flow trends.

## Business value

- Leak reduction with DMA night-flow analysis, cutting non-revenue water.
- Real-time pressure-drop alerts support burst localization and response.
- Continuous water-quality records satisfy regulatory reporting.

## How to build this on IoT DC3

Plant and pump-station PLCs, RTUs and pressure transmitters connect via Modbus, MQTT and other drivers. Edge gateways buffer during link outages and resume on recovery, while the rule engine raises tiered alarms on pressure and flow anomalies. See the [documentation](https://docs.dc3.site/en/) and the [GitHub repository](https://github.com/pnoker/iot-dc3).

## FAQ

### Is the data real?

This page runs on mock data; in production the source-to-tap pipeline looks exactly like what is shown here.

### How do I estimate leakage?

District metering with night-minimum-flow analysis is the common approach — the platform provides zone-metered points and history, and the quadrant rules evaluate leakage continuously.

</div>

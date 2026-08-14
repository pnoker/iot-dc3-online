---
layout: page
navbar: false
title: 'Oil and Gas IoT Dashboard - Pipeline Pressure and Line Pack'
description: 'IoT DC3 Oil and Gas IoT dashboard: thousands of kilometers of pipeline at a glance, with longitudinal profile, tank levels and line-pack peaking — SCADA guards every megapascal.'
---
<OilGasPanel />

<div class="demo-seo-desc">
<p>This dashboard demonstrates IoT DC3 for long-distance pipelines: a SCADA view with a longitudinal profile of elevation and pressure, real-time tank levels and line-pack accounting, megapascal-level pressure tracking for safe pipeline dispatch.</p>
</div>


<div class="demo-article">

## Dashboard highlights

- Pipeline profile and GIS map: pressure and flow presented segment by segment.
- Linepack and peak-shaving trends.
- Compressor gauges, tank levels and shell parameters, wellhead data, station ranking and gas-quality trends.

## Business value

- Linepack optimization and dispatch decisions grounded in data.
- Tiered early warning for pressure anomalies and suspected leaks.
- Quality and metering records retained for compliance.

## How to build this on IoT DC3

Station control and SCADA systems connect via Modbus, OPC-UA and other drivers with second-level sampling on key points. Threshold plus rate-of-change rules catch pressure anomalies, and time-series history supports linepack accounting and dispatch reviews. See the [documentation](https://docs.dc3.site/en/) and the [GitHub repository](https://github.com/pnoker/iot-dc3).

## FAQ

### Is the data real?

This page runs on mock data; connect your SCADA to get the same pressure and linepack trends.

### Can it handle long-distance pipeline data volumes?

Edge aggregation and downsampling plus cloud time-series storage partitioned by point — backed by TimescaleDB — sustain large point counts over long horizons.

</div>

---
layout: page
navbar: false
title: 'Precision Agriculture IoT Dashboard - Greenhouse Soil and Climate'
description: 'IoT DC3 Precision Agriculture IoT dashboard: sense every clod and microclimate in real time via layered greenhouse heatmaps, soil-moisture infiltration and irrigation Gantt.'
---
<PrecisionAgriPanel />

<div class="demo-seo-desc">
<p>This dashboard demonstrates IoT DC3 in controlled environment agriculture: layered greenhouse profiles of temperature, humidity, light and CO2, soil-moisture infiltration curves and an irrigation Gantt guiding water and nutrient decisions with millisecond responsiveness.</p>
</div>


<div class="demo-article">

## Dashboard highlights

- Greenhouse climate trends: long-horizon temperature, humidity, CO₂ and light curves.
- Layered greenhouse profile heatmap: vertical gradients instead of single-point averages.
- Soil moisture infiltration profile across the root zone.
- Crop stress gauge, irrigation Gantt and event log, outdoor weather radar.

## Business value

- Irrigation by actual soil moisture saves water and fertilizer while avoiding stress.
- Early warnings for frost, heat and wind risks.
- Growing-process records support standardization and traceability.

## How to build this on IoT DC3

Low-power field sensors report over LoRa/NB-IoT gateways via MQTT, while weather stations and fertigation controllers connect over Modbus. Air, soil and irrigation data share one device-point model, and the rule engine drives stress alarms and irrigation reminders. See the [documentation](https://docs.dc3.site/en/) and the [GitHub repository](https://github.com/pnoker/iot-dc3).

## FAQ

### Is the data real?

This page runs on mock data; with real sensors connected, the moisture and climate curves take the same shape.

### Does it work for open fields, not just greenhouses?

Yes — the point model is scenario-agnostic: field weather stations, soil probes and valve controllers onboard the same way.

</div>

---
layout: page
navbar: false
title: 'Smart Building IoT Dashboard - HVAC Energy and Occupancy'
description: 'IoT DC3 Smart Building IoT dashboard: a building that breathes — floor 3D heatmaps, sub-metered energy Sankey and psychrometric chart for HVAC, energy and occupancy.'
---
<SmartBuildingPanel />

<div class="demo-seo-desc">
<p>This dashboard demonstrates IoT DC3 for smart buildings: floor 3D heatmaps of occupancy, a sub-metered energy Sankey breaking down HVAC, lighting and power, and a psychrometric chart for AC optimization — toward a building that breathes.</p>
</div>


<div class="demo-article">

## Dashboard highlights

- Floor energy heatmap: spot the floor and zone consuming energy at a glance.
- Sub-metered energy Sankey: lighting, HVAC, drives and outlets decomposed.
- Chiller COP, load curves and a psychrometric chart for plant-room visibility.
- Occupancy timelines, tank levels, compliance bars and event log.

## Business value

- Energy baselines quantify the payback of retrofits.
- Chiller COP deviations surface early so operating strategies keep improving.
- Occupancy and compliance data back space operations and accountability.

## How to build this on IoT DC3

Building-automation systems, sub-metering power and water meters connect via Modbus, MQTT and other drivers, and existing energy-management databases can be reached through the ODBC driver. Sub-metered consumption is modeled as points, with rules alarming on offending floors and low-COP chillers. See the [documentation](https://docs.dc3.site/en/) and the [GitHub repository](https://github.com/pnoker/iot-dc3).

## FAQ

### Is the data real?

This page runs on mock data; connect your BA system and meters to get the same views.

### Can data from an existing BAS be ingested?

Yes — besides protocol drivers like Modbus/MQTT, the ODBC driver can pull directly from BAS or energy-management databases.

</div>

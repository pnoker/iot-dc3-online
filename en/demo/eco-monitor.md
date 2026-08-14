---
layout: page
navbar: false
title: 'Environmental Monitoring IoT Dashboard - Air and Water Pollution Grid'
description: 'IoT DC3 Environmental Monitoring IoT dashboard: one map for air, water and emissions, with an air-quality grid, pollution rose and six-factor radar from alert to source.'
---
<EcoMonitorPanel />

<div class="demo-seo-desc">
<p>This dashboard demonstrates IoT DC3 for environmental monitoring: a gridded air-quality network with station availability, a pollution rose identifying characteristic sources, a six-factor radar assessing air quality, with AQI traceable from alert to source.</p>
</div>


<div class="demo-article">

## Dashboard highlights

- Air-quality grid GIS: region-wide pollution on one map with hot grids standing out.
- AQI trends and a pollution rose for wind-direction source analysis.
- CEMS emission ranking, water sections, station online rate and exceedance alarm log.

## Business value

- Minute-level exceedance alerts with an auditable trail.
- Pollution rose plus grid heatmaps give source tracing a direction.
- Enterprise emission rankings enable targeted supervision.

## How to build this on IoT DC3

National/provincial stations, micro-sensors and CEMS devices onboard through protocol drivers or ODBC extraction. Exceedance rules alarm by factor and duration, and history supports episode replay. See the [documentation](https://docs.dc3.site/en/) and the [GitHub repository](https://github.com/pnoker/iot-dc3).

## FAQ

### Is the data real?

This page runs on mock data; connect monitoring stations to get the same single-map view.

### Which factors are supported?

The point model is factor-agnostic: air pollutants, VOCs, water parameters, noise and stack emissions all onboard as points with alarms.

</div>

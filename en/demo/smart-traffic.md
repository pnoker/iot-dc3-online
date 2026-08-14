---
layout: page
navbar: false
title: 'Smart Traffic IoT Dashboard - Congestion and Adaptive Signals'
description: 'IoT DC3 Smart Traffic IoT dashboard: city pulse in real time, with congestion heatmaps, intersection channelization and green-wave time-distance for adaptive signals and TPI.'
---
<SmartTrafficPanel />

<div class="demo-seo-desc">
<p>This dashboard demonstrates IoT DC3 across urban traffic: network congestion heatmaps and intersection channelization, green-wave time-distance diagrams and adaptive signals tuning intersection timing, with the Traffic Performance Index fully traceable.</p>
</div>


<div class="demo-article">

## Dashboard highlights

- Network congestion heatmap: citywide arterial TPI pulsing in real time.
- Intersection channelization with approach queue lengths.
- Green-wave time-space diagram to evaluate arterial coordination.
- Saturation ranking, signal-controller online rate, spillback alerts and event timeline.

## Business value

- Ranking plus heatmap gives congestion management a concrete grip.
- Green-wave plans can be quantified before and after deployment.
- Signal-controller outages are sensed within seconds.

## How to build this on IoT DC3

Signal controllers, magnetic detectors, checkpoints and radar feed IoT DC3 through custom TCP/UDP drivers or MQTT into an intersection-point model. Queues, saturation and other indicators are computed by the rule engine, with anomalies pushed through the alarm channel. See the [documentation](https://docs.dc3.site/en/) and the [GitHub repository](https://github.com/pnoker/iot-dc3).

## FAQ

### Is the data real?

This page runs on mock data with morning/evening peaks simulated; connect real detectors to reproduce it.

### Can it control signals?

IoT DC3 provides a command channel for issuing timing plans to controllers; the decision loop belongs to your traffic system while the platform supplies data and execution.

</div>

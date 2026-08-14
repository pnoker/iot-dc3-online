---
layout: page
navbar: false
title: 'Microgrid IoT Dashboard - PV-Storage Power Balance'
description: 'IoT DC3 Microgrid IoT dashboard: PV-storage orchestrated, with one-line topology power flow, battery SOC and power balance showing where every green electron goes.'
---
<MicrogridPanel />

<div class="demo-seo-desc">
<p>This dashboard demonstrates IoT DC3 for distributed energy: PV output, battery state of charge and load power balance on one screen, with a one-line topology that traces where every green electron goes and accounts for its carbon footprint, supporting peak-valley arbitrage and dispatch.</p>
</div>


<div class="demo-article">

## Dashboard highlights

- Single-line topology with live power flow among PV, storage, load and the grid.
- Power balance and green-rate: where every green electron comes from and goes.
- Storage SOC gauge and charge/discharge trends, with peak-valley arbitrage replay.
- Carbon bars, branch-load capsules, generation ranking and event log.

## Business value

- Peak-valley arbitrage and demand control directly cut energy cost.
- Maximized green-energy uptake with quantifiable carbon reduction.
- Branch and transformer loading made visible to prevent overloads.

## How to build this on IoT DC3

PV inverters, storage PCS, BMS and gateway meters connect via Modbus TCP, MQTT and other drivers at second-level sampling. Rule engines evaluate tariff windows and raise over-limit alarms, and the Spring AI loop can take predictions into dispatch decisions. See the [documentation](https://docs.dc3.site/en/) and the [GitHub repository](https://github.com/pnoker/iot-dc3).

## FAQ

### Is the data real?

This page runs on mock data with PV output following a day/night profile; connect real inverters and meters to go live.

### Can it do control, not just monitoring?

Yes — IoT DC3 has a command channel (including edge execution), so dispatch strategies can be issued to storage or load devices as command templates.

</div>

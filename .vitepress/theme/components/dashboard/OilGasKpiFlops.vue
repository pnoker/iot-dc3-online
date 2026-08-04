<script setup lang="ts">
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'
const {t} = useI18n()
const CYAN='#00e5ff',GREEN='#00e676',AMBER='#ffb020',PURPLE='#b980ff',BLUE='#2b9bff'
const KPIS=[
  {key:'pdev',label:t('压力偏差率','Pressure Dev.'),content:'{nt} %',fill:AMBER,baseline:2.4,unit:'%',cycle:(s:number)=>Math.sin(s/95),cycleAmp:0.15,noiseAmp:0.08,seed:101},
  {key:'flow',label:t('输量','Flow Rate'),content:'{nt}',fill:CYAN,baseline:8500,unit:'Nm³/h',cycle:(s:number)=>Math.sin(s/80),cycleAmp:0.04,noiseAmp:30,seed:202,trend:(s:number)=>s*3},
  {key:'pack',label:t('管存量','Line-pack'),content:'{nt}',fill:BLUE,baseline:38,unit:'10⁴Nm³',cycle:(s:number)=>Math.sin(s/110+1.3),cycleAmp:0.02,noiseAmp:0.3,seed:303},
  {key:'tank',label:t('储罐液位','Tank Level'),content:'{nt} %',fill:GREEN,baseline:72,unit:'%',cycle:(s:number)=>Math.sin(s/90+2.1),cycleAmp:0.04,noiseAmp:0.5,seed:404},
  {key:'well',label:t('井口产气','Wellhead Gas'),content:'{nt}',fill:PURPLE,baseline:92,unit:'10⁴Nm³/d',cycle:(s:number)=>Math.sin(s/100+0.6),cycleAmp:0.03,noiseAmp:0.8,seed:505},
  {key:'qual',label:t('气质合格率','Quality Rate'),content:'{nt} %',fill:CYAN,baseline:99.2,unit:'%',cycle:(s:number)=>Math.sin(s/120+3.1),cycleAmp:0.003,noiseAmp:0.05,seed:606},
]
const flops=KPIS.map(k=>({spec:k,current:useDomainSeries({baseline:k.baseline,unit:k.unit,cycle:k.cycle,cycleAmp:k.cycleAmp,noiseAmp:k.noiseAmp,trend:k.trend},{seed:k.seed,window:2}).current}))
const cards=computed(()=>flops.map(({spec,current})=>({key:spec.key,label:spec.label,config:{number:[Math.round(current.value)],content:spec.content,toFixed:0,animationCurve:'easeOutCubic' as const,style:{fontSize:28,fill:spec.fill}},accent:spec.fill})))
const at=computed(()=>t('油气管网核心指标','Oil & gas core metrics'))
</script>
<template>
  <div class="kpi-flops" role="group" :aria-label="at">
    <ClientOnly>
      <div v-for="c in cards" :key="c.key" class="kpi-cell" :style="{'--accent':c.accent}">
        <DvDigitalFlop :config="c.config" class="kpi-flop" />
        <span class="kpi-label">{{ c.label }}</span>
      </div>
      <template #fallback>
        <div v-for="c in cards" :key="c.key" class="kpi-cell" :style="{'--accent':c.accent}">
          <span class="kpi-flop kpi-flop-static" :style="{color:c.accent}">{{ c.config.number[0] }}</span>
          <span class="kpi-label">{{ c.label }}</span>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>
<style scoped>
.kpi-flops{display:flex;flex-wrap:wrap;gap:10px;width:100%;height:100%;box-sizing:border-box;align-items:stretch}
.kpi-cell{flex:1 1 0;min-width:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:8px;border:1px solid color-mix(in srgb,var(--accent) 32%,transparent);border-radius:var(--dc3d-radius);background:var(--dc3d-panel-bg);overflow:hidden}
.kpi-flop{width:100%;height:38px;flex-shrink:0}
.kpi-flop-static{font-family:var(--dc3d-mono);font-size:28px;font-weight:700;line-height:38px;text-align:center}
.kpi-label{font-size:12px;letter-spacing:.5px;color:var(--dc3d-text-dim);text-align:center;white-space:nowrap}
@media(max-width:900px){.kpi-cell{flex-basis:calc(33.333% - 10px)}}
@media(max-width:560px){.kpi-cell{flex-basis:calc(50% - 10px)}.kpi-flop,.kpi-flop-static{height:34px;line-height:34px;font-size:22px}}
</style>

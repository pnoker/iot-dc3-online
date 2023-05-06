(window.webpackJsonp=window.webpackJsonp||[]).push([[19],{710:function(v,_,e){"use strict";e.r(_);var d=e(62),c=Object(d.a)({},(function(){var v=this,_=v._self._c;return _("ContentSlotsDistributor",{attrs:{"slot-key":v.$parent.slotKey}},[_("h2",{attrs:{id:"驱动"}},[v._v("驱动 "),_("a",{staticClass:"header-anchor",attrs:{href:"#驱动"}},[v._v("#")])]),v._v(" "),_("p",[v._v("在 "),_("code",[v._v("DC3")]),v._v(" 中所谓的 "),_("strong",[v._v("驱动")]),v._v("，主要意义在于 "),_("code",[v._v("主动获取或者接设备数据")]),v._v(" 以及 "),_("code",[v._v("控制设备")]),v._v("（"),_("code",[v._v("前提是设备支持被程序控制")]),v._v("），他实际上是一套程序逻辑（"),_("code",[v._v("主要借助Java实现")]),v._v("）。")]),v._v(" "),_("p",[v._v("把 "),_("code",[v._v("主动获取（被动接收）设备数据")]),v._v(" 和 "),_("code",[v._v("控制")]),v._v(" 不同类型设备的这套程序逻辑叫做 "),_("strong",[v._v("驱动")]),v._v("，并把该套程序逻辑按照不同类型的设备进行归纳为不同的 "),_("strong",[v._v("驱动模块")]),v._v("，从而有了 "),_("code",[v._v("dc3-driver-opc-da")]),v._v("、"),_("code",[v._v("dc3-driver-opc-ua")]),v._v("、"),_("code",[v._v("dc3-driver-mqtt")]),v._v("、"),_("code",[v._v("dc3-driver-modbus-tcp")]),v._v("、"),_("code",[v._v("dc3-driver-plcs7")]),v._v(" 等。")]),v._v(" "),_("h2",{attrs:{id:"设备"}},[v._v("设备 "),_("a",{staticClass:"header-anchor",attrs:{href:"#设备"}},[v._v("#")])]),v._v(" "),_("p",[_("strong",[v._v("设备")]),v._v("，是一个宽泛的概念，把能接入到 "),_("code",[v._v("DC3")]),v._v(" 中的 "),_("code",[v._v("手机")]),v._v("、"),_("code",[v._v("电脑")]),v._v("、"),_("code",[v._v("服务器")]),v._v("、"),_("code",[v._v("网关")]),v._v("、"),_("code",[v._v("硬件设备")]),v._v("甚至是某个"),_("code",[v._v("软件程序")]),v._v("等，都可以统称为 "),_("strong",[v._v("设备")]),v._v(" 。")]),v._v(" "),_("h2",{attrs:{id:"位号"}},[v._v("位号 "),_("a",{staticClass:"header-anchor",attrs:{href:"#位号"}},[v._v("#")])]),v._v(" "),_("p",[v._v("在 "),_("code",[v._v("DC3")]),v._v(" 中 "),_("code",[v._v("位号")]),v._v(" 是用于定义设备某些属性的，一个 "),_("code",[v._v("位号")]),v._v(" 能定义该 "),_("code",[v._v("设备")]),v._v(" 某个属性所需的基本参数。")]),v._v(" "),_("p",[v._v("例如：某个设备有温度、压力、方向、速度等属性，这些统称为 "),_("code",[v._v("位号")])]),v._v(" "),_("h2",{attrs:{id:"模版"}},[v._v("模版 "),_("a",{staticClass:"header-anchor",attrs:{href:"#模版"}},[v._v("#")])]),v._v(" "),_("p",[_("code",[v._v("模版")]),v._v(" 是一组 "),_("code",[v._v("位号")]),v._v(" 的集合，当一个 "),_("code",[v._v("模版")]),v._v(" 被某个 "),_("code",[v._v("设备")]),v._v(" 继承时，该 "),_("code",[v._v("设备")]),v._v(" 同时也拥有了该 "),_("code",[v._v("模版")]),v._v(" 下全部的 "),_("code",[v._v("位号")]),v._v(" ，一个 "),_("code",[v._v("模版")]),v._v(" 可以被多个 "),_("code",[v._v("设备")]),v._v(" 继承，一个 "),_("code",[v._v("设备")]),v._v(" 可以同时继承多个 "),_("code",[v._v("模版")]),v._v(" 。")]),v._v(" "),_("h2",{attrs:{id:"最佳实践"}},[v._v("最佳实践 "),_("a",{staticClass:"header-anchor",attrs:{href:"#最佳实践"}},[v._v("#")])]),v._v(" "),_("p",[_("img",{attrs:{src:"/assets/images/dc3/driver/driver.png",alt:"dc3-driver"}})]),v._v(" "),_("p",[v._v("在上图中，我们可以看到 "),_("code",[v._v("DC3")]),v._v(" 中的 "),_("code",[v._v("驱动")]),v._v(" 是如何与 "),_("code",[v._v("设备")]),v._v("、"),_("code",[v._v("位号")]),v._v("、"),_("code",[v._v("模版")]),v._v(" 进行关联的。")]),v._v(" "),_("p",[v._v("设备对应相关传感器、采集器等")]),v._v(" "),_("p",[v._v("位号对应传感器的某一种采集数据,如温度、压力、方向、速度等")]),v._v(" "),_("p",[v._v("我们把可以复用的一组位号抽取出来组成模板，模板可以被多个设备继承，一个设备可以同时继承多个模板。")])])}),[],!1,null,null,null);_.default=c.exports}}]);
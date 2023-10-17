(window.webpackJsonp=window.webpackJsonp||[]).push([[25],{715:function(t,a,s){"use strict";s.r(a);var r=s(62),e=Object(r.a)({},(function(){var t=this,a=t._self._c;return a("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[a("h3",{attrs:{id:"dc3-opc-ua-驱动模块"}},[t._v("DC3 Opc Ua 驱动模块 "),a("a",{staticClass:"header-anchor",attrs:{href:"#dc3-opc-ua-驱动模块"}},[t._v("#")])]),t._v(" "),a("div",{staticClass:"custom-block warning"},[a("p",{staticClass:"custom-block-title"},[t._v("WARNING")]),t._v(" "),a("p",[t._v("当前文档可能落后于最新版本,具体请以代码为准")])]),t._v(" "),a("blockquote",[a("p",[a("strong",[t._v("位置")]),t._v("：iot-dc3\\dc3-driver\\dc3-driver-opc-ua")]),t._v(" "),a("p",[a("strong",[t._v("依赖服务")]),t._v("（参考Idea开发环境启动即可）：dc3-mysql、dc3-mongo、dc3-redis、dc3-rabbitmq、dc3-center-register、dc3-center-manager、dc3-center-data、dc3-center-auth、dc3-center-gateway、iot-dc3-web")]),t._v(" "),a("p",[a("strong",[t._v("开源工具")]),t._v("：Spring Cloud、Eclipse Milo")]),t._v(" "),a("p",[a("strong",[t._v("OPC UA")]),t._v("：Unified Architecture，统一架构，是下一代的OPC 标准，通过提供一个完整的，安全和可靠的跨平台的架构，以获取实时和历史数据和时间。它是基于OPC基金会提供的新一代技术，提供安全，可靠和独立于厂商的，实现原始数据和预处理的信息从制造层级到生产计划或ERP层级的传输。通过OPC UA，所有需要的信息在任何时间，任何地点对每个授权的应用，每个授权的人员都可用。这种功能独立于制造厂商的原始应用，编程语言和操作系统。 OPC UA是目前已经使用的OPC 工业标准的补充，提供重要的一些特性，包括如平台独立性，扩展性，高可靠性和连接互联网的能力。 OPC UA不再依靠DCOM，而是基于面向服务的架构(SOA),OPC UA的使用更简便。现在，OPC UA已经成为独立于微软,UNIX或其他的操作系统企业层和嵌入式自动组建之间的桥梁。")])]),t._v(" "),a("h3",{attrs:{id:"配置文件"}},[t._v("配置文件 "),a("a",{staticClass:"header-anchor",attrs:{href:"#配置文件"}},[t._v("#")])]),t._v(" "),a("blockquote",[a("p",[a("strong",[t._v("位置")]),t._v("：iot-dc3\\dc3-driver\\dc3-driver-opc-ua\\src\\main\\resources\\application.yml")])]),t._v(" "),a("h4",{attrs:{id:"_1-driver-driver-attribute"}},[t._v("1. driver.driver-attribute "),a("a",{staticClass:"header-anchor",attrs:{href:"#_1-driver-driver-attribute"}},[t._v("#")])]),t._v(" "),a("blockquote",[a("p",[a("em",[t._v("driver-attribute 用于配置连接一个 Opc Ua 服务所需要的基本参数")])]),t._v(" "),a("p",[a("strong",[t._v("连接一个 Opc Ua 服务需要：主机、端口、路径信息，那么 "),a("code",[t._v("dc3-opc-ua")]),t._v(" 驱动模块此处的 "),a("code",[t._v("driver-attribute")]),t._v(" 就应该如下：")])])]),t._v(" "),a("div",{staticClass:"language-yaml extra-class"},[a("pre",{pre:!0,attrs:{class:"language-yaml"}},[a("code",[t._v("  "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("driver-attribute")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("-")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("displayName")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" 主机\n      "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("name")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" host\n      "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("type")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" string\n      "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("value")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" localhost\n      "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("description")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" Opc Ua IP\n    "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("-")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("displayName")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" 端口\n      "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("name")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" port\n      "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("type")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" int\n      "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("value")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("18600")]),t._v("\n      "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("description")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" Opc Ua Port\n    "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("-")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("displayName")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" 路径\n      "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("name")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" path\n      "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("type")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" string\n      "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("value")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" /\n      "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("description")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" Opc Ua Path\n")])])]),a("h4",{attrs:{id:"_2-driver-point-attribute"}},[t._v("2. driver.point-attribute "),a("a",{staticClass:"header-anchor",attrs:{href:"#_2-driver-point-attribute"}},[t._v("#")])]),t._v(" "),a("blockquote",[a("p",[a("em",[t._v("point-attribute 用于配置读取一个 Opc Ua 点位值所需要的基本参数")])]),t._v(" "),a("p",[a("strong",[t._v("读取一个 Opc Ua 服务的点位值需要：命名空间、点位名称信息，那么  "),a("code",[t._v("dc3-opc-ua")]),t._v(" 驱动模块此处的 "),a("code",[t._v("point-attribute")]),t._v(" 就应该如下:")])])]),t._v(" "),a("div",{staticClass:"language-yaml extra-class"},[a("pre",{pre:!0,attrs:{class:"language-yaml"}},[a("code",[t._v("  "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("point-attribute")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("-")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("displayName")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" 命名空间\n      "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("name")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" namespace\n      "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("type")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" int\n      "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("value")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("5")]),t._v("\n      "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("description")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" 命名空间索引\n    "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("-")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("displayName")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" 位号\n      "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("name")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" tag\n      "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("type")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" string\n      "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("value")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" TAG\n      "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("description")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" 位号名称\n")])])]),a("h4",{attrs:{id:"_3-driver-schedule"}},[t._v("3. driver.schedule "),a("a",{staticClass:"header-anchor",attrs:{href:"#_3-driver-schedule"}},[t._v("#")])]),t._v(" "),a("blockquote",[a("p",[a("em",[t._v("schedule 用于设置 读 和 自定义方法的调度")])]),t._v(" "),a("p",[a("strong",[t._v("read")]),t._v("：用于配置周期性调用 iot-dc3\\dc3-driver\\dc3-driver-opc-ua\\src\\main\\java\\com\\dc3\\driver\\service\\impl\\DriverCustomServiceImpl.java （read方法）")]),t._v(" "),a("p",[a("strong",[t._v("custom")]),t._v("：用于配置周期性调用 iot-dc3\\dc3-driver\\dc3-driver-opc-ua\\src\\main\\java\\com\\dc3\\driver\\service\\impl\\DriverCustomServiceImpl.java（schedule方法）")]),t._v(" "),a("p",[a("strong",[t._v("enable")]),t._v("：是否启动")]),t._v(" "),a("p",[a("strong",[t._v("corn")]),t._v("：corn 表达式，用于设置调度规则")])]),t._v(" "),a("div",{staticClass:"language-yaml extra-class"},[a("pre",{pre:!0,attrs:{class:"language-yaml"}},[a("code",[t._v("  "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("schedule")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("read")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v("\n      "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("enable")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token boolean important"}},[t._v("true")]),t._v("\n      "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("corn")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'0/30 * * * * ?'")]),t._v("\n")])])]),a("h3",{attrs:{id:"小试牛刀"}},[t._v("小试牛刀 "),a("a",{staticClass:"header-anchor",attrs:{href:"#小试牛刀"}},[t._v("#")])]),t._v(" "),a("h4",{attrs:{id:"_1-启动依赖服务"}},[t._v("1. 启动依赖服务 "),a("a",{staticClass:"header-anchor",attrs:{href:"#_1-启动依赖服务"}},[t._v("#")])]),t._v(" "),a("ul",[a("li",[t._v("参考Idea开发环境启动 dc3-mysql、dc3-mongo、dc3-redis、dc3-rabbitmq、dc3-center-register、dc3-center-manager、dc3-center-data、dc3-center-auth、iot-dc3-web")]),t._v(" "),a("li",[t._v("启动 dc3-driver-opc-ua")])]),t._v(" "),a("h4",{attrs:{id:"_2-启动-opc-ua-调试工具"}},[t._v("2. 启动 Opc Ua 调试工具 "),a("a",{staticClass:"header-anchor",attrs:{href:"#_2-启动-opc-ua-调试工具"}},[t._v("#")])]),t._v(" "),a("p",[t._v("安装并启动 Prosys OPC UA Simulation Server 软件")]),t._v(" "),a("p",[t._v("下载链接："),a("a",{attrs:{href:"https://pan.baidu.com/s/1vKcyTWQi0gihjLPluFIvKQ",target:"_blank",rel:"noopener noreferrer"}},[t._v("百度云盘 Prosys OPC UA Simulation Server"),a("OutboundLink")],1)]),t._v(" "),a("p",[t._v("验证码："),a("code",[t._v("5ffs")])]),t._v(" "),a("p",[a("img",{attrs:{src:"/assets/images/dc3/driver/opc/ua/opc-ua-2.png",alt:""}})]),t._v(" "),a("h4",{attrs:{id:"_3-驱动"}},[t._v("3. 驱动 "),a("a",{staticClass:"header-anchor",attrs:{href:"#_3-驱动"}},[t._v("#")])]),t._v(" "),a("p",[t._v("切换到 ''"),a("strong",[t._v("驱动")]),t._v('" 菜单，当前 '),a("code",[t._v("Opc Ua")]),t._v(" 启动启动成功，并处于 "),a("strong",[t._v("在线")]),t._v(" 状态")]),t._v(" "),a("p",[a("img",{attrs:{src:"/assets/images/dc3/driver/opc/ua/opc-ua-3.png",alt:""}})]),t._v(" "),a("h4",{attrs:{id:"_4-驱动属性"}},[t._v("4. 驱动属性 "),a("a",{staticClass:"header-anchor",attrs:{href:"#_4-驱动属性"}},[t._v("#")])]),t._v(" "),a("p",[t._v("切换到 ''"),a("strong",[t._v("驱动属性")]),t._v('" 菜单，当前 驱动属性 列表如下')]),t._v(" "),a("p",[a("img",{attrs:{src:"/assets/images/dc3/driver/opc/ua/opc-ua-4.png",alt:""}})]),t._v(" "),a("h4",{attrs:{id:"_5-位号属性"}},[t._v("5. 位号属性 "),a("a",{staticClass:"header-anchor",attrs:{href:"#_5-位号属性"}},[t._v("#")])]),t._v(" "),a("p",[t._v("切换到 “"),a("strong",[t._v("位号属性")]),t._v("” 菜单，当前 位号属性 列表如下")]),t._v(" "),a("p",[a("img",{attrs:{src:"/assets/images/dc3/driver/opc/ua/opc-ua-5.png",alt:""}})]),t._v(" "),a("h4",{attrs:{id:"_6-模板"}},[t._v("6. 模板 "),a("a",{staticClass:"header-anchor",attrs:{href:"#_6-模板"}},[t._v("#")])]),t._v(" "),a("p",[t._v("切换到 “"),a("strong",[t._v("模板")]),t._v("” 菜单，新建一个 "),a("code",[t._v("私有")]),t._v(" 的 "),a("code",[t._v("OpcUaProfile")]),t._v(" 模板，如下")]),t._v(" "),a("p",[a("img",{attrs:{src:"/assets/images/dc3/driver/opc/ua/opc-ua-6.png",alt:""}})]),t._v(" "),a("p",[a("img",{attrs:{src:"/assets/images/dc3/driver/opc/ua/opc-ua-7.png",alt:""}})]),t._v(" "),a("h4",{attrs:{id:"_7-驱动配置"}},[t._v("7. 驱动配置 "),a("a",{staticClass:"header-anchor",attrs:{href:"#_7-驱动配置"}},[t._v("#")])]),t._v(" "),a("p",[t._v("切换到 “"),a("strong",[t._v("驱动配置")]),t._v("” 菜单，为刚刚新建的 "),a("code",[t._v("模板")]),t._v(" 配置一个连接到 "),a("code",[t._v("第2步启动的 Opc Ua 模拟服务")]),t._v(" 的驱动配置，如下")]),t._v(" "),a("ul",[a("li",[a("strong",[t._v("主机")]),t._v(" 属性值为："),a("code",[t._v("localhost")]),t._v("，以 "),a("code",[t._v("Prosys OPC UA Simulation Server")]),t._v(" 启动为主")])]),t._v(" "),a("p",[a("img",{attrs:{src:"/assets/images/dc3/driver/opc/ua/opc-ua-8.png",alt:""}})]),t._v(" "),a("ul",[a("li",[a("strong",[t._v("端口")]),t._v(" 属性值为："),a("code",[t._v("53530")]),t._v("，以 "),a("code",[t._v("Prosys OPC UA Simulation Server")]),t._v(" 启动为主")])]),t._v(" "),a("p",[a("img",{attrs:{src:"/assets/images/dc3/driver/opc/ua/opc-ua-9.png",alt:""}})]),t._v(" "),a("ul",[a("li",[a("strong",[t._v("路径")]),t._v(" 属性值为："),a("code",[t._v("/OPCUA/SimulationServer")]),t._v("，以 "),a("code",[t._v("Prosys OPC UA Simulation Server")]),t._v(" 启动为主")])]),t._v(" "),a("p",[a("img",{attrs:{src:"/assets/images/dc3/driver/opc/ua/opc-ua-10.png",alt:""}})]),t._v(" "),a("ul",[a("li",[t._v("以上的 主机、端口和路径均配置完之后，列表如下")])]),t._v(" "),a("p",[a("img",{attrs:{src:"/assets/images/dc3/driver/opc/ua/opc-ua-11.png",alt:""}})]),t._v(" "),a("h4",{attrs:{id:"_8-位号"}},[t._v("8. 位号 "),a("a",{staticClass:"header-anchor",attrs:{href:"#_8-位号"}},[t._v("#")])]),t._v(" "),a("p",[t._v("切换到 “"),a("strong",[t._v("位号")]),t._v("” 菜单，为刚刚新建的 "),a("code",[t._v("模板")]),t._v(" 配置待读取的 位号，这里以一个 "),a("code",[t._v("String")]),t._v(" 类型的为例，如下")]),t._v(" "),a("blockquote",[a("p",[t._v("同时也需要在 Prosys OPC UA Simulation Server 软件中新建一个位号，并进行证书授权（第11,13步骤）")])]),t._v(" "),a("p",[a("img",{attrs:{src:"/assets/images/dc3/driver/opc/ua/opc-ua-12.png",alt:""}})]),t._v(" "),a("h4",{attrs:{id:"_9-分组"}},[t._v("9. 分组 "),a("a",{staticClass:"header-anchor",attrs:{href:"#_9-分组"}},[t._v("#")])]),t._v(" "),a("p",[t._v("切换到 “"),a("strong",[t._v("分组")]),t._v("” 菜单，新建一个设备分组，如下")]),t._v(" "),a("p",[a("img",{attrs:{src:"/assets/images/dc3/driver/opc/ua/opc-ua-13.png",alt:""}})]),t._v(" "),a("h4",{attrs:{id:"_10-设备"}},[t._v("10. 设备 "),a("a",{staticClass:"header-anchor",attrs:{href:"#_10-设备"}},[t._v("#")])]),t._v(" "),a("p",[t._v("切换到 “"),a("strong",[t._v("设备")]),t._v("” 菜单，在刚刚新建的分组下，新建一个设备，如下")]),t._v(" "),a("p",[a("img",{attrs:{src:"/assets/images/dc3/driver/opc/ua/opc-ua-14.png",alt:""}})]),t._v(" "),a("h4",{attrs:{id:"_11-在prosys-opc-ua-simulation-server中新建点位"}},[t._v("11. 在Prosys OPC UA Simulation Server中新建点位 "),a("a",{staticClass:"header-anchor",attrs:{href:"#_11-在prosys-opc-ua-simulation-server中新建点位"}},[t._v("#")])]),t._v(" "),a("p",[t._v("如图所示")]),t._v(" "),a("ul",[a("li",[t._v("切换到 “"),a("strong",[t._v("Simulation")]),t._v('” 菜单，点击右下的 "+" 新建一个模拟点位，类型选择随机，名称添加 '),a("code",[t._v("string-tag")]),t._v('，最后点击 "'),a("strong",[t._v("Create")]),t._v('"，即可')])]),t._v(" "),a("p",[a("img",{attrs:{src:"/assets/images/dc3/driver/opc/ua/opc-ua-15.png",alt:""}})]),t._v(" "),a("ul",[a("li",[t._v("切换到 “"),a("strong",[t._v("Address Space")]),t._v("” 菜单，即可查看点位的详细信息，包括：命名空间和点位名称")])]),t._v(" "),a("p",[a("img",{attrs:{src:"/assets/images/dc3/driver/opc/ua/opc-ua-16.png",alt:""}})]),t._v(" "),a("h4",{attrs:{id:"_12-位号配置"}},[t._v("12. 位号配置 "),a("a",{staticClass:"header-anchor",attrs:{href:"#_12-位号配置"}},[t._v("#")])]),t._v(" "),a("p",[t._v("切换到 “"),a("strong",[t._v("位号配置")]),t._v("” 菜单，为新建的 "),a("code",[t._v("设备")]),t._v(" ，配置 "),a("code",[t._v("位号")]),t._v(" 的的 "),a("strong",[t._v("属性值")]),t._v("，从而是 "),a("code",[t._v("dc3-opc-ua")]),t._v(" 模块能读取到 "),a("code",[t._v("Prosys OPC UA Simulation Server")]),t._v(" 软件中的真实点位值，如下")]),t._v(" "),a("ul",[a("li",[a("strong",[t._v("命名空间")]),t._v("：第11步骤中的 "),a("code",[t._v("ns")]),t._v(" 值")])]),t._v(" "),a("p",[a("img",{attrs:{src:"/assets/images/dc3/driver/opc/ua/opc-ua-17.png",alt:""}})]),t._v(" "),a("ul",[a("li",[a("strong",[t._v("位号")]),t._v("：第11步骤中的 "),a("code",[t._v("s")]),t._v(" 值")])]),t._v(" "),a("p",[a("img",{attrs:{src:"/assets/images/dc3/driver/opc/ua/opc-ua-18.png",alt:""}})]),t._v(" "),a("ul",[a("li",[t._v("以上的 命名空间和位号均配置完之后，列表如下")])]),t._v(" "),a("p",[a("img",{attrs:{src:"/assets/images/dc3/driver/opc/ua/opc-ua-19.png",alt:""}})]),t._v(" "),a("h4",{attrs:{id:"_13-在prosys-opc-ua-simulation-server中授权证书"}},[t._v("13. 在Prosys OPC UA Simulation Server中授权证书 "),a("a",{staticClass:"header-anchor",attrs:{href:"#_13-在prosys-opc-ua-simulation-server中授权证书"}},[t._v("#")])]),t._v(" "),a("p",[t._v("切换到 “"),a("strong",[t._v("Certificates")]),t._v("” 菜单，如图所示进行授权 “"),a("strong",[t._v("Trust")]),t._v("”")]),t._v(" "),a("p",[a("img",{attrs:{src:"/assets/images/dc3/driver/opc/ua/opc-ua-20.png",alt:""}})]),t._v(" "),a("h4",{attrs:{id:"_14-数据"}},[t._v("14. 数据 "),a("a",{staticClass:"header-anchor",attrs:{href:"#_14-数据"}},[t._v("#")])]),t._v(" "),a("p",[t._v("切换到 “数据” 菜单，30秒左右会采集一个值")]),t._v(" "),a("p",[a("img",{attrs:{src:"/assets/images/dc3/driver/opc/ua/opc-ua-21.png",alt:""}})])])}),[],!1,null,null,null);a.default=e.exports}}]);
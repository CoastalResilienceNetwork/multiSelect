define([
        "dojo/_base/declare",
		"framework/PluginBase",

		"esri/request",
		"esri/toolbars/draw",
		"esri/layers/ArcGISDynamicMapServiceLayer",
		"esri/layers/ArcGISTiledMapServiceLayer",
		"esri/layers/ArcGISImageServiceLayer",
		"esri/layers/ImageServiceParameters",
		"esri/layers/MosaicRule",
		"esri/layers/RasterFunction",
		"esri/tasks/ImageServiceIdentifyTask",
		"esri/tasks/ImageServiceIdentifyParameters",
		"esri/tasks/QueryTask",
		"esri/tasks/query",
		"esri/graphicsUtils",
		"esri/graphic",
		"esri/symbols/SimpleLineSymbol",
		"esri/symbols/SimpleFillSymbol",
		"esri/symbols/SimpleMarkerSymbol",
		"esri/geometry/Extent",
		"esri/geometry/Polygon",
		"esri/request",

		"dijit/registry",
		"dijit/form/Button",
		"dijit/form/DropDownButton",
		"dijit/DropDownMenu",
		"dijit/MenuItem",
		"dijit/layout/ContentPane",
		"dijit/layout/TabContainer",
		"dijit/form/HorizontalSlider",
		"dijit/form/CheckBox",
		"dijit/form/RadioButton",
		"dojo/dom",
		"dojo/dom-class",
		"dojo/dom-style",
		"dojo/_base/window",
		"dojo/dom-construct",
		"dojo/dom-attr",
		"dojo/dom-geometry",
		"dijit/Dialog",

		"dojox/charting/Chart",
		"dojox/charting/plot2d/Pie",
		"dojox/charting/action2d/Highlight",
        "dojox/charting/action2d/MoveSlice" ,
		"dojox/charting/action2d/Tooltip",
        "dojox/charting/themes/MiamiNice",
		"dojox/charting/widget/Legend",

		"dojo/html",
		"dojo/_base/array",
		"dojo/aspect",
		"dojo/_base/lang",
		'dojo/_base/json',
		"dojo/on",
		"dojo/parser",
		"dojo/query",
		"dojo/NodeList-traverse",
		"require",
		"dojo/text!./config.json"

       ],
       function (declare,
					PluginBase,
					ESRIRequest,
					Drawer,
					ArcGISDynamicMapServiceLayer,
					ArcGISTiledMapServiceLayer,
					ArcGISImageServiceLayer,
					ImageServiceParameters,
					MosaicRule,
					RasterFunction,
					ImageServiceIdentifyTask,
					ImageServiceIdentifyParameters,
					QueryTask,
					esriQuery,
					graphicsUtils,
					Graphic,
					SimpleLineSymbol,
					SimpleFillSymbol,
					SimpleMarkerSymbol,
					Extent,
					Polygon,
					esriRequest,
					registry,
					Button,
					DropDownButton,
					DropDownMenu,
					MenuItem,
					ContentPane,
					TabContainer,
					HorizontalSlider,
					CheckBox,
					RadioButton,
					dom,
					domClass,
					domStyle,
					win,
					domConstruct,
					domAttr,
					domGeom,
					Dialog,
					Chart,
					Pie,
					Highlight,
					MoveSlice,
					Tooltip,
					MiamiNice,
					Legend,
					html,
					array,
					aspect,
					lang,
					dJson,
					on,
					parser,
					dojoquery,
					NodeListtraverse,
					localrequire,
					configData
					) {

			_config = dojo.eval("[" + configData + "]")[0];

			_infographic = _config.infoGraphic;

			if (_infographic != undefined) {

				_infographic = localrequire.toUrl("./" + _infographic);

			}

			if (_config.ddText != undefined) {

				_ddText = _config.ddText;

			} else {

				_ddText = "Choose a Region";

			}
			
			if (_config.helpWidth != undefined) {

				_helpWidth = _config.helpWidth;

			} else {

				_helpWidth = "400px";

			}

			if (_config.regionLabeler != undefined) {

				_regionLabeler = _config.regionLabeler;

			} else {

				_regionLabeler = "Selected Region: #";

			}

			if (_config.hideDisableds != undefined) {

				_hideDisableds = _config.hideDisableds;

			} else {

				_hideDisableds = true;

			}	

			if (_config.noZoom != undefined) {

				_noZoom = _config.noZoom;

			} else {

				_noZoom = false;

			}			
			
			

           return declare(PluginBase, {
		       toolbarName: _config.name,
               toolbarType: "sidebar",
               allowIdentifyWhenActive: true,
			   width: 420,
			   _hasactivated: false,
			   infoGraphic: _infographic,
			   height: _config.pluginHeight,
			   rendered: false,
			   stateRestore: false,

               activate: function () {


					if (this.rendered == false) {

						this.rendered = true;

						this.render();

						this.resize();

					//This is a hack to get the form to resize after closing continue button if infographic exists

					console.log(this.container);
					codearea = dojoquery(this.container).parent().parent();

					formWidgets = registry.findWidgets(codearea[0]);

					array.forEach(formWidgets , lang.hitch(this,function(formWidget, i){

						on(formWidget, "click", lang.hitch(this,function(e){
							this.resize();
						}));

					}));

						//this.currentLayer.setVisibility(true);


					} else {

						//if (this.currentLayer != undefined)  {

						//	this.currentLayer.setVisibility(true);

						this.resize();

					//	}


					}

					if (this.stateRestore == false) {


						//_eventHandles.click = dojo.connect(this.map, "onClick", function() {});

						if ((this._hasactivated == false) && (this.usableRegions.length == 1)) {

							//this.changeGeography(this.usableRegions[0], true);
							this.changeGeography(this.usableRegions[0], !(_noZoom));

						};

					} else {

						if (this._hasactivated == false) {

							this.changeGeography(this.currentgeography, false);
							this.stateRestore = false;

						}

					}

						this._hasactivated = true;



			   },

               deactivate: function () {

			   },

               hibernate: function () {

					if (this.mainLayer != undefined)  {

						//this.mainLayer.setVisibility(false);

					}

					if (this.mainpane != undefined) {
						//this.button.set("label",_ddText);
						domConstruct.empty(this.mainpane.domNode);
						this.regionLabelNode.innerHTML = "";
					}

					this.removeLayers();
					this.translevel = this.mainData.transparency;

			   },

/*
			identify: function(mapPoint, clickPoint, processResults) {

					array.forEach(this.myLayers, lang.hitch(this,function(clayer, i){
						console.log(clayer);
					}));

                var text = "",
                   identifyWidth = 300;
                processResults(text, identifyWidth);
            },
	*/

			   removeLayers: function() {

				   	lastlayer = {}
					array.forEach(this.myLayers, lang.hitch(this,function(clayer, i){
						this.map.removeLayer(clayer);
						lastlayer = clayer;
					}));

					//legend = dijit.byId("legend-0");
					//legend.refresh();

					this.map.addLayer(lastlayer);
					this.map.removeLayer(lastlayer);

			   },

				initialize: function (frameworkParameters) {

					declare.safeMixin(this, frameworkParameters);


					this.infoIcon = dojo.eval("[" + configData + "]")[0].infoIcon;

					if (this.infoIcon == undefined) {

						this.infoIcon='data:image/png;base64,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'

					}

					this.mainData = dojo.eval("[" + configData + "]")[0]

					this.windowStyles = this.mainData.windowStyles;

					this.dojoTheme = this.mainData.dojoTheme;

					if (this.dojoTheme == undefined) {

						this.dojoTheme = "claro"

					}

					//alert(this.hideDisableds);
					
					//if (this.hideDisableds == undefined) {

					//	this.hideDisableds = true;

					//}

					domClass.add(this.container, this.dojoTheme);

					if (this.windowStyles != undefined) {

						c = dojoquery(this.container).parent().parent();
						domStyle.set(c[0], this.windowStyles);

					}

					this.translevel = this.mainData.transparency;

					if (this.translevel == undefined) {
						this.translevel = 0;
					}


					this.usableRegions = this.mainData.regions;

					this.isClipped = false;

					this.regionLabelNode = domConstruct.create("span"); //, innerHTML: "<img src=" + this.spinnerURL + ">"

					this.regionChooserContainer = domConstruct.create("span"); //, innerHTML: "<img src=" + this.spinnerURL + ">"

					dom.byId(this.container).appendChild(this.regionChooserContainer);
					dom.byId(this.container).appendChild(this.regionLabelNode);

					this.rebuildOptions(this.usableRegions);

					this.spinnerURL = localrequire.toUrl("./images/spinner.gif");

					this.refreshnode = domConstruct.create("span", {style: "display:none"}); //, innerHTML: "<img src=" + this.spinnerURL + ">"
					spinnernode = domConstruct.create("span", {style: "background: url(" + this.spinnerURL + ") no-repeat center center; height: 32px; width: 32px; display: inline-block; position: absolute; right: 5px;" });
					//domClass.add(this.refreshnode, "plugin-report-spinner");
					this.refreshnode.appendChild(spinnernode);
					dom.byId(this.container).appendChild(this.refreshnode);

					this.messagenode = domConstruct.create("span", {style: "display:"});

					dom.byId(this.container).appendChild(this.messagenode);

				},


				 rebuildOptions: function(Inregions) {

				 	menu = new DropDownMenu({ style: "display: none;"});

					domClass.add(menu.domNode, this.dojoTheme);

					array.forEach(Inregions, lang.hitch(this,function(entry, i){

						//alert(entry.name);

						menuItem1 = new MenuItem({
							label: entry.name,
							//iconClass:"dijitEditorIcon dijitEditorIconSave",
							//onClick: lang.hitch(this,function(e){this.changeGeography(entry)})
							onClick: lang.hitch(this,function(e){this.changeGeography(entry, !(_noZoom))})
						});
						menu.addChild(menuItem1);

					}));


					newbutton = new DropDownButton({
						label: _ddText,
						style: "margin-bottom:6px !important",
						dropDown: menu
					});

					this.regionChooserContainer.appendChild(newbutton.domNode);

					this._hasactivated = false;


				 },

			     resize: function(w, h) {

					cdg = domGeom.position(this.container);
					console.log(this.mainpane.domNode);

					this.sph = cdg.h-135;

					//this.tabpan.doLayout = false;

					domStyle.set(this.mainpane.domNode, "height", this.sph + "px");
					//domStyle.set(this.tabpan.domNode, "height", this.sph + "px");
					//domStyle.set(this.tabpan.domNode, "width", cdg.w + "px");
					//domStyle.set(this.mainpane.domNode, "width", cdg.w + "px");
					//domStyle.set(this.chartpane.domNode, "width", cdg.w + "px");

					if (this.tabpan != undefined) {

						this.tabpan.resize({"w" : cdg.w, "h" : this.sph})


						if (this.sph > 500) {

							ch = this.sph;

						} else {

							ch = 500;

						}

						if (this.chart != undefined) {
							this.chart.resize(cdg.w-50, ch - 80)
						}


						this.tabpan.layout();

					}

					array.forEach(this.varsliders, lang.hitch(this,function(slider, i){

						domStyle.set(slider.domNode, "width", (cdg.w - 70) + "px");

					}));


				 },


			   updateChecks: function(ctl, e) {

				this.currentgeography.tabs[ctl.tab].controls[ctl.control].values[ctl.value].selected = e;

				doit = false;

				if (ctl.type == "radio") {

					if (e == false) {doit = true}

				} else { doit = true }

				if (doit == true) {

					a = lang.hitch(this,this.makeSandwidches);

					a();

				}

			   },

			   updateSlider: function(ctl,e) {

					array.forEach(this.currentgeography.tabs[ctl.tab].controls[ctl.control].values, lang.hitch(this,function(v, i) {

						v.selected = false;

					}));


			        this.currentgeography.tabs[ctl.tab].controls[ctl.control].values[e].selected = true; //e;

					a = lang.hitch(this,this.makeSandwidches);

					a();

			   },

			   makeSandwidches: function() {

				//enable all widgets from current tab or layout
				if (this.tabpan.selectedChildWidget != undefined) {
					formWidgets = registry.findWidgets(this.tabpan.selectedChildWidget.domNode);
				} else {
					formWidgets1 = registry.findWidgets(this.tabpan.domNode);
					formWidgets = registry.findWidgets(formWidgets1[0].domNode);
				}

				//formWidgets = registry.findWidgets(this.tabpan.selectedChildWidget.domNode);
				console.log("FORM ******************* ", formWidgets);

				array.forEach(formWidgets, lang.hitch(this,function(widg, w){
					widg.setAttribute('disabled', false);
				}));


				//start making the sandwidches
					console.log(this.currentgeography);

					try {
						selectedIndex = this.tabpan.selectedChildWidget.index;
					} catch(err) {
						selectedIndex = 0;
					}

					pretabsandWitches = [];


					//array.forEach(this.currentgeography.tabs, lang.hitch(this,function(ctabrec, i){

						var sandWitch = {};

						valarr = new Array();
						indivdis = new Array();

						ctabrec = this.currentgeography.tabs[selectedIndex];


						array.forEach(ctabrec.controls, lang.hitch(this,function(control, c){

							depmet = false;
							nsel = 0;

							array.forEach(control.values, lang.hitch(this,function(val, v){

								if (val.selected == true) {
									nsel = nsel + 1;
									console.log("depcheck", control.group, control.type, val.value, control.dependent);
									valarr.push(val.value);

									if (sandWitch[control.group] == undefined) {

										sandWitch[control.group] = {};
										//sandWitch[control.group].push(new Array());

									}

									if (sandWitch[control.group][c] == undefined) {

										sandWitch[control.group][c] = [];

									}

									//im in  here
										if (control.dependent != undefined) {

											adeper = control.dependent.split("&");
											p = adeper.length;
											m = 0;
											array.forEach(adeper, lang.hitch(this,function(adeptext, a){
												deper = adeptext.split("|")
												array.forEach(deper, lang.hitch(this,function(deptext, d){
													array.forEach(valarr, lang.hitch(this,function(valtext, d){
														if (deptext == valtext) {console.log("DEPMET",deptext, valtext); m = m + 1}
													}));
												}));
											}));

										if (p == m) {

											depmet = true;

										}

										//	depmet = false;
										//	for (key in sandWitch[control.group]) {
										//		array.forEach(sandWitch[control.group][key], lang.hitch(this,function(val, v){
										//					//console.log("happy", val, control.dependent);
										//					//alert(control.dependent)
										//				}));
										//	}

										} else {

											depmet = true;

										}

										if (depmet == true) {
											//alert(val.value);
											sandWitch[control.group][c].push(val.value);
										} else {
											sandWitch[control.group][c].push("");
										}

								}

									if (val.dependent != undefined) {

											deper = val.dependent.split("|");
											dmet = false;
											array.forEach(deper, lang.hitch(this,function(deptext, d){
												array.forEach(valarr, lang.hitch(this,function(valtext, d){
													if (deptext == valtext) {console.log("VAL_DEPMET",deptext, valtext);dmet = true;}
												}));
											}));

											if (dmet == false) {
												console.log("Make " + val.name + " disabled " + c + "_" + v);
												indivdis.push([c,v]);
											}
									}

							}));

							console.log("check individual disable");

							array.forEach(formWidgets, lang.hitch(this,function(widg, w){
									if (widg.declaredClass.indexOf("RadioButton") > -1) {
										array.forEach(indivdis, lang.hitch(this,function(indiv, di){
											console.log(indiv, widg.data.control)
											if ((indiv[0] == widg.data.control)  && (indiv[1] == widg.data.value)) {
												if (widg.checked == true) {console.log('You have made an invalid selection.  Please Adjust')}
												//console.log(widg)
												widg.setAttribute('disabled', true);
											}
										}));
									} else {
									   // Put slider disabled code here
									}

							}));

							//console.log("controldep", c, depmet);

							if ((depmet == false) && (nsel > 0)) {
								//disable all widgets from current tab or layout

								array.forEach(formWidgets, lang.hitch(this,function(widg, w){
									if (widg.data.control == c) {
										widg.setAttribute('disabled', true);
									}
								}));
							}

						//}));


						//console.log("sandWitch");
						//console.log(sandWitch);
						pretabsandWitches.push(sandWitch);

					}));

					sandWitchList = [];


					console.log(this.tabpan);

					for (key in pretabsandWitches[0]) {  //Changed 0 from selectedIndex

						cgroup = pretabsandWitches[0][key]; //Changed 0 from selectedIndex

						groupc = 0

						allArrays = new Array();

						for (c in cgroup) {

							arrs = (cgroup[c]);

							//console.log("ARRR", arrs);
							if (arrs != "") {
								allArrays.push(arrs);
							}

							groupc = groupc + 1;
						}

							r=allPossibleCases(allArrays);
							//console.log(r);

							array.forEach(r, lang.hitch(this,function(val, v){

								//console.log("YO", val, allArrays);
								cand = val.split("|");
								if (cand.length = allArrays.length) {

									sandWitchList.push(val);

								}

							}));

						//}));

					}

				//console.log(sandWitchList);

				this.updateMap(sandWitchList);


				if (_hideDisableds == true) {

					array.forEach(this.controlNodes, lang.hitch(this,function(cgroup, i){

						cGroupWidgets = registry.findWidgets(cgroup);
						hideit = true;
						array.forEach(cGroupWidgets, lang.hitch(this,function(widg, j){
						  if (widg.get('disabled') == false) {hideit = false;}
						}));


						if (hideit == true) {
							domAttr.set(cgroup, "style", "display:none");
						} else {
							domAttr.set(cgroup, "style", "display:");
						}

					}));

				}


			   },

			   updateMap: function(sandWitchList) {

			   comboLookups = []

			   combos = this.currentgeography.tabs[selectedIndex].combos;
			   console.log(combos);

			    array.forEach(sandWitchList, lang.hitch(this,function(sw, s){

					comboLookups.push(combos[sw]);

				}));

				comboLookups.reverse();

				newarry = new Array();

				dynamicLayers = {};
				tiledLayers = new Array();

				array.forEach(comboLookups, lang.hitch(this,function(combolayers, cl){

					array.forEach(combolayers, lang.hitch(this,function(clayer, i){

						console.log(clayer)

						if (clayer.url == undefined) {

							clayer.url = this.currentgeography.tabs[selectedIndex].mainURL

						}

						if (clayer.type == "dynamic") {

							if (dynamicLayers[clayer.url] == undefined) {

								dynamicLayers[clayer.url] = new Array();

							}
								dynamicLayers[clayer.url] = dynamicLayers[clayer.url].concat(clayer.show);
								console.log(dynamicLayers[clayer.url]);


						}

						if (clayer.type == "tiled") {

							Naddlayer = new ArcGISTiledMapServiceLayer(
								clayer.url,{
								useMapImage: true
							}
							);

							this.map.addLayer(Naddlayer);
							console.log(Naddlayer);
							newarry.push(Naddlayer);
							tiledLayers.push(Naddlayer);

						}


					}));

				}));


				//array.forEach(this.myLayers, lang.hitch(this,function(clayer, i){
				//	this.map.removeLayer(clayer);
				//}));
				this.removeLayers();

				for (lurl in dynamicLayers) {

							Naddlayer = new ArcGISDynamicMapServiceLayer(
								lurl
								,{
								useMapImage: true
								}
							);

							Naddlayer.setVisibleLayers(dynamicLayers[lurl]);
							newarry.push(Naddlayer);

							this.map.addLayer(Naddlayer);
							console.log(Naddlayer);

					Naddlayer.on("UpdateStart", lang.hitch(this,function () {
							console.log("Update started...");
							domAttr.set(this.refreshnode, "style", "display:");
						} ));

					Naddlayer.on("UpdateEnd", lang.hitch(this,function () {
							console.log("Update Ended...");
							domAttr.set(this.refreshnode, "style", "display:none");
							this.resize();
						} ));

				}

				this.myLayers = new Array();

				array.forEach(newarry, lang.hitch(this,function(clayer, i){
					this.myLayers.push(clayer);
				}));

				//console.log(tiledLayers);

				//console.log(this.map.layerIds);

					array.forEach(this.map.layerIds, lang.hitch(this,function(lid, i){
						console.log(lid, this.map.getLayer(lid));
					}));

				this.changeOpacity(this.translevel);

			   },

			   changeGeography: function(geography, zoomto) {

					domConstruct.empty(this.mainpane.domNode);

					//this.button.set("label",geography.name);

					this.regionLabelNode.innerHTML = _regionLabeler.replace("#", [geography.name]);

					this.controlNodes = new Array();

					this.currentgeography = geography;

					if (geography.methods != undefined) {

						if (typeof geography.methods == "string") {

							methodsTitle = "View Full Report";

							url = geography.methods;

							geography.methods = {}
							geography.methods.url = url;
							geography.methods.title = methodsTitle;

						}

						domStyle.set(this.methodsButton.domNode, "display", "");
						this.methodsButton.set("label", geography.methods.title);

					} else {

						domStyle.set(this.methodsButton.domNode, "display", "none");

					}

					domConstruct.empty(this.ButtonsLocation);

					if (geography.buttons != undefined) {

						array.forEach(geography.buttons, lang.hitch(this,function(cbutton, i){

							newButt = new Button({
								label: cbutton.title,
								onClick: lang.hitch(this,function(){window.open(cbutton.url)})  //function(){window.open(this.configVizObject.methods)}
								});

							this.ButtonsLocation.appendChild(newButt.domNode);


						}));


					}

					if (zoomto != false) {

						ext = new Extent(this.currentgeography.extent);
						this.map.setExtent(ext);
					}

					if (this.currentgeography.tabs == undefined) {

						this.currentgeography.tabs = new Array();
						rec = {"controls": this.currentgeography.controls, "combos": this.currentgeography.combos, "mainURL": this.currentgeography.mainURL}
						this.currentgeography.tabs.push(rec)

					}

					if (this.currentgeography.tabs.length == 1) {

						this.tabpan = new ContentPane({
							style:"padding: 8px"
							//style: "height: 100%; width: 100%;"
						});

						this.tabpan.layout = function() {console.log('layout')};

					} else {

						this.tabpan = new TabContainer({
							//style: "height: 100%; width: 100%;"
						});

					}

					dom.byId(this.mainpane.domNode).appendChild(this.tabpan.domNode);
					parser.parse();

					this.tabs = new Array()

					array.forEach(this.currentgeography.tabs, lang.hitch(this,function(ctabrec, i){

						ctab = new ContentPane({
							style:"padding: 8px",
						//  style:"height:" + this.sph + "px !important",
						//style: "height: 100%; width: 100%;",
						  title: ctabrec.name,
						  index: i
						});

						this.tabpan.addChild(ctab);
						this.tabs.push(ctab);


						array.forEach(ctabrec.controls, lang.hitch(this,function(control, c){

						// This is the node that can be hidden


					   if (ctabrec.titles != undefined) {
							if (ctabrec.titles[c] != undefined) {

								controlNode = domConstruct.create("div");
								ctab.domNode.appendChild(controlNode);
								this.controlNodes.push(controlNode);

								if (ctabrec.titles[c].help != undefined) {

									thelpButton = "<a style='color:black' href='#' title='" + 'Click for more information.' + "'><img style='margin-right:3px;' src='" + this.infoIcon + "'></a>";

								} else {

									thelpButton = "";

								}

								ttext = "<span style='color:#000' >" + thelpButton + ctabrec.titles[c].name + "</span>"

								nodetitle = domConstruct.create("div", {style:"font-weight:bold;padding-top:10px;font-size: 120%;", innerHTML: ttext});
								controlNode.appendChild(nodetitle);

									a = dojoquery(nodetitle).children();
									if (a.children.length > 0) {

										b = a.children()
										iconNode = dojoquery(b[0])

										on(iconNode, "click", lang.hitch(this,function(e){
											//alert('you clicked info');
											//pos = domGeom.position(iconNode);
											cdg = domGeom.position(this.container);
											console.log(cdg)

											toppos = e.y - cdg.y // + 10
											leftpos = e.x - cdg.x  // + 10
											console.log(toppos, leftpos)

											//domStyle.set(this.infoarea.domNode, 'top', toppos + 'px');
											//domStyle.set(this.infoarea.domNode, 'left', leftpos + 'px');
											domStyle.set(this.infoarea.domNode, { "display": "" });
											this.infoareacontent.innerHTML = ctabrec.titles[c].help;

										}));

									}


							} else {

							    controlNode = lastControlNode;

							}
						} else {

								controlNode = domConstruct.create("div")
								ctab.domNode.appendChild(controlNode);
								this.controlNodes.push(controlNode);

						}




						if (control.help != undefined) {

							chelpButton = "<a style='color:black' href='#' title='" + 'Click for more information.' + "'><img style='margin-right:3px;' src='" + this.infoIcon + "'></a>";

						} else {

							chelpButton = "";

						}

						ctext = "<span style='color:#000' >" + chelpButton + control.name + "</span>"

						nodesubtitle = domConstruct.create("div", {style:"font-weight:bold;padding-top:10px;", innerHTML: ctext});
						controlNode.appendChild(nodesubtitle);



									a = dojoquery(nodesubtitle).children();
									if (a.children.length > 0) {

										b = a.children()
										iconNode = dojoquery(b[0])

										on(iconNode, "click", lang.hitch(this,function(e){
											//alert('you clicked info');
											//pos = domGeom.position(iconNode);
											cdg = domGeom.position(this.container);
											console.log(cdg)

											toppos = e.y - cdg.y // + 10
											leftpos = e.x - cdg.x  // + 10
											console.log(toppos, leftpos)

											//domStyle.set(this.infoarea.domNode, 'top', toppos + 'px');
											//domStyle.set(this.infoarea.domNode, 'left', leftpos + 'px');
											domStyle.set(this.infoarea.domNode, { "display": "" });
											this.infoareacontent.innerHTML = control.help;

										}));

									}



						  if (control.type == "slider") {

								  parser.parse();

								  outslid = "";

								  isel = 0;

								  array.forEach(control.values, lang.hitch(this,function(option, i){

									if (option.help != undefined) {
										outslid = outslid + "<li><span id='" + ctab.id + "_lvoption_" + i + "'> <a style='color:black' href='#' title='" + option.help + "'>" + option.name.replace(" ","<br>").replace(" ","<br>").replace(" ","<br>").replace(" ","<br>").replace(" ","<br>").replace(" ","<br>").replace(" ","<br>") + "</a></span></li>";
									} else {
										outslid = outslid + "<li><span id='" + ctab.id + "_lvoption_" + i + "'> " + option.name.replace(" ","<br>").replace(" ","<br>").replace(" ","<br>").replace(" ","<br>").replace(" ","<br>").replace(" ","<br>").replace(" ","<br>") + "</span></li>";

									}

								   sel = option.selected;

								   if (sel == undefined) {

								    sel = false;
									option.selected = false;

								   }

								   if (sel == true) {
									   isel = i;
									   notSelected = false;
								   }

								   if (i == control.values.length - 1) {

								    if (notSelected == true) {

										sel = true;
										option.selected = true;
										isel = i;

									}

								   }


								  }));

								nslidernode = domConstruct.create("div");
								controlNode.appendChild(nslidernode);

								labelsnode = domConstruct.create("ol", {"data-dojo-type":"dijit/form/HorizontalRuleLabels", container:"bottomDecoration", style:"height:0.25em;padding-top: 10px !important;color:black !important", innerHTML: outslid})
								nslidernode.appendChild(labelsnode);



								slider = new HorizontalSlider({
									name: "tab_" + i + "_group_" + c,
									//id: ctab.id + "_slider_",
									data: {"tab": i, "control": c},
									value: isel,
									minimum: 0,
									maximum: (control.values.length -1),
									showButtons:false,
									title: control.name,
									intermediateChanges: true,
									discreteValues: control.values.length,
									//index: groupid,
									//onChange: lang.hitch(this,function(e) {this.updateUnique(e, groupid)}),
									onChange: lang.hitch(this,function(e) { this.updateSlider({"tab": i, "control": c, "type": control.type}, e) }),
									style: "width:250px;margin-top:10px;margin-bottom:20px; margin-left:10px"
								}, nslidernode);

								nbr = domConstruct.create("br");
								controlNode.appendChild(nbr);

								parser.parse()


						   } else {


							if (control.type == "radio") {
									rorc = RadioButton;
									ichecks = false;
								} else {
									rorc = CheckBox;
									ichecks = true;
								}

								//nodetitle = domConstruct.create("div", {style:"font-weight: bold;", innerHTML: control.name});
								//ctab.domNode.appendChild(nodetitle);

								notSelected = true;

								array.forEach(control.values, lang.hitch(this,function(val, v){

								//console.log(vars);

								if (val.style != undefined) {
									styleadds = val.style;
								} else {
									styleadds = ""
								}

								   ncontrolsnode = domConstruct.create("div", {style:val.style});
								   controlNode.appendChild(ncontrolsnode);


								   
								   sel = val.selected;

								   if (ichecks == false) {
								   
									   if (sel == undefined) {

										sel = false;
										val.selected = false;

									   }

									   if (sel == true) { notSelected = false }

									   if (v == control.values.length - 1) {

										if (notSelected == true) {

											sel = true;
											val.selected = true;

										}

									   }

									   console.log(sel);
								   }

									ncontrolnode = domConstruct.create("span");
									ncontrolsnode.appendChild(ncontrolnode);
									parser.parse();

									  ncontrol = new rorc({
										name: this.tabpan.id + "_" + "tab_" + i + "_group_" + c,
										//id: this.tabpan.id + "_radio_" + groupid + "_" + i,
										value: val.value,
										index: 1,
										title: "",
										data: {"tab": i, "control": c, "value": v},
										checked: sel,
										onChange: lang.hitch(this,function(e) { this.updateChecks({"tab": i, "control": c, "value": v, "type": control.type}, e) })
										}, ncontrolnode);

										console.log(ncontrol);

										if (val.help != undefined) {

											helpButton = "<a style='color:black' href='#' title='" + 'Click for more information.' + "'><img style='margin-right:3px;' src='" + this.infoIcon + "'></a>";

										} else {

											helpButton = "";

										}

										textNode = domConstruct.create("span", {innerHTML: "<span style='color:#000' >" + helpButton + val.name + "</span>"});

									//on(nslidernodeheader, "click", lang.hitch(this,function(e){
										//domStyle.set(this.infoarea.domNode, 'display', '');
										//this.infoareacontent.innerHTML = option.help;
									//}));

									ncontrolsnode.appendChild(textNode);

									a = dojoquery(textNode).children();
									if (a.children.length > 0) {

										b = a.children()
										iconNode = dojoquery(b[0])

										on(iconNode, "click", lang.hitch(this,function(e){
											//alert('you clicked info');
											//pos = domGeom.position(iconNode);
											cdg = domGeom.position(this.container);
											console.log(cdg)

											toppos = e.y - cdg.y // + 10
											leftpos = e.x - cdg.x  // + 10
											console.log(toppos, leftpos)

											//domStyle.set(this.infoarea.domNode, 'top', toppos + 'px');
											//domStyle.set(this.infoarea.domNode, 'left', leftpos + 'px');
											domStyle.set(this.infoarea.domNode, { "display": "" });
											this.infoareacontent.innerHTML = val.help;

										}));

									}


								}));

								parser.parse()

							  }

						lastControlNode = controlNode;

						}));

						if (ctabrec.selected) {
							this.tabpan.selectChild(ctab);
						}

					}));


					aspect.after(this.tabpan, "selectChild", lang.hitch(this,function (e, o) {

						selindex = o[0].index;

						array.forEach(this.currentgeography.tabs, lang.hitch(this,function(ctabrec, i){
							if (i == selindex) {
								ctabrec.selected = true;
							} else {
								ctabrec.selected = false;
							}
						}))


						this.resize();
						//array.forEach(this.myLayers, lang.hitch(this,function(clayer, i){
						//	this.map.removeLayer(clayer);
						//}));
						this.removeLayers();

						this.makeSandwidches();

					}));


					this.tabpan.startup();


					parser.parse();

					this.resize();

					this.makeSandwidches();

			   },

			   drawPolygon: function() {

					this.drawtoolbar.activate("polygon");


			   },


			   setup : function(response) {

					console.log("Success: ", response);

					this.layerlist = {};

					array.forEach(response.layers, lang.hitch(this,function(layer, i){

						layerSplit = layer.name.split("__")
						//console.log(layerSplit)
						//console.log(layerSplit.length);

						this.layerlist[layer.name] = layer.id;

						array.forEach(layerSplit, lang.hitch(this,function(cat, i){

							cgi = this.groupindex[i]


							if (this.controls[cgi].options == undefined) {

								this.controls[cgi].options = [];
								makedefault = true;

							} else {

								makedefault = false;

							}

							withingroup = false;

						    array.forEach(this.controls[cgi].options, lang.hitch(this,function(opts, i){

								if (opts.value == cat) {

									withingroup = true;

								}

							}));

							if (withingroup == false) {

								newoption = {};
								newoption.text = cat;
								newoption.selected = makedefault;
								newoption.value = cat;

								this.controls[cgi].options.push(newoption)

							}


						}));

					}));


				},



				zoomToActive: function() {

					ext = new Extent(this.currentgeography.extent);
					this.map.setExtent(ext, true);

				},

				changeOpacity: function(e) {

					if (e != undefined) {
						this.translevel = e;
					} else {
						this.translevel = 0;
					}


					array.forEach(this.myLayers, lang.hitch(this,function(clayer, i){
						clayer.setOpacity(1 - this.translevel);
					}));


				},

				viewChart: function() {

					console.log(this.currentData);
					domStyle.set(this.chartArea.domNode, 'display', '');

				},

				render: function() {

					this.myLayers = new Array();

					a = dojoquery(this.container).parent();

					domStyle.set(this.container, 'overflow', 'hidden');


					this.infoarea = new ContentPane({
					  style:"z-index:10000; !important;position:absolute !important;left:20px !important;top:0px !important;width:" + _helpWidth + " !important;background-color:#FFF !important;padding:10px !important;border-style:solid;border-width:4px;border-color:#444;border-radius:5px;display: none",
					  innerHTML: "<div class='infoareacloser' style='float:right !important'><a href='#'>✖</a></div><div class='infoareacontent' style='padding-top:15px'>no content yet</div>"
					});

					dom.byId(a[0]).appendChild(this.infoarea.domNode)

					ina = dojoquery(this.infoarea.domNode).children(".infoareacloser");
					this.infoAreaCloser = ina[0];

					inac = dojoquery(this.infoarea.domNode).children(".infoareacontent");
					this.infoareacontent = inac[0];


					on(this.infoAreaCloser, "click", lang.hitch(this,function(e){
						domStyle.set(this.infoarea.domNode, 'display', 'none');
					}));


					this.chartArea = new ContentPane({
					  style:"overflow:hidden;z-index:10000; !important;position:absolute !important;left:310px !important;top:20px !important;width:430px !important;background-color:#FFF !important;padding:10px !important;border-style:solid;border-width:4px;border-color:#444;border-radius:5px;display: none",
					  innerHTML: "<div class='chartareacloser' style='float:right !important'><a href='#'>✖</a></div><div class='chartareacontent' style='width:330px;height:350px;padding-top:15px'>no content yet</div>"
					});

					dom.byId(a[0]).appendChild(this.chartArea.domNode)

					ina = dojoquery(this.chartArea.domNode).children(".chartareacloser");
					this.ChartAreaCloser = ina[0];

					inac = dojoquery(this.chartArea.domNode).children(".chartareacontent");
					this.chartareacontent = inac[0];


					on(this.ChartAreaCloser, "click", lang.hitch(this,function(e){
						domStyle.set(this.chartArea.domNode, 'display', 'none');
					}));

					//this.tabpan = new TabContainer({
						//style: "height: 100%; width: 100%;"
					//});

					this.mainpane = new ContentPane({
						style:"padding: 8px"
					  //style:"overflow:hidden !important",
					 //style: "height: 100%; width: 100%;",
					 // title: "Choose Parameters"
					});


					domStyle.set(this.mainpane.domNode, 'overflow', 'hidden');

					domClass.add(this.mainpane.domNode, this.dojoTheme);
					parser.parse();
					domClass.add(this.mainpane.domNode, this.dojoTheme);


					//dom.byId(this.container).appendChild(this.tabpan.domNode);

					dom.byId(this.container).appendChild(this.mainpane.domNode);
					domClass.add(this.mainpane.domNode, this.dojoTheme);
					//this.tabpan.addChild(this.mainpane);
					//this.tabpan.addChild(this.chartpane);

					//aspect.after(this.tabpan, "selectChild", lang.hitch(this,function (event) {
					//	this.resize();
					//}));

					//this.tabpan.startup();

					//dom.byId(this.container).appendChild(this.mainpane.domNode);
					parser.parse();


					this.buttonpane = new ContentPane({
					  style:"border-top-style:groove !important; height:100px;overflow: hidden !important;background-color:#F3F3F3 !important;padding:10px !important;"
					});


					dom.byId(this.container).appendChild(this.buttonpane.domNode);


							nslidernodetitle = domConstruct.create("span", {innerHTML: " Layer Properties: "});
							this.buttonpane.domNode.appendChild(nslidernodetitle);

							zoombutton = domConstruct.create("a", {class: "pluginLayer-extent-zoom", href: "#", title: "Zoom to Extent"});
							this.buttonpane.domNode.appendChild(zoombutton);
							on(zoombutton, "click", lang.hitch(this, this.zoomToActive));

							nslidernode = domConstruct.create("span", {style: "margin-left:10px !important"});
							this.buttonpane.domNode.appendChild(nslidernode);

							//myButton = new Button({
							//	label: "Chart",
							//	onClick: lang.hitch(this,this.viewChart)
							//}, nslidernode);

							nslidernode = domConstruct.create("div");
							this.buttonpane.domNode.appendChild(nslidernode);

							labelsnode = domConstruct.create("ol", {"data-dojo-type":"dijit/form/HorizontalRuleLabels", container:"bottomDecoration", style:"height:0.25em;padding-top: 10px !important;color:black !important", innerHTML: "<li>Opaque</li><li>Transparent</li>"})
							nslidernode.appendChild(labelsnode);

							slider = new HorizontalSlider({
								value: this.translevel,
								minimum: 0,
								maximum: 1,
								showButtons:false,
								title: "Change the layer transparency",
								intermediateChanges: true,
								//discreteValues: entry.options.length,
								onChange: lang.hitch(this,this.changeOpacity),
								style: "width:210px;margin-top:10px;margin-bottom:20px;margin-left:20px; background-color:#F3F3F3 !important"
							}, nslidernode);

							parser.parse()

						this.methodsButton = new Button({
							label: "View Full Report",
							style:  "position: absolute; right:5px; bottom:5px !important;",
							onClick: lang.hitch(this,function(){window.open(this.currentgeography.methods.url)})  //function(){window.open(this.configVizObject.methods)}
							});
						this.buttonpane.domNode.appendChild(this.methodsButton.domNode);

					domStyle.set(this.methodsButton.domNode, "display", "none");

					this.ButtonsLocation = domConstruct.create("span", {style: "float:right"});

					this.buttonpane.domNode.appendChild(this.ButtonsLocation);

					//this.resize();

				},

			   showHelp: function () {

									helpDialog = new Dialog({

										title: "My Dialog",
										content: "Test content.",
										style: "width: 300px"

									});

									helpDialog.show();

			   },

               getState: function () {

			    //console.log("save Geo MS");
				//console.log(this.currentgeography);

				state = new Object();

				state.geo = this.currentgeography;
				state.trans = this.translevel;

				return state;


				},


               setState: function (state) {

				this.stateRestore = true;
				this.currentgeography = state.geo;
				this.translevel = state.trans;
				
				if (this._hasactivated) {
					this.changeGeography(this.currentgeography, false);
				}
				

				},

            subregionActivated: function(subregion) {

                console.debug('now using subregion ' + subregion.display);

				this.usableRegions = new Array();

				array.forEach(this.mainData.regions, lang.hitch(this,function(region, i){
					if (region.name == subregion.id) {
						this.usableRegions.push(region);
					}
				}));

				domConstruct.empty(this.regionChooserContainer);

				console.log(this.mainData);
				//insert
				this.rebuildOptions(this.usableRegions);

            },

            subregionDeactivated: function(subregion) {

                console.debug('now leaving subregion ' + subregion.display);

				domConstruct.empty(this.regionChooserContainer);

				this.rebuildOptions(this.mainData.regions);

            }

           });
       });


function allPossibleCases(arr) {
  if (arr.length === 0) {
    return [];
  }
else if (arr.length ===1){
return arr[0];
}
else {
    var result = [];
    var allCasesOfRest = allPossibleCases(arr.slice(1));  // recur with the rest of array
    for (var c in allCasesOfRest) {
      for (var i = 0; i < arr[0].length; i++) {
        result.push(arr[0][i] + "|" + allCasesOfRest[c]);
      }
    }
    return result;
  }

}

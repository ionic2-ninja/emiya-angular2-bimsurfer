export class Api {
  private client
  private address;
  private username;
  private password;
  private BimSurfer;
  private StaticTreeRenderer;
  private MetaDataRenderer;
  private domReady;
  private token


  constructor(address, username, password) {
    this.address = address
    this.username = username
    this.password = password
    //console.log(window['require'])
  }

  public loadLib = () => {
    return new Promise((resolve, reject) => {
      try {
        window['require'](["bimsurfer/src/BimSurfer", "bimsurfer/src/StaticTreeRenderer", "bimsurfer/src/MetaDataRenderer", "bimsurfer/lib/domReady!"], (BimSurfer, StaticTreeRenderer, MetaDataRenderer, domReady) => {
          this.BimSurfer = BimSurfer
          this.StaticTreeRenderer = StaticTreeRenderer
          this.MetaDataRenderer = MetaDataRenderer
          this.domReady = domReady
          resolve([BimSurfer, StaticTreeRenderer, MetaDataRenderer, domReady])
        })
      } catch (e) {
        reject(e)
      }
    })
  }


  public login = () => {
    return new Promise((resolve, reject) => {
      this.client = new window['BimServerClient'](this.address);
      this.client.init(() => {
        this.client.login(this.username, this.password, () => {
          console.log('login ok', this.client.token)
          this.token = this.client.token
          resolve(this.client.token)
        }, function (error) {
          console.error('login fail', error);
          reject(error)
        });
      })

    })

  }


  public getAllProjects = () => {
    return new Promise((resolve, reject) => {
      this.client.call("ServiceInterface", "getAllProjects", {
        onlyTopLevel: true,
        onlyActive: true
      }, (projects) => {
        console.log('getAllProjects ok', projects)
        resolve(projects)
        //a.setAttribute("href", "demo/example_BIMServer.html?address=" + encodeURIComponent(address) + "&token=" + client.token + "&poid=" + project.oid + "&roid=" + project.lastRevisionId);

      }, (error) => {
        reject(error)
      });
    })
  }

  public showDemo = (poid, roid, bust = '') => {
    let bimSurfer = new this.BimSurfer({
      domNode: "viewerContainer" + bust
    });

    bimSurfer.on("loading-finished", () => {
      document.getElementById("status" + bust).innerHTML = "Loading finished";
      let domNode = document.getElementById("typeSelector" + bust);
      domNode.innerHTML = "";
      bimSurfer.getTypes().forEach((ifc_type) => {
        let on = ifc_type.visible;
        let d = document.createElement("div");
        let t = document.createTextNode(ifc_type.name);
        let setClass = () => {
          d.className = "fa fa-eye " + ["inactive", "active"][on * 1];
        };
        setClass();
        d.appendChild(t);
        domNode.appendChild(d);
        d.onclick = () => {
          on = !on;
          setClass();
          bimSurfer.setVisibility({types: [ifc_type.name], visible: on});
        };
      });
    });
    bimSurfer.on("loading-started", () => {
      document.getElementById("status" + bust).innerHTML = "Loading...";
    });

    // Lets us play with the Surfer in the console
    window['bimSurfer' + bust] = bimSurfer;
    //alert(123)
    // Load a model from BIMServer
    console.log(bimSurfer)
    bimSurfer.load({
      bimserver: this.address,
      token: this.token,
      poid: poid,
      roid: roid,
      schema: "ifc2x3tc1" // < TODO: Deduce automatically
    }).then((model) => {
      console.log(model)
      model.getTree().then((tree) => {

        // Build a tree view of the elements in the model. The fact that it
        // is 'static' refers to the fact that all branches are loaded and
        // rendered immediately.
        let domtree = new this.StaticTreeRenderer({
          domNode: 'treeContainer' + bust
        });
        domtree.addModel({name: "", id: roid, tree: tree});
        domtree.build();

        // Add a widget that displays metadata (IfcPropertySet and instance
        // attributes) of the selected element.
        let metadata = new this.MetaDataRenderer({
          domNode: 'dataContainer' + bust
        });
        metadata.addModel({name: "", id: roid, model: model});

        bimSurfer.on("selection-changed", (selected) => {
          domtree.setSelected(selected, domtree.SELECT_EXCLUSIVE);
          metadata.setSelected(selected);
        });

        domtree.on("click", (oid, selected) => {
          // Clicking an explorer node fits the view to its object and selects
          if (selected.length) {
            bimSurfer.viewFit({
              ids: selected,
              animate: true
            });
          }
          bimSurfer.setSelection({
            ids: selected,
            clear: true,
            selected: true
          });
        });


        // Write API ref

        let flatten = (n) => {
          let li = []
          let f = (n) => {
            li.push(n.id);
            (n.children || []).forEach(f);
          }
          f(n);
          return li;
        };

        let oids: any = flatten(tree);
        //window['_'].shuffle(oids);
        oids.splice(10);
        let guids = bimSurfer.toGuid(oids);

        oids = "[" + oids.join(", ") + "]";
        guids = "[" + guids.map((s) => {
            return '"' + s + '"';
          }).join(", ") + "]";

        let METHODS = [
          {name: 'setVisibility', args: [{name: "ids", value: oids}, {name: "visible", value: false}]},
          {
            name: 'setVisibility',
            args: [{name: "types", value: '["IfcWallStandardCase"]'}, {name: "visible", value: false}]
          },
          {name: 'setSelectionState', args: [{name: "ids", value: oids}, {name: "selected", value: true}]},
          {name: 'getSelected', args: [], hasResult: true},
          {name: 'toId', args: [guids], hasResult: true},
          {name: 'toGuid', args: [oids], hasResult: true},
          {name: 'setColor', args: [{name: "ids", value: oids}, {name: "color", value: "{r:1, g:0, b:0, a:1}"}]},
          {name: 'viewFit', args: [{name: "ids", value: oids}, {name: "animate", value: 500}]},
          {name: 'setCamera', args: [{name: "type", value: "'ortho'"}]},
          {name: 'getCamera', args: [], hasResult: true},
          {name: 'reset', args: [{name: "cameraPosition", value: true}]},
        ];

        let n = document.getElementById('apirefContainer' + bust);

        METHODS.forEach((m: {name, args: [{name,value}], hasResult?}, i) => {
          n.innerHTML += "<h2>" + m.name + "()</h2>";

          let hasNamedArgs = false;
          let args = m.args.map((a) => {
            if (a.name) {
              hasNamedArgs = true;
              return a.name + ":" + a.value;
            } else {
              return a;
            }
          }).join(", ");

          if (hasNamedArgs) {
            args = "{" + args + "}";
          }

          let cmd = "bimSurfer" + bust + "." + m.name + "(" + args + ");";
          n.innerHTML += "<textarea rows=3 id='code" + i + bust + "' spellcheck=false>" + cmd + "\n</textarea>";
          window['exec_statement'] = "eval(document.getElementById(\"code" + i + bust + "\").value)"
          if (m.hasResult) {
            window['exec_statement'] = "document.getElementById(\"result" + i + bust + "\").innerHTML = JSON.stringify(" + window['exec_statement'] + ").replace(/,/g, \", \")";
          } else {
            window['exec_statement'] += "; window.scrollTo(0,0)"
          }
          n.innerHTML += "<button onclick='" + window['exec_statement'] + "'>run</button>";
          if (m.hasResult) {
            n.innerHTML += "<pre id='result" + i + bust + "' />";
          }
        });
      });
    });
  }

}
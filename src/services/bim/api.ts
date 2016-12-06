import {Utils} from 'emiya-js-utils'
import {viewControl} from './viewControl'

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


  constructor(address, username, password?) {
    this.address = address

    if (password === null || password === undefined || password === '') {
      this.token = username
    }
    else {
      this.username = username
      this.password = password
    }

    //console.log(window['require'])
  }

  public getToken = () => {
    return this.token
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
    console.log(this)
    if (this.token === null || this.token === undefined)
      return new Promise((resolve, reject) => {
        this.client = new window['BimServerClient'](this.address);
        //console.log('client', this.client)
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
    else
      return this.loginByToken()
  }

  public loginByToken = () => {
    return new Promise((resolve, reject) => {
      this.client = new window['BimServerClient'](this.address);
      //console.log('client', this.client)
      this.client.init(() => {
        this.client.setToken(this.token, () => {
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


  public getAllProjects = (params?) => {
    params = Utils.mergeObject(params, {
      onlyTopLevel: false,
      onlyActive: false
    })
    return new Promise((resolve, reject) => {
      this.client.call("ServiceInterface", "getAllProjects", params, (projects) => {
        console.log('getAllProjects ok', projects)
        resolve(projects)
        //a.setAttribute("href", "demo/example_BIMServer.html?address=" + encodeURIComponent(address) + "&token=" + client.token + "&poid=" + project.oid + "&roid=" + project.lastRevisionId);

      }, (error) => {
        reject(error)
      });
    })
  }

  public makeModelView(projects, dom?, onclick?, firstNoPaddingLeft = true) {
    if (projects && !(projects instanceof Array))
      projects = [projects]
    if (!dom) {
      dom = document.createElement('ul')
      if (firstNoPaddingLeft)
        dom.style.paddingLeft = '0px'
    }
    else if (projects && projects.length > 0) {
      let _dom = document.createElement('ul')
      if (firstNoPaddingLeft)
        _dom.style.paddingLeft = '0px'
      else
        _dom.style.paddingLeft = '10px'
      dom.append(_dom);
      dom = _dom
    }

    for (let c in projects) {
      let sub = document.createElement('li')
      sub.style.margin = '3px'
      sub.style.fontSize = '20px'
      sub.style.lineHeight = '20px'
      sub.innerText = projects[c].name
      sub.value = projects[c].id
      sub.style.whiteSpace = 'nowrap'

      this.makeModelView(projects[c].children, sub, onclick, false)
      if (projects[c].children && projects[c].children.length > 0) {
        sub.style.listStyle = 'none'
        sub.style.background = "url('assets/bimsurfer/images/show.jpg') no-repeat 0 0"
        sub.style.backgroundSize = "20px 20px"
        sub.style.textIndent = '25px';
        (function (subdom) {

          subdom.onclick = function (ev) {
            ev.stopPropagation()
            let _sub: any = subdom
            do {
              _sub = _sub.firstElementChild;

              if (_sub) {
                if (_sub.style.display != 'none') {
                  _sub.style.display = 'none'
                  subdom.style.listStyle = 'none'
                  subdom.style.background = "url('assets/bimsurfer/images/hide.jpg') no-repeat 0 0"
                  subdom.style.backgroundSize = "20px 20px"
                } else {
                  _sub.style.display = ''
                  subdom.style.listStyle = 'none'
                  subdom.style.background = "url('assets/bimsurfer/images/show.jpg') no-repeat 0 0"
                  subdom.style.backgroundSize = "20px 20px"
                }
              }
            } while (_sub)
          }
        })(sub)

      } else {
        sub.style.listStyle = 'none'

        sub.style.background = "url('assets/bimsurfer/images/see.jpg') no-repeat 0 0";
        (function (obj) {
          sub.onclick = function (ev) {
            ev.stopPropagation()
            onclick && onclick(obj)
            //alert(JSON.stringify(obj));

          };
        })(projects[c]);
        sub.style.backgroundSize = "20px 20px"
        sub.style.textIndent = '25px';

      }
      dom.append(sub)
    }
    return dom
  }

  public setTreeSelection(dom) {

  }


  public makeProjectView(projects, dom?, onclick?) {
    if (projects && !(projects instanceof Array))
      projects = [projects]
    if (!dom)
      dom = document.createElement('ul')
    else if (projects && projects.length > 0) {
      let _dom = document.createElement('ul')
      dom.append(_dom);
      dom = _dom
    }

    for (let c in projects) {
      let sub = document.createElement('li')
      sub.style.margin = '3px'
      sub.style.fontSize = '20px'
      sub.style.lineHeight = '20px'
      sub.innerText = projects[c].name

      this.makeProjectView(projects[c].children, sub, onclick)
      if (projects[c].children && projects[c].children.length > 0) {
        sub.style.listStyle = 'none'
        sub.style.background = "url('assets/bimsurfer/images/show.jpg') no-repeat 0 0"
        sub.style.backgroundSize = "20px 20px"
        sub.style.textIndent = '25px';
        (function (subdom) {

          subdom.onclick = function (ev) {
            ev.stopPropagation()
            let _sub: any = subdom
            do {
              _sub = _sub.firstElementChild;

              if (_sub) {
                if (_sub.style.display != 'none') {
                  _sub.style.display = 'none'
                  subdom.style.listStyle = 'none'
                  subdom.style.background = "url('assets/bimsurfer/images/hide.jpg') no-repeat 0 0"
                  subdom.style.backgroundSize = "20px 20px"
                } else {
                  _sub.style.display = ''
                  subdom.style.listStyle = 'none'
                  subdom.style.background = "url('assets/bimsurfer/images/show.jpg') no-repeat 0 0"
                  subdom.style.backgroundSize = "20px 20px"
                }
              }
            } while (_sub)
          }
        })(sub)

      } else {
        sub.style.listStyle = 'none'
        if (projects[c].lastRevisionId != -1) {
          sub.style.background = "url('assets/bimsurfer/images/see.jpg') no-repeat 0 0";
          (function (obj) {
            sub.onclick = function (ev) {
              ev.stopPropagation()
              onclick && onclick(obj)
              //alert(JSON.stringify(obj));

            };
          })(projects[c]);
        }
        else {
          sub.style.background = "url('assets/bimsurfer/images/none.jpg') no-repeat 0 0";
          sub.onclick = function (ev) {
            ev.stopPropagation()

          };
        }
        sub.style.backgroundSize = "20px 20px"
        sub.style.textIndent = '25px';

      }
      dom.append(sub)
    }
    return dom
  }

  public makeProjectTree(projects, tops?) {
    if (!tops) {
      tops = []
      for (let c in projects) {
        if (projects[c].parentId == -1) {
          tops.push(projects[c])
        }
      }
    }
    for (let c in tops) {
      let sub = []

      for (let d in tops[c].subProjects) {
        for (let e in projects) {
          if (projects[e].oid == tops[c].subProjects[d]) {
            sub.push(projects[e])
          }
        }
      }
      tops[c].children = this.makeProjectTree(projects, sub)
    }

    return tops

  }

  public loadModel = (poid, roid, id) => {
    return new Promise((resolve, reject) => {
      let bimSurfer = new this.BimSurfer({
        domNode: id
      });
      bimSurfer.load({
        bimserver: this.address,
        token: this.token,
        poid: poid,
        roid: roid,
        schema: "ifc2x3tc1" // < TODO: Deduce automatically
      }).then((data) => {
        resolve(new viewControl(data, bimSurfer, this.MetaDataRenderer))
      }).catch((err) => {
        reject(err)
      })
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
        console.log(123, tree)
        this.makeModelView(tree, document.getElementById('modelView' + bust))
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
        console.log(123, metadata)
        console.log(321, model)
        console.log(model.model.get('43188906', function (w, a, b) {
          console.log(w)
          console.log(b)
        }))
        bimSurfer.on("selection-changed", (selected) => {
          domtree.setSelected(selected, domtree.SELECT_EXCLUSIVE);
          console.log(selected)
          metadata.setSelected(selected);
        });

        domtree.on("click", (oid, selected) => {
          console.log(oid)
          console.log(selected)
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

        METHODS.forEach((m: {name, args: [{name, value}], hasResult?}, i) => {
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
          //console.log(window['bimSurfer'])
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

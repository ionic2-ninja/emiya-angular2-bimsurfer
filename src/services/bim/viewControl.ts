import {Utils} from 'emiya-js-utils'

export class viewControl {
  private bimSurfer
  private model
  private modelSelectListener: Array<Function> = []
  private MetaDataRenderer
  private poid
  private roid
  private id

  constructor(model, bimSurfer, MetaDataRenderer, poid, roid, id) {
    this.bimSurfer = bimSurfer
    this.model = model
    this.MetaDataRenderer = MetaDataRenderer
    this.poid = poid
    this.roid = roid
    this.id = id
    this.bimSurfer.on("selection-changed", (selected) => {

      for (let c in this.modelSelectListener) {
        this.modelSelectListener[c] && this.modelSelectListener[c](selected)
      }
    });
  }

  public getCanvas = () => {

    let nodes = document.getElementById(this.id).childNodes
    for (let c = nodes.length - 1; c >= 0; --c) {

      if (nodes[c]['tagName'].toLowerCase() == 'canvas')
        return nodes[c]
    }
  }

  public getSnapshot = (offsetx?, offsety?, width?, height?, bgcolor?, format?, quality?, timeout?) => {
    return new Promise((resolve, reject) => {
      try {
        let dom = this.getCanvas()
        if (!dom)
          return
        let w = dom['width'], h = dom['height']

        if (format === void 0)
          format = 'png'

        let code = dom['toDataURL']("image/" + format, quality)

        if (bgcolor === void 0)
          bgcolor = 'white'

        if (quality === void 0)
          quality = 1


        offsetx = (offsetx === void 0) ? 0 : offsetx
        offsety = (offsety === void 0) ? 0 : offsety


        if (typeof offsetx == 'string' && offsetx.indexOf('%') >= 0) {

          offsetx = parseFloat(Utils.replaceAll(offsetx, '%', '')) * w / 100
        } else if (typeof offsetx == 'string') {
          offsetx = parseFloat(offsetx)
        }
        if (typeof offsety == 'string' && offsety.indexOf('%') >= 0) {
          offsety = parseFloat(Utils.replaceAll(offsety, '%', '')) * h / 100
        } else if (typeof offsety == 'string') {
          offsety = parseFloat(offsety)
        }
        width = (width === void 0) ? (w - offsetx) : width
        height = (height === void 0) ? (h - offsety) : height
        if (typeof width == 'string' && width.indexOf('%') >= 0) {
          width = parseFloat(Utils.replaceAll(width, '%', '')) * w / 100
        } else if (typeof width == 'string') {
          width = parseFloat(width)
        }
        if (typeof height == 'string' && height.indexOf('%') >= 0) {
          height = parseFloat(Utils.replaceAll(height, '%', '')) * h / 100
        } else if (typeof height == 'string') {
          height = parseFloat(height)
        }

        let _canvas = document.createElement('canvas')
        _canvas.width = width
        _canvas.height = height
        let img = new Image()
        img.src = code
        img.style.height = h + 'px'
        img.style.width = w + 'px'

        let timer
        timeout = (timeout === void 0 ? 30000 : timeout)
        if (timeout > 0)
          timer = setTimeout(() => {
            reject('timeout')
            timer = null
          }, timeout)

        img.onload = () => {
          let context = _canvas.getContext('2d');
          if (bgcolor != null && bgcolor.trim() != '') {
            context.fillStyle = "white"
            context.fillRect(0, 0, width, height)
          }
          context.drawImage(img, -offsetx, -offsety)
          code = _canvas.toDataURL("image/" + format, 1)
          if (timer) {
            clearTimeout(timer)
            timer = null
          }
          resolve({base64: code, width: width, height: height, name: this.poid + '#' + this.roid, format: format})
        }
        img.onerror = (err) => {
          if (timer) {
            clearTimeout(timer)
            timer = null
          }
          reject(err)
        }


      } catch (e) {
        reject(e)
      }
    })

  }

  public downloadSnapshot(offsetx?, offsety?, width?, height?, bgcolor?, format?, quality?, timeout?) {
    let c = this.getSnapshot(offsetx, offsety, width, height, bgcolor, format, quality, timeout)
    c.then((ev) => {
      let a = document.createElement('a');
      a['href'] = ev['base64'];
      a.download = ev['name'];
      a.click();
    })

    return c

  }

  public getModel = () => {
    return this.model
  }

  public getMetaDataRenderer = () => {
    return this.MetaDataRenderer
  }

  public getById = (id, cb) => {
    return this.model.model.get(id, cb)
  }

  public getbBimSurfer = () => {
    return this.bimSurfer
  }

  public showModelTree = (tree, dom, firstNoPadding?) => {
    let m = new window['ModelTreeView'](tree, dom, this.bimSurfer, this.roid, firstNoPadding)
    m.show()
    return m
  }

  // public getMetaDataSelected = () => {
  //   let metadata = new this.MetaDataRenderer({
  //     domNode: 'dataContainer' + bust
  //   });
  // }

  public getTree = () => {
    return this.model.getTree()
  }

  public setVisibility = (ids, visable?) => {
    return this.bimSurfer.setVisibility({ids: ids, visible: visable})
  }

  public viewFit = (ids, animate = 500) => {
    return this.bimSurfer.viewFit({ids: ids, animate: animate});
  }

  public setColor = (ids, color = {r: 1, g: 0, b: 0, a: 1}) => {
    return this.bimSurfer.setColor({ids: ids, color: color});
  }

  public getSelected = () => {
    return this.bimSurfer.getSelected();
  }


  public setSelectionState = (ids, selected = true) => {
    return this.bimSurfer.setSelectionState({ids: ids, selected: selected});
  }

  public setSelection = (ids, selected = true, clear = true) => {
    return this.bimSurfer.setSelection({
      ids: ids,
      clear: clear,
      selected: selected
    });
  }

  public reset = (params = {cameraPosition: true}) => {
    return this.bimSurfer.reset(params);
  }

  public onModelSelect = (cb) => {
    if (!cb)
      return
    this.modelSelectListener.push(cb)
    return () => {
      while (this.modelSelectListener.indexOf(cb) >= 0)
        this.modelSelectListener.splice(this.modelSelectListener.indexOf(cb), 1);
    }
  }

  public getPSet = (id, cb) => {
    let obj = this.model.model.objects[id]
    obj.getIsDefinedBy((isDefinedBy) => {
      if (isDefinedBy.getType() == "IfcRelDefinesByProperties") {
        isDefinedBy.getRelatingPropertyDefinition((pset) => {
          if (pset.getType() == "IfcPropertySet") {
            pset.getHasProperties((prop) => {
              let count = 0, name, value
              prop.getName((_name) => {
                ++count
                name = _name
                if (count == 2)
                  cb && cb(name, value, prop);
              });
              prop.getNominalValue((_value) => {
                ++count
                value = _value._v
                if (count == 2)
                  cb && cb(name, value, prop);
              });
            })
          }
        });
      }
    })
    return obj
  }

  public getObject = (id) => {
    return this.model.model.objects[id]
  }

  public getAttributes = (id, cb) => {
    let obj = this.model.model.objects[id];
    ["GlobalId", "Name", "OverallWidth", "OverallHeight", "Tag"].forEach(function (k) {
      obj['get' + k] && (cb && cb(k, obj['get' + k](), obj))
    });
    return obj
  }

  public getType = (id) => {
    return this.model.model.objects[id].getType()
  }

}

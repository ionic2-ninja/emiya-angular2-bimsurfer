var ModelTreeView = (function () {
  function ModelTreeView(projects, dom, bimSurfer, roid, firstNoPaddingLeft) {
    var _this = this
    this.treedom
    this.parentdom
    this.textIndent = '25px'
    this.prefixSize = "20px 20px"
    this.paddingLeft = '10px'
    this.margin = '3px'
    this.fontSize = '20px'
    this.lineHeight = '20px'
    this.hideImage = "url('assets/bimsurfer/images/hide.jpg')"
    this.showImage = "url('assets/bimsurfer/images/show.jpg')"
    this.seeImage = "url('assets/bimsurfer/images/see.jpg')"
    this.selectedColor = 'blue'
    this.deselectedColor = ''
    this.eyeleft = '20px'
    this._visibleValue = [true, false]
    this._eyesrc = ["assets/bimsurfer/images/see.jpg", "assets/bimsurfer/images/null.jpg"]
    this.scrollbarheight = 27

    this.setvisiblevalues = function (visibleValue, src) {
      _this._visibleValue = visibleValue
      _this._eyesrc = src
    }

    this._showTree = function (projects, dom, firstNoPaddingLeft) {
      if (firstNoPaddingLeft === void 0)
        firstNoPaddingLeft = true
      if (projects && !(projects instanceof Array))
        projects = [projects]
      if (!dom) {
        dom = document.createElement('ul')
        dom.style.position = 'relative'
        if (firstNoPaddingLeft)
          dom.style.paddingLeft = '0px'
        else
          dom.style.paddingLeft = this.paddingLeft
        if (!this.treedom)
          this.treedom = dom
      }
      else if (projects && projects.length > 0) {
        var _dom = document.createElement('ul')
        _dom.style.position = 'relative'
        if (firstNoPaddingLeft)
          _dom.style.paddingLeft = '0px'
        else
          _dom.style.paddingLeft = this.paddingLeft
        dom.append(_dom);
        if (!this.parentdom)
          this.parentdom = dom
        dom = _dom
        if (!this.treedom)
          this.treedom = dom
      }

      for (var c in projects) {
        var sub = document.createElement('li')
        sub.style.position = 'relative'
        var span = document.createElement('span')
        var div0 = document.createElement('div')
        var div1 = document.createElement('img')

        span.innerText = projects[c].name
        span.style.fontSize = this.fontSize
        span.style.lineHeight = this.lineHeight
        span.style.height = this.lineHeight
        span.style.whiteSpace = 'nowrap'
        span.style.position = 'relative'
        div0.style.display = 'inline'
        div0.style.position = 'relative'
        div1.style.display = 'inline'
        div1.src = _this._eyesrc[0]
        div1.style.height = this.lineHeight
        div1.style.width = this.lineHeight

        div1.style.position = 'relative'
        div1.style.left = _this.eyeleft
        div1.style.verticalAlign = 'sub'
        span.setAttribute('skip', 'true')
        div0.setAttribute('skip', 'true')
        div1.setAttribute('skip', 'true')
        div1.setAttribute('name', 'eye')
        sub.appendChild(div0)
        sub.appendChild(span)
        sub.appendChild(div1)

        sub.style.margin = this.margin
        //sub.style.fontSize = this.fontSize
        sub.style.lineHeight = this.lineHeight
        //sub.style.height = this.lineHeight
        //sub.innerText = projects[c].name
        sub.setAttribute('data', JSON.stringify({
          id: projects[c].id,
          selected: false,
          display: true,
          shrink: false
        }))
        sub.style.whiteSpace = 'nowrap'

        this._showTree(projects[c].children, sub, onclick, false)
        if (projects[c].children && projects[c].children.length > 0) {
          sub.style.listStyle = 'none'
          sub.style.backgroundImage = this.showImage
          sub.style.backgroundRepeat = "no-repeat"
          sub.style.backgroundPosition = "0 0"
          sub.style.backgroundSize = this.prefixSize
          sub.style.textIndent = this.textIndent;
          (function (subdom, img) {

            img.onclick = function (ev) {
              ev.stopPropagation()
              var result;
              result = _this._getallchildren(subdom, img)
              var ids = []
              if (result.children.length > 0) {
                bimSurfer.setSelection({
                  ids: [],
                  clear: true,
                  selected: false
                });
              }
              for (var c in result.children) {
                ids.push(roid + ':' + result.children[c].id)
              }
              bimSurfer.setVisibility({ids: ids, visible: result.visible})
            }

            subdom.onclick = function (ev) {
              if (ev && ev.stopPropagation)
                ev.stopPropagation()
              var _sub = subdom
              var data = JSON.parse(_sub.getAttribute('data'))
              if (data.shrink == true) {
                _sub.style.backgroundImage = _this.showImage
                data.shrink = false
              } else {
                _sub.style.backgroundImage = _this.hideImage
                data.shrink = true
              }
              _sub.setAttribute('data', JSON.stringify(data))
              _sub = _sub.firstElementChild;
              do {

                if (_sub) {
                  if (_sub.getAttribute('skip') != 'true') {
                    if (data.shrink == true) {
                      _sub.style.display = 'none'
                      subdom.style.listStyle = 'none'
                      //sub.style.backgroundImage = this.hideImage
                      sub.style.backgroundRepeat = "no-repeat"
                      sub.style.backgroundPosition = "0 0"
                      subdom.style.backgroundSize = _this.prefixSize
                    } else {
                      _sub.style.display = ''
                      subdom.style.listStyle = 'none'
                      //sub.style.backgroundImage = this.showImage
                      sub.style.backgroundRepeat = "no-repeat"
                      sub.style.backgroundPosition = "0 0"
                      subdom.style.backgroundSize = _this.prefixSize
                    }
                  }

                  _sub = _sub.nextElementSibling;

                }
              } while (_sub)
            }
          })(sub, div1)

        } else {
          sub.style.listStyle = 'none'
          sub.style.backgroundImage = this.seeImage
          sub.style.backgroundRepeat = "no-repeat"
          sub.style.backgroundPosition = "0 0";
          (function (obj, sub, img) {
            img.onclick = function (ev) {
              ev.stopPropagation()
              var result;
              result = _this._getallchildren(sub, img)
              var ids = []
              for (var c in result.children) {
                ids.push(roid + ':' + result.children[c].id)
              }
              bimSurfer.setVisibility({ids: ids, visible: result.visible})
            }
            sub.onclick = function (ev) {
              if (ev && ev.stopPropagation)
                ev.stopPropagation()
              if (ev && ev.clean === void 0)
                ev.clean = true

              var data = JSON.parse(sub.getAttribute('data'))
              bimSurfer.viewFit({
                ids: [roid + ':' + data.id],
                animate: true
              });
              bimSurfer.setSelection({
                ids: [roid + ':' + data.id],
                clear: true,
                selected: true
              });
              _this._callClickCallbacks(ev, {
                domdata: data,
                id: data.id,
                model: obj,
                dom: sub,
                treedom: _this.treedom
              })
              if (!ev || ev.clean) {
                _this._cleanSelected(_this.treedom)
              }
              _this._select(sub)
            };
          })(projects[c], sub, div1);
          sub.style.backgroundSize = this.prefixSize
          sub.style.textIndent = this.textIndent;

        }
        dom.append(sub)
      }
    }

    this.show = function () {
      _this._showTree(projects, dom, firstNoPaddingLeft)
    }

    this._clickCallbacks = []

    this._callClickCallbacks = function (ev, obj, sub, treedom) {
      for (var c in _this._clickCallbacks)
        _this._clickCallbacks[c] && _this._clickCallbacks[c](ev, obj, sub, treedom)
    }

    this._cleanSelected = function (_dom) {
      if (!_dom)
        return
      _dom = _dom.firstElementChild
      while (_dom) {
        if (_dom.getAttribute('skip') != 'true') {
          _this._cleanSelected(_dom)
          _dom.style.backgroundColor = _this.deselectedColor
        }
        _dom = _dom.nextElementSibling
      }
    }

    this._select = function (_dom) {
      _dom.style.backgroundColor = _this.selectedColor
      var data = JSON.parse(_dom.getAttribute('data'))
      data.selected = true
      _dom.setAttribute('data', JSON.stringify(data))
    }

    this._isatomdom = function (_dom) {
      var flag = true
      if (_dom.firstElementChild) {
        _dom = _dom.firstElementChild;
        do {
          if (_dom.getAttribute('skip') != 'true') {
            flag = false
          }
          _dom = _dom.nextElementSibling;
        } while (_dom)
      }
      return flag
    }


    this._getimg = function (_dom) {
      if (_dom.getAttribute('name') != 'eye' && _dom.firstElementChild) {
        _dom = _dom.firstElementChild
        do {
          var result = _this._getimg(_dom)
          if (result)
            return result;
          _dom = _dom.nextElementSibling
        } while (_dom)
      } else if (_dom.getAttribute('name') == 'eye') {
        return _dom
      }
    }

    this._getallchildren = function (_dom, img, pipe, visible, src) {
      if (visible === void 0) {
        var _dv = JSON.parse(_dom.getAttribute('data')).display
        var index = _this._visibleValue.indexOf(_dv) + 1
        if (index >= _this._visibleValue.length)
          index = 0
        visible = _this._visibleValue[index]
        src = _this._eyesrc[index]
      }
      if (!pipe)
        pipe = []
      var org = _dom
      if (!_this._isatomdom(_dom)) {
        if (_dom.tagName.toLowerCase() == 'li') {
          var data = JSON.parse(_dom.getAttribute('data'))
          if (!img)
            img = _this._getimg(_dom)
          img.src = src
          data.display = visible
          _dom.setAttribute('data', JSON.stringify(data))
        }
        _dom = _dom.firstElementChild
        do {
          if (_dom.getAttribute('skip') != 'true') {
            _this._getallchildren(_dom, undefined, pipe, visible, src)
          }
          _dom = _dom.nextElementSibling
        } while (_dom)
      } else {
        var data = JSON.parse(_dom.getAttribute('data'))
        if (!img)
          img = _this._getimg(_dom)
        img.src = src
        data.display = visible
        _dom.setAttribute('data', JSON.stringify(data))
        //console.log(data.id + '/' + id)
        pipe.push({id: data.id, dom: _dom})
      }
      return {children: pipe, visible: visible, src: src}
    }

//21233944
    this.select = function (id, clean) {
      if (clean === void 0)
        clean = true
      if (clean)
        _this._cleanSelected(_this.treedom)
      if (id === void 0)
        return
      var _dom = this._click(id, _this.treedom)
      // console.log(_dom)
      // console.log(_dom.offsetTop)
      // console.log(_dom.offsetParent)
      // console.log(_dom.offsetY)
      if (_dom) {
        var coords = _this._getElementXY(_dom, _this.parentdom)
        var windowh = _this.parentdom.offsetHeight
        var unith = _dom.offsetHeight
        var offsetlow = (coords.y + unith) - (windowh)
        var offsethigh = -coords.y
        console.log(coords.y)
        console.log(offsethigh)
        if (offsethigh > 0) {
          _this.parentdom.scrollTop = (_this.parentdom.scrollTop - offsethigh)
        } else if (offsetlow > 0) {
          _this.parentdom.scrollTop = (_this.parentdom.scrollTop + offsetlow + _this.scrollbarheight)
        }
        // var coords = _this._getElementXY(_dom)
        // var coordsP = _this._getElementXY(_this.parentdom)
        // var windowh = _this.parentdom.offsetHeight
        // var unith = _dom.offsetHeight
        // var offsetlow = (coords.y + unith) - (coordsP.y + windowh)
        // var offsethigh = coordsP.y - coords.y
        // console.log(offsetlow)
        // console.log(offsethigh)
        // if (offsethigh > 0) {
        //     _this.parentdom.scrollTop = (_this.parentdom.scrollTop - offsethigh)
        // } else if (offsetlow > 0) {
        //     _this.parentdom.scrollTop = (_this.parentdom.scrollTop + offsetlow)
        // }
      }
      return _dom
    }

    this.click = function (id, clean) {
      if (clean === void 0)
        clean = true
      var _dom = _this.getdombyid(id)
      if (!_dom)
        return
      if (_dom.onclick) {
        ++_this._skipcount
        _dom.onclick({clean: clean})
      }
    }

    this.getdombyid = function (id, _dom) {
      if (_dom === void 0)
        _dom = _this.treedom
      if (!_this._isatomdom(_dom)) {
        _dom = _dom.firstElementChild
        do {
          if (_dom.getAttribute('skip') != 'true') {
            var result = _this.getdombyid(id, _dom)
            if (result) {
              return result
            }
          }
          _dom = _dom.nextElementSibling
        } while (_dom)
      } else {
        var data = JSON.parse(_dom.getAttribute('data'))
        //console.log(data.id + '/' + id)
        if (data.id == id) {
          return _dom
        }
      }
    }

    // setTimeout(function () {
    //     console.log(_this.select('21233944'))
    //     //console.log(_this.click('20709656', false))
    // }, 1000)

    this._getElementXY = function (e, root) {
      var x = 0, y = 0, _org = e;
      while (e) {
        if (e == root) {
          x += (-e.scrollLeft);
          y += (-e.scrollTop);
          break
        } else if (e != _org) {
          x += (e.offsetLeft - e.scrollLeft);
          y += (e.offsetTop - e.scrollTop);
        } else {
          x += (e.offsetLeft);
          y += (e.offsetTop);
        }

        e = e.offsetParent;
      }
      return {x: x, y: y};
    }

    this._click = function (id, _dom) {
      var org = _dom
      if (!_this._isatomdom(_dom)) {
        _dom = _dom.firstElementChild
        do {
          if (_dom.getAttribute('skip') != 'true') {
            var result = _this._click(id, _dom)
            if (result) {
              if (org.tagName.toLowerCase() == 'ul') {
                org.style.display = ''
              } else {
                var data = JSON.parse(org.getAttribute('data'))

                org.style.backgroundImage = _this.showImage
                data.shrink = false

                org.setAttribute('data', JSON.stringify(data))
              }
              return result
            }
          }
          _dom = _dom.nextElementSibling
        } while (_dom)
      } else {
        var data = JSON.parse(_dom.getAttribute('data'))
        //console.log(data.id + '/' + id)
        if (data.id == id) {
          this._select(_dom)
          return _dom
        }
      }
    }

    this.onclick = function (callback) {
      if (!callback)
        return function () {
        }
      _this._clickCallbacks.push(callback)
      return function () {
        while (_this._clickCallbacks.indexOf(callback) >= 0)
          _this._clickCallbacks.splice(_this._clickCallbacks.indexOf(callback), 1)
      }
    }

    this._skipcount = 0

    bimSurfer.on("selection-changed", function (selected) {
      if (_this._skipcount > 0) {
        --_this._skipcount
        return
      }
      if (selected && selected.length > 0)
        _this.select(selected[0].split(':')[1])
      else
        _this.select()
    });

  }

  return ModelTreeView

}())

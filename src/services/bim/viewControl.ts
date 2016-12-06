import {Utils} from 'emiya-js-utils'

export class viewControl {
  private bimSurfer
  private model
  private modelSelectListener: Array<Function> = []
  private MetaDataRenderer

  constructor(model, bimSurfer, MetaDataRenderer) {
    this.bimSurfer = bimSurfer
    this.model = model
    this.MetaDataRenderer = MetaDataRenderer
    this.bimSurfer.on("selection-changed", (selected) => {

      for (let c in this.modelSelectListener) {
        this.modelSelectListener[c] && this.modelSelectListener[c](selected)
      }
    });
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

}

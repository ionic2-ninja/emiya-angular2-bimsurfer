import {Utils} from 'emiya-js-utils'

export class viewControl {
  private bimSurfer
  private model
  private modelSelectListener: Array<Function> = []

  constructor(model, bimSurfer) {
    this.bimSurfer = bimSurfer
    this.model = Utils.deepCopy(model)
    this.bimSurfer.on("selection-changed", (selected) => {

      for (let c in this.modelSelectListener) {
        this.modelSelectListener[c] && this.modelSelectListener[c](selected)
      }
    });
  }

  public getModel = () => {
    return Utils.deepCopy(this.model)
  }

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

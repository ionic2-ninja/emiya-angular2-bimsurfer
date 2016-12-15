import {Component, AfterViewInit} from '@angular/core';
import {Bim} from '../../services/bim/bim'
import {NavController, NavParams} from 'ionic-angular';
import {Token} from 'emiya-angular2-token'
import {Router} from 'emiya-ionic2-router'
import set = Reflect.set;

@Component({
  templateUrl: 'demo.html'
})
export class DemoPage implements AfterViewInit {

  bust = ''
  title = this.navParams.data.name
  private instance = this.bim.getInstance()
  private ev

  constructor(public navCtrl: NavController, private bim: Bim, private navParams: NavParams, private router: Router) {
    console.log(navParams)
    //window['showMenu']['show']=true
    // setTimeout(()=>{
    //   alert(window.location.host)
    //   alert(window.location.hash)
    // },2000)
  }

  snapshot() {
    //console.log(this.ev.getSnapshot())
    this.ev.downloadSnapshot('0%','0%','50%','50%','').then((ev) => {
      document.getElementById('sp').style.height=ev.height+'px'
      document.getElementById('sp').style.width=ev.width+'px'
      document.getElementById('sp')['src'] = ev.base64
    })

  }

  ngAfterViewInit() {
    //All my document ready code here, which doesn't work

    if (!this.instance) {
      if (Token.has('bimToken'))
        this.bim.connect(decodeURIComponent(Token.get('bimAddress')), decodeURIComponent(Token.get('bimToken')), '').then((instance) => {
          this.instance = instance
          this.instance.loadModel(this.navParams.data.poid, this.navParams.data.roid, 'viewerContainer').then((ev) => {
            this.ev = ev
            this.show(ev)


            setTimeout(() => {
              ev.getAttributes('9371822', (w, b, c) => {
                console.log(122222222233, w + '/' + b)
              })
            }, 2000)

          })

          //alert(1)
        }).catch(() => {
          this.router.pop()
          //alert(0)
        })
      else {
        //alert(2)
        this.router.pop()
      }
    } else {
      //this.instance.showDemo(this.navParams.data.poid, this.navParams.data.roid, '')
      setTimeout(() => {
        this.instance.loadModel(this.navParams.data.poid, this.navParams.data.roid, 'viewerContainer').then((ev) => {
          this.show(ev)
          console.log(ev.getCanvas())
          setTimeout(() => {
            ev.getAttributes('9371822', (w, b, c) => {
              console.log(122222222233, w + '/' + b)
            })
          }, 2000)

        })
      }, 2000)

    }
  }

  public show = (ev) => {
    ev.onModelSelect((ev) => {
      //alert(ev)
    })

    ev.getTree().then((tree) => {
      ev.showModelTree(tree, document.getElementById('treeContainer' + this.bust))

      // this.instance.makeModelView(tree, document.getElementById('treeContainer' + this.bust), (n) => {
      //   //alert(n.id)
      //   ev.setVisibility(['720899:' + n.id], false)
      // })
    })

  }

  ionViewDidLeave = () => {
    //alert()
  }

}

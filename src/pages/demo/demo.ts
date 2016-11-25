import {Component, AfterViewInit} from '@angular/core';
import {Bim} from '../../services/bim/bim'
import {NavController, NavParams} from 'ionic-angular';
import {Token} from 'emiya-angular2-token'
import {Router} from 'emiya-ionic2-router'

@Component({
  templateUrl: 'demo.html'
})
export class DemoPage implements AfterViewInit {

  bust = ''
  title = this.navParams.data.name
  private instance = this.bim.getInstance()

  constructor(public navCtrl: NavController, private bim: Bim, private navParams: NavParams, private router: Router) {
    console.log(navParams)
    //window['showMenu']['show']=true
    // setTimeout(()=>{
    //   alert(window.location.host)
    //   alert(window.location.hash)
    // },2000)
  }

  ngAfterViewInit() {
    //All my document ready code here, which doesn't work
    if (!this.instance) {
      if (Token.has('bimToken'))
        this.bim.connect(decodeURIComponent(Token.get('bimAddress')), decodeURIComponent(Token.get('bimToken')), '').then((instance) => {
          this.instance = instance
          this.instance.showDemo(this.navParams.data.poid, this.navParams.data.roid, '')
          //alert(1)
        }).catch(() => {
           this.router.pop()
          //alert(0)
        })
      else {
        //alert(2)
        this.router.pop()
      }
    } else
      this.instance.showDemo(this.navParams.data.poid, this.navParams.data.roid, '')
  }

  ionViewDidLeave = () => {
    //alert()
  }

}

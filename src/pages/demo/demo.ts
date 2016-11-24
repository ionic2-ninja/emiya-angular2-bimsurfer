import {Component, AfterViewInit} from '@angular/core';
import {Bim} from '../../services/bim/bim'
import {NavController, NavParams} from 'ionic-angular';

@Component({
  templateUrl: 'demo.html'
})
export class DemoPage implements AfterViewInit {

  bust = ''
  title = this.navParams.data.name
  private instance = this.bim.getInstance()

  constructor(public navCtrl: NavController, private bim: Bim, private navParams: NavParams) {
    console.log(navParams)

  }

  ngAfterViewInit() {
    //All my document ready code here, which doesn't work
    this.instance.showDemo(this.navParams.data.poid, this.navParams.data.roid, '')
  }

  ionViewDidLeave = () => {
    //alert()
  }

}

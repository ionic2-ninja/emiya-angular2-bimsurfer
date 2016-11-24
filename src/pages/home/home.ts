import {Component, AfterViewInit} from '@angular/core';
import {Bim} from '../../services/bim/bim'
import {NavController, App} from 'ionic-angular';
import {DemoPage} from '../demo/demo'

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements AfterViewInit {

  projects;
  bust = new Date().getTime();
  isLogging = ''
  private instance
  private username
  private password
  private address
  currentUser = ''
  loginStatus = false


  constructor(public navCtrl: NavController, private bim: Bim, private app: App) {
  }

  login = () => {
    this.isLogging = 'true'
    let address = document.getElementById('address' + this.bust)['value']
    let username = document.getElementById('username' + this.bust)['value']
    let password = document.getElementById('password' + this.bust)['value']
    // document.getElementById('address' + this.bust)['disabled'] = 'true'
    // document.getElementById('username' + this.bust)['disabled'] = 'true'
    // document.getElementById('password' + this.bust)['disabled'] = 'true'
    this.bim.connect(address, username, password).then((instance) => {
      this.instance = instance;
      this.instance.getAllProjects().then((data) => {
        this.projects = data
        this.isLogging = ''
        this.address = address
        this.username = username
        this.password = password
        this.loginStatus = true
        this.currentUser = address + '/' + this.username
      }).catch(() => {
        this.isLogging = ''
        this.address = null
        this.username = null
        this.password = null
        this.projects = null
        this.loginStatus = false
        this.currentUser = ''
      })
    }).catch(() => {
      this.isLogging = ''
      this.address = null
      this.username = null
      this.password = null
      this.projects = null
      this.loginStatus = false
      this.currentUser = ''
    })
  }

  showDemo = (obj) => {
    this.app.getRootNav().push(DemoPage, {poid: obj.oid, roid: obj.lastRevisionId,name:obj.name})
  }

  ngAfterViewInit() {
    //All my document ready code here, which doesn't work
    document.getElementById('address' + this.bust)['value'] = 'http://122.114.175.19:8083/bimserverwar-1.5.61'
    document.getElementById('username' + this.bust)['value'] = '158114520@qq.com'
    document.getElementById('password' + this.bust)['value'] = '123'
    // document.getElementById('address' + this.bust)['value'] = 'http://192.168.102.28:8085/bimserverwar-1.5.61'
    // document.getElementById('username' + this.bust)['value'] = 'admin@admin.com'
    // document.getElementById('password' + this.bust)['value'] = '123'
  }

}

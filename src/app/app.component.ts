import {Component} from '@angular/core';
import {Platform} from 'ionic-angular';
import {StatusBar, Splashscreen} from 'ionic-native';
import {Router} from 'emiya-ionic2-router'
import {Routes} from '../configs/Routes';


@Component({
  template: `<ion-nav></ion-nav>`
})
export class MyApp {

  show = {show: false}

  constructor(platform: Platform, private router: Router) {

    // setTimeout(()=>{
    //   window.location.reload();
    // },2000)

    if(null)
       alert()

    router.load(Routes)
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      Splashscreen.hide();
      if (screen && screen['lockOrientation'])
        screen['lockOrientation']('landscape');
    });
  }
}

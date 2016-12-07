// Generated by typings
// Source: https://raw.githubusercontent.com/aurelia/bootstrapper/111ee4eb1e5df7af39305d190d635df7d93cb7e5/dist/aurelia-bootstrapper.d.ts
declare module 'aurelia-bootstrapper' {
  import 'aurelia-polyfills';
  import {
    PLATFORM
  } from 'aurelia-pal';
  import {
    initialize
  } from 'aurelia-pal-browser';
  
  /**
   * Manually bootstraps an application.
   * @param configure A callback which passes an Aurelia instance to the developer to manually configure and start up the app.
   * @return A Promise that completes when configuration is done.
   */
  export function bootstrap(configure: Function): Promise<void>;
}
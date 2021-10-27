# SellgirlAntTest

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.2.13.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## node 版本

node 10.20.1
npm 6.0.0
ng 11.2.13 //自建的项目引用 ant 之后，项目内的 ng 版本是 11.2.14(这才是完美支持？）
ng-zorro-antd 11.4.1

## 安装

有可能需要先安装 nodejs npm ng(推荐用 nvm 管理 nodejs 和 npm 的版本)

## 安装 crypto-js

npm install crypto-js@3.3.0 #大包
npm install --save @types/crypto-js #ts 版本包

## 安装有向图插件

npm install @swimlane/ngx-graph --save
相关:https://swimlane.github.io/ngx-graph/

## Cron 表达式插件

cnpm install @sbzen/ng-cron --save
https://bzenkosergey.github.io/ng-cron/angular/#/
https://github.com/BzenkoSergey/ng-cron
https://bzenkosergey.github.io/ng-cron/angular/#/doc/localization

## 严格模式

    "strict": true,//
    "noImplicitReturns": true,//
    "noFallthroughCasesInSwitch": true,

## 打包

ng build --prod

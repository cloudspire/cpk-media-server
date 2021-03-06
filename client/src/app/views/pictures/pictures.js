System.register(["aurelia-framework", "../../models/FnTs", "../../models/session"], function (exports_1, context_1) {
    "use strict";
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __moduleName = context_1 && context_1.id;
    var aurelia_framework_1, FnTs_1, session_1, Pictures;
    return {
        setters: [
            function (aurelia_framework_1_1) {
                aurelia_framework_1 = aurelia_framework_1_1;
            },
            function (FnTs_1_1) {
                FnTs_1 = FnTs_1_1;
            },
            function (session_1_1) {
                session_1 = session_1_1;
            }
        ],
        execute: function () {
            Pictures = class Pictures {
                constructor(fn, session) {
                    this.fn = fn;
                    this.session = session;
                    this.aside_links = [
                        { name: 'Picture Files', event: 'togglePictureScreens', data: 'panel' },
                        { name: 'Slideshow', event: 'togglePictureScreens', data: 'slideshow' }
                    ];
                    this.dir = {
                        pictures: { '_files_': [] },
                    };
                    this.visibility = {
                        panel: 'show',
                        slideshow: 'hide'
                    };
                    this.togglePanel = () => {
                        if (this.visibility.panel == 'show') {
                            this.visibility.panel = 'hide';
                            this.visibility.slideshow = 'show';
                        }
                        else {
                            this.visibility.panel = 'show';
                            this.visibility.slideshow = 'hide';
                        }
                    };
                    this.screenResize = (size = null) => {
                    };
                    this.togglePictureScreens = (screen) => {
                        if (this.visibility[screen] != 'show') {
                            this.togglePanel();
                        }
                        this.fn.ea.publish('react', { event_name: 'toggle_aside' });
                    };
                    this.loadPictureFile = (data) => {
                        var test = data;
                    };
                }
                attached() {
                    this.app_events = this.fn.ea.subscribe('react', (event) => {
                        if (this[event.event_name] != null) {
                            this[event.event_name](event.data);
                        }
                    });
                }
                detached() {
                    this.app_events.dispose();
                }
            };
            Pictures = __decorate([
                aurelia_framework_1.inject(FnTs_1.FnTs, session_1.SessionData),
                __metadata("design:paramtypes", [FnTs_1.FnTs, session_1.SessionData])
            ], Pictures);
            exports_1("Pictures", Pictures);
        }
    };
});

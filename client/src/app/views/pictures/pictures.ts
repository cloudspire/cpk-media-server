import {inject} from 'aurelia-framework';
import {FnTs} from '../../models/FnTs';
import {SessionData} from '../../models/session';

@inject(FnTs, SessionData)
export class Pictures {

	app_events: any;
	aside_links: any = [
        {name: 'Picture Files', event: 'togglePictureScreens', data: 'panel'},
	    {name: 'Slideshow', event: 'togglePictureScreens', data: 'slideshow'}
	];
	dir = {
		pictures: {'_files_': []},
	};
	visibility: any = {
		panel: 'show',
		slideshow: 'hide'
	};

	constructor(private fn: FnTs, private session: SessionData) {

	}

	attached() {
		this.app_events = this.fn.ea.subscribe('react', (event: any) => {
			if (this[event.event_name] != null) { this[event.event_name](event.data); }
		});
	}

	detached() {
		this.app_events.dispose();
	}

	togglePanel = () => {
		if (this.visibility.panel == 'show') {
			this.visibility.panel = 'hide';
			this.visibility.slideshow = 'show';
		} else {
			this.visibility.panel = 'show';
			this.visibility.slideshow = 'hide';
		}
	}

	//Event Aggregator Functions
	screenResize = (size: any = null): void => {

	}

	togglePictureScreens = (screen: string) => {
		if (this.visibility[screen] != 'show') {
			this.togglePanel();
		}
		this.fn.ea.publish('react', {event_name: 'toggle_aside'});
	}

	loadPictureFile = (data: any) => {
		var test = data;
	}

}

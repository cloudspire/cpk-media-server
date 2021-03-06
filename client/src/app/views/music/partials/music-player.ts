import {inject} from 'aurelia-framework';
import {FnTs} from '../../../models/FnTs';
import {SessionData} from '../../../models/session';

@inject(FnTs, SessionData)
export class MusicPlayer {

	app_events: any;
	visibility: any = {
		player: 'show',
		list: 'hide'
	};
	now_playing: any;
	track_time: any;
	player: any;
	master_map: any;
	master_list: any;
	song_map: any;
	song_list: any;
	song_index: number;
	shuffle_index: number;
	shuffle_list: any;
	shuffle_history: any;
	shuffle_passes: number = 2;
	shuffle_single: boolean = false;
	continuous: boolean = false;
	shuffle: boolean = false;
	muted: boolean = false;

	constructor (private fn: FnTs, private session: SessionData) {
		this.track_time = {
			total: "0:00",
			current: "0:00"
		}
	}

	attached() {
		this.screenResize();
		this.app_events = this.fn.ea.subscribe('react', (event: any) => {
			if (this[event.event_name] != null) { this[event.event_name](event.data); }
		});
		this.initWaveSurfer()
			.then(this.getMusicList)
			.then(this.generateBindableList)
			.then(this.loadMasterData)
			.then(this.loadPlayer);
		//force update of songe list on server
		this.getSongMap();
	}

	detached() {
		this.app_events.dispose();
		if (this.player != null) {
			this.player.destroy();
		}
	}

	toggleListView = () => {
		if (this.visibility.player == 'show') {
			this.visibility.player = 'hide';
			this.visibility.list = 'show';
			this.fn.ea.publish('react', { event_name: 'resizeCategoryLists' })
			$('#btn-list-view').addClass('list-view-selected');
		} else {
			this.visibility.player = 'show';
			this.visibility.list = 'hide';
			$('#btn-list-view').removeClass('list-view-selected');
		}
	}

	initWaveSurfer(): Promise<any> {
		//start a promise chain
		//only runs once to avoid duplication
		return new Promise((res) => {
			res({
				player: WaveSurfer.create({
					container: '#waveform',
		  			waveColor: 'red',
		  			progressColor: 'purple',
		  			height: 50,
		  			hideScrollbar: true,
		  			barWidth: 2
				})
			});
		});
	}

	getMusicList = (data: any): Promise<any> => {
		return new Promise((res) => {
			var req = {
				url: '/music/music_list'
			}
			var callback = (list: any) => {
				data.map = list.data;
				res(data);
			}
			this.fn.fn_Ajax(req)
				.then(callback);
		});
	}

	generateBindableList = (data: any) => {
		var keys = Object.keys(data.map);
		data.list = keys.map((val) => {
			return data.map[val];
		});
		return data;
	}

	loadMasterData = (data: any) => {
		this.player = data.player;
		this.song_index = 0;
		this.master_map = data.map;
		this.master_list = data.list;
		this.player.on("ready", () => {
			//$("#waveform_loader").hide();
			this.track_time.current = "0:00";
			this.track_time.total = this.secondsToMinutes(this.player.getDuration())
			if (this.continuous) {
				this.play();
			}
		});
		this.player.on("finish", () => {
			if (this.continuous) {
				this.nextSong();
			} else {
				$("#play-btn").removeClass('icon_selected');
			}
		});
		this.player.on("audioprocess", () => {
			var time = this.player.backend.getCurrentTime();
			if (time > 0) {
				this.track_time.current = this.secondsToMinutes(time);
			}
		});
		var slider = <any>document.querySelector('#slider');
		slider.oninput = () => {
		  	var vol = Number(slider.value) / 100;
		  	this.player.setVolume(vol);
		};
		this.player.setVolume(.25);
		return data;
	}

	getSongMap = (): void => {
		var req = {
			url: '/music/song_map'
		}
		this.fn.fn_Ajax(req)
			.then((list) => { this.song_map = list.data; });
	}

	loadPlayer = (data: any, track: string = null) => {
		this.song_map = data.map;
		var start = track == null ? data.list[0] : track;
		this.loadTrackList(data.list, start);
		this.resizeTrackList();
	}

	loadTrackList = (list: any, track: any) => {
		this.song_list = list;
		this.changeTrack(track);
	}

	resizeTrackList = () => {
		setTimeout(() => {
			var outer = $('.panel-body[panel-type="music-panel"]').height();
			var inner = $('#music-panel').height();
			var height = outer - inner - 40;
			height = Math.max(height, 150);
			$('.loaded_songs').css('max-height', height + "px");
		}, 50);
	}

	clickPlayTrack = (index: number, track: any) => {
		this.song_index = index;
		this.changeTrack(track);
	}

	changeTrack = (track: any) => {
		this.player.load(track.path);
		this.now_playing = track;
	}

	play = () => {
		this.player.play();
		$("#pause-btn").removeClass('icon_selected');
		$("#play-btn").addClass('icon_selected');
	}

	pause = () => {
		this.player.pause();
		$("#pause-btn").addClass('icon_selected');
		$("#play-btn").removeClass('icon_selected');
	}

	prevSong = () => {
		if (this.song_index > 0) {
			this.song_index--;
			this.changeTrack(this.song_list[this.song_index]);
		}
	}

	nextSong = () => {
		if (this.shuffle) {
			this.randomSong();
		} else {
			if (this.song_index < this.song_list.length - 1) {
				this.song_index++;
				this.changeTrack(this.song_list[this.song_index]);
			}
		}
	}

	randomSong = () => {
		if (this.shuffle_list.length == this.shuffle_index) {
			this.shuffle_index = 0;
			this.generateShuffle();
		}
		var track = this.shuffle_list[this.shuffle_index];
		if (track.artist == this.now_playing.artist && !this.shuffle_single) {
			this.shuffle_index++;
			this.randomSong();
		} else {
			this.changeTrack(track);
			this.shuffle_history.push(track.path);
			this.shuffle_index++;
		}
	}

	toggleContinuous = () => {
		if (this.continuous) {
			this.continuous = false;
			$("#continue-btn").removeClass('icon_selected');
		} else {
			this.continuous = true;
			$("#continue-btn").addClass('icon_selected');
		}
	}

	toggleShuffle = () => {
		if (this.shuffle) {
			this.shuffle = false;
			$("#shuffle-btn").removeClass('icon_selected');
		} else {
			if (this.generateShuffle()) {
				this.shuffle = true;
				$("#shuffle-btn").addClass('icon_selected');
			}
		}
	}

	toggleMute = () => {
		if (this.muted) {
			$("#vol-btn").removeClass('fa-volume-off');
			$("#vol-btn").addClass('fa-volume-up');
			$("#vol-btn").addClass('icon_selected');
			this.muted = false;
		} else {
			$("#vol-btn").removeClass('fa-volume-up');
			$("#vol-btn").addClass('fa-volume-off');
			$("#vol-btn").removeClass('icon_selected');
			this.muted = true;
		}
		this.player.toggleMute();
	}

	generateShuffle = (): boolean => {
		this.shuffle_single = false;
		var data = this.prelimShuffle();
		var list = data.obj;
		for (var i = 0; i < this.shuffle_passes; i++) {
			list = this.randomShuffle(list);
		}
	    this.shuffle_history = [];
	    this.shuffle_index = 0;
		this.shuffle_list = list;
	    if (Object.keys(data.dist).length <= 1) {
	    	this.shuffle_single = true;
	    }
		return true;
	}

	prelimShuffle = (): any => {
		var keys = Object.keys(this.song_map);
		var count = 0, a = [], tmp;
		var dist = {};
		while (keys.length > 0) {
			if (count % 2 == 0) {
				tmp = keys.shift();
			} else {
				tmp = keys.pop();
			}
			a.push(this.song_map[tmp]);
			if (dist[this.song_map[tmp].artist] == null) {
				dist[this.song_map[tmp].artist] = 1;
			} else {
				dist[this.song_map[tmp].artist]++;
			}
			count++;
		}
		return {obj: a, dist: dist};
	}

	randomShuffle = (a: any): any => {
		var j, x, i;
	    for (i = a.length; i; i--) {
	        j = Math.floor(Math.random() * i);
	        x = a[i - 1];
	        a[i - 1] = a[j];
	        a[j] = x;
	    }
		return a;
	}

	secondsToMinutes = (time: any) => {
		// Minutes and seconds
		var mins = ~~(time / 60);
		var secs = time % 60;
		// Hours, minutes and seconds
		var hrs = ~~(time / 3600);
		var mins = ~~((time % 3600) / 60);
		var secs = time % 60;
		// Output like "1:01" or "4:03:59" or "123:03:59"
		var ret = "";
		if (hrs > 0) {
		    ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
		}
		ret += "" + mins + ":" + (secs < 10 ? "0" : "");
		ret += "" + secs;
		return ret.split('.')[0];
	}

	//Event Aggregator Functions
	screenResize = (size: any = null): void => {
		if (this.player != null) {
			this.player.empty();
			this.player.drawBuffer();
		}
		var height, width;
		if (size == null) { height = $(window).height(); width = $(window).width(); }
		else { height = size.height; width = size.width; }
		var offset = width > 768 ? 150 : 190;
		height = height - offset;
		if (width > 767) $('.panel-body[panel-type="music-panel"]').css('height', height + 'px');
		else {
			$('.panel-body[panel-type="music-panel"]').css('height', '300px');
			$('.panel-body[panel-type="files-panel"]').closest('.panel').css('margin-left', '5px');
		}
		this.resizeTrackList();
	}

	loadMusicFile = (data: any) => {
		if (this.visibility.player != "show") { this.toggleListView(); }
		var path_prefix = data.path.replace('/music/', 'content/tracks/')
		var list = data.all_files.map((val) => {
			return this.master_map[path_prefix + val];
		});
		var map = {}, index;
		for (var i = 0; i < data.all_files.length; i++) {
			map[path_prefix + data.all_files[i]] = this.master_map[path_prefix + data.all_files[i]];
		}
		for (var i = 0; i < list.length; i++) {
			index = i;
			if (list[i].path == data.selected.replace('/music/', 'content/tracks/')) {
				break;
			}
		}
		this.song_index = index;
		var selected = map[data.selected.replace('/music/', 'content/tracks/')];
		this.loadPlayer({map: map, list: list}, selected);
		if (this.shuffle) {
			this.generateShuffle();
		}
	}

	loadPlayerFromList = (data: any) => {
		if (this.visibility.player != "show") { this.toggleListView(); }
		var list = data.all_files.map((val) => {
			return this.master_map[val];
		});
		var map = {}, index;
		for (var i = 0; i < data.all_files.length; i++) {
			map[data.all_files[i]] = this.master_map[data.all_files[i]];
		}
		for (var i = 0; i < list.length; i++) {
			index = i;
			if (list[i].path == data.selected.replace('/music/', 'content/tracks/')) {
				break;
			}
		}
		this.song_index = index;
		var selected = map[data.selected.replace('/music/', 'content/tracks/')];
		this.loadPlayer({map: map, list: list}, selected);
		if (this.shuffle) {
			this.generateShuffle();
		}
	}

	loadAllTracks = () => {
		this.shuffle_index = 0;
		this.song_index = -1;
		var data = this.generateBindableList({map: this.master_map});
		this.song_map = data.map;
		this.song_list = data.list;
		this.fn.ea.publish('react', {event_name: 'toggle_aside'});
		if (this.shuffle) {
			this.generateShuffle();
		}
	}

	receiveCommand = (data: any) => {
		switch(data.action) {
			case "play":
				this.play();
				break;
			case "pause":
				this.pause();
				break;
			case "next":
				this.nextSong();
				break;
			case "prev":
				this.prevSong();
				break;
		}
	}

}

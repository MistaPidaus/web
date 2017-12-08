import {Directive, ElementRef, OnInit, Input} from '@angular/core';
import {Track} from '../../tracks/models/track.model';
import {Tracks} from '../../tracks/collections/tracks.collection';
import {PlayQueue} from '../../player/collections/play-queue';
import {PlayQueueItem} from '../../player/models/play-queue-item';

@Directive({
  selector: '[appPlayTrackOn]'
})
export class PlayTrackOnEventDirective implements OnInit {
  @Input()
  appPlayTrackOn: any;

  @Input()
  track: Track;

  @Input()
  events: Array<String>;

  @Input()
  tracks: Tracks<Track>;

  constructor(private el: ElementRef) {
  }

  private playQueue: PlayQueue<PlayQueueItem> = PlayQueue.getInstance();

  private registerListener(event: String) {
    this.el.nativeElement.addEventListener(event, () => {
      if (this.isPlaying()) {
        this.pause();
      } else {
        this.play();
      }
    });
  }

  isPlaying(): boolean {
    const playingItem = this.playQueue.getPlayingItem();
    return (playingItem && playingItem.track.id === this.track.id);
  }

  play(): void {
    const existingPlayQueueItem = this.playQueue.get(this.track.id);
    if (existingPlayQueueItem) {
      existingPlayQueueItem.play();
    } else {
      this.playQueue.filter((model) => {
        return !model.isQueued();
      }).forEach((model) => {
        this.playQueue.remove(model);
      });

      if (this.tracks) {
        this.tracks.forEach((track: Track, index) => {
          if (!this.playQueue.get(track)) {
            this.playQueue.add({track: track});
          }
        });
      }

      const playQueueItem: PlayQueueItem = this.playQueue.add({track: this.track});
      playQueueItem.play();
    }
  }

  pause(): void {
    if (this.isPlaying()) {
      PlayQueue.getInstance().getPlayingItem().pause();
    }
  }

  ngOnInit(): void {
    this.el.nativeElement.style.cursor = 'pointer';
    if (this.appPlayTrackOn) {
      this.registerListener(this.appPlayTrackOn);
    } else if (this.events) {
      this.events.forEach((ev: String) => {
        this.registerListener(ev);
      });
    }
  }
}

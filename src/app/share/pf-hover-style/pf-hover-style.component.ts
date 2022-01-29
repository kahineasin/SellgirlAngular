import {
  Component,
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnInit,
} from "@angular/core";

@Directive({
  selector: "[pfHover]",
})
export class PfHoverComponent implements OnInit {
  @Input() hoverStyle: Object = {};
  normalStyle: Object = {};
  constructor(public el: ElementRef) {}

  ngOnInit(): void {}
  @HostListener("mouseenter", ["$event"]) onMouseEnter(event: MouseEvent) {
    const me = this;
    event.preventDefault();
    //console.info(me.hoverStyle);

    // for (let key of keys(me.hoverStyle)) {
    //   console.log(key); // 'a', 'b', 'c'
    // }
    for (let j in me.hoverStyle) {
      if (me.hoverStyle.hasOwnProperty(j)) {
        var fn = me.hoverStyle[j];
        me.normalStyle[j] = me.el.nativeElement.style[j];
        me.el.nativeElement.style[j] = fn;
      }
    }
  }
  @HostListener("mouseleave", ["$event"]) onMouseLeave(event: MouseEvent) {
    const me = this;
    event.preventDefault();
    //console.info(me.hoverStyle);
    for (let j in me.normalStyle) {
      if (me.normalStyle.hasOwnProperty(j)) {
        var fn = me.normalStyle[j];
        me.el.nativeElement.style[j] = fn;
      }
    }
  }
}

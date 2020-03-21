import { eventBus } from "./eventBus";

const mouseover = function(ref) {
  let refCpnt = this.$refs[ref];
  if (refCpnt && refCpnt.show) return refCpnt.show();
};
const mouseleave = function(ref) {
  let refCpnt = this.$refs[ref];
  if (refCpnt && refCpnt.hide) return refCpnt.hide();
};
const mouseclick = function(ref, event) {
  if (event) event.stopPropagation();
  let refCpnt = this.$refs[ref];
  if (refCpnt) {
    if (refCpnt.visible && refCpnt.hide) return refCpnt.hide();
    if (!refCpnt.visible && refCpnt.show) {
      if (event) eventBus.$emit("reset-visible-component");
      return refCpnt.show();
    }
  } else {
    let targetEle = document.getElementById(ref);
    if (!targetEle) return;
    console.log(targetEle);
  }
};

const hide = function(ref) {
  let refCpnt = this.$refs[ref];
  if (refCpnt && refCpnt.visible && refCpnt.hide) return refCpnt.hide();
};

const show = function(ref) {
  let refCpnt = this.$refs[ref];
  if (refCpnt && !refCpnt.visible && refCpnt.show) return refCpnt.show();
};

const stopPropagation = function() {
  console.log("stop");
};

export { mouseover, mouseleave, mouseclick, hide, show, stopPropagation };

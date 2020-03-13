<template>
  <div class="wrapper">
    <h1>Welcome</h1>
  </div>
</template>

<script>
import setProfile from "@/components/setProfile";
export default {
  components: {
    setProfile
  },
  data() {
    return {
      show: false
    };
  },
  methods: {}
};
</script>

<style lang="scss" scoped>
.wrapper {
  width: 60%;
  height: 60%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  position: relative;
}
.second {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
  height: 100%;
  position: absolute;
  background-color: white;
  top: 0;
  left: 0;
}
// before enter and after leave
.show-enter,
.show-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

// after enter and before leave
.show-leave,
.show-enter-to {
  opacity: 1;
  transform: translateX(0);
}
.show-enter-active,
.show-leave-active {
  transition: all 0.35s;
}
</style>

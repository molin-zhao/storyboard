<template>
  <div class="mainboard">
    <div class="mainboard-title">
      <div class="mainboard-title-name">
        <span style="font-size: 40px;">{{ $t("TEAM") }}</span>
      </div>
    </div>
    <div class="mainboard-body">
      <vue-scroll>
        <div class="team-selection">
          <span class="form-label-bold">{{ $t("CHOOSE_TEAM") }}</span>
          <select
            v-model="selectedTeam"
            class="custom-select"
            style="margin-top: 5px; height: 30px; width: 260px; border-radius: 10px; font-size: 14px"
          >
            <option
              :value="index"
              v-for="(team, index) in teams"
              :key="index"
              >{{ team["name"] }}</option
            >
          </select>
        </div>
        <div class="team-member">
          <div class="members">
            <div
              class="member"
              v-for="(user, index) in computedTeamMembers"
              :key="index"
            >
              <user-card :item="user" :is-creator="computedTeamCreator(user)" />
            </div>
          </div>
        </div>
      </vue-scroll>
    </div>
  </div>
</template>

<script>
import vueScroll from "vuescroll";
import userCard from "@/components/userCard";
import { mapState } from "vuex";
export default {
  components: {
    vueScroll,
    userCard
  },
  computed: {
    ...mapState("team", ["teams"]),
    ...mapState("user", ["id", "token"]),
    computedTeamMembers() {
      const { teams, selectedTeam } = this;
      return teams[selectedTeam]["members"];
    },
    computedTeamCreator() {
      return function(item) {
        const { teams, selectedTeam } = this;
        return teams[selectedTeam]["creator"]["_id"] === item["_id"];
      };
    }
  },
  data() {
    return {
      selectedTeam: 0
    };
  }
};
</script>

<style lang="scss" scoped>
.team-selection {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  width: 98%;
  height: 100px;
  margin-left: 2%;
}
.team-member {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  width: 98%;
  margin-left: 2%;
  .members {
    width: 50%;
    min-width: 720px;
    border-radius: 10px;
    border: 1px gainsboro solid;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    flex-wrap: wrap;
    .member {
      width: 25%;
      min-width: 180px;
      height: 100px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
  }
}
</style>

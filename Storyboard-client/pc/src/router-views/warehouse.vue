<template>
  <div class="mainboard">
    <div class="mainboard-title">
      <div class="mainboard-title-name">
        <span style="font-size: 40px">{{ $t("WAREHOUSE") }}</span>
      </div>
    </div>
    <div class="mainboard-info"></div>
    <div class="mainboard-body">
      <div class="mainboard-left">
        <a
          style="cursor: pointer"
          class="text-primary"
          @click.stop="createWarehouse"
          >{{ $t("CREATE_WAREHOUSE") }}</a
        >
        <a class="text-primary"></a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    createWarehouse() {
      $("#modal-create-warehouse").modal("show");
    }
  }
};
</script>

<style lang="scss" scoped></style>

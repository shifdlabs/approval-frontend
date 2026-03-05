<script setup lang="ts">
const props = defineProps<Props>()
interface Props {
  statistics: any[];
}

const logisticInterface = ref([
  { icon: 'tabler-clipboard-check', color: 'primary', title: 'Authorization', isHover: false },
  { icon: 'tabler-mail-up', color: 'warning', title: 'In Progress', isHover: false },
  { icon: 'tabler-mail-x', color: 'error', title: 'Rejected', isHover: false },
  { icon: 'tabler-mail-check', color: 'info', title: 'Completed', isHover: false },
])
</script>

<template>
    <VRow class="mt-1">
      <VCol
        v-for="(data, index) in logisticInterface"
        :key="index"
        cols="12"
        md="3"
        sm="6"
      >
        <div>
          <VCard
            class="logistics-card-statistics cursor-pointer"
            :style="data.isHover ? `border-block-end-color: rgb(var(--v-theme-${data.color}))` : `border-block-end-color: rgba(var(--v-theme-${data.color}),0.38)`"
            @mouseenter="data.isHover = true"
            @mouseleave="data.isHover = false"
          >
            <VCardText>
              <div class="d-flex align-center gap-x-4 mb-1">
                <VAvatar
                  variant="tonal"
                  :color="data.color"
                  rounded
                  style="width: 80px; height: 78px;"
                >
                  <VIcon
                    :icon="data.icon"
                    size="40"
                  />
                </VAvatar>
                <h4 class="total">
                  {{ statistics[index] }}
                </h4>
              </div>
              <div class="title">
                {{ data.title }}
              </div>
            </VCardText>
          </VCard>
        </div>
      </VCol>
    </VRow>
  </template>
  
  <style lang="scss" scoped>
  @use "@core/scss/base/mixins" as mixins;
  
  .logistics-card-statistics {
    border-block-end-style: solid;
    border-block-end-width: 5px;
  
    &:hover {
      border-block-end-width: 5px;
      margin-block-end: -1px;
  
      @include mixins.elevation(8);
  
      transition: all 0.1s ease-out;
    }
  }
  
  .skin--bordered {
    .logistics-card-statistics {
      border-block-end-width: 2px;
  
      &:hover {
        border-block-end-width: 3px;
        margin-block-end: -2px;
        transition: all 0.1s ease-out;
      }
    }
  }

  .title {
    font-size: 20px;
    font-weight: lighter;
    margin-top: 10px;
    color: text-primary;
  }

  .total {
    font-size: 45px;
    font-weight: lighter;
    color: text-primary;
  }
  </style>
  
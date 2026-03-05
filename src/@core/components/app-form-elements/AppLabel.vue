<script lang="ts" setup>
defineOptions({
  name: 'AppLabel',
  inheritAttrs: false,
})

// const { class: _class, label, variant: _, ...restAttrs } = useAttrs()

const elementId = computed (() => {
  const attrs = useAttrs()
  const _elementIdToken = attrs.id
  const _id = useId()

  return _elementIdToken ? `app-label-${_elementIdToken}` : _id
})

const label = computed(() => useAttrs().label as string | undefined)
const value = computed(() => useAttrs().label as string | undefined)
</script>

<template>
  <div
    class="app-text-field flex-grow-1"
    :class="$attrs.class"
  >
    <VLabel
      class="mb-1 text-body-2"
      :text="label"
    />
    <VLabel
      class="mb-1 text-body-2"
      :text="value"
    />
  </div>
</template>

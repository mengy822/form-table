<template>
  <div class="demo-date-picker">
    <div class="block">
      <el-date-picker
        v-model="value"
        @change="update"
        type="daterange"
        range-separator="To"
        start-placeholder="Start date"
        end-placeholder="End date"
        size="default"
      />
      <!-- <el-date-picker
        v-model="model"
        type="daterange"
        @change="update1"
        range-separator="To"
        start-placeholder="Start date"
        end-placeholder="End date"
        size="default"
      /> -->
    </div>
  </div>
</template>

<script lang="ts" setup>

import { ref, watch } from 'vue';

// const model = defineModel()
const props=defineProps(['modelValue'])
const value=ref(props.modelValue)
watch(()=>props.modelValue,(e)=>{
  console.log(e,'props.value')
},{
  immediate:true
})
const emits=defineEmits(['update:modelValue'])
const update=(e)=>{
  console.log(e,'update:modelValue')
  emits('update:modelValue',e)
}
const update1=(e)=>{
  console.log(e,'update:modelValue1')
}
</script>

<style scoped>

</style>

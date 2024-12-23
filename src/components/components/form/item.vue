<template>
    <el-form-item :ref="(el)=>dynamicCreateRef(el,item.prop)" :label="item.label" :prop="item.prop">
          <template #label>
            <slot :name="`label_${item.prop}`"></slot>
          </template>
          <template #error>
            <slot :name="`error_${item.prop}`"></slot>
          </template>

          <template #default>
            <slot :name="item.prop" :data="dataFinal">
                
            </slot>
          </template>
        </el-form-item>
</template>

<script setup lang='ts' name='FormItem'>

</script>

<style scope lang='scss'>

</style>

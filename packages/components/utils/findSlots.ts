/**
 * 从自己开始往上查找指定的插槽
 * @param slotName 插槽名称
 */
function findParentSlot ($self:object, slotName:string="default") {
    // console.log("往上找节点的插槽", $self.$slots)
    // const slot = $self.$slots[slotName]
    // const parent = $self.$parent
    // return slot || (parent ? findParentSlot(parent, slotName) : null)
    const slots = $self.slots || {}
    const slot = slots[slotName]
    const parent = $self.$parent
    return slot || (parent ? findParentSlot(parent, slotName) : null)
}

/**
 * 生成插槽
 * @param slotName 插槽名称
 * @param scope 插槽作用域
 * @returns
 */
function generateColumnSlot (slotName:string, scope:object) {
    const tempSlot = findParentSlot(this, slotName)
    return tempSlot ? tempSlot(scope) : undefined
}

export {
  findParentSlot,generateColumnSlot
}

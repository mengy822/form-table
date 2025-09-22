import MyTable from './components/Table'
// import MyTabelV2 from './components/TableV2'
import MyForm from './components/Form'
import MyEdit from './components/Edit'
import MyDetail from './components/Detail/index'
import MyDialog from './components/Dialog/index'

export type {
  checkboxInnerType,
  dateInnerType,
  inputInnerType,
  radioInnerType,
  selectInnerType,
  switchInnerType,
} from './components/components/form/types'

const coms = [MyTable, MyForm, MyEdit, MyDetail, MyDialog]; // 将来如果有其它组件,都可以写到这个数组里

// 批量组件注册
const install = function (Vue: { component: (arg0: any, arg1: any) => void }) {
  coms.forEach((com) => {
    Vue.component(com.name, com);
  });
};

export default install;
export { MyTable, MyForm, MyEdit, MyDetail, MyDialog }; //实现按需引入*
export type MyTableInstance = InstanceType<typeof MyTable>
export type MyFormInstance = InstanceType<typeof MyForm>
export type MyEditInstance = InstanceType<typeof MyEdit>
export type MyDetailInstance = InstanceType<typeof MyDetail>
export type MyDialogInstance = InstanceType<typeof MyDialog>

// export { checkboxInnerType,
//   dateInnerType,
//   inputInnerType,
//   radioInnerType,
//   selectInnerType,
//   switchInnerType, }; //实现按需引入*
// export checkboxInnerType

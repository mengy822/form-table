import MyTabel from './components/Table'
import MyForm from './components/Form'
import MyEdit from './components/Edit'
import MyDetail from './components/Detail/index'

export type {
  checkboxInnerType,
  dateInnerType,
  inputInnerType,
  radioInnerType,
  selectInnerType,
  switchInnerType,
} from './components/components/form/types'

const coms = [MyTabel,MyForm,MyEdit,MyDetail]; // 将来如果有其它组件,都可以写到这个数组里

// 批量组件注册
const install = function (Vue: { component: (arg0: any, arg1: any) => void }) {
  coms.forEach((com) => {
    Vue.component(com.name, com);
  });
};

export default install;
export { MyTabel,MyForm,MyEdit,MyDetail }; //实现按需引入*
// export { checkboxInnerType,
//   dateInnerType,
//   inputInnerType,
//   radioInnerType,
//   selectInnerType,
//   switchInnerType, }; //实现按需引入*
// export checkboxInnerType

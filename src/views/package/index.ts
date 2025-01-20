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

export { MyTabel,MyForm,MyEdit,MyDetail }; //实现按需引入*
// export { checkboxInnerType,
//   dateInnerType,
//   inputInnerType,
//   radioInnerType,
//   selectInnerType,
//   switchInnerType, }; //实现按需引入*
// export checkboxInnerType

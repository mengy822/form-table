import { defineComponent, useSlots, computed, ref, resolveComponent, createBlock, openBlock, withCtx, createVNode, mergeProps, createSlots, renderList, unref, renderSlot, normalizeProps, guardReactiveProps, createElementBlock, createCommentVNode, Fragment, createTextVNode, toDisplayString, nextTick, onUnmounted, onMounted, watch, withDirectives, createElementVNode, normalizeClass, vShow, useCssVars, normalizeStyle, h, getCurrentInstance, resolveDirective, useTemplateRef, useAttrs } from "vue";
import { ElCheckboxGroup, ElCheckbox, ElCheckboxButton, ElDatePicker, ElTableColumn, ElMessageBox, ElMessage } from "element-plus";
const isMobile = () => {
  const flag = navigator.userAgent.match(
    /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
  );
  return (flag && flag.length > 0) ?? false;
};
const getName = (name) => {
  name = String(name);
  return name.indexOf("_") > -1 ? name.split("_")[0] ?? name : name;
};
function deepClone(target) {
  const map = /* @__PURE__ */ new WeakMap();
  function isObject(target2) {
    return typeof target2 === "object" && target2 || typeof target2 === "function";
  }
  function clone(data) {
    if (!isObject(data)) {
      return data;
    }
    if ([Date, RegExp].includes(data.constructor)) {
      return new data.constructor(data);
    }
    if (typeof data === "function") {
      return new Function("return " + data.toString())();
    }
    if (Array.isArray(data)) {
      const result2 = [];
      map.set(data, result2);
      data.forEach((val, index2) => {
        if (isObject(val)) {
          result2[index2] = clone(val);
        } else {
          result2[index2] = val;
        }
      });
      return result2;
    }
    const exist = map.get(data);
    if (exist) {
      return exist;
    }
    if (data instanceof Map) {
      const result2 = /* @__PURE__ */ new Map();
      map.set(data, result2);
      data.forEach((val, key) => {
        if (isObject(val)) {
          result2.set(key, clone(val));
        } else {
          result2.set(key, val);
        }
      });
      return result2;
    }
    if (data instanceof Set) {
      const result2 = /* @__PURE__ */ new Set();
      map.set(data, result2);
      data.forEach((val) => {
        if (isObject(val)) {
          result2.add(clone(val));
        } else {
          result2.add(val);
        }
      });
      return result2;
    }
    const keys = Reflect.ownKeys(data);
    const allDesc = Object.getOwnPropertyDescriptors(data);
    const result = Object.create(Object.getPrototypeOf(data), allDesc);
    map.set(data, result);
    keys.forEach((key) => {
      const val = data[key];
      if (isObject(val)) {
        result[key] = clone(val);
      } else {
        result[key] = val;
      }
    });
    return result;
  }
  return clone(target);
}
const getComputedStyle = (dom) => {
  if (typeof dom === "string") {
    let lsDom = document.querySelector(dom);
    if (lsDom)
      dom = lsDom;
    else {
      throw new Error("dom不存在");
    }
  }
  return window.getComputedStyle(dom);
};
const getDomComputed = (dom, key) => {
  const size = {
    height: 0,
    width: 0
  };
  if (typeof dom === "string") {
    dom = getComputedStyle(dom);
  }
  if (dom["boxSizing"] === "content-box") {
    const { marginLeft, marginRight, paddingLeft, paddingRight, width, borderLeftWidth, borderRightWidth } = dom;
    const { marginTop, marginBottom, paddingTop, paddingBottom, height, borderTopWidth, borderBottomWidth } = dom;
    size.width = [marginLeft, marginRight, paddingLeft, paddingRight, width, borderLeftWidth, borderRightWidth].map((item) => parseFloat(item ?? 0)).reduce((a, b) => a + b);
    size.height = [marginTop, marginBottom, paddingTop, paddingBottom, height, borderTopWidth, borderBottomWidth].map((item) => parseFloat(item ?? 0)).reduce((a, b) => a + b);
  } else if (dom["boxSizing"] === "border-box") {
    const { marginLeft, marginRight, width, borderLeftWidth, borderRightWidth } = dom;
    const { marginTop, marginBottom, height, borderTopWidth, borderBottomWidth } = dom;
    size.width = [marginLeft, marginRight, width, borderLeftWidth, borderRightWidth].map((item) => parseFloat(item ?? 0)).reduce((a, b) => a + b);
    size.height = [marginTop, marginBottom, height, borderTopWidth, borderBottomWidth].map((item) => parseFloat(item ?? 0)).reduce((a, b) => a + b);
  }
  return size[key];
};
const intersectionHash = (arr1 = [], arr2 = []) => {
  const hash = {};
  const result = [];
  for (let i = 0; i < arr1.length; i++) {
    hash[arr1[i]] = true;
  }
  for (let i = 0; i < arr2.length; i++) {
    if (hash[arr2[i]]) {
      result.push(arr2[i]);
      hash[arr2[i]] = false;
    }
  }
  return result;
};
const getRemainingHeight = (className, excludeClassName = []) => {
  const dom = document.querySelector(className);
  if (!dom) {
    console.error(`元素 ${className} 未找到`);
    return { height: 0, dom: [] };
  }
  const totalHeight = dom.offsetHeight;
  const children = dom.children;
  let usedHeight = 0;
  const doms = [];
  excludeClassName.push(".el-overlay");
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (intersectionHash(
      child == null ? void 0 : child.classList,
      excludeClassName.map((item) => item.replace(".", ""))
    ).length > 0) {
      continue;
    }
    doms.push(child);
    const style = getComputedStyle(child);
    const boxSizing = style.boxSizing;
    const marginTop = parseFloat(style.marginTop) || 0;
    const marginBottom = parseFloat(style.marginBottom) || 0;
    let childHeight = 0;
    if (boxSizing === "content-box") {
      parseFloat(style.paddingTop) || 0;
      parseFloat(style.paddingBottom) || 0;
      parseFloat(style.borderTopWidth) || 0;
      parseFloat(style.borderBottomWidth) || 0;
      childHeight = child.offsetHeight + marginTop + marginBottom;
    } else {
      parseFloat(style.borderTopWidth) || 0;
      parseFloat(style.borderBottomWidth) || 0;
      childHeight = child.offsetHeight + marginTop + marginBottom;
    }
    usedHeight += childHeight;
  }
  const remainingHeight = totalHeight - usedHeight;
  return { height: Math.max(0, remainingHeight), dom: doms };
};
var zhCn = {
  name: "zh-cn",
  el: {
    breadcrumb: {
      label: "面包屑"
    },
    colorpicker: {
      confirm: "确定",
      clear: "清空",
      defaultLabel: "颜色选择器",
      description: "当前颜色 {color}，按 Enter 键选择新颜色",
      alphaLabel: "选择透明度的值"
    },
    datepicker: {
      now: "此刻",
      today: "今天",
      cancel: "取消",
      clear: "清空",
      confirm: "确定",
      dateTablePrompt: "使用方向键与 Enter 键可选择日期",
      monthTablePrompt: "使用方向键与 Enter 键可选择月份",
      yearTablePrompt: "使用方向键与 Enter 键可选择年份",
      selectedDate: "已选日期",
      selectDate: "选择日期",
      selectTime: "选择时间",
      startDate: "开始日期",
      startTime: "开始时间",
      endDate: "结束日期",
      endTime: "结束时间",
      prevYear: "前一年",
      nextYear: "后一年",
      prevMonth: "上个月",
      nextMonth: "下个月",
      year: "年",
      month1: "1 月",
      month2: "2 月",
      month3: "3 月",
      month4: "4 月",
      month5: "5 月",
      month6: "6 月",
      month7: "7 月",
      month8: "8 月",
      month9: "9 月",
      month10: "10 月",
      month11: "11 月",
      month12: "12 月",
      weeks: {
        sun: "日",
        mon: "一",
        tue: "二",
        wed: "三",
        thu: "四",
        fri: "五",
        sat: "六"
      },
      weeksFull: {
        sun: "星期日",
        mon: "星期一",
        tue: "星期二",
        wed: "星期三",
        thu: "星期四",
        fri: "星期五",
        sat: "星期六"
      },
      months: {
        jan: "一月",
        feb: "二月",
        mar: "三月",
        apr: "四月",
        may: "五月",
        jun: "六月",
        jul: "七月",
        aug: "八月",
        sep: "九月",
        oct: "十月",
        nov: "十一月",
        dec: "十二月"
      }
    },
    inputNumber: {
      decrease: "减少数值",
      increase: "增加数值"
    },
    select: {
      loading: "加载中",
      noMatch: "无匹配数据",
      noData: "无数据",
      placeholder: "请选择"
    },
    dropdown: {
      toggleDropdown: "切换下拉选项"
    },
    mention: {
      loading: "加载中"
    },
    cascader: {
      noMatch: "无匹配数据",
      loading: "加载中",
      placeholder: "请选择",
      noData: "暂无数据"
    },
    pagination: {
      goto: "前往",
      pagesize: "条/页",
      total: "共 {total} 条",
      pageClassifier: "页",
      page: "页",
      prev: "上一页",
      next: "下一页",
      currentPage: "第 {pager} 页",
      prevPages: "向前 {pager} 页",
      nextPages: "向后 {pager} 页",
      deprecationWarning: "你使用了一些已被废弃的用法，请参考 el-pagination 的官方文档"
    },
    dialog: {
      close: "关闭此对话框"
    },
    drawer: {
      close: "关闭此对话框"
    },
    messagebox: {
      title: "提示",
      confirm: "确定",
      cancel: "取消",
      error: "输入的数据不合法!",
      close: "关闭此对话框"
    },
    upload: {
      deleteTip: "按 Delete 键可删除",
      delete: "删除",
      preview: "查看图片",
      continue: "继续上传"
    },
    slider: {
      defaultLabel: "滑块介于 {min} 至 {max}",
      defaultRangeStartLabel: "选择起始值",
      defaultRangeEndLabel: "选择结束值"
    },
    table: {
      emptyText: "暂无数据",
      confirmFilter: "筛选",
      resetFilter: "重置",
      clearFilter: "全部",
      sumText: "合计"
    },
    tour: {
      next: "下一步",
      previous: "上一步",
      finish: "结束导览",
      close: "关闭此对话框"
    },
    tree: {
      emptyText: "暂无数据"
    },
    transfer: {
      noMatch: "无匹配数据",
      noData: "无数据",
      titles: ["列表 1", "列表 2"],
      filterPlaceholder: "请输入搜索内容",
      noCheckedFormat: "共 {total} 项",
      hasCheckedFormat: "已选 {checked}/{total} 项"
    },
    image: {
      error: "加载失败"
    },
    pageHeader: {
      title: "返回"
    },
    popconfirm: {
      confirmButtonText: "确定",
      cancelButtonText: "取消"
    },
    carousel: {
      leftArrow: "上一张幻灯片",
      rightArrow: "下一张幻灯片",
      indicator: "幻灯片切换至索引 {index}"
    }
  }
};
const __default__$7 = {
  name: "Input"
};
const _sfc_main$c = /* @__PURE__ */ defineComponent({
  ...__default__$7,
  props: {
    language: {
      type: Object,
      default: () => {
        return zhCn;
      }
    },
    data: {
      type: Object,
      required: true
    },
    modelValue: {
      type: [String, Number],
      default: ""
    }
  },
  emits: ["update:modelValue"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const slots = useSlots();
    const props = __props;
    const blur = (e) => {
      dataFinal.value && dataFinal.value.blur && dataFinal.value.blur(e);
    };
    const dataFinal = computed(() => {
      let data = { ...props.data };
      data.change = data.change || function() {
      };
      data.blur = data.blur || function() {
      };
      data.focus = data.focus || function() {
      };
      data.clear = data.clear || function() {
      };
      data.input = data.input || function() {
      };
      return data;
    });
    const emits = __emit;
    const bindValue = computed({
      get() {
        return props.modelValue;
      },
      set(val) {
        change(val);
      }
    });
    const change = (e) => {
      dataFinal.value && dataFinal.value.change && dataFinal.value.change(e);
      emits("update:modelValue", e);
    };
    const _ref = ref();
    __expose({
      _ref
    });
    return (_ctx, _cache) => {
      const _component_el_input = resolveComponent("el-input");
      const _component_el_config_provider = resolveComponent("el-config-provider");
      return openBlock(), createBlock(_component_el_config_provider, { locale: __props.language }, {
        default: withCtx(() => [
          createVNode(_component_el_input, mergeProps({
            placeholder: "请输入" + dataFinal.value.label,
            modelValue: bindValue.value,
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => bindValue.value = $event),
            ref_key: "_ref",
            ref: _ref,
            clearable: dataFinal.value.clearable ?? false,
            class: `_class${dataFinal.value.prop}`,
            type: dataFinal.value.inputType ?? "text",
            maxlength: dataFinal.value.maxlength,
            minlength: dataFinal.value.minlength,
            "show-word-limit": dataFinal.value.showWordLimit ?? false,
            "show-password": dataFinal.value.showPassword ?? false,
            disabled: dataFinal.value.disabled ?? false,
            size: dataFinal.value.size ?? "default",
            "prefix-icon": dataFinal.value.prefixIcon,
            "suffix-icon": dataFinal.value.suffixIcon,
            rows: dataFinal.value.rows ?? 2,
            autosize: dataFinal.value.autosize ?? false,
            autocomplete: dataFinal.value.autocomplete ?? "off",
            name: dataFinal.value.name,
            readonly: dataFinal.value.readonly ?? false,
            max: dataFinal.value.max,
            min: dataFinal.value.min,
            step: dataFinal.value.step,
            resize: dataFinal.value.resize,
            autofocus: dataFinal.value.autofocus ?? false,
            form: dataFinal.value.form,
            "validate-event": dataFinal.value.validateEvent ?? true,
            inputStyle: dataFinal.value.inputStyle ?? {},
            onBlur: blur,
            onFocus: dataFinal.value.focus,
            onChange: change,
            onInput: dataFinal.value.input,
            onClear: dataFinal.value.clear
          }, _ctx.$attrs), createSlots({ _: 2 }, [
            renderList(unref(slots), (_, name) => {
              return {
                name: unref(getName)(name),
                fn: withCtx((scopeData) => [
                  renderSlot(_ctx.$slots, name, normalizeProps(guardReactiveProps(scopeData)))
                ])
              };
            })
          ]), 1040, ["placeholder", "modelValue", "clearable", "class", "type", "maxlength", "minlength", "show-word-limit", "show-password", "disabled", "size", "prefix-icon", "suffix-icon", "rows", "autosize", "autocomplete", "name", "readonly", "max", "min", "step", "resize", "autofocus", "form", "validate-event", "inputStyle", "onFocus", "onInput", "onClear"])
        ]),
        _: 3
      }, 8, ["locale"]);
    };
  }
});
const __default__$6 = {
  name: "Select"
};
const _sfc_main$b = /* @__PURE__ */ defineComponent({
  ...__default__$6,
  props: {
    language: {
      type: Object,
      default: () => {
        return zhCn;
      }
    },
    type: {
      type: String,
      default: ""
    },
    data: {
      type: Object,
      required: true
    },
    modelValue: {
      type: [String, Number, Boolean, Object, Array],
      default: () => []
    }
  },
  emits: ["update:modelValue"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const slots = useSlots();
    const props = __props;
    const emits = __emit;
    const bindValue = computed({
      get() {
        return props.modelValue;
      },
      set(val) {
        change(val);
      }
    });
    const change = (e) => {
      dataFinal.value && dataFinal.value.change && dataFinal.value.change(e);
      emits("update:modelValue", e);
    };
    const blur = (e) => {
      dataFinal.value && dataFinal.value.blur && dataFinal.value.blur(e);
    };
    const dataFinal = computed(() => {
      let data = { ...props.data };
      if (typeof data.options === "number" || typeof data.options === "string") {
        let option = [];
        if (isNaN(Number(data.options)) || Number(data.options) < 0) {
          throw new Error(`${data.label}:options数据格式错误,应该为{ label,value}[]或数字,实际为${data.options}`);
        }
        for (let i = 0; i < Number(data.options); i++) {
          option.push({
            label: String(i),
            value: String(i)
          });
        }
        data.options = option;
      }
      if (data.isDefault && data.options.length > 0) {
        if (props.type === "") {
          const isDefault = data.options.find(
            (item) => !item.disabled
          );
          bindValue.value = (isDefault && isDefault.value) ?? "";
        } else {
          const isDefaultGroup = data.options.find((item) => !item.disabled);
          const isDefault = isDefaultGroup && isDefaultGroup.options.find(
            (item) => !item.disabled
          );
          bindValue.value = (isDefault && isDefault.value) ?? "";
        }
        data.clearable = false;
      }
      data.change = data.change || function() {
      };
      data.visibleChange = data.visibleChange || function() {
      };
      data.removeTag = data.removeTag || function() {
      };
      data.clear = data.clear || function() {
      };
      data.blur = data.blur || function() {
      };
      data.focus = data.focus || function() {
      };
      return data;
    });
    const _ref = ref();
    __expose({
      _ref
    });
    return (_ctx, _cache) => {
      const _component_el_select_v2 = resolveComponent("el-select-v2");
      const _component_el_config_provider = resolveComponent("el-config-provider");
      return openBlock(), createBlock(_component_el_config_provider, { locale: __props.language }, {
        default: withCtx(() => [
          createVNode(_component_el_select_v2, mergeProps({
            class: `_class${dataFinal.value.prop}`,
            modelValue: bindValue.value,
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => bindValue.value = $event),
            ref_key: "_ref",
            ref: _ref,
            multiple: dataFinal.value.multiple,
            clearable: dataFinal.value.clearable,
            placeholder: "请选择" + dataFinal.value.label,
            disabled: dataFinal.value.disabled,
            "value-key": dataFinal.value.valueKey,
            size: dataFinal.value.size,
            "collapse-tags": dataFinal.value.collapseTags,
            "collapse-tags-tooltip": dataFinal.value.collapseTagsTooltip,
            "multiple-limit": dataFinal.value.multipleLimit,
            name: dataFinal.value.name,
            effect: dataFinal.value.effect,
            autocomplete: dataFinal.value.autocomplete,
            filterable: dataFinal.value.filterable,
            "allow-create": dataFinal.value.allowCreate,
            "filter-method": dataFinal.value.filterMethod,
            remote: dataFinal.value.remote,
            "remote-method": dataFinal.value.remoteMethod,
            "remote-show-suffix": dataFinal.value.remoteShowSuffix,
            loading: dataFinal.value.loading,
            "loading-text": dataFinal.value.loadingText,
            "no-match-text": dataFinal.value.noMatchText,
            "no-data-text": dataFinal.value.noDataText,
            "popper-class": dataFinal.value.popperClass,
            "reserve-keyword": dataFinal.value.reserveKeyword,
            "default-first-option": dataFinal.value.defaultFirstOption,
            teleported: dataFinal.value.teleported,
            "append-to": dataFinal.value.appendTo,
            persistent: dataFinal.value.persistent,
            "automatic-dropdown": dataFinal.value.automaticDropdown,
            "clear-icon": dataFinal.value.clearIcon,
            "fit-input-width": dataFinal.value.fitInputWidth,
            "suffix-icon": dataFinal.value.suffixIcon,
            "tag-type": dataFinal.value.tagType,
            "tag-effect": dataFinal.value.tagEffect,
            "validate-event": dataFinal.value.validateEvent,
            placement: dataFinal.value.placement,
            "fallback-placements": dataFinal.value.fallbackPlacements,
            "max-collapse-tags": dataFinal.value.maxCollapseTags,
            "popper-options": dataFinal.value.popperOptions,
            "empty-values": dataFinal.value.emptyValues,
            "value-on-clear": dataFinal.value.valueOnClear,
            onChange: change,
            onVisibleChange: dataFinal.value.visibleChange,
            onRemoveTag: dataFinal.value.removeTag,
            onClear: dataFinal.value.clear,
            onBlur: blur,
            onFocus: dataFinal.value.focus,
            options: dataFinal.value.options
          }, _ctx.$attrs), createSlots({ _: 2 }, [
            renderList(unref(slots), (_, name) => {
              return {
                name: unref(getName)(name),
                fn: withCtx((scopeData) => [
                  renderSlot(_ctx.$slots, name, normalizeProps(guardReactiveProps(scopeData)), void 0, true)
                ])
              };
            })
          ]), 1040, ["class", "modelValue", "multiple", "clearable", "placeholder", "disabled", "value-key", "size", "collapse-tags", "collapse-tags-tooltip", "multiple-limit", "name", "effect", "autocomplete", "filterable", "allow-create", "filter-method", "remote", "remote-method", "remote-show-suffix", "loading", "loading-text", "no-match-text", "no-data-text", "popper-class", "reserve-keyword", "default-first-option", "teleported", "append-to", "persistent", "automatic-dropdown", "clear-icon", "fit-input-width", "suffix-icon", "tag-type", "tag-effect", "validate-event", "placement", "fallback-placements", "max-collapse-tags", "popper-options", "empty-values", "value-on-clear", "onVisibleChange", "onRemoveTag", "onClear", "onFocus", "options"])
        ]),
        _: 3
      }, 8, ["locale"]);
    };
  }
});
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const Select = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["__scopeId", "data-v-efe12e27"]]);
const _hoisted_1$5 = { key: 0 };
const _hoisted_2$3 = { key: 1 };
const __default__$5 = {
  name: "checkbox"
};
const _sfc_main$a = /* @__PURE__ */ defineComponent({
  ...__default__$5,
  props: {
    language: {
      type: Object,
      default: () => {
        return zhCn;
      }
    },
    type: {
      type: String,
      default: "checkbox"
    },
    data: {
      type: Object,
      required: true
    },
    modelValue: {
      type: Array,
      default: () => []
    }
  },
  emits: ["update:modelValue"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const props = __props;
    const max = computed(() => {
      let len = typeof dataFinal.value.options === "number" ? dataFinal.value.options : dataFinal.value.options.length;
      return len;
    });
    const dataFinal = computed(() => {
      let data = { ...props.data };
      if (typeof data.options === "number") {
        let option = [];
        for (let i = 0; i < data.options; i++) {
          option.push({
            value: i,
            label: i + ""
          });
        }
        data.options = option;
      }
      if (data.isDefault && data.options.length > 0) {
        let isDefault = data.options.find((item) => !item.disabled);
        bindValue.value = [isDefault && isDefault.value || ""];
      }
      data.change = data.change || function() {
      };
      return data;
    });
    const emits = __emit;
    const bindValue = computed({
      get() {
        return props.modelValue;
      },
      set(val) {
        change(val);
      }
    });
    const change = (value) => {
      dataFinal.value && dataFinal.value.change && dataFinal.value.change(value);
      emits("update:modelValue", value);
    };
    const _ref = ref();
    __expose({
      _ref
    });
    return (_ctx, _cache) => {
      const _component_el_config_provider = resolveComponent("el-config-provider");
      return openBlock(), createBlock(_component_el_config_provider, { locale: __props.language }, {
        default: withCtx(() => [
          createVNode(unref(ElCheckboxGroup), mergeProps({
            modelValue: bindValue.value,
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => bindValue.value = $event),
            onChange: change,
            ref_key: "_ref",
            ref: _ref,
            size: dataFinal.value.size ?? "",
            class: `_class${dataFinal.value.prop}`,
            disabled: dataFinal.value.disabled ?? false,
            min: dataFinal.value.min ?? 0,
            max: dataFinal.value.max ?? max.value,
            "text-color": dataFinal.value.textColor ?? "#ffffff",
            fill: dataFinal.value.fill ?? "#409eff",
            tag: dataFinal.value.tag ?? "div",
            "validate-event": dataFinal.value.validateEvent ?? true
          }, _ctx.$attrs), {
            default: withCtx(() => [
              renderSlot(_ctx.$slots, `checkbox_${dataFinal.value.prop}`, {}, () => [
                props.type === "checkbox" ? (openBlock(), createElementBlock("div", _hoisted_1$5, [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(typeof dataFinal.value.options === "number" ? [] : dataFinal.value.options, (item, index2) => {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
                    return openBlock(), createBlock(unref(ElCheckbox), mergeProps({
                      key: JSON.stringify(item),
                      label: item.label,
                      value: String(item.value ?? item.label),
                      "true-value": (_a = dataFinal.value.config) == null ? void 0 : _a.trueValue,
                      "false-value": (_b = dataFinal.value.config) == null ? void 0 : _b.falseValue,
                      disabled: ((_c = dataFinal.value.config) == null ? void 0 : _c.disabled) ?? false,
                      name: ((_d = dataFinal.value.config) == null ? void 0 : _d.name) ?? "",
                      checked: ((_e = dataFinal.value.config) == null ? void 0 : _e.checked) ?? false,
                      border: (_f = dataFinal.value.config) == null ? void 0 : _f.border,
                      size: ((_g = dataFinal.value.config) == null ? void 0 : _g.size) ?? "default",
                      indeterminate: ((_h = dataFinal.value.config) == null ? void 0 : _h.indeterminate) ?? false,
                      "validate-event": ((_i = dataFinal.value.config) == null ? void 0 : _i.validateEvent) ?? true,
                      tabindex: index2,
                      onChange: (_j = dataFinal.value.config) == null ? void 0 : _j.change
                    }, { ref_for: true }, _ctx.$attrs), {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(item.label), 1)
                      ]),
                      _: 2
                    }, 1040, ["label", "value", "true-value", "false-value", "disabled", "name", "checked", "border", "size", "indeterminate", "validate-event", "tabindex", "onChange"]);
                  }), 128))
                ])) : createCommentVNode("", true),
                props.type === "checkboxButton" ? (openBlock(), createElementBlock("div", _hoisted_2$3, [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(typeof dataFinal.value.options === "number" ? [] : dataFinal.value.options, (item) => {
                    var _a, _b, _c, _d, _e;
                    return openBlock(), createBlock(unref(ElCheckboxButton), mergeProps({
                      key: JSON.stringify(item),
                      label: item.label,
                      value: String(item.value ?? item.label),
                      "true-value": (_a = dataFinal.value.config) == null ? void 0 : _a.trueValue,
                      "false-value": (_b = dataFinal.value.config) == null ? void 0 : _b.falseValue,
                      disabled: ((_c = dataFinal.value.config) == null ? void 0 : _c.disabled) ?? false,
                      name: ((_d = dataFinal.value.config) == null ? void 0 : _d.name) ?? "",
                      checked: ((_e = dataFinal.value.config) == null ? void 0 : _e.checked) ?? false
                    }, { ref_for: true }, _ctx.$attrs), {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(item.label), 1)
                      ]),
                      _: 2
                    }, 1040, ["label", "value", "true-value", "false-value", "disabled", "name", "checked"]);
                  }), 128))
                ])) : createCommentVNode("", true)
              ])
            ]),
            _: 3
          }, 16, ["modelValue", "size", "class", "disabled", "min", "max", "text-color", "fill", "tag", "validate-event"])
        ]),
        _: 3
      }, 8, ["locale"]);
    };
  }
});
const _hoisted_1$4 = { key: 0 };
const _hoisted_2$2 = { key: 1 };
const __default__$4 = {
  name: "Radio"
};
const _sfc_main$9 = /* @__PURE__ */ defineComponent({
  ...__default__$4,
  props: {
    language: {
      type: Object,
      default: () => {
        return zhCn;
      }
    },
    type: {
      type: String,
      default: "radio"
    },
    data: {
      type: Object,
      required: true
    },
    modelValue: {
      type: [String, Number, Boolean],
      default: () => []
    }
  },
  emits: ["update:modelValue"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const props = __props;
    const dataFinal = computed(() => {
      let data = { ...props.data };
      if (typeof data.options === "number") {
        let option = [];
        for (let i = 0; i < data.options; i++) {
          option.push({
            label: i + "",
            value: i
          });
        }
        data.options = option;
      }
      if (data.isDefault && data.options.length > 0) {
        let isDefault = data.options.find((item) => !item.disabled);
        bindValue.value = isDefault && isDefault.value || "";
      }
      data.change = data.change || function() {
      };
      return data;
    });
    const emits = __emit;
    const bindValue = computed({
      get() {
        return props.modelValue;
      },
      set(val) {
        change(val);
      }
    });
    const change = (e) => {
      dataFinal.value && dataFinal.value.change && dataFinal.value.change(e);
      emits("update:modelValue", e);
    };
    const _ref = ref();
    __expose({
      _ref
    });
    return (_ctx, _cache) => {
      const _component_el_radio = resolveComponent("el-radio");
      const _component_el_radio_button = resolveComponent("el-radio-button");
      const _component_el_radio_group = resolveComponent("el-radio-group");
      const _component_el_config_provider = resolveComponent("el-config-provider");
      return openBlock(), createBlock(_component_el_config_provider, { locale: __props.language }, {
        default: withCtx(() => [
          createVNode(_component_el_radio_group, mergeProps({
            modelValue: bindValue.value,
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => bindValue.value = $event),
            class: `_class${dataFinal.value.prop}`,
            size: dataFinal.value.size ?? "",
            disabled: dataFinal.value.disabled ?? false,
            min: dataFinal.value.min ?? 0,
            max: dataFinal.value.max ?? dataFinal.value.options.length,
            "text-color": dataFinal.value.textColor ?? "#ffffff",
            fill: dataFinal.value.fill ?? "#409eff",
            tag: dataFinal.value.tag ?? "div",
            ref_key: "_ref",
            ref: _ref,
            "validate-event": dataFinal.value.validateEvent ?? true,
            onChange: change
          }, _ctx.$attrs), {
            default: withCtx(() => [
              renderSlot(_ctx.$slots, `radio_${dataFinal.value.prop}`, {}, () => [
                props.type === "radio" ? (openBlock(), createElementBlock("div", _hoisted_1$4, [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(typeof dataFinal.value.options === "number" ? [] : dataFinal.value.options, (item, index2) => {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
                    return openBlock(), createBlock(_component_el_radio, {
                      key: JSON.stringify(item),
                      label: item.label,
                      value: item.value ?? item.label,
                      "true-value": (_a = dataFinal.value.config) == null ? void 0 : _a.trueValue,
                      "false-value": (_b = dataFinal.value.config) == null ? void 0 : _b.falseValue,
                      disabled: ((_c = dataFinal.value.config) == null ? void 0 : _c.disabled) ?? false,
                      name: ((_d = dataFinal.value.config) == null ? void 0 : _d.name) ?? "",
                      checked: ((_e = dataFinal.value.config) == null ? void 0 : _e.checked) ?? false,
                      border: (_f = dataFinal.value.config) == null ? void 0 : _f.border,
                      size: ((_g = dataFinal.value.config) == null ? void 0 : _g.size) ?? "default",
                      indeterminate: ((_h = dataFinal.value.config) == null ? void 0 : _h.indeterminate) ?? false,
                      "validate-event": ((_i = dataFinal.value.config) == null ? void 0 : _i.validateEvent) ?? true,
                      tabindex: index2,
                      onChange: (_j = dataFinal.value.config) == null ? void 0 : _j.change
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(item.label), 1)
                      ]),
                      _: 2
                    }, 1032, ["label", "value", "true-value", "false-value", "disabled", "name", "checked", "border", "size", "indeterminate", "validate-event", "tabindex", "onChange"]);
                  }), 128))
                ])) : createCommentVNode("", true),
                props.type === "radioButton" ? (openBlock(), createElementBlock("div", _hoisted_2$2, [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(typeof dataFinal.value.options === "number" ? [] : dataFinal.value.options, (item) => {
                    var _a, _b, _c, _d, _e;
                    return openBlock(), createBlock(_component_el_radio_button, {
                      key: JSON.stringify(item),
                      label: item.label,
                      value: item.value ?? item.label,
                      "true-value": (_a = dataFinal.value.config) == null ? void 0 : _a.trueValue,
                      "false-value": (_b = dataFinal.value.config) == null ? void 0 : _b.falseValue,
                      disabled: ((_c = dataFinal.value.config) == null ? void 0 : _c.disabled) ?? false,
                      name: ((_d = dataFinal.value.config) == null ? void 0 : _d.name) ?? "",
                      checked: ((_e = dataFinal.value.config) == null ? void 0 : _e.checked) ?? false
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(item.label), 1)
                      ]),
                      _: 2
                    }, 1032, ["label", "value", "true-value", "false-value", "disabled", "name", "checked"]);
                  }), 128))
                ])) : createCommentVNode("", true)
              ])
            ]),
            _: 3
          }, 16, ["modelValue", "class", "size", "disabled", "min", "max", "text-color", "fill", "tag", "validate-event"])
        ]),
        _: 3
      }, 8, ["locale"]);
    };
  }
});
const __default__$3 = {
  name: "MyDate"
};
const _sfc_main$8 = /* @__PURE__ */ defineComponent({
  ...__default__$3,
  props: {
    language: {
      type: Object,
      default: () => {
        return zhCn;
      }
    },
    data: {
      type: Object,
      required: true
    },
    modelValue: {
      type: [String, Array],
      default: ""
    }
  },
  emits: ["update:modelValue"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const slots = useSlots();
    const props = __props;
    const blur = (e) => {
      dataFinal.value && dataFinal.value.blur && dataFinal.value.blur(e);
    };
    const dataFinal = computed(() => {
      let data = { ...props.data };
      data.valueFormat = data.valueFormat ?? "YYYY-MM-DD";
      data.format = data.format ?? data.valueFormat ?? "YYYY-MM-DD";
      data.change = data.change || function() {
      };
      data.blur = data.blur || function() {
      };
      data.focus = data.focus || function() {
      };
      data.clear = data.clear || function() {
      };
      data.calendarChange = data.calendarChange || function() {
      };
      data.panelChange = data.panelChange || function() {
      };
      data.visibleChange = data.visibleChange || function() {
      };
      return data;
    });
    const emits = __emit;
    const bindValue = computed({
      get() {
        return typeof props.modelValue !== "object" ? String(props.modelValue) : props.modelValue.map((item) => String(item));
      },
      set(val) {
        change(val);
      }
    });
    const change = (e) => {
      dataFinal.value && dataFinal.value.change && dataFinal.value.change(e);
      emits("update:modelValue", e);
    };
    const _ref = ref(null);
    __expose({
      _ref
    });
    return (_ctx, _cache) => {
      const _component_el_config_provider = resolveComponent("el-config-provider");
      return openBlock(), createBlock(_component_el_config_provider, { locale: __props.language }, {
        default: withCtx(() => [
          createVNode(unref(ElDatePicker), mergeProps({
            onChange: change,
            ref_key: "_ref",
            ref: _ref,
            class: `_class${dataFinal.value.prop}`,
            modelValue: bindValue.value,
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => bindValue.value = $event),
            placeholder: `请选择${dataFinal.value.label}`,
            readonly: dataFinal.value.readonly,
            disabled: dataFinal.value.disabled,
            editable: dataFinal.value.editable,
            clearable: dataFinal.value.clearable,
            size: dataFinal.value.size,
            "value-format": dataFinal.value.valueFormat,
            format: dataFinal.value.format,
            type: dataFinal.value.dateType,
            "range-separator": dataFinal.value.rangeSeparator ?? "-",
            "start-placeholder": dataFinal.value.startPlaceholder ?? "开始日期",
            "end-placeholder": dataFinal.value.endPlaceholder ?? "结束日期",
            onBlur: blur,
            onFocus: dataFinal.value.focus,
            onClear: dataFinal.value.clear,
            onCalendarChange: dataFinal.value.calendarChange,
            onPanelChange: dataFinal.value.panelChange,
            onVisibleChange: dataFinal.value.visibleChange
          }, _ctx.$attrs), createSlots({ _: 2 }, [
            renderList(unref(slots), (_, name) => {
              return {
                name: unref(getName)(name),
                fn: withCtx((scopeData) => [
                  renderSlot(_ctx.$slots, name, normalizeProps(guardReactiveProps(scopeData)))
                ])
              };
            })
          ]), 1040, ["class", "modelValue", "placeholder", "readonly", "disabled", "editable", "clearable", "size", "value-format", "format", "type", "range-separator", "start-placeholder", "end-placeholder", "onFocus", "onClear", "onCalendarChange", "onPanelChange", "onVisibleChange"])
        ]),
        _: 3
      }, 8, ["locale"]);
    };
  }
});
const __default__$2 = {
  name: "Switch"
};
const _sfc_main$7 = /* @__PURE__ */ defineComponent({
  ...__default__$2,
  props: {
    language: {
      type: Object,
      default: () => {
        return zhCn;
      }
    },
    data: {
      type: Object,
      required: true
    },
    modelValue: {
      type: [String, Number, Boolean, Object, Array],
      default: () => []
    }
  },
  emits: ["update:modelValue"],
  setup(__props, { expose: __expose, emit: __emit }) {
    useSlots();
    const props = __props;
    const dataFinal = computed(() => {
      let data = { ...props.data };
      data.change = data.change || function() {
      };
      return data;
    });
    const emits = __emit;
    const bindValue = computed({
      get() {
        return props.modelValue;
      },
      set(val) {
        change(val);
      }
    });
    const change = (e) => {
      dataFinal.value && dataFinal.value.change && dataFinal.value.change(e);
      emits("update:modelValue", e);
    };
    const _ref = ref();
    __expose({
      _ref
    });
    return (_ctx, _cache) => {
      const _component_el_switch = resolveComponent("el-switch");
      const _component_el_config_provider = resolveComponent("el-config-provider");
      return openBlock(), createBlock(_component_el_config_provider, { locale: __props.language }, {
        default: withCtx(() => [
          createVNode(_component_el_switch, mergeProps({
            modelValue: bindValue.value,
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => bindValue.value = $event),
            disabled: __props.data.disabled,
            loading: __props.data.loading,
            size: __props.data.size,
            width: __props.data.width,
            "inline-prompt": __props.data.inlinePrompt,
            "active-icon": props.data.activeIcon,
            "inactive-icon": props.data.inactiveIcon,
            "active-action-icon": props.data.activeActionIcon,
            "inactive-action-icon": props.data.inactiveActionIcon,
            "active-text": props.data.activeText,
            "inactive-text": props.data.inactiveText,
            "active-value": props.data.activeValue,
            "inactive-value": props.data.inactiveValue,
            name: props.data.name,
            "validate-event": props.data.validateEvent,
            "before-change": props.data.beforeChange,
            class: `_class${dataFinal.value.prop} ${props.data.prop}`,
            tabindex: props.data.tabindex,
            onChange: change,
            ref_key: "_ref",
            ref: _ref
          }, _ctx.$attrs), createSlots({ _: 2 }, [
            renderList(_ctx.slots, (_, name) => {
              return {
                name: unref(getName)(name),
                fn: withCtx((scopeData) => [
                  renderSlot(_ctx.$slots, name, normalizeProps(guardReactiveProps(scopeData)))
                ])
              };
            })
          ]), 1040, ["modelValue", "disabled", "loading", "size", "width", "inline-prompt", "active-icon", "inactive-icon", "active-action-icon", "inactive-action-icon", "active-text", "inactive-text", "active-value", "inactive-value", "name", "validate-event", "before-change", "class", "tabindex"])
        ]),
        _: 3
      }, 8, ["locale"]);
    };
  }
});
function create(propsSearchValue = {}, searchValue) {
  const dynamicComputedMap = ref({});
  const dynamicComputedFun = (prop, type = "", aliases = "") => {
    if (type === "variable") {
      if (aliases.length > 0 && aliases.split(",").length > 0) {
        dynamicArraysComputedFun(prop, aliases);
        return;
      }
      type = "array";
    }
    if (type === "string") {
      dynamicArraysToStringComputedFun(prop, aliases);
      return;
    }
    if (type === "array" || type === "") {
      dynamicStringComputedFun(prop, type);
    }
  };
  const dynamicArraysComputedFun = (prop, aliases) => {
    nextTick(() => {
      let arr = aliases.split(",");
      let getkey = [];
      for (let arrItem of arr) {
        searchValue.value[arrItem] = propsSearchValue[arrItem] ?? "";
        getkey.push(arrItem);
      }
      dynamicComputedMap.value[prop] = computed({
        get() {
          return getkey.map((item) => searchValue.value[item]);
        },
        set(data) {
          getkey.map((item, index2) => searchValue.value[item] = data && data[index2]);
        }
      });
    });
  };
  const dynamicArraysToStringComputedFun = (prop, separate = ",") => {
    nextTick(() => {
      searchValue.value[prop] = propsSearchValue[prop] ?? "";
      dynamicComputedMap.value[prop] = computed({
        get() {
          typeof searchValue.value[prop];
          return String(searchValue.value[prop]).length > 0 ? String(searchValue.value[prop]).split(separate).map((item) => {
            return item;
          }) : [];
        },
        set(data) {
          searchValue.value[prop] = Array.isArray(data) ? data.join(separate) : "";
        }
      });
    });
  };
  const dynamicStringComputedFun = (prop, type = "") => {
    nextTick(() => {
      searchValue.value[prop] = propsSearchValue[prop] ?? (type == "array" ? [] : "");
      dynamicComputedMap.value[prop] = computed({
        get() {
          return searchValue.value[prop];
        },
        set(data) {
          searchValue.value[prop] = data;
        }
      });
    });
  };
  return { dynamicComputedMap, dynamicComputedFun, searchValue: searchValue.value };
}
function useDebounceThrottle(callback, delay = 500, type = "debounce") {
  let timer;
  let lastExecuted;
  function trigger() {
    if (type === "debounce") {
      clearTimeout(timer);
      timer = setTimeout(() => {
        callback();
      }, delay);
    } else if (type === "throttle") {
      const now = Date.now();
      if (!lastExecuted || now - lastExecuted >= delay) {
        callback();
        lastExecuted = now;
      }
    }
  }
  onUnmounted(() => {
    clearTimeout(timer);
  });
  return trigger;
}
let rules = {
  // 1. 必填
  // 必填(自动生成字符串)
  notEmpty: [],
  // 字符串
  strRequired: [],
  strNoSpace: [],
  selects: [
    // 下拉框 多选
  ],
  phone: [
    // 输入框 手机号
  ],
  idNo: [
    // 输入框 身份证
  ],
  // 2. 非必填
  // 字符串
  str: [],
  // 数字--正整数
  number: [],
  numberZero: [],
  // 数字--小数两位
  decimal: [],
  ruleIp: [
    // 校验设备IP
  ],
  ruleExtCellEmun: [
    // 校验拓展枚举
  ],
  // 密码设置
  password: []
};
function formRules(label, type, maxlength = 1, min = 1, max = 1) {
  let validIp = (rule2, value, callback) => {
    let arr = [];
    if (value) {
      value = value.trim();
      if (value.slice(value.length - 1, value.length) === "," || value.slice(value.length - 1, value.length) === "，") {
        callback(new Error("输入的IP末尾不应是逗号"));
      } else {
        value = value.replace(/[\uff0c]/g, ",");
        if (value.indexOf(",") > -1) {
          arr = JSON.parse(JSON.stringify(value)).split(",");
        } else if (value.indexOf("，") > -1) {
          callback(new Error("请用英文逗号隔开"));
        } else {
          arr = [JSON.parse(JSON.stringify(value))];
        }
      }
      if (new Set(arr).size !== arr.length) {
        callback(new Error("输入的IP有重复值"));
      }
      let List = [];
      let pattern = /^(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])$/;
      arr.forEach((item) => {
        let flag = pattern.test(item);
        List.push(flag);
        if (!flag) {
          callback(new Error("输入的IP格式不正确"));
        }
      });
      if (List.indexOf(false) === -1) {
        callback(void 0);
      }
    } else {
      callback(void 0);
    }
  };
  let validExtCellEmun = (rule2, value, callback) => {
    let arr = [];
    if (value) {
      value = value.trim();
      if (value.slice(value.length - 1, value.length) === ",") {
        callback(new Error("拓展枚举不符合输入规则"));
      } else {
        value = value.replace(/[\uff0c]/g, ",");
        if (value.indexOf(",") > -1) {
          arr = JSON.parse(JSON.stringify(value)).split(",");
        } else {
          arr = [JSON.parse(JSON.stringify(value))];
        }
        if (new Set(arr).size !== arr.length) {
          callback(new Error("输入的扩展枚举有重复值"));
        } else {
          callback(void 0);
        }
      }
    } else {
      callback(void 0);
    }
  };
  rules = {
    // 1. 必填
    // 必填(自动生成字符串)
    notEmpty: [
      { required: true, message: label + "不能为空" },
      { pattern: /^(?!(\s+$))/, message: "输入的值不能只有空格", trigger: "blur" }
    ],
    // 字符串
    strRequired: [
      { required: true, message: label + "不能为空", trigger: "blur" },
      { max: maxlength, message: `最多可输入${maxlength}个字符`, trigger: "blur" },
      { pattern: /^(?!(\s+$))/, message: "输入的值不能只有空格", trigger: "blur" }
    ],
    strNoSpace: [
      { required: true, message: label + "不能为空", trigger: "blur" },
      { max: maxlength, message: `最多可输入${maxlength}个字符`, trigger: "blur" },
      { pattern: /^(?!(\s+$))/, message: "输入的值不能只有空格", trigger: "blur" }
    ],
    selects: [
      // 下拉框 多选
      { type: "array", required: true, message: "请选择" + label, trigger: "blur" }
    ],
    phone: [
      // 输入框 手机号
      { required: true, message: label + "不能为空", trigger: "blur" },
      { pattern: /^1(3[0-9]|4[5,7]|5[0,1,2,3,5,6,7,8,9]|6[2,5,6,7]|7[0,1,7,8]|8[0-9]|9[1,8,9])\d{8}$/, message: "请输入正确的" + label, trigger: "blur" }
    ],
    idNo: [
      // 输入框 身份证
      { required: true, message: label + "不能为空", trigger: "blur" },
      { pattern: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/, message: "请输入正确的" + label, trigger: "blur" }
    ],
    // 2. 非必填
    // 字符串
    str: [
      { max: maxlength, message: `最多可输入${maxlength}个字符`, trigger: "blur" },
      { pattern: /^(?!(\s+$))/, message: "输入的值不能只有空格", trigger: "blur" }
    ],
    // 数字--正整数
    number: [
      { type: "number", message: `请输入正整数` },
      { pattern: /^[1-9]+[0-9]*$/, message: "请输入正整数, 不包含0", trigger: "blur" }
    ],
    numberZero: [
      { pattern: /^([1-9]\d*|[0]{1,1})$/, message: "请输入非负整数", trigger: "blur" }
    ],
    // 数字--小数两位
    decimal: [
      { pattern: new RegExp(`/^[1-9]+d*(.d{1,${max}})?$|^(0|0.d{1,${max}})?$/`), message: `非负数, 最多${max}位小数` }
    ],
    ruleIp: [
      // 校验设备IP
      { validator: validIp, trigger: "blur" }
    ],
    ruleExtCellEmun: [
      // 校验拓展枚举
      { validator: validExtCellEmun, trigger: "blur" }
    ],
    // 密码设置
    password: [
      { required: true, message: label + "不能为空", trigger: "blur" },
      { pattern: new RegExp(`/^(?=.*[a-zA-Z])(?=.*\\d)(?=.*[~!@#$%^&*()_+\`\\-={}:";'<>,.\\/]).{${min},${max}}$/`), message: `密码必须为长度${min}-${max}位，且为字母、数字和非空格特殊字符的混合组合`, trigger: "blur" }
    ]
  };
  let rule = rules[type];
  if (!rule) {
    rule = [
      { required: true, message: label + "不能为空", trigger: "blur" },
      { pattern: new RegExp(type), message: `格式错误`, trigger: "blur" }
    ];
  }
  return rule;
}
function createRules(column, notNeedChangeCheck = ["input"]) {
  let rules2 = {};
  column.filter((item) => item.isRequired).map((item) => {
    var _a;
    let required;
    if (typeof item.isRequired === "boolean") {
      rules2[item.prop] = formRules(item.label, "notEmpty");
      required = {
        required: true,
        message: item.label + "不能为空",
        trigger: "change"
      };
    } else if (typeof item.isRequired === "string") {
      rules2[item.prop] = formRules(item.label, item.isRequired);
      required = {
        required: true,
        message: item.label + "不能为空",
        trigger: "change",
        pattern: item.isRequired
      };
    } else {
      rules2[item.prop] = [
        {
          validator: item.isRequired,
          trigger: "blur"
        }
      ];
      required = {
        validator: item.isRequired,
        trigger: "change"
      };
    }
    if (notNeedChangeCheck.indexOf(item.type) === -1) {
      if (rules2[item.prop] && Array.isArray(rules2[item.prop]))
        (_a = rules2[item.prop]) == null ? void 0 : _a.push(required);
    }
  });
  return rules2;
}
const _hoisted_1$3 = { class: "mb-[20px]" };
const _hoisted_2$1 = ["gutter"];
const _hoisted_3 = ["gutter"];
const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "index",
  props: {
    language: {
      type: Object,
      default: () => {
        return zhCn;
      }
    },
    notNeedChangeCheck: {
      type: Array,
      default: () => {
        return ["input", "inputNumber"];
      }
    },
    showSearch: {
      type: Boolean,
      default: true
    },
    defaultSearch: {
      type: Boolean,
      default: true
    },
    labelWidth: {
      type: String,
      default: "auto"
    },
    gutter: {
      type: Number,
      default: 20
    },
    showSearchLabel: {
      type: Boolean,
      default: () => {
        return true;
      }
    },
    search: {
      type: Array,
      required: true
    },
    searchButton: {
      type: Array,
      default: () => {
        return [];
      }
    },
    clearable: {
      type: Boolean,
      default: true
    },
    searchValue: {
      type: Object,
      default: () => {
        return {};
      }
    },
    isRefreshSearch: {
      type: Boolean,
      default: true
    }
  },
  setup(__props, { expose: __expose, emit: __emit }) {
    const props = __props;
    const slots = useSlots();
    const searchValue = ref({ pageNum: 1, pageSize: 10 });
    const formRef = ref();
    const fold = ref(true);
    const searchFinal = ref([]);
    const rules2 = ref();
    const dynamicRefMap = ref({});
    const formPlusMain = ref(null);
    const buttons = ref(null);
    const dynamicCreateRef = (el, prop) => {
      nextTick(() => {
        dynamicRefMap.value[prop + "Ref"] = el;
      });
    };
    const { dynamicComputedFun, dynamicComputedMap } = create(props.searchValue, searchValue);
    const emits = __emit;
    const searchFun = (fun) => {
      nextTick(() => {
        if (fun === "refresh") {
          initSearchValue();
          formRef.value.map((item) => {
            item.clearValidate();
          });
          if (props.isRefreshSearch) {
            fun = "search";
          } else return;
        }
        if (fun === "search") {
          let needCheck = formRef.value.map((item) => {
            return item.validate();
          });
          if (fold.value) {
            needCheck = [needCheck[0]].filter((item) => item);
          }
          Promise.all(needCheck).then((res) => {
            emits(fun, searchValue.value);
          });
          return;
        }
        emits(fun, searchValue.value);
      });
    };
    const initSearchValue = () => {
      searchComputed.value.forEach((item) => {
        let f = false;
        switch (item.type) {
          case "date":
            if ((item.dateType || "").indexOf("range") !== -1) {
              dynamicComputedFun(item.prop, "variable", item.aliases);
            } else if ((item.dateType || "").slice(-1) === "s") {
              dynamicComputedFun(item.prop, "string", ",");
            } else {
              f = true;
            }
            break;
          case "select":
            if (!item.multiple) {
              f = true;
            } else {
              dynamicComputedFun(item.prop, "string", ",");
            }
            break;
          default:
            f = true;
        }
        if (f) {
          dynamicComputedFun(item.prop, "");
        }
      });
      searchValue.value["pageSize"] = 10;
      searchValue.value["pageNum"] = 1;
    };
    const searchSign = ref([]);
    const computedSearchSign = (list = [], flag = false) => {
      if (flag) {
        return (/* @__PURE__ */ new Set([...list.map((item) => `${item.prop}-${item.type}`), ...searchSign.value])).size !== searchSign.value.length;
      } else {
        searchSign.value = [];
        searchSign.value = list.map((item) => `${item.prop}-${item.type}`);
      }
    };
    const searchComputed = computed(() => {
      computedSearchSign(props.search);
      return props.search.filter((item) => item.isForm ?? true).map((item) => {
        if (item.isRequired && item.isDefault) {
          item.clearable = false;
        }
        if (!item.type) item.type = "input";
        item.showMessage = item.showMessage ?? true;
        item.inlineMessage = item.inlineMessage ?? "";
        item.labelPosition = item.labelPosition ?? "";
        item.labelWidth = item.labelWidth ?? "";
        item.clearable = item.clearable ?? props.clearable;
        return item;
      });
    });
    onMounted(() => {
      window.addEventListener("resize", formItemWidthComputedListenerHandler);
    });
    onUnmounted(() => {
      window.removeEventListener("resize", formItemWidthComputedListenerHandler);
    });
    const formItemWidthComputedListener = () => {
      formItemWidthComputed(searchComputed.value);
    };
    const formItemWidthComputedListenerHandler = useDebounceThrottle(formItemWidthComputedListener, 500);
    const formItemWidthComputed = (search, callback = () => {
    }) => {
      let searchArr = [];
      let oneRow = [];
      nextTick(() => {
        var _a, _b;
        let formPlusMainWidth = (_a = formPlusMain.value) == null ? void 0 : _a.clientWidth;
        let inputWidths = {};
        let buttonsWidth = ((_b = buttons.value[0]) == null ? void 0 : _b.clientWidth) ?? 0;
        for (let key in dynamicRefMap.value) {
          let computedStyle = getComputedStyle(dynamicRefMap.value[key].$el);
          inputWidths[key] = getDomComputed(computedStyle, "width") + 6 * 2;
        }
        let sum = formPlusMainWidth - buttonsWidth * 1.5;
        let inputWidthKeys = Object.keys(inputWidths);
        for (let i = 0; i < inputWidthKeys.length; i++) {
          let inputWidthKey = inputWidthKeys[i];
          let inputWidth = inputWidths[inputWidthKey];
          if (sum - inputWidth < 0) {
            searchArr.push([...oneRow]);
            oneRow = [];
            sum = formPlusMainWidth;
            i--;
          } else {
            oneRow.push(
              search.find((item) => item.prop === inputWidthKey.replace("Ref", ""))
            );
            sum -= inputWidth;
          }
        }
        if (oneRow.length > 0) {
          searchArr.push([...oneRow]);
        }
        searchFinal.value = searchArr;
        callback && callback();
      });
    };
    watch(
      () => searchComputed.value,
      async () => {
        let search = searchComputed.value;
        if (search.length === 0 || !computedSearchSign(search, true) && searchFinal.value.length !== 0) {
          searchFinal.value = [search];
          return;
        }
        initSearchValue();
        rules2.value = createRules(search, props.notNeedChangeCheck);
        searchFinal.value = [search];
        search.map((item) => `${item.prop}Ref`);
        await nextTick();
        formItemWidthComputed(search, () => {
          if (props.defaultSearch) {
            searchFun("search");
          }
        });
      },
      {
        deep: true,
        immediate: true
      }
    );
    const searchButtonFinal = ref([]);
    watch(
      () => props.searchButton,
      () => {
        let searchButton = [...props.searchButton];
        if (searchButton.length === 0) {
          searchButton.push({
            type: "search-refresh",
            fun: "search",
            span: 24,
            searchLabel: "搜索",
            refreshLabel: "重置"
          });
        }
        searchButtonFinal.value = [...searchButton];
      },
      {
        deep: true,
        immediate: true
      }
    );
    const showFold = computed(() => {
      return searchFinal.value.length > 1;
    });
    const openList = () => {
      fold.value = !fold.value;
    };
    __expose([fold, dynamicRefMap, formPlusMain, buttons]);
    return (_ctx, _cache) => {
      const _component_el_form_item = resolveComponent("el-form-item");
      const _component_el_button = resolveComponent("el-button");
      const _component_ArrowDown = resolveComponent("ArrowDown");
      const _component_el_icon = resolveComponent("el-icon");
      const _component_ArrowUp = resolveComponent("ArrowUp");
      const _component_el_form = resolveComponent("el-form");
      const _component_el_config_provider = resolveComponent("el-config-provider");
      const _component_el_card = resolveComponent("el-card");
      return withDirectives((openBlock(), createElementBlock("div", _hoisted_1$3, [
        createVNode(_component_el_card, { shadow: "hover" }, {
          default: withCtx(() => [
            createVNode(_component_el_config_provider, { locale: __props.language }, {
              default: withCtx(() => [
                createElementVNode("div", {
                  class: normalizeClass(["searchList form form-plus-main", { hide: !__props.showSearch, show: __props.showSearch }]),
                  ref_key: "formPlusMain",
                  ref: formPlusMain
                }, [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(searchFinal.value, (rowItem, rowIndex) => {
                    return openBlock(), createElementBlock("div", {
                      class: normalizeClass(["search_form_menu", {
                        hide: !(fold.value && rowIndex == 0) || !fold.value,
                        show: fold.value && rowIndex == 0 || !fold.value
                      }]),
                      gutter: __props.gutter,
                      key: JSON.stringify(rowItem)
                    }, [
                      withDirectives(createVNode(_component_el_form, {
                        ref_for: true,
                        ref_key: "formRef",
                        ref: formRef,
                        inline: true,
                        model: unref(dynamicComputedMap),
                        "label-width": __props.labelWidth
                      }, {
                        default: withCtx(() => [
                          (openBlock(true), createElementBlock(Fragment, null, renderList(rowItem, (item, index2) => {
                            return renderSlot(_ctx.$slots, `my-form-item-${item.prop}`, {
                              key: JSON.stringify(item),
                              prop: item.prop,
                              data: searchValue.value
                            }, () => [
                              typeof item.showFun === "undefined" || item.showFun && item.showFun(unref(dynamicComputedMap)) ? (openBlock(), createBlock(_component_el_form_item, {
                                key: 0,
                                ref_for: true,
                                ref: (el) => dynamicCreateRef(el, item.prop),
                                label: item.label,
                                prop: item.prop,
                                class: normalizeClass(`my-form-item my-form-item-${item.prop} my-form-item-${rowIndex} my-form-item-${rowIndex}-${index2}`),
                                rules: typeof item.dynamicRequired === "undefined" || item.dynamicRequired && item.dynamicRequired(unref(dynamicComputedMap)) && rules2.value[item.prop] ? rules2.value[item.prop] : []
                              }, createSlots({
                                default: withCtx(() => [
                                  renderSlot(_ctx.$slots, item.prop, {
                                    prop: item.prop,
                                    data: unref(dynamicComputedMap)
                                  }, () => [
                                    item.type === "input" ? (openBlock(), createBlock(_sfc_main$c, {
                                      key: 0,
                                      data: item,
                                      modelValue: unref(dynamicComputedMap)[item.prop],
                                      "onUpdate:modelValue": ($event) => unref(dynamicComputedMap)[item.prop] = $event
                                    }, null, 8, ["data", "modelValue", "onUpdate:modelValue"])) : createCommentVNode("", true),
                                    item.type === "date" ? (openBlock(), createBlock(_sfc_main$8, {
                                      key: 1,
                                      data: item,
                                      modelValue: unref(dynamicComputedMap)[item.prop],
                                      "onUpdate:modelValue": ($event) => unref(dynamicComputedMap)[item.prop] = $event
                                    }, null, 8, ["data", "modelValue", "onUpdate:modelValue"])) : createCommentVNode("", true),
                                    item.type === "select" ? (openBlock(), createBlock(Select, {
                                      key: 2,
                                      data: item,
                                      modelValue: unref(dynamicComputedMap)[item.prop],
                                      "onUpdate:modelValue": ($event) => unref(dynamicComputedMap)[item.prop] = $event
                                    }, null, 8, ["data", "modelValue", "onUpdate:modelValue"])) : createCommentVNode("", true),
                                    item.type === "switch" ? (openBlock(), createBlock(_sfc_main$7, {
                                      key: 3,
                                      data: item,
                                      modelValue: unref(dynamicComputedMap)[item.prop],
                                      "onUpdate:modelValue": ($event) => unref(dynamicComputedMap)[item.prop] = $event
                                    }, null, 8, ["data", "modelValue", "onUpdate:modelValue"])) : createCommentVNode("", true),
                                    item.type === "checkbox" ? (openBlock(), createBlock(_sfc_main$a, {
                                      key: 4,
                                      data: item,
                                      modelValue: unref(dynamicComputedMap)[item.prop],
                                      "onUpdate:modelValue": ($event) => unref(dynamicComputedMap)[item.prop] = $event
                                    }, null, 8, ["data", "modelValue", "onUpdate:modelValue"])) : createCommentVNode("", true),
                                    item.type === "radio" ? (openBlock(), createBlock(_sfc_main$9, {
                                      key: 5,
                                      data: item,
                                      modelValue: unref(dynamicComputedMap)[item.prop],
                                      "onUpdate:modelValue": ($event) => unref(dynamicComputedMap)[item.prop] = $event
                                    }, null, 8, ["data", "modelValue", "onUpdate:modelValue"])) : createCommentVNode("", true)
                                  ], true)
                                ]),
                                _: 2
                              }, [
                                slots[`label_${item.prop}`] ? {
                                  name: "label",
                                  fn: withCtx(() => [
                                    renderSlot(_ctx.$slots, `label_${item.prop}`, {
                                      prop: item.prop,
                                      data: unref(dynamicComputedMap)
                                    }, void 0, true)
                                  ]),
                                  key: "0"
                                } : void 0,
                                slots[`error_${item.prop}`] ? {
                                  name: "error",
                                  fn: withCtx(() => [
                                    renderSlot(_ctx.$slots, `error_${item.prop}`, {
                                      prop: item.prop,
                                      data: unref(dynamicComputedMap)
                                    }, void 0, true)
                                  ]),
                                  key: "1"
                                } : void 0
                              ]), 1032, ["label", "prop", "class", "rules"])) : createCommentVNode("", true)
                            ], true);
                          }), 128)),
                          rowIndex === 0 ? (openBlock(), createBlock(_component_el_form_item, {
                            key: 0,
                            class: "buttons"
                          }, {
                            default: withCtx(() => [
                              createElementVNode("div", {
                                style: { "margin-bottom": "4px", "display": "flex" },
                                gutter: __props.gutter,
                                ref_for: true,
                                ref_key: "buttons",
                                ref: buttons
                              }, [
                                (openBlock(true), createElementBlock(Fragment, null, renderList(searchButtonFinal.value, (item) => {
                                  return openBlock(), createElementBlock("div", {
                                    key: JSON.stringify(item),
                                    style: { "display": "flex" },
                                    class: "my-form-buttons"
                                  }, [
                                    item.type === "button" ? (openBlock(), createBlock(_component_el_button, {
                                      key: 0,
                                      size: item.size ?? "small",
                                      type: item.inputType ?? "primary",
                                      icon: item.icon,
                                      onClick: ($event) => searchFun(item == null ? void 0 : item.fun)
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode(toDisplayString(item.label), 1)
                                      ]),
                                      _: 2
                                    }, 1032, ["size", "type", "icon", "onClick"])) : createCommentVNode("", true),
                                    item.type === "search" ? (openBlock(), createBlock(_component_el_button, {
                                      key: 1,
                                      size: item.size ?? "small",
                                      type: item.inputType ?? "primary",
                                      icon: item.icon ?? _ctx.Search,
                                      onClick: ($event) => searchFun(item == null ? void 0 : item.fun)
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode(toDisplayString(item.label), 1)
                                      ]),
                                      _: 2
                                    }, 1032, ["size", "type", "icon", "onClick"])) : createCommentVNode("", true),
                                    item.type === "search-refresh" ? (openBlock(), createBlock(_component_el_button, {
                                      key: 2,
                                      size: item.size ?? "default",
                                      type: item.inputType ?? "primary",
                                      icon: item.icon ?? _ctx.Search,
                                      onClick: ($event) => searchFun((item == null ? void 0 : item.fun) ?? "search")
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode(toDisplayString(item.searchLabel), 1)
                                      ]),
                                      _: 2
                                    }, 1032, ["size", "type", "icon", "onClick"])) : createCommentVNode("", true),
                                    item.type === "search-refresh" ? (openBlock(), createBlock(_component_el_button, {
                                      key: 3,
                                      size: item.size ?? "default",
                                      type: item.inputType ?? "",
                                      icon: item.icon ?? _ctx.RefreshLeft,
                                      onClick: _cache[0] || (_cache[0] = ($event) => searchFun("refresh"))
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode(toDisplayString(item.refreshLabel), 1)
                                      ]),
                                      _: 2
                                    }, 1032, ["size", "type", "icon"])) : createCommentVNode("", true),
                                    item.type === "refresh" ? (openBlock(), createBlock(_component_el_button, {
                                      key: 4,
                                      size: item.size ?? "small",
                                      type: item.inputType ?? "",
                                      icon: item.icon ?? "RefreshLeft",
                                      onClick: _cache[1] || (_cache[1] = ($event) => searchFun("refresh"))
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode(toDisplayString(item.label), 1)
                                      ]),
                                      _: 2
                                    }, 1032, ["size", "type", "icon"])) : createCommentVNode("", true)
                                  ]);
                                }), 128)),
                                showFold.value ? (openBlock(), createBlock(_component_el_button, {
                                  key: 0,
                                  class: "fold",
                                  text: "",
                                  onClick: openList
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(fold.value ? "展开" : "收起") + " ", 1),
                                    fold.value ? (openBlock(), createBlock(_component_el_icon, { key: 0 }, {
                                      default: withCtx(() => [
                                        createVNode(_component_ArrowDown)
                                      ]),
                                      _: 1
                                    })) : createCommentVNode("", true),
                                    !fold.value ? (openBlock(), createBlock(_component_el_icon, { key: 1 }, {
                                      default: withCtx(() => [
                                        createVNode(_component_ArrowUp)
                                      ]),
                                      _: 1
                                    })) : createCommentVNode("", true)
                                  ]),
                                  _: 1
                                })) : createCommentVNode("", true)
                              ], 8, _hoisted_3)
                            ]),
                            _: 1
                          })) : createCommentVNode("", true)
                        ]),
                        _: 2
                      }, 1032, ["model", "label-width"]), [
                        [vShow, __props.showSearch]
                      ])
                    ], 10, _hoisted_2$1);
                  }), 128))
                ], 2)
              ]),
              _: 3
            }, 8, ["locale"])
          ]),
          _: 3
        })
      ], 512)), [
        [vShow, __props.showSearch]
      ]);
    };
  }
});
const MyForm = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["__scopeId", "data-v-36f6981a"]]);
const easeInOutQuad = (t, b, c, d) => {
  t /= d / 2;
  if (t < 1) {
    return c / 2 * t * t + b;
  }
  t--;
  return -c / 2 * (t * (t - 2) - 1) + b;
};
const requestAnimFrame = function() {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) {
    window.setTimeout(callback, 1e3 / 60);
  };
}();
const move = (dom, amount) => {
  if (dom) {
    dom.scrollTop = amount;
    return;
  }
  document.documentElement.scrollTop = amount;
  document.body.parentNode.scrollTop = amount;
  document.body.scrollTop = amount;
};
const position = (dom) => {
  return (dom == null ? void 0 : dom.scrollTop) || document.documentElement.scrollTop || document.body.parentNode.scrollTop || document.body.scrollTop;
};
const scrollTo = (to, duration, dom, callback) => {
  const start = position(dom);
  const change = to - start;
  const increment = 20;
  let currentTime = 0;
  duration = typeof duration === "undefined" ? 500 : duration;
  const animateScroll = function() {
    currentTime += increment;
    const val = easeInOutQuad(currentTime, start, change, duration);
    move(dom, val);
    if (currentTime < duration) {
      requestAnimFrame(animateScroll);
    }
  };
  animateScroll();
};
const __default__$1 = {
  name: "Pagination"
};
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  ...__default__$1,
  props: {
    language: {
      type: Object,
      default: () => {
        return zhCn;
      }
    },
    total: {
      type: Number,
      default: 0
    },
    page: {
      type: Number,
      default: 1
    },
    limit: {
      type: Number,
      default: 20
    },
    pageSizes: {
      type: Array,
      default: () => [10, 20, 30, 50]
    },
    // 移动端页码按钮的数量端默认值5
    pagerCount: {
      type: Number,
      default: isMobile() ? 5 : 7
    },
    layout: {
      type: String,
      default: "total, sizes, prev, pager, next, jumper"
    },
    background: {
      type: Boolean,
      default: true
    },
    autoScroll: {
      type: Boolean,
      default: true
    },
    hidden: {
      type: Boolean,
      default: false
    },
    float: {
      type: String,
      default: "right"
    }
  },
  emits: ["update:page", "update:limit", "pagination"],
  setup(__props, { emit: __emit }) {
    useCssVars((_ctx) => ({
      "0fe67111": __props.float
    }));
    const props = __props;
    const emit = __emit;
    const currentPage = computed({
      get() {
        return props.page;
      },
      set(val) {
        emit("update:page", val);
      }
    });
    const pageSize = computed({
      get() {
        return props.limit;
      },
      set(val) {
        emit("update:limit", val);
      }
    });
    function handleSizeChange(val) {
      if (currentPage.value * val > props.total) {
        currentPage.value = 1;
      }
      emit("pagination", { page: currentPage.value, limit: val });
      if (props.autoScroll) {
        scrollTo(0, 800);
      }
    }
    function handleCurrentChange(val) {
      emit("pagination", { page: val, limit: pageSize.value });
      if (props.autoScroll) {
        scrollTo(0, 800);
      }
    }
    return (_ctx, _cache) => {
      const _component_el_pagination = resolveComponent("el-pagination");
      const _component_el_config_provider = resolveComponent("el-config-provider");
      return openBlock(), createBlock(_component_el_config_provider, { locale: __props.language }, {
        default: withCtx(() => [
          createElementVNode("div", {
            class: normalizeClass([{ "hidden": __props.hidden }, "pagination-container"])
          }, [
            createVNode(_component_el_pagination, mergeProps({
              background: __props.background,
              "current-page": currentPage.value,
              "onUpdate:currentPage": _cache[0] || (_cache[0] = ($event) => currentPage.value = $event),
              "page-size": pageSize.value,
              "onUpdate:pageSize": _cache[1] || (_cache[1] = ($event) => pageSize.value = $event),
              layout: __props.layout,
              "page-sizes": __props.pageSizes,
              "pager-count": __props.pagerCount,
              total: __props.total,
              ref: "_ref",
              class: "_class",
              onSizeChange: handleSizeChange,
              onCurrentChange: handleCurrentChange
            }, _ctx.$attrs), null, 16, ["background", "current-page", "page-size", "layout", "page-sizes", "pager-count", "total"])
          ], 2)
        ]),
        _: 1
      }, 8, ["locale"]);
    };
  }
});
const pagination = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["__scopeId", "data-v-969cab4a"]]);
const _hoisted_1$2 = { class: "show-btn" };
const __default__ = {
  name: "RightToolbar"
};
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  ...__default__,
  props: {
    showSearch: {
      type: Boolean,
      default: true
    },
    columns: {
      type: Array,
      default: () => {
        return [];
      }
    },
    search: {
      type: Boolean,
      default: true
    },
    gutter: {
      type: Number,
      default: 10
    }
  },
  emits: ["update:showSearch", "update:columns", "queryTable"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const columnRef = ref();
    const emits = __emit;
    const style = computed(() => {
      const ret = {};
      if (props.gutter) {
        ret.marginRight = `${props.gutter / 2}px`;
      }
      return ret;
    });
    function toggleSearch() {
      emits("update:showSearch", !props.showSearch);
    }
    function refresh() {
      emits("queryTable");
    }
    const columnsFinal = ref([]);
    function columnChange(...args) {
      columnsFinal.value.forEach((item) => {
        item.visible = args[1].checkedKeys.includes(item.key);
      });
      emits("update:columns", columnsFinal.value);
    }
    onMounted(() => {
      nextTick(() => {
        var _a;
        columnsFinal.value = [...props.columns];
        (_a = columnRef.value) == null ? void 0 : _a.setCheckedKeys(columnsFinal.value.filter((item) => item.visible).map((item) => item.key), true);
      });
    });
    return (_ctx, _cache) => {
      const _component_el_button = resolveComponent("el-button");
      const _component_el_tooltip = resolveComponent("el-tooltip");
      const _component_el_tree = resolveComponent("el-tree");
      const _component_el_popover = resolveComponent("el-popover");
      const _component_el_row = resolveComponent("el-row");
      return openBlock(), createElementBlock("div", {
        class: "top-right-btn",
        style: normalizeStyle(style.value)
      }, [
        createVNode(_component_el_row, null, {
          default: withCtx(() => [
            __props.search ? (openBlock(), createBlock(_component_el_tooltip, {
              key: 0,
              class: "item",
              effect: "dark",
              content: __props.showSearch ? "隐藏搜索" : "显示搜索",
              placement: "top"
            }, {
              default: withCtx(() => [
                createVNode(_component_el_button, {
                  circle: "",
                  icon: _ctx.Search,
                  onClick: _cache[0] || (_cache[0] = ($event) => toggleSearch())
                }, null, 8, ["icon"])
              ]),
              _: 1
            }, 8, ["content"])) : createCommentVNode("", true),
            createVNode(_component_el_tooltip, {
              class: "item",
              effect: "dark",
              content: "刷新",
              placement: "top"
            }, {
              default: withCtx(() => [
                createVNode(_component_el_button, {
                  circle: "",
                  icon: _ctx.Refresh,
                  onClick: _cache[1] || (_cache[1] = ($event) => refresh())
                }, null, 8, ["icon"])
              ]),
              _: 1
            }),
            __props.columns.length > 0 ? (openBlock(), createBlock(_component_el_tooltip, {
              key: 1,
              class: "item",
              effect: "dark",
              content: "显示/隐藏列",
              placement: "top"
            }, {
              default: withCtx(() => [
                createElementVNode("div", _hoisted_1$2, [
                  createVNode(_component_el_popover, {
                    placement: "bottom",
                    trigger: "click"
                  }, {
                    reference: withCtx(() => [
                      createVNode(_component_el_button, {
                        circle: "",
                        icon: _ctx.Menu
                      }, null, 8, ["icon"])
                    ]),
                    default: withCtx(() => [
                      _cache[2] || (_cache[2] = createElementVNode("div", { class: "tree-header" }, "显示/隐藏列", -1)),
                      createVNode(_component_el_tree, {
                        ref_key: "columnRef",
                        ref: columnRef,
                        data: columnsFinal.value,
                        "show-checkbox": "",
                        onCheck: columnChange,
                        "node-key": "key",
                        props: { label: "label", children: "children" }
                      }, null, 8, ["data"])
                    ]),
                    _: 1
                  })
                ])
              ]),
              _: 1
            })) : createCommentVNode("", true)
          ]),
          _: 1
        })
      ], 4);
    };
  }
});
const RightToolbar = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__scopeId", "data-v-89f93af4"]]);
function findParentSlot($self, slotName = "default") {
  const slots = $self.slots || {};
  const slot = slots[slotName];
  const parent = $self.$parent;
  return slot || (parent ? findParentSlot(parent, slotName) : null);
}
function generateColumnSlot(slotName, scope) {
  const tempSlot = findParentSlot(this, slotName);
  return tempSlot ? tempSlot(scope) : void 0;
}
const MyTableColumn = {
  name: "MyTableColumn",
  components: {
    ElTableColumn
  },
  setup() {
    function renderColumnList(columns = []) {
      const $self = this;
      return columns.map((column) => {
        if (column.hidden && !column.visible) {
          return void 0;
        }
        let slot = {};
        if (column.header) {
          slot.header = (scope) => generateColumnSlot.call($self, column.header, scope);
        }
        slot.default = (scope) => {
          const { row, $index } = scope;
          if (Array.isArray(column.list) && column.list.length) {
            return renderColumnList.call($self, column.list);
          } else if (column.render && typeof column.render === "function") {
            return h("span", column.render(row, $index));
          } else if (column.slot) {
            return generateColumnSlot.call($self, column.slot, {
              row,
              prop: column.prop,
              index: $index,
              fun: column.fun,
              nowData: row[column.prop]
            });
          } else if (column.prop) {
            if (!column.fun) column.fun = (row2, prop) => row2[prop] ?? "-";
            return h("span", {
              class: `span span_${column.prop} span_${column.prop}_${row[column.prop]} span_other_${column.classFun && column.classFun(row, column.prop)} ${typeof column.fun(row, column.prop)}`
            }, column.fun && column.fun(row, column.prop, $index));
          } else {
            return generateColumnSlot.call($self, "default", scope);
          }
        };
        return h(ElTableColumn, {
          prop: column.prop || column.label,
          label: column.label,
          fixed: column.fixed ?? false,
          minWidth: column.width ?? 100,
          align: column.align ?? "center",
          showOverflowTooltip: column.showOverflow ?? true,
          className: column.hidden && !column.visible ? "table-column-hidden" : ""
        }, slot);
      }).filter((item) => item);
    }
    return {
      renderColumnList
    };
  },
  render() {
    const { tableColumnFinal } = this.$attrs;
    const { renderColumnList } = this;
    const $self = this;
    return renderColumnList.call($self, tableColumnFinal);
  }
};
/*! Element Plus Icons Vue v2.3.2 */
var _sfc_main80 = /* @__PURE__ */ defineComponent({
  name: "Delete",
  __name: "delete",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createElementVNode("path", {
        fill: "currentColor",
        d: "M160 256H96a32 32 0 0 1 0-64h256V95.936a32 32 0 0 1 32-32h256a32 32 0 0 1 32 32V192h256a32 32 0 1 1 0 64h-64v672a32 32 0 0 1-32 32H192a32 32 0 0 1-32-32zm448-64v-64H416v64zM224 896h576V256H224zm192-128a32 32 0 0 1-32-32V416a32 32 0 0 1 64 0v320a32 32 0 0 1-32 32m192 0a32 32 0 0 1-32-32V416a32 32 0 0 1 64 0v320a32 32 0 0 1-32 32"
      })
    ]));
  }
}), delete_default = _sfc_main80;
var _sfc_main91 = /* @__PURE__ */ defineComponent({
  name: "Download",
  __name: "download",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createElementVNode("path", {
        fill: "currentColor",
        d: "M160 832h704a32 32 0 1 1 0 64H160a32 32 0 1 1 0-64m384-253.696 236.288-236.352 45.248 45.248L508.8 704 192 387.2l45.248-45.248L480 584.704V128h64z"
      })
    ]));
  }
}), download_default = _sfc_main91;
var _sfc_main94 = /* @__PURE__ */ defineComponent({
  name: "Edit",
  __name: "edit",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createElementVNode("path", {
        fill: "currentColor",
        d: "M832 512a32 32 0 1 1 64 0v352a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V160a32 32 0 0 1 32-32h352a32 32 0 0 1 0 64H192v640h640z"
      }),
      createElementVNode("path", {
        fill: "currentColor",
        d: "m469.952 554.24 52.8-7.552L847.104 222.4a32 32 0 1 0-45.248-45.248L477.44 501.44l-7.552 52.8zm422.4-422.4a96 96 0 0 1 0 135.808l-331.84 331.84a32 32 0 0 1-18.112 9.088L436.8 623.68a32 32 0 0 1-36.224-36.224l15.104-105.6a32 32 0 0 1 9.024-18.112l331.904-331.84a96 96 0 0 1 135.744 0z"
      })
    ]));
  }
}), edit_default = _sfc_main94;
var _sfc_main201 = /* @__PURE__ */ defineComponent({
  name: "Plus",
  __name: "plus",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createElementVNode("path", {
        fill: "currentColor",
        d: "M480 480V128a32 32 0 0 1 64 0v352h352a32 32 0 1 1 0 64H544v352a32 32 0 1 1-64 0V544H128a32 32 0 0 1 0-64z"
      })
    ]));
  }
}), plus_default = _sfc_main201;
var _sfc_main275 = /* @__PURE__ */ defineComponent({
  name: "Upload",
  __name: "upload",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createElementVNode("path", {
        fill: "currentColor",
        d: "M160 832h704a32 32 0 1 1 0 64H160a32 32 0 1 1 0-64m384-578.304V704h-64V247.296L237.248 490.048 192 444.8 508.8 128l316.8 316.8-45.312 45.248z"
      })
    ]));
  }
}), upload_default = _sfc_main275;
var _sfc_main283 = /* @__PURE__ */ defineComponent({
  name: "View",
  __name: "view",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createElementVNode("path", {
        fill: "currentColor",
        d: "M512 160c320 0 512 352 512 352S832 864 512 864 0 512 0 512s192-352 512-352m0 64c-225.28 0-384.128 208.064-436.8 288 52.608 79.872 211.456 288 436.8 288 225.28 0 384.128-208.064 436.8-288-52.608-79.872-211.456-288-436.8-288m0 64a224 224 0 1 1 0 448 224 224 0 0 1 0-448m0 64a160.19 160.19 0 0 0-160 160c0 88.192 71.744 160 160 160s160-71.808 160-160-71.744-160-160-160"
      })
    ]));
  }
}), view_default = _sfc_main283;
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "index",
  props: {
    language: {
      type: Object,
      default: () => {
        return zhCn;
      }
    },
    hasIndex: {
      type: [Boolean, String],
      default: true
    },
    hasSelection: {
      type: [Boolean, Function],
      default: false
    },
    hasOperation: {
      type: [Boolean, String],
      default: true
    },
    hasOperationName: {
      type: [Boolean],
      default: false
    },
    maxHeight: {
      type: [Number, String],
      default: void 0
    },
    height: {
      type: [Number, String],
      default: void 0
    },
    baseClass: {
      type: [String],
      default: void 0
    },
    maxWidth: {
      type: Boolean,
      default: true
    },
    hasAdd: {
      type: [Boolean, String, Function],
      default: true
    },
    hasAddIcon: {
      type: Object,
      default: () => {
        return plus_default;
      }
    },
    hasBatchRemove: {
      type: [Boolean, String, Function],
      default: true
    },
    hasBatchRemoveIcon: {
      type: Object,
      default: () => {
        return delete_default;
      }
    },
    hasImport: {
      type: [Boolean, String, Function],
      default: true
    },
    hasImportIcon: {
      type: Object,
      default: () => {
        return upload_default;
      }
    },
    hasExport: {
      type: [Boolean, String, Function],
      default: true
    },
    hasExportIcon: {
      type: Object,
      default: () => {
        return download_default;
      }
    },
    hasOperationText: { type: Boolean, default: () => true },
    hasOperationLink: { type: Boolean, default: () => true },
    hasDetail: {
      type: [Boolean, String, Function],
      default: true
    },
    hasDetailIcon: {
      type: Object,
      default: () => {
        return view_default;
      }
    },
    hasDetailType: { type: String, default: () => "primary" },
    hasUpdate: {
      type: [Boolean, String, Function],
      default: true
    },
    hasUpdateIcon: {
      type: Object,
      default: () => {
        return edit_default;
      }
    },
    hasUpdateType: { type: String, default: () => "warning" },
    hasRemove: {
      type: [Boolean, String, Function],
      default: true
    },
    hasRemoveIcon: {
      type: Object,
      default: () => {
        return delete_default;
      }
    },
    hasRemoveType: { type: String, default: () => "danger" },
    tableColumn: {
      type: Array,
      required: true
    },
    queryParam: {
      type: Object,
      required: true
    },
    removeMessage: {
      type: String,
      default: "您确定删除该数据吗? 警告:该操作不可逆,请慎重操作"
    },
    removeType: {
      type: String,
      default: "warning"
    },
    removeMessageTitle: {
      type: String,
      default: "警告"
    },
    exportMessage: {
      type: [String, Boolean],
      default: "是否确认导出数据?"
    },
    exportType: {
      type: String,
      default: "warning"
    },
    exportMessageTitle: {
      type: String,
      default: "提示"
    },
    dataList: {
      type: Array,
      default: () => {
        return void 0;
      }
    },
    dataListFun: {
      type: Function
    },
    dataConfig: {
      type: Object,
      default: () => {
        return {
          rows: "rows",
          total: "total"
        };
      }
    },
    total: {
      type: Number,
      default: 0
    },
    highlightCurrentRow: {
      //是否要高亮当前行
      type: Boolean,
      default: false
    },
    currentRowKey: {
      //当前行的 key，只写属性
      type: [String, Number],
      default: ""
    },
    rowClassName: {
      //行的 className 的回调方法，也可以使用字符串为所有行设置一个固定的 className。
      type: [String, Function],
      default: ""
    },
    rowStyle: {
      //行的 style 的回调方法，也可以使用一个固定的 Object 为所有行设置一样的 Style。
      type: [Object, Function],
      default: () => {
        return {};
      }
    },
    cellClassName: {
      //单元格的 className 的回调方法，也可以使用字符串为所有单元格设置一个固定的 className。
      type: [String, Function],
      default: ""
    },
    cellStyle: {
      //单元格的 style 的回调方法，也可以使用一个固定的 Object 为所有单元格设置一样的 Style。
      type: [Object, Function],
      default: () => {
        return {};
      }
    },
    headerRowClassName: {
      //表头行的 className 的回调方法，也可以使用字符串为所有表头行设置一个固定的 className。
      type: [String, Function],
      default: ""
    },
    headerRowStyle: {
      //表头行的 style 的回调方法，也可以使用一个固定的 Object 为所有表头行设置一样的 Style。
      type: [Object, Function],
      default: () => {
        return {};
      }
    },
    headerCellClassName: {
      //表头单元格的 className 的回调方法，也可以使用字符串为所有表头单元格设置一个固定的 className。
      type: [String, Function],
      default: ""
    },
    headerCellStyle: {
      //表头单元格的 style 的回调方法，也可以使用一个固定的 Object 为所有表头单元格设置一样的 Style。
      type: [Object, Function],
      default: () => {
        return {};
      }
    },
    rowKey: {
      //行数据的 Key，用来优化 Table 的渲染； 在使用reserve-selection功能与显示树形数据时，该属性是必填的。 类型为 String 时，支持多层访问：user.info.id，但不支持 user.info[0].id，此种情况请使用 Function。
      type: [String, Function],
      default: ""
    },
    emptyText: {
      //空数据时显示的文本内容， 也可以通过 #empty 设置
      type: [String],
      default: "没有数据"
    },
    duration: {
      type: Number,
      default: 1500,
      validator(value) {
        return value >= 0;
      }
    },
    message: {
      type: String,
      default: "操作成功"
    }
  },
  emits: [
    "query",
    "add",
    "update",
    "detail",
    "remove",
    "update:showSearch",
    "batch-remove",
    "import",
    "export",
    "dataLoadCompleted"
  ],
  setup(__props, { expose: __expose, emit: __emit }) {
    const slots = useSlots();
    const props = __props;
    const tableRef = ref();
    const heightInner = ref(0);
    const maxHeightInner = ref(0);
    const getHeight = (className) => {
      let baseClassHeightDom = document.querySelector(className);
      let baseClassHeight = 0;
      if (baseClassHeightDom) {
        let baseClassStyle = getComputedStyle(baseClassHeightDom);
        baseClassHeight = getDomComputed(baseClassStyle, "height");
      }
      return baseClassHeight;
    };
    const totalInner = ref(0);
    const dataListInner = ref([]);
    const totalComputed = computed({
      get: () => {
        return props.total || totalInner.value;
      },
      set: (val) => {
        totalInner.value = val;
      }
    });
    const dataListComputed = computed({
      get: () => {
        return props.dataList || dataListInner.value;
      },
      set: (val) => {
        dataListInner.value = val;
      }
    });
    const proxyProps = ref({
      onAdd: false,
      onUpdate: false,
      onDetail: false,
      onRemove: false,
      onDataLoadCompleted: false,
      "onUpdate:showSearch": false,
      onBatchRemove: false
    });
    onMounted(() => {
      const internal = getCurrentInstance();
      const onEmit = (internal == null ? void 0 : internal.vnode.props) || {};
      for (const emit in onEmit) {
        proxyProps.value[emit] = typeof onEmit[emit] === "function";
      }
      autoHeight();
    });
    const autoHeight = () => {
      console.log("重建dom", (/* @__PURE__ */ new Date()).getTime());
      nextTick(() => {
        if (props.baseClass && typeof props.height == "undefined" && typeof props.maxHeight === "undefined") {
          const tableHeaderHeight = getHeight(".el-card__header") + getHeight(".el-table__header-wrapper");
          const pageHeight = getHeight(".pagination-container");
          const { paddingTop: bodyPaddingTop, paddingBottom: bodyPaddingBottom } = getComputedStyle(
            ".table-plus .el-card__body"
          );
          const { borderTopWidth, borderBottomWidth } = getComputedStyle(".table-plus .el-card__header");
          const { height } = getRemainingHeight(props.baseClass, [".table-plus"]);
          heightInner.value = height - tableHeaderHeight - pageHeight - parseFloat(bodyPaddingBottom) - parseFloat(bodyPaddingTop) - parseFloat(borderTopWidth) - parseFloat(borderBottomWidth);
          console.log(`
        height=${height} -
        tableHeaderHeight=${tableHeaderHeight} -
        pageHeight= ${pageHeight}-
        parseFloat(bodyPaddingBottom)=${parseFloat(bodyPaddingBottom)} -
        parseFloat(bodyPaddingTop)=${parseFloat(bodyPaddingTop)} -
        parseFloat(borderTopWidth)= ${parseFloat(borderTopWidth)}-
        parseFloat(borderBottomWidth)=${parseFloat(borderBottomWidth)}`);
          maxHeightInner.value = heightInner.value;
        }
      });
    };
    const multipleSelection = ref([]);
    const toggleSelection = (rows, ignoreSelectable) => {
      var _a;
      if (rows) {
        rows.forEach((row) => {
          var _a2;
          (_a2 = tableRef.value) == null ? void 0 : _a2.toggleRowSelection(row, void 0, ignoreSelectable);
        });
      } else {
        (_a = tableRef.value) == null ? void 0 : _a.clearSelection();
      }
    };
    const handleSelectionChange = (val) => {
      multipleSelection.value = val;
    };
    const canHiddenColumns = computed({
      get() {
        let data = tableColumn.value.filter((item) => item.isTable || typeof item.isTable === "undefined").map((item, index2) => {
          return {
            key: item.prop,
            label: item.label,
            visible: item.visible ?? true,
            hidden: item.hidden,
            index: index2,
            maxWidth: item.width ? false : item.maxWidth ?? props.maxWidth
          };
        }).filter((item) => item.hidden);
        return data;
      },
      set(data) {
        data.forEach((item) => {
          tableColumn.value[item.index].visible = item.visible;
        });
      }
    });
    const tableColumn = ref([]);
    const tableColumnFinal = computed({
      get() {
        if (tableColumn.value.length === 0) {
          tableColumn.value = deepClone(props.tableColumn).filter((item) => item.isTable || typeof item.isTable === "undefined").map((item) => {
            item.visible = item.visible ?? true;
            if (slots[item.prop]) {
              item.slot = item.prop;
            }
            item.selectable = item.selectable ?? true;
            item.maxWidth = item.width ? false : item.maxWidth ?? props.maxWidth;
            item.fun = item.fun ?? ((row, prop, index2) => String(row[prop]) + (item.unit ?? ""));
            return item;
          });
        }
        return tableColumn.value;
      },
      set(data) {
        tableColumn.value = [...data];
      }
    });
    const loading = ref(true);
    const showSearchInner = ref(true);
    const showSearch = computed({
      get() {
        return showSearchInner.value;
      },
      set(value) {
        showSearchInner.value = value;
        autoHeight();
        if (proxyProps.value[`onUpdate:showSearch`]) emits("update:showSearch", showSearchInner.value);
      }
    });
    const queryParams = ref({ pageSize: 10, pageNum: 1, ...props.queryParam });
    watch(
      () => props.queryParam,
      () => {
        queryParams.value = { ...queryParams.value, ...props.queryParam };
      },
      {
        deep: true,
        immediate: true
      }
    );
    const emits = __emit;
    watch(
      () => props.dataList,
      () => {
        loading.value = false;
      },
      {
        deep: true,
        immediate: true
      }
    );
    const startQuery = () => {
      loading.value = true;
    };
    const handleQuery = (queryParam = { ...queryParams.value }, isFirst = false) => {
      loading.value = true;
      if (typeof queryParam == "undefined") {
        queryParam = { ...queryParams.value };
      }
      if (typeof isFirst === "boolean" && isFirst) {
        queryParam.pageNum = 1;
      }
      queryParams.value = { ...queryParam || { ...queryParams.value } };
      if (!props.dataListFun) {
        emits("query", queryParams.value);
      } else {
        props.dataListFun(queryParam, async (res, ...obj) => {
          try {
            if (res instanceof Promise) {
              res = await res;
            } else {
              res = {
                [props.dataConfig.rows]: res,
                [props.dataConfig.total]: obj[0]
              };
            }
            const datas = res[props.dataConfig.rows];
            const total = res[props.dataConfig.total];
            if (proxyProps.value["onDataLoadCompleted"]) emits("dataLoadCompleted", datas, total);
            dataListComputed.value = datas;
            totalComputed.value = total;
          } catch (e) {
          } finally {
            loading.value = false;
          }
        });
      }
    };
    const handleAdd = () => {
      emits("add");
    };
    const handleImport = () => {
      emits("import");
    };
    const handleExport = () => {
      const data = {
        ...queryParams.value,
        multipleSelection: multipleSelection.value
      };
      const cb = () => {
        operationLoading.value = false;
      };
      operationLoading.value = true;
      if (typeof props.exportMessage === "boolean" && !props.exportMessage) {
        emits("export", data, cb);
      } else {
        ElMessageBox.confirm(props.exportMessage, props.exportType, {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          title: props.exportMessageTitle,
          type: props.exportType
        }).then(() => {
          emits("export", data, cb);
        }).catch(() => {
          operationLoading.value = false;
        });
      }
    };
    const handleBatchRemove = () => {
      emits("batch-remove");
    };
    const handleUpdate = (row) => {
      emits("update", row);
    };
    const operationLoading = ref(false);
    const handleRemove = (row) => {
      operationLoading.value = true;
      ElMessageBox.confirm(props.removeMessage, props.removeType, {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        title: props.removeMessageTitle,
        type: props.removeType
      }).then(() => {
        emits("remove", row, (flag = true) => {
          if (flag) {
            ElMessage({
              message: props.message,
              grouping: true,
              duration: props.duration,
              type: "success",
              showClose: props.duration > 0,
              onClose: () => {
                operationLoading.value = false;
                handleQuery();
              }
            });
          } else {
            operationLoading.value = false;
          }
        });
      }).catch(() => {
        operationLoading.value = false;
      });
    };
    const handleDetail = (row) => {
      emits("detail", row);
    };
    __expose({
      multipleSelection: multipleSelection.value,
      toggleSelection,
      startQuery,
      query: handleQuery,
      slots
    });
    return (_ctx, _cache) => {
      const _component_el_button = resolveComponent("el-button");
      const _component_el_col = resolveComponent("el-col");
      const _component_el_row = resolveComponent("el-row");
      const _component_el_table_column = resolveComponent("el-table-column");
      const _component_el_tooltip = resolveComponent("el-tooltip");
      const _component_el_table = resolveComponent("el-table");
      const _component_el_card = resolveComponent("el-card");
      const _component_el_config_provider = resolveComponent("el-config-provider");
      const _directive_loading = resolveDirective("loading");
      return openBlock(), createBlock(_component_el_config_provider, { locale: __props.language }, {
        default: withCtx(() => [
          createVNode(_component_el_card, {
            shadow: "hover",
            class: "table-plus-operation"
          }, {
            header: withCtx(() => [
              renderSlot(_ctx.$slots, "header", {}, () => [
                createVNode(_component_el_row, { gutter: 10 }, {
                  default: withCtx(() => [
                    __props.hasAdd && proxyProps.value[`onAdd`] ? (openBlock(), createBlock(_component_el_col, {
                      key: 0,
                      span: 1.5
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_button, {
                          loading: operationLoading.value,
                          type: "primary",
                          plain: "",
                          icon: __props.hasAddIcon,
                          onClick: _cache[0] || (_cache[0] = ($event) => handleAdd())
                        }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(typeof __props.hasAdd !== "boolean" ? __props.hasAdd : "新增"), 1)
                          ]),
                          _: 1
                        }, 8, ["loading", "icon"])
                      ]),
                      _: 1
                    })) : createCommentVNode("", true),
                    __props.hasSelection && __props.hasBatchRemove && proxyProps.value[`onBatchRemove`] ? (openBlock(), createBlock(_component_el_col, {
                      key: 1,
                      span: 1.5
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_button, {
                          type: "danger",
                          plain: "",
                          loading: operationLoading.value,
                          icon: __props.hasBatchRemoveIcon,
                          onClick: _cache[1] || (_cache[1] = ($event) => handleBatchRemove())
                        }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(typeof __props.hasBatchRemove !== "boolean" ? __props.hasBatchRemove : "删除"), 1)
                          ]),
                          _: 1
                        }, 8, ["loading", "icon"])
                      ]),
                      _: 1
                    })) : createCommentVNode("", true),
                    __props.hasExport && proxyProps.value[`onExport`] ? (openBlock(), createBlock(_component_el_col, {
                      key: 2,
                      span: 1.5
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_button, {
                          loading: operationLoading.value,
                          type: "warning",
                          plain: "",
                          icon: __props.hasExportIcon,
                          onClick: _cache[2] || (_cache[2] = ($event) => handleExport())
                        }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(typeof __props.hasExport !== "boolean" ? __props.hasExport : "导出"), 1)
                          ]),
                          _: 1
                        }, 8, ["loading", "icon"])
                      ]),
                      _: 1
                    })) : createCommentVNode("", true),
                    __props.hasImport && proxyProps.value[`onImport`] ? (openBlock(), createBlock(_component_el_col, {
                      key: 3,
                      span: 1.5
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_button, {
                          loading: operationLoading.value,
                          type: "info",
                          plain: "",
                          icon: __props.hasImportIcon,
                          onClick: _cache[3] || (_cache[3] = ($event) => handleImport())
                        }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(typeof __props.hasImport !== "boolean" ? __props.hasImport : "导入"), 1)
                          ]),
                          _: 1
                        }, 8, ["loading", "icon"])
                      ]),
                      _: 1
                    })) : createCommentVNode("", true),
                    unref(slots)["tableOperation"] ? (openBlock(), createBlock(_component_el_col, {
                      key: 4,
                      span: 1.5
                    }, {
                      default: withCtx(() => [
                        renderSlot(_ctx.$slots, "tableOperation", {}, void 0, true)
                      ]),
                      _: 3
                    })) : createCommentVNode("", true),
                    createVNode(RightToolbar, {
                      search: proxyProps.value["onUpdate:showSearch"],
                      showSearch: showSearch.value,
                      "onUpdate:showSearch": _cache[4] || (_cache[4] = ($event) => showSearch.value = $event),
                      columns: canHiddenColumns.value,
                      "onUpdate:columns": _cache[5] || (_cache[5] = ($event) => canHiddenColumns.value = $event),
                      onQueryTable: _cache[6] || (_cache[6] = ($event) => handleQuery(void 0, false))
                    }, null, 8, ["search", "showSearch", "columns"])
                  ]),
                  _: 3
                })
              ], true)
            ]),
            default: withCtx(() => [
              withDirectives((openBlock(), createBlock(_component_el_table, {
                class: "table-plus-main",
                height: __props.height || heightInner.value || __props.maxHeight,
                "max-height": __props.maxHeight || maxHeightInner.value || __props.height,
                data: dataListComputed.value,
                onSelectionChange: handleSelectionChange,
                ref_key: "tableRef",
                ref: tableRef,
                "highlight-current-row": __props.highlightCurrentRow,
                "current-row-key": __props.currentRowKey,
                "row-class-name": __props.rowClassName,
                "row-style": __props.rowStyle,
                "cell-class-name": __props.cellClassName,
                "cell-style": __props.cellStyle,
                "header-row-class-name": __props.headerRowClassName,
                "header-row-style": __props.headerRowStyle,
                "header-cell-class-name": __props.headerCellClassName,
                "header-cell-style": __props.headerCellStyle,
                "row-key": __props.rowKey,
                "empty-text": __props.emptyText
              }, createSlots({
                default: withCtx(() => [
                  __props.hasSelection ? (openBlock(), createBlock(_component_el_table_column, {
                    key: 0,
                    type: "selection",
                    fixed: _ctx.$attrs["selectionFixed"] ?? "left",
                    selectable: typeof __props.hasSelection === "boolean" ? () => true : __props.hasSelection,
                    width: _ctx.$attrs["selectionWidth"] ?? 55
                  }, null, 8, ["fixed", "selectable", "width"])) : createCommentVNode("", true),
                  __props.hasIndex ? (openBlock(), createBlock(_component_el_table_column, {
                    key: 1,
                    fixed: _ctx.$attrs["indexFixed"] ?? "left",
                    "min-width": _ctx.$attrs["indexMinWidth"] ?? 60,
                    prop: "index",
                    label: typeof __props.hasIndex === "boolean" ? "序号" : __props.hasIndex
                  }, {
                    default: withCtx((scope) => [
                      createTextVNode(toDisplayString(queryParams.value.pageSize * (queryParams.value.pageNum - 1) + scope.$index + 1), 1)
                    ]),
                    _: 1
                  }, 8, ["fixed", "min-width", "label"])) : createCommentVNode("", true),
                  createVNode(unref(MyTableColumn), { tableColumnFinal: tableColumnFinal.value }, null, 8, ["tableColumnFinal"]),
                  __props.hasOperation ? (openBlock(), createBlock(_component_el_table_column, {
                    key: 2,
                    fixed: _ctx.$attrs["operationFixed"] ?? "left",
                    width: _ctx.$attrs["operationWidth"] ?? 200
                  }, {
                    header: withCtx(() => [
                      renderSlot(_ctx.$slots, "operationHeader", {}, () => [
                        createTextVNode(toDisplayString(typeof __props.hasOperation === "boolean" ? "操作" : __props.hasOperation), 1)
                      ], true)
                    ]),
                    default: withCtx((scope) => [
                      renderSlot(_ctx.$slots, `operationBefore`, {
                        data: scope.row,
                        index: scope.index,
                        text: __props.hasOperationText,
                        link: __props.hasOperationLink,
                        loading: operationLoading.value
                      }, void 0, true),
                      renderSlot(_ctx.$slots, "detail", {
                        data: scope.row
                      }, () => [
                        (typeof __props.hasDetail === "function" ? __props.hasDetail(scope.row) : __props.hasDetail && proxyProps.value[`onDetail`]) ? (openBlock(), createBlock(_component_el_tooltip, {
                          key: 0,
                          disabled: typeof __props.hasDetail === "boolean" ? false : typeof __props.hasDetail === "function" ? __props.hasOperationName ? String(__props.hasDetail(scope.row)).length === 0 : true : __props.hasDetail.length !== 0,
                          content: `${(typeof __props.hasDetail === "boolean" ? void 0 : typeof __props.hasDetail === "function" ? __props.hasOperationName ? __props.hasDetail(scope.row) : void 0 : __props.hasDetail) ?? "详情"}`,
                          placement: "top"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_el_button, {
                              text: __props.hasOperationText,
                              link: __props.hasOperationLink,
                              type: __props.hasDetailType,
                              loading: operationLoading.value,
                              icon: __props.hasDetailIcon,
                              onClick: ($event) => handleDetail(scope.row)
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(typeof __props.hasDetail === "boolean" ? void 0 : typeof __props.hasDetail === "function" ? __props.hasOperationName ? __props.hasDetail(scope.row) : void 0 : __props.hasDetail), 1)
                              ]),
                              _: 2
                            }, 1032, ["text", "link", "type", "loading", "icon", "onClick"])
                          ]),
                          _: 2
                        }, 1032, ["disabled", "content"])) : createCommentVNode("", true)
                      ], true),
                      renderSlot(_ctx.$slots, `operationAfterDetail`, {
                        data: scope.row,
                        index: scope.index,
                        text: __props.hasOperationText,
                        link: __props.hasOperationLink,
                        loading: operationLoading.value
                      }, void 0, true),
                      renderSlot(_ctx.$slots, "update", {
                        data: scope.row
                      }, () => [
                        (typeof __props.hasUpdate === "function" ? __props.hasUpdate(scope.row) : __props.hasUpdate && proxyProps.value[`onUpdate`]) ? (openBlock(), createBlock(_component_el_tooltip, {
                          key: 0,
                          disabled: typeof __props.hasUpdate === "boolean" ? false : typeof __props.hasUpdate === "function" ? __props.hasOperationName ? String(__props.hasUpdate(scope.row)).length === 0 : true : __props.hasUpdate.length !== 0,
                          content: `${(typeof __props.hasUpdate === "boolean" ? void 0 : typeof __props.hasUpdate === "function" ? __props.hasOperationName ? __props.hasUpdate(scope.row) : void 0 : __props.hasUpdate) ?? "修改"}`,
                          placement: "top"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_el_button, {
                              text: __props.hasOperationText,
                              link: __props.hasOperationLink,
                              type: __props.hasUpdateType,
                              loading: operationLoading.value,
                              icon: __props.hasUpdateIcon,
                              onClick: ($event) => handleUpdate(scope.row)
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(typeof __props.hasUpdate === "boolean" ? void 0 : typeof __props.hasUpdate === "function" ? __props.hasOperationName ? __props.hasUpdate(scope.row) : void 0 : __props.hasUpdate), 1)
                              ]),
                              _: 2
                            }, 1032, ["text", "link", "type", "loading", "icon", "onClick"])
                          ]),
                          _: 2
                        }, 1032, ["disabled", "content"])) : createCommentVNode("", true)
                      ], true),
                      renderSlot(_ctx.$slots, `operationAfterUpdate`, {
                        data: scope.row,
                        index: scope.index,
                        text: __props.hasOperationText,
                        link: __props.hasOperationLink,
                        loading: operationLoading.value
                      }, void 0, true),
                      renderSlot(_ctx.$slots, "remove", {
                        data: scope.row
                      }, () => [
                        (typeof __props.hasRemove === "function" ? __props.hasRemove(scope.row) : __props.hasRemove && proxyProps.value[`onRemove`]) ? (openBlock(), createBlock(_component_el_tooltip, {
                          key: 0,
                          disabled: typeof __props.hasRemove === "boolean" ? false : typeof __props.hasRemove === "function" ? __props.hasOperationName ? String(__props.hasRemove(scope.row)).length === 0 : true : __props.hasRemove.length !== 0,
                          content: `${(typeof __props.hasRemove === "boolean" ? void 0 : typeof __props.hasRemove === "function" ? __props.hasOperationName ? __props.hasRemove(scope.row) : void 0 : __props.hasRemove) ?? "删除"}`,
                          placement: "top"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_el_button, {
                              text: __props.hasOperationText,
                              link: __props.hasOperationLink,
                              type: __props.hasRemoveType,
                              loading: operationLoading.value,
                              icon: __props.hasRemoveIcon,
                              onClick: ($event) => handleRemove(scope.row)
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(typeof __props.hasRemove === "boolean" ? void 0 : typeof __props.hasRemove === "function" ? __props.hasOperationName ? __props.hasRemove(scope.row) : void 0 : __props.hasRemove), 1)
                              ]),
                              _: 2
                            }, 1032, ["text", "link", "type", "loading", "icon", "onClick"])
                          ]),
                          _: 2
                        }, 1032, ["disabled", "content"])) : createCommentVNode("", true)
                      ], true),
                      renderSlot(_ctx.$slots, `operationAfter`, {
                        data: scope.row,
                        index: scope.index,
                        text: __props.hasOperationText,
                        link: __props.hasOperationLink,
                        loading: operationLoading.value
                      }, void 0, true)
                    ]),
                    _: 3
                  }, 8, ["fixed", "width"])) : createCommentVNode("", true)
                ]),
                _: 2
              }, [
                unref(slots)["empty"] ? {
                  name: "empty",
                  fn: withCtx(() => [
                    renderSlot(_ctx.$slots, "empty", {}, void 0, true)
                  ]),
                  key: "0"
                } : void 0
              ]), 1032, ["height", "max-height", "data", "highlight-current-row", "current-row-key", "row-class-name", "row-style", "cell-class-name", "cell-style", "header-row-class-name", "header-row-style", "header-cell-class-name", "header-cell-style", "row-key", "empty-text"])), [
                [_directive_loading, loading.value]
              ]),
              withDirectives(createVNode(pagination, {
                class: "table-plus-pagination",
                total: totalComputed.value,
                page: queryParams.value.pageNum,
                "onUpdate:page": _cache[7] || (_cache[7] = ($event) => queryParams.value.pageNum = $event),
                limit: queryParams.value.pageSize,
                "onUpdate:limit": _cache[8] || (_cache[8] = ($event) => queryParams.value.pageSize = $event),
                onPagination: handleQuery
              }, null, 8, ["total", "page", "limit"]), [
                [vShow, totalComputed.value > 0]
              ])
            ]),
            _: 3
          })
        ]),
        _: 3
      }, 8, ["locale"]);
    };
  }
});
const MyTable = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-29abdc73"]]);
const _hoisted_1$1 = { class: "dialog-footer" };
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "index",
  props: {
    language: {
      type: Object,
      default: () => {
        return zhCn;
      }
    },
    //弹框宽度
    width: {
      type: String,
      default: "50%"
    },
    labelWidth: {
      type: String,
      default: "72px"
    },
    //弹框标题
    title: {
      type: String,
      default: "详情"
    },
    //是否带有边框
    desBorder: {
      type: Boolean,
      default: false
    },
    //列数
    desColumn: {
      type: Number,
      default: 2
    },
    //排列的方向
    desDirection: {
      type: String,
      default: "horizontal"
    },
    //列表的尺寸
    desSize: { type: String, default: "" },
    //标题文本，显示在左上方
    desTitle: {
      type: String,
      default: ""
    },
    //操作区文本，显示在右上方
    desExtra: {
      type: String,
      default: ""
    },
    column: {
      type: Array,
      required: true
    }
  },
  emits: ["close"],
  setup(__props, { expose: __expose, emit: __emit }) {
    useCssVars((_ctx) => ({
      "20065a34": __props.desColumn
    }));
    const myDialog = useTemplateRef("myDialog");
    const props = __props;
    const attrs = useAttrs();
    computed(() => {
      let attrLs = {};
      const injectAttr = {};
      attrLs = { ...injectAttr, ...attrs };
      return attrLs;
    });
    const dataFinal = ref({});
    const columnFinal = computed(() => {
      return deepClone(props.column).filter((item) => typeof item.isForm == "undefined" || item.isForm).map((item) => {
        item.align = item.align ?? "left";
        item.span = item.span ?? 1;
        item.rowspan = item.rowspan ?? 1;
        if (!item.fun) item.fun = (row, prop) => row[prop];
        if (!item.showFun) item.showFun = (row) => true;
        if (!item.width) ;
        return item;
      }).sort((a, b) => (a.no || 0) - (b.no || 0));
    });
    const emit = __emit;
    const handleClose = (cb) => {
      dataFinal.value = {};
      cb();
      emit("close");
    };
    const init = (data, openCb = () => {
    }) => {
      var _a;
      dataFinal.value = { ...data };
      (_a = myDialog.value) == null ? void 0 : _a.init();
      nextTick(() => {
        openCb();
      });
    };
    __expose({ init, handleClose });
    return (_ctx, _cache) => {
      const _component_el_descriptions_item = resolveComponent("el-descriptions-item");
      const _component_el_descriptions = resolveComponent("el-descriptions");
      const _component_el_button = resolveComponent("el-button");
      const _component_MyDialog = resolveComponent("MyDialog");
      const _component_el_config_provider = resolveComponent("el-config-provider");
      return openBlock(), createBlock(_component_el_config_provider, { locale: __props.language }, {
        default: withCtx(() => [
          createVNode(_component_MyDialog, {
            ref_key: "myDialog",
            ref: myDialog,
            width: __props.width,
            title: __props.title,
            onBeforeClose: handleClose
          }, {
            footer: withCtx(() => [
              renderSlot(_ctx.$slots, "footer", { data: dataFinal.value }, () => [
                createElementVNode("div", _hoisted_1$1, [
                  createVNode(_component_el_button, {
                    onClick: _cache[0] || (_cache[0] = ($event) => myDialog.value && myDialog.value.handleClose)
                  }, {
                    default: withCtx(() => [..._cache[1] || (_cache[1] = [
                      createTextVNode("关闭", -1)
                    ])]),
                    _: 1
                  })
                ])
              ], true)
            ]),
            default: withCtx(() => [
              createVNode(_component_el_descriptions, {
                class: "detail",
                border: __props.desBorder,
                column: __props.desColumn,
                direction: __props.desDirection,
                size: __props.desSize,
                title: __props.desTitle,
                extra: __props.desExtra
              }, {
                default: withCtx(() => [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(columnFinal.value, (item) => {
                    return openBlock(), createElementBlock(Fragment, {
                      key: JSON.stringify(item)
                    }, [
                      item.showFun && item.showFun(dataFinal.value, item.prop) ? (openBlock(), createBlock(_component_el_descriptions_item, {
                        key: 0,
                        label: item.label,
                        span: item.span,
                        rowspan: item.rowspan,
                        width: item.width ?? __props.labelWidth,
                        align: item.align,
                        "label-align": item.labelAlign,
                        "class-name": item.className,
                        "label-class-name": item.labelClassName
                      }, {
                        label: withCtx(() => [
                          renderSlot(_ctx.$slots, "label_" + item.prop, {
                            prop: item.prop,
                            nowData: dataFinal.value[item.prop],
                            row: dataFinal.value
                          }, () => [
                            createTextVNode(toDisplayString(item.label), 1)
                          ], true)
                        ]),
                        default: withCtx(() => [
                          renderSlot(_ctx.$slots, item.prop, {
                            prop: item.prop,
                            nowData: dataFinal.value[item.prop],
                            row: dataFinal.value
                          }, () => [
                            createTextVNode(toDisplayString(item.fun(dataFinal.value, item.prop)), 1)
                          ], true)
                        ]),
                        _: 2
                      }, 1032, ["label", "span", "rowspan", "width", "align", "label-align", "class-name", "label-class-name"])) : createCommentVNode("", true)
                    ], 64);
                  }), 128))
                ]),
                _: 3
              }, 8, ["border", "column", "direction", "size", "title", "extra"])
            ]),
            _: 3
          }, 8, ["width", "title"])
        ]),
        _: 3
      }, 8, ["locale"]);
    };
  }
});
const MyDetail = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-eeee6b22"]]);
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "index",
  props: {
    title: String,
    width: {
      type: [Number, String],
      default: "50%"
    }
  },
  emits: ["beforeClose"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const dialogVisible = ref(false);
    const slots = useSlots();
    const attrs = useAttrs();
    const attr = computed(() => {
      let attrLs = {};
      const injectAttr = {};
      attrLs = { ...injectAttr, ...attrs };
      return attrLs;
    });
    const emits = __emit;
    const handleClose = () => {
      emits("beforeClose", () => {
        dialogVisible.value = false;
      });
    };
    const init = () => {
      dialogVisible.value = true;
    };
    __expose({ init, handleClose });
    return (_ctx, _cache) => {
      const _component_el_dialog = resolveComponent("el-dialog");
      return openBlock(), createBlock(_component_el_dialog, mergeProps({
        modelValue: dialogVisible.value,
        "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => dialogVisible.value = $event),
        title: __props.title,
        width: __props.width,
        "before-close": handleClose
      }, attr.value, { onClose: handleClose }), createSlots({ _: 2 }, [
        renderList(unref(slots), (_, name) => {
          return {
            name: unref(getName)(name),
            fn: withCtx((scopeData) => [
              renderSlot(_ctx.$slots, name, normalizeProps(guardReactiveProps(scopeData)), void 0, true)
            ])
          };
        })
      ]), 1040, ["modelValue", "title", "width"]);
    };
  }
});
const MyDialog = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-7d5884c4"]]);
const _hoisted_1 = { class: "editDialog" };
const _hoisted_2 = { class: "dialog-footer" };
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  props: {
    language: {
      type: Object,
      default: () => {
        return zhCn;
      }
    },
    notNeedChangeCheck: {
      type: Array,
      default: () => {
        return ["input", "inputNumber"];
      }
    },
    submitButtonTxt: {
      type: Object,
      default: () => {
        return {
          add: "提交",
          edit: "修改"
        };
      }
    },
    cancelButtonTxt: {
      type: String,
      default: "取消"
    },
    //弹框宽度
    width: {
      type: String,
      default: "50%"
    },
    //弹框标题
    title: {
      type: Object,
      default: () => {
        return {
          add: "新增",
          edit: "编辑"
        };
      }
    },
    //列
    column: {
      type: Array,
      required: true
    },
    //行内表单模式
    inline: {
      type: Boolean,
      default: false
    },
    //表单域标签位置
    labelPosition: {
      type: String,
      default: "right"
    },
    //标签长度
    labelWidth: {
      type: [String, Number],
      default: ""
    },
    // 表单域标签后缀
    labelSuffix: {
      type: String,
      default: ""
    },
    //隐藏必填星号
    hideRequiredAsterisk: {
      type: Boolean,
      default: false
    },
    //星号位置
    requireAsteriskPosition: {
      type: String,
      default: "left"
    },
    //是否显示错误信息
    showMessage: {
      type: Boolean,
      default: true
    },
    //以行内形式显示错误信息
    inlineMessage: {
      type: Boolean,
      default: false
    },
    //在输入框内显示反馈图标
    statusIcon: {
      type: Boolean,
      default: false
    },
    //是否在rules改变后立即触发
    validateOnRuleChange: {
      type: Boolean,
      default: true
    },
    //表单内组件尺寸
    size: {
      type: String,
      default: ""
    },
    //禁用所有组件
    disabled: {
      type: Boolean,
      default: false
    },
    //滚动到第一个错误表单
    scrollToError: {
      type: Boolean,
      default: false
    },
    duration: {
      type: Number,
      default: 1500,
      validator(value) {
        return value >= 0;
      }
    },
    message: {
      type: String,
      default: "操作成功"
    },
    autoUpdate: {
      type: [Function],
      default: () => {
        return void 0;
      }
    }
  },
  emits: ["submit", "close"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const myDialog = useTemplateRef("myDialog");
    const top = ref("15vh");
    const slots = useSlots();
    const props = __props;
    const dataFinal = ref({});
    const rules2 = ref({});
    ref([]);
    const columnFinal = computed(() => {
      rules2.value = createRules(props.column, props.notNeedChangeCheck);
      return props.column.map(
        (item) => {
          item.showMessage = item.showMessage ?? true;
          item.inlineMessage = item.inlineMessage ?? "";
          item.labelPosition = item.labelPosition ?? "";
          item.labelWidth = item.labelWidth ?? "";
          item.showFun = item.showFun ?? (() => true);
          item.disabled = item.disabled ?? false;
          item.readonly = item.readonly ?? false;
          item.type = item.type ?? "input";
          return item;
        }
      );
    });
    const dynamicRefMap = ref({});
    const dynamicCreateRef = (el, prop) => {
      dynamicRefMap.value[prop + "Ref"] = el;
    };
    let dynamicComputedFun, dynamicComputedMap;
    const dialogVisible = ref(false);
    const handleClose = (cb) => {
      if (loading.value === true) {
        console.warn("请稍等...");
        return;
      }
      loading.value = false;
      formRef.value.resetFields();
      dataFinal.value = {};
      cb();
      emits("close");
    };
    const attrs = useAttrs();
    computed(() => {
      let attrLs = {};
      let injectAttr = {};
      attrLs = { ...injectAttr, ...attrs };
      return attrLs;
    });
    ref(null);
    const isAdd = ref(true);
    const loading = ref(false);
    const init = (data = {}, add = void 0, openCb = () => {
    }) => {
      if (typeof add === "undefined") {
        isAdd.value = Object.keys(data).length === 0;
      } else {
        isAdd.value = add;
      }
      dataFinal.value = { ...data };
      let { dynamicComputedFun: dynamicComputedFun1, dynamicComputedMap: dynamicComputedMap1 } = create(data, dataFinal);
      dynamicComputedFun = dynamicComputedFun1;
      dynamicComputedMap = dynamicComputedMap1;
      columnFinal.value.forEach((item) => {
        let f = false;
        switch (item.type) {
          case "date":
            if ((item.dateType || "").indexOf("range") !== -1) {
              dynamicComputedFun(item.prop, "variable", item.aliases);
            } else if ((item.dateType || "").slice(-1) === "s") {
              dynamicComputedFun(item.prop, "string", ",");
            } else {
              f = true;
            }
            break;
          case "select":
            if (!item.multiple) {
              f = true;
            } else {
              dynamicComputedFun(item.prop, "string", ",");
            }
            break;
          case "checkbox":
            dynamicComputedFun(item.prop, "string", ",");
            break;
          default:
            f = true;
        }
        if (f) {
          dynamicComputedFun(item.prop, "", "");
        }
      });
      dialogVisible.value = true;
      nextTick(() => {
        scrollTo(0, 100, document.querySelector(".editDialog"));
        openCb();
      });
    };
    const formRef = ref();
    const emits = __emit;
    const cancelFun = () => {
      myDialog.value.handleClose();
    };
    const updateData = (prop, data) => {
      dynamicComputedMap.value[prop] = data;
      formRef.value.validateField(prop);
    };
    __expose({
      init,
      close: cancelFun,
      updateData
    });
    const submitFun = async () => {
      var _a;
      (_a = formRef.value) == null ? void 0 : _a.validate((valid, fields) => {
        if (valid) {
          loading.value = true;
          emits(
            "submit",
            { ...dataFinal.value },
            (flag = true, status = 200, code = "code") => {
              if (flag instanceof Promise) {
                flag.then((res) => {
                  flag = res[code] == status;
                }).catch((_) => flag = false);
              }
              if (flag) {
                ElMessage({
                  message: props.message,
                  grouping: true,
                  duration: props.duration,
                  type: "success",
                  showClose: props.duration > 0,
                  onClose: () => {
                    loading.value = false;
                    cancelFun();
                    if (typeof props.autoUpdate != "undefined") {
                      props.autoUpdate();
                    }
                  }
                });
              } else {
                loading.value = false;
              }
            }
          );
        }
      });
    };
    return (_ctx, _cache) => {
      const _component_el_form_item = resolveComponent("el-form-item");
      const _component_el_form = resolveComponent("el-form");
      const _component_el_button = resolveComponent("el-button");
      const _component_el_config_provider = resolveComponent("el-config-provider");
      return openBlock(), createBlock(_component_el_config_provider, { locale: __props.language }, {
        default: withCtx(() => [
          createVNode(MyDialog, {
            ref_key: "myDialog",
            ref: myDialog,
            top: top.value,
            width: __props.width,
            title: isAdd.value ? __props.title.add : __props.title.edit,
            onBeforeClose: handleClose
          }, {
            footer: withCtx(() => [
              renderSlot(_ctx.$slots, "footer", {}, () => [
                createElementVNode("div", _hoisted_2, [
                  createVNode(_component_el_button, {
                    type: "primary",
                    onClick: submitFun,
                    loading: loading.value
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(isAdd.value ? __props.submitButtonTxt.add : __props.submitButtonTxt.edit), 1)
                    ]),
                    _: 1
                  }, 8, ["loading"]),
                  createVNode(_component_el_button, {
                    onClick: cancelFun,
                    loading: loading.value
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(__props.cancelButtonTxt), 1)
                    ]),
                    _: 1
                  }, 8, ["loading"])
                ])
              ], true)
            ]),
            default: withCtx(() => [
              createElementVNode("div", _hoisted_1, [
                createVNode(_component_el_form, {
                  ref_key: "formRef",
                  ref: formRef,
                  class: "editForm",
                  model: unref(dynamicComputedMap),
                  inline: __props.inline,
                  "label-position": __props.labelPosition,
                  "label-width": __props.labelWidth,
                  "label-suffix": __props.labelSuffix,
                  "hide-required-asterisk": __props.hideRequiredAsterisk,
                  "require-asterisk-position": __props.requireAsteriskPosition,
                  "show-message": __props.showMessage,
                  "inline-message": __props.inlineMessage,
                  "status-icon": __props.statusIcon,
                  "validate-on-rule-change": __props.validateOnRuleChange,
                  size: __props.size,
                  disabled: __props.disabled,
                  "scroll-to-error": __props.scrollToError
                }, {
                  default: withCtx(() => [
                    (openBlock(true), createElementBlock(Fragment, null, renderList(columnFinal.value, (item) => {
                      return openBlock(), createElementBlock("div", {
                        key: JSON.stringify(item),
                        class: normalizeClass(`class_${item.prop}`)
                      }, [
                        renderSlot(_ctx.$slots, `item_${item.prop}`, {
                          prop: item.prop,
                          data: unref(dynamicComputedMap)
                        }, () => [
                          item.showFun && item.showFun(unref(dynamicComputedMap)) ? (openBlock(), createBlock(_component_el_form_item, {
                            key: 0,
                            ref_for: true,
                            ref: (el) => dynamicCreateRef(el, item.prop),
                            label: item.label,
                            prop: item.prop,
                            rules: typeof item.dynamicRequired === "undefined" || item.dynamicRequired && item.dynamicRequired(unref(dynamicComputedMap)) ? rules2.value[item.prop] : []
                          }, createSlots({
                            default: withCtx(() => [
                              renderSlot(_ctx.$slots, item.slotName || item.prop, {
                                prop: item.prop,
                                data: unref(dynamicComputedMap)
                              }, () => [
                                item.type === "input" ? (openBlock(), createBlock(_sfc_main$c, {
                                  key: 0,
                                  data: item,
                                  disabled: typeof item.disabled === "function" ? item.disabled(unref(dynamicComputedMap)) : item.disabled,
                                  modelValue: unref(dynamicComputedMap)[item.prop],
                                  "onUpdate:modelValue": ($event) => unref(dynamicComputedMap)[item.prop] = $event
                                }, null, 8, ["data", "disabled", "modelValue", "onUpdate:modelValue"])) : createCommentVNode("", true),
                                item.type === "date" ? (openBlock(), createBlock(_sfc_main$8, {
                                  key: 1,
                                  data: item,
                                  disabled: typeof item.disabled === "function" ? item.disabled(unref(dynamicComputedMap)) : item.disabled,
                                  modelValue: unref(dynamicComputedMap)[item.prop],
                                  "onUpdate:modelValue": ($event) => unref(dynamicComputedMap)[item.prop] = $event
                                }, null, 8, ["data", "disabled", "modelValue", "onUpdate:modelValue"])) : createCommentVNode("", true),
                                item.type === "select" ? (openBlock(), createBlock(Select, {
                                  key: 2,
                                  data: item,
                                  disabled: typeof item.disabled === "function" ? item.disabled(unref(dynamicComputedMap)) : item.disabled,
                                  modelValue: unref(dynamicComputedMap)[item.prop],
                                  "onUpdate:modelValue": ($event) => unref(dynamicComputedMap)[item.prop] = $event
                                }, null, 8, ["data", "disabled", "modelValue", "onUpdate:modelValue"])) : createCommentVNode("", true),
                                item.type === "switch" ? (openBlock(), createBlock(_sfc_main$7, {
                                  key: 3,
                                  data: item,
                                  disabled: typeof item.disabled === "function" ? item.disabled(unref(dynamicComputedMap)) : item.disabled,
                                  modelValue: unref(dynamicComputedMap)[item.prop],
                                  "onUpdate:modelValue": ($event) => unref(dynamicComputedMap)[item.prop] = $event
                                }, null, 8, ["data", "disabled", "modelValue", "onUpdate:modelValue"])) : createCommentVNode("", true),
                                item.type === "checkbox" ? (openBlock(), createBlock(_sfc_main$a, {
                                  key: 4,
                                  data: item,
                                  disabled: typeof item.disabled === "function" ? item.disabled(unref(dynamicComputedMap)) : item.disabled,
                                  modelValue: unref(dynamicComputedMap)[item.prop],
                                  "onUpdate:modelValue": ($event) => unref(dynamicComputedMap)[item.prop] = $event
                                }, null, 8, ["data", "disabled", "modelValue", "onUpdate:modelValue"])) : createCommentVNode("", true),
                                item.type === "radio" ? (openBlock(), createBlock(_sfc_main$9, {
                                  key: 5,
                                  data: item,
                                  disabled: typeof item.disabled === "function" ? item.disabled(unref(dynamicComputedMap)) : item.disabled,
                                  modelValue: unref(dynamicComputedMap)[item.prop],
                                  "onUpdate:modelValue": ($event) => unref(dynamicComputedMap)[item.prop] = $event
                                }, null, 8, ["data", "disabled", "modelValue", "onUpdate:modelValue"])) : createCommentVNode("", true)
                              ], true)
                            ]),
                            _: 2
                          }, [
                            unref(slots)[`label_${item.prop}`] ? {
                              name: "label",
                              fn: withCtx(() => [
                                renderSlot(_ctx.$slots, `label_${item.prop}`, {
                                  prop: item.prop,
                                  data: unref(dynamicComputedMap)
                                }, void 0, true)
                              ]),
                              key: "0"
                            } : void 0,
                            unref(slots)[`error_${item.prop}`] ? {
                              name: "error",
                              fn: withCtx(() => [
                                renderSlot(_ctx.$slots, `error_${item.prop}`, {
                                  prop: item.prop,
                                  data: unref(dynamicComputedMap)
                                }, void 0, true)
                              ]),
                              key: "1"
                            } : void 0
                          ]), 1032, ["label", "prop", "rules"])) : createCommentVNode("", true)
                        ], true)
                      ], 2);
                    }), 128))
                  ]),
                  _: 3
                }, 8, ["model", "inline", "label-position", "label-width", "label-suffix", "hide-required-asterisk", "require-asterisk-position", "show-message", "inline-message", "status-icon", "validate-on-rule-change", "size", "disabled", "scroll-to-error"])
              ])
            ]),
            _: 3
          }, 8, ["top", "width", "title"])
        ]),
        _: 3
      }, 8, ["locale"]);
    };
  }
});
const MyEdit = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-ce173753"]]);
const coms = [MyTable, MyForm, MyEdit, MyDetail, MyDialog];
function capitalizeWord(word) {
  if (typeof word !== "string" || word.length === 0) {
    return word;
  }
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}
const index = {
  install(app, prefix) {
    Object.entries(coms).forEach(([name, component]) => {
      app.component(`${capitalizeWord(prefix || "My")}${name}`, component);
    });
  }
};
export {
  MyDetail,
  MyDialog,
  MyEdit,
  MyForm,
  MyTable,
  index as default
};
//# sourceMappingURL=index.es.js.map

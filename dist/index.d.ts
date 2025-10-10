import { App } from 'vue';
import { ComponentOptionsMixin } from 'vue';
import { ComponentProvideOptions } from 'vue';
import { ComputedRef } from 'vue';
import { default as default_2 } from './components/Table/index.vue';
import { DefineComponent } from 'vue';
import { ExtractPropTypes } from 'vue';
import { PropType } from 'vue';
import { PublicProps } from 'vue';
import { Ref } from 'vue';

declare const __VLS_component: DefineComponent<ExtractPropTypes<    {
language: {
type: ObjectConstructor;
default: () => {
name: string;
el: {
breadcrumb: {
label: string;
};
colorpicker: {
confirm: string;
clear: string;
defaultLabel: string;
description: string;
alphaLabel: string;
};
datepicker: {
now: string;
today: string;
cancel: string;
clear: string;
confirm: string;
dateTablePrompt: string;
monthTablePrompt: string;
yearTablePrompt: string;
selectedDate: string;
selectDate: string;
selectTime: string;
startDate: string;
startTime: string;
endDate: string;
endTime: string;
prevYear: string;
nextYear: string;
prevMonth: string;
nextMonth: string;
year: string;
month1: string;
month2: string;
month3: string;
month4: string;
month5: string;
month6: string;
month7: string;
month8: string;
month9: string;
month10: string;
month11: string;
month12: string;
weeks: {
sun: string;
mon: string;
tue: string;
wed: string;
thu: string;
fri: string;
sat: string;
};
weeksFull: {
sun: string;
mon: string;
tue: string;
wed: string;
thu: string;
fri: string;
sat: string;
};
months: {
jan: string;
feb: string;
mar: string;
apr: string;
may: string;
jun: string;
jul: string;
aug: string;
sep: string;
oct: string;
nov: string;
dec: string;
};
};
inputNumber: {
decrease: string;
increase: string;
};
select: {
loading: string;
noMatch: string;
noData: string;
placeholder: string;
};
dropdown: {
toggleDropdown: string;
};
mention: {
loading: string;
};
cascader: {
noMatch: string;
loading: string;
placeholder: string;
noData: string;
};
pagination: {
goto: string;
pagesize: string;
total: string;
pageClassifier: string;
page: string;
prev: string;
next: string;
currentPage: string;
prevPages: string;
nextPages: string;
deprecationWarning: string;
};
dialog: {
close: string;
};
drawer: {
close: string;
};
messagebox: {
title: string;
confirm: string;
cancel: string;
error: string;
close: string;
};
upload: {
deleteTip: string;
delete: string;
preview: string;
continue: string;
};
slider: {
defaultLabel: string;
defaultRangeStartLabel: string;
defaultRangeEndLabel: string;
};
table: {
emptyText: string;
confirmFilter: string;
resetFilter: string;
clearFilter: string;
sumText: string;
};
tour: {
next: string;
previous: string;
finish: string;
close: string;
};
tree: {
emptyText: string;
};
transfer: {
noMatch: string;
noData: string;
titles: string[];
filterPlaceholder: string;
noCheckedFormat: string;
hasCheckedFormat: string;
};
image: {
error: string;
};
pageHeader: {
title: string;
};
popconfirm: {
confirmButtonText: string;
cancelButtonText: string;
};
carousel: {
leftArrow: string;
rightArrow: string;
indicator: string;
};
};
};
};
notNeedChangeCheck: {
type: {
(arrayLength: number): String[];
(...items: String[]): String[];
new (arrayLength: number): String[];
new (...items: String[]): String[];
isArray(arg: any): arg is any[];
readonly prototype: any[];
from<T>(arrayLike: ArrayLike<T>): T[];
from<T, U>(arrayLike: ArrayLike<T>, mapfn: (v: T, k: number) => U, thisArg?: any): U[];
from<T>(iterable: Iterable<T> | ArrayLike<T>): T[];
from<T, U>(iterable: Iterable<T> | ArrayLike<T>, mapfn: (v: T, k: number) => U, thisArg?: any): U[];
of<T>(...items: T[]): T[];
fromAsync<T>(iterableOrArrayLike: AsyncIterable<T> | Iterable<T | PromiseLike<T>> | ArrayLike<T | PromiseLike<T>>): Promise<T[]>;
fromAsync<T, U>(iterableOrArrayLike: AsyncIterable<T> | Iterable<T> | ArrayLike<T>, mapFn: (value: Awaited<T>) => U, thisArg?: any): Promise<Awaited<U>[]>;
readonly [Symbol.species]: ArrayConstructor;
};
default: () => string[];
};
showSearch: {
type: BooleanConstructor;
default: boolean;
};
defaultSearch: {
type: BooleanConstructor;
default: boolean;
};
labelWidth: {
type: StringConstructor;
default: string;
};
gutter: {
type: NumberConstructor;
default: number;
};
showSearchLabel: {
type: BooleanConstructor;
default: () => boolean;
};
search: {
type: {
(arrayLength: number): (inputInnerType | selectInnerType | dateInnerType)[];
(...items: (inputInnerType | selectInnerType | dateInnerType)[]): (inputInnerType | selectInnerType | dateInnerType)[];
new (arrayLength: number): (inputInnerType | selectInnerType | dateInnerType)[];
new (...items: (inputInnerType | selectInnerType | dateInnerType)[]): (inputInnerType | selectInnerType | dateInnerType)[];
isArray(arg: any): arg is any[];
readonly prototype: any[];
from<T>(arrayLike: ArrayLike<T>): T[];
from<T, U>(arrayLike: ArrayLike<T>, mapfn: (v: T, k: number) => U, thisArg?: any): U[];
from<T>(iterable: Iterable<T> | ArrayLike<T>): T[];
from<T, U>(iterable: Iterable<T> | ArrayLike<T>, mapfn: (v: T, k: number) => U, thisArg?: any): U[];
of<T>(...items: T[]): T[];
fromAsync<T>(iterableOrArrayLike: AsyncIterable<T> | Iterable<T | PromiseLike<T>> | ArrayLike<T | PromiseLike<T>>): Promise<T[]>;
fromAsync<T, U>(iterableOrArrayLike: AsyncIterable<T> | Iterable<T> | ArrayLike<T>, mapFn: (value: Awaited<T>) => U, thisArg?: any): Promise<Awaited<U>[]>;
readonly [Symbol.species]: ArrayConstructor;
};
required: true;
};
searchButton: {
type: {
(arrayLength: number): (button_2 | refresh | search | searchRefresh)[];
(...items: (button_2 | refresh | search | searchRefresh)[]): (button_2 | refresh | search | searchRefresh)[];
new (arrayLength: number): (button_2 | refresh | search | searchRefresh)[];
new (...items: (button_2 | refresh | search | searchRefresh)[]): (button_2 | refresh | search | searchRefresh)[];
isArray(arg: any): arg is any[];
readonly prototype: any[];
from<T>(arrayLike: ArrayLike<T>): T[];
from<T, U>(arrayLike: ArrayLike<T>, mapfn: (v: T, k: number) => U, thisArg?: any): U[];
from<T>(iterable: Iterable<T> | ArrayLike<T>): T[];
from<T, U>(iterable: Iterable<T> | ArrayLike<T>, mapfn: (v: T, k: number) => U, thisArg?: any): U[];
of<T>(...items: T[]): T[];
fromAsync<T>(iterableOrArrayLike: AsyncIterable<T> | Iterable<T | PromiseLike<T>> | ArrayLike<T | PromiseLike<T>>): Promise<T[]>;
fromAsync<T, U>(iterableOrArrayLike: AsyncIterable<T> | Iterable<T> | ArrayLike<T>, mapFn: (value: Awaited<T>) => U, thisArg?: any): Promise<Awaited<U>[]>;
readonly [Symbol.species]: ArrayConstructor;
};
default: () => never[];
};
clearable: {
type: BooleanConstructor;
default: boolean;
};
searchValue: {
type: ObjectConstructor;
default: () => {};
};
isRefreshSearch: {
type: BooleanConstructor;
default: boolean;
};
}>, {
[x: number]: Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>;
length: number;
toString(): string;
toLocaleString(): string;
toLocaleString(locales: string | string[], options?: Intl.NumberFormatOptions & Intl.DateTimeFormatOptions): string;
pop(): Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}> | undefined;
push(...items: (Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>)[]): number;
concat(...items: ConcatArray<Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>>[]): (Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>)[];
concat(...items: (Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}> | ConcatArray<Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>>)[]): (Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>)[];
join(separator?: string): string;
reverse(): (Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>)[];
shift(): Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}> | undefined;
slice(start?: number, end?: number): (Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>)[];
sort(compareFn?: ((a: Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>, b: Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>) => number) | undefined): (Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>)[];
splice(start: number, deleteCount?: number): (Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>)[];
splice(start: number, deleteCount: number, ...items: (Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>)[]): (Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>)[];
unshift(...items: (Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>)[]): number;
indexOf(searchElement: Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>, fromIndex?: number): number;
lastIndexOf(searchElement: Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>, fromIndex?: number): number;
every<S extends Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>>(predicate: (value: Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>, index: number, array: (Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>)[]) => value is S, thisArg?: any): this is S[];
every(predicate: (value: Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>, index: number, array: (Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>)[]) => unknown, thisArg?: any): boolean;
some(predicate: (value: Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>, index: number, array: (Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>)[]) => unknown, thisArg?: any): boolean;
forEach(callbackfn: (value: Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>, index: number, array: (Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>)[]) => void, thisArg?: any): void;
map<U>(callbackfn: (value: Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>, index: number, array: (Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>)[]) => U, thisArg?: any): U[];
filter<S extends Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>>(predicate: (value: Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>, index: number, array: (Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>)[]) => value is S, thisArg?: any): S[];
filter(predicate: (value: Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>, index: number, array: (Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>)[]) => unknown, thisArg?: any): (Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>)[];
reduce(callbackfn: (previousValue: Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>, currentValue: Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>, currentIndex: number, array: (Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>)[]) => Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>): Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>;
reduce(callbackfn: (previousValue: Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>, currentValue: Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>, currentIndex: number, array: (Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>)[]) => Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>, initialValue: Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>): Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>;
reduce<U>(callbackfn: (previousValue: U, currentValue: Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>, currentIndex: number, array: (Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>)[]) => U, initialValue: U): U;
reduceRight(callbackfn: (previousValue: Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>, currentValue: Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>, currentIndex: number, array: (Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>)[]) => Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>): Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>;
reduceRight(callbackfn: (previousValue: Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>, currentValue: Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>, currentIndex: number, array: (Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>)[]) => Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>, initialValue: Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>): Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>;
reduceRight<U>(callbackfn: (previousValue: U, currentValue: Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>, currentIndex: number, array: (Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>)[]) => U, initialValue: U): U;
find<S extends Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>>(predicate: (value: Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>, index: number, obj: (Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>)[]) => value is S, thisArg?: any): S | undefined;
find(predicate: (value: Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>, index: number, obj: (Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>)[]) => unknown, thisArg?: any): Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}> | undefined;
findIndex(predicate: (value: Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>, index: number, obj: (Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>)[]) => unknown, thisArg?: any): number;
fill(value: Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>, start?: number, end?: number): (Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>)[];
copyWithin(target: number, start: number, end?: number): (Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>)[];
entries(): ArrayIterator<[number, Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>]>;
keys(): ArrayIterator<number>;
values(): ArrayIterator<Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>>;
includes(searchElement: Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>, fromIndex?: number): boolean;
flatMap<U, This = undefined>(callback: (this: This, value: Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>, index: number, array: (Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>)[]) => U | readonly U[], thisArg?: This | undefined): U[];
flat<A, D extends number = 1>(this: A, depth?: D | undefined): FlatArray<A, D>[];
at(index: number): Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}> | undefined;
findLast<S extends Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>>(predicate: (value: Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>, index: number, array: (Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>)[]) => value is S, thisArg?: any): S | undefined;
findLast(predicate: (value: Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>, index: number, array: (Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>)[]) => unknown, thisArg?: any): Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}> | undefined;
findLastIndex(predicate: (value: Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>, index: number, array: (Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>)[]) => unknown, thisArg?: any): number;
toReversed(): (Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>)[];
toSorted(compareFn?: ((a: Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>, b: Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>) => number) | undefined): (Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>)[];
toSpliced(start: number, deleteCount: number, ...items: (Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>)[]): (Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>)[];
toSpliced(start: number, deleteCount?: number): (Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>)[];
with(index: number, value: Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>): (Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>)[];
[Symbol.iterator](): ArrayIterator<Ref<null, null> | Ref<boolean, boolean> | Ref<    {
[name: string]: any;
}, {
[name: string]: any;
}>>;
[Symbol.unscopables]: {
[x: number]: boolean | undefined;
length?: boolean | undefined;
toString?: boolean | undefined;
toLocaleString?: boolean | undefined;
pop?: boolean | undefined;
push?: boolean | undefined;
concat?: boolean | undefined;
join?: boolean | undefined;
reverse?: boolean | undefined;
shift?: boolean | undefined;
slice?: boolean | undefined;
sort?: boolean | undefined;
splice?: boolean | undefined;
unshift?: boolean | undefined;
indexOf?: boolean | undefined;
lastIndexOf?: boolean | undefined;
every?: boolean | undefined;
some?: boolean | undefined;
forEach?: boolean | undefined;
map?: boolean | undefined;
filter?: boolean | undefined;
reduce?: boolean | undefined;
reduceRight?: boolean | undefined;
find?: boolean | undefined;
findIndex?: boolean | undefined;
fill?: boolean | undefined;
copyWithin?: boolean | undefined;
entries?: boolean | undefined;
keys?: boolean | undefined;
values?: boolean | undefined;
includes?: boolean | undefined;
flatMap?: boolean | undefined;
flat?: boolean | undefined;
at?: boolean | undefined;
findLast?: boolean | undefined;
findLastIndex?: boolean | undefined;
toReversed?: boolean | undefined;
toSorted?: boolean | undefined;
toSpliced?: boolean | undefined;
with?: boolean | undefined;
[Symbol.iterator]?: boolean | undefined;
readonly [Symbol.unscopables]?: boolean | undefined;
};
}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, any, string, PublicProps, any, {
labelWidth: string;
clearable: boolean;
language: Record<string, any>;
notNeedChangeCheck: String[];
showSearch: boolean;
defaultSearch: boolean;
gutter: number;
showSearchLabel: boolean;
searchButton: (button_2 | refresh | search | searchRefresh)[];
searchValue: Record<string, any>;
isRefreshSearch: boolean;
}, {}, {}, {}, string, ComponentProvideOptions, true, {
formPlusMain: HTMLDivElement;
formRef: any[];
buttons: HTMLDivElement;
}, HTMLDivElement>;

declare const __VLS_component_2: DefineComponent<ExtractPropTypes<    {
language: {
type: ObjectConstructor;
default: () => {
name: string;
el: {
breadcrumb: {
label: string;
};
colorpicker: {
confirm: string;
clear: string;
defaultLabel: string;
description: string;
alphaLabel: string;
};
datepicker: {
now: string;
today: string;
cancel: string;
clear: string;
confirm: string;
dateTablePrompt: string;
monthTablePrompt: string;
yearTablePrompt: string;
selectedDate: string;
selectDate: string;
selectTime: string;
startDate: string;
startTime: string;
endDate: string;
endTime: string;
prevYear: string;
nextYear: string;
prevMonth: string;
nextMonth: string;
year: string;
month1: string;
month2: string;
month3: string;
month4: string;
month5: string;
month6: string;
month7: string;
month8: string;
month9: string;
month10: string;
month11: string;
month12: string;
weeks: {
sun: string;
mon: string;
tue: string;
wed: string;
thu: string;
fri: string;
sat: string;
};
weeksFull: {
sun: string;
mon: string;
tue: string;
wed: string;
thu: string;
fri: string;
sat: string;
};
months: {
jan: string;
feb: string;
mar: string;
apr: string;
may: string;
jun: string;
jul: string;
aug: string;
sep: string;
oct: string;
nov: string;
dec: string;
};
};
inputNumber: {
decrease: string;
increase: string;
};
select: {
loading: string;
noMatch: string;
noData: string;
placeholder: string;
};
dropdown: {
toggleDropdown: string;
};
mention: {
loading: string;
};
cascader: {
noMatch: string;
loading: string;
placeholder: string;
noData: string;
};
pagination: {
goto: string;
pagesize: string;
total: string;
pageClassifier: string;
page: string;
prev: string;
next: string;
currentPage: string;
prevPages: string;
nextPages: string;
deprecationWarning: string;
};
dialog: {
close: string;
};
drawer: {
close: string;
};
messagebox: {
title: string;
confirm: string;
cancel: string;
error: string;
close: string;
};
upload: {
deleteTip: string;
delete: string;
preview: string;
continue: string;
};
slider: {
defaultLabel: string;
defaultRangeStartLabel: string;
defaultRangeEndLabel: string;
};
table: {
emptyText: string;
confirmFilter: string;
resetFilter: string;
clearFilter: string;
sumText: string;
};
tour: {
next: string;
previous: string;
finish: string;
close: string;
};
tree: {
emptyText: string;
};
transfer: {
noMatch: string;
noData: string;
titles: string[];
filterPlaceholder: string;
noCheckedFormat: string;
hasCheckedFormat: string;
};
image: {
error: string;
};
pageHeader: {
title: string;
};
popconfirm: {
confirmButtonText: string;
cancelButtonText: string;
};
carousel: {
leftArrow: string;
rightArrow: string;
indicator: string;
};
};
};
};
notNeedChangeCheck: {
type: {
(arrayLength: number): String[];
(...items: String[]): String[];
new (arrayLength: number): String[];
new (...items: String[]): String[];
isArray(arg: any): arg is any[];
readonly prototype: any[];
from<T>(arrayLike: ArrayLike<T>): T[];
from<T, U>(arrayLike: ArrayLike<T>, mapfn: (v: T, k: number) => U, thisArg?: any): U[];
from<T>(iterable: Iterable<T> | ArrayLike<T>): T[];
from<T, U>(iterable: Iterable<T> | ArrayLike<T>, mapfn: (v: T, k: number) => U, thisArg?: any): U[];
of<T>(...items: T[]): T[];
fromAsync<T>(iterableOrArrayLike: AsyncIterable<T> | Iterable<T | PromiseLike<T>> | ArrayLike<T | PromiseLike<T>>): Promise<T[]>;
fromAsync<T, U>(iterableOrArrayLike: AsyncIterable<T> | Iterable<T> | ArrayLike<T>, mapFn: (value: Awaited<T>) => U, thisArg?: any): Promise<Awaited<U>[]>;
readonly [Symbol.species]: ArrayConstructor;
};
default: () => string[];
};
submitButtonTxt: {
type: PropType<{
add: String;
edit: String;
}>;
default: () => {
add: string;
edit: string;
};
};
cancelButtonTxt: {
type: StringConstructor;
default: string;
};
width: {
type: StringConstructor;
default: string;
};
title: {
type: PropType<{
add: String;
edit: String;
}>;
default: () => {
add: string;
edit: string;
};
};
column: {
type: {
(arrayLength: number): (inputInnerType | switchInnerType | checkboxInnerType | radioInnerType | selectInnerType | dateInnerType)[];
(...items: (inputInnerType | switchInnerType | checkboxInnerType | radioInnerType | selectInnerType | dateInnerType)[]): (inputInnerType | switchInnerType | checkboxInnerType | radioInnerType | selectInnerType | dateInnerType)[];
new (arrayLength: number): (inputInnerType | switchInnerType | checkboxInnerType | radioInnerType | selectInnerType | dateInnerType)[];
new (...items: (inputInnerType | switchInnerType | checkboxInnerType | radioInnerType | selectInnerType | dateInnerType)[]): (inputInnerType | switchInnerType | checkboxInnerType | radioInnerType | selectInnerType | dateInnerType)[];
isArray(arg: any): arg is any[];
readonly prototype: any[];
from<T>(arrayLike: ArrayLike<T>): T[];
from<T, U>(arrayLike: ArrayLike<T>, mapfn: (v: T, k: number) => U, thisArg?: any): U[];
from<T>(iterable: Iterable<T> | ArrayLike<T>): T[];
from<T, U>(iterable: Iterable<T> | ArrayLike<T>, mapfn: (v: T, k: number) => U, thisArg?: any): U[];
of<T>(...items: T[]): T[];
fromAsync<T>(iterableOrArrayLike: AsyncIterable<T> | Iterable<T | PromiseLike<T>> | ArrayLike<T | PromiseLike<T>>): Promise<T[]>;
fromAsync<T, U>(iterableOrArrayLike: AsyncIterable<T> | Iterable<T> | ArrayLike<T>, mapFn: (value: Awaited<T>) => U, thisArg?: any): Promise<Awaited<U>[]>;
readonly [Symbol.species]: ArrayConstructor;
};
required: true;
};
inline: {
type: BooleanConstructor;
default: boolean;
};
labelPosition: {
type: PropType<"left" | "right" | "top">;
default: string;
};
labelWidth: {
type: (StringConstructor | NumberConstructor)[];
default: string;
};
labelSuffix: {
type: StringConstructor;
default: string;
};
hideRequiredAsterisk: {
type: BooleanConstructor;
default: boolean;
};
requireAsteriskPosition: {
type: PropType<"left" | "right">;
default: string;
};
showMessage: {
type: BooleanConstructor;
default: boolean;
};
inlineMessage: {
type: BooleanConstructor;
default: boolean;
};
statusIcon: {
type: BooleanConstructor;
default: boolean;
};
validateOnRuleChange: {
type: BooleanConstructor;
default: boolean;
};
size: {
type: PropType<"" | "large" | "default" | "small">;
default: string;
};
disabled: {
type: BooleanConstructor;
default: boolean;
};
scrollToError: {
type: BooleanConstructor;
default: boolean;
};
duration: {
type: NumberConstructor;
default: number;
validator(value: number): boolean;
};
message: {
type: StringConstructor;
default: string;
};
autoUpdate: {
type: FunctionConstructor[];
default: () => undefined;
};
}>, {
init: (data?: object, add?: boolean | undefined, openCb?: () => void) => void;
close: () => void;
updateData: (prop: string, data: any) => void;
}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {
close: (...args: any[]) => void;
submit: (...args: any[]) => void;
}, string, PublicProps, Readonly<ExtractPropTypes<    {
language: {
type: ObjectConstructor;
default: () => {
name: string;
el: {
breadcrumb: {
label: string;
};
colorpicker: {
confirm: string;
clear: string;
defaultLabel: string;
description: string;
alphaLabel: string;
};
datepicker: {
now: string;
today: string;
cancel: string;
clear: string;
confirm: string;
dateTablePrompt: string;
monthTablePrompt: string;
yearTablePrompt: string;
selectedDate: string;
selectDate: string;
selectTime: string;
startDate: string;
startTime: string;
endDate: string;
endTime: string;
prevYear: string;
nextYear: string;
prevMonth: string;
nextMonth: string;
year: string;
month1: string;
month2: string;
month3: string;
month4: string;
month5: string;
month6: string;
month7: string;
month8: string;
month9: string;
month10: string;
month11: string;
month12: string;
weeks: {
sun: string;
mon: string;
tue: string;
wed: string;
thu: string;
fri: string;
sat: string;
};
weeksFull: {
sun: string;
mon: string;
tue: string;
wed: string;
thu: string;
fri: string;
sat: string;
};
months: {
jan: string;
feb: string;
mar: string;
apr: string;
may: string;
jun: string;
jul: string;
aug: string;
sep: string;
oct: string;
nov: string;
dec: string;
};
};
inputNumber: {
decrease: string;
increase: string;
};
select: {
loading: string;
noMatch: string;
noData: string;
placeholder: string;
};
dropdown: {
toggleDropdown: string;
};
mention: {
loading: string;
};
cascader: {
noMatch: string;
loading: string;
placeholder: string;
noData: string;
};
pagination: {
goto: string;
pagesize: string;
total: string;
pageClassifier: string;
page: string;
prev: string;
next: string;
currentPage: string;
prevPages: string;
nextPages: string;
deprecationWarning: string;
};
dialog: {
close: string;
};
drawer: {
close: string;
};
messagebox: {
title: string;
confirm: string;
cancel: string;
error: string;
close: string;
};
upload: {
deleteTip: string;
delete: string;
preview: string;
continue: string;
};
slider: {
defaultLabel: string;
defaultRangeStartLabel: string;
defaultRangeEndLabel: string;
};
table: {
emptyText: string;
confirmFilter: string;
resetFilter: string;
clearFilter: string;
sumText: string;
};
tour: {
next: string;
previous: string;
finish: string;
close: string;
};
tree: {
emptyText: string;
};
transfer: {
noMatch: string;
noData: string;
titles: string[];
filterPlaceholder: string;
noCheckedFormat: string;
hasCheckedFormat: string;
};
image: {
error: string;
};
pageHeader: {
title: string;
};
popconfirm: {
confirmButtonText: string;
cancelButtonText: string;
};
carousel: {
leftArrow: string;
rightArrow: string;
indicator: string;
};
};
};
};
notNeedChangeCheck: {
type: {
(arrayLength: number): String[];
(...items: String[]): String[];
new (arrayLength: number): String[];
new (...items: String[]): String[];
isArray(arg: any): arg is any[];
readonly prototype: any[];
from<T>(arrayLike: ArrayLike<T>): T[];
from<T, U>(arrayLike: ArrayLike<T>, mapfn: (v: T, k: number) => U, thisArg?: any): U[];
from<T>(iterable: Iterable<T> | ArrayLike<T>): T[];
from<T, U>(iterable: Iterable<T> | ArrayLike<T>, mapfn: (v: T, k: number) => U, thisArg?: any): U[];
of<T>(...items: T[]): T[];
fromAsync<T>(iterableOrArrayLike: AsyncIterable<T> | Iterable<T | PromiseLike<T>> | ArrayLike<T | PromiseLike<T>>): Promise<T[]>;
fromAsync<T, U>(iterableOrArrayLike: AsyncIterable<T> | Iterable<T> | ArrayLike<T>, mapFn: (value: Awaited<T>) => U, thisArg?: any): Promise<Awaited<U>[]>;
readonly [Symbol.species]: ArrayConstructor;
};
default: () => string[];
};
submitButtonTxt: {
type: PropType<{
add: String;
edit: String;
}>;
default: () => {
add: string;
edit: string;
};
};
cancelButtonTxt: {
type: StringConstructor;
default: string;
};
width: {
type: StringConstructor;
default: string;
};
title: {
type: PropType<{
add: String;
edit: String;
}>;
default: () => {
add: string;
edit: string;
};
};
column: {
type: {
(arrayLength: number): (inputInnerType | switchInnerType | checkboxInnerType | radioInnerType | selectInnerType | dateInnerType)[];
(...items: (inputInnerType | switchInnerType | checkboxInnerType | radioInnerType | selectInnerType | dateInnerType)[]): (inputInnerType | switchInnerType | checkboxInnerType | radioInnerType | selectInnerType | dateInnerType)[];
new (arrayLength: number): (inputInnerType | switchInnerType | checkboxInnerType | radioInnerType | selectInnerType | dateInnerType)[];
new (...items: (inputInnerType | switchInnerType | checkboxInnerType | radioInnerType | selectInnerType | dateInnerType)[]): (inputInnerType | switchInnerType | checkboxInnerType | radioInnerType | selectInnerType | dateInnerType)[];
isArray(arg: any): arg is any[];
readonly prototype: any[];
from<T>(arrayLike: ArrayLike<T>): T[];
from<T, U>(arrayLike: ArrayLike<T>, mapfn: (v: T, k: number) => U, thisArg?: any): U[];
from<T>(iterable: Iterable<T> | ArrayLike<T>): T[];
from<T, U>(iterable: Iterable<T> | ArrayLike<T>, mapfn: (v: T, k: number) => U, thisArg?: any): U[];
of<T>(...items: T[]): T[];
fromAsync<T>(iterableOrArrayLike: AsyncIterable<T> | Iterable<T | PromiseLike<T>> | ArrayLike<T | PromiseLike<T>>): Promise<T[]>;
fromAsync<T, U>(iterableOrArrayLike: AsyncIterable<T> | Iterable<T> | ArrayLike<T>, mapFn: (value: Awaited<T>) => U, thisArg?: any): Promise<Awaited<U>[]>;
readonly [Symbol.species]: ArrayConstructor;
};
required: true;
};
inline: {
type: BooleanConstructor;
default: boolean;
};
labelPosition: {
type: PropType<"left" | "right" | "top">;
default: string;
};
labelWidth: {
type: (StringConstructor | NumberConstructor)[];
default: string;
};
labelSuffix: {
type: StringConstructor;
default: string;
};
hideRequiredAsterisk: {
type: BooleanConstructor;
default: boolean;
};
requireAsteriskPosition: {
type: PropType<"left" | "right">;
default: string;
};
showMessage: {
type: BooleanConstructor;
default: boolean;
};
inlineMessage: {
type: BooleanConstructor;
default: boolean;
};
statusIcon: {
type: BooleanConstructor;
default: boolean;
};
validateOnRuleChange: {
type: BooleanConstructor;
default: boolean;
};
size: {
type: PropType<"" | "large" | "default" | "small">;
default: string;
};
disabled: {
type: BooleanConstructor;
default: boolean;
};
scrollToError: {
type: BooleanConstructor;
default: boolean;
};
duration: {
type: NumberConstructor;
default: number;
validator(value: number): boolean;
};
message: {
type: StringConstructor;
default: string;
};
autoUpdate: {
type: FunctionConstructor[];
default: () => undefined;
};
}>> & Readonly<{
onClose?: ((...args: any[]) => any) | undefined;
onSubmit?: ((...args: any[]) => any) | undefined;
}>, {
width: string;
title: {
add: String;
edit: String;
};
message: string;
labelPosition: "top" | "left" | "right";
labelWidth: string | number;
showMessage: boolean;
inlineMessage: boolean;
size: "" | "large" | "default" | "small";
disabled: boolean;
language: Record<string, any>;
notNeedChangeCheck: String[];
duration: number;
submitButtonTxt: {
add: String;
edit: String;
};
cancelButtonTxt: string;
inline: boolean;
labelSuffix: string;
hideRequiredAsterisk: boolean;
requireAsteriskPosition: "left" | "right";
statusIcon: boolean;
validateOnRuleChange: boolean;
scrollToError: boolean;
autoUpdate: Function;
}, {}, {}, {}, string, ComponentProvideOptions, true, any, any>;

declare const __VLS_component_3: DefineComponent<ExtractPropTypes<    {
language: {
type: ObjectConstructor;
default: () => {
name: string;
el: {
breadcrumb: {
label: string;
};
colorpicker: {
confirm: string;
clear: string;
defaultLabel: string;
description: string;
alphaLabel: string;
};
datepicker: {
now: string;
today: string;
cancel: string;
clear: string;
confirm: string;
dateTablePrompt: string;
monthTablePrompt: string;
yearTablePrompt: string;
selectedDate: string;
selectDate: string;
selectTime: string;
startDate: string;
startTime: string;
endDate: string;
endTime: string;
prevYear: string;
nextYear: string;
prevMonth: string;
nextMonth: string;
year: string;
month1: string;
month2: string;
month3: string;
month4: string;
month5: string;
month6: string;
month7: string;
month8: string;
month9: string;
month10: string;
month11: string;
month12: string;
weeks: {
sun: string;
mon: string;
tue: string;
wed: string;
thu: string;
fri: string;
sat: string;
};
weeksFull: {
sun: string;
mon: string;
tue: string;
wed: string;
thu: string;
fri: string;
sat: string;
};
months: {
jan: string;
feb: string;
mar: string;
apr: string;
may: string;
jun: string;
jul: string;
aug: string;
sep: string;
oct: string;
nov: string;
dec: string;
};
};
inputNumber: {
decrease: string;
increase: string;
};
select: {
loading: string;
noMatch: string;
noData: string;
placeholder: string;
};
dropdown: {
toggleDropdown: string;
};
mention: {
loading: string;
};
cascader: {
noMatch: string;
loading: string;
placeholder: string;
noData: string;
};
pagination: {
goto: string;
pagesize: string;
total: string;
pageClassifier: string;
page: string;
prev: string;
next: string;
currentPage: string;
prevPages: string;
nextPages: string;
deprecationWarning: string;
};
dialog: {
close: string;
};
drawer: {
close: string;
};
messagebox: {
title: string;
confirm: string;
cancel: string;
error: string;
close: string;
};
upload: {
deleteTip: string;
delete: string;
preview: string;
continue: string;
};
slider: {
defaultLabel: string;
defaultRangeStartLabel: string;
defaultRangeEndLabel: string;
};
table: {
emptyText: string;
confirmFilter: string;
resetFilter: string;
clearFilter: string;
sumText: string;
};
tour: {
next: string;
previous: string;
finish: string;
close: string;
};
tree: {
emptyText: string;
};
transfer: {
noMatch: string;
noData: string;
titles: string[];
filterPlaceholder: string;
noCheckedFormat: string;
hasCheckedFormat: string;
};
image: {
error: string;
};
pageHeader: {
title: string;
};
popconfirm: {
confirmButtonText: string;
cancelButtonText: string;
};
carousel: {
leftArrow: string;
rightArrow: string;
indicator: string;
};
};
};
};
width: {
type: StringConstructor;
default: string;
};
labelWidth: {
type: StringConstructor;
default: string;
};
title: {
type: StringConstructor;
default: string;
};
desBorder: {
type: BooleanConstructor;
default: boolean;
};
desColumn: {
type: NumberConstructor;
default: number;
};
desDirection: {
type: PropType<"vertical" | "horizontal">;
default: string;
};
desSize: {
type: PropType<"" | "large" | "default" | "small">;
default: string;
};
desTitle: {
type: StringConstructor;
default: string;
};
desExtra: {
type: StringConstructor;
default: string;
};
column: {
type: {
(arrayLength: number): columnType_2[];
(...items: columnType_2[]): columnType_2[];
new (arrayLength: number): columnType_2[];
new (...items: columnType_2[]): columnType_2[];
isArray(arg: any): arg is any[];
readonly prototype: any[];
from<T>(arrayLike: ArrayLike<T>): T[];
from<T, U>(arrayLike: ArrayLike<T>, mapfn: (v: T, k: number) => U, thisArg?: any): U[];
from<T>(iterable: Iterable<T> | ArrayLike<T>): T[];
from<T, U>(iterable: Iterable<T> | ArrayLike<T>, mapfn: (v: T, k: number) => U, thisArg?: any): U[];
of<T>(...items: T[]): T[];
fromAsync<T>(iterableOrArrayLike: AsyncIterable<T> | Iterable<T | PromiseLike<T>> | ArrayLike<T | PromiseLike<T>>): Promise<T[]>;
fromAsync<T, U>(iterableOrArrayLike: AsyncIterable<T> | Iterable<T> | ArrayLike<T>, mapFn: (value: Awaited<T>) => U, thisArg?: any): Promise<Awaited<U>[]>;
readonly [Symbol.species]: ArrayConstructor;
};
required: true;
};
}>, {
init: (data: (typeof columnFinal.value)[number]["prop"], openCb?: () => void) => void;
handleClose: (cb: () => void) => void;
}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {
close: (...args: any[]) => void;
}, string, PublicProps, Readonly<ExtractPropTypes<    {
language: {
type: ObjectConstructor;
default: () => {
name: string;
el: {
breadcrumb: {
label: string;
};
colorpicker: {
confirm: string;
clear: string;
defaultLabel: string;
description: string;
alphaLabel: string;
};
datepicker: {
now: string;
today: string;
cancel: string;
clear: string;
confirm: string;
dateTablePrompt: string;
monthTablePrompt: string;
yearTablePrompt: string;
selectedDate: string;
selectDate: string;
selectTime: string;
startDate: string;
startTime: string;
endDate: string;
endTime: string;
prevYear: string;
nextYear: string;
prevMonth: string;
nextMonth: string;
year: string;
month1: string;
month2: string;
month3: string;
month4: string;
month5: string;
month6: string;
month7: string;
month8: string;
month9: string;
month10: string;
month11: string;
month12: string;
weeks: {
sun: string;
mon: string;
tue: string;
wed: string;
thu: string;
fri: string;
sat: string;
};
weeksFull: {
sun: string;
mon: string;
tue: string;
wed: string;
thu: string;
fri: string;
sat: string;
};
months: {
jan: string;
feb: string;
mar: string;
apr: string;
may: string;
jun: string;
jul: string;
aug: string;
sep: string;
oct: string;
nov: string;
dec: string;
};
};
inputNumber: {
decrease: string;
increase: string;
};
select: {
loading: string;
noMatch: string;
noData: string;
placeholder: string;
};
dropdown: {
toggleDropdown: string;
};
mention: {
loading: string;
};
cascader: {
noMatch: string;
loading: string;
placeholder: string;
noData: string;
};
pagination: {
goto: string;
pagesize: string;
total: string;
pageClassifier: string;
page: string;
prev: string;
next: string;
currentPage: string;
prevPages: string;
nextPages: string;
deprecationWarning: string;
};
dialog: {
close: string;
};
drawer: {
close: string;
};
messagebox: {
title: string;
confirm: string;
cancel: string;
error: string;
close: string;
};
upload: {
deleteTip: string;
delete: string;
preview: string;
continue: string;
};
slider: {
defaultLabel: string;
defaultRangeStartLabel: string;
defaultRangeEndLabel: string;
};
table: {
emptyText: string;
confirmFilter: string;
resetFilter: string;
clearFilter: string;
sumText: string;
};
tour: {
next: string;
previous: string;
finish: string;
close: string;
};
tree: {
emptyText: string;
};
transfer: {
noMatch: string;
noData: string;
titles: string[];
filterPlaceholder: string;
noCheckedFormat: string;
hasCheckedFormat: string;
};
image: {
error: string;
};
pageHeader: {
title: string;
};
popconfirm: {
confirmButtonText: string;
cancelButtonText: string;
};
carousel: {
leftArrow: string;
rightArrow: string;
indicator: string;
};
};
};
};
width: {
type: StringConstructor;
default: string;
};
labelWidth: {
type: StringConstructor;
default: string;
};
title: {
type: StringConstructor;
default: string;
};
desBorder: {
type: BooleanConstructor;
default: boolean;
};
desColumn: {
type: NumberConstructor;
default: number;
};
desDirection: {
type: PropType<"vertical" | "horizontal">;
default: string;
};
desSize: {
type: PropType<"" | "large" | "default" | "small">;
default: string;
};
desTitle: {
type: StringConstructor;
default: string;
};
desExtra: {
type: StringConstructor;
default: string;
};
column: {
type: {
(arrayLength: number): columnType_2[];
(...items: columnType_2[]): columnType_2[];
new (arrayLength: number): columnType_2[];
new (...items: columnType_2[]): columnType_2[];
isArray(arg: any): arg is any[];
readonly prototype: any[];
from<T>(arrayLike: ArrayLike<T>): T[];
from<T, U>(arrayLike: ArrayLike<T>, mapfn: (v: T, k: number) => U, thisArg?: any): U[];
from<T>(iterable: Iterable<T> | ArrayLike<T>): T[];
from<T, U>(iterable: Iterable<T> | ArrayLike<T>, mapfn: (v: T, k: number) => U, thisArg?: any): U[];
of<T>(...items: T[]): T[];
fromAsync<T>(iterableOrArrayLike: AsyncIterable<T> | Iterable<T | PromiseLike<T>> | ArrayLike<T | PromiseLike<T>>): Promise<T[]>;
fromAsync<T, U>(iterableOrArrayLike: AsyncIterable<T> | Iterable<T> | ArrayLike<T>, mapFn: (value: Awaited<T>) => U, thisArg?: any): Promise<Awaited<U>[]>;
readonly [Symbol.species]: ArrayConstructor;
};
required: true;
};
}>> & Readonly<{
onClose?: ((...args: any[]) => any) | undefined;
}>, {
width: string;
title: string;
labelWidth: string;
language: Record<string, any>;
desBorder: boolean;
desColumn: number;
desDirection: "horizontal" | "vertical";
desSize: "" | "large" | "default" | "small";
desTitle: string;
desExtra: string;
}, {}, {}, {}, string, ComponentProvideOptions, true, {
myDialog: unknown;
}, any>;

declare const __VLS_component_4: DefineComponent<ExtractPropTypes<    {
title: StringConstructor;
width: {
type: (StringConstructor | NumberConstructor)[];
default: string;
};
}>, {
init: () => void;
handleClose: () => void;
}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {
beforeClose: (...args: any[]) => void;
}, string, PublicProps, Readonly<ExtractPropTypes<    {
title: StringConstructor;
width: {
type: (StringConstructor | NumberConstructor)[];
default: string;
};
}>> & Readonly<{
onBeforeClose?: ((...args: any[]) => any) | undefined;
}>, {
width: string | number;
}, {}, {}, {}, string, ComponentProvideOptions, true, {}, any>;

declare function __VLS_template(): {
    attrs: Partial<{}>;
    slots: void;
    refs: {
        formPlusMain: HTMLDivElement;
        formRef: any[];
        buttons: HTMLDivElement;
    };
    rootEl: HTMLDivElement;
};

declare function __VLS_template_2(): any;

declare function __VLS_template_3(): {
    attrs: Partial<{}>;
    slots: Partial<Record<string, (_: {
        prop: any;
        nowData: any;
        row: any;
    }) => any>> & Partial<Record<any, (_: {
        prop: any;
        nowData: any;
        row: any;
    }) => any>> & {
        footer?(_: {
            data: any;
        }): any;
    };
    refs: {
        myDialog: unknown;
    };
    rootEl: any;
};

declare function __VLS_template_4(): any;

declare type __VLS_TemplateResult = ReturnType<typeof __VLS_template>;

declare type __VLS_TemplateResult_2 = ReturnType<typeof __VLS_template_2>;

declare type __VLS_TemplateResult_3 = ReturnType<typeof __VLS_template_3>;

declare type __VLS_TemplateResult_4 = ReturnType<typeof __VLS_template_4>;

declare type __VLS_WithTemplateSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};

declare type __VLS_WithTemplateSlots_2<T, S> = T & {
    new (): {
        $slots: S;
    };
};

declare type __VLS_WithTemplateSlots_3<T, S> = T & {
    new (): {
        $slots: S;
    };
};

declare type __VLS_WithTemplateSlots_4<T, S> = T & {
    new (): {
        $slots: S;
    };
};

declare type button = 'large' | 'default' | 'small';

declare interface button_2 {
    type: 'button' | 'refresh' | 'search' | 'search-refresh';
    size?: string;
    icon?: string;
    inputType?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text';
    clickFun?: (data: queryInnerType) => {};
    span?: number;
    label?: string;
    fun: string;
}

declare interface checkBoxButtonType {
    change?: (value: string | number | boolean) => void;
    trueValue?: string | number;
    falseValue?: string | number;
    disabled?: boolean;
    size?: button;
    name?: string;
    checked?: boolean;
}

declare interface checkboxGroupType {
    min?: number;
    max?: number;
    textColor?: string;
    fill?: string;
    tag?: string;
    validateEvent?: boolean;
    options: Array<{
        label: string;
        value: string | number;
        disabled?: boolean;
    }> | number;
    config?: checkBoxButtonType | checkBoxType;
    change?: (value: (string | number)[]) => void;
}

export declare interface checkboxInnerType extends columnType, checkboxGroupType {
}

declare interface checkBoxType {
    trueValue?: string | number;
    falseValue?: string | number;
    border?: boolean;
    size?: button;
    name?: string;
    disabled?: boolean;
    checked?: boolean;
    indeterminate?: boolean;
    validateEvent?: boolean;
    tabindex?: string | number;
    id?: string;
    ariaControls?: string;
}

declare const columnFinal: ComputedRef<any>;

declare interface columnType {
    prop: string;
    label: string;
    labelPosition?: '' | 'left' | 'right' | 'top';
    labelWidth?: string | number;
    isForm?: boolean;
    isTable?: boolean;
    error?: string;
    showMessage?: boolean;
    inlineMessage?: string | boolean;
    type: 'input' | 'date' | 'radio' | 'select' | 'switch' | 'checkbox';
    span?: number;
    for?: string;
    readonly?: boolean | ((data: any) => boolean);
    validateStatus?: '' | 'error' | 'validating' | 'success';
    isDefault?: boolean;
    isRequired?: boolean | ruleKeys | ((rule: any, value: any, callback: any) => void);
    dynamicRequired?: (data: any) => boolean;
    size?: button;
    disabled?: boolean | ((data: any) => boolean);
    clearable?: boolean;
    showLabel?: boolean;
    showFun?: (dataForm: any) => boolean;
    slotName?: string;
}

declare interface columnType_2 {
    prop: string;
    label: string;
    span?: number;
    rowspan?: number;
    width?: string | number;
    minWidth?: string | number;
    align?: 'left' | 'center' | 'right';
    labelAlign?: 'left' | 'center' | 'right';
    className?: string;
    labelClassName?: string;
    fun?: (row: any, prop: string) => string | number;
    showFun?: (row: any, prop: string) => boolean;
    isForm?: boolean;
}

export declare interface dateInnerType extends columnType, dateType {
}

declare interface dateType {
    startPlaceholder?: string;
    rangeSeparator?: string;
    endPlaceholder?: string;
    aliases?: string;
    editable?: boolean;
    valueFormat?: string;
    format?: string;
    dateType?: 'year' | 'years' | 'yearrange' | 'month' | 'date' | 'dates' | 'datetime' | 'week' | 'datetimerange' | 'daterange' | 'monthrange';
    change?: (val: any) => void;
    blur?: (e: FocusEvent) => void;
    focus?: (e: FocusEvent) => void;
    clear?: () => void;
    calendarChange?: (val: [Date, null | Date]) => void;
    panelChange?: (date: Date | [Date, Date], mode: 'month' | 'year', view?: string) => void;
    visibleChange?: (visibility: boolean) => void;
}

declare const _default: {
    install(app: App, prefix: string): void;
};
export default _default;

declare const _default_2: __VLS_WithTemplateSlots<typeof __VLS_component, __VLS_TemplateResult["slots"]>;

declare const _default_3: __VLS_WithTemplateSlots_2<typeof __VLS_component_2, __VLS_TemplateResult_2["slots"]>;

declare const _default_4: __VLS_WithTemplateSlots_3<typeof __VLS_component_3, __VLS_TemplateResult_3["slots"]>;

declare const _default_5: __VLS_WithTemplateSlots_4<typeof __VLS_component_4, __VLS_TemplateResult_4["slots"]>;

export declare interface inputInnerType extends columnType, inputType {
}

declare interface inputType {
    inputType?: 'text' | 'textarea' | 'password' | 'number';
    maxlength?: string | number;
    minlength?: string | number;
    showWordLimit?: boolean;
    placeholder?: string;
    showPassword?: boolean;
    prefixIcon?: string;
    suffixIcon?: string;
    rows?: number;
    autosize?: boolean | object;
    autocomplete?: string;
    name?: string;
    max?: any;
    min?: any;
    step?: any;
    resize?: 'none' | 'both' | 'horizontal' | 'vertical';
    autofocus?: boolean;
    form?: string;
    validateEvent?: boolean;
    inputStyle?: string | object;
    blur?: (event: FocusEvent) => void;
    focus?: (event: FocusEvent) => void;
    change?: (value: string | number) => void;
    input?: (value: string | number) => void;
    clear?: () => void;
}

export declare const MyDetail: typeof _default_4;

export declare type MyDetailInstance = InstanceType<typeof _default_4>;

export declare const MyDialog: typeof _default_5;

export declare type MyDialogInstance = InstanceType<typeof _default_5>;

export declare const MyEdit: typeof _default_3;

export declare type MyEditInstance = InstanceType<typeof _default_3>;

export declare const MyForm: typeof _default_2;

export declare type MyFormInstance = InstanceType<typeof _default_2>;

export declare const MyTable: typeof default_2;

export declare type MyTableInstance = InstanceType<typeof default_2>;

declare interface queryInnerType extends queryParamType {
    pageSize: number;
    pageNum: number;
}

declare interface queryParamType {
    [key: string]: string | number | undefined | boolean | string[] | number[] | boolean[];
}

declare interface radioButtonType {
    value?: string | number;
    label?: string;
    disabled?: boolean;
    name?: string;
}

declare interface radioGroupType {
    textColor?: string;
    fill?: string;
    validateEvent?: boolean;
    options: Array<{
        label: string;
        value: string | number;
        disabled?: boolean;
    }> | number;
    config?: radioButtonType | radioType;
    change?: (value: string | number | boolean) => void;
}

export declare interface radioInnerType extends columnType, radioGroupType {
}

declare interface radioType {
    change?: (value: string | number | boolean) => void;
    value?: string | number;
    label?: string;
    disabled?: boolean;
    border?: boolean;
    size?: button;
    name?: string;
}

declare interface refresh extends button_2 {
    fun: 'refresh';
}

declare type requiredType = {
    trigger?: trigger;
    type?: ruleType;
} & ({
    max?: number;
    min?: number;
} | {
    required: boolean;
    message: string;
} | {
    pattern: string | RegExp;
    message: string;
} | {
    type: 'number';
} | {
    validator: ((rule: any, value: any, callback: any) => void) | undefined;
});

declare type ruleKeys = keyof RulesType;

declare interface RulesType {
    notEmpty: requiredType[];
    strRequired: requiredType[];
    strNoSpace: requiredType[];
    selects: requiredType[];
    phone: requiredType[];
    idNo: requiredType[];
    str: requiredType[];
    number: requiredType[];
    numberZero: requiredType[];
    decimal: requiredType[];
    ruleIp: requiredType[];
    ruleExtCellEmun: requiredType[];
    password: requiredType[];
}

declare type ruleType = 'string' | //: Must be of type string. This is the default type.
'number' | //: Must be of type number.
'boolean' | //: Must be of type boolean.
'method' | //: Must be of type function.
'regexp' | //: Must be an instance of RegExp or a string that does not generate an exception when creating a new RegExp.
'integer' | //: Must be of type number and an integer.
'float' | //: Must be of type number and a floating point number.
'array' | //: Must be an array as determined by Array.isArray.
'object' | //: Must be of type object and not Array.isArray.
'enum' | //: Value must exist in the enum.
'date' | //: Value must be valid as determined by Date
'url' | //: Must be of type url.
'hex' | //: Must be of type hex.
'email' | //: Must be of type email.
'any';

declare interface search extends button_2 {
    fun: 'search';
}

declare interface searchRefresh extends button_2 {
    searchLabel: string;
    refreshLabel: string;
    fun: 'search';
}

export declare interface selectInnerType extends columnType, selectType {
}

declare interface selectOptionsGroupType {
    label: string;
    disabled?: boolean;
    options: selectOptionsType[];
}

declare interface selectOptionsType {
    value: string | number | boolean | object;
    label: string | number;
    disabled?: boolean;
}

declare interface selectType {
    multiple?: boolean;
    valueKey?: string;
    collapseTags?: boolean;
    collapseTagsTooltip?: boolean;
    multipleLimit?: number;
    name?: string;
    effect?: 'dark' | 'light' | string;
    autocomplete?: string;
    filterable?: boolean;
    allowCreate?: boolean;
    filterMethod?: () => void;
    remote?: boolean;
    remoteMethod?: () => void;
    remoteShowSuffix?: boolean;
    loading?: boolean;
    loadingText?: string;
    noMatchText?: string;
    noDataText?: string;
    popperClass?: string;
    reserveKeyword?: boolean;
    defaultFirstOption?: boolean;
    teleported?: boolean;
    appendTo?: string;
    persistent?: boolean;
    automaticDropdown?: boolean;
    clearIcon?: string | object;
    fitInputWidth?: boolean;
    suffixIcon?: string | object;
    tagType?: '' | 'success' | 'info' | 'warning' | 'danger';
    tagEffect?: '' | 'light' | 'dark' | 'plain';
    validateEvent?: boolean;
    placement?: 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end';
    fallbackPlacements?: any[];
    maxCollapseTags?: number;
    popperOptions?: object;
    emptyValues?: any[];
    options: selectOptionsGroupType[] | selectOptionsType[] | number;
    focus?: (event: FocusEvent) => void;
    blur?: (event: FocusEvent) => void;
    clear?: () => void;
    removeTag?: (tagValue: any) => void;
    visibleChange?: (visible: boolean) => void;
    change?: (value: any) => void;
}

export declare interface switchInnerType extends columnType, switchType {
}

declare interface switchType {
    loading?: boolean;
    width?: string | number;
    inlinePrompt?: boolean;
    activeIcon?: string;
    inactiveIcon?: string;
    activeActionIcon?: string;
    inactiveActionIcon?: string;
    activeText?: string;
    inactiveText?: string;
    activeValue?: boolean | string | number;
    inactiveValue?: boolean | string | number;
    name?: string;
    validateEvent?: boolean;
    beforeChange?: boolean | (() => Promise<boolean>);
    id?: string;
    tabindex?: string | number;
    change?: (val: boolean | string | number) => void;
}

declare type trigger = 'blur' | 'change';

export { }

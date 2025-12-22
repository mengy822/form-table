export default class FunctionAnalyzer {
  /**
   * 获取函数参数信息
   * @param {Function} fn - 要分析的函数
   * @returns {Object} 参数信息对象
   */
  static analyzeParameters(fn) {
    if (typeof fn !== 'function') {
      throw new TypeError('参数必须是函数');
    }
    
    const funcString = this.cleanFunctionString(fn.toString());
    const params = this.extractParameters(funcString);
    
    return {
      // 基本信息
      name: fn.name || 'anonymous',
      isAsync: funcString.startsWith('async'),
      isGenerator: funcString.includes('*'),
      isArrow: !funcString.startsWith('function'),
      
      // 参数信息
      parameterCount: params.length,
      parameters: params,
      hasDefaultValues: params.some(p => p.hasDefault),
      hasRestParameter: params.some(p => p.isRest),
      hasDestructuring: params.some(p => p.isDestructured),
      
      // 原始信息
      length: fn.length,
      string: fn.toString()
    };
  }
  
  /**
   * 清理函数字符串
   */
  static cleanFunctionString(str) {
    // 移除换行和多余空格
    let cleaned = str
      .replace(/\s+/g, ' ')
      .trim();
    
    // 移除注释
    cleaned = cleaned
      .replace(/\/\/.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '');
    
    return cleaned;
  }
  
  /**
   * 提取参数信息
   */
  static extractParameters(funcString) {
    const paramMatch = this.matchParameters(funcString);
    if (!paramMatch) return [];
    
    const paramString = paramMatch[1] || paramMatch[2] || '';
    if (!paramString.trim()) return [];
    
    const paramTokens = this.tokenizeParameters(paramString);
    return this.parseParameters(paramTokens);
  }
  
  /**
   * 匹配参数部分
   */
  static matchParameters(str) {
    // 匹配普通函数
    const funcRegex = /^(?:async\s+)?(?:function(?:\s+\w+)?\s*|\w+\s*=\s*)?\(([^)]*)\)/;
    const funcMatch = str.match(funcRegex);
    if (funcMatch) return funcMatch;
    
    // 匹配箭头函数（带括号）
    const arrowWithParens = /^(?:async\s+)?\(([^)]*)\)\s*=>/;
    const arrowMatch1 = str.match(arrowWithParens);
    if (arrowMatch1) return arrowMatch1;
    
    // 匹配箭头函数（无括号，单参数）
    const arrowSingleParam = /^(?:async\s+)?(\w+)\s*=>/;
    const arrowMatch2 = str.match(arrowSingleParam);
    if (arrowMatch2) return [null, null, arrowMatch2[1]];
    
    return null;
  }
  
  /**
   * 将参数字符串分词
   */
  static tokenizeParameters(paramString) {
    const tokens = [];
    let currentToken = '';
    let depth = 0; // 括号深度
    let inString = false;
    let stringChar = '';
    
    for (let i = 0; i < paramString.length; i++) {
      const char = paramString[i];
      const prevChar = i > 0 ? paramString[i - 1] : '';
      
      // 处理字符串
      if ((char === "'" || char === '"' || char === '`') && prevChar !== '\\') {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
        }
      }
      
      if (inString) {
        currentToken += char;
        continue;
      }
      
      // 处理括号
      if (char === '[' || char === '{' || char === '(') {
        depth++;
      } else if (char === ']' || char === '}' || char === ')') {
        depth--;
      }
      
      // 逗号分隔
      if (char === ',' && depth === 0) {
        tokens.push(currentToken.trim());
        currentToken = '';
      } else {
        currentToken += char;
      }
    }
    
    if (currentToken.trim()) {
      tokens.push(currentToken.trim());
    }
    
    return tokens;
  }
  
  /**
   * 解析参数token
   */
  static parseParameters(tokens) {
    return tokens.map((token, index) => {
      const param = {
        index,
        raw: token,
        name: '',
        hasDefault: false,
        defaultValue: null,
        isRest: false,
        isDestructured: false,
        type: 'normal'
      };
      
      // 检查剩余参数
      if (token.startsWith('...')) {
        param.isRest = true;
        param.name = token.slice(3).trim();
        param.type = 'rest';
        return param;
      }
      
      // 检查默认值
      const equalsIndex = token.indexOf('=');
      if (equalsIndex !== -1) {
        param.hasDefault = true;
        param.name = token.slice(0, equalsIndex).trim();
        param.defaultValue = token.slice(equalsIndex + 1).trim();
      } else {
        param.name = token.trim();
      }
      
      // 检查解构
      if (param.name.startsWith('{') || param.name.startsWith('[')) {
        param.isDestructured = true;
        param.type = 'destructured';
      }
      
      return param;
    });
  }
  
  /**
   * 获取参数数量（考虑默认值）
   */
  static getRequiredParameterCount(fn) {
    const analysis = this.analyzeParameters(fn);
    return analysis.parameters.filter(p => !p.hasDefault && !p.isRest).length;
  }
  
  /**
   * 检查函数是否接受可变参数
   */
  static acceptsVariableArguments(fn) {
    const analysis = this.analyzeParameters(fn);
    return analysis.hasRestParameter;
  }
  
  /**
   * 生成调用示例
   */
  static generateCallExample(fn, values = {}) {
    const analysis = this.analyzeParameters(fn);
    const args = [];
    
    analysis.parameters.forEach((param, index) => {
      if (param.isRest) {
        args.push('...args');
      } else {
        const value = values[param.name] || 
                     (param.hasDefault ? param.defaultValue : 
                     `arg${index + 1}`);
        args.push(value);
      }
    });
    
    const funcName = analysis.name === 'anonymous' ? 'func' : analysis.name;
    return `${funcName}(${args.join(', ')})`;
  }
}

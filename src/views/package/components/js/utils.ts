export const isMobile = () => {
    const flag = navigator.userAgent.match(
      /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
    );
    return (flag&&flag.length > 0) ?? false;
  };
export const getName=(name:string|number)=>{
  name=String(name)
  return name.indexOf('_')>-1?name.split('_')[0]??name:name
}

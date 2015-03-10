# tagNav
可滚动的移动端的标签导航栏

依赖Zepto、iScroll

示例：

TagNav('#tagList',{
  type: 'scrollToFirst',
  curClassName: 'cur',
  index: 4
});

 @param {String} type  自滚动类型 scrollToFirst/scrollToNext/simple
 
 @param {String} curClassName  当前选中的类名 scrollToFirst/scrollToNext/simple
 
 @param {Number} index  默认索引 

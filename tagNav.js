/**
 * [TagNav 可以滚动的标签导航]
 * 依赖Zepto、iScroll
 * @Author: 14100377
 * @param {String} type  自滚动类型 scrollToFirst/scrollToNext/simple
 * @param {String} curClassName  当前选中的类名 scrollToFirst/scrollToNext/simple
 * @param {Number} index  默认索引 
 */
;(function(root, factory, d){
    if (typeof module !== 'undefined' && module.exports) { // CommonJS
        module.exports = factory(root, d);
    } else if (typeof define === 'function' && define.amd) { // AMD / RequireJS
        define(factory(root, d));
    } else {
        root.TagNav = factory.call(root, root, d);
    }
})(this, function(w, d){
       'use strict';
       //Event Hub
        var hub = (function(){
          var topics = {};
          return {
            subscribe: function(topic, listener) {
              if(!topics[topic]) topics[topic] = { queue: [] };
              var index = topics[topic].queue.push(listener) - 1;
              return (function(topic, index) {
                return {
                  remove: function() {
                    delete topics[topic].queue[index];
                  }
                }
              })(topic, index);
            },
            publish: function(topic, info) {
              if(!topics[topic] || !topics[topic].queue.length) return;
              var items = topics[topic].queue;
              for(var i = 0, len = items.length; i < len; i++) {
                if(typeof items[i] === 'function') items[i](info || {});
              }
            }
          };
        })();

        function TagNav(element,opts){
          return (this instanceof TagNav)
            ? this._init(element, opts)
            : new TagNav(element, opts);
        }

        TagNav.prototype = {
            constructor: TagNav,

            _init: function(element,opts){
                var self = this,
                    $el = $(element),
                    $list = $el.find('ul').first(),
                    $items = $el.find('li');

                self.el = element;
                self.opts = opts || {};
                self.type = this.opts.type || 'simple';
                self.curClassName = self.opts.curClassName || 'active';
                self.index = self.opts.index;

                self.iScroll = new IScroll(self.el, { 
                    scrollX: true, 
                    scrollY: false ,
                    click: true
                });

                if ( self.index === undefined ) {
                    //TODO:优先从配置还是dom里取呢
                    self.index = self.index || $list.find( '.'+self.curClassName ).index();
                    if(self.index < 0) self.index = 0;
                }

                switch(this.opts.type){
                    case 'scrollToFirst' :
                        self._scrollToFirstEvent();
                        break;
                    case 'scrollToNext' :
                        self._scrollToNextEvent();
                        break;
                }

                $items.on('click',function(e){
                    self.switchTo( $( this ).index(), e );
                });

                self.$list = $list;
                self.$items = $items;
                self.switchTo(self.index);
            },

            _scrollToFirstEvent: function(){
                var self = this;
                hub.subscribe('select', function(parms) {
                    var el = self.$items.eq(parms.index)[0];
                    setTimeout(function(){self.iScroll.scrollToElement(el,400)},180)
                });
            },

            _scrollToNextEvent: function(){
                var self = this,
                    prevIndex;
                
                hub.subscribe('select', function(parms) {
                    // 第一调用的时候没有prevIndex, 固根据this.index来控制方向。
                    if ( prevIndex === undefined ) {
                        prevIndex = self.index ? 0 : 1;
                    }
                    var dir = parms.index > prevIndex,
                        // 如果是想左则找prev否则找next
                        target = self.$items.eq(parms.index)[ dir ? 'next' : 'prev' ](),
                        // 如果没有相邻的，自己的位置也需要检测。存在这种情况
                        // 被点击的按钮，只显示了一半
                        offset = target.offset() || self.$items.eq(parms.index).offset(),
                        within = $(self.el).offset(),
                        listOffset;

                    if ( dir ? offset.left + offset.width > within.left +
                            within.width : offset.left < within.left ) {
                        listOffset = self.$list.offset();
                        var x = dir ? within.width - offset.left + listOffset.left - offset.width : listOffset.left - offset.left;
                        setTimeout(function(){self.iScroll.scrollTo( x, 0, 400 )},180)
                    }
                    prevIndex = parms.index;
                });
            },

            /**
             * 选择
             * @method switchTo
             */
            switchTo: function( index, e ) {
                var self = this,
                cur;

                cur = self.$items.removeClass( self.curClassName )
                        .eq( index )
                        .addClass( self.curClassName );

                self.index = index;
                hub.publish('select',{'index':index});
            },

            /**
             * 取消选择
             * @method unselect
             */
            unselect: function() {
                this.index = -1;
                this.$items.removeClass( self.curClassName );
            },

            /**
             * 获取当前选中的序号
             * @method getIndex
             */
            getIndex: function() {
                return this.index;
            }
        }
       
        return TagNav;

}, document);
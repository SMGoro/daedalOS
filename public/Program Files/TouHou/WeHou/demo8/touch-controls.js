// 触屏控制组件
(function() {
    'use strict';
    
    // 触屏控制对象
    window.TouchControls = {
        isVisible: false,
        activeKeys: new Set(),
        
        // 初始化触屏控制
        init: function() {
            console.log('TouchControls: 开始初始化');
            this.createControls();
            this.bindEvents();
            this.detectTouchDevice();
            console.log('TouchControls: 初始化完成');
        },
        
        // 创建控制界面
        createControls: function() {
            console.log('TouchControls: 创建控制界面');
            const controlsContainer = document.createElement('div');
            controlsContainer.id = 'touch-controls';
            controlsContainer.style.cssText = `
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                z-index: 9999;
                background: transparent;
                padding: 10px;
                display: block;
                touch-action: none;
                user-select: none;
                pointer-events: auto;
                min-height: 150px;
            `;
            
            // 添加显示/隐藏按钮
            const toggleButton = document.createElement('div');
            toggleButton.id = 'touch-toggle';
            toggleButton.textContent = '触屏控制';
            toggleButton.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                z-index: 10000;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 8px 12px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 12px;
                user-select: none;
            `;
            
            toggleButton.addEventListener('click', () => {
                this.toggle();
            });
            
            document.body.appendChild(toggleButton);
            
            // 左侧方向控制
            const leftControls = document.createElement('div');
            leftControls.style.cssText = `
                float: left;
                width: 50%;
                text-align: center;
            `;
            
            // 方向键
            const directionPad = document.createElement('div');
            directionPad.style.cssText = `
                display: inline-block;
                position: relative;
                width: 120px;
                height: 120px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 10px;
            `;
            
            // 方向键按钮
            const directions = [
                { key: 'ArrowUp', text: '↑', style: 'position: absolute; top: 0; left: 50%; transform: translateX(-50%);' },
                { key: 'ArrowDown', text: '↓', style: 'position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);' },
                { key: 'ArrowLeft', text: '←', style: 'position: absolute; left: 0; top: 50%; transform: translateY(-50%);' },
                { key: 'ArrowRight', text: '→', style: 'position: absolute; right: 0; top: 50%; transform: translateY(-50%);' }
            ];
            
            directions.forEach(dir => {
                const button = this.createButton(dir.key, dir.text, dir.style);
                directionPad.appendChild(button);
            });
            
            leftControls.appendChild(directionPad);
            controlsContainer.appendChild(leftControls);
            
            // 右侧射击控制
            const rightControls = document.createElement('div');
            rightControls.style.cssText = `
                float: right;
                width: 50%;
                text-align: center;
            `;
            
            // 射击键
            const shootButton = this.createButton('z', '射击', `
                width: 80px;
                height: 80px;
                border-radius: 50%;
                background: rgba(255, 0, 0, 0.8);
                color: white;
                font-size: 16px;
                font-weight: bold;
                margin: 10px;
            `);
            
            // 炸弹键
            const bombButton = this.createButton('x', '炸弹', `
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: rgba(255, 255, 0, 0.8);
                color: black;
                font-size: 14px;
                font-weight: bold;
                margin: 10px;
            `);
            
            // 暂停键
            const pauseButton = this.createButton('Escape', '暂停', `
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: rgba(128, 128, 128, 0.8);
                color: white;
                font-size: 12px;
                margin: 10px;
            `);
            
            rightControls.appendChild(shootButton);
            rightControls.appendChild(bombButton);
            rightControls.appendChild(pauseButton);
            controlsContainer.appendChild(rightControls);
            
            // 清除浮动
            const clearfix = document.createElement('div');
            clearfix.style.cssText = 'clear: both;';
            controlsContainer.appendChild(clearfix);
            
            document.body.appendChild(controlsContainer);
            this.container = controlsContainer;
            console.log('TouchControls: 控制界面已添加到页面');
        },
        
        // 创建按钮
        createButton: function(key, text, additionalStyle) {
            const button = document.createElement('div');
            button.className = 'touch-button';
            button.dataset.key = key;
            button.textContent = text;
            
            // 保存原始背景色
            let originalBackground = '';
            if (additionalStyle.includes('background:')) {
                const match = additionalStyle.match(/background:\s*([^;]+)/);
                if (match) {
                    originalBackground = match[1];
                }
            }
            
            button.style.cssText = `
                position: relative;
                display: inline-block;
                width: 40px;
                height: 40px;
                background: rgba(255, 255, 255, 0.8);
                border: 2px solid rgba(0, 0, 0, 0.5);
                border-radius: 8px;
                color: black;
                font-size: 18px;
                font-weight: bold;
                text-align: center;
                line-height: 36px;
                cursor: pointer;
                user-select: none;
                touch-action: none;
                ${additionalStyle || ''}
            `;
            
            // 保存原始背景色到按钮元素
            button.dataset.originalBackground = originalBackground || 'rgba(255, 255, 255, 0.8)';
            
            return button;
        },
        
        // 绑定事件
        bindEvents: function() {
            console.log('TouchControls: 绑定事件');
            const buttons = document.querySelectorAll('.touch-button');
            console.log('TouchControls: 找到按钮数量:', buttons.length);
            
            buttons.forEach(button => {
                const key = button.dataset.key;
                const originalBackground = button.dataset.originalBackground;
                console.log('TouchControls: 绑定按钮:', key);
                
                // 触摸开始
                button.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('TouchControls: 触摸开始', key);
                    this.pressKey(key);
                    button.style.background = 'rgba(255, 255, 0, 0.8)';
                }, { passive: false });
                
                // 触摸结束
                button.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('TouchControls: 触摸结束', key);
                    this.releaseKey(key);
                    button.style.background = originalBackground;
                }, { passive: false });
                
                // 鼠标事件（用于测试）
                button.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('TouchControls: 鼠标按下', key);
                    this.pressKey(key);
                    button.style.background = 'rgba(255, 255, 0, 0.8)';
                });
                
                button.addEventListener('mouseup', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('TouchControls: 鼠标释放', key);
                    this.releaseKey(key);
                    button.style.background = originalBackground;
                });
                
                // 防止拖拽
                button.addEventListener('dragstart', (e) => {
                    e.preventDefault();
                });
            });
            
            // 防止页面滚动
            this.container.addEventListener('touchmove', (e) => {
                e.preventDefault();
            }, { passive: false });
        },
        
        // 按下按键
        pressKey: function(key) {
            if (!this.activeKeys.has(key)) {
                this.activeKeys.add(key);
                this.simulateKeyEvent(key, 'keydown');
                console.log('TouchControls: 按下按键', key);
            }
        },
        
        // 释放按键
        releaseKey: function(key) {
            if (this.activeKeys.has(key)) {
                this.activeKeys.delete(key);
                this.simulateKeyEvent(key, 'keyup');
                console.log('TouchControls: 释放按键', key);
            }
        },
        
        // 模拟键盘事件
        simulateKeyEvent: function(key, type) {
            // 尝试多种方式触发事件
            const keyCode = this.getKeyCode(key);
            
            // 方法1: 使用KeyboardEvent构造函数
            const event = new KeyboardEvent(type, {
                key: key,
                code: key,
                keyCode: keyCode,
                which: keyCode,
                bubbles: true,
                cancelable: true,
                composed: true
            });
            
            // 方法2: 创建自定义事件
            const customEvent = new CustomEvent('keyboardEvent', {
                detail: {
                    type: type,
                    key: key,
                    keyCode: keyCode
                },
                bubbles: true
            });
            
            // 尝试多个目标元素
            const targets = [
                document,
                document.body,
                document.getElementById('mygame'),
                window
            ];
            
            targets.forEach(target => {
                if (target) {
                    try {
                        target.dispatchEvent(event);
                        target.dispatchEvent(customEvent);
                        console.log('TouchControls: 事件已发送到', target);
                    } catch (e) {
                        console.log('TouchControls: 发送事件到', target, '失败:', e);
                    }
                }
            });
            
            // 方法3: 直接调用游戏引擎的键盘处理函数
            if (window.WEHOUGAME && window.WEHOUGAME.keyboard) {
                try {
                    if (type === 'keydown') {
                        window.WEHOUGAME.keyboard[keyCode] = true;
                    } else if (type === 'keyup') {
                        window.WEHOUGAME.keyboard[keyCode] = false;
                    }
                    console.log('TouchControls: 直接设置键盘状态', keyCode, type);
                } catch (e) {
                    console.log('TouchControls: 直接设置键盘状态失败:', e);
                }
            }
            
            console.log('TouchControls: 模拟键盘事件', type, key, keyCode);
        },
        
        // 获取键码
        getKeyCode: function(key) {
            const keyCodes = {
                'ArrowUp': 38,
                'ArrowDown': 40,
                'ArrowLeft': 37,
                'ArrowRight': 39,
                'z': 90,
                'x': 88,
                'Escape': 27
            };
            return keyCodes[key] || 0;
        },
        
        // 检测触摸设备
        detectTouchDevice: function() {
            console.log('TouchControls: 检测触摸设备');
            console.log('TouchControls: ontouchstart in window:', 'ontouchstart' in window);
            console.log('TouchControls: navigator.maxTouchPoints:', navigator.maxTouchPoints);
            
            // 强制显示，不管是否检测到触摸设备
            this.show();
            console.log('TouchControls: 控制界面已显示');
        },
        
        // 显示控制界面
        show: function() {
            if (this.container) {
                this.container.style.display = 'block';
                this.isVisible = true;
                console.log('TouchControls: 显示控制界面');
            }
        },
        
        // 隐藏控制界面
        hide: function() {
            if (this.container) {
                this.container.style.display = 'none';
                this.isVisible = false;
                console.log('TouchControls: 隐藏控制界面');
            }
        },
        
        // 切换显示状态
        toggle: function() {
            if (this.isVisible) {
                this.hide();
            } else {
                this.show();
            }
        }
    };
    
    // 页面加载完成后初始化
    function initTouchControls() {
        console.log('TouchControls: 开始初始化触屏控制');
        if (window.TouchControls) {
            window.TouchControls.init();
        } else {
            console.error('TouchControls: TouchControls对象未找到');
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTouchControls);
    } else {
        // 延迟一点时间确保其他脚本加载完成
        setTimeout(initTouchControls, 100);
    }
    
})();

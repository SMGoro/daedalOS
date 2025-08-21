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
                margin: 5px;
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
                margin: 5px;
            `);
            
            // 暂停键
            const pauseButton = this.createButton('Escape', '暂停', `
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: rgba(128, 128, 128, 0.8);
                color: white;
                font-size: 12px;
                margin: 5px;
            `);
            
            // 缓慢键（点击切换模式）
            const slowButton = this.createButton('slowToggle', '缓慢', `
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: rgba(0, 255, 255, 0.8);
                color: black;
                font-size: 12px;
                margin: 5px;
            `);
            slowButton.dataset.slowMode = 'false'; // 初始状态为关闭
            
            // 创建按钮容器来更好地组织布局
            const actionButtons = document.createElement('div');
            actionButtons.style.cssText = `
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 5px;
            `;
            
            // 主要动作按钮行
            const mainActionRow = document.createElement('div');
            mainActionRow.style.cssText = `
                display: flex;
                align-items: center;
                gap: 5px;
            `;
            mainActionRow.appendChild(shootButton);
            mainActionRow.appendChild(bombButton);
            
            // 辅助按钮行
            const auxActionRow = document.createElement('div');
            auxActionRow.style.cssText = `
                display: flex;
                align-items: center;
                gap: 5px;
            `;
            auxActionRow.appendChild(pauseButton);
            auxActionRow.appendChild(slowButton);
            
            actionButtons.appendChild(mainActionRow);
            actionButtons.appendChild(auxActionRow);
            rightControls.appendChild(actionButtons);
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
                
                // 特殊处理缓慢切换按钮
                if (key === 'slowToggle') {
                    // 点击切换缓慢模式
                    button.addEventListener('touchstart', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('TouchControls: 缓慢按钮被点击');
                        this.toggleSlowMode(button);
                    }, { passive: false });
                    
                    button.addEventListener('mousedown', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('TouchControls: 缓慢按钮被点击（鼠标）');
                        this.toggleSlowMode(button);
                    });
                } else {
                    // 普通按钮的触摸事件
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
                }
                
                // 鼠标事件（用于测试，排除缓慢切换按钮）
                if (key !== 'slowToggle') {
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
                }
                
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
                console.log('TouchControls: 按下按键', key, '缓慢模式:', this.isSlowModeActive());
                
                // 调试键盘状态
                if (key !== 'slowToggle') {
                    this.debugKeyboardState();
                }
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
            
            // 为 Shift 键特殊处理
            let eventKey = key;
            let eventCode = key;
            
            if (key === 'Shift') {
                eventKey = 'Shift';
                eventCode = 'ShiftLeft'; // 使用左Shift作为默认
            }
            
            // 检查缓慢模式状态
            const isSlowModeActive = this.isSlowModeActive();
            
            // 方法1: 使用KeyboardEvent构造函数
            const event = new KeyboardEvent(type, {
                key: eventKey,
                code: eventCode,
                keyCode: keyCode,
                which: keyCode,
                bubbles: true,
                cancelable: true,
                composed: true,
                shiftKey: isSlowModeActive || (key === 'Shift' && type === 'keydown')
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
                        // 对于 Shift 键，也设置 shiftKey 属性
                        if (key === 'Shift') {
                            window.WEHOUGAME.keyboard.shiftKey = true;
                        }
                        // 如果缓慢模式激活，确保 shiftKey 保持为 true
                        if (isSlowModeActive && key !== 'Shift') {
                            window.WEHOUGAME.keyboard.shiftKey = true;
                        }
                    } else if (type === 'keyup') {
                        window.WEHOUGAME.keyboard[keyCode] = false;
                        // 对于 Shift 键，也清除 shiftKey 属性（除非缓慢模式激活）
                        if (key === 'Shift' && !isSlowModeActive) {
                            window.WEHOUGAME.keyboard.shiftKey = false;
                        }
                        // 如果缓慢模式激活，确保 shiftKey 保持为 true
                        if (isSlowModeActive && key !== 'Shift') {
                            window.WEHOUGAME.keyboard.shiftKey = true;
                        }
                    }
                    console.log('TouchControls: 直接设置键盘状态', keyCode, type, '缓慢模式:', isSlowModeActive);
                } catch (e) {
                    console.log('TouchControls: 直接设置键盘状态失败:', e);
                }
            }
            
            // 方法4: 尝试直接设置全局键盘状态
            try {
                if (type === 'keydown') {
                    if (key === 'Shift') {
                        window.shiftKeyPressed = true;
                        document.shiftKeyPressed = true;
                        // 设置更多可能的属性
                        window.shiftPressed = true;
                        document.shiftPressed = true;
                        window.isShiftPressed = true;
                        document.isShiftPressed = true;
                    }
                    // 如果缓慢模式激活，确保全局 Shift 状态保持为 true
                    if (isSlowModeActive && key !== 'Shift') {
                        window.shiftKeyPressed = true;
                        document.shiftKeyPressed = true;
                        window.shiftPressed = true;
                        document.shiftPressed = true;
                        window.isShiftPressed = true;
                        document.isShiftPressed = true;
                    }
                } else if (type === 'keyup') {
                    if (key === 'Shift' && !isSlowModeActive) {
                        window.shiftKeyPressed = false;
                        document.shiftKeyPressed = false;
                        window.shiftPressed = false;
                        document.shiftPressed = false;
                        window.isShiftPressed = false;
                        document.isShiftPressed = false;
                    }
                    // 如果缓慢模式激活，确保全局 Shift 状态保持为 true
                    if (isSlowModeActive && key !== 'Shift') {
                        window.shiftKeyPressed = true;
                        document.shiftKeyPressed = true;
                        window.shiftPressed = true;
                        document.shiftPressed = true;
                        window.isShiftPressed = true;
                        document.isShiftPressed = true;
                    }
                }
            } catch (e) {
                console.log('TouchControls: 设置全局键盘状态失败:', e);
            }
            
            // 方法5: 尝试触发自定义的 Shift 事件
            if (key === 'Shift' || isSlowModeActive) {
                try {
                    const shiftEvent = new CustomEvent('shiftKeyEvent', {
                        detail: {
                            type: type,
                            key: key,
                            keyCode: keyCode,
                            shiftKey: isSlowModeActive || (key === 'Shift' && type === 'keydown')
                        },
                        bubbles: true
                    });
                    
                    document.dispatchEvent(shiftEvent);
                    window.dispatchEvent(shiftEvent);
                    
                    // 也尝试触发到游戏画布
                    const gameCanvas = document.querySelector('canvas');
                    if (gameCanvas) {
                        gameCanvas.dispatchEvent(shiftEvent);
                    }
                    
                    console.log('TouchControls: 发送自定义 Shift 事件', type, '缓慢模式:', isSlowModeActive);
                } catch (e) {
                    console.log('TouchControls: 发送自定义 Shift 事件失败:', e);
                }
            }
            
            console.log('TouchControls: 模拟键盘事件', type, key, keyCode);
        },
        
        // 通知 Shift 键被按下
        notifyShiftPressed: function() {
            console.log('TouchControls: 通知 Shift 键被按下');
            
            // 方法1: 设置全局变量
            try {
                window.shiftKeyPressed = true;
                window.shiftPressed = true;
                window.isShiftPressed = true;
                window.slowMode = true;
                window.slowMovement = true;
            } catch (e) {
                console.log('TouchControls: 设置全局变量失败:', e);
            }
            
            // 方法2: 尝试调用游戏引擎的方法
            try {
                if (window.WEHOUGAME) {
                    if (window.WEHOUGAME.setSlowMode) {
                        window.WEHOUGAME.setSlowMode(true);
                    }
                    if (window.WEHOUGAME.setShiftPressed) {
                        window.WEHOUGAME.setShiftPressed(true);
                    }
                    if (window.WEHOUGAME.keyboard) {
                        window.WEHOUGAME.keyboard.shiftKey = true;
                        window.WEHOUGAME.keyboard.slowMode = true;
                    }
                }
            } catch (e) {
                console.log('TouchControls: 调用游戏引擎方法失败:', e);
            }
            
            // 方法3: 触发自定义事件
            try {
                const slowModeEvent = new CustomEvent('slowModeEnabled', {
                    detail: { enabled: true },
                    bubbles: true
                });
                document.dispatchEvent(slowModeEvent);
                window.dispatchEvent(slowModeEvent);
            } catch (e) {
                console.log('TouchControls: 触发自定义事件失败:', e);
            }
        },
        
        // 通知 Shift 键被释放
        notifyShiftReleased: function() {
            console.log('TouchControls: 通知 Shift 键被释放');
            
            // 方法1: 清除全局变量
            try {
                window.shiftKeyPressed = false;
                window.shiftPressed = false;
                window.isShiftPressed = false;
                window.slowMode = false;
                window.slowMovement = false;
            } catch (e) {
                console.log('TouchControls: 清除全局变量失败:', e);
            }
            
            // 方法2: 尝试调用游戏引擎的方法
            try {
                if (window.WEHOUGAME) {
                    if (window.WEHOUGAME.setSlowMode) {
                        window.WEHOUGAME.setSlowMode(false);
                    }
                    if (window.WEHOUGAME.setShiftPressed) {
                        window.WEHOUGAME.setShiftPressed(false);
                    }
                    if (window.WEHOUGAME.keyboard) {
                        window.WEHOUGAME.keyboard.shiftKey = false;
                        window.WEHOUGAME.keyboard.slowMode = false;
                    }
                }
            } catch (e) {
                console.log('TouchControls: 调用游戏引擎方法失败:', e);
            }
            
            // 方法3: 触发自定义事件
            try {
                const slowModeEvent = new CustomEvent('slowModeDisabled', {
                    detail: { enabled: false },
                    bubbles: true
                });
                document.dispatchEvent(slowModeEvent);
                window.dispatchEvent(slowModeEvent);
            } catch (e) {
                console.log('TouchControls: 触发自定义事件失败:', e);
            }
        },
        
        // 切换缓慢模式
        toggleSlowMode: function(button) {
            const currentMode = button.dataset.slowMode === 'true';
            const newMode = !currentMode;
            
            console.log('TouchControls: 切换缓慢模式', currentMode, '->', newMode);
            
            // 更新按钮状态
            button.dataset.slowMode = newMode.toString();
            
            if (newMode) {
                // 启用缓慢模式
                button.style.background = 'rgba(255, 255, 0, 0.8)'; // 黄色表示激活
                button.textContent = '缓慢ON';
                this.enableSlowMode();
            } else {
                // 禁用缓慢模式
                button.style.background = 'rgba(0, 255, 255, 0.8)'; // 青色表示关闭
                button.textContent = '缓慢OFF';
                this.disableSlowMode();
            }
        },
        
        // 启用缓慢模式
        enableSlowMode: function() {
            console.log('TouchControls: 启用缓慢模式');
            
            // 方法1: 设置全局变量
            try {
                window.shiftKeyPressed = true;
                window.shiftPressed = true;
                window.isShiftPressed = true;
                window.slowMode = true;
                window.slowMovement = true;
            } catch (e) {
                console.log('TouchControls: 设置全局变量失败:', e);
            }
            
            // 方法2: 尝试调用游戏引擎的方法
            try {
                if (window.WEHOUGAME) {
                    if (window.WEHOUGAME.setSlowMode) {
                        window.WEHOUGAME.setSlowMode(true);
                    }
                    if (window.WEHOUGAME.setShiftPressed) {
                        window.WEHOUGAME.setShiftPressed(true);
                    }
                    if (window.WEHOUGAME.keyboard) {
                        window.WEHOUGAME.keyboard.shiftKey = true;
                        window.WEHOUGAME.keyboard.slowMode = true;
                    }
                }
            } catch (e) {
                console.log('TouchControls: 调用游戏引擎方法失败:', e);
            }
            
            // 方法3: 触发自定义事件
            try {
                const slowModeEvent = new CustomEvent('slowModeEnabled', {
                    detail: { enabled: true },
                    bubbles: true
                });
                document.dispatchEvent(slowModeEvent);
                window.dispatchEvent(slowModeEvent);
            } catch (e) {
                console.log('TouchControls: 触发自定义事件失败:', e);
            }
            
            // 方法4: 模拟 Shift 键按下事件
            this.simulateKeyEvent('Shift', 'keydown');
            
            // 方法5: 启动缓慢模式维护定时器，确保状态持续有效
            this.startSlowModeMaintenance();
        },
        
        // 禁用缓慢模式
        disableSlowMode: function() {
            console.log('TouchControls: 禁用缓慢模式');
            
            // 方法1: 清除全局变量
            try {
                window.shiftKeyPressed = false;
                window.shiftPressed = false;
                window.isShiftPressed = false;
                window.slowMode = false;
                window.slowMovement = false;
            } catch (e) {
                console.log('TouchControls: 清除全局变量失败:', e);
            }
            
            // 方法2: 尝试调用游戏引擎的方法
            try {
                if (window.WEHOUGAME) {
                    if (window.WEHOUGAME.setSlowMode) {
                        window.WEHOUGAME.setSlowMode(false);
                    }
                    if (window.WEHOUGAME.setShiftPressed) {
                        window.WEHOUGAME.setShiftPressed(false);
                    }
                    if (window.WEHOUGAME.keyboard) {
                        window.WEHOUGAME.keyboard.shiftKey = false;
                        window.WEHOUGAME.keyboard.slowMode = false;
                    }
                }
            } catch (e) {
                console.log('TouchControls: 调用游戏引擎方法失败:', e);
            }
            
            // 方法3: 触发自定义事件
            try {
                const slowModeEvent = new CustomEvent('slowModeDisabled', {
                    detail: { enabled: false },
                    bubbles: true
                });
                document.dispatchEvent(slowModeEvent);
                window.dispatchEvent(slowModeEvent);
            } catch (e) {
                console.log('TouchControls: 触发自定义事件失败:', e);
            }
            
            // 方法4: 模拟 Shift 键释放事件
            this.simulateKeyEvent('Shift', 'keyup');
            
            // 停止缓慢模式维护定时器
            if (this.slowModeMaintenanceTimer) {
                clearInterval(this.slowModeMaintenanceTimer);
                this.slowModeMaintenanceTimer = null;
            }
        },
        
        // 检查缓慢模式是否激活
        isSlowModeActive: function() {
            try {
                // 检查全局变量
                if (window.shiftKeyPressed || window.slowMode) {
                    return true;
                }
                
                // 检查游戏引擎状态
                if (window.WEHOUGAME && window.WEHOUGAME.keyboard) {
                    if (window.WEHOUGAME.keyboard.shiftKey || window.WEHOUGAME.keyboard.slowMode) {
                        return true;
                    }
                }
                
                return false;
            } catch (e) {
                console.log('TouchControls: 检查缓慢模式状态失败:', e);
                return false;
            }
        },
        
        // 调试键盘状态
        debugKeyboardState: function() {
            console.log('TouchControls: === 键盘状态调试 ===');
            console.log('TouchControls: 活跃按键:', Array.from(this.activeKeys));
            console.log('TouchControls: 缓慢模式激活:', this.isSlowModeActive());
            
            try {
                console.log('TouchControls: 全局变量:');
                console.log('  - window.shiftKeyPressed:', window.shiftKeyPressed);
                console.log('  - window.slowMode:', window.slowMode);
                console.log('  - window.shiftPressed:', window.shiftPressed);
                console.log('  - window.isShiftPressed:', window.isShiftPressed);
                
                if (window.WEHOUGAME && window.WEHOUGAME.keyboard) {
                    console.log('TouchControls: 游戏引擎键盘状态:');
                    console.log('  - WEHOUGAME.keyboard.shiftKey:', window.WEHOUGAME.keyboard.shiftKey);
                    console.log('  - WEHOUGAME.keyboard.slowMode:', window.WEHOUGAME.keyboard.slowMode);
                    console.log('  - WEHOUGAME.keyboard[16]:', window.WEHOUGAME.keyboard[16]); // Shift键码
                }
            } catch (e) {
                console.log('TouchControls: 调试状态失败:', e);
            }
            console.log('TouchControls: === 调试结束 ===');
        },
        
        // 启动缓慢模式维护定时器
        startSlowModeMaintenance: function() {
            // 清除之前的定时器
            if (this.slowModeMaintenanceTimer) {
                clearInterval(this.slowModeMaintenanceTimer);
            }
            
            // 每100ms检查一次缓慢模式状态，确保持续有效
            this.slowModeMaintenanceTimer = setInterval(() => {
                try {
                    // 检查游戏引擎状态
                    if (window.WEHOUGAME && window.WEHOUGAME.keyboard) {
                        if (!window.WEHOUGAME.keyboard.shiftKey) {
                            console.log('TouchControls: 检测到缓慢模式被重置，重新设置');
                            window.WEHOUGAME.keyboard.shiftKey = true;
                            window.WEHOUGAME.keyboard.slowMode = true;
                        }
                    }
                    
                    // 检查全局变量状态
                    if (!window.shiftKeyPressed) {
                        console.log('TouchControls: 检测到全局缓慢状态被重置，重新设置');
                        window.shiftKeyPressed = true;
                        window.slowMode = true;
                    }
                } catch (e) {
                    console.log('TouchControls: 缓慢模式维护检查失败:', e);
                }
            }, 100);
            
            console.log('TouchControls: 启动缓慢模式维护定时器');
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
                'Escape': 27,
                'Shift': 16,
                'ShiftLeft': 16,
                'ShiftRight': 16
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
        },
        
        // 销毁触屏控制
        destroy: function() {
            console.log('TouchControls: 销毁触屏控制');
            
            // 停止缓慢模式维护定时器
            if (this.slowModeMaintenanceTimer) {
                clearInterval(this.slowModeMaintenanceTimer);
                this.slowModeMaintenanceTimer = null;
            }
            
            const container = document.getElementById('touch-controls');
            if (container) {
                container.remove();
            }
            this.activeKeys.clear();
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

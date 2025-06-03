class TShirtDesigner extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        // Designer state
        this.designElements = [];
        this.selectedElement = null;
        this.tshirtColor = '#ffffff';
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        
        // Google Fonts
        this.googleFonts = [
            'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Oswald', 'Source Sans Pro',
            'Raleway', 'PT Sans', 'Lora', 'Nunito', 'Ubuntu', 'Playfair Display',
            'Merriweather', 'Poppins', 'Arimo', 'Crimson Text', 'Dancing Script',
            'Comfortaa', 'Quicksand', 'Pacifico', 'Lobster', 'Indie Flower'
        ];
        
        this.init();
    }
    
    connectedCallback() {
        this.loadGoogleFonts();
    }
    
    init() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    --primary-color: #667eea;
                    --secondary-color: #764ba2;
                    --accent-color: #f093fb;
                    --dark-color: #2d3748;
                    --light-color: #f7fafc;
                    --border-color: #e2e8f0;
                    --success-color: #48bb78;
                    --warning-color: #ed8936;
                }
                
                .designer-container {
                    display: flex;
                    height: 100vh;
                    background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
                    overflow: hidden;
                }
                
                .sidebar {
                    width: 320px;
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    border-right: 1px solid var(--border-color);
                    overflow-y: auto;
                    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
                }
                
                .main-canvas-area {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    position: relative;
                }
                
                .canvas-container {
                    position: relative;
                    border-radius: 15px;
                    overflow: hidden;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
                    background: white;
                }
                
                #designCanvas {
                    display: block;
                    cursor: crosshair;
                }
                
                .tab-container {
                    display: flex;
                    background: var(--light-color);
                    border-bottom: 1px solid var(--border-color);
                }
                
                .tab {
                    flex: 1;
                    padding: 15px 10px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border: none;
                    background: transparent;
                    font-weight: 600;
                    color: var(--dark-color);
                    position: relative;
                }
                
                .tab.active {
                    background: white;
                    color: var(--primary-color);
                }
                
                .tab.active::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
                }
                
                .tab-content {
                    padding: 20px;
                    display: none;
                }
                
                .tab-content.active {
                    display: block;
                }
                
                .control-group {
                    margin-bottom: 25px;
                }
                
                .control-label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 600;
                    color: var(--dark-color);
                    font-size: 14px;
                }
                
                .color-picker-container {
                    display: flex;
                    gap: 10px;
                    align-items: center;
                }
                
                .color-input {
                    width: 50px;
                    height: 50px;
                    border: none;
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    transition: transform 0.2s ease;
                }
                
                .color-input:hover {
                    transform: scale(1.1);
                }
                
                .preset-colors {
                    display: grid;
                    grid-template-columns: repeat(6, 1fr);
                    gap: 8px;
                    margin-top: 10px;
                }
                
                .preset-color {
                    width: 35px;
                    height: 35px;
                    border-radius: 50%;
                    cursor: pointer;
                    border: 2px solid transparent;
                    transition: all 0.2s ease;
                }
                
                .preset-color:hover {
                    transform: scale(1.1);
                    border-color: var(--primary-color);
                }
                
                .upload-area {
                    border: 2px dashed var(--border-color);
                    border-radius: 10px;
                    padding: 30px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    background: linear-gradient(135deg, #f8f9ff 0%, #e8f4f8 100%);
                }
                
                .upload-area:hover {
                    border-color: var(--primary-color);
                    background: linear-gradient(135deg, #f0f7ff 0%, #e0f2f7 100%);
                }
                
                .upload-area.dragover {
                    border-color: var(--accent-color);
                    background: linear-gradient(135deg, #fff5f5 0%, #fef5e7 100%);
                }
                
                .btn {
                    padding: 12px 24px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .btn-primary {
                    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
                    color: white;
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                }
                
                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
                }
                
                .btn-secondary {
                    background: var(--light-color);
                    color: var(--dark-color);
                    border: 1px solid var(--border-color);
                }
                
                .btn-secondary:hover {
                    background: white;
                    transform: translateY(-1px);
                }
                
                .btn-success {
                    background: linear-gradient(135deg, var(--success-color), #38a169);
                    color: white;
                    box-shadow: 0 4px 15px rgba(72, 187, 120, 0.4);
                }
                
                .btn-success:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(72, 187, 120, 0.6);
                }
                
                .input-field {
                    width: 100%;
                    padding: 12px 16px;
                    border: 2px solid var(--border-color);
                    border-radius: 8px;
                    font-size: 14px;
                    transition: all 0.3s ease;
                    background: white;
                }
                
                .input-field:focus {
                    outline: none;
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                }
                
                .select-field {
                    width: 100%;
                    padding: 12px 16px;
                    border: 2px solid var(--border-color);
                    border-radius: 8px;
                    background: white;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .select-field:focus {
                    outline: none;
                    border-color: var(--primary-color);
                }
                
                .range-slider {
                    width: 100%;
                    height: 6px;
                    border-radius: 3px;
                    background: var(--border-color);
                    outline: none;
                    cursor: pointer;
                }
                
                .range-slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
                    cursor: pointer;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
                }
                
                .icons-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 10px;
                    max-height: 200px;
                    overflow-y: auto;
                }
                
                .icon-item {
                    padding: 15px;
                    border: 2px solid var(--border-color);
                    border-radius: 8px;
                    cursor: pointer;
                    text-align: center;
                    transition: all 0.3s ease;
                    background: white;
                }
                
                .icon-item:hover {
                    border-color: var(--primary-color);
                    transform: scale(1.05);
                }
                
                .download-section {
                    background: linear-gradient(135deg, #f8f9ff 0%, #e8f4f8 100%);
                    border-radius: 10px;
                    padding: 20px;
                    text-align: center;
                }
                
                .download-options {
                    display: flex;
                    gap: 10px;
                    margin-top: 15px;
                }
                
                .element-list {
                    max-height: 200px;
                    overflow-y: auto;
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    background: white;
                }
                
                .element-item {
                    padding: 12px 16px;
                    border-bottom: 1px solid var(--border-color);
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .element-item:hover {
                    background: var(--light-color);
                }
                
                .element-item.selected {
                    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
                    color: white;
                }
                
                .delete-btn {
                    background: #e53e3e;
                    color: white;
                    border: none;
                    padding: 4px 8px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                }
                
                .toolbar {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    display: flex;
                    gap: 10px;
                    z-index: 10;
                }
                
                .zoom-controls {
                    display: flex;
                    gap: 5px;
                    background: rgba(255, 255, 255, 0.9);
                    padding: 8px;
                    border-radius: 8px;
                    backdrop-filter: blur(10px);
                }
                
                .zoom-btn {
                    width: 35px;
                    height: 35px;
                    border: none;
                    background: var(--primary-color);
                    color: white;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    transition: all 0.2s ease;
                }
                
                .zoom-btn:hover {
                    transform: scale(1.1);
                    background: var(--secondary-color);
                }
                
                @media (max-width: 768px) {
                    .designer-container {
                        flex-direction: column;
                        height: auto;
                    }
                    
                    .sidebar {
                        width: 100%;
                        order: 2;
                    }
                    
                    .main-canvas-area {
                        order: 1;
                        height: 400px;
                    }
                }
            </style>
            
            <div class="designer-container">
                <div class="sidebar">
                    <div class="tab-container">
                        <button class="tab active" data-tab="tshirt">T-Shirt</button>
                        <button class="tab" data-tab="text">Text</button>
                        <button class="tab" data-tab="images">Images</button>
                        <button class="tab" data-tab="icons">Icons</button>
                        <button class="tab" data-tab="layers">Layers</button>
                    </div>
                    
                    <!-- T-Shirt Tab -->
                    <div class="tab-content active" id="tshirt-tab">
                        <div class="control-group">
                            <label class="control-label">T-Shirt Color</label>
                            <div class="color-picker-container">
                                <input type="color" id="tshirtColor" class="color-input" value="#ffffff">
                                <span>Custom Color</span>
                            </div>
                            <div class="preset-colors">
                                <div class="preset-color" style="background-color: #ffffff" data-color="#ffffff"></div>
                                <div class="preset-color" style="background-color: #000000" data-color="#000000"></div>
                                <div class="preset-color" style="background-color: #ff0000" data-color="#ff0000"></div>
                                <div class="preset-color" style="background-color: #00ff00" data-color="#00ff00"></div>
                                <div class="preset-color" style="background-color: #0000ff" data-color="#0000ff"></div>
                                <div class="preset-color" style="background-color: #ffff00" data-color="#ffff00"></div>
                                <div class="preset-color" style="background-color: #ff00ff" data-color="#ff00ff"></div>
                                <div class="preset-color" style="background-color: #00ffff" data-color="#00ffff"></div>
                                <div class="preset-color" style="background-color: #ffa500" data-color="#ffa500"></div>
                                <div class="preset-color" style="background-color: #800080" data-color="#800080"></div>
                                <div class="preset-color" style="background-color: #808080" data-color="#808080"></div>
                                <div class="preset-color" style="background-color: #ffc0cb" data-color="#ffc0cb"></div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Text Tab -->
                    <div class="tab-content" id="text-tab">
                        <div class="control-group">
                            <label class="control-label">Text Content</label>
                            <input type="text" id="textInput" class="input-field" placeholder="Enter your text">
                            <button class="btn btn-primary" id="addTextBtn" style="margin-top: 10px; width: 100%;">Add Text</button>
                        </div>
                        
                        <div class="control-group">
                            <label class="control-label">Font Family</label>
                            <select id="fontFamily" class="select-field">
                                <option value="Arial">Arial</option>
                                <option value="Helvetica">Helvetica</option>
                                <option value="Times New Roman">Times New Roman</option>
                            </select>
                        </div>
                        
                        <div class="control-group">
                            <label class="control-label">Font Size: <span id="fontSizeValue">24</span>px</label>
                            <input type="range" id="fontSize" class="range-slider" min="12" max="100" value="24">
                        </div>
                        
                        <div class="control-group">
                            <label class="control-label">Text Color</label>
                            <input type="color" id="textColor" class="color-input" value="#000000">
                        </div>
                        
                        <div class="control-group">
                            <label class="control-label">Text Style</label>
                            <div style="display: flex; gap: 10px;">
                                <button class="btn btn-secondary" id="boldBtn">B</button>
                                <button class="btn btn-secondary" id="italicBtn">I</button>
                                <button class="btn btn-secondary" id="underlineBtn">U</button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Images Tab -->
                    <div class="tab-content" id="images-tab">
                        <div class="control-group">
                            <label class="control-label">Upload Image</label>
                            <div class="upload-area" id="imageUpload">
                                <p>📁 Click or drag to upload image</p>
                                <p style="font-size: 12px; color: #666;">Supports JPG, PNG, GIF</p>
                            </div>
                            <input type="file" id="imageFile" accept="image/*" style="display: none;">
                        </div>
                        
                        <div class="control-group">
                            <label class="control-label">Stock Images</label>
                            <div class="icons-grid">
                                <div class="icon-item" data-image="star">⭐</div>
                                <div class="icon-item" data-image="heart">❤️</div>
                                <div class="icon-item" data-image="smile">😊</div>
                                <div class="icon-item" data-image="fire">🔥</div>
                                <div class="icon-item" data-image="lightning">⚡</div>
                                <div class="icon-item" data-image="crown">👑</div>
                                <div class="icon-item" data-image="diamond">💎</div>
                                <div class="icon-item" data-image="rocket">🚀</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Icons Tab -->
                    <div class="tab-content" id="icons-tab">
                        <div class="control-group">
                            <label class="control-label">Vector Icons</label>
                            <div class="icons-grid">
                                <div class="icon-item" data-icon="circle">●</div>
                                <div class="icon-item" data-icon="square">■</div>
                                <div class="icon-item" data-icon="triangle">▲</div>
                                <div class="icon-item" data-icon="diamond">◆</div>
                                <div class="icon-item" data-icon="star">★</div>
                                <div class="icon-item" data-icon="heart">♥</div>
                                <div class="icon-item" data-icon="arrow">→</div>
                                <div class="icon-item" data-icon="check">✓</div>
                                <div class="icon-item" data-icon="cross">✗</div>
                                <div class="icon-item" data-icon="plus">+</div>
                                <div class="icon-item" data-icon="minus">−</div>
                                <div class="icon-item" data-icon="music">♪</div>
                            </div>
                        </div>
                        
                        <div class="control-group">
                            <label class="control-label">Icon Color</label>
                            <input type="color" id="iconColor" class="color-input" value="#000000">
                        </div>
                        
                        <div class="control-group">
                            <label class="control-label">Icon Size: <span id="iconSizeValue">30</span>px</label>
                            <input type="range" id="iconSize" class="range-slider" min="10" max="100" value="30">
                        </div>
                    </div>
                    
                    <!-- Layers Tab -->
                    <div class="tab-content" id="layers-tab">
                        <div class="control-group">
                            <label class="control-label">Design Elements</label>
                            <div class="element-list" id="elementList">
                                <div style="padding: 20px; text-align: center; color: #666;">No elements added yet</div>
                            </div>
                        </div>
                        
                        <div class="control-group">
                            <button class="btn btn-secondary" id="clearAllBtn" style="width: 100%;">Clear All</button>
                        </div>
                        
                        <div class="download-section">
                            <h3 style="margin: 0 0 15px 0; color: var(--dark-color);">Download Design</h3>
                            <p style="margin: 0 0 15px 0; font-size: 14px; color: #666;">Get your high-resolution design files</p>
                            <div class="download-options">
                                <button class="btn btn-success" id="downloadFullBtn" style="flex: 1;">Full T-Shirt</button>
                                <button class="btn btn-success" id="downloadDesignBtn" style="flex: 1;">Design Only</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="main-canvas-area">
                    <div class="toolbar">
                        <div class="zoom-controls">
                            <button class="zoom-btn" id="zoomOut">−</button>
                            <button class="zoom-btn" id="zoomIn">+</button>
                            <button class="zoom-btn" id="resetZoom">⌂</button>
                        </div>
                    </div>
                    
                    <div class="canvas-container">
                        <canvas id="designCanvas" width="600" height="700"></canvas>
                    </div>
                </div>
            </div>
        `;
        
        this.setupEventListeners();
        this.initCanvas();
    }
    
    loadGoogleFonts() {
        // Load Google Fonts
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=' + 
                   this.googleFonts.map(font => font.replace(/\s+/g, '+')).join('&family=') + 
                   ':wght@300;400;600;700&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        
        // Update font dropdown
        setTimeout(() => {
            const fontSelect = this.shadowRoot.getElementById('fontFamily');
            fontSelect.innerHTML = '';
            this.googleFonts.forEach(font => {
                const option = document.createElement('option');
                option.value = font;
                option.textContent = font;
                option.style.fontFamily = font;
                fontSelect.appendChild(option);
            });
        }, 1000);
    }
    
    setupEventListeners() {
        const shadow = this.shadowRoot;
        
        // Tab switching
        shadow.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });
        
        // T-shirt color
        shadow.getElementById('tshirtColor').addEventListener('change', (e) => {
            this.changeTShirtColor(e.target.value);
        });
        
        shadow.querySelectorAll('.preset-color').forEach(color => {
            color.addEventListener('click', () => {
                this.changeTShirtColor(color.dataset.color);
                shadow.getElementById('tshirtColor').value = color.dataset.color;
            });
        });
        
        // Text controls
        shadow.getElementById('addTextBtn').addEventListener('click', () => this.addText());
        shadow.getElementById('fontSize').addEventListener('input', (e) => {
            shadow.getElementById('fontSizeValue').textContent = e.target.value;
            this.updateSelectedElement();
        });
        shadow.getElementById('iconSize').addEventListener('input', (e) => {
            shadow.getElementById('iconSizeValue').textContent = e.target.value;
            this.updateSelectedElement();
        });
        
        // Image upload
        shadow.getElementById('imageUpload').addEventListener('click', () => {
            shadow.getElementById('imageFile').click();
        });
        
        shadow.getElementById('imageFile').addEventListener('change', (e) => {
            this.handleImageUpload(e.target.files[0]);
        });
        
        // Drag and drop
        const uploadArea = shadow.getElementById('imageUpload');
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            this.handleImageUpload(e.dataTransfer.files[0]);
        });
        
        // Stock images and icons
        shadow.querySelectorAll('[data-image]').forEach(item => {
            item.addEventListener('click', () => this.addStockImage(item.dataset.image, item.textContent));
        });
        
        shadow.querySelectorAll('[data-icon]').forEach(item => {
            item.addEventListener('click', () => this.addIcon(item.dataset.icon, item.textContent));
        });
        
        // Canvas events
        this.canvas = shadow.getElementById('designCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        
        // Download buttons
        shadow.getElementById('downloadFullBtn').addEventListener('click', () => this.downloadFull());
        shadow.getElementById('downloadDesignBtn').addEventListener('click', () => this.downloadDesignOnly());
        
        // Clear all
        shadow.getElementById('clearAllBtn').addEventListener('click', () => this.clearAll());
        
        // Zoom controls
        shadow.getElementById('zoomIn').addEventListener('click', () => this.zoom(1.2));
        shadow.getElementById('zoomOut').addEventListener('click', () => this.zoom(0.8));
        shadow.getElementById('resetZoom').addEventListener('click', () => this.resetZoom());
        
        // Style buttons
        shadow.getElementById('boldBtn').addEventListener('click', () => this.toggleStyle('bold'));
        shadow.getElementById('italicBtn').addEventListener('click', () => this.toggleStyle('italic'));
        shadow.getElementById('underlineBtn').addEventListener('click', () => this.toggleStyle('underline'));
        
        // Color and font changes
        shadow.getElementById('textColor').addEventListener('change', () => this.updateSelectedElement());
        shadow.getElementById('iconColor').addEventListener('change', () => this.updateSelectedElement());
        shadow.getElementById('fontFamily').addEventListener('change', () => this.updateSelectedElement());
        shadow.getElementById('textInput').addEventListener('input', () => this.updateSelectedElement());
    }
    
    initCanvas() {
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.loadTShirtImage();
    }
    
    async loadTShirtImage() {
        try {
            this.tshirtImg = new Image();
            this.tshirtImg.crossOrigin = 'anonymous';
            this.tshirtImg.onload = () => {
                this.drawCanvas();
            };
            this.tshirtImg.src = 'https://ourcodeworld.com/public-media/gallery/gallery-5d5afd3f1c7d6.png';
        } catch (error) {
            console.error('Error loading T-shirt image:', error);
            // Create a fallback t-shirt shape
            this.drawFallbackTShirt();
        }
    }
    
    drawFallbackTShirt() {
        this.ctx.fillStyle = this.tshirtColor;
        this.ctx.fillRect(100, 100, 400, 500);
        this.ctx.fillRect(50, 150, 100, 200);
        this.ctx.fillRect(450, 150, 100, 200);
        this.drawCanvas();
    }
    
    switchTab(tabName) {
        const shadow = this.shadowRoot;
        
        // Remove active class from all tabs and contents
        shadow.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
        shadow.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');
        
        // Add active class to selected tab and show content
        shadow.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        shadow.getElementById(`${tabName}-tab`).style.display = 'block';
    }
    
    changeTShirtColor(color) {
        this.tshirtColor = color;
        this.drawCanvas();
    }
    
    addText() {
        const textInput = this.shadowRoot.getElementById('textInput');
        const text = textInput.value.trim();
        
        if (!text) return;
        
        const element = {
            id: Date.now(),
            type: 'text',
            content: text,
            x: 300,
            y: 350,
            fontSize: parseInt(this.shadowRoot.getElementById('fontSize').value),
            fontFamily: this.shadowRoot.getElementById('fontFamily').value,
            color: this.shadowRoot.getElementById('textColor').value,
            bold: false,
            italic: false,
            underline: false,
            width: 0,
            height: 0
        };
        
        this.designElements.push(element);
        textInput.value = '';
        this.updateElementList();
        this.drawCanvas();
    }
    
    addIcon(iconType, iconText) {
        const element = {
            id: Date.now(),
            type: 'icon',
            content: iconText,
            iconType: iconType,
            x: 300,
            y: 350,
            size: parseInt(this.shadowRoot.getElementById('iconSize').value),
            color: this.shadowRoot.getElementById('iconColor').value,
            width: 0,
            height: 0
        };
        
        this.designElements.push(element);
        this.updateElementList();
        this.drawCanvas();
    }
    
    addStockImage(imageType, emoji) {
        const element = {
            id: Date.now(),
            type: 'emoji',
            content: emoji,
            x: 300,
            y: 350,
            size: 50,
            width: 50,
            height: 50
        };
        
        this.designElements.push(element);
        this.updateElementList();
        this.drawCanvas();
    }
    
    handleImageUpload(file) {
        if (!file || !file.type.startsWith('image/')) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const element = {
                    id: Date.now(),
                    type: 'image',
                    content: img,
                    x: 300,
                    y: 350,
                    width: Math.min(img.width, 200),
                    height: Math.min(img.height, 200),
                    originalWidth: img.width,
                    originalHeight: img.height
                };
                
                // Maintain aspect ratio
                const aspectRatio = img.width / img.height;
                if (element.width / element.height > aspectRatio) {
                    element.width = element.height * aspectRatio;
                } else {
                    element.height = element.width / aspectRatio;
                }
                
                this.designElements.push(element);
                this.updateElementList();
                this.drawCanvas();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    drawCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw T-shirt background with proper color masking
        if (this.tshirtImg && this.tshirtImg.complete) {
            this.drawTShirtWithColor();
        } else {
            // Fallback rectangle
            this.ctx.fillStyle = this.tshirtColor;
            this.ctx.fillRect(100, 100, 400, 500);
        }
        
        // Draw design elements
        this.designElements.forEach(element => {
            this.drawElement(element);
        });
        
        // Draw selection border for selected element
        if (this.selectedElement) {
            this.drawSelectionBorder(this.selectedElement);
        }
    }
    
    drawTShirtWithColor() {
        this.ctx.save();
        
        // First, draw the original image
        this.ctx.drawImage(this.tshirtImg, 0, 0, this.canvas.width, this.canvas.height);
        
        // Only apply color if it's not white
        if (this.tshirtColor !== '#ffffff') {
            // Create a temporary canvas to work with the mask
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = this.canvas.width;
            tempCanvas.height = this.canvas.height;
            
            // Draw the original image to temp canvas
            tempCtx.drawImage(this.tshirtImg, 0, 0, this.canvas.width, this.canvas.height);
            
            // Get image data to create a proper mask
            const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            const data = imageData.data;
            
            // Create color overlay only on non-transparent pixels
            tempCtx.globalCompositeOperation = 'source-over';
            tempCtx.fillStyle = this.tshirtColor;
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            tempCtx.globalCompositeOperation = 'destination-in';
            tempCtx.drawImage(this.tshirtImg, 0, 0, this.canvas.width, this.canvas.height);
            
            // Apply the colored overlay using multiply blend mode
            this.ctx.globalCompositeOperation = 'multiply';
            this.ctx.drawImage(tempCanvas, 0, 0);
        }
        
        this.ctx.restore();
    }
    
    drawElement(element) {
        this.ctx.save();
        
        switch (element.type) {
            case 'text': {
                this.drawText(element);
                break;
            }
            case 'icon': {
                this.drawIcon(element);
                break;
            }
            case 'image': {
                this.drawImage(element);
                break;
            }
            case 'emoji': {
                this.drawEmoji(element);
                break;
            }
        }
        
        this.ctx.restore();
    }
    
    drawText(element) {
        let fontStyle = '';
        if (element.bold) fontStyle += 'bold ';
        if (element.italic) fontStyle += 'italic ';
        
        this.ctx.font = `${fontStyle}${element.fontSize}px "${element.fontFamily}"`;
        this.ctx.fillStyle = element.color;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        const metrics = this.ctx.measureText(element.content);
        element.width = metrics.width;
        element.height = element.fontSize;
        
        this.ctx.fillText(element.content, element.x, element.y);
        
        if (element.underline) {
            this.ctx.strokeStyle = element.color;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(element.x - element.width/2, element.y + element.fontSize/3);
            this.ctx.lineTo(element.x + element.width/2, element.y + element.fontSize/3);
            this.ctx.stroke();
        }
    }
    
    drawIcon(element) {
        this.ctx.font = `${element.size}px Arial`;
        this.ctx.fillStyle = element.color;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Update element dimensions based on actual size
        const metrics = this.ctx.measureText(element.content);
        element.width = Math.max(element.size, metrics.width);
        element.height = element.size;
        
        this.ctx.fillText(element.content, element.x, element.y);
    }
    
    drawImage(element) {
        this.ctx.drawImage(element.content, 
            element.x - element.width/2, 
            element.y - element.height/2, 
            element.width, 
            element.height);
    }
    
    drawEmoji(element) {
        this.ctx.font = `${element.size}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Update element dimensions
        const metrics = this.ctx.measureText(element.content);
        element.width = Math.max(element.size, metrics.width);
        element.height = element.size;
        
        this.ctx.fillText(element.content, element.x, element.y);
    }
    
    drawSelectionBorder(element) {
        this.ctx.strokeStyle = '#007bff';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        
        const padding = 10;
        this.ctx.strokeRect(
            element.x - element.width/2 - padding,
            element.y - element.height/2 - padding,
            element.width + padding * 2,
            element.height + padding * 2
        );
        
        this.ctx.setLineDash([]);
    }
    
    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Find clicked element (check in reverse order to get top element)
        const clickedElement = [...this.designElements].reverse().find(element => {
            return x >= element.x - element.width/2 - 10 &&
                   x <= element.x + element.width/2 + 10 &&
                   y >= element.y - element.height/2 - 10 &&
                   y <= element.y + element.height/2 + 10;
        });
        
        this.selectedElement = clickedElement;
        this.updateElementList();
        this.populateControlsForSelectedElement();
        this.drawCanvas();
    }
    
    populateControlsForSelectedElement() {
        const shadow = this.shadowRoot;
        
        if (!this.selectedElement) {
            // Clear controls when nothing is selected
            shadow.getElementById('textInput').value = '';
            this.resetStyleButtons();
            return;
        }
        
        if (this.selectedElement.type === 'text') {
            // Populate text controls
            shadow.getElementById('textInput').value = this.selectedElement.content;
            shadow.getElementById('fontSize').value = this.selectedElement.fontSize;
            shadow.getElementById('fontSizeValue').textContent = this.selectedElement.fontSize;
            shadow.getElementById('fontFamily').value = this.selectedElement.fontFamily;
            shadow.getElementById('textColor').value = this.selectedElement.color;
            
            // Update style buttons
            this.updateStyleButton('boldBtn', this.selectedElement.bold);
            this.updateStyleButton('italicBtn', this.selectedElement.italic);
            this.updateStyleButton('underlineBtn', this.selectedElement.underline);
            
            // Switch to text tab for easier editing
            this.switchTab('text');
        } else if (this.selectedElement.type === 'icon') {
            // Populate icon controls
            shadow.getElementById('iconSize').value = this.selectedElement.size;
            shadow.getElementById('iconSizeValue').textContent = this.selectedElement.size;
            shadow.getElementById('iconColor').value = this.selectedElement.color;
            
            // Switch to icons tab
            this.switchTab('icons');
        } else if (this.selectedElement.type === 'emoji') {
            // Populate icon controls for emoji (they use same size controls)
            shadow.getElementById('iconSize').value = this.selectedElement.size;
            shadow.getElementById('iconSizeValue').textContent = this.selectedElement.size;
            
            // Switch to images tab
            this.switchTab('images');
        }
    }
    
    updateStyleButton(buttonId, isActive) {
        const btn = this.shadowRoot.getElementById(buttonId);
        if (isActive) {
            btn.style.background = 'var(--primary-color)';
            btn.style.color = 'white';
        } else {
            btn.style.background = 'var(--light-color)';
            btn.style.color = 'var(--dark-color)';
        }
    }
    
    resetStyleButtons() {
        ['boldBtn', 'italicBtn', 'underlineBtn'].forEach(buttonId => {
            this.updateStyleButton(buttonId, false);
        });
    }
    
    handleMouseDown(e) {
        if (this.selectedElement) {
            this.isDrawing = true;
            const rect = this.canvas.getBoundingClientRect();
            this.lastX = e.clientX - rect.left;
            this.lastY = e.clientY - rect.top;
        }
    }
    
    handleMouseMove(e) {
        if (this.isDrawing && this.selectedElement) {
            const rect = this.canvas.getBoundingClientRect();
            const currentX = e.clientX - rect.left;
            const currentY = e.clientY - rect.top;
            
            const deltaX = currentX - this.lastX;
            const deltaY = currentY - this.lastY;
            
            this.selectedElement.x += deltaX;
            this.selectedElement.y += deltaY;
            
            this.lastX = currentX;
            this.lastY = currentY;
            
            this.drawCanvas();
        }
    }
    
    handleMouseUp() {
        this.isDrawing = false;
    }
    
    updateSelectedElement() {
        if (!this.selectedElement) return;
        
        const shadow = this.shadowRoot;
        
        if (this.selectedElement.type === 'text') {
            const textContent = shadow.getElementById('textInput').value;
            if (textContent !== this.selectedElement.content) {
                this.selectedElement.content = textContent;
            }
            this.selectedElement.fontSize = parseInt(shadow.getElementById('fontSize').value);
            this.selectedElement.fontFamily = shadow.getElementById('fontFamily').value;
            this.selectedElement.color = shadow.getElementById('textColor').value;
        } else if (this.selectedElement.type === 'icon') {
            this.selectedElement.size = parseInt(shadow.getElementById('iconSize').value);
            this.selectedElement.color = shadow.getElementById('iconColor').value;
        } else if (this.selectedElement.type === 'emoji') {
            this.selectedElement.size = parseInt(shadow.getElementById('iconSize').value);
        }
        
        this.updateElementList();
        this.drawCanvas();
    }
    
    toggleStyle(style) {
        if (!this.selectedElement || this.selectedElement.type !== 'text') return;
        
        this.selectedElement[style] = !this.selectedElement[style];
        
        // Update button appearance
        const btn = this.shadowRoot.getElementById(`${style}Btn`);
        if (this.selectedElement[style]) {
            btn.style.background = 'var(--primary-color)';
            btn.style.color = 'white';
        } else {
            btn.style.background = 'var(--light-color)';
            btn.style.color = 'var(--dark-color)';
        }
        
        this.drawCanvas();
    }
    
    updateElementList() {
        const elementList = this.shadowRoot.getElementById('elementList');
        
        if (this.designElements.length === 0) {
            elementList.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">No elements added yet</div>';
            return;
        }
        
        elementList.innerHTML = '';
        this.designElements.forEach((element, index) => {
            const item = document.createElement('div');
            item.className = 'element-item';
            if (element === this.selectedElement) {
                item.classList.add('selected');
            }
            
            let elementName = '';
            switch (element.type) {
                case 'text': {
                    elementName = `Text: ${element.content.substring(0, 20)}`;
                    break;
                }
                case 'icon': {
                    elementName = `Icon: ${element.content}`;
                    break;
                }
                case 'image': {
                    elementName = `Image`;
                    break;
                }
                case 'emoji': {
                    elementName = `Emoji: ${element.content}`;
                    break;
                }
            }
            
            item.innerHTML = `
                <span>${elementName}</span>
                <button class="delete-btn" onclick="this.getRootNode().host.deleteElement(${element.id})">Delete</button>
            `;
            
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('delete-btn')) {
                    this.selectedElement = element;
                    this.updateElementList();
                    this.drawCanvas();
                }
            });
            
            elementList.appendChild(item);
        });
    }
    
    deleteElement(elementId) {
        this.designElements = this.designElements.filter(element => element.id !== elementId);
        if (this.selectedElement && this.selectedElement.id === elementId) {
            this.selectedElement = null;
        }
        this.updateElementList();
        this.drawCanvas();
    }
    
    clearAll() {
        this.designElements = [];
        this.selectedElement = null;
        this.updateElementList();
        this.drawCanvas();
    }
    
    zoom(factor) {
        this.scale *= factor;
        this.scale = Math.max(0.5, Math.min(3, this.scale));
        this.canvas.style.transform = `scale(${this.scale})`;
    }
    
    resetZoom() {
        this.scale = 1;
        this.canvas.style.transform = 'scale(1)';
    }
    
    downloadFull() {
        // Create a high-resolution canvas
        const downloadCanvas = document.createElement('canvas');
        const downloadCtx = downloadCanvas.getContext('2d');
        const scale = 3; // High resolution multiplier
        
        downloadCanvas.width = this.canvas.width * scale;
        downloadCanvas.height = this.canvas.height * scale;
        downloadCtx.scale(scale, scale);
        
        // Draw the full t-shirt with design using improved color method
        if (this.tshirtImg && this.tshirtImg.complete) {
            this.drawTShirtWithColorOnContext(downloadCtx);
        } else {
            downloadCtx.fillStyle = this.tshirtColor;
            downloadCtx.fillRect(100, 100, 400, 500);
        }
        
        // Draw all design elements
        this.designElements.forEach(element => {
            this.drawElementOnCanvas(downloadCtx, element);
        });
        
        // Download the image
        this.downloadCanvasAsImage(downloadCanvas, 'tshirt-design-full.png');
    }
    
    drawTShirtWithColorOnContext(ctx) {
        ctx.save();
        
        // First, draw the original image
        ctx.drawImage(this.tshirtImg, 0, 0, this.canvas.width, this.canvas.height);
        
        // Only apply color if it's not white
        if (this.tshirtColor !== '#ffffff') {
            // Create a temporary canvas to work with the mask
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = this.canvas.width;
            tempCanvas.height = this.canvas.height;
            
            // Draw the original image to temp canvas
            tempCtx.drawImage(this.tshirtImg, 0, 0, this.canvas.width, this.canvas.height);
            
            // Create color overlay only on non-transparent pixels
            tempCtx.globalCompositeOperation = 'source-over';
            tempCtx.fillStyle = this.tshirtColor;
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            tempCtx.globalCompositeOperation = 'destination-in';
            tempCtx.drawImage(this.tshirtImg, 0, 0, this.canvas.width, this.canvas.height);
            
            // Apply the colored overlay using multiply blend mode
            ctx.globalCompositeOperation = 'multiply';
            ctx.drawImage(tempCanvas, 0, 0);
        }
        
        ctx.restore();
    }
    
    downloadDesignOnly() {
        if (this.designElements.length === 0) {
            alert('No design elements to download!');
            return;
        }
        
        // Calculate bounding box of all elements
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        this.designElements.forEach(element => {
            const left = element.x - element.width/2;
            const right = element.x + element.width/2;
            const top = element.y - element.height/2;
            const bottom = element.y + element.height/2;
            
            minX = Math.min(minX, left);
            maxX = Math.max(maxX, right);
            minY = Math.min(minY, top);
            maxY = Math.max(maxY, bottom);
        });
        
        // Add padding
        const padding = 20;
        minX -= padding;
        minY -= padding;
        maxX += padding;
        maxY += padding;
        
        // Create a canvas for just the design
        const designCanvas = document.createElement('canvas');
        const designCtx = designCanvas.getContext('2d');
        const scale = 5; // Very high resolution for printing
        
        designCanvas.width = (maxX - minX) * scale;
        designCanvas.height = (maxY - minY) * scale;
        designCtx.scale(scale, scale);
        designCtx.translate(-minX, -minY);
        
        // Draw elements with transparent background
        this.designElements.forEach(element => {
            this.drawElementOnCanvas(designCtx, element);
        });
        
        // Download the design only
        this.downloadCanvasAsImage(designCanvas, 'tshirt-design-print-ready.png');
    }
    
    drawElementOnCanvas(ctx, element) {
        ctx.save();
        
        switch (element.type) {
            case 'text': {
                let fontStyle = '';
                if (element.bold) fontStyle += 'bold ';
                if (element.italic) fontStyle += 'italic ';
                
                ctx.font = `${fontStyle}${element.fontSize}px "${element.fontFamily}"`;
                ctx.fillStyle = element.color;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                ctx.fillText(element.content, element.x, element.y);
                
                if (element.underline) {
                    ctx.strokeStyle = element.color;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(element.x - element.width/2, element.y + element.fontSize/3);
                    ctx.lineTo(element.x + element.width/2, element.y + element.fontSize/3);
                    ctx.stroke();
                }
                break;
            }
                
            case 'icon': {
                ctx.font = `${element.size}px Arial`;
                ctx.fillStyle = element.color;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(element.content, element.x, element.y);
                break;
            }
                
            case 'image': {
                ctx.drawImage(element.content, 
                    element.x - element.width/2, 
                    element.y - element.height/2, 
                    element.width, 
                    element.height);
                break;
            }
                
            case 'emoji': {
                ctx.font = `${element.size}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(element.content, element.x, element.y);
                break;
            }
        }
        
        ctx.restore();
    }
    
    downloadCanvasAsImage(canvas, filename) {
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        }, 'image/png', 1.0);
    }
}

// Register the custom element
customElements.define('tshirt-designer', TShirtDesigner);

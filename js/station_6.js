/**
 * STATION 6 - TRẠM SÁNG TẠO
 * Gieo mầm cây (Cà phê + Đất sét sinh học)
 */

const Station6 = {
    state: 0, // 0: Đất trống, 1: Đã gieo hạt, 2: Đã tưới nước (Mọc mầm)
    
    init() {
        this.container = document.querySelector('#station-6 .simulation-placeholder');
        this.btnAction = document.querySelector('#station-6 .btn-primary');
        
        if(this.container && this.btnAction) {
            this.renderUI();
            this.bindEvents();
        }
    },
    
    renderUI() {
        this.container.innerHTML = '';
        Object.assign(this.container.style, {
            position: 'relative',
            padding: '0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            alignItems: 'center',
            background: '#EFEBE9', // Nền màu nâu nhạt
            overflow: 'hidden'
        });
        
        this.container.innerHTML = `
            <div style="position: absolute; top: 15px; left: 20px; font-family: 'Lexend', sans-serif; color: #1A1A1A; text-align: left;">
                <div class="sim-text">🌱 Tái chế bã cà phê</div>
                <div class="sim-subtext">Ủ bã cà phê làm "Đất sét sinh học" gieo mầm.</div>
            </div>
            
            <div style="position: relative; width: 100%; height: 250px; display: flex; flex-direction: column; align-items: center; justify-content: flex-end;">
                
                <!-- Mặt trời -->
                <svg id="s6-sun" viewBox="0 0 100 100" width="80" height="80" style="position: absolute; top: -30px; right: 20px; opacity: 0; z-index: 1;">
                    <circle cx="50" cy="50" r="25" fill="#FFC107" />
                    <g stroke="#FFC107" stroke-width="6" stroke-linecap="round">
                        <line x1="50" y1="5" x2="50" y2="15" />
                        <line x1="50" y1="85" x2="50" y2="95" />
                        <line x1="5" y1="50" x2="15" y2="50" />
                        <line x1="85" y1="50" x2="95" y2="50" />
                        <line x1="18" y1="18" x2="25" y2="25" />
                        <line x1="75" y1="75" x2="82" y2="82" />
                        <line x1="18" y1="82" x2="25" y2="75" />
                        <line x1="75" y1="25" x2="82" y2="18" />
                    </g>
                </svg>

                <!-- Mầm cây SVG & Dropzone -->
                <div id="s6-plant" style="position: absolute; bottom: 40px; width: 60px; height: 100px; transform-origin: bottom center; transform: scaleY(0); z-index: 5;">
                    <svg viewBox="0 0 100 150" width="100%" height="100%" style="position: absolute; bottom: 0; left: 0;">
                        <!-- Thân cây -->
                        <path d="M50,150 Q45,100 50,50" fill="none" stroke="#4CAF50" stroke-width="8" stroke-linecap="round"/>
                        <!-- Lá trái -->
                        <path d="M50,90 Q10,90 20,50 Q40,60 50,90 Z" fill="#8BC34A" stroke="#2E7D32" stroke-width="3"/>
                        <!-- Lá phải -->
                        <path d="M50,70 Q90,70 80,30 Q60,40 50,70 Z" fill="#8BC34A" stroke="#2E7D32" stroke-width="3"/>
                        <!-- Lá chóp -->
                        <path d="M50,50 Q30,20 50,5 Q70,20 50,50 Z" fill="#4CAF50" stroke="#2E7D32" stroke-width="3"/>
                    </svg>
                    <!-- Khu vực chứa đồ trang trí kéo thả lên cây (Dropzone) nằm bên TRONG s6-plant để tự động scale -->
                    <div id="s6-tree-dropzone" style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 100px; height: 150px; z-index: 10;"></div>
                </div>
                
                <!-- Hạt giống -->
                <div id="s6-seed" style="position: absolute; bottom: 35px; width: 25px; height: 15px; background: #5D4037; border-radius: 50%; border: 2px solid #3E2723; opacity: 0; z-index: 3; box-shadow: inset -2px -2px 0 rgba(0,0,0,0.5);"></div>

                <!-- Chậu / Mặt đất bã cà phê -->
                <div style="position: relative; width: 100%; height: 50px; background: #795548; border-top: 4px solid #4E342E; z-index: 4; display: flex; justify-content: center;">
                    <!-- Texture đất -->
                    <div style="position: absolute; top: 0; width: 100%; height: 100%; opacity: 0.3; background-image: radial-gradient(#3E2723 2px, transparent 2px); background-size: 15px 15px;"></div>
                    <!-- Viền miệng chậu -->
                    <div style="position: absolute; top: -10px; width: 160px; height: 20px; background: #8D6E63; border: 4px solid #1A1A1A; border-radius: 10px;"></div>
                </div>

                <!-- Bình tưới nước SVG (Ẩn bên trên) -->
                <div id="s6-watering-can" style="position: absolute; top: -150px; left: 50%; transform: translateX(-75px) rotate(-20deg); width: 150px; height: 125px; z-index: 6; opacity: 0;">
                    <svg viewBox="0 0 100 80" width="100%" height="100%">
                        <path d="M40,20 L80,20 L90,70 L30,70 Z" fill="#29B6F6" stroke="#1A1A1A" stroke-width="4"/>
                        <path d="M35,45 L5,20" fill="none" stroke="#1A1A1A" stroke-width="6" stroke-linecap="round"/>
                        <path d="M85,30 Q110,30 105,60" fill="none" stroke="#1A1A1A" stroke-width="6" stroke-linecap="round"/>
                    </svg>
                </div>
                
                <!-- Giọt nước (Đưa ra ngoài để không bị xoay chéo) -->
                <div id="s6-drops" style="position: absolute; bottom: 100px; left: 50%; transform: translateX(-50px); opacity: 0; z-index: 5;">
                    <div style="width:8px; height:16px; background:#03A9F4; margin: 4px; border-radius:4px;"></div>
                    <div style="width:8px; height:16px; background:#03A9F4; margin: 4px; border-radius:4px;"></div>
                    <div style="width:8px; height:16px; background:#03A9F4; margin: 4px; border-radius:4px;"></div>
                </div>
                
                <!-- Khay chứa vật phẩm trang trí (spawn sau khi lớn) -->
                <div id="s6-items-tray" style="position: absolute; bottom: 0px; left: 0; width: 100%; height: 40px; display: flex; justify-content: center; gap: 10px; z-index: 7;"></div>
            </div>
        `;
        
        this.btnAction.innerText = "🌰 GIEO HẠT MẦM";
        
        this.bindDropzone();
    },
    
    bindEvents() {
        window.bindAntiZoomBtn(this.btnAction, () => {
            if(window.AudioEngine) AudioEngine.playClick();
            if (this.state === 0) {
                this.plantSeed();
            } else if (this.state === 1) {
                this.waterPlant();
            }
        });
    },
    
    bindDropzone() {
        const dropzone = document.getElementById('s6-tree-dropzone');
        dropzone.addEventListener('dragover', e => e.preventDefault());
        dropzone.addEventListener('drop', e => {
            e.preventDefault();
            const itemId = e.dataTransfer.getData('text/plain');
            const item = document.getElementById(itemId);
            if(item) {
                if(window.AudioEngine) AudioEngine.playDrop();
                dropzone.appendChild(item);
                item.style.position = 'absolute';
                // Tính toán vị trí tương đối có tính đến hệ số scale của s6-plant
                const rect = dropzone.getBoundingClientRect();
                const plantScale = (window.gsap && gsap.getProperty('#s6-plant', 'scale')) || 1;
                
                item.style.left = ((e.clientX - rect.left) / plantScale - 15) + 'px';
                item.style.top = ((e.clientY - rect.top) / plantScale - 15) + 'px';
                item.style.margin = '0';
                
                if(window.gsap) gsap.fromTo(item, {scale:0}, {scale:1, duration: 0.5, ease: "back.out"});
            }
        });
    },
    
    plantSeed() {
        this.state = 1;
        this.btnAction.style.pointerEvents = "none";
        
        if(!window.gsap) {
            this.btnAction.innerText = "💧 TƯỚI NƯỚC";
            this.btnAction.style.background = "#2196F3";
            this.btnAction.style.color = "#FFF";
            this.btnAction.style.pointerEvents = "auto";
            return;
        }
        
        // Hạt giống rơi từ trên xuống
        gsap.fromTo('#s6-seed', 
            { y: -150, opacity: 1 }, 
            { y: 0, duration: 0.8, ease: "bounce.out", onComplete: () => {
                this.btnAction.innerText = "💧 TƯỚI NƯỚC";
                this.btnAction.style.background = "#2196F3";
                this.btnAction.style.color = "#FFF";
                this.btnAction.style.pointerEvents = "auto";
            } }
        );
    },
    
    waterPlant() {
        this.state = 2;
        this.btnAction.innerText = "⏳ ĐANG PHÁT TRIỂN...";
        this.btnAction.style.background = "#FF9800";
        this.btnAction.style.pointerEvents = "none";
        
        if(!window.gsap) return;
        
        const tl = gsap.timeline({
            onStart: () => {
                if(window.AudioEngine) {
                    setTimeout(() => AudioEngine.playWind(), 500); // Tiếng tưới
                }
            }
        });
        
        // 1. Bình tưới hiện ra và nghiêng đổ nước
        tl.to('#s6-watering-can', { y: 100, opacity: 1, duration: 0.5, ease: "power2.out" })
          .to('#s6-watering-can', { rotation: -45, duration: 0.3 })
          // 2. Nước chảy thẳng xuống (Y local)
          .to('#s6-drops', { opacity: 1, duration: 0.1 })
          .to('#s6-drops', { y: 50, opacity: 0, duration: 0.6, repeat: 2 })
          // 3. Bình tưới bay đi
          .to('#s6-watering-can', { rotation: -20, opacity: 0, y: -100, duration: 0.5 })
          // 4. Hạt giống nứt ra (ẩn đi), Cây con lớn lên, Mặt trời hiện ra
          .to('#s6-seed', { opacity: 0, duration: 0.2 })
          .to('#s6-sun', { opacity: 1, rotation: 45, duration: 2 }, "-=0.2")
          .to('#s6-plant', { scaleY: 1, duration: 2.5, ease: "elastic.out(1, 0.5)" }, "-=2")
          .call(() => {
              this.btnAction.innerText = "✅ ĐÃ ƯƠM MẦM THÀNH CÔNG";
              this.btnAction.style.background = "#4CAF50";
              
              if(window.RewardSystem) {
                  window.RewardSystem.unlockPiece(6);
              }
              
              // Giai đoạn mọc lớn thêm và spawn đồ vật sau 3s
              setTimeout(() => this.spawnDecorations(), 3000);
          });
    },
    
    spawnDecorations() {
        if(!window.gsap) return;
        
        // Phóng to cây liên tục rất chậm (lớn lên theo thời gian thực, 15s để người dùng kịp thấy)
        gsap.to('#s6-plant', { scaleX: 2.2, scaleY: 2.2, transformOrigin: "bottom center", duration: 15, ease: "power1.out" });
        
        const tray = document.getElementById('s6-items-tray');
        tray.innerHTML = '';
        
        const items = ['🍎', '🍎', '🎀'];
        items.forEach((emoji, i) => {
            const el = document.createElement('div');
            el.id = 's6-item-' + i;
            el.innerText = emoji;
            el.draggable = true;
            Object.assign(el.style, {
                fontSize: '1.5rem', cursor: 'grab', userSelect: 'none', 
                background: 'rgba(255,255,255,0.7)', borderRadius: '50%', 
                width: '35px', height: '35px', display: 'flex', 
                justifyContent: 'center', alignItems: 'center',
                boxShadow: '2px 2px 0 #1A1A1A'
            });
            
            el.addEventListener('dragstart', (e) => {
                if(window.AudioEngine) AudioEngine.playClick();
                e.dataTransfer.setData('text/plain', el.id);
            });
            
            tray.appendChild(el);
            gsap.fromTo(el, {scale: 0}, {scale: 1, delay: i * 0.2, duration: 0.5, ease: "back.out"});
        });
        
        this.btnAction.innerText = "🎨 KÉO THẢ ĐỒ TRANG TRÍ LÊN CÂY";
    }
};

document.addEventListener("DOMContentLoaded", () => {
    Station6.init();
});

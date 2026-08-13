/**
 * STATION 4 - TRẠM ẢO THUẬT HÓA HỌC
 * Hiện tượng: Lắc dung dịch Methylene Blue từ Hồng sang Xanh, để yên lại về Hồng
 */

const Station4 = {
    isShaking: false,
    isCompleted: false,
    
    init() {
        this.container = document.querySelector('#station-4 .simulation-placeholder');
        this.btnShake = document.querySelector('#station-4 .btn-primary');
        
        if(this.container && this.btnShake) {
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
            justifyContent: 'center',
            alignItems: 'flex-end',
            paddingBottom: '15px',
            background: '#FFF3E0', // Nền cam nhạt
            overflow: 'hidden'
        });
        
        this.container.innerHTML = `
            <div style="position: absolute; top: 15px; left: 20px; font-family: 'Lexend', sans-serif; color: #1A1A1A; text-align: left;">
                <div class="sim-text">🧪 Methylene Blue & Phản ứng oxy hóa</div>
                <div class="sim-subtext" style="max-width: 80%;">Trạng thái nghỉ (Khử): <span style="color:#E91E63; font-weight:bold;">HỒNG</span> <br>Trạng thái lắc (Oxy hóa): <span style="color:#2196F3; font-weight:bold;">XANH</span></div>
            </div>
            
            <div id="s4-flask-wrapper" style="position: relative; width: 150px; height: 180px; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; transform-origin: bottom center; transform: scale(1.3); bottom: 0px;">
                
                <!-- Decor nền -->
                <div style="position: absolute; top: -50px; left: -100%; width: 300%; height: 250px; pointer-events: none; opacity: 0.15; background-image: repeating-linear-gradient(45deg, var(--orange) 0, var(--orange) 2px, transparent 2px, transparent 20px); z-index: 0;"></div>
                <div style="position: absolute; top: -30px; right: -120px; font-size: 4rem; opacity: 0.2; z-index: 0;">⌬</div>
                <div style="position: absolute; bottom: 0px; left: -100px; font-size: 3.5rem; opacity: 0.2; z-index: 0;">🧬</div>

                <!-- Nút bấc (Nắp bình) -->
                <div style="position: absolute; top: -10px; width: 35px; height: 20px; background: #D7CCC8; border: 3px solid #1A1A1A; border-radius: 4px; z-index: 2;"></div>

                <!-- Đế đun (Bunsen Burner or Hot plate) -->
                <div style="position: absolute; bottom: -10px; width: 80px; height: 15px; background: #607D8B; border-radius: 5px; border: 2px solid #1A1A1A; z-index: 0; box-shadow: 0 -5px 15px rgba(255, 152, 0, 0.5);"></div>
                <div class="burner-flame" style="position: absolute; bottom: 5px; width: 60px; height: 5px; background: #FF9800; border-radius: 2px; z-index: 1; box-shadow: 0 0 10px #FF9800, 0 0 20px #FF9800;"></div>

                <!-- Bình cầu (Round-bottom Flask) -->
                <svg viewBox="0 0 120 160" width="100%" height="100%" style="z-index: 1;">
                    <!-- Cổ bình -->
                    <path d="M45,0 L75,0 L75,60 C75,60 115,80 115,120 C115,150 90,160 60,160 C30,160 5,150 5,120 C5,80 45,60 45,60 Z" fill="rgba(255,255,255,0.6)" stroke="#1A1A1A" stroke-width="4"/>
                    
                    <clipPath id="s4-flask-clip">
                        <path d="M45,0 L75,0 L75,60 C75,60 115,80 115,120 C115,150 90,160 60,160 C30,160 5,150 5,120 C5,80 45,60 45,60 Z"/>
                    </clipPath>
                    
                    <g clip-path="url(#s4-flask-clip)">
                        <!-- Dung dịch (Mặc định màu hồng) -->
                        <rect id="s4-liquid" x="0" y="80" width="120" height="80" fill="#E91E63"/>
                        
                        <!-- Hiệu ứng highlight bóng -->
                        <path d="M15,110 Q25,70 60,70" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="6" stroke-linecap="round"/>
                    </g>
                </svg>
            </div>
            
            <!-- Hạt Oxy (Mô phỏng hòa tan khi lắc) -->
            <div id="s4-oxygen-particles" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0;"></div>
        `;
        
        this.flaskWrapper = document.getElementById('s4-flask-wrapper');
        this.liquid = document.getElementById('s4-liquid');
        this.btnShake.innerText = "👋 LẮC MẠNH BÌNH";
    },
    
    bindEvents() {
        window.bindAntiZoomBtn(this.btnShake, () => {
            if(this.isShaking || this.isCompleted) return;
            if(window.AudioEngine) {
                AudioEngine.playWind();
                AudioEngine.playBubble();
                setTimeout(() => AudioEngine.playWind(), 300);
            }
            this.startShake();
        });
    },
    
    startShake() {
        this.isShaking = true;
        this.btnShake.innerText = "🌀 ĐANG PHẢN ỨNG OXY HÓA...";
        this.btnShake.style.background = "#2196F3";
        this.btnShake.style.color = "#FFF";
        
        if(!window.gsap) return;
        
        const tl = gsap.timeline();
        
        // 1. Hiệu ứng lắc dữ dội (Mô phỏng lắc tay)
        tl.to(this.flaskWrapper, {
            rotation: 25, x: 15, duration: 0.1, yoyo: true, repeat: 15, ease: "none"
        })
        // 2. Chuyển sang màu XANH trong lúc lắc
        gsap.to(this.liquid, {
            fill: "#2196F3", duration: 1.5, ease: "power2.out"
        });
        
        // 3. Sau khi lắc xong (Để yên bình)
        tl.to(this.flaskWrapper, {
            rotation: 0, x: 0, duration: 0.5,
            onComplete: () => {
                this.btnShake.innerText = "⏳ ĐỂ YÊN & QUAN SÁT...";
                this.btnShake.style.background = "#FF9800";
                
                // 4. Chờ 3 giây để oxy thoát ra, dung dịch dần về màu HỒNG
                gsap.to(this.liquid, {
                    fill: "#E91E63", duration: 6, delay: 1, ease: "power1.inOut",
                    onComplete: () => {
                        this.btnShake.innerText = "✅ THÍ NGHIỆM THÀNH CÔNG";
                        this.btnShake.style.background = "#4CAF50";
                        this.isCompleted = true;
                        
                        if(window.RewardSystem) {
                            window.RewardSystem.unlockPiece(4);
                        }
                    }
                });
            }
        });
    }
};

document.addEventListener("DOMContentLoaded", () => {
    Station4.init();
});

/**
 * STATION 2 - TRẠM NĂNG LƯỢNG (CƠ NĂNG -> ĐIỆN NĂNG)
 * Người chơi click liên tục để tạo gió quay cánh quạt, phát điện sáng đèn LED
 */

const Station2 = {
    power: 0,
    isUnlocked: false,
    
    init() {
        this.container = document.querySelector('#station-2 .simulation-placeholder');
        this.btnWind = document.querySelector('#station-2 .btn-primary');
        
        if(this.container && this.btnWind) {
            this.renderUI();
            this.bindEvents();
            
            // Vòng lặp giảm năng lượng (giả lập ma sát và tiêu hao)
            setInterval(() => {
                if (this.power > 0) {
                    this.power = Math.max(0, this.power - 3);
                    this.updateUI();
                }
            }, 100);
        }
    },
    
    renderUI() {
        this.container.innerHTML = '';
        Object.assign(this.container.style, {
            position: 'relative',
            padding: '0',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: '#E3F2FD' // Bầu trời xanh nhạt
        });
        
        this.container.innerHTML = `
            <!-- Thanh năng lượng -->
            <div style="position: absolute; top: 15px; left: 20px; font-family: 'Lexend', sans-serif; color: #1A1A1A; text-align: left;">
                <div class="sim-text">⚡ Điện năng: <span id="s2-power-val">0</span>%</div>
                <div style="width: 150px; height: 12px; background: #FFF; border: 2px solid #1A1A1A; border-radius: 6px; margin-top: 5px; overflow: hidden;">
                    <div id="s2-power-bar" style="width: 0%; height: 100%; background: #FFC107; transition: width 0.1s;"></div>
                </div>
                <div class="sim-subtext">(Click liên tục để tạo luồng gió!)</div>
            </div>
            
            <!-- Hệ thống Cánh quạt & Đèn LED -->
            <div style="position: absolute; bottom: 30px; left: 15%; width: 70%; height: 200px;">
                
                <!-- HTML Dòng Electron chạy (Hình tròn 100% không bị méo/dẹp) -->
                <div id="s2-electrons-container" style="position: absolute; bottom: 0; left: 0; width: 100%; height: 50px; pointer-events: none; z-index: 3; opacity: 0; transition: opacity 0.2s;">
                    <div class="electron-bubble e-1"><span>+</span></div>
                    <div class="electron-bubble e-2"><span>+</span></div>
                    <div class="electron-bubble e-3"><span>+</span></div>
                    <div class="electron-bubble e-4"><span>+</span></div>
                </div>

                <!-- Dây điện nối ở chính giữa -->
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position: absolute; bottom: 0; left: 0; width: 100%; height: 50px; z-index: 1; overflow: visible;">
                    <path d="M 5 20 Q 50 100 95 20" fill="none" stroke="#1A1A1A" stroke-width="4" stroke-dasharray="8 4"/>
                    <!-- Dòng điện nền sáng -->
                    <path d="M 5 20 Q 50 100 95 20" fill="none" stroke="#FFEB3B" stroke-width="3" id="s2-current-path" opacity="0"/>
                </svg>

                <!-- Tua bin gió -->
                <div style="position: absolute; bottom: 0; left: -20px; width: 100px; height: 200px; display: flex; flex-direction: column; align-items: center;">
                    <!-- Cánh quạt -->
                    <div id="s2-propeller" style="position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 120px; height: 120px; z-index: 2;">
                        <svg viewBox="0 0 100 100" width="100%" height="100%">
                            <circle cx="50" cy="50" r="8" fill="#1A1A1A" z-index="3"/>
                            <!-- 3 Cánh -->
                            <path d="M50,50 L50,5 A10,10 0 0,1 60,15 Z" fill="#FFF" stroke="#1A1A1A" stroke-width="2"/>
                            <path d="M50,50 L89,73 A10,10 0 0,1 75,76 Z" fill="#FFF" stroke="#1A1A1A" stroke-width="2"/>
                            <path d="M50,50 L11,73 A10,10 0 0,1 15,59 Z" fill="#FFF" stroke="#1A1A1A" stroke-width="2"/>
                        </svg>
                    </div>
                    <!-- Cột trụ -->
                    <div style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 12px; height: 150px; background: #B0BEC5; border: 2px solid #1A1A1A; border-radius: 4px;"></div>
                </div>

                <!-- Đèn LED -->
                <div style="position: absolute; bottom: 0; right: -20px; width: 60px; height: 100px; display: flex; flex-direction: column; align-items: center; justify-content: flex-end;">
                    <div id="s2-led-glow" style="position: absolute; top: -30px; width: 120px; height: 120px; background: radial-gradient(circle, rgba(255,235,59,0.8) 0%, rgba(255,235,59,0) 70%); opacity: 0; transition: opacity 0.2s; pointer-events: none; mix-blend-mode: overlay;"></div>
                    <svg id="s2-led-bulb" viewBox="0 0 50 80" width="100%" height="100%" style="z-index: 2; transition: fill 0.2s;">
                        <!-- Bóng thủy tinh -->
                        <path d="M10,40 C10,10 40,10 40,40 L35,60 L15,60 Z" fill="rgba(255,255,255,0.7)" stroke="#1A1A1A" stroke-width="3"/>
                        <!-- Tim đèn -->
                        <path d="M20,60 L20,30 M30,60 L30,30 M20,30 L30,30" fill="none" stroke="#555" stroke-width="2"/>
                        <!-- Chân đèn -->
                        <rect x="15" y="60" width="20" height="15" fill="#78909C" stroke="#1A1A1A" stroke-width="3" rx="2"/>
                    </svg>
                </div>

            </div>
        `;
        
        this.propeller = document.getElementById('s2-propeller');
        this.ledBulb = document.querySelector('#s2-led-bulb path:first-child');
        this.ledGlow = document.getElementById('s2-led-glow');
        this.valPower = document.getElementById('s2-power-val');
        this.barPower = document.getElementById('s2-power-bar');
        this.currentLine = document.getElementById('s2-current-path');
        this.electrons = document.getElementById('s2-electrons-container');
        
        this.btnWind.innerText = "💨 TẠO LUỒNG GIÓ (CLICK NHANH)";
        
        // Khởi tạo chuyển động electron đã sử dụng animateMotion gốc của SVG, không cần dùng strokeDashoffset GSAP nữa.
    },
    
    bindEvents() {
        const handleInteraction = (e) => {
            e.preventDefault(); // Tránh bị double action khi có cả touch và click
            if(window.AudioEngine) AudioEngine.playWind();
            
            // Mỗi cú nhấp / chạm tăng 6% năng lượng (tăng độ khó)
            this.power = Math.min(100, this.power + 6);
            this.updateUI();
            
            // Check win
            if(this.power === 100 && !this.isUnlocked) {
                this.complete();
            }
        };
        
        window.bindAntiZoomBtn(this.btnWind, handleInteraction);
    },
    
    updateUI() {
        this.valPower.innerText = this.power;
        this.barPower.style.width = `${this.power}%`;
        
        // Tốc độ quay cánh quạt tỷ lệ thuận với năng lượng
        const rotationSpeed = this.power > 0 ? (105 - this.power) / 100 : 0; // power càng cao, tgian quay 1 vòng càng ngắn
        
        if (this.power > 0) {
            if (window.gsap) {
                gsap.to(this.propeller, {
                    rotation: "+=120", 
                    duration: rotationSpeed, 
                    ease: "none",
                    overwrite: "auto"
                });
            }
            
            // Hiệu ứng dòng điện
            this.currentLine.style.opacity = this.power / 100;
            this.electrons.style.opacity = this.power / 100;
            
            // Đèn LED sáng dần
            this.ledBulb.style.fill = `rgba(255, 235, 59, ${0.4 + (this.power / 100) * 0.6})`;
            this.ledGlow.style.opacity = this.power / 100;
        } else {
            this.currentLine.style.opacity = 0;
            this.electrons.style.opacity = 0;
            this.ledBulb.style.fill = "rgba(255,255,255,0.7)";
            this.ledGlow.style.opacity = 0;
        }
    },
    
    complete() {
        this.isUnlocked = true;
        this.btnWind.innerText = "✅ TIẾP TỤC TẠO GIÓ ĐỂ PHÁT ĐIỆN";
        this.btnWind.style.background = "#4CAF50";
        this.btnWind.style.color = "#FFF";
        
        // Unlock mảnh ghép số 2
        if(window.RewardSystem) {
            window.RewardSystem.unlockPiece(2);
        }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    Station2.init();
});

/**
 * STATION 3 - TRẠM HÓA HỌC VUI
 * Mô phỏng hiện tượng: Baking Soda + Giấm = Khí CO2 làm phồng bong bóng
 * Kết hợp hiệu ứng hạt Lava nổi lên.
 */

const Station3 = {
    isMixed: false,
    
    init() {
        this.container = document.querySelector('#station-3 .simulation-placeholder');
        this.btnMix = document.querySelector('#station-3 .btn-primary');
        
        if(this.container && this.btnMix) {
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
            background: '#FFF5F5',
            overflow: 'hidden'
        });
        
        this.container.innerHTML = `
            <div style="position: absolute; top: 15px; left: 20px; z-index: 10; font-family: 'Lexend', sans-serif; color: #1A1A1A; text-align: left;">
                <div class="sim-text">🧪 Phản ứng tạo khí CO₂</div>
                <div class="sim-subtext">NaHCO₃ (Baking soda) + CH₃COOH (Giấm)</div>
            </div>
            
            <div style="position: relative; width: 140px; height: 300px; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; padding-bottom: 0px; transform: scale(0.95); transform-origin: bottom center; bottom: 0px;">
                
                <!-- Decor nền -->
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; opacity: 0.1; background-image: radial-gradient(circle at 20% 30%, var(--red) 2px, transparent 2px), radial-gradient(circle at 80% 60%, var(--blue) 2px, transparent 2px); background-size: 50px 50px; z-index: 0;"></div>
                <div style="position: absolute; top: -50px; right: -80px; font-size: 4rem; opacity: 0.2;">⚗️</div>
                <div style="position: absolute; bottom: 30px; left: -80px; font-size: 3.5rem; opacity: 0.2;">🔬</div>

                <!-- Bong bóng (Trên miệng chai) -->
                <div id="s3-balloon" style="position: absolute; top: 68px; left: 50%; margin-left: -40px; width: 80px; height: 100px; background: #E03C31; border: 3px solid #1A1A1A; border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%; transform: scale(0.2); transform-origin: bottom center; z-index: 3; display: flex; justify-content: center; align-items: center;">
                    <!-- Highlight bong bóng -->
                    <div style="position: absolute; top: 15px; left: 15px; width: 15px; height: 25px; background: rgba(255,255,255,0.4); border-radius: 50%; transform: rotate(-30deg);"></div>
                    <span id="s3-co2-text" style="color: white; font-weight: bold; font-family: Lexend; opacity: 0;">CO₂</span>
                </div>
                
                <!-- Đèn Lava 1 (Trái 1) - Xanh biển -->
                <div style="position: absolute; bottom: 10px; left: -60px; width: 40px; height: 120px; display: flex; flex-direction: column; align-items: center; z-index: 2;">
                    <!-- Nắp đèn -->
                    <div style="width: 20px; height: 15px; background: #424242; border-radius: 5px 5px 0 0;"></div>
                    <!-- Thân đèn -->
                    <div style="width: 30px; height: 85px; background: rgba(255,255,255,0.2); border: 2px solid #FFF; border-radius: 10px; position: relative; overflow: hidden; box-shadow: 0 0 15px #00E5FF, inset 0 0 10px #00E5FF;">
                        <div style="position: absolute; bottom: 0; width: 100%; height: 100%; background: linear-gradient(to top, rgba(0,229,255,0.8), rgba(0,229,255,0.2));"></div>
                        <div class="lava-drop" style="position: absolute; bottom: -15px; left: 5px; width: 15px; height: 15px; background: #00E5FF; border-radius: 50%; filter: blur(1px); box-shadow: 0 0 10px #FFF;"></div>
                        <div class="lava-drop" style="position: absolute; bottom: -15px; left: 10px; width: 12px; height: 12px; background: #00E5FF; border-radius: 50%; filter: blur(1px); box-shadow: 0 0 10px #FFF; animation-delay: 1.5s;"></div>
                        <div class="lava-drop" style="position: absolute; bottom: -15px; left: 2px; width: 18px; height: 18px; background: #00E5FF; border-radius: 50%; filter: blur(1px); box-shadow: 0 0 10px #FFF; animation-delay: 3s;"></div>
                    </div>
                    <!-- Đế đèn -->
                    <div style="width: 40px; height: 20px; background: #424242; border-radius: 0 0 10px 10px; border-bottom: 3px solid #1A1A1A;"></div>
                </div>

                <!-- Đèn Lava 2 (Trái 2) - Lùn mập - Màu Tím -->
                <div style="position: absolute; bottom: 5px; left: -120px; width: 50px; height: 90px; display: flex; flex-direction: column; align-items: center; z-index: 1;">
                    <div style="width: 20px; height: 10px; background: #424242; border-radius: 10px 10px 0 0;"></div>
                    <div style="width: 45px; height: 60px; background: rgba(255,255,255,0.2); border: 2px solid #FFF; border-radius: 20px; position: relative; overflow: hidden; box-shadow: 0 0 15px #9C27B0, inset 0 0 10px #9C27B0;">
                        <div style="position: absolute; bottom: 0; width: 100%; height: 100%; background: linear-gradient(to top, rgba(156,39,176,0.8), rgba(156,39,176,0.2));"></div>
                        <div class="lava-drop" style="position: absolute; bottom: -15px; left: 5px; width: 25px; height: 20px; background: #9C27B0; border-radius: 50%; filter: blur(1px); box-shadow: 0 0 10px #FFF; animation-delay: 0.5s; animation-duration: 3s;"></div>
                        <div class="lava-drop" style="position: absolute; bottom: -15px; left: 20px; width: 15px; height: 15px; background: #9C27B0; border-radius: 50%; filter: blur(1px); box-shadow: 0 0 10px #FFF; animation-delay: 2s; animation-duration: 3.5s;"></div>
                    </div>
                    <div style="width: 50px; height: 20px; background: #424242; border-radius: 0 0 15px 15px; border-bottom: 3px solid #1A1A1A;"></div>
                </div>

                <!-- Đèn Lava 3 (Phải 1) - Cao ốm - Màu Xanh Lá -->
                <div style="position: absolute; bottom: 15px; right: -50px; width: 30px; height: 150px; display: flex; flex-direction: column; align-items: center; z-index: 2;">
                    <div style="width: 15px; height: 20px; background: #424242; border-radius: 5px 5px 0 0;"></div>
                    <div style="width: 25px; height: 110px; background: rgba(255,255,255,0.2); border: 2px solid #FFF; border-radius: 5px; position: relative; overflow: hidden; box-shadow: 0 0 15px #4CAF50, inset 0 0 10px #4CAF50;">
                        <div style="position: absolute; bottom: 0; width: 100%; height: 100%; background: linear-gradient(to top, rgba(76,175,80,0.8), rgba(76,175,80,0.2));"></div>
                        <div class="lava-drop" style="position: absolute; bottom: -15px; left: 2px; width: 12px; height: 20px; background: #4CAF50; border-radius: 50%; filter: blur(1px); box-shadow: 0 0 10px #FFF; animation-delay: 1s; animation-duration: 5s;"></div>
                        <div class="lava-drop" style="position: absolute; bottom: -15px; left: 8px; width: 15px; height: 15px; background: #4CAF50; border-radius: 50%; filter: blur(1px); box-shadow: 0 0 10px #FFF; animation-delay: 2.5s; animation-duration: 4.5s;"></div>
                    </div>
                    <div style="width: 30px; height: 20px; background: #424242; border-radius: 0 0 5px 5px; border-bottom: 3px solid #1A1A1A;"></div>
                </div>
                
                <!-- Đèn Lava 4 (Phải 2) - Màu Cam - NEW -->
                <div style="position: absolute; bottom: 10px; right: -110px; width: 45px; height: 110px; display: flex; flex-direction: column; align-items: center; z-index: 1;">
                    <div style="width: 20px; height: 10px; background: #424242; border-radius: 5px 5px 0 0;"></div>
                    <div style="width: 40px; height: 80px; background: rgba(255,255,255,0.2); border: 2px solid #FFF; border-radius: 15px; position: relative; overflow: hidden; box-shadow: 0 0 15px #FF9800, inset 0 0 10px #FF9800;">
                        <div style="position: absolute; bottom: 0; width: 100%; height: 100%; background: linear-gradient(to top, rgba(255,152,0,0.8), rgba(255,152,0,0.2));"></div>
                        <div class="lava-drop" style="position: absolute; bottom: -15px; left: 5px; width: 20px; height: 20px; background: #FF9800; border-radius: 50%; filter: blur(1px); box-shadow: 0 0 10px #FFF; animation-delay: 0.8s; animation-duration: 4s;"></div>
                        <div class="lava-drop" style="position: absolute; bottom: -15px; left: 15px; width: 15px; height: 15px; background: #FF9800; border-radius: 50%; filter: blur(1px); box-shadow: 0 0 10px #FFF; animation-delay: 2.2s; animation-duration: 3.8s;"></div>
                    </div>
                    <div style="width: 45px; height: 20px; background: #424242; border-radius: 0 0 10px 10px; border-bottom: 3px solid #1A1A1A;"></div>
                </div>
                
                <!-- Đèn Lava 5 (Phải 3) - Màu Hồng - NEW -->
                <div style="position: absolute; bottom: 20px; right: -160px; width: 35px; height: 130px; display: flex; flex-direction: column; align-items: center; z-index: 2;">
                    <div style="width: 15px; height: 15px; background: #424242; border-radius: 5px 5px 0 0;"></div>
                    <div style="width: 30px; height: 95px; background: rgba(255,255,255,0.2); border: 2px solid #FFF; border-radius: 10px; position: relative; overflow: hidden; box-shadow: 0 0 15px #E91E63, inset 0 0 10px #E91E63;">
                        <div style="position: absolute; bottom: 0; width: 100%; height: 100%; background: linear-gradient(to top, rgba(233,30,99,0.8), rgba(233,30,99,0.2));"></div>
                        <div class="lava-drop" style="position: absolute; bottom: -15px; left: 5px; width: 15px; height: 20px; background: #E91E63; border-radius: 50%; filter: blur(1px); box-shadow: 0 0 10px #FFF; animation-delay: 0.3s; animation-duration: 4.2s;"></div>
                        <div class="lava-drop" style="position: absolute; bottom: -15px; left: 12px; width: 12px; height: 12px; background: #E91E63; border-radius: 50%; filter: blur(1px); box-shadow: 0 0 10px #FFF; animation-delay: 1.8s; animation-duration: 3.2s;"></div>
                    </div>
                    <div style="width: 35px; height: 20px; background: #424242; border-radius: 0 0 10px 10px; border-bottom: 3px solid #1A1A1A;"></div>
                </div>

                <!-- Nút buộc bong bóng -->
                <div style="position: absolute; top: 158px; left: 50%; margin-left: -12.5px; width: 25px; height: 14px; background: #E03C31; border: 3px solid #1A1A1A; border-radius: 3px; z-index: 2;"></div>

                <!-- Bình tam giác (Erlenmeyer Flask) -->
                <div style="position: relative; width: 120px; height: 140px; z-index: 1;">
                    <svg viewBox="0 0 120 140" width="100%" height="100%">
                        <!-- Thân bình -->
                        <path d="M45,0 L75,0 L75,40 L115,130 Q120,140 105,140 L15,140 Q0,140 5,130 L45,40 Z" fill="rgba(255,255,255,0.6)" stroke="#1A1A1A" stroke-width="4"/>
                        
                        <!-- Lớp dung dịch (Giấm + Màu) -->
                        <clipPath id="flask-clip">
                            <path d="M45,0 L75,0 L75,40 L115,130 Q120,140 105,140 L15,140 Q0,140 5,130 L45,40 Z"/>
                        </clipPath>
                        
                        <g clip-path="url(#flask-clip)">
                            <!-- Nước nền -->
                            <rect id="s3-liquid" x="0" y="80" width="120" height="60" fill="#FFAB91"/>
                            <!-- Lớp bột Baking Soda -->
                            <path id="s3-powder" d="M10,135 Q60,125 110,135 L120,140 L0,140 Z" fill="#FFF"/>
                        </g>
                    </svg>
                    
                    <!-- Vùng chứa bọt khí sinh ra -->
                    <div id="s3-bubbles-container" style="position: absolute; bottom: 10px; left: 10px; width: 100px; height: 120px; overflow: hidden; clip-path: polygon(35px 0, 65px 0, 100% 100%, 0% 100%); z-index: 0; pointer-events: none;">
                        <!-- JS sẽ tạo bọt khí ở đây -->
                    </div>
                </div>

            </div>
        `;
        
        this.btnMix.innerText = "🌪️ BÓP TÚI GIẤM (TRỘN DUNG DỊCH)";
    },
    
    bindEvents() {
        window.bindAntiZoomBtn(this.btnMix, () => {
            if(this.isMixed) return;
            if(window.AudioEngine) AudioEngine.playClick();
            this.startReaction();
        });
    },
    
    startReaction() {
        this.isMixed = true;
        this.btnMix.innerText = "⚗️ ĐANG PHẢN ỨNG...";
        this.btnMix.style.background = "#FF9800";
        this.btnMix.style.color = "#FFF";
        
        const liquid = document.getElementById('s3-liquid');
        const powder = document.getElementById('s3-powder');
        const balloon = document.getElementById('s3-balloon');
        const co2Text = document.getElementById('s3-co2-text');
        
        if(!window.gsap) return;
        
        // 1. Phản ứng sủi bọt (Chất lỏng dâng lên, bột tan ra) - Tăng gấp đôi thời gian
        gsap.to(liquid, { attr: { y: 30, height: 110 }, fill: "#FF7043", duration: 10, ease: "power1.inOut" });
        gsap.to(powder, { opacity: 0, duration: 4, delay: 1 });
        
        // 2. Tạo bọt khí (Lava/Bubbles effect)
        this.spawnBubbles();
        
        // 3. Bong bóng phình to ra từ cổ chai (thời gian phồng tăng gấp đôi)
        gsap.to('#s3-balloon', { 
            scale: 1, 
            transformOrigin: "bottom center", duration: 4, delay: 0.5, ease: "elastic.out(1, 0.4)",
            onComplete: () => {
                this.btnMix.innerText = "✅ THÍ NGHIỆM THÀNH CÔNG";
                this.btnMix.style.background = "#4CAF50";
                gsap.to(co2Text, { opacity: 1, duration: 0.8 });
                
                if(window.RewardSystem) {
                    window.RewardSystem.unlockPiece(3);
                }
            }
        });
        
        // 4. Lắc nhẹ bình phản ứng
        gsap.to(this.container.querySelector('div[style*="width: 140px"]'), {
            x: 2, rotation: 1, duration: 0.1, yoyo: true, repeat: 30
        });
    },
    
    spawnBubbles() {
        const bubbleContainer = document.getElementById('s3-bubbles-container');
        if(!bubbleContainer) return;
        
        for(let i=0; i<40; i++) {
            setTimeout(() => {
                const bubble = document.createElement('div');
                Object.assign(bubble.style, {
                    position: 'absolute',
                    bottom: '-10px',
                    left: (Math.random() * 100) + 'px',
                    width: (Math.random() * 10 + 5) + 'px',
                    height: (Math.random() * 10 + 5) + 'px',
                    background: 'rgba(255,255,255,0.8)',
                    borderRadius: '50%',
                    border: '1px solid #1A1A1A'
                });
                bubbleContainer.appendChild(bubble);
                
                // Animation bay lên
                gsap.to(bubble, {
                    y: -150 - Math.random() * 50,
                    x: (Math.random() - 0.5) * 20,
                    opacity: 0,
                    duration: 2.5 + Math.random() * 2,
                    ease: "power1.in",
                    onComplete: () => bubble.remove()
                });
            }, Math.random() * 4000); // Rải rác sinh ra trong 4 giây (gấp đôi)
        }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    Station3.init();
});

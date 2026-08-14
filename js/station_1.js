/**
 * STATION 1 - TRẠM CHUYỂN ĐỘNG (TÊN LỬA NƯỚC)
 * Mô phỏng vật lý đơn giản: Cân bằng lượng nước và áp suất không khí
 */

const Station1 = {
    waterLevel: 0, // Tính bằng %
    pressure: 0,   // Tính bằng PSI
    isLaunched: false,
    
    init() {
        this.container = document.querySelector('#station-1 .simulation-placeholder');
        this.btnLaunch = document.querySelector('#station-1 .btn-primary');
        
        if(this.container && this.btnLaunch) {
            this.renderUI();
            this.bindEvents();
        }
    },
    
    renderUI() {
        // Xóa nội dung chờ (Placeholder text)
        this.container.innerHTML = '';
        
        // Reset lại CSS của container để làm không gian chứa đồ họa
        Object.assign(this.container.style, {
            position: 'relative',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            overflow: 'hidden',
            padding: '0'
        });
        
        // Dựng giao diện SVG và HTML
        this.container.innerHTML = `
            <!-- Bảng thông số kỹ thuật -->
            <div style="position: absolute; top: 15px; left: 20px; font-family: 'Lexend', sans-serif; color: #1A1A1A; text-align: left;">
                <div class="sim-text" style="margin-bottom: 8px;">💧 Lượng nước: <strong id="s1-water-val">0</strong>% <span class="sim-subtext" style="color: #555;">(Tối ưu: 30-35%)</span></div>
                <div class="sim-text">💨 Áp suất khí: <strong id="s1-pressure-val">0</strong> PSI <span class="sim-subtext" style="color: #555;">(Tối ưu: 40-60 PSI)</span></div>
            </div>
            
            <!-- Vùng không gian bay -->
            <div id="s1-sky" style="position: relative; width: 100%; height: 100%; display: flex; justify-content: center; align-items: flex-end; padding-bottom: 20px;">
                
                <!-- Bệ phóng PVC -->
                <div style="position: absolute; bottom: 0; width: 80px; height: 30px; background: #666; border-radius: 5px 5px 0 0; border: 3px solid #1A1A1A;"></div>
                
                <!-- Đối tượng Tên Lửa (Water Rocket) -->
                <div id="s1-rocket" style="position: relative; width: 50px; height: 130px; z-index: 2; transform-origin: bottom center;">
                    
                    <!-- Thân chai PET -->
                    <div style="position: absolute; bottom: 0; width: 100%; height: 110px; background: rgba(255, 255, 255, 0.7); border: 3px solid #1A1A1A; border-radius: 50% 50% 15% 15%; overflow: hidden;">
                        
                        <!-- Chất lỏng (Nước) -->
                        <div id="s1-water-fill" style="position: absolute; bottom: 0; width: 100%; height: 0%; background: #2196F3; transition: height 0.3s ease;"></div>
                        
                    </div>
                    
                    <!-- Chóp tên lửa (Đất nặn/Giấy cứng) -->
                    <div style="position: absolute; top: 0; left: 5px; width: 40px; height: 40px; background: #E03C31; border: 3px solid #1A1A1A; clip-path: polygon(50% 0%, 100% 100%, 0% 100%);"></div>
                    
                    <!-- Cánh định hướng (Alu/PVC) -->
                    <div style="position: absolute; bottom: 15px; left: -15px; width: 20px; height: 35px; background: #FBC02D; border: 3px solid #1A1A1A; clip-path: polygon(100% 0, 100% 100%, 0 100%);"></div>
                    <div style="position: absolute; bottom: 15px; right: -15px; width: 20px; height: 35px; background: #FBC02D; border: 3px solid #1A1A1A; clip-path: polygon(0 0, 100% 100%, 0 100%);"></div>
                    
                    <!-- Hiệu ứng lực đẩy (Nước phun) - Ẩn mặc định -->
                    <div id="s1-thrust" style="position: absolute; bottom: -40px; left: 10px; width: 30px; height: 40px; background: linear-gradient(to bottom, #2196F3, transparent); opacity: 0; border-radius: 0 0 50% 50%;"></div>
                </div>
            </div>
            
            <!-- Bảng điều khiển (Controls) -->
            <div style="position: absolute; bottom: 20px; right: 20px; display: flex; flex-direction: column; gap: 10px;">
                <button id="s1-add-water" class="btn btn-primary" style="padding: 8px 15px;">💧 Đổ thêm nước</button>
                <button id="s1-add-air" class="btn btn-primary" style="padding: 8px 15px;">💨 Bơm không khí</button>
                <button id="s1-reset" class="btn" style="padding: 8px 15px; background: transparent;">🔄 Chơi lại</button>
            </div>
        `;
        
        // Cache DOM elements
        this.rocket = document.getElementById('s1-rocket');
        this.waterFill = document.getElementById('s1-water-fill');
        this.thrust = document.getElementById('s1-thrust');
        this.valWater = document.getElementById('s1-water-val');
        this.valPressure = document.getElementById('s1-pressure-val');
        
        // Cập nhật lại hành động cho nút Phóng Tên Lửa chính của Trạm
        this.btnLaunch.innerText = "🚀 GIẬT CHỐT PHÓNG";
    },
    
    bindEvents() {
        // Nút Đổ nước (+10%)
        window.bindAntiZoomBtn(document.getElementById('s1-add-water'), () => {
            if(window.AudioEngine) AudioEngine.playDrop();
            if(this.isLaunched) return;
            if(this.waterLevel < 100) this.waterLevel += 10;
            this.updateUI();
        });
        
        // Nút Bơm khí (+10 PSI, giới hạn 80 PSI)
        window.bindAntiZoomBtn(document.getElementById('s1-add-air'), () => {
            if(window.AudioEngine) AudioEngine.playWind();
            if(this.isLaunched) return;
            if(this.pressure < 80) {
                this.pressure += 10;
                
                // Animation rung nhẹ khi áp suất tăng
                if(window.gsap) {
                    gsap.fromTo(this.rocket, 
                        { x: -3 }, { x: 3, duration: 0.05, yoyo: true, repeat: 3, clearProps: "x" }
                    );
                }
            } else {
                alert("Cảnh báo: Không nên bơm quá 80 PSI đối với chai tự làm tại nhà!");
            }
            this.updateUI();
        });
        
        // Nút Chơi lại
        window.bindAntiZoomBtn(document.getElementById('s1-reset'), () => {
            if(window.AudioEngine) AudioEngine.playClick();
            this.reset();
        });
        
        // Nút Phóng tên lửa
        window.bindAntiZoomBtn(this.btnLaunch, () => {
            if(window.AudioEngine) AudioEngine.playClick();
            this.launch();
        });
    },
    
    updateUI() {
        this.waterFill.style.height = `${this.waterLevel}%`;
        this.valWater.innerText = this.waterLevel;
        this.valPressure.innerText = this.pressure;
    },
    
    launch() {
        if(this.isLaunched) return;
        
        if(this.waterLevel === 0) {
            alert("❌ Lỗi: Tên lửa không có nước! Không thể tạo ra phản lực.");
            return;
        }
        
        if(this.pressure < 20) {
            alert("❌ Lỗi: Áp suất quá yếu (Dưới 20 PSI). Tên lửa không đủ lực đẩy để thoát khỏi bệ phóng!");
            return;
        }
        
        this.isLaunched = true;
        this.thrust.style.opacity = 1;
        
        // Tính toán vật lý để ra độ cao (Pixel)
        // Dựa trên Fact: Tối ưu 30-35% nước và 40-60 PSI
        let isPerfect = false;
        let targetY = 0;
        let targetRotation = 0;
        
        if (this.waterLevel >= 30 && this.waterLevel <= 40 && this.pressure >= 40 && this.pressure <= 70) {
            // BAY CỰC ĐỈNH - MỞ KHÓA MẢNH GHÉP
            targetY = -800; // Bay vút ra khỏi khung hình
            isPerfect = true;
        } else if (this.waterLevel > 60) {
            // QUÁ NẶNG
            targetY = -150; 
            targetRotation = 45; // Bay lờ đờ rồi nghiêng rớt
        } else {
            // BAY VỪA VỪA
            targetY = -250;
            targetRotation = 90;
        }
        
        // Kích hoạt GSAP Animation
        if(window.gsap) {
            const tl = gsap.timeline();
            
            // Lắc rung chốt
            tl.to(this.rocket, { x: -5, duration: 0.05, yoyo: true, repeat: 5 });
            
            if(isPerfect) {
                // Bay chính xác vào vòng tròn xanh cạnh chữ "NGÀY HỘI" ở hero
                tl.add(() => this.flyToHeroTarget());
            } else {
                tl.to(this.rocket, { 
                    y: targetY, 
                    rotation: targetRotation, 
                    duration: 1.5, 
                    ease: "power1.inOut" 
                });
            }
              
            // Nếu bay thành công, unlock mảnh ghép sau 1s
            if(isPerfect) {
                setTimeout(() => {
                    if(window.RewardSystem) {
                        window.RewardSystem.unlockPiece(1);
                        this.btnLaunch.innerText = "✅ THÀNH CÔNG";
                        this.btnLaunch.style.background = "#4CAF50";
                        this.btnLaunch.style.color = "#FFF";
                    }
                }, 1000);
            } else {
                setTimeout(() => {
                    alert("⚠️ Tên lửa bay không cao. Lời khuyên: Hãy điều chỉnh Nước về khoảng 30% và Khí khoảng 50 PSI để đạt lực đẩy hoàn hảo nhất!");
                    this.thrust.style.opacity = 0;
                }, 1500);
            }
        }
    },
    
    /**
     * Bay tên lửa (bản sao position:fixed) từ vị trí thật trên màn hình
     * tới ngay phía trên-trái chữ "NGÀY HỘI" ở hero — tính trực tiếp từ
     * vị trí thật của tiêu đề lúc chạy (getBoundingClientRect), không qua
     * điểm neo trung gian, nên luôn chính xác bất kể chiều cao header.
     */
    flyToHeroTarget() {
        const heroTitle = document.querySelector('header.hero h1');
        if(!heroTitle || !window.gsap) {
            gsap.to(this.rocket, { y: -800, duration: 1, ease: "power4.out" });
            return;
        }
        
        const rocketRect = this.rocket.getBoundingClientRect();
        const titleRect = heroTitle.getBoundingClientRect();
        
        const startCx = rocketRect.left + rocketRect.width / 2;
        const startCy = rocketRect.top + rocketRect.height / 2;
        // Đích: ngay phía trên - bên trái chữ "N" của "NGÀY HỘI"
        const endCx = titleRect.left - 10;
        const endCy = titleRect.top - 15;
        
        // Tạo bản sao bay tự do trên toàn trang (không bị giới hạn bởi khung trạm 1)
        const clone = this.rocket.cloneNode(true);
        clone.id = 's1-rocket-flying';
        Object.assign(clone.style, {
            position: 'fixed',
            left: (rocketRect.left) + 'px',
            top: (rocketRect.top) + 'px',
            width: rocketRect.width + 'px',
            height: rocketRect.height + 'px',
            margin: '0',
            zIndex: '9999',
            pointerEvents: 'none'
        });
        document.body.appendChild(clone);
        this.rocket.style.opacity = '0';
        
        const dx = endCx - startCx;
        const dy = endCy - startCy;
        const targetSize = 56; // kích thước tên lửa lúc "đáp", tính bằng px
        const scaleTarget = targetSize / rocketRect.width;
        
        gsap.to(clone, {
            x: dx,
            y: dy,
            scale: scaleTarget,
            rotation: -8,
            duration: 1.3,
            ease: "power2.inOut",
            onComplete: () => {
                gsap.to(clone, { scale: scaleTarget * 0.92, duration: 0.25, yoyo: true, repeat: 1 });
                if(window.AudioEngine) AudioEngine.playPop();
            }
        });
    },
    
    reset() {
        this.waterLevel = 0;
        this.pressure = 0;
        this.isLaunched = true; // Chặn click trong lúc reset
        this.btnLaunch.innerText = "🚀 GIẬT CHỐT PHÓNG";
        this.btnLaunch.style.background = "";
        this.btnLaunch.style.color = "";
        
        this.thrust.style.opacity = 0;
        this.rocket.style.opacity = '1';
        
        // Dọn bản sao tên lửa đang bay (nếu người dùng bấm Chơi lại giữa chừng)
        const flyingClone = document.getElementById('s1-rocket-flying');
        if(flyingClone) {
            if(window.gsap) gsap.killTweensOf(flyingClone);
            flyingClone.remove();
        }
        
        if(window.gsap) {
            gsap.killTweensOf(this.rocket);
            gsap.to(this.rocket, { y: 0, x: 0, rotation: 0, duration: 0.5, ease: "power2.inOut", onComplete: () => {
                this.isLaunched = false;
            } });
        } else {
            this.isLaunched = false;
        }
        
        this.updateUI();
    }
};

document.addEventListener("DOMContentLoaded", () => {
    Station1.init();
});

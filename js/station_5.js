/**
 * STATION 5 - TRẠM VEX IQ
 * Lập trình Robot di chuyển bằng chuỗi thẻ màu
 * Rule: Đỏ (Tiến), Vàng (Trái), Xanh Lá (Phải), Xanh Dương (Đích)
 */

const Station5 = {
    commands: [], // Lưu trữ lệnh người chơi nhập
    correctSequence: ['up', 'left', 'up', 'target'], // Tiến -> Trái -> Tiến -> Đích
    isRunning: false,
    
    init() {
        this.container = document.querySelector('#station-5 .simulation-placeholder');
        this.btnRun = document.querySelector('#station-5 .btn-primary');
        
        if(this.container && this.btnRun) {
            this.renderUI();
            this.bindEvents();
        }
    },
    
    renderUI() {
        this.container.innerHTML = '';
        Object.assign(this.container.style, {
            position: 'relative',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#E8F5E9' // Nền xanh lá nhạt
        });
        
        this.container.innerHTML = `
            <!-- Sân thi đấu Mini (Mê cung VEX IQ được mở rộng to dễ nhìn) -->
            <div id="s5-map" style="position: relative; width: 350px; height: 210px; background: #E0E0E0; border: 4px solid #1A1A1A; border-radius: 12px; overflow: hidden; box-shadow: inset 0 0 15px rgba(0,0,0,0.1);">
                <!-- Đường đi rộng rãi -->
                <div style="position: absolute; top: 35px; left: 35px; width: 50px; height: 130px; background: #FFF; border-radius: 20px;"></div>
                <div style="position: absolute; top: 35px; left: 35px; width: 165px; height: 50px; background: #FFF; border-radius: 20px;"></div>
                <div style="position: absolute; top: 35px; left: 150px; width: 50px; height: 130px; background: #FFF; border-radius: 20px;"></div>
                <div style="position: absolute; top: 115px; left: 150px; width: 150px; height: 50px; background: #FFF; border-radius: 20px;"></div>
                
                <!-- Đích đến -->
                <div style="position: absolute; top: 115px; left: 250px; font-size: 2.8rem; z-index: 1;">🏁</div>

                <!-- Robot VEX SVG -->
                <div id="s5-robot" style="position: absolute; top: 30px; left: 30px; width: 60px; height: 60px; z-index: 10; transition: transform 0.3s;">
                    <svg viewBox="0 0 100 100" width="100%" height="100%">
                        <rect x="10" y="10" width="80" height="80" fill="#607D8B" stroke="#1A1A1A" stroke-width="4" rx="10"/>
                        <circle cx="30" cy="30" r="10" fill="#FFEB3B" stroke="#1A1A1A" stroke-width="2"/>
                        <circle cx="70" cy="30" r="10" fill="#FFEB3B" stroke="#1A1A1A" stroke-width="2"/>
                        <!-- Mũi tên chỉ hướng ban đầu (Xuống dưới - Hướng Nam) -->
                        <path d="M30,70 L50,90 L70,70 Z" fill="#E03C31" stroke="#1A1A1A" stroke-width="2"/>
                    </svg>
                </div>
            </div>
            
            <!-- Gợi ý -->
            <div id="s5-hint-container" style="display: flex; align-items: center; gap: 10px; margin: 10px 0;">
                <button id="s5-btn-hint" style="background:#FFF; border: 2px solid #1A1A1A; border-radius: 8px; padding: 5px 10px; cursor: pointer; font-weight: bold; font-family: 'Lexend', sans-serif; color: #1A1A1A; box-shadow: 2px 2px 0 #1A1A1A;">💡 Xem gợi ý</button>
                <div id="s5-hint-text" style="font-size: 0.9rem; font-weight: bold; color: #1A1A1A; display: none;">Đi thẳng ➔ Rẽ trái ➔ Đi thẳng ➔ Đích</div>
            </div>
            
            <!-- Bảng mã lệnh (Command Slots) -->
            <div id="s5-slots" style="display: flex; gap: 15px; margin-bottom: 15px;">
                <div class="s5-slot" style="width: 65px; height: 65px; background: #FFF; border: 3px dashed #1A1A1A; border-radius: 8px; display:flex; justify-content:center; align-items:center; font-size: 2rem;"></div>
                <div class="s5-slot" style="width: 65px; height: 65px; background: #FFF; border: 3px dashed #1A1A1A; border-radius: 8px; display:flex; justify-content:center; align-items:center; font-size: 2rem;"></div>
                <div class="s5-slot" style="width: 65px; height: 65px; background: #FFF; border: 3px dashed #1A1A1A; border-radius: 8px; display:flex; justify-content:center; align-items:center; font-size: 2rem;"></div>
                <div class="s5-slot" style="width: 65px; height: 65px; background: #FFF; border: 3px dashed #1A1A1A; border-radius: 8px; display:flex; justify-content:center; align-items:center; font-size: 2rem;"></div>
            </div>

            <!-- Bàn phím lệnh (Kéo thả) -->
            <div id="s5-controls" style="display: flex; gap: 10px;">
                <div class="s5-color-btn" draggable="true" data-color="up" style="background:#FFF; width:65px; height:65px; border: 3px solid #1A1A1A; border-radius:8px; cursor:grab; box-shadow: 2px 2px 0 #1A1A1A; display:flex; justify-content:center; align-items:center; font-size:2rem;" title="Đi thẳng">⬆️</div>
                <div class="s5-color-btn" draggable="true" data-color="left" style="background:#FFF; width:65px; height:65px; border: 3px solid #1A1A1A; border-radius:8px; cursor:grab; box-shadow: 2px 2px 0 #1A1A1A; display:flex; justify-content:center; align-items:center; font-size:2rem;" title="Rẽ trái">⬅️</div>
                <div class="s5-color-btn" draggable="true" data-color="right" style="background:#FFF; width:65px; height:65px; border: 3px solid #1A1A1A; border-radius:8px; cursor:grab; box-shadow: 2px 2px 0 #1A1A1A; display:flex; justify-content:center; align-items:center; font-size:2rem;" title="Rẽ phải">➡️</div>
                <div class="s5-color-btn" draggable="true" data-color="target" style="background:#FFF; width:65px; height:65px; border: 3px solid #1A1A1A; border-radius:8px; cursor:grab; box-shadow: 2px 2px 0 #1A1A1A; display:flex; justify-content:center; align-items:center; font-size:2rem;" title="Đích">🏁</div>
                <button id="s5-clear-btn" style="background:#E03C31; color: #FFF; width:65px; height:65px; border: 3px solid #1A1A1A; border-radius:8px; cursor:pointer; font-weight:bold; box-shadow: 2px 2px 0 #1A1A1A;">Xóa</button>
            </div>
        `;
        
        this.btnRun.innerText = "▶️ CHẠY THỬ LỆNH";
    },
    
    bindEvents() {
        // HTML5 Drag and Drop events
        const draggables = document.querySelectorAll('.s5-color-btn');
        const dropZones = document.querySelectorAll('.s5-slot');

        draggables.forEach(draggable => {
            draggable.addEventListener('dragstart', (e) => {
                if(this.isRunning) {
                    e.preventDefault();
                    return;
                }
                if(window.AudioEngine) AudioEngine.playClick();
                e.dataTransfer.setData('text/plain', e.target.getAttribute('data-color'));
                e.target.style.opacity = '0.5';
            });
            draggable.addEventListener('dragend', (e) => {
                e.target.style.opacity = '1';
            });
        });

        dropZones.forEach((slot, index) => {
            slot.addEventListener('dragover', (e) => {
                e.preventDefault(); // Cho phép drop
                if(!this.isRunning) slot.style.borderColor = '#2196F3';
            });
            slot.addEventListener('dragleave', (e) => {
                slot.style.borderColor = '#1A1A1A';
            });
            slot.addEventListener('drop', (e) => {
                e.preventDefault();
                slot.style.borderColor = '#1A1A1A';
                if(this.isRunning) return;
                
                const color = e.dataTransfer.getData('text/plain');
                if(color) {
                    if(window.AudioEngine) AudioEngine.playDrop();
                    this.commands[index] = color;
                    this.updateSlotsUI();
                }
            });
        });
        
        // Nút xóa
        window.bindAntiZoomBtn(document.getElementById('s5-clear-btn'), () => {
            if(this.isRunning) return;
            if(window.AudioEngine) AudioEngine.playPop();
            this.commands = [];
            this.updateSlotsUI();
            
            // Reset vị trí robot
            if(window.gsap) {
                gsap.set('#s5-robot', { x: 0, y: 0, rotation: 0 });
            }
        });
        
        // Nút Chạy
        window.bindAntiZoomBtn(this.btnRun, () => {
            if(window.AudioEngine) AudioEngine.playClick();
            if(this.isRunning) return;
            // Cho phép lọc mảng commands để tránh undefined (trường hợp user kéo thả bỏ qua ô)
            const validCommands = this.commands.filter(c => c);
            if(validCommands.length < 4) {
                alert("Vui lòng thả đủ 4 thẻ lệnh vào các ô để tạo chuỗi hành động hoàn chỉnh!");
                return;
            }
            this.commands = validCommands; // Compact lại nếu cần
            this.executeCommands();
        });
        
        // Nút Gợi ý
        const btnHint = document.getElementById('s5-btn-hint');
        const hintText = document.getElementById('s5-hint-text');
        if(btnHint && hintText) {
            window.bindAntiZoomBtn(btnHint, () => {
                if(hintText.style.display === 'none') {
                    hintText.style.display = 'block';
                    btnHint.innerText = '🙈 Ẩn gợi ý';
                } else {
                    hintText.style.display = 'none';
                    btnHint.innerText = '💡 Xem gợi ý';
                }
            });
        }
    },
    
    updateSlotsUI() {
        const slots = document.querySelectorAll('.s5-slot');
        slots.forEach((slot, index) => {
            if(this.commands[index]) {
                const emojis = { 'up':'⬆️', 'left':'⬅️', 'right':'➡️', 'target':'🏁' };
                slot.innerText = emojis[this.commands[index]];
                slot.style.border = '3px solid #1A1A1A';
                slot.style.background = '#FFF8E7';
            } else {
                slot.innerText = '';
                slot.style.background = '#FFF';
                slot.style.border = '3px dashed #1A1A1A';
            }
        });
    },
    
    executeCommands() {
        this.isRunning = true;
        this.btnRun.innerText = "⚙️ ROBOT ĐANG CHẠY...";
        
        const isCorrect = this.commands.join(',') === this.correctSequence.join(',');
        
        if(window.gsap) {
            const tl = gsap.timeline({
                onComplete: () => {
                    this.isRunning = false;
                    if(isCorrect) {
                        this.btnRun.innerText = "✅ LẬP TRÌNH CHÍNH XÁC";
                        this.btnRun.style.background = "#4CAF50";
                        this.btnRun.style.color = "#FFF";
                        
                        // Robot nhảy ăn mừng
                        gsap.to('#s5-robot', { scale: 1.2, rotation: "+=360", duration: 0.5 });
                        
                        if(window.RewardSystem) {
                            window.RewardSystem.unlockPiece(5);
                        }
                    } else {
                        // Sai lệnh -> Rung lắc báo lỗi
                        this.btnRun.innerText = "❌ SAI LỆNH! THỬ LẠI";
                        gsap.to('#s5-robot', { x: "+=5", yoyo: true, repeat: 5, duration: 0.05, clearProps: "x" });
                        setTimeout(() => { 
                            this.btnRun.innerText = "▶️ CHẠY THỬ LỆNH"; 
                            gsap.to('#s5-robot', { x: 0, y: 0, rotation: 0, duration: 0.5 }); // Về vạch xuất phát
                            this.commands = [];
                            this.updateSlotsUI();
                        }, 1500);
                    }
                }
            });
            
            // Lưới cũ đã bị bỏ, thay vào đường đi mới:
            // Tọa độ Robot ban đầu: x: 0 (left: 25px), y: 0 (top: 25px)
            // Hướng ban đầu: Chỉ xuống (Nam)
            if(isCorrect) {
                // Đi thẳng (xuống dưới)
                tl.to('#s5-robot', { y: 80, duration: 0.8 })
                // Rẽ trái (xoay mặt sang Đông)
                  .to('#s5-robot', { rotation: -90, duration: 0.5 })
                // Đi thẳng (sang Đông)
                  .to('#s5-robot', { x: 120, duration: 0.8 })
                // Đích (Đi thẳng đến cờ)
                  .to('#s5-robot', { x: 220, duration: 0.8 });
            } else {
                // Nhập sai thì đi lung tung rồi dừng (va vào tường)
                tl.to('#s5-robot', { y: 120, rotation: 15, duration: 1 })
                  .to('#s5-robot', { x: "+=10", yoyo: true, repeat: 3, duration: 0.1 });
            }
        }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    Station5.init();
});

